import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { MultiSelectFilter } from './MultiSelectFilter';
import { NoticePreview } from './NoticePreview';
import { FHIRVariablePicker } from './FHIRVariablePicker';
import { Plus, Edit2, Trash2, Calendar, Clock, Filter, Mail, MessageSquare, Phone, Bell, AppWindow, Upload, Users, User, Eye } from 'lucide-react';

interface NoticeTemplate {
  id: string;
  name: string;
  trigger: string;
  deliveryTime: string;
  deliveryValue?: number;
  deliveryUnit?: string;
  message: string;
  methods: {
    email: boolean;
    sms: boolean;
    voice: boolean;
    push: boolean;
  };
  conditions: {
    apptTypes: string[];
    reasons: string[];
    providers: string[];
    locations: string[];
    dateRange?: { start: string; end: string };
  };
  populationTarget?: {
    carePrograms: string[];
    uploadedReport?: {
      fileName: string;
      uploadDate: string;
    };
  };
  patientFilters?: {
    ageRanges: string[];
    sexes: string[];
  };
  orderFilters?: {
    cptCodes: string[];
    generalAssessment: string[];
    ageRanges: string[];
    sexes: string[];
  };
}

interface NoticeTemplateManagerProps {
  noticeId: string;
  noticeName: string;
  templates: NoticeTemplate[];
  appointmentTypes: Array<{ value: string; label: string }>;
  reasons: Array<{ value: string; label: string }>;
  providers: Array<{ value: string; label: string }>;
  locations: Array<{ value: string; label: string }>;
  onSave: (templates: NoticeTemplate[]) => void;
}

