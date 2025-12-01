import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  FileText,
  Database,
  Play,
  Eye,
  Code,
  GitBranch,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export function FormBuilderQuickGuide({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-8 h-8" />
          <h1 className="text-white">FHIR-Aware Form & Consent Builder</h1>
        </div>
        <p className="text-blue-100 text-lg mb-6 max-w-3xl">
          Create FHIR-compliant forms with drag-and-drop simplicity. Map fields to FHIR resources,
          add conditional logic, and generate structured clinical data automatically.
        </p>
        <div className="flex items-center gap-4">
          <Button onClick={onGetStarted} className="bg-white text-blue-600 hover:bg-gray-100">
            <Sparkles className="w-4 h-4 mr-2" />
            Create Your First Form
          </Button>
          <Badge className="bg-white/20 text-white text-sm">FHIR R4 Compliant</Badge>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-medium mb-2">12 Field Types</h3>
          <p className="text-sm text-gray-600 mb-4">
            Text, numbers, dates, choices, signatures, file uploads, and more with automatic FHIR defaults
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">Text</Badge>
            <Badge variant="outline" className="text-xs">Number</Badge>
            <Badge variant="outline" className="text-xs">Date</Badge>
            <Badge variant="outline" className="text-xs">Choice</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Database className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-medium mb-2">FHIR Mapping</h3>
          <p className="text-sm text-gray-600 mb-4">
            Map fields to 11+ FHIR resources with LOINC, SNOMED, ICD-10 codes. Create structured data automatically.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">Observation</Badge>
            <Badge variant="outline" className="text-xs">Condition</Badge>
            <Badge variant="outline" className="text-xs">Medication</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <GitBranch className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-medium mb-2">Conditional Logic</h3>
          <p className="text-sm text-gray-600 mb-4">
            Show/hide fields based on answers. Support for AND/OR conditions with visual rule builder.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">Show/Hide</Badge>
            <Badge variant="outline" className="text-xs">Required</Badge>
            <Badge variant="outline" className="text-xs">Disable</Badge>
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="bg-white rounded-lg border p-8">
        <h2 className="mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                1
              </div>
              <h4 className="font-medium">Build</h4>
            </div>
            <p className="text-sm text-gray-600">
              Drag fields from palette. Configure labels, validation, and FHIR mapping in property inspector.
            </p>
            <ArrowRight className="hidden md:block absolute -right-8 top-3 w-5 h-5 text-gray-300" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center font-semibold text-purple-600">
                2
              </div>
              <h4 className="font-medium">Preview</h4>
            </div>
            <p className="text-sm text-gray-600">
              Test your form in desktop and mobile views. See exactly what patients will experience.
            </p>
            <ArrowRight className="hidden md:block absolute -right-8 top-3 w-5 h-5 text-gray-300" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-semibold text-green-600">
                3
              </div>
              <h4 className="font-medium">Test</h4>
            </div>
            <p className="text-sm text-gray-600">
              Run test submissions. View generated QuestionnaireResponse and mapped FHIR resources.
            </p>
            <ArrowRight className="hidden md:block absolute -right-8 top-3 w-5 h-5 text-gray-300" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center font-semibold text-amber-600">
                4
              </div>
              <h4 className="font-medium">Publish</h4>
            </div>
            <p className="text-sm text-gray-600">
              Publish with version control. Get complete developer handoff docs with API examples.
            </p>
          </div>
        </div>
      </div>

      {/* FHIR Resource Mapping Example */}
      <div className="bg-white rounded-lg border p-8">
        <h2 className="mb-4">FHIR Mapping Example</h2>
        <p className="text-gray-600 mb-6">
          Example: A "Heart Rate" field automatically creates a FHIR Observation resource with LOINC coding
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-3 text-gray-700">Field Configuration</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Label:</span>
                <span className="font-medium">Resting Heart Rate</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <Badge variant="outline" className="text-xs">Decimal</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resource:</span>
                <Badge className="bg-purple-100 text-purple-700 text-xs">Observation</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Code:</span>
                <span className="font-mono text-xs">LOINC 8867-4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit:</span>
                <span className="font-mono text-xs">bpm</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3 text-gray-700">Generated FHIR Resource</h4>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs font-mono">
{`{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "8867-4",
      "display": "Heart rate"
    }]
  },
  "valueQuantity": {
    "value": 72,
    "unit": "bpm"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-3xl font-semibold text-blue-600 mb-2">12</div>
          <div className="text-sm text-gray-600">Field Types</div>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-3xl font-semibold text-purple-600 mb-2">11+</div>
          <div className="text-sm text-gray-600">FHIR Resources</div>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-3xl font-semibold text-green-600 mb-2">5</div>
          <div className="text-sm text-gray-600">Coding Systems</div>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-3xl font-semibold text-amber-600 mb-2">100%</div>
          <div className="text-sm text-gray-600">FHIR R4 Compliant</div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <h3 className="mb-3">Ready to Build Your First Form?</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Start creating FHIR-compliant forms in minutes. No coding required.
          Full developer handoff documentation included.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={onGetStarted} className="bg-[#007CBE] hover:bg-[#006BA6]">
            <Sparkles className="w-4 h-4 mr-2" />
            Get Started
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            View Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}
