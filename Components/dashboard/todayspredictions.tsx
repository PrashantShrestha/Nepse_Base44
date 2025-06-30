import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TodaysPredictions({ predictions, isLoading }) {
  const todaysPredictions = predictions.filter(pred => {
    const today = new Date().toISOString().split('T')[0];
    return pred.date === today;
  }).slice(0, 8);

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY': return 'buy-signal border-green-200';
      case 'SELL': return 'sell-signal border-red-200';
      case 'HOLD': return 'hold-signal border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="w-4 h-4" />;
      case 'SELL': return <TrendingDown className="w-4 h-4" />;
      case 'HOLD': return <Minus className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Brain className="w-5 h-5 text-blue-600" />
          Today's AI Predictions
        </CardTitle>
        <p className="text-sm text-slate-600">ML-powered trading signals for today</p>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : todaysPredictions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todaysPredictions.map((prediction) => (
              <div key={prediction.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{prediction.symbol}</h4>
                  <Badge className={`${getSignalColor(prediction.signal)} border px-2 py-1`}>
                    {getSignalIcon(prediction.signal)}
                    <span className="ml-1 font-medium">{prediction.signal}</span>
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Confidence</span>
                    <span className="font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={prediction.confidence * 100} className="h-2" />
                  
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-slate-600">Expected Return</span>
                    <span className={`font-medium ${
                      prediction.expected_return > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {prediction.expected_return > 0 ? '+' : ''}{(prediction.expected_return || 0).toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-slate-500 pt-1">
                    <span>Model: {prediction.model_used}</span>
                    <span>Risk: {prediction.risk_score}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No predictions available for today</p>
            <p className="text-sm text-slate-400 mt-1">Upload today's market data to generate predictions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
