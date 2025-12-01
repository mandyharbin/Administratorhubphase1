import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Upload as UploadIcon,
  CheckCircle2,
  FileText,
  Calendar,
  Type,
  List,
  CheckSquare,
  Eye
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface FormBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'form' | 'consent' | 'checklist';
  editingForm?: any;
}

export function FormBuilderDialog({ open, onOpenChange, mode, editingForm }: FormBuilderDialogProps) {
  const [formData, setFormData] = useState({
    name: editingForm?.name || '',
    description: editingForm?.description || '',
    category: editingForm?.category || 'Pre-Visit',
    type: editingForm?.type || 'Questionnaire',
    estimatedTime: editingForm?.estimatedTime || '5-10 min',
    languages: editingForm?.languages || ['English'],
    requiredFor: editingForm?.requiredFor || []
  });

  const [questions, setQuestions] = useState(editingForm?.questionItems || []);
  const [checklistItems, setChecklistItems] = useState(editingForm?.items || []);
  const [pdfAttached, setPdfAttached] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: `q-${Date.now()}`,
      text: '',
      type: 'text',
      required: false
    }]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q: any) => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map((q: any) => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, {
      id: `item-${Date.now()}`,
      title: '',
      description: ''
    }]);
  };

  const removeChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter((item: any) => item.id !== id));
  };

  const updateChecklistItem = (id: string, field: string, value: any) => {
    setChecklistItems(checklistItems.map((item: any) => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSaveDraft = () => {
    // Simulate CREATE Form API call
    const mockResponse = {
      id: `QR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      version: '0.1.0',
      status: 'draft',
      name: formData.name,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      createdAt: new Date().toISOString(),
      questions: questions.length
    };

    setSuccessData(mockResponse);
    setShowSuccessState(true);
    toast.success('Form saved as draft successfully!');
  };

  const handlePublish = () => {
    // Simulate PUBLISH Form API call (PATCH)
    const mockResponse = {
      id: successData?.id || `QR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      version: '1.0.0',
      status: 'active',
      name: formData.name,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      publishedAt: new Date().toISOString(),
      questions: questions.length
    };

    setSuccessData(mockResponse);
    toast.success('Form published successfully!');
    
    // Close dialog after brief delay
    setTimeout(() => {
      onOpenChange(false);
      setShowSuccessState(false);
    }, 1500);
  };

  const handleCreateConsentTemplate = () => {
    // Simulate CREATE Consent Template API call
    const mockResponse = {
      id: `CON-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      version: '0.1.0',
      status: 'draft',
      name: formData.name,
      description: formData.description,
      type: 'Consent',
      createdAt: new Date().toISOString()
    };

    setSuccessData(mockResponse);
    setShowSuccessState(true);
    toast.success('Consent template created successfully!');
  };

  const handleAttachPDF = () => {
    // Simulate UPLOAD Binary API call
    const uploadResponse = {
      fileId: `FILE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      url: 'https://example.com/consent-form.pdf',
      size: '245 KB',
      uploadedAt: new Date().toISOString()
    };

    // Simulate CREATE DocumentReference API call
    const docRefResponse = {
      id: `DOC-REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      type: 'DocumentReference',
      status: 'current',
      contentType: 'application/pdf',
      attachment: uploadResponse
    };

    setPdfAttached(true);
    toast.success('PDF attached and document reference created!');
    console.log('Upload Response:', uploadResponse);
    console.log('DocumentReference Response:', docRefResponse);
  };

  const handlePublishConsent = () => {
    // Simulate PUBLISH Consent Template PATCH call
    const mockResponse = {
      ...successData,
      version: '1.0.0',
      status: 'active',
      publishedAt: new Date().toISOString()
    };

    setSuccessData(mockResponse);
    toast.success('Consent template published successfully!');
    
    setTimeout(() => {
      onOpenChange(false);
      setShowSuccessState(false);
    }, 1500);
  };

  const handleSaveChecklist = () => {
    // Simulate CREATE Checklist PlanDefinition API call
    const mockResponse = {
      id: 'PD-CL-001',
      resourceType: 'PlanDefinition',
      status: 'active',
      name: formData.name,
      description: formData.description,
      type: 'workflow-definition',
      itemCount: checklistItems.length,
      createdAt: new Date().toISOString()
    };

    setSuccessData(mockResponse);
    setShowSuccessState(true);
    toast.success('Checklist saved successfully!');
    
    setTimeout(() => {
      onOpenChange(false);
      setShowSuccessState(false);
    }, 1500);
  };

  if (showSuccessState) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              {formData.type === 'form' && 'Form Created Successfully'}
              {formData.type === 'consent' && 'Consent Template Created'}
              {formData.type === 'checklist' && 'Checklist Created'}
            </DialogTitle>
            <DialogDescription>
              Your {formData.type} has been created and saved
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Success Response Display */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">ID</div>
                  <Badge variant="outline" className="font-mono">{successData?.id}</Badge>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Version</div>
                  <Badge className="bg-blue-100 text-blue-700">{successData?.version}</Badge>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</div>
                  <Badge className={successData?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                    {successData?.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</div>
                  <span className="text-sm">{successData?.type || mode}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">API Response</div>
                <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
{JSON.stringify(successData, null, 2)}
                </pre>
              </div>
            </div>

            {/* Action buttons based on mode and status */}
            <div className="flex gap-3">
              {mode === 'form' && successData?.status === 'draft' && (
                <Button onClick={handlePublish} className="flex-1 bg-[#007CBE] hover:bg-[#006BA6]">
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Publish Form
                </Button>
              )}
              {mode === 'consent' && successData?.status === 'draft' && !pdfAttached && (
                <Button onClick={handleAttachPDF} className="flex-1" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Attach PDF
                </Button>
              )}
              {mode === 'consent' && successData?.status === 'draft' && pdfAttached && (
                <Button onClick={handlePublishConsent} className="flex-1 bg-[#007CBE] hover:bg-[#006BA6]">
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Publish Consent
                </Button>
              )}
              <Button onClick={() => onOpenChange(false)} variant="outline">
                {successData?.status === 'active' ? 'Close' : 'Continue Editing'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingForm ? `Edit ${mode === 'form' ? 'Form' : mode === 'consent' ? 'Consent' : 'Checklist'}` : 
             mode === 'form' ? 'Create New Form' : 
             mode === 'consent' ? 'Create Consent Template' : 
             'Create New Checklist'}
          </DialogTitle>
          <DialogDescription>
            {editingForm ? `Edit the ${mode === 'form' ? 'form' : mode === 'consent' ? 'consent template' : 'checklist'}` : 
             mode === 'form' ? 'Create a new form for patient data collection' : 
             mode === 'consent' ? 'Create a new consent template for patient consent' : 
             'Create a new checklist for patient onboarding'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder={mode === 'form' ? 'e.g., Annual Physical Form' : mode === 'consent' ? 'e.g., Treatment Consent Form' : 'e.g., New Patient Onboarding'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this form..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-Visit">Pre-Visit</SelectItem>
                    <SelectItem value="Post-Visit">Post-Visit</SelectItem>
                    <SelectItem value="Registration">Registration</SelectItem>
                    <SelectItem value="Consent">Consent</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mode !== 'checklist' && (
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Questionnaire">Questionnaire</SelectItem>
                      <SelectItem value="Consent">Consent</SelectItem>
                      <SelectItem value="Intake">Intake</SelectItem>
                      <SelectItem value="Assessment">Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Questions Section (for forms) */}
          {mode === 'form' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Questions</Label>
                <Button onClick={addQuestion} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-3">
                {questions.map((question: any, index: number) => (
                  <div key={question.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400 mt-2 cursor-move" />
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-3">
                          <Input
                            placeholder={`Question ${index + 1}`}
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                            className="flex-1"
                          />
                          <Select 
                            value={question.type} 
                            onValueChange={(value) => updateQuestion(question.id, 'type', value)}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">
                                <div className="flex items-center gap-2">
                                  <Type className="w-4 h-4" />
                                  Text
                                </div>
                              </SelectItem>
                              <SelectItem value="date">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Date
                                </div>
                              </SelectItem>
                              <SelectItem value="choice">
                                <div className="flex items-center gap-2">
                                  <List className="w-4 h-4" />
                                  Choice
                                </div>
                              </SelectItem>
                              <SelectItem value="boolean">
                                <div className="flex items-center gap-2">
                                  <CheckSquare className="w-4 h-4" />
                                  Yes/No
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`required-${question.id}`}
                            checked={question.required}
                            onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                            className="rounded"
                          />
                          <label htmlFor={`required-${question.id}`} className="text-sm text-gray-600">
                            Required field
                          </label>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}

                {questions.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    No questions added yet. Click "Add Question" to start building your form.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checklist Items Section */}
          {mode === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Checklist Items</Label>
                <Button onClick={addChecklistItem} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {checklistItems.map((item: any, index: number) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400 mt-2 cursor-move" />
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder={`Item ${index + 1} title`}
                          value={item.title}
                          onChange={(e) => updateChecklistItem(item.id, 'title', e.target.value)}
                        />
                        <Input
                          placeholder="Description (optional)"
                          value={item.description}
                          onChange={(e) => updateChecklistItem(item.id, 'description', e.target.value)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChecklistItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}

                {checklistItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    No items added yet. Click "Add Item" to start building your checklist.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Consent PDF Section */}
          {mode === 'consent' && (
            <div className="space-y-3">
              <Label>PDF Document</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-3">
                  Upload the consent form PDF document
                </p>
                <Button variant="outline" size="sm">
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Choose PDF File
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Cancel
            </Button>
            <div className="flex-1" />
            {mode === 'form' && (
              <>
                <Button onClick={handleSaveDraft} variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={handlePublish} className="bg-[#007CBE] hover:bg-[#006BA6]">
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Publish
                </Button>
              </>
            )}
            {mode === 'consent' && (
              <Button onClick={handleCreateConsentTemplate} className="bg-[#007CBE] hover:bg-[#006BA6]">
                Create Template
              </Button>
            )}
            {mode === 'checklist' && (
              <Button onClick={handleSaveChecklist} className="bg-[#007CBE] hover:bg-[#006BA6]">
                <Save className="w-4 h-4 mr-2" />
                Save Checklist
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}