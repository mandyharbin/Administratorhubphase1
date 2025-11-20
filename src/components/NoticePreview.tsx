import { Mail, MessageSquare, Bell, Smartphone, Monitor } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useState } from 'react';

interface NoticePreviewProps {
  template: {
    name: string;
    message: string;
    methods: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

export function NoticePreview({ template }: NoticePreviewProps) {
  const [activeChannel, setActiveChannel] = useState<'email' | 'sms' | 'push'>('email');

  // Sample data for variable replacement
  const sampleData = {
    patient_name: 'Sarah Johnson',
    provider_name: 'Dr. Smith',
    appointment_time: '2:30 PM',
    appointment_date: 'Nov 25, 2025',
    location_name: 'Main Street Family Practice',
    practice_phone: '(555) 123-4567',
    billing_phone: '(555) 123-4568',
    portal_url: 'patient.basehealth.com',
    payment_amount: '125.00',
    payment_date: 'Nov 19, 2025',
    current_balance: '0.00',
    balance_amount: '245.50',
    test_date: 'Nov 15, 2025',
    screening_type: 'annual physical exam',
    prescription_name: 'Lisinopril 10mg'
  };

  // Replace variables in message
  const replaceVariables = (message: string): string => {
    let replaced = message;
    Object.entries(sampleData).forEach(([key, value]) => {
      replaced = replaced.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return replaced;
  };

  const processedMessage = replaceVariables(template.message);

  // Get available channels
  const availableChannels = Object.entries(template.methods)
    .filter(([_, enabled]) => enabled)
    .map(([channel]) => channel as 'email' | 'sms' | 'push');

  // Set first available channel as active
  if (!availableChannels.includes(activeChannel) && availableChannels.length > 0) {
    setTimeout(() => setActiveChannel(availableChannels[0]), 0);
  }

  return (
    <div className="space-y-4">
      {/* Channel Toggle */}
      <div className="flex items-center justify-center gap-2 pb-2">
        {template.methods.email && (
          <Button
            variant={activeChannel === 'email' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChannel('email')}
            className="gap-2"
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>
        )}
        {template.methods.sms && (
          <Button
            variant={activeChannel === 'sms' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChannel('sms')}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            SMS
          </Button>
        )}
        {template.methods.push && (
          <Button
            variant={activeChannel === 'push' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChannel('push')}
            className="gap-2"
          >
            <Bell className="w-4 h-4" />
            Push
          </Button>
        )}
      </div>

      {/* Preview Content */}
      <div className="mx-auto max-w-md">
        {activeChannel === 'email' && (
          <EmailPreview templateName={template.name} message={processedMessage} />
        )}
        {activeChannel === 'sms' && (
          <SMSPreview templateName={template.name} message={processedMessage} />
        )}
        {activeChannel === 'push' && (
          <PushPreview templateName={template.name} message={processedMessage} />
        )}
      </div>
    </div>
  );
}

function EmailPreview({ templateName, message }: { templateName: string; message: string }) {
  return (
    <div>
      <div className="text-center space-y-2 pb-4">
        <Mail className="w-12 h-12 mx-auto text-blue-600" />
        <h3>Email Preview</h3>
        <p className="text-sm text-gray-600">How patients will receive this via email</p>
      </div>
      
      <div className="bg-gray-900 rounded-3xl p-3 mx-auto" style={{ maxWidth: '400px' }}>
        <div className="bg-white rounded-2xl overflow-hidden">
          <Card className="border-0">
            <CardContent className="p-0">
              {/* Email Header */}
              <div className="bg-blue-600 text-white text-center p-4">
                <h2 className="text-white text-base">Main Street Family Practice</h2>
                <p className="text-blue-100 mt-1 text-xs">{templateName}</p>
              </div>

              {/* Email Body */}
              <div className="bg-white p-4 space-y-4">
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {message}
                </div>

                {/* Footer */}
                <div className="border-t pt-3 text-gray-500 text-[10px] space-y-1">
                  <p>Main Street Family Practice</p>
                  <p>123 Healthcare Avenue, Medical City, CA 90210</p>
                  <p className="mt-2">Questions? Call (555) 123-4567</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SMSPreview({ templateName, message }: { templateName: string; message: string }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div>
      <div className="text-center space-y-2 pb-4">
        <MessageSquare className="w-12 h-12 mx-auto text-green-600" />
        <h3>SMS Preview</h3>
        <p className="text-sm text-gray-600">How patients will receive this via text message</p>
      </div>
      
      {/* iPhone Frame */}
      <div className="bg-gray-900 rounded-3xl p-3 mx-auto" style={{ maxWidth: '350px' }}>
        {/* iPhone Notch */}
        <div className="flex justify-center mb-2">
          <div className="bg-gray-800 rounded-full h-5 w-32"></div>
        </div>
        
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* iPhone Status Bar */}
          <div className="bg-white px-6 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-gray-900"></div>
              <div className="w-1 h-1 rounded-full bg-gray-900"></div>
              <div className="w-1 h-1 rounded-full bg-gray-900"></div>
              <div className="w-1 h-1 rounded-full bg-gray-400"></div>
              <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            </div>
            <span className="text-gray-900">{timeStr}</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-900">100%</span>
              <div className="w-5 h-3 border-2 border-gray-900 rounded-sm">
                <div className="bg-gray-900 h-full w-full"></div>
              </div>
            </div>
          </div>

          {/* Messages Header */}
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                MS
              </div>
              <div className="flex-1">
                <div className="text-sm">Main Street Family Practice</div>
                <div className="text-xs text-gray-600">Healthcare</div>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="bg-gray-50 p-4 min-h-[300px]">
            <div className="space-y-2">
              {/* Incoming message bubble */}
              <div className="flex items-end gap-2">
                <div className="bg-gray-300 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[85%]">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{message}</p>
                  <div className="text-[10px] text-gray-600 mt-1">{timeStr}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-300 px-2 py-2">
            <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center">
              <span className="text-sm text-gray-500">Message</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PushPreview({ templateName, message }: { templateName: string; message: string }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Remove PHI from push notifications - they appear on lock screens
  // Strip out patient names and other sensitive info
  const sanitizeForPush = (msg: string): string => {
    // Remove greetings with names like "Hi Sarah Johnson" or "Hello Sarah"
    let sanitized = msg.replace(/^(Hi|Hello|Dear)\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?,?\s*/i, '');
    
    // Generic sanitization - remove common PHI patterns
    sanitized = sanitized.replace(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, (match) => {
      // Keep provider names with "Dr." prefix
      if (msg.indexOf('Dr. ' + match) > -1 || msg.indexOf('Dr.' + match) > -1) {
        return match;
      }
      // Remove other potential patient names
      return '***';
    });
    
    // Capitalize first letter after sanitization
    if (sanitized.length > 0) {
      sanitized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
    }
    
    return sanitized;
  };

  // Truncate message for push notification (typically 178 characters)
  const sanitizedMessage = sanitizeForPush(message);
  const truncatedMessage = sanitizedMessage.length > 178 ? sanitizedMessage.substring(0, 175) + '...' : sanitizedMessage;

  return (
    <div>
      <div className="text-center space-y-2 pb-4">
        <Bell className="w-12 h-12 mx-auto text-purple-600" />
        <h3>Push Notification Preview</h3>
        <p className="text-sm text-gray-600">How patients will receive this on their device</p>
      </div>
      
      {/* iPhone Frame */}
      <div className="bg-gray-900 rounded-3xl p-3 mx-auto" style={{ maxWidth: '350px' }}>
        {/* iPhone Notch */}
        <div className="flex justify-center mb-2">
          <div className="bg-gray-800 rounded-full h-5 w-32"></div>
        </div>
        
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden min-h-[600px]">
          {/* iPhone Status Bar */}
          <div className="px-6 py-2 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-white"></div>
              <div className="w-1 h-1 rounded-full bg-white"></div>
              <div className="w-1 h-1 rounded-full bg-white"></div>
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
            </div>
            <span>{timeStr}</span>
            <div className="flex items-center gap-1">
              <span>100%</span>
              <div className="w-5 h-3 border-2 border-white rounded-sm">
                <div className="bg-white h-full w-full"></div>
              </div>
            </div>
          </div>

          {/* Lock Screen */}
          <div className="px-4 pt-8 space-y-4">
            <div className="text-center">
              <div className="text-6xl text-white">{now.getHours() % 12 || 12}:{String(now.getMinutes()).padStart(2, '0')}</div>
              <div className="text-sm text-gray-400 mt-1">
                {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Push Notification */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">Main Street Family Practice</span>
                    <span className="text-xs text-gray-500">now</span>
                  </div>
                  <div className="text-sm mb-1">{templateName}</div>
                  <div className="text-xs text-gray-600 line-clamp-3">{truncatedMessage}</div>
                </div>
              </div>
            </div>

            {/* Additional notifications (faded) */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg opacity-40">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-400 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700">Previous Notification</span>
                    <span className="text-xs text-gray-500">2h ago</span>
                  </div>
                  <div className="text-xs text-gray-600">Earlier message...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}