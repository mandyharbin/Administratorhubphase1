import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { SecureChat } from './SecureChat';
import { NotificationHistoryViewer } from './NotificationHistoryViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  MessageCircle, 
  Shield, 
  Users, 
  Settings,
  Bell,
  Lock,
  CheckCircle,
  Database,
  Mail,
  Smartphone
} from 'lucide-react';

export function PatientCommunicationDemo() {
  const [viewMode, setViewMode] = useState<'patient' | 'staff'>('patient');
  const patientId = 'patient-001';
  const patientName = 'Sarah Johnson';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-6 h-6 text-teal-600" />
          <h2>Secure Patient Communication System</h2>
        </div>
        <p className="text-gray-600">
          HIPAA-compliant bidirectional messaging with staff notifications and user settings integration
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm mb-2">
                <strong>Complete Communication Infrastructure:</strong> This system integrates secure messaging, 
                push/SMS/email notifications, user preferences, and backend storage. All messages are stored as 
                FHIR Communication resources and sync across mobile and web interfaces.
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="text-xs bg-white">
                  <Lock className="w-3 h-3 mr-1" />
                  HIPAA Compliant
                </Badge>
                <Badge variant="outline" className="text-xs bg-white">
                  <Database className="w-3 h-3 mr-1" />
                  FHIR Resources
                </Badge>
                <Badge variant="outline" className="text-xs bg-white">
                  <Bell className="w-3 h-3 mr-1" />
                  Multi-Channel Notifications
                </Badge>
                <Badge variant="outline" className="text-xs bg-white">
                  <Settings className="w-3 h-3 mr-1" />
                  User Settings Integrated
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">View Mode</CardTitle>
          <CardDescription>Switch between patient and staff perspectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'patient' ? 'default' : 'outline'}
              onClick={() => setViewMode('patient')}
              className={viewMode === 'patient' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              <Users className="w-4 h-4 mr-2" />
              Patient View
            </Button>
            <Button
              variant={viewMode === 'staff' ? 'default' : 'outline'}
              onClick={() => setViewMode('staff')}
              className={viewMode === 'staff' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              <Shield className="w-4 h-4 mr-2" />
              Staff View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Communication Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <SecureChat 
            patientId={patientId}
            patientName={patientName}
            mode={viewMode}
            staffName="Dr. Emily Carter"
          />
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          {/* Notification History */}
          <NotificationHistoryViewer 
            patientId={patientId}
            patientName={patientName}
          />
          
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span>{patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Patient ID:</span>
                <span className="font-mono">{patientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DOB:</span>
                <span>March 15, 1990</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Messaging:</span>
                <Badge className="bg-green-600 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-base">System Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="mb-1"><strong>Real-Time Messaging</strong></div>
                  <div className="text-gray-600">
                    Messages sync automatically every 10 seconds across all devices
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="mb-1"><strong>Staff Notifications</strong></div>
                  <div className="text-gray-600">
                    When staff replies, patients receive push/SMS/email based on their preferences
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Settings className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="mb-1"><strong>User Settings</strong></div>
                  <div className="text-gray-600">
                    Notification preferences stored in user-setting table (Id, GisId, SubType)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="mb-1"><strong>FHIR Storage</strong></div>
                  <div className="text-gray-600">
                    Messages stored as Communication resources in KV store
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="mb-1"><strong>HIPAA Compliant</strong></div>
                  <div className="text-gray-600">
                    Encrypted transmission, secure storage, audit logging
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Architecture */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-base">Technical Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="space-y-1">
                <div className="text-gray-700"><strong>Backend Endpoints:</strong></div>
                <div className="font-mono text-[10px] bg-white p-2 rounded space-y-0.5">
                  <div>POST /store-communication</div>
                  <div>GET /get-communications</div>
                  <div>POST /mark-read</div>
                  <div>POST /send-notification</div>
                  <div>GET /notification-preferences</div>
                  <div>GET /user-settings/:id</div>
                  <div>PUT /user-settings/:id</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-700"><strong>Data Models:</strong></div>
                <div className="font-mono text-[10px] bg-white p-2 rounded space-y-0.5">
                  <div>• FHIR Communication</div>
                  <div>• User Settings (DynamoDB)</div>
                  <div>• Notification Preferences</div>
                  <div>• Message Read Status</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-700"><strong>Notification Channels:</strong></div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-white">
                    <Smartphone className="w-3 h-3 mr-1" />
                    Push
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-white">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-white">
                    <Smartphone className="w-3 h-3 mr-1" />
                    SMS
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Integration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integration with User Settings</CardTitle>
          <CardDescription>How this connects to the account settings system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-teal-600" />
                </div>
                <div className="font-medium">1. User Preferences</div>
              </div>
              <div className="text-gray-600 leading-relaxed">
                Patient configures notification preferences in Account Settings (accessible via hamburger menu in FHIR Mobile AI Assistant). Preferences are stored in the user-setting table with fields: Id, GisId, SubType.
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div className="font-medium">2. Staff Reply</div>
              </div>
              <div className="text-gray-600 leading-relaxed">
                When staff sends a message, the system queries the user-setting table for the patient's notification preferences (push/email/SMS toggles) and only sends notifications via the enabled channels.
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                <div className="font-medium">3. Notification Delivery</div>
              </div>
              <div className="text-gray-600 leading-relaxed">
                The notification service reads preferences and delivers via Firebase (push), Twilio (SMS), and SendGrid (email). Patient receives notifications only on their preferred channels.
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-700">
              <strong>Example Flow:</strong> Sarah configures her preferences to receive Push + Email (but not SMS). 
              When Dr. Carter replies to her message, the system queries <code className="bg-white px-1 py-0.5 rounded text-[10px]">user_settings_patient-001</code>, 
              sees Push + Email are enabled, and sends notifications via Firebase and SendGrid only.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}