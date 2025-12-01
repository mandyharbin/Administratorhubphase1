# FHIR Integration Guide

## Overview

The Health Summary component is now connected to the Greenway Health FHIR R4 staging endpoint and uses the canonical mapping provided to transform FHIR resources into a patient-friendly mobile view.

## Configuration

### FHIR Endpoint
```
Base URL: https://fhir-api.fhirstaging.aws.greenwayhealth.com/fhir/R4/2.16.840.1.113883.3.441.350831
```

### Current Status
- **Mode**: Mock Data (default)
- **Read-Only**: Yes - only GET requests, no writes to FHIR
- **Authentication**: Not currently configured (may need Bearer token)

## Enabling Live FHIR Data

### Option 1: Toggle in Component
In `/components/PatientAppDemo.tsx` line ~5809, change:
```tsx
<HealthSummary patientId="patient-123" useLiveData={false} />
```
to:
```tsx
<HealthSummary patientId="YOUR_REAL_PATIENT_ID" useLiveData={true} />
```

### Option 2: Add Authentication (if required)
If the FHIR endpoint requires authentication, update `/components/HealthSummary.tsx` around line 146:
```tsx
const patientResponse = await fetch(`${FHIR_BASE_URL}/Patient/${patientId}`, {
  headers: {
    'Accept': 'application/fhir+json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN_HERE'
  }
});
```

You may need to:
1. Store the FHIR access token in environment variables
2. Use `create_supabase_secret` tool to let users provide their token
3. Implement OAuth flow if required by Greenway

## FHIR Resources Fetched

The Health Summary makes the following **READ-ONLY** FHIR API calls:

### 1. Patient Demographics
```
GET /Patient/{patientId}?_elements=name,birthDate,gender,telecom,address,meta
```
**Mapped Fields:**
- `displayName` ← Patient.name[0].text or given + family
- `birthDate` ← Patient.birthDate
- `age` ← computed from birthDate
- `gender` ← Patient.gender
- `primaryPhone` ← Patient.telecom (system=phone, prefer use=mobile)
- `primaryEmail` ← Patient.telecom (system=email, prefer preferred=true)
- `primaryAddress` ← Patient.address (prefer use=home)

### 2. Insurance Coverage
```
GET /Coverage?beneficiary=Patient/{patientId}&status=active&_include=Coverage:payor
```
**Mapped Fields:**
- `payerName` ← Coverage.payor[0].display or included Organization.name
- `planName` ← Coverage.grouping.plan or Coverage.class[0].name
- `memberId` ← Coverage.subscriberId or identifier[0].value
- `status` ← Coverage.status
- `effectiveDate` ← Coverage.period.start
- `terminationDate` ← Coverage.period.end

### 3. Allergies & Intolerances
```
GET /AllergyIntolerance?patient={patientId}&_count=50
```
**Mapped Fields:**
- `substance` ← AllergyIntolerance.code.text or coding[0].display
- `reaction` ← reaction[0].manifestation[*].text/display (joined)
- `severity` ← reaction[0].severity or criticality
- `recordedDate` ← AllergyIntolerance.recordedDate or meta.lastUpdated

### 4. Most Recent Encounter
```
GET /Encounter?patient={patientId}&_sort=-period&_count=1&_include=Encounter:participant&_include=Encounter:location
```
**Mapped Fields:**
- `startDatetime` ← Encounter.period.start
- `reason` ← Encounter.reasonCode[0].text or coding[0].display
- `providerName` ← Encounter.participant[0].individual.display
- `locationName` ← Encounter.location[0].location.display or serviceProvider.display

## Data Transformation Logic

The component implements the canonical mapping rules:

### Age Computation
```typescript
age = floor((now - birthDate) / 365.25 days)
```

### Phone Selection Priority
1. telecom where system='phone' AND use='mobile'
2. telecom where system='phone' AND use='home'
3. telecom where system='phone' AND use='work'
4. First phone entry

### Email Selection Priority
1. telecom where system='email' AND preferred=true
2. telecom where system='email' AND use='home'
3. First email entry

### Address Selection Priority
1. address where use='home' and period covers today
2. First address entry

### Allergy Severity Mapping
- `high` or `severe` → Red (critical)
- `moderate` → Orange (warning)
- `low` or `unknown` → Yellow (caution)

## Error Handling

The component handles errors gracefully:
- Network failures → Shows error card with retry button
- Missing resources → Shows empty state
- Partial data → Displays available sections, hides missing ones
- Auth errors → Console logged, falls back to error state

## Security Notes

✅ **Read-Only**: No POST/PUT/PATCH/DELETE operations
✅ **Patient-Scoped**: Only fetches data for authenticated patient
✅ **No PHI Logging**: Errors logged without sensitive data
⚠️ **CORS**: May need to configure CORS on FHIR server
⚠️ **Auth**: Implement proper OAuth/Bearer token flow before production

## Testing

### Test with Mock Data (Current)
```tsx
<HealthSummary patientId="any-id" useLiveData={false} />
```
Shows demo patient "Amanda Thompson" with sample data

### Test with Live FHIR (Staging)
```tsx
<HealthSummary patientId="valid-patient-id" useLiveData={true} />
```
Fetches real data from Greenway FHIR staging endpoint

## Next Steps

1. ✅ Confirm FHIR endpoint is accessible
2. ⚠️ Add authentication if required
3. ⚠️ Test with real patient IDs from your system
4. ⚠️ Implement proper error analytics/monitoring
5. ⚠️ Add offline caching if needed
6. ⚠️ Performance optimization for slow networks

## Troubleshooting

### 401 Unauthorized
→ Add Bearer token to Authorization header

### 403 Forbidden
→ Check patient consent and authorization scopes

### 404 Not Found
→ Verify patient ID exists in the FHIR server

### CORS Error
→ FHIR server needs to allow requests from your domain

### Slow Loading
→ Consider adding pagination or data caching
