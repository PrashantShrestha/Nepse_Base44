import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Calendar, Target } from "lucide-react";

export default function PredictionCard({ prediction }) {
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
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <Card className="nepse-card border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-slate-900">{prediction.symbol}</h3>
          <Badge className={`${getSignalColor(prediction.signal)} border px-3 py-1`}>
            {getSignalIcon(prediction.signal)}
            <span className="ml-1 font-semibold">{prediction.signal}</span>
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Current Price</span>
            <span className="font-semibold">Rs. {(prediction.current_price || 0).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Predicted Price</span>
            <span className="font-semibold">Rs. {(prediction.predicted_price || 0).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Expected Return</span>
            <span className={`font-semibold ${
              prediction.expected_return > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {prediction.expected_return > 0 ? '+' : ''}{(prediction.expected_return || 0).toFixed(2)}%
            </span>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Confidence</span>
              <span className="font-semibold">{(prediction.confidence * 100).toFixed(1)}%</span>
            </div>
            <Progress value={prediction.confidence * 100} className="h-2" />
          </div>
          
          <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(prediction.date).toLocaleDateString()}
            </span>
            <span>Model: {prediction.model_used}</span>
            <span>Risk: {prediction.risk_score}/10</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
