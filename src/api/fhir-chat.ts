import { projectId, publicAnonKey } from '../utils/supabase/info';
import { fetchPatient, fetchMedications, fetchConditions, fetchAllergies, fetchAppointments, fetchObservations } from './fhir';

const CHAT_TENANT_URL = `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/chat-tenant`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FHIRContext {
  patient?: any;
  medications?: any[];
  conditions?: any[];
  allergies?: any[];
  appointments?: any[];
  labs?: any[];
}

/**
 * Enhanced AI chat that queries FHIR data when relevant
 */
export async function sendFHIREnhancedMessage(
  message: string,
  patientId: string,
  conversationHistory: ChatMessage[] = []
): Promise<{ response: string; fhirData?: FHIRContext; shouldRoute?: boolean; detectedIntent?: string }> {
  try {
    // Detect if message is asking about medical data
    const messageLower = message.toLowerCase();
    const fhirContext: FHIRContext = {};
    
    // Fetch relevant FHIR data based on query
    const needsMedications = messageLower.includes('medication') || messageLower.includes('prescription') || messageLower.includes('drug') || messageLower.includes('pill');
    const needsConditions = messageLower.includes('condition') || messageLower.includes('diagnosis') || messageLower.includes('problem') || messageLower.includes('medical history');
    const needsAllergies = messageLower.includes('allerg') || messageLower.includes('reaction');
    const needsAppointments = messageLower.includes('appointment') || messageLower.includes('visit') || messageLower.includes('schedule');
    const needsLabs = messageLower.includes('lab') || messageLower.includes('test') || messageLower.includes('result') || messageLower.includes('blood work');
    
    console.log('[FHIR Chat] Detected query needs:', { needsMedications, needsConditions, needsAllergies, needsAppointments, needsLabs });
    
    // Fetch data in parallel
    const promises: Promise<any>[] = [];
    
    if (needsMedications) {
      promises.push(fetchMedications(patientId).then(data => ({ type: 'medications', data })));
    }
    if (needsConditions) {
      promises.push(fetchConditions(patientId).then(data => ({ type: 'conditions', data })));
    }
    if (needsAllergies) {
      promises.push(fetchAllergies(patientId).then(data => ({ type: 'allergies', data })));
    }
    if (needsAppointments) {
      promises.push(fetchAppointments(patientId).then(data => ({ type: 'appointments', data })));
    }
    if (needsLabs) {
      promises.push(fetchObservations(patientId).then(data => ({ type: 'labs', data })));
    }
    
    // Always fetch patient demographics
    promises.push(fetchPatient(patientId).then(data => ({ type: 'patient', data })));
    
    const results = await Promise.all(promises);
    
    // Organize FHIR data
    results.forEach(result => {
      if (result.type === 'patient') fhirContext.patient = result.data;
      else if (result.type === 'medications') fhirContext.medications = result.data?.entry || [];
      else if (result.type === 'conditions') fhirContext.conditions = result.data?.entry || [];
      else if (result.type === 'allergies') fhirContext.allergies = result.data?.entry || [];
      else if (result.type === 'appointments') fhirContext.appointments = result.data?.entry || [];
      else if (result.type === 'labs') fhirContext.labs = result.data?.entry || [];
    });
    
    console.log('[FHIR Chat] Fetched FHIR context:', fhirContext);
    
    // Build enhanced prompt with FHIR data
    let systemContext = buildFHIRSystemPrompt(fhirContext);
    
    // Call chat endpoint with FHIR context
    const response = await fetch(CHAT_TENANT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        fhirContext: systemContext,
        patientId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Chat API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      response: data.response || data.message || 'I apologize, but I encountered an error processing your request.',
      fhirData: fhirContext,
      shouldRoute: data.shouldRoute,
      detectedIntent: data.detectedIntent
    };
    
  } catch (error) {
    console.error('[FHIR Chat] Error:', error);
    throw error;
  }
}

/**
 * Build system prompt with FHIR data
 */
