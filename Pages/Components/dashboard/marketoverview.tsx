import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketOverview({ marketData, isLoading }) {
  const getLatestPricesBySymbol = () => {
    const symbolMap = {};
    marketData.forEach(stock => {
      if (!symbolMap[stock.symbol] || new Date(stock.date) > new Date(symbolMap[stock.symbol].date)) {
        symbolMap[stock.symbol] = stock;
      }
    });
    return Object.values(symbolMap).slice(0, 10);
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const latestStocks = getLatestPricesBySymbol();

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900">Market Overview</CardTitle>
        <p className="text-sm text-slate-600">Latest stock prices and movements</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))
          ) : (
            latestStocks.map((stock) => (
              <div key={stock.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {stock.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{stock.symbol}</h4>
                      <p className="text-sm text-slate-500">
                        Vol: {(stock.volume || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-slate-900">
                      Rs. {(stock.close_price || stock.rate || 0).toFixed(2)}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${getChangeColor(stock.price_change)}`}>
                      {getChangeIcon(stock.price_change)}
                      <span>
                        {stock.price_change > 0 ? '+' : ''}{(stock.price_change || 0).toFixed(2)}
                        ({stock.price_change_percent > 0 ? '+' : ''}{(stock.price_change_percent || 0).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
