import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ClipboardList, 
  Plus, 
  GripVertical, 
  Save, 
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  FileText,
  Shield,
  File,
  ArrowRight,
  Sparkles,
  Info,
  Target
} from 'lucide-react';

export function ChecklistBuilderGuide() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2>Checklist Builder Guide</h2>
            <p className="text-gray-600">Learn how to create and save patient checklists</p>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm">
              1
            </div>
            <div>
              <p className="font-medium mb-1">Navigate to Form Templates</p>
              <p className="text-sm text-gray-700">
                Go to <strong>Form Templates</strong> in the sidebar
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm">
              2
            </div>
            <div>
              <p className="font-medium mb-1">Create New Checklist</p>
              <p className="text-sm text-gray-700">
                Click <strong>"Create New"</strong> dropdown → Select <strong>"Checklist"</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm">
              3
            </div>
            <div>
              <p className="font-medium mb-1">Build Your Checklist</p>
              <p className="text-sm text-gray-700">
                Add forms, consents, and documents. Drag to reorder. Configure requirements.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm">
              4
            </div>
            <div>
              <p className="font-medium mb-1">Save & Deploy</p>
              <p className="text-sm text-gray-700">
                Click <strong>"Save Checklist"</strong> to generate a FHIR PlanDefinition resource
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Features */}
      <div className="grid grid-cols-2 gap-6">
        {/* Builder Tab */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Builder Tab
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm mb-3">Create and organize checklist items:</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Checklist Name & Description</strong>
                    <p className="text-gray-600 text-xs">Define the purpose and category</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Add Items from Library</strong>
                    <p className="text-gray-600 text-xs">Select forms, consents, or documents</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Drag & Drop Reordering</strong>
                    <p className="text-gray-600 text-xs">Use <GripVertical className="w-3 h-3 inline" /> handle to reorder</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Configure Each Item</strong>
                    <p className="text-gray-600 text-xs">Set estimated time, required flag, instructions</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-900">
                  Items marked as <Badge variant="destructive" className="text-xs mx-1">Required</Badge> must be completed before patient can proceed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Rules Tab */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Assignment Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm mb-3">Control when checklists are assigned:</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Appointment Types</strong>
                    <p className="text-gray-600 text-xs">New Patient, Annual Physical, Follow-up, etc.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Providers</strong>
                    <p className="text-gray-600 text-xs">Assign to specific doctors or providers</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Locations</strong>
                    <p className="text-gray-600 text-xs">Main campus, satellite clinics, specific offices</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-purple-900">
                  Checklists are automatically assigned to patients based on these rules when appointments are scheduled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Checklist Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">Forms</span>
              </div>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• New Patient Intake Form</li>
                <li>• Annual Physical Questionnaire</li>
                <li>• COVID-19 Screening</li>
                <li>• Pre-Visit Health Update</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm">Consents</span>
              </div>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• HIPAA Privacy Consent</li>
                <li>• Financial Responsibility Agreement</li>
                <li>• Treatment Consent</li>
                <li>• Telehealth Consent</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <File className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-sm">Documents</span>
              </div>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Welcome Letter</li>
                <li>• Office Policies</li>
                <li>• Insurance Information</li>
                <li>• Patient Rights Notice</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What Gets Saved */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Save className="w-5 h-5 text-green-600" />
            What Gets Saved
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">When you click <strong>"Save Checklist"</strong>, the system creates:</p>
          
          <div className="bg-white border border-green-200 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">FHIR PlanDefinition Resource</p>
                  <p className="text-xs text-gray-600">
                    Standard FHIR R4 resource that defines the workflow and sequence of actions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">Unique Checklist URL</p>
                  <p className="text-xs text-gray-600">
                    Generated URL like <code className="bg-gray-100 px-1 rounded">https://gpmobile.app/checklist/abc123</code>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">Assignment Rules</p>
                  <p className="text-xs text-gray-600">
                    UseContext mappings for appointment types, providers, and locations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">Patient-Facing To-Do List</p>
                  <p className="text-xs text-gray-600">
                    Automatically appears in patient app with progress tracking and estimated completion time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Example: New Patient Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">New Patient Onboarding</span>
                <Badge>8 items</Badge>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Complete these items before your first appointment at ABC Family Medicine
              </p>
              <div className="space-y-2">
                {[
                  { name: 'New Patient Intake Form', type: 'Form', time: '10-15 min', required: true },
                  { name: 'HIPAA Privacy Consent', type: 'Consent', time: '3-5 min', required: true },
                  { name: 'Financial Responsibility Agreement', type: 'Consent', time: '3-5 min', required: true },
                  { name: 'Insurance Information', type: 'Document', time: '5-10 min', required: true },
                  { name: 'Welcome Letter', type: 'Document', time: '2-3 min', required: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs bg-white border rounded p-2">
                    <Badge variant="outline" className="text-xs">{idx + 1}</Badge>
                    <span className="flex-1">{item.name}</span>
                    <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                    <span className="text-gray-500">{item.time}</span>
                    {item.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-amber-600">💡</span>
              <span><strong>Order matters:</strong> Place most important/required items first</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600">💡</span>
              <span><strong>Be realistic with time estimates:</strong> Patients appreciate accuracy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600">💡</span>
              <span><strong>Use clear instructions:</strong> Help patients understand why each item is needed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600">💡</span>
              <span><strong>Test your checklist:</strong> Use the Preview tab to see patient view</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600">💡</span>
              <span><strong>Version control:</strong> Edit existing checklists to maintain history</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
