import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter } from "lucide-react";

export default function PredictionFilters({ filters, setFilters, predictions }) {
  const uniqueModels = [...new Set(predictions.map(p => p.model_used).filter(Boolean))];

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Filter className="w-5 h-5 text-blue-600" />
          Filter Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Signal Type</label>
            <Select value={filters.signal} onValueChange={(value) => setFilters({...filters, signal: value})}>
              <SelectTrigger>
                <SelectValue placeholder="All Signals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Signals</SelectItem>
                <SelectItem value="BUY">Buy</SelectItem>
                <SelectItem value="HOLD">Hold</SelectItem>
                <SelectItem value="SELL">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Model</label>
            <Select value={filters.model} onValueChange={(value) => setFilters({...filters, model: value})}>
              <SelectTrigger>
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Models</SelectItem>
                {uniqueModels.map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Date Range</label>
            <Select value={filters.dateRange.toString()} onValueChange={(value) => setFilters({...filters, dateRange: parseInt(value)})}>
              <SelectTrigger>
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 1 Day</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Min Confidence: {filters.confidence}%
            </label>
            <Slider
              value={[filters.confidence]}
              onValueChange={(value) => setFilters({...filters, confidence: value[0]})}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
