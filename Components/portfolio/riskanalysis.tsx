import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RiskAnalysis({ holdings, predictions, brokerData, isLoading }) {
  const calculateRiskMetrics = () => {
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    
    // Concentration risk
    const concentrationRisk = Math.max(...holdings.map(h => (h.currentValue / totalValue) * 100));
    
    // Volatility risk (based on price changes)
    const volatilityRisk = holdings.reduce((avg, h) => {
      return avg + Math.abs(h.gainLossPercent);
    }, 0) / holdings.length;
    
    // AI prediction risk
    const sellSignals = predictions.filter(p => p.signal === 'SELL').length;
    const predictionRisk = (sellSignals / predictions.length) * 100 || 0;
    
    // Overall risk score
    const overallRisk = (concentrationRisk * 0.3 + volatilityRisk * 0.4 + predictionRisk * 0.3);
    
    return {
      concentrationRisk,
      volatilityRisk,
      predictionRisk,
      overallRisk,
      riskLevel: overallRisk > 70 ? 'HIGH' : overallRisk > 40 ? 'MEDIUM' : 'LOW'
    };
  };

  const risks = calculateRiskMetrics();

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'HIGH': return <AlertTriangle className="w-4 h-4" />;
      case 'MEDIUM': return <TrendingDown className="w-4 h-4" />;
      case 'LOW': return <Shield className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Risk Analysis
        </CardTitle>
        <p className="text-sm text-slate-600">Portfolio risk assessment and alerts</p>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">Overall Risk Level</h3>
              <Badge className={`${getRiskColor(risks.riskLevel)} border px-3 py-1`}>
                {getRiskIcon(risks.riskLevel)}
                <span className="ml-1 font-medium">{risks.riskLevel}</span>
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Concentration Risk</span>
                  <span className="font-medium">{risks.concentrationRisk.toFixed(1)}%</span>
                </div>
                <Progress value={risks.concentrationRisk} className="h-2" />
                <p className="text-xs text-slate-500">
                  Largest position: {risks.concentrationRisk.toFixed(1)}% of portfolio
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Volatility Risk</span>
                  <span className="font-medium">{risks.volatilityRisk.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(risks.volatilityRisk, 100)} className="h-2" />
                <p className="text-xs text-slate-500">
                  Average price volatility across holdings
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">AI Prediction Risk</span>
                  <span className="font-medium">{risks.predictionRisk.toFixed(1)}%</span>
                </div>
                <Progress value={risks.predictionRisk} className="h-2" />
                <p className="text-xs text-slate-500">
                  Percentage of sell signals in portfolio
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Overall Risk Score</span>
                  <span className="font-medium">{risks.overallRisk.toFixed(1)}/100</span>
                </div>
                <Progress value={risks.overallRisk} className="h-2" />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <h4 className="font-medium text-slate-900 mb-3">Risk Recommendations</h4>
              <div className="space-y-2 text-sm">
                {risks.concentrationRisk > 50 && (
                  <div className="flex items-start gap-2 text-orange-600">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Consider diversifying: One position exceeds 50% of portfolio</p>
                  </div>
                )}
                {risks.predictionRisk > 30 && (
                  <div className="flex items-start gap-2 text-red-600">
                    <TrendingDown className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>High sell signals detected: Review positions carefully</p>
                  </div>
                )}
                {risks.riskLevel === 'LOW' && (
                  <div className="flex items-start gap-2 text-green-600">
                    <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Portfolio shows balanced risk profile</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
