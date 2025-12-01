import { useState } from 'react';
import { HubSpotTopBar } from './HubSpotTopBar';
import { ModernVerticalNav } from './ModernVerticalNav';
import { ClinicalAppointmentsView } from './ClinicalAppointmentsView';
import { TasksContent } from './TasksContent';
import { PatientSearch2View } from './PatientSearch2View';
import { PatientChartView } from './PatientChartView';
import { toast } from 'sonner@2.0.3';

type ClinicalTab = 'appointments' | 'patients' | 'tasks' | 'settings';

interface ClinicalUserPortalProps {
  userName: string;
  userInitials: string;
  onUserClick: () => void;
  routedTasks?: any[];
  initialTab?: ClinicalTab;
}

export function ClinicalUserPortal({
  userName,
  userInitials,
  onUserClick,
  routedTasks = [],
  initialTab = 'appointments'
}: ClinicalUserPortalProps) {
  const [activeTab, setActiveTab] = useState<ClinicalTab>(initialTab);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [patientChartData, setPatientChartData] = useState<any>({});
  const [selectedPatient, setSelectedPatient] = useState<{ name: string; id: string } | null>(null);

  const handleAcceptChartData = (patientName: string, acceptedData: any) => {
    setPatientChartData(prev => ({
      ...prev,
      [patientName]: {
        ...(prev[patientName] || {}),
        ...acceptedData,
        lastUpdated: new Date().toISOString()
      }
    }));
    toast.success(`Chart updated for ${patientName}`);
  };

  const handlePatientClick = (patientName: string, patientId: string) => {
    setSelectedPatient({ name: patientName, id: patientId });
  };

  const handleBackFromChart = () => {
    setSelectedPatient(null);
  };

  // If a patient is selected, show their chart view
  if (selectedPatient) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <HubSpotTopBar userName={userName} userInitials={userInitials} onUserClick={onUserClick} />
        <div className="flex-1 overflow-hidden">
          <PatientChartView
            patientName={selectedPatient.name}
            patientId={selectedPatient.id}
            chartData={patientChartData[selectedPatient.name]}
            onBack={handleBackFromChart}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <HubSpotTopBar userName={userName} userInitials={userInitials} onUserClick={onUserClick} />

      {/* Vertical Navigation */}
      <ModernVerticalNav
        currentView={activeTab}
        onNavigateToAppointments={() => setActiveTab('appointments')}
        onNavigateToPatients={() => setActiveTab('patients')}
        onNavigateToTasks={() => setActiveTab('tasks')}
        onNavigateToSettings={() => setActiveTab('settings')}
        onCollapseChange={setIsNavCollapsed}
      />

      {/* Main Content */}
      <div 
        className="flex-1 overflow-y-auto"
        style={{
          marginLeft: isNavCollapsed ? '72px' : '240px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        {activeTab === 'appointments' && (
          <div className="p-6">
            <ClinicalAppointmentsView />
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="p-6">
            <PatientSearch2View
              onPatientClick={handlePatientClick}
              onStartVisit={(patient) => toast.success(`Starting visit for ${patient.name}`)}
              onAcceptChartData={handleAcceptChartData}
            />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="p-6">
            <div className="max-w-[1600px] mx-auto">
              <TasksContent 
                routedTasks={routedTasks} 
                onAcceptChartData={handleAcceptChartData}
              />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl mb-4">Settings</h1>
              <p className="text-gray-600">Settings page coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}