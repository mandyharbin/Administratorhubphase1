import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { MessageSquare, Bell, MessageCircle, Smartphone, Save, AlertCircle, Mail } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface NotificationChannel {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

interface NotificationSettings {
  enabled: boolean;
  channels: NotificationChannel;
  emailSubject: string;
  emailBody: string;
  smsTemplate: string;
  pushTemplate: string;
  deepLinkEnabled: boolean;
  delaySeconds: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export function StaffResponseNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    channels: {
      email: true,
      sms: true,
      push: true,
      inApp: true,
    },
    emailSubject: 'New message from {practiceName}',
    emailBody: 'Hi {patientName},\n\nYou have a new message from {staffName} at {practiceName}.\n\nClick the button below to view and respond:\n\n[View Message Button]\n\nOr copy and paste this link: {deepLink}\n\nThank you,\n{practiceName}',
    smsTemplate: 'You have a new message from {practiceName}. Tap to view: {deepLink}',
    pushTemplate: 'New message from {staffName}',
    deepLinkEnabled: true,
    delaySeconds: 5,
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    setSettings({ ...settings, ...updates });
    setHasUnsavedChanges(true);
  };

  const updateChannel = (channel: keyof NotificationChannel, value: boolean) => {
    setSettings({
      ...settings,
      channels: { ...settings.channels, [channel]: value },
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // Simulate save
    console.log('Saving settings:', settings);
    setHasUnsavedChanges(false);
    // In real implementation, this would call an API
  };

  const availableVariables = [
    { variable: '{patientName}', description: 'Patient first name' },
    { variable: '{staffName}', description: 'Staff member who responded' },
    { variable: '{practiceName}', description: 'Your practice name' },
    { variable: '{deepLink}', description: 'Link to open the specific message' },
    { variable: '{messagePreview}', description: 'First 50 characters of the message' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          <h1>Staff Response Notifications</h1>
        </div>
        <p className="text-gray-600">
          Configure how patients are notified when staff responds to their AI assistant messages
        </p>
      </div>

      {/* Save Alert */}
      {hasUnsavedChanges && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You have unsaved changes. Click "Save Changes" to apply your updates.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Enable and configure notifications when staff responds to patient messages
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm">Enable Notifications</Label>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => updateSettings({ enabled: checked })}
              />
            </div>
          </div>
        </CardHeader>

        {settings.enabled && (
          <CardContent className="space-y-6">
            {/* Notification Channels */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm mb-2">Notification Channels</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Select which channels to use for notifying patients
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {/* Email */}
                <Card className={`cursor-pointer transition-all ${settings.channels.email ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.channels.email ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Mail className={`w-5 h-5 ${settings.channels.email ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <Label className="text-sm">Email</Label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Send email with link
                        </p>
                      </div>
                      <Switch
                        checked={settings.channels.email}
                        onCheckedChange={(checked) => updateChannel('email', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* SMS */}
                <Card className={`cursor-pointer transition-all ${settings.channels.sms ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.channels.sms ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <MessageCircle className={`w-5 h-5 ${settings.channels.sms ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <Label className="text-sm">SMS Text</Label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Send text message
                        </p>
                      </div>
                      <Switch
                        checked={settings.channels.sms}
                        onCheckedChange={(checked) => updateChannel('sms', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Push Notification */}
                <Card className={`cursor-pointer transition-all ${settings.channels.push ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.channels.push ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Bell className={`w-5 h-5 ${settings.channels.push ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <Label className="text-sm">Push</Label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Mobile notification
                        </p>
                      </div>
                      <Switch
                        checked={settings.channels.push}
                        onCheckedChange={(checked) => updateChannel('push', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* In-App Badge */}
                <Card className={`cursor-pointer transition-all ${settings.channels.inApp ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.channels.inApp ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Smartphone className={`w-5 h-5 ${settings.channels.inApp ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <Label className="text-sm">In-App</Label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Unread badge
                        </p>
                      </div>
                      <Switch
                        checked={settings.channels.inApp}
                        onCheckedChange={(checked) => updateChannel('inApp', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Email Template */}
            {settings.channels.email && (
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <Label>Email Subject Template</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Customize the email subject line
                  </p>
                </div>
                <Input
                  value={settings.emailSubject}
                  onChange={(e) => updateSettings({ emailSubject: e.target.value })}
                  placeholder="New message from {practiceName}"
                  className="font-mono text-sm"
                />
                <div>
                  <Label>Email Body Template</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Customize the email body. Include {'{deepLink}'} to enable direct navigation.
                  </p>
                </div>
                <Textarea
                  value={settings.emailBody}
                  onChange={(e) => updateSettings({ emailBody: e.target.value })}
                  rows={5}
                  placeholder="Hi {patientName},\n\nYou have a new message from {staffName} at {practiceName}.\n\nClick the button below to view and respond:\n\n[View Message Button]\n\nOr copy and paste this link: {deepLink}\n\nThank you,\n{practiceName}"
                  className="font-mono text-sm"
                />
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-900">
                    <strong>Character count:</strong> {settings.emailBody.length} / 1600
                    {settings.emailBody.length > 1600 && (
                      <span className="text-amber-700 ml-2">(Will be sent as multiple messages)</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SMS Template */}
            {settings.channels.sms && (
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <Label>SMS Message Template</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Customize the text message patients receive. Include {'{deepLink}'} to enable direct navigation.
                  </p>
                </div>
                <Textarea
                  value={settings.smsTemplate}
                  onChange={(e) => updateSettings({ smsTemplate: e.target.value })}
                  rows={3}
                  placeholder="You have a new message from {practiceName}. Tap to view: {deepLink}"
                  className="font-mono text-sm"
                />
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-900">
                    <strong>Character count:</strong> {settings.smsTemplate.length} / 160
                    {settings.smsTemplate.length > 160 && (
                      <span className="text-amber-700 ml-2">(Will be sent as 2 messages)</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Push Notification Template */}
            {settings.channels.push && (
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <Label>Push Notification Template</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Customize the push notification title and body
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Title</Label>
                    <Input
                      value={settings.pushTemplate}
                      onChange={(e) => updateSettings({ pushTemplate: e.target.value })}
                      placeholder="New message from {staffName}"
                      className="font-mono text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Body (Optional)</Label>
                    <Input
                      placeholder="{messagePreview}"
                      className="font-mono text-sm mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Available Variables */}
            <div className="space-y-3 pt-4 border-t">
              <Label>Available Variables</Label>
              <div className="grid grid-cols-2 gap-3">
                {availableVariables.map((item) => (
                  <div
                    key={item.variable}
                    className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <Badge variant="secondary" className="font-mono text-xs mt-0.5">
                      {item.variable}
                    </Badge>
                    <span className="text-xs text-gray-600">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deep Link Settings */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Deep Link to Message</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    When enabled, clicking the notification takes the patient directly to the staff message
                  </p>
                </div>
                <Switch
                  checked={settings.deepLinkEnabled}
                  onCheckedChange={(checked) => updateSettings({ deepLinkEnabled: checked })}
                />
              </div>

              {settings.deepLinkEnabled && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 text-xs">
                    Deep links will open the conversation with the staff message highlighted and scrolled into view.
                    Format: <code className="bg-green-100 px-1 py-0.5 rounded">baseapp://messages/{'{conversationId}'}</code>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Delivery Timing */}
            <div className="space-y-3 pt-4 border-t">
              <div>
                <Label>Notification Delay</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Add a slight delay before sending notifications to batch multiple quick responses
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  max="60"
                  value={settings.delaySeconds}
                  onChange={(e) => updateSettings({ delaySeconds: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
                <span className="text-sm text-gray-600">seconds</span>
              </div>
              <p className="text-xs text-gray-500">
                Recommended: 5-10 seconds to avoid multiple notifications if staff sends several messages in a row
              </p>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Quiet Hours</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Suppress notifications during specific hours (patient's local time)
                  </p>
                </div>
                <Switch
                  checked={settings.quietHoursEnabled}
                  onCheckedChange={(checked) => updateSettings({ quietHoursEnabled: checked })}
                />
              </div>

              {settings.quietHoursEnabled && (
                <div className="flex items-center gap-4 ml-6">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-600">From</Label>
                    <Input
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={(e) => updateSettings({ quietHoursStart: e.target.value })}
                      className="w-32"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-600">To</Label>
                    <Input
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={(e) => updateSettings({ quietHoursEnd: e.target.value })}
                      className="w-32"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See how notifications will appear to patients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Preview */}
          {settings.enabled && settings.channels.email && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Email Preview</Label>
              <div className="border rounded-lg overflow-hidden bg-white">
                {/* Email Header */}
                <div className="bg-gray-100 p-3 border-b">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600">From: noreply@basepatientapp.com</span>
                  </div>
                  <p className="text-sm">
                    <strong>Subject: </strong>
                    {settings.emailSubject
                      .replace('{practiceName}', 'Main Street Clinic')
                      .replace('{staffName}', 'Dr. Smith')}
                  </p>
                </div>
                {/* Email Body */}
                <div className="p-4 space-y-3">
                  <div className="whitespace-pre-wrap text-sm text-gray-700">
                    {settings.emailBody
                      .replace('{patientName}', 'John')
                      .replace('{staffName}', 'Dr. Smith')
                      .replace('{practiceName}', 'Main Street Clinic')
                      .replace('{messagePreview}', 'I reviewed your test results and everything looks...')
                      .replace('[View Message Button]', '')
                      .replace('{deepLink}', 'https://baseapp.com/messages/msg_12345')}
                  </div>
                  {settings.emailBody.includes('[View Message Button]') && (
                    <div className="flex justify-center py-2">
                      <div className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm">
                        View Message
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SMS Preview */}
          {settings.enabled && settings.channels.sms && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">SMS Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      {settings.smsTemplate
                        .replace('{patientName}', 'John')
                        .replace('{staffName}', 'Dr. Smith')
                        .replace('{practiceName}', 'Main Street Clinic')
                        .replace('{messagePreview}', 'I reviewed your test results and everything looks...')
                        .replace('{deepLink}', 'baseapp://messages/msg_12345')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Push Notification Preview */}
          {settings.enabled && settings.channels.push && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Push Notification Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-600">BASE Patient App</span>
                      <span className="text-xs text-gray-400">now</span>
                    </div>
                    <p className="text-sm">
                      {settings.pushTemplate
                        .replace('{staffName}', 'Dr. Smith')
                        .replace('{practiceName}', 'Main Street Clinic')}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      I reviewed your test results and everything looks...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* In-App Badge Preview */}
          {settings.enabled && settings.channels.inApp && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">In-App Badge Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">1</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm">Messages</p>
                    <p className="text-xs text-gray-500">1 unread message</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            // Reset to saved state (in real app, refetch from API)
            setHasUnsavedChanges(false);
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}