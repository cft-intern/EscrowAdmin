import React from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Zap, 
  Key, 
  CreditCard,
  Globe,
  Palette,
  Database,
  Lock,
  Mail
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/redux';

export function SettingsPage() {
  const user = useCurrentUser();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 lg:w-[600px]">
          <TabsTrigger value="general" className="flex items-center">
            <Settings className="w-4 h-4 mr-1" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="w-4 h-4 mr-1" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center">
            <Zap className="w-4 h-4 mr-1" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center">
            <Key className="w-4 h-4 mr-1" />
            API
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-1" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={user?.email} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself..." />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time</SelectItem>
                      <SelectItem value="pst">Pacific Time</SelectItem>
                      <SelectItem value="gmt">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark theme</p>
                </div>
                <Switch />
              </div>
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Password & Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable 2FA</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Backup Codes</h4>
                <p className="text-sm text-muted-foreground">
                  Generate backup codes that can be used if you lose access to your authenticator app
                </p>
                <Button variant="outline">Generate Backup Codes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { device: 'Chrome on Windows', location: 'New York, US', current: true },
                  { device: 'Safari on iPhone', location: 'San Francisco, US', current: false },
                  { device: 'Firefox on Linux', location: 'London, UK', current: false },
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{session.device}</div>
                      <div className="text-sm text-muted-foreground">{session.location}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.current && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Current</span>
                      )}
                      {!session.current && (
                        <Button variant="outline" size="sm">Revoke</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="destructive">Revoke All Other Sessions</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Security alerts', description: 'Get notified about security events' },
                { label: 'Product updates', description: 'Receive updates about new features' },
                { label: 'Marketing emails', description: 'Promotional content and offers' },
                { label: 'Weekly reports', description: 'Weekly summary of your activity' },
              ].map((notification) => (
                <div key={notification.label} className="flex items-center justify-between">
                  <div>
                    <Label>{notification.label}</Label>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Real-time alerts', description: 'Immediate notifications for critical events' },
                { label: 'Daily summaries', description: 'Daily digest of your activity' },
                { label: 'Team mentions', description: 'When someone mentions you in a comment' },
              ].map((notification) => (
                <div key={notification.label} className="flex items-center justify-between">
                  <div>
                    <Label>{notification.label}</Label>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Connected Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Google Analytics', description: 'Track website analytics', connected: true },
                { name: 'Slack', description: 'Send notifications to Slack channels', connected: false },
                { name: 'GitHub', description: 'Import repositories and sync code', connected: true },
                { name: 'Stripe', description: 'Process payments and manage billing', connected: false },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">{service.description}</div>
                  </div>
                  <Button variant={service.connected ? "destructive" : "default"}>
                    {service.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                API Keys
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use API keys to authenticate requests to our API. Keep your keys secure and don't share them.
              </p>
              <div className="space-y-3">
                {[
                  { name: 'Production API Key', lastUsed: '2 hours ago', created: 'Jan 15, 2024' },
                  { name: 'Development API Key', lastUsed: '1 day ago', created: 'Jan 10, 2024' },
                ].map((key, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{key.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Last used: {key.lastUsed} • Created: {key.created}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Regenerate</Button>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button>Create New API Key</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure webhooks to receive real-time notifications about events in your account.
              </p>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input id="webhook-url" placeholder="https://your-app.com/webhooks" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-events">Events</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select events to subscribe to" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user.created">User Created</SelectItem>
                    <SelectItem value="user.updated">User Updated</SelectItem>
                    <SelectItem value="order.completed">Order Completed</SelectItem>
                    <SelectItem value="payment.failed">Payment Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Add Webhook</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Pro Plan</h3>
                    <p className="text-sm text-muted-foreground">$29/month • Next billing: Feb 15, 2024</p>
                  </div>
                  <Button variant="outline" size="sm">Change Plan</Button>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Payment Method</h4>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                      VISA
                    </div>
                    <div>
                      <div className="font-medium">•••• •••• •••• 4242</div>
                      <div className="text-sm text-muted-foreground">Expires 12/2025</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: 'Jan 15, 2024', amount: '$29.00', status: 'Paid' },
                  { date: 'Dec 15, 2023', amount: '$29.00', status: 'Paid' },
                  { date: 'Nov 15, 2023', amount: '$29.00', status: 'Paid' },
                ].map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{invoice.date}</div>
                      <div className="text-sm text-muted-foreground">{invoice.amount}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {invoice.status}
                      </span>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}