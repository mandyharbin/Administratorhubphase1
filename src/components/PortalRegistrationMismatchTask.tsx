/**
 * Portal Registration Mismatch Task Component
 * Handles mismatched portal registration attempts by allowing front office staff
 * to search for and link the correct patient record
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import {
  AlertTriangle,
  Search,
  Link,
  CheckCircle,
  User,
  Calendar,
  MapPin,
  CreditCard,
  XCircle,
  ArrowRight,
  Shield,
  Clock
} from 'lucide-react';

interface PortalRegistrationData {
  firstName: string;
  lastName: string;
  dob: string;
  zipCode: string;
  accountNumber: string;
}

interface MismatchField {
  field: string;
  portalValue: string;
  ehrValue?: string;
  isMismatch: boolean;
}

interface PatientMatch {
  id: string;
  mrn: string;
  accountNumber: string;
  name: string;
  firstName: string;
  lastName: string;
  dob: string;
  zipCode: string;
  phone: string;
  email: string;
  matchScore: number;
  matchReason: string[];
  mismatches: string[];
}

interface PortalRegistrationMismatchTaskProps {
  taskId: string;
  submittedAt: string;
  portalData: PortalRegistrationData;
  onResolve?: (patientId: string) => void;
  onDismiss?: () => void;
}

export default function PortalRegistrationMismatchTask({
  taskId,
  submittedAt,
  portalData,
  onResolve,
  onDismiss
}: PortalRegistrationMismatchTaskProps) {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientMatch | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'dob' | 'account'>('name');
  const [searchResults, setSearchResults] = useState<PatientMatch[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Safety check - return null if portalData is not provided
  if (!portalData) {
    console.error('PortalRegistrationMismatchTask: portalData is required');
    return null;
  }

  // Mock patient database for search
  const mockPatients: PatientMatch[] = [
    {
      id: 'P001',
      mrn: 'MRN-228-A',
      accountNumber: '228',
      name: 'Amanda Thompson',
      firstName: 'Amanda',
      lastName: 'Thompson',
      dob: portalData.dob,
      zipCode: portalData.zipCode,
      phone: '(555) 123-4567',
      email: 'amanda.thompson@email.com',
      matchScore: 95,
      matchReason: ['Account number match', 'DOB match', 'ZIP match', 'Similar first name'],
      mismatches: ['First name: "Mandy" vs "Amanda"']
    },
    {
      id: 'P002',
      mrn: 'MRN-228-B',
      accountNumber: '2280',
      name: 'Mandy Thomas',
      firstName: 'Mandy',
      lastName: 'Thomas',
      dob: '1985-03-10',
      zipCode: '30301',
      phone: '(555) 234-5678',
      email: 'mandy.thomas@email.com',
      matchScore: 60,
      matchReason: ['First name match'],
      mismatches: ['Account number', 'Last name', 'DOB', 'ZIP code']
    },
    {
      id: 'P003',
      mrn: 'MRN-333',
      accountNumber: '333',
      name: 'Mandy Thompson',
      firstName: 'Mandy',
      lastName: 'Thompson',
      dob: '1990-05-20',
      zipCode: '30302',
      phone: '(555) 345-6789',
      email: 'mandy.t@email.com',
      matchScore: 75,
      matchReason: ['First name match', 'Last name match'],
      mismatches: ['Account number', 'DOB', 'ZIP code']
    }
  ];

  const handleSearch = () => {
    setHasSearched(true);
    
    // Filter patients based on search type and query
    let results: PatientMatch[] = [];
    
    if (searchType === 'name') {
      const query = searchQuery.toLowerCase();
      results = mockPatients.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query)
      );
    } else if (searchType === 'dob') {
      results = mockPatients.filter(p => p.dob === searchQuery);
    } else if (searchType === 'account') {
      results = mockPatients.filter(p => p.accountNumber === searchQuery);
    }

    // Sort by match score
    results.sort((a, b) => b.matchScore - a.matchScore);
    
    setSearchResults(results);
    
    if (results.length === 0) {
      toast.error('No patients found', {
        description: 'Try adjusting your search criteria'
      });
    }
  };

  const handleLinkPatient = () => {
    setShowSearchModal(false);
    setShowConfirmModal(true);
  };

  const confirmLink = () => {
    if (selectedPatient) {
      // Log the audit trail
      console.log('Portal Registration Link Audit:', {
        timestamp: new Date().toISOString(),
        taskId,
        portalData,
        linkedPatient: selectedPatient,
        user: 'Front Desk Staff'
      });

      toast.success('Patient successfully linked!', {
        description: `Portal account linked to ${selectedPatient.name} (MRN: ${selectedPatient.mrn})`
      });

      setShowConfirmModal(false);
      
      if (onResolve) {
        onResolve(selectedPatient.id);
      }
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getMatchScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 70) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <>
      <div className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <h3 className="font-medium">Portal Registration Mismatch</h3>
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                Needs Review
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>FROM: API Patient Portal</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(submittedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        <Alert className="border-orange-300 bg-orange-50 dark:bg-orange-900/20 py-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-300 text-xs">
            A patient attempted to register for the portal, but their information doesn't match any existing patient record. Review and link to the correct patient.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Portal Registration Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-3 h-3 text-purple-600" />
              Portal Registration Information
            </h3>
            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 space-y-2">
              {/* First Name - Highlighted as potential mismatch */}
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <Label className="text-xs text-gray-600 dark:text-gray-400">First Name</Label>
                <div className="mt-0.5">
                  <p className="text-xs text-gray-900 dark:text-white">{portalData.firstName}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <AlertTriangle className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700 text-xs py-0">
                      Possible Mismatch
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400">Last Name</Label>
                <p className="text-xs text-gray-900 dark:text-white mt-0.5">{portalData.lastName}</p>
              </div>

              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Date of Birth
                </Label>
                <p className="text-xs text-gray-900 dark:text-white mt-0.5">{new Date(portalData.dob).toLocaleDateString()}</p>
              </div>

              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  ZIP Code
                </Label>
                <p className="text-xs text-gray-900 dark:text-white mt-0.5">{portalData.zipCode}</p>
              </div>

              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  Account Number
                </Label>
                <p className="text-xs text-gray-900 dark:text-white mt-0.5">{portalData.accountNumber}</p>
              </div>
            </div>
          </div>

          {/* Matching Patient (EHR) */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-3 h-3 text-teal-600" />
              Matching Patient (EHR)
            </h3>
            
            {!selectedPatient ? (
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
                <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">No patient selected</p>
                <Button
                  size="sm"
                  onClick={() => setShowSearchModal(true)}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Search className="w-3 h-3 mr-2" />
                  Find Match
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className={`p-3 rounded-lg border-2 ${getMatchScoreColor(selectedPatient.matchScore)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPatient.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        MRN: {selectedPatient.mrn} • Acct: {selectedPatient.accountNumber}
                      </p>
                    </div>
                    <Badge className={`${getMatchScoreBadgeColor(selectedPatient.matchScore)} text-xs`}>
                      {selectedPatient.matchScore}% Match
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">DOB</p>
                      <p className="text-gray-900 dark:text-white">{new Date(selectedPatient.dob).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">ZIP</p>
                      <p className="text-gray-900 dark:text-white">{selectedPatient.zipCode}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Phone</p>
                      <p className="text-gray-900 dark:text-white text-xs">{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white truncate text-xs">{selectedPatient.email}</p>
                    </div>
                  </div>
                </div>

                {/* Match Quality Analysis */}
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-900 dark:text-blue-300 mb-1.5">Match Quality Analysis</p>
                  <div className="space-y-0.5">
                    {selectedPatient.matchReason.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        <span>{reason}</span>
                      </div>
                    ))}
                    {selectedPatient.mismatches.map((mismatch, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-orange-700 dark:text-orange-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{mismatch}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPatient(null)}
                    className="flex-1 text-xs"
                  >
                    Clear Selection
                  </Button>
                  <Button
                    onClick={() => setShowSearchModal(true)}
                    size="sm"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-xs"
                  >
                    <Search className="w-3 h-3 mr-1" />
                    Search Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            size="sm"
            onClick={onDismiss}
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Dismiss Task
          </Button>
          <Button
            size="sm"
            onClick={handleLinkPatient}
            disabled={!selectedPatient}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            <Link className="w-4 h-4 mr-2" />
            Link Patient
          </Button>
        </div>
      </div>

      {/* Patient Search Modal */}
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-teal-600" />
              Find Matching Patient
            </DialogTitle>
            <DialogDescription>
              Search for the patient record that matches the portal registration information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Portal Data Reference */}
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
              <p className="text-xs font-medium text-purple-900 dark:text-purple-300 mb-2">Looking for:</p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Name:</strong> {portalData.firstName} {portalData.lastName}
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>DOB:</strong> {new Date(portalData.dob).toLocaleDateString()}
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Acct:</strong> {portalData.accountNumber}
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>ZIP:</strong> {portalData.zipCode}
                </span>
              </div>
            </div>

            {/* Search Interface */}
            <Tabs value={searchType} onValueChange={(v) => setSearchType(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="name">Name Search</TabsTrigger>
                <TabsTrigger value="dob">DOB Search</TabsTrigger>
                <TabsTrigger value="account">Account # Search</TabsTrigger>
              </TabsList>

              <TabsContent value="name" className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter patient name (first or last)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="dob" className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="account" className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter account number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Search Results */}
            {hasSearched && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Search Results ({searchResults.length})
                  </h3>
                  {searchResults.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sorted by match quality
                    </p>
                  )}
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No patients found</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Try a different search term or method
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedPatient?.id === patient.id
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700'
                        }`}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-white">{patient.name}</p>
                              {selectedPatient?.id === patient.id && (
                                <CheckCircle className="w-4 h-4 text-teal-600" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              MRN: {patient.mrn} • Acct: {patient.accountNumber}
                            </p>
                          </div>
                          <Badge className={getMatchScoreBadgeColor(patient.matchScore)}>
                            {patient.matchScore}% Match
                          </Badge>
                        </div>

                        <div className="grid grid-cols-4 gap-3 text-xs mb-3">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">DOB</p>
                            <p className="text-gray-900 dark:text-white">{new Date(patient.dob).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">ZIP</p>
                            <p className="text-gray-900 dark:text-white">{patient.zipCode}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Phone</p>
                            <p className="text-gray-900 dark:text-white">{patient.phone}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Email</p>
                            <p className="text-gray-900 dark:text-white truncate">{patient.email}</p>
                          </div>
                        </div>

                        {/* Match Analysis */}
                        <div className="flex gap-2 flex-wrap">
                          {patient.matchReason.slice(0, 2).map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {reason}
                            </Badge>
                          ))}
                          {patient.matchReason.length > 2 && (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                              +{patient.matchReason.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSearchModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLinkPatient}
              disabled={!selectedPatient}
              className="bg-green-600 hover:bg-green-700"
            >
              <Link className="w-4 h-4 mr-2" />
              Select & Link Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Confirm Patient Link
            </DialogTitle>
            <DialogDescription>
              Please review the link before confirming
            </DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-4">
              <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-900/20">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  You are about to link this portal registration to the patient record below. This action will be logged for compliance.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                {/* Portal Data */}
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-medium text-purple-900 dark:text-purple-300 mb-2">Portal Registration</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Name:</strong> {portalData.firstName} {portalData.lastName}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>DOB:</strong> {new Date(portalData.dob).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Acct:</strong> {portalData.accountNumber}
                    </p>
                  </div>
                </div>

                {/* Will be linked to */}
                <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded border border-teal-200 dark:border-teal-800">
                  <p className="text-xs font-medium text-teal-900 dark:text-teal-300 mb-2">EHR Patient Record</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Patient:</strong> {selectedPatient.name}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>MRN:</strong> {selectedPatient.mrn}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>DOB:</strong> {new Date(selectedPatient.dob).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Account:</strong> {selectedPatient.accountNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmLink} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}