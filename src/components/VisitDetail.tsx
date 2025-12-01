import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { 
  Activity, 
  AlertCircle,
  Calendar,
  RefreshCw,
  User,
  MapPin,
  Stethoscope,
  Heart,
  Thermometer,
  FileText,
  Pill,
  ClipboardList
} from 'lucide-react';

interface VisitDetailProps {
  encounterId: string;
  patientId: string;
  useLiveData?: boolean;
}

interface VitalSign {
  name: string;
  value: string;
  unit: string;
  interpretation?: string;
}

interface VisitData {
  encounterDate: string;
  encounterType: string;
  reason: string;
  status: string;
  practitioner: string;
  location: string;
  chiefComplaint?: string;
  vitals: VitalSign[];
  diagnoses: Array<{
    condition: string;
    code?: string;
    status: string;
  }>;
  procedures: Array<{
    name: string;
    code?: string;
  }>;
  medications: Array<{
    name: string;
    dosage: string;
    instructions: string;
  }>;
  clinicalNotes?: string;
  followUp?: string;
}

const FHIR_BASE_URL = 'https://fhir-api.fhirstaging.aws.greenwayhealth.com/fhir/R4/2.16.840.1.113883.3.441.350831';

export function VisitDetail({ encounterId, patientId, useLiveData = false }: VisitDetailProps) {
  const [visitData, setVisitData] = useState<VisitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveFHIRData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Encounter
      const encounterResponse = await fetch(
        `${FHIR_BASE_URL}/Encounter/${encounterId}?_include=Encounter:participant&_include=Encounter:location`,
        { headers: { 'Accept': 'application/fhir+json' } }
      );

      if (!encounterResponse.ok) {
        throw new Error(`Failed to fetch encounter: ${encounterResponse.status}`);
      }

      const encounterBundle = await encounterResponse.json();
      const encounter = encounterBundle.entry?.[0]?.resource || encounterBundle;

      // Fetch vital signs for this encounter
      const vitalsResponse = await fetch(
        `${FHIR_BASE_URL}/Observation?encounter=${encounterId}&category=vital-signs`,
        { headers: { 'Accept': 'application/fhir+json' } }
      );

      const vitals: VitalSign[] = [];
      if (vitalsResponse.ok) {
        const vitalsBundle = await vitalsResponse.json();
        const vitalObs = vitalsBundle.entry?.map((e: any) => e.resource) || [];
        
        vitalObs.forEach((obs: any) => {
          vitals.push({
            name: obs.code?.text || obs.code?.coding?.[0]?.display || 'Unknown',
            value: obs.valueQuantity?.value?.toString() || obs.valueString || '',
            unit: obs.valueQuantity?.unit || '',
            interpretation: obs.interpretation?.[0]?.coding?.[0]?.code
          });
        });
      }

      // Fetch conditions for this encounter
      const conditionsResponse = await fetch(
        `${FHIR_BASE_URL}/Condition?encounter=${encounterId}`,
        { headers: { 'Accept': 'application/fhir+json' } }
      );

      const diagnoses: any[] = [];
      if (conditionsResponse.ok) {
        const conditionsBundle = await conditionsResponse.json();
        const conditions = conditionsBundle.entry?.map((e: any) => e.resource) || [];
        
        conditions.forEach((cond: any) => {
          diagnoses.push({
            condition: cond.code?.text || cond.code?.coding?.[0]?.display || 'Unknown',
            code: cond.code?.coding?.[0]?.code,
            status: cond.clinicalStatus?.coding?.[0]?.code || 'unknown'
          });
        });
      }

      // Fetch procedures for this encounter
      const proceduresResponse = await fetch(
        `${FHIR_BASE_URL}/Procedure?encounter=${encounterId}`,
        { headers: { 'Accept': 'application/fhir+json' } }
      );

      const procedures: any[] = [];
      if (proceduresResponse.ok) {
        const proceduresBundle = await proceduresResponse.json();
        const procResources = proceduresBundle.entry?.map((e: any) => e.resource) || [];
        
        procResources.forEach((proc: any) => {
          procedures.push({
            name: proc.code?.text || proc.code?.coding?.[0]?.display || 'Unknown',
            code: proc.code?.coding?.[0]?.code
          });
        });
      }

      // Fetch medications prescribed during this encounter
      const medicationsResponse = await fetch(
        `${FHIR_BASE_URL}/MedicationRequest?encounter=${encounterId}`,
        { headers: { 'Accept': 'application/fhir+json' } }
      );

      const medications: any[] = [];
      if (medicationsResponse.ok) {
        const medicationsBundle = await medicationsResponse.json();
        const medResources = medicationsBundle.entry?.map((e: any) => e.resource) || [];
        
        medResources.forEach((med: any) => {
          const medName = med.medicationCodeableConcept?.text || 
                         med.medicationCodeableConcept?.coding?.[0]?.display || 
                         'Unknown Medication';
          
          medications.push({
            name: medName,
            dosage: med.dosageInstruction?.[0]?.text || '',
            instructions: med.dosageInstruction?.[0]?.patientInstruction || ''
          });
        });
      }

      const visit: VisitData = {
        encounterDate: encounter.period?.start || encounter.meta?.lastUpdated || '',
        encounterType: encounter.type?.[0]?.text || encounter.type?.[0]?.coding?.[0]?.display || 'Office Visit',
        reason: encounter.reasonCode?.[0]?.text || encounter.reasonCode?.[0]?.coding?.[0]?.display || '',
        status: encounter.status || 'unknown',
        practitioner: encounter.participant?.[0]?.individual?.display || 'Unknown Provider',
        location: encounter.location?.[0]?.location?.display || 
                 encounter.serviceProvider?.display || 
                 'Unknown Location',
        vitals,
        diagnoses,
        procedures,
        medications
      };

      setVisitData(visit);
      setLoading(false);
    } catch (err: any) {
      console.error('FHIR visit detail error:', err);
      setError(err.message || 'Failed to fetch visit details');
      setLoading(false);
    }
  };

  const fetchMockData = async () => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 600));

    const mockVisit: VisitData = {
      encounterDate: '2025-11-10T10:30:00Z',
      encounterType: 'Annual Wellness Visit',
      reason: 'Annual wellness visit',
      status: 'finished',
      practitioner: 'Dr. Sarah Martinez, MD',
      location: 'Health Partners Medical Group - Main Campus',
      chiefComplaint: 'Routine annual physical examination',
      vitals: [
        { name: 'Blood Pressure', value: '128/82', unit: 'mmHg', interpretation: 'normal' },
        { name: 'Heart Rate', value: '72', unit: 'bpm', interpretation: 'normal' },
        { name: 'Temperature', value: '98.6', unit: '°F', interpretation: 'normal' },
        { name: 'Respiratory Rate', value: '16', unit: '/min', interpretation: 'normal' },
        { name: 'Weight', value: '165', unit: 'lbs' },
        { name: 'Height', value: '66', unit: 'inches' },
        { name: 'BMI', value: '26.6', unit: 'kg/m²' },
        { name: 'Oxygen Saturation', value: '98', unit: '%', interpretation: 'normal' },
      ],
      diagnoses: [
        { condition: 'Type 2 Diabetes Mellitus', code: 'E11.9', status: 'active' },
        { condition: 'Essential Hypertension', code: 'I10', status: 'active' },
        { condition: 'Hyperlipidemia', code: 'E78.5', status: 'active' },
      ],
      procedures: [
        { name: 'Comprehensive Physical Examination', code: '99395' },
        { name: 'EKG (Electrocardiogram)', code: '93000' },
      ],
      medications: [
        { name: 'Metformin 500mg', dosage: '500mg twice daily', instructions: 'Take with meals to reduce GI side effects' },
        { name: 'Lisinopril 10mg', dosage: '10mg once daily', instructions: 'Take in the morning' },
        { name: 'Atorvastatin 20mg', dosage: '20mg once daily at bedtime', instructions: 'Take at night for best efficacy' },
      ],
      clinicalNotes: 'Patient presents for annual wellness visit. Overall health stable. Blood pressure slightly elevated but within acceptable range. HbA1c results pending from recent lab work. Patient reports good medication compliance. No new concerns. Continue current medication regimen.',
      followUp: 'Schedule follow-up in 3 months to review HbA1c results and adjust diabetes management as needed. Annual lipid panel recommended in 6 months.'
    };

    setVisitData(mockVisit);
    setLoading(false);
  };

  useEffect(() => {
    if (useLiveData) {
      fetchLiveFHIRData();
    } else {
      fetchMockData();
    }
  }, [encounterId, patientId, useLiveData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleRefresh = () => {
    if (useLiveData) {
      fetchLiveFHIRData();
    } else {
      fetchMockData();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 mb-2">Unable to load visit details</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!visitData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No visit data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-4 pb-24">
        {useLiveData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Live FHIR Data</span>
            </div>
            <Button onClick={handleRefresh} variant="ghost" size="sm" className="h-auto p-1">
              <RefreshCw className="w-4 h-4 text-green-600" />
            </Button>
          </div>
        )}

        {/* Visit Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{visitData.encounterType}</CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {formatDate(visitData.encounterDate)}
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">
                {visitData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-gray-400" />
              <span>{visitData.practitioner}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{visitData.location}</span>
            </div>
            {visitData.reason && (
              <div className="pt-3 border-t">
                <div className="text-xs text-gray-500 mb-1">Reason for Visit</div>
                <div className="text-gray-900">{visitData.reason}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vital Signs */}
        {visitData.vitals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Vital Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {visitData.vitals.map((vital, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">{vital.name}</div>
                    <div className="text-gray-900">
                      {vital.value} {vital.unit}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diagnoses */}
        {visitData.diagnoses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-purple-500" />
                Diagnoses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {visitData.diagnoses.map((diagnosis, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-900">{diagnosis.condition}</div>
                      {diagnosis.code && (
                        <div className="text-xs text-gray-500 mt-1">Code: {diagnosis.code}</div>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      {diagnosis.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Procedures */}
        {visitData.procedures.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-teal-500" />
                Procedures Performed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {visitData.procedures.map((procedure, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-900">{procedure.name}</div>
                  {procedure.code && (
                    <div className="text-xs text-gray-500 mt-1">Code: {procedure.code}</div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Medications */}
        {visitData.medications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-orange-500" />
                Medications Prescribed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {visitData.medications.map((med, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-900">{med.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{med.dosage}</div>
                  {med.instructions && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-900">
                      <strong>Instructions:</strong> {med.instructions}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Clinical Notes */}
        {visitData.clinicalNotes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Clinical Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-sm leading-relaxed">{visitData.clinicalNotes}</p>
            </CardContent>
          </Card>
        )}

        {/* Follow-up Instructions */}
        {visitData.followUp && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Follow-up Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-sm leading-relaxed">{visitData.followUp}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
