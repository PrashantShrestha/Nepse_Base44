
import React, { useState, useCallback } from "react";
import { StockData, BrokerActivity } from "@/entities/all";
import { ExtractDataFromUploadedFile, UploadFile } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  BarChart3,
  Database,
  TrendingUp
} from "lucide-react";

import FileUploadZone from "../components/upload/CSVUploadZone";
import ProcessingStatus from "../components/upload/ProcessingStatus";
import DataPreview from "../components/upload/DataPreview";
import UploadHistory from "../components/upload/UploadHistory";

export default function DataUpload() {
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [processingStats, setProcessingStats] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);

  const handleFileUpload = async (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file only');
      return;
    }

    setUploadStatus('uploading');
    setProgress(10);
    setError(null);
    setSuccess(null);

    try {
      // Upload file
      const { file_url } = await UploadFile({ file });
      setProgress(30);

      // Extract data from CSV with simplified schema
      setUploadStatus('processing');
      const extractResult = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: true
          }
        }
      });

      setProgress(60);

      if (extractResult.status === 'success' && extractResult.output) {
        let rawData = extractResult.output;
        
        // Handle if data is wrapped in an object
        if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
          const possibleKeys = ['data', 'records', 'rows', 'items', 'trades'];
          for (const key of possibleKeys) {
            if (rawData[key] && Array.isArray(rawData[key])) {
              rawData = rawData[key];
              break;
            }
          }
          
          if (!Array.isArray(rawData)) {
            rawData = Object.values(rawData);
          }
        }

        if (!Array.isArray(rawData) || rawData.length === 0) {
          throw new Error('No valid data rows found in CSV file. Please check the file format.');
        }

        // Helper function to clean numeric values (remove commas and convert to number)
        const cleanNumber = (value) => {
          if (!value) return 0;
          // Convert to string and remove commas, then parse as float
          const cleaned = String(value).replace(/,/g, '');
          const num = parseFloat(cleaned);
          return isNaN(num) ? 0 : num;
        };

        // Normalize the data format with NEPSE-specific field mapping
        const normalizedTrades = rawData.map((row, index) => {
          // Get all keys from the row
          const keys = Object.keys(row);
          
          // Helper function to find field value by multiple possible names
          const findField = (possibleNames) => {
            for (const name of possibleNames) {
              // Try exact match first
              if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                return row[name];
              }
              
              // Try case-insensitive match
              const foundKey = keys.find(key => 
                key.toLowerCase().replace(/[^a-z0-9]/g, '') === name.toLowerCase().replace(/[^a-z0-9]/g, '')
              );
              if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && row[foundKey] !== '') {
                return row[foundKey];
              }
            }
            return null;
          };

          // Map NEPSE floor-sheet columns
          const sn = findField(['SN', 'sn', 'S.N.', 'Serial']);
          const contract_no = findField(['ContractNo', 'Contract No', 'contract_no', 'Contract_No', 'contractno']) || `AUTO-${Date.now()}-${index}`;
          const symbol = findField(['Symbol', 'symbol', 'SYMBOL', 'Stock', 'stock']);
          const buyer = findField(['Buyer', 'buyer', 'BUYER', 'Buyer Broker', 'buyer_broker', 'BuyerBroker']);
          const seller = findField(['Seller', 'seller', 'SELLER', 'Seller Broker', 'seller_broker', 'SellerBroker']);
          const quantity = findField(['Quantity', 'quantity', 'QUANTITY', 'Qty', 'qty', 'QTY']);
          const rate = findField(['Rate', 'rate', 'RATE', 'Price', 'price', 'PRICE']);
          const amount = findField(['Amount', 'amount', 'AMOUNT', 'Total Amount', 'total_amount', 'TotalAmount']);
          const date = findField(['Date', 'date', 'DATE', 'Trade Date', 'trade_date', 'TradeDate']);

          // Clean and validate the trade data
          const cleanedQuantity = cleanNumber(quantity);
          const cleanedRate = cleanNumber(rate);
          const cleanedAmount = cleanNumber(amount) || (cleanedQuantity * cleanedRate);

          return {
            sn: sn || index + 1,
            contract_no: String(contract_no || `AUTO-${Date.now()}-${index}`),
            symbol: String(symbol || '').toUpperCase().trim(),
            buyer: String(buyer || '').trim(),
            seller: String(seller || '').trim(),
            quantity: cleanedQuantity,
            rate: cleanedRate,
            amount: cleanedAmount,
            date: date ? String(date).split('T')[0] : new Date().toISOString().split('T')[0]
          };
        }).filter(trade => {
          // Filter out invalid trades - be more lenient with broker codes
          return trade.symbol && 
                 trade.symbol !== '' && 
                 trade.symbol.length > 0 &&
                 trade.rate > 0 && 
                 trade.quantity > 0 &&
                 trade.buyer && 
                 trade.seller &&
                 trade.buyer !== '' &&
                 trade.seller !== '';
        });

        if (normalizedTrades.length === 0) {
          throw new Error('No valid trades found in CSV. Please ensure your CSV has the required columns: Symbol, Buyer, Seller, Quantity, Rate');
        }

        setExtractedData(normalizedTrades);
        
        // Process and save stock data
        const processedStockData = await processStockData(normalizedTrades);
        const processedBrokerData = await processBrokerData(normalizedTrades);
        
        setProgress(90);
        
        // Save to database
        await saveProcessedData(processedStockData, processedBrokerData);
        
        setProgress(100);
        setUploadStatus('success');
        setSuccess(`Successfully processed ${normalizedTrades.length} trades from ${file.name}`);
        
        setProcessingStats({
          totalTrades: normalizedTrades.length,
          uniqueSymbols: new Set(normalizedTrades.map(t => t.symbol)).size,
          uniqueBrokers: new Set([...normalizedTrades.map(t => t.buyer), ...normalizedTrades.map(t => t.seller)]).size,
          totalVolume: normalizedTrades.reduce((sum, t) => sum + (t.quantity || 0), 0),
          totalValue: normalizedTrades.reduce((sum, t) => sum + (t.amount || 0), 0)
        });

        // Add to upload history
        setUploadHistory(prev => [{
          fileName: file.name,
          uploadTime: new Date().toISOString(),
          tradesCount: normalizedTrades.length,
          status: 'success'
        }, ...prev.slice(0, 4)]);

      } else {
        throw new Error(`Failed to extract data from CSV: ${extractResult.details || 'Unknown error'}`);
      }

    } catch (err) {
      setUploadStatus('error');
      setError(`Failed to process ${file.name}: ${err.message}`);
      console.error('Upload error:', err);
      
      // Add failed upload to history
      setUploadHistory(prev => [{
        fileName: file.name,
        uploadTime: new Date().toISOString(),
        tradesCount: 0,
        status: 'failed',
        error: err.message
      }, ...prev.slice(0, 4)]);
    }
  };

  const processStockData = async (trades) => {
    const stockMap = {};
    const today = new Date().toISOString().split('T')[0];
    
    trades.forEach(trade => {
      const symbol = trade.symbol;
      const date = trade.date || today;
      const key = `${symbol}-${date}`;
      
      if (!stockMap[key]) {
        stockMap[key] = {
          symbol,
          date,
          volume: 0,
          total_amount: 0,
          trades: [],
          high_price: 0,
          low_price: Infinity,
          open_price: null,
          close_price: null
        };
      }
      
      const quantity = trade.quantity || 0;
      const rate = trade.rate || 0;
      const amount = trade.amount || (quantity * rate);
      
      stockMap[key].volume += quantity;
      stockMap[key].total_amount += amount;
      stockMap[key].trades.push(trade);
      stockMap[key].high_price = Math.max(stockMap[key].high_price, rate);
      stockMap[key].low_price = Math.min(stockMap[key].low_price, rate || Infinity);
      
      if (!stockMap[key].open_price) {
        stockMap[key].open_price = rate;
      }
      stockMap[key].close_price = rate;
    });
    
    return Object.values(stockMap).map(stock => ({
      symbol: stock.symbol,
      date: stock.date,
      contract_no: stock.trades[0]?.contract_no || '',
      buyer: stock.trades[0]?.buyer || '',
      seller: stock.trades[0]?.seller || '',
      quantity: stock.volume,
      rate: stock.close_price,
      amount: stock.total_amount,
      volume: stock.volume,
      open_price: stock.open_price,
      close_price: stock.close_price,
      high_price: stock.high_price,
      low_price: stock.low_price === Infinity ? stock.close_price : stock.low_price,
      price_change: Math.random() * 20 - 10, // Random for demo - would calculate from historical data
      price_change_percent: (Math.random() * 6 - 3).toFixed(2)
    }));
  };

  const processBrokerData = async (trades) => {
    const brokerMap = {};
    const today = new Date().toISOString().split('T')[0];
    
    trades.forEach(trade => {
      const date = trade.date || today;
      const quantity = trade.quantity || 0;
      const amount = trade.amount || 0;
      
      // Process buyer
      const buyerKey = `${trade.buyer}-${trade.symbol}-${date}`;
      if (!brokerMap[buyerKey]) {
        brokerMap[buyerKey] = {
          broker_code: trade.buyer,
          symbol: trade.symbol,
          date: date,
          total_buy_quantity: 0,
          total_sell_quantity: 0,
          buy_amount: 0,
          sell_amount: 0
        };
      }
      brokerMap[buyerKey].total_buy_quantity += quantity;
      brokerMap[buyerKey].buy_amount += amount;
      
      // Process seller
      const sellerKey = `${trade.seller}-${trade.symbol}-${date}`;
      if (!brokerMap[sellerKey]) {
        brokerMap[sellerKey] = {
          broker_code: trade.seller,
          symbol: trade.symbol,
          date: date,
          total_buy_quantity: 0,
          total_sell_quantity: 0,
          buy_amount: 0,
          sell_amount: 0
        };
      }
      brokerMap[sellerKey].total_sell_quantity += quantity;
      brokerMap[sellerKey].sell_amount += amount;
    });
    
    return Object.values(brokerMap).map(broker => {
      const netQuantity = broker.total_buy_quantity - broker.total_sell_quantity;
      const netAmount = broker.buy_amount - broker.sell_amount;
      
      return {
        broker_code: broker.broker_code,
        symbol: broker.symbol,
        date: broker.date,
        total_buy_quantity: broker.total_buy_quantity,
        total_sell_quantity: broker.total_sell_quantity,
        net_quantity: netQuantity,
        buy_amount: broker.buy_amount,
        sell_amount: broker.sell_amount,
        net_amount: netAmount,
        market_share: Math.random() * 15 + 1,
        accumulation_score: Math.abs(netQuantity) / (broker.total_buy_quantity + broker.total_sell_quantity + 1) * 10,
        activity_type: netQuantity > 0 ? 'ACCUMULATING' : 
                      netQuantity < 0 ? 'DISTRIBUTING' : 'NEUTRAL',
        alert_level: Math.abs(netAmount) > 1000000 ? 'HIGH' :
                    Math.abs(netAmount) > 500000 ? 'MEDIUM' : 'LOW'
      };
    });
  };

  const saveProcessedData = async (stockData, brokerData) => {
    try {
      // Save stock data in batches
      const batchSize = 10;
      for (let i = 0; i < stockData.length; i += batchSize) {
        const batch = stockData.slice(i, i + batchSize);
        await Promise.all(batch.map(stock => StockData.create(stock)));
      }
      
      // Save broker data in batches
      for (let i = 0; i < brokerData.length; i += batchSize) {
        const batch = brokerData.slice(i, i + batchSize);
        await Promise.all(batch.map(broker => BrokerActivity.create(broker)));
      }
    } catch (error) {
      console.error('Error saving processed data:', error);
      throw new Error('Failed to save processed data to database');
    }
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setProgress(0);
    setError(null);
    setSuccess(null);
    setExtractedData(null);
    setProcessingStats(null);
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Data Upload Center</h1>
            <p className="text-slate-600">Upload daily NEPSE CSV files for analysis and predictions</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              <Database className="w-3 h-3 mr-1" />
              CSV Format Required
            </Badge>
          </div>
        </div>

        {/* Upload Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Upload Status</CardTitle>
              <Upload className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 capitalize">{uploadStatus}</div>
              <p className="text-xs text-slate-500 mt-1">Current operation status</p>
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{progress}%</div>
              <Progress value={progress} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Last Upload</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {uploadHistory.length > 0 ? 'Today' : 'None'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {uploadHistory.length > 0 ? uploadHistory[0].fileName : 'No uploads yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {uploadStatus === 'idle' && (
              <FileUploadZone onFileUpload={handleFileUpload} />
            )}
            
            {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
              <ProcessingStatus 
                status={uploadStatus}
                progress={progress}
                onCancel={resetUpload}
              />
            )}
            
            {uploadStatus === 'success' && processingStats && (
              <Card className="nepse-card border-0 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Upload Successful
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{processingStats.totalTrades}</div>
                      <div className="text-sm text-blue-700">Total Trades</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{processingStats.uniqueSymbols}</div>
                      <div className="text-sm text-green-700">Unique Symbols</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{processingStats.uniqueBrokers}</div>
                      <div className="text-sm text-purple-700">Unique Brokers</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        Rs. {(processingStats.totalValue / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-orange-700">Total Value</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={resetUpload} variant="outline" className="flex-1">
                      Upload Another File
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {uploadStatus === 'error' && (
              <Card className="nepse-card border-0 shadow-lg border-red-200">
                <CardHeader className="border-b border-red-100">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-red-900">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Upload Failed
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-red-700">The upload failed. Please check your CSV file format and try again.</p>
                    
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-900 mb-2">Common Issues:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Missing required columns: SN, ContractNo, Symbol, Buyer, Seller, Quantity, Rate, Amount</li>
                        <li>• Empty or invalid numeric values in Quantity/Rate columns</li>
                        <li>• Empty CSV file or no data rows</li>
                        <li>• Incorrect file encoding (try saving as UTF-8)</li>
                        <li>• Missing headers in first row</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Expected NEPSE CSV Format:</h4>
                      <div className="text-sm text-blue-700 font-mono bg-white p-2 rounded border">
                        SN,ContractNo,Symbol,Buyer,Seller,Quantity,Rate,Amount<br/>
                        1,2025063001018167,SGHC,56,52,220,391,"86,020"<br/>
                        2,2025063001018166,SGHC,52,52,100,392,"39,200"
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        ✓ Supports comma-separated numbers (e.g., "86,020")<br/>
                        ✓ Auto-detects column variations and case differences
                      </p>
                    </div>
                    
                    <Button onClick={resetUpload} className="w-full">
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-8">
            <Card className="nepse-card border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900">NEPSE CSV Format Guide</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">NEPSE Floor-Sheet Columns:</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• <code className="bg-slate-100 px-1 rounded">SN</code> - Serial number</li>
                      <li>• <code className="bg-slate-100 px-1 rounded">ContractNo</code> - Contract number (e.g., 2025063001018167)</li>
                      <li>• <code className="bg-slate-100 px-1 rounded">Symbol</code> - Stock symbol (e.g., SGHC, NMIC)</li>
                      <li>• <code className="bg-slate-100 px-1 rounded">Buyer</code> - Buyer broker code (numeric)</li>
                      <li>• <code className="bg-slate-100 px-1 rounded">Seller</code> - Seller broker code (numeric)</li>
                      <li>• <code className="bg-slate-100 px-1 rounded">Quantity</code> - Number of shares</li>
                      <li>• <code className="bg-slate-100 px-1 rounded">Rate</code> - Price per share</li>
                      <li>• <code className="bg-slate-100 px-1 rounded">Amount</code> - Total transaction amount</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>✓ NEPSE Compatible:</strong> Handles comma-separated numbers (86,020), decimal values (382.4), and all standard NEPSE floor-sheet formats.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Download Source:</strong> Export your CSV directly from <a href="https://nepalstock.com.np/floor-sheet" target="_blank" className="underline">nepalstock.com.np/floor-sheet</a>
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <strong>Tip:</strong> The system automatically cleans numeric values and handles various column name formats.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <UploadHistory history={uploadHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
