import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Mail, 
  MessageSquare, 
  Eye,
  CheckCircle,
  UserCheck,
  Clock,
  Phone
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PatientMatch {
  matchId: string;
  messageId: string;
  portalAccountInfo: {
    name: string;
    dob: string;
    zip: string;
    account: string;
  };
  ehrPatient: {
    id: string;
    name: string;
    dob: string;
    mrn: string;
    patientId: string;
  };
  matchedBy: string;
  matchedAt: string;
  status: string;
}

interface PortalActivation {
  portalAccountId: string;
  linkedEhrPatientId: string;
  linkedEhrMrn: string;
  activatedAt: string;
  activatedBy: string;
  contactMethod: string;
  contactInfo: string;
}

interface Notification {
  notificationId: string;
  patientId: string;
  type: string;
  method: string;
  destination: string;
  message: string;
  sentAt: string;
  status: string;
}

export function PatientMatchesView() {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'email' | 'sms'>('email');

  // Fetch patient matches from backend
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // In a real app, we'd have an endpoint to fetch all matches
        // For now, we'll simulate with data we know exists
        const demoMatches = [
          {
            matchId: 'match-1763812397281',
            messageId: 'ehr_message_msg-1763812378023',
            portalAccountInfo: {
              name: 'Mandy Thompson',
              dob: '1985-01-15',
              zip: '30308',
              account: '12345'
            },
            ehrPatient: {
              id: 'patient-12345',
              name: 'Amanda Thompson',
              dob: '1985-01-15',
              mrn: 'MRN-12345',
              patientId: '12345'
            },
            matchedBy: 'Staff User',
            matchedAt: new Date().toISOString(),
            status: 'completed',
            contactMethod: 'SMS',
            contactInfo: '99955544446',
            temporaryPassword: 'Welcome2025!'
          }
        ];

        setMatches(demoMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    fetchMatches();
  }, []);

  const handlePreview = (match: any, type: 'email' | 'sms') => {
    setSelectedMatch(match);
    setPreviewType(type);
    setPreviewOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Generate notification content
  const getEmailPreview = (match: any) => {
    const practiceName = "Greenway Health Medical Center";
    const portalUrl = "https://portal.greenwayhealth.com";
    const supportPhone = "(555) 123-4567";

    return {
      subject: "Your Patient Portal Access is Now Active",
      body: `
Dear ${match.ehrPatient.name},

Great news! Your patient portal account has been successfully activated.

You can now access your health information, view test results, request prescription refills, and communicate securely with your healthcare team.

LOGIN INFORMATION
Portal URL: ${portalUrl}
Username: ${match.portalAccountInfo.name.toLowerCase().replace(/\s+/g, '.')}@patient
Temporary Password: ${match.temporaryPassword}

IMPORTANT: For your security, you will be prompted to change your password upon first login.

WHAT YOU CAN DO:
• View your medical records and test results
• Request prescription refills
• Schedule appointments
• Send secure messages to your care team
• Update your contact information
• View and pay bills online

NEED HELP?
If you have any questions or need assistance logging in, please contact us:
Phone: ${supportPhone}
Email: support@greenwayhealth.com
Hours: Monday-Friday, 8:00 AM - 5:00 PM

We're here to make managing your healthcare easier. Welcome to ${practiceName}!

Best regards,
${practiceName} Patient Services Team

---
This is an automated message. Please do not reply to this email.
      `.trim()
    };
  };

  const getSmsPreview = (match: any) => {
    const portalUrl = "portal.greenwayhealth.com";
    
    return `${match.ehrPatient.name.split(' ')[0]}, your Greenway Health patient portal is now active! Login at ${portalUrl} with username: ${match.portalAccountInfo.name.toLowerCase().replace(/\s+/g, '.')}@patient and temp password: ${match.temporaryPassword}. Change password on first login. Questions? Call (555) 123-4567`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-gray-900 mb-1">Patient Matches</h3>
        <p className="text-gray-600 text-sm">
          View portal activations and patient notification history
        </p>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No Patient Matches Yet</h3>
            <p className="text-gray-600 text-sm">
              When staff matches patients to their EHR records, they'll appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.matchId} className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <CardTitle className="text-lg text-green-900">
                        Portal Access Activated
                      </CardTitle>
                      <Badge className="bg-green-600 text-white">
                        Completed
                      </Badge>
                    </div>
                    <CardDescription className="text-green-700">
                      Matched on {formatDate(match.matchedAt)} by {match.matchedBy}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Patient Information */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Portal Account */}
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <div className="text-xs text-green-700 mb-3">Portal Account Created:</div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-500">Patient Name</div>
                        <div className="text-sm text-gray-900">{match.ehrPatient.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Username</div>
                        <div className="text-sm text-gray-900 font-mono">
                          {match.portalAccountInfo.name.toLowerCase().replace(/\s+/g, '.')}@patient
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Temp Password</div>
                        <div className="text-sm text-gray-900 font-mono">{match.temporaryPassword}</div>
                      </div>
                    </div>
                  </div>

                  {/* EHR Link */}
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <div className="text-xs text-green-700 mb-3">Linked to EHR:</div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-500">Patient ID</div>
                        <div className="text-sm text-gray-900">{match.ehrPatient.patientId}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">MRN</div>
                        <div className="text-sm text-gray-900">{match.ehrPatient.mrn}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">DOB</div>
                        <div className="text-sm text-gray-900">{match.ehrPatient.dob}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notification Sent */}
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {match.contactMethod === 'SMS' ? (
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <Mail className="w-5 h-5 text-green-600" />
                      )}
                      <div>
                        <div className="text-sm text-gray-900">
                          Notification sent via {match.contactMethod}
                        </div>
                        <div className="text-xs text-gray-500">
                          To: {match.contactInfo} • {formatDate(match.matchedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {match.contactMethod === 'SMS' || match.contactMethod === 'Phone' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(match, 'sms')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview SMS
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(match, 'email')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview Email
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Details */}
                <div className="text-xs text-gray-500 border-t border-green-200 pt-3">
                  Match ID: {match.matchId} • Message ID: {match.messageId}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewType === 'email' ? 'Email Notification Preview' : 'SMS Notification Preview'}
            </DialogTitle>
            <DialogDescription>
              This is what the patient received to access their portal account
            </DialogDescription>
          </DialogHeader>

          {selectedMatch && (
            <div className="mt-4">
              {previewType === 'email' ? (
                <div className="space-y-4">
                  {/* Email Header */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-20">From:</span>
                        <span className="text-sm text-gray-900">
                          Greenway Health Medical Center &lt;noreply@greenwayhealth.com&gt;
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-20">To:</span>
                        <span className="text-sm text-gray-900">
                          {selectedMatch.contactInfo}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-20">Subject:</span>
                        <span className="text-sm text-gray-900">
                          {getEmailPreview(selectedMatch).subject}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-20">Date:</span>
                        <span className="text-sm text-gray-900">
                          {formatDate(selectedMatch.matchedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                      {getEmailPreview(selectedMatch).body}
                    </pre>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span>Sent via Email • Status: Simulated (Demo Mode)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* SMS Preview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-20">From:</span>
                        <span className="text-sm text-gray-900">Greenway Health</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-20">To:</span>
                        <span className="text-sm text-gray-900">
                          {selectedMatch.contactInfo}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-20">Date:</span>
                        <span className="text-sm text-gray-900">
                          {formatDate(selectedMatch.matchedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SMS Message */}
                  <div className="relative">
                    <div className="flex justify-start">
                      <div className="bg-gray-100 border border-gray-300 rounded-2xl rounded-tl-sm p-4 max-w-md">
                        <p className="text-sm text-gray-900">
                          {getSmsPreview(selectedMatch)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MessageSquare className="w-4 h-4" />
                    <span>Sent via SMS • Status: Simulated (Demo Mode)</span>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-900">
                      <strong>Note:</strong> SMS messages have a 160 character limit. Longer messages may be split into multiple texts.
                      This message is {getSmsPreview(selectedMatch).length} characters.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}