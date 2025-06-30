import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketSentiment({ predictions, isLoading }) {
  const calculateSentiment = () => {
    if (predictions.length === 0) return { buy: 0, hold: 0, sell: 0, total: 0 };
    
    const todaysPredictions = predictions.filter(pred => {
      const today = new Date().toISOString().split('T')[0];
      return pred.date === today;
    });
    
    const buy = todaysPredictions.filter(p => p.signal === 'BUY').length;
    const hold = todaysPredictions.filter(p => p.signal === 'HOLD').length;
    const sell = todaysPredictions.filter(p => p.signal === 'SELL').length;
    const total = todaysPredictions.length;
    
    return { buy, hold, sell, total };
  };

  const sentiment = calculateSentiment();
  
  const getSentimentColor = () => {
    if (sentiment.buy > sentiment.sell) return 'text-green-600';
    if (sentiment.sell > sentiment.buy) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentLabel = () => {
    if (sentiment.buy > sentiment.sell) return 'Bullish';
    if (sentiment.sell > sentiment.buy) return 'Bearish';
    return 'Neutral';
  };

  const getSentimentIcon = () => {
    if (sentiment.buy > sentiment.sell) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (sentiment.sell > sentiment.buy) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-yellow-600" />;
  };

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Brain className="w-5 h-5 text-blue-600" />
          Market Sentiment
        </CardTitle>
        <p className="text-sm text-slate-600">AI-powered market sentiment analysis</p>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="text-center">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-3" />
              <Skeleton className="h-6 w-24 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </div>
        ) : sentiment.total > 0 ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                {getSentimentIcon()}
              </div>
              <h3 className={`text-2xl font-bold ${getSentimentColor()}`}>
                {getSentimentLabel()}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Based on {sentiment.total} AI predictions
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-green-700 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Buy Signals
                  </span>
                  <span className="text-sm font-bold text-green-700">
                    {sentiment.buy} ({sentiment.total > 0 ? ((sentiment.buy / sentiment.total) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <Progress 
                  value={sentiment.total > 0 ? (sentiment.buy / sentiment.total) * 100 : 0} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-yellow-700 flex items-center gap-1">
                    <Minus className="w-3 h-3" />
                    Hold Signals
                  </span>
                  <span className="text-sm font-bold text-yellow-700">
                    {sentiment.hold} ({sentiment.total > 0 ? ((sentiment.hold / sentiment.total) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <Progress 
                  value={sentiment.total > 0 ? (sentiment.hold / sentiment.total) * 100 : 0} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-red-700 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    Sell Signals
                  </span>
                  <span className="text-sm font-bold text-red-700">
                    {sentiment.sell} ({sentiment.total > 0 ? ((sentiment.sell / sentiment.total) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <Progress 
                  value={sentiment.total > 0 ? (sentiment.sell / sentiment.total) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No sentiment data available</p>
            <p className="text-sm text-slate-400 mt-1">Generate predictions to see market sentiment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
