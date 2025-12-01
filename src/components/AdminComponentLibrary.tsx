import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Upload, 
  X, 
  FileText, 
  Edit3, 
  CheckCircle2, 
  Trash2, 
  Plus,
  GripVertical,
  Settings
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';

// =============================================================================
// 1. SIGNATURE TOGGLE COMPONENT
// =============================================================================
interface SignatureToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
}

export function SignatureToggle({ 
  enabled, 
  onChange, 
  label = "Require Electronic Signature",
  description = "Maps to: Provenance.signature (FHIR)"
}: SignatureToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
      <div className="flex-1">
        <Label htmlFor="signature-toggle" className="text-base flex items-center gap-2">
          <Edit3 className="w-4 h-4" />
          {label}
        </Label>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <Switch
        id="signature-toggle"
        checked={enabled}
        onCheckedChange={onChange}
      />
    </div>
  );
}

// =============================================================================
// 2. ATTACHMENT UPLOAD COMPONENT
// =============================================================================
interface AttachmentUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (file: File) => void;
  uploadedFile?: File | null;
  onRemove?: () => void;
  label?: string;
  description?: string;
}

export function AttachmentUpload({
  accept = "application/pdf",
  maxSizeMB = 10,
  onFileSelect,
  uploadedFile,
  onRemove,
  label = "PDF Attachment",
  description = "Upload a PDF file"
}: AttachmentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (accept && !file.type.match(accept.replace('application/', ''))) {
      toast.error(`Please select a ${accept.split('/')[1].toUpperCase()} file`);
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    onFileSelect(file);
    toast.success(`File uploaded: ${file.name}`);
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      {description && <p className="text-sm text-gray-600">{description}</p>}
      
      {!uploadedFile ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-3">
            {description || `Upload ${accept.split('/')[1].toUpperCase()} file`}
          </p>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
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
                  {(uploadedFile.size / 1024).toFixed(2)} KB
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
  );
}

// =============================================================================
// 3. FIELD TYPE DROPDOWN COMPONENT
// =============================================================================
interface FieldType {
  value: string;
  label: string;
  fhirType: string;
  description?: string;
}

interface FieldTypeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showFhirMapping?: boolean;
}

