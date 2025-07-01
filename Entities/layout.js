import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Users, 
  Upload,
  Settings,
  AlertTriangle,
  PieChart
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Market Overview",
    url: createPageUrl("Dashboard"),
    icon: BarChart3,
  },
  {
    title: "Stock Predictions",
    url: createPageUrl("Predictions"),
    icon: TrendingUp,
  },
  {
    title: "Broker Intelligence", 
    url: createPageUrl("BrokerAnalysis"),
    icon: Users,
  },
  {
    title: "Portfolio Analytics",
    url: createPageUrl("Portfolio"),
    icon: PieChart,
  },
  {
    title: "Data Upload",
    url: createPageUrl("DataUpload"),
    icon: Upload,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --nepse-primary: #1e40af;
            --nepse-secondary: #3b82f6;
            --nepse-accent: #06b6d4;
            --nepse-success: #10b981;
            --nepse-warning: #f59e0b;
            --nepse-danger: #ef4444;
            --nepse-dark: #1f2937;
            --nepse-light: #f8fafc;
            --nepse-gray: #64748b;
          }
          
          .nepse-gradient {
            background: linear-gradient(135deg, var(--nepse-primary) 0%, var(--nepse-secondary) 100%);
          }
          
          .nepse-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(59, 130, 246, 0.1);
          }
          
          .nepse-text-primary { color: var(--nepse-primary); }
          .nepse-text-success { color: var(--nepse-success); }
          .nepse-text-danger { color: var(--nepse-danger); }
          
          .buy-signal { 
            color: var(--nepse-success); 
            background: rgba(16, 185, 129, 0.1);
          }
          .sell-signal { 
            color: var(--nepse-danger); 
            background: rgba(239, 68, 68, 0.1);
          }
          .hold-signal { 
            color: var(--nepse-warning); 
            background: rgba(245, 158, 11, 0.1);
          }
        `}
      </style>
      
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar className="border-r border-blue-100 bg-white/80 backdrop-blur-lg">
          <SidebarHeader className="border-b border-blue-100 p-6">
            <div className="flex items-center gap-3">
              <div className="nepse-gradient w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">NEPSE Analytics</h2>
                <p className="text-xs text-slate-500 font-medium">Stock Market Intelligence</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Trading Platform
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl font-medium ${
                          location.pathname === item.url 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                            : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Market Status
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Market Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      OPEN
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">NEPSE Index</span>
                    <span className="font-semibold text-green-600">+2.1%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Live Updates</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-blue-100 p-4">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">NEPSE Trader</p>
                <p className="text-xs text-slate-500 truncate">Active Trading Session</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-lg border-b border-blue-100 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900">NEPSE Analytics</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
