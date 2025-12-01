// FHIR API Client
import { projectId, publicAnonKey } from '../utils/supabase/info';

const FHIR_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/fhir`;

interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  name?: Array<{
    use?: string;
    family?: string;
    given?: string[];
    prefix?: string[];
  }>;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  telecom?: Array<{
    system: 'phone' | 'email' | 'fax' | 'pager' | 'url' | 'sms' | 'other';
    value: string;
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  }>;
  address?: Array<{
    use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  maritalStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  contact?: Array<{
    relationship?: Array<{
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    }>;
    name?: {
      family?: string;
      given?: string[];
    };
    telecom?: Array<{
      system: string;
      value: string;
    }>;
  }>;
}

export async function fetchPatient(patientId: string, accessToken?: string): Promise<FHIRPatient | null> {
  try {
    const response = await fetch(`${FHIR_BASE_URL}/Patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken || publicAnonKey}`,
        'Accept': 'application/fhir+json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('FHIR Patient API error:', response.status, await response.text());
      return null;
    }

    const patient: FHIRPatient = await response.json();
    return patient;
  } catch (error) {
    console.error('Error fetching patient from FHIR:', error);
    return null;
  }
}

export async function fetchAppointments(patientId: string, accessToken?: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${FHIR_BASE_URL}/Appointment?patient=${patientId}&date=ge${today}&_sort=date`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('FHIR Appointment API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching appointments from FHIR:', error);
    return null;
  }
}

export async function fetchBillingAccount(patientId: string, accessToken?: string) {
  try {
    const response = await fetch(
      `${FHIR_BASE_URL}/Account?subject=Patient/${patientId}&_sort=-period`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('FHIR Account API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching billing accounts from FHIR:', error);
    return null;
  }
}

export async function fetchPatientConditions(patientId: string, accessToken?: string) {
  try {
    const response = await fetch(
      `${FHIR_BASE_URL}/Condition?patient=${patientId}&_sort=-recorded-date`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('FHIR Condition API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching conditions from FHIR:', error);
    return null;
  }
}

export async function fetchPatientEncounters(patientId: string, accessToken?: string) {
  try {
    const response = await fetch(
      `${FHIR_BASE_URL}/Encounter?patient=${patientId}&_sort=-date`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('FHIR Encounter API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching encounters from FHIR:', error);
    return null;
  }
}

export async function fetchPatientProcedures(patientId: string, accessToken?: string) {
  try {
    const response = await fetch(
      `${FHIR_BASE_URL}/Procedure?patient=${patientId}&_sort=-date`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('FHIR Procedure API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching procedures from FHIR:', error);
    return null;
  }
}

export async function fetchPatientAllergies(patientId: string, accessToken?: string) {
  try {
    const response = await fetch(
      `${FHIR_BASE_URL}/AllergyIntolerance?patient=${patientId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('FHIR AllergyIntolerance API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching allergies from FHIR:', error);
    return null;
  }
}

export async function fetchPatientObservations(patientId: string, accessToken?: string) {
  try {
    const response = await fetch(
      `${FHIR_BASE_URL}/Observation?patient=${patientId}&_sort=-date&_count=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('FHIR Observation API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching observations from FHIR:', error);
    return null;
  }
}

export async function fetchPatientMedications(patientId: string, accessToken?: string) {
  try {
    const response = await fetch(
      `${FHIR_BASE_URL}/MedicationStatement?patient=${patientId}&status=active`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('FHIR MedicationStatement API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching medications from FHIR:', error);
    return null;
  }
}

// Convenience aliases for shorter names
export const fetchMedications = fetchPatientMedications;
export const fetchConditions = fetchPatientConditions;
export const fetchAllergies = fetchPatientAllergies;
export const fetchObservations = fetchPatientObservations;