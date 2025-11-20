import { useState } from 'react';
import { QrCode, Copy, Download, Send, Mail, MessageSquare, TrendingUp, Users, Smartphone, ExternalLink, Eye } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './ui/sonner';

export function PatientOnboarding() {
  const [customMessage, setCustomMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const appDownloadUrl = 'https://healthconnect.app/download';
  const smsTemplate = `Hi! Download the HealthConnect app to securely message your care team, get 24/7 AI assistance, and manage your appointments. ${appDownloadUrl}`;
  const emailSubject = 'Download the HealthConnect Patient App';
  const emailBody = `Dear Patient,

We're excited to introduce HealthConnect, our new patient app that makes it easier than ever to stay connected with your healthcare team.

With HealthConnect, you can:
• Securely message your care team
• Get 24/7 assistance from our AI assistant
• Request appointments and get reminders
• Share photos and documents securely

Download the app today:
${appDownloadUrl}

Questions? Contact us at support@healthconnect.app

Best regards,
Your Healthcare Team`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appDownloadUrl);
    toast.success('Download link copied to clipboard!');
  };

  const handleCopySMS = () => {
    navigator.clipboard.writeText(smsTemplate);
    toast.success('SMS template copied to clipboard!');
  };

  const handleCopyEmail = () => {
    const fullEmail = `Subject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullEmail);
    toast.success('Email template copied to clipboard!');
  };

  const handleDownloadQR = () => {
    toast.success('QR code downloaded as PNG!');
  };

  const handleSendTestSMS = () => {
    toast.success('Test SMS sent to your phone!');
  };

  const handleSendTestEmail = () => {
    toast.success('Test email sent to your inbox!');
  };

  // Mock analytics data
  const stats = [
    { label: 'Total Downloads', value: '1,247', change: '+18%', icon: Smartphone, color: 'text-blue-600' },
    { label: 'Active Users', value: '892', change: '+12%', icon: Users, color: 'text-green-600' },
    { label: 'Registration Rate', value: '71%', change: '+5%', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'QR Scans', value: '342', change: '+24%', icon: QrCode, color: 'text-orange-600' },
  ];

  const recentActivity = [
    { patient: 'Sarah M.', action: 'Downloaded app', time: '2 min ago', method: 'QR Code' },
    { patient: 'John D.', action: 'Registered account', time: '15 min ago', method: 'SMS Link' },
    { patient: 'Emily R.', action: 'Downloaded app', time: '1 hour ago', method: 'Email Link' },
    { patient: 'Michael K.', action: 'Registered account', time: '2 hours ago', method: 'QR Code' },
    { patient: 'Lisa T.', action: 'Downloaded app', time: '3 hours ago', method: 'SMS Link' },
  ];

  return (
    <>
      <Toaster />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
            Patient Onboarding
          </h2>
          <p className="text-gray-600">
            Manage patient app downloads, share resources, and track engagement
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4 border-gray-300">
                <div className="flex items-start justify-between mb-3">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <Badge variant="secondary" className="text-xs text-green-600 bg-green-50 border-green-200">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 mb-1">{stat.label}</div>
                <div className="text-2xl" style={{ fontWeight: 600 }}>
                  {stat.value}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - QR Code & Links */}
          <div className="col-span-2 space-y-6">
            <Tabs defaultValue="qr-code" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="qr-code">QR Code</TabsTrigger>
                <TabsTrigger value="sms">SMS Template</TabsTrigger>
                <TabsTrigger value="email">Email Template</TabsTrigger>
              </TabsList>

              {/* QR Code Tab */}
              <TabsContent value="qr-code" className="space-y-4">
                <Card className="p-6 border-gray-300">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>
                        App Download QR Code
                      </h3>
                      <p className="text-sm text-gray-600">
                        Share this QR code for patients to download the app
                      </p>
                    </div>

                    {/* QR Code Display */}
                    <div className="flex justify-center py-6">
                      <div className="bg-white p-6 rounded-xl border-2 border-gray-300 shadow-sm">
                        <div className="w-48 h-48 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg flex items-center justify-center border border-teal-200">
                          <QrCode className="w-32 h-32 text-teal-600" />
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-xs text-gray-600">Scan to download</p>
                          <p className="text-xs font-mono text-teal-600">HealthConnect App</p>
                        </div>
                      </div>
                    </div>

                    {/* Download Link */}
                    <div className="space-y-2">
                      <Label>Download Link</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={appDownloadUrl} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={handleCopyLink}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1"
                        onClick={handleDownloadQR}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download QR Code
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleCopyLink}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>

                    {/* Usage Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm mb-2" style={{ fontWeight: 500 }}>
                        💡 Usage Tips
                      </h4>
                      <ul className="text-xs text-gray-700 space-y-1">
                        <li>• Print QR codes for waiting room posters</li>
                        <li>• Include in appointment reminder cards</li>
                        <li>• Display at check-in/check-out desks</li>
                        <li>• Add to practice website and patient portal</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* SMS Template Tab */}
              <TabsContent value="sms" className="space-y-4">
                <Card className="p-6 border-gray-300">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>
                        SMS Template
                      </h3>
                      <p className="text-sm text-gray-600">
                        Send this message to patients via text
                      </p>
                    </div>

                    {/* SMS Preview */}
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                      <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm max-w-xs">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {smsTemplate}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 text-right">
                          160 characters
                        </p>
                      </div>
                    </div>

                    {/* Custom Message */}
                    <div className="space-y-2">
                      <Label>Customize Message (Optional)</Label>
                      <Textarea 
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Add a personalized message..."
                        className="resize-none h-24"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1"
                        onClick={handleSendTestSMS}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Test SMS
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleCopySMS}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Template
                      </Button>
                    </div>

                    {/* Integration Note */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="text-sm mb-2" style={{ fontWeight: 500 }}>
                        📱 SMS Integration
                      </h4>
                      <p className="text-xs text-gray-700">
                        Connect your SMS provider (Twilio, MessageBird, etc.) in Settings to send messages directly from the platform.
                      </p>
                      <Button size="sm" variant="link" className="text-xs p-0 h-auto mt-2">
                        Configure SMS Integration
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Email Template Tab */}
              <TabsContent value="email" className="space-y-4">
                <Card className="p-6 border-gray-300">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>
                        Email Template
                      </h3>
                      <p className="text-sm text-gray-600">
                        Send this email to patients
                      </p>
                    </div>

                    {/* Email Subject */}
                    <div className="space-y-2">
                      <Label>Subject Line</Label>
                      <Input 
                        value={emailSubject} 
                        readOnly 
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Email Body Preview */}
                    <div className="space-y-2">
                      <Label>Email Body</Label>
                      <div className="bg-white border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                            {emailBody}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1"
                        onClick={handleSendTestEmail}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Test Email
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleCopyEmail}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Template
                      </Button>
                    </div>

                    {/* Integration Note */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="text-sm mb-2" style={{ fontWeight: 500 }}>
                        ✉️ Email Integration
                      </h4>
                      <p className="text-xs text-gray-700">
                        Connect your email provider (SendGrid, Mailgun, etc.) in Settings to send emails directly from the platform.
                      </p>
                      <Button size="sm" variant="link" className="text-xs p-0 h-auto mt-2">
                        Configure Email Integration
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="space-y-6">
            <Card className="border-gray-300">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-base" style={{ fontWeight: 500 }}>
                  Recent Activity
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ fontWeight: 500 }}>
                          {activity.patient}
                        </p>
                        <p className="text-xs text-gray-600">
                          {activity.action}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs bg-gray-100">
                            {activity.method}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <Button variant="outline" className="w-full" size="sm">
                  View All Activity
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4 border-gray-300">
              <h3 className="text-base mb-4" style={{ fontWeight: 500 }}>
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Marketing Kit
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Bulk SMS Campaign
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Bulk Email Campaign
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Full Analytics
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}