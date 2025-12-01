import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Upload as UploadIcon,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Play,
  AlertCircle,
  CheckCircle2,
  Settings,
  Type,
  Calendar,
  Hash,
  ToggleLeft,
  List,
  FileText,
  Image,
  MapPin,
  Star
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner@2.0.3';

interface EnhancedFormBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingForm?: any;
}

export function EnhancedFormBuilder({ open, onOpenChange, editingForm }: EnhancedFormBuilderProps) {
  const [formData, setFormData] = useState({
    title: editingForm?.name || '',
    description: editingForm?.description || '',
    category: editingForm?.category || 'Pre-Visit',
    status: editingForm?.status || 'draft',
  });

  const [items, setItems] = useState(editingForm?.items || []);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const questionTypes = [
    { value: 'string', label: 'Short Text', icon: Type },
    { value: 'text', label: 'Long Text', icon: FileText },
    { value: 'integer', label: 'Number', icon: Hash },
    { value: 'decimal', label: 'Decimal', icon: Hash },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'time', label: 'Time', icon: Calendar },
    { value: 'boolean', label: 'Yes/No', icon: ToggleLeft },
    { value: 'choice', label: 'Multiple Choice', icon: List },
    { value: 'open-choice', label: 'Choice + Other', icon: List },
    { value: 'attachment', label: 'File Upload', icon: Image },
    { value: 'address', label: 'Address', icon: MapPin },
    { value: 'rating', label: 'Rating', icon: Star },
  ];

  const addItem = () => {
    setItems([...items, {
      linkId: `item-${items.length + 1}`,
      text: '',
      type: 'string',
      required: false,
      enableWhen: [],
      answerOption: []
    }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_: any, i: number) => i !== index));
  };

  const addAnswerOption = (itemIndex: number) => {
    const newItems = [...items];
    if (!newItems[itemIndex].answerOption) {
      newItems[itemIndex].answerOption = [];
    }
    newItems[itemIndex].answerOption.push({
      valueCoding: {
        code: `option-${newItems[itemIndex].answerOption.length + 1}`,
        display: ''
      }
    });
    setItems(newItems);
  };

  const updateAnswerOption = (itemIndex: number, optionIndex: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[itemIndex].answerOption[optionIndex].valueCoding[field] = value;
    setItems(newItems);
  };

  const removeAnswerOption = (itemIndex: number, optionIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex].answerOption = newItems[itemIndex].answerOption.filter((_: any, i: number) => i !== optionIndex);
    setItems(newItems);
  };

  const addConditionalLogic = (itemIndex: number) => {
    const newItems = [...items];
    if (!newItems[itemIndex].enableWhen) {
      newItems[itemIndex].enableWhen = [];
    }
    newItems[itemIndex].enableWhen.push({
      question: '',
      operator: 'exists',
      answerBoolean: true
    });
    setItems(newItems);
  };

  const handleValidate = () => {
    const errors: any[] = [];

    // Check title
    if (!formData.title) {
      errors.push({ field: 'title', message: 'Title is required' });
    }

    // Check items
    items.forEach((item: any, index: number) => {
      if (!item.linkId) {
        errors.push({ field: `item[${index}].linkId`, message: 'Link ID is required' });
      }
      if (!item.text) {
        errors.push({ field: `item[${index}].text`, message: 'Question text is required' });
      }
      if ((item.type === 'choice' || item.type === 'open-choice') && (!item.answerOption || item.answerOption.length === 0)) {
        errors.push({ field: `item[${index}].answerOption`, message: 'At least one answer option is required' });
      }
    });

    setValidationErrors(errors);
    setShowValidation(true);

    if (errors.length === 0) {
      toast.success('Validation passed!');
    } else {
      toast.error(`Validation failed with ${errors.length} error(s)`);
    }
  };

  const handleSaveDraft = () => {
    const questionnaire = {
      resourceType: 'Questionnaire',
      id: editingForm?.id || `QR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'draft',
      version: editingForm?.version || '0.1.0',
      name: formData.title,
      title: formData.title,
      description: formData.description,
      date: new Date().toISOString(),
      item: items
    };

    console.log('Save Draft:', questionnaire);
    toast.success('Form saved as draft');
  };

  const handlePublish = () => {
    handleValidate();
    if (validationErrors.length === 0) {
      const questionnaire = {
        resourceType: 'Questionnaire',
        id: editingForm?.id || `QR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        status: 'active',
        version: '1.0.0',
        name: formData.title,
        title: formData.title,
        description: formData.description,
        date: new Date().toISOString(),
        item: items
      };

      console.log('Publish:', questionnaire);
      toast.success('Form published successfully!');
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    }
  };

  const getPreviewWidth = () => {
    switch (previewDevice) {
      case 'mobile': return 'max-w-sm';
      case 'tablet': return 'max-w-2xl';
      case 'desktop': return 'max-w-4xl';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
        <DialogDescription className="sr-only">
          {editingForm ? 'Edit form questionnaire' : 'Create new form questionnaire'}
        </DialogDescription>
        <div className="flex h-[95vh]">
          {/* Left Panel - Builder */}
          <div className="flex-1 flex flex-col border-r">
            <DialogHeader className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle>
                  {editingForm ? 'Edit Form' : 'Create New Form (Questionnaire)'}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge className={formData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                    {formData.status}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-6">
                {/* Validation Errors Banner */}
                {showValidation && validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-red-900">Cannot save. Please fix the issues below:</p>
                        <ul className="mt-2 space-y-1 text-sm text-red-800">
                          {validationErrors.map((error, index) => (
                            <li key={index}>• {error.message}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Metadata */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Annual Physical Questionnaire"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={validationErrors.some(e => e.field === 'title') ? 'border-red-500' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this questionnaire..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>

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
                        <SelectItem value="Screening">Screening</SelectItem>
                        <SelectItem value="Assessment">Assessment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Form Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Form Items</Label>
                    <Button onClick={addItem} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item: any, itemIndex: number) => (
                      <div key={itemIndex} className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div className="flex items-start gap-3">
                          <GripVertical className="w-5 h-5 text-gray-400 mt-2 cursor-move flex-shrink-0" />
                          <div className="flex-1 space-y-4">
                            {/* Question Text */}
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                placeholder="Link ID (e.g., q1)"
                                value={item.linkId}
                                onChange={(e) => updateItem(itemIndex, 'linkId', e.target.value)}
                                className={validationErrors.some(e => e.field === `item[${itemIndex}].linkId`) ? 'border-red-500' : ''}
                              />
                              <Select
                                value={item.type}
                                onValueChange={(value) => updateItem(itemIndex, 'type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {questionTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <Input
                              placeholder="Question text"
                              value={item.text}
                              onChange={(e) => updateItem(itemIndex, 'text', e.target.value)}
                              className={validationErrors.some(e => e.field === `item[${itemIndex}].text`) ? 'border-red-500' : ''}
                            />

                            {/* Help Text */}
                            <Input
                              placeholder="Help text (optional)"
                              value={item.helpText || ''}
                              onChange={(e) => updateItem(itemIndex, 'helpText', e.target.value)}
                            />

                            {/* Required Toggle */}
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`required-${itemIndex}`}
                                checked={item.required}
                                onChange={(e) => updateItem(itemIndex, 'required', e.target.checked)}
                                className="rounded"
                              />
                              <label htmlFor={`required-${itemIndex}`} className="text-sm">
                                Required field
                              </label>
                            </div>

                            {/* Answer Options for choice types */}
                            {(item.type === 'choice' || item.type === 'open-choice') && (
                              <div className="space-y-2 pt-2 border-t">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium">Answer Options</label>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => addAnswerOption(itemIndex)}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Option
                                  </Button>
                                </div>
                                {item.answerOption?.map((option: any, optionIndex: number) => (
                                  <div key={optionIndex} className="flex gap-2">
                                    <Input
                                      placeholder="Code"
                                      value={option.valueCoding.code}
                                      onChange={(e) => updateAnswerOption(itemIndex, optionIndex, 'code', e.target.value)}
                                      className="w-32"
                                    />
                                    <Input
                                      placeholder="Display text"
                                      value={option.valueCoding.display}
                                      onChange={(e) => updateAnswerOption(itemIndex, optionIndex, 'display', e.target.value)}
                                      className="flex-1"
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeAnswerOption(itemIndex, optionIndex)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </div>
                                ))}
                                {validationErrors.some(e => e.field === `item[${itemIndex}].answerOption`) && (
                                  <p className="text-xs text-red-600">At least one option is required</p>
                                )}
                              </div>
                            )}

                            {/* Conditional Logic */}
                            {item.enableWhen && item.enableWhen.length > 0 && (
                              <div className="space-y-2 pt-2 border-t">
                                <label className="text-sm font-medium">Conditional Logic (enableWhen)</label>
                                {item.enableWhen.map((condition: any, condIndex: number) => (
                                  <div key={condIndex} className="text-xs bg-white rounded p-2 border">
                                    Show when question "{condition.question}" {condition.operator}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addConditionalLogic(itemIndex)}
                              >
                                <Settings className="w-3 h-3 mr-1" />
                                Add Logic
                              </Button>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(itemIndex)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        No questions added yet. Click "Add Question" to start.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleValidate}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Validate
                  </Button>
                  <Button variant="outline" onClick={handleSaveDraft}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button onClick={handlePublish} className="bg-[#007CBE] hover:bg-[#006BA6]">
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-[500px] flex flex-col bg-gray-50">
            <div className="px-6 py-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Preview</h3>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                    onClick={() => setPreviewDevice('tablet')}
                  >
                    <Tablet className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className={`mx-auto bg-white rounded-lg shadow-sm p-6 ${getPreviewWidth()}`}>
                <h3 className="text-xl mb-2">{formData.title || 'Untitled Form'}</h3>
                {formData.description && (
                  <p className="text-sm text-gray-600 mb-6">{formData.description}</p>
                )}

                <div className="space-y-6">
                  {items.map((item: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium">
                        {item.text || `Question ${index + 1}`}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {item.helpText && (
                        <p className="text-xs text-gray-500">{item.helpText}</p>
                      )}
                      
                      {/* Render appropriate input based on type */}
                      {item.type === 'string' && (
                        <Input placeholder="Enter answer..." />
                      )}
                      {item.type === 'text' && (
                        <Textarea placeholder="Enter detailed answer..." rows={3} />
                      )}
                      {item.type === 'integer' && (
                        <Input type="number" placeholder="Enter number..." />
                      )}
                      {item.type === 'date' && (
                        <Input type="date" />
                      )}
                      {item.type === 'boolean' && (
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input type="radio" name={`q-${index}`} />
                            Yes
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name={`q-${index}`} />
                            No
                          </label>
                        </div>
                      )}
                      {(item.type === 'choice' || item.type === 'open-choice') && (
                        <div className="space-y-2">
                          {item.answerOption?.map((option: any, optIdx: number) => (
                            <label key={optIdx} className="flex items-center gap-2">
                              <input type="radio" name={`q-${index}`} />
                              {option.valueCoding.display}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {items.length === 0 && (
                    <p className="text-center text-gray-400 py-8">
                      No questions to preview
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}