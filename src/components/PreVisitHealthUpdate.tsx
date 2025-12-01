import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Calendar, Clock, MapPin, User, Bot, CheckCircle2, 
  Pill, Activity, CreditCard, Target, Upload, FileText,
  AlertCircle, ChevronRight, TrendingUp, TrendingDown,
  Heart, Droplet, Thermometer, Weight, Shield, Plus, X
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PreVisitHealthUpdateProps {
  patientId: string;
  patientName: string;
}

type PreVisitSection = 
  | 'welcome'
  | 'symptoms'
  | 'medications'
  | 'vitals'
  | 'insurance'
  | 'care-plans'
  | 'documents'
  | 'encounter-review'
  | 'confirmation';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  isActive: boolean;
}

interface Vital {
  type: string;
  value: string;
  unit: string;
  date: string;
  status: 'normal' | 'high' | 'low';
  icon: any;
  color: string;
}

interface CarePlan {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'in-progress';
  progress: number;
  goals: string[];
}

export function PreVisitHealthUpdate({ patientId, patientName }: PreVisitHealthUpdateProps) {
  const [currentSection, setCurrentSection] = useState<PreVisitSection>('welcome');
  const [loading, setLoading] = useState(false);
  const [preVisitData, setPreVisitData] = useState<any>(null);
  
  // Form states
  const [symptoms, setSymptoms] = useState<string>('');
  const [recentChanges, setRecentChanges] = useState<string>('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [vitalNotes, setVitalNotes] = useState<Record<string, string>>({});
  const [insuranceConfirmed, setInsuranceConfirmed] = useState(false);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [encounterNotes, setEncounterNotes] = useState('');

  useEffect(() => {
    loadPreVisitData();
  }, [patientId]);

  const loadPreVisitData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/pre-visit-data?patientId=${patientId}`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
            "Accept": "application/json"
          }
        }
      );

      if (res.ok) {
        const data = await res.json();
        setPreVisitData(data);
        setMedications(data.medications || []);
        setCarePlans(data.carePlans || []);
      }
    } catch (error) {
      console.error('Error loading pre-visit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPreVisit = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/submit-pre-visit`,
        {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            patientId,
            symptoms,
            recentChanges,
            medications: medications.map(m => ({ id: m.id, isActive: m.isActive })),
            vitalNotes,
            insuranceConfirmed,
            carePlans: carePlans.map(cp => ({ id: cp.id, progress: cp.progress, goals: cp.goals })),
            encounterNotes,
            completedAt: new Date().toISOString()
          })
        }
      );

      if (res.ok) {
        setCurrentSection('confirmation');
      }
    } catch (error) {
      console.error('Error submitting pre-visit:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMedication = (medId: string) => {
    setMedications(prev => prev.map(med => 
      med.id === medId ? { ...med, isActive: !med.isActive } : med
    ));
  };

  const updateCarePlanProgress = (planId: string, progress: number) => {
    setCarePlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, progress } : plan
    ));
  };

  const addGoalToCarePlan = (planId: string, goal: string) => {
    setCarePlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, goals: [...plan.goals, goal] } : plan
    ));
    setNewGoal('');
  };

  const renderBotMessage = (content: React.ReactNode) => (
    <div className="flex gap-2 mb-4">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-teal-100 text-teal-700">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="text-xs text-gray-600 mb-1 px-1">AI Pre-Visit Assistant</div>
        <div className="rounded-lg p-3 bg-white border border-gray-200 max-w-[95%]">
          {content}
        </div>
      </div>
    </div>
  );

  if (loading && !preVisitData) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-gray-600">Loading your health information...</div>
        </div>
      </Card>
    );
  }

  // Welcome Section
  if (currentSection === 'welcome') {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-blue-50">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-600" />
            Pre-Visit Health Status Update
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 overflow-y-auto bg-gray-50">
          {renderBotMessage(
            <div className="space-y-3">
              <div className="text-sm">
                Hi {patientName}! 👋 I'm here to help you prepare for your upcoming appointment with <strong>{preVisitData?.appointment?.provider}</strong>.
              </div>
              <div className="text-sm">
                To make your visit more efficient and ensure your provider has the most up-to-date information, I'll guide you through a quick health status review.
              </div>
            </div>
          )}

          {preVisitData?.appointment && (
            <div className="flex gap-2 mb-4">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-teal-100 text-teal-700">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="rounded-lg p-4 bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200 max-w-[95%]">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <span className="font-medium">Your Upcoming Appointment</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span>{preVisitData.appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span>{preVisitData.appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span>{preVisitData.appointment.provider}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span>{preVisitData.appointment.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {renderBotMessage(
            <div className="space-y-3">
              <div className="text-sm">This will take about <strong>5-7 minutes</strong> and covers:</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Recent symptoms or health changes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-blue-600" />
                  <span>Current medications review</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-600" />
                  <span>Latest vitals and lab results</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span>Insurance verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span>Care plan progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-orange-600" />
                  <span>Document uploads (if needed)</span>
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  onClick={() => setCurrentSection('symptoms')}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  Let's Get Started
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Symptoms Section
  if (currentSection === 'symptoms') {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              Recent Symptoms & Health Changes
            </CardTitle>
            <Badge variant="outline" className="text-xs">Step 1 of 7</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 overflow-y-auto bg-gray-50">
          {renderBotMessage(
            <div className="text-sm">
              Let's start with any recent changes in your health. Have you experienced any new symptoms, 
              changes in existing conditions, or other health concerns since your last visit?
            </div>
          )}

          <div className="space-y-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                New or worsening symptoms
              </label>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., Occasional headaches, mild cough, increased fatigue..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                Changes in chronic conditions or medication side effects
              </label>
              <Textarea
                value={recentChanges}
                onChange={(e) => setRecentChanges(e.target.value)}
                placeholder="e.g., Blood pressure has been running higher, experiencing dry mouth from new medication..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="mt-auto pt-4 border-t">
            <Button 
              onClick={() => setCurrentSection('medications')}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Continue to Medications
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Medications Section
  if (currentSection === 'medications') {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              Current Medications Review
            </CardTitle>
            <Badge variant="outline" className="text-xs">Step 2 of 7</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 overflow-y-auto bg-gray-50">
          {renderBotMessage(
            <div className="text-sm">
              I see you have <strong>{medications.length} medications</strong> in your record. 
              Please confirm which ones you're still taking by toggling the switches.
            </div>
          )}

          <div className="space-y-3 mb-4">
            {medications.map((med, index) => (
              <div 
                key={med.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  med.isActive 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{index + 1}. {med.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {med.dosage} • {med.frequency}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 whitespace-nowrap">
                        {med.isActive ? 'Taking' : 'Stopped'}
                      </span>
                      <Switch
                        checked={med.isActive}
                        onCheckedChange={() => toggleMedication(med.id)}
                        className="data-[state=checked]:bg-green-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t">
            <Button 
              onClick={() => setCurrentSection('vitals')}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Continue to Vitals & Labs
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vitals & Lab Results Section
  if (currentSection === 'vitals') {
    const vitals: Vital[] = preVisitData?.vitals || [];
    
    // Icon mapping for vitals
    const iconMap: Record<string, any> = {
      'Heart': Heart,
      'Droplet': Droplet,
      'Weight': Weight,
      'Thermometer': Thermometer
    };
    
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-5 h-5 text-teal-600" />
              Latest Vitals & Lab Results
            </CardTitle>
            <Badge variant="outline" className="text-xs">Step 3 of 7</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 overflow-y-auto bg-gray-50">
          {renderBotMessage(
            <div className="text-sm">
              Here are your most recent vital signs and lab results. If you've noticed any changes or have been 
              monitoring these at home, please let us know.
            </div>
          )}

          <div className="space-y-3 mb-4">
            {vitals.map((vital, index) => {
              const Icon = iconMap[vital.icon] || Activity;
              return (
                <div key={index} className="bg-white rounded-lg border p-3">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${vital.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{vital.type}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-medium">{vital.value}</span>
                        <span className="text-xs text-gray-500">{vital.unit}</span>
                        {vital.status === 'high' && <TrendingUp className="w-4 h-4 text-red-500" />}
                        {vital.status === 'low' && <TrendingDown className="w-4 h-4 text-blue-500" />}
                        {vital.status === 'normal' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Last recorded: {vital.date}</div>
                    </div>
                  </div>
                  
                  <Textarea
                    value={vitalNotes[vital.type] || ''}
                    onChange={(e) => setVitalNotes({ ...vitalNotes, [vital.type]: e.target.value })}
                    placeholder={`Any changes or home monitoring notes for ${vital.type}?`}
                    className="text-xs min-h-[60px] mt-2"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t">
            <Button 
              onClick={() => setCurrentSection('insurance')}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Continue to Insurance
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Insurance Verification Section
  if (currentSection === 'insurance') {
    const insurance = preVisitData?.insurance;
    
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-600" />
              Insurance Verification
            </CardTitle>
            <Badge variant="outline" className="text-xs">Step 4 of 7</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 overflow-y-auto bg-gray-50">
          {renderBotMessage(
            <div className="text-sm">
              Please verify that your insurance information is still current. If anything has changed, 
              you can update it now or bring your new insurance card to your appointment.
            </div>
          )}

          {insurance && (
            <div className="bg-white rounded-lg border p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Current Insurance</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-medium">{insurance.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">{insurance.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member ID:</span>
                  <span className="font-mono text-xs">{insurance.memberId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Group:</span>
                  <span className="font-mono text-xs">{insurance.group}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className="bg-green-600 text-xs">Active</Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Is this information still correct?</span>
                  <Switch
                    checked={insuranceConfirmed}
                    onCheckedChange={setInsuranceConfirmed}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </div>
            </div>
          )}

          {!insuranceConfirmed && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  Please bring your updated insurance card to your appointment, or contact our office 
                  at (555) 123-4567 to update your information before your visit.
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 border-t">
            <Button 
              onClick={() => setCurrentSection('care-plans')}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Continue to Care Plans
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Care Plans Section
  if (currentSection === 'care-plans') {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-600" />
              Care Plan Progress & Goals
            </CardTitle>
            <Badge variant="outline" className="text-xs">Step 5 of 7</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 overflow-y-auto bg-gray-50">
          {renderBotMessage(
            <div className="text-sm">
              Let's review your active care plans and health goals. Update your progress and add any new goals 
              you'd like to discuss with your provider.
            </div>
          )}

          <div className="space-y-4 mb-4">
            {carePlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{plan.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{plan.description}</div>
                  </div>
                  <Badge 
                    className={`text-xs ${
                      plan.status === 'active' ? 'bg-green-600' :
                      plan.status === 'in-progress' ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    {plan.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{plan.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-teal-600 h-2 rounded-full transition-all"
                      style={{ width: `${plan.progress}%` }}
                    />
                  </div>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={plan.progress}
                    onChange={(e) => updateCarePlanProgress(plan.id, parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {plan.goals.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs font-medium text-gray-700 mb-2">Current Goals</div>
                    <div className="space-y-1">
                      {plan.goals.map((goal, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs font-medium text-gray-700 mb-2">Add New Goal</div>
                  <div className="flex gap-2">
                    <Input
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="e.g., Walk 30 minutes daily"
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() => addGoalToCarePlan(plan.id, newGoal)}
                      disabled={!newGoal.trim()}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t">
            <Button 
              onClick={() => setCurrentSection('documents')}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Continue to Documents
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Documents Upload Section
  if (currentSection === 'documents') {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-600" />
              Document Uploads (Optional)
            </CardTitle>
            <Badge variant="outline" className="text-xs">Step 6 of 7</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 overflow-y-auto bg-gray-50">
          {renderBotMessage(
            <div className="text-sm">
              If you have any documents to share (insurance cards, home monitoring logs, advance directives, 
              consent forms, or records from other providers), you can upload them here.
            </div>
          )}

          <div className="space-y-3 mb-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm mb-1">Click to upload or drag and drop</div>
              <div className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</div>
              <Button size="sm" className="mt-3 bg-teal-600 hover:bg-teal-700">
                Choose Files
              </Button>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-700">Uploaded Files</div>
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-xs">{file.name}</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t">
            <Button 
              onClick={() => setCurrentSection('encounter-review')}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Continue to Encounter Review
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Encounter Review Section
  if (currentSection === 'encounter-review') {
    const lastEncounter = preVisitData?.lastEncounter;
    
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Last Visit Review
            </CardTitle>
            <Badge variant="outline" className="text-xs">Step 7 of 7</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 overflow-y-auto bg-gray-50">
          {renderBotMessage(
            <div className="text-sm">
              Let's review your last visit. Has anything changed or do you have any updates related to the 
              issues discussed during that appointment?
            </div>
          )}

          {lastEncounter && (
            <div className="bg-white rounded-lg border p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-sm">Last Visit Summary</div>
                <span className="text-xs text-gray-500">{lastEncounter.date}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-600">Provider: </span>
                  <span className="font-medium">{lastEncounter.provider}</span>
                </div>
                <div>
                  <span className="text-gray-600">Type: </span>
                  <span className="font-medium">{lastEncounter.type}</span>
                </div>
                <div>
                  <span className="text-gray-600">Chief Complaint: </span>
                  <span>{lastEncounter.chiefComplaint}</span>
                </div>
                {lastEncounter.diagnoses && lastEncounter.diagnoses.length > 0 && (
                  <div>
                    <div className="text-gray-600 mb-1">Diagnoses:</div>
                    <div className="space-y-1 ml-3">
                      {lastEncounter.diagnoses.map((dx: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-teal-600">•</span>
                          <span>{dx}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {lastEncounter.followUp && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600">Follow-up Instructions: </span>
                    <span>{lastEncounter.followUp}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Any updates or changes since your last visit?
            </label>
            <Textarea
              value={encounterNotes}
              onChange={(e) => setEncounterNotes(e.target.value)}
              placeholder="e.g., The prescribed treatment has been working well, symptoms have improved..."
              className="min-h-[100px]"
            />
          </div>

          <div className="mt-auto pt-4 border-t">
            <Button 
              onClick={handleSubmitPreVisit}
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Pre-Visit Update
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Confirmation Section
  if (currentSection === 'confirmation') {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-teal-50">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Pre-Visit Update Complete!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 overflow-y-auto bg-gray-50">
          {renderBotMessage(
            <div className="space-y-3">
              <div className="text-sm">
                Thank you, {patientName}! 🎉 Your pre-visit health status update has been successfully submitted.
              </div>
              <div className="text-sm">
                Your healthcare team now has all the information they need to provide you with the best possible care 
                during your upcoming appointment.
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">What happens next?</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Your provider will review your updates before your appointment</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Any medication changes will be documented in your chart</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Your care team may reach out if they need clarification</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>You'll receive a reminder 24 hours before your appointment</span>
              </div>
            </div>
          </div>

          {preVisitData?.appointment && (
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-teal-600" />
                <span className="font-medium">Appointment Details</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span>{preVisitData.appointment.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span>{preVisitData.appointment.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span>{preVisitData.appointment.location}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}