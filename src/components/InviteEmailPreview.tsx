import { Mail, Shield, Clock, Monitor, Smartphone, Star, Archive, Trash2, MoreVertical, ArrowLeft, Printer } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';

export function InviteEmailPreview() {
  const [viewMode, setViewMode] = useState<'web' | 'mobile'>('web');

  useEffect(() => {
    console.log('[InviteEmailPreview] Component mounted');
    console.log('[InviteEmailPreview] Current view mode:', viewMode);
  }, [viewMode]);

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-center gap-2 pb-2">
        <Button
          variant={viewMode === 'web' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            console.log('[InviteEmailPreview] Switching to web view');
            setViewMode('web');
          }}
          className="gap-2"
        >
          <Monitor className="w-4 h-4" />
          Web View
        </Button>
        <Button
          variant={viewMode === 'mobile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            console.log('[InviteEmailPreview] Switching to mobile view');
            setViewMode('mobile');
          }}
          className="gap-2"
        >
          <Smartphone className="w-4 h-4" />
          Mobile View
        </Button>
      </div>

      <div className={`mx-auto transition-all duration-300 ${viewMode === 'mobile' ? 'max-w-sm' : 'w-full'}`}>
        {/* Mobile Device Frame */}
        {viewMode === 'mobile' && (
          <div>
            <div className="text-center space-y-2 pb-4">
              <Mail className="w-12 h-12 mx-auto text-blue-600" />
              <h3>Email Preview</h3>
              <p className="text-sm text-gray-600">This is what the invited user will receive</p>
            </div>
            <div className="bg-gray-900 rounded-3xl p-3 mx-auto" style={{ maxWidth: '400px' }}>
              <div className="bg-white rounded-2xl overflow-hidden">
                <EmailContent isMobile={true} />
              </div>
            </div>
          </div>
        )}

        {/* Web View - Desktop Email Client */}
        {viewMode === 'web' && (
          <div>
            <div className="text-center space-y-2 pb-4">
              <Monitor className="w-12 h-12 mx-auto text-blue-600" />
              <h3>Desktop Email Client Preview</h3>
              <p className="text-sm text-gray-600">This is what the invited user will see in their email client</p>
            </div>
            
            {/* Desktop Email Client Frame */}
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-xl">
              {/* Email Client Header */}
              <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">Inbox</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              {/* Email Toolbar */}
              <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Star className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Printer className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Two Column Layout: Inbox List + Email Content */}
              <div className="flex">
                {/* Email List Sidebar */}
                <div className="w-64 border-r border-gray-200 bg-gray-50 flex-shrink-0">
                  <div className="p-2 border-b border-gray-200 bg-white">
                    <input 
                      type="text" 
                      placeholder="Search mail" 
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  
                  {/* Email List Items */}
                  <div className="divide-y divide-gray-200">
                    {/* Selected Email */}
                    <div className="p-2 bg-blue-50 border-l-4 border-blue-600 cursor-pointer">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-xs truncate flex-1">Healthcare Partners</div>
                        <div className="text-[10px] text-gray-500 ml-2">10:30 AM</div>
                      </div>
                      <div className="text-xs truncate mb-1">Welcome to Admin Hub</div>
                      <div className="text-[10px] text-gray-600 truncate">You've been invited...</div>
                    </div>
                    
                    {/* Other Emails */}
                    <div className="p-2 hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-xs text-gray-500 truncate flex-1">System Admin</div>
                        <div className="text-[10px] text-gray-500 ml-2">Yesterday</div>
                      </div>
                      <div className="text-xs text-gray-500 truncate mb-1">Weekly Update</div>
                      <div className="text-[10px] text-gray-500 truncate">System updated...</div>
                    </div>
                    
                    <div className="p-2 hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-xs text-gray-500 truncate flex-1">Support Team</div>
                        <div className="text-[10px] text-gray-500 ml-2">Nov 17</div>
                      </div>
                      <div className="text-xs text-gray-500 truncate mb-1">Ticket Resolved</div>
                      <div className="text-[10px] text-gray-500 truncate">Ticket resolved...</div>
                    </div>
                    
                    <div className="p-2 hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-xs text-gray-500 truncate flex-1">IT Department</div>
                        <div className="text-[10px] text-gray-500 ml-2">Nov 15</div>
                      </div>
                      <div className="text-xs text-gray-500 truncate mb-1">Security Update</div>
                      <div className="text-[10px] text-gray-500 truncate">Update password...</div>
                    </div>
                  </div>
                </div>

                {/* Email Content */}
                <div className="flex-1 min-w-0">
                  {/* Email Header Info */}
                  <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="text-base truncate">Welcome to Healthcare Partners Admin Hub</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                              HP
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs truncate">Healthcare Partners</div>
                              <div className="text-[10px] text-gray-500 truncate">noreply@healthcarepartners.com</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 ml-2 flex-shrink-0">
                        Nov 18, 10:30 AM
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="text-gray-500">to:</span> sjohnson@clinic.com
                    </div>
                  </div>

                  {/* Email Content Area - with scrolling */}
                  <div className="bg-gray-50 px-4 py-4 max-h-[600px] overflow-y-auto">
                    <EmailContent isMobile={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmailContent({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      {/* Email Mockup */}
      <Card className="border-2">
        <CardContent className="p-0">
          {/* Email Header */}
          <div className={`bg-blue-600 text-white text-center ${isMobile ? 'p-4' : 'p-6'}`}>
            <h2 className={`text-white ${isMobile ? 'text-base' : ''}`}>Healthcare Partners Medical Group</h2>
            <p className={`text-blue-100 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Administrator Hub Invitation</p>
          </div>

          {/* Email Body */}
          <div className={`bg-white space-y-6 ${isMobile ? 'p-4' : 'p-8'}`}>
            <div className="space-y-2">
              <h3 className={`text-gray-900 ${isMobile ? 'text-base' : ''}`}>Welcome to the Admin Hub!</h3>
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : ''}`}>
                You've been invited to join the Healthcare Partners Medical Group Administrator Hub.
              </p>
            </div>

            <div className={`bg-gray-50 rounded-lg space-y-2 ${isMobile ? 'p-3' : 'p-4'}`}>
              <div className="flex items-start gap-3">
                <Shield className={`text-blue-600 mt-0.5 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Your assigned role:</div>
                  <div className={`text-blue-600 ${isMobile ? 'text-sm' : ''}`}>Clinical Staff</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Click the button below to set up your account and create your password. You'll also be prompted to set up multi-factor authentication (MFA) for added security.
              </p>
              
              <div className={`text-center ${isMobile ? 'py-2' : 'py-4'}`}>
                <Button className={`w-full max-w-md bg-blue-600 hover:bg-blue-700 ${isMobile ? 'text-xs py-2' : ''}`}>
                  Accept Invite & Set Up Account
                </Button>
              </div>
            </div>

            <div className={`border-t space-y-3 ${isMobile ? 'pt-3' : 'pt-4'}`}>
              <div className={`flex items-start gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <Clock className={`text-amber-600 mt-0.5 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                <div className="text-gray-600">
                  <span>This invitation will expire in 7 days</span>
                  <div className={`text-gray-500 mt-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Expires on Nov 25, 2025</div>
                </div>
              </div>

              <div className={`text-gray-500 space-y-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                <p>For security reasons, do not share this invitation link with anyone.</p>
              </div>
            </div>

            <div className={`border-t text-gray-500 text-center ${isMobile ? 'pt-3 text-[10px]' : 'pt-4 text-xs'}`}>
              <p>Healthcare Partners Medical Group</p>
              <p>123 Healthcare Avenue, Medical City, CA 90210</p>
              <p className="mt-2">Questions? Contact your administrator or call (555) 100-0000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* After clicking the button */}
      <div className={`space-y-4 ${isMobile ? 'pt-4 px-4' : 'pt-6 px-6'}`}>
        <div className="text-center">
          <div className={`inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full ${isMobile ? 'text-xs' : 'text-sm'}`}>
            After clicking "Accept Invite & Set Up Account"
          </div>
        </div>

        <Card>
          <CardContent className={`space-y-4 ${isMobile ? 'p-4' : 'p-6'}`}>
            <h4 className={`text-center ${isMobile ? 'text-sm' : ''}`}>Account Setup Flow</h4>
            <div className="space-y-3">
              <div className={`flex items-center gap-3 bg-gray-50 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
                <div className={`rounded-full bg-blue-600 text-white flex items-center justify-center ${isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'}`}>1</div>
                <div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Verify Email & Create Password</div>
                  <div className={`text-gray-600 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Set a strong password for your account</div>
                </div>
              </div>

              <div className={`flex items-center gap-3 bg-gray-50 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
                <div className={`rounded-full bg-blue-600 text-white flex items-center justify-center ${isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'}`}>2</div>
                <div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Set Up Multi-Factor Authentication (MFA)</div>
                  <div className={`text-gray-600 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Scan QR code with authenticator app</div>
                </div>
              </div>

              <div className={`flex items-center gap-3 bg-gray-50 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
                <div className={`rounded-full bg-blue-600 text-white flex items-center justify-center ${isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'}`}>3</div>
                <div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Complete Profile Setup</div>
                  <div className={`text-gray-600 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Add your name and preferences</div>
                </div>
              </div>

              <div className={`flex items-center gap-3 bg-gray-50 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
                <div className={`rounded-full bg-green-600 text-white flex items-center justify-center ${isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'}`}>✓</div>
                <div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Access Admin Hub</div>
                  <div className={`text-gray-600 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Start managing your organization</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}