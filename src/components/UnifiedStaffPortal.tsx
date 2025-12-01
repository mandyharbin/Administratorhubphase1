import { toast } from 'sonner@2.0.3';
import { useState, useEffect } from 'react';
import { 
  Search, Calendar, Bell, MessageCircle, Users, CheckSquare, 
  ChevronDown, Phone, Send, Bot, CheckCircle, BookOpen, AlertTriangle,
  ArrowRight, DollarSign, Activity, Trash2, Mail, MessageSquare, FileText
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import navLogoImage from 'figma:asset/a0c8ed220948fd94661ca373d1b4d8f518fe1d2b.png';
import { messageQueue } from '../utils/sharedMessages';
import { ClinicalAppointmentsView } from './ClinicalAppointmentsView';
import { PreVisitFormCard } from './PreVisitFormCard';
import { ChartReviewDialog } from './ChartReviewDialog';
import { SusanWilliamsFacesheet } from './SusanWilliamsFacesheet';
import { DavidJohnsonFacesheet } from './DavidJohnsonFacesheet';
import { ClinicalUserPortal } from './ClinicalUserPortal';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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

type MainTab = 'messages' | 'patients' | 'appointments' | 'tasks';

export function UnifiedStaffPortal() {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('messages');
  const [suiteDropdownOpen, setSuiteDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{name: string, initials: string}>({
    name: 'Staff User',
    initials: 'SU'
  });
  const [activeSuite, setActiveSuite] = useState<'clinical' | 'revenue'>('revenue');
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
  const [preVisitForms, setPreVisitForms] = useState<any[]>([]);

  // Patient matching dialog states
  const [matchPatientOpen, setMatchPatientOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [ehrSearchResults, setEhrSearchResults] = useState<any[]>([]);
  const [selectedEhrPatient, setSelectedEhrPatient] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [messageToMatch, setMessageToMatch] = useState<Message | null>(null);
  const [matchSuccessOpen, setMatchSuccessOpen] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [contactPatientOpen, setContactPatientOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [chartReviewOpen, setChartReviewOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientListSearch, setPatientListSearch] = useState('');
  const [routedTasks, setRoutedTasks] = useState<any[]>([]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'form-completion-001',
      patient: 'John Smith',
      message: 'Patient has completed all required pre-visit forms for upcoming appointment on November 30, 2025 at 2:00 PM with Dr. Sarah Chen. Forms completed: New Patient Intake, Financial Consent, HIPAA Privacy, COVID-19 Screening, Insurance Card, Photo ID.',
      time: '15min ago',
      urgency: 'urgent',
      actions: [
        { label: 'View Forms', variant: 'default' },
        { label: 'Review Chart', variant: 'outline' }
      ],
      aiSummary: 'Summary:\\nPatient completed all 6 required pre-visit forms.\\n\\nCOMPLETED FORMS:\\n• New Patient Intake Form (demographics, medications, allergies)\\n• Financial Consent Agreement\\n• HIPAA Privacy Notice Acknowledgment\\n• COVID-19 Pre-Visit Screening\\n• Insurance Card Upload (front/back)\\n• Photo ID Upload\\n\\nNEXT STEPS:\\n• Review intake form for medical history\\n• Verify insurance information\\n• Prepare chart for Nov 30 appointment',
      detectedIntent: 'Pre-Visit Forms Complete',
      isFromPatientApp: true,
      conversationHistory: [
        {
          sender: 'patient',
          senderName: 'John Smith',
          content: 'All forms completed via patient app',
          timestamp: '2025-11-24T14:45:00'
        }
      ]
    },
    {
      id: '0',
      patient: 'Mandy Thompson',
      message: 'I tried to register for the patient portal but got an error saying my information doesn\'t match. I entered my name as Mandy Thompson, DOB 01/15/1985, and zip code 30308. Can you help me get access?',
      time: '30min ago',
      urgency: 'urgent',
      actions: [
        { label: 'Reply', variant: 'default' },
        { label: 'Verify', variant: 'outline' }
      ],
      aiSummary: 'Summary:\nPatient unable to complete portal registration due to data mismatch.\n\nACTION NEEDED:\n• Verify patient identity (DOB: 01/15/1985, Zip: 30308)\n• Check EHR for alternate name spellings (Amanda vs Mandy)\n• Link patient portal account to correct EHR record\n• Send portal access instructions',
      detectedIntent: 'Portal Registration Issue',
      isFromPatientApp: true
    },
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
    }
  ];

  const allTemplates = [...responseTemplates, ...customTemplates];
  const quickReplyTemplates = allTemplates.filter(t => quickReplyIds.includes(t.id));

  const handleReplyClick = (message: Message) => {
    setSelectedMessage(message);
    setReplyOpen(true);
    setReplyMessage('');
    setSelectedTemplate('');
  };

  const handleInsertTemplate = (templateId: string) => {
    const template = allTemplates.find(t => t.id === templateId);
    if (template) {
      setReplyMessage(template.content);
      setSelectedTemplate(templateId);
    }
  };

  const handleSendReply = () => {
    if (replyMessage.trim() && selectedMessage) {
      // Add to shared message queue for patient app
      messageQueue.addReply({
        messageId: selectedMessage.id,
        staffMessage: replyMessage,
        staffName: 'Staff User',
        timestamp: new Date().toISOString()
      });

      // Remove from messages queue
      setMessages(messages.filter(m => m.id !== selectedMessage.id));
      setReplyOpen(false);
      setSelectedMessage(null);
      setReplyMessage('');
    }
  };

  const handleViewFullChat = (message: Message) => {
    setSelectedMessage(message);
    setFullChatOpen(true);
  };

  // Fetch pre-visit forms
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/preVisitForms`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPreVisitForms(data.forms || []);
        }
      } catch (error) {
        console.error('Error fetching pre-visit forms:', error);
      }
    };

    if (activeMainTab === 'tasks') {
      fetchForms();
    }
  }, [activeMainTab]);

  // Fetch staff messages from backend
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/staff-messages`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('[Staff Portal] Fetched messages:', data);
          
          // Transform backend messages to match our Message interface
          const transformedMessages = data.messages.map((msg: any) => {
            // Handle different message types
            const isTextMessage = msg.type === 'text';
            const isSummary = msg.type === 'ai-chat-summary';
            
            return {
              id: msg.id || `backend-${Date.now()}-${Math.random()}`,
              patient: isTextMessage 
                ? msg.senderName || 'Unknown Patient'
                : isSummary
                  ? `Patient ${msg.patientId || 'Unknown'}`
                  : 'Unknown Patient',
              message: isTextMessage 
                ? msg.content
                : isSummary
                  ? msg.summary
                  : msg.content || msg.summary || 'No content',
              time: formatMessageTime(msg.timestamp || msg.createdAt),
              urgency: msg.priority === 'high' ? 'urgent' as const : 'urgent' as const,
              actions: [
                { label: 'Reply', variant: 'default' as const },
                { label: 'Verify', variant: 'outline' as const }
              ],
              aiSummary: generateSummaryForMessage(msg),
              detectedIntent: detectIntent(msg.content || msg.summary || ''),
              isFromPatientApp: true
            };
          });

          // Update messages state - keep existing demo messages (including form-completion-001), add new ones from backend
          setMessages((prev) => {
            const demoMessages = prev.filter(m => ['form-completion-001', '0', '1', '2', '3'].includes(m.id));
            const backendIds = new Set(transformedMessages.map(m => m.id));
            const existingBackend = prev.filter(m => backendIds.has(m.id));
            
            // Merge: new backend messages + existing backend messages (for updates) + demo messages
            return [...transformedMessages, ...demoMessages];
          });
        }
      } catch (error) {
        console.error('[Staff Portal] Error fetching messages:', error);
      }
    };

    // Fetch initially
    fetchMessages();

    // Poll every 5 seconds when on messages tab
    const interval = activeMainTab === 'messages' ? setInterval(fetchMessages, 5000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeMainTab]);

  // Helper functions for message transformation
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const generateSummaryForMessage = (msg: any) => {
    const content = msg?.content || '';
    if (content.includes('REGISTRATION MISMATCH')) {
      return 'Summary:\nPatient unable to complete portal registration due to identity verification failure.\n\nACTION NEEDED:\n• Verify patient identity using provided information\n• Contact patient via their preferred method\n• Assist with manual registration if identity confirmed';
    }
    return 'Summary:\nPatient message requires staff attention.';
  };

  const detectIntent = (content: string) => {
    if (!content) return 'General Inquiry';
    if (content.includes('REGISTRATION')) return 'Portal Registration Issue';
    if (content.includes('APPOINTMENT')) return 'Appointment Request';
    return 'General Inquiry';
  };

  // Parse registration mismatch message content
  const parseRegistrationMismatch = (content: string) => {
    if (!content || !content.includes('REGISTRATION MISMATCH')) return null;

    const lines = content.split('\n');
    const data: any = {
      entered: {},
      ehr: {},
      contact: {}
    };

    let currentSection = '';
    lines.forEach(line => {
      if (line.includes('Entered Information:')) currentSection = 'entered';
      else if (line.includes('EHR Match Found:')) currentSection = 'ehr';
      else if (line.includes('Preferred Contact Method:')) currentSection = 'contact';
      
      if (line.includes('- Name:')) {
        const name = line.split('- Name:')[1]?.trim();
        if (currentSection === 'entered') data.entered.name = name;
        if (currentSection === 'ehr') data.ehr.name = name;
      }
      if (line.includes('- DOB:')) {
        const dob = line.split('- DOB:')[1]?.trim();
        if (currentSection === 'entered') data.entered.dob = dob;
        if (currentSection === 'ehr') data.ehr.dob = dob;
      }
      if (line.includes('- ZIP:')) {
        data.entered.zip = line.split('- ZIP:')[1]?.trim();
      }
      if (line.includes('- Billing Account:')) {
        data.entered.account = line.split('- Billing Account:')[1]?.trim();
      }
      if (line.includes('Preferred Contact Method:')) {
        data.contact.method = line.split('Preferred Contact Method:')[1]?.trim();
      }
      if (line.includes('Contact Info:')) {
        data.contact.info = line.split('Contact Info:')[1]?.trim();
      }
    });

    return data;
  };

  const handleMatchPatient = async (messageId: string) => {
    // Find the message and open the patient matching dialog
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setMessageToMatch(message);
      setMatchPatientOpen(true);
      setPatientSearchQuery('');
      setEhrSearchResults([]);
      setSelectedEhrPatient(null);
    }
  };

  const handleSearchEHR = async () => {
    if (!patientSearchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Simulate EHR search - in production, this would call the actual FHIR endpoint
      // Search can be by: name, DOB, patient ID, or any combination
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const searchLower = patientSearchQuery.toLowerCase();
      
      // Mock patient database
      const allPatients = [
        {
          id: 'patient-65432',
          name: 'David Johnson',
          firstName: 'David',
          lastName: 'Johnson',
          dob: '1986-03-15',
          gender: 'male',
          mrn: 'MRN-65432',
          patientId: '65432',
          address: {
            line: ['456 River Rd'],
            city: 'Sacramento',
            state: 'CA',
            postalCode: '95653'
          },
          phone: '(916) 555-0199',
          email: 'david.johnson@email.com'
        },
        {
          id: 'patient-12345',
          name: 'Amanda Thompson',
          firstName: 'Amanda',
          lastName: 'Thompson',
          dob: '1985-01-15',
          gender: 'female',
          mrn: 'MRN-12345',
          patientId: '12345',
          address: {
            line: ['123 Main St'],
            city: 'Atlanta',
            state: 'GA',
            postalCode: '30308'
          },
          phone: '(404) 555-0123',
          email: 'amanda.thompson@email.com'
        },
        {
          id: 'patient-12346',
          name: 'Mandy A. Thompson',
          firstName: 'Mandy',
          lastName: 'Thompson',
          dob: '1985-01-15',
          gender: 'female',
          mrn: 'MRN-12346',
          patientId: '12346',
          address: {
            line: ['456 Oak Ave'],
            city: 'Atlanta',
            state: 'GA',
            postalCode: '30308'
          },
          phone: '(404) 555-0124'
        },
        {
          id: 'patient-78901',
          name: 'John Smith',
          firstName: 'John',
          lastName: 'Smith',
          dob: '1990-05-20',
          gender: 'male',
          mrn: 'MRN-78901',
          patientId: '78901',
          address: {
            line: ['789 Pine St'],
            city: 'Atlanta',
            state: 'GA',
            postalCode: '30309'
          },
          phone: '(404) 555-0125',
          email: 'john.smith@email.com'
        }
      ];
      
      // Search by name, DOB, patient ID, or ZIP code
      const results = allPatients.filter(patient => {
        const fullNameMatch = patient.name.toLowerCase().includes(searchLower);
        const firstNameMatch = patient.firstName.toLowerCase().includes(searchLower);
        const lastNameMatch = patient.lastName.toLowerCase().includes(searchLower);
        const dobMatch = patient.dob.includes(searchLower);
        const patientIdMatch = patient.patientId.includes(searchLower);
        const zipMatch = patient.address.postalCode.includes(searchLower);
        
        return fullNameMatch || firstNameMatch || lastNameMatch || dobMatch || patientIdMatch || zipMatch;
      });
      
      setEhrSearchResults(results);
    } catch (error) {
      console.error('[EHR Search] Error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmMatch = async () => {
    if (!selectedEhrPatient || !messageToMatch) return;
    
    const mismatchData = parseRegistrationMismatch(messageToMatch.message);
    
    try {
      // Show loading toast
      toast.loading('Matching patient and activating portal access...', { id: 'patient-match' });

      // 1. Call backend API to process the patient match
      const matchResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/patient-match`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messageId: messageToMatch.id,
            portalAccountInfo: {
              name: mismatchData?.entered.name || messageToMatch.patient,
              dob: mismatchData?.entered.dob || 'N/A',
              zip: mismatchData?.entered.zip || 'N/A',
              account: mismatchData?.entered.account || 'N/A',
              contactMethod: mismatchData?.contact.method || 'Phone',
              contactInfo: mismatchData?.contact.info || 'N/A'
            },
            ehrPatient: selectedEhrPatient,
            matchedBy: 'Staff User' // In production, use actual staff user ID
          })
        }
      );

      if (!matchResponse.ok) {
        const errorData = await matchResponse.json();
        throw new Error(errorData.error || 'Failed to match patient');
      }

      const matchResult = await matchResponse.json();
      console.log('[Patient Match] Success:', matchResult);

      // 2. Delete the message from backend if it's a backend message
      if (!['0', '1', '2', '3'].includes(messageToMatch.id)) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/staff-messages/${messageToMatch.id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
      }

      // 3. Remove message from local state
      setMessages(messages.filter(m => m.id !== messageToMatch.id));
      
      // 4. Store result and show success dialog
      setMatchResult(matchResult);
      setMatchPatientOpen(false);
      setMatchSuccessOpen(true);

      // 5. Show success toast
      toast.success(
        'Successfully matched patient and activated portal access!',
        { 
          id: 'patient-match',
          duration: 4000
        }
      );

    } catch (error) {
      console.error('[Staff Portal] Error matching patient:', error);
      toast.error(
        `Failed to match patient: ${error.message}`,
        { 
          id: 'patient-match',
          duration: 5000
        }
      );
    }
  };

  // Helper to contact patient directly via their preferred method
  const handleContactPatient = (message: Message) => {
    const mismatchData = parseRegistrationMismatch(message.message);
    
    if (!mismatchData?.contact) {
      toast.error('No contact information available for this patient');
      return;
    }

    const { method, info } = mismatchData.contact;
    const practiceName = 'Greenway Health Medical Center';

    let messageContent = '';
    if (method === 'SMS' || method === 'Phone') {
      messageContent = `Hi ${mismatchData.entered.name}, this is ${practiceName} regarding your patient portal registration. We're here to help you complete the process. Could you please verify your name as it appears in our records?`;
    } else if (method === 'Email') {
      messageContent = `Dear ${mismatchData.entered.name},\n\nWe received your patient portal registration request. We'd like to help you complete the registration process.\n\nCould you please verify the name as it appears in our records?\n\nBest regards,\n${practiceName} Patient Services Team`;
    }

    // Set contact info and open dialog
    setContactInfo({
      patientName: mismatchData.entered.name,
      method: method,
      destination: info,
      message: messageContent,
      practiceName: practiceName
    });
    setContactPatientOpen(true);
  };

  const handleClearAllMessages = async () => {
    try {
      // Clear backend messages
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/staff-messages`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        console.log('[Staff Portal] Cleared all backend messages');
      }

      // Clear all messages including demo messages
      setMessages([]);
      
      // Clear the shared message queue as well
      messageQueue.clearMessages();
      
    } catch (error) {
      console.error('[Staff Portal] Error clearing messages:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Delete backend message
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/staff-messages/${encodeURIComponent(messageId)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        console.log('[Staff Portal] Deleted backend message:', messageId);
      }

      // Remove from local state
      setMessages(prev => prev.filter(m => m.id !== messageId));
      
    } catch (error) {
      console.error('[Staff Portal] Error deleting message:', error);
    }
  };

  const handleRouteMessageToClinical = (message: Message) => {
    // Create a task from the message
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 1); // Due tomorrow
    
    // Check if message is about pre-visit forms
    const hasPreVisitForms = message.id === 'form-completion-001' || message.detectedIntent === 'Pre-Visit Forms Complete';
    
    const newTask = {
      id: `routed-${Date.now()}`,
      patientName: message.patient,
      patientMRN: 'N/A', // Would need to be looked up
      taskType: 'Patient Messages' as const,
      description: message.message.substring(0, 100) + (message.message.length > 100 ? '...' : ''),
      priority: 'High' as const,
      status: 'Pending' as const,
      dueDate: dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      createdDate: today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      assignedTo: 'David Ford, MD',
      routedFrom: 'Staff User',
      hasPreVisitForms: hasPreVisitForms,
      preVisitFormData: hasPreVisitForms ? {
        patientName: message.patient,
        appointmentDate: 'November 30, 2025',
        appointmentTime: '2:00 PM',
        provider: 'Dr. Sarah Chen'
      } : undefined
    };

    setRoutedTasks(prev => [...prev, newTask]);
    
    // Remove from staff messages
    setMessages(prev => prev.filter(m => m.id !== message.id));
    
    toast.success('Message routed to Clinical User successfully');
  };

  // If Clinical User, show different portal
  if (currentUser.name === 'Clinical User') {
    return (
      <div className="relative">
        <ClinicalUserPortal
          userName={currentUser.name}
          userInitials={currentUser.initials}
          onUserClick={() => setUserDropdownOpen(!userDropdownOpen)}
          routedTasks={routedTasks}
          initialTab={activeMainTab as any}
        />
        
        {/* User Dropdown - Positioned absolutely over the ClinicalUserPortal */}
        {userDropdownOpen && (
          <div className="fixed top-14 right-6 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[100]">
            <button
              onClick={() => {
                setCurrentUser({ name: 'Staff User', initials: 'SU' });
                setActiveMainTab('messages');
                setUserDropdownOpen(false);
                toast.success('Switched to Staff User');
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                currentUser.name === 'Staff User' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              Staff User
            </button>
            <button
              onClick={() => {
                setCurrentUser({ name: 'Clinical User', initials: 'CU' });
                setActiveMainTab('appointments');
                setUserDropdownOpen(false);
                toast.success('Switched to Clinical User');
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                currentUser.name === 'Clinical User' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              Clinical User
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-6">
          <img src={navLogoImage} alt="Greenway Health" className="h-8" />
          
          {/* Suite Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSuiteDropdownOpen(!suiteDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">
                {activeSuite === 'clinical' ? 'Clinical Suite' : 'Revenue Suite'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${suiteDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {suiteDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setActiveSuite('revenue');
                    setSuiteDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${activeSuite === 'revenue' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                >
                  Revenue Suite
                </button>
                <button
                  onClick={() => {
                    setActiveSuite('clinical');
                    setSuiteDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${activeSuite === 'clinical' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                >
                  Clinical Suite
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5" />
          </Button>
          
          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{currentUser.initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-900">{currentUser.name}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {userDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setCurrentUser({ name: 'Staff User', initials: 'SU' });
                    setActiveMainTab('messages');
                    setUserDropdownOpen(false);
                    toast.success('Switched to Staff User');
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    currentUser.name === 'Staff User' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  Staff User
                </button>
                <button
                  onClick={() => {
                    setCurrentUser({ name: 'Clinical User', initials: 'CU' });
                    setActiveMainTab('appointments');
                    setUserDropdownOpen(false);
                    toast.success('Switched to Clinical User');
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    currentUser.name === 'Clinical User' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  Clinical User
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Main Navigation */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <div className="p-4 space-y-1">
            <button
              onClick={() => setActiveMainTab('messages')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeMainTab === 'messages'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">Messages</span>
              {messages.length > 0 && (
                <Badge variant="secondary" className={`ml-auto ${activeMainTab === 'messages' ? 'bg-blue-700' : 'bg-red-100 text-red-700'}`}>
                  {messages.length}
                </Badge>
              )}
            </button>

            <button
              onClick={() => setActiveMainTab('patients')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeMainTab === 'patients'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-sm">Patients</span>
            </button>

            <button
              onClick={() => setActiveMainTab('appointments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeMainTab === 'appointments'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Appointments</span>
            </button>

            <button
              onClick={() => setActiveMainTab('tasks')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeMainTab === 'tasks'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span className="text-sm">Tasks</span>
              {preVisitForms.length > 0 && (
                <Badge variant="secondary" className={`ml-auto ${activeMainTab === 'tasks' ? 'bg-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                  {preVisitForms.length}
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Messages Tab */}
          {activeMainTab === 'messages' && (
            <div className="p-6 max-w-7xl mx-auto">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-gray-900">Message Center</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Manage patient messages, AI escalations, and secure communications
                  </p>
                </div>
                {messages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllMessages}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Messages
                  </Button>
                )}
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Message Queue */}
              <div className="space-y-4">
                {messages.map((message) => {
                  const mismatchData = parseRegistrationMismatch(message.message);
                  
                  return (
                  <Card key={message.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-purple-100 text-purple-700">
                              {message.patient.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900">{message.patient}</span>
                              {message.isFromPatientApp && (
                                <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                                  <Bot className="w-3 h-3 mr-1" />
                                  From AI Assistant
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{message.time}</span>
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      </div>

                      {/* Form Completion Special UI */}
                      {message.detectedIntent === 'Pre-Visit Forms Complete' ? (
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-2 mb-3">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="text-sm text-green-900 mb-1">All Pre-Visit Forms Completed</div>
                                <p className="text-xs text-green-800">
                                  Patient has completed all required forms for their upcoming appointment
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* AI Summary */}
                          {message.aiSummary && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-start gap-2">
                                <Bot className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <div className="text-xs text-blue-900 mb-1">AI Summary</div>
                                  <pre className="text-xs text-blue-900 whitespace-pre-wrap font-sans">
                                    {message.aiSummary}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}

                          <p className="text-sm text-gray-700">{message.message}</p>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => toast.success('Opening forms viewer...')}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Forms
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setChartReviewOpen(true)}
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              Review Chart
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
                              onClick={() => handleRouteMessageToClinical(message)}
                            >
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Route to Clinical
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      ) : mismatchData ? (
                        <div className="space-y-4">
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-start gap-2 mb-3">
                              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="text-sm text-orange-900 mb-1">Patient Identity Mismatch</div>
                                <p className="text-xs text-orange-800">
                                  Patient attempted portal registration but entered information doesn't match EHR record
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {/* Patient Entered */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <div className="text-xs text-gray-600 mb-3">Patient Entered:</div>
                              <div className="space-y-2">
                                <div>
                                  <div className="text-xs text-gray-500">Name</div>
                                  <div className="text-sm text-gray-900">{mismatchData.entered.name || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">DOB</div>
                                  <div className="text-sm text-gray-900">{mismatchData.entered.dob || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">ZIP Code</div>
                                  <div className="text-sm text-gray-900">{mismatchData.entered.zip || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Account #</div>
                                  <div className="text-sm text-gray-900">{mismatchData.entered.account || 'N/A'}</div>
                                </div>
                              </div>
                            </div>

                            {/* EHR Record */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="text-xs text-blue-700 mb-3">Potential Match Found:</div>
                              <div className="space-y-2">
                                <div>
                                  <div className="text-xs text-blue-600">Name</div>
                                  <div className="text-sm text-blue-900">{mismatchData.ehr.name || 'N/A'}</div>
                                  {mismatchData.entered.name !== mismatchData.ehr.name && (
                                    <Badge variant="outline" className="mt-1 text-xs bg-orange-100 text-orange-700 border-orange-300">
                                      Mismatch
                                    </Badge>
                                  )}
                                </div>
                                <div>
                                  <div className="text-xs text-blue-600">DOB</div>
                                  <div className="text-sm text-blue-900">{mismatchData.ehr.dob || 'N/A'}</div>
                                  {mismatchData.entered.dob === mismatchData.ehr.dob && (
                                    <Badge variant="outline" className="mt-1 text-xs bg-green-100 text-green-700 border-green-300">
                                      Match
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="text-xs text-purple-700 mb-2">Patient Contact Information:</div>
                            <div className="flex items-center gap-4">
                              <div>
                                <span className="text-xs text-purple-600">Method: </span>
                                <span className="text-sm text-purple-900">{mismatchData.contact.method || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-xs text-purple-600">Phone: </span>
                                <span className="text-sm text-purple-900">{mismatchData.contact.info || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Match Actions */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleMatchPatient(message.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm Match & Link Account
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReplyClick(message)}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Contact Patient
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-700 text-sm mb-4">{message.message}</p>

                          {/* AI Summary */}
                          {message.aiSummary && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                              <div className="flex items-start gap-2 mb-2">
                                <Bot className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <div className="text-xs text-blue-900 mb-1">AI Summary</div>
                                  {message.detectedIntent && (
                                    <Badge variant="outline" className="text-xs mb-2 bg-white">
                                      Intent: {message.detectedIntent}
                                    </Badge>
                                  )}
                                  <pre className="text-xs text-blue-900 whitespace-pre-wrap font-sans">
                                    {message.aiSummary}
                                  </pre>
                                </div>
                              </div>
                              {message.conversationHistory && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewFullChat(message)}
                                  className="text-xs mt-2"
                                >
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  View Full Conversation
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleReplyClick(message)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Reply
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="w-4 h-4 mr-2" />
                              Call
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
                              onClick={() => handleRouteMessageToClinical(message)}
                            >
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Route to Clinical
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )})}
              </div>
            </div>
          )}

          {/* Patients Tab */}
          {activeMainTab === 'patients' && !selectedPatient && (
            <div className="p-6 max-w-7xl mx-auto">
              <div className="mb-6">
                <h2 className="text-gray-900">Patient Management</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Search patients, view charts, and access medical records
                </p>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, MRN, or date of birth..."
                    value={patientListSearch}
                    onChange={(e) => setPatientListSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Patient List */}
              <div className="space-y-3">
                {[
                  { name: 'Johnson, David', mrn: '65432', dob: '03/15/1986', age: '39y', gender: 'M', lastVisit: 'November 24, 2025', zip: '95653' },
                  { name: 'Williams, Susan', mrn: '338822', dob: '01/27/1967', age: '58y', gender: 'F', lastVisit: 'August 15, 2025', zip: '30308' },
                  { name: 'Smith, John', mrn: '78901', dob: '05/20/1990', age: '35y', gender: 'M', lastVisit: 'November 20, 2025', zip: '30309' },
                  { name: 'Johnson, Emily', mrn: '44556', dob: '03/15/1985', age: '40y', gender: 'F', lastVisit: 'November 18, 2025', zip: '30310' },
                  { name: 'Brown, Michael', mrn: '92341', dob: '11/08/1978', age: '47y', gender: 'M', lastVisit: 'October 30, 2025', zip: '30311' },
                  { name: 'Davis, Jennifer', mrn: '55789', dob: '07/22/1992', age: '33y', gender: 'F', lastVisit: 'November 22, 2025', zip: '30312' },
                ].filter(patient => 
                  patientListSearch === '' || 
                  patient.name.toLowerCase().includes(patientListSearch.toLowerCase()) ||
                  patient.mrn.includes(patientListSearch) ||
                  patient.dob.includes(patientListSearch) ||
                  patient.zip.includes(patientListSearch)
                ).map((patient) => (
                  <Card 
                    key={patient.mrn} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      if (patient.name === 'Williams, Susan' || patient.name === 'Johnson, David') {
                        setSelectedPatient(patient.name);
                      } else {
                        toast.info(`Chart for ${patient.name} is not available in this demo`);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-purple-100 text-purple-700">
                              {patient.name.split(', ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-900">{patient.name}</span>
                              <Badge variant="outline" className="text-xs">
                                MRN: {patient.mrn}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                              <span>DOB: {patient.dob}</span>
                              <span>•</span>
                              <span>{patient.age}</span>
                              <span>•</span>
                              <span>{patient.gender}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Last Visit</div>
                          <div className="text-sm text-gray-900">{patient.lastVisit}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Patient Facesheet */}
          {activeMainTab === 'patients' && selectedPatient === 'Williams, Susan' && (
            <SusanWilliamsFacesheet onBack={() => setSelectedPatient(null)} />
          )}

          {activeMainTab === 'patients' && selectedPatient === 'Johnson, David' && (
            <DavidJohnsonFacesheet onBack={() => setSelectedPatient(null)} />
          )}

          {/* Appointments Tab */}
          {activeMainTab === 'appointments' && (
            <div className="p-6 max-w-7xl mx-auto">
              <ClinicalAppointmentsView />
            </div>
          )}

          {/* Tasks Tab */}
          {activeMainTab === 'tasks' && (
            <div className="p-6 max-w-7xl mx-auto">
              <div className="mb-6">
                <h2 className="text-gray-900">Task Center</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Review pre-visit forms and other action items
                </p>
              </div>

              <div className="space-y-6">
                {/* Pre-Visit Forms */}
                {preVisitForms.length > 0 && (
                  <div>
                    <h3 className="text-gray-900 mb-4">Pre-Visit Forms</h3>
                    <div className="space-y-4">
                      {preVisitForms.map((form) => (
                        <PreVisitFormCard key={form.formId} form={form} />
                      ))}
                    </div>
                  </div>
                )}

                {!preVisitForms.length && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-gray-900 mb-2">No Pending Tasks</h3>
                      <p className="text-gray-600 text-sm">
                        All tasks have been completed. Great work!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.patient}</DialogTitle>
            <DialogDescription>
              Send a secure message to the patient
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Quick Reply Templates */}
            <div>
              <Label className="text-sm text-gray-700 mb-2 block">Quick Reply Templates</Label>
              <div className="flex flex-wrap gap-2">
                {quickReplyTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleInsertTemplate(template.id)}
                    className={selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : ''}
                  >
                    {template.name}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLibraryOpen(true)}
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  More Templates
                </Button>
              </div>
            </div>

            {/* Message Input */}
            <div>
              <Label htmlFor="reply-message" className="text-sm text-gray-700 mb-2 block">
                Message
              </Label>
              <Textarea
                id="reply-message"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[200px]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
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
        </DialogContent>
      </Dialog>

      {/* Full Chat History Dialog */}
      <Dialog open={fullChatOpen} onOpenChange={setFullChatOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Conversation History - {selectedMessage?.patient}</DialogTitle>
            <DialogDescription>
              Full conversation thread with AI assistant
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {selectedMessage?.conversationHistory?.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.sender === 'patient' ? '' : 'justify-start'}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={
                      msg.sender === 'bot' ? 'bg-blue-100 text-blue-700' :
                      msg.sender === 'staff' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {msg.sender === 'bot' ? <Bot className="w-4 h-4" /> :
                       msg.senderName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-900">{msg.senderName}</span>
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-900">
                      {msg.content}
                    </div>
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Attachment"
                        className="mt-2 rounded-lg max-w-xs"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Template Library Dialog */}
      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message Template Library</DialogTitle>
            <DialogDescription>
              Browse and select from all available templates
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4">
            {allTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => {
                  handleInsertTemplate(template.id);
                  setLibraryOpen(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm text-gray-900">{template.name}</span>
                    {quickReplyIds.includes(template.id) && (
                      <Badge variant="secondary" className="text-xs">Quick Reply</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">{template.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Matching Dialog */}
      <Dialog open={matchPatientOpen} onOpenChange={setMatchPatientOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Match Patient to Portal Account</DialogTitle>
            <DialogDescription>
              Search and link the patient's EHR record to their portal account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Patient Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-3">Patient Entered:</div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="text-sm text-gray-900">{parseRegistrationMismatch(messageToMatch?.message || '')?.entered.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">DOB</div>
                  <div className="text-sm text-gray-900">{parseRegistrationMismatch(messageToMatch?.message || '')?.entered.dob || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">ZIP Code</div>
                  <div className="text-sm text-gray-900">{parseRegistrationMismatch(messageToMatch?.message || '')?.entered.zip || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Account #</div>
                  <div className="text-sm text-gray-900">{parseRegistrationMismatch(messageToMatch?.message || '')?.entered.account || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div>
              <Label className="text-xs text-gray-600 mb-2 block">Search Patient in EHR</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, DOB, or patient ID..."
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchEHR();
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Examples: "Thompson", "1985-01-15", "12345"
              </p>
            </div>

            {/* Search Button */}
            <Button
              size="sm"
              onClick={handleSearchEHR}
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? (
                <Activity className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search EHR
            </Button>

            {/* Search Results */}
            {ehrSearchResults.length > 0 && (
              <div className="space-y-4 mt-4">
                {ehrSearchResults.map((patient) => (
                  <Card
                    key={patient.id}
                    className="cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => setSelectedEhrPatient(patient)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm text-gray-900">{patient.name}</span>
                        {selectedEhrPatient?.id === patient.id && (
                          <Badge variant="secondary" className="text-xs">Selected</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap">
                        DOB: {patient.dob}<br />
                        Gender: {patient.gender}<br />
                        MRN: {patient.mrn}<br />
                        Address: {patient.address.line.join(', ')} {patient.address.city}, {patient.address.state} {patient.address.postalCode}<br />
                        Phone: {patient.phone}<br />
                        Email: {patient.email}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results Found */}
            {patientSearchQuery && !isSearching && ehrSearchResults.length === 0 && (
              <Card className="border-orange-200 bg-orange-50 mt-4">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-orange-900 mb-2">No Match Found in EHR</div>
                      <p className="text-xs text-orange-800 mb-4">
                        We couldn't find a patient matching "{patientSearchQuery}" in the EHR. This could mean:
                      </p>
                      <ul className="text-xs text-orange-800 space-y-1 mb-4 ml-4 list-disc">
                        <li>Patient may not be in the system yet</li>
                        <li>Search criteria may need adjustment</li>
                        <li>Patient may be registered under a different name/ID</li>
                      </ul>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPatientSearchQuery('');
                            setEhrSearchResults([]);
                          }}
                          className="bg-white border-orange-300"
                        >
                          Clear Search
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContactPatient(messageToMatch!)}
                          className="bg-white border-orange-300"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Contact Patient
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Confirm Match Button */}
            <Button
              size="sm"
              onClick={handleConfirmMatch}
              disabled={!selectedEhrPatient}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Match & Link Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={matchSuccessOpen} onOpenChange={setMatchSuccessOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <DialogTitle>Patient Successfully Matched!</DialogTitle>
                <DialogDescription>
                  Portal access has been activated and patient notified
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {matchResult && (
            <div className="space-y-4 mt-4">
              {/* What Happened */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="text-sm text-green-900 mb-3">
                    ✅ Portal account created and linked to EHR
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-green-700 mb-1">Portal Username</div>
                      <div className="text-sm text-gray-900 font-mono">
                        {matchResult.portalActivation?.portalAccountId}@patient
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-green-700 mb-1">Linked to EHR</div>
                      <div className="text-sm text-gray-900">
                        {matchResult.portalActivation?.linkedEhrMrn}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Sent */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {matchResult.notification?.method === 'SMS' ? (
                      <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 mb-1">
                        Patient notification sent via {matchResult.notification?.method}
                      </div>
                      <div className="text-xs text-gray-600">
                        To: {matchResult.notification?.destination}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        The patient has received their login credentials and instructions to access the portal.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="text-sm text-blue-900 mb-2">📋 Next Steps</div>
                  <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                    <li>Patient can now log in to the portal with their credentials</li>
                    <li>They will be prompted to change their password on first login</li>
                    <li>All EHR records are now accessible in their portal account</li>
                    <li>You can view this match record in Registration Management</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setMatchSuccessOpen(false);
                    setMatchResult(null);
                    setMessageToMatch(null);
                    setSelectedEhrPatient(null);
                  }}
                  className="flex-1"
                >
                  Done
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Close the dialog - registration is complete
                    setMatchSuccessOpen(false);
                    setMatchResult(null);
                    toast.success('You can now see this match in your messages list');
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Patient Dialog */}
      <Dialog open={contactPatientOpen} onOpenChange={setContactPatientOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                {contactInfo?.method === 'SMS' ? (
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                ) : contactInfo?.method === 'Phone' ? (
                  <Phone className="w-6 h-6 text-blue-600" />
                ) : (
                  <Mail className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <DialogTitle>Contact Patient</DialogTitle>
                <DialogDescription>
                  Review contact details and message before reaching out
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {contactInfo && (
            <div className="space-y-4 mt-4">
              {/* Patient Info */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-blue-900 mb-1">
                        {contactInfo.patientName}
                      </div>
                      <div className="text-xs text-blue-700">
                        Contact via {contactInfo.method}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-900 font-mono">
                        {contactInfo.destination}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(contactInfo.destination);
                          toast.success('Contact info copied to clipboard');
                        }}
                        className="text-xs h-6 mt-1"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Message Preview */}
              <div>
                <Label className="text-sm text-gray-700 mb-2">Message Preview</Label>
                <Card className="mt-2">
                  <CardContent className="p-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-900 whitespace-pre-wrap border border-gray-200">
                      {contactInfo.message}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(contactInfo.message);
                        toast.success('Message copied to clipboard');
                      }}
                      className="mt-3"
                    >
                      Copy Message
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Instructions */}
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="text-sm text-yellow-900 mb-2">
                    📱 How to Contact Patient
                  </div>
                  <ul className="text-xs text-yellow-800 space-y-1 ml-4 list-disc">
                    {contactInfo.method === 'SMS' && (
                      <>
                        <li>Use your work phone to send an SMS to {contactInfo.destination}</li>
                        <li>Copy the message above and paste into your SMS app</li>
                        <li>Or compose your own message based on the template</li>
                      </>
                    )}
                    {contactInfo.method === 'Phone' && (
                      <>
                        <li>Call {contactInfo.destination} from your work phone</li>
                        <li>Use the message above as a reference for talking points</li>
                        <li>Verify patient identity before discussing portal access</li>
                      </>
                    )}
                    {contactInfo.method === 'Email' && (
                      <>
                        <li>Send an email to {contactInfo.destination}</li>
                        <li>Copy the message template above into your email client</li>
                        <li>Add any additional information as needed</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    // Try to open native app (won't work in all environments, but worth trying)
                    if (contactInfo.method === 'SMS') {
                      const smsMessage = encodeURIComponent(contactInfo.message);
                      window.open(`sms:${contactInfo.destination}?body=${smsMessage}`, '_blank');
                    } else if (contactInfo.method === 'Email') {
                      const subject = encodeURIComponent('Patient Portal Registration Assistance');
                      const body = encodeURIComponent(contactInfo.message);
                      window.open(`mailto:${contactInfo.destination}?subject=${subject}&body=${body}`, '_blank');
                    } else if (contactInfo.method === 'Phone') {
                      window.open(`tel:${contactInfo.destination}`, '_blank');
                    }
                    
                    toast.success('Opening contact method...');
                    
                    // Close dialogs after a brief delay
                    setTimeout(() => {
                      setContactPatientOpen(false);
                      setMatchPatientOpen(false);
                      setMessageToMatch(null);
                      setSelectedEhrPatient(null);
                    }, 1000);
                  }}
                  className="flex-1"
                >
                  {contactInfo.method === 'SMS' && <MessageSquare className="w-4 h-4 mr-2" />}
                  {contactInfo.method === 'Phone' && <Phone className="w-4 h-4 mr-2" />}
                  {contactInfo.method === 'Email' && <Mail className="w-4 h-4 mr-2" />}
                  Open {contactInfo.method === 'SMS' ? 'SMS App' : contactInfo.method === 'Phone' ? 'Phone' : 'Email Client'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setContactPatientOpen(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chart Review Dialog */}
      <ChartReviewDialog
        open={chartReviewOpen}
        onOpenChange={setChartReviewOpen}
        data={{
          patientName: 'John Smith',
          appointmentDate: 'November 30, 2025 at 2:00 PM',
          completedDate: 'November 24, 2025 at 2:45 PM',
          medicalHistory: [
            { id: 'mh-1', condition: 'Type 2 Diabetes', diagnosedYear: '2018', status: 'Active' },
            { id: 'mh-2', condition: 'Hypertension', diagnosedYear: '2015', status: 'Active' },
            { id: 'mh-3', condition: 'Seasonal Allergies', diagnosedYear: '2010', status: 'Active' },
            { id: 'mh-4', condition: 'Asthma', diagnosedYear: '2005', status: 'Well-controlled' }
          ],
          familyHistory: [
            { id: 'fh-1', relationship: 'Father', condition: 'Coronary Artery Disease', ageAtDiagnosis: '55' },
            { id: 'fh-2', relationship: 'Mother', condition: 'Type 2 Diabetes', ageAtDiagnosis: '62' },
            { id: 'fh-3', relationship: 'Sister', condition: 'Breast Cancer', ageAtDiagnosis: '48' }
          ],
          surgicalHistory: [
            { id: 'sh-1', procedure: 'Appendectomy', year: '2012', hospital: 'Memorial Hospital' },
            { id: 'sh-2', procedure: 'Knee Arthroscopy', year: '2019', hospital: 'Sports Medicine Center' }
          ],
          socialHistory: [
            { category: 'Smoking Status', value: 'Former smoker, quit 5 years ago' },
            { category: 'Alcohol Use', value: 'Social drinker, 2-3 drinks per week' },
            { category: 'Exercise', value: 'Walks 30 minutes daily' },
            { category: 'Occupation', value: 'Software Engineer' },
            { category: 'Marital Status', value: 'Married' }
          ],
          immunizations: [
            { id: 'im-1', vaccine: 'Influenza', date: 'October 15, 2025', provider: 'CVS Pharmacy' },
            { id: 'im-2', vaccine: 'COVID-19 Booster', date: 'September 10, 2025', provider: 'Walgreens' },
            { id: 'im-3', vaccine: 'Tdap', date: 'March 20, 2023' },
            { id: 'im-4', vaccine: 'Pneumococcal', date: 'January 5, 2022' }
          ],
          medications: [
            { id: 'med-1', name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', prescribedBy: 'Dr. Sarah Chen' },
            { id: 'med-2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', prescribedBy: 'Dr. Sarah Chen' },
            { id: 'med-3', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', prescribedBy: 'Dr. Sarah Chen' },
            { id: 'med-4', name: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'As needed for asthma', prescribedBy: 'Dr. Michael Roberts' }
          ],
          financialConsent: true,
          hipaaAcknowledgment: true,
          covidScreening: {
            symptoms: [],
            recentTravel: false
          },
          insuranceCard: {
            uploaded: true,
            imageCount: 2
          },
          photoId: {
            uploaded: true
          }
        }}
      />
    </div>
  );
}