import React, { useState, useEffect } from "react";
import { BrokerActivity, StockData } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Shield,
  Eye,
  BarChart3
} from "lucide-react";

import BrokerActivityTable from "../components/broker/BrokerActivityTable";
import AccumulationAlerts from "../components/broker/AccumulationAlerts";
import BrokerPerformance from "../components/broker/BrokerPerformance";
import MarketConcentration from "../components/broker/MarketConcentration";

export default function BrokerAnalysis() {
  const [brokerData, setBrokerData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7");
  const [selectedBroker, setSelectedBroker] = useState("ALL");

  useEffect(() => {
    loadBrokerData();
  }, []);

  const loadBrokerData = async () => {
    setIsLoading(true);
    try {
      const [brokerActivity, marketData] = await Promise.all([
        BrokerActivity.list("-date", 200),
        StockData.list("-date", 100)
      ]);
      setBrokerData(brokerActivity);
      setStockData(marketData);
    } catch (error) {
      console.error("Error loading broker data:", error);
    }
    setIsLoading(false);
  };

  const filteredBrokerData = brokerData.filter(activity => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(selectedTimeframe));
    const activityDate = new Date(activity.date);
    
    const matchesTimeframe = activityDate >= daysAgo;
    const matchesBroker = selectedBroker === "ALL" || activity.broker_code === selectedBroker;
    
    return matchesTimeframe && matchesBroker;
  });

  const getBrokerStats = () => {
    const totalBrokers = new Set(filteredBrokerData.map(b => b.broker_code)).size;
    const accumulatingBrokers = filteredBrokerData.filter(b => b.activity_type === 'ACCUMULATING').length;
    const distributingBrokers = filteredBrokerData.filter(b => b.activity_type === 'DISTRIBUTING').length;
    const highAlerts = filteredBrokerData.filter(b => b.alert_level === 'HIGH' || b.alert_level === 'CRITICAL').length;
    
    return { totalBrokers, accumulatingBrokers, distributingBrokers, highAlerts };
  };

  const stats = getBrokerStats();
  const uniqueBrokers = [...new Set(brokerData.map(b => b.broker_code))];

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Broker Intelligence</h1>
            <p className="text-slate-600">Advanced broker behavior analysis and market surveillance</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedBroker} onValueChange={setSelectedBroker}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Brokers</SelectItem>
                {uniqueBrokers.map(broker => (
                  <SelectItem key={broker} value={broker}>{broker}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Broker Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Brokers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalBrokers}</div>
              <p className="text-xs text-slate-500 mt-1">Unique brokers tracked</p>
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Accumulating</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.accumulatingBrokers}</div>
              <p className="text-xs text-slate-500 mt-1">Net buyers</p>
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Distributing</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.distributingBrokers}</div>
              <p className="text-xs text-slate-500 mt-1">Net sellers</p>
            </CardContent>
          </Card>

          <Card className="nepse-card border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">High Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.highAlerts}</div>
              <p className="text-xs text-slate-500 mt-1">Suspicious activities</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <BrokerActivityTable 
              brokerData={filteredBrokerData} 
              isLoading={isLoading}
            />
          </div>

          <div className="space-y-8">
            <AccumulationAlerts 
              brokerData={filteredBrokerData} 
              isLoading={isLoading}
            />
            <MarketConcentration 
              brokerData={filteredBrokerData} 
              isLoading={isLoading}
            />
          </div>
        </div>

        <BrokerPerformance 
          brokerData={filteredBrokerData} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
