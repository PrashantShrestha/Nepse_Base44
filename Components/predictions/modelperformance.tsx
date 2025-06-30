import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Target } from "lucide-react";

export default function ModelPerformance({ predictions }) {
  const getModelStats = () => {
    const modelStats = {};
    
    predictions.forEach(pred => {
      const model = pred.model_used;
      if (!modelStats[model]) {
        modelStats[model] = {
          total: 0,
          avgConfidence: 0,
          signals: { BUY: 0, HOLD: 0, SELL: 0 }
        };
      }
      
      modelStats[model].total += 1;
      modelStats[model].avgConfidence += pred.confidence;
      modelStats[model].signals[pred.signal] += 1;
    });
    
    // Calculate averages
    Object.keys(modelStats).forEach(model => {
      if (modelStats[model].total > 0) {
        modelStats[model].avgConfidence /= modelStats[model].total;
      }
    });
    
    return modelStats;
  };

  const modelStats = getModelStats();

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Model Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {Object.entries(modelStats).map(([model, stats]) => (
            <div key={model} className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-slate-900">{model}</h4>
                <span className="text-sm text-slate-600">{stats.total} predictions</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Avg Confidence</span>
                  <span className="font-medium">{(stats.avgConfidence * 100).toFixed(1)}%</span>
                </div>
                <Progress value={stats.avgConfidence * 100} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-green-50 p-2 rounded text-center">
                  <div className="font-semibold text-green-700">{stats.signals.BUY}</div>
                  <div className="text-green-600">BUY</div>
                </div>
                <div className="bg-yellow-50 p-2 rounded text-center">
                  <div className="font-semibold text-yellow-700">{stats.signals.HOLD}</div>
                  <div className="text-yellow-600">HOLD</div>
                </div>
                <div className="bg-red-50 p-2 rounded text-center">
                  <div className="font-semibold text-red-700">{stats.signals.SELL}</div>
                  <div className="text-red-600">SELL</div>
                </div>
              </div>
            </div>
          ))}
          
          {Object.keys(modelStats).length === 0 && (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No model performance data</p>
              <p className="text-sm text-slate-400 mt-1">Generate predictions to see performance metrics</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
