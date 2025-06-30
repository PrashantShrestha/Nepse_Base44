import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function BrokerActivityTable({ brokerData, isLoading }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'ACCUMULATING': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'DISTRIBUTING': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'NEUTRAL': return <Minus className="w-4 h-4 text-gray-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'ACCUMULATING': return 'bg-green-100 text-green-700 border-green-200';
      case 'DISTRIBUTING': return 'bg-red-100 text-red-700 border-red-200';
      case 'NEUTRAL': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Users className="w-5 h-5 text-blue-600" />
          Broker Activity Monitor
        </CardTitle>
        <p className="text-sm text-slate-600">Real-time broker trading patterns and behaviors</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Broker</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Net Qty</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Market Share</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Alert Level</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : (
                brokerData.slice(0, 20).map((activity) => (
                  <TableRow key={activity.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{activity.broker_code}</TableCell>
                    <TableCell className="font-semibold text-blue-600">{activity.symbol}</TableCell>
                    <TableCell className={`font-medium ${
                      activity.net_quantity > 0 ? 'text-green-600' : 
                      activity.net_quantity < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {activity.net_quantity > 0 ? '+' : ''}{(activity.net_quantity || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className={`font-medium ${
                      activity.net_amount > 0 ? 'text-green-600' : 
                      activity.net_amount < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      Rs. {(activity.net_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>{(activity.market_share || 0).toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge className={`${getActivityColor(activity.activity_type)} border px-2 py-1`}>
                        {getActivityIcon(activity.activity_type)}
                        <span className="ml-1 text-xs">{activity.activity_type}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getAlertColor(activity.alert_level)} border px-2 py-1`}>
                        {activity.alert_level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
