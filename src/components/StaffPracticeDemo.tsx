import { useState, useEffect } from 'react';
import { Search, Package, CheckCircle, Shield, Calendar, Bell, Phone, User, Send, BookOpen, Bot, AlertCircle, MessageCircle, Image as ImageIcon, FileText, ChevronDown, CalendarDays, Users, CheckSquare, Settings } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import logoImage from 'figma:asset/dddbdc959a1381b093d3ffe86a91e2b8539fe8ac.png';
import navLogoImage from 'figma:asset/a0c8ed220948fd94661ca373d1b4d8f518fe1d2b.png';
import { messageQueue, RoutedMessage, StaffReply } from '../utils/sharedMessages';
import { ScrollArea } from './ui/scroll-area';
import PortalRegistrationMismatchTask from './PortalRegistrationMismatchTask';
import { ClinicalAppointmentsView } from './ClinicalAppointmentsView';
import { PreVisitFormCard } from './PreVisitFormCard';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Priority {
  id: string;
  type: 'recommendation' | 'urgent';
  patient: string;
  message: string;
  urgency: 'Critical' | 'Missing';
  impact: string;
  actions: { label: string; variant: 'default' | 'outline' }[];
  details?: { label: string; value: string }[];
}

interface Message {
  id: string;
  patient: string;
  message: string;
  time: string;
  urgency: 'urgent';
  actions: { label: string; variant: 'default' | 'outline' }[];
  aiSummary?: string;
  detectedIntent?: string;
  conversationHistory?: Array<{
    sender: 'patient' | 'bot' | 'staff';
    senderName: string;
    content: string;
    timestamp: string;
    imageUrl?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: string;
  }>;
  isFromPatientApp?: boolean;
}

