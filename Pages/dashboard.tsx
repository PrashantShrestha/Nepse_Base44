import React, { useState, useEffect } from "react";
import { StockData, Prediction } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  BarChart3,
  Users,
  AlertTriangle
} from "lucide-react";

import MarketOverview from "../components/dashboard/MarketOverview";
import TodaysPredictions from "../components/dashboard/TodaysPredictions";
import TopMovers from "../components/dashboard/TopMovers";
import MarketSentiment from "../components/dashboard/MarketSentiment";

export default function Dashboard() {
  const [marketData, setMarketData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setIsLoading(true);
    try {
      const [stockData, predictionData] = await Promise.all([
        StockData.list("-date", 100),
        Prediction.list("-date", 50)
      ]);
      setMarketData(stockData);
      setPredictions(predictionData);
    } catch (error) {
      console.error("Error loading market data:", error);
    }
    setIsLoading(false);
  };

  const calculateMarketStats = () => {
    if (marketData.length === 0) return { totalValue: 0, totalVolume: 0, gainers: 0, losers: 0 };
    
    const totalValue = marketData.reduce((sum, stock) => sum + (stock.amount || 0), 0);
    const totalVolume = marketData.reduce((sum, stock) => sum + (stock.volume || 0), 0);
    const gainers = marketData.filter(stock => (stock.price_change || 0) > 0).length;
    const losers = marketData.filter(stock => (stock.price_change || 0) < 0).length;
    
    return { totalValue, totalVolume, gainers, losers };
  };

  const stats = calculateMarketStats();

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">NEPSE Market Overview</h1>
            <p className="text-slate-600">Real-time market analysis and AI-powered predictions</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <Activity className="w-3 h-3 mr-1" />
              Market Open
            </Badge>
            <Badge variant="outline" className="text-slate-600">
              Last Updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        {/* Market Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Market Value</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                Rs. {(stats.totalValue / 1000000).toFixed(2)}M
              </div>
              <p className="text-xs text-slate-500 mt-1">+2.1% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Trading Volume</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {(stats.totalVolume / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-slate-500 mt-1">Shares traded today</p>
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Gainers</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.gainers}</div>
              <p className="text-xs text-slate-500 mt-1">Stocks moving up</p>
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Losers</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.losers}</div>
              <p className="text-xs text-slate-500 mt-1">Stocks moving down</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <MarketOverview marketData={marketData} isLoading={isLoading} />
            <TodaysPredictions predictions={predictions} isLoading={isLoading} />
          </div>

          <div className="space-y-8">
            <TopMovers marketData={marketData} isLoading={isLoading} />
            <MarketSentiment predictions={predictions} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
