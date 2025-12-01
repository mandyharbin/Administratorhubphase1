import React, { useEffect, useState } from 'react';
import {
  fetchPatientConditions,
  fetchPatientEncounters,
  fetchPatientProcedures,
  fetchPatientAllergies,
  fetchPatientObservations
} from '../api/fhir';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Activity, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  Heart, 
  Stethoscope, 
  Clock,
  Scissors,
  AlertTriangle,
  Droplet,
  FlaskConical,
  Pill,
  TrendingUp,
  Shield,
  Syringe
} from 'lucide-react';

interface Props {
  patientId: string;
  accessToken?: string;
}

export function FullMedicalHistory({ patientId, accessToken }: Props) {
  const [conditions, setConditions] = useState<any[]>([]);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    Promise.all([
      fetchPatientConditions(patientId, accessToken),
      fetchPatientEncounters(patientId, accessToken),
      fetchPatientProcedures(patientId, accessToken),
      fetchPatientAllergies(patientId, accessToken),
      fetchPatientObservations(patientId, accessToken)
    ])
      .then(([conditionsData, encountersData, proceduresData, allergiesData, observationsData]) => {
        setConditions(conditionsData?.entry ? conditionsData.entry.map((e: any) => e.resource) : []);
        setEncounters(encountersData?.entry ? encountersData.entry.map((e: any) => e.resource) : []);
        setProcedures(proceduresData?.entry ? proceduresData.entry.map((e: any) => e.resource) : []);
        setAllergies(allergiesData?.entry ? allergiesData.entry.map((e: any) => e.resource) : []);
        setObservations(observationsData?.entry ? observationsData.entry.map((e: any) => e.resource) : []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [patientId, accessToken]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm">Loading complete medical history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRecords = conditions.length + encounters.length + procedures.length + allergies.length + observations.length;

  // Helper functions for badges
  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { color: 'bg-red-100 text-red-700', label: 'Active' };
      case 'resolved':
        return { color: 'bg-green-100 text-green-700', label: 'Resolved' };
      case 'inactive':
        return { color: 'bg-gray-100 text-gray-700', label: 'Inactive' };
      default:
        return { color: 'bg-gray-100 text-gray-700', label: status || 'Unknown' };
    }
  };

  const getSeverityBadge = (severity?: any) => {
    const severityCode = severity?.coding?.[0]?.code || 'unknown';
    switch (severityCode.toLowerCase()) {
      case 'severe':
      case 'high':
        return { color: 'bg-red-100 text-red-700', label: 'Severe' };
      case 'moderate':
        return { color: 'bg-orange-100 text-orange-700', label: 'Moderate' };
      case 'mild':
      case 'low':
        return { color: 'bg-yellow-100 text-yellow-700', label: 'Mild' };
      default:
        return { color: 'bg-gray-100 text-gray-700', label: 'Unknown' };
    }
  };

  const getAllergySeverityBadge = (criticality?: string) => {
    switch (criticality?.toLowerCase()) {
      case 'high':
        return { color: 'bg-red-100 text-red-700', label: 'High Risk', icon: AlertTriangle };
      case 'low':
        return { color: 'bg-yellow-100 text-yellow-700', label: 'Low Risk', icon: AlertCircle };
      default:
        return { color: 'bg-gray-100 text-gray-700', label: 'Unknown', icon: Shield };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          Complete Medical History
          <Badge variant="outline" className="ml-2">{totalRecords} records</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="conditions" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="conditions" className="text-xs">
              <Stethoscope className="w-3 h-3 mr-1" />
              Conditions
              <Badge variant="outline" className="ml-1">{conditions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="encounters" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              Visits
              <Badge variant="outline" className="ml-1">{encounters.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="procedures" className="text-xs">
              <Scissors className="w-3 h-3 mr-1" />
              Procedures
              <Badge variant="outline" className="ml-1">{procedures.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="allergies" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Allergies
              <Badge variant="outline" className="ml-1">{allergies.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="observations" className="text-xs">
              <FlaskConical className="w-3 h-3 mr-1" />
              Labs/Vitals
              <Badge variant="outline" className="ml-1">{observations.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Conditions Tab */}
          <TabsContent value="conditions" className="mt-4">
            {conditions.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 px-4 bg-gray-50 rounded-lg">
                No conditions on record
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conditions.map((condition) => {
                  const conditionName = condition.code?.text || condition.code?.coding?.[0]?.display || 'Unknown Condition';
                  const onsetDate = condition.onsetDateTime 
                    ? new Date(condition.onsetDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : null;
                  const clinicalStatus = condition.clinicalStatus?.coding?.[0]?.code;
                  const statusBadge = getStatusBadge(clinicalStatus);
                  const severityBadge = getSeverityBadge(condition.severity);

                  return (
                    <div key={condition.id} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Stethoscope className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{conditionName}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                            {condition.severity && (
                              <Badge className={severityBadge.color}>{severityBadge.label}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {onsetDate && (
                        <div className="text-xs text-gray-600 mt-2 pt-2 border-t flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          Onset: {onsetDate}
                        </div>
                      )}
                      {condition.note && condition.note.length > 0 && (
                        <div className="text-xs text-gray-600 mt-2">{condition.note[0].text}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Encounters Tab */}
          <TabsContent value="encounters" className="mt-4">
            {encounters.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 px-4 bg-gray-50 rounded-lg">
                No visits on record
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {encounters.map((encounter) => {
                  const encounterType = encounter.type?.[0]?.text || encounter.type?.[0]?.coding?.[0]?.display || 'Encounter';
                  const startDate = encounter.period?.start
                    ? new Date(encounter.period.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : null;
                  const location = encounter.location?.[0]?.location?.display;
                  const provider = encounter.participant?.[0]?.individual?.display;

                  return (
                    <div key={encounter.id} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{encounterType}</span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        {startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {startDate}
                          </div>
                        )}
                        {location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {location}
                          </div>
                        )}
                        {provider && (
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-3 h-3" />
                            {provider}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Procedures Tab */}
          <TabsContent value="procedures" className="mt-4">
            {procedures.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 px-4 bg-gray-50 rounded-lg">
                No procedures on record
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {procedures.map((procedure) => {
                  const procedureName = procedure.code?.text || procedure.code?.coding?.[0]?.display || 'Unknown Procedure';
                  const performedDate = procedure.performedDateTime 
                    ? new Date(procedure.performedDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : procedure.performedPeriod?.start
                    ? new Date(procedure.performedPeriod.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : null;
                  const status = procedure.status;
                  const statusBadge = getStatusBadge(status);

                  return (
                    <div key={procedure.id} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Scissors className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{procedureName}</span>
                          </div>
                          {status && <Badge className={statusBadge.color}>{statusBadge.label}</Badge>}
                        </div>
                      </div>
                      {performedDate && (
                        <div className="text-xs text-gray-600 mt-2 pt-2 border-t flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          Performed: {performedDate}
                        </div>
                      )}
                      {procedure.note && procedure.note.length > 0 && (
                        <div className="text-xs text-gray-600 mt-2">{procedure.note[0].text}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Allergies Tab */}
          <TabsContent value="allergies" className="mt-4">
            {allergies.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 px-4 bg-gray-50 rounded-lg flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                No known allergies
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allergies.map((allergy) => {
                  const allergyName = allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown Allergen';
                  const criticality = allergy.criticality;
                  const criticalityBadge = getAllergySeverityBadge(criticality);
                  const CriticalityIcon = criticalityBadge.icon;
                  const clinicalStatus = allergy.clinicalStatus?.coding?.[0]?.code;
                  const statusBadge = getStatusBadge(clinicalStatus);
                  const category = allergy.category?.[0] || 'unknown';

                  return (
                    <div key={allergy.id} className="border rounded-lg p-3 bg-red-50 border-red-200 hover:bg-red-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-sm">{allergyName}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={criticalityBadge.color}>
                              <CriticalityIcon className="w-3 h-3 mr-1" />
                              {criticalityBadge.label}
                            </Badge>
                            {clinicalStatus && <Badge className={statusBadge.color}>{statusBadge.label}</Badge>}
                            <Badge variant="outline" className="text-xs capitalize">{category}</Badge>
                          </div>
                        </div>
                      </div>
                      {allergy.reaction && allergy.reaction.length > 0 && (
                        <div className="text-xs text-gray-700 mt-2 pt-2 border-t border-red-200">
                          <span className="text-gray-600">Reaction: </span>
                          {allergy.reaction[0].manifestation?.[0]?.text || allergy.reaction[0].manifestation?.[0]?.coding?.[0]?.display}
                        </div>
                      )}
                      {allergy.note && allergy.note.length > 0 && (
                        <div className="text-xs text-gray-700 mt-2">{allergy.note[0].text}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Observations Tab */}
          <TabsContent value="observations" className="mt-4">
            {observations.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 px-4 bg-gray-50 rounded-lg">
                No lab results or vitals on record
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {observations.map((obs) => {
                  const obsName = obs.code?.text || obs.code?.coding?.[0]?.display || 'Unknown Observation';
                  const value = obs.valueQuantity?.value;
                  const unit = obs.valueQuantity?.unit;
                  const valueString = obs.valueString;
                  const effectiveDate = obs.effectiveDateTime 
                    ? new Date(obs.effectiveDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : null;
                  const category = obs.category?.[0]?.coding?.[0]?.display || obs.category?.[0]?.coding?.[0]?.code;
                  
                  // Icon based on category
                  let ObsIcon = FlaskConical;
                  if (category?.toLowerCase().includes('vital')) ObsIcon = Activity;
                  if (category?.toLowerCase().includes('laboratory')) ObsIcon = FlaskConical;

                  return (
                    <div key={obs.id} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <ObsIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{obsName}</span>
                          </div>
                          {category && (
                            <Badge variant="outline" className="text-xs mb-2">{category}</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          {value !== undefined && (
                            <div className="text-lg">{value} {unit}</div>
                          )}
                          {valueString && (
                            <div className="text-sm text-gray-700">{valueString}</div>
                          )}
                        </div>
                      </div>
                      {effectiveDate && (
                        <div className="text-xs text-gray-600 mt-2 pt-2 border-t flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {effectiveDate}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* FHIR Debug Section */}
        <div className="mt-6 pt-4 border-t">
          <details className="text-xs">
            <summary className="text-gray-500 cursor-pointer">
              FHIR Resources Debug ({totalRecords} total records)
            </summary>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
              <div>
                <div className="text-gray-600 mb-1">Conditions: {conditions.length}</div>
                <div>Encounters: {encounters.length}</div>
                <div>Procedures: {procedures.length}</div>
                <div>Allergies: {allergies.length}</div>
                <div>Observations: {observations.length}</div>
              </div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
