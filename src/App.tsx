import React, { useState } from 'react';
import { Section } from './types/section';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Breadcrumb } from './components/Breadcrumb';
import { OrganizationAccess } from './components/OrganizationAccess';
import { DisclaimersConsent } from './components/DisclaimersConsent';
import { AIResponses } from './components/AIResponses';
import { KnowledgeSources } from './components/KnowledgeSources';
import { TenantKnowledgeHub } from './components/TenantKnowledgeHub';
import { StaffResponseNotifications } from './components/StaffResponseNotifications';
import { NoticeHistory } from './components/NoticeHistory';
import { RegistrationManagement } from './components/RegistrationManagement';
import { PatientOnboarding } from './components/PatientOnboarding';
import { PatientAppDemo } from './components/PatientAppDemo';
import { AuditLogs } from './components/AuditLogs';
import { AIAssistantReplies } from './components/AIAssistantReplies';
import { LexiconsRouting } from './components/LexiconsRouting';
import { FHIRDemo } from './components/FHIRDemo';
import { FHIRMobileChatDemo } from './components/FHIRMobileChatDemo';
import { SummarizationDemo } from './components/SummarizationDemo';
import { StaffPracticeDemo } from './components/StaffPracticeDemo';
import { PatientCommunicationDemo } from './components/PatientCommunicationDemo';
import { AppointmentReminderDemo } from './components/AppointmentReminderDemo';
import { DemoHub } from './components/DemoHub';
import { AdminComponentLibraryShowcase } from './components/AdminComponentLibrary';
import { FHIRFormBuilder } from './components/FHIRFormBuilder';
import { FormTemplatesDashboard } from './components/FormTemplatesDashboard';
import { PatientToDoChecklist } from './components/PatientToDoChecklist';
import { FHIRDataFlowDiagram } from './components/FHIRDataFlowDiagram';
import { ChartDataSourceDemo } from './components/ChartDataSourceDemo';
import { ChecklistBuilderGuide } from './components/ChecklistBuilderGuide';
import { Toaster } from 'sonner';
import { AdminLogin, AdminSession } from './components/AdminLogin';
import { LogOut } from 'lucide-react';
import { projectId, publicAnonKey } from './utils/supabase/info.tsx';
import { mockLogout } from './utils/mockAuth';

const USE_MOCK_AUTH = true; // Set to false when backend is ready

export default function App() {
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [showChecklistBuilder, setShowChecklistBuilder] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle opening form builder
  const handleCreateNew = () => {
    setEditingFormId(null);
    setShowFormBuilder(true);
    setShowChecklistBuilder(false);
  };

  const handleCreateChecklist = () => {
    setEditingFormId(null);
    setShowFormBuilder(false);
    setShowChecklistBuilder(true);
  };

  const handleEditForm = (id: string) => {
    setEditingFormId(id);
    // Check if it's a checklist or form/consent
    if (id.startsWith('checklist-')) {
      setShowChecklistBuilder(true);
      setShowFormBuilder(false);
    } else {
      setShowFormBuilder(true);
      setShowChecklistBuilder(false);
    }
  };

  const handleLoginSuccess = (newSession: AdminSession) => {
    setSession(newSession);
    console.log('✅ Login successful:', newSession.email, 'Tenant:', newSession.tenantId);
  };

  // Helper to get section display name
  const getSectionName = (section: Section | null): string => {
    if (!section) return '';
    const nameMap: Record<Section, string> = {
      'organization': 'Organization & Access',
      'disclaimers': 'Disclaimers & Consent',
      'ai-responses': 'AI Responses',
      'knowledge': 'Knowledge Sources',
      'tenant-knowledge-hub': 'Knowledge Hub',
      'staff-notifications': 'Staff Response Notifications',
      'notice-history': 'Communications',
      'registration': 'Registration Management',
      'patient-onboarding': 'Patient Onboarding',
      'audit': 'Audit Logs',
      'ai-assistant': 'AI Assistant',
      'ai-assistant-replies': 'AI Assistant Replies',
      'lexicons-routing': 'Lexicons & Routing',
      'demo-hub': 'Demo Hub',
      'patient-demo': 'Patient Demo',
      'staff-demo': 'Staff Demo',
      'fhir-demo': 'FHIR Demo',
      'fhir-mobile-chat': 'FHIR Mobile Chat',
      'patient-communication-demo': 'Patient Communication',
      'appointment-reminder': 'Appointment Reminder',
      'summarization-demo': 'Summarization Demo',
      'forms-checklist': 'Forms & Checklist',
      'component-library': 'Component Library',
      'fhir-form-builder': 'FHIR Form Builder',
      'form-templates': 'Form Templates',
      'patient-todo': 'Patient To-Do',
      'fhir-data-flow': 'FHIR Data Flow',
      'chart-data-source': 'Chart Data Source'
    };
    return nameMap[section] || section;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (USE_MOCK_AUTH) {
        // Use mock logout
        await mockLogout();
        localStorage.removeItem('admin_session_token');
        setSession(null);
        console.log('✅ Mock logout successful');
      } else {
        // Real backend logout
        const sessionToken = localStorage.getItem('admin_session_token');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/auth/logout`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Session-Token': sessionToken || ''
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          localStorage.removeItem('admin_session_token');
          setSession(null);
          
          console.log('✅ Logged out successfully');
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if request fails, clear local state
      localStorage.removeItem('admin_session_token');
      setSession(null);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // If not logged in, show login screen
  if (!session) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Admin Header with User Info */}
        <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-600">Signed in as</p>
              <p className="font-medium text-gray-900">{session.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
        
        {/* Main Content */}
        {showFormBuilder && activeSection === 'form-templates' ? (
          <FHIRFormBuilder />
        ) : showChecklistBuilder && activeSection === 'form-templates' ? (
          <PatientToDoChecklist />
        ) : activeSection === 'demo-hub' ? (
          <div className="max-w-7xl mx-auto p-8">
            <DemoHub />
          </div>
        ) : !activeSection ? (
          <Dashboard onSectionChange={setActiveSection} />
        ) : (
          <div className="max-w-7xl mx-auto p-8">
            <Breadcrumb 
              currentPage={getSectionName(activeSection)} 
              onHomeClick={() => setActiveSection(null)} 
            />
            {activeSection === 'organization' && <OrganizationAccess />}
            {activeSection === 'disclaimers' && <DisclaimersConsent />}
            {activeSection === 'ai-responses' && <AIResponses />}
            {activeSection === 'knowledge' && <KnowledgeSources />}
            {activeSection === 'tenant-knowledge-hub' && <TenantKnowledgeHub />}
            {activeSection === 'staff-notifications' && <StaffResponseNotifications />}
            {activeSection === 'notice-history' && <NoticeHistory />}
            {activeSection === 'registration' && <RegistrationManagement />}
            {activeSection === 'patient-onboarding' && <PatientOnboarding />}
            {activeSection === 'audit' && <AuditLogs />}
            {activeSection === 'ai-assistant-replies' && <AIAssistantReplies />}
            {activeSection === 'lexicons-routing' && <LexiconsRouting />}
            {activeSection === 'component-library' && <AdminComponentLibraryShowcase />}
            {activeSection === 'patient-todo' && <PatientToDoChecklist />}
            {activeSection === 'fhir-data-flow' && <FHIRDataFlowDiagram />}
            {activeSection === 'chart-data-source' && <ChartDataSourceDemo />}
            {activeSection === 'form-templates' && (
              <FormTemplatesDashboard 
                onCreateNew={handleCreateNew}
                onCreateChecklist={handleCreateChecklist}
                onEdit={handleEditForm}
              />
            )}
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}