import React, { useState } from 'react';
import { 
  Download, 
  Filter, 
  Calendar, 
  FileText, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Mail,
  Eye
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReportCardProps {
  title: string;
  description: string;
  lastGenerated: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'ready' | 'generating' | 'failed';
}

function ReportCard({ title, description, lastGenerated, icon: Icon, status }: ReportCardProps) {
  const statusConfig = {
    ready: { color: 'bg-green-100 text-green-800', text: 'Ready' },
    generating: { color: 'bg-yellow-100 text-yellow-800', text: 'Generating...' },
    failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <Badge className={statusConfig[status].color}>
          {statusConfig[status].text}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Last generated: {lastGenerated}
          </span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button size="sm">Generate</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportsPage() {
  const [dateRange, setDateRange] = useState('last30days');
  const [reportType, setReportType] = useState('all');

  const reports = [
    {
      title: 'User Activity Report',
      description: 'Comprehensive analysis of user behavior and engagement patterns',
      lastGenerated: '2 hours ago',
      icon: Users,
      status: 'ready' as const,
    },
    {
      title: 'Revenue Analytics',
      description: 'Financial performance metrics and revenue breakdowns',
      lastGenerated: '1 day ago',
      icon: DollarSign,
      status: 'ready' as const,
    },
    {
      title: 'Traffic Analysis',
      description: 'Website traffic patterns and source analysis',
      lastGenerated: '3 hours ago',
      icon: Eye,
      status: 'generating' as const,
    },
    {
      title: 'Conversion Funnel',
      description: 'User journey analysis and conversion optimization insights',
      lastGenerated: '5 hours ago',
      icon: TrendingUp,
      status: 'ready' as const,
    },
    {
      title: 'Email Campaign Performance',
      description: 'Email marketing metrics and campaign effectiveness',
      lastGenerated: '1 week ago',
      icon: Mail,
      status: 'failed' as const,
    },
    {
      title: 'E-commerce Analytics',
      description: 'Product performance and sales analytics',
      lastGenerated: '6 hours ago',
      icon: ShoppingCart,
      status: 'ready' as const,
    },
  ];

  const quickStats = [
    { label: 'Total Reports', value: '24' },
    { label: 'Generated Today', value: '6' },
    { label: 'Scheduled', value: '8' },
    { label: 'Failed', value: '2' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download comprehensive analytics reports
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Report
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Create Custom Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 days</SelectItem>
                  <SelectItem value="last30days">Last 30 days</SelectItem>
                  <SelectItem value="last90days">Last 90 days</SelectItem>
                  <SelectItem value="lastyear">Last year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="user">User Reports</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search Reports</Label>
              <Input
                id="search"
                placeholder="Search by name..."
                className="w-full"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {reports.map((report) => (
              <ReportCard key={report.title} {...report} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Scheduled Reports</h3>
                <p className="text-muted-foreground mb-4">
                  Schedule reports to run automatically at specified intervals
                </p>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Your First Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Custom Report Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Create custom reports with specific metrics and dimensions
                </p>
                <Button>
                  <PieChart className="mr-2 h-4 w-4" />
                  Build Custom Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Monthly Overview', description: 'Complete monthly performance summary' },
              { name: 'User Engagement', description: 'User activity and retention metrics' },
              { name: 'Sales Performance', description: 'Revenue and conversion analytics' },
              { name: 'Marketing ROI', description: 'Campaign effectiveness and ROI analysis' },
              { name: 'System Performance', description: 'Technical performance and uptime metrics' },
              { name: 'Customer Satisfaction', description: 'Support tickets and satisfaction scores' },
            ].map((template) => (
              <Card key={template.name} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}