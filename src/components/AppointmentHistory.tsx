import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Activity, 
  AlertCircle,
  Calendar,
  RefreshCw,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface AppointmentHistoryProps {
  patientId: string;
  useLiveData?: boolean;
}

interface Appointment {
  id: string;
  status: string;
  serviceType: string;
  appointmentType: string;
  start: string;
  end: string;
  duration: number;
  practitioner: string;
  location: string;
  reason?: string;
  description?: string;
}

const FHIR_BASE_URL = 'https://fhir-api.fhirstaging.aws.greenwayhealth.com/fhir/R4/2.16.840.1.113883.3.441.350831';

export function AppointmentHistory({ patientId, useLiveData = false }: AppointmentHistoryProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveFHIRData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all appointments
      const response = await fetch(
        `${FHIR_BASE_URL}/Appointment?patient=${patientId}&_sort=-date&_count=50&_include=Appointment:practitioner&_include=Appointment:location`,
        {
          headers: { 'Accept': 'application/fhir+json' }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }

      const bundle = await response.json();
      const appointmentResources = bundle.entry?.filter((e: any) => e.resource.resourceType === 'Appointment') || [];

      const parsedAppointments: Appointment[] = appointmentResources.map((entry: any) => {
        const apt = entry.resource;
        
        return {
          id: apt.id,
          status: apt.status || 'unknown',
          serviceType: apt.serviceType?.[0]?.coding?.[0]?.display || apt.serviceType?.[0]?.text || 'General',
          appointmentType: apt.appointmentType?.coding?.[0]?.display || apt.appointmentType?.text || 'Office Visit',
          start: apt.start || '',
          end: apt.end || '',
          duration: apt.minutesDuration || 0,
          practitioner: apt.participant?.find((p: any) => p.actor?.reference?.startsWith('Practitioner'))?.actor?.display || 'Unknown Provider',
          location: apt.participant?.find((p: any) => p.actor?.reference?.startsWith('Location'))?.actor?.display || 'Main Office',
          reason: apt.reasonCode?.[0]?.text || apt.reasonCode?.[0]?.coding?.[0]?.display,
          description: apt.description
        };
      });

      setAppointments(parsedAppointments);
      setLoading(false);
    } catch (err: any) {
      console.error('FHIR appointments error:', err);
      setError(err.message || 'Failed to fetch appointments');
      setLoading(false);
    }
  };

  const fetchMockData = async () => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 600));

    const mockAppointments: Appointment[] = [
      {
        id: '1',
        status: 'booked',
        serviceType: 'General Practice',
        appointmentType: 'Follow-up Visit',
        start: '2025-12-05T10:00:00Z',
        end: '2025-12-05T10:30:00Z',
        duration: 30,
        practitioner: 'Dr. Sarah Martinez',
        location: 'Health Partners Medical Group - Main Campus',
        reason: 'Diabetes follow-up',
        description: 'Quarterly diabetes management check'
      },
      {
        id: '2',
        status: 'booked',
        serviceType: 'Cardiology',
        appointmentType: 'Consultation',
        start: '2025-11-28T14:00:00Z',
        end: '2025-11-28T15:00:00Z',
        duration: 60,
        practitioner: 'Dr. Michael Chen',
        location: 'Health Partners Cardiology Center',
        reason: 'Hypertension consultation'
      },
      {
        id: '3',
        status: 'fulfilled',
        serviceType: 'General Practice',
        appointmentType: 'Annual Wellness Visit',
        start: '2025-11-10T10:30:00Z',
        end: '2025-11-10T11:30:00Z',
        duration: 60,
        practitioner: 'Dr. Sarah Martinez',
        location: 'Health Partners Medical Group - Main Campus',
        reason: 'Annual wellness visit'
      },
      {
        id: '4',
        status: 'fulfilled',
        serviceType: 'Laboratory',
        appointmentType: 'Lab Work',
        start: '2025-11-15T08:30:00Z',
        end: '2025-11-15T09:00:00Z',
        duration: 30,
        practitioner: 'Lab Technician',
        location: 'Health Partners Lab Services',
        reason: 'Routine blood work'
      },
      {
        id: '5',
        status: 'fulfilled',
        serviceType: 'General Practice',
        appointmentType: 'Sick Visit',
        start: '2025-09-20T09:15:00Z',
        end: '2025-09-20T09:45:00Z',
        duration: 30,
        practitioner: 'Dr. Sarah Martinez',
        location: 'Health Partners Medical Group - Main Campus',
        reason: 'Cold symptoms'
      },
      {
        id: '6',
        status: 'cancelled',
        serviceType: 'Dental',
        appointmentType: 'Routine Cleaning',
        start: '2025-08-15T15:00:00Z',
        end: '2025-08-15T16:00:00Z',
        duration: 60,
        practitioner: 'Dr. Emily Johnson',
        location: 'Family Dental Care',
        reason: 'Routine dental cleaning'
      },
      {
        id: '7',
        status: 'fulfilled',
        serviceType: 'General Practice',
        appointmentType: 'Follow-up Visit',
        start: '2025-05-10T11:00:00Z',
        end: '2025-05-10T11:30:00Z',
        duration: 30,
        practitioner: 'Dr. Sarah Martinez',
        location: 'Health Partners Medical Group - Main Campus',
        reason: 'Medication review'
      },
    ];

    setAppointments(mockAppointments);
    setLoading(false);
  };

  useEffect(() => {
    if (useLiveData) {
      fetchLiveFHIRData();
    } else {
      fetchMockData();
    }
  }, [patientId, useLiveData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleRefresh = () => {
    if (useLiveData) {
      fetchLiveFHIRData();
    } else {
      fetchMockData();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'booked':
      case 'arrived':
      case 'checked-in':
        return (
          <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Scheduled
          </Badge>
        );
      case 'fulfilled':
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-100 text-gray-700 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Cancelled
          </Badge>
        );
      case 'noshow':
        return (
          <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            No Show
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'booked':
      case 'arrived':
      case 'checked-in':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'fulfilled':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      case 'noshow':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-400" />;
    }
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const upcomingAppointments = appointments.filter(apt => isUpcoming(apt.start));
  const pastAppointments = appointments.filter(apt => !isUpcoming(apt.start));

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
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
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 mb-2">Unable to load appointments</p>
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

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-4 pb-24">
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

        {appointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No appointments found</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastAppointments.length})
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Appointments */}
            <TabsContent value="upcoming" className="space-y-3 mt-4">
              {upcomingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No upcoming appointments</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Contact your provider to schedule a visit
                    </p>
                  </CardContent>
                </Card>
              ) : (
                upcomingAppointments.map((apt) => (
                  <Card key={apt.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(apt.status)}
                          <div>
                            <h4 className="text-gray-900">{apt.appointmentType}</h4>
                            <p className="text-sm text-gray-600">{apt.serviceType}</p>
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(apt.start)} at {formatTime(apt.start)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{apt.practitioner}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{apt.location}</span>
                        </div>

                        {apt.reason && (
                          <div className="mt-2 pt-2 border-t">
                            <span className="text-xs text-gray-500">Reason: </span>
                            <span className="text-gray-700">{apt.reason}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <Clock className="w-3 h-3" />
                          Duration: {apt.duration} minutes
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-3 border-t">
                        <Button variant="outline" size="sm" className="flex-1">
                          Get Directions
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Add to Calendar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Past Appointments */}
            <TabsContent value="past" className="space-y-3 mt-4">
              {pastAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No past appointments</p>
                  </CardContent>
                </Card>
              ) : (
                pastAppointments.map((apt) => (
                  <Card key={apt.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(apt.status)}
                          <div>
                            <h4 className="text-gray-900">{apt.appointmentType}</h4>
                            <p className="text-sm text-gray-600">{apt.serviceType}</p>
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(apt.start)} at {formatTime(apt.start)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{apt.practitioner}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{apt.location}</span>
                        </div>

                        {apt.reason && (
                          <div className="mt-2 pt-2 border-t">
                            <span className="text-xs text-gray-500">Reason: </span>
                            <span className="text-gray-700">{apt.reason}</span>
                          </div>
                        )}
                      </div>

                      {apt.status.toLowerCase() === 'fulfilled' && (
                        <Button variant="outline" size="sm" className="w-full mt-4">
                          View Visit Summary
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ScrollArea>
  );
}