export function StaffPracticeDemo() {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyOpen, setReplyOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [replyMessage, setReplyMessage] = useState('');
  const [customTemplates, setCustomTemplates] = useState<Array<{id: string; name: string; content: string}>>([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [quickReplyIds, setQuickReplyIds] = useState<string[]>(['1', '2', '3', '4', '5']);
  const [fullChatOpen, setFullChatOpen] = useState(false);
  const [showPortalMismatch, setShowPortalMismatch] = useState(true);
  const [suiteDropdownOpen, setSuiteDropdownOpen] = useState(false);
  const [activeSuite, setActiveSuite] = useState<'clinical' | 'revenue'>('revenue');
  const [activeNavSection, setActiveNavSection] = useState<'appointments' | 'patient-search' | 'tasks' | 'settings'>('appointments');
  const [preVisitForms, setPreVisitForms] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      patient: 'Mandy Johnson',
      message: 'Hi, I was checking on my lab results. Are they ready yet? I\'d also like to schedule a follow-up appointment to discuss them.',
      time: '2h ago',
      urgency: 'urgent',
      actions: [
        { label: 'Reply', variant: 'default' },
        { label: 'Call', variant: 'outline' }
      ],
      aiSummary: 'Summary:\nPatient accessed AI assistant regarding lab results. Results confirmed as ready for review. Patient requesting follow-up appointment.\n\nACTION NEEDED:\n• Schedule appointment for patient\n• Patient\'s preferred date: Next Tuesday (11/19/2025)',
      detectedIntent: 'Appointment Request',
      conversationHistory: [
        {
          sender: 'patient',
          senderName: 'Mandy Johnson',
          content: 'Hi, are my lab results ready?',
          timestamp: '2:15 PM'
        },
        {
          sender: 'bot',
          senderName: 'AI Assistant',
          content: 'Yes, your lab results are ready for review. They were completed this morning and are available in your patient portal.',
          timestamp: '2:15 PM'
        },
        {
          sender: 'patient',
          senderName: 'Mandy Johnson',
          content: 'Great! I\'d like to schedule an appointment to discuss them with my doctor. Is next Tuesday available?',
          timestamp: '2:16 PM'
        },
        {
          sender: 'bot',
          senderName: 'AI Assistant',
          content: 'I can help you with that! I\'m connecting you with our scheduling team to book an appointment for next Tuesday, November 19th.',
          timestamp: '2:16 PM'
        }
      ],
      isFromPatientApp: true
    },
    {
      id: '2',
      patient: 'Maria Rodriguez',
      message: 'I got a denial letter for my MRI. Can you help me understand why? I thought my doctor submitted everything.',
      time: '7h ago',
      urgency: 'urgent',
      actions: [
        { label: 'Reply', variant: 'default' },
        { label: 'Call', variant: 'outline' }
      ]
    },
    {
      id: '3',
      patient: 'Jennifer Martinez',
      message: 'My new insurance card arrived. Should I bring it Thursday or upload it somewhere?',
      time: '4h ago',
      urgency: 'urgent',
      actions: [
        { label: 'Reply', variant: 'default' },
        { label: 'Send link', variant: 'outline' }
      ]
    }
  ]);

  const responseTemplates = [
    {
      id: '1',
      name: 'Billing Question Acknowledgment',
      content: 'Thanks for reaching out about your bill. We\'ve forwarded this to our billing team. They\'ll reply by {followup_timeframe}. For faster help, call {billing_phone} with your statement number.'
    },
    {
      id: '2',
      name: 'Insurance Update Request',
      content: 'We can update your insurance. Please send:\n• Front/back photos of your insurance card\n• Effective date and policy holder name\n• Any changes to your address or phone'
    },
    {
      id: '3',
      name: 'Follow-up Appointment & Insurance',
      content: 'We got your message to schedule your follow up. Please let us know your preferred date. Morning or Afternoon? We can also update your insurance ahead of your appointment. Please send:\n• Front/back photos of your insurance card\n• Effective date and policy holder name\n• Any changes to your address or phone'
    },
    {
      id: '4',
      name: 'Attachment Acknowledgment',
      content: 'Attachment received—thanks! We\'ll review and reply by {response_window}.'
    },
    {
      id: '5',
      name: 'Wrong Recipient',
      content: 'It looks like this message may be intended for another office. This is {practice_name} at {location}. If you need help finding the right practice, tell us the name and we\'ll try to point you in the right direction.'
    },
    {
      id: '6',
      name: 'Duplicate Message',
      content: 'We received your earlier message and are on it. We\'ll follow up by {followup_timeframe}. No need to resend—thank you!'
    },
    {
      id: '7',
      name: 'Tech Support',
      content: 'If the app isn\'t working as expected, try logging out/in, updating to the latest version, or restarting your device. Still having issues? Call {tech_support_phone}.'
    },
    {
      id: '8',
      name: 'Results Normal',
      content: 'Good news—your recent {test_name} from {test_date} is within normal range. {provider_name} has reviewed it. No changes to your plan unless you have new concerns.'
    },
    {
      id: '9',
      name: 'Results Abnormal Follow-up',
      content: 'Your {test_name} shows changes we\'d like to discuss. Please book a {visit_type} within {followup_window} to review options with {provider_name}.'
    }
  ];

  const allTemplates = [...responseTemplates, ...customTemplates];
  const quickReplyTemplates = allTemplates.filter(t => quickReplyIds.includes(t.id));

  const handleAddToQuickReplies = (templateId: string) => {
    if (quickReplyIds.length < 5 && !quickReplyIds.includes(templateId)) {
      setQuickReplyIds([...quickReplyIds, templateId]);
    }
  };

  const handleRemoveFromQuickReplies = (templateId: string) => {
    setQuickReplyIds(quickReplyIds.filter(id => id !== templateId));
  };

  const handleInsertTemplate = (templateId: string) => {
    const template = allTemplates.find(t => t.id === templateId);
    if (template && selectedMessage) {
      // Replace variables with actual values
      const content = template.content
        .replace('{patient_name}', selectedMessage.patient.split(' ')[0])
        .replace('{date}', 'Thursday')
        .replace('{time}', '2:00 PM');
      setReplyMessage(content);
      setSelectedTemplate(templateId);
      setLibraryOpen(false);
    }
  };

  const handleReply = (message: Message) => {
    setSelectedMessage(message);
    setReplyMessage('');
    setSelectedTemplate('');
    setShowSaveTemplate(false);
    setNewTemplateName('');
    setReplyOpen(true);
  };

  const handleSelectTemplate = (templateId: string) => {
    if (templateId === 'custom') {
      setSelectedTemplate('custom');
      setReplyMessage('');
      return;
    }
    
    setSelectedTemplate(templateId);
    const template = allTemplates.find(t => t.id === templateId);
    if (template && selectedMessage) {
      // Replace variables with actual values
      const content = template.content
        .replace('{patient_name}', selectedMessage.patient.split(' ')[0])
        .replace('{date}', 'Thursday')
        .replace('{time}', '2:00 PM');
      setReplyMessage(content);
    }
  };

  const handleSaveAsTemplate = () => {
    if (newTemplateName.trim() && replyMessage.trim()) {
      const newTemplate = {
        id: `custom-${Date.now()}`,
        name: newTemplateName,
        content: replyMessage
      };
      setCustomTemplates([...customTemplates, newTemplate]);
      setShowSaveTemplate(false);
      setNewTemplateName('');
    }
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyMessage.trim()) return;
    
    // Send the reply through the message queue
    const staffReply: StaffReply = {
      messageId: selectedMessage.id,
      staffMessage: replyMessage,
      staffName: 'Sarah Jones', // Staff member name
      timestamp: new Date().toISOString()
    };
    
    console.log('[StaffPracticeDemo] Sending reply:', staffReply);
    messageQueue.addReply(staffReply);
    console.log('[StaffPracticeDemo] Reply added to queue. Current replies:', messageQueue.getReplies());
    
    setReplyOpen(false);
    setSelectedMessage(null);
    setReplyMessage('');
    setSelectedTemplate('');
    setShowSaveTemplate(false);
    setNewTemplateName('');
  };

  const stats = [
    { label: 'TOTAL ORDERS', value: '13.6k', change: '+2.3%', icon: Package, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { label: 'AUTH SUCCESS', value: '79%', change: '+11%', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' },
    { label: 'INSURANCE', value: '88%', change: '+9%', icon: Shield, color: 'text-red-500', bgColor: 'bg-red-50' },
    { label: 'DAYS IN AR', value: '42', change: '+3', icon: Calendar, color: 'text-purple-500', bgColor: 'bg-purple-50' },
  ];

  const priorities: Priority[] = [
    {
      id: '1',
      type: 'recommendation',
      patient: 'Susan',
      message: 'Start with Susan. Her appointment is scheduled for today but insurance is missing. Verify coverage now to avoid delays or cancellation.',
      urgency: 'Critical',
      impact: '$3,200',
      actions: [
        { label: 'Verify insurance', variant: 'default' },
        { label: 'Call patient', variant: 'outline' }
      ]
    },
    {
      id: '2',
      type: 'urgent',
      patient: 'Susan Williams',
      message: 'Missing insurance information - appointment scheduled for today. Need to verify coverage before proceeding.',
      urgency: 'Missing',
      impact: '',
      actions: [
        { label: 'Verify insurance', variant: 'default' },
        { label: 'Call patient', variant: 'outline' }
      ],
      details: [
        { label: 'Insurance', value: '$3,200' }
      ]
    },
    {
      id: '3',
      type: 'urgent',
      patient: 'Maria Rodriguez',
      message: 'MRI denied - needs peer-to-peer within 24 hours. Unhealthy/care PPO all docs ready to go.',
      urgency: 'Urgent',
      impact: '',
      actions: [],
      details: []
    }
  ];

  useEffect(() => {
    // Load existing messages from the queue on mount
    const existingMessages = messageQueue.getMessages();
    if (existingMessages.length > 0) {
      setMessages(prevMessages => {
        const newMessages = existingMessages
          .filter(routedMsg => !prevMessages.some(m => m.id === routedMsg.id))
          .map(routedMsg => ({
            id: routedMsg.id,
            patient: routedMsg.patientName,
            message: routedMsg.patientMessage,
            time: 'just now',
            urgency: 'urgent' as const,
            aiSummary: routedMsg.aiSummary,
            detectedIntent: routedMsg.detectedIntent,
            conversationHistory: routedMsg.conversationHistory,
            isFromPatientApp: true,
            actions: [
              { label: 'Reply', variant: 'default' as const },
              { label: 'Call', variant: 'outline' as const }
            ]
          }));
        return [...prevMessages, ...newMessages];
      });
    }

    // Subscribe to new messages
    const unsubscribe = messageQueue.subscribe((routedMessages) => {
      // Get the latest message
      if (routedMessages.length > 0) {
        const latestMessage = routedMessages[routedMessages.length - 1];
        
        // Add the new message to the messages array
        setMessages(prevMessages => {
          // Check if message already exists
          const exists = prevMessages.some(m => m.id === latestMessage.id);
          if (exists) return prevMessages;
          
          return [...prevMessages, {
            id: latestMessage.id,
            patient: latestMessage.patientName,
            message: latestMessage.patientMessage,
            time: 'just now',
            urgency: 'urgent',
            aiSummary: latestMessage.aiSummary,
            detectedIntent: latestMessage.detectedIntent,
            conversationHistory: latestMessage.conversationHistory,
            isFromPatientApp: true,
            actions: [
              { label: 'Reply', variant: 'default' },
              { label: 'Call', variant: 'outline' }
            ]
          }];
        });
      }
    });

    // Cleanup subscription on component unmount
    return unsubscribe;
  }, []);

  // Fetch pre-visit forms for Sarah Johnson
  useEffect(() => {
    const fetchPreVisitForms = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/pre-visit-submissions/patient-001`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setPreVisitForms(data.submissions || []);
        }
      } catch (error) {
        console.error('Error fetching pre-visit forms:', error);
      }
    };

    fetchPreVisitForms();
    
    // Poll every 10 seconds for new submissions
    const interval = setInterval(fetchPreVisitForms, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar Navigation */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img src={navLogoImage} alt="Logo" className="w-8 h-8" />
            <div className="text-sm leading-tight">
              Automated Healthcare<br />Practice
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1">
          {/* ClinicalSuite Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSuiteDropdownOpen(!suiteDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span>{activeSuite === 'clinical' ? 'ClinicalSuite' : 'RevenueSuite'}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${suiteDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {suiteDropdownOpen && (
              <div className="mt-1 ml-6 space-y-1">
                <button
                  onClick={() => {
                    setActiveSuite('clinical');
                    setSuiteDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSuite === 'clinical' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ClinicalSuite
                </button>
                <button
                  onClick={() => {
                    setActiveSuite('revenue');
                    setSuiteDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSuite === 'revenue' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  RevenueSuite
                </button>
              </div>
            )}
          </div>

          {/* Appointments */}
          <button
            onClick={() => setActiveNavSection('appointments')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeNavSection === 'appointments'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CalendarDays className={`w-4 h-4 ${activeNavSection === 'appointments' ? 'text-white' : 'text-gray-400'}`} />
            <span>Appointments</span>
          </button>

          {/* Patient Search */}
          <button
            onClick={() => setActiveNavSection('patient-search')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeNavSection === 'patient-search'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className={`w-4 h-4 ${activeNavSection === 'patient-search' ? 'text-white' : 'text-gray-400'}`} />
            <span>Patient Search</span>
          </button>

          {/* Tasks */}
          <button
            onClick={() => setActiveNavSection('tasks')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeNavSection === 'tasks'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CheckSquare className={`w-4 h-4 ${activeNavSection === 'tasks' ? 'text-white' : 'text-gray-400'}`} />
            <span>Tasks</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveNavSection('settings')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeNavSection === 'settings'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className={`w-4 h-4 ${activeNavSection === 'settings' ? 'text-white' : 'text-gray-400'}`} />
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Automated</div>
                <div>Healthcare Practice</div>
              </div>
            </div>
            
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search patient, case ID, or member ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button size="icon" variant="outline" className="rounded-lg">
                <Bell className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-lg">
                <User className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-blue-500 text-white text-xs">SJ</AvatarFallback>
                </Avatar>
                <span className="text-sm">Sarah Jones</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blue Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="text-white text-sm opacity-90">
            {activeSuite === 'clinical' ? 'ClinicalSuite' : 'RevenueSuite'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {activeSuite === 'revenue' ? (
          // RevenueSuite View
          <>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 bg-white border-gray-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-sm text-green-600">{stat.change}</div>
                </div>
                <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                <div className="text-2xl">{stat.value}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Priorities */}
          <div className="col-span-2">
            <Card className="bg-white border-gray-300">
              <div className="p-6 border-b border-gray-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg">Your priorities</h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={activeTab === 'today' ? 'default' : 'ghost'}
                      onClick={() => setActiveTab('today')}
                      className={activeTab === 'today' ? '' : 'text-gray-600'}
                    >
                      Today
                    </Button>
                    <Button
                      size="sm"
                      variant={activeTab === 'week' ? 'default' : 'ghost'}
                      onClick={() => setActiveTab('week')}
                      className={activeTab === 'week' ? '' : 'text-gray-600'}
                    >
                      This week
                    </Button>
                    <Button
                      size="sm"
                      variant={activeTab === 'all' ? 'default' : 'ghost'}
                      onClick={() => setActiveTab('all')}
                      className={activeTab === 'all' ? '' : 'text-gray-600'}
                    >
                      All
                    </Button>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {/* Recommendation Card */}
                <div className="p-6 bg-blue-50">
                  <div className="flex gap-3 mb-3">
                    <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                      WE RECOMMEND
                    </Badge>
                  </div>
                  <p className="text-sm mb-3 pl-8">
                    Start with Susan. Her appointment is scheduled for today but insurance is missing. Verify coverage now to avoid delays or cancellation.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 pl-8">
                    <span>Urgency: <span className="text-red-600">Critical</span></span>
                    <span>Impact: <span className="">$3,200</span></span>
                  </div>
                </div>

                {/* Priority Items */}
                {priorities.slice(1).map((priority) => (
                  <div key={priority.id} className="p-6">
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-gray-100 text-gray-600">
                          {priority.patient.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{priority.patient}</span>
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                              {priority.urgency.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{priority.message}</p>
                        {priority.details && priority.details.length > 0 && (
                          <div className="flex gap-4 mb-3">
                            {priority.details.map((detail, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="text-gray-600">{detail.label}</span>{' '}
                                <span className="">{detail.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {priority.actions.length > 0 && (
                          <div className="flex gap-2">
                            {priority.actions.map((action, idx) => (
                              <Button
                                key={idx}
                                size="sm"
                                variant={action.variant}
                                className={action.variant === 'default' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Messages */}
          <div className="col-span-1">
            <Card className="bg-white border-gray-300">
              <div className="p-6 border-b border-gray-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg">Messages</h2>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <span className="mr-1">+</span> NEW
                  </Button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {/* Portal Registration Mismatch Task */}
                {showPortalMismatch && (
                  <div className="p-4">
                    <PortalRegistrationMismatchTask
                      taskId="PRM-2025-001"
                      submittedAt={new Date().toISOString()}
                      portalData={{
                        firstName: 'Mandy',
                        lastName: 'Thompson',
                        dob: '1988-07-15',
                        zipCode: '30303',
                        accountNumber: '228'
                      }}
                      onResolve={(patientId) => {
                        console.log('Portal registration linked to patient:', patientId);
                        setShowPortalMismatch(false);
                      }}
                      onDismiss={() => setShowPortalMismatch(false)}
                    />
                  </div>
                )}

                {/* Pre-Visit Forms */}
                {preVisitForms.map((form) => (
                  <PreVisitFormCard
                    key={form.id}
                    submission={form}
                    patientName="Sarah Johnson"
                    appointmentDate="Nov 22, 2025"
                  />
                ))}

                {messages.map((message) => (
                  <div key={message.id} className="p-6">
                    <div className="flex gap-3 mb-3">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-gray-100 text-gray-600">
                          {message.patient.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm">{message.patient}</span>
                          <span className="text-xs text-gray-400">{message.time}</span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          {message.isFromPatientApp && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                              <Bot className="w-3 h-3" />
                              AI Routed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {message.aiSummary && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3 rounded-r">
                        <div className="flex items-start gap-2">
                          <Bot className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs text-blue-900 mb-1">AI Summary</div>
                            <p className="text-sm text-blue-800">{message.aiSummary}</p>
                            {message.detectedIntent && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                  Intent: {message.detectedIntent.replace('_', ' ')}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{message.message}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleReply(message)}
                      >
                        Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        {message.id === '1' ? 'Call' : 'Send link'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
        </>
        ) : (
          // ClinicalSuite - Appointments View
          <ClinicalAppointmentsView />
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.patient}</DialogTitle>
            <DialogDescription>
              {selectedMessage?.isFromPatientApp 
                ? 'AI-routed message from patient app. Review conversation history and AI summary below.'
                : 'Choose a quick reply template below or compose your own message.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* AI Summary Section */}
            {selectedMessage?.aiSummary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-900">AI Summary & Analysis</span>
                      {selectedMessage.conversationHistory && selectedMessage.conversationHistory.length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setFullChatOpen(true)}
                          className="h-7 gap-1 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                        >
                          <MessageCircle className="w-3 h-3" />
                          View Full Chat
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-blue-800 mb-2">{selectedMessage.aiSummary}</p>
                    {selectedMessage.detectedIntent && (
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                        Detected Intent: {selectedMessage.detectedIntent.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Attachments Section */}
            {selectedMessage?.conversationHistory && selectedMessage.conversationHistory.some(msg => msg.imageUrl || msg.fileUrl) && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Patient Attachments</span>
                </div>
                <div className="space-y-3">
                  {selectedMessage.conversationHistory
                    .filter(msg => msg.imageUrl || msg.fileUrl)
                    .map((msg, index) => (
                      <div key={index}>
                        {msg.imageUrl && (
                          <div className="border rounded-lg overflow-hidden">
                            <img 
                              src={msg.imageUrl} 
                              alt="Patient uploaded image" 
                              className="w-full h-auto"
                              style={{ maxHeight: '300px', objectFit: 'contain' }}
                            />
                          </div>
                        )}
                        {msg.fileUrl && (
                          <div className="bg-gray-50 border rounded-lg p-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 rounded flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-teal-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm truncate">{msg.fileName}</div>
                              <div className="text-xs text-gray-500">{msg.fileType} • {msg.fileSize} KB</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm">Quick Reply Templates</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setLibraryOpen(true)}
                  className="h-8 gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs">Full Library</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickReplyTemplates.map(template => (
                  <Button
                    key={template.id}
                    size="sm"
                    variant={selectedTemplate === template.id ? 'default' : 'outline'}
                    onClick={() => handleSelectTemplate(template.id)}
                    className={selectedTemplate === template.id ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    {template.name}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedTemplate('custom');
                    setReplyMessage('');
                  }}
                >
                  Custom
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Message</Label>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here or select a template above..."
                rows={8}
                className="resize-none"
              />
            </div>

            {selectedTemplate === 'custom' && (
              <div className="flex gap-2">
                <Label className="text-sm">Save as Template</Label>
                <Input
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Template Name"
                  className="w-1/2"
                />
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleSaveAsTemplate}
                  disabled={!newTemplateName.trim() || !replyMessage.trim()}
                >
                  Save
                </Button>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-gray-500">
                {selectedMessage && `Replying to message from ${selectedMessage.time}`}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setReplyOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Library Dialog */}
      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Message Template Library</DialogTitle>
            <DialogDescription>
              Browse all available message templates organized by category
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 mt-4">
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Staff Reply Templates</h3>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Billing Question Acknowledgment</span>
                  <Badge variant="secondary" className="text-xs">TEMPLATE</Badge>
                </div>
                <div className="bg-white p-3 rounded border text-sm mb-3">
                  Thanks for reaching out about your bill. We've forwarded this to our billing team. They'll reply by {'{followup_timeframe}'}. For faster help, call {'{billing_phone}'} with your statement number.
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertTemplate('1')}
                  >
                    Insert Template
                  </Button>
                  {quickReplyIds.includes('1') ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFromQuickReplies('1')}
                    >
                      Remove from Quick Replies
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAddToQuickReplies('1')}
                      disabled={quickReplyIds.length >= 5}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add to Quick Replies
                    </Button>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Insurance Update Request</span>
                  <Badge variant="secondary" className="text-xs">TEMPLATE</Badge>
                </div>
                <div className="bg-white p-3 rounded border text-sm mb-3">
                  We can update your insurance. Please send:<br/>• Front/back photos of your insurance card<br/>• Effective date and policy holder name<br/>• Any changes to your address or phone
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertTemplate('2')}
                  >
                    Insert Template
                  </Button>
                  {quickReplyIds.includes('2') ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFromQuickReplies('2')}
                    >
                      Remove from Quick Replies
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAddToQuickReplies('2')}
                      disabled={quickReplyIds.length >= 5}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add to Quick Replies
                    </Button>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Follow-up Appointment & Insurance</span>
                  <Badge variant="secondary" className="text-xs">TEMPLATE</Badge>
                </div>
                <div className="bg-white p-3 rounded border text-sm mb-3">
                  We got your message to schedule your follow up. Please let us know your preferred date. Morning or Afternoon? We can also update your insurance ahead of your appointment. Please send:<br/>• Front/back photos of your insurance card<br/>• Effective date and policy holder name<br/>• Any changes to your address or phone
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertTemplate('3')}
                  >
                    Insert Template
                  </Button>
                  {quickReplyIds.includes('3') ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFromQuickReplies('3')}
                    >
                      Remove from Quick Replies
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAddToQuickReplies('3')}
                      disabled={quickReplyIds.length >= 5}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add to Quick Replies
                    </Button>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Attachment Acknowledgment</span>
                  <Badge variant="secondary" className="text-xs">TEMPLATE</Badge>
                </div>
                <div className="bg-white p-3 rounded border text-sm mb-3">
                  Attachment received—thanks! We'll review and reply by {'{response_window}'}.
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertTemplate('4')}
                  >
                    Insert Template
                  </Button>
                  {quickReplyIds.includes('4') ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFromQuickReplies('4')}
                    >
                      Remove from Quick Replies
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAddToQuickReplies('4')}
                      disabled={quickReplyIds.length >= 5}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add to Quick Replies
                    </Button>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Wrong Recipient</span>
                  <Badge variant="secondary" className="text-xs">TEMPLATE</Badge>
                </div>
                <div className="bg-white p-3 rounded border text-sm mb-3">
                  It looks like this message may be intended for another office. This is {'{practice_name}'} at {'{location}'}. If you need help finding the right practice, tell us the name and we'll try to point you in the right direction.
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertTemplate('5')}
                  >
                    Insert Template
                  </Button>
                  {quickReplyIds.includes('5') ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFromQuickReplies('5')}
                    >
                      Remove from Quick Replies
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAddToQuickReplies('5')}
                      disabled={quickReplyIds.length >= 5}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add to Quick Replies
                    </Button>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Duplicate Message</span>
                  <Badge variant="secondary" className="text-xs">TEMPLATE</Badge>
                </div>
                <div className="bg-white p-3 rounded border text-sm mb-3">
                  We received your earlier message and are on it. We'll follow up by {'{followup_timeframe}'}. No need to resend—thank you!
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertTemplate('6')}
                  >
                    Insert Template
                  </Button>
                  {quickReplyIds.includes('6') ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFromQuickReplies('6')}
                    >
                      Remove from Quick Replies
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAddToQuickReplies('6')}
                      disabled={quickReplyIds.length >= 5}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add to Quick Replies
                    </Button>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Tech Support</span>
                  <Badge variant="secondary" className="text-xs">TEMPLATE</Badge>
                </div>
                <div className="bg-white p-3 rounded border text-sm mb-3">
                  If the app isn't working as expected, try logging out/in, updating to the latest version, or restarting your device. Still having issues? Call {'{tech_support_phone}'}.
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertTemplate('7')}
                  >
                    Insert Template
                  </Button>
                  {quickReplyIds.includes('7') ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFromQuickReplies('7')}
                    >
                      Remove from Quick Replies
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAddToQuickReplies('7')}
                      disabled={quickReplyIds.length >= 5}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add to Quick Replies
                    </Button>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Results Normal</span>
                  <Badge variant="secondary" className="text-xs">TEMPLATE</Badge>
                </div>
                <div className="bg-white p-3 rounded border text-sm mb-3">
                  Good news—your recent {'{test_name}'} from {'{test_date}'} is within normal range. {'{provider_name}'} has reviewed it. No changes to your plan unless you have new concerns.
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertTemplate('8')}
                  >
                    Insert Template
                  </Button>
                  {quickReplyIds.includes('8') ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFromQuickReplies('8')}
                    >
                      Remove from Quick Replies
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAddToQuickReplies('8')}
                      disabled={quickReplyIds.length >= 5}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add to Quick Replies
                    </Button>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Results Abnormal Follow-up</span>
                  <Badge variant="secondary" className="text-xs">TEMPLATE</Badge>
                </div>
                <div className="bg-white p-3 rounded border text-sm mb-3">
                  Your {'{test_name}'} shows changes we'd like to discuss. Please book a {'{visit_type}'} within {'{followup_window}'} to review options with {'{provider_name}'}.
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertTemplate('9')}
                  >
                    Insert Template
                  </Button>
                  {quickReplyIds.includes('9') ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFromQuickReplies('9')}
                    >
                      Remove from Quick Replies
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAddToQuickReplies('9')}
                      disabled={quickReplyIds.length >= 5}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add to Quick Replies
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setLibraryOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Chat History Dialog */}
      <Dialog open={fullChatOpen} onOpenChange={setFullChatOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Full Conversation History</DialogTitle>
            <DialogDescription>
              Complete conversation between {selectedMessage?.patient} and the AI Assistant
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              {selectedMessage?.conversationHistory && selectedMessage.conversationHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    msg.sender === 'patient' ? 'justify-start' : msg.sender === 'staff' ? 'justify-start' : 'justify-start'
                  }`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback
                      className={
                        msg.sender === 'patient'
                          ? 'bg-gray-100 text-gray-600'
                          : msg.sender === 'staff'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }
                    >
                      {msg.sender === 'patient'
                        ? selectedMessage.patient.charAt(0)
                        : msg.sender === 'staff'
                        ? 'S'
                        : 'AI'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{msg.senderName}</span>
                      <span className="text-xs text-gray-400">{msg.timestamp}</span>
                      {msg.sender === 'bot' && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          AI Assistant
                        </Badge>
                      )}
                      {msg.sender === 'staff' && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          Staff
                        </Badge>
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        msg.sender === 'patient'
                          ? 'bg-gray-100'
                          : msg.sender === 'staff'
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-purple-50 border border-purple-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.imageUrl && (
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <img
                          src={msg.imageUrl}
                          alt="Patient uploaded image"
                          className="w-full h-auto"
                          style={{ maxHeight: '400px', objectFit: 'contain' }}
                        />
                      </div>
                    )}
                    {msg.fileUrl && (
                      <div className="mt-2 bg-gray-50 border rounded-lg p-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{msg.fileName}</div>
                          <div className="text-xs text-gray-500">
                            {msg.fileType} • {msg.fileSize} KB
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setFullChatOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}