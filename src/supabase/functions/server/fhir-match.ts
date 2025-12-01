/**
 * FHIR Patient Matching Utilities
 * Supports both deterministic (identifier-based) and fuzzy (demographics-based) matching
 */

import Fuse from 'npm:fuse.js';

export interface PatientIdentifier {
  system: string;
  value: string;
}

export interface PatientDemographics {
  family?: string;
  given?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  email?: string;
}

export interface MatchCandidate {
  patient: any; // FHIR Patient resource
  score: number;
  matchType: 'exact' | 'high' | 'medium' | 'low';
  matchedFields: string[];
}

/**
 * Performs deterministic patient matching using identifiers (MRN, SSN, etc.)
 */
export function matchByIdentifier(
  patients: any[],
  identifiers: PatientIdentifier[]
): any[] {
  const matches: any[] = [];

  for (const patient of patients) {
    if (!patient.identifier) continue;

    for (const searchId of identifiers) {
      const found = patient.identifier.find(
        (id: any) =>
          id.system === searchId.system && id.value === searchId.value
      );

      if (found) {
        matches.push(patient);
        break;
      }
    }
  }

  return matches;
}

/**
 * Performs fuzzy patient matching using demographics
 * Returns candidates ranked by match confidence
 */
export function fuzzyMatchByDemographics(
  patients: any[],
  demographics: PatientDemographics,
  threshold: number = 0.6
): MatchCandidate[] {
  // Prepare search data
  const searchablePatients = patients.map((patient) => ({
    patient,
    searchText: buildSearchText(patient),
    family: patient.name?.[0]?.family?.toLowerCase() || '',
    given: patient.name?.[0]?.given?.[0]?.toLowerCase() || '',
    birthDate: patient.birthDate || '',
    gender: patient.gender?.toLowerCase() || '',
    phone: extractPhone(patient),
    email: extractEmail(patient),
  }));

  // Configure Fuse.js for fuzzy search
  const fuse = new Fuse(searchablePatients, {
    keys: [
      { name: 'family', weight: 0.3 },
      { name: 'given', weight: 0.3 },
      { name: 'birthDate', weight: 0.2 },
      { name: 'gender', weight: 0.1 },
      { name: 'phone', weight: 0.05 },
      { name: 'email', weight: 0.05 },
    ],
    threshold: threshold,
    includeScore: true,
    useExtendedSearch: true,
  });

  // Build search query
  const searchQuery = buildSearchQuery(demographics);

  // Perform fuzzy search
  const results = fuse.search(searchQuery);

  // Convert to match candidates
  const candidates: MatchCandidate[] = results.map((result) => {
    const score = 1 - (result.score || 0); // Invert Fuse.js score (lower is better -> higher is better)
    const matchedFields = detectMatchedFields(
      result.item.patient,
      demographics
    );

    return {
      patient: result.item.patient,
      score,
      matchType: getMatchType(score),
      matchedFields,
    };
  });

  return candidates;
}

/**
 * Combines both matching strategies
 */
export function matchPatient(
  patients: any[],
  criteria: {
    identifiers?: PatientIdentifier[];
    demographics?: PatientDemographics;
  }
): {
  deterministic: any[];
  fuzzy: MatchCandidate[];
} {
  const deterministic = criteria.identifiers
    ? matchByIdentifier(patients, criteria.identifiers)
    : [];

  const fuzzy =
    criteria.demographics && deterministic.length === 0
      ? fuzzyMatchByDemographics(patients, criteria.demographics)
      : [];

  return { deterministic, fuzzy };
}

// Helper functions

function buildSearchText(patient: any): string {
  const parts: string[] = [];

  if (patient.name?.[0]?.family) parts.push(patient.name[0].family);
  if (patient.name?.[0]?.given?.[0]) parts.push(patient.name[0].given[0]);
  if (patient.birthDate) parts.push(patient.birthDate);
  if (patient.gender) parts.push(patient.gender);

  return parts.join(' ').toLowerCase();
}

function buildSearchQuery(demographics: PatientDemographics): string {
  const parts: string[] = [];

  if (demographics.family) parts.push(demographics.family.toLowerCase());
  if (demographics.given) parts.push(demographics.given.toLowerCase());
  if (demographics.birthDate) parts.push(demographics.birthDate);
  if (demographics.gender) parts.push(demographics.gender.toLowerCase());

  return parts.join(' ');
}

function extractPhone(patient: any): string {
  const phone = patient.telecom?.find((t: any) => t.system === 'phone');
  return phone?.value?.replace(/\D/g, '') || '';
}

function extractEmail(patient: any): string {
  const email = patient.telecom?.find((t: any) => t.system === 'email');
  return email?.value?.toLowerCase() || '';
}

function detectMatchedFields(
  patient: any,
  demographics: PatientDemographics
): string[] {
  const matched: string[] = [];

  const patientFamily = patient.name?.[0]?.family?.toLowerCase();
  const patientGiven = patient.name?.[0]?.given?.[0]?.toLowerCase();

  if (
    demographics.family &&
    patientFamily?.includes(demographics.family.toLowerCase())
  ) {
    matched.push('family');
  }

  if (
    demographics.given &&
    patientGiven?.includes(demographics.given.toLowerCase())
  ) {
    matched.push('given');
  }

  if (demographics.birthDate && patient.birthDate === demographics.birthDate) {
    matched.push('birthDate');
  }

  if (
    demographics.gender &&
    patient.gender?.toLowerCase() === demographics.gender.toLowerCase()
  ) {
    matched.push('gender');
  }

  return matched;
}

function getMatchType(score: number): 'exact' | 'high' | 'medium' | 'low' {
  if (score >= 0.9) return 'exact';
  if (score >= 0.7) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}
