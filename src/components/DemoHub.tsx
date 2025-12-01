import { useState } from 'react';
import { Bot, Smartphone, Monitor, Database, MessageCircle, Calendar, Sparkles, ChevronRight, Shield, Watch, DollarSign, GitCompare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { PatientAppDemo } from './PatientAppDemo';
import { UnifiedStaffPortal } from './UnifiedStaffPortal';
import { FHIRDemo } from './FHIRDemo';
import { FHIRMobileChatDemo } from './FHIRMobileChatDemo';
import { AppointmentReminderDemo } from './AppointmentReminderDemo';
import { SummarizationDemo } from './SummarizationDemo';
import { OTPMigrationDemo } from './OTPMigrationDemo';
import { WearableIntegrationDemo } from './WearableIntegrationDemo';
import { BillingIntegrationDemo } from './BillingIntegrationDemo';
import { InfoBanner } from './InfoBanner';

type DemoTab = 
  | 'overview'
  | 'ai-assistant' 
  | 'patient-demo' 
  | 'staff-portal' 
  | 'fhir-demo' 
  | 'fhir-mobile-chat'
  | 'appointment-reminder'
  | 'summarization-demo'
  | 'otp-migration'
  | 'wearable-integration'
  | 'billing-integration';

interface DemoCard {
  id: DemoTab;
  title: string;
  description: string;
  icon: any;
  badge?: string;
  features: string[];
}

const demoCards: DemoCard[] = [
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Patient-facing AI chatbot with knowledge base integration and secure messaging',
    icon: Bot,
    badge: 'Patient Portal',
    features: [
      'Pre-chat disclaimers',
      'AI-powered responses',
      'Staff escalation',
      'Secure messaging'
    ]
  },
  {
    id: 'patient-demo',
    title: 'Patient App Demo',
    description: 'Complete patient mobile app experience with registration, QR code scanning, and MFA',
    icon: Smartphone,
    badge: 'Mobile',
    features: [
      'App download flow',
      'QR code scanning',
      'Patient matching',
      'MFA setup',
      'Account settings'
    ]
  },
  {
    id: 'staff-portal',
    title: 'Unified Staff Portal',
    description: 'Complete EHR view with message center, patient management, appointments, and tasks',
    icon: Monitor,
    badge: 'EHR Portal',
    features: [
      'Message center with AI summaries',
      'Patient queue management',
      'Secure staff messaging',
      'Appointment scheduling',
      'Task center with pre-visit forms'
    ]
  },
  {
    id: 'fhir-demo',
    title: 'FHIR Integration Demo',
    description: 'Live FHIR data integration with AWS HealthLake showing real patient medical records',
    icon: Database,
    badge: 'HealthLake',
    features: [
      'Real FHIR endpoints',
      '9 resource types',
      'Patient search',
      'Medical history',
      'Tabbed interface'
    ]
  },
  {
    id: 'fhir-mobile-chat',
    title: 'FHIR Mobile Chat Demo',
    description: 'EHR-style mobile chat with AI assistant, medical record queries, and image uploads',
    icon: Smartphone,
    badge: 'AI + FHIR',
    features: [
      'AI medical queries',
      'FHIR data cards',
      'Image uploads',
      'Chat summaries',
      'Insurance viewing'
    ]
  },
  {
    id: 'appointment-reminder',
    title: 'Appointment Reminder + Meds',
    description: 'Automated appointment reminders with pre-visit medication review and health status updates',
    icon: Calendar,
    badge: 'Pre-Visit',
    features: [
      'Appointment reminders',
      'Medication review',
      'Health status update',
      '7-step wizard',
      '13 FHIR resources'
    ]
  },
  {
    id: 'summarization-demo',
    title: 'AI Summarization Demo',
    description: 'Greenway AIRE Agent for AI-powered chat summarization and patient conversation analysis',
    icon: Sparkles,
    badge: 'AI Summarization',
    features: [
      'Chat summarization',
      'Conversation analysis',
      'Key points extraction',
      'Auto-generated summaries'
    ]
  },
  {
    id: 'otp-migration',
    title: 'Phone OTP Migration Flow',
    description: 'Complete phone verification and OTP flow with multi-platform screens, error states, and Greenway API integration',
    icon: Shield,
    badge: 'OTP Security',
    features: [
      '12 screens across 4 platforms',
      'SMS & Email verification',
      'Lockout & error handling',
      'Greenway OTP API integration',
      'TCPA compliance & consent'
    ]
  },
  {
    id: 'wearable-integration',
    title: 'Wearable Integration Demo',
    description: 'Connect wearable devices (HealthKit/Google Fit/Fitbit) with patient consent, sync management, and clinician EHR views',
    icon: Watch,
    badge: 'HealthKit + OAuth',
    features: [
      'HealthKit & Google Fit integration',
      'Vendor OAuth (Fitbit/Garmin)',
      'Consent & permission flows',
      'Device sync status & trends',
      'Clinician dashboard cards'
    ]
  },
  {
    id: 'billing-integration',
    title: 'Billing Integration Demo',
    description: 'Connect billing systems with patient consent, sync management, and clinician EHR views',
    icon: DollarSign,
    badge: 'Billing Integration',
    features: [
      'Billing system integration',
      'Vendor OAuth (Epic/MyFitnessPal)',
      'Consent & permission flows',
      'Billing sync status & trends',
      'Clinician dashboard cards'
    ]
  }
];

