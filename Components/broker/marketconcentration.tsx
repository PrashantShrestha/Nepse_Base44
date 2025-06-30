import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketConcentration({ brokerData, isLoading }) {
  const getMarketConcentration = () => {
    const brokerTotals = {};
    let totalMarketAmount = 0;
    
    brokerData.forEach(activity => {
      const broker = activity.broker_code;
      const amount = Math.abs(activity.net_amount || 0);
      
      brokerTotals[broker] = (brokerTotals[broker] || 0) + amount;
      totalMarketAmount += amount;
    });
    
    const sortedBrokers = Object.entries(brokerTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([broker, amount]) => ({
        broker,
        amount,
        percentage: totalMarketAmount > 0 ? (amount / totalMarketAmount) * 100 : 0
      }));
    
    return sortedBrokers;
  };

  const concentration = getMarketConcentration();
  const topBrokers = concentration.slice(0, 5);

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <PieChart className="w-5 h-5 text-blue-600" />
          Market Concentration
        </CardTitle>
        <p className="text-sm text-slate-600">Top brokers by trading volume</p>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : topBrokers.length > 0 ? (
          <div className="space-y-4">
            {topBrokers.map((item, index) => (
              <div key={item.broker} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'][index]
                    }`} />
                    <span className="font-medium text-slate-900">{item.broker}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">{item.percentage.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500">
                      Rs. {(item.amount / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Top 5 Concentration:</span>
                <span className="font-semibold">
                  {topBrokers.reduce((sum, broker) => sum + broker.percentage, 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Data</h3>
            <p className="text-slate-500">No broker concentration data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
