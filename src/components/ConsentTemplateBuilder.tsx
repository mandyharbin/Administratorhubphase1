import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { FileText, Upload, Save, Shield, X, AlertCircle, CheckCircle2, Edit3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { toast } from 'sonner@2.0.3';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';

interface ConsentTemplateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingConsent?: any;
}

type ConsentStatus = 'draft' | 'proposed' | 'active' | 'rejected' | 'inactive' | 'entered-in-error';

export function ConsentTemplateBuilder({ open, onOpenChange, editingConsent }: ConsentTemplateBuilderProps) {
  const [formData, setFormData] = useState({
    title: editingConsent?.name || '',
    category: editingConsent?.category || 'HIPAA',
    policyUri: editingConsent?.policyUri || '',
    content: editingConsent?.content || '',
    htmlContent: editingConsent?.htmlContent || '',
    requireSignature: editingConsent?.requireSignature || false,
    status: (editingConsent?.status as ConsentStatus) || 'draft',
    version: editingConsent?.version || '0.1.0',
    language: 'en-US',
    effectivePeriodStart: '',
    effectivePeriodEnd: '',
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  // FHIR Consent.category code sets
  const categoryOptions = [
    { code: '59284-0', display: 'HIPAA', system: 'http://loinc.org' },
    { code: 'financial', display: 'Financial Responsibility', system: 'http://terminology.hl7.org/CodeSystem/consentcategorycodes' },
    { code: 'telehealth', display: 'Telehealth Consent', system: 'http://terminology.hl7.org/CodeSystem/consentcategorycodes' },
    { code: 'treatment', display: 'Treatment Consent', system: 'http://terminology.hl7.org/CodeSystem/consentcategorycodes' },
    { code: 'research', display: 'Research Participation', system: 'http://terminology.hl7.org/CodeSystem/consentcategorycodes' },
    { code: 'acd', display: 'Advance Care Directive', system: 'http://terminology.hl7.org/CodeSystem/consentcategorycodes' },
  ];

  // FHIR Consent.status values
  const statusOptions: { value: ConsentStatus; label: string; color: string }[] = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    { value: 'proposed', label: 'Proposed', color: 'bg-blue-100 text-blue-700' },
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
    { value: 'inactive', label: 'Inactive', color: 'bg-amber-100 text-amber-700' },
    { value: 'entered-in-error', label: 'Entered in Error', color: 'bg-purple-100 text-purple-700' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setUploadedFile(file);
      toast.success(`PDF uploaded: ${file.name}`);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    toast.info('PDF removed');
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.title?.trim()) {
      errors.push('Title is required');
    }
    if (!formData.category) {
      errors.push('Category is required');
    }
    if (!formData.policyUri?.trim()) {
      errors.push('Policy URI is required');
    }
    if (!formData.content?.trim() && !uploadedFile) {
      errors.push('Either text content or PDF attachment is required');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = (publish: boolean = false) => {
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      setActiveTab('basic');
      return;
    }

    const selectedCategory = categoryOptions.find(c => c.code === formData.category);
    
    // Create FHIR-compliant Consent resource
    const consentResource = {
      resourceType: 'Consent',
      id: editingConsent?.id || `CON-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      meta: {
        versionId: formData.version,
        lastUpdated: new Date().toISOString(),
      },
      status: publish ? 'active' : formData.status,
      scope: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/consentscope',
          code: 'patient-privacy',
          display: 'Privacy Consent'
        }]
      },
      category: [{
        coding: [{
          system: selectedCategory?.system,
          code: selectedCategory?.code,
          display: selectedCategory?.display
        }]
      }],
      patient: {
        reference: 'Patient/{{patient-id}}' // Template placeholder
      },
      dateTime: new Date().toISOString(),
      policy: [{
        uri: formData.policyUri
      }],
      // sourceReference points to the DocumentReference (PDF/HTML patient saw)
      sourceReference: uploadedFile ? {
        reference: `DocumentReference/${editingConsent?.id || 'pending'}`,
        display: uploadedFile.name
      } : undefined,
      provision: {
        type: 'permit',
        period: {
          start: formData.effectivePeriodStart || undefined,
          end: formData.effectivePeriodEnd || undefined,
        }
      }
    };

    // Create DocumentReference for the PDF/HTML content
    const documentReference = uploadedFile ? {
      resourceType: 'DocumentReference',
      id: `DOC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'current',
      type: {
        coding: [{
          system: 'http://loinc.org',
          code: '64290-0',
          display: 'Consent Document'
        }]
      },
      subject: {
        reference: 'Patient/{{patient-id}}'
      },
      date: new Date().toISOString(),
      content: [{
        attachment: {
          contentType: 'application/pdf',
          title: uploadedFile.name,
          creation: new Date().toISOString()
        }
      }]
    } : null;

    // Provenance signature will be auto-created at patient submission
    const provenanceTemplate = {
      resourceType: 'Provenance',
      target: [{
        reference: `Consent/${consentResource.id}`
      }],
      recorded: '{{signature-timestamp}}',
      agent: [{
        who: {
          reference: 'Patient/{{patient-id}}'
        }
      }],
      signature: formData.requireSignature ? [{
        type: [{
          system: 'urn:iso-astm:E1762-95:2013',
          code: '1.2.840.10065.1.12.1.1',
          display: 'Author\'s Signature'
        }],
        when: '{{signature-timestamp}}',
        who: {
          reference: 'Patient/{{patient-id}}'
        },
        // Binary/DocumentReference for signature image will be added at submission
        data: '{{signature-data-base64}}'
      }] : undefined
    };

    const saveData = {
      consent: consentResource,
      documentReference,
      provenanceTemplate: formData.requireSignature ? provenanceTemplate : null,
      templateData: formData,
      uploadedFile: uploadedFile ? {
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type
      } : null
    };

    console.log('FHIR Consent Resource:', JSON.stringify(consentResource, null, 2));
    if (documentReference) {
      console.log('DocumentReference:', JSON.stringify(documentReference, null, 2));
    }
    if (formData.requireSignature) {
      console.log('Provenance Template:', JSON.stringify(provenanceTemplate, null, 2));
    }

    toast.success(publish ? 'Consent template published' : 'Consent template saved as draft');
    setTimeout(() => {
      onOpenChange(false);
    }, 1500);
  };

  const getStatusBadge = (status: ConsentStatus) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? (
      <Badge className={statusObj.color}>{statusObj.label}</Badge>
    ) : null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#007CBE]" />
              <div>
                <DialogTitle>
                  {editingConsent ? 'Edit Consent Template' : 'Create Consent Template'}
                </DialogTitle>
                <DialogDescription>
                  FHIR-compliant consent template with electronic signature support
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(formData.status)}
              <Badge variant="outline">v{formData.version}</Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900 mb-2">Please fix the following errors:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
            <TabsTrigger value="fhir">FHIR Preview</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 pr-4">
            <TabsContent value="basic" className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="e.g., HIPAA Privacy Consent"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Maps to: Consent.title (FHIR)</p>
                </div>

                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: ConsentStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Maps to: Consent.status (FHIR)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(cat => (
                      <SelectItem key={cat.code} value={cat.code}>
                        {cat.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Maps to: Consent.category (FHIR) with standard code systems</p>
              </div>

              <div className="space-y-2">
                <Label>Policy URI *</Label>
                <Input
                  placeholder="https://example.com/policies/hipaa-privacy-2025"
                  value={formData.policyUri}
                  onChange={(e) => setFormData({ ...formData, policyUri: e.target.value })}
                  type="url"
                />
                <p className="text-xs text-gray-500">Maps to: Consent.policy.uri (FHIR)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Effective Period Start</Label>
                  <Input
                    type="date"
                    value={formData.effectivePeriodStart}
                    onChange={(e) => setFormData({ ...formData, effectivePeriodStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Effective Period End</Label>
                  <Input
                    type="date"
                    value={formData.effectivePeriodEnd}
                    onChange={(e) => setFormData({ ...formData, effectivePeriodEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select 
                  value={formData.language} 
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-US">Spanish (US)</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                    <SelectItem value="de-DE">German</SelectItem>
                    <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Plain Text Content</Label>
                <Textarea
                  placeholder="Enter consent form content in plain text..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Tip: Use merge fields like {`{{patient.name}}`}, {`{{practice.name}}`}, {`{{date}}`}
                </p>
              </div>

              <div className="space-y-2">
                <Label>HTML Content (Optional)</Label>
                <Textarea
                  placeholder="<p>Enter rich HTML content...</p>"
                  value={formData.htmlContent}
                  onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Rich text version for enhanced display
                </p>
              </div>

              <div className="space-y-3">
                <Label>PDF Attachment (Optional)</Label>
                <p className="text-sm text-gray-600">
                  Upload generates a DocumentReference that is linked via Consent.sourceReference
                </p>
                {!uploadedFile ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-3">Upload a PDF version of this consent</p>
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('pdf-upload')?.click()}
                      type="button"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose PDF File
                    </Button>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-10 h-10 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">{uploadedFile.name}</p>
                          <p className="text-sm text-green-700">
                            {(uploadedFile.size / 1024).toFixed(2)} KB • Will create DocumentReference
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFile}
                        type="button"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="signature" className="space-y-6 py-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Edit3 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Electronic Signature</h4>
                    <p className="text-sm text-blue-700">
                      When enabled, a Provenance.signature resource will be auto-created when the patient submits this consent.
                      The signature image will be stored as a Binary/DocumentReference resource.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="requireSignature" className="text-base">
                      Require Electronic Signature
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Maps to: Provenance.signature (FHIR)
                    </p>
                  </div>
                  <Switch
                    id="requireSignature"
                    checked={formData.requireSignature}
                    onCheckedChange={(checked) => setFormData({ ...formData, requireSignature: checked })}
                  />
                </div>

                {formData.requireSignature && (
                  <div className="border rounded-lg p-4 space-y-3 bg-white">
                    <h4 className="font-medium">Signature Configuration</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Signature Type Code</p>
                          <p className="text-gray-600">1.2.840.10065.1.12.1.1 (Author's Signature)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Signature Data Format</p>
                          <p className="text-gray-600">Base64-encoded image (PNG/JPEG)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Timestamp</p>
                          <p className="text-gray-600">Recorded at patient submission (ISO 8601)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Signer Reference</p>
                          <p className="text-gray-600">Patient/&#123;&#123;patient-id&#125;&#125;</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="fhir" className="py-4">
              <div className="space-y-4">
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-medium mb-2">FHIR Resource Preview</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    This shows the FHIR Consent resource that will be generated from this template
                  </p>
                  <ScrollArea className="h-[400px]">
                    <pre className="text-xs font-mono bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{JSON.stringify({
  resourceType: 'Consent',
  status: formData.status,
  category: [{
    coding: [{
      code: formData.category,
      display: categoryOptions.find(c => c.code === formData.category)?.display
    }]
  }],
  policy: [{
    uri: formData.policyUri
  }],
  sourceReference: uploadedFile ? {
    reference: 'DocumentReference/[generated]',
    display: uploadedFile.name
  } : undefined,
  provision: {
    type: 'permit',
    period: {
      start: formData.effectivePeriodStart || undefined,
      end: formData.effectivePeriodEnd || undefined
    }
  }
}, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleSave(false)}
              className="border-[#007CBE] text-[#007CBE]"
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            <Button 
              onClick={() => handleSave(true)} 
              className="bg-[#007CBE] hover:bg-[#006BA6]"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Publish Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}