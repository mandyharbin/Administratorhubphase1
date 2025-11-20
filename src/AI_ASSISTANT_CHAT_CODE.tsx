import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  Send, 
  ChevronLeft,
  Bot,
  UserCircle2,
  X,
  Image,
  Camera,
  FileText,
  Info
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { ScrollArea } from './components/ui/scroll-area';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { knowledgeBaseFAQs } from './utils/knowledgeBase';
import { messageQueue } from './utils/sharedMessages';

interface Message {
  id: string;
  sender: 'patient' | 'bot' | 'staff';
  senderName: string;
  content: string;
  timestamp: string;
  isRouted?: boolean;
  detectedIntent?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
}

export function AIAssistantChat() {
  const [chatInput, setChatInput] = useState('');
  const [waitingForNotificationPreference, setWaitingForNotificationPreference] = useState(false);
  const [selectedNotificationMethod, setSelectedNotificationMethod] = useState<string | null>(null);
  const [showAiChatDisclaimer, setShowAiChatDisclaimer] = useState(true);
  const [inAppNotification, setInAppNotification] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{url: string; name: string; type: string; size: string} | null>(null);
  
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      senderName: 'AI Assistant',
      content: 'Hello! I\'m your AI medical assistant. How can I help you today? I can help with appointment inquiries, general health questions, prescription refills, and more.',
      timestamp: '2025-01-13T10:00:00'
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Subscribe to staff replies from admin interface
  useEffect(() => {
    console.log('[AIAssistantChat] Setting up subscription to staff replies');
    const unsubscribe = messageQueue.subscribeToReplies((replies) => {
      console.log('[AIAssistantChat] Received replies:', replies);
      if (replies.length > 0) {
        const latestReply = replies[replies.length - 1];
        console.log('[AIAssistantChat] Latest reply:', latestReply);
        
        // Add staff reply to chat messages
        setChatMessages(prev => {
          // Check if this reply was already added
          const existingReplyIndex = prev.findIndex(
            msg => msg.content === latestReply.staffMessage && 
                   msg.sender === 'staff' &&
                   msg.timestamp === latestReply.timestamp
          );
          
          if (existingReplyIndex !== -1) {
            console.log('[AIAssistantChat] Reply already exists, skipping');
            return prev;
          }
          
          console.log('[AIAssistantChat] Adding new staff reply to chat');
          return [...prev, {
            id: `staff-reply-${Date.now()}`,
            sender: 'staff',
            senderName: latestReply.staffName,
            content: latestReply.staffMessage,
            timestamp: latestReply.timestamp
          }];
        });
      }
    });

    return unsubscribe;
  }, []);

  const handleNotificationMethodSelect = (method: string) => {
    setSelectedNotificationMethod(method);
    setWaitingForNotificationPreference(false);
    
    // Add the selected method as a patient message
    const selectionMessage: Message = {
      id: Date.now().toString(),
      sender: 'patient',
      senderName: 'You',
      content: method,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, selectionMessage]);
    
    // Show confirmation notification
    setInAppNotification('This is a confirmation that your message has been received. Someone from our office will be in touch. If this is an emergency please dial 911. Thank you.');
    
    // Auto-hide notification after 8 seconds
    setTimeout(() => {
      setInAppNotification(null);
    }, 8000);
  };

  const handleSendMessage = async (quickMessage?: string | React.MouseEvent) => {
    // Use quickMessage if provided and it's a string, otherwise use chatInput
    const messageText = (typeof quickMessage === 'string' ? quickMessage : null) || chatInput;
    
    // Allow sending if there's text or an attachment
    if (!messageText.trim() && !pendingImage && !pendingFile) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'patient',
      senderName: 'You',
      content: messageText || (pendingImage ? 'Shared an image' : pendingFile ? `Attached: ${pendingFile.name}` : ''),
      timestamp: new Date().toISOString(),
      imageUrl: pendingImage || undefined,
      fileUrl: pendingFile?.url,
      fileName: pendingFile?.name,
      fileType: pendingFile?.type,
      fileSize: pendingFile?.size
    };

    // Store the input before clearing it
    const userInput = messageText || (pendingImage ? 'Shared an image' : pendingFile ? `Attached: ${pendingFile.name}` : '');

    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
    setPendingImage(null);
    setPendingFile(null);

    // Check if we're replying DIRECTLY to a staff message
    const lastMessage = chatMessages[chatMessages.length - 1];
    const isLastMessageFromStaff = lastMessage && lastMessage.sender === 'staff';
    
    // Determine if this is a direct reply to staff vs a new question
    const hasAttachment = !!(pendingImage || pendingFile || newMessage.imageUrl || newMessage.fileUrl);
    const isShortResponse = messageText.length < 50;
    const containsReplyPattern = /^(yes|no|ok|okay|sure|thanks|thank you|morning|afternoon|evening|\d+:?\d*\s*(am|pm)?|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(messageText.trim());
    
    // Only bypass AI if it's truly a direct reply
    const isDirectReplyToStaff = isLastMessageFromStaff && (hasAttachment || (isShortResponse && containsReplyPattern));

    // If directly replying to staff, skip AI processing
    if (isDirectReplyToStaff) {
      console.log('[handleSendMessage] REPLYING TO STAFF - showing toast and skipping AI');
      setInAppNotification('Message sent to staff successfully');
      setTimeout(() => setInAppNotification(null), 3000);

      // Send to message queue without AI processing
      const currentConversation = [...chatMessages, newMessage].map(msg => ({
        sender: msg.sender,
        senderName: msg.senderName,
        content: msg.content,
        timestamp: msg.timestamp,
        imageUrl: msg.imageUrl,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        fileType: msg.fileType,
        fileSize: msg.fileSize
      }));

      let conversationSummary = 'Patient reply to staff: ';
      
      if (lastMessage && lastMessage.sender === 'staff') {
        const staffContent = lastMessage.content.substring(0, 100);
        conversationSummary += `Staff asked: "${staffContent}${lastMessage.content.length > 100 ? '...' : ''}" | `;
      }
      
      if (newMessage.imageUrl) {
        conversationSummary += `Patient responded with image`;
      } else if (newMessage.fileUrl) {
        conversationSummary += `Patient responded with file: ${newMessage.fileName}`;
      } else {
        conversationSummary += `Patient: "${userInput.substring(0, 100)}${userInput.length > 100 ? '...' : ''}"`;
      }

      messageQueue.addMessage({
        id: `reply-${Date.now()}`,
        patientName: 'Patient User',
        patientMessage: userInput,
        aiSummary: conversationSummary,
        detectedIntent: 'staff_reply',
        conversationHistory: currentConversation.map(msg => ({
          sender: msg.sender,
          senderName: msg.senderName,
          content: msg.content,
          timestamp: msg.timestamp,
          imageUrl: msg.imageUrl,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileType: msg.fileType,
          fileSize: msg.fileSize
        })),
        timestamp: new Date().toISOString(),
        urgency: 'normal'
      });

      return; // Skip AI response
    }

    console.log('[handleSendMessage] Calling AI API with userInput:', userInput);
    
    try {
      // Call ChatGPT API through our server
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          messages: chatMessages.filter(msg => msg.sender !== 'staff'), // Exclude staff messages from context
          userMessage: userInput,
          patientContext: {
            firstName: 'Patient',
            lastName: 'User',
            medications: []
          },
          knowledgeBase: knowledgeBaseFAQs
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('ChatGPT API error:', errorData);
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      console.log('[handleSendMessage] AI Response:', data);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        senderName: 'AI Assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        isRouted: data.shouldRoute,
        detectedIntent: data.detectedIntent
      };

      console.log('[handleSendMessage] botResponse:', botResponse);

      // If routed, show notification preference options
      if (botResponse.isRouted) {
        console.log('[handleSendMessage] Message is ROUTED - adding bot response and waiting for notification preference');
        setChatMessages(prev => [...prev, botResponse]);
        setWaitingForNotificationPreference(true);
        
        // Generate AI summary based on detected intent
        let aiSummary = '';
        switch (botResponse.detectedIntent) {
          case 'appointment_scheduling':
            aiSummary = 'Patient requesting appointment scheduling/cancellation. AI cannot handle scheduling changes per protocol. Requires staff intervention.';
            break;
          case 'clinical_results':
            aiSummary = 'Patient inquiring about lab/test results. Contains medical information that requires clinical review. Routed to clinical staff.';
            break;
          case 'billing_inquiry':
            aiSummary = 'Patient has billing/payment question. Requires access to billing system and account details. Routed to billing department.';
            break;
          case 'medical_symptom':
            aiSummary = 'Patient reporting medical symptoms. Clinical assessment needed. Routed to clinical staff for evaluation.';
            break;
          case 'image_upload':
            aiSummary = 'Patient uploaded image for clinical review. Visual assessment required. Routed to clinical staff.';
            break;
          default:
            aiSummary = 'General inquiry routed to staff for personalized response.';
        }

        // Send to message queue with full conversation context
        const currentConversation = [...chatMessages, newMessage, botResponse].map(msg => ({
          sender: msg.sender,
          senderName: msg.senderName,
          content: msg.content,
          timestamp: msg.timestamp,
          imageUrl: msg.imageUrl,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileType: msg.fileType,
          fileSize: msg.fileSize
        }));

        messageQueue.addMessage({
          id: `routed-${Date.now()}`,
          patientName: 'Patient User',
          patientMessage: userInput,
          aiSummary: aiSummary,
          detectedIntent: botResponse.detectedIntent || 'general',
          conversationHistory: currentConversation.map(msg => ({
            sender: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp
          })),
          timestamp: new Date().toISOString(),
          urgency: 'urgent'
        });
      } else {
        // For non-routed messages, add the bot response to chat
        setChatMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      // Fallback to a generic error message
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        senderName: 'AI Assistant',
        content: 'I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorResponse]);
    }
  };

  const sendQuickMessage = (message: string) => {
    handleSendMessage(message);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setPendingImage(imageUrl);
    e.target.value = '';
  };

  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    const fileSize = (file.size / 1024).toFixed(1); // KB
    
    let fileTypeLabel = 'Document';
    if (['pdf'].includes(fileExtension)) {
      fileTypeLabel = 'PDF';
    } else if (['doc', 'docx'].includes(fileExtension)) {
      fileTypeLabel = 'Word Document';
    } else if (['xls', 'xlsx'].includes(fileExtension)) {
      fileTypeLabel = 'Excel';
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      fileTypeLabel = 'Image';
    }

    setPendingFile({
      url: URL.createObjectURL(file),
      name: fileName,
      type: fileTypeLabel,
      size: fileSize
    });

    e.target.value = '';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    if (diffDays === 0 && date.getDate() === now.getDate()) {
      return timeStr;
    }
    
    if (diffDays === 1 || (diffDays === 0 && date.getDate() !== now.getDate())) {
      return `Yesterday ${timeStr}`;
    }
    
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dateStr} ${timeStr}`;
  };

  const getDateLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 && date.getDate() === now.getDate()) {
      return 'Today';
    }
    
    if (diffDays === 1 || (diffDays === 0 && date.getDate() !== now.getDate())) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const shouldShowDateSeparator = (currentMessage: Message, previousMessage: Message | null) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.timestamp);
    const previousDate = new Date(previousMessage.timestamp);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  return (
    <>
      <Toaster />
      <div className="h-full flex flex-col overflow-hidden">
        {/* Chat Header */}
        <motion.div 
          className="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-4 flex items-center gap-3 shadow-lg flex-shrink-0"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Bot className="w-6 h-6" />
          </motion.div>
          <motion.div className="flex-1"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-white">AI Assistant</div>
            <div className="text-xs text-teal-100 flex items-center gap-1">
              <motion.span 
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.span>
              Always available
            </div>
          </motion.div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 bg-gray-50 space-y-4 pb-2">
              <AnimatePresence initial={false}>
              {chatMessages.map((message, index) => {
                const previousMessage = index > 0 ? chatMessages[index - 1] : null;
                const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
                
                return (
                  <div key={message.id}>
                    {showDateSeparator && (
                      <motion.div 
                        className="flex justify-center my-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs">
                          {getDateLabel(message.timestamp)}
                        </div>
                      </motion.div>
                    )}
                    <motion.div 
                      className={`flex gap-2 ${message.sender === 'patient' ? 'flex-row-reverse' : ''}`}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ 
                        duration: 0.3,
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                {message.sender !== 'patient' && (
                  <Avatar className="w-9 h-9 flex-shrink-0 shadow-sm">
                    <AvatarFallback className={
                      message.sender === 'bot' ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white' : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                    }>
                      {message.sender === 'bot' ? <Bot className="w-5 h-5" /> : <UserCircle2 className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[75%] ${message.sender === 'patient' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`rounded-2xl ${message.imageUrl ? 'p-2' : 'px-4 py-3'} shadow-sm ${
                    message.sender === 'patient' 
                      ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white' 
                      : message.sender === 'bot'
                      ? 'bg-white text-gray-900 border border-gray-200'
                      : 'bg-green-50 text-gray-900 border border-green-200'
                  }`}>
                    {message.sender !== 'patient' && (
                      <div className={`text-xs opacity-70 ${message.imageUrl || message.fileUrl ? 'px-2 pt-1 pb-2' : 'mb-1.5'}`}>{message.senderName}</div>
                    )}
                    {message.imageUrl && (
                      <img 
                        src={message.imageUrl} 
                        alt="Uploaded image" 
                        className="rounded-lg max-w-full h-auto mb-2"
                        style={{ maxHeight: '200px' }}
                      />
                    )}
                    {message.fileUrl && (
                      <div className="bg-gray-100 rounded-lg p-3 mb-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-teal-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{message.fileName}</div>
                          <div className="text-xs text-gray-500">{message.fileType} • {message.fileSize} KB</div>
                        </div>
                      </div>
                    )}
                    <div className={`text-sm leading-relaxed ${message.imageUrl || message.fileUrl ? 'px-2 pb-1' : ''}`}>{message.content}</div>
                  </div>
                  
                  {/* Notification Preference Options */}
                  {message.isRouted && waitingForNotificationPreference && index === chatMessages.length - 1 && (
                    <motion.div 
                      className="flex flex-wrap gap-2 mt-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {['Email', 'Text', 'Push'].map((method) => (
                        <Button
                          key={method}
                          variant="outline"
                          size="sm"
                          onClick={() => handleNotificationMethodSelect(method)}
                          className="bg-white hover:bg-teal-50 border-teal-300 text-teal-700 hover:border-teal-400"
                        >
                          {method}
                        </Button>
                      ))}
                    </motion.div>
                  )}
                  
                  <div className="text-xs text-gray-400 px-2">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
                </motion.div>
                  </div>
                );
              })}
              {/* Quick Suggestions (shown when chat is empty or has only 1 message) */}
              {chatMessages.length <= 1 && (
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-sm text-gray-500 text-center mb-3">Quick actions:</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-br from-teal-600 to-teal-700 text-white border-0 hover:from-teal-700 hover:to-teal-800"
                      onClick={() => sendQuickMessage('I need to schedule an appointment')}
                    >
                      I need to schedule an appointment
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-br from-teal-600 to-teal-700 text-white border-0 hover:from-teal-700 hover:to-teal-800"
                      onClick={() => sendQuickMessage('Can I reschedule my appointment?')}
                    >
                      Can I reschedule my appointment?
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-br from-teal-600 to-teal-700 text-white border-0 hover:from-teal-700 hover:to-teal-800"
                      onClick={() => sendQuickMessage('cancel my appt')}
                    >
                      cancel my appt
                    </Button>
                  </div>
                </motion.div>
              )}
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        <motion.div 
          className="border-t bg-white shadow-lg flex-shrink-0 relative"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* In-app notification banner - above input */}
          <AnimatePresence>
            {inAppNotification && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute bottom-full left-4 right-4 mb-2"
              >
                <div className="bg-teal-700 text-white px-4 py-3 rounded-lg shadow-lg border border-teal-800 flex items-start gap-3">
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">
                    {inAppNotification}
                  </div>
                  <button
                    onClick={() => setInAppNotification(null)}
                    className="text-white/80 hover:text-white flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Attachment Preview */}
          {(pendingImage || pendingFile) && (
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                {pendingImage && (
                  <div className="relative">
                    <img 
                      src={pendingImage} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded border border-gray-300"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setPendingImage(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {pendingFile && (
                  <div className="flex items-center gap-2 flex-1 bg-white rounded border border-gray-300 p-2">
                    <div className="w-10 h-10 bg-teal-100 rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{pendingFile.name}</div>
                      <div className="text-xs text-gray-500">{pendingFile.type} • {pendingFile.size} KB</div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setPendingFile(null)}
                      className="w-6 h-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="p-4">
          <div className="flex gap-2">
            <input
              type="file"
              id="image-upload"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              type="file"
              id="camera-upload"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={handleChatFileUpload}
              className="hidden"
            />
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="border-gray-300 hover:bg-gray-50"
              >
                <Image className="w-4 h-4 text-gray-600" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => document.getElementById('camera-upload')?.click()}
                className="border-gray-300 hover:bg-gray-50"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </Button>
            </motion.div>
            <Input 
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 border-gray-300 focus:border-teal-500"
            />
            <motion.div
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              <Button 
                size="icon"
                onClick={() => handleSendMessage()}
                disabled={!chatInput.trim() && !pendingImage && !pendingFile}
                className="bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-800 hover:to-teal-900 shadow-md"
              >
                <Send className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
          </div>
        </motion.div>

        {/* AI Chat Disclaimer Dialog */}
        {showAiChatDisclaimer && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-[350px] w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6 border-b">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-teal-600" />
                  <h3 className="font-medium">AI Assistant Notice</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Please review and accept the AI assistant terms before proceeding
                </p>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-gray-700 leading-relaxed">
                  By clicking "Accept", I acknowledge that AI assistant can respond to some messages using 
                  healthcare data, but cannot provide medical advice or schedule, cancel, reschedule appointments. 
                  Messages requiring staff attention will be routed automatically.
                </p>
              </div>
              
              <div className="p-4 border-t bg-gray-50 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAiChatDisclaimer(false)}
                >
                  Accept
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
