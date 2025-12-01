import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { 
  Shield, 
  User, 
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Upload,
  AlertCircle
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import type { MatchedPatient } from './PatientMatchingFlow';

interface ProxyRegistrationFlowProps {
  onBack: () => void;
  onRegistrationComplete: (data: ProxyRegistrationData) => void;
  matchedPatient: MatchedPatient;
}

export interface ProxyRegistrationData {
  proxyInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    relationship: string;
    relationshipOther?: string;
  };
  patientId: string;
  resources: {
    relatedPerson: any;
    consent: any;
    provenance: any;
  };
}

export function ProxyRegistrationFlow({ 
  onBack, 
  onRegistrationComplete,
  matchedPatient 
}: ProxyRegistrationFlowProps) {
  const [step, setStep] = useState<'info' | 'documents' | 'consent' | 'processing' | 'complete'>('info');
  const [loading, setLoading] = useState(false);
  
  // Proxy info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [relationshipOther, setRelationshipOther] = useState('');
  
  // Documents
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  
  // Consent
  const [consentChecked, setConsentChecked] = useState(false);
  const [hipaaChecked, setHipaaChecked] = useState(false);
  
  // Result
  const [registrationData, setRegistrationData] = useState<ProxyRegistrationData | null>(null);

  const relationshipOptions = [
    { value: 'GUARD', label: 'Legal Guardian' },
    { value: 'CHILD', label: 'Child' },
    { value: 'PARENT', label: 'Parent' },
    { value: 'DOMPART', label: 'Domestic Partner' },
    { value: 'SPS', label: 'Spouse' },
    { value: 'FRND', label: 'Friend' },
    { value: 'POWATT', label: 'Power of Attorney' },
    { value: 'OTHER', label: 'Other' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedDocument(e.target.files[0]);
      toast.success('Document uploaded successfully');
    }
  };

  const handleSubmitInfo = () => {
    if (!firstName || !lastName || !phone || !email || !relationship) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (relationship === 'OTHER' && !relationshipOther) {
      toast.error('Please specify the relationship');
      return;
    }

    setStep('documents');
  };

  const handleSubmitDocuments = () => {
    if (!uploadedDocument) {
      toast.error('Please upload supporting documentation');
      return;
    }
    setStep('consent');
  };

  const handleSubmitConsent = async () => {
    if (!consentChecked || !hipaaChecked) {
      toast.error('Please acknowledge all consent statements');
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      const relationshipCode = relationship === 'OTHER' ? 'OTHER' : relationship;
      const relationshipDisplay = relationship === 'OTHER' 
        ? relationshipOther 
        : relationshipOptions.find(r => r.value === relationship)?.label || 'Representative';

      const requestBody = {
        healthlakeBase: 'https://healthlake-endpoint/fhir', // Demo endpoint
        patientId: matchedPatient.id,
        proxy: {
          name: {
            family: lastName,
            given: firstName
          },
          telecom: [
            { system: 'phone', value: phone, use: 'mobile' },
            { system: 'email', value: email }
          ],
          relationship: {
            code: relationshipCode,
            display: relationshipDisplay
          },
          identifier: {
            system: 'http://example.org/relatedperson-ids',
            value: `rel-${Date.now()}`
          }
        },
        consent: {
          period: {
            start: new Date().toISOString().split('T')[0],
            end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year
          },
          scopes: ['access', 'read', 'write']
        }
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/registerProxy`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to register proxy');
      }

      const data = await response.json();
      
      const resultData: ProxyRegistrationData = {
        proxyInfo: {
          firstName,
          lastName,
          phone,
          email,
          relationship: relationshipDisplay,
          relationshipOther: relationship === 'OTHER' ? relationshipOther : undefined
        },
        patientId: matchedPatient.id,
        resources: data.resources
      };

      setRegistrationData(resultData);
      setTimeout(() => {
        setStep('complete');
        toast.success('Proxy registration completed successfully!');
      }, 2000);
    } catch (error) {
      console.error('Error registering proxy:', error);
      toast.error('Failed to register proxy. Please try again.');
      setStep('consent');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (registrationData) {
      onRegistrationComplete(registrationData);
    }
  };

  // Info Step
  if (step === 'info') {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-purple-700 -ml-2"
            onClick={onBack}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-base">Representative Info</h3>
          <div className="w-8"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>

            <div className="text-center mb-6">
              <h3 className="mb-2">Your Information</h3>
              <p className="text-sm text-gray-600">
                Enter your details as the authorized representative
              </p>
            </div>

            {/* Patient Being Represented */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-3">
                <Label className="text-xs text-purple-700 mb-1 block">Representing Patient</Label>
                <p className="font-medium text-purple-900">
                  {matchedPatient.name?.[0]?.given?.[0]} {matchedPatient.name?.[0]?.family}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  MRN: {matchedPatient.identifier?.[0]?.value}
                </p>
              </CardContent>
            </Card>

            {/* Representative Info Form */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="proxyFirstName" className="text-sm mb-2 block">First Name *</Label>
                <Input
                  id="proxyFirstName"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="proxyLastName" className="text-sm mb-2 block">Last Name *</Label>
                <Input
                  id="proxyLastName"
                  placeholder="Your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="proxyPhone" className="text-sm mb-2 block">Phone Number *</Label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <Input
                    id="proxyPhone"
                    type="tel"
                    placeholder="+1-555-555-5555"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="proxyEmail" className="text-sm mb-2 block">Email Address *</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <Input
                    id="proxyEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="relationship" className="text-sm mb-2 block">Relationship to Patient *</Label>
                <Select value={relationship} onValueChange={setRelationship}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {relationship === 'OTHER' && (
                <div>
                  <Label htmlFor="relationshipOther" className="text-sm mb-2 block">Specify Relationship *</Label>
                  <Input
                    id="relationshipOther"
                    placeholder="Please specify"
                    value={relationshipOther}
                    onChange={(e) => setRelationshipOther(e.target.value)}
                  />
                </div>
              )}
            </div>

            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={handleSubmitInfo}
            >
              Continue to Documentation
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Documents Step
  if (step === 'documents') {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-purple-700 -ml-2"
            onClick={() => setStep('info')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-base">Supporting Documents</h3>
          <div className="w-8"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>

            <div className="text-center mb-6">
              <h3 className="mb-2">Upload Documentation</h3>
              <p className="text-sm text-gray-600">
                Please provide proof of your authorization to act on behalf of the patient
              </p>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Acceptable Documents:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Power of Attorney (POA)</li>
                      <li>Legal Guardianship papers</li>
                      <li>Court order or decree</li>
                      <li>Medical consent form signed by patient</li>
                      <li>Government-issued ID of representative</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                id="document-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              <label htmlFor="document-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-purple-600" />
                  </div>
                  {uploadedDocument ? (
                    <div className="space-y-2">
                      <p className="font-medium text-purple-900">{uploadedDocument.name}</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium">Click to upload document</p>
                      <p className="text-xs text-gray-500">PDF, JPG, or PNG (max 10MB)</p>
                    </>
                  )}
                </div>
              </label>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleSubmitDocuments}
                disabled={!uploadedDocument}
              >
                Continue to Consent
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setStep('info')}
              >
                Back
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Consent Step
  if (step === 'consent') {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-purple-700 -ml-2"
            onClick={() => setStep('documents')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-base">Consent & Authorization</h3>
          <div className="w-8"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>

            <div className="text-center mb-6">
              <h3 className="mb-2">Review & Consent</h3>
              <p className="text-sm text-gray-600">
                Please review and acknowledge the following statements
              </p>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="consent-auth"
                    checked={consentChecked}
                    onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="consent-auth" className="text-sm font-medium cursor-pointer">
                      Authorization Statement
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      I certify that I am legally authorized to access, view, and manage the health information 
                      of {matchedPatient.name?.[0]?.given?.[0]} {matchedPatient.name?.[0]?.family} as their {
                        relationship === 'OTHER' ? relationshipOther : 
                        relationshipOptions.find(r => r.value === relationship)?.label
                      }. I have provided valid documentation proving my authorization.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="consent-hipaa"
                    checked={hipaaChecked}
                    onCheckedChange={(checked) => setHipaaChecked(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="consent-hipaa" className="text-sm font-medium cursor-pointer">
                      HIPAA & Privacy Acknowledgment
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      I understand that I will have access to protected health information (PHI) and agree 
                      to maintain the confidentiality of this information in accordance with HIPAA regulations. 
                      I will use this access only for the intended purpose of managing the patient's healthcare.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <Label className="text-xs text-gray-500 mb-2 block">Authorization Period</Label>
                <p className="text-sm">
                  This authorization will be valid for <span className="font-medium">1 year</span> from today 
                  and can be revoked at any time by contacting the practice.
                </p>
              </CardContent>
            </Card>

            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={handleSubmitConsent}
              disabled={!consentChecked || !hipaaChecked}
            >
              <Shield className="w-4 h-4 mr-2" />
              Submit Registration
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Processing Step
  if (step === 'processing') {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
            <div>
              <h3 className="mb-2">Processing Registration</h3>
              <p className="text-sm text-gray-600">
                Creating your authorized representative access...
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Complete Step
  if (step === 'complete' && registrationData) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </motion.div>

            <div>
              <h3 className="mb-2">Registration Complete!</h3>
              <p className="text-sm text-gray-600">
                You are now registered as an authorized representative for{' '}
                {matchedPatient.name?.[0]?.given?.[0]} {matchedPatient.name?.[0]?.family}
              </p>
            </div>

            <Card className="bg-gray-50 text-left">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>RelatedPerson record created</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Consent authorization established</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Provenance tracking recorded</span>
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={handleComplete}
            >
              Continue to Account Setup
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
