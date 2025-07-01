import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function DataPreview({ data }) {
  if (!data || data.length === 0) return null;

  const previewData = data.slice(0, 5);

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <FileText className="w-5 h-5 text-blue-600" />
          Data Preview
        </CardTitle>
        <p className="text-sm text-slate-600">First 5 rows of extracted NEPSE data</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>SN</TableHead>
                <TableHead>Contract No</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((trade, index) => (
                <TableRow key={index}>
                  <TableCell>{trade.sn || index + 1}</TableCell>
                  <TableCell className="font-mono text-xs">{trade.contract_no}</TableCell>
                  <TableCell className="font-semibold text-blue-600">{trade.symbol}</TableCell>
                  <TableCell className="text-center">{trade.buyer}</TableCell>
                  <TableCell className="text-center">{trade.seller}</TableCell>
                  <TableCell className="text-right">{(trade.quantity || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right">Rs. {(trade.rate || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right">Rs. {(trade.amount || 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Showing 5 of {data.length} total NEPSE trades
            </span>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              NEPSE Format Valid
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
