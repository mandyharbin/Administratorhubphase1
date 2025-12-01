import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Inbox, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  User,
  Calendar,
  AlertCircle,
  TrendingUp,
  Shield,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface StaffMessage {
  messageId?: string;
  type: string;
  patientId: string;
  recipientRole: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  metadata: {
    grounding: number;
    safety: string;
    sentAt: string;
    sentBy: string;
  };
  status: string;
  read: boolean;
}

export function StaffMessagesInbox() {
  const [messages, setMessages] = useState<StaffMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const staffRoles = [
    { value: 'all', label: 'All Messages', icon: '📬' },
    { value: 'clinical', label: 'Clinical Staff', icon: '👨‍⚕️' },
    { value: 'scheduling', label: 'Scheduling', icon: '📅' },
    { value: 'billing', label: 'Billing', icon: '💰' },
    { value: 'nursing', label: 'Nursing', icon: '👩‍⚕️' },
    { value: 'provider', label: 'Provider', icon: '🩺' }
  ];

  useEffect(() => {
    fetchMessages();
  }, [selectedRole]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/staff-messages?role=${selectedRole}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching staff messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (messageId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getRoleInfo = (role: string) => {
    return staffRoles.find(r => r.value === role) || { label: role, icon: '👤' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading messages...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-purple-600" />
                Staff Messages Inbox
                {messages.length > 0 && (
                  <Badge className="bg-purple-600">{messages.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                AI-generated conversation summaries from patient interactions
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchMessages}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">Filter by role:</div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {staffRoles.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <span>{role.icon}</span>
                      <span>{role.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500 mb-2">No pending messages</p>
            <p className="text-xs text-gray-400">
              AI chat summaries will appear here when sent to staff
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((message, idx) => {
            const messageId = message.messageId || `msg-${idx}`;
            const isExpanded = expandedMessages.has(messageId);
            const roleInfo = getRoleInfo(message.recipientRole);

            return (
              <Card key={messageId} className="border-l-4 border-l-purple-600">
                <CardContent className="py-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-sm">
                              AI Chat Summary
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {roleInfo.icon} {roleInfo.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <User className="w-3 h-3 mr-1" />
                              {message.patientId}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {message.metadata?.sentAt ? formatDate(message.metadata.sentAt) : 'N/A'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Grounding: {message.metadata?.grounding ? (message.metadata.grounding * 100).toFixed(0) : 0}%
                            </div>
                            <div className="flex items-center gap-1">
                              {(message.metadata?.safety || 'unknown') === 'pass' ? (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-red-600" />
                              )}
                              {message.metadata?.safety || 'unknown'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(messageId)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Summary Preview */}
                    <div className={`text-sm ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {message.summary}
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t">
                        {/* Key Points */}
                        {message.keyPoints && message.keyPoints.length > 0 && (
                          <div>
                            <div className="text-xs mb-2 flex items-center gap-2">
                              <TrendingUp className="w-3 h-3" />
                              <strong>Key Points</strong>
                            </div>
                            <div className="space-y-1">
                              {message.keyPoints.map((point, idx) => (
                                <div key={idx} className="text-xs flex items-start gap-2 bg-blue-50 rounded p-2">
                                  <div className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs flex-shrink-0">
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1">{point}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Items */}
                        {message.actionItems && message.actionItems.length > 0 && (
                          <div>
                            <div className="text-xs mb-2 flex items-center gap-2">
                              <CheckCircle className="w-3 h-3" />
                              <strong>Action Items</strong>
                            </div>
                            <div className="space-y-1">
                              {message.actionItems.map((action, idx) => (
                                <div key={idx} className="text-xs flex items-start gap-2 bg-amber-50 border border-amber-200 rounded p-2">
                                  <Clock className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">{action}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark as Complete
                          </Button>
                          <Button size="sm" variant="outline">
                            View Patient Record
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Banner */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700">
              <div className="mb-1"><strong>HIPAA-Compliant Message Queue</strong></div>
              <div>All AI-generated summaries are processed through Greenway AIRE Agent with PHI classification and HIPAA-default guardrails. Messages are stored securely and include quality metrics (grounding ≥85%, safety checks).</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}