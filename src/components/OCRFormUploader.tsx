import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Eye,
  Edit,
  Save,
  AlertCircle,
  FileImage,
  Loader2,
  Wand2,
  Trash2,
  Plus,
  GripVertical,
  Database
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface OCRFormUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExtractedField {
  id: string;
  type: 'text' | 'boolean' | 'choice' | 'date' | 'integer' | 'decimal' | 'attachment' | 'string';
  text: string;
  required: boolean;
  fhirMapping?: string;
  options?: string[];
}

export function OCRFormUploader({ open, onOpenChange }: OCRFormUploaderProps) {
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'success'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [formMetadata, setFormMetadata] = useState({
    title: '',
    description: '',
    type: 'consent' as 'consent' | 'form' | 'intake' | 'assessment' | 'questionnaire' | 'checklist' | 'registration' | 'screening',
    language: 'en',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      
      toast.success(`File "${selectedFile.name}" selected`);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const startOCRProcessing = async () => {
    if (!file) return;

    setStep('processing');
    setProgress(0);

    try {
      // Step 1: Upload and convert to base64
      setProgress(20);
      toast.info('Uploading document...');
      
      const base64 = await fileToBase64(file);
      
      // Step 2: Call backend OCR endpoint
      setProgress(40);
      toast.info('Detecting text with OCR...');

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/ocr/extract-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          imageBase64: base64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OCR API error:', errorData);
        throw new Error(errorData.error || `OCR API error: ${response.statusText}`);
      }

      setProgress(60);
      toast.info('Analyzing document structure...');

      const data = await response.json();
      const extractedData = data.fields || [];

      setProgress(80);
      
      // Check if fallback data was used
      if (data.usedFallback) {
        toast.warning(data.message || 'Using sample data for demonstration');
      } else {
        toast.info('Identifying form fields...');
      }

      // Convert to our field format
      const fields: ExtractedField[] = extractedData.map((field: any, index: number) => ({
        id: `field-${Date.now()}-${index}`,
        type: field.type || 'text',
        text: field.text || 'Untitled Field',
        required: field.required || false,
        fhirMapping: field.fhirMapping || undefined,
        options: field.options || undefined,
      }));

      setProgress(100);
      toast.info('Mapping to FHIR resources...');

      // Auto-detect form metadata from content
      const detectedTitle = file.name.includes('HIPAA') 
        ? 'HIPAA Privacy Consent Form'
        : file.name.includes('consent')
        ? 'Patient Consent Form'
        : file.name.includes('intake')
        ? 'Patient Intake Form'
        : file.name.includes('registration')
        ? 'Patient Registration Form'
        : 'Extracted Form';

      setFormMetadata({
        ...formMetadata,
        title: detectedTitle,
        description: `Auto-generated from ${file.name} using AI OCR`,
      });

      setExtractedFields(fields.length > 0 ? fields : getFallbackFields());
      setStep('review');
      toast.success(`OCR complete! Extracted ${fields.length} fields.`);
      
    } catch (error) {
      console.error('OCR processing error:', error);
      toast.error('OCR processing failed. Using sample data.');
      
      // Use fallback data on error
      setExtractedFields(getFallbackFields());
      setFormMetadata({
        ...formMetadata,
        title: 'Extracted Form',
        description: `Fallback extraction from ${file?.name}`,
      });
      setStep('review');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const getFallbackFields = (): ExtractedField[] => {
    return [
      {
        id: 'field-1',
        type: 'text',
        text: 'Patient Full Name',
        required: true,
        fhirMapping: 'Patient.name'
      },
      {
        id: 'field-2',
        type: 'date',
        text: 'Date of Birth',
        required: true,
        fhirMapping: 'Patient.birthDate'
      },
      {
        id: 'field-3',
        type: 'text',
        text: 'Phone Number',
        required: true,
        fhirMapping: 'Patient.telecom'
      },
      {
        id: 'field-4',
        type: 'text',
        text: 'Email Address',
        required: false,
        fhirMapping: 'Patient.telecom'
      },
      {
        id: 'field-5',
        type: 'boolean',
        text: 'I acknowledge that I have read and understood this form',
        required: true,
        fhirMapping: 'Consent.provision.action'
      },
    ];
  };

  const updateField = (id: string, updates: Partial<ExtractedField>) => {
    setExtractedFields(fields =>
      fields.map(field => field.id === id ? { ...field, ...updates } : field)
    );
  };

  const removeField = (id: string) => {
    setExtractedFields(fields => fields.filter(field => field.id !== id));
    toast.success('Field removed');
  };

  const addNewField = () => {
    const newField: ExtractedField = {
      id: `field-${Date.now()}`,
      type: 'text',
      text: 'New Field',
      required: false,
    };
    setExtractedFields([...extractedFields, newField]);
  };

  const handleSaveForm = async () => {
    // Create FHIR Questionnaire resource
    const fhirQuestionnaire = {
      resourceType: 'Questionnaire',
      id: `Q-${Math.random().toString(36).substr(2, 9)}`,
      status: 'draft',
      title: formMetadata.title,
      description: formMetadata.description,
      subjectType: ['Patient'],
      item: extractedFields.map((field, index) => ({
        linkId: field.id,
        text: field.text,
        type: field.type === 'boolean' ? 'boolean' : field.type === 'choice' ? 'choice' : field.type,
        required: field.required,
        ...(field.options && {
          answerOption: field.options.map(opt => ({ valueCoding: { display: opt } }))
        }),
        ...(field.fhirMapping && {
          extension: [{
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
            valueString: field.fhirMapping
          }]
        })
      })),
      meta: {
        tag: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
          code: 'OCR_GENERATED',
          display: 'Generated from OCR'
        }]
      },
      date: new Date().toISOString(),
      publisher: 'BASE Admin Hub - OCR System'
    };

    console.log('Created FHIR Questionnaire:', fhirQuestionnaire);
    
    // Save to backend
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/ocr/save-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          ...fhirQuestionnaire,
          metadata: formMetadata,
          createdAt: new Date().toISOString(),
          type: formMetadata.type,
          language: formMetadata.language
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save form');
      }

      const result = await response.json();
      console.log('Form saved to backend:', result);
      
      toast.success(`Form "${formMetadata.title}" saved successfully!`);
      setStep('success');

      setTimeout(() => {
        onOpenChange(false);
        resetState();
      }, 2000);
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form. Please try again.');
    }
  };

  const resetState = () => {
    setStep('upload');
    setFile(null);
    setPreviewUrl('');
    setProgress(0);
    setExtractedFields([]);
    setFormMetadata({
      title: '',
      description: '',
      type: 'consent',
      language: 'en',
    });
  };

  const getFieldTypeIcon = (type: string) => {
    const icons = {
      text: '📝',
      boolean: '☑️',
      choice: '🔘',
      date: '📅',
      integer: '🔢',
      decimal: '🔢',
      attachment: '📎',
      string: '📝',
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-[98vw] max-h-[98vh] h-[98vh] overflow-hidden p-0 !max-w-[98vw]">
        <DialogHeader className="p-6 pb-4 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            OCR Form Builder - Upload & Extract
          </DialogTitle>
          <DialogDescription>
            Upload a PDF or image of any form (consent, intake, assessment, checklist, screening, registration). Our AI will read it and auto-generate a FHIR-compliant digital form.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 pb-6">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Upload Area */}
                <div>
                  <Label className="mb-3 block">Upload Document</Label>
                  <div
                    onClick={handleUploadClick}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="font-medium mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500 mb-4">PDF, PNG, JPG, TIFF (max. 10MB)</p>
                    {file && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 justify-center">
                          <FileImage className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-900">{file.name}</span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>

                  {previewUrl && (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <img src={previewUrl} alt="Preview" className="w-full h-64 object-contain bg-gray-50" />
                    </div>
                  )}
                </div>

                {/* Form Details */}
                <div className="space-y-4">
                  <div>
                    <Label>Form Type</Label>
                    <Select value={formMetadata.type} onValueChange={(value: any) => setFormMetadata({ ...formMetadata, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consent">Consent Form</SelectItem>
                        <SelectItem value="form">Intake Form</SelectItem>
                        <SelectItem value="intake">Intake Form</SelectItem>
                        <SelectItem value="assessment">Assessment Form</SelectItem>
                        <SelectItem value="questionnaire">Questionnaire</SelectItem>
                        <SelectItem value="checklist">Checklist</SelectItem>
                        <SelectItem value="registration">Registration Form</SelectItem>
                        <SelectItem value="screening">Screening Form</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Language</Label>
                    <Select value={formMetadata.language} onValueChange={(value) => setFormMetadata({ ...formMetadata, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-purple-600" />
                        AI-Powered OCR Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Automatically detect form fields and checkboxes</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Smart FHIR resource mapping</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Identify required vs. optional fields</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Multi-language support</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Preserve legal text and formatting</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={startOCRProcessing}
                    disabled={!file}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start OCR Processing
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Processing */}
          {step === 'processing' && (
            <div className="space-y-6 p-12 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Processing with AI OCR...</h3>
                <p className="text-gray-600 mb-6">This may take a few moments</p>
              </div>
              <div className="max-w-md mx-auto">
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-gray-600">{progress}% complete</p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <div className="space-y-6 p-6">
              <Tabs defaultValue="fields">
                <TabsList>
                  <TabsTrigger value="fields">Extracted Fields ({extractedFields.length})</TabsTrigger>
                  <TabsTrigger value="metadata">Form Metadata</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="fields" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {extractedFields.filter(f => f.fhirMapping).length} FHIR Mapped
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 border-blue-200">
                        {extractedFields.filter(f => f.required).length} Required
                      </Badge>
                    </div>
                    <Button onClick={addNewField} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Field
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {extractedFields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="cursor-move mt-1">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{index + 1}</Badge>
                              <span className="text-lg">{getFieldTypeIcon(field.type)}</span>
                              <Input
                                value={field.text}
                                onChange={(e) => updateField(field.id, { text: e.target.value })}
                                className="flex-1 font-medium"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs mb-1">Field Type</Label>
                                <Select value={field.type} onValueChange={(value: any) => updateField(field.id, { type: value })}>
                                  <SelectTrigger className="text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="boolean">Checkbox</SelectItem>
                                    <SelectItem value="choice">Multiple Choice</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="integer">Number</SelectItem>
                                    <SelectItem value="decimal">Decimal</SelectItem>
                                    <SelectItem value="attachment">Attachment</SelectItem>
                                    <SelectItem value="string">String</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-xs mb-1">FHIR Mapping</Label>
                                <Select value={field.fhirMapping} onValueChange={(value) => updateField(field.id, { fhirMapping: value })}>
                                  <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Select..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Patient.name">Patient.name</SelectItem>
                                    <SelectItem value="Patient.birthDate">Patient.birthDate</SelectItem>
                                    <SelectItem value="Patient.address">Patient.address</SelectItem>
                                    <SelectItem value="Patient.telecom">Patient.telecom</SelectItem>
                                    <SelectItem value="Patient.contact.name">Patient.contact.name</SelectItem>
                                    <SelectItem value="Consent.provision.action">Consent.provision.action</SelectItem>
                                    <SelectItem value="Consent.provision.purpose">Consent.provision.purpose</SelectItem>
                                    <SelectItem value="Observation.value">Observation.value</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-end gap-2">
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="checkbox"
                                    id={`required-${field.id}`}
                                    checked={field.required}
                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                    className="rounded"
                                  />
                                  <Label htmlFor={`required-${field.id}`} className="text-xs">
                                    Required
                                  </Label>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeField(field.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </div>

                            {field.type === 'choice' && (
                              <div>
                                <Label className="text-xs mb-1">Options (comma-separated)</Label>
                                <Input
                                  value={field.options?.join(', ') || ''}
                                  onChange={(e) => updateField(field.id, { 
                                    options: e.target.value.split(',').map(o => o.trim()).filter(Boolean)
                                  })}
                                  placeholder="Option 1, Option 2, Option 3"
                                  className="text-sm"
                                />
                              </div>
                            )}

                            {field.fhirMapping && (
                              <Badge className="bg-purple-100 text-purple-700 text-xs">
                                <Database className="w-3 h-3 mr-1" />
                                {field.fhirMapping}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Form Title *</Label>
                      <Input
                        value={formMetadata.title}
                        onChange={(e) => setFormMetadata({ ...formMetadata, title: e.target.value })}
                        placeholder="e.g., HIPAA Privacy Consent"
                      />
                    </div>
                    <div>
                      <Label>Form Type</Label>
                      <Select value={formMetadata.type} onValueChange={(value: any) => setFormMetadata({ ...formMetadata, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consent">Consent Form</SelectItem>
                          <SelectItem value="form">Intake Form</SelectItem>
                          <SelectItem value="intake">Intake Form</SelectItem>
                          <SelectItem value="assessment">Assessment Form</SelectItem>
                          <SelectItem value="questionnaire">Questionnaire</SelectItem>
                          <SelectItem value="checklist">Checklist</SelectItem>
                          <SelectItem value="registration">Registration Form</SelectItem>
                          <SelectItem value="screening">Screening Form</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formMetadata.description}
                      onChange={(e) => setFormMetadata({ ...formMetadata, description: e.target.value })}
                      placeholder="Describe the purpose of this form..."
                      rows={3}
                    />
                  </div>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-sm">OCR Processing Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total Fields Detected:</span>
                        <span className="font-medium">{extractedFields.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">FHIR Mapped Fields:</span>
                        <span className="font-medium">{extractedFields.filter(f => f.fhirMapping).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Required Fields:</span>
                        <span className="font-medium">{extractedFields.filter(f => f.required).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Source Document:</span>
                        <span className="font-medium">{file?.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                      <CardTitle>{formMetadata.title || 'Untitled Form'}</CardTitle>
                      <p className="text-sm text-gray-600">{formMetadata.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {extractedFields.map((field, index) => (
                        <div key={field.id} className="space-y-2">
                          <Label>
                            {index + 1}. {field.text}
                            {field.required && <span className="text-red-600 ml-1">*</span>}
                          </Label>
                          {field.type === 'boolean' && (
                            <div className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" disabled />
                              <span className="text-sm text-gray-600">Checkbox</span>
                            </div>
                          )}
                          {field.type === 'text' && (
                            <Input placeholder="Enter text..." disabled />
                          )}
                          {field.type === 'date' && (
                            <Input type="date" disabled />
                          )}
                          {field.type === 'integer' && (
                            <Input type="number" placeholder="Enter number..." disabled />
                          )}
                          {field.type === 'choice' && field.options && (
                            <div className="space-y-2">
                              {field.options.map((option, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <input type="radio" name={field.id} disabled />
                                  <span className="text-sm">{option}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Back to Upload
                </Button>
                <Button onClick={handleSaveForm} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Form Template
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="space-y-6 p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Form Created Successfully!</h3>
                <p className="text-gray-600">
                  Your FHIR-compliant form has been generated and saved to the template library.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}