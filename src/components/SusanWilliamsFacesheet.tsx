import { ArrowLeft, Calendar, Phone, Mail, MapPin, AlertCircle, Activity, Heart, Pill, FileText, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

interface SusanWilliamsFacesheetProps {
  onBack: () => void;
}

export function SusanWilliamsFacesheet({ onBack }: SusanWilliamsFacesheetProps) {
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
                <AvatarFallback className="bg-purple-100 text-purple-700">SW</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-gray-900">Williams, Susan</h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>MRN: 338822</span>
                  <span>•</span>
                  <span>DOB: 01/27/1967 (58y)</span>
                  <span>•</span>
                  <span>Female</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600">Active Patient</Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="col-span-2 space-y-6">
              {/* Snapshot */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Primary Care Provider</div>
                      <div className="text-sm">Dr. Sarah Chen</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Last Visit</div>
                      <div className="text-sm">August 15, 2025</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Next Appointment</div>
                      <div className="text-sm">November 30, 2025 at 2:00 PM</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Visit Type</div>
                      <div className="text-sm">Diabetes Follow-up</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Problems & Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    Problems & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">Active</Badge>
                      <div className="flex-1">
                        <div className="text-sm">Type 2 Diabetes Mellitus</div>
                        <div className="text-xs text-gray-600">Onset: 2018</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">Active</Badge>
                      <div className="flex-1">
                        <div className="text-sm">Hypertension</div>
                        <div className="text-xs text-gray-600">Onset: 2015</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">Active</Badge>
                      <div className="flex-1">
                        <div className="text-sm">Hyperlipidemia</div>
                        <div className="text-xs text-gray-600">Onset: 2016</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-orange-600" />
                    Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-sm">Metformin 1000mg</div>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      </div>
                      <div className="text-xs text-gray-600">Twice daily with meals</div>
                      <div className="text-xs text-gray-500 mt-1">Prescribed: Dr. Sarah Chen • Refills: 3</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-sm">Lisinopril 10mg</div>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      </div>
                      <div className="text-xs text-gray-600">Once daily in the morning</div>
                      <div className="text-xs text-gray-500 mt-1">Prescribed: Dr. Sarah Chen • Refills: 5</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-sm">Atorvastatin 20mg</div>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      </div>
                      <div className="text-xs text-gray-600">Once daily at bedtime</div>
                      <div className="text-xs text-gray-500 mt-1">Prescribed: Dr. Sarah Chen • Refills: 4</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Lab Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Recent Lab Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm">HbA1c</div>
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">Borderline</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">Result: 7.2%</div>
                        <div className="text-xs text-gray-500">August 15, 2025</div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm">Blood Pressure</div>
                        <Badge className="bg-green-100 text-green-800 text-xs">Normal</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">Result: 128/82 mmHg</div>
                        <div className="text-xs text-gray-500">August 15, 2025</div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm">LDL Cholesterol</div>
                        <Badge className="bg-green-100 text-green-800 text-xs">Normal</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">Result: 95 mg/dL</div>
                        <div className="text-xs text-gray-500">August 15, 2025</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-600">Mobile</div>
                      <div className="text-sm">(404) 555-0198</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-600">Email</div>
                      <div className="text-sm">susan.williams@email.com</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-600">Address</div>
                      <div className="text-sm">123 Peachtree St<br />Atlanta, GA 30308</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vitals */}
              <Card>
                <CardHeader>
                  <CardTitle>Latest Vitals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Height</span>
                    <span className="text-sm">5'4" (162 cm)</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Weight</span>
                    <span className="text-sm">168 lbs (76 kg)</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">BMI</span>
                    <span className="text-sm">28.8</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Temperature</span>
                    <span className="text-sm">98.6°F</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recorded</span>
                    <span className="text-sm">August 15, 2025</span>
                  </div>
                </CardContent>
              </Card>

              {/* Allergies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Allergies & Intolerances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm text-red-900">Penicillin</div>
                      <div className="text-xs text-red-700">Reaction: Rash</div>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-sm text-yellow-900">Sulfa Drugs</div>
                      <div className="text-xs text-yellow-700">Reaction: Hives</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insurance */}
              <Card>
                <CardHeader>
                  <CardTitle>Insurance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Primary Insurance</div>
                      <div className="text-sm">Blue Cross Blue Shield</div>
                      <div className="text-xs text-gray-500">Member ID: BCBS123456</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Group Number</div>
                      <div className="text-sm">GRP789012</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Policy Holder</div>
                      <div className="text-sm">Susan Williams (Self)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
