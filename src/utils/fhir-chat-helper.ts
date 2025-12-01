import { fetchPatient, fetchMedications, fetchConditions, fetchAllergies, fetchAppointments, fetchObservations } from '../api/fhir';

export interface FHIREnhancedResponse {
  response: string;
  shouldRoute?: boolean;
  detectedIntent?: string;
  fhirData?: {
    medications?: any[];
    conditions?: any[];
    allergies?: any[];
    appointments?: any[];
    labs?: any[];
  };
}

/**
 * Generate FHIR-enhanced response for common patient queries
 */
export async function generateFHIREnhancedResponse(
  userMessage: string,
  patientId: string
): Promise<FHIREnhancedResponse> {
  const messageLower = userMessage.toLowerCase();
  const response: FHIREnhancedResponse = { response: '' };
  
  try {
    // Medications query
    if (messageLower.includes('medication') || messageLower.includes('prescription') || messageLower.includes('drug') || messageLower.includes('pill')) {
      const medData = await fetchMedications(patientId);
      const medications = medData?.entry || [];
      
      if (medications.length > 0) {
        response.fhirData = { medications };
        const medList = medications.slice(0, 3).map((entry: any) => {
          const med = entry.resource;
          return med.medicationCodeableConcept?.coding?.[0]?.display || 
                 med.medicationCodeableConcept?.text || 
                 'Unknown medication';
        });
        
        response.response = `Based on your medical record, you're currently taking:\n\n${medList.map((m, i) => `${i + 1}. ${m}`).join('\n')}${medications.length > 3 ? `\n\n...and ${medications.length - 3} more medications` : ''}.\n\nI've shown your current medications below. For refills or changes, I can connect you with our clinical team.`;
      } else {
        response.response = 'I don\'t see any active medications in your record right now. If you need to discuss medications or refills, I can connect you with our clinical team.';
      }
    }
    
    // Appointments query
    else if (messageLower.includes('appointment') || messageLower.includes('next visit') || messageLower.includes('when is my')) {
      const apptData = await fetchAppointments(patientId);
      const appointments = apptData?.entry || [];
      
      if (appointments.length > 0) {
        response.fhirData = { appointments };
        const nextAppt = appointments[0].resource;
        const date = nextAppt.start 
          ? new Date(nextAppt.start).toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric', 
              year: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit' 
            })
          : 'Unknown date';
        const provider = nextAppt.participant?.find((p: any) => p.actor?.display)?.actor?.display || 'your provider';
        
        response.response = `Your next appointment is on ${date} with ${provider}. ${appointments.length > 1 ? `You have ${appointments.length - 1} more upcoming appointment${appointments.length > 2 ? 's' : ''}.` : ''}\n\nNote: I can't reschedule or cancel appointments, but I can connect you with our scheduling team if you need to make changes.`;
      } else {
        response.response = 'I don\'t see any upcoming appointments in your schedule. Would you like me to connect you with our scheduling team to book an appointment?';
      }
    }
    
    // Conditions/medical history query
    else if (messageLower.includes('condition') || messageLower.includes('diagnosis') || messageLower.includes('medical history') || messageLower.includes('problem list')) {
      const condData = await fetchConditions(patientId);
      const conditions = condData?.entry || [];
      
      if (conditions.length > 0) {
        response.fhirData = { conditions };
        const condList = conditions.slice(0, 3).map((entry: any) => {
          const cond = entry.resource;
          return cond.code?.coding?.[0]?.display || cond.code?.text || 'Unknown condition';
        });
        
        response.response = `Based on your medical record, your active conditions include:\n\n${condList.map((c, i) => `${i + 1}. ${c}`).join('\n')}${conditions.length > 3 ? `\n\n...and ${conditions.length - 3} more conditions` : ''}.\n\nI've shown your active conditions below. For questions about your medical history or treatment plans, I can connect you with your care team.`;
      } else {
        response.response = 'I don\'t see any active conditions listed in your medical record. If you have questions about your health, I can connect you with your care team.';
      }
    }
    
    // Allergies query
    else if (messageLower.includes('allerg') || messageLower.includes('reaction')) {
      const allergyData = await fetchAllergies(patientId);
      const allergies = allergyData?.entry || [];
      
      if (allergies.length > 0) {
        response.fhirData = { allergies };
        const allergyList = allergies.map((entry: any) => {
          const allergy = entry.resource;
          const substance = allergy.code?.coding?.[0]?.display || allergy.code?.text || 'Unknown allergen';
          const reaction = allergy.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display || '';
          return reaction ? `${substance} (${reaction})` : substance;
        });
        
        response.response = `According to your medical record, you have the following documented allergies:\n\n${allergyList.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nPlease make sure to inform your care team if you experience any new reactions.`;
      } else {
        response.response = 'I don\'t see any documented allergies in your medical record. If you have allergies that should be added, please let your care team know.';
      }
    }
    
    // Lab results query
    else if (messageLower.includes('lab') || messageLower.includes('test result') || messageLower.includes('blood work')) {
      const labData = await fetchObservations(patientId);
      const labs = labData?.entry || [];
      
      if (labs.length > 0) {
        response.fhirData = { labs };
        response.response = `I can see you have recent lab results in your medical record. However, for patient safety, I need to connect you with a clinical staff member who can review and explain the results with you in detail. They'll reach out shortly.`;
      } else {
        response.response = 'I don\'t see any recent lab results in your record. If you\'re expecting results, I can connect you with our clinical team to check on the status.';
      }
    }
    
    // ROUTING: Schedule/Reschedule/Cancel appointment - Route to staff
    else if (messageLower.includes('schedule') && !messageLower.includes('next') && !messageLower.includes('upcoming') || 
             messageLower.includes('book') && messageLower.includes('appointment') ||
             messageLower.includes('cancel') && messageLower.includes('appointment') || 
             messageLower.includes('reschedule')) {
      response.response = 'I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat. Would you like me to send now?';
      response.shouldRoute = true;
      response.detectedIntent = 'appointment_scheduling';
    }
    
    // ROUTING: Medical symptoms or concerns - Route to staff
    else if (messageLower.includes('symptom') || messageLower.includes('pain') || 
             messageLower.includes('fever') || messageLower.includes('sick') ||
             messageLower.includes('hurt') || messageLower.includes('ache') ||
             messageLower.includes('feel') && (messageLower.includes('bad') || messageLower.includes('worse')) ||
             messageLower.includes('medical advice') || messageLower.includes('not feeling')) {
      response.response = 'I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat. Would you like me to send now?';
      response.shouldRoute = true;
      response.detectedIntent = 'medical_symptoms';
    }
    
    // Default - no FHIR data needed
    else {
      response.response = ''; // Will use standard AI response
    }
    
    return response;
    
  } catch (error) {
    console.error('[FHIR Helper] Error:', error);
    return { response: '' }; // Fall back to standard AI response
  }
}