import React, { useState, useEffect } from "react";
import { StockData, Prediction, BrokerActivity } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  AlertTriangle,
  Target,
  BarChart3,
  Activity
} from "lucide-react";

import PortfolioOverview from "../components/portfolio/PortfolioOverview";
import RiskAnalysis from "../components/portfolio/RiskAnalysis";
import PerformanceMetrics from "../components/portfolio/PerformanceMetrics";
import RecommendedActions from "../components/portfolio/RecommendedActions";

export default function Portfolio() {
  const [stockData, setStockData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [brokerData, setBrokerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioView, setPortfolioView] = useState("overview");

  // Mock portfolio data - in real app this would come from user's holdings
  const [mockPortfolio] = useState([
    { symbol: "NABIL", quantity: 100, avgPrice: 1200, currentPrice: 1250 },
    { symbol: "SCB", quantity: 200, avgPrice: 470, currentPrice: 480 },
    { symbol: "EBL", quantity: 150, avgPrice: 675, currentPrice: 680 },
    { symbol: "UPPER", quantity: 50, avgPrice: 630, currentPrice: 620 },
    { symbol: "HIDCL", quantity: 300, avgPrice: 385, currentPrice: 380 }
  ]);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    setIsLoading(true);
    try {
      const [marketData, predictionData, brokerActivityData] = await Promise.all([
        StockData.list("-date", 100),
        Prediction.list("-date", 50),
        BrokerActivity.list("-date", 100)
      ]);
      setStockData(marketData);
      setPredictions(predictionData);
      setBrokerData(brokerActivityData);
    } catch (error) {
      console.error("Error loading portfolio data:", error);
    }
    setIsLoading(false);
  };

  const calculatePortfolioStats = () => {
    let totalValue = 0;
    let totalCost = 0;
    let totalGainLoss = 0;
    let totalGainLossPercent = 0;

    const enrichedPortfolio = mockPortfolio.map(holding => {
      const currentValue = holding.quantity * holding.currentPrice;
      const costBasis = holding.quantity * holding.avgPrice;
      const gainLoss = currentValue - costBasis;
      const gainLossPercent = ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100;

      totalValue += currentValue;
      totalCost += costBasis;
      totalGainLoss += gainLoss;

      return {
        ...holding,
        currentValue,
        costBasis,
        gainLoss,
        gainLossPercent
      };
    });

    totalGainLossPercent = ((totalValue - totalCost) / totalCost) * 100;

    return {
      holdings: enrichedPortfolio,
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      portfolioCount: mockPortfolio.length
    };
  };

  const getPortfolioPredictions = () => {
    const portfolioSymbols = mockPortfolio.map(h => h.symbol);
    return predictions.filter(pred => portfolioSymbols.includes(pred.symbol));
  };

  const stats = calculatePortfolioStats();
  const portfolioPredictions = getPortfolioPredictions();

  const buySignals = portfolioPredictions.filter(p => p.signal === 'BUY').length;
  const sellSignals = portfolioPredictions.filter(p => p.signal === 'SELL').length;
  const holdSignals = portfolioPredictions.filter(p => p.signal === 'HOLD').length;

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Portfolio Analytics</h1>
            <p className="text-slate-600">Comprehensive portfolio performance and risk analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              <Activity className="w-3 h-3 mr-1" />
              {stats.portfolioCount} Holdings
            </Badge>
            <Badge className={`border ${
              stats.totalGainLoss > 0 
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-red-100 text-red-700 border-red-200'
            }`}>
              {stats.totalGainLoss > 0 ? '+' : ''}{stats.totalGainLossPercent.toFixed(2)}%
            </Badge>
          </div>
        </div>

        {/* Portfolio Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                Rs. {(stats.totalValue / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-slate-500 mt-1">Current market value</p>
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total P&L</CardTitle>
              {stats.totalGainLoss > 0 ? 
                <TrendingUp className="h-4 w-4 text-green-600" /> :
                <TrendingDown className="h-4 w-4 text-red-600" />
              }
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                stats.totalGainLoss > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.totalGainLoss > 0 ? '+' : ''}Rs. {(stats.totalGainLoss / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.totalGainLoss > 0 ? '+' : ''}{stats.totalGainLossPercent.toFixed(2)}% return
              </p>
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Buy Signals</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{buySignals}</div>
              <p className="text-xs text-slate-500 mt-1">AI buy recommendations</p>
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Risk Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{sellSignals}</div>
              <p className="text-xs text-slate-500 mt-1">Sell signals</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PortfolioOverview 
              holdings={stats.holdings}
              predictions={portfolioPredictions}
              isLoading={isLoading}
            />
            <PerformanceMetrics 
              holdings={stats.holdings}
              stockData={stockData}
              isLoading={isLoading}
            />
          </div>

          <div className="space-y-8">
            <RiskAnalysis 
              holdings={stats.holdings}
              predictions={portfolioPredictions}
              brokerData={brokerData}
              isLoading={isLoading}
            />
            <RecommendedActions 
              holdings={stats.holdings}
              predictions={portfolioPredictions}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
