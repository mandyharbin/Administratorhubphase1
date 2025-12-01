import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  Shield,
  CreditCard,
  IdCard,
  Activity,
  ChevronRight,
  Calendar,
  MapPin,
  User,
  AlertCircle
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Mobile Frame Component
function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-[40px] shadow-2xl border-8 border-gray-800 overflow-hidden">
        {/* Phone notch */}
        <div className="bg-gray-800 h-6 flex items-center justify-center">
          <div className="bg-gray-900 w-32 h-4 rounded-b-2xl"></div>
        </div>
        {/* Phone screen */}
        <div className="bg-white h-[740px] overflow-y-auto">
          {children}
        </div>
        {/* Phone home indicator */}
        <div className="bg-white h-6 flex items-center justify-center border-t">
          <div className="bg-gray-800 w-32 h-1 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export function PatientToDoChecklist() {
  const [checklistData, setChecklistData] = useState<any>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/patient-checklist`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const data = await response.json();
      setChecklistData(data);
    } catch (error) {
      console.error('Error loading checklist:', error);
    }
  };

  const loadUpdatedChecklist = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/patient-checklist-updated`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const data = await response.json();
      setChecklistData(data);
    } catch (error) {
      console.error('Error loading updated checklist:', error);
    }
  };

  const completeTask = async (taskId: string) => {
    setCompletingTaskId(taskId);
    
    try {
      // Map task IDs to completion endpoints
      const taskEndpoints: Record<string, string> = {
        'item-001': `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/complete-task-T1101`,
        'item-002': `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/complete-task-T1102`,
        'item-003': `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/complete-task-T1103`,
        'item-004': `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/complete-task-T1104`,
        'item-005': `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/complete-task-T1105`,
        'item-006': `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/complete-task-T1106`,
      };

      const endpoint = taskEndpoints[taskId];
      if (!endpoint) {
        console.error('No completion endpoint for task:', taskId);
        setCompletingTaskId(null);
        return;
      }

      // Action 1: Call the task completion endpoint
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const result = await response.json();

      if (result.success) {
        // Action 2: Fetch the updated checklist
        await loadUpdatedChecklist();
      }
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setCompletingTaskId(null);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: any = {
      FileText,
      DollarSign,
      Shield,
      CreditCard,
      IdCard,
      Activity
    };
    return icons[iconName] || FileText;
  };

  if (!checklistData) {
    return <div>Loading checklist...</div>;
  }

  const completedCount = checklistData.checklist.items.filter((item: any) => item.completed).length;
  const totalCount = checklistData.checklist.items.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2>Patient To-Do Checklist</h2>
        <p className="text-gray-600 mt-1">
          Pre-visit tasks and forms for patient app
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mobile Preview */}
        <div>
          <h3 className="mb-4">Mobile View</h3>
          <MobileFrame>
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-xl">To-Do List</h1>
                <p className="text-sm text-gray-600">
                  Complete these tasks before your appointment
                </p>
              </div>

              {/* Appointment Card */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">
                      {checklistData.upcomingAppointment.date} at {checklistData.upcomingAppointment.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>
                      {checklistData.upcomingAppointment.provider} - {checklistData.upcomingAppointment.specialty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-xs">{checklistData.upcomingAppointment.location}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Your Progress</span>
                  <span className="text-gray-600">
                    {completedCount} of {totalCount} completed
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                <div className="text-xs text-gray-600">
                  Due by {checklistData.checklist.dueDate}
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-3">
                {checklistData.checklist.items.map((item: any) => {
                  const Icon = getIconComponent(item.icon);
                  const isCompleted = item.completed;
                  const isHighPriority = item.priority === 'high';
                  const isCompleting = completingTaskId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => !isCompleted && !isCompleting && completeTask(item.id)}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        isCompleted
                          ? 'bg-green-50 border-green-300'
                          : isCompleting
                          ? 'bg-blue-50 border-blue-300 cursor-wait'
                          : isHighPriority
                          ? 'bg-white border-red-200 cursor-pointer hover:border-red-300'
                          : 'bg-white border-gray-200 cursor-pointer hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isCompleted
                              ? 'bg-green-500 border-green-500'
                              : isCompleting
                              ? 'bg-blue-500 border-blue-500 animate-pulse'
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          {isCompleted && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                          {isCompleting && (
                            <Clock className="w-3 h-3 text-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-1">
                              <Icon className={`w-4 h-4 flex-shrink-0 ${
                                isCompleted ? 'text-green-600' : 'text-gray-600'
                              }`} />
                              <span className={`font-medium text-sm ${
                                isCompleted ? 'text-green-900 line-through' : 'text-gray-900'
                              }`}>
                                {item.title}
                              </span>
                            </div>
                            {item.required && !isCompleted && (
                              <Badge variant="destructive" className="text-xs flex-shrink-0">
                                Required
                              </Badge>
                            )}
                            {isCompleted && item.completedDate && (
                              <Badge className="text-xs flex-shrink-0 bg-green-100 text-green-800">
                                ✓ {item.completedDate}
                              </Badge>
                            )}
                          </div>

                          <p className={`text-xs mb-2 ${
                            isCompleted ? 'text-green-700' : 'text-gray-600'
                          }`}>
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{item.estimatedTime}</span>
                            </div>
                            {!isCompleted && !isCompleting && (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Message */}
              {completedCount === totalCount ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-900">All tasks completed!</div>
                      <p className="text-sm text-green-700 mt-1">
                        You're all set for your appointment on {checklistData.upcomingAppointment.date}.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-900">
                        {totalCount - completedCount} tasks remaining
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Complete your tasks by {checklistData.checklist.dueDate} to avoid delays.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </MobileFrame>
        </div>

        {/* Desktop Info Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Demo Controls</CardTitle>
              <CardDescription>
                Click tasks in the mobile preview to test the completion flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium mb-2">How to Test</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-blue-600">1.</span>
                    <span>Click on any incomplete task in the mobile preview</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-blue-600">2.</span>
                    <span>Watch the task animate (blue pulse) while completing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-blue-600">3.</span>
                    <span>Task updates to completed state with green checkmark</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-blue-600">4.</span>
                    <span>Progress bar updates automatically</span>
                  </li>
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {completedCount}/{totalCount}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Tasks Complete</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {completionPercentage}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Progress</div>
                  </CardContent>
                </Card>
              </div>

              <Button 
                onClick={loadChecklist} 
                variant="outline" 
                className="w-full"
              >
                Reset Demo
              </Button>

              <div className="text-xs text-gray-500 pt-2 border-t">
                <strong>API Endpoints Used:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Initial load: <code className="bg-gray-100 px-1 py-0.5 rounded">/api/patient-checklist</code></li>
                  <li>• Complete task 1: <code className="bg-gray-100 px-1 py-0.5 rounded">/api/complete-task-T1101</code></li>
                  <li>• Complete task 2: <code className="bg-gray-100 px-1 py-0.5 rounded">/api/complete-task-T1102</code></li>
                  <li>• After update: <code className="bg-gray-100 px-1 py-0.5 rounded">/api/patient-checklist-updated</code></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Patient To-Do Lists</CardTitle>
              <CardDescription>
                How pre-visit checklists improve patient experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Key Features</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Dynamic Task Generation:</strong> Tasks are automatically generated based on appointment type, provider, and patient history
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Priority Indicators:</strong> Required tasks are clearly marked to ensure compliance
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Progress Tracking:</strong> Visual progress bar shows completion status
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Time Estimates:</strong> Each task shows estimated completion time
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>FHIR Integration:</strong> Forms link directly to FHIR Questionnaire resources
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Data Source</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      /mnt/data/mock_patient_checklist.json
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      /mnt/data/mock_task_instances.json
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium">FHIR Questionnaire</div>
                  <p className="text-sm text-gray-600">
                    Links to structured questionnaire resources with validation
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-medium">Consent Form</div>
                  <p className="text-sm text-gray-600">
                    Legal agreements with electronic signature capture
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Document Upload</div>
                  <p className="text-sm text-gray-600">
                    Camera capture for insurance cards and IDs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <Activity className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium">Health Screening</div>
                  <p className="text-sm text-gray-600">
                    Symptom checks and health assessments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                    1
                  </div>
                  <div>
                    <strong>Admin generates tasks</strong> using Forms & Checklist Management
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                    2
                  </div>
                  <div>
                    <strong>Tasks sent to patient</strong> via push notification or SMS
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                    3
                  </div>
                  <div>
                    <strong>Patient completes tasks</strong> in mobile app
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                    4
                  </div>
                  <div>
                    <strong>Responses saved to FHIR</strong> as QuestionnaireResponse resources
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                    5
                  </div>
                  <div>
                    <strong>Practice notified</strong> when checklist is complete
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}