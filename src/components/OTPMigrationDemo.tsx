import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Smartphone, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Phone, 
  RefreshCw,
  Monitor,
  ChevronLeft,
  Globe,
  Shield,
  Send,
  AlertTriangle,
  HelpCircle,
  X
} from 'lucide-react';

type Screen = 
  | 'platforms'
  | 'invite-landing'
  | 'phone-entry'
  | 'confirm-channel'
  | 'otp-sent'
  | 'otp-input'
  | 'resend-flow'
  | 'expired-code'
  | 'lockout'
  | 'delivery-failure'
  | 'success'
  | 'app-not-installed'
  | 'settings'
  | 'admin-dashboard';

type Platform = 'ios' | 'android' | 'web-mobile' | 'web-desktop';

// Mock frame dimensions
const FRAMES = {
  ios: { width: 390, height: 844, label: 'iOS - iPhone 14 Pro' },
  android: { width: 360, height: 800, label: 'Android' },
  'web-mobile': { width: 412, height: 915, label: 'Mobile Web' },
  'web-desktop': { width: 1440, height: 1024, label: 'Desktop Web' }
};

export function OTPMigrationDemo() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('platforms');
  const [platform, setPlatform] = useState<Platform>('ios');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'email'>('sms');
  const [countdown, setCountdown] = useState(60);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeliveryFailureModal, setShowDeliveryFailureModal] = useState(false);

  const MobileFrame = ({ children }: { children: React.ReactNode }) => {
    const frame = FRAMES[platform];
    const isMobile = platform === 'ios' || platform === 'android' || platform === 'web-mobile';
    
    if (!isMobile) {
      return (
        <div className="w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {children}
        </div>
      );
    }

    return (
      <div className="mx-auto" style={{ width: `${frame.width}px` }}>
        {/* Mobile device frame */}
        <div className="bg-gray-900 rounded-t-[2.5rem] px-6 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="text-white text-sm">9:41</div>
            <div className="w-20 h-6 bg-gray-800 rounded-full" />
            <div className="text-white text-xs">100%</div>
          </div>
        </div>
        <div 
          className="bg-white border-x-2 border-b-2 border-gray-900 rounded-b-[2.5rem] overflow-hidden shadow-2xl"
          style={{ height: `${frame.height}px` }}
        >
          {children}
        </div>
      </div>
    );
  };

  // Platform selection screen
  if (currentScreen === 'platforms') {
    return (
      <div className="space-y-6">
        <div>
          <h2>Phone OTP Migration Flow</h2>
          <p className="text-gray-600 mt-1">
            Complete phone verification and OTP flow across all platforms with Greenway API integration
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Platform & Screen</CardTitle>
            <CardDescription>
              Choose a platform and navigate through the OTP verification flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Platform selection */}
            <div>
              <Label className="mb-3 block">Platform</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(FRAMES).map(([key, frame]) => (
                  <button
                    key={key}
                    onClick={() => setPlatform(key as Platform)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      platform === key
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {key === 'ios' && <Smartphone className="w-8 h-8 text-gray-700" />}
                      {key === 'android' && <Smartphone className="w-8 h-8 text-gray-700" />}
                      {key === 'web-mobile' && <Globe className="w-8 h-8 text-gray-700" />}
                      {key === 'web-desktop' && <Monitor className="w-8 h-8 text-gray-700" />}
                      <div className="text-sm text-center">{frame.label}</div>
                      <div className="text-xs text-gray-500">
                        {frame.width} × {frame.height}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Screen navigation */}
            <div>
              <Label className="mb-3 block">Screens</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'invite-landing', label: 'Invite Landing', icon: Mail },
                  { id: 'phone-entry', label: 'Phone Entry', icon: Phone },
                  { id: 'confirm-channel', label: 'Confirm Channel', icon: CheckCircle },
                  { id: 'otp-sent', label: 'OTP Sent', icon: Send },
                  { id: 'otp-input', label: 'OTP Input', icon: Lock },
                  { id: 'resend-flow', label: 'Resend Flow', icon: RefreshCw },
                  { id: 'expired-code', label: 'Expired Code', icon: Clock },
                  { id: 'lockout', label: 'Lockout Screen', icon: AlertTriangle },
                  { id: 'delivery-failure', label: 'Delivery Failure', icon: AlertCircle },
                  { id: 'success', label: 'Success', icon: CheckCircle },
                  { id: 'app-not-installed', label: 'App Not Installed', icon: Smartphone },
                  { id: 'settings', label: 'Settings/Profile', icon: Shield }
                ].map((screen) => {
                  const Icon = screen.icon;
                  return (
                    <Button
                      key={screen.id}
                      variant="outline"
                      onClick={() => setCurrentScreen(screen.id as Screen)}
                      className="justify-start"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {screen.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API & Component Documentation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                <div className="text-blue-600 mb-1">POST /v1/phone/otp/request</div>
                <div className="text-gray-600">
                  {`{ phone, purpose, channel, correlationId }`}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                <div className="text-blue-600 mb-1">POST /v1/phone/otp/verify</div>
                <div className="text-gray-600">
                  {`{ phone, requestId, code }`}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Error Codes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div><Badge variant="outline">429</Badge> Too many requests</div>
              <div><Badge variant="outline">410</Badge> Code expired</div>
              <div><Badge variant="outline">423</Badge> Account locked</div>
              <div><Badge variant="outline">403</Badge> Opted out of SMS</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Invite Landing Screen
  if (currentScreen === 'invite-landing') {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentScreen('platforms')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Platform Selection
        </button>

        <div className="text-center mb-6">
          <h3>Invite Landing (App Installed)</h3>
          <p className="text-sm text-gray-600 mt-1">Platform: {FRAMES[platform].label}</p>
        </div>

        <MobileFrame>
          <div className="h-full bg-gradient-to-b from-teal-600 to-teal-700 flex flex-col items-center justify-center p-6 text-white">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6">
              <Smartphone className="w-10 h-10 text-teal-600" />
            </div>
            
            <h2 className="text-white text-2xl mb-2">Welcome to BASE Health</h2>
            <p className="text-teal-100 text-center mb-8">
              You've been invited to join your healthcare practice
            </p>

            <div className="w-full bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
              <div className="text-sm text-teal-100 mb-2">Invited by</div>
              <div className="text-white">North Valley Medical Center</div>
            </div>

            <div className="w-full space-y-3">
              <Button 
                className="w-full bg-white text-teal-600 hover:bg-teal-50"
                size="lg"
                onClick={() => setCurrentScreen('phone-entry')}
              >
                Register Now
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-white text-[rgba(22,5,5,0.81)] hover:bg-white/10"
                size="lg"
              >
                Open App
              </Button>
            </div>

            <div className="mt-6 text-xs text-teal-200">
              Already have an account? Sign in
            </div>
          </div>
        </MobileFrame>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Design Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div><strong>Deep Link:</strong> Opens app if installed, shows prefilled data</div>
            <div><strong>CTAs:</strong> "Register" for new users, "Open App" for existing</div>
            <div><strong>States:</strong> App installed vs not installed flow</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Phone Entry Screen
  if (currentScreen === 'phone-entry') {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentScreen('platforms')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Platform Selection
        </button>

        <div className="text-center mb-6">
          <h3>Phone Entry</h3>
          <p className="text-sm text-gray-600 mt-1">Platform: {FRAMES[platform].label}</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4">
              <h3 className="text-white">Verify Your Phone</h3>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="phone" className="mb-2 block">
                    Mobile phone
                  </Label>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 border rounded-lg bg-white w-24">
                      <option>🇺🇸 +1</option>
                      <option>🇨🇦 +1</option>
                      <option>🇬🇧 +44</option>
                      <option>🇦🇺 +61</option>
                    </select>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter your mobile number. We'll send a one-time code. Message & data rates may apply.
                  </p>
                </div>

                <div>
                  <Label htmlFor="email" className="mb-2 block">
                    Email (optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <Checkbox 
                    id="consent"
                    checked={consentAccepted}
                    onCheckedChange={(checked) => setConsentAccepted(checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="consent" className="text-xs leading-relaxed cursor-pointer">
                    I consent to receive verification SMS messages from Greenway. Reply STOP to opt out.
                  </Label>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    size="lg"
                    disabled={!phoneNumber || !consentAccepted}
                    onClick={() => {
                      setSelectedChannel('sms');
                      setShowConfirmModal(true);
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send PIN via SMS
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={!email}
                    onClick={() => {
                      setSelectedChannel('email');
                      setShowConfirmModal(true);
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send via Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </MobileFrame>

        {/* Confirm Channel Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Confirm Verification Method</CardTitle>
                  <button onClick={() => setShowConfirmModal(false)}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {selectedChannel === 'sms' ? (
                    <>
                      <Smartphone className="w-5 h-5 text-teal-600" />
                      <div className="flex-1">
                        <div className="text-sm">SMS to</div>
                        <div>{phoneNumber}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 text-teal-600" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Email to</div>
                        <div>{email}</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  Code expires in 5 minutes
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Change channel
                  </Button>
                  <Button 
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setCurrentScreen('otp-sent');
                    }}
                  >
                    Send Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Design Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div><strong>Country Selector:</strong> Searchable dropdown with flags</div>
            <div><strong>Phone Format:</strong> E.164 hint, auto-formatting</div>
            <div><strong>TCPA Consent:</strong> Required checkbox before sending</div>
            <div><strong>Dual Channel:</strong> SMS (primary) and Email (fallback)</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // OTP Sent Screen
  if (currentScreen === 'otp-sent') {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentScreen('platforms')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Platform Selection
        </button>

        <div className="text-center mb-6">
          <h3>OTP Sent</h3>
          <p className="text-sm text-gray-600 mt-1">Platform: {FRAMES[platform].label}</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center gap-3">
              <button onClick={() => setCurrentScreen('phone-entry')}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-white">Verification Code</h3>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <Send className="w-10 h-10 text-teal-600" />
              </div>

              <h3 className="text-xl mb-2">Code Sent!</h3>
              
              <p className="text-center text-gray-600 mb-6">
                We've sent a 6-digit code to<br/>
                <strong>+1 ••• ••• •4567</strong><br/>
                It expires in <strong className="text-teal-600">05:00</strong>
              </p>

              <div className="w-full max-w-sm space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Resend available in <strong className="text-teal-600">00:{countdown.toString().padStart(2, '0')}</strong></span>
                </div>

                <Button 
                  variant="outline"
                  className="w-full"
                  disabled={countdown > 0}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Code
                </Button>

                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => setCurrentScreen('otp-input')}
                >
                  Enter Code
                </Button>

                <div className="text-center">
                  <button className="text-sm text-blue-600 hover:underline flex items-center gap-1 mx-auto">
                    <HelpCircle className="w-4 h-4" />
                    Didn't receive the code?
                  </button>
                </div>

                <div className="text-center pt-4 border-t">
                  <button className="text-sm text-gray-600 hover:text-gray-900">
                    Wrong number? Change phone
                  </button>
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
            <div><strong>Masked Display:</strong> Show last 4 digits only (+1 ••• ••• •1234)</div>
            <div><strong>Countdown Timer:</strong> 60s cooldown before resend enabled</div>
            <div><strong>Help Link:</strong> "Didn't receive?" leads to troubleshooting</div>
            <div><strong>Change Number:</strong> Return to phone entry</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // OTP Input Screen
  if (currentScreen === 'otp-input') {
    const remainingAttempts = 5 - attemptCount;
    const hasError = attemptCount > 0;
    const VALID_PIN = '123456';

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentScreen('platforms')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Platform Selection
        </button>

        <div className="text-center mb-6">
          <h3>OTP Input</h3>
          <p className="text-sm text-gray-600 mt-1">Platform: {FRAMES[platform].label}</p>
        </div>

        {/* Demo Instructions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <strong>Demo PIN:</strong> Use <code className="bg-blue-100 px-2 py-0.5 rounded">123456</code> to successfully verify. Any other code will show an error.
              </div>
            </div>
          </CardContent>
        </Card>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center gap-3">
              <button onClick={() => setCurrentScreen('otp-sent')}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-white">Enter Code</h3>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <div className="space-y-6">
                <div>
                  <div className="text-center mb-6">
                    <p className="text-gray-600">
                      Enter the 6-digit code sent to<br/>
                      <strong>+1 ••• ••• •4567</strong>
                    </p>
                  </div>

                  {/* OTP Input Boxes */}
                  <div className="flex gap-2 justify-center mb-4">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={otpCode[index]}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          
                          if (!value) {
                            // Clear current field
                            const newCode = [...otpCode];
                            newCode[index] = '';
                            setOtpCode(newCode);
                            return;
                          }
                          
                          const newCode = [...otpCode];
                          
                          // Distribute the digits starting from current index
                          for (let i = 0; i < value.length && (index + i) < 6; i++) {
                            newCode[index + i] = value[i];
                          }
                          
                          setOtpCode(newCode);
                          
                          // Focus the next empty field or the last field
                          const nextEmptyIndex = newCode.findIndex((d, i) => !d && i > index);
                          if (nextEmptyIndex !== -1) {
                            const nextInput = document.querySelector(`input[name="otp-${nextEmptyIndex}"]`) as HTMLInputElement;
                            nextInput?.focus();
                          } else if (value.length > 1 || otpCode[index]) {
                            // If we filled multiple or current had value, move to next or last
                            const focusIndex = Math.min(index + value.length, 5);
                            const inputToFocus = document.querySelector(`input[name="otp-${focusIndex}"]`) as HTMLInputElement;
                            inputToFocus?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          // Handle backspace
                          if (e.key === 'Backspace') {
                            if (!otpCode[index] && index > 0) {
                              // If current field is empty, go to previous and clear it
                              const newCode = [...otpCode];
                              newCode[index - 1] = '';
                              setOtpCode(newCode);
                              const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`) as HTMLInputElement;
                              prevInput?.focus();
                            } else if (otpCode[index]) {
                              // Clear current field
                              const newCode = [...otpCode];
                              newCode[index] = '';
                              setOtpCode(newCode);
                            }
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
                          const newCode = [...otpCode];
                          
                          for (let i = 0; i < pastedData.length && i < 6; i++) {
                            newCode[i] = pastedData[i];
                          }
                          
                          setOtpCode(newCode);
                          
                          // Focus the last filled input or the next empty one
                          const nextEmptyIndex = newCode.findIndex(d => !d);
                          const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
                          const inputToFocus = document.querySelector(`input[name="otp-${focusIndex}"]`) as HTMLInputElement;
                          inputToFocus?.focus();
                        }}
                        onFocus={(e) => {
                          // Select all on focus for easier replacement
                          e.target.select();
                        }}
                        name={`otp-${index}`}
                        className={`w-12 h-14 text-center text-xl border-2 rounded-lg ${
                          hasError ? 'border-red-500' : 'border-gray-300 focus:border-teal-600'
                        } focus:outline-none`}
                        aria-label={`Digit ${index + 1} of 6`}
                      />
                    ))}
                  </div>

                  <div className="text-center text-xs text-gray-500 mb-4">
                    Paste support enabled • Expires in 04:23
                  </div>

                  {/* Error Message */}
                  {hasError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-900">
                        That code is incorrect. You have <strong>{remainingAttempts} attempts</strong> left.
                      </div>
                    </div>
                  )}

                  {/* Remaining Attempts Indicator */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {remainingAttempts} attempts remaining
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    size="lg"
                    disabled={otpCode.some(d => !d)}
                    onClick={() => {
                      const enteredCode = otpCode.join('');
                      
                      // Check if correct PIN
                      if (enteredCode === VALID_PIN) {
                        setCurrentScreen('success');
                        setAttemptCount(0); // Reset for next time
                      } else {
                        // Incorrect PIN
                        if (attemptCount < 4) {
                          setAttemptCount(attemptCount + 1);
                          // Clear the OTP fields on error
                          setOtpCode(['', '', '', '', '', '']);
                          // Focus first input
                          setTimeout(() => {
                            const firstInput = document.querySelector('input[name="otp-0"]') as HTMLInputElement;
                            firstInput?.focus();
                          }, 100);
                        } else {
                          setCurrentScreen('lockout');
                        }
                      }
                    }}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Verify
                  </Button>

                  <div className="text-center">
                    <button 
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => setCurrentScreen('resend-flow')}
                    >
                      Resend code
                    </button>
                  </div>
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
            <div><strong>6-Digit Input:</strong> Segmented boxes with auto-focus</div>
            <div><strong>Paste Support:</strong> Detects clipboard and auto-fills</div>
            <div><strong>Accessibility:</strong> "Digit X of 6" labels for screen readers</div>
            <div><strong>Attempts:</strong> Show remaining attempts (5 max)</div>
            <div><strong>Error State:</strong> Red border + inline message</div>
            <div><strong>Backspace:</strong> Auto-focus previous field when empty</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Lockout Screen
  if (currentScreen === 'lockout') {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentScreen('platforms')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Platform Selection
        </button>

        <div className="text-center mb-6">
          <h3>Account Lockout</h3>
          <p className="text-sm text-gray-600 mt-1">Platform: {FRAMES[platform].label}</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col items-center justify-center p-6 bg-red-50">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-red-600" />
            </div>

            <h3 className="text-xl mb-2 text-center">Account Locked</h3>
            
            <p className="text-center text-gray-700 mb-6">
              Too many incorrect attempts. For your security, SMS verification is locked until:
            </p>

            <div className="bg-white border-2 border-red-200 rounded-lg p-4 mb-6">
              <div className="text-center">
                <div className="text-2xl text-red-600 mb-1">15:23</div>
                <div className="text-sm text-gray-600">November 22, 2025 at 4:45 PM</div>
              </div>
            </div>

            <div className="w-full max-w-sm space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-sm">
                  <strong>What to do next:</strong>
                  <ul className="mt-2 space-y-1 text-xs list-disc list-inside">
                    <li>Wait for the lockout period to expire</li>
                    <li>Try verification via Email instead</li>
                    <li>Contact support for assistance</li>
                  </ul>
                </div>
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Mail className="w-4 h-4 mr-2" />
                Try Email Verification
              </Button>

              <Button 
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact Support
              </Button>

              <div className="text-center text-xs text-gray-500 pt-4">
                Support: (555) 123-4567<br/>
                Monday-Friday 8am-8pm ET
              </div>
            </div>
          </div>
        </MobileFrame>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Security Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div><strong>Lockout Duration:</strong> 15 minutes after 5 failed attempts</div>
            <div><strong>API Response:</strong> 423 status with lockoutExpires timestamp</div>
            <div><strong>Alternative:</strong> Email verification remains available</div>
            <div><strong>Support:</strong> Clear contact info and hours</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success Screen
  if (currentScreen === 'success') {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentScreen('platforms')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Platform Selection
        </button>

        <div className="text-center mb-6">
          <h3>Verification Success</h3>
          <p className="text-sm text-gray-600 mt-1">Platform: {FRAMES[platform].label}</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-white">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>

            <h2 className="text-2xl mb-2">Phone Verified!</h2>
            
            <p className="text-center text-gray-600 mb-2">
              Your phone number has been successfully verified.
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <Clock className="w-4 h-4" />
              Verified at November 22, 2025 • 3:42 PM
            </div>

            <div className="w-full max-w-sm space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <strong>Your phone is now secure</strong>
                    <div className="text-xs mt-1 text-blue-700">
                      We'll use this number for account recovery and important notifications.
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700"
                size="lg"
                onClick={() => setCurrentScreen('platforms')}
              >
                Continue to Registration
              </Button>

              <div className="text-center text-xs text-gray-500">
                You can manage your phone numbers in Settings
              </div>
            </div>
          </div>
        </MobileFrame>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Success State
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div><strong>Timestamp:</strong> Show exact verification time</div>
            <div><strong>Next Step:</strong> Clear CTA for continuing registration</div>
            <div><strong>Security Note:</strong> Explain how phone will be used</div>
            <div><strong>Settings Link:</strong> Where to manage phone numbers later</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Settings/Profile Screen
  if (currentScreen === 'settings') {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentScreen('platforms')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Platform Selection
        </button>

        <div className="text-center mb-6">
          <h3>Settings - Phone Numbers</h3>
          <p className="text-sm text-gray-600 mt-1">Platform: {FRAMES[platform].label}</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4">
              <h3 className="text-white">Phone Numbers</h3>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="space-y-4">
                {/* Primary Phone */}
                <Card className="border-teal-200 bg-teal-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-teal-600" />
                        <div>
                          <div className="text-sm">+1 (555) 123-4567</div>
                          <div className="text-xs text-gray-600 mt-0.5">Mobile</div>
                        </div>
                      </div>
                      <Badge className="bg-teal-600">Primary</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Verified Nov 22, 2025 at 3:42 PM
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Secondary Phone */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="text-sm">+1 (555) 987-6543</div>
                          <div className="text-xs text-gray-600 mt-0.5">Home</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Verified Oct 15, 2025
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Set as Primary
                      </Button>
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Add New Phone */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setCurrentScreen('phone-entry')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Add Phone Number
                </Button>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-6">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-900">
                      <strong>Phone Number Security</strong>
                      <div className="mt-1">
                        Your verified phone numbers are used for account recovery, two-factor authentication, and important notifications.
                      </div>
                    </div>
                  </div>
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
            <div><strong>Multiple Numbers:</strong> Support primary + secondary phones</div>
            <div><strong>Verification Status:</strong> Show timestamp of last verification</div>
            <div><strong>Actions:</strong> Edit, Set Primary, Remove, Re-verify</div>
            <div><strong>Add New:</strong> Navigate to phone entry flow</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Other screens (resend, expired, delivery failure, app not installed)
  return (
    <div className="space-y-6">
      <button 
        onClick={() => setCurrentScreen('platforms')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Platform Selection
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Screen: {currentScreen}</CardTitle>
          <CardDescription>This screen is under construction</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Select a different screen from the platform selection page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}