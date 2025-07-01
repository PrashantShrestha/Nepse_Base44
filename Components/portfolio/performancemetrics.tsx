import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PerformanceMetrics({ holdings, stockData, isLoading }) {
  const calculatePerformanceMetrics = () => {
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.costBasis, 0);
    const totalGains = holdings.reduce((sum, h) => sum + Math.max(0, h.gainLoss), 0);
    const totalLosses = holdings.reduce((sum, h) => sum + Math.abs(Math.min(0, h.gainLoss)), 0);
    
    const winners = holdings.filter(h => h.gainLoss > 0).length;
    const losers = holdings.filter(h => h.gainLoss < 0).length;
    const winRate = (winners / holdings.length) * 100;
    
    const avgGain = winners > 0 ? totalGains / winners : 0;
    const avgLoss = losers > 0 ? totalLosses / losers : 0;
    const profitLossRatio = avgLoss > 0 ? avgGain / avgLoss : 0;
    
    return {
      totalReturn: ((totalValue - totalCost) / totalCost) * 100,
      winRate,
      profitLossRatio,
      bestPerformer: holdings.reduce((best, h) => h.gainLossPercent > best.gainLossPercent ? h : best, holdings[0]),
      worstPerformer: holdings.reduce((worst, h) => h.gainLossPercent < worst.gainLossPercent ? h : worst, holdings[0]),
      totalGains,
      totalLosses
    };
  };

  const metrics = calculatePerformanceMetrics();

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Performance Metrics
        </CardTitle>
        <p className="text-sm text-slate-600">Portfolio performance analysis and key metrics</p>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-600 mb-1">Total Return</h4>
                <div className={`text-2xl font-bold ${
                  metrics.totalReturn > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.totalReturn > 0 ? '+' : ''}{metrics.totalReturn.toFixed(2)}%
                </div>
                <p className="text-xs text-slate-500">Overall portfolio performance</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-600 mb-1">Win Rate</h4>
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.winRate.toFixed(1)}%
                </div>
                <p className="text-xs text-slate-500">Percentage of profitable positions</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-600 mb-1">Profit/Loss Ratio</h4>
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.profitLossRatio.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500">Average win vs average loss</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-600 mb-2">Best Performer</h4>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <div className="font-semibold text-green-700">{metrics.bestPerformer.symbol}</div>
                    <div className="text-sm text-green-600">
                      +{metrics.bestPerformer.gainLossPercent.toFixed(2)}%
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-600 mb-2">Worst Performer</h4>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <div className="font-semibold text-red-700">{metrics.worstPerformer.symbol}</div>
                    <div className="text-sm text-red-600">
                      {metrics.worstPerformer.gainLossPercent.toFixed(2)}%
                    </div>
                  </div>
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-600 mb-2">Gains vs Losses</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-green-50 rounded text-center border border-green-200">
                    <div className="text-sm font-semibold text-green-700">
                      Rs. {(metrics.totalGains / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-green-600">Gains</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded text-center border border-red-200">
                    <div className="text-sm font-semibold text-red-700">
                      Rs. {(metrics.totalLosses / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-red-600">Losses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