export function NoticeTemplateManager({
  noticeId,
  noticeName,
  templates: initialTemplates,
  appointmentTypes,
  reasons,
  providers,
  locations,
  onSave,
}: NoticeTemplateManagerProps) {
  const [templates, setTemplates] = useState<NoticeTemplate[]>(initialTemplates || []);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NoticeTemplate | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<NoticeTemplate | null>(null);

  // Sync templates when props change (when switching between notice types)
  useEffect(() => {
    console.log('NoticeTemplateManager: Syncing templates for', noticeName, initialTemplates);
    setTemplates(initialTemplates || []);
  }, [noticeId, initialTemplates, noticeName]);

  // Form states
  const [templateName, setTemplateName] = useState('');
  const [trigger, setTrigger] = useState('scheduled-appointment');
  const [deliveryTime, setDeliveryTime] = useState('scheduled-before');
  const [deliveryValue, setDeliveryValue] = useState('24');
  const [deliveryUnit, setDeliveryUnit] = useState('hours');
  const [message, setMessage] = useState('');
  const [selectedApptTypes, setSelectedApptTypes] = useState<string[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [email, setEmail] = useState(false);
  const [sms, setSms] = useState(false);
  const [voice, setVoice] = useState(false);
  const [push, setPush] = useState(false);
  
  // Population Broadcast specific states
  const [selectedCarePrograms, setSelectedCarePrograms] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [targetMethod, setTargetMethod] = useState<'carePrograms' | 'upload'>('carePrograms');

  // Birthday Messages specific states
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);
  const [selectedSexes, setSelectedSexes] = useState<string[]>([]);

  // Orders Notifications specific states
  const [selectedCptCodes, setSelectedCptCodes] = useState<string[]>([]);
  const [selectedGeneralAssessment, setSelectedGeneralAssessment] = useState<string[]>([]);
  const [selectedOrderAgeRanges, setSelectedOrderAgeRanges] = useState<string[]>([]);
  const [selectedOrderSexes, setSelectedOrderSexes] = useState<string[]>([]);

  const carePrograms = [
    { value: 'diabetes', label: 'Diabetes Care Program' },
    { value: 'hypertension', label: 'Hypertension Management' },
    { value: 'asthma', label: 'Asthma Care' },
    { value: 'copd', label: 'COPD Management' },
    { value: 'heart-disease', label: 'Cardiovascular Disease' },
    { value: 'obesity', label: 'Weight Management' },
    { value: 'prenatal', label: 'Prenatal Care' },
    { value: 'postpartum', label: 'Postpartum Care' },
    { value: 'pediatric-wellness', label: 'Pediatric Wellness' },
    { value: 'senior-care', label: 'Senior Care Program' },
    { value: 'cancer-care', label: 'Cancer Care Support' },
    { value: 'mental-health', label: 'Mental Health Support' },
    { value: 'substance-abuse', label: 'Substance Abuse Recovery' },
    { value: 'chronic-pain', label: 'Chronic Pain Management' },
    { value: 'immunization', label: 'Immunization Program' },
  ];

  const ageRanges = [
    { value: '0-12', label: 'Children (0-12 years)' },
    { value: '13-17', label: 'Teenagers (13-17 years)' },
    { value: '18-25', label: 'Young Adults (18-25 years)' },
    { value: '26-40', label: 'Adults (26-40 years)' },
    { value: '41-65', label: 'Middle Age (41-65 years)' },
    { value: '66+', label: 'Seniors (66+ years)' },
  ];

  const patientSexes = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'unknown', label: 'Prefer not to say' },
  ];

  const cptCodes = [
    { value: '80053', label: '80053 - Comprehensive Metabolic Panel' },
    { value: '80061', label: '80061 - Lipid Panel' },
    { value: '85025', label: '85025 - Complete Blood Count (CBC)' },
    { value: '84443', label: '84443 - Thyroid Stimulating Hormone (TSH)' },
    { value: '83036', label: '83036 - Hemoglobin A1C' },
    { value: '82947', label: '82947 - Glucose, Blood' },
    { value: '84520', label: '84520 - Urea Nitrogen (BUN)' },
    { value: '82565', label: '82565 - Creatinine' },
    { value: '84450', label: '84450 - Transferase (ALT)' },
    { value: '84460', label: '84460 - Transferase (AST)' },
    { value: '81001', label: '81001 - Urinalysis' },
    { value: '86580', label: '86580 - TB Skin Test' },
    { value: '87081', label: '87081 - Culture, Bacterial' },
    { value: '36415', label: '36415 - Venipuncture' },
    { value: '93000', label: '93000 - Electrocardiogram (ECG)' },
  ];

  const generalAssessments = [
    { value: 'normal', label: 'Normal' },
    { value: 'abnormal', label: 'Abnormal' },
  ];

  const openNewTemplate = () => {
    resetForm();
    setEditingTemplate(null);
    setEditDialogOpen(true);
  };

  const openEditTemplate = (template: NoticeTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTrigger(template.trigger);
    setDeliveryTime(template.deliveryTime);
    setDeliveryValue(template.deliveryValue?.toString() || '24');
    setDeliveryUnit(template.deliveryUnit || 'hours');
    setMessage(template.message);
    setSelectedApptTypes(template.conditions.apptTypes);
    setSelectedReasons(template.conditions.reasons);
    setSelectedProviders(template.conditions.providers);
    setSelectedLocations(template.conditions.locations);
    setStartDate(template.conditions.dateRange?.start || '');
    setEndDate(template.conditions.dateRange?.end || '');
    setEmail(template.methods.email);
    setSms(template.methods.sms);
    setVoice(template.methods.voice);
    setPush(template.methods.push);
    setSelectedCarePrograms(template.populationTarget?.carePrograms || []);
    setTargetMethod(template.populationTarget?.carePrograms.length ? 'carePrograms' : 'upload');
    setSelectedAgeRanges(template.patientFilters?.ageRanges || []);
    setSelectedSexes(template.patientFilters?.sexes || []);
    setSelectedCptCodes(template.orderFilters?.cptCodes || []);
    setSelectedGeneralAssessment(template.orderFilters?.generalAssessment || []);
    setSelectedOrderAgeRanges(template.orderFilters?.ageRanges || []);
    setSelectedOrderSexes(template.orderFilters?.sexes || []);
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setTemplateName('');
    setTrigger('scheduled-appointment');
    setDeliveryTime('scheduled-before');
    setDeliveryValue('24');
    setDeliveryUnit('hours');
    setMessage('');
    setSelectedApptTypes([]);
    setSelectedReasons([]);
    setSelectedProviders([]);
    setSelectedLocations([]);
    setStartDate('');
    setEndDate('');
    setEmail(false);
    setSms(false);
    setVoice(false);
    setPush(false);
    setSelectedCarePrograms([]);
    setUploadedFile(null);
    setTargetMethod('carePrograms');
    setSelectedAgeRanges([]);
    setSelectedSexes([]);
    setSelectedCptCodes([]);
    setSelectedGeneralAssessment([]);
    setSelectedOrderAgeRanges([]);
    setSelectedOrderSexes([]);
  };

  const saveTemplate = () => {
    const template: NoticeTemplate = {
      id: editingTemplate?.id || `template-${Date.now()}`,
      name: templateName,
      trigger,
      deliveryTime,
      deliveryValue: parseInt(deliveryValue),
      deliveryUnit,
      message,
      methods: {
        email,
        sms,
        voice,
        push,
      },
      conditions: {
        apptTypes: selectedApptTypes,
        reasons: selectedReasons,
        providers: selectedProviders,
        locations: selectedLocations,
        dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined,
      },
      populationTarget: noticeId === '3' && targetMethod === 'carePrograms' ? { carePrograms: selectedCarePrograms } : undefined,
      patientFilters: noticeId === '4' && (selectedAgeRanges.length > 0 || selectedSexes.length > 0) 
        ? { ageRanges: selectedAgeRanges, sexes: selectedSexes } 
        : undefined,
      orderFilters: noticeId === '6' && (selectedCptCodes.length > 0 || selectedGeneralAssessment.length > 0 || selectedOrderAgeRanges.length > 0 || selectedOrderSexes.length > 0)
        ? { cptCodes: selectedCptCodes, generalAssessment: selectedGeneralAssessment, ageRanges: selectedOrderAgeRanges, sexes: selectedOrderSexes }
        : undefined,
    };

    let updatedTemplates;
    if (editingTemplate) {
      updatedTemplates = templates.map(t => t.id === editingTemplate.id ? template : t);
    } else {
      updatedTemplates = [...templates, template];
    }
    
    setTemplates(updatedTemplates);
    onSave(updatedTemplates);
    setEditDialogOpen(false);
    resetForm();
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(t => t.id !== id);
    setTemplates(updatedTemplates);
    onSave(updatedTemplates);
  };

  const insertVariable = (variable: string) => {
    // If variable already has {{ }}, use it as-is (FHIR variables)
    // Otherwise, wrap in single braces (legacy variables)
    const formattedVariable = variable.startsWith('{{') ? variable : `{${variable}}`;
    setMessage(message + formattedVariable);
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      'scheduled-appointment': 'Scheduled Appointment',
      'appointment-modified': 'Appointment Modified',
      'appointment-cancelled': 'Appointment Cancelled',
      'on-demand': 'Generated On-Demand',
      'patient-dob': 'Patient DOB',
      'no-show-appointment': 'No-Show Appointment',
    };
    return labels[trigger] || trigger;
  };

  const getDeliveryLabel = (template: NoticeTemplate) => {
    if (template.deliveryTime === 'real-time' || template.deliveryTime === 'on-birthday' || template.deliveryTime === 'on-recall-date') {
      if (template.deliveryTime === 'on-birthday') return 'On Birthday';
      if (template.deliveryTime === 'on-recall-date') return 'On Recall Date';
      return 'Real-time';
    }
    const direction = template.deliveryTime === 'scheduled-before' ? 'before' : 'after';
    let referencePoint = 'appointment';
    if (noticeId === '4') referencePoint = 'birthday';
    else if (noticeId === '2') referencePoint = 'broadcast';
    else if (noticeId === '5') referencePoint = 'no-show';
    else if (noticeId === '6') referencePoint = 'order reviewed';
    else if (noticeId === '8') referencePoint = 'recall date';
    return `${template.deliveryValue} ${template.deliveryUnit} ${direction} ${referencePoint}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm">Message Templates</h3>
          <p className="text-xs text-gray-500 mt-1">
            Create multiple message templates with different triggers and conditions
          </p>
        </div>
        <Button onClick={openNewTemplate} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <p className="text-sm">No templates configured yet</p>
              <p className="text-xs mt-1">Click "Add Template" to create your first message template</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm">{template.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getTriggerLabel(template.trigger)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {getDeliveryLabel(template)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded border">
                      {template.message || 'No message configured'}
                    </p>
                    
                    {/* Communication Methods */}
                    <div className="flex items-center gap-2 mb-2">
                      {template.methods.email && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                          <Mail className="w-3 h-3" />
                          <span>Email</span>
                        </div>
                      )}
                      {template.methods.sms && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                          <MessageSquare className="w-3 h-3" />
                          <span>SMS</span>
                        </div>
                      )}
                      {template.methods.voice && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                          <Phone className="w-3 h-3" />
                          <span>Voice</span>
                        </div>
                      )}
                      {template.methods.push && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
                          <Bell className="w-3 h-3" />
                          <span>Push</span>
                        </div>
                      )}
                    </div>
                    
                    {(template.conditions.apptTypes.length > 0 || 
                      template.conditions.reasons.length > 0 || 
                      template.conditions.providers.length > 0 || 
                      template.conditions.locations.length > 0) && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Filter className="w-3 h-3" />
                        <span>
                          {template.conditions.apptTypes.length > 0 && `${template.conditions.apptTypes.length} types`}
                          {template.conditions.apptTypes.length > 0 && template.conditions.providers.length > 0 && ', '}
                          {template.conditions.providers.length > 0 && `${template.conditions.providers.length} providers`}
                          {(template.conditions.apptTypes.length > 0 || template.conditions.providers.length > 0) && template.conditions.locations.length > 0 && ', '}
                          {template.conditions.locations.length > 0 && `${template.conditions.locations.length} locations`}
                        </span>
                      </div>
                    )}
                    
                    {template.populationTarget && template.populationTarget.carePrograms.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-teal-700">
                        <Users className="w-3 h-3" />
                        <span>
                          {template.populationTarget.carePrograms.length} care program{template.populationTarget.carePrograms.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    
                    {template.patientFilters && (template.patientFilters.ageRanges.length > 0 || template.patientFilters.sexes.length > 0) && (
                      <div className="flex items-center gap-2 text-xs text-pink-700">
                        <User className="w-3 h-3" />
                        <span>
                          {template.patientFilters.ageRanges.length > 0 && `${template.patientFilters.ageRanges.length} age range${template.patientFilters.ageRanges.length > 1 ? 's' : ''}`}
                          {template.patientFilters.ageRanges.length > 0 && template.patientFilters.sexes.length > 0 && ', '}
                          {template.patientFilters.sexes.length > 0 && `${template.patientFilters.sexes.length} sex${template.patientFilters.sexes.length > 1 ? 'es' : ''}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreviewingTemplate(template);
                        setPreviewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditTemplate(template)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              Configure the message template with triggers, timing, and conditions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Template Name */}
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                placeholder={
                  noticeId === '4' 
                    ? 'e.g., Birthday Greeting - Adults' 
                    : noticeId === '11'
                    ? 'e.g., Balance Update - Payment Reminder'
                    : noticeId === '12'
                    ? 'e.g., Lab Results - Ready for Review'
                    : 'e.g., Appt Reminder - 3 Days Before'
                }
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <p className="text-xs text-gray-500">Give this template a descriptive name</p>
            </div>

            {/* Trigger Selection */}
            {noticeId === '1' && (
              <div className="space-y-2">
                <Label>EHR Trigger</Label>
                <Select value={trigger} onValueChange={setTrigger}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled-appointment">Scheduled Appointment</SelectItem>
                    <SelectItem value="appointment-modified">Appointment Modified</SelectItem>
                    <SelectItem value="appointment-cancelled">Appointment Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {noticeId === '2' && (
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <Badge>Generated On-Demand</Badge>
                  <p className="text-xs text-gray-500 mt-2">
                    This template will be available for manual broadcast creation
                  </p>
                </div>
              </div>
            )}

            {noticeId === '4' && (
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <Badge>Patient DOB</Badge>
                  <p className="text-xs text-gray-500 mt-2">
                    This template will be automatically triggered based on patient date of birth
                  </p>
                </div>
              </div>
            )}

            {noticeId === '5' && (
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <Badge>No-Show Appointment</Badge>
                  <p className="text-xs text-gray-500 mt-2">
                    This template will be automatically triggered when a patient fails to show up for an appointment
                  </p>
                </div>
              </div>
            )}

            {noticeId === '6' && (
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <Badge>Orders Tracking - Reviewed Status</Badge>
                  <p className="text-xs text-gray-500 mt-2">
                    This template will be automatically triggered when an order (lab result) status changes to "Reviewed" by the provider
                  </p>
                </div>
              </div>
            )}

            {noticeId === '7' && (
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>Save</Badge>
                    <Badge>Save & Print</Badge>
                    <Badge>Save & eRx</Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    This template will be automatically triggered when a prescription is processed in the core system
                  </p>
                </div>
              </div>
            )}

            {noticeId === '8' && (
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <Badge>Recall</Badge>
                  <p className="text-xs text-gray-500 mt-2">
                    This template will be automatically triggered based on patient recall due dates
                  </p>
                </div>
              </div>
            )}

            {noticeId === '9' && (
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>Balance Update</Badge>
                    <Badge>Payment Received</Badge>
                    <Badge>Payment Plan Created</Badge>
                    <Badge>Payment Plan Update</Badge>
                    <Badge>Copay Due</Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    This template will be automatically triggered when billing changes occur in the core system
                  </p>
                </div>
              </div>
            )}

            {noticeId === '11' && (
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>Balance Update</Badge>
                    <Badge>Payment Received</Badge>
                    <Badge>Payment Plan Created</Badge>
                    <Badge>Payment Plan Update</Badge>
                    <Badge>Copay Due</Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    This template will be automatically triggered when billing changes occur in the core system
                  </p>
                </div>
              </div>
            )}

            {noticeId === '12' && (
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>Lab Results Available</Badge>
                    <Badge>Imaging Report Available</Badge>
                    <Badge>Pathology Report Available</Badge>
                    <Badge>Test Results Posted</Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    This template will be automatically triggered when clinical results are available in the patient portal
                  </p>
                </div>
              </div>
            )}

            {/* Delivery Time */}
            <div className="space-y-3">
              <Label>Delivery Time</Label>
              <div className="space-y-3">
                {noticeId === '4' && (
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryTime"
                      id="on-birthday"
                      value="on-birthday"
                      checked={deliveryTime === 'on-birthday'}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="on-birthday" className="text-sm">
                      On Birthday
                    </label>
                  </div>
                )}

                {noticeId === '8' && (
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryTime"
                      id="on-recall-date"
                      value="on-recall-date"
                      checked={deliveryTime === 'on-recall-date'}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="on-recall-date" className="text-sm">
                      On Recall Date Due
                    </label>
                  </div>
                )}

                {noticeId !== '4' && noticeId !== '8' && (
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryTime"
                      id="real-time"
                      value="real-time"
                      checked={deliveryTime === 'real-time'}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="real-time" className="text-sm">
                      Real-Time (send immediately)
                    </label>
                  </div>
                )}

                {(noticeId === '1' || noticeId === '4' || noticeId === '8') && (
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryTime"
                      id="scheduled-before"
                      value="scheduled-before"
                      checked={deliveryTime === 'scheduled-before'}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="scheduled-before" className="text-sm flex items-center gap-2">
                      <span>Send</span>
                      <Input
                        type="number"
                        value={deliveryValue}
                        onChange={(e) => setDeliveryValue(e.target.value)}
                        className="w-20 h-8"
                        min="1"
                      />
                      <Select value={deliveryUnit} onValueChange={setDeliveryUnit}>
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                      <span>before {noticeId === '4' ? 'birthday' : noticeId === '8' ? 'recall date' : 'appointment'}</span>
                    </label>
                  </div>
                )}

                {(noticeId !== '7' && noticeId !== '4') && (
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryTime"
                      id="scheduled-after"
                      value="scheduled-after"
                      checked={deliveryTime === 'scheduled-after'}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="scheduled-after" className="text-sm flex items-center gap-2">
                      <span>Send</span>
                      <Input
                        type="number"
                        value={deliveryValue}
                        onChange={(e) => setDeliveryValue(e.target.value)}
                        className="w-20 h-8"
                        min="1"
                      />
                      <Select value={deliveryUnit} onValueChange={setDeliveryUnit}>
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                      <span>after {noticeId === '2' ? 'broadcast creation' : noticeId === '8' ? 'recall date' : 'appointment'}</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Message Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Message Content</Label>
                <span className={`text-xs ${message.length > 320 ? 'text-red-600' : message.length > 280 ? 'text-orange-600' : 'text-gray-500'}`}>
                  {message.length} / 320 characters
                </span>
              </div>
              <Textarea
                placeholder="Enter your message here..."
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= 320) {
                    setMessage(e.target.value);
                  }
                }}
                rows={6}
                className="resize-none"
                maxLength={320}
              />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-600">Insert variables:</span>
                <FHIRVariablePicker onInsertVariable={insertVariable} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('patientName')}
                  className="h-7 text-xs"
                >
                  Patient Name
                </Button>
                {noticeId !== '4' && noticeId !== '7' && noticeId !== '9' && noticeId !== '11' && noticeId !== '12' && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('appointmentDate')}
                      className="h-7 text-xs"
                    >
                      Appointment Date
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('appointmentTime')}
                      className="h-7 text-xs"
                    >
                      Appointment Time
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('providerName')}
                      className="h-7 text-xs"
                    >
                      Provider Name
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('locationName')}
                      className="h-7 text-xs"
                    >
                      Location
                    </Button>
                  </>
                )}
                {noticeId === '4' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable('patientAge')}
                    className="h-7 text-xs"
                  >
                    Patient Age
                  </Button>
                )}
                {noticeId === '7' && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('medicationName')}
                      className="h-7 text-xs"
                    >
                      Medication Name
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('providerName')}
                      className="h-7 text-xs"
                    >
                      Provider Name
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('pharmacyName')}
                      className="h-7 text-xs"
                    >
                      Pharmacy Name
                    </Button>
                  </>
                )}
                {noticeId === '8' && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('recallDate')}
                      className="h-7 text-xs"
                    >
                      Recall Date
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('appointmentType')}
                      className="h-7 text-xs"
                    >
                      Appointment Type
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('locationName')}
                      className="h-7 text-xs"
                    >
                      Location
                    </Button>
                  </>
                )}
                {(noticeId === '9' || noticeId === '11') && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('balanceAmount')}
                      className="h-7 text-xs"
                    >
                      Balance Amount
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('paymentAmount')}
                      className="h-7 text-xs"
                    >
                      Payment Amount
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('dueDate')}
                      className="h-7 text-xs"
                    >
                      Due Date
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('locationName')}
                      className="h-7 text-xs"
                    >
                      Location
                    </Button>
                  </>
                )}
                {noticeId === '12' && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('orderType')}
                      className="h-7 text-xs"
                    >
                      Order Type
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('orderDate')}
                      className="h-7 text-xs"
                    >
                      Order Date
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('providerName')}
                      className="h-7 text-xs"
                    >
                      Provider Name
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('portalLink')}
                      className="h-7 text-xs"
                    >
                      Portal Link
                    </Button>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {noticeId === '4' 
                  ? `Example: \"Happy birthday, {patientName}! Wishing you a wonderful day as you celebrate turning {patientAge}!\"`
                  : noticeId === '6'
                  ? `Example: \"Hi {patientName}, your lab results from {orderDate} have been reviewed by {providerName}. Our office will contact you if any follow-up is needed.\"`
                  : noticeId === '7'
                  ? `Example: \"Hi {patientName}, your prescription for {medicationName} has been sent to {pharmacyName} by {providerName}. It should be ready for pickup soon.\"`
                  : noticeId === '8'
                  ? `Example: \"Hi {patientName}, you are due for your {appointmentType} appointment on {recallDate}. Please call {locationName} to schedule.\"`
                  : (noticeId === '9' || noticeId === '11')
                  ? `Example: \"Hi {patientName}, your account balance is {balanceAmount}. To make a payment or set up a payment plan, please contact us or visit your patient portal.\"`
                  : noticeId === '12'
                  ? `Example: \"Hi {patientName}, your {orderType} results from {orderDate} are now available. View them in your patient portal: {portalLink}\"`
                  : `Example: \"Hi {patientName}, your appointment is scheduled for {appointmentDate} at {appointmentTime} with {providerName}.\\\"`
                }
              </p>
            </div>

            {/* Customization Conditions - For Appointment-Based Notices */}
            {(noticeId === '1' || noticeId === '2' || noticeId === '5') && (
              <div className="space-y-3">
                <Label>Customization Conditions (Optional)</Label>
                <p className="text-xs text-gray-500 mb-3">
                  Apply this template only when these conditions are met
                </p>

                <div className="space-y-4 border rounded-lg p-4">
                  {noticeId === '2' && (
                    <div className="space-y-2">
                      <Label className="text-sm">Appointment Date/Time Range</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Start Date</Label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">End Date</Label>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <MultiSelectFilter
                    label="Appointment Type"
                    options={appointmentTypes}
                    selectedValues={selectedApptTypes}
                    onChange={setSelectedApptTypes}
                    placeholder="Select appointment types..."
                  />

                  <MultiSelectFilter
                    label="Reason"
                    options={reasons}
                    selectedValues={selectedReasons}
                    onChange={setSelectedReasons}
                    placeholder="Select visit reasons..."
                  />

                  <MultiSelectFilter
                    label="Resource/Provider"
                    options={providers}
                    selectedValues={selectedProviders}
                    onChange={setSelectedProviders}
                    placeholder="Select providers..."
                  />

                  <MultiSelectFilter
                    label="Location/Service Center"
                    options={locations}
                    selectedValues={selectedLocations}
                    onChange={setSelectedLocations}
                    placeholder="Select locations..."
                  />
                </div>
              </div>
            )}

            {/* Delivery Methods */}
            <div className="space-y-3">
              <Label>Delivery Methods <span className="text-red-500">*</span></Label>
              <p className="text-xs text-gray-500 mb-3">
                Select which methods are available for this message. The system will use each patient's preferred contact method.
              </p>

              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="email"
                    id="email"
                    checked={email}
                    onChange={(e) => setEmail(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="email" className="text-sm">
                    Email
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="sms"
                    id="sms"
                    checked={sms}
                    onChange={(e) => setSms(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="sms" className="text-sm">
                    SMS
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="voice"
                    id="voice"
                    checked={voice}
                    onChange={(e) => setVoice(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="voice" className="text-sm">
                    Voice
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="push"
                    id="push"
                    checked={push}
                    onChange={(e) => setPush(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="push" className="text-sm">
                    Push Notification
                  </label>
                </div>


              </div>
              
              <p className="text-xs text-gray-400 italic">
                Note: At least one delivery method must be selected. Messages will be sent via each patient's preferred contact method when available.
              </p>
            </div>

            {/* Population Broadcast */}
            {noticeId === '3' && (
              <div className="space-y-3">
                <Label>Target Population</Label>
                <p className="text-xs text-gray-500 mb-3">
                  Define which patient population will receive this message
                </p>

                <div className="space-y-4 border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="targetMethod"
                      id="carePrograms"
                      value="carePrograms"
                      checked={targetMethod === 'carePrograms'}
                      onChange={(e) => setTargetMethod(e.target.value as 'carePrograms' | 'upload')}
                      className="w-4 h-4"
                    />
                    <label htmlFor="carePrograms" className="text-sm">
                      Select Care Programs
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="targetMethod"
                      id="upload"
                      value="upload"
                      checked={targetMethod === 'upload'}
                      onChange={(e) => setTargetMethod(e.target.value as 'carePrograms' | 'upload')}
                      className="w-4 h-4"
                    />
                    <label htmlFor="upload" className="text-sm">
                      Upload Patient Report
                    </label>
                  </div>

                  {targetMethod === 'carePrograms' && (
                    <MultiSelectFilter
                      label="Care Programs"
                      options={carePrograms}
                      selectedValues={selectedCarePrograms}
                      onChange={setSelectedCarePrograms}
                      placeholder="Select care programs..."
                    />
                  )}

                  {targetMethod === 'upload' && (
                    <div className="space-y-2">
                      <Label className="text-sm">Upload Patient List</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={(e) => setUploadedFile(e.target.files ? e.target.files[0] : null)}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <div className="text-center">
                            <p className="text-sm">Click to upload patient report</p>
                            <p className="text-xs text-gray-500">CSV, XLSX, or XLS files</p>
                          </div>
                        </label>
                        {uploadedFile && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            <Upload className="w-4 h-4" />
                            <span>{uploadedFile.name}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Upload a report containing patient identifiers to target specific individuals based on health conditions
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Birthday Messages - Patient Filters */}
            {noticeId === '4' && (
              <div className="space-y-3">
                <Label>Patient Filters (Optional)</Label>
                <p className="text-xs text-gray-500 mb-3">
                  Customize this birthday message for specific patient demographics
                </p>

                <div className="space-y-4 border rounded-lg p-4">
                  <MultiSelectFilter
                    label="Patient Age Range"
                    options={ageRanges}
                    selectedValues={selectedAgeRanges}
                    onChange={setSelectedAgeRanges}
                    placeholder="Select age ranges..."
                  />

                  <MultiSelectFilter
                    label="Patient Sex"
                    options={patientSexes}
                    selectedValues={selectedSexes}
                    onChange={setSelectedSexes}
                    placeholder="Select patient sex..."
                  />
                </div>
              </div>
            )}

            {/* Orders Notifications - Patient Filters */}
            {noticeId === '6' && (
              <div className="space-y-3">
                <Label>Patient Filters (Optional)</Label>
                <p className="text-xs text-gray-500 mb-3">
                  Customize this order notification for specific patient demographics
                </p>

                <div className="space-y-4 border rounded-lg p-4">
                  <MultiSelectFilter
                    label="Patient Age Range"
                    options={ageRanges}
                    selectedValues={selectedOrderAgeRanges}
                    onChange={setSelectedOrderAgeRanges}
                    placeholder="Select age ranges..."
                  />

                  <MultiSelectFilter
                    label="Patient Sex"
                    options={patientSexes}
                    selectedValues={selectedOrderSexes}
                    onChange={setSelectedOrderSexes}
                    placeholder="Select patient sex..."
                  />
                </div>
              </div>
            )}

            {/* Orders Notifications - Order Filters */}
            {noticeId === '6' && (
              <div className="space-y-3">
                <Label>Order Filters (Optional)</Label>
                <p className="text-xs text-gray-500 mb-3">
                  Customize this order notification for specific order details
                </p>

                <div className="space-y-4 border rounded-lg p-4">
                  <MultiSelectFilter
                    label="CPT Codes"
                    options={cptCodes}
                    selectedValues={selectedCptCodes}
                    onChange={setSelectedCptCodes}
                    placeholder="Select CPT codes..."
                  />

                  <MultiSelectFilter
                    label="General Assessment"
                    options={generalAssessments}
                    selectedValues={selectedGeneralAssessment}
                    onChange={setSelectedGeneralAssessment}
                    placeholder="Select general assessment..."
                  />
                </div>
              </div>
            )}

            {/* Recall Notices - Customization Conditions */}
            {noticeId === '8' && (
              <div className="space-y-3">
                <Label>Customization Conditions (Optional)</Label>
                <p className="text-xs text-gray-500 mb-3">
                  Apply this template only when these conditions are met
                </p>

                <div className="space-y-4 border rounded-lg p-4">
                  <MultiSelectFilter
                    label="Appointment Type"
                    options={appointmentTypes}
                    selectedValues={selectedApptTypes}
                    onChange={setSelectedApptTypes}
                    placeholder="Select appointment types..."
                  />

                  <MultiSelectFilter
                    label="Schedule Location"
                    options={locations}
                    selectedValues={selectedLocations}
                    onChange={setSelectedLocations}
                    placeholder="Select locations..."
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={saveTemplate} 
                disabled={!templateName || !message || !(email || sms || voice || push)}
              >
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {previewingTemplate?.name}</DialogTitle>
            <DialogDescription>
              See how this notice will appear across different communication channels
            </DialogDescription>
          </DialogHeader>
          {previewingTemplate && (
            <NoticePreview template={previewingTemplate} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}