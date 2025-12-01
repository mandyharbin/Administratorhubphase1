import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { FHIRDataCard } from './FHIRDataCard';
import { generateFHIREnhancedResponse } from '../utils/fhir-chat-helper';
import { 
  User, 
  Bot, 
  Send, 
  Database,
  MessageSquare,
  Activity,
  Sparkles,
  Info
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  fhirData?: {
    medications?: any[];
    conditions?: any[];
    allergies?: any[];
    appointments?: any[];
    labs?: any[];
  };
}

export function FHIRPatientChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi Sarah! I\'m your AI assistant. I have access to your medical record and can help answer questions about your medications, appointments, allergies, and more. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Using Sarah Johnson from FHIR demo
  const patientId = 'patient-001';
  const patientName = 'Sarah Johnson';

  const suggestedQuestions = [
    'What medications am I currently taking?',
    'When is my next appointment?',
    'What are my active medical conditions?',
    'Do I have any allergies on file?',
    'Can I see my recent lab results?'
  ];

  const handleSendMessage = async (messageText?: string) => {
    const userMessage = messageText || input;
    if (!userMessage.trim()) return;

    setInput('');
    setLoading(true);

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Get FHIR-enhanced response
      const fhirResponse = await generateFHIREnhancedResponse(userMessage, patientId);

      // Add assistant message with FHIR data
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fhirResponse.response || 'I can help you with that. Let me check your medical record.',
        timestamp: new Date().toISOString(),
        fhirData: fhirResponse.fhirData
      };

      setTimeout(() => {
        setMessages(prev => [...prev, assistantMsg]);
        setLoading(false);
      }, 800);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error accessing your medical record. Please try again.',
        timestamp: new Date().toISOString()
      }]);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-6 h-6 text-teal-600" />
          <h2>FHIR-Integrated AI Assistant Demo</h2>
        </div>
        <p className="text-gray-600">
          AI Assistant with real-time access to patient FHIR medical records
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm mb-2">
                <strong>How it works:</strong> When a patient asks about their medications, appointments, conditions, or lab results, the AI Assistant queries their FHIR medical record in real-time and provides personalized answers based on their actual health data.
              </div>
              <div className="grid grid-cols-5 gap-4 text-xs mt-3">
                <div className="flex items-start gap-1">
                  <span className="text-blue-600">•</span>
                  <div>
                    <div className="mb-0.5"><strong>Medications</strong></div>
                    <div className="text-gray-700">Current prescriptions & dosages</div>
                  </div>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-purple-600">•</span>
                  <div>
                    <div className="mb-0.5"><strong>Conditions</strong></div>
                    <div className="text-gray-700">Active diagnoses & problem list</div>
                  </div>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-red-600">•</span>
                  <div>
                    <div className="mb-0.5"><strong>Allergies</strong></div>
                    <div className="text-gray-700">Documented allergens & reactions</div>
                  </div>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <div>
                    <div className="mb-0.5"><strong>Appointments</strong></div>
                    <div className="text-gray-700">Upcoming visits & providers</div>
                  </div>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-orange-600">•</span>
                  <div>
                    <div className="mb-0.5"><strong>Lab Results</strong></div>
                    <div className="text-gray-700">Recent observations & vitals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                    Patient Chat Interface
                  </CardTitle>
                  <CardDescription>
                    Logged in as: <strong>{patientName}</strong> (Patient ID: {patientId})
                  </CardDescription>
                </div>
                <Badge className="bg-teal-600">
                  <Database className="w-3 h-3 mr-1" />
                  FHIR Connected
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className={message.role === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}>
                            {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                          <div className={`rounded-lg p-3 max-w-[85%] ${
                            message.role === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white border border-gray-200'
                          }`}>
                            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          </div>
                          
                          {/* FHIR Data Cards */}
                          {message.fhirData && (
                            <div className="max-w-[85%] space-y-2 mt-2">
                              {message.fhirData.medications && (
                                <FHIRDataCard type="medications" data={message.fhirData.medications} />
                              )}
                              {message.fhirData.conditions && (
                                <FHIRDataCard type="conditions" data={message.fhirData.conditions} />
                              )}
                              {message.fhirData.allergies && (
                                <FHIRDataCard type="allergies" data={message.fhirData.allergies} />
                              )}
                              {message.fhirData.appointments && (
                                <FHIRDataCard type="appointments" data={message.fhirData.appointments} />
                              )}
                              {message.fhirData.labs && (
                                <FHIRDataCard type="labs" data={message.fhirData.labs} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-teal-100 text-teal-700">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about your medications, appointments, or health records..."
                  disabled={loading}
                />
                <Button 
                  onClick={() => handleSendMessage()}
                  disabled={loading || !input.trim()}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggested Questions & Info */}
        <div className="space-y-6">
          {/* Suggested Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Try Asking</CardTitle>
              <CardDescription>Click any question to test FHIR integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestedQuestions.map((question, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full text-left justify-start h-auto py-3 px-3"
                    onClick={() => handleSendMessage(question)}
                    disabled={loading}
                  >
                    <Sparkles className="w-4 h-4 mr-2 flex-shrink-0 text-teal-600" />
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-4 h-4" />
                Technical Implementation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-3">
                <div>
                  <div className="mb-1"><strong>Patient Profile:</strong></div>
                  <div className="text-gray-600 font-mono">
                    • ID: {patientId}<br />
                    • Name: {patientName}<br />
                    • DOB: 1990-03-15 (Age 34)<br />
                    • Gender: Female
                  </div>
                </div>
                <div>
                  <div className="mb-1"><strong>FHIR Endpoints Used:</strong></div>
                  <div className="text-gray-600 font-mono">
                    • /fhir/Patient/{patientId}<br />
                    • /fhir/MedicationStatement<br />
                    • /fhir/Condition<br />
                    • /fhir/AllergyIntolerance<br />
                    • /fhir/Appointment<br />
                    • /fhir/Observation
                  </div>
                </div>
                <div>
                  <div className="mb-1"><strong>Data Flow:</strong></div>
                  <div className="text-gray-600">
                    1. Patient asks question<br />
                    2. NLP detects intent<br />
                    3. Query FHIR resources<br />
                    4. Generate personalized response<br />
                    5. Display with FHIR data cards
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
