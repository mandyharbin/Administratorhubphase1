import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  AlertTriangle,
  Stethoscope,
  Clock,
  ChevronRight,
  Building2,
  Shield,
  Activity,
  FileText,
  RefreshCw
} from 'lucide-react';

interface HealthSummaryProps {
  patientId: string;
  useLiveData?: boolean; // Toggle between mock and live FHIR data
  onNavigate?: (screen: string) => void; // Navigation callback
}

interface PatientData {
  displayName: string;
  birthDate: string;
  age: number;
  gender: string;
  primaryPhone: string;
  primaryEmail: string;
  primaryAddress: {
    line: string[];
    city: string;
    state: string;
    postalCode: string;
  };
  coverage: {
    payerName: string;
    planName: string;
    memberId: string;
    status: string;
    effectiveDate: string;
    terminationDate?: string;
  } | null;
  allergies: Array<{
    substance: string;
    reaction: string;
    severity: string;
    recordedDate: string;
  }>;
  recentEncounter: {
    startDatetime: string;
    reason: string;
    providerName: string;
    locationName: string;
  } | null;
  lastUpdated: string;
}

// FHIR API Configuration
const FHIR_BASE_URL = 'https://fhir-api.fhirstaging.aws.greenwayhealth.com/fhir/R4/2.16.840.1.113883.3.441.350831';

// FHIR Data Transformation Functions
const computeAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const now = new Date();
  const age = Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return age;
};

const selectPrimaryPhone = (telecom: any[]): string => {
  if (!telecom || telecom.length === 0) return '';
  
  // Prefer mobile, then home, then work, then first phone
  const mobile = telecom.find(t => t.system === 'phone' && t.use === 'mobile');
  if (mobile) return mobile.value || '';
  
  const home = telecom.find(t => t.system === 'phone' && t.use === 'home');
  if (home) return home.value || '';
  
  const work = telecom.find(t => t.system === 'phone' && t.use === 'work');
  if (work) return work.value || '';
  
  const anyPhone = telecom.find(t => t.system === 'phone');
  return anyPhone?.value || '';
};

const selectPrimaryEmail = (telecom: any[]): string => {
  if (!telecom || telecom.length === 0) return '';
  
  // Prefer email with preferred flag or use='home'
  const preferred = telecom.find(t => t.system === 'email' && t.preferred === true);
  if (preferred) return preferred.value || '';
  
  const home = telecom.find(t => t.system === 'email' && t.use === 'home');
  if (home) return home.value || '';
  
  const anyEmail = telecom.find(t => t.system === 'email');
  return anyEmail?.value || '';
};

const selectPrimaryAddress = (addresses: any[]): any => {
  if (!addresses || addresses.length === 0) {
    return { line: [], city: '', state: '', postalCode: '' };
  }
  
  // Prefer home address
  const home = addresses.find(a => a.use === 'home');
  if (home) {
    return {
      line: home.line || [],
      city: home.city || '',
      state: home.state || '',
      postalCode: home.postalCode || ''
    };
  }
  
  // Otherwise use first address
  const first = addresses[0];
  return {
    line: first.line || [],
    city: first.city || '',
    state: first.state || '',
    postalCode: first.postalCode || ''
  };
};

const parseAllergyIntolerance = (resource: any): any => {
  const substance = resource.code?.text || 
                   resource.code?.coding?.[0]?.display || 
                   'Unknown substance';
  
  let reaction = 'Not specified';
  let severity = 'unknown';
  
  if (resource.reaction && resource.reaction.length > 0) {
    const manifestations = resource.reaction[0].manifestation || [];
    reaction = manifestations.map((m: any) => m.text || m.coding?.[0]?.display || '').filter(Boolean).join(', ') || 'Not specified';
    severity = resource.reaction[0].severity || resource.criticality || 'unknown';
  }
  
  const recordedDate = resource.recordedDate || resource.meta?.lastUpdated || new Date().toISOString();
  
  return { substance, reaction, severity, recordedDate };
};

