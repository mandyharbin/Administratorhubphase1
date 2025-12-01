import { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FHIRDataCardWithSource } from './FHIRDataCardWithSource';
import { InfoBanner } from './InfoBanner';
import { 
  User, 
  UserCheck, 
  Info,
  Filter,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function ChartDataSourceDemo() {
  const [showSourceIndicators, setShowSourceIndicators] = useState(true);
  const [filterBySource, setFilterBySource] = useState<'all' | 'patient' | 'staff'>('all');

  // Mock data with source attribution
  const mockMedications = [
    {
      name: 'Lisinopril',
      medicationCodeableConcept: { text: 'Lisinopril' },
      dosageInstruction: [{ text: '10mg once daily' }],
      source: 'staff' as const,
      enteredBy: 'Dr. Sarah Johnson',
      enteredAt: '2025-11-15T10:30:00Z'
    },
    {
      name: 'Metformin',
      medicationCodeableConcept: { text: 'Metformin' },
      dosageInstruction: [{ text: '500mg twice daily with meals' }],
      source: 'staff' as const,
      enteredBy: 'Dr. Sarah Johnson',
      enteredAt: '2025-11-15T10:30:00Z'
    },
    {
      name: 'Daily Multivitamin',
      medicationCodeableConcept: { text: 'Daily Multivitamin' },
      dosageInstruction: [{ text: 'One tablet daily' }],
      source: 'patient' as const,
      enteredBy: 'Patient (Pre-Visit Form)',
      enteredAt: '2025-11-23T08:15:00Z'
    },
    {
      name: 'Ibuprofen',
      medicationCodeableConcept: { text: 'Ibuprofen (OTC)' },
      dosageInstruction: [{ text: '200mg as needed for headaches' }],
      source: 'patient' as const,
      enteredBy: 'Patient (Pre-Visit Form)',
      enteredAt: '2025-11-23T08:15:00Z'
    }
  ];

  const mockConditions = [
    {
      code: { text: 'Type 2 Diabetes Mellitus' },
      onsetDateTime: '2020-03-15',
      source: 'staff' as const,
      enteredBy: 'Dr. Sarah Johnson',
      enteredAt: '2020-03-15T14:20:00Z'
    },
    {
      code: { text: 'Hypertension' },
      onsetDateTime: '2019-08-22',
      source: 'staff' as const,
      enteredBy: 'Dr. Michael Chen',
      enteredAt: '2019-08-22T11:45:00Z'
    },
    {
      code: { text: 'Seasonal Allergies' },
      onsetDateTime: '2024-04-01',
      source: 'patient' as const,
      enteredBy: 'Patient (Pre-Visit Form)',
      enteredAt: '2025-11-23T08:15:00Z'
    }
  ];

  const mockAllergies = [
    {
      code: { text: 'Penicillin' },
      reaction: [{ manifestation: [{ coding: [{ display: 'Severe rash, difficulty breathing' }] }] }],
      source: 'staff' as const,
      enteredBy: 'Dr. Sarah Johnson',
      enteredAt: '2020-03-15T14:25:00Z'
    },
    {
      code: { text: 'Shellfish' },
      reaction: [{ manifestation: [{ coding: [{ display: 'Hives, swelling' }] }] }],
      source: 'patient' as const,
      enteredBy: 'Patient (Pre-Visit Form)',
      enteredAt: '2025-11-23T08:15:00Z'
    }
  ];

  const mockObservations = [
    {
      code: { text: 'Blood Pressure' },
      valueQuantity: { value: 128, unit: 'mmHg' },
      effectiveDateTime: '2025-11-20T09:00:00Z',
      source: 'staff' as const,
      enteredBy: 'Nurse Emily Rodriguez',
      enteredAt: '2025-11-20T09:00:00Z'
    },
    {
      code: { text: 'Blood Glucose (Fasting)' },
      value: '105 mg/dL',
      effectiveDateTime: '2025-11-23T08:00:00Z',
      source: 'patient' as const,
      enteredBy: 'Patient (Home Monitoring)',
      enteredAt: '2025-11-23T08:15:00Z'
    },
    {
      code: { text: 'Weight' },
      value: '185 lbs',
      effectiveDateTime: '2025-11-23T08:00:00Z',
      source: 'patient' as const,
      enteredBy: 'Patient (Pre-Visit Form)',
      enteredAt: '2025-11-23T08:15:00Z'
    }
  ];

  const filterData = (data: any[]) => {
    if (filterBySource === 'all') return data;
    return data.filter(item => item.source === filterBySource);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2>Patient Chart - Data Source Tracking</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              Demo Mode
            </Badge>
          </div>
        </div>
        <p className="text-gray-600">
          All patient-reported data is clearly marked to distinguish from staff-verified entries
        </p>
      </div>

      <InfoBanner 
        title="What is this section used for?"
        description="Demonstrate how patient-reported data (from forms, questionnaires, and self-reported information) is distinguished from staff-verified data within the EHR. View source attribution on all chart entries to help clinicians assess data reliability and provenance."
      />

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm mb-2">
                <strong>Data Source Indicators:</strong> All chart entries now include source attribution to help clinicians
                understand the origin and reliability of the information.
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-amber-600" />
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                      Patient-Reported
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    Information provided by the patient via forms, apps, or self-reported during intake. 
                    Should be verified by clinical staff.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs">
                      Staff-Verified
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    Clinical data entered and verified by healthcare providers. Includes clinician name and timestamp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant={showSourceIndicators ? "default" : "outline"}
          onClick={() => setShowSourceIndicators(!showSourceIndicators)}
          className={showSourceIndicators ? "bg-[#007CBE] hover:bg-[#006BA6]" : ""}
        >
          {showSourceIndicators ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
          {showSourceIndicators ? 'Source Indicators On' : 'Source Indicators Off'}
        </Button>

        <div className="flex items-center gap-2 border rounded-lg p-1 bg-white">
          <Filter className="w-4 h-4 text-gray-500 ml-2" />
          <Button
            size="sm"
            variant={filterBySource === 'all' ? "default" : "ghost"}
            onClick={() => setFilterBySource('all')}
            className={filterBySource === 'all' ? "bg-gray-700" : ""}
          >
            All Data
          </Button>
          <Button
            size="sm"
            variant={filterBySource === 'patient' ? "default" : "ghost"}
            onClick={() => setFilterBySource('patient')}
            className={filterBySource === 'patient' ? "bg-amber-600 hover:bg-amber-700" : ""}
          >
            <User className="w-3 h-3 mr-1" />
            Patient Only
          </Button>
          <Button
            size="sm"
            variant={filterBySource === 'staff' ? "default" : "ghost"}
            onClick={() => setFilterBySource('staff')}
            className={filterBySource === 'staff' ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <UserCheck className="w-3 h-3 mr-1" />
            Staff Only
          </Button>
        </div>
      </div>

      {/* Patient Chart Data */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base">Patient: David Johnson</h3>
                <Badge variant="outline">MRN: 12345678</Badge>
              </div>
              <p className="text-sm text-gray-600">DOB: March 15, 1975 (50 years old)</p>
            </CardHeader>
          </Card>

          <FHIRDataCardWithSource
            type="medications"
            data={filterData(mockMedications)}
            showSource={showSourceIndicators}
          />

          <FHIRDataCardWithSource
            type="conditions"
            data={filterData(mockConditions)}
            showSource={showSourceIndicators}
          />
        </div>

        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm mb-1">
                    <strong>New Patient-Reported Data</strong>
                  </div>
                  <p className="text-xs text-gray-700 mb-2">
                    Patient submitted pre-visit form on November 23, 2025 at 8:15 AM
                  </p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>2 new medications added</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>1 new condition reported</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>1 new allergy reported</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>2 vitals/observations added</span>
                    </div>
                  </div>
                  <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700">
                    Review & Verify
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <FHIRDataCardWithSource
            type="allergies"
            data={filterData(mockAllergies)}
            showSource={showSourceIndicators}
          />

          <FHIRDataCardWithSource
            type="observations"
            data={filterData(mockObservations)}
            showSource={showSourceIndicators}
          />
        </div>
      </div>

      {/* Clinical Workflow Notes */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm mb-2">
                <strong>Clinical Workflow Benefits:</strong>
              </div>
              <ul className="text-xs text-gray-700 space-y-1 list-disc pl-5">
                <li><strong>Audit Trail:</strong> Complete record of who entered data and when for compliance</li>
                <li><strong>Clinical Accuracy:</strong> Staff can identify which data needs verification during visits</li>
                <li><strong>Liability Protection:</strong> Clear distinction between patient-reported and clinically verified data</li>
                <li><strong>Workflow Efficiency:</strong> Filter to see only patient-reported data that needs review</li>
                <li><strong>Patient Engagement:</strong> Patients can contribute to their record while maintaining data integrity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
