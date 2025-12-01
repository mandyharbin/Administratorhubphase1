import React, { useEffect, useState } from 'react';
import { fetchPatient } from '../api/fhir';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { User, Calendar, Phone, Mail, MapPin, Heart } from 'lucide-react';

interface Props {
  patientId: string;
  accessToken?: string;
}

export function PatientInfo({ patientId, accessToken }: Props) {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPatient(patientId, accessToken)
      .then(setPatient)
      .finally(() => setLoading(false));
  }, [patientId, accessToken]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm">Loading patient information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!patient) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500 text-sm">
            Patient information not available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract patient data from FHIR structure
  const fullName = patient.name?.[0] 
    ? `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim()
    : 'Unknown Patient';
  
  const birthDate = patient.birthDate 
    ? new Date(patient.birthDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    : 'N/A';

  const age = patient.birthDate 
    ? Math.floor((new Date().getTime() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const gender = patient.gender 
    ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
    : 'Not specified';

  const phone = patient.telecom?.find((t: any) => t.system === 'phone')?.value;
  const email = patient.telecom?.find((t: any) => t.system === 'email')?.value;

  const address = patient.address?.[0];
  const addressString = address 
    ? `${address.line?.join(', ') || ''}, ${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}`.trim()
    : null;

  const emergencyContact = patient.contact?.[0];
  const emergencyContactName = emergencyContact?.name
    ? `${emergencyContact.name.given?.join(' ') || ''} ${emergencyContact.name.family || ''}`.trim()
    : null;
  const emergencyContactPhone = emergencyContact?.telecom?.find((t: any) => t.system === 'phone')?.value;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle>{fullName}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{gender}</Badge>
              {age !== null && (
                <Badge variant="outline">{age} years old</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date of Birth */}
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
            <div>
              <div className="text-xs text-gray-600">Date of Birth</div>
              <div className="text-sm">{birthDate}</div>
            </div>
          </div>

          {/* Phone */}
          {phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <div className="text-xs text-gray-600">Phone</div>
                <div className="text-sm">{phone}</div>
              </div>
            </div>
          )}

          {/* Email */}
          {email && (
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <div className="text-xs text-gray-600">Email</div>
                <div className="text-sm">{email}</div>
              </div>
            </div>
          )}

          {/* Address */}
          {addressString && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <div className="text-xs text-gray-600">Address</div>
                <div className="text-sm">{addressString}</div>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        {emergencyContactName && (
          <div className="pt-4 border-t">
            <div className="flex items-start gap-3">
              <Heart className="w-4 h-4 text-red-500 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs text-gray-600 mb-1">Emergency Contact</div>
                <div className="text-sm">{emergencyContactName}</div>
                {emergencyContactPhone && (
                  <div className="text-sm text-gray-600">{emergencyContactPhone}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FHIR Debug Info - Remove in production */}
        <div className="pt-4 border-t">
          <details className="text-xs">
            <summary className="text-gray-500 cursor-pointer">FHIR Resource ID: {patient.id}</summary>
            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(patient, null, 2)}
            </pre>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
