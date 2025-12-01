import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Shield,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
  Users,
  MessageCircle,
  Reply,
  User,
  UserCheck,
  Image as ImageIcon,
  Download,
  CreditCard,
  IdCard
} from 'lucide-react';
import { generatePatientSummary, sendSummaryToStaff, type ChatMessage, type SummaryResponse } from '../api/summary-agent';
import { sendChatMessage, getChatMessages } from '../utils/fhir-communication-api';
import { sendNotification } from '../utils/notification-api';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Props {
  messages: ChatMessage[];
  patientId?: string;
  conversationId?: string;
  onSummaryGenerated?: (summary: SummaryResponse) => void;
  onSummarySent?: (messageId: string) => void;
  patientName?: string;
}

export function ChatSummary({ messages, patientId, conversationId, onSummaryGenerated, onSummarySent, patientName }: Props) {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('clinical');
  const [expanded, setExpanded] = useState(false);
  
  // Staff reply state
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replySent, setReplySent] = useState(false);
  
  // Conversation thread state
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);

  // Uploaded images state
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const staffRoles = [
    { value: 'clinical', label: 'Clinical Staff', icon: '👨‍⚕️' },
    { value: 'scheduling', label: 'Scheduling', icon: '📅' },
    { value: 'billing', label: 'Billing', icon: '💰' },
    { value: 'nursing', label: 'Nursing', icon: '👩‍⚕️' },
    { value: 'provider', label: 'Provider', icon: '🩺' }
  ];

  // Auto-generate summary when messages change
  useEffect(() => {
    const generateSummaryAutomatically = async () => {
      if (messages.length === 0 || summary) return; // Don't regenerate if already exists
      
      setLoading(true);
      setError(null);
      
      try {
        const summaryResponse = await generatePatientSummary({
          messages,
          patientId,
          conversationId,
          intent: 'patient.summary'
        });

        setSummary(summaryResponse);
        setExpanded(true);
        
        if (onSummaryGenerated) {
          onSummaryGenerated(summaryResponse);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to generate summary');
        console.error('Error generating summary:', err);
      } finally {
        setLoading(false);
      }
    };

    generateSummaryAutomatically();
  }, [messages.length]); // Only trigger when message count changes

  // Fetch uploaded images when patientId is available
  useEffect(() => {
    const fetchUploadedImages = async () => {
      if (!patientId) return;
      
      setLoadingImages(true);
      
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/list-images?patientId=${patientId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        const data = await response.json();
        
        if (response.ok && data.documents) {
          setUploadedImages(data.documents);
        }
      } catch (err: any) {
        console.error('Error fetching uploaded images:', err);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchUploadedImages();
  }, [patientId]);

  const handleSendToStaff = async () => {
    if (!summary || !patientId) return;

    setSending(true);
    setError(null);

    try {
      const response = await sendSummaryToStaff(summary, selectedRole, patientId);
      setSent(true);

      if (onSummarySent) {
        onSummarySent(response.messageId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send summary');
      console.error('Error sending summary:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendReply = async () => {
    if (!patientId || !replyMessage.trim()) return;

    setSendingReply(true);
    setError(null);

    try {
      // Send message from staff to patient
      const staffRole = staffRoles.find(r => r.value === selectedRole);
      await sendChatMessage(
        patientId,
        replyMessage,
        'staff',
        staffRole?.label || 'Clinical Staff'
      );
      
      // Send notification to patient
      await sendNotification(
        patientId,
        `You have a new message from ${staffRole?.label || 'your care team'}`,
        'New Message from Care Team',
        ['push', 'email']
      );
      
      setReplySent(true);
      setReplyMessage('');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setReplySent(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reply');
      console.error('Error sending reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const getGroundingColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-100';
    if (score >= 0.8) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (messages.length === 0) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="py-6 text-center">
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No messages to summarize yet</p>
        </CardContent>
      </Card>
    );
  }

  if (loading && !summary) {
    return (
      <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50">
        <CardContent className="py-8 text-center">
          <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-purple-700 mb-1">Analyzing conversation with AIRE Agent...</p>
          <p className="text-xs text-gray-600">Generating HIPAA-compliant summary</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Conversation Summary
              <Badge variant="outline" className="ml-2">
                <Shield className="w-3 h-3 mr-1" />
                HIPAA
              </Badge>
            </CardTitle>
            <CardDescription>
              Greenway AIRE Agent • {messages.length} message{messages.length !== 1 ? 's' : ''}
              {loading && ' • Analyzing conversation...'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {error && (
        <CardContent className="pt-0">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </CardContent>
      )}

      {summary && (
        <CardContent className="space-y-4">
          {/* Summary Quality Indicators */}
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className={`px-3 py-1 rounded-lg text-xs ${getGroundingColor(summary.grounding)}`}>
              <div>Grounding: {(summary.grounding * 100).toFixed(0)}%</div>
            </div>
            <div className={`px-3 py-1 rounded-lg text-xs ${summary.safety === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <div>Safety: {summary.safety.toUpperCase()}</div>
            </div>
            {summary.metadata?.processingTime && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {summary.metadata.processingTime}ms
              </div>
            )}
            <Badge variant="outline" className="ml-auto">
              {summary.metadata?.piiClassification || 'PHI'}
            </Badge>
          </div>

          {/* Main Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm">Summary</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="h-6 text-xs"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
            </div>
            <div className={`bg-white border rounded-lg p-3 text-sm ${expanded ? '' : 'line-clamp-3'}`}>
              {summary.summary}
            </div>
          </div>

          {/* Key Points */}
          {summary.keyPoints && summary.keyPoints.length > 0 && expanded && (
            <div>
              <div className="text-sm mb-2">Key Points</div>
              <div className="space-y-2">
                {summary.keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">{point}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Items */}
          {summary.actionItems && summary.actionItems.length > 0 && expanded && (
            <div>
              <div className="text-sm mb-2">Action Items</div>
              <div className="space-y-2">
                {summary.actionItems.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg p-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">{action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Images Section */}
          {uploadedImages.length > 0 && expanded && (
            <div>
              <div className="flex items-center gap-2 text-sm mb-3">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>Uploaded Documents</span>
                <Badge variant="outline" className="text-xs">
                  {uploadedImages.length} {uploadedImages.length === 1 ? 'document' : 'documents'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {uploadedImages.map((doc, idx) => {
                  const kind = doc.meta?.tag?.[0]?.code || 'Unknown';
                  const isInsurance = kind === 'InsuranceFront' || kind === 'InsuranceBack';
                  const imageData = doc.content?.[0]?.attachment?.data;
                  const contentType = doc.content?.[0]?.attachment?.contentType || 'image/jpeg';
                  const fileName = doc.content?.[0]?.attachment?.title || 'Document';
                  const uploadDate = doc.date ? new Date(doc.date).toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  }) : 'Unknown';

                  return (
                    <div key={doc.id || idx} className="bg-white border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isInsurance ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {isInsurance ? (
                            <CreditCard className="w-6 h-6 text-green-600" />
                          ) : kind === 'ID' ? (
                            <IdCard className="w-6 h-6 text-blue-600" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm">{
                              kind === 'InsuranceFront' ? 'Insurance Card (Front)' :
                              kind === 'InsuranceBack' ? 'Insurance Card (Back)' :
                              kind === 'ID' ? 'ID Document' :
                              kind === 'ClinicalPhoto' ? 'Clinical Photo' :
                              'Document'
                            }</div>
                            <Badge className={`text-xs ${
                              isInsurance ? 'bg-green-100 text-green-700 border-green-200' :
                              'bg-blue-100 text-blue-700 border-blue-200'
                            }`}>
                              FHIR
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {fileName} • Uploaded {uploadDate}
                          </div>
                          
                          {/* Image Preview */}
                          {imageData && (
                            <div className="mt-2 mb-2">
                              <img 
                                src={`data:${contentType};base64,${imageData}`}
                                alt={fileName}
                                className="w-full h-32 object-cover rounded border border-gray-200"
                              />
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = `data:${contentType};base64,${imageData}`;
                                link.download = fileName;
                                link.click();
                              }}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Badge variant="outline" className="text-xs">
                              DocumentReference/{doc.id}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {loadingImages && expanded && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading documents...
            </div>
          )}

          {/* Send to Staff Section */}
          {!sent && (
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-500" />
                <span>Route to Staff</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="flex-1">
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

                <Button
                  onClick={handleSendToStaff}
                  disabled={sending || !patientId}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Routing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Route
                    </>
                  )}
                </Button>
              </div>

              {!patientId && (
                <div className="text-xs text-amber-600 bg-amber-50 rounded p-2 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  Patient ID required to route summary
                </div>
              )}
            </div>
          )}

          {/* Sent Confirmation */}
          {sent && (
            <div className="pt-4 border-t">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm mb-1">
                    <strong>Summary sent successfully!</strong>
                  </div>
                  <div className="text-xs text-gray-600">
                    Routed to {staffRoles.find(r => r.value === selectedRole)?.label} for patient {patientId}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staff Reply Section - Always visible */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Reply className="w-4 h-4 text-purple-600" />
                <span>Reply to Patient</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Sends to Mobile App
              </Badge>
            </div>
            
            {replySent ? (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm mb-1">
                    <strong>Reply sent successfully!</strong>
                  </div>
                  <div className="text-xs text-gray-600">
                    Patient will see your message in their mobile app
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply to the patient here..."
                  className="min-h-[100px]"
                  disabled={sendingReply}
                />
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Replying as: <strong>{staffRoles.find(r => r.value === selectedRole)?.label}</strong>
                  </div>
                  <Button
                    onClick={handleSendReply}
                    disabled={sendingReply || !patientId || !replyMessage.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {sendingReply ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Reply className="w-4 h-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>

                {!patientId && (
                  <div className="text-xs text-amber-600 bg-amber-50 rounded p-2 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    Patient ID required to send reply
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AIRE Agent Info */}
          <div className="pt-3 border-t">
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                AIRE Agent Details
              </summary>
              <div className="mt-2 space-y-1 text-gray-600 bg-gray-50 rounded p-2">
                <div>Agent: <strong>patient-summary (ag_9f2b8c)</strong></div>
                <div>Domain: <strong>ambulatory</strong></div>
                <div>Intent: <strong>patient.summary</strong></div>
                <div>Guardrails: <strong>{summary.metadata?.guardrails || 'hipaa-default'}</strong></div>
                <div>Scopes: <strong>ehr:read:patient</strong></div>
                {summary.metadata?.source === 'mock-prototype' && (
                  <div className="text-amber-600 mt-2">
                    ⚠️ Using mock summary for prototype. Set GREENWAY_SUMMARY_AGENT_URL env variable to use production agent.
                  </div>
                )}
              </div>
            </details>
          </div>
        </CardContent>
      )}
    </Card>
  );
}