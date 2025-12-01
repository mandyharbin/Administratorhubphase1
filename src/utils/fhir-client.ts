// FHIR Client for fetching healthcare data
import { projectId, publicAnonKey } from './supabase/info';

interface FHIRAppointment {
  resourceType: 'Appointment';
  id: string;
  status: string;
  start: string;
  end: string;
  participant: Array<{
    actor: {
      reference: string;
      display: string;
    };
    status: string;
  }>;
  description?: string;
  appointmentType?: {
    coding: Array<{
      code: string;
      display: string;
    }>;
  };
}

interface FHIRBundle {
  resourceType: 'Bundle';
  type: string;
  entry?: Array<{
    resource: FHIRAppointment;
  }>;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  provider: string;
  location: string;
  type: string;
  status: string;
}

export async function getNextAppointment(patientId: string, accessToken: string): Promise<Appointment[]> {
  try {
    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0`;
    const today = new Date().toISOString().split('T')[0];
    
    const response = await fetch(
      `${serverUrl}/fhir/Appointment?patient=${patientId}&date=ge${today}&_sort=date`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('FHIR API error:', response.status, await response.text());
      return [];
    }

    const data: FHIRBundle = await response.json();
    
    if (!data.entry || data.entry.length === 0) {
      return [];
    }

    // Map FHIR Appointment structure to app appointment objects
    return data.entry.map(entry => {
      const resource = entry.resource;
      const startDate = new Date(resource.start);
      
      // Find practitioner from participants
      const practitioner = resource.participant.find(p => 
        p.actor.reference.startsWith('Practitioner/')
      );
      
      // Find location from participants
      const locationParticipant = resource.participant.find(p => 
        p.actor.reference.startsWith('Location/')
      );

      return {
        id: resource.id,
        date: startDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        time: startDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        provider: practitioner?.actor.display || 'Provider',
        location: locationParticipant?.actor.display || 'Main Office',
        type: resource.appointmentType?.coding?.[0]?.display || 'Appointment',
        status: resource.status
      };
    });
  } catch (error) {
    console.error('Error fetching appointments from FHIR:', error);
    return [];
  }
}

export function renderAppointmentInfo(appointments: Appointment[]): string {
  if (!appointments || appointments.length === 0) {
    return "I don't see any upcoming appointments scheduled for you. Would you like me to help you schedule one?";
  }

  if (appointments.length === 1) {
    const appt = appointments[0];
    return `Your next appointment is on ${appt.date} at ${appt.time} with ${appt.provider} at ${appt.location}.\n\nThis is a ${appt.type}. Please arrive 15 minutes early to complete any necessary paperwork.\n\nIf you need to make changes to this appointment, please call our office at (555) 123-4567.`;
  }

  // Multiple appointments
  let response = `You have ${appointments.length} upcoming appointments:\n\n`;
  appointments.slice(0, 3).forEach((appt, index) => {
    response += `${index + 1}. ${appt.date} at ${appt.time}\n   ${appt.type} with ${appt.provider}\n   Location: ${appt.location}\n\n`;
  });

  if (appointments.length > 3) {
    response += `...and ${appointments.length - 3} more.\n\n`;
  }

  response += "If you need to make changes to any appointment, please call our office at (555) 123-4567.";
  
  return response;
}