export function DemoHub() {
  const [activeDemo, setActiveDemo] = useState<DemoTab>('overview');

  if (activeDemo === 'overview') {
    return (
      <div className="space-y-6">
        <div>
          <h2>Demo Hub</h2>
          <p className="text-gray-600 mt-1">
            Explore all interactive demonstrations of the BASE Healthcare platform
          </p>
        </div>

        <InfoBanner 
          title="What is this section used for?"
          description="Access all interactive demonstrations showcasing the BASE Healthcare platform features including patient app flows, AI assistant interactions, staff portal, FHIR integrations, appointment reminders, OTP authentication, wearable data, and billing workflows."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {demoCards.map((demo) => {
            const Icon = demo.icon;
            return (
              <Card 
                key={demo.id}
                className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
                onClick={() => setActiveDemo(demo.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{demo.title}</CardTitle>
                        {demo.badge && (
                          <Badge variant="secondary" className="mt-1">
                            {demo.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <CardDescription className="mt-3">
                    {demo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Key Features:</div>
                    <ul className="space-y-1">
                      {demo.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm text-blue-900">
                <strong>Tip:</strong> Click any demo card above to explore interactive demonstrations of the BASE platform features.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Individual demo views
  const currentDemo = demoCards.find(d => d.id === activeDemo);
  
  // Full-screen demos that should not be wrapped in a container
  if (activeDemo === 'staff-portal') {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        {/* Breadcrumb navigation - fixed at top */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 text-sm bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-200">
          <button 
            onClick={() => setActiveDemo('overview')}
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            Demo Hub
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{currentDemo?.title}</span>
        </div>

        {/* Full-screen demo */}
        <UnifiedStaffPortal />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-sm">
        <button 
          onClick={() => setActiveDemo('overview')}
          className="text-blue-600 hover:text-blue-700 hover:underline"
        >
          Demo Hub
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-600">{currentDemo?.title}</span>
      </div>

      {/* Demo content */}
      <div>
        {activeDemo === 'ai-assistant' && <PatientAppDemo initialScreen="disclaimer" />}
        {activeDemo === 'patient-demo' && <PatientAppDemo />}
        {activeDemo === 'fhir-demo' && <FHIRDemo />}
        {activeDemo === 'fhir-mobile-chat' && <FHIRMobileChatDemo />}
        {activeDemo === 'appointment-reminder' && <AppointmentReminderDemo />}
        {activeDemo === 'summarization-demo' && <SummarizationDemo />}
        {activeDemo === 'otp-migration' && <OTPMigrationDemo />}
        {activeDemo === 'wearable-integration' && <WearableIntegrationDemo />}
        {activeDemo === 'billing-integration' && <BillingIntegrationDemo />}
      </div>
    </div>
  );
}