export function HealthSummary({ patientId, useLiveData = false, onNavigate }: HealthSummaryProps) {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveFHIRData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Patient resource
      const patientResponse = await fetch(`${FHIR_BASE_URL}/Patient/${patientId}`, {
        headers: {
          'Accept': 'application/fhir+json',
          // Add authorization header if needed
          // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
      });

      if (!patientResponse.ok) {
        throw new Error(`Failed to fetch patient: ${patientResponse.status}`);
      }

      const patient = await patientResponse.json();

      // Extract patient demographics using canonical mapping
      const displayName = patient.name?.[0]?.text || 
                         `${patient.name?.[0]?.given?.join(' ') || ''} ${patient.name?.[0]?.family || ''}`.trim() ||
                         'Unknown Patient';
      
      const birthDate = patient.birthDate || '';
      const age = birthDate ? computeAge(birthDate) : 0;
      const gender = patient.gender || 'unknown';
      const primaryPhone = selectPrimaryPhone(patient.telecom || []);
      const primaryEmail = selectPrimaryEmail(patient.telecom || []);
      const primaryAddress = selectPrimaryAddress(patient.address || []);

      // Fetch Coverage
      let coverage = null;
      try {
        const coverageResponse = await fetch(
          `${FHIR_BASE_URL}/Coverage?beneficiary=Patient/${patientId}&status=active&_include=Coverage:payor`,
          {
            headers: { 'Accept': 'application/fhir+json' }
          }
        );
        
        if (coverageResponse.ok) {
          const coverageBundle = await coverageResponse.json();
          const coverageResources = coverageBundle.entry?.filter((e: any) => e.resource.resourceType === 'Coverage') || [];
          
          if (coverageResources.length > 0) {
            const coverageResource = coverageResources[0].resource;
            const payorResources = coverageBundle.entry?.filter((e: any) => e.resource.resourceType === 'Organization') || [];
            
            coverage = {
              payerName: coverageResource.payor?.[0]?.display || 
                        payorResources[0]?.resource?.name || 
                        'Unknown Payer',
              planName: coverageResource.grouping?.plan || 
                       coverageResource.grouping?.name || 
                       coverageResource.class?.[0]?.name || 
                       'Unknown Plan',
              memberId: coverageResource.subscriberId || 
                       coverageResource.identifier?.[0]?.value || 
                       'N/A',
              status: coverageResource.status || 'unknown',
              effectiveDate: coverageResource.period?.start || '',
              terminationDate: coverageResource.period?.end
            };
          }
        }
      } catch (err) {
        console.warn('Failed to fetch coverage:', err);
      }

      // Fetch Allergies
      const allergies: any[] = [];
      try {
        const allergyResponse = await fetch(
          `${FHIR_BASE_URL}/AllergyIntolerance?patient=${patientId}`,
          {
            headers: { 'Accept': 'application/fhir+json' }
          }
        );
        
        if (allergyResponse.ok) {
          const allergyBundle = await allergyResponse.json();
          const allergyResources = allergyBundle.entry?.filter((e: any) => e.resource.resourceType === 'AllergyIntolerance') || [];
          
          allergyResources.forEach((entry: any) => {
            allergies.push(parseAllergyIntolerance(entry.resource));
          });
        }
      } catch (err) {
        console.warn('Failed to fetch allergies:', err);
      }

      // Fetch Most Recent Encounter
      let recentEncounter = null;
      try {
        const encounterResponse = await fetch(
          `${FHIR_BASE_URL}/Encounter?patient=${patientId}&_sort=-period&_count=1&_include=Encounter:participant&_include=Encounter:location`,
          {
            headers: { 'Accept': 'application/fhir+json' }
          }
        );
        
        if (encounterResponse.ok) {
          const encounterBundle = await encounterResponse.json();
          const encounterResources = encounterBundle.entry?.filter((e: any) => e.resource.resourceType === 'Encounter') || [];
          
          if (encounterResources.length > 0) {
            const encounter = encounterResources[0].resource;
            
            recentEncounter = {
              startDatetime: encounter.period?.start || encounter.meta?.lastUpdated || '',
              reason: encounter.reasonCode?.[0]?.text || 
                     encounter.reasonCode?.[0]?.coding?.[0]?.display || 
                     'Visit',
              providerName: encounter.participant?.[0]?.individual?.display || 
                           'Unknown Provider',
              locationName: encounter.location?.[0]?.location?.display || 
                           encounter.serviceProvider?.display || 
                           'Unknown Location'
            };
          }
        }
      } catch (err) {
        console.warn('Failed to fetch encounters:', err);
      }

      const transformedData: PatientData = {
        displayName,
        birthDate,
        age,
        gender,
        primaryPhone,
        primaryEmail,
        primaryAddress,
        coverage,
        allergies,
        recentEncounter,
        lastUpdated: patient.meta?.lastUpdated || new Date().toISOString()
      };

      setPatientData(transformedData);
      setLoading(false);
    } catch (err: any) {
      console.error('FHIR fetch error:', err);
      setError(err.message || 'Failed to fetch patient data');
      setLoading(false);
    }
  };

  const fetchMockData = async () => {
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock FHIR data based on the canonical mapping
    const mockData: PatientData = {
      displayName: 'Amanda Thompson',
      birthDate: '1985-01-15',
      age: 40,
      gender: 'female',
      primaryPhone: '+1 (404) 555-0123',
      primaryEmail: 'amanda.thompson@email.com',
      primaryAddress: {
        line: ['742 Evergreen Terrace'],
        city: 'Atlanta',
        state: 'GA',
        postalCode: '30308'
      },
      coverage: {
        payerName: 'Blue Cross Blue Shield',
        planName: 'PPO Plus',
        memberId: 'BCBS-228-3847',
        status: 'active',
        effectiveDate: '2024-01-01',
        terminationDate: undefined
      },
      allergies: [
        {
          substance: 'Penicillin',
          reaction: 'Hives, difficulty breathing',
          severity: 'high',
          recordedDate: '2018-03-15'
        },
        {
          substance: 'Latex',
          reaction: 'Skin rash',
          severity: 'moderate',
          recordedDate: '2020-07-22'
        }
      ],
      recentEncounter: {
        startDatetime: '2025-11-10T10:30:00Z',
        reason: 'Annual wellness visit',
        providerName: 'Dr. Sarah Martinez',
        locationName: 'Health Partners Medical Group - Main Campus'
      },
      lastUpdated: '2025-11-21T14:30:00Z'
    };
    
    setPatientData(mockData);
    setLoading(false);
  };

  useEffect(() => {
    if (useLiveData) {
      fetchLiveFHIRData();
    } else {
      fetchMockData();
    }
  }, [patientId, useLiveData]);

  const handleRefresh = () => {
    if (useLiveData) {
      fetchLiveFHIRData();
    } else {
      fetchMockData();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 mb-2">Unable to load health summary</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600">No patient data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-4 pb-24">
        {/* Data Source Indicator */}
        {useLiveData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Live FHIR Data</span>
            </div>
            <Button onClick={handleRefresh} variant="ghost" size="sm" className="h-auto p-1">
              <RefreshCw className="w-4 h-4 text-green-600" />
            </Button>
          </div>
        )}

        {/* Demographics Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                Personal Information
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Full Name</div>
                <div className="text-gray-900">{patientData.displayName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Gender</div>
                <div className="text-gray-900 capitalize">{patientData.gender}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Date of Birth</div>
                <div className="text-gray-900">{patientData.birthDate ? formatDate(patientData.birthDate) : 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Age</div>
                <div className="text-gray-900">{patientData.age} years</div>
              </div>
            </div>

            {(patientData.primaryPhone || patientData.primaryEmail || patientData.primaryAddress.city) && (
              <div className="border-t pt-4 space-y-3">
                {patientData.primaryPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Primary Phone</div>
                      <div className="text-gray-900">{patientData.primaryPhone}</div>
                    </div>
                  </div>
                )}
                {patientData.primaryEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="text-gray-900">{patientData.primaryEmail}</div>
                    </div>
                  </div>
                )}
                {patientData.primaryAddress.city && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Address</div>
                      <div className="text-gray-900">
                        {patientData.primaryAddress.line.length > 0 && (
                          <>{patientData.primaryAddress.line.join(', ')}<br /></>
                        )}
                        {patientData.primaryAddress.city}, {patientData.primaryAddress.state} {patientData.primaryAddress.postalCode}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insurance Coverage Card */}
        {patientData.coverage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Insurance Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Insurance Provider</div>
                  <div className="text-gray-900">{patientData.coverage.payerName}</div>
                </div>
                <Badge 
                  variant={patientData.coverage.status === 'active' ? 'default' : 'secondary'}
                  className={patientData.coverage.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                >
                  {patientData.coverage.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Plan Name</div>
                  <div className="text-gray-900">{patientData.coverage.planName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Member ID</div>
                  <div className="text-gray-900">{patientData.coverage.memberId}</div>
                </div>
                {patientData.coverage.effectiveDate && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Effective Date</div>
                    <div className="text-gray-900">{formatDate(patientData.coverage.effectiveDate)}</div>
                  </div>
                )}
                {patientData.coverage.terminationDate && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Termination Date</div>
                    <div className="text-gray-900">{formatDate(patientData.coverage.terminationDate)}</div>
                  </div>
                )}
              </div>

              <Button variant="outline" size="sm" className="w-full mt-2">
                <CreditCard className="w-4 h-4 mr-2" />
                View Insurance Card
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Allergies Card */}
        {patientData.allergies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Allergies & Reactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patientData.allergies.map((allergy, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${
                    allergy.severity === 'high' || allergy.severity === 'severe'
                      ? 'bg-red-50 border-red-200' 
                      : allergy.severity === 'moderate'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900">{allergy.substance}</div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        allergy.severity === 'high' || allergy.severity === 'severe'
                          ? 'bg-red-100 text-red-700 border-red-200' 
                          : allergy.severity === 'moderate'
                          ? 'bg-orange-100 text-orange-700 border-orange-200'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}
                    >
                      {allergy.severity} severity
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    Reaction: {allergy.reaction}
                  </div>
                  <div className="text-xs text-gray-500">
                    Recorded: {formatDate(allergy.recordedDate)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Encounter Card */}
        {patientData.recentEncounter && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-purple-600" />
                Most Recent Visit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Visit Type</div>
                <div className="text-gray-900">{patientData.recentEncounter.reason}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Provider</div>
                  <div className="text-gray-900">{patientData.recentEncounter.providerName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Date</div>
                  <div className="text-gray-900">{formatDate(patientData.recentEncounter.startDatetime)}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Location</div>
                <div className="text-gray-900 text-sm">{patientData.recentEncounter.locationName}</div>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => onNavigate?.('visit-detail')}
              >
                <FileText className="w-4 h-4 mr-2" />
                View Visit Summary
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-between"
              onClick={() => onNavigate?.('medical-history')}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                View Medical Records
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-between"
              onClick={() => onNavigate?.('lab-results')}
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Lab Results
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-between"
              onClick={() => onNavigate?.('appointment-history')}
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Appointment History
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Last Updated Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pb-2">
          <Clock className="w-3 h-3" />
          Last updated: {formatDateTime(patientData.lastUpdated)}
        </div>
      </div>
    </ScrollArea>
  );
}
