import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { 
  FileText, 
  CheckCircle, 
  Calendar, 
  Pill, 
  Activity,
  Shield,
  ClipboardList,
  FileCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  User,
  Upload
} from 'lucide-react';

interface PreVisitSubmission {
  id: string;
  patientId: string;
  symptoms?: string[];
  recentChanges?: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    isActive: boolean;
  }>;
  vitalNotes?: string;
  insuranceConfirmed?: boolean;
  carePlans?: Array<{
    name: string;
    progress: string;
    notes: string;
  }>;
  encounterNotes?: string;
  completedAt: string;
  status: string;
}

interface PreVisitFormCardProps {
  submission: PreVisitSubmission;
  patientName: string;
  appointmentDate?: string;
}

export function PreVisitFormCard({ submission, patientName, appointmentDate }: PreVisitFormCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Normalize symptoms to array
  const symptomsArray = Array.isArray(submission.symptoms) 
    ? submission.symptoms 
    : typeof submission.symptoms === 'string' 
    ? [submission.symptoms] 
    : [];

  // Normalize medications to array
  const medicationsArray = Array.isArray(submission.medications) 
    ? submission.medications 
    : [];

  // Normalize care plans to array
  const carePlansArray = Array.isArray(submission.carePlans) 
    ? submission.carePlans 
    : [];

  // Count significant changes
  const changeCount = 
    symptomsArray.length +
    medicationsArray.filter(m => !m.isActive).length +
    (submission.recentChanges ? 1 : 0);

  return (
    <>
      <div className="p-6 bg-gradient-to-r from-teal-50 to-blue-50 border-l-4 border-teal-500">
        <div className="flex gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
            <FileCheck className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">{patientName}</span>
                <Badge variant="outline" className="text-xs bg-teal-100 text-teal-700 border-teal-300">
                  Pre-Visit Complete
                </Badge>
              </div>
              <span className="text-xs text-gray-500">{formatTime(submission.completedAt)}</span>
            </div>
            <div className="text-xs text-gray-600 mb-2">
              Completed {formatDate(submission.completedAt)}
              {appointmentDate && ` • Appt: ${appointmentDate}`}
            </div>
          </div>
        </div>

        {/* Summary Highlights */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-white rounded-lg p-3 border border-teal-200">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-teal-600" />
              <span className="text-xs text-gray-600">Symptoms</span>
            </div>
            <div className="text-sm">
              {symptomsArray.length > 0 ? (
                <span className="text-orange-600">{symptomsArray.length} reported</span>
              ) : (
                <span className="text-green-600">None</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-teal-200">
            <div className="flex items-center gap-2 mb-1">
              <Pill className="w-4 h-4 text-teal-600" />
              <span className="text-xs text-gray-600">Medications</span>
            </div>
            <div className="text-sm">
              {medicationsArray.length > 0 ? (
                <>
                  {medicationsArray.filter(m => !m.isActive).length > 0 ? (
                    <span className="text-orange-600">
                      {medicationsArray.filter(m => !m.isActive).length} discontinued
                    </span>
                  ) : (
                    <span className="text-green-600">No changes</span>
                  )}
                </>
              ) : (
                <span className="text-gray-500">Not reviewed</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-teal-200">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-teal-600" />
              <span className="text-xs text-gray-600">Insurance</span>
            </div>
            <div className="text-sm">
              {submission.insuranceConfirmed ? (
                <span className="text-green-600">Confirmed</span>
              ) : (
                <span className="text-orange-600">Needs review</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        {changeCount > 0 && (
          <div className="bg-white border border-orange-200 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs text-orange-900 mb-1">
                  <strong>Action Required:</strong> {changeCount} change{changeCount !== 1 ? 's' : ''} reported
                </div>
                {!expanded && (
                  <button
                    onClick={() => setExpanded(true)}
                    className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    View summary
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expanded Summary */}
        {expanded && (
          <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
            <div className="space-y-2 text-sm">
              {symptomsArray.length > 0 && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">Recent Symptoms:</div>
                  <div className="flex flex-wrap gap-1">
                    {symptomsArray.map((symptom, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {medicationsArray.filter(m => !m.isActive).length > 0 && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">Discontinued Medications:</div>
                  {medicationsArray.filter(m => !m.isActive).map((med, idx) => (
                    <div key={idx} className="text-xs text-gray-700">
                      • {med.name} ({med.dosage})
                    </div>
                  ))}
                </div>
              )}

              {submission.recentChanges && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">Patient Notes:</div>
                  <div className="text-xs text-gray-700 italic">"{submission.recentChanges}"</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setExpanded(false)}
              className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1 mt-2"
            >
              Show less
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => setDetailsOpen(true)}
          >
            <FileText className="w-4 h-4 mr-1" />
            View Full Form
          </Button>
          <Button
            size="sm"
            variant="outline"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Mark Reviewed
          </Button>
        </div>
      </div>

      {/* Full Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Pre-Visit Health Update - {patientName}</DialogTitle>
            <DialogDescription>
              Complete health update information for this patient
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                <div>
                  <div className="text-sm mb-1">Submitted: {formatDate(submission.completedAt)} at {formatTime(submission.completedAt)}</div>
                  <div className="text-xs text-gray-600">Submission ID: {submission.id}</div>
                </div>
                <Badge className="bg-teal-600">Completed</Badge>
              </div>

              {/* Symptoms Section */}
              {symptomsArray.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-orange-600" />
                    <h3 className="text-base">Recent Symptoms</h3>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {symptomsArray.map((symptom, idx) => (
                        <Badge key={idx} className="bg-orange-600 text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Changes */}
              {submission.recentChanges && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base">Recent Changes</h3>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{submission.recentChanges}</p>
                  </div>
                </div>
              )}

              {/* Medications */}
              {medicationsArray.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="w-5 h-5 text-purple-600" />
                    <h3 className="text-base">Medication Review</h3>
                  </div>
                  <div className="space-y-2">
                    {medicationsArray.map((med, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg border ${
                          med.isActive 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm mb-1">{med.name}</div>
                            <div className="text-xs text-gray-600">
                              {med.dosage} • {med.frequency}
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={med.isActive ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}
                          >
                            {med.isActive ? 'Active' : 'Discontinued'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vital Notes */}
              {submission.vitalNotes && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-teal-600" />
                    <h3 className="text-base">Vitals & Labs Notes</h3>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{submission.vitalNotes}</p>
                  </div>
                </div>
              )}

              {/* Insurance */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base">Insurance Verification</h3>
                </div>
                <div className={`p-4 rounded-lg border ${
                  submission.insuranceConfirmed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {submission.insuranceConfirmed ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-700">Insurance information confirmed</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <span className="text-sm text-orange-700">Insurance needs verification</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Care Plans */}
              {carePlansArray.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-5 h-5 text-purple-600" />
                    <h3 className="text-base">Care Plan Progress</h3>
                  </div>
                  <div className="space-y-2">
                    {carePlansArray.map((plan, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="text-sm mb-1">{plan.name}</div>
                        <div className="text-xs text-gray-600 mb-2">Progress: {plan.progress}</div>
                        {plan.notes && (
                          <div className="text-xs text-gray-700 italic">{plan.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Encounter Notes */}
              {submission.encounterNotes && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base">Additional Notes</h3>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{submission.encounterNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}