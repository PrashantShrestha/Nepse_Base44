import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, X, Upload, Database } from "lucide-react";

export default function ProcessingStatus({ status, progress, onCancel }) {
  const getStatusMessage = () => {
    switch (status) {
      case 'uploading': return 'Uploading file to server...';
      case 'processing': return 'Processing CSV data and extracting trades...';
      default: return 'Processing...';
    }
  };

  const getStatusIcon = () => {
    return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
  };

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
          {getStatusIcon()}
          Processing Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            {status === 'uploading' ? 
              <Upload className="w-8 h-8 text-blue-600" /> :
              <Database className="w-8 h-8 text-blue-600" />
            }
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {getStatusMessage()}
            </h3>
            <p className="text-slate-600">
              This may take a few moments depending on file size
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel Upload
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
