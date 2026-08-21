import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Eye, 
  MousePointer, 
  Globe, 
  Smartphone, 
  Monitor,
  RefreshCw,
  Play,
  Pause,
  Wifi,
  WifiOff
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RealtimeMetric {
  label: string;
  value: number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface ActiveUser {
  id: string;
  location: string;
  page: string;
  duration: string;
  device: 'desktop' | 'mobile' | 'tablet';
}

interface PageView {
  page: string;
  views: number;
  uniqueViews: number;
}

export function RealtimePage() {
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time data updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const realtimeMetrics: RealtimeMetric[] = [
    {
      label: 'Active Users',
      value: 1247,
      change: 12,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Page Views',
      value: 8934,
      change: 156,
      icon: Eye,
      color: 'text-green-600',
    },
    {
      label: 'Events/Min',
      value: 2341,
      change: -23,
      icon: Activity,
      color: 'text-purple-600',
    },
    {
      label: 'Active Sessions',
      value: 456,
      change: 8,
      icon: MousePointer,
      color: 'text-orange-600',
    },
  ];

  const activeUsers: ActiveUser[] = [
    { id: '1', location: 'New York, US', page: '/dashboard', duration: '2m 30s', device: 'desktop' },
    { id: '2', location: 'London, UK', page: '/analytics', duration: '1m 45s', device: 'mobile' },
    { id: '3', location: 'Tokyo, JP', page: '/users', duration: '4m 12s', device: 'desktop' },
    { id: '4', location: 'Sydney, AU', page: '/settings', duration: '30s', device: 'tablet' },
    { id: '5', location: 'Berlin, DE', page: '/reports', duration: '3m 20s', device: 'desktop' },
    { id: '6', location: 'São Paulo, BR', page: '/dashboard', duration: '1m 15s', device: 'mobile' },
  ];

  const topPages: PageView[] = [
    { page: '/dashboard', views: 234, uniqueViews: 187 },
    { page: '/analytics', views: 156, uniqueViews: 134 },
    { page: '/users', views: 98, uniqueViews: 89 },
    { page: '/reports', views: 76, uniqueViews: 65 },
    { page: '/settings', views: 54, uniqueViews: 48 },
  ];

  const deviceBreakdown = [
    { device: 'Desktop', count: 456, percentage: 65 },
    { device: 'Mobile', count: 198, percentage: 28 },
    { device: 'Tablet', count: 49, percentage: 7 },
  ];

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return Monitor;
      case 'mobile': return Smartphone;
      case 'tablet': return Monitor;
      default: return Monitor;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-time Analytics</h1>
          <p className="text-muted-foreground">
            Monitor live user activity and system performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isLive ? "default" : "secondary"} className="flex items-center">
            {isLive ? (
              <Wifi className="w-3 h-3 mr-1" />
            ) : (
              <WifiOff className="w-3 h-3 mr-1" />
            )}
            {isLive ? 'Live' : 'Paused'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? (
              <Pause className="w-4 h-4 mr-1" />
            ) : (
              <Play className="w-4 h-4 mr-1" />
            )}
            {isLive ? 'Pause' : 'Resume'}
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Update Info */}
      <div className="text-sm text-muted-foreground">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>

      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {realtimeMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                <p className={`text-xs ${
                  metric.change > 0 ? 'text-green-600' : 
                  metric.change < 0 ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change} in last minute
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Users */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Active Users Right Now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              {activeUsers.map((user) => {
                const DeviceIcon = getDeviceIcon(user.device);
                return (
                  <div key={user.id} className="flex items-center space-x-3 py-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{user.page}</div>
                      <div className="text-xs text-muted-foreground">{user.location}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{user.duration}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Top Pages (Last 30 mins)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPages.map((page) => (
              <div key={page.page} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{page.page}</span>
                  <span className="text-sm text-muted-foreground">{page.views} views</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{page.uniqueViews} unique</span>
                  <span>{Math.round((page.views / 500) * 100)}% of total</span>
                </div>
                <Progress value={(page.views / 500) * 100} className="h-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Device Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Device Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {deviceBreakdown.map((item) => (
              <div key={item.device} className="text-center space-y-2">
                <div className="text-2xl font-bold">{item.count}</div>
                <div className="text-sm text-muted-foreground">{item.device}</div>
                <Progress value={item.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">{item.percentage}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Server Load</span>
                <span className="text-sm font-medium">23%</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm font-medium">67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Database Connections</span>
                <span className="text-sm font-medium">12/100</span>
              </div>
              <Progress value={12} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Response Time</span>
                <span className="text-sm font-medium">142ms</span>
              </div>
              <div className="text-xs text-green-600">Excellent</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}