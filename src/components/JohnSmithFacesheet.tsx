import { ArrowLeft, Calendar, Phone, Mail, MapPin, AlertCircle, Activity, Heart, Pill, FileText, User, Syringe, Users, TestTube } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

interface JohnSmithFacesheetProps {
  onBack: () => void;
  chartData?: any;
}

export function JohnSmithFacesheet({ onBack, chartData }: JohnSmithFacesheetProps) {
  const hasData = chartData && Object.keys(chartData).length > 0;

  // Vitals data for John Smith
  const vitals = {
    weight: '175 lbs',
    height: '5 ft 10 in',
    bmi: '25.1',
    bloodPressure: '122/78',
    heartRate: '68 bpm',
    temperature: '98.6°F',
    respiratoryRate: '14 /min',
    oxygenSaturation: '99%'
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Button>
            <div className="h-8 w-px bg-gray-300" />
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-[#1976D2] text-white">JS</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-gray-900">Smith, John</h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>MRN: 654321</span>
                  <span>•</span>
                  <span>DOB: 03/15/1980 (45y)</span>
                  <span>•</span>
                  <span>Male</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600">Active Patient</Badge>
            {hasData && <Badge className="bg-blue-600">Chart Updated</Badge>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {!hasData ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-400 mb-4">
                  <FileText className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg text-gray-900 mb-2">No Chart Data Available</h3>
                <p className="text-sm text-gray-600">
                  This patient's chart is empty. Accept pre-visit forms from the Tasks tab to populate the chart.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="col-span-2 space-y-6">
                {/* AI Snapshot */}
                <Card className="bg-[#E3F2FD] border-[#90CAF9]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#1976D2]">
                      <Activity className="w-5 h-5" />
                      AI Snapshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm text-gray-800">
                      <div className="flex gap-2">
                        <span className="text-gray-600">•</span>
                        <span>45-year-old male presenting for annual physical exam in good health</span>
                      </div>
                      {chartData.medicalHistory && chartData.medicalHistory.length > 0 && (
                        <div className="flex gap-2">
                          <span className="text-gray-600">•</span>
                          <span>Past medical history: {chartData.medicalHistory.map((h: any) => h.condition).join(', ')}</span>
                        </div>
                      )}
                      {chartData.medications && chartData.medications.length > 0 && (
                        <div className="flex gap-2">
                          <span className="text-gray-600">•</span>
                          <span>Currently on {chartData.medications.length} medications including {chartData.medications.slice(0, 2).map((m: any) => m.name).join(', ')}</span>
                        </div>
                      )}
                      {chartData.familyHistory && chartData.familyHistory.length > 0 && (
                        <div className="flex gap-2">
                          <span className="text-gray-600">•</span>
                          <span>Family history notable for {chartData.familyHistory.map((f: any) => f.condition).join(', ')}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <span className="text-gray-600">•</span>
                        <span>All vital signs within normal limits</span>
                      </div>
                    </div>
                    {chartData.lastUpdated && (
                      <div className="text-xs text-gray-600 mt-3 pt-3 border-t border-[#90CAF9]">
                        Chart last updated: {new Date(chartData.lastUpdated).toLocaleString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Encounter Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Current Visit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Visit Type</div>
                          <div className="text-sm">New Patient - Annual Physical</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Date</div>
                          <div className="text-sm">November 24, 2025</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Provider</div>
                          <div className="text-sm">Dr. Sarah Chen</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Facility</div>
                          <div className="text-sm">Automated Healthcare Practice</div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">Chief Complaint</div>
                        <div className="text-sm">Annual wellness visit - comprehensive evaluation</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Problems & Conditions */}
                {chartData.medicalHistory && chartData.medicalHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-600" />
                        Problems & Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {chartData.medicalHistory.map((item: any) => (
                          <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Badge variant="outline" className="mt-0.5 bg-red-50 text-red-700 border-red-200">
                              {item.status}
                            </Badge>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{item.condition}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                Diagnosed: {item.diagnosedYear}
                                {item.icd10 && ` • ICD-10: ${item.icd10}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Surgical History */}
                {chartData.surgicalHistory && chartData.surgicalHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Surgical History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {chartData.surgicalHistory.map((item: any) => (
                          <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{item.procedure}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                {item.year} - {item.hospital}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Family History */}
                {chartData.familyHistory && chartData.familyHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Family History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {chartData.familyHistory.map((item: any) => (
                          <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{item.condition}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                {item.relationship} - Age at diagnosis: {item.ageAtDiagnosis}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Vital Signs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      Vital Signs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Blood Pressure</span>
                        <span className="text-sm font-medium">{vitals.bloodPressure}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Heart Rate</span>
                        <span className="text-sm font-medium">{vitals.heartRate}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Temperature</span>
                        <span className="text-sm font-medium">{vitals.temperature}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Respiratory Rate</span>
                        <span className="text-sm font-medium">{vitals.respiratoryRate}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">SpO2</span>
                        <span className="text-sm font-medium">{vitals.oxygenSaturation}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Weight</span>
                        <span className="text-sm font-medium">{vitals.weight}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Height</span>
                        <span className="text-sm font-medium">{vitals.height}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">BMI</span>
                        <span className="text-sm font-medium">{vitals.bmi}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medications */}
                {chartData.medications && chartData.medications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="w-5 h-5 text-orange-600" />
                        Current Medications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {chartData.medications.map((item: any) => (
                          <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="text-sm font-medium">{item.name}</div>
                              <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                            </div>
                            <div className="text-xs text-gray-600">{item.dosage}</div>
                            <div className="text-xs text-gray-600">{item.frequency}</div>
                            {item.prescribedBy && (
                              <div className="text-xs text-gray-500 mt-1">By: {item.prescribedBy}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Allergies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Allergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium">Penicillin</div>
                        <div className="text-xs text-gray-600 mt-1">Reaction: Dry cough</div>
                        <div className="text-xs text-gray-600">Severity: Moderate</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium">Ibuprofen</div>
                        <div className="text-xs text-gray-600 mt-1">Reaction: Angioedema (Delayed)</div>
                        <div className="text-xs text-gray-600">Severity: Severe</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium">Lisinopril</div>
                        <div className="text-xs text-gray-600 mt-1">Reaction: Dry cough</div>
                        <div className="text-xs text-gray-600">Severity: Moderate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Social History */}
                {chartData.socialHistory && chartData.socialHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        Social History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {chartData.socialHistory.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                            <span className="text-sm text-gray-600">{item.category}</span>
                            <span className="text-sm font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Immunizations */}
                {chartData.immunizations && chartData.immunizations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Syringe className="w-5 h-5 text-teal-600" />
                        Immunizations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {chartData.immunizations.map((item: any) => (
                          <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium">{item.vaccine}</div>
                            <div className="text-xs text-gray-600 mt-1">{item.date}</div>
                            {item.provider && (
                              <div className="text-xs text-gray-500">{item.provider}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lab Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="w-5 h-5 text-purple-600" />
                      Recent Labs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-sm font-medium">Glucose</div>
                          <Badge className="bg-green-100 text-green-700 text-xs">Normal</Badge>
                        </div>
                        <div className="text-xs text-gray-600">88 mg/dL (70-100)</div>
                        <div className="text-xs text-gray-500">June 10, 2025</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-sm font-medium">HbA1c</div>
                          <Badge className="bg-green-100 text-green-700 text-xs">Normal</Badge>
                        </div>
                        <div className="text-xs text-gray-600">5.1% (&lt; 5.7%)</div>
                        <div className="text-xs text-gray-500">June 10, 2025</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}