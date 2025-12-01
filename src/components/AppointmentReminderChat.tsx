import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import { Bell, Calendar, Clock, MapPin, User, Bot, CheckCircle2, Send, Pill, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  isActive: boolean;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  provider: string;
  location: string;
  type: string;
}

interface AppointmentReminderChatProps {
  patientId: string;
  patientName: string;
}

export function AppointmentReminderChat({ patientId, patientName }: AppointmentReminderChatProps) {
  const [stage, setStage] = useState<'notification' | 'chat'>('notification');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadAppointmentData();
  }, [patientId]);

  const loadAppointmentData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/upcoming-appointment?patientId=${patientId}`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
            "Accept": "application/json"
          }
        }
      );

      if (res.ok) {
        const data = await res.json();
        setAppointment(data.appointment);
        setMedications(data.medications || []);
      }
    } catch (error) {
      console.error('Error loading appointment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMedication = (medId: string) => {
    setMedications(prev => prev.map(med => 
      med.id === medId ? { ...med, isActive: !med.isActive } : med
    ));
    setHasChanges(true);
  };

  const handleSubmitMedications = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/update-medications`,
        {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            patientId,
            medications: medications.map(m => ({ id: m.id, isActive: m.isActive }))
          })
        }
      );

      if (res.ok) {
        setSubmitted(true);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error updating medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = () => {
    setStage('chat');
  };

  if (stage === 'notification') {
    return (
      <div className="space-y-6">
        {/* Notification Banner */}
        <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="text-lg mb-1">Appointment Reminder</div>
                <div className="text-sm text-gray-700 mb-3">
                  You have an upcoming appointment. Please review your information before your visit.
                </div>
                <Button 
                  onClick={handleOpenChat}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Open Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Details */}
        {appointment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Sent: {new Date().toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Bell className="w-4 h-4" />
                <span>Via: Push Notification + Email</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>To: {patientName}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-600" />
            Pre-Visit Assistant
          </CardTitle>
          <Badge className="bg-teal-600 text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            Appointment Reminder
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {/* Bot Welcome Message */}
          <div className="flex gap-2">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-teal-100 text-teal-700">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1 px-1">
                AI Assistant
              </div>
              <div className="rounded-lg p-3 bg-white border border-gray-200 max-w-[90%]">
                <div className="text-sm">
                  Hi {patientName}! 👋 I hope you're doing well.
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Info Card */}
          {appointment && (
            <div className="flex gap-2">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-teal-100 text-teal-700">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="rounded-lg p-4 bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200 max-w-[90%]">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <span className="font-medium">Your Upcoming Appointment</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span>{appointment.provider}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span>{appointment.location}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <Badge className="bg-blue-600 text-xs">
                        {appointment.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 px-1">
                  {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}

          {/* Medication Review Request */}
          <div className="flex gap-2">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-teal-100 text-teal-700">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="rounded-lg p-3 bg-white border border-gray-200 max-w-[90%]">
                <div className="text-sm">
                  To prepare for your visit, I'd like to confirm your current medications. 
                  I see you have <strong>{medications.length} active medications</strong> in your record. 
                  Are you still taking these?
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          {/* Medication List with Toggles */}
          {medications.length > 0 && (
            <div className="flex gap-2">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-teal-100 text-teal-700">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="rounded-lg p-4 bg-white border border-gray-200 max-w-[95%]">
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium">Current Medications</span>
                  </div>
                  
                  <div className="space-y-3">
                    {medications.map((med, index) => (
                      <div 
                        key={med.id} 
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          med.isActive 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{index + 1}. {med.name}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                {med.dosage} • {med.frequency}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600 whitespace-nowrap">
                                {med.isActive ? 'Taking' : 'Stopped'}
                              </span>
                              <Switch
                                checked={med.isActive}
                                onCheckedChange={() => toggleMedication(med.id)}
                                className="data-[state=checked]:bg-green-600"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {hasChanges && !submitted && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800">
                          You've made changes. Please submit to update your medication list.
                        </div>
                      </div>
                      <Button 
                        onClick={handleSubmitMedications}
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Medication Updates
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {submitted && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <div className="text-xs text-green-800">
                          Thank you! Your medication list has been updated.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1 px-1">
                  {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}

          {/* Final Message */}
          {submitted && (
            <div className="flex gap-2">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-teal-100 text-teal-700">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="rounded-lg p-3 bg-white border border-gray-200 max-w-[90%]">
                  <div className="text-sm">
                    Perfect! Your updated medication list will be available to {appointment?.provider || 'your provider'} during your visit. 
                    We'll see you on {appointment?.date} at {appointment?.time}. 
                    If you have any questions before your appointment, feel free to send a message! 😊
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
