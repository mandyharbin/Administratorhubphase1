import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ChatSummary } from './ChatSummary';
import { StaffMessagesInbox } from './StaffMessagesInbox';
import { 
  MessageSquare, 
  User, 
  Bot, 
  Sparkles,
  Database,
  ArrowRight,
  CheckCircle,
  Shield,
  Inbox
} from 'lucide-react';

export function SummarizationDemo() {
  const [selectedScenario, setSelectedScenario] = useState<'appointment' | 'medication' | 'billing'>('appointment');

  const scenarios = {
    appointment: {
      title: 'Appointment Scheduling Inquiry',
      patientId: 'patient-001',
      conversationId: 'conv-appt-001',
      messages: [
        { role: 'user' as const, content: 'Hi, I need to schedule a follow-up appointment with Dr. Thompson.', timestamp: '2025-11-20T09:00:00Z' },
        { role: 'assistant' as const, content: 'I\'d be happy to help you schedule a follow-up appointment with Dr. Thompson. I don\'t have direct access to the scheduling system, but I can connect you with our scheduling team who can book that for you right away. What time of day works best for you?', timestamp: '2025-11-20T09:00:05Z' },
        { role: 'user' as const, content: 'Preferably in the morning, sometime next week if possible.', timestamp: '2025-11-20T09:00:30Z' },
        { role: 'assistant' as const, content: 'Perfect! I\'ll route your request to our scheduling team with a note for a morning appointment next week with Dr. Thompson. They typically respond within an hour during business hours. Is there anything else I can help you with today?', timestamp: '2025-11-20T09:00:40Z' },
        { role: 'user' as const, content: 'No, that\'s all. Thank you!', timestamp: '2025-11-20T09:01:00Z' }
      ]
    },
    medication: {
      title: 'Medication Refill Request',
      patientId: 'patient-002',
      conversationId: 'conv-med-001',
      messages: [
        { role: 'user' as const, content: 'I need to refill my blood pressure medication. I\'m running low.', timestamp: '2025-11-20T10:15:00Z' },
        { role: 'assistant' as const, content: 'I understand you need a refill for your blood pressure medication. For your safety, I\'ll need to connect you with a clinical staff member who can review your medication history and process the refill request. Can you tell me which medication you\'re currently taking?', timestamp: '2025-11-20T10:15:10Z' },
        { role: 'user' as const, content: 'It\'s Lisinopril 10mg. I take it once daily in the morning.', timestamp: '2025-11-20T10:15:45Z' },
        { role: 'assistant' as const, content: 'Thank you for that information. I\'m routing your refill request for Lisinopril 10mg to our clinical team. They\'ll review your prescription and contact your pharmacy. Do you have any new symptoms or side effects you\'d like to report?', timestamp: '2025-11-20T10:16:00Z' },
        { role: 'user' as const, content: 'No, everything has been fine. The medication is working well.', timestamp: '2025-11-20T10:16:30Z' },
        { role: 'assistant' as const, content: 'That\'s great to hear! Your refill request has been forwarded to clinical staff. You should hear back within 24 hours. If it\'s urgent, please call our office at (555) 123-4567.', timestamp: '2025-11-20T10:16:50Z' }
      ]
    },
    billing: {
      title: 'Billing Question',
      patientId: 'patient-001',
      conversationId: 'conv-bill-001',
      messages: [
        { role: 'user' as const, content: 'I received a bill for $150 but I thought my insurance covered the visit?', timestamp: '2025-11-20T14:30:00Z' },
        { role: 'assistant' as const, content: 'I understand your concern about the billing. Let me help route you to our billing department who can review your insurance claim and explain the charges in detail. Do you have the bill number or date of service handy?', timestamp: '2025-11-20T14:30:15Z' },
        { role: 'user' as const, content: 'Yes, it\'s from my visit on October 15th. Bill number is #12345.', timestamp: '2025-11-20T14:30:45Z' },
        { role: 'assistant' as const, content: 'Perfect, thank you. I\'m forwarding your question about bill #12345 from October 15th to our billing team. They\'ll review your insurance coverage and can provide a detailed explanation of the charges. They typically respond within 1-2 business days. Would you prefer a phone call or email response?', timestamp: '2025-11-20T14:31:00Z' },
        { role: 'user' as const, content: 'Email would be great, thanks.', timestamp: '2025-11-20T14:31:30Z' }
      ]
    }
  };

  const currentScenario = scenarios[selectedScenario];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2>AI Chat Summarization Demo</h2>
        </div>
        <p className="text-gray-600">
          Greenway AIRE Agent integration for summarizing patient conversations and routing to EHR staff
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm mb-2">
                <strong>HIPAA-Compliant AI Summarization Workflow:</strong> Patient conversations with the AI Receptionist are automatically summarized using Greenway's AIRE Agent (patient-summary, ag_9f2b8c) and routed to appropriate EHR staff based on intent.
              </div>
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="mb-0.5"><strong>Patient Chat</strong></div>
                    <div className="text-gray-700">Conversation with AI Receptionist</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="mb-0.5"><strong>AIRE Agent</strong></div>
                    <div className="text-gray-700">Generates concise summary with quality metrics</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Database className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="mb-0.5"><strong>Route to Staff</strong></div>
                    <div className="text-gray-700">Sends to EHR based on role/intent</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Inbox className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="mb-0.5"><strong>Staff Inbox</strong></div>
                    <div className="text-gray-700">Messages queue for staff review</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="demo">
            <MessageSquare className="w-4 h-4 mr-2" />
            Summarization Demo
          </TabsTrigger>
          <TabsTrigger value="inbox">
            <Inbox className="w-4 h-4 mr-2" />
            Staff Messages Inbox
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          {/* Scenario Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Scenario</CardTitle>
              <CardDescription>Choose a sample patient conversation to summarize</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={selectedScenario === 'appointment' ? 'default' : 'outline'}
                  onClick={() => setSelectedScenario('appointment')}
                  className={selectedScenario === 'appointment' ? 'bg-purple-600' : ''}
                >
                  📅 Appointment
                </Button>
                <Button
                  variant={selectedScenario === 'medication' ? 'default' : 'outline'}
                  onClick={() => setSelectedScenario('medication')}
                  className={selectedScenario === 'medication' ? 'bg-purple-600' : ''}
                >
                  💊 Medication
                </Button>
                <Button
                  variant={selectedScenario === 'billing' ? 'default' : 'outline'}
                  onClick={() => setSelectedScenario('billing')}
                  className={selectedScenario === 'billing' ? 'bg-purple-600' : ''}
                >
                  💰 Billing
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat Conversation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  {currentScenario.title}
                </CardTitle>
                <CardDescription>
                  Patient ID: {currentScenario.patientId} • Conversation ID: {currentScenario.conversationId}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {currentScenario.messages.map((message, idx) => (
                    <div key={idx} className={`flex gap-3 ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'assistant' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {message.role === 'assistant' ? (
                          <Bot className="w-4 h-4 text-purple-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className={`flex-1 rounded-lg p-3 ${
                        message.role === 'assistant' ? 'bg-gray-100' : 'bg-blue-100'
                      }`}>
                        <div className="text-xs text-gray-500 mb-1">
                          {message.role === 'assistant' ? 'AI Receptionist' : 'Patient'}
                        </div>
                        <div className="text-sm">{message.content}</div>
                        {message.timestamp && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Component */}
            <div>
              <ChatSummary
                messages={currentScenario.messages}
                patientId={currentScenario.patientId}
                conversationId={currentScenario.conversationId}
                onSummaryGenerated={(summary) => console.log('Summary generated:', summary)}
                onSummarySent={(messageId) => console.log('Summary sent:', messageId)}
              />
            </div>
          </div>

          {/* Workflow Diagram */}
          <Card>
            <CardHeader>
              <CardTitle>Summarization Workflow</CardTitle>
              <CardDescription>How AI chat summaries are processed and routed to staff</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-sm mb-1">Patient Conversation</div>
                  <div className="text-xs text-gray-600">AI Receptionist chat messages</div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-sm mb-1">AIRE Agent</div>
                  <div className="text-xs text-gray-600">Generate summary + quality metrics</div>
                  <Badge variant="outline" className="mt-1 text-xs">ag_9f2b8c</Badge>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-sm mb-1">Route to Staff</div>
                  <div className="text-xs text-gray-600">Clinical, Scheduling, Billing, etc.</div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                    <Inbox className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="text-sm mb-1">Staff Inbox</div>
                  <div className="text-xs text-gray-600">Review & action in EHR</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Implementation */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Implementation</CardTitle>
              <CardDescription>Integration details for Greenway AIRE Agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm mb-3">AIRE Agent Configuration</div>
                  <div className="text-xs text-gray-600 space-y-1 font-mono bg-gray-50 p-3 rounded">
                    <div><strong>Agent ID:</strong> ag_9f2b8c</div>
                    <div><strong>Name:</strong> patient-summary</div>
                    <div><strong>Intent:</strong> patient.summary</div>
                    <div><strong>Domain:</strong> ambulatory</div>
                    <div><strong>Endpoint:</strong> /summary/v1/invoke</div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm mb-3">Quality & Compliance</div>
                  <div className="text-xs text-gray-600 space-y-1 font-mono bg-gray-50 p-3 rounded">
                    <div><strong>Grounding:</strong> ≥0.85 required</div>
                    <div><strong>Safety:</strong> Must pass</div>
                    <div><strong>Guardrails:</strong> hipaa-default</div>
                    <div><strong>PII:</strong> PHI classification</div>
                    <div><strong>Scopes:</strong> ehr:read:patient</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inbox" className="space-y-6">
          <StaffMessagesInbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}
