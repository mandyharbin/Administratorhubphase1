import { useEffect, useState } from "react";
import { PatientSearch2View, type Patient } from "./PatientSearch2View";
import { Toaster } from "./ui/sonner";

export function ClinicalStaffApp() {
  const [currentView, setCurrentView] = useState<'patients'>('patients');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const handlePatientClick = (patientName: string) => {
    // For Susan Williams, show her details
    if (patientName.includes('Williams, Susan')) {
      alert(`Susan Williams' chart would open here. In the full implementation, this would show her facesheet/chart view.`);
      setSelectedPatient(patientName);
    } else {
      alert(`Patient chart for ${patientName} is not available in this demo.`);
    }
  };

  const handleNavigateToAppointments = () => {
    // Handle navigation
  };

  const handleNavigateToPatients = () => {
    setCurrentView('patients');
  };

  const handleNavigateToTasks = () => {
    // Handle navigation
  };

  const handleStartVisit = (patient: Patient) => {
    alert(`Starting visit for ${patient.name}`);
  };

  return (
    <div className="size-full overflow-auto">
      <Toaster 
        toastOptions={{
          style: {
            background: '#007cbe',
            color: 'white',
            border: 'none',
          },
        }}
      />
      {currentView === 'patients' && (
        <PatientSearch2View 
          onNavigateToAppointments={handleNavigateToAppointments}
          onNavigateToPatients={handleNavigateToPatients}
          onNavigateToTasks={handleNavigateToTasks}
          onPatientClick={handlePatientClick}
          onStartVisit={handleStartVisit}
        />
      )}
    </div>
  );
}