export function FieldTypeDropdown({ 
  value, 
  onChange, 
  label = "Field Type",
  showFhirMapping = true
}: FieldTypeDropdownProps) {
  const fieldTypes: FieldType[] = [
    { value: 'string', label: 'Short Text', fhirType: 'string', description: 'Single line text input' },
    { value: 'text', label: 'Long Text', fhirType: 'text', description: 'Multi-line text area' },
    { value: 'integer', label: 'Number (Integer)', fhirType: 'integer', description: 'Whole numbers only' },
    { value: 'decimal', label: 'Number (Decimal)', fhirType: 'decimal', description: 'Decimal numbers' },
    { value: 'date', label: 'Date', fhirType: 'date', description: 'Date picker' },
    { value: 'time', label: 'Time', fhirType: 'time', description: 'Time picker' },
    { value: 'dateTime', label: 'Date & Time', fhirType: 'dateTime', description: 'Date and time picker' },
    { value: 'boolean', label: 'Yes/No', fhirType: 'boolean', description: 'Toggle or checkbox' },
    { value: 'choice', label: 'Multiple Choice', fhirType: 'choice', description: 'Radio buttons or dropdown' },
    { value: 'open-choice', label: 'Choice + Other', fhirType: 'open-choice', description: 'Choice with custom option' },
    { value: 'attachment', label: 'File Upload', fhirType: 'attachment', description: 'File attachment field' },
    { value: 'quantity', label: 'Quantity', fhirType: 'quantity', description: 'Number with unit' },
    { value: 'reference', label: 'Reference', fhirType: 'reference', description: 'Reference to another resource' },
  ];

  const selectedType = fieldTypes.find(t => t.value === value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fieldTypes.map(type => (
            <SelectItem key={type.value} value={type.value}>
              <div className="flex flex-col items-start">
                <span>{type.label}</span>
                {showFhirMapping && (
                  <span className="text-xs text-gray-500">FHIR: {type.fhirType}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedType?.description && (
        <p className="text-xs text-gray-500">{selectedType.description}</p>
      )}
    </div>
  );
}

// =============================================================================
// 4. RULE BUILDER ROW COMPONENT (Conditional Logic)
// =============================================================================
interface RuleBuilderRowProps {
  rule: {
    id: string;
    sourceField: string;
    operator: string;
    value: string;
    action: 'show' | 'hide' | 'require' | 'disable';
    targetField: string;
  };
  availableFields: Array<{ id: string; label: string; type: string }>;
  onChange: (rule: any) => void;
  onRemove: () => void;
}

export function RuleBuilderRow({ rule, availableFields, onChange, onRemove }: RuleBuilderRowProps) {
  const operators = [
    { value: '=', label: 'Equals' },
    { value: '!=', label: 'Not Equals' },
    { value: '>', label: 'Greater Than' },
    { value: '<', label: 'Less Than' },
    { value: '>=', label: 'Greater or Equal' },
    { value: '<=', label: 'Less or Equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'exists', label: 'Has Value' },
    { value: 'notexists', label: 'Is Empty' },
  ];

  const actions = [
    { value: 'show', label: 'Show' },
    { value: 'hide', label: 'Hide' },
    { value: 'require', label: 'Make Required' },
    { value: 'disable', label: 'Disable' },
  ];

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
      <GripVertical className="w-4 h-4 text-gray-400" />
      
      <div className="flex-1 grid grid-cols-5 gap-2">
        {/* Source Field */}
        <Select
          value={rule.sourceField}
          onValueChange={(value) => onChange({ ...rule, sourceField: value })}
        >
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="When field..." />
          </SelectTrigger>
          <SelectContent>
            {availableFields.map(field => (
              <SelectItem key={field.id} value={field.id}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Operator */}
        <Select
          value={rule.operator}
          onValueChange={(value) => onChange({ ...rule, operator: value })}
        >
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="is..." />
          </SelectTrigger>
          <SelectContent>
            {operators.map(op => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Value */}
        <Input
          placeholder="value"
          value={rule.value}
          onChange={(e) => onChange({ ...rule, value: e.target.value })}
          className="text-xs"
        />

        {/* Action */}
        <Select
          value={rule.action}
          onValueChange={(value: any) => onChange({ ...rule, action: value })}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {actions.map(action => (
              <SelectItem key={action.value} value={action.value}>
                {action.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Target Field */}
        <Select
          value={rule.targetField}
          onValueChange={(value) => onChange({ ...rule, targetField: value })}
        >
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="target field" />
          </SelectTrigger>
          <SelectContent>
            {availableFields.map(field => (
              <SelectItem key={field.id} value={field.id}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

// =============================================================================
// 5. TEXT EDITOR COMPONENT (Rich Text)
// =============================================================================
interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  enableFormatting?: boolean;
}

export function TextEditor({ 
  value, 
  onChange, 
  label,
  placeholder = "Enter content...",
  rows = 6,
  enableFormatting = false
}: TextEditorProps) {
  const [mode, setMode] = useState<'plain' | 'rich'>('plain');

  const formatButtons = [
    { icon: 'B', action: 'bold', label: 'Bold' },
    { icon: 'I', action: 'italic', label: 'Italic' },
    { icon: 'U', action: 'underline', label: 'Underline' },
  ];

  const handleFormat = (action: string) => {
    // Simple formatting - in production, use a proper rich text editor library
    const prefix = action === 'bold' ? '**' : action === 'italic' ? '*' : '__';
    const suffix = prefix;
    onChange(`${value}${prefix}text${suffix}`);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      {enableFormatting && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-t-lg border border-b-0">
          {formatButtons.map(btn => (
            <Button
              key={btn.action}
              variant="outline"
              size="sm"
              onClick={() => handleFormat(btn.action)}
              className="h-7 w-7 p-0"
              title={btn.label}
            >
              <span className={btn.action === 'bold' ? 'font-bold' : btn.action === 'italic' ? 'italic' : 'underline'}>
                {btn.icon}
              </span>
            </Button>
          ))}
          <div className="ml-auto flex gap-1">
            <Button
              variant={mode === 'plain' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('plain')}
              className="h-7 text-xs"
            >
              Plain
            </Button>
            <Button
              variant={mode === 'rich' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('rich')}
              className="h-7 text-xs"
            >
              Rich
            </Button>
          </div>
        </div>
      )}
      
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={enableFormatting ? 'rounded-t-none font-mono text-sm' : 'font-mono text-sm'}
      />
      
      <p className="text-xs text-gray-500">
        Supports merge fields: {`{{patient.name}}`}, {`{{practice.name}}`}, {`{{date}}`}
      </p>
    </div>
  );
}

// =============================================================================
// 6. REQUIRED TOGGLE COMPONENT
// =============================================================================
interface RequiredToggleProps {
  required: boolean;
  onChange: (required: boolean) => void;
  label?: string;
  fhirMapping?: string;
}

export function RequiredToggle({ 
  required, 
  onChange,
  label = "Required Field",
  fhirMapping = "Questionnaire.item.required"
}: RequiredToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
      <div>
        <Label className="text-sm">{label}</Label>
        <p className="text-xs text-gray-500 mt-0.5">Maps to: {fhirMapping}</p>
      </div>
      <Switch
        checked={required}
        onCheckedChange={onChange}
      />
    </div>
  );
}

// =============================================================================
// COMPONENT LIBRARY SHOWCASE (for documentation/demo purposes)
// =============================================================================
export function AdminComponentLibraryShowcase() {
  const [signatureEnabled, setSignatureEnabled] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fieldType, setFieldType] = useState('string');
  const [textContent, setTextContent] = useState('');
  const [required, setRequired] = useState(false);
  const [rules, setRules] = useState<any[]>([]);

  const mockFields = [
    { id: 'q1', label: 'Patient Name', type: 'string' },
    { id: 'q2', label: 'Date of Birth', type: 'date' },
    { id: 'q3', label: 'Pregnant', type: 'boolean' },
    { id: 'q4', label: 'Due Date', type: 'date' },
  ];

  return (
    <div className="space-y-8 p-8 max-w-4xl">
      <div>
        <h2 className="mb-4">Admin Component Library</h2>
        <p className="text-gray-600">
          Reusable FHIR-compliant components for building forms, consents, and documents
        </p>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h3 className="mb-4">1. Signature Toggle</h3>
          <SignatureToggle
            enabled={signatureEnabled}
            onChange={setSignatureEnabled}
          />
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="mb-4">2. Attachment Upload</h3>
          <AttachmentUpload
            onFileSelect={setUploadedFile}
            uploadedFile={uploadedFile}
            onRemove={() => setUploadedFile(null)}
            label="PDF Document"
            description="Upload consent form PDF"
          />
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="mb-4">3. Field Type Dropdown</h3>
          <FieldTypeDropdown
            value={fieldType}
            onChange={setFieldType}
          />
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="mb-4">4. Text Editor</h3>
          <TextEditor
            value={textContent}
            onChange={setTextContent}
            label="Content"
            enableFormatting={true}
          />
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="mb-4">5. Required Toggle</h3>
          <RequiredToggle
            required={required}
            onChange={setRequired}
          />
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="mb-4">6. Rule Builder Row</h3>
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <RuleBuilderRow
                key={rule.id}
                rule={rule}
                availableFields={mockFields}
                onChange={(updatedRule) => {
                  const newRules = [...rules];
                  newRules[index] = updatedRule;
                  setRules(newRules);
                }}
                onRemove={() => setRules(rules.filter((_, i) => i !== index))}
              />
            ))}
            <Button
              variant="outline"
              onClick={() => {
                setRules([...rules, {
                  id: `rule-${Date.now()}`,
                  sourceField: '',
                  operator: '=',
                  value: '',
                  action: 'show',
                  targetField: ''
                }]);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Conditional Rule
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
