import React from 'react';
import { Activity, Users, ShoppingCart, TrendingUp, Eye, Clock, DollarSign, Target } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

function MetricCard({ title, value, change, changeType, icon: Icon }: MetricCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-muted-foreground',
  }[changeType];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${changeColor}`}>
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
}

export function AnalyticsPage() {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Active Users',
      value: '2,350',
      change: '+180.1%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Page Views',
      value: '12,234',
      change: '+19%',
      changeType: 'positive' as const,
      icon: Eye,
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '-2.4%',
      changeType: 'negative' as const,
      icon: Target,
    },
  ];

  const topPages = [
    { path: '/dashboard', views: 1234, change: 12.5 },
    { path: '/products', views: 987, change: 8.2 },
    { path: '/analytics', views: 654, change: -3.1 },
    { path: '/users', views: 543, change: 15.7 },
    { path: '/settings', views: 432, change: 5.4 },
  ];

  const recentActivity = [
    { action: 'New user registration', time: '2 minutes ago', type: 'user' },
    { action: 'Order #1234 completed', time: '5 minutes ago', type: 'order' },
    { action: 'System backup completed', time: '10 minutes ago', type: 'system' },
    { action: 'New feature deployed', time: '15 minutes ago', type: 'system' },
    { action: 'User profile updated', time: '20 minutes ago', type: 'user' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
          <p className="text-muted-foreground">
            Monitor your application's performance and user engagement
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Charts and Data */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Main Chart Area */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-80 flex items-center justify-center bg-muted/10 rounded-md">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Chart visualization would go here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Integration with Chart.js, Recharts, or D3.js
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page, index) => (
                <div key={page.path} className="flex items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{page.path}</p>
                    <p className="text-sm text-muted-foreground">
                      {page.views.toLocaleString()} views
                    </p>
                  </div>
                  <Badge 
                    variant={page.change > 0 ? "default" : "secondary"}
                    className={page.change > 0 ? "bg-green-100 text-green-800" : ""}
                  >
                    {page.change > 0 ? '+' : ''}{page.change}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'user' ? 'bg-blue-500' :
                  activity.type === 'order' ? 'bg-green-500' :
                  'bg-gray-500'
                }`} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Load Time</span>
                <span className="text-sm font-medium">1.2s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Server Response Time</span>
                <span className="text-sm font-medium">145ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Error Rate</span>
                <span className="text-sm font-medium text-red-600">0.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Bounce Rate</span>
                <span className="text-sm font-medium">32.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Session Duration</span>
                <span className="text-sm font-medium">4m 32s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pages per Session</span>
                <span className="text-sm font-medium">3.2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Return Visitors</span>
                <span className="text-sm font-medium">68.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}