import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, TrendingDown, AlertTriangle, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecommendedActions({ holdings, predictions, isLoading }) {
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Check for AI sell signals
    predictions.forEach(pred => {
      if (pred.signal === 'SELL' && pred.confidence > 0.7) {
        const holding = holdings.find(h => h.symbol === pred.symbol);
        if (holding) {
          recommendations.push({
            type: 'SELL',
            symbol: pred.symbol,
            priority: 'HIGH',
            reason: `AI model predicts ${pred.expected_return?.toFixed(1)}% decline with ${(pred.confidence * 100).toFixed(1)}% confidence`,
            action: 'Consider reducing position',
            icon: TrendingDown,
            color: 'red'
          });
        }
      }
    });

    // Check for AI buy signals
    predictions.forEach(pred => {
      if (pred.signal === 'BUY' && pred.confidence > 0.8) {
        const holding = holdings.find(h => h.symbol === pred.symbol);
        if (holding) {
          recommendations.push({
            type: 'BUY',
            symbol: pred.symbol,
            priority: 'MEDIUM',
            reason: `Strong buy signal with ${pred.expected_return?.toFixed(1)}% expected return`,
            action: 'Consider increasing position',
            icon: TrendingUp,
            color: 'green'
          });
        }
      }
    });

    // Check for concentration risk
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    holdings.forEach(holding => {
      const concentration = (holding.currentValue / totalValue) * 100;
      if (concentration > 40) {
        recommendations.push({
          type: 'DIVERSIFY',
          symbol: holding.symbol,
          priority: 'MEDIUM',
          reason: `Position represents ${concentration.toFixed(1)}% of portfolio`,
          action: 'Consider diversifying to reduce risk',
          icon: AlertTriangle,
          color: 'orange'
        });
      }
    });

    // Check for large losses
    holdings.forEach(holding => {
      if (holding.gainLossPercent < -15) {
        recommendations.push({
          type: 'REVIEW',
          symbol: holding.symbol,
          priority: 'HIGH',
          reason: `Position down ${holding.gainLossPercent.toFixed(1)}%`,
          action: 'Review position for potential exit',
          icon: AlertTriangle,
          color: 'red'
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 8);
  };

  const recommendations = generateRecommendations();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionColor = (color) => {
    switch (color) {
      case 'green': return 'text-green-600';
      case 'red': return 'text-red-600';
      case 'orange': return 'text-orange-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Brain className="w-5 h-5 text-blue-600" />
          AI Recommendations
        </CardTitle>
        <p className="text-sm text-slate-600">Personalized trading recommendations</p>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <rec.icon className={`w-4 h-4 ${getActionColor(rec.color)}`} />
                    <span className="font-semibold text-slate-900">{rec.symbol}</span>
                  </div>
                  <Badge className={`${getPriorityColor(rec.priority)} border px-2 py-1 text-xs`}>
                    {rec.priority}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">{rec.reason}</p>
                  <p className="text-sm font-medium text-slate-900">{rec.action}</p>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Recommendations</h3>
            <p className="text-slate-500">Your portfolio looks well-balanced!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
