import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { sendChatMessage, getChatMessages, markMessageAsRead, type ChatMessage } from "../utils/fhir-communication-api";
import { sendNotification } from "../utils/notification-api";
import { User, UserCheck, Send, Loader2, CheckCircle2, MessageCircle } from "lucide-react";

interface SecureChatProps {
  patientId: string;
  patientName?: string;
  mode?: 'patient' | 'staff';
  staffName?: string;
}

export function SecureChat({ 
  patientId, 
  patientName = "Patient",
  mode = 'patient',
  staffName = "Care Team"
}: SecureChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingMessages, setFetchingMessages] = useState(true);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [patientId]);

  async function loadMessages() {
    setFetchingMessages(true);
    try {
      const msgs = await getChatMessages(patientId);
      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setFetchingMessages(false);
    }
  }

  async function handleSend() {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const msg = await sendChatMessage(
        patientId, 
        input, 
        mode === 'staff' ? 'staff' : 'patient',
        mode === 'staff' ? staffName : undefined
      );
      setMessages([...messages, msg]);
      setInput("");

      // If staff is sending, notify the patient
      if (mode === 'staff') {
        await sendNotification(
          patientId,
          input,
          `${staffName} replied to your message`,
          ['push', 'email']
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  }

  // Auto-refresh messages every 10 seconds
  useEffect(() => {
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [patientId]);

  // Mark staff messages as read when patient views them
  useEffect(() => {
    if (mode === 'patient') {
      const unreadStaffMessages = messages.filter(
        m => m.senderType === 'staff' && m.status !== 'read'
      );
      unreadStaffMessages.forEach(msg => {
        markMessageAsRead(msg.id, patientId);
      });
    }
  }, [messages, mode, patientId]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-teal-600" />
            {mode === 'staff' ? `Chat with ${patientName}` : 'Secure Chat with Care Team'}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {mode === 'staff' ? 'Staff View' : 'Patient View'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {fetchingMessages ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <div className="text-sm">No messages yet</div>
                <div className="text-xs mt-1">Start a conversation</div>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = (mode === 'staff' && message.senderType === 'staff') || 
                                   (mode === 'patient' && message.senderType === 'patient');
              
              return (
                <div key={message.id} className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                  {!isOwnMessage && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={
                        message.senderType === 'staff' 
                          ? 'bg-teal-100 text-teal-700' 
                          : 'bg-blue-100 text-blue-700'
                      }>
                        {message.senderType === 'staff' ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`flex-1 ${isOwnMessage ? 'flex justify-end' : ''}`}>
                    <div className="max-w-[70%]">
                      {!isOwnMessage && message.senderName && (
                        <div className="text-xs text-gray-600 mb-1 px-1">
                          {message.senderName}
                        </div>
                      )}
                      <div className={`rounded-lg p-3 ${
                        isOwnMessage 
                          ? 'bg-teal-600 text-white' 
                          : 'bg-white border border-gray-200'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                          isOwnMessage ? 'text-teal-100 justify-end' : 'text-gray-500'
                        }`}>
                          <span>
                            {new Date(message.timestamp).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {isOwnMessage && message.status === 'delivered' && (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={loading}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {mode === 'staff' 
              ? 'Your reply will send a notification to the patient'
              : 'Secure HIPAA-compliant messaging with your care team'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
