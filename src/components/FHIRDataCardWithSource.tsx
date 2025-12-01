import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Pill, 
  Activity, 
  AlertCircle, 
  Calendar,
  FlaskConical,
  User,
  UserCheck
} from 'lucide-react';

interface DataEntry {
  resource?: any;
  source?: 'patient' | 'staff' | 'system';
  enteredBy?: string;
  enteredAt?: string;
  [key: string]: any;
}

interface FHIRDataCardWithSourceProps {
  type: 'medications' | 'conditions' | 'allergies' | 'appointments' | 'labs' | 'observations';
  data: DataEntry[];
  showSource?: boolean;
}

export function FHIRDataCardWithSource({ type, data, showSource = true }: FHIRDataCardWithSourceProps) {
  if (!data || data.length === 0) return null;
  
  const getIcon = () => {
    switch (type) {
      case 'medications': return <Pill className="w-4 h-4" />;
      case 'conditions': return <Activity className="w-4 h-4" />;
      case 'allergies': return <AlertCircle className="w-4 h-4" />;
      case 'appointments': return <Calendar className="w-4 h-4" />;
      case 'labs': return <FlaskConical className="w-4 h-4" />;
      case 'observations': return <Activity className="w-4 h-4" />;
    }
  };
  
  const getTitle = () => {
    switch (type) {
      case 'medications': return 'Current Medications';
      case 'conditions': return 'Active Conditions';
      case 'allergies': return 'Allergies';
      case 'appointments': return 'Upcoming Appointments';
      case 'labs': return 'Recent Lab Results';
      case 'observations': return 'Vital Signs & Observations';
    }
  };
  
  const getColor = () => {
    switch (type) {
      case 'medications': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'conditions': return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'allergies': return 'bg-red-50 border-red-200 text-red-900';
      case 'appointments': return 'bg-green-50 border-green-200 text-green-900';
      case 'labs': return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'observations': return 'bg-teal-50 border-teal-200 text-teal-900';
    }
  };

  const getSourceBadge = (source?: 'patient' | 'staff' | 'system') => {
    if (!showSource || !source) return null;

    switch (source) {
      case 'patient':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs ml-2">
            <User className="w-3 h-3 mr-1" />
            Patient-Reported
          </Badge>
        );
      case 'staff':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs ml-2">
            <UserCheck className="w-3 h-3 mr-1" />
            Staff-Verified
          </Badge>
        );
      case 'system':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 text-xs ml-2">
            System
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const renderItem = (entry: DataEntry, idx: number) => {
    const resource = entry.resource || entry;
    const source = entry.source;
    const enteredBy = entry.enteredBy;
    const enteredAt = entry.enteredAt;
    
    switch (type) {
      case 'medications':
        const medication = resource.medicationCodeableConcept?.coding?.[0]?.display || 
                          resource.medicationCodeableConcept?.text || 
                          resource.name ||
                          'Unknown medication';
        const dosage = resource.dosageInstruction?.[0]?.text || 
                      resource.dosage ||
                      'Dosage not specified';
        return (
          <div key={idx} className="text-xs border-b border-gray-200 pb-2 last:border-0 last:pb-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium">{medication}</div>
                <div className="text-gray-600 mt-0.5">{dosage}</div>
                {showSource && enteredBy && (
                  <div className="text-xs text-gray-500 mt-1">
                    Entered by {enteredBy}
                    {enteredAt && ` on ${new Date(enteredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </div>
                )}
              </div>
              {getSourceBadge(source)}
            </div>
          </div>
        );
        
      case 'conditions':
        const condition = resource.code?.coding?.[0]?.display || 
                         resource.code?.text || 
                         resource.name ||
                         'Unknown condition';
        const onset = resource.onsetDateTime 
          ? new Date(resource.onsetDateTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : resource.onset || 'Unknown onset';
        return (
          <div key={idx} className="text-xs border-b border-gray-200 pb-2 last:border-0 last:pb-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium">{condition}</div>
                <div className="text-gray-600 mt-0.5">Since: {onset}</div>
                {showSource && enteredBy && (
                  <div className="text-xs text-gray-500 mt-1">
                    Entered by {enteredBy}
                    {enteredAt && ` on ${new Date(enteredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </div>
                )}
              </div>
              {getSourceBadge(source)}
            </div>
          </div>
        );
        
      case 'allergies':
        const allergen = resource.code?.coding?.[0]?.display || 
                        resource.code?.text || 
                        resource.name ||
                        'Unknown allergen';
        const reaction = resource.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display || 
                        resource.reaction ||
                        'reaction not specified';
        return (
          <div key={idx} className="text-xs border-b border-gray-200 pb-2 last:border-0 last:pb-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium">{allergen}</div>
                <div className="text-gray-600 mt-0.5">{reaction}</div>
                {showSource && enteredBy && (
                  <div className="text-xs text-gray-500 mt-1">
                    Entered by {enteredBy}
                    {enteredAt && ` on ${new Date(enteredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </div>
                )}
              </div>
              {getSourceBadge(source)}
            </div>
          </div>
        );

      case 'observations':
        const obsName = resource.code?.coding?.[0]?.display || 
                       resource.code?.text || 
                       resource.name ||
                       'Unknown observation';
        const value = resource.valueQuantity 
          ? `${resource.valueQuantity.value} ${resource.valueQuantity.unit}`
          : resource.valueString || 
            resource.value ||
            'Value not available';
        const obsDate = resource.effectiveDateTime 
          ? new Date(resource.effectiveDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : resource.date || '';
        return (
          <div key={idx} className="text-xs border-b border-gray-200 pb-2 last:border-0 last:pb-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium">{obsName}: <strong>{value}</strong></div>
                {obsDate && <div className="text-gray-600 mt-0.5">{obsDate}</div>}
                {showSource && enteredBy && (
                  <div className="text-xs text-gray-500 mt-1">
                    Reported by {enteredBy}
                    {enteredAt && ` on ${new Date(enteredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </div>
                )}
              </div>
              {getSourceBadge(source)}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card className={`border ${getColor()} mt-2`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          {getIcon()}
          <div className="text-xs font-medium">{getTitle()}</div>
          <Badge variant="outline" className="ml-auto text-xs">
            From FHIR
          </Badge>
        </div>
        <div className="space-y-3">
          {data.map((entry, idx) => renderItem(entry, idx))}
        </div>
      </CardContent>
    </Card>
  );
}
