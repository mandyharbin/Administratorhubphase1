import { Bot, MessageSquare, Calendar, Pill, Clock, MapPin, DollarSign, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import StaffResponseChannelPreview from './StaffResponseChannelPreview';
import { InfoBanner } from './InfoBanner';

export function AIAssistantReplies() {
  const routingScenarios = [
    {
      id: 'appointment',
      icon: Calendar,
      title: 'Schedule/Reschedule/Cancel Appointment',
      userQueries: [
        'I need to schedule an appointment',
        'Can I reschedule my appointment?',
        'I want to cancel my appointment'
      ],
      aiResponse: 'I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat. How do you want to be notified?',
      behavior: 'Routes to staff, shows notification preference options',
      routesTo: true
    },
    {
      id: 'symptoms',
      icon: FileText,
      title: 'Medical Symptoms or Concerns',
      userQueries: [
        'I have a fever and headache',
        'My symptoms are getting worse',
        'I need medical advice'
      ],
      aiResponse: 'I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat. How do you want to be notified?',
      behavior: 'Routes to staff, shows notification preference options',
      routesTo: true
    },
    {
      id: 'billing',
      icon: DollarSign,
      title: 'Billing Questions',
      userQueries: [
        'I have a question about my bill',
        'Why was I charged this amount?',
        'Can I set up a payment plan?'
      ],
      aiResponse: 'I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat. How do you want to be notified?',
      behavior: 'Routes to staff, shows notification preference options',
      routesTo: true
    }
  ];

  const informationalScenarios = [
    {
      id: 'next-appointment',
      icon: Calendar,
      title: 'Next Appointment Inquiry',
      userQueries: [
        'When is my next appointment?',
        'What\'s my upcoming appointment?'
      ],
      aiResponse: 'Your next appointment is November 20th at 3:30 PM with Dr. Smith.',
      behavior: 'Direct answer, NO routing, NO notification preference prompt',
      routesTo: false
    },
    {
      id: 'prescription-status',
      icon: Pill,
      title: 'Prescription Status',
      userQueries: [
        'What is the status of my prescription?',
        'When does my prescription need renewal?'
      ],
      aiResponse: 'I see you have an active prescription for Lisinopril and it is not due for renewal until Dec 1st 2025.',
      behavior: 'Direct answer, NO routing, NO notification preference prompt',
      routesTo: false
    }
  ];

  const knowledgeSourceScenarios = [
    {
      id: 'office-hours',
      icon: Clock,
      title: 'Office Hours',
      userQueries: [
        'What are your office hours?',
        'When are you open?'
      ],
      aiResponse: '8 AM - 5 PM Monday - Friday, Saturday 9 AM - 1 PM (By appointment only), Sunday Closed',
      source: 'Knowledge Base FAQ'
    },
    {
      id: 'location',
      icon: MapPin,
      title: 'Office Location',
      userQueries: [
        'Where is your office?',
        'What\'s your address?'
      ],
      aiResponse: '123 Medical Center Drive, Suite 200, Healthcare City, HC 12345',
      source: 'Knowledge Base FAQ'
    },
    {
      id: 'insurance',
      icon: FileText,
      title: 'Insurance Accepted',
      userQueries: [
        'What insurance do you accept?',
        'Do you take my insurance?'
      ],
      aiResponse: 'We accept Blue Cross Blue Shield, Aetna, UnitedHealthcare, Cigna, Medicare, and Medicaid. Please contact our office to verify your specific plan.',
      source: 'Knowledge Base FAQ'
    },
    {
      id: 'parking',
      icon: MapPin,
      title: 'Parking Information',
      userQueries: [
        'Is parking available?',
        'Where can I park?'
      ],
      aiResponse: 'Free parking is available in the Medical Center parking garage (entrance on Oak Street). Handicap accessible parking is available on the ground floor near the main entrance.',
      source: 'Knowledge Base FAQ'
    }
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl">AI Assistant Replies</h1>
          <p className="text-gray-500">How the AI responds to different patient inquiries</p>
        </div>
      </div>

      <InfoBanner 
        title="What is this section used for?"
        description="Configure how the AI Assistant responds to various patient inquiries, including routing logic for requests requiring staff attention (appointments, refills, billing), direct responses for informational queries, and notification preferences for staff routing."
      />

      <Tabs defaultValue="routing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="routing">Routing Scenarios</TabsTrigger>
          <TabsTrigger value="informational">Informational Queries</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Sources</TabsTrigger>
          <TabsTrigger value="flows">Message Flows</TabsTrigger>
          <TabsTrigger value="channels">Staff Response Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="routing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Questions That Route to Staff</CardTitle>
              <CardDescription>
                These queries require staff assistance and trigger notification preference selection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {routingScenarios.map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <div key={scenario.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <h3 className="font-medium">{scenario.title}</h3>
                      <Badge variant="outline" className="ml-auto bg-orange-50 text-orange-700 border-orange-200">
                        Routes to Staff
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">User might ask:</p>
                      <div className="space-y-1">
                        {scenario.userQueries.map((query, idx) => (
                          <div key={idx} className="text-sm bg-gray-50 rounded px-3 py-2 italic text-gray-700">
                            "{query}"
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">AI Response:</p>
                      <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2">
                        <p className="text-sm text-blue-900">{scenario.aiResponse}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Result:</p>
                      <p className="text-sm text-gray-700">{scenario.behavior}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="informational" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Direct Answer Queries</CardTitle>
              <CardDescription>
                The AI can answer these directly without routing to staff
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {informationalScenarios.map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <div key={scenario.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <h3 className="font-medium">{scenario.title}</h3>
                      <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                        Direct Answer
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">User might ask:</p>
                      <div className="space-y-1">
                        {scenario.userQueries.map((query, idx) => (
                          <div key={idx} className="text-sm bg-gray-50 rounded px-3 py-2 italic text-gray-700">
                            "{query}"
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">AI Response:</p>
                      <div className="bg-green-50 border border-green-200 rounded px-3 py-2">
                        <p className="text-sm text-green-900">{scenario.aiResponse}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Result:</p>
                      <p className="text-sm text-gray-700">{scenario.behavior}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Knowledge Base FAQs</CardTitle>
              <CardDescription>
                Common questions answered from the practice's knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {knowledgeSourceScenarios.map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <div key={scenario.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <h3 className="font-medium">{scenario.title}</h3>
                      <Badge variant="outline" className="ml-auto bg-purple-50 text-purple-700 border-purple-200">
                        {scenario.source}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">User might ask:</p>
                      <div className="space-y-1">
                        {scenario.userQueries.map((query, idx) => (
                          <div key={idx} className="text-sm bg-gray-50 rounded px-3 py-2 italic text-gray-700">
                            "{query}"
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">AI Response:</p>
                      <div className="bg-purple-50 border border-purple-200 rounded px-3 py-2">
                        <p className="text-sm text-purple-900">{scenario.aiResponse}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Message Flow Between Patient & Staff</CardTitle>
              <CardDescription>
                How messages travel between the patient app and staff practice inbox
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Patient to Staff */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-lg">1</span>
                  </div>
                  <h3 className="font-medium">Patient → Staff Flow</h3>
                </div>
                
                <div className="pl-10 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">When patient sends:</p>
                    <div className="bg-gray-50 rounded px-3 py-2">
                      <p className="text-sm italic text-gray-700">"I need to schedule an appointment"</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="h-px flex-1 bg-gray-300"></div>
                    <span>Routes to</span>
                    <div className="h-px flex-1 bg-gray-300"></div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Appears in "Automated Healthcare Practice" inbox:</p>
                    <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 space-y-2">
                      <p className="text-sm"><strong>Patient:</strong> Sarah Johnson</p>
                      <p className="text-sm"><strong>Message:</strong> "I need to schedule an appointment"</p>
                      <p className="text-sm"><strong>AI Summary:</strong> Patient requesting appointment scheduling</p>
                      <p className="text-sm"><strong>Detected Intent:</strong> Schedule Appointment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff to Patient */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-lg">2</span>
                  </div>
                  <h3 className="font-medium">Staff → Patient Flow</h3>
                </div>
                
                <div className="pl-10 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">When staff replies from practice inbox:</p>
                    <div className="bg-gray-50 rounded px-3 py-2">
                      <p className="text-sm text-gray-700">"Hi Sarah! I have availability tomorrow at 2 PM or Thursday at 10 AM. Which works better for you?"</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="h-px flex-1 bg-gray-300"></div>
                    <span>Appears in</span>
                    <div className="h-px flex-1 bg-gray-300"></div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Patient App Demo chat:</p>
                    <div className="bg-green-50 border border-green-200 rounded px-3 py-2 space-y-2">
                      <p className="text-sm"><strong>From:</strong> Jennifer (Staff)</p>
                      <p className="text-sm">"Hi Sarah! I have availability tomorrow at 2 PM or Thursday at 10 AM. Which works better for you?"</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Points */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Key Points:</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Messages requiring staff attention are automatically routed to the practice inbox</li>
                  <li>• Staff can see patient context, message history, and AI-detected intent</li>
                  <li>• Staff replies appear as chat messages in the patient's app</li>
                  <li>• Patients receive notifications based on their selected preference (push, SMS, or email)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Staff Response Channels</CardTitle>
              <CardDescription>
                Different channels staff can use to respond to patient inquiries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <StaffResponseChannelPreview />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}