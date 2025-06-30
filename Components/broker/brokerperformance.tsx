import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrokerPerformance({ brokerData, isLoading }) {
  const getBrokerPerformance = () => {
    const brokerStats = {};
    
    brokerData.forEach(activity => {
      const broker = activity.broker_code;
      if (!brokerStats[broker]) {
        brokerStats[broker] = {
          totalTrades: 0,
          netAmount: 0,
          avgMarketShare: 0,
          avgAccumulation: 0,
          activities: { ACCUMULATING: 0, DISTRIBUTING: 0, NEUTRAL: 0 },
          alerts: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
        };
      }
      
      brokerStats[broker].totalTrades += 1;
      brokerStats[broker].netAmount += activity.net_amount || 0;
      brokerStats[broker].avgMarketShare += activity.market_share || 0;
      brokerStats[broker].avgAccumulation += activity.accumulation_score || 0;
      brokerStats[broker].activities[activity.activity_type] += 1;
      brokerStats[broker].alerts[activity.alert_level] += 1;
    });
    
    // Calculate averages and sort by performance
    const performanceData = Object.entries(brokerStats).map(([broker, stats]) => ({
      broker,
      totalTrades: stats.totalTrades,
      netAmount: stats.netAmount,
      avgMarketShare: stats.totalTrades > 0 ? stats.avgMarketShare / stats.totalTrades : 0,
      avgAccumulation: stats.totalTrades > 0 ? stats.avgAccumulation / stats.totalTrades : 0,
      activities: stats.activities,
      alerts: stats.alerts,
      performanceScore: (stats.netAmount / 1000000) + (stats.avgMarketShare / 10)
    })).sort((a, b) => b.performanceScore - a.performanceScore);
    
    return performanceData.slice(0, 10);
  };

  const brokerPerformance = getBrokerPerformance();

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Broker Performance Dashboard
        </CardTitle>
        <p className="text-sm text-slate-600">Comprehensive broker trading performance metrics</p>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="p-4 border border-slate-200 rounded-lg">
                <Skeleton className="h-4 w-16 mb-3" />
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : brokerPerformance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brokerPerformance.map((broker, index) => (
              <div key={broker.broker} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-lg text-slate-900">{broker.broker}</h4>
                  <Badge className={`${
                    index < 3 ? 'bg-green-100 text-green-700 border-green-200' : 
                    'bg-slate-100 text-slate-700 border-slate-200'
                  } border`}>
                    #{index + 1}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">Net Amount</span>
                      <div className={`font-semibold ${
                        broker.netAmount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Rs. {(broker.netAmount / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600">Market Share</span>
                      <div className="font-semibold">{broker.avgMarketShare.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">Total Trades</span>
                      <div className="font-semibold">{broker.totalTrades}</div>
                    </div>
                    <div>
                      <span className="text-slate-600">Avg Score</span>
                      <div className="font-semibold">{broker.avgAccumulation.toFixed(1)}/10</div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-slate-500">Activity Pattern</span>
                    </div>
                    <div className="flex gap-1">
                      <div 
                        className="bg-green-500 h-2 rounded-l"
                        style={{ width: `${(broker.activities.ACCUMULATING / broker.totalTrades) * 100}%` }}
                      />
                      <div 
                        className="bg-yellow-500 h-2"
                        style={{ width: `${(broker.activities.NEUTRAL / broker.totalTrades) * 100}%` }}
                      />
                      <div 
                        className="bg-red-500 h-2 rounded-r"
                        style={{ width: `${(broker.activities.DISTRIBUTING / broker.totalTrades) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-green-600">ACC</span>
                      <span className="text-yellow-600">NEU</span>
                      <span className="text-red-600">DIS</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Performance Data</h3>
            <p className="text-slate-500">No broker performance metrics available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
