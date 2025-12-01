import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, VisuallyHidden } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Progress } from './ui/progress';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  AlertCircle,
  Clock,
  FileText,
  Shield
} from 'lucide-react';

interface PatientFormPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    title: string;
    type: 'form' | 'consent' | 'checklist';
    status: string;
  };
}

export function PatientFormPreview({ open, onOpenChange, template }: PatientFormPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Guard against undefined template
  if (!template) {
    return null;
  }

  // Mock form sections based on template type
  const getFormSections = () => {
    if (template.type === 'form' && template.title.includes('Intake')) {
      return [
        {
          title: 'Personal Information',
          subtitle: 'Tell us about yourself',
          fields: [
            { id: 'firstName', label: 'First Name', type: 'text', required: true },
            { id: 'lastName', label: 'Last Name', type: 'text', required: true },
            { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
            { id: 'gender', label: 'Gender', type: 'radio', options: ['Male', 'Female', 'Other', 'Prefer not to say'], required: true },
            { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
            { id: 'email', label: 'Email Address', type: 'email', required: true },
          ]
        },
        {
          title: 'Medical History',
          subtitle: 'Help us understand your health background',
          fields: [
            { id: 'allergies', label: 'Do you have any allergies?', type: 'textarea', placeholder: 'List any medications, foods, or environmental allergies' },
            { id: 'medications', label: 'Current Medications', type: 'textarea', placeholder: 'List all medications you are currently taking' },
            { id: 'conditions', label: 'Existing Medical Conditions', type: 'checkbox-group', options: ['Diabetes', 'High Blood Pressure', 'Heart Disease', 'Asthma', 'None'] },
            { id: 'surgeries', label: 'Previous Surgeries', type: 'textarea', placeholder: 'List any previous surgeries and approximate dates' },
          ]
        },
        {
          title: 'Emergency Contact',
          subtitle: 'Who should we contact in case of emergency?',
          fields: [
            { id: 'emergencyName', label: 'Contact Name', type: 'text', required: true },
            { id: 'emergencyRelation', label: 'Relationship', type: 'text', required: true },
            { id: 'emergencyPhone', label: 'Phone Number', type: 'tel', required: true },
          ]
        }
      ];
    } else if (template.type === 'consent') {
      return [
        {
          title: template.title,
          subtitle: 'Please review and accept',
          fields: [
            { 
              id: 'consentText', 
              label: '', 
              type: 'consent-text',
              content: `
                <div class="space-y-4">
                  <h3 class="font-semibold">Notice of Privacy Practices</h3>
                  <p>This notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.</p>
                  
                  <h4 class="font-semibold mt-4">Your Rights</h4>
                  <ul class="list-disc pl-5 space-y-2">
                    <li>You have the right to request restrictions on certain uses and disclosures of your health information</li>
                    <li>You have the right to receive confidential communications of health information</li>
                    <li>You have the right to inspect and copy your health information</li>
                    <li>You have the right to request amendments to your health information</li>
                    <li>You have the right to receive an accounting of disclosures of your health information</li>
                  </ul>
                  
                  <h4 class="font-semibold mt-4">Our Responsibilities</h4>
                  <ul class="list-disc pl-5 space-y-2">
                    <li>We are required by law to maintain the privacy of your health information</li>
                    <li>We will let you know promptly if a breach occurs that may have compromised the privacy or security of your information</li>
                    <li>We must follow the duties and privacy practices described in this notice</li>
                  </ul>
                  
                  <p class="mt-4">For more information, please contact our Privacy Officer at privacy@practice.com or (555) 123-4567.</p>
                </div>
              `
            },
            { id: 'signature', label: 'Electronic Signature', type: 'text', required: true, placeholder: 'Type your full name' },
            { id: 'consent', label: 'I have read and agree to the above', type: 'checkbox-single', required: true },
          ]
        }
      ];
    } else {
      return [
        {
          title: 'Annual Physical Questionnaire',
          subtitle: 'Help us prepare for your visit',
          fields: [
            { id: 'reasonForVisit', label: 'Reason for Visit', type: 'textarea', placeholder: 'What brings you in today?' },
            { id: 'newSymptoms', label: 'Any new symptoms or concerns?', type: 'textarea' },
            { id: 'exerciseFrequency', label: 'How often do you exercise?', type: 'radio', options: ['Daily', '3-4 times/week', '1-2 times/week', 'Rarely', 'Never'] },
          ]
        }
      ];
    }
  };

  const sections = getFormSections();
  const totalSteps = sections.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    onOpenChange(false);
  };

  const currentSection = sections[currentStep];

  const renderField = (field: any) => {
    switch (field.type) {
      case 'consent-text':
        return (
          <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg border max-h-[300px] overflow-y-auto text-sm" 
               dangerouslySetInnerHTML={{ __html: field.content }} />
        );
      
      case 'text':
      case 'email':
      case 'tel':
      case 'date':
        return (
          <div className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            />
          </div>
        );
      
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              rows={3}
            />
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-3">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup 
              value={formData[field.id]} 
              onValueChange={(value) => setFormData({ ...formData, [field.id]: value })}
            >
              {field.options.map((option: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${idx}`} />
                  <Label htmlFor={`${field.id}-${idx}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      
      case 'checkbox-group':
        return (
          <div className="space-y-3">
            <Label>{field.label}</Label>
            <div className="space-y-2">
              {field.options.map((option: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${field.id}-${idx}`}
                    checked={formData[field.id]?.[option] || false}
                    onCheckedChange={(checked) => {
                      const current = formData[field.id] || {};
                      setFormData({
                        ...formData,
                        [field.id]: { ...current, [option]: checked }
                      });
                    }}
                  />
                  <Label htmlFor={`${field.id}-${idx}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'checkbox-single':
        return (
          <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Checkbox 
              id={field.id}
              checked={formData[field.id] || false}
              onCheckedChange={(checked) => setFormData({ ...formData, [field.id]: checked })}
              required={field.required}
            />
            <Label htmlFor={field.id} className="font-normal cursor-pointer leading-relaxed">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Hidden for screen readers */}
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>{template.title} - Patient Preview</DialogTitle>
            <DialogDescription>
              Interactive preview of {template.title} as it appears to patients
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        {/* Header - Patient View */}
        <div className="border-b pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {template.type === 'form' && <FileText className="w-5 h-5 text-[#007CBE]" />}
              {template.type === 'consent' && <Shield className="w-5 h-5 text-[#007CBE]" />}
              <h2 className="text-xl">{template.title}</h2>
            </div>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Preview Mode
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Step {currentStep + 1} of {totalSteps}</span>
              <span className="text-gray-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-1">{currentSection.title}</h3>
              <p className="text-sm text-gray-600">{currentSection.subtitle}</p>
            </div>

            <div className="space-y-5">
              {currentSection.fields.map((field: any) => (
                <div key={field.id}>
                  {renderField(field)}
                </div>
              ))}
            </div>

            {/* Estimated Time */}
            <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t">
              <Clock className="w-4 h-4" />
              <span>Estimated time: {currentStep === 0 ? '3-5' : currentStep === 1 ? '5-7' : '2-3'} minutes</span>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t pt-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            {sections.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep
                    ? 'bg-[#007CBE] w-6'
                    : idx < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < totalSteps - 1 ? (
            <Button
              className="bg-[#007CBE] hover:bg-[#006BA6]"
              onClick={handleNext}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
            >
              <Check className="w-4 h-4 mr-2" />
              Submit Form
            </Button>
          )}
        </div>

        {/* Help Info */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-blue-900">
            <strong>Preview Mode:</strong> This is how patients will see and interact with this form. 
            Form submissions in preview mode are not saved.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}