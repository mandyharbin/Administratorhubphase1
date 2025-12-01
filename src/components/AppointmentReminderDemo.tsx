import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { AppointmentReminderChat } from './AppointmentReminderChat';
import { PreVisitHealthUpdate } from './PreVisitHealthUpdate';
import { Calendar, Bell, Pill, CheckCircle, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export function AppointmentReminderDemo() {
  const [mode, setMode] = useState<'simple' | 'comprehensive'>('simple');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-6 h-6 text-teal-600" />
          <h2>Appointment Reminder + Pre-Visit Health Update</h2>
        </div>
        <p className="text-gray-600">
          Proactive AI-driven appointment reminders with comprehensive FHIR health data review
        </p>
      </div>

      {/* Mode Selector */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm mb-3">
                Choose which pre-visit workflow to demo:
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setMode('simple')}
                  variant={mode === 'simple' ? 'default' : 'outline'}
                  className={mode === 'simple' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                >
                  <Pill className="w-4 h-4 mr-2" />
                  Simple: Medication Review Only
                </Button>
                <Button
                  onClick={() => setMode('comprehensive')}
                  variant={mode === 'comprehensive' ? 'default' : 'outline'}
                  className={mode === 'comprehensive' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Comprehensive: Full Pre-Visit Update
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workflow Overview</CardTitle>
          <CardDescription>How the appointment reminder system works</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="font-medium text-teal-700">1</span>
              </div>
              <div className="text-sm font-medium">Reminder Sent</div>
              <div className="text-xs text-gray-600">
                72 hours before appointment, system sends push/email/SMS notification
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-medium text-blue-700">2</span>
              </div>
              <div className="text-sm font-medium">Patient Opens Chat</div>
              <div className="text-xs text-gray-600">
                Notification opens the chat with AI assistant welcoming them
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="font-medium text-purple-700">3</span>
              </div>
              <div className="text-sm font-medium">Medication Review</div>
              <div className="text-xs text-gray-600">
                AI displays current meds from FHIR with toggles to confirm/update
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="font-medium text-green-700">4</span>
              </div>
              <div className="text-sm font-medium">Provider Ready</div>
              <div className="text-xs text-gray-600">
                Updated medication list available in EHR for the appointment
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {mode === 'simple' ? (
            <AppointmentReminderChat 
              patientId="patient-001"
              patientName="Sarah Johnson"
            />
          ) : (
            <PreVisitHealthUpdate 
              patientId="patient-001"
              patientName="Sarah Johnson"
            />
          )}
        </div>

        <div className="space-y-4">
          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {mode === 'simple' ? 'Technical Implementation' : 'FHIR Resources Used'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {mode === 'simple' ? (
                <>
                  <div>
                    <div className="font-medium mb-1">FHIR Resources</div>
                    <div className="text-gray-600">
                      • Appointment (upcoming visits)<br />
                      • MedicationStatement (active meds)<br />
                      • Communication (chat messages)
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-1">Backend Endpoints</div>
                    <div className="font-mono text-[10px] bg-gray-50 p-2 rounded space-y-0.5">
                      <div>GET /upcoming-appointment</div>
                      <div>POST /update-medications</div>
                      <div>POST /send-notification</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-1">Notification Channels</div>
                    <div className="text-gray-600">
                      Based on user preferences: Push (Firebase), SMS (Twilio), Email (SendGrid)
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-1">Data Storage</div>
                    <div className="text-gray-600">
                      Medication updates stored with timestamp and source tracking for audit
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="font-medium mb-1">13 FHIR Endpoints</div>
                    <div className="font-mono text-[10px] bg-gray-50 p-2 rounded space-y-0.5">
                      <div>GET /Patient/{'{id}'}</div>
                      <div>GET /Appointment?patient={'{id}'}</div>
                      <div>GET /MedicationRequest?patient={'{id}'}</div>
                      <div>GET /Observation?patient={'{id}'}</div>
                      <div>GET /Condition?patient={'{id}'}</div>
                      <div>GET /Coverage?patient={'{id}'}</div>
                      <div>GET /CarePlan?patient={'{id}'}</div>
                      <div>GET /Encounter?patient={'{id}'}</div>
                      <div>GET /AllergyIntolerance?patient={'{id}'}</div>
                      <div>GET /Procedure?patient={'{id}'}</div>
                      <div>GET /Immunization?patient={'{id}'}</div>
                      <div>GET /DiagnosticReport?patient={'{id}'}</div>
                      <div>GET /DocumentReference?patient={'{id}'}</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-1">Backend Endpoints</div>
                    <div className="font-mono text-[10px] bg-gray-50 p-2 rounded space-y-0.5">
                      <div>GET /pre-visit-data</div>
                      <div>POST /submit-pre-visit</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-1">Data Collected</div>
                    <div className="text-gray-600">
                      Symptoms, medication changes, vital notes, insurance status, care plan progress, encounter updates
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-base">Clinical Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Reduced No-Shows:</strong> Timely reminders improve appointment attendance
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Accurate Medication Lists:</strong> Real-time updates before visit
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Time Savings:</strong> Less time spent on medication reconciliation during visit
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Patient Engagement:</strong> Interactive experience improves patient satisfaction
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Better Outcomes:</strong> Providers have complete information for informed decisions
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Production Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Production Integration Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-medium mb-2">Trigger Logic</div>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                <li>Scheduled job runs daily at 8 AM</li>
                <li>Queries FHIR Appointment resources for next 72 hours</li>
                <li>Sends notifications to patients with upcoming appointments</li>
                <li>Tracks notification delivery status</li>
              </ul>
            </div>

            <div>
              <div className="font-medium mb-2">Integration Points</div>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                <li>EHR system for appointment data</li>
                <li>FHIR server for medication statements</li>
                <li>Firebase for push notifications</li>
                <li>Twilio for SMS delivery</li>
                <li>SendGrid for email delivery</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-xs text-amber-800">
              <strong>Note:</strong> In this prototype, appointment and medication data is mocked. 
              In production, this would integrate with your EHR's FHIR API to fetch real appointment 
              and medication data, and would send actual notifications via configured services.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}