import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Code, Copy, CheckCircle, Search, User, Calendar, Building, DollarSign, FileText } from 'lucide-react';

interface FHIRVariable {
  name: string;
  category: 'Patient' | 'Appointment' | 'Organization' | 'Practitioner' | 'Account' | 'ServiceRequest';
  fhirPath: string;
  description: string;
  example: string;
  fallback?: string;
}

const FHIR_VARIABLES: FHIRVariable[] = [
  // Patient Variables
  {
    name: '{{patient_name}}',
    category: 'Patient',
    fhirPath: 'Patient.name[0].given[0] + " " + Patient.name[0].family',
    description: 'Full patient name',
    example: 'Sarah Johnson',
    fallback: 'Patient.name[0].text'
  },
  {
    name: '{{patient_first_name}}',
    category: 'Patient',
    fhirPath: 'Patient.name[0].given[0]',
    description: 'Patient first name',
    example: 'Sarah'
  },
  {
    name: '{{patient_last_name}}',
    category: 'Patient',
    fhirPath: 'Patient.name[0].family',
    description: 'Patient last name',
    example: 'Johnson'
  },
  {
    name: '{{patient_dob}}',
    category: 'Patient',
    fhirPath: 'Patient.birthDate',
    description: 'Patient date of birth',
    example: 'Jan 15, 1985',
    fallback: 'Format per tenant locale'
  },
  {
    name: '{{patient_gender}}',
    category: 'Patient',
    fhirPath: 'Patient.gender',
    description: 'Patient gender',
    example: 'female'
  },
  {
    name: '{{patient_phone}}',
    category: 'Patient',
    fhirPath: 'Patient.telecom.where(system=\'phone\').first().value',
    description: 'Patient phone number',
    example: '(555) 123-4567',
    fallback: 'Respect DNC/opt-out'
  },
  {
    name: '{{patient_email}}',
    category: 'Patient',
    fhirPath: 'Patient.telecom.where(system=\'email\').first().value',
    description: 'Patient email address',
    example: 'sarah.johnson@email.com',
    fallback: 'Respect unsubscribe'
  },
  {
    name: '{{patient_address}}',
    category: 'Patient',
    fhirPath: 'Patient.address[0].text',
    description: 'Patient address',
    example: '123 Main St, Springfield'
  },
  
  // Appointment Variables
  {
    name: '{{appointment_date}}',
    category: 'Appointment',
    fhirPath: 'Appointment.start',
    description: 'Appointment date',
    example: 'Nov 20, 2025',
    fallback: 'TZ-aware formatting'
  },
  {
    name: '{{appointment_time}}',
    category: 'Appointment',
    fhirPath: 'Appointment.start',
    description: 'Appointment time',
    example: '2:00 PM',
    fallback: 'TZ-aware formatting'
  },
  {
    name: '{{appointment_location}}',
    category: 'Appointment',
    fhirPath: 'Appointment.location[0].display',
    description: 'Appointment location',
    example: 'Main Street Clinic'
  },
  {
    name: '{{appointment_reason}}',
    category: 'Appointment',
    fhirPath: 'Appointment.reasonCode[0].text',
    description: 'Appointment reason',
    example: 'Annual Physical'
  },
  {
    name: '{{location_address}}',
    category: 'Appointment',
    fhirPath: 'Location.address.text',
    description: 'Location address',
    example: '123 Medical Pkwy, Suite 100'
  },
  
  // Organization Variables
  {
    name: '{{practice_name}}',
    category: 'Organization',
    fhirPath: 'Organization.name',
    description: 'Practice name',
    example: 'Springfield Medical Center',
    fallback: 'From tenant org'
  },
  {
    name: '{{practice_phone}}',
    category: 'Organization',
    fhirPath: 'Organization.telecom.where(system=\'phone\').first().value',
    description: 'Practice phone number',
    example: '(555) 987-6543'
  },
  
  // Practitioner Variables
  {
    name: '{{provider_name}}',
    category: 'Practitioner',
    fhirPath: 'Practitioner.name[0].text',
    description: 'Provider name',
    example: 'Dr. Smith',
    fallback: 'From appointment link'
  },
  
  // ServiceRequest Variables
  {
    name: '{{recall_due_date}}',
    category: 'ServiceRequest',
    fhirPath: 'ServiceRequest.occurrenceDateTime',
    description: 'Recall due date',
    example: 'Dec 15, 2025'
  },
  
  // Account Variables
  {
    name: '{{balance_due}}',
    category: 'Account',
    fhirPath: 'Account.balance.value',
    description: 'Balance due',
    example: '$125.00',
    fallback: 'Only if allowed by policy'
  },
  
  // System Variables
  {
    name: '{{portal_link}}',
    category: 'Organization',
    fhirPath: 'BFF-generated',
    description: 'Patient portal link',
    example: 'https://portal.example.com'
  }
];

interface FHIRVariablePickerProps {
  onInsertVariable: (variable: string) => void;
}

export function FHIRVariablePicker({ onInsertVariable }: FHIRVariablePickerProps) {
  const [search, setSearch] = useState('');
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const categories = Array.from(new Set(FHIR_VARIABLES.map(v => v.category)));

  const filteredVariables = FHIR_VARIABLES.filter(variable => 
    variable.name.toLowerCase().includes(search.toLowerCase()) ||
    variable.description.toLowerCase().includes(search.toLowerCase()) ||
    variable.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    setCopiedVariable(variable);
    setTimeout(() => setCopiedVariable(null), 2000);
  };

  const handleInsert = (variable: string) => {
    onInsertVariable(variable);
    setOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Patient': return <User className="w-3 h-3" />;
      case 'Appointment': return <Calendar className="w-3 h-3" />;
      case 'Organization': return <Building className="w-3 h-3" />;
      case 'Practitioner': return <User className="w-3 h-3" />;
      case 'Account': return <DollarSign className="w-3 h-3" />;
      case 'ServiceRequest': return <FileText className="w-3 h-3" />;
      default: return <Code className="w-3 h-3" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Code className="w-4 h-4" />
          Insert FHIR Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <div className="p-3 border-b bg-gray-50">
          <div className="mb-2">
            <div className="text-sm mb-1">FHIR Template Variables</div>
            <div className="text-xs text-gray-600">Click to insert dynamic patient and appointment data</div>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search variables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {categories.map(category => {
              const categoryVariables = filteredVariables.filter(v => v.category === category);
              if (categoryVariables.length === 0) return null;

              return (
                <div key={category} className="mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 px-2">
                    {getCategoryIcon(category)}
                    <span className="uppercase tracking-wide">{category}</span>
                    <Badge variant="outline" className="text-xs">
                      {categoryVariables.length}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {categoryVariables.map(variable => (
                      <div
                        key={variable.name}
                        className="group hover:bg-gray-100 rounded-lg p-2 transition-colors cursor-pointer"
                        onClick={() => handleInsert(variable.name)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                {variable.name}
                              </code>
                              {variable.fallback && (
                                <Badge variant="outline" className="text-xs">
                                  Fallback
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 mb-1">{variable.description}</div>
                            <div className="text-xs text-gray-500 font-mono">{variable.fhirPath}</div>
                            <div className="text-xs text-green-700 mt-1">
                              Example: <span className="font-medium">{variable.example}</span>
                            </div>
                            {variable.fallback && (
                              <div className="text-xs text-amber-600 mt-1">
                                Note: {variable.fallback}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyVariable(variable.name);
                              }}
                            >
                              {copiedVariable === variable.name ? (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredVariables.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500">
                No variables found matching "{search}"
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-gray-50">
          <div className="text-xs text-gray-600">
            💡 <strong>Tip:</strong> Variables are replaced with real patient data when messages are sent
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
