import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Search, Filter, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function AuditLogs() {
  const auditLogs = [
    { id: '1', timestamp: '2024-03-15 14:32:15', user: 'Mike Chen', action: 'Updated routing threshold', resource: 'Routing Policies', ip: '192.168.1.45' },
    { id: '2', timestamp: '2024-03-15 13:15:22', user: 'Sarah Johnson', action: 'Published disclaimer v1.2', resource: 'Disclaimers', ip: '192.168.1.32' },
    { id: '3', timestamp: '2024-03-15 11:45:08', user: 'Mike Chen', action: 'Added user: Emily Rodriguez', resource: 'Users & Roles', ip: '192.168.1.45' },
    { id: '4', timestamp: '2024-03-15 10:22:33', user: 'Mike Chen', action: 'Modified lexicon: Billing', resource: 'Detection Lexicons', ip: '192.168.1.45' },
    { id: '5', timestamp: '2024-03-15 09:18:47', user: 'Sarah Johnson', action: 'Updated knowledge source freshness', resource: 'Knowledge Sources', ip: '192.168.1.32' },
  ];

  const messageMetrics = [
    { date: '2024-03-15', total: 342, answered: 268, routed: 74, clinical: 28, scheduling: 31, billing: 12, general: 3 },
    { date: '2024-03-14', total: 298, answered: 234, routed: 64, clinical: 25, scheduling: 26, billing: 10, general: 3 },
    { date: '2024-03-13', total: 315, answered: 251, routed: 64, clinical: 22, scheduling: 29, billing: 11, general: 2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2>Audit Logs & Metrics</h2>
        <p className="text-gray-600 mt-1">System activity logs and conversation metrics</p>
      </div>

      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="metrics">Message Metrics</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Trail</CardTitle>
              <CardDescription>Track all configuration changes and administrative actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search audit logs..." className="pl-10" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="publish">Publish</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{log.timestamp}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell className="text-sm">{log.action}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.resource}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{log.ip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">955</div>
                <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Answered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">753</div>
                <p className="text-xs text-gray-500 mt-1">78.8% success rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Routed to Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">202</div>
                <p className="text-xs text-gray-500 mt-1">21.2% escalation</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">2.3s</div>
                <p className="text-xs text-gray-500 mt-1">AI responses</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Message Volume & Routing</CardTitle>
              <CardDescription>Daily breakdown by routing destination</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>AI Answered</TableHead>
                    <TableHead>Routed</TableHead>
                    <TableHead>Clinical</TableHead>
                    <TableHead>Scheduling</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>General</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messageMetrics.map((metric) => (
                    <TableRow key={metric.date}>
                      <TableCell className="text-sm">{metric.date}</TableCell>
                      <TableCell>{metric.total}</TableCell>
                      <TableCell className="text-green-600">{metric.answered}</TableCell>
                      <TableCell className="text-blue-600">{metric.routed}</TableCell>
                      <TableCell className="text-sm">{metric.clinical}</TableCell>
                      <TableCell className="text-sm">{metric.scheduling}</TableCell>
                      <TableCell className="text-sm">{metric.billing}</TableCell>
                      <TableCell className="text-sm">{metric.general}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Detection Phrases</CardTitle>
              <CardDescription>Most frequently matched lexicon terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-800">Scheduling</Badge>
                    <span className="text-sm">appointment</span>
                  </div>
                  <span className="text-sm text-gray-600">147 matches</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-800">Billing</Badge>
                    <span className="text-sm">bill</span>
                  </div>
                  <span className="text-sm text-gray-600">89 matches</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-100 text-red-800">Clinical</Badge>
                    <span className="text-sm">prescription</span>
                  </div>
                  <span className="text-sm text-gray-600">76 matches</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-800">Scheduling</Badge>
                    <span className="text-sm">reschedule</span>
                  </div>
                  <span className="text-sm text-gray-600">68 matches</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-800">Billing</Badge>
                    <span className="text-sm">insurance</span>
                  </div>
                  <span className="text-sm text-gray-600">54 matches</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Retention Policy</CardTitle>
              <CardDescription>Configure how long data is stored in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm">Conversation Logs</div>
                    <div className="text-xs text-gray-500">Patient message history and AI responses</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="7" className="w-20" />
                    <Select defaultValue="years">
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm">Audit Logs</div>
                    <div className="text-xs text-gray-500">System configuration changes</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="10" className="w-20" />
                    <Select defaultValue="years">
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm">Analytics & Metrics</div>
                    <div className="text-xs text-gray-500">Aggregated performance data</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="3" className="w-20" />
                    <Select defaultValue="years">
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm">Deleted User Data</div>
                    <div className="text-xs text-gray-500">Soft-deleted records retention</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="90" className="w-20" />
                    <Select defaultValue="days">
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm mb-4">Automated Data Purging</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Data older than the retention period will be automatically and permanently deleted. This action cannot be undone.
                </p>
                <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <span>⚠️</span>
                  <span>Ensure retention periods comply with HIPAA and state regulations (typically 6-7 years minimum for medical records)</span>
                </div>
              </div>

              <div className="pt-4">
                <Button>Save Retention Policy</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}