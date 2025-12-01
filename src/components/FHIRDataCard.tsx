import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Pill, 
  Activity, 
  AlertCircle, 
  Calendar,
  FlaskConical 
} from 'lucide-react';

interface FHIRDataCardProps {
  type: 'medications' | 'conditions' | 'allergies' | 'appointments' | 'labs';
  data: any[];
}

export function FHIRDataCard({ type, data }: FHIRDataCardProps) {
  if (!data || data.length === 0) return null;
  
  const getIcon = () => {
    switch (type) {
      case 'medications': return <Pill className="w-4 h-4" />;
      case 'conditions': return <Activity className="w-4 h-4" />;
      case 'allergies': return <AlertCircle className="w-4 h-4" />;
      case 'appointments': return <Calendar className="w-4 h-4" />;
      case 'labs': return <FlaskConical className="w-4 h-4" />;
    }
  };
  
  const getTitle = () => {
    switch (type) {
      case 'medications': return 'Your Current Medications';
      case 'conditions': return 'Your Active Conditions';
      case 'allergies': return 'Your Allergies';
      case 'appointments': return 'Your Upcoming Appointments';
      case 'labs': return 'Your Recent Lab Results';
    }
  };
  
  const getColor = () => {
    switch (type) {
      case 'medications': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'conditions': return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'allergies': return 'bg-red-50 border-red-200 text-red-900';
      case 'appointments': return 'bg-green-50 border-green-200 text-green-900';
      case 'labs': return 'bg-orange-50 border-orange-200 text-orange-900';
    }
  };
  
  const renderItem = (entry: any, idx: number) => {
    const resource = entry.resource || entry;
    
    switch (type) {
      case 'medications':
        const medication = resource.medicationCodeableConcept?.coding?.[0]?.display || 
                          resource.medicationCodeableConcept?.text || 
                          'Unknown medication';
        const dosage = resource.dosageInstruction?.[0]?.text || 'Dosage not specified';
        return (
          <div key={idx} className="text-xs">
            <div className="">{medication}</div>
            <div className="text-gray-600 mt-0.5">{dosage}</div>
          </div>
        );
        
      case 'conditions':
        const condition = resource.code?.coding?.[0]?.display || resource.code?.text || 'Unknown condition';
        const onset = resource.onsetDateTime 
          ? new Date(resource.onsetDateTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : 'Unknown onset';
        return (
          <div key={idx} className="text-xs">
            <div className="">{condition}</div>
            <div className="text-gray-600 mt-0.5">Since: {onset}</div>
          </div>
        );
        
      case 'allergies':
        const allergen = resource.code?.coding?.[0]?.display || resource.code?.text || 'Unknown allergen';
        const reaction = resource.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display || 'reaction not specified';
        return (
          <div key={idx} className="text-xs">
            <div className="">{allergen}</div>
            <div className="text-gray-600 mt-0.5">{reaction}</div>
          </div>
        );
        
      case 'appointments':
        const date = resource.start 
          ? new Date(resource.start).toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit' 
            })
          : 'Unknown date';
        const provider = resource.participant?.find((p: any) => p.actor?.display)?.actor?.display || 'Provider not specified';
        const apptType = resource.appointmentType?.coding?.[0]?.display || 
                        resource.serviceType?.[0]?.coding?.[0]?.display || 
                        'Appointment';
        return (
          <div key={idx} className="text-xs">
            <div className="">{apptType}</div>
            <div className="text-gray-600 mt-0.5">{provider} • {date}</div>
          </div>
        );
        
      case 'labs':
        const labName = resource.code?.coding?.[0]?.display || resource.code?.text || 'Unknown test';
        const value = resource.valueQuantity 
          ? `${resource.valueQuantity.value} ${resource.valueQuantity.unit}`
          : resource.valueString || 'Value not available';
        const labDate = resource.effectiveDateTime 
          ? new Date(resource.effectiveDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '';
        return (
          <div key={idx} className="text-xs">
            <div className="">{labName}: <strong>{value}</strong></div>
            {labDate && <div className="text-gray-600 mt-0.5">{labDate}</div>}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card className={`border ${getColor()} mt-2`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          {getIcon()}
          <div className="text-xs">{getTitle()}</div>
          <Badge variant="outline" className="ml-auto text-xs">
            From FHIR
          </Badge>
        </div>
        <div className="space-y-2">
          {data.slice(0, 3).map((entry, idx) => renderItem(entry, idx))}
          {data.length > 3 && (
            <div className="text-xs text-gray-500 mt-2">
              + {data.length - 3} more
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
