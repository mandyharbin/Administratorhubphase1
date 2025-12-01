/**
 * AWS HealthLake / Generic FHIR Client
 * Provides utilities for interacting with FHIR endpoints
 */

/**
 * Fetches all patients from a FHIR server with pagination support
 */
export async function fetchAllPatients(
  baseUrl: string,
  authToken: string,
  maxPages: number = 10
): Promise<any[]> {
  const patients: any[] = [];
  let nextUrl: string | null = `${baseUrl}/Patient?_count=100`;
  let pageCount = 0;

  while (nextUrl && pageCount < maxPages) {
    try {
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/fhir+json',
        },
      });

      if (!response.ok) {
        console.error(
          `FHIR fetch failed: ${response.status} ${response.statusText}`
        );
        break;
      }

      const bundle = await response.json();

      if (bundle.entry) {
        patients.push(...bundle.entry.map((e: any) => e.resource));
      }

      // Look for next link
      const nextLink = bundle.link?.find((l: any) => l.relation === 'next');
      nextUrl = nextLink?.url || null;
      pageCount++;
    } catch (error) {
      console.error('Error fetching patients:', error);
      break;
    }
  }

  return patients;
}

/**
 * Creates a FHIR RelatedPerson resource
 */
export async function createRelatedPerson(
  baseUrl: string,
  authToken: string,
  resource: any
): Promise<any> {
  const response = await fetch(`${baseUrl}/RelatedPerson`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/fhir+json',
      Accept: 'application/fhir+json',
    },
    body: JSON.stringify(resource),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Failed to create RelatedPerson: ${response.status} - ${error}`
    );
  }

  return await response.json();
}

/**
 * Creates a FHIR Consent resource
 */
export async function createConsent(
  baseUrl: string,
  authToken: string,
  resource: any
): Promise<any> {
  const response = await fetch(`${baseUrl}/Consent`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/fhir+json',
      Accept: 'application/fhir+json',
    },
    body: JSON.stringify(resource),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Failed to create Consent: ${response.status} - ${error}`
    );
  }

  return await response.json();
}

/**
 * Creates a FHIR Provenance resource
 */
export async function createProvenance(
  baseUrl: string,
  authToken: string,
  resource: any
): Promise<any> {
  const response = await fetch(`${baseUrl}/Provenance`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/fhir+json',
      Accept: 'application/fhir+json',
    },
    body: JSON.stringify(resource),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Failed to create Provenance: ${response.status} - ${error}`
    );
  }

  return await response.json();
}

/**
 * Searches for a patient by identifier
 */
export async function searchPatientByIdentifier(
  baseUrl: string,
  authToken: string,
  system: string,
  value: string
): Promise<any | null> {
  const searchUrl = `${baseUrl}/Patient?identifier=${encodeURIComponent(
    system
  )}|${encodeURIComponent(value)}`;

  const response = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: 'application/fhir+json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to search patient: ${response.status} ${response.statusText}`
    );
  }

  const bundle = await response.json();

  if (bundle.entry && bundle.entry.length > 0) {
    return bundle.entry[0].resource;
  }

  return null;
}
