import { Search, Filter, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui/badge';

export interface Patient {
  id: string;
  name: string;
  patientId: string;
  dob: string;
  age: string;
  gender: string;
  lastVisit?: string;
  hasAppointmentToday?: boolean;
  appointmentTime?: string;
  visitType?: string;
  appointmentStatus?: 'upcoming' | 'checked-in' | 'completed';
  notesSigned?: boolean;
  chargesSubmitted?: boolean;
  room?: string;
  waitTime?: number;
}

interface PatientSearch2ViewProps {
  onPatientClick?: (patientName: string, patientId: string) => void;
  onStartVisit?: (patient: Patient) => void;
  onAcceptChartData?: (patientName: string, acceptedData: any) => void;
}

export function PatientSearch2View({ 
  onPatientClick, 
  onStartVisit,
  onAcceptChartData
}: PatientSearch2ViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const recentPatients: Patient[] = [
    {
      id: '0',
      name: 'Smith, John',
      patientId: '#654321',
      dob: '03/15/1980',
      age: '45y',
      gender: 'M',
      lastVisit: '2025-06-15',
      hasAppointmentToday: true,
      appointmentTime: '2:00 pm',
      visitType: 'New Patient - Annual Physical',
      appointmentStatus: 'upcoming'
    },
    {
      id: '1',
      name: 'Garcia, Sophia (Sofi)',
      patientId: '#234567',
      dob: '04/07/1972',
      age: '52y',
      gender: 'F',
      lastVisit: '2025-10-21'
    },
    {
      id: '2',
      name: 'Jordan, Michael',
      patientId: '#672788',
      dob: '11/05/1997',
      age: '28y',
      gender: 'M',
      lastVisit: '2025-10-18'
    },
    {
      id: '3',
      name: 'Williams, Susan',
      patientId: '#445632',
      dob: '07/14/1975',
      age: '49y',
      gender: 'F',
      lastVisit: '2025-10-15',
      hasAppointmentToday: true,
      appointmentTime: '09:00 am',
      visitType: 'Hypertension Follow-up',
      appointmentStatus: 'completed',
      notesSigned: true,
      chargesSubmitted: true
    },
    {
      id: '4',
      name: 'Anderson, James',
      patientId: '#778899',
      dob: '11/30/1985',
      age: '39y',
      gender: 'M',
      lastVisit: '2025-09-22',
      hasAppointmentToday: true,
      appointmentTime: '10:45 am',
      visitType: 'Sinusitis',
      appointmentStatus: 'upcoming'
    },
    {
      id: '5',
      name: 'Carter, Cody',
      patientId: '#223456',
      dob: '01/25/1990',
      age: '35y',
      gender: 'M',
      lastVisit: '2025-10-12'
    },
    {
      id: '6',
      name: 'Carter, Jon',
      patientId: '#887766',
      dob: '03/10/1982',
      age: '43y',
      gender: 'M',
      lastVisit: '2025-10-10',
      hasAppointmentToday: true,
      appointmentTime: '10:30 am',
      visitType: 'Complete',
      appointmentStatus: 'completed',
      notesSigned: true,
      chargesSubmitted: true
    },
    {
      id: '7',
      name: 'Martinez, Carlos',
      patientId: '#556677',
      dob: '06/18/1979',
      age: '45y',
      gender: 'M',
      lastVisit: '2025-10-08',
      hasAppointmentToday: true,
      appointmentTime: '09:45 am',
      visitType: 'Asthma Check',
      appointmentStatus: 'completed',
      notesSigned: false,
      chargesSubmitted: false
    },
    {
      id: '8',
      name: 'Johnson, Emily',
      patientId: '#998877',
      dob: '01/25/1990',
      age: '34y',
      gender: 'F',
      lastVisit: '2025-10-05'
    },
    {
      id: '9',
      name: 'Garcia, Daniel',
      patientId: '#112233',
      dob: '09/12/1956',
      age: '68y',
      gender: 'M',
      lastVisit: '2025-10-01'
    },
    {
      id: '10',
      name: 'Taylor, Robert',
      patientId: '#334455',
      dob: '09/12/1956',
      age: '68y',
      gender: 'M',
      lastVisit: '2025-09-28',
      hasAppointmentToday: true,
      appointmentTime: '10:15 am',
      visitType: 'Cardiac Follow-up',
      appointmentStatus: 'checked-in',
      room: 'Exam 2',
      waitTime: 5
    },
    {
      id: '11',
      name: 'Moore, Linda',
      patientId: '#667788',
      dob: '04/07/1972',
      age: '52y',
      gender: 'F',
      lastVisit: '2025-09-25',
      hasAppointmentToday: true,
      appointmentTime: '10:30 am',
      visitType: 'Depression Management',
      appointmentStatus: 'checked-in',
      room: 'Exam 1',
      waitTime: 10
    },
    {
      id: '12',
      name: 'Wilson, Jason',
      patientId: '#445566',
      dob: '11/30/1970',
      age: '54y',
      gender: 'M',
      lastVisit: '2025-09-20'
    },
    {
      id: '13',
      name: 'Wilson, James',
      patientId: '#889900',
      dob: '02/28/1988',
      age: '36y',
      gender: 'M',
      lastVisit: '2025-09-15'
    },
    {
      id: '14',
      name: 'Miller, Jennifer',
      patientId: '#223344',
      dob: '03/10/1982',
      age: '42y',
      gender: 'F',
      lastVisit: '2025-09-12',
      hasAppointmentToday: true,
      appointmentTime: '08:45 am',
      visitType: 'Annual Wellness',
      appointmentStatus: 'completed',
      notesSigned: false,
      chargesSubmitted: false
    },
    {
      id: '15',
      name: 'Davis, William',
      patientId: '#556688',
      dob: '11/30/1970',
      age: '53y',
      gender: 'M',
      lastVisit: '2025-09-10'
    },
    {
      id: '16',
      name: 'Thompson, Robert',
      patientId: '#778800',
      dob: '05/22/1968',
      age: '56y',
      gender: 'M',
      lastVisit: '2025-09-08'
    },
    {
      id: '17',
      name: 'Lee, Sarah',
      patientId: '#990011',
      dob: '08/15/1992',
      age: '32y',
      gender: 'F',
      lastVisit: '2025-09-05'
    },
    {
      id: '18',
      name: 'Jackson, David',
      patientId: '#112244',
      dob: '12/03/1984',
      age: '40y',
      gender: 'M',
      lastVisit: '2025-09-01'
    },
    {
      id: '19',
      name: 'White, Emma',
      patientId: '#334466',
      dob: '06/20/1988',
      age: '37y',
      gender: 'F',
      lastVisit: '2025-08-28'
    },
    {
      id: '20',
      name: 'Harris, Thomas',
      patientId: '#556699',
      dob: '04/12/1975',
      age: '50y',
      gender: 'M',
      lastVisit: '2025-08-25'
    },
    {
      id: '21',
      name: 'Clark, Nancy',
      patientId: '#338812',
      dob: '03/15/1964',
      age: '61y',
      gender: 'F',
      lastVisit: '2025-08-22'
    }
  ];

  const filteredPatients = searchQuery
    ? recentPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentPatients;

  const handlePatientRowClick = (patient: Patient) => {
    if (onPatientClick) {
      onPatientClick(patient.name, patient.patientId);
    }
  };

  const handleStartVisit = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    if (onStartVisit) {
      onStartVisit(patient);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-4">
      {/* Page Title */}
      <div className="mb-5">
        <h1 className="text-2xl text-gray-900 mb-1">
          Patient Search
        </h1>
        <p className="text-sm text-gray-600">
          Search for patients by name or patient ID
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-[#007cbe] focus:ring-2 focus:ring-[#007cbe]/20 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg flex items-center gap-2 transition-all ${
                showFilters 
                  ? 'bg-[#007cbe] text-white border-[#007cbe]' 
                  : 'bg-white text-gray-600 border-gray-300 hover:border-[#007cbe] hover:text-[#007cbe]'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-2 block">
                    Age Range
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option>All Ages</option>
                    <option>0-18</option>
                    <option>19-40</option>
                    <option>41-65</option>
                    <option>65+</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-2 block">
                    Gender
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option>All</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-2 block">
                    Last Visit
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option>Any Time</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Last year</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full px-3 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {searchQuery ? `${filteredPatients.length} results found` : 'Recently Searched'}
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm text-[#007cbe] hover:underline"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Patient List */}
      <div className="space-y-2">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => handlePatientRowClick(patient)}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
          >
            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                {/* Patient Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-[#1976D2]">
                      {patient.name}
                    </h3>
                    <span className="text-sm text-gray-500">{patient.patientId}</span>
                    
                    {/* Appointment Today Badge */}
                    {patient.hasAppointmentToday && (
                      <Badge 
                        variant="outline" 
                        className="bg-[#E3F2FD] text-[#1976D2] border-[#90CAF9] text-xs px-2 py-0.5"
                      >
                        Appt Today: {patient.appointmentTime}
                      </Badge>
                    )}
                    
                    {/* Room Badge with Wait Time */}
                    {patient.room && patient.waitTime !== undefined && (
                      <Badge 
                        variant="outline" 
                        className="bg-[#1976D2] text-white border-[#1976D2] text-xs px-2 py-0.5"
                      >
                        <Circle className="w-2 h-2 mr-1 fill-current" />
                        {patient.room} | {patient.waitTime} min
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>DOB: {patient.dob}</span>
                    <span>|</span>
                    <span>{patient.age}</span>
                    <span>|</span>
                    <span>{patient.gender}</span>
                    {patient.visitType && (
                      <>
                        <span>|</span>
                        <span>{patient.visitType}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Appointment Info & Actions */}
                <div className="flex items-center gap-2">
                  {patient.hasAppointmentToday && (
                    <>
                      {/* Complete Badges */}
                      {patient.appointmentStatus === 'completed' && patient.notesSigned && (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-white text-xs px-2 py-1">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Note Signed
                        </Badge>
                      )}
                      {patient.appointmentStatus === 'completed' && patient.chargesSubmitted && (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-white text-xs px-2 py-1">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Charges Submitted
                        </Badge>
                      )}
                    </>
                  )}

                  {/* Last Visit for patients without appointment today */}
                  {!patient.hasAppointmentToday && patient.lastVisit && (
                    <div className="text-right mr-3">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Last Visit</div>
                      <div className="text-sm text-gray-900">{patient.lastVisit}</div>
                    </div>
                  )}

                  {/* Start Visit Button */}
                  <Badge
                    onClick={(e) => handleStartVisit(e, patient)}
                    variant="outline"
                    className="bg-[#1976D2] hover:bg-[#1565C0] text-white border-[#1976D2] text-xs px-2 py-1 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    Start Visit
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredPatients.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-500">No patients found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}