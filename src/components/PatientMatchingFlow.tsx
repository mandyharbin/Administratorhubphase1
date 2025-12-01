import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Search, 
  User, 
  Calendar, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export interface MatchedPatient {
  resourceType: string;
  id: string;
  identifier?: Array<{ system: string; value: string }>;
  name?: Array<{ family: string; given: string[] }>;
  birthDate?: string;
  gender?: string;
  telecom?: Array<{ system: string; value: string; use?: string }>;
}

export interface FuzzyCandidate {
  patient: MatchedPatient;
  score: number;
  matchType: 'exact' | 'high' | 'medium' | 'low';
  matchedFields: string[];
  confidence: string;
}

interface PatientMatchingFlowProps {
  onBack: () => void;
  onMatchConfirmed: (patient: MatchedPatient) => void;
  isAuthRep?: boolean;
}

export function PatientMatchingFlow({ 
  onBack, 
  onMatchConfirmed,
  isAuthRep = false 
}: PatientMatchingFlowProps) {
  const [step, setStep] = useState<'search' | 'results' | 'confirm'>('search');
  const [loading, setLoading] = useState(false);
  
  // Search form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [mrn, setMrn] = useState('');
  
  // Results state
  const [matchType, setMatchType] = useState<'deterministic' | 'fuzzy' | 'none'>('none');
  const [matches, setMatches] = useState<MatchedPatient[]>([]);
  const [candidates, setCandidates] = useState<FuzzyCandidate[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<MatchedPatient | null>(null);

  const handleSearch = async () => {
    if (!firstName && !lastName && !birthDate && !mrn) {
      toast.error('Please enter at least one search criteria');
      return;
    }

    setLoading(true);
    try {
      const requestBody: any = {
        healthlakeBase: 'https://healthlake-endpoint/fhir' // Demo endpoint
      };

      // Add identifier if MRN provided
      if (mrn) {
        requestBody.identifiers = [
          { system: 'http://hospital.example.org/mrn', value: mrn }
        ];
      }

      // Add demographics
      if (firstName) requestBody.given = firstName;
      if (lastName) requestBody.family = lastName;
      if (birthDate) requestBody.birthDate = birthDate;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/matchPatient`,
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
        throw new Error('Failed to search for patient');
      }

      const data = await response.json();
      setMatchType(data.matchType);

      if (data.matchType === 'deterministic') {
        setMatches(data.matches || []);
        setCandidates([]);
        toast.success(`Found ${data.count} exact match(es)`);
      } else if (data.matchType === 'fuzzy') {
        setMatches([]);
        setCandidates(data.candidates || []);
        toast.info(`Found ${data.count} potential match(es)`);
      } else {
        setMatches([]);
        setCandidates([]);
        toast.warning('No matching patients found');
      }

      setStep('results');
    } catch (error) {
      console.error('Error searching for patient:', error);
      toast.error('Failed to search for patient');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient: MatchedPatient) => {
    setSelectedPatient(patient);
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (selectedPatient) {
      onMatchConfirmed(selectedPatient);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Search Step
  if (step === 'search') {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className={`${isAuthRep ? 'bg-purple-600' : 'bg-teal-600'} text-white p-4 flex items-center justify-between`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-white ${isAuthRep ? 'hover:bg-purple-700' : 'hover:bg-teal-700'} -ml-2`}
            onClick={onBack}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-base">Patient Search</h3>
          <div className="w-8"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className={`w-16 h-16 ${isAuthRep ? 'bg-purple-600' : 'bg-teal-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Search className="w-8 h-8 text-white" />
            </div>

            <div className="text-center mb-6">
              <h3 className="mb-2">
                {isAuthRep ? 'Find Patient Record' : 'Verify Your Identity'}
              </h3>
              <p className="text-sm text-gray-600">
                {isAuthRep 
                  ? 'Search for the patient you are representing' 
                  : 'Enter your information to locate your medical record'}
              </p>
            </div>

            {/* Quick Search with MRN */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <Label htmlFor="mrn" className="text-sm mb-2 block">Medical Record Number (MRN)</Label>
                <Input
                  id="mrn"
                  placeholder="e.g., 12345"
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  If you have your MRN, this is the fastest way to find your record
                </p>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-xs text-gray-500">OR SEARCH BY</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Demographics Search */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="firstName" className="text-sm mb-2 block">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="lastName" className="text-sm mb-2 block">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="birthDate" className="text-sm mb-2 block">Date of Birth</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
            </div>

            <Button 
              className={`w-full ${isAuthRep ? 'bg-purple-600 hover:bg-purple-700' : 'bg-teal-600 hover:bg-teal-700'}`}
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search for Patient
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Results Step
  if (step === 'results') {
    const hasResults = matches.length > 0 || candidates.length > 0;

    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className={`${isAuthRep ? 'bg-purple-600' : 'bg-teal-600'} text-white p-4 flex items-center justify-between`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-white ${isAuthRep ? 'hover:bg-purple-700' : 'hover:bg-teal-700'} -ml-2`}
            onClick={() => setStep('search')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-base">Search Results</h3>
          <div className="w-8"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!hasResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="mb-2">No Matches Found</h3>
              <p className="text-sm text-gray-600 mb-4">
                We couldn't find a patient record matching your search criteria.
              </p>
              <Button 
                variant="outline"
                onClick={() => setStep('search')}
              >
                Try Again
              </Button>
            </motion.div>
          )}

          {/* Exact Matches */}
          {matches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="text-base">Exact Match Found</h3>
                  <p className="text-sm text-gray-600">
                    We found {matches.length} record(s) that match your information
                  </p>
                </div>
              </div>

              {matches.map((patient) => (
                <Card 
                  key={patient.id}
                  className="cursor-pointer hover:border-teal-600 hover:shadow-md transition-all"
                  onClick={() => handleSelectPatient(patient)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {patient.name?.[0]?.given?.[0]} {patient.name?.[0]?.family}
                            </span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Exact Match
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span>DOB: {formatDate(patient.birthDate)}</span>
                            </div>
                            {patient.identifier && patient.identifier[0] && (
                              <div className="text-xs text-gray-500">
                                MRN: {patient.identifier[0].value}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Fuzzy Match Candidates */}
          {candidates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <h3 className="text-base">Potential Matches</h3>
                  <p className="text-sm text-gray-600">
                    We found {candidates.length} similar record(s). Select the correct one:
                  </p>
                </div>
              </div>

              {candidates.map((candidate, index) => {
                const patient = candidate.patient;
                const confidenceColor = 
                  candidate.matchType === 'exact' || candidate.matchType === 'high' ? 'text-green-700 bg-green-50 border-green-200' :
                  candidate.matchType === 'medium' ? 'text-orange-700 bg-orange-50 border-orange-200' :
                  'text-gray-700 bg-gray-50 border-gray-200';

                return (
                  <Card 
                    key={patient.id || index}
                    className="cursor-pointer hover:border-orange-600 hover:shadow-md transition-all"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium">
                                {patient.name?.[0]?.given?.[0]} {patient.name?.[0]?.family}
                              </span>
                              <Badge variant="outline" className={confidenceColor}>
                                {candidate.confidence} Confidence
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                <span>DOB: {formatDate(patient.birthDate)}</span>
                              </div>
                              {patient.identifier && patient.identifier[0] && (
                                <div className="text-xs text-gray-500">
                                  MRN: {patient.identifier[0].value}
                                </div>
                              )}
                              {candidate.matchedFields.length > 0 && (
                                <div className="text-xs text-gray-500">
                                  Matched: {candidate.matchedFields.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Confirm Step
  if (step === 'confirm' && selectedPatient) {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className={`${isAuthRep ? 'bg-purple-600' : 'bg-teal-600'} text-white p-4 flex items-center justify-between`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-white ${isAuthRep ? 'hover:bg-purple-700' : 'hover:bg-teal-700'} -ml-2`}
            onClick={() => setStep('results')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-base">Confirm Patient</h3>
          <div className="w-8"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className={`w-16 h-16 ${isAuthRep ? 'bg-purple-600' : 'bg-teal-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {isAuthRep ? (
                <Shield className="w-8 h-8 text-white" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-white" />
              )}
            </div>

            <div className="text-center mb-6">
              <h3 className="mb-2">Confirm Identity</h3>
              <p className="text-sm text-gray-600">
                {isAuthRep 
                  ? 'Verify this is the correct patient you are representing' 
                  : 'Verify this information matches your identity'}
              </p>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Full Name</Label>
                  <p className="font-medium">
                    {selectedPatient.name?.[0]?.given?.[0]} {selectedPatient.name?.[0]?.family}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Date of Birth</Label>
                  <p className="font-medium">{formatDate(selectedPatient.birthDate)}</p>
                </div>
                {selectedPatient.gender && (
                  <div>
                    <Label className="text-xs text-gray-500">Gender</Label>
                    <p className="font-medium capitalize">{selectedPatient.gender}</p>
                  </div>
                )}
                {selectedPatient.identifier && selectedPatient.identifier[0] && (
                  <div>
                    <Label className="text-xs text-gray-500">Medical Record Number</Label>
                    <p className="font-medium">{selectedPatient.identifier[0].value}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3 pt-4">
              <Button 
                className={`w-full ${isAuthRep ? 'bg-purple-600 hover:bg-purple-700' : 'bg-teal-600 hover:bg-teal-700'}`}
                onClick={handleConfirm}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm and Continue
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setStep('results')}
              >
                Choose Different Patient
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
