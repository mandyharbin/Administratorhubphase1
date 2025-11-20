import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Eye, Clock, Globe, GitCompare } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function DisclaimersConsent() {
  const [disclaimers, setDisclaimers] = useState([
    { 
      id: '1', 
      name: 'Pre-Chat Disclaimer', 
      version: '1.2', 
      language: 'EN', 
      status: 'Active', 
      effectiveDate: '2024-01-15',
      channels: ['Web', 'SMS']
    },
    { 
      id: '2', 
      name: 'SMS Consent', 
      version: '1.0', 
      language: 'EN', 
      status: 'Active', 
      effectiveDate: '2024-01-01',
      channels: ['SMS']
    },
    { 
      id: '3', 
      name: 'Pre-Chat Disclaimer', 
      version: '1.0', 
      language: 'ES', 
      status: 'Active', 
      effectiveDate: '2024-02-01',
      channels: ['Web', 'SMS']
    },
  ]);

  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState({ from: 'v1.1', to: 'v1.2' });

  // Sample version content for diff comparison
  const versionContent = {
    'v1.0': `Welcome to our patient app messaging service. By using this service, you acknowledge that:

• This is not for medical emergencies. Call 911 for emergencies.
• Messages are reviewed during business hours (Mon-Fri, 8am-5pm).
• Response time may vary.
• This platform is secure but not instantaneous.`,
    'v1.1': `Welcome to our patient app messaging service. By using this service, you acknowledge that:

• This is not for medical emergencies. Call 911 for emergencies.
• Messages are reviewed during business hours (Mon-Fri, 8am-5pm).
• Response time may vary up to 24 hours.
• This platform is secure but not instantaneous.
• Messages are encrypted and HIPAA compliant.`,
    'v1.2': `Welcome to our patient app messaging service. By using this service, you acknowledge that:

• This is NOT for medical emergencies. Call 911 for emergencies.
• Messages are reviewed during business hours (Mon-Fri, 8am-6pm).
• Response time may vary up to 48 hours.
• This platform is secure but not instantaneous.
• Messages are encrypted and HIPAA compliant.
• Standard messaging rates may apply for SMS.`
  };

  const generateDiff = (oldText: string, newText: string) => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const maxLines = Math.max(oldLines.length, newLines.length);
    
    return Array.from({ length: maxLines }, (_, i) => ({
      old: oldLines[i] || '',
      new: newLines[i] || '',
      type: oldLines[i] === newLines[i] ? 'unchanged' : 
            oldLines[i] && !newLines[i] ? 'removed' :
            !oldLines[i] && newLines[i] ? 'added' : 'modified'
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Disclaimers & Consent</h2>
        <p className="text-gray-600 mt-1">Manage versioned disclaimers and patient consent requirements</p>
      </div>

      <Tabs defaultValue="disclaimers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="disclaimers">Disclaimers</TabsTrigger>
          <TabsTrigger value="links">Legal Links</TabsTrigger>
        </TabsList>

        <TabsContent value="disclaimers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Disclaimer Versions</CardTitle>
              <CardDescription>Multi-language disclaimers with version control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Disclaimer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Create New Disclaimer</DialogTitle>
                      <DialogDescription>Add a new versioned disclaimer for patient consent</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="disclaimer-name">Disclaimer Name</Label>
                          <Input id="disclaimer-name" placeholder="e.g., Pre-Chat Disclaimer" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="disclaimer-language">Language</Label>
                          <Select>
                            <SelectTrigger id="disclaimer-language">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English (EN)</SelectItem>
                              <SelectItem value="es">Spanish (ES)</SelectItem>
                              <SelectItem value="zh">Chinese (ZH)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="disclaimer-content">Content (Markdown Supported)</Label>
                        <Textarea 
                          id="disclaimer-content" 
                          rows={10}
                          placeholder="Enter disclaimer text. You can use markdown formatting..."
                          defaultValue={`**Important Information About Our AI Receptionist**

This messaging service uses an AI assistant to help answer your questions. Please note:

- The AI **cannot** schedule, reschedule, or cancel appointments
- You can ask about appointment information
- If the AI cannot answer your question, your message will be routed to our staff
- This is **not for medical emergencies**. Call 911 or go to the nearest ER for emergencies

**Privacy & Security:**
- All messages are encrypted and HIPAA-compliant
- Do not share sensitive personal information unless verified

By clicking "I Agree," you consent to communicate via this secure messaging platform.`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="effective-date">Effective Date</Label>
                        <Input id="effective-date" type="date" />
                      </div>

                      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                        <Switch defaultChecked id="require-ack" />
                        <Label htmlFor="require-ack" className="cursor-pointer">
                          Require patient acknowledgment (checkbox) before proceeding
                        </Label>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1">Save as Draft</Button>
                        <Button className="flex-1">Publish</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>View and restore previous versions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge>v1.2</Badge>
                    <div>
                      <div className="text-sm">Pre-Chat Disclaimer (EN)</div>
                      <div className="text-xs text-gray-500">Updated 2024-01-15 by Mike Chen</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedVersions({ from: 'v1.1', to: 'v1.2' });
                      setDiffModalOpen(true);
                    }}>View Diff</Button>
                    <Button variant="ghost" size="sm">Restore</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">v1.1</Badge>
                    <div>
                      <div className="text-sm">Pre-Chat Disclaimer (EN)</div>
                      <div className="text-xs text-gray-500">Updated 2024-01-10 by Mike Chen</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedVersions({ from: 'v1.0', to: 'v1.1' });
                      setDiffModalOpen(true);
                    }}>View Diff</Button>
                    <Button variant="ghost" size="sm">Restore</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">v1.0</Badge>
                    <div>
                      <div className="text-sm">Pre-Chat Disclaimer (EN)</div>
                      <div className="text-xs text-gray-500">Created 2024-01-01 by Sarah Johnson</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Diff</Button>
                    <Button variant="ghost" size="sm">Restore</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Legal Links & References</CardTitle>
              <CardDescription>Configure links to privacy policies and legal documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="privacy-url">Privacy Notice URL</Label>
                <Input 
                  id="privacy-url" 
                  placeholder="https://example.com/privacy"
                  defaultValue="https://healthcarepartners.com/privacy"
                />
                <p className="text-xs text-gray-500">Displayed to patients in disclaimers and footers</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tos-url">Terms of Service URL</Label>
                <Input 
                  id="tos-url" 
                  placeholder="https://example.com/terms"
                  defaultValue="https://healthcarepartners.com/terms"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baa-url">BAA Summary URL (Optional)</Label>
                <Input 
                  id="baa-url" 
                  placeholder="https://example.com/baa"
                />
                <p className="text-xs text-gray-500">Business Associate Agreement summary for patients</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hipaa-url">HIPAA Notice URL</Label>
                <Input 
                  id="hipaa-url" 
                  placeholder="https://example.com/hipaa"
                  defaultValue="https://healthcarepartners.com/hipaa-notice"
                />
              </div>

              <div className="pt-4">
                <Button>Save Links</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diff Modal */}
      <Dialog open={diffModalOpen} onOpenChange={setDiffModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Version Difference</DialogTitle>
            <DialogDescription>Compare changes between versions {selectedVersions.from} and {selectedVersions.to}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Old Version ({selectedVersions.from})</TableHead>
                  <TableHead>New Version ({selectedVersions.to})</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generateDiff(versionContent[selectedVersions.from], versionContent[selectedVersions.to]).map((line, index) => (
                  <TableRow key={index} className={line.type === 'unchanged' ? '' : line.type === 'removed' ? 'bg-red-50' : line.type === 'added' ? 'bg-green-50' : 'bg-yellow-50'}>
                    <TableCell className="whitespace-pre-wrap">{line.old}</TableCell>
                    <TableCell className="whitespace-pre-wrap">{line.new}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}