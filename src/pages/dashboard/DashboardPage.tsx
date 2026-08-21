import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal 
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUser, useFeatureFlag } from '@/hooks/redux';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
}

function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {trend === 'up' ? (
            <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
          ) : (
            <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
          )}
          <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {change}
          </span>
          <span className="ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

const recentActivity: RecentActivityItem[] = [
  { id: '1', user: 'John Doe', action: 'Created new project', time: '2 minutes ago', status: 'success' },
  { id: '2', user: 'Jane Smith', action: 'Updated user profile', time: '5 minutes ago', status: 'success' },
  { id: '3', user: 'Bob Johnson', action: 'Failed login attempt', time: '10 minutes ago', status: 'error' },
  { id: '4', user: 'Alice Brown', action: 'Exported data', time: '15 minutes ago', status: 'warning' },
  { id: '5', user: 'Charlie Wilson', action: 'Deleted old records', time: '1 hour ago', status: 'success' },
];

function RecentActivityList() {
  const statusColors = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions from your team</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View all</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuItem>Filter</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.user}</p>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-muted-foreground">{item.action}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const advancedAnalytics = useFeatureFlag('advancedAnalytics');

  const metrics = [
    {
      title: t('dashboard.totalUsers'),
      value: '2,350',
      change: '+20.1%',
      trend: 'up' as const,
      icon: Users,
    },
    {
      title: t('dashboard.activeUsers'),
      value: '1,234',
      change: '+180.1%',
      trend: 'up' as const,
      icon: Activity,
    },
    {
      title: t('dashboard.revenue'),
      value: '$45,231.89',
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      title: t('dashboard.growth'),
      value: '+573',
      change: '+7.2%',
      trend: 'up' as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t('dashboard.welcome')}
        </h2>
        <p className="text-muted-foreground">
          {user?.name && `Welcome back, ${user.name}! `}
          Here's what's happening with your application today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart Area - Feature Gated */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Revenue and user growth over time</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {advancedAnalytics ? (
              <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Advanced Analytics Chart
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chart component would be rendered here
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Advanced Analytics Disabled
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enable in feature flags to see charts
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="col-span-3">
          <RecentActivityList />
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Add User
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              View Reports
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              Manage Billing
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Activity className="h-6 w-6 mb-2" />
              System Health
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}