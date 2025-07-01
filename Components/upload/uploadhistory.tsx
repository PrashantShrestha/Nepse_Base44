import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle, FileText } from "lucide-react";

export default function UploadHistory({ history }) {
  if (history.length === 0) {
    return (
      <Card className="nepse-card border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Clock className="w-5 h-5 text-blue-600" />
            Upload History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No uploads yet</p>
            <p className="text-sm text-slate-400 mt-1">Upload your first NEPSE CSV file to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="nepse-card border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Clock className="w-5 h-5 text-blue-600" />
          Recent Uploads
        </CardTitle>
        <p className="text-sm text-slate-600">Last 5 upload attempts</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {history.map((upload, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                {upload.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <div>
                  <p className="font-medium text-slate-900 text-sm">{upload.fileName}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(upload.uploadTime).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${
                  upload.status === 'success' 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-red-100 text-red-700 border-red-200'
                } border text-xs`}>
                  {upload.status === 'success' ? 'Success' : 'Failed'}
                </Badge>
                {upload.status === 'success' && (
                  <p className="text-xs text-slate-500 mt-1">
                    {upload.tradesCount} trades
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
