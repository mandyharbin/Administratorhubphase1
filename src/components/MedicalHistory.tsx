import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Activity, 
  AlertCircle,
  Calendar,
  RefreshCw,
  FileText,
  Pill,
  Stethoscope,
  Syringe,
  Heart
} from 'lucide-react';

interface MedicalHistoryProps {
  patientId: string;
  useLiveData?: boolean;
}

interface Condition {
  name: string;
  clinicalStatus: string;
  verificationStatus: string;
  severity?: string;
  onsetDate: string;
  recordedDate: string;
  category: string;
}

interface Procedure {
  name: string;
  status: string;
  performedDate: string;
  performer?: string;
  location?: string;
  category: string;
}

interface Medication {
  name: string;
  status: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescriber?: string;
  instructions?: string;
}

interface Immunization {
  vaccine: string;
  occurrenceDate: string;
  performer?: string;
  lotNumber?: string;
  status: string;
}

const FHIR_BASE_URL = 'https://fhir-api.fhirstaging.aws.greenwayhealth.com/fhir/R4/2.16.840.1.113883.3.441.350831';

export function MedicalHistory({ patientId, useLiveData = false }: MedicalHistoryProps) {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveFHIRData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Conditions
      const conditionsResponse = await fetch(
        `${FHIR_BASE_URL}/Condition?patient=${patientId}&_sort=-onset-date&_count=50`,
        { headers: { 'Accept': 'application/fhir+json' } }
      );

      if (conditionsResponse.ok) {
        const conditionsBundle = await conditionsResponse.json();
        const conditionResources = conditionsBundle.entry?.map((e: any) => {
          const r = e.resource;
          return {
            name: r.code?.text || r.code?.coding?.[0]?.display || 'Unknown Condition',
            clinicalStatus: r.clinicalStatus?.coding?.[0]?.code || 'unknown',
            verificationStatus: r.verificationStatus?.coding?.[0]?.code || 'unknown',
            severity: r.severity?.coding?.[0]?.display,
            onsetDate: r.onsetDateTime || r.recordedDate || '',
            recordedDate: r.recordedDate || '',
            category: r.category?.[0]?.coding?.[0]?.display || 'General'
          };
        }) || [];
        setConditions(conditionResources);
      }

      // Fetch Procedures
      const proceduresResponse = await fetch(
        `${FHIR_BASE_URL}/Procedure?patient=${patientId}&_sort=-date&_count=50`,
        { headers: { 'Accept': 'application/fhir+json' } }
      );

      if (proceduresResponse.ok) {
        const proceduresBundle = await proceduresResponse.json();
        const procedureResources = proceduresBundle.entry?.map((e: any) => {
          const r = e.resource;
          return {
            name: r.code?.text || r.code?.coding?.[0]?.display || 'Unknown Procedure',
            status: r.status || 'unknown',
            performedDate: r.performedDateTime || r.performedPeriod?.start || '',
            performer: r.performer?.[0]?.actor?.display,
            location: r.location?.display,
            category: r.category?.coding?.[0]?.display || 'Procedure'
          };
        }) || [];
        setProcedures(procedureResources);
      }

      // Fetch Medications (MedicationStatement preferred, MedicationRequest fallback)
      const medicationsResponse = await fetch(
        `${FHIR_BASE_URL}/MedicationStatement?patient=${patientId}&_sort=-effective&_count=50`,
        { headers: { 'Accept': 'application/fhir+json' } }
      );

      if (medicationsResponse.ok) {
        const medicationsBundle = await medicationsResponse.json();
        const medicationResources = medicationsBundle.entry?.map((e: any) => {
          const r = e.resource;
          const med = r.medicationCodeableConcept || r.medicationReference;
          return {
            name: med?.text || med?.coding?.[0]?.display || 'Unknown Medication',
            status: r.status || 'unknown',
            dosage: r.dosage?.[0]?.text || r.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity?.value + ' ' + r.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit || '',
            frequency: r.dosage?.[0]?.timing?.code?.text || '',
            startDate: r.effectiveDateTime || r.effectivePeriod?.start || '',
            endDate: r.effectivePeriod?.end,
            prescriber: r.informationSource?.display,
            instructions: r.dosage?.[0]?.patientInstruction
          };
        }) || [];
        setMedications(medicationResources);
      }

      // Fetch Immunizations
      const immunizationsResponse = await fetch(
        `${FHIR_BASE_URL}/Immunization?patient=${patientId}&_sort=-date&_count=50`,
        { headers: { 'Accept': 'application/fhir+json' } }
      );

      if (immunizationsResponse.ok) {
        const immunizationsBundle = await immunizationsResponse.json();
        const immunizationResources = immunizationsBundle.entry?.map((e: any) => {
          const r = e.resource;
          return {
            vaccine: r.vaccineCode?.text || r.vaccineCode?.coding?.[0]?.display || 'Unknown Vaccine',
            occurrenceDate: r.occurrenceDateTime || r.occurrenceString || '',
            performer: r.performer?.[0]?.actor?.display,
            lotNumber: r.lotNumber,
            status: r.status || 'completed'
          };
        }) || [];
        setImmunizations(immunizationResources);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('FHIR medical history error:', err);
      setError(err.message || 'Failed to fetch medical history');
      setLoading(false);
    }
  };

  const fetchMockData = async () => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 600));

    setConditions([
      { name: 'Type 2 Diabetes Mellitus', clinicalStatus: 'active', verificationStatus: 'confirmed', severity: 'Moderate', onsetDate: '2018-03-15', recordedDate: '2018-03-15', category: 'Endocrine' },
      { name: 'Essential Hypertension', clinicalStatus: 'active', verificationStatus: 'confirmed', onsetDate: '2019-06-22', recordedDate: '2019-06-22', category: 'Cardiovascular' },
      { name: 'Seasonal Allergic Rhinitis', clinicalStatus: 'active', verificationStatus: 'confirmed', onsetDate: '2015-04-10', recordedDate: '2015-04-10', category: 'Respiratory' },
      { name: 'Vitamin D Deficiency', clinicalStatus: 'resolved', verificationStatus: 'confirmed', onsetDate: '2023-01-12', recordedDate: '2023-01-12', category: 'Nutritional' },
    ]);

    setProcedures([
      { name: 'Colonoscopy', status: 'completed', performedDate: '2024-08-15', performer: 'Dr. Robert Chen', location: 'Endoscopy Center', category: 'Diagnostic' },
      { name: 'Dental Cleaning', status: 'completed', performedDate: '2025-09-10', performer: 'Dr. Emily Johnson', location: 'Family Dental', category: 'Preventive' },
      { name: 'Annual Physical Examination', status: 'completed', performedDate: '2025-11-10', performer: 'Dr. Sarah Martinez', category: 'Preventive' },
    ]);

    setMedications([
      { name: 'Metformin 500mg', status: 'active', dosage: '500mg', frequency: 'Twice daily', startDate: '2018-03-15', prescriber: 'Dr. Sarah Martinez', instructions: 'Take with meals' },
      { name: 'Lisinopril 10mg', status: 'active', dosage: '10mg', frequency: 'Once daily', startDate: '2019-06-22', prescriber: 'Dr. Sarah Martinez', instructions: 'Take in the morning' },
      { name: 'Atorvastatin 20mg', status: 'active', dosage: '20mg', frequency: 'Once daily at bedtime', startDate: '2020-02-10', prescriber: 'Dr. Sarah Martinez', instructions: 'Take at night' },
      { name: 'Vitamin D3 2000 IU', status: 'active', dosage: '2000 IU', frequency: 'Once daily', startDate: '2023-01-12', prescriber: 'Dr. Sarah Martinez' },
    ]);

    setImmunizations([
      { vaccine: 'Influenza vaccine', occurrenceDate: '2025-10-15', performer: 'Health Partners Pharmacy', status: 'completed' },
      { vaccine: 'COVID-19 Vaccine (Moderna)', occurrenceDate: '2025-09-20', performer: 'Health Partners Medical Group', lotNumber: 'MOD-2025-9384', status: 'completed' },
      { vaccine: 'Tdap (Tetanus, Diphtheria, Pertussis)', occurrenceDate: '2023-05-10', performer: 'Health Partners Medical Group', status: 'completed' },
      { vaccine: 'Pneumococcal Vaccine', occurrenceDate: '2022-11-08', performer: 'Health Partners Medical Group', status: 'completed' },
    ]);

    setLoading(false);
  };

  useEffect(() => {
    if (useLiveData) {
      fetchLiveFHIRData();
    } else {
      fetchMockData();
    }
  }, [patientId, useLiveData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleRefresh = () => {
    if (useLiveData) {
      fetchLiveFHIRData();
    } else {
      fetchMockData();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active' || statusLower === 'completed') {
      return <Badge className="bg-green-100 text-green-700">Active</Badge>;
    } else if (statusLower === 'resolved' || statusLower === 'inactive') {
      return <Badge className="bg-gray-100 text-gray-700">Resolved</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
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
            <p className="text-gray-900 mb-2">Unable to load medical history</p>
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

        <Tabs defaultValue="conditions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="procedures">Procedures</TabsTrigger>
            <TabsTrigger value="immunizations">Vaccines</TabsTrigger>
          </TabsList>

          {/* Conditions Tab */}
          <TabsContent value="conditions" className="space-y-3 mt-4">
            {conditions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No conditions recorded</p>
                </CardContent>
              </Card>
            ) : (
              conditions.map((condition, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-gray-900">{condition.name}</h4>
                        <div className="text-xs text-gray-500 mt-1">{condition.category}</div>
                      </div>
                      {getStatusBadge(condition.clinicalStatus)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Onset Date</div>
                        <div className="text-gray-900">{formatDate(condition.onsetDate)}</div>
                      </div>
                      {condition.severity && (
                        <div>
                          <div className="text-xs text-gray-500">Severity</div>
                          <div className="text-gray-900">{condition.severity}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-3 mt-4">
            {medications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No medications recorded</p>
                </CardContent>
              </Card>
            ) : (
              medications.map((med, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-gray-900">{med.name}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          {med.dosage} {med.frequency && `• ${med.frequency}`}
                        </div>
                      </div>
                      {getStatusBadge(med.status)}
                    </div>
                    
                    {med.instructions && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-900">
                        <strong>Instructions:</strong> {med.instructions}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Started</div>
                        <div className="text-gray-900">{formatDate(med.startDate)}</div>
                      </div>
                      {med.prescriber && (
                        <div>
                          <div className="text-xs text-gray-500">Prescribed By</div>
                          <div className="text-gray-900 text-sm">{med.prescriber}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Procedures Tab */}
          <TabsContent value="procedures" className="space-y-3 mt-4">
            {procedures.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No procedures recorded</p>
                </CardContent>
              </Card>
            ) : (
              procedures.map((procedure, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-gray-900">{procedure.name}</h4>
                        <div className="text-xs text-gray-500 mt-1">{procedure.category}</div>
                      </div>
                      {getStatusBadge(procedure.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Date Performed</div>
                        <div className="text-gray-900">{formatDate(procedure.performedDate)}</div>
                      </div>
                      {procedure.performer && (
                        <div>
                          <div className="text-xs text-gray-500">Performed By</div>
                          <div className="text-gray-900 text-sm">{procedure.performer}</div>
                        </div>
                      )}
                    </div>
                    {procedure.location && (
                      <div className="mt-2 text-sm">
                        <div className="text-xs text-gray-500">Location</div>
                        <div className="text-gray-900">{procedure.location}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Immunizations Tab */}
          <TabsContent value="immunizations" className="space-y-3 mt-4">
            {immunizations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Syringe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No immunizations recorded</p>
                </CardContent>
              </Card>
            ) : (
              immunizations.map((immunization, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-gray-900">{immunization.vaccine}</h4>
                      </div>
                      {getStatusBadge(immunization.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Date Administered</div>
                        <div className="text-gray-900">{formatDate(immunization.occurrenceDate)}</div>
                      </div>
                      {immunization.performer && (
                        <div>
                          <div className="text-xs text-gray-500">Given By</div>
                          <div className="text-gray-900 text-sm">{immunization.performer}</div>
                        </div>
                      )}
                    </div>
                    {immunization.lotNumber && (
                      <div className="mt-2 text-sm">
                        <div className="text-xs text-gray-500">Lot Number</div>
                        <div className="text-gray-900">{immunization.lotNumber}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
