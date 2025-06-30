import React, { useState, useEffect } from "react";
import { Prediction, StockData } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  Filter,
  Calendar,
  Target,
  BarChart3,
  Loader2
} from "lucide-react";

import PredictionCard from "../components/predictions/PredictionCard";
import ModelPerformance from "../components/predictions/ModelPerformance";
import PredictionFilters from "../components/predictions/PredictionFilters";
import GeneratePredictions from "../components/predictions/GeneratePredictions";

export default function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filters, setFilters] = useState({
    signal: "ALL",
    model: "ALL",
    confidence: 0,
    dateRange: 7
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [predictionData, stockMarketData] = await Promise.all([
        Prediction.list("-date", 100),
        StockData.list("-date", 50)
      ]);
      setPredictions(predictionData);
      setStockData(stockMarketData);
    } catch (error) {
      console.error("Error loading prediction data:", error);
    }
    setIsLoading(false);
  };

  const generateNewPredictions = async (selectedSymbols, modelType) => {
    setIsGenerating(true);
    try {
      // Get latest stock data for selected symbols
      const latestData = {};
      stockData.forEach(stock => {
        if (selectedSymbols.includes(stock.symbol)) {
          if (!latestData[stock.symbol] || new Date(stock.date) > new Date(latestData[stock.symbol].date)) {
            latestData[stock.symbol] = stock;
          }
        }
      });

      const predictionPromises = selectedSymbols.map(async (symbol) => {
        const stock = latestData[symbol];
        if (!stock) return null;

        // Calculate technical indicators
        const symbolHistory = stockData.filter(s => s.symbol === symbol).slice(0, 20);
        const avgVolume = symbolHistory.reduce((sum, s) => sum + (s.volume || 0), 0) / symbolHistory.length;
        const priceVolatility = Math.abs(stock.price_change_percent || 0);
        
        // Generate prediction using AI
        const response = await InvokeLLM({
          prompt: `Analyze this NEPSE stock and predict next-day trading signal:
          
          Stock: ${symbol}
          Current Price: Rs. ${stock.close_price || stock.rate}
          Price Change: ${stock.price_change_percent}%
          Volume: ${stock.volume}
          Average Volume: ${avgVolume.toFixed(0)}
          Volatility: ${priceVolatility}%
          
          Historical data shows recent trend. Consider:
          - Technical indicators
          - Volume patterns
          - Price momentum
          - Market conditions
          
          Generate a trading recommendation with confidence score.`,
          response_json_schema: {
            type: "object",
            properties: {
              signal: { type: "string", enum: ["BUY", "HOLD", "SELL"] },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              predicted_price: { type: "number" },
              expected_return: { type: "number" },
              risk_score: { type: "number", minimum: 1, maximum: 10 },
              reasoning: { type: "string" }
            }
          }
        });

        return {
          date: new Date().toISOString().split('T')[0],
          symbol: symbol,
          signal: response.signal,
          confidence: response.confidence,
          predicted_price: response.predicted_price,
          current_price: stock.close_price || stock.rate,
          expected_return: response.expected_return,
          model_used: modelType,
          risk_score: response.risk_score
        };
      });

      const newPredictions = await Promise.all(predictionPromises);
      const validPredictions = newPredictions.filter(p => p !== null);

      // Save predictions to database
      for (const prediction of validPredictions) {
        await Prediction.create(prediction);
      }

      // Reload data
      await loadData();
    } catch (error) {
      console.error("Error generating predictions:", error);
    }
    setIsGenerating(false);
  };

  const filteredPredictions = predictions.filter(prediction => {
    const matchesSignal = filters.signal === "ALL" || prediction.signal === filters.signal;
    const matchesModel = filters.model === "ALL" || prediction.model_used === filters.model;
    const matchesConfidence = prediction.confidence >= filters.confidence / 100;
    
    const predictionDate = new Date(prediction.date);
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - filters.dateRange);
    const matchesDate = predictionDate >= daysAgo;
    
    return matchesSignal && matchesModel && matchesConfidence && matchesDate;
  });

  const getSignalStats = () => {
    const buy = filteredPredictions.filter(p => p.signal === 'BUY').length;
    const hold = filteredPredictions.filter(p => p.signal === 'HOLD').length;
    const sell = filteredPredictions.filter(p => p.signal === 'SELL').length;
    const avgConfidence = filteredPredictions.reduce((sum, p) => sum + p.confidence, 0) / filteredPredictions.length;
    
    return { buy, hold, sell, avgConfidence: avgConfidence || 0 };
  };

  const stats = getSignalStats();

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Stock Predictions</h1>
            <p className="text-slate-600">Machine learning powered trading signals and forecasts</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              <Brain className="w-3 h-3 mr-1" />
              {filteredPredictions.length} Active Predictions
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Buy Signals</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.buy}</div>
              <p className="text-xs text-slate-500 mt-1">Bullish predictions</p>
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Hold Signals</CardTitle>
              <Minus className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.hold}</div>
              <p className="text-xs text-slate-500 mt-1">Neutral predictions</p>
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Sell Signals</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.sell}</div>
              <p className="text-xs text-slate-500 mt-1">Bearish predictions</p>
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Confidence</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(stats.avgConfidence * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-slate-500 mt-1">Model accuracy</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PredictionFilters 
              filters={filters} 
              setFilters={setFilters}
              predictions={predictions}
            />
            
            <Card className="nepse-card border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-900">Latest Predictions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="p-4 border border-slate-200 rounded-lg animate-pulse">
                        <div className="h-4 bg-slate-200 rounded mb-2"></div>
                        <div className="h-6 bg-slate-200 rounded mb-3"></div>
                        <div className="h-2 bg-slate-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredPredictions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPredictions.map((prediction) => (
                      <PredictionCard key={prediction.id} prediction={prediction} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No Predictions Found</h3>
                    <p className="text-slate-500 mb-6">Generate new predictions or adjust your filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <GeneratePredictions 
              stockData={stockData}
              onGenerate={generateNewPredictions}
              isGenerating={isGenerating}
            />
            <ModelPerformance predictions={predictions} />
          </div>
        </div>
      </div>
    </div>
  );
}
