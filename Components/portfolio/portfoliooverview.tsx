import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, TrendingUp, TrendingDown } from "lucide-react";

export default function PortfolioOverview({ holdings, predictions, isLoading }) {
  const getPredictionForSymbol = (symbol) => {
    return predictions.find(pred => pred.symbol === symbol);
  };

  const getSignalBadge = (prediction) => {
    if (!prediction) return null;
    
    const colors = {
      BUY: 'buy-signal border-green-200',
      SELL: 'sell-signal border-red-200',
      HOLD: 'hold-signal border-yellow-200'
    };

    return (
      <Badge className={`${colors[prediction.signal]} border px-2 py-1 text-xs`}>
        {prediction.signal}
      </Badge>
    );
  };

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <PieChart className="w-5 h-5 text-blue-600" />
          Portfolio Holdings
        </CardTitle>
        <p className="text-sm text-slate-600">Current positions with AI predictions</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Symbol</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Avg Price</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>P&L %</TableHead>
                <TableHead>AI Signal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : (
                holdings.map((holding) => {
                  const prediction = getPredictionForSymbol(holding.symbol);
                  return (
                    <TableRow key={holding.symbol} className="hover:bg-slate-50">
                      <TableCell className="font-semibold text-blue-600">{holding.symbol}</TableCell>
                      <TableCell>{holding.quantity.toLocaleString()}</TableCell>
                      <TableCell>Rs. {holding.avgPrice.toFixed(2)}</TableCell>
                      <TableCell>Rs. {holding.currentPrice.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">
                        Rs. {holding.currentValue.toLocaleString()}
                      </TableCell>
                      <TableCell className={`font-medium ${
                        holding.gainLoss > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {holding.gainLoss > 0 ? '+' : ''}Rs. {holding.gainLoss.toFixed(0)}
                      </TableCell>
                      <TableCell className={`font-medium ${
                        holding.gainLossPercent > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {holding.gainLossPercent > 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                      </TableCell>
                      <TableCell>
                        {getSignalBadge(prediction) || 
                          <span className="text-xs text-slate-400">No signal</span>
                        }
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
