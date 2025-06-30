import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Loader2, Brain } from "lucide-react";

export default function GeneratePredictions({ stockData, onGenerate, isGenerating }) {
  const [selectedSymbols, setSelectedSymbols] = useState([]);
  const [modelType, setModelType] = useState("RandomForest");

  const uniqueSymbols = [...new Set(stockData.map(stock => stock.symbol))].slice(0, 10);

  const handleSymbolToggle = (symbol, checked) => {
    if (checked) {
      setSelectedSymbols([...selectedSymbols, symbol]);
    } else {
      setSelectedSymbols(selectedSymbols.filter(s => s !== symbol));
    }
  };

  const handleGenerate = () => {
    if (selectedSymbols.length > 0) {
      onGenerate(selectedSymbols, modelType);
    }
  };

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Brain className="w-5 h-5 text-blue-600" />
          Generate New Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">Select Stocks</label>
          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
            {uniqueSymbols.map((symbol) => (
              <div key={symbol} className="flex items-center space-x-2">
                <Checkbox
                  id={symbol}
                  checked={selectedSymbols.includes(symbol)}
                  onCheckedChange={(checked) => handleSymbolToggle(symbol, checked)}
                />
                <label
                  htmlFor={symbol}
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  {symbol}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">ML Model</label>
          <Select value={modelType} onValueChange={setModelType}>
            <SelectTrigger>
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RandomForest">Random Forest</SelectItem>
              <SelectItem value="XGBoost">XGBoost</SelectItem>
              <SelectItem value="LogisticRegression">Logistic Regression</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={selectedSymbols.length === 0 || isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Generate Predictions
            </>
          )}
        </Button>

        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
          <p className="font-medium mb-1">How it works:</p>
          <p>AI analyzes historical price data, volume patterns, and technical indicators to generate next-day trading signals with confidence scores.</p>
        </div>
      </CardContent>
    </Card>
  );
}
