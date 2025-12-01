import React, { useEffect, useState } from 'react';
import { fetchAppointments } from '../api/fhir';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react';

interface Props {
  patientId: string;
  accessToken?: string;
}

export function AppointmentsList({ patientId, accessToken }: Props) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAppointments(patientId, accessToken)
      .then(data => {
        if (data?.entry) {
          setAppointments(data.entry.map((e: any) => e.resource));
        }
      })
      .finally(() => setLoading(false));
  }, [patientId, accessToken]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm">Loading appointments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
            <AlertCircle className="w-4 h-4" />
            <span>No upcoming appointments</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Upcoming Appointments
          <Badge variant="outline" className="ml-auto">{appointments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appt, index) => {
          const startDate = new Date(appt.start);
          const endDate = new Date(appt.end);
          
          const dateStr = startDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          
          const timeStr = startDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
          
          const endTimeStr = endDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          const practitioner = appt.participant.find((p: any) => 
            p.actor.reference.startsWith('Practitioner/')
          );
          
          const location = appt.participant.find((p: any) => 
            p.actor.reference.startsWith('Location/')
          );

          const appointmentType = appt.appointmentType?.coding?.[0]?.display || 'Appointment';
          
          const statusColor = appt.status === 'booked' ? 'bg-green-100 text-green-700' : 
                             appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                             'bg-gray-100 text-gray-700';

          return (
            <div 
              key={appt.id} 
              className={`border rounded-lg p-4 ${index === 0 ? 'border-blue-300 bg-blue-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{appointmentType}</span>
                    {index === 0 && (
                      <Badge className="bg-blue-600 text-white">Next</Badge>
                    )}
                  </div>
                  <Badge className={statusColor}>{appt.status}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{dateStr}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{timeStr} - {endTimeStr}</span>
                </div>

                {practitioner && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{practitioner.actor.display}</span>
                  </div>
                )}

                {location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{location.actor.display}</span>
                  </div>
                )}

                {appt.description && (
                  <div className="text-xs text-gray-600 mt-2 pt-2 border-t">
                    {appt.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* FHIR Debug Info - Remove in production */}
        <div className="pt-4 border-t">
          <details className="text-xs">
            <summary className="text-gray-500 cursor-pointer">FHIR Resource Data ({appointments.length} appointments)</summary>
            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(appointments, null, 2)}
            </pre>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
