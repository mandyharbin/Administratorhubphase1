import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { OrganizationAccess } from './components/OrganizationAccess';
import { DisclaimersConsent } from './components/DisclaimersConsent';
import { AIResponses } from './components/AIResponses';
import { KnowledgeSources } from './components/KnowledgeSources';
import { TenantKnowledgeHub } from './components/TenantKnowledgeHub';
import { NoticeHistory } from './components/NoticeHistory';
import { StaffResponseNotifications } from './components/StaffResponseNotifications';
import { RegistrationManagement } from './components/RegistrationManagement';
import { PatientAppDemo } from './components/PatientAppDemo';
import { StaffPracticeDemo } from './components/StaffPracticeDemo';
import { PatientOnboarding } from './components/PatientOnboarding';
import { AuditLogs } from './components/AuditLogs';
import { AIAssistantReplies } from './components/AIAssistantReplies';
import { LexiconsRouting } from './components/LexiconsRouting';

export type Section = 
  | 'organization'
  | 'disclaimers'
  | 'ai-responses'
  | 'knowledge'
  | 'tenant-knowledge-hub'
  | 'staff-notifications'
  | 'notice-history'
  | 'registration'
  | 'patient-onboarding'
  | 'ai-assistant'
  | 'ai-assistant-replies'
  | 'lexicons-routing'
  | 'patient-demo'
  | 'staff-demo'
  | 'audit';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('organization');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 overflow-y-auto">
        {activeSection === 'staff-demo' ? (
          <StaffPracticeDemo />
        ) : activeSection === 'ai-assistant' ? (
          <PatientAppDemo initialScreen="disclaimer" />
        ) : (
          <div className="max-w-7xl mx-auto p-8">
            {activeSection === 'organization' && <OrganizationAccess />}
            {activeSection === 'disclaimers' && <DisclaimersConsent />}
            {activeSection === 'ai-responses' && <AIResponses />}
            {activeSection === 'knowledge' && <KnowledgeSources />}
            {activeSection === 'tenant-knowledge-hub' && <TenantKnowledgeHub />}
            {activeSection === 'staff-notifications' && <StaffResponseNotifications />}
            {activeSection === 'notice-history' && <NoticeHistory />}
            {activeSection === 'registration' && <RegistrationManagement />}
            {activeSection === 'patient-onboarding' && <PatientOnboarding />}
            {activeSection === 'patient-demo' && <PatientAppDemo />}
            {activeSection === 'audit' && <AuditLogs />}
            {activeSection === 'ai-assistant-replies' && <AIAssistantReplies />}
            {activeSection === 'lexicons-routing' && <LexiconsRouting />}
          </div>
        )}
      </main>
    </div>
  );
}