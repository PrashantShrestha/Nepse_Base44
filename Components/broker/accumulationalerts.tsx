import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccumulationAlerts({ brokerData, isLoading }) {
  const getHighAlertActivities = () => {
    return brokerData
      .filter(activity => activity.alert_level === 'HIGH' || activity.alert_level === 'CRITICAL')
      .sort((a, b) => b.accumulation_score - a.accumulation_score)
      .slice(0, 10);
  };

  const highAlerts = getHighAlertActivities();

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Accumulation Alerts
        </CardTitle>
        <p className="text-sm text-slate-600">Suspicious broker activities requiring attention</p>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : highAlerts.length > 0 ? (
          <div className="space-y-4">
            {highAlerts.map((activity) => (
              <div key={activity.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{activity.broker_code}</h4>
                    <p className="text-sm text-blue-600 font-medium">{activity.symbol}</p>
                  </div>
                  <Badge className={`${
                    activity.alert_level === 'CRITICAL' 
                      ? 'bg-red-100 text-red-800 border-red-200' 
                      : 'bg-orange-100 text-orange-800 border-orange-200'
                  } border`}>
                    {activity.alert_level}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">Net Position:</span>
                    <div className={`font-semibold ${
                      activity.net_quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {activity.net_quantity > 0 ? '+' : ''}{(activity.net_quantity || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600">Market Share:</span>
                    <div className="font-semibold">{(activity.market_share || 0).toFixed(1)}%</div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Accumulation Score</span>
                    <span className="font-semibold text-orange-600">
                      {(activity.accumulation_score || 0).toFixed(1)}/10
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(activity.accumulation_score || 0) * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">All Clear</h3>
            <p className="text-slate-500">No high-risk broker activities detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
