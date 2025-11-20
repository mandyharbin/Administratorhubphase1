/**
 * Staff Response Channel Preview
 * Shows how a staff member's response appears to the patient across different
 * communication channels (Email, SMS, Push Notification)
 */

import { useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Mail, MessageSquare, Bell, CheckCheck, Clock, MapPin, Calendar, X } from 'lucide-react';
import { PatientAppDemo } from './PatientAppDemo';

export default function StaffResponseChannelPreview() {
  const [currentTime] = useState(new Date());
  const [showPatientApp, setShowPatientApp] = useState(false);

  const handleOpenApp = useCallback(() => {
    setShowPatientApp(true);
  }, []);

  const handleCloseApp = useCallback(() => {
    setShowPatientApp(false);
  }, []);

  // Generic message content that would be sent across all channels
  const staffMessage = {
    subject: "Response from Peachtree Family Practice",
    staffName: "Sarah Johnson",
    staffTitle: "Patient Coordinator",
    practiceName: "Peachtree Family Practice",
    practicePhone: "(404) 555-0123",
    message: "Hi Amanda, thank you for reaching out. I've reviewed your request for a prescription refill. Your refill has been sent to CVS Pharmacy on Peachtree Street and should be ready for pickup by 3 PM today. If you have any questions, feel free to reply or call us directly.",
    timestamp: currentTime
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl">Staff Response Across Contact Methods</h1>
        <p className="text-gray-600">
          When a practice staff member responds to a patient, the message is delivered through the patient's chosen contact method
        </p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="push" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Push Notification
          </TabsTrigger>
        </TabsList>

        {/* Email View */}
        <TabsContent value="email" className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Email Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-white font-medium">{staffMessage.practiceName}</h2>
                    <p className="text-blue-100 text-sm">Secure Patient Message</p>
                  </div>
                </div>
              </div>

              {/* Email Meta */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-500 w-16">From:</span>
                    <div>
                      <p className="text-gray-900">{staffMessage.staffName}</p>
                      <p className="text-gray-500 text-xs">{staffMessage.staffTitle} • {staffMessage.practiceName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-500 w-16">To:</span>
                    <p className="text-gray-900">Amanda Thompson</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-500 w-16">Date:</span>
                    <p className="text-gray-900">
                      {currentTime.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-500 w-16">Subject:</span>
                    <p className="text-gray-900">{staffMessage.subject}</p>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="px-6 py-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 leading-relaxed mb-4">
                    Hi Amanda,
                  </p>
                  <p className="text-gray-800 leading-relaxed mb-4">
                    You have received a response from {staffMessage.practiceName} regarding your recent inquiry.
                  </p>
                  <p className="text-gray-800 leading-relaxed mb-6">
                    For your security and privacy, please access your message through our secure patient app.
                  </p>
                  
                  {/* CTA Button */}
                  <div className="flex justify-center my-6">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2" onClick={handleOpenApp}>
                      <MessageSquare className="w-5 h-5" />
                      Open Patient App to View Message
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 italic">
                    Don't have the app yet? Download it from the App Store or Google Play.
                  </p>
                </div>

                {/* Email Signature */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm space-y-1">
                    <p className="text-gray-900">{staffMessage.staffName}</p>
                    <p className="text-gray-600">{staffMessage.staffTitle}</p>
                    <p className="text-gray-900">{staffMessage.practiceName}</p>
                    <p className="text-gray-600">{staffMessage.practicePhone}</p>
                  </div>
                </div>
              </div>

              {/* Email Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  This is a secure message from your healthcare provider. Please do not share sensitive health information via unsecured email replies.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SMS View */}
        <TabsContent value="sms" className="space-y-4">
          <div className="bg-gray-100 rounded-lg p-6">
            {/* Mobile Phone Frame */}
            <div className="max-w-sm mx-auto">
              <div className="bg-black rounded-[3rem] p-3 shadow-2xl">
                {/* Phone Notch */}
                <div className="bg-gray-900 rounded-[2.5rem] overflow-hidden">
                  <div className="h-6 bg-gray-900 flex items-center justify-center">
                    <div className="w-20 h-4 bg-black rounded-full"></div>
                  </div>

                  {/* SMS Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        <span className="text-sm">PT</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{staffMessage.practiceName}</p>
                        <p className="text-xs text-gray-500">{staffMessage.practicePhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* SMS Messages */}
                  <div className="bg-white px-4 py-6 h-[600px] overflow-y-auto">
                    <div className="space-y-4">
                      {/* Patient's Previous Message - REMOVED */}

                      {/* Staff Response */}
                      <div className="flex justify-start">
                        <div className="max-w-[85%]">
                          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                            <p className="text-xs text-gray-600 mb-1">{staffMessage.practiceName}</p>
                            <p className="text-sm text-gray-900 leading-relaxed">
                              You have received a response from {staffMessage.practiceName} in the patient app. Open the app to view your message.
                            </p>
                            <button className="mt-2 text-sm text-blue-600 underline" onClick={handleOpenApp}>
                              Open App
                            </button>
                          </div>
                          <div className="flex items-center gap-1 mt-1 px-2">
                            <span className="text-xs text-gray-400">
                              {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Auto-reply notice */}
                      <div className="flex justify-center">
                        <div className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                          <p className="text-xs text-blue-700">Reply to continue this conversation</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SMS Input (disabled) */}
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="bg-white border border-gray-300 rounded-full px-4 py-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Text Message</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-900 mb-1">SMS notifications do not include the actual message content for HIPAA compliance. Patients are directed to open the app to view the secure message.</p>
                <p className="text-blue-700 text-xs">Standard messaging rates may apply based on patient's carrier.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Push Notification View */}
        <TabsContent value="push" className="space-y-4">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-6">
            {/* Mobile Phone Frame */}
            <div className="max-w-sm mx-auto">
              <div className="bg-black rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-gray-900 rounded-[2.5rem] overflow-hidden">
                  {/* Phone Notch & Status Bar */}
                  <div className="bg-gray-900 px-6 py-2">
                    <div className="flex items-center justify-between text-white text-xs">
                      <span>{currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                      <div className="w-20 h-4 bg-black rounded-full"></div>
                      <div className="flex items-center gap-1">
                        <span>5G</span>
                        <div className="flex gap-0.5">
                          <div className="w-1 h-2 bg-white rounded-sm"></div>
                          <div className="w-1 h-3 bg-white rounded-sm"></div>
                          <div className="w-1 h-4 bg-white rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lock Screen */}
                  <div className="bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 min-h-[650px] px-4 pt-8">
                    {/* Large Time Display */}
                    <div className="text-center text-white mb-12">
                      <p className="text-7xl font-light mb-1">
                        {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}
                      </p>
                      <p className="text-lg">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    {/* Push Notification */}
                    <div className="space-y-3">
                      {/* Main Notification */}
                      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl animate-in slide-in-from-top duration-300 cursor-pointer hover:bg-white transition-colors" onClick={handleOpenApp}>
                        <div className="flex items-start gap-3">
                          {/* App Icon */}
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Notification Header */}
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-gray-900">
                                {staffMessage.practiceName}
                              </p>
                              <span className="text-xs text-gray-500">now</span>
                            </div>

                            {/* Notification Content */}
                            <p className="text-sm text-gray-900 mb-1 line-clamp-1">
                              New Message from Your Practice
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              You have received a response from {staffMessage.practiceName}. Tap to view in the app.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Additional notification for context */}
                      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 opacity-70">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-gray-900">Calendar</p>
                              <span className="text-xs text-gray-500">2h ago</span>
                            </div>
                            <p className="text-sm text-gray-900 mb-0.5">Upcoming Appointment</p>
                            <p className="text-sm text-gray-600 line-clamp-1">Tomorrow at 10:00 AM</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lock Screen Bottom Hint */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <p className="text-white text-xs">Swipe up to open</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="text-purple-900">
                  Push notifications appear on the patient's lock screen and in their notification center. Tapping opens the app to view the full message.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                    Real-time delivery
                  </Badge>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                    Requires app install
                  </Badge>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                    Most immediate
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Comparison Table */}
      <Card className="bg-white border-gray-300 mt-8">
        <div className="p-6">
          <h3 className="text-lg mb-4">Channel Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">SMS</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Push Notification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4 text-gray-700">Delivery Speed</td>
                  <td className="py-3 px-4 text-gray-600">Minutes</td>
                  <td className="py-3 px-4 text-gray-600">Seconds</td>
                  <td className="py-3 px-4 text-gray-600">Instant</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Message Length</td>
                  <td className="py-3 px-4 text-gray-600">Unlimited</td>
                  <td className="py-3 px-4 text-gray-600">Limited</td>
                  <td className="py-3 px-4 text-gray-600">Preview only</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Patient Setup Required</td>
                  <td className="py-3 px-4 text-gray-600">Email address</td>
                  <td className="py-3 px-4 text-gray-600">Phone number</td>
                  <td className="py-3 px-4 text-gray-600">App installed</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">HIPAA Compliance</td>
                  <td className="py-3 px-4 text-gray-600">Secure portal link</td>
                  <td className="py-3 px-4 text-gray-600">Generic content</td>
                  <td className="py-3 px-4 text-gray-600">Encrypted</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Best For</td>
                  <td className="py-3 px-4 text-gray-600">Detailed responses</td>
                  <td className="py-3 px-4 text-gray-600">Quick updates</td>
                  <td className="py-3 px-4 text-gray-600">Urgent notifications</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Patient App Demo Modal */}
      {showPatientApp && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto relative">
            <button 
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100" 
              onClick={handleCloseApp}
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <PatientAppDemo initialScreen="biometrics" />
          </div>
        </div>
      )}
    </div>
  );
}