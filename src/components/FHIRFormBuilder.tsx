import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  Code,
  Smartphone,
  Monitor,
  Play,
  Settings,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Calendar,
  Hash,
  ToggleLeft,
  List,
  Upload,
  Edit3,
  Copy,
  Layers,
  GitBranch,
  Search,
  Clock,
  User,
  Database,
  Sparkles,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface FieldType {
  id: string;
  type: string;
  label: string;
  icon: any;
  fhirDefault: string;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  helpText?: string;
  required: boolean;
  validation?: any;
  conditionalLogic?: any[];
  fhirMapping?: {
    targetResource: string;
    targetPath: string;
    code?: {
      system: string;
      code: string;
      display: string;
    };
    unit?: string;
    createMode: 'create' | 'update' | 'ignoreIfExists';
    transform?: string;
  };
  options?: string[];
}

export function FHIRFormBuilder() {
  const [formTitle, setFormTitle] = useState('New Patient Intake Form');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeView, setActiveView] = useState<'builder' | 'preview' | 'test' | 'developer'>('builder');
  const [testSubmissionData, setTestSubmissionData] = useState<any>(null);

  const fieldTypes: FieldType[] = [
    { id: 'text', type: 'string', label: 'Short Text', icon: FileText, fhirDefault: 'Questionnaire' },
    { id: 'textarea', type: 'text', label: 'Long Text', icon: FileText, fhirDefault: 'Questionnaire' },
    { id: 'single-choice', type: 'choice', label: 'Single Choice', icon: ToggleLeft, fhirDefault: 'Questionnaire' },
    { id: 'multi-choice', type: 'choice', label: 'Multi Choice', icon: List, fhirDefault: 'Questionnaire' },
    { id: 'date', type: 'date', label: 'Date', icon: Calendar, fhirDefault: 'Questionnaire' },
    { id: 'datetime', type: 'dateTime', label: 'Date & Time', icon: Clock, fhirDefault: 'Questionnaire' },
    { id: 'number', type: 'integer', label: 'Number', icon: Hash, fhirDefault: 'Observation' },
    { id: 'decimal', type: 'decimal', label: 'Decimal', icon: Hash, fhirDefault: 'Observation' },
    { id: 'checkbox', type: 'boolean', label: 'Checkbox', icon: CheckCircle2, fhirDefault: 'Questionnaire' },
    { id: 'signature', type: 'attachment', label: 'Signature', icon: Edit3, fhirDefault: 'Provenance' },
    { id: 'file', type: 'attachment', label: 'File Upload', icon: Upload, fhirDefault: 'DocumentReference' },
    { id: 'group', type: 'group', label: 'Group', icon: Layers, fhirDefault: 'Questionnaire' },
  ];

  const fhirResources = [
    'Questionnaire',
    'Observation',
    'Condition',
    'MedicationRequest',
    'DocumentReference',
    'PractitionerRole',
    'AllergyIntolerance',
    'Procedure',
    'DiagnosticReport',
    'ServiceRequest',
    'Provenance',
  ];

  const codingSystems = [
    { value: 'http://loinc.org', label: 'LOINC' },
    { value: 'http://snomed.info/sct', label: 'SNOMED CT' },
    { value: 'http://www.nlm.nih.gov/research/umls/rxnorm', label: 'RxNorm' },
    { value: 'http://hl7.org/fhir/sid/icd-10', label: 'ICD-10' },
    { value: 'http://hl7.org/fhir/sid/cvx', label: 'CVX (Vaccines)' },
  ];

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const addField = (fieldType: FieldType) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType.type,
      label: `New ${fieldType.label}`,
      required: false,
      fhirMapping: {
        targetResource: fieldType.fhirDefault,
        targetPath: '',
        createMode: 'create',
      },
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
    toast.success(`Added ${fieldType.label} field`);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
    toast.success('Field deleted');
  };

  const duplicateField = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const newField = {
        ...field,
        id: `field-${Date.now()}`,
        label: `${field.label} (copy)`,
      };
      setFields([...fields, newField]);
      toast.success('Field duplicated');
    }
  };

  const runTestSubmission = () => {
    const questionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      id: `QR-${Date.now()}`,
      questionnaire: 'Questionnaire/new-patient-intake',
      status: 'completed',
      authored: new Date().toISOString(),
      subject: {
        reference: 'Patient/example-patient',
        display: 'John Doe',
      },
      item: fields.map(field => ({
        linkId: field.id,
        text: field.label,
        answer: [{
          valueString: field.type === 'string' ? 'Test Answer' : undefined,
          valueInteger: field.type === 'integer' ? 75 : undefined,
          valueBoolean: field.type === 'boolean' ? true : undefined,
        }],
      })),
    };

    // Generate mapped FHIR resources
    const mappedResources = fields
      .filter(f => f.fhirMapping && f.fhirMapping.targetResource !== 'Questionnaire')
      .map(field => {
        if (field.fhirMapping?.targetResource === 'Observation') {
          return {
            resourceType: 'Observation',
            id: `OBS-${Date.now()}`,
            status: 'final',
            code: field.fhirMapping.code || {
              coding: [{
                system: 'http://loinc.org',
                code: 'example-code',
                display: field.label,
              }],
            },
            subject: { reference: 'Patient/example-patient' },
            effectiveDateTime: new Date().toISOString(),
            valueQuantity: field.type === 'integer' || field.type === 'decimal' ? {
              value: 75,
              unit: field.fhirMapping.unit || 'unit',
            } : undefined,
            valueString: field.type === 'string' ? 'Test Value' : undefined,
          };
        }
        return null;
      })
      .filter(Boolean);

    setTestSubmissionData({
      questionnaireResponse,
      mappedResources,
    });
    setActiveView('test');
    toast.success('Test submission generated');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
              Back to Templates
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="font-semibold text-lg border-0 px-0 focus-visible:ring-0"
              />
              <Input
                placeholder="Add description..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="text-sm text-gray-600 border-0 px-0 focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Database className="w-3 h-3 mr-1" />
              FHIR R4
            </Badge>
            <Badge variant="outline" className="text-xs">
              v1.0.0
            </Badge>
            <Button variant="outline" size="sm" onClick={runTestSubmission}>
              <Play className="w-4 h-4 mr-2" />
              Test
            </Button>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button className="bg-[#007CBE] hover:bg-[#006BA6]" size="sm">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeView === 'builder' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('builder')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Builder
          </Button>
          <Button
            variant={activeView === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('preview')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant={activeView === 'test' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('test')}
          >
            <Play className="w-4 h-4 mr-2" />
            Test Submission
          </Button>
          <Button
            variant={activeView === 'developer' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('developer')}
          >
            <Code className="w-4 h-4 mr-2" />
            Developer Handoff
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {activeView === 'builder' && (
          <>
            {/* Field Palette */}
            <aside className="w-64 bg-white border-r overflow-y-auto">
              <div className="p-4">
                <h3 className="font-medium mb-3">Field Types</h3>
                <div className="space-y-2">
                  {fieldTypes.map(fieldType => {
                    const Icon = fieldType.icon;
                    return (
                      <button
                        key={fieldType.id}
                        onClick={() => addField(fieldType)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <Icon className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{fieldType.label}</div>
                          <div className="text-xs text-gray-500">{fieldType.fhirDefault}</div>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Canvas */}
            <main className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg border p-6 space-y-4">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold">{formTitle}</h2>
                    {formDescription && (
                      <p className="text-gray-600 mt-1">{formDescription}</p>
                    )}
                  </div>

                  {fields.length === 0 ? (
                    <div className="py-12 text-center">
                      <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Drag fields from the left palette to start building</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          onClick={() => setSelectedFieldId(field.id)}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedFieldId === field.id
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Label className="font-medium">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                {field.fhirMapping?.targetResource && (
                                  <Badge variant="outline" className="text-xs">
                                    {field.fhirMapping.targetResource}
                                  </Badge>
                                )}
                              </div>
                              {field.helpText && (
                                <p className="text-sm text-gray-500 mb-2">{field.helpText}</p>
                              )}
                              
                              {/* Field Preview */}
                              {field.type === 'string' && <Input placeholder="Type here..." disabled />}
                              {field.type === 'text' && <Textarea placeholder="Type here..." disabled rows={3} />}
                              {field.type === 'integer' && <Input type="number" placeholder="0" disabled />}
                              {field.type === 'date' && <Input type="date" disabled />}
                              {field.type === 'boolean' && (
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" disabled />
                                  <span className="text-sm">Yes</span>
                                </div>
                              )}
                              {field.type === 'choice' && field.options && (
                                <div className="space-y-2">
                                  {field.options.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <input type="radio" disabled />
                                      <span className="text-sm">{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* FHIR Mapping Preview */}
                              {field.fhirMapping && field.fhirMapping.code && (
                                <div className="mt-3 p-2 bg-gray-50 rounded text-xs font-mono">
                                  {field.fhirMapping.targetResource}(
                                  code: {field.fhirMapping.code.system.split('/').pop()} {field.fhirMapping.code.code}
                                  ) → {field.fhirMapping.targetPath || 'value'}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateField(field.id);
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteField(field.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* Property Inspector */}
            {selectedField && (
              <aside className="w-96 bg-white border-l overflow-y-auto">
                <PropertyInspector
                  field={selectedField}
                  onUpdate={(updates) => updateField(selectedField.id, updates)}
                  fhirResources={fhirResources}
                  codingSystems={codingSystems}
                />
              </aside>
            )}
          </>
        )}

        {activeView === 'preview' && (
          <PreviewMode
            formTitle={formTitle}
            formDescription={formDescription}
            fields={fields}
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
          />
        )}

        {activeView === 'test' && (
          <TestSubmissionView data={testSubmissionData} />
        )}

        {activeView === 'developer' && (
          <DeveloperHandoff
            formTitle={formTitle}
            fields={fields}
          />
        )}
      </div>
    </div>
  );
}

// Property Inspector Component
function PropertyInspector({ field, onUpdate, fhirResources, codingSystems }: any) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Field Properties</h3>
        <Badge variant="outline">{field.type}</Badge>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
          <TabsTrigger value="validation" className="text-xs">Validation</TabsTrigger>
          <TabsTrigger value="fhir" className="text-xs">FHIR</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Help Text</Label>
              <Textarea
                value={field.helpText || ''}
                onChange={(e) => onUpdate({ helpText: e.target.value })}
                rows={3}
                placeholder="Provide guidance to users..."
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <Label>Required Field</Label>
              <Switch
                checked={field.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
              />
            </div>

            {(field.type === 'choice') && (
              <div className="space-y-2">
                <Label>Answer Options</Label>
                {(field.options || []).map((opt: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[i] = e.target.value;
                        onUpdate({ options: newOptions });
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newOptions = field.options.filter((_: any, idx: number) => idx !== i);
                        onUpdate({ options: newOptions });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onUpdate({ options: [...(field.options || []), 'New Option'] });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="validation" className="space-y-4 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Validation Rules</h4>
              <p className="text-xs text-blue-700">
                Configure client-side validation for this field
              </p>
            </div>

            {(field.type === 'string' || field.type === 'text') && (
              <>
                <div className="space-y-2">
                  <Label>Min Length</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Max Length</Label>
                  <Input type="number" placeholder="255" />
                </div>
                <div className="space-y-2">
                  <Label>Pattern (Regex)</Label>
                  <Input placeholder="^[A-Za-z]+$" />
                </div>
              </>
            )}

            {(field.type === 'integer' || field.type === 'decimal') && (
              <>
                <div className="space-y-2">
                  <Label>Min Value</Label>
                  <Input type="number" />
                </div>
                <div className="space-y-2">
                  <Label>Max Value</Label>
                  <Input type="number" />
                </div>
                <div className="space-y-2">
                  <Label>Unit (UCUM)</Label>
                  <Input placeholder="bpm, mg, kg" />
                </div>
              </>
            )}

            <ConditionalLogicEditor field={field} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="fhir" className="space-y-4 mt-4">
            <FHIRMappingPanel
              field={field}
              onUpdate={onUpdate}
              fhirResources={fhirResources}
              codingSystems={codingSystems}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

// FHIR Mapping Panel Component
function FHIRMappingPanel({ field, onUpdate, fhirResources, codingSystems }: any) {
  const mapping = field.fhirMapping || {};

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Database className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-purple-900">FHIR Resource Mapping</h4>
            <p className="text-xs text-purple-700 mt-1">
              Map this field to a FHIR resource to auto-create structured data on submission
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Target FHIR Resource</Label>
        <Select
          value={mapping.targetResource || 'Questionnaire'}
          onValueChange={(value) => onUpdate({
            fhirMapping: { ...mapping, targetResource: value }
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fhirResources.map((resource: string) => (
              <SelectItem key={resource} value={resource}>
                {resource}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Default: Questionnaire (stores in QuestionnaireResponse only)
        </p>
      </div>

      {mapping.targetResource !== 'Questionnaire' && (
        <>
          <div className="space-y-2">
            <Label>FHIR Path / Target Element</Label>
            <Input
              value={mapping.targetPath || ''}
              onChange={(e) => onUpdate({
                fhirMapping: { ...mapping, targetPath: e.target.value }
              })}
              placeholder="e.g., valueQuantity.value or code.coding[0].code"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              FHIRPath expression relative to the target resource
            </p>
          </div>

          <div className="border-t pt-4">
            <Label className="mb-3 block">Standard Coding</Label>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">System</Label>
                <Select
                  value={mapping.code?.system || ''}
                  onValueChange={(value) => onUpdate({
                    fhirMapping: {
                      ...mapping,
                      code: { ...mapping.code, system: value }
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select coding system" />
                  </SelectTrigger>
                  <SelectContent>
                    {codingSystems.map((sys: any) => (
                      <SelectItem key={sys.value} value={sys.value}>
                        {sys.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs">Code</Label>
                  <Input
                    value={mapping.code?.code || ''}
                    onChange={(e) => onUpdate({
                      fhirMapping: {
                        ...mapping,
                        code: { ...mapping.code, code: e.target.value }
                      }
                    })}
                    placeholder="8867-4"
                    className="font-mono"
                  />
                </div>
                <Button variant="outline" size="sm" className="mt-6">
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Display</Label>
                <Input
                  value={mapping.code?.display || ''}
                  onChange={(e) => onUpdate({
                    fhirMapping: {
                      ...mapping,
                      code: { ...mapping.code, display: e.target.value }
                    }
                  })}
                  placeholder="Heart rate"
                />
              </div>
            </div>
          </div>

          {(field.type === 'integer' || field.type === 'decimal') && (
            <div className="space-y-2">
              <Label>Unit (UCUM)</Label>
              <Input
                value={mapping.unit || ''}
                onChange={(e) => onUpdate({
                  fhirMapping: { ...mapping, unit: e.target.value }
                })}
                placeholder="bpm, mg/dL, kg"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Create Mode</Label>
            <Select
              value={mapping.createMode || 'create'}
              onValueChange={(value: any) => onUpdate({
                fhirMapping: { ...mapping, createMode: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create">Create new resource</SelectItem>
                <SelectItem value="update">Update if exists</SelectItem>
                <SelectItem value="ignoreIfExists">Ignore if exists</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* FHIR Preview */}
          <div className="border-t pt-4">
            <Label className="mb-2 block text-xs">FHIR Resource Preview</Label>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
              <pre>
{`{
  "resourceType": "${mapping.targetResource}",
  ${mapping.code ? `"code": {
    "coding": [{
      "system": "${mapping.code.system}",
      "code": "${mapping.code.code}",
      "display": "${mapping.code.display}"
    }]
  },` : ''}
  "${mapping.targetPath || 'value'}": {{field-value}}
}`}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Conditional Logic Editor
function ConditionalLogicEditor({ field, onUpdate }: any) {
  return (
    <div className="border-t pt-4 mt-4">
      <Label className="mb-3 block">Conditional Logic</Label>
      <div className="bg-gray-50 border rounded-lg p-3">
        <p className="text-sm text-gray-600 mb-3">
          Show this field only when conditions are met
        </p>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Condition
        </Button>
      </div>
    </div>
  );
}

// Preview Mode Component
function PreviewMode({ formTitle, formDescription, fields, previewMode, onPreviewModeChange }: any) {
  return (
    <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Patient Preview</h3>
          <div className="flex gap-2">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPreviewModeChange('desktop')}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPreviewModeChange('mobile')}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile
            </Button>
          </div>
        </div>
      </div>

      <div className={`mx-auto ${previewMode === 'mobile' ? 'max-w-sm' : 'max-w-3xl'}`}>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-2">{formTitle}</h2>
          {formDescription && <p className="text-gray-600 mb-6">{formDescription}</p>}

          <div className="space-y-6">
            {fields.map((field: FormField) => (
              <div key={field.id}>
                <Label className="mb-2 block">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.helpText && (
                  <p className="text-sm text-gray-500 mb-2">{field.helpText}</p>
                )}

                {field.type === 'string' && <Input placeholder="Type here..." />}
                {field.type === 'text' && <Textarea placeholder="Type here..." rows={4} />}
                {field.type === 'integer' && <Input type="number" placeholder="0" />}
                {field.type === 'date' && <Input type="date" />}
                {field.type === 'boolean' && (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-sm">Yes</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-[#007CBE] hover:bg-[#006BA6]">Submit</Button>
          </div>
        </div>
      </div>
    </main>
  );
}

// Test Submission View
function TestSubmissionView({ data }: any) {
  if (!data) {
    return (
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No test data available. Run a test submission first.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h3 className="font-medium mb-4">Test Submission Results</h3>
          <Badge className="bg-green-100 text-green-700">Simulation Complete</Badge>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-medium mb-3">QuestionnaireResponse</h4>
          <ScrollArea className="h-[400px]">
            <pre className="text-xs font-mono bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
              {JSON.stringify(data.questionnaireResponse, null, 2)}
            </pre>
          </ScrollArea>
        </div>

        {data.mappedResources && data.mappedResources.length > 0 && (
          <div className="bg-white rounded-lg border p-6">
            <h4 className="font-medium mb-3">Mapped FHIR Resources ({data.mappedResources.length})</h4>
            <div className="space-y-4">
              {data.mappedResources.map((resource: any, index: number) => (
                <div key={index}>
                  <Badge variant="outline" className="mb-2">{resource.resourceType}</Badge>
                  <ScrollArea className="h-[300px]">
                    <pre className="text-xs font-mono bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
                      {JSON.stringify(resource, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Developer Handoff Component
function DeveloperHandoff({ formTitle, fields }: any) {
  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h3 className="font-medium mb-2">Developer Handoff Documentation</h3>
          <p className="text-gray-600">Complete API specifications and FHIR payload examples</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-medium mb-4">API Endpoints</h4>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-700">POST</Badge>
                <code className="text-sm font-mono">/api/fhir/QuestionnaireResponse</code>
              </div>
              <p className="text-sm text-gray-600 mb-3">Submit patient form response</p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs font-medium mb-2">Request Body:</p>
                <pre className="text-xs font-mono">
{`{
  "resourceType": "QuestionnaireResponse",
  "questionnaire": "Questionnaire/${formTitle.toLowerCase().replace(/\s+/g, '-')}",
  "status": "completed",
  "subject": { "reference": "Patient/\{\{patientId\}\}" },
  "item": [ /* field answers */ ]
}`}
                </pre>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-700">GET</Badge>
                <code className="text-sm font-mono">/api/fhir/Questionnaire/{'{{id}}'}</code>
              </div>
              <p className="text-sm text-gray-600">Retrieve form definition</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-medium mb-4">Field Mapping Table</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border">Field Label</th>
                  <th className="text-left p-3 border">FHIR Resource</th>
                  <th className="text-left p-3 border">Path</th>
                  <th className="text-left p-3 border">Code</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field: FormField) => (
                  <tr key={field.id}>
                    <td className="p-3 border font-medium">{field.label}</td>
                    <td className="p-3 border">
                      <Badge variant="outline">{field.fhirMapping?.targetResource || 'Questionnaire'}</Badge>
                    </td>
                    <td className="p-3 border font-mono text-xs">{field.fhirMapping?.targetPath || '-'}</td>
                    <td className="p-3 border font-mono text-xs">
                      {field.fhirMapping?.code?.code || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-medium mb-4">Complete Questionnaire Resource</h4>
          <ScrollArea className="h-[500px]">
            <pre className="text-xs font-mono bg-gray-900 text-green-400 p-4 rounded">
              {JSON.stringify({
                resourceType: 'Questionnaire',
                id: formTitle.toLowerCase().replace(/\s+/g, '-'),
                title: formTitle,
                status: 'active',
                item: fields.map((f: FormField) => ({
                  linkId: f.id,
                  type: f.type,
                  text: f.label,
                  required: f.required,
                  extension: f.fhirMapping ? [{
                    url: 'http://example.org/fhir/StructureDefinition/fhir-mapping',
                    extension: [
                      { url: 'targetResource', valueString: f.fhirMapping.targetResource },
                      { url: 'targetPath', valueString: f.fhirMapping.targetPath },
                    ]
                  }] : undefined
                }))
              }, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      </div>
    </main>
  );
}