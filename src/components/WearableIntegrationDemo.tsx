import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { 
  Smartphone, 
  Watch, 
  Heart, 
  Activity, 
  Moon, 
  Battery,
  CheckCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Wifi,
  WifiOff,
  TrendingUp,
  Clock,
  Shield,
  Settings,
  Trash2,
  Link,
  Monitor,
  Calendar,
  X,
  Zap,
  AlertTriangle
} from 'lucide-react';

type Screen = 
  | 'overview'
  | 'connect-starter'
  | 'permission-consent'
  | 'system-permission'
  | 'vendor-oauth'
  | 'device-list'
  | 'device-detail'
  | 'sync-status'
  | 'revoke-confirm'
  | 'error-reauth'
  | 'clinician-dashboard';

type DeviceStatus = 'connected' | 'syncing' | 'queued' | 'error' | 'reauth-needed';

interface WearableDevice {
  id: string;
  name: string;
  vendor: 'healthkit' | 'googlefit' | 'fitbit' | 'garmin';
  status: DeviceStatus;
  lastSync: Date;
  dataTypes: string[];
  batteryLevel?: number;
}

export function WearableIntegrationDemo() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('overview');
  const [consentedDataTypes, setConsentedDataTypes] = useState<string[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<WearableDevice[]>([
    {
      id: '1',
      name: 'Apple Watch Series 8',
      vendor: 'healthkit',
      status: 'connected',
      lastSync: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
      dataTypes: ['heart_rate', 'steps', 'sleep_summary'],
      batteryLevel: 85
    }
  ]);
  const [selectedDevice, setSelectedDevice] = useState<WearableDevice | null>(null);
  const [syncQueue, setSyncQueue] = useState(3);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const MobileFrame = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="mx-auto" style={{ width: '390px' }}>
        {/* Mobile device frame */}
        <div className="bg-gray-900 rounded-t-[2.5rem] px-6 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="text-white text-sm">9:41</div>
            <div className="w-20 h-6 bg-gray-800 rounded-full" />
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-white" />
              <Battery className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div 
          className="bg-white border-x-2 border-b-2 border-gray-900 rounded-b-[2.5rem] overflow-hidden shadow-2xl"
          style={{ height: '844px' }}
        >
          {children}
        </div>
      </div>
    );
  };

  const StatusChip = ({ status }: { status: DeviceStatus }) => {
    const config = {
      connected: { label: 'Connected', color: 'bg-green-100 text-green-700 border-green-200' },
      syncing: { label: 'Syncing...', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      queued: { label: 'Queued', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      error: { label: 'Error', color: 'bg-red-100 text-red-700 border-red-200' },
      'reauth-needed': { label: 'Reauth needed', color: 'bg-orange-100 text-orange-700 border-orange-200' }
    };

    return (
      <Badge variant="outline" className={`text-xs ${config[status].color}`}>
        {config[status].label}
      </Badge>
    );
  };

  // Overview / Platform Selection
  if (currentScreen === 'overview') {
    return (
      <div className="space-y-6">
        <div>
          <h2>Wearable Integration Demo</h2>
          <p className="text-gray-600 mt-1">
            Connect wearable devices, manage permissions, and view health data in the EHR
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Flows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-600" />
                Patient Mobile Flows
              </CardTitle>
              <CardDescription>iOS & Android wearable connection screens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: 'connect-starter', label: 'Connect Starter', icon: Link },
                { id: 'permission-consent', label: 'Permission & Consent', icon: Shield },
                { id: 'system-permission', label: 'System Permission', icon: CheckCircle },
                { id: 'vendor-oauth', label: 'Vendor OAuth (Fitbit)', icon: Watch },
                { id: 'device-list', label: 'Device List', icon: Activity },
                { id: 'device-detail', label: 'Device Detail & Trends', icon: TrendingUp },
                { id: 'sync-status', label: 'Sync Status', icon: RefreshCw },
                { id: 'revoke-confirm', label: 'Revoke / Disconnect', icon: Trash2 },
                { id: 'error-reauth', label: 'Error & Reauth', icon: AlertTriangle }
              ].map((screen) => {
                const Icon = screen.icon;
                return (
                  <Button
                    key={screen.id}
                    variant="outline"
                    onClick={() => setCurrentScreen(screen.id as Screen)}
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {screen.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Clinician Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                Clinician Dashboard
              </CardTitle>
              <CardDescription>Staff EHR view of patient wearable data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() => setCurrentScreen('clinician-dashboard')}
                className="w-full justify-start"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Wearable Data Card
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <div className="text-xs text-blue-900">
                  <strong>Integration Note:</strong> Wearable data synced from patient devices appears in the Unified Staff Portal for clinical review.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Endpoints & Data Schema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                <div className="text-blue-600 mb-1">POST /v1/patients/{'{id}'}/wearables/connect</div>
                <div className="text-gray-600">
                  {`{ vendor, consent_types[], device_id }`}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                <div className="text-blue-600 mb-1">POST /v1/patients/{'{id}'}/wearables/sync</div>
                <div className="text-gray-600">
                  {`{ measurement_type, value, unit, timestamp }`}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                <div className="text-blue-600 mb-1">GET /v1/patients/{'{id}'}/wearables/devices</div>
                <div className="text-gray-600">
                  Returns list of connected devices
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                <div className="text-blue-600 mb-1">DELETE /v1/patients/{'{id}'}/wearables/{'{device_id}'}</div>
                <div className="text-gray-600">
                  Revoke device connection
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm mb-2">Canonical Data Types:</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">heart_rate</Badge>
                <Badge variant="outline">steps</Badge>
                <Badge variant="outline">sleep_summary</Badge>
                <Badge variant="outline">blood_oxygen</Badge>
                <Badge variant="outline">blood_pressure</Badge>
                <Badge variant="outline">calories_burned</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Connect Starter Screen
  if (currentScreen === 'connect-starter') {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentScreen('overview')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Overview
        </button>

        <div className="text-center mb-6">
          <h3>Connect Starter</h3>
          <p className="text-sm text-gray-600 mt-1">Entry point from onboarding/settings</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4">
              <h3 className="text-white">Connect Wearable</h3>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="space-y-6">
                {/* Hero Icon */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center">
                    <Watch className="w-12 h-12 text-teal-600" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl mb-2">Share Your Health Data</h3>
                  <p className="text-gray-600">
                    Connect your wearable device to help your care team monitor your health in real-time.
                  </p>
                </div>

                {/* Benefits */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Heart className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm">Continuous Monitoring</div>
                          <div className="text-xs text-gray-600">
                            Track heart rate, activity, and sleep patterns
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Zap className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm">Early Detection</div>
                          <div className="text-xs text-gray-600">
                            Alert your care team to potential issues
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shield className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm">Privacy First</div>
                          <div className="text-xs text-gray-600">
                            You control what data is shared and can revoke access anytime
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Consent Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-900">
                    <strong>Consent Summary:</strong> Share heart rate, steps, and sleep data with your care team. You can revoke access anytime.
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    size="lg"
                    onClick={() => setCurrentScreen('permission-consent')}
                  >
                    Connect Device
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    See Data Types
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </MobileFrame>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Design Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div><strong>Entry Point:</strong> Accessible from onboarding flow or settings</div>
            <div><strong>Benefits:</strong> Clear value proposition for sharing health data</div>
            <div><strong>Consent:</strong> Short summary with link to full details</div>
            <div><strong>Tone:</strong> Clinical, trustworthy, low-friction</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Permission & Consent Modal
  if (currentScreen === 'permission-consent') {
    const dataTypes = [
      { 
        id: 'heart_rate', 
        label: 'Heart Rate', 
        icon: Heart, 
        description: 'Used to detect irregularities and trigger alerts',
        color: 'text-red-600'
      },
      { 
        id: 'steps', 
        label: 'Steps & Activity', 
        icon: Activity, 
        description: 'Track daily activity levels and exercise patterns',
        color: 'text-green-600'
      },
      { 
        id: 'sleep_summary', 
        label: 'Sleep Data', 
        icon: Moon, 
        description: 'Monitor sleep quality and duration for overall health',
        color: 'text-indigo-600'
      }
    ];

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentScreen('overview')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Overview
        </button>

        <div className="text-center mb-6">
          <h3>Permission & Consent</h3>
          <p className="text-sm text-gray-600 mt-1">iOS HealthKit style consent modal</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b p-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setCurrentScreen('connect-starter')}>
                  <X className="w-6 h-6 text-gray-600" />
                </button>
                <h3>Health Access</h3>
                <div className="w-6" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-teal-600" />
                    </div>
                  </div>
                  <h3 className="text-lg mb-2">Allow BASE Health to access your health data?</h3>
                  <p className="text-sm text-gray-600">
                    Select the types of health data you want to share with your care team.
                  </p>
                </div>

                {/* Data Type Toggles */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {dataTypes.map((type) => {
                        const Icon = type.icon;
                        const isConsented = consentedDataTypes.includes(type.id);
                        
                        return (
                          <div key={type.id} className="flex items-start gap-3">
                            <Checkbox
                              id={type.id}
                              checked={isConsented}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setConsentedDataTypes([...consentedDataTypes, type.id]);
                                } else {
                                  setConsentedDataTypes(consentedDataTypes.filter(t => t !== type.id));
                                }
                              }}
                              className="mt-1"
                            />
                            <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className={`w-4 h-4 ${type.color}`} />
                                <span className="text-sm">{type.label}</span>
                              </div>
                              <p className="text-xs text-gray-600">{type.description}</p>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Legal & Privacy */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900">
                      <strong>Your Privacy:</strong> Your health data is encrypted and only shared with your authorized care team. You can revoke access at any time in Settings.
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-600 text-center">
                  By continuing, you agree to our{' '}
                  <button className="text-blue-600 hover:underline">Health Data Policy</button>
                  {' '}and{' '}
                  <button className="text-blue-600 hover:underline">Terms of Service</button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t p-4 space-y-2">
              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700"
                size="lg"
                disabled={consentedDataTypes.length === 0}
                onClick={() => setCurrentScreen('system-permission')}
              >
                Allow Access
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => setCurrentScreen('connect-starter')}
              >
                Don't Allow
              </Button>
            </div>
          </div>
        </MobileFrame>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Annotation</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div><strong>Event:</strong> connect_permission_requested</div>
            <div><strong>Payload:</strong> {`{ consent_types: ["heart_rate", "steps", "sleep_summary"] }`}</div>
            <div><strong>Storage:</strong> Store consent choices in secure storage before OS permission</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // System Permission Flow
  if (currentScreen === 'system-permission') {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentScreen('overview')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Overview
        </button>

        <div className="text-center mb-6">
          <h3>System Permission</h3>
          <p className="text-sm text-gray-600 mt-1">iOS HealthKit / Android permission dialog</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50">
            {permissionGranted === null && (
              <>
                {/* Mock iOS Permission Dialog */}
                <Card className="w-full max-w-sm">
                  <CardContent className="pt-6 pb-4">
                    <div className="text-center mb-4">
                      <div className="flex justify-center mb-3">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                          <Heart className="w-8 h-8 text-red-600" />
                        </div>
                      </div>
                      <h3 className="text-base mb-2">"BASE Health" Would Like to Access Health</h3>
                      <p className="text-sm text-gray-600">
                        This app will be able to read and write the following health data:
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded p-3 mb-4">
                      <div className="text-xs space-y-1">
                        <div>• Heart Rate</div>
                        <div>• Steps</div>
                        <div>• Sleep Analysis</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className="w-full"
                        size="lg"
                        onClick={() => setPermissionGranted(true)}
                      >
                        Allow
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={() => setPermissionGranted(false)}
                      >
                        Don't Allow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {permissionGranted === true && (
              <div className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-xl mb-2">Permission Granted!</h3>
                <p className="text-gray-600 mb-6">
                  Successfully connected to Health app
                </p>
                <Button 
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    setCurrentScreen('device-list');
                    // Simulate adding HealthKit device
                    if (!connectedDevices.find(d => d.vendor === 'healthkit')) {
                      setConnectedDevices([...connectedDevices, {
                        id: Date.now().toString(),
                        name: 'iPhone Health App',
                        vendor: 'healthkit',
                        status: 'connected',
                        lastSync: new Date(),
                        dataTypes: consentedDataTypes
                      }]);
                    }
                  }}
                >
                  View Connected Devices
                </Button>
              </div>
            )}

            {permissionGranted === false && (
              <div className="text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <X className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-xl mb-2">Permission Denied</h3>
                <p className="text-gray-600 mb-6">
                  You can enable this in Settings → Privacy → Health
                </p>
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={() => setPermissionGranted(null)}
                  >
                    Try Again
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setCurrentScreen('connect-starter')}
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            )}
          </div>
        </MobileFrame>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Annotation</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div><strong>Success Event:</strong> connect_granted</div>
            <div><strong>Failure Event:</strong> connect_denied</div>
            <div><strong>POST /v1/patients/{'{id}'}/wearables/connect</strong></div>
            <div className="bg-gray-50 p-2 rounded font-mono">
              {`{ vendor: "healthkit", consent_types: ["heart_rate", "steps"], device_id: "..." }`}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Device List
  if (currentScreen === 'device-list') {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentScreen('overview')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Overview
        </button>

        <div className="text-center mb-6">
          <h3>Connected Devices</h3>
          <p className="text-sm text-gray-600 mt-1">Manage wearable connections</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4">
              <h3 className="text-white">Wearable Devices</h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-6 space-y-4">
                {/* Sync Status Banner */}
                {syncQueue > 0 && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                        <div className="flex-1">
                          <div className="text-sm">Syncing health data...</div>
                          <div className="text-xs text-gray-600">{syncQueue} measurements queued</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Connected Devices */}
                {connectedDevices.map((device) => {
                  const VendorIcon = device.vendor === 'healthkit' ? Heart : 
                                    device.vendor === 'fitbit' ? Watch : Activity;
                  const lastSyncText = formatLastSync(device.lastSync);
                  
                  return (
                    <Card 
                      key={device.id}
                      className="cursor-pointer hover:border-teal-600 transition-colors"
                      onClick={() => {
                        setSelectedDevice(device);
                        setCurrentScreen('device-detail');
                      }}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                              <VendorIcon className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                              <div className="text-sm">{device.name}</div>
                              <div className="text-xs text-gray-600 capitalize">{device.vendor}</div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="flex items-center justify-between">
                          <StatusChip status={device.status} />
                          <div className="text-xs text-gray-600">
                            Last sync {lastSyncText}
                          </div>
                        </div>

                        {device.batteryLevel && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                            <Battery className="w-3 h-3" />
                            {device.batteryLevel}%
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Add Device Button */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setCurrentScreen('vendor-oauth')}
                >
                  <Watch className="w-4 h-4 mr-2" />
                  Connect Another Device
                </Button>

                {connectedDevices.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Watch className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-base mb-2">No Devices Connected</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Connect a wearable device to start tracking your health data
                    </p>
                    <Button 
                      className="bg-teal-600 hover:bg-teal-700"
                      onClick={() => setCurrentScreen('connect-starter')}
                    >
                      Connect Device
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white border-t p-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setCurrentScreen('sync-status')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Sync Settings
              </Button>
            </div>
          </div>
        </MobileFrame>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Annotation</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div><strong>GET /v1/patients/{'{id}'}/wearables/devices</strong></div>
            <div><strong>Response:</strong> Array of devices with status, last_sync, data_types[]</div>
            <div><strong>Sync Status:</strong> Shows queued count from background sync service</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Device Detail with Trends
  if (currentScreen === 'device-detail' && selectedDevice) {
    const device = selectedDevice;
    
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentScreen('overview')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Overview
        </button>

        <div className="text-center mb-6">
          <h3>Device Detail & Trends</h3>
          <p className="text-sm text-gray-600 mt-1">7-day health data visualization</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4">
              <button 
                onClick={() => setCurrentScreen('device-list')}
                className="mb-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-white">{device.name}</h3>
              <p className="text-teal-100 text-xs">{device.vendor.toUpperCase()}</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {/* Status Card */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <StatusChip status={device.status} />
                      {device.batteryLevel && (
                        <div className="flex items-center gap-1 text-sm">
                          <Battery className="w-4 h-4 text-gray-600" />
                          {device.batteryLevel}%
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      Last sync: {formatLastSync(device.lastSync)}
                    </div>
                  </CardContent>
                </Card>

                {/* Heart Rate Trend */}
                {device.dataTypes.includes('heart_rate') && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-600" />
                          Heart Rate
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">7 days</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Mock Mini Chart */}
                      <div className="h-24 flex items-end gap-1 mb-3">
                        {[65, 72, 68, 71, 69, 75, 73].map((value, i) => (
                          <div key={i} className="flex-1 bg-red-100 rounded-t relative" style={{ height: `${(value / 100) * 100}%` }}>
                            <div className="absolute inset-0 bg-red-500" style={{ height: '30%', bottom: 0 }} />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-gray-600">Avg</div>
                          <div className="text-base">70 bpm</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Low</div>
                          <div className="text-base">58 bpm</div>
                        </div>
                        <div>
                          <div className="text-gray-600">High</div>
                          <div className="text-base">142 bpm</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Steps Trend */}
                {device.dataTypes.includes('steps') && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Activity className="w-4 h-4 text-green-600" />
                          Steps
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">7 days</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-24 flex items-end gap-1 mb-3">
                        {[8500, 12000, 9500, 11000, 7800, 13500, 10200].map((value, i) => (
                          <div key={i} className="flex-1 bg-green-100 rounded-t relative" style={{ height: `${(value / 15000) * 100}%` }}>
                            <div className="absolute inset-0 bg-green-500" style={{ height: '40%', bottom: 0 }} />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-600">Daily Avg</div>
                          <div className="text-base">10,357</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Today</div>
                          <div className="text-base">10,200</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Samples */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Measurements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { type: 'Heart Rate', value: '73 bpm', time: '2m ago', icon: Heart, color: 'text-red-600' },
                        { type: 'Steps', value: '10,234', time: '15m ago', icon: Activity, color: 'text-green-600' },
                        { type: 'Sleep', value: '7h 23m', time: '8h ago', icon: Moon, color: 'text-indigo-600' }
                      ].map((sample, i) => {
                        const Icon = sample.icon;
                        return (
                          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${sample.color}`} />
                              <div>
                                <div className="text-sm">{sample.type}</div>
                                <div className="text-xs text-gray-600">{sample.time}</div>
                              </div>
                            </div>
                            <div className="text-sm">{sample.value}</div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Device Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Device Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Device ID</span>
                      <span className="font-mono">{device.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Source</span>
                      <span className="capitalize">{device.vendor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Connected</span>
                      <span>November 22, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Sync</span>
                      <span>{formatLastSync(device.lastSync)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCurrentScreen('sync-status')}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setCurrentScreen('revoke-confirm')}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Disconnect Device
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </MobileFrame>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data Schema</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div><strong>Measurement Schema:</strong></div>
            <div className="bg-gray-50 p-2 rounded font-mono">
              {`{
  measurement_type: "heart_rate",
  measurement_value: 73,
  unit: "bpm",
  recorded_at: "2025-11-22T15:42:00Z",
  device_id: "${device.id}",
  source: "${device.vendor}"
}`}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function for formatting last sync
  function formatLastSync(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  // Clinician Dashboard with FHIR Patient Scenarios
  if (currentScreen === 'clinician-dashboard') {
    const patientScenarios = [
      {
        id: "demo-1",
        label: "Healthy Adult — Jane Doe",
        patient: { name: "Jane Doe", mrn: "MRN-1001", age: 40, gender: "Female" },
        vitalSigns: { heartRate: 76, systolic: 118, diastolic: 76 },
        conditions: [],
        medications: [],
        wearableStatus: "connected",
        lastSync: "12m ago"
      },
      {
        id: "demo-2",
        label: "Elderly with Atrial Fibrillation — John Smith",
        patient: { name: "John Smith", mrn: "MRN-2002", age: 78, gender: "Male" },
        vitalSigns: { heartRate: 110, systolic: null, diastolic: null },
        conditions: ["Atrial fibrillation (Severe)"],
        medications: ["Warfarin"],
        wearableStatus: "syncing",
        lastSync: "2m ago",
        alerts: ["Irregular rhythm noted by device"]
      },
      {
        id: "demo-3",
        label: "Type 2 Diabetes — María García",
        patient: { name: "María García", mrn: "MRN-3003", age: 58, gender: "Female" },
        vitalSigns: { glucose: 162, hba1c: 8.2 },
        conditions: ["Type 2 diabetes mellitus"],
        medications: ["Metformin 500 mg"],
        wearableStatus: "connected",
        lastSync: "5m ago"
      },
      {
        id: "demo-4",
        label: "Pregnant — Emily Nguyễn (28 weeks)",
        patient: { name: "Emily Nguyễn", mrn: "MRN-4004", age: 29, gender: "Female" },
        vitalSigns: { dueDate: "May 5, 2025" },
        conditions: ["Pregnancy (28 weeks)"],
        medications: ["Prenatal vitamins"],
        wearableStatus: "connected",
        lastSync: "8m ago"
      },
      {
        id: "demo-5",
        label: "Pediatric Asthma — Noah Kim",
        patient: { name: "Noah Kim", mrn: "MRN-5005", age: 8, gender: "Male" },
        vitalSigns: { peakFlow: 210 },
        conditions: ["Asthma"],
        medications: ["Albuterol inhaler (rescue)"],
        wearableStatus: "connected",
        lastSync: "15m ago",
        alerts: ["Lower than expected peak flow for age"]
      },
      {
        id: "demo-6",
        label: "Post-Operative — Carlos Álvarez (Knee replacement, day 5)",
        patient: { name: "Carlos Álvarez", mrn: "MRN-6006", age: 45, gender: "Male" },
        vitalSigns: { painScore: 6 },
        conditions: ["Post-operative (Knee replacement - Day 5)"],
        medications: ["Oxycodone 5 mg PRN"],
        wearableStatus: "connected",
        lastSync: "3m ago",
        alerts: ["Wound clean, dressing intact"]
      }
    ];

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentScreen('overview')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Overview
        </button>

        <div>
          <h3>Clinician Dashboard — Wearable Patient Monitoring</h3>
          <p className="text-sm text-gray-600 mt-1">
            EHR view of patient wearable data with FHIR-compliant scenarios
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {patientScenarios.map((scenario) => (
            <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{scenario.patient.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {scenario.patient.age}y {scenario.patient.gender} • {scenario.patient.mrn}
                    </CardDescription>
                  </div>
                  <StatusChip status={scenario.wearableStatus as DeviceStatus} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {scenario.conditions.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Active Conditions</div>
                    <div className="flex flex-wrap gap-1">
                      {scenario.conditions.map((condition, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-red-50 border-red-200 text-red-700">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs text-gray-600 mb-2">Latest Vital Signs</div>
                  <div className="grid grid-cols-2 gap-2">
                    {scenario.vitalSigns.heartRate && (
                      <div className="bg-red-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                          <Heart className="w-3 h-3" />
                          Heart Rate
                        </div>
                        <div className="text-lg">{scenario.vitalSigns.heartRate} <span className="text-xs text-gray-600">bpm</span></div>
                      </div>
                    )}
                    {scenario.vitalSigns.systolic && scenario.vitalSigns.diastolic && (
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="text-xs text-gray-600 mb-1">Blood Pressure</div>
                        <div className="text-lg">{scenario.vitalSigns.systolic}/{scenario.vitalSigns.diastolic} <span className="text-xs text-gray-600">mmHg</span></div>
                      </div>
                    )}
                    {scenario.vitalSigns.glucose && (
                      <div className="bg-purple-50 rounded-lg p-2">
                        <div className="text-xs text-gray-600 mb-1">Blood Glucose</div>
                        <div className="text-lg">{scenario.vitalSigns.glucose} <span className="text-xs text-gray-600">mg/dL</span></div>
                      </div>
                    )}
                    {scenario.vitalSigns.hba1c && (
                      <div className="bg-purple-50 rounded-lg p-2">
                        <div className="text-xs text-gray-600 mb-1">HbA1c</div>
                        <div className="text-lg">{scenario.vitalSigns.hba1c}<span className="text-xs text-gray-600">%</span></div>
                      </div>
                    )}
                    {scenario.vitalSigns.peakFlow && (
                      <div className="bg-green-50 rounded-lg p-2">
                        <div className="text-xs text-gray-600 mb-1">Peak Flow</div>
                        <div className="text-lg">{scenario.vitalSigns.peakFlow} <span className="text-xs text-gray-600">L/min</span></div>
                      </div>
                    )}
                    {scenario.vitalSigns.painScore !== undefined && (
                      <div className="bg-orange-50 rounded-lg p-2">
                        <div className="text-xs text-gray-600 mb-1">Pain Score</div>
                        <div className="text-lg">{scenario.vitalSigns.painScore}<span className="text-xs text-gray-600">/10</span></div>
                      </div>
                    )}
                    {scenario.vitalSigns.dueDate && (
                      <div className="bg-pink-50 rounded-lg p-2 col-span-2">
                        <div className="text-xs text-gray-600 mb-1">Estimated Due Date</div>
                        <div className="text-base">{scenario.vitalSigns.dueDate}</div>
                      </div>
                    )}
                  </div>
                </div>

                {scenario.medications.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Current Medications</div>
                    <div className="flex flex-wrap gap-1">
                      {scenario.medications.map((med, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {scenario.alerts && scenario.alerts.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs text-amber-900">
                          {scenario.alerts.map((alert, idx) => (
                            <div key={idx}>{alert}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    Last sync: {scenario.lastSync}
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    View Full Chart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Watch className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm text-blue-900 mb-1">FHIR R4 Integration</h4>
                <p className="text-xs text-blue-800">
                  All patient scenarios use FHIR R4 compliant resources: Patient, Condition, MedicationStatement, Observation, AllergyIntolerance, FamilyMemberHistory, and Procedure. Wearable data syncs via HL7 FHIR Observation resources with LOINC codes for standardized clinical interoperability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Placeholder for other screens
  return (
    <div className="space-y-6">
      <button 
        onClick={() => setCurrentScreen('overview')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Overview
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Screen: {currentScreen}</CardTitle>
          <CardDescription>This screen is under construction</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            This screen will include: {currentScreen === 'vendor-oauth' && 'Fitbit OAuth flow, webview, success/failure states'}
            {currentScreen === 'sync-status' && 'Background sync indicator, queued count, retry UI, offline state'}
            {currentScreen === 'revoke-confirm' && 'Confirmation modal, delete vs stop sync options'}
            {currentScreen === 'error-reauth' && 'Token expired, reconnect modal, API failure states'}
            {currentScreen === 'clinician-dashboard' && 'Compact trend sparklines, key metrics, last seen, link to full history'}
          </p>
          
          <Button 
            className="mt-4"
            onClick={() => setCurrentScreen('overview')}
          >
            Return to Overview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}