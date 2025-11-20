import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Mail, MessageSquare, Phone, Bell, Settings, ChevronDown, ChevronUp, X, Search, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { MultiSelectFilter } from './MultiSelectFilter';
import { NoticeTemplateManager } from './NoticeTemplateManager';

type CommunicationMethod = 'email' | 'sms' | 'voice' | 'push';

interface NoticeTemplate {
  id: string;
  name: string;
  trigger: string;
  deliveryTime: string;
  deliveryValue?: number;
  deliveryUnit?: string;
  message: string;
  methods: {
    email: boolean;
    sms: boolean;
    voice: boolean;
    push: boolean;
  };
  conditions: {
    apptTypes: string[];
    reasons: string[];
    providers: string[];
    locations: string[];
    dateRange?: { start: string; end: string };
  };
  populationTarget?: {
    carePrograms: string[];
    uploadedReport?: {
      fileName: string;
      uploadDate: string;
    };
  };
  patientFilters?: {
    ageRanges: string[];
    sexes: string[];
  };
}

interface NoticeType {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  methods: {
    email: boolean;
    sms: boolean;
    voice: boolean;
    push: boolean;
  };
  trigger?: string;
  deliveryTime?: string;
  customConditions?: boolean;
  templates?: NoticeTemplate[];
}

export function PatientNotices() {
  const [notices, setNotices] = useState<NoticeType[]>([
    { 
      id: '1', 
      name: 'Appointment Notices', 
      description: 'Upcoming appointment reminders and confirmations',
      category: 'Appointments',
      enabled: true,
      methods: { email: true, sms: true, voice: false, push: true },
      trigger: 'Scheduled Appointment',
      deliveryTime: 'scheduled-before',
      customConditions: true,
      templates: [
        {
          id: 'appt-1',
          name: '24 Hour Reminder',
          trigger: 'Scheduled Appointment',
          deliveryTime: 'scheduled-before',
          deliveryValue: 24,
          deliveryUnit: 'hours',
          message: 'Hi {{patient_name}}, this is a reminder that you have an appointment with Dr. {{provider_name}} tomorrow at {{appointment_time}} at our {{location_name}} office. Please reply CONFIRM to confirm or call us at {{practice_phone}} if you need to reschedule.',
          methods: { email: true, sms: true, voice: false, push: true },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        },
        {
          id: 'appt-2',
          name: '3 Day Reminder',
          trigger: 'Scheduled Appointment',
          deliveryTime: 'scheduled-before',
          deliveryValue: 3,
          deliveryUnit: 'days',
          message: 'Hello {{patient_name}}, your appointment with Dr. {{provider_name}} is scheduled for {{appointment_date}} at {{appointment_time}}. Location: {{location_address}}. If you need to make changes, please call {{practice_phone}}.',
          methods: { email: true, sms: false, voice: false, push: false },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        },
        {
          id: 'appt-3',
          name: '1 Week Reminder',
          trigger: 'Scheduled Appointment',
          deliveryTime: 'scheduled-before',
          deliveryValue: 7,
          deliveryUnit: 'days',
          message: 'This is a friendly reminder from {{practice_name}} that you have an appointment scheduled for {{appointment_date}} at {{appointment_time}}. We look forward to seeing you!',
          methods: { email: true, sms: true, voice: false, push: true },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        }
      ]
    },
    { 
      id: '2', 
      name: 'Appointment Broadcast', 
      description: 'Mass communication about appointment availability',
      category: 'Appointments',
      enabled: true,
      methods: { email: true, sms: true, voice: false, push: false },
      trigger: 'Generated On-Demand',
      deliveryTime: 'real-time',
      customConditions: true,
      templates: [
        {
          id: 'broadcast-1',
          name: 'Same Day Openings Available',
          trigger: 'Generated On-Demand',
          deliveryTime: 'real-time',
          message: 'Same-day appointments now available! We have openings today with Dr. {{provider_name}} at {{location_name}}. Call {{practice_phone}} or book online at {{portal_url}}. Don\'t miss this opportunity!',
          methods: { email: false, sms: true, voice: false, push: true },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        },
        {
          id: 'broadcast-2',
          name: 'Flu Shot Walk-In Availability',
          trigger: 'Generated On-Demand',
          deliveryTime: 'real-time',
          message: 'Flu shots now available! No appointment needed - walk in Mon-Fri 8am-5pm at any {{practice_name}} location. Most insurance plans cover 100%. Protect yourself and your family this season.',
          methods: { email: true, sms: true, voice: false, push: false },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        },
        {
          id: 'broadcast-3',
          name: 'Weekend Appointment Slots Open',
          trigger: 'Generated On-Demand',
          deliveryTime: 'real-time',
          message: 'Limited weekend appointment slots now available at {{location_name}}! Saturday & Sunday 9am-3pm. Perfect for busy schedules. Book now: {{scheduling_link}} or call {{practice_phone}}.',
          methods: { email: true, sms: true, voice: false, push: true },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        }
      ]
    },
    { 
      id: '3', 
      name: 'Population Broadcast', 
      description: 'General announcements to patient populations',
      category: 'Broadcasts',
      enabled: false,
      methods: { email: true, sms: false, voice: false, push: true },
      templates: [
        {
          id: 'pop-1',
          name: 'Office Closure Notice',
          trigger: 'Generated On-Demand',
          deliveryTime: 'real-time',
          message: 'OFFICE CLOSURE: All {{practice_name}} locations will be closed {{closure_date}} for {{closure_reason}}. We reopen {{reopening_date}} at regular hours. For emergencies, call {{emergency_phone}}.',
          methods: { email: true, sms: true, voice: false, push: true },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          },
          populationTarget: {
            carePrograms: []
          }
        },
        {
          id: 'pop-2',
          name: 'New Patient Portal Launch',
          trigger: 'Generated On-Demand',
          deliveryTime: 'real-time',
          message: 'NEW: Your upgraded patient portal is here! Now easier to book appointments, message your doctor, and view your health records. Log in today at {{portal_url}} with your existing credentials.',
          methods: { email: true, sms: false, voice: false, push: true },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          },
          populationTarget: {
            carePrograms: []
          }
        },
        {
          id: 'pop-3',
          name: 'COVID-19 Updates and Guidelines',
          trigger: 'Generated On-Demand',
          deliveryTime: 'real-time',
          message: 'Important update: {{practice_name}} has updated our COVID-19 safety protocols. Masks are now {{mask_policy}}. View full guidelines at {{website_url}} or call {{practice_phone}} with questions.',
          methods: { email: true, sms: true, voice: false, push: true },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          },
          populationTarget: {
            carePrograms: []
          }
        }
      ]
    },
    { 
      id: '4', 
      name: 'Birthday Messages', 
      description: 'Automated birthday greetings to patients',
      category: 'Engagement',
      enabled: true,
      methods: { email: true, sms: true, voice: false, push: false },
      templates: [
        {
          id: 'bday-1',
          name: 'Birthday Greeting - Standard',
          trigger: 'Patient Birthday',
          deliveryTime: 'on-date',
          message: 'Happy Birthday {{patient_name}}! 🎉 Wishing you a wonderful day and a healthy year ahead. Thank you for trusting us with your care. - Your friends at {{practice_name}}',
          methods: { email: true, sms: true, voice: false, push: false },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        },
        {
          id: 'bday-2',
          name: 'Birthday with Wellness Reminder',
          trigger: 'Patient Birthday',
          deliveryTime: 'on-date',
          message: 'Happy Birthday {{patient_name}}! 🎂 Another year older means it\'s a great time to schedule your annual wellness visit. Call {{practice_phone}} or book online. Here\'s to your health!',
          methods: { email: true, sms: true, voice: false, push: false },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        }
      ]
    },
    { 
      id: '5', 
      name: 'No Show', 
      description: 'Notifications for missed appointments',
      category: 'Appointments',
      enabled: true,
      methods: { email: true, sms: true, voice: true, push: false },
      trigger: 'Missed Appointment',
      deliveryTime: 'real-time',
      templates: [
        {
          id: 'noshow-1',
          name: 'Missed Appointment Notice',
          trigger: 'Missed Appointment',
          deliveryTime: 'real-time',
          message: 'Hi {{patient_name}}, you didn\'t make it to your appointment today. Please call {{practice_phone}} to reschedule your appointment.',
          methods: { email: true, sms: true, voice: false, push: true },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        }
      ]
    },
    // Phase 2 - Hidden for Phase 1 rollout
    // { 
    //   id: '6', 
    //   name: 'Orders Notifications', 
    //   description: 'Lab orders and test result alerts',
    //   category: 'Clinical',
    //   enabled: true,
    //   methods: { email: true, sms: false, voice: false, push: true },
    //   templates: []
    // },
    // { 
    //   id: '7', 
    //   name: 'Prescription Notices', 
    //   description: 'Prescription ready and refill reminders',
    //   category: 'Clinical',
    //   enabled: true,
    //   methods: { email: true, sms: true, voice: true, push: true },
    //   templates: []
    // },
    { 
      id: '8', 
      name: 'Recall Reminders', 
      description: 'Preventive care and wellness reminders',
      category: 'Clinical',
      enabled: true,
      methods: { email: true, sms: true, voice: false, push: true },
      templates: [
        {
          id: 'recall-1',
          name: 'Annual Wellness Visit Due',
          trigger: 'Care Gap Identified',
          deliveryTime: 'real-time',
          message: 'Hi {{patient_name}}, you are due for your annual wellness exam. Please call {{practice_phone}} to schedule.',
          methods: { email: true, sms: true, voice: false, push: true },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        },
        {
          id: 'recall-2',
          name: 'Preventive Screening Due',
          trigger: 'Care Gap Identified',
          deliveryTime: 'real-time',
          message: 'Hi {{patient_name}}, you are due for {{screening_type}}. Please call {{practice_phone}} to schedule.',
          methods: { email: true, sms: false, voice: false, push: false },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        }
      ]
    },
    // Phase 2 - Hidden for Phase 1 rollout
    // { 
    //   id: '9', 
    //   name: 'Survey Invites', 
    //   description: 'Patient satisfaction and feedback requests',
    //   category: 'Engagement',
    //   enabled: false,
    //   methods: { email: true, sms: true, voice: false, push: false },
    //   templates: []
    // },
    // { 
    //   id: '10', 
    //   name: 'Payment Plan Notices', 
    //   description: 'Payment reminders and billing notifications',
    //   category: 'Billing',
    //   enabled: true,
    //   methods: { email: true, sms: true, voice: true, push: false },
    //   templates: []
    // },
    { 
      id: '11', 
      name: 'Financial Updates', 
      description: 'Real-time account balance and payment notifications',
      category: 'Billing',
      enabled: true,
      methods: { email: true, sms: true, voice: false, push: true },
      templates: [
        {
          id: 'financial-1',
          name: 'Payment Received Confirmation',
          trigger: 'Payment Processed',
          deliveryTime: 'real-time',
          message: 'Thank you for your payment of ${{payment_amount}} received on {{payment_date}}. Your new account balance is ${{current_balance}}. Questions? Call {{billing_phone}} or visit {{portal_url}}.',
          methods: { email: true, sms: true, voice: false, push: true },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        },
        {
          id: 'financial-2',
          name: 'New Balance Statement',
          trigger: 'Statement Generated',
          deliveryTime: 'real-time',
          message: 'Your recent visit resulted in a balance of ${{balance_amount}}. View your statement in the patient portal or call our billing department at {{billing_phone}} for payment options.',
          methods: { email: true, sms: false, voice: false, push: false },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        }
      ]
    },
    { 
      id: '12', 
      name: 'Clinical Updates', 
      description: 'New health data (e.g., lab results, diagnostic imaging reports)',
      category: 'Clinical',
      enabled: true,
      methods: { email: true, sms: true, voice: false, push: true },
      templates: [
        {
          id: 'clinical-1',
          name: 'Lab Results Available',
          trigger: 'Results Released',
          deliveryTime: 'real-time',
          message: 'Your recent lab results from {{test_date}} are now available in your patient portal. Please log in to review them. If you have questions, contact Dr. {{provider_name}} at {{practice_phone}}.',
          methods: { email: true, sms: true, voice: false, push: true },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        },
        {
          id: 'clinical-2',
          name: 'Imaging Report Ready',
          trigger: 'Results Released',
          deliveryTime: 'real-time',
          message: 'Your {{imaging_type}} results are ready for review in your patient portal. Your provider will discuss these with you at your next visit or may contact you sooner if needed.',
          methods: { email: true, sms: false, voice: false, push: true },
          conditions: {
            apptTypes: [],
            reasons: [],
            providers: [],
            locations: []
          }
        }
      ]
    },
  ]);

  const [selectedNotice, setSelectedNotice] = useState<NoticeType | null>(notices[0]);

  // Log initial notices state
  console.log('=== PATIENT NOTICES DEBUG ===');
  console.log('Total notices:', notices.length);
  console.log('No Show notice:', notices.find(n => n.id === '5'));
  console.log('Recall Reminders notice:', notices.find(n => n.id === '8'));
  console.log('Selected notice:', selectedNotice);
  console.log('Selected notice templates:', selectedNotice?.templates);
  console.log('=== END DEBUG ===');

  // Multi-select filter states
  const [selectedApptTypes, setSelectedApptTypes] = useState<string[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Mock data for large lists
  const appointmentTypes = [
    { value: 'new-patient', label: 'New Patient Visit' },
    { value: 'follow-up', label: 'Follow-up Appointment' },
    { value: 'wellness', label: 'Wellness Check' },
    { value: 'physical', label: 'Annual Physical' },
    { value: 'procedure', label: 'Procedure' },
    { value: 'surgery-consult', label: 'Surgery Consultation' },
    { value: 'post-op', label: 'Post-Operative Visit' },
    { value: 'pre-op', label: 'Pre-Operative Visit' },
    { value: 'lab-work', label: 'Lab Work' },
    { value: 'imaging', label: 'Imaging/Radiology' },
    { value: 'therapy', label: 'Physical Therapy' },
    { value: 'counseling', label: 'Mental Health Counseling' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'screening', label: 'Health Screening' },
    { value: 'specialty-consult', label: 'Specialty Consultation' },
    { value: 'telemedicine', label: 'Telemedicine Visit' },
    { value: 'urgent', label: 'Urgent Care' },
    { value: 'pediatric', label: 'Pediatric Visit' },
    { value: 'geriatric', label: 'Geriatric Care' },
    { value: 'maternity', label: 'Maternity Visit' },
    { value: 'dental', label: 'Dental Exam' },
    { value: 'vision', label: 'Vision Exam' },
    { value: 'hearing', label: 'Hearing Test' },
    { value: 'nutrition', label: 'Nutrition Counseling' },
    { value: 'diabetes', label: 'Diabetes Management' },
    { value: 'cardiac', label: 'Cardiac Care' },
    { value: 'pulmonary', label: 'Pulmonary Care' },
    { value: 'ortho', label: 'Orthopedic Visit' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'allergy', label: 'Allergy Testing' },
    { value: 'pain-mgmt', label: 'Pain Management' },
    { value: 'wound-care', label: 'Wound Care' },
    { value: 'infusion', label: 'Infusion Therapy' },
    { value: 'sleep-study', label: 'Sleep Study' },
    { value: 'stress-test', label: 'Stress Test' },
    { value: 'ekg', label: 'EKG' },
    { value: 'ultrasound', label: 'Ultrasound' },
    { value: 'ct-scan', label: 'CT Scan' },
    { value: 'mri', label: 'MRI' },
    { value: 'xray', label: 'X-Ray' },
  ];

  const providers = Array.from({ length: 50 }, (_, i) => ({
    value: `provider-${i + 1}`,
    label: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'][i % 10]} ${['A', 'B', 'C', 'D', 'E'][Math.floor(i / 10)]}`,
  }));

  const locations = [
    { value: 'main-campus', label: 'Main Campus Medical Center' },
    { value: 'north-clinic', label: 'North Clinic' },
    { value: 'south-clinic', label: 'South Clinic' },
    { value: 'east-clinic', label: 'East Side Clinic' },
    { value: 'west-clinic', label: 'West End Clinic' },
    { value: 'downtown', label: 'Downtown Health Center' },
    { value: 'suburban', label: 'Suburban Family Practice' },
    { value: 'pediatric-center', label: 'Pediatric Care Center' },
    { value: 'womens-health', label: "Women's Health Center" },
    { value: 'cardiac-center', label: 'Cardiac Care Center' },
    { value: 'cancer-center', label: 'Cancer Treatment Center' },
    { value: 'urgent-care-main', label: 'Urgent Care - Main' },
    { value: 'urgent-care-north', label: 'Urgent Care - North' },
    { value: 'urgent-care-south', label: 'Urgent Care - South' },
    { value: 'imaging-center', label: 'Diagnostic Imaging Center' },
    { value: 'surgical-center', label: 'Outpatient Surgical Center' },
    { value: 'rehab-center', label: 'Rehabilitation Center' },
    { value: 'senior-care', label: 'Senior Care Facility' },
    { value: 'community-health', label: 'Community Health Center' },
    { value: 'mobile-clinic', label: 'Mobile Clinic' },
  ];

  const reasons = [
    { value: 'checkup', label: 'Annual Checkup' },
    { value: 'sick-visit', label: 'Sick Visit' },
    { value: 'lab-results', label: 'Lab Results Review' },
    { value: 'med-refill', label: 'Medication Refill' },
    { value: 'consultation', label: 'General Consultation' },
    { value: 'injury', label: 'Injury Follow-up' },
    { value: 'chronic-disease', label: 'Chronic Disease Management' },
    { value: 'preventive', label: 'Preventive Care' },
    { value: 'symptoms', label: 'New Symptoms' },
    { value: 'second-opinion', label: 'Second Opinion' },
    { value: 'test-results', label: 'Test Results Discussion' },
    { value: 'treatment-plan', label: 'Treatment Plan Review' },
    { value: 'post-hospital', label: 'Post-Hospital Follow-up' },
    { value: 'referral', label: 'Specialist Referral' },
    { value: 'family-history', label: 'Family History Screening' },
  ];

  const toggleNoticeEnabled = (id: string) => {
    const updatedNotices = notices.map(notice => 
      notice.id === id ? { ...notice, enabled: !notice.enabled } : notice
    );
    setNotices(updatedNotices);
    
    // Update selectedNotice if it's the one being toggled
    if (selectedNotice?.id === id) {
      setSelectedNotice({ ...selectedNotice, enabled: !selectedNotice.enabled });
    }
  };

  const toggleMethod = (id: string, method: CommunicationMethod) => {
    setNotices(notices.map(notice => 
      notice.id === id 
        ? { ...notice, methods: { ...notice.methods, [method]: !notice.methods[method] } }
        : notice
    ));
  };

  const openConfigure = (notice: NoticeType) => {
    setSelectedNotice(notice);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Appointments': return 'bg-blue-100 text-blue-700';
      case 'Broadcasts': return 'bg-purple-100 text-purple-700';
      case 'Engagement': return 'bg-green-100 text-green-700';
      case 'Clinical': return 'bg-orange-100 text-orange-700';
      case 'Billing': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const groupedNotices = notices.reduce((acc, notice) => {
    if (!acc[notice.category]) {
      acc[notice.category] = [];
    }
    acc[notice.category].push(notice);
    return acc;
  }, {} as Record<string, NoticeType[]>);

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Left Sidebar Navigation */}
      <div className="w-72 border-r">
        <div className="p-3 border-b">
          <h3 className="text-sm">Notice Types</h3>
          <p className="text-xs text-gray-500 mt-1">Select a notice to manage templates</p>
        </div>
        
        <ScrollArea className="h-[calc(100%-5rem)]">
          <div className="p-2">
            {Object.entries(groupedNotices).map(([category, categoryNotices]) => (
              <div key={category} className="mb-3">
                <div className="px-2 py-0.5 mb-1">
                  <Badge className={`${getCategoryColor(category)} text-xs`}>
                    {category}
                  </Badge>
                </div>
                <div className="space-y-0.5">
                  {categoryNotices.map((notice) => (
                    <button
                      key={notice.id}
                      onClick={() => setSelectedNotice(notice)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedNotice?.id === notice.id
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex-1">{notice.name}</span>
                        <div className="flex items-center gap-2">
                          {notice.templates && notice.templates.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {notice.templates.length}
                            </Badge>
                          )}
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${notice.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notice.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {selectedNotice ? (
          <div className="p-6 space-y-6">
            {/* Notice Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2>{selectedNotice.name}</h2>
                    <Badge className={getCategoryColor(selectedNotice.category)}>
                      {selectedNotice.category}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1">{selectedNotice.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Enabled</Label>
                  <Switch 
                    checked={selectedNotice.enabled}
                    onCheckedChange={() => toggleNoticeEnabled(selectedNotice.id)}
                  />
                </div>
              </div>
            </div>

            {/* Template Manager */}
            <div className="border-t pt-6">
              <NoticeTemplateManager
                noticeId={selectedNotice.id}
                noticeName={selectedNotice.name}
                templates={selectedNotice.templates || []}
                appointmentTypes={appointmentTypes}
                reasons={reasons}
                providers={providers}
                locations={locations}
                onSave={(templates) => {
                  setNotices(notices.map(n => 
                    n.id === selectedNotice.id 
                      ? { ...n, templates }
                      : n
                  ));
                  // Update selected notice to reflect new templates
                  setSelectedNotice({ ...selectedNotice, templates });
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Select a notice type to manage templates</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}