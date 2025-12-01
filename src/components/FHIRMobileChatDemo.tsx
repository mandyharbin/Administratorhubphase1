import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { FHIRDataCard } from './FHIRDataCard';
import { generateFHIREnhancedResponse } from '../utils/fhir-chat-helper';
import { ChatSummary } from './ChatSummary';
import { generatePatientSummary, sendSummaryToStaff, type ChatMessage as SummaryChatMessage } from '../api/summary-agent';
import { getChatMessages, sendChatMessage } from '../utils/fhir-communication-api';
import { toast, Toaster } from 'sonner';
import { MobileToast } from './MobileToast';
import { MobileAccountSettings } from './MobileAccountSettings';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  User, 
  Bot, 
  Send, 
  Database,
  Smartphone,
  Activity,
  Sparkles,
  Info,
  ArrowLeft,
  Menu,
  Phone,
  Video,
  MoreVertical,
  Users,
  FileText,
  CheckCircle,
  Shield,
  MessageCircle,
  Calendar,
  Heart,
  FileText as FileIcon,
  UserCheck,
  Camera,
  Image as ImageIcon,
  Paperclip,
  X,
  UserCircle2,
  LogOut,
  Edit,
  ChevronLeft
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'staff';
  content: string;
  timestamp: string;
  isRouted?: boolean;
  detectedIntent?: string;
  senderName?: string;
  fhirData?: {
    medications?: any[];
    conditions?: any[];
    allergies?: any[];
    appointments?: any[];
    labs?: any[];
  };
}

export function FHIRMobileChatDemo() {
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
  const [waitingForSendConfirmation, setWaitingForSendConfirmation] = useState(false);
  const [showMobileToast, setShowMobileToast] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'chat' | 'settings'>('home');
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: '1',
      type: 'appointment',
      title: 'Appointment Reminder',
      message: 'Dr. Smith - Tomorrow at 2:00 PM',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true
    },
    {
      id: '2',
      type: 'lab',
      title: 'Lab Results Available',
      message: 'Your recent blood work is ready',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true
    }
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Using Sarah Johnson from FHIR demo
  const patientId = 'patient-001';
  const patientName = 'Sarah Johnson';

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageType, setSelectedImageType] = useState<'InsuranceFront' | 'InsuranceBack' | 'ID' | 'ClinicalPhoto'>('InsuranceFront');

  // Menu and account settings state
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'personal' | 'contact' | 'preferences' | 'security'>('personal');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'Sarah',
    middleName: 'Marie',
    lastName: 'Johnson',
    preferredName: 'Sarah',
    dob: '1990-03-15',
    address1: '123 Maple Street',
    address2: 'Apt 4B',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@email.com',
    emergencyContact: 'John Johnson',
    emergencyPhone: '(555) 987-6543'
  });

  const suggestedQuestions = [
    'What medications am I currently taking?',
    'When is my next appointment?',
    'What are my active medical conditions?',
    'Do I have any allergies on file?',
    'Can I see my recent lab results?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new staff messages every 5 seconds when on chat screen
  useEffect(() => {
    if (currentScreen !== 'chat') return;

    const pollStaffMessages = async () => {
      try {
        const fhirMessages = await getChatMessages(patientId);
        
        // Filter for staff messages only
        const staffMessages = fhirMessages.filter(msg => msg.senderType === 'staff');
        
        // Add new staff messages to the chat
        staffMessages.forEach(staffMsg => {
          const exists = messages.some(m => m.id === staffMsg.id);
          if (!exists) {
            const newMessage: Message = {
              id: staffMsg.id,
              role: 'staff',
              content: staffMsg.text,
              timestamp: staffMsg.timestamp,
              senderName: staffMsg.senderName
            };
            setMessages(prev => {
              // Double-check it doesn't exist before adding
              const stillExists = prev.some(m => m.id === staffMsg.id);
              if (stillExists) return prev;
              return [...prev, newMessage];
            });
          }
        });
      } catch (error) {
        console.error('Error polling staff messages:', error);
      }
    };

    // Poll immediately and then every 5 seconds
    pollStaffMessages();
    const interval = setInterval(pollStaffMessages, 5000);
    
    return () => clearInterval(interval);
  }, [currentScreen, patientId]); // Removed messages from dependencies

  // Poll for new staff messages when on home screen (for notifications)
  useEffect(() => {
    const pollNotifications = async () => {
      // Staff messages are handled in the chat screen, not as notifications
      // Notifications are only for appointments, lab results, etc.
    };

    if (currentScreen === 'home') {
      pollNotifications();
      const interval = setInterval(pollNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [currentScreen, patientId]);

  const handleSendConfirmation = (confirmed: boolean) => {
    console.log('🔔 handleSendConfirmation called with:', confirmed);
    
    // Add the Yes or No as a user message
    const selectionMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: confirmed ? 'Yes' : 'No',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, selectionMessage]);
    
    // Clear the waiting flag
    setWaitingForSendConfirmation(false);
    
    // If Yes, show the mobile toast notification
    if (confirmed) {
      console.log('🔔 Showing mobile toast...');
      setShowMobileToast(true);
    }
  };

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
      // Save patient message to FHIR Communication
      await sendChatMessage(
        patientId,
        userMessage,
        'patient',
        patientName
      );

      // Check if the last message was from staff
      const lastNonUserMessage = messages.filter(m => m.role !== 'user').slice(-1)[0];
      const isReplyingToStaff = lastNonUserMessage && lastNonUserMessage.role === 'staff';

      // Detect if this is a question that requires AI/FHIR response
      const questionKeywords = ['what', 'when', 'where', 'who', 'how', 'can you', 'tell me', 'show me', 'do i', 'am i', 'is my', 'are my', '?'];
      const isQuestion = questionKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
      
      // Medical/appointment related keywords that should trigger AI
      const medicalKeywords = ['medication', 'appointment', 'doctor', 'prescription', 'allergy', 'allergies', 'condition', 'lab', 'test', 'result', 'blood', 'pressure', 'health', 'medical', 'record', 'symptom', 'refill', 'medicine', 'drug', 'pill', 'pharmacy', 'dose', 'dosage'];
      const isMedicalQuery = medicalKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

      // Only generate AI response if:
      // 1. It's a clear question AND
      // 2. Either it's medical/appointment related OR not replying to staff
      const shouldGenerateAIResponse = isQuestion && (isMedicalQuery || !isReplyingToStaff);

      if (!shouldGenerateAIResponse) {
        // Just save the message, don't generate AI response
        // This allows staff to continue the conversation
        setLoading(false);
        console.log('Patient message saved. Waiting for staff response...');
        return;
      }

      // Get FHIR-enhanced response
      const fhirResponse = await generateFHIREnhancedResponse(userMessage, patientId);

      // Add assistant message with FHIR data and routing info
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fhirResponse.response || 'I can help you with that. Let me check your medical record.',
        timestamp: new Date().toISOString(),
        fhirData: fhirResponse.fhirData,
        isRouted: fhirResponse.shouldRoute,
        detectedIntent: fhirResponse.detectedIntent
      };

      setTimeout(() => {
        setMessages(prev => [...prev, assistantMsg]);
        setLoading(false);
        
        // Show toast if message was routed
        if (assistantMsg.isRouted) {
          // Set flag to show Yes/No buttons
          setWaitingForSendConfirmation(true);
        }
      }, 800);

    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload image via API
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/upload-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          patientId,
          kind: selectedImageType,
          fileName: file.name,
          contentType: file.type,
          base64
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Add user message showing image was uploaded
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `📷 Uploaded ${selectedImageType === 'InsuranceFront' ? 'Insurance Card (Front)' : selectedImageType === 'InsuranceBack' ? 'Insurance Card (Back)' : selectedImageType === 'ID' ? 'ID Card' : 'Photo'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);

      // Generate AI response with extracted data
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || `Thanks! I've received your ${selectedImageType === 'InsuranceFront' || selectedImageType === 'InsuranceBack' ? 'insurance card' : selectedImageType === 'ID' ? 'ID' : 'photo'}. ${data.facts?.extracted ? `I've extracted: ${JSON.stringify(data.facts.extracted)}` : 'This has been added to your chart.'}`,
        timestamp: new Date().toISOString()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, assistantMsg]);
      }, 500);

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-6 h-6 text-teal-600" />
          <h2>FHIR-Integrated Mobile AI Assistant</h2>
        </div>
        <p className="text-gray-600">
          Mobile chat interface with real-time FHIR medical record access
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm mb-2">
                <strong>Mobile Patient Experience:</strong> This demo shows how the FHIR integration appears in the actual patient mobile app. When Sarah Johnson asks about her health, the AI queries her FHIR record in real-time and displays personalized information directly in the chat.
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="text-xs bg-white">
                  <Database className="w-3 h-3 mr-1" />
                  Real FHIR Data
                </Badge>
                <Badge variant="outline" className="text-xs bg-white">
                  <Smartphone className="w-3 h-3 mr-1" />
                  Mobile Interface
                </Badge>
                <Badge variant="outline" className="text-xs bg-white">
                  <Activity className="w-3 h-3 mr-1" />
                  Patient: Sarah Johnson
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mobile Phone Interface */}
        <div className="lg:col-span-2">
          <div className="max-w-sm mx-auto">
            {/* Phone Frame */}
            <div className="relative bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl z-10"></div>
              
              {/* Screen */}
              <div className="bg-white rounded-[2rem] overflow-hidden h-[800px] flex flex-col relative">
                {/* Status Bar */}
                <div className="bg-white px-6 pt-2 pb-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-3 border border-black rounded-sm relative">
                        <div className="absolute inset-0.5 bg-black"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {currentScreen === 'home' ? (
                  <>
                    {/* Home Screen Header */}
                    <div className="bg-teal-600 text-white px-4 py-3 flex items-center justify-between relative">
                      <h3 className="text-base">Health Portal</h3>
                      <button 
                        className="p-1"
                        onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                      >
                        <Menu className="w-5 h-5" />
                      </button>
                      
                      {/* Menu Dropdown */}
                      {showMenuDropdown && (
                        <div className="absolute right-4 top-12 bg-white rounded-lg shadow-lg py-2 min-w-[200px] z-50 text-gray-900">
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-200">
                            <div className="text-xs text-gray-500">Logged in as</div>
                            <div className="text-sm">{patientName}</div>
                          </div>
                          
                          {/* Account Actions */}
                          <div className="py-1">
                            <button 
                              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm"
                              onClick={() => {
                                setShowMenuDropdown(false);
                                setCurrentScreen('settings');
                              }}
                            >
                              <UserCircle2 className="w-4 h-4" />
                              Account Settings
                            </button>
                            <button 
                              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm"
                              onClick={() => {
                                setShowMenuDropdown(false);
                                setShowSignOutDialog(true);
                              }}
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>

                          {/* My Practices */}
                          <div className="border-t border-gray-200 pt-1">
                            <div className="px-4 py-2 text-xs text-gray-500">My Practices</div>
                            <button 
                              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                setShowMenuDropdown(false);
                                toast.info('Switching to Automated Healthcare Practice');
                              }}
                            >
                              <div className="text-sm">Automated Healthcare Practice</div>
                            </button>
                            <button 
                              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                setShowMenuDropdown(false);
                                toast.info('Switching to Springfield Medical Center');
                              }}
                            >
                              <div className="text-sm">Springfield Medical Center</div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Home Screen Content */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                      {/* Welcome Card */}
                      <div className="bg-gradient-to-br from-teal-600 to-teal-500 text-white rounded-2xl p-5 mb-4">
                        <div className="text-xs opacity-90 mb-1">Welcome back,</div>
                        <div className="text-xl mb-3">{patientName}</div>
                        <div className="flex items-center gap-2 text-xs bg-white/20 rounded-lg px-3 py-2 w-fit">
                          <Heart className="w-4 h-4" />
                          <span>Your health is our priority</span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="mb-4">
                        <div className="text-xs text-gray-600 mb-3 px-1">Quick Actions</div>
                        <div className="grid grid-cols-1 gap-3">
                          <button
                            onClick={() => setCurrentScreen('chat')}
                            className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all active:scale-95"
                          >
                            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                              <MessageCircle className="w-6 h-6 text-teal-600" />
                            </div>
                            <span className="text-xs">Ask AI Assistant</span>
                          </button>
                        </div>
                      </div>

                      {/* Notifications */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm">Notifications</div>
                          {unreadCount > 0 && (
                            <Badge className="bg-purple-600 text-white border-purple-600 text-xs">
                              {unreadCount} New
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-3">
                          {notifications.slice(0, 3).map((notif, idx) => (
                            <div 
                              key={notif.id} 
                              className={`flex items-start gap-3 py-2 ${idx < 2 ? 'border-b border-gray-100' : ''}`}
                              onClick={() => {
                                if (notif.type === 'message') {
                                  setCurrentScreen('chat');
                                }
                              }}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                notif.type === 'message' ? 'bg-purple-100' :
                                notif.type === 'appointment' ? 'bg-teal-100' :
                                'bg-blue-100'
                              }`}>
                                {notif.type === 'message' && <UserCheck className="w-4 h-4 text-purple-600" />}
                                {notif.type === 'appointment' && <Calendar className="w-4 h-4 text-teal-600" />}
                                {notif.type === 'lab' && <FileIcon className="w-4 h-4 text-blue-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs mb-0.5 flex items-center gap-2">
                                  {notif.title}
                                  {!notif.read && (
                                    <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600">{notif.message}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {notifications.length > 3 && (
                          <button 
                            className="w-full mt-3 pt-3 border-t border-gray-100 text-xs text-teal-600 hover:text-teal-700 transition-colors"
                            onClick={() => toast.info('View All Notifications (Coming Soon)')}
                          >
                            View All ({notifications.length})
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="bg-white border-t border-gray-200 px-6 py-3">
                    </div>
                  </>
                ) : currentScreen === 'settings' ? (
                  <MobileAccountSettings 
                    patientId={patientId}
                    onBack={() => setCurrentScreen('home')}
                  />
                ) : (
                  <>
                    {/* Chat Header */}
                    <div className="bg-teal-600 text-white px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setCurrentScreen('home')}
                          className="p-1"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-teal-500 text-white">
                            <Bot className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm">AI Health Assistant</div>
                          <div className="text-xs opacity-90 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Online
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div key={message.id}>
                            <div className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                              {(message.role === 'assistant' || message.role === 'staff') && (
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                  <AvatarFallback className={message.role === 'staff' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}>
                                    {message.role === 'staff' ? (
                                      <UserCheck className="w-4 h-4" />
                                    ) : (
                                      <Bot className="w-4 h-4" />
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                                {message.role === 'staff' && message.senderName && (
                                  <div className="text-xs text-gray-600 mb-1 px-1">
                                    {message.senderName}
                                  </div>
                                )}
                                <div className={`rounded-2xl p-3 max-w-[80%] ${
                                  message.role === 'user' 
                                    ? 'bg-teal-600 text-white rounded-tr-sm' 
                                    : message.role === 'staff'
                                    ? 'bg-purple-50 border border-purple-200 rounded-tl-sm'
                                    : 'bg-white border border-gray-200 rounded-tl-sm'
                                }`}>
                                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                                  <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-teal-100' : 'text-gray-500'}`}>
                                    {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                  </div>
                                </div>
                                
                                {/* FHIR Data Cards */}
                                {message.fhirData && (
                                  <div className="max-w-[80%] space-y-2 mt-2">
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
                                
                                {/* Yes/No Confirmation Buttons */}
                                {message.role === 'assistant' && message.isRouted && waitingForSendConfirmation && messages.indexOf(message) === messages.length - 1 && (
                                  <div className="max-w-[80%] flex gap-2 mt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSendConfirmation(true)}
                                      className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600 hover:border-teal-700 text-xs px-4 py-1.5 h-auto rounded-full"
                                    >
                                      Yes
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSendConfirmation(false)}
                                      className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400 text-xs px-4 py-1.5 h-auto rounded-full"
                                    >
                                      No
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {loading && (
                          <div className="flex gap-2">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback className="bg-teal-100 text-teal-700">
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-3">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Input Area */}
                    <div className="bg-white border-t border-gray-200 p-3">
                      <div className="flex gap-2 items-center">
                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        
                        {/* Camera button */}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={loading || uploadingImage}
                          className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                        >
                          {uploadingImage ? (
                            <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Camera className="w-5 h-5" />
                          )}
                        </button>
                        
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          disabled={loading || uploadingImage}
                          className="flex-1 rounded-full border-gray-300 text-sm px-4"
                        />
                        <button 
                          onClick={() => handleSendMessage()}
                          disabled={loading || uploadingImage || !input.trim()}
                          className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Mobile Toast Notification */}
                    <MobileToast
                      show={showMobileToast}
                      title="Message sent to practice"
                      description="This is a confirmation that your message has been received. Someone from our office will be in touch. If this is an emergency please dial 911. Thank you."
                      onClose={() => setShowMobileToast(false)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Try Asking</CardTitle>
              <CardDescription>Tap any question to test</CardDescription>
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
                    <span className="text-xs">{question}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Patient Info */}
          <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Logged In Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="">{patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient ID:</span>
                  <span className="font-mono">{patientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">DOB:</span>
                  <span>March 15, 1990</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span>34 years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">FHIR Status:</span>
                  <Badge className="bg-green-600 text-xs">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-1"></div>
                    Connected
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-4 h-4" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-3">
                <div>
                  <div className="mb-1"><strong>Real-Time Queries:</strong></div>
                  <div className="text-gray-600">
                    When Sarah asks about medications, the app queries <span className="font-mono text-xs bg-white px-1 py-0.5 rounded">/fhir/MedicationStatement</span> with her patient ID
                  </div>
                </div>
                <div>
                  <div className="mb-1"><strong>Smart Detection:</strong></div>
                  <div className="text-gray-600">
                    NLP detects intent (medications, appointments, conditions, etc.) and fetches relevant FHIR resources
                  </div>
                </div>
                <div>
                  <div className="mb-1"><strong>Data Display:</strong></div>
                  <div className="text-gray-600">
                    FHIR data is formatted into easy-to-read cards that appear inline with the AI response
                  </div>
                </div>
                <div>
                  <div className="mb-1"><strong>FHIR Resources:</strong></div>
                  <div className="text-gray-600 font-mono text-[10px] space-y-0.5">
                    <div>• Patient</div>
                    <div>• MedicationStatement</div>
                    <div>• Condition</div>
                    <div>• AllergyIntolerance</div>
                    <div>• Appointment</div>
                    <div>• Observation</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Summarization Section */}
      {messages.length > 1 && (
        <div className="mt-8">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2>Staff View - EHR Integration</h2>
            </div>
            <p className="text-gray-600">
              This is how the conversation appears in the practice management system for staff review
            </p>
          </div>

          {/* EHR-Style Interface */}
          <Card className="border-gray-300 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-white">Automated Healthcare Practice</h3>
                  <div className="text-teal-100 text-xs">Electronic Health Record System</div>
                </div>
              </div>
              <Badge className="bg-white text-teal-700 border-white">
                <Shield className="w-3 h-3 mr-1" />
                HIPAA Compliant
              </Badge>
            </div>

            <CardContent className="p-0">
              {/* EHR Tabs */}
              <div className="bg-gray-100 border-b border-gray-300 px-6 py-2 flex gap-1">
                <Button variant="ghost" className="h-9 px-4 bg-white border border-gray-300 text-sm hover:bg-gray-50">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
                <Button variant="ghost" className="h-9 px-4 text-sm text-gray-600 hover:bg-gray-50">
                  <Calendar className="w-4 h-4 mr-2" />
                  Appointments
                </Button>
                <Button variant="ghost" className="h-9 px-4 text-sm text-gray-600 hover:bg-gray-50">
                  <FileText className="w-4 h-4 mr-2" />
                  Patient Chart
                </Button>
                <Button variant="ghost" className="h-9 px-4 text-sm text-gray-600 hover:bg-gray-50">
                  <Users className="w-4 h-4 mr-2" />
                  Tasks
                </Button>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-3 divide-x divide-gray-300">
                {/* Left Panel - Message List */}
                <div className="bg-gray-50">
                  <div className="p-4 border-b border-gray-300 bg-white">
                    <div className="text-sm mb-2">Inbox</div>
                    <div className="text-xs text-gray-600">1 unread conversation</div>
                  </div>
                  
                  <div className="p-2">
                    <div className="bg-white border border-teal-300 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarFallback className="bg-teal-100 text-teal-700 text-sm">
                            SJ
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm">{patientName}</div>
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                              <Bot className="w-3 h-3 mr-1" />
                              AI
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mb-1">Patient ID: {patientId}</div>
                          <div className="text-xs text-gray-500 line-clamp-2">
                            {messages[messages.length - 1]?.content.substring(0, 50)}...
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-gray-500">
                              {new Date(messages[messages.length - 1]?.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </div>
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                              Action Needed
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Panel - Conversation */}
                <div className="col-span-2 bg-white flex flex-col" style={{ height: '600px' }}>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-gray-300 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-teal-100 text-teal-700">
                            SJ
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm mb-1">{patientName}</div>
                          <div className="text-xs text-gray-600">DOB: March 15, 1990 • Age: 34 • MRN: {patientId}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm" className="h-8">
                          <FileText className="w-4 h-4 mr-1" />
                          Chart
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Conversation Thread */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <ChatSummary 
                      messages={messages.map(m => ({
                        role: m.role,
                        content: m.content,
                        timestamp: m.timestamp
                      }))}
                      patientId={patientId}
                      patientName={patientName}
                      conversationId={`conv-${patientId}-${Date.now()}`}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm mb-2">
                    <strong>HIPAA-Compliant AI Summarization Workflow:</strong> Patient conversations with the AI Receptionist are automatically summarized using Greenway's AIRE Agent (patient-summary, ag_9f2b8c) and routed to appropriate EHR staff based on intent.
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs mt-3">
                    <div className="flex items-start gap-2">
                      <Smartphone className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="mb-0.5"><strong>Patient Chat</strong></div>
                        <div className="text-gray-700">Conversation with AI Assistant</div>
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
                      <Users className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="mb-0.5"><strong>Staff Routing</strong></div>
                        <div className="text-gray-700">Routes to appropriate staff role</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="mb-0.5"><strong>EHR Integration</strong></div>
                        <div className="text-gray-700">Summary appears in staff inbox</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}