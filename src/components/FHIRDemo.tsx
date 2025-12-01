import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { PatientInfo } from './PatientInfo';
import { AppointmentsList } from './AppointmentsList';
import { BillingInfo } from './BillingInfo';
import { MedicalHistory } from './MedicalHistory';
import { FullMedicalHistory } from './FullMedicalHistory';
import { Database, Activity, AlertCircle, CheckCircle, FileText } from 'lucide-react';

export function FHIRDemo() {
  const [selectedPatient, setSelectedPatient] = useState('patient-001');
  const [showFullHistory, setShowFullHistory] = useState(false);

  const patients = [
    { id: 'patient-001', name: 'Sarah Elena Martinez', status: 'active' },
    { id: 'patient-002', name: 'Michael David Johnson', status: 'active' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-6 h-6 text-blue-600" />
          <h2>FHIR Integration Demo</h2>
        </div>
        <p className="text-gray-600">
          Mock demonstration of HL7 FHIR R4 patient and appointment data integration
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm mb-2">
                <strong>About FHIR Integration:</strong> This demo showcases how the BASE Admin Hub can integrate with HL7 FHIR (Fast Healthcare Interoperability Resources) R4 standard for exchanging healthcare data.
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="mb-0.5"><strong>Patient Resource</strong></div>
                    <div className="text-gray-700">Demographics, contact info, emergency contacts</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="mb-0.5"><strong>Appointment Resource</strong></div>
                    <div className="text-gray-700">Scheduled visits with providers and locations</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3 h-3 mt-0.5 text-orange-600 flex-shrink-0" />
                  <div>
                    <div className="mb-0.5"><strong>Mock Data</strong></div>
                    <div className="text-gray-700">Using simulated FHIR endpoints for prototype</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Patient</CardTitle>
          <CardDescription>Choose a patient to view their FHIR data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    <div className="flex items-center gap-2">
                      <span>{patient.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {patient.status}
                      </Badge>
                      <span className="text-xs text-gray-500 ml-2">({patient.id})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Badge className="bg-green-100 text-green-700">
              <Database className="w-3 h-3 mr-1" />
              FHIR R4
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Patient Data Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Info */}
        <div>
          <PatientInfo patientId={selectedPatient} />
        </div>

        {/* Appointments */}
        <div>
          <AppointmentsList patientId={selectedPatient} />
        </div>

        {/* Billing */}
        <div>
          <BillingInfo patientId={selectedPatient} />
        </div>

        {/* Medical History */}
        <div>
          <MedicalHistory patientId={selectedPatient} />
        </div>
      </div>

      {/* Full Medical History Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Complete Medical History (All FHIR Resources)
              </CardTitle>
              <CardDescription>
                View comprehensive patient data including procedures, allergies, and lab results
              </CardDescription>
            </div>
            <Button
              variant={showFullHistory ? 'outline' : 'default'}
              onClick={() => setShowFullHistory(!showFullHistory)}
            >
              {showFullHistory ? 'Hide' : 'Show'} Full History
            </Button>
          </div>
        </CardHeader>
        {showFullHistory && (
          <CardContent>
            <FullMedicalHistory patientId={selectedPatient} />
          </CardContent>
        )}
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
          <CardDescription>How this FHIR integration works</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="text-sm">API Endpoints</div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="font-mono bg-gray-50 p-2 rounded">
                    GET /fhir/Patient/:id
                  </div>
                  <div className="font-mono bg-gray-50 p-2 rounded">
                    GET /fhir/Appointment?patient=:id
                  </div>
                  <div className="font-mono bg-gray-50 p-2 rounded">
                    GET /fhir/Account?subject=Patient/:id
                  </div>
                  <div className="font-mono bg-gray-50 p-2 rounded">
                    GET /fhir/Condition?patient=:id
                  </div>
                  <div className="font-mono bg-gray-50 p-2 rounded">
                    GET /fhir/Encounter?patient=:id
                  </div>
                  <div className="font-mono bg-gray-50 p-2 rounded">
                    GET /fhir/Procedure?patient=:id
                  </div>
                  <div className="font-mono bg-gray-50 p-2 rounded">
                    GET /fhir/AllergyIntolerance?patient=:id
                  </div>
                  <div className="font-mono bg-gray-50 p-2 rounded">
                    GET /fhir/Observation?patient=:id
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <div className="text-sm">FHIR Resources</div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Patient (Demographics)</div>
                  <div>• Appointment (Scheduling)</div>
                  <div>• Account (Billing)</div>
                  <div>• Condition (Diagnoses)</div>
                  <div>• Encounter (Visits)</div>
                  <div>• Procedure (Medical Procedures)</div>
                  <div>• AllergyIntolerance (Allergies)</div>
                  <div>• Observation (Labs & Vitals)</div>
                  <div>• Bundle (Search Results)</div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div className="text-sm">Data Flow</div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>1. React component requests data</div>
                  <div>2. API client calls FHIR endpoint</div>
                  <div>3. Server returns FHIR JSON</div>
                  <div>4. Component parses and displays</div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <div className="text-sm">Use Cases</div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Patient portal integration</div>
                  <div>• AI assistant context</div>
                  <div>• Admin dashboards</div>
                  <div>• Appointment reminders</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-700">
                  <div className="mb-1"><strong>Production Considerations:</strong></div>
                  <div>In a production environment, this would connect to a certified FHIR server (e.g., Epic, Cerner, Azure FHIR API) with proper authentication, OAuth2 flows, and full HIPAA compliance. The mock endpoints here simulate the data structure for prototyping purposes.</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}