// Shared message queue between Patient App and Staff Practice demos

export interface RoutedMessage {
  id: string;
  patientName: string;
  patientMessage: string;
  aiSummary: string;
  detectedIntent: string;
  conversationHistory: Array<{
    sender: 'patient' | 'bot' | 'staff';
    senderName: string;
    content: string;
    timestamp: string;
  }>;
  timestamp: string;
  urgency: 'urgent' | 'routine';
}

export interface StaffReply {
  messageId: string;  // ID of the original routed message
  staffMessage: string;
  staffName: string;
  timestamp: string;
}

class MessageQueue {
  private messages: RoutedMessage[] = [];
  private replies: StaffReply[] = [];
  private listeners: Array<(messages: RoutedMessage[]) => void> = [];
  private replyListeners: Array<(replies: StaffReply[]) => void> = [];

  addMessage(message: RoutedMessage) {
    this.messages.push(message);
    this.notifyListeners();
  }

  addReply(reply: StaffReply) {
    this.replies.push(reply);
    this.notifyReplyListeners();
  }

  getMessages(): RoutedMessage[] {
    return [...this.messages];
  }

  getReplies(): StaffReply[] {
    return [...this.replies];
  }

  clearMessages() {
    this.messages = [];
    this.notifyListeners();
  }

  clearReplies() {
    this.replies = [];
    this.notifyReplyListeners();
  }

  subscribe(listener: (messages: RoutedMessage[]) => void) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  subscribeToReplies(listener: (replies: StaffReply[]) => void) {
    this.replyListeners.push(listener);
    console.log('[MessageQueue] Reply listener added. Total listeners:', this.replyListeners.length);
    // Immediately notify with existing replies
    if (this.replies.length > 0) {
      console.log('[MessageQueue] Immediately notifying new listener with existing replies:', this.replies);
      listener([...this.replies]);
    }
    // Return unsubscribe function
    return () => {
      this.replyListeners = this.replyListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.messages]));
  }

  private notifyReplyListeners() {
    console.log('[MessageQueue] Notifying', this.replyListeners.length, 'reply listeners with replies:', this.replies);
    this.replyListeners.forEach(listener => listener([...this.replies]));
  }
}

export const messageQueue = new MessageQueue();