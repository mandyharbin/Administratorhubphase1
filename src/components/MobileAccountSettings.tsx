import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { ChevronLeft, Edit, Check, X, Shield, Smartphone, Mail, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UserSettings {
  personal: {
    firstName: string;
    middleName: string;
    lastName: string;
    preferredName: string;
    dob: string;
    gender: string;
    ssn: string;
  };
  contact: {
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    emergencyContact: string;
    emergencyPhone: string;
    emergencyRelationship: string;
  };
  preferences: {
    language: string;
    notificationMethods: string[];
    communicationPreference: string;
    appointmentReminders: boolean;
    labResultNotifications: boolean;
    marketingCommunications: boolean;
  };
  security: {
    mfaEnabled: boolean;
    mfaMethod: string;
    lastPasswordChange: string;
    loginHistory: Array<{
      date: string;
      device: string;
      location: string;
    }>;
  };
}

interface MobileAccountSettingsProps {
  patientId: string;
  onBack: () => void;
}

export function MobileAccountSettings({ patientId, onBack }: MobileAccountSettingsProps) {
  const [settingsTab, setSettingsTab] = useState<'personal' | 'contact' | 'preferences' | 'security'>('personal');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, [patientId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/user-settings/${patientId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/user-settings/${patientId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(settings)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Settings saved successfully');
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updatePersonal = (field: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      personal: { ...settings.personal, [field]: value }
    });
  };

  const updateContact = (field: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      contact: { ...settings.contact, [field]: value }
    });
  };

  const updatePreferences = (field: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      preferences: { ...settings.preferences, [field]: value }
    });
  };

  const toggleNotificationMethod = (method: string) => {
    if (!settings) return;
    const methods = settings.preferences.notificationMethods;
    const updated = methods.includes(method)
      ? methods.filter(m => m !== method)
      : [...methods, method];
    updatePreferences('notificationMethods', updated);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading settings...</div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-sm text-gray-600">Failed to load settings</div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-teal-600 text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20 p-2"
            onClick={() => {
              setIsEditingProfile(false);
              onBack();
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-base">Account Settings</h3>
        </div>
        {!isEditingProfile && (settingsTab === 'personal' || settingsTab === 'contact') && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20 p-2"
            onClick={() => setIsEditingProfile(true)}
          >
            <Edit className="w-5 h-5" />
          </Button>
        )}
        {isEditingProfile && (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 p-2"
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Check className="w-5 h-5" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 p-2"
              onClick={() => {
                setIsEditingProfile(false);
                loadSettings();
              }}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="flex">
          <button
            onClick={() => {
              setSettingsTab('personal');
              setIsEditingProfile(false);
            }}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
              settingsTab === 'personal'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600'
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => {
              setSettingsTab('contact');
              setIsEditingProfile(false);
            }}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
              settingsTab === 'contact'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600'
            }`}
          >
            Contact
          </button>
          <button
            onClick={() => {
              setSettingsTab('preferences');
              setIsEditingProfile(false);
            }}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
              settingsTab === 'preferences'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600'
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => {
              setSettingsTab('security');
              setIsEditingProfile(false);
            }}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
              settingsTab === 'security'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600'
            }`}
          >
            Security
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4 pb-32">
            
            {/* Personal Tab */}
            {settingsTab === 'personal' && (
              <>
                {/* Basic Information */}
                <div className="bg-white rounded-xl p-4 space-y-3">
                  <h4 className="text-xs text-gray-700">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600">First Name</Label>
                      <Input 
                        value={settings.personal.firstName}
                        onChange={(e) => updatePersonal('firstName', e.target.value)}
                        readOnly={!isEditingProfile}
                        className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Middle Name</Label>
                      <Input 
                        value={settings.personal.middleName}
                        onChange={(e) => updatePersonal('middleName', e.target.value)}
                        readOnly={!isEditingProfile}
                        className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Last Name</Label>
                      <Input 
                        value={settings.personal.lastName}
                        onChange={(e) => updatePersonal('lastName', e.target.value)}
                        readOnly={!isEditingProfile}
                        className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Preferred Name</Label>
                      <Input 
                        value={settings.personal.preferredName}
                        onChange={(e) => updatePersonal('preferredName', e.target.value)}
                        readOnly={!isEditingProfile}
                        className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Date of Birth</Label>
                      <Input 
                        type="date"
                        value={settings.personal.dob}
                        onChange={(e) => updatePersonal('dob', e.target.value)}
                        readOnly={!isEditingProfile}
                        className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Contact Tab */}
            {settingsTab === 'contact' && (
              <>
                {/* Mailing Address */}
                <div className="bg-white rounded-xl p-4 space-y-3">
                  <h4 className="text-xs text-gray-700">Mailing Address</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600">Address 1</Label>
                      <Input 
                        value={settings.contact.address1}
                        onChange={(e) => updateContact('address1', e.target.value)}
                        readOnly={!isEditingProfile}
                        className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Address 2</Label>
                      <Input 
                        value={settings.contact.address2}
                        onChange={(e) => updateContact('address2', e.target.value)}
                        readOnly={!isEditingProfile}
                        className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-600">City</Label>
                        <Input 
                          value={settings.contact.city}
                          onChange={(e) => updateContact('city', e.target.value)}
                          readOnly={!isEditingProfile}
                          className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">State</Label>
                        <Input 
                          value={settings.contact.state}
                          onChange={(e) => updateContact('state', e.target.value)}
                          readOnly={!isEditingProfile}
                          className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">ZIP Code</Label>
                      <Input 
                        value={settings.contact.zip}
                        onChange={(e) => updateContact('zip', e.target.value)}
                        readOnly={!isEditingProfile}
                        className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl p-4 space-y-3">
                  <h4 className="text-xs text-gray-700">Contact Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600">Phone</Label>
                      <Input 
                        value={settings.contact.phone}
                        onChange={(e) => updateContact('phone', e.target.value)}
                        readOnly={!isEditingProfile}
                        className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Email</Label>
                      <Input 
                        type="email"
                        value={settings.contact.email}
                        onChange={(e) => updateContact('email', e.target.value)}
                        readOnly={!isEditingProfile}
                        className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white rounded-xl p-4 space-y-3">
                  <h4 className="text-xs text-gray-700">Emergency Contact</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600">Name</Label>
                      <Input 
                        value={settings.contact.emergencyContact}
                        onChange={(e) => updateContact('emergencyContact', e.target.value)}
                        readOnly={!isEditingProfile}
                        className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Phone</Label>
                      <Input 
                        value={settings.contact.emergencyPhone}
                        onChange={(e) => updateContact('emergencyPhone', e.target.value)}
                        readOnly={!isEditingProfile}
                        className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Relationship</Label>
                      <Input 
                        value={settings.contact.emergencyRelationship}
                        onChange={(e) => updateContact('emergencyRelationship', e.target.value)}
                        readOnly={!isEditingProfile}
                        className={`text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Preferences Tab */}
            {settingsTab === 'preferences' && (
              <>
                {/* Notification Methods */}
                <div className="bg-white rounded-xl p-4 space-y-3">
                  <h4 className="text-xs text-gray-700">Notification Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">Push Notifications</span>
                      </div>
                      <Switch
                        checked={settings.preferences.notificationMethods.includes('push')}
                        onCheckedChange={() => toggleNotificationMethod('push')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">Email</span>
                      </div>
                      <Switch
                        checked={settings.preferences.notificationMethods.includes('email')}
                        onCheckedChange={() => toggleNotificationMethod('email')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">SMS</span>
                      </div>
                      <Switch
                        checked={settings.preferences.notificationMethods.includes('sms')}
                        onCheckedChange={() => toggleNotificationMethod('sms')}
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white rounded-xl p-4 space-y-3">
                  <h4 className="text-xs text-gray-700">Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Appointment Reminders</span>
                      <Switch
                        checked={settings.preferences.appointmentReminders}
                        onCheckedChange={(checked) => updatePreferences('appointmentReminders', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lab Result Notifications</span>
                      <Switch
                        checked={settings.preferences.labResultNotifications}
                        onCheckedChange={(checked) => updatePreferences('labResultNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Marketing Communications</span>
                      <Switch
                        checked={settings.preferences.marketingCommunications}
                        onCheckedChange={(checked) => updatePreferences('marketingCommunications', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={saveSettings}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </>
            )}

            {/* Security Tab */}
            {settingsTab === 'security' && (
              <>
                {/* MFA Settings */}
                <div className="bg-white rounded-xl p-4 space-y-3">
                  <h4 className="text-xs text-gray-700">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm mb-1">MFA Status</div>
                      <Badge className={settings.security.mfaEnabled ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                        <Shield className="w-3 h-3 mr-1" />
                        {settings.security.mfaEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                  {settings.security.mfaEnabled && (
                    <div className="text-xs text-gray-600">
                      Method: {settings.security.mfaMethod === 'authenticator' ? 'Authenticator App' : 'SMS'}
                    </div>
                  )}
                </div>

                {/* Login History */}
                <div className="bg-white rounded-xl p-4 space-y-3">
                  <h4 className="text-xs text-gray-700">Recent Login Activity</h4>
                  <div className="space-y-2">
                    {settings.security.loginHistory.map((login, idx) => (
                      <div key={idx} className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
                        <Smartphone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs">{login.device}</div>
                          <div className="text-xs text-gray-600">{login.location}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(login.date).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Password */}
                <div className="bg-white rounded-xl p-4 space-y-3">
                  <h4 className="text-xs text-gray-700">Password</h4>
                  <div className="text-xs text-gray-600">
                    Last changed: {new Date(settings.security.lastPasswordChange).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full text-sm"
                    onClick={() => toast.info('Password change coming soon')}
                  >
                    Change Password
                  </Button>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
