import { ArrowLeft, Calendar, Phone, Mail, MapPin, AlertCircle, Activity, Heart, Pill, FileText, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

interface DavidJohnsonFacesheetProps {
  onBack: () => void;
}

export function DavidJohnsonFacesheet({ onBack }: DavidJohnsonFacesheetProps) {
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
                <AvatarFallback className="bg-blue-100 text-blue-700">DJ</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-gray-900">Johnson, David</h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>MRN: 65432</span>
                  <span>•</span>
                  <span>DOB: 03/15/1986 (39y)</span>
                  <span>•</span>
                  <span>Male</span>
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
                      <div className="text-sm">Dr. Michael Rodriguez</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Last Visit</div>
                      <div className="text-sm">November 24, 2025</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Next Appointment</div>
                      <div className="text-sm">December 8, 2025 at 10:00 AM</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Visit Type</div>
                      <div className="text-sm">Annual Physical</div>
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
                        <div className="text-sm">Seasonal Allergies</div>
                        <div className="text-xs text-gray-600">Onset: 2010</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">Resolved</Badge>
                      <div className="flex-1">
                        <div className="text-sm">Lower Back Pain</div>
                        <div className="text-xs text-gray-600">Onset: 2024 • Resolved: 2025</div>
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
                        <div className="text-sm">Cetirizine 10mg</div>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      </div>
                      <div className="text-xs text-gray-600">Once daily as needed for allergies</div>
                      <div className="text-xs text-gray-500 mt-1">Prescribed: Dr. Michael Rodriguez • Refills: 6</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-sm">Ibuprofen 400mg</div>
                        <Badge variant="outline" className="text-xs">PRN</Badge>
                      </div>
                      <div className="text-xs text-gray-600">As needed for pain (max 3x daily)</div>
                      <div className="text-xs text-gray-500 mt-1">Prescribed: Dr. Michael Rodriguez • Refills: 2</div>
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
                        <div className="text-sm">Complete Blood Count</div>
                        <Badge className="bg-green-100 text-green-800 text-xs">Normal</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">All values within normal range</div>
                        <div className="text-xs text-gray-500">November 24, 2025</div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm">Blood Pressure</div>
                        <Badge className="bg-green-100 text-green-800 text-xs">Normal</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">Result: 118/76 mmHg</div>
                        <div className="text-xs text-gray-500">November 24, 2025</div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm">Cholesterol Panel</div>
                        <Badge className="bg-green-100 text-green-800 text-xs">Normal</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">Total: 185 mg/dL, LDL: 110 mg/dL, HDL: 55 mg/dL</div>
                        <div className="text-xs text-gray-500">November 24, 2025</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Immunizations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-600" />
                    Recent Immunizations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm">Influenza Vaccine</div>
                        <div className="text-xs text-gray-600">2025-2026 Season</div>
                      </div>
                      <div className="text-xs text-gray-500">October 15, 2025</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm">Tdap Booster</div>
                        <div className="text-xs text-gray-600">Tetanus, Diphtheria, Pertussis</div>
                      </div>
                      <div className="text-xs text-gray-500">March 20, 2023</div>
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
                      <div className="text-sm">(916) 555-0199</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-600">Email</div>
                      <div className="text-sm">david.johnson@email.com</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-600">Address</div>
                      <div className="text-sm">456 River Rd<br />Sacramento, CA 95653</div>
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
                    <span className="text-sm">5'11" (180 cm)</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Weight</span>
                    <span className="text-sm">185 lbs (84 kg)</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">BMI</span>
                    <span className="text-sm">25.8</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Temperature</span>
                    <span className="text-sm">98.4°F</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Heart Rate</span>
                    <span className="text-sm">72 bpm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recorded</span>
                    <span className="text-sm">November 24, 2025</span>
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
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-sm text-yellow-900">Pollen (Environmental)</div>
                      <div className="text-xs text-yellow-700">Reaction: Rhinitis, Watery eyes</div>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-900">No Known Drug Allergies</div>
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
                      <div className="text-sm">Kaiser Permanente</div>
                      <div className="text-xs text-gray-500">Member ID: KP987654321</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Group Number</div>
                      <div className="text-sm">GRP456789</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Policy Holder</div>
                      <div className="text-sm">David Johnson (Self)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Name</div>
                      <div className="text-sm">Sarah Johnson (Spouse)</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Phone</div>
                      <div className="text-sm">(916) 555-0200</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Relationship</div>
                      <div className="text-sm">Spouse</div>
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