function buildFHIRSystemPrompt(context: FHIRContext): string {
  let prompt = 'You are an AI medical assistant. You have access to the following patient data:\n\n';
  
  // Patient demographics
  if (context.patient) {
    const patient = context.patient;
    const name = patient.name?.[0];
    const fullName = name ? `${name.given?.join(' ')} ${name.family}` : 'Patient';
    const dob = patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown';
    const age = patient.birthDate ? calculateAge(patient.birthDate) : 'Unknown';
    
    prompt += `PATIENT DEMOGRAPHICS:\n`;
    prompt += `- Name: ${fullName}\n`;
    prompt += `- Date of Birth: ${dob} (Age: ${age})\n`;
    prompt += `- Gender: ${patient.gender || 'Unknown'}\n\n`;
  }
  
  // Current medications
  if (context.medications && context.medications.length > 0) {
    prompt += `CURRENT MEDICATIONS:\n`;
    context.medications.forEach((entry, idx) => {
      const med = entry.resource;
      const medication = med.medicationCodeableConcept?.coding?.[0]?.display || 
                        med.medicationCodeableConcept?.text || 
                        'Unknown medication';
      const dosage = med.dosageInstruction?.[0]?.text || 'Dosage not specified';
      const status = med.status || 'unknown';
      prompt += `${idx + 1}. ${medication} - ${dosage} (Status: ${status})\n`;
    });
    prompt += '\n';
  }
  
  // Active conditions
  if (context.conditions && context.conditions.length > 0) {
    prompt += `ACTIVE CONDITIONS:\n`;
    context.conditions.forEach((entry, idx) => {
      const condition = entry.resource;
      const name = condition.code?.coding?.[0]?.display || condition.code?.text || 'Unknown condition';
      const onset = condition.onsetDateTime ? new Date(condition.onsetDateTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown onset';
      prompt += `${idx + 1}. ${name} (Since: ${onset})\n`;
    });
    prompt += '\n';
  }
  
  // Allergies
  if (context.allergies && context.allergies.length > 0) {
    prompt += `ALLERGIES:\n`;
    context.allergies.forEach((entry, idx) => {
      const allergy = entry.resource;
      const substance = allergy.code?.coding?.[0]?.display || allergy.code?.text || 'Unknown allergen';
      const reaction = allergy.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display || 'reaction not specified';
      prompt += `${idx + 1}. ${substance} - ${reaction}\n`;
    });
    prompt += '\n';
  }
  
  // Upcoming appointments
  if (context.appointments && context.appointments.length > 0) {
    prompt += `UPCOMING APPOINTMENTS:\n`;
    context.appointments.forEach((entry, idx) => {
      const appt = entry.resource;
      const date = appt.start ? new Date(appt.start).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Unknown date';
      const provider = appt.participant?.find((p: any) => p.actor?.display)?.actor?.display || 'Provider not specified';
      const type = appt.appointmentType?.coding?.[0]?.display || appt.serviceType?.[0]?.coding?.[0]?.display || 'Appointment';
      prompt += `${idx + 1}. ${type} with ${provider} on ${date}\n`;
    });
    prompt += '\n';
  }
  
  // Recent lab results
  if (context.labs && context.labs.length > 0) {
    prompt += `RECENT LAB RESULTS:\n`;
    context.labs.slice(0, 5).forEach((entry, idx) => {
      const obs = entry.resource;
      const name = obs.code?.coding?.[0]?.display || obs.code?.text || 'Unknown test';
      const value = obs.valueQuantity ? `${obs.valueQuantity.value} ${obs.valueQuantity.unit}` : obs.valueString || 'Value not available';
      const date = obs.effectiveDateTime ? new Date(obs.effectiveDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      prompt += `${idx + 1}. ${name}: ${value} ${date ? `(${date})` : ''}\n`;
    });
    prompt += '\n';
  }
  
  prompt += `\nINSTRUCTIONS:\n`;
  prompt += `- Use the above FHIR data to answer patient questions accurately\n`;
  prompt += `- Be conversational and friendly but professional\n`;
  prompt += `- If asked about medications, reference their current medications list\n`;
  prompt += `- If asked about appointments, provide specific dates and providers\n`;
  prompt += `- If asked about medical history, reference their conditions\n`;
  prompt += `- If asked about allergies, list them clearly\n`;
  prompt += `- If asked about lab results, provide the values with context\n`;
  prompt += `- If you don't have the information they're asking for, be honest about it\n`;
  prompt += `- DO NOT provide medical advice or diagnoses\n`;
  prompt += `- For scheduling/rescheduling appointments, inform them you'll route to staff\n`;
  prompt += `- For prescription refills, acknowledge and route to clinical team\n`;
  prompt += `- For urgent symptoms or concerns, route to appropriate clinical staff\n`;
  
  return prompt;
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
