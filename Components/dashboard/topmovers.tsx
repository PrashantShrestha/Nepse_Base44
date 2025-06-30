import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopMovers({ marketData, isLoading }) {
  const getTopMovers = () => {
    const symbolMap = {};
    marketData.forEach(stock => {
      if (!symbolMap[stock.symbol] || new Date(stock.date) > new Date(symbolMap[stock.symbol].date)) {
        symbolMap[stock.symbol] = stock;
      }
    });
    
    const stocks = Object.values(symbolMap).filter(stock => stock.price_change_percent);
    const gainers = stocks
      .filter(stock => stock.price_change_percent > 0)
      .sort((a, b) => b.price_change_percent - a.price_change_percent)
      .slice(0, 5);
    
    const losers = stocks
      .filter(stock => stock.price_change_percent < 0)
      .sort((a, b) => a.price_change_percent - b.price_change_percent)
      .slice(0, 5);
    
    return { gainers, losers };
  };

  const { gainers, losers } = getTopMovers();

  const MoverItem = ({ stock, type }) => (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          type === 'gainer' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {type === 'gainer' ? 
            <TrendingUp className="w-4 h-4 text-green-600" /> : 
            <TrendingDown className="w-4 h-4 text-red-600" />
          }
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 text-sm">{stock.symbol}</h4>
          <p className="text-xs text-slate-500">Rs. {(stock.close_price || stock.rate).toFixed(2)}</p>
        </div>
      </div>
      <Badge className={`${
        type === 'gainer' 
          ? 'bg-green-100 text-green-700 border-green-200' 
          : 'bg-red-100 text-red-700 border-red-200'
      } border`}>
        {stock.price_change_percent > 0 ? '+' : ''}{stock.price_change_percent.toFixed(2)}%
      </Badge>
    </div>
  );

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900">Top Movers</CardTitle>
        <p className="text-sm text-slate-600">Biggest gainers and losers today</p>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-3 w-12 mb-1" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Top Gainers
              </h4>
              <div className="space-y-1">
                {gainers.length > 0 ? gainers.map((stock) => (
                  <MoverItem key={stock.id} stock={stock} type="gainer" />
                )) : (
                  <p className="text-sm text-slate-500 py-3">No gainers today</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Top Losers
              </h4>
              <div className="space-y-1">
                {losers.length > 0 ? losers.map((stock) => (
                  <MoverItem key={stock.id} stock={stock} type="loser" />
                )) : (
                  <p className="text-sm text-slate-500 py-3">No losers today</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
