import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';

interface Appointment {
  id: string;
  time: string;
  duration: string;
  patientName: string;
  dob: string;
  insurance: string;
  visitType: string;
  status: 'complete' | 'sign-now' | 'changes-pending' | 'exam-room' | 'done-visit' | 'none';
  hasAlert?: boolean;
  alertText?: string;
}

export function ClinicalAppointmentsView() {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 5, 12)); // June 12, 2025
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 5, 1));

  const appointments: Appointment[] = [
    {
      id: '1',
      time: '08:00 am',
      duration: '',
      patientName: 'Anderson, Michael',
      dob: '',
      insurance: '',
      visitType: '',
      status: 'complete'
    },
    {
      id: '2',
      time: '08:15 am',
      duration: '',
      patientName: 'Brown, Patricia',
      dob: '',
      insurance: '',
      visitType: '',
      status: 'complete'
    },
    {
      id: '3',
      time: '08:30 am',
      duration: '',
      patientName: 'Davis, William',
      dob: '',
      insurance: '',
      visitType: '',
      status: 'complete'
    },
    {
      id: '4',
      time: '08:45 am',
      duration: '30 min, 45 sec',
      patientName: 'Miller, Jennifer',
      dob: 'DOB: 02/18/1982',
      insurance: 'OOT',
      visitType: 'Artwork Wellness',
      status: 'sign-now',
      hasAlert: true,
      alertText: 'Changes Pending'
    },
    {
      id: '5',
      time: '09:00 am',
      duration: '',
      patientName: 'Taylor, Robert',
      dob: '',
      insurance: '',
      visitType: '',
      status: 'complete'
    },
    {
      id: '6',
      time: '09:15 am',
      duration: '',
      patientName: 'Jones, Robert',
      dob: '',
      insurance: '',
      visitType: '',
      status: 'complete'
    },
    {
      id: '7',
      time: '09:45 am',
      duration: '25 sec',
      patientName: 'Martinez, Carlos',
      dob: 'DOB: 06/14/1979',
      insurance: 'Sr M',
      visitType: 'Asthma Check',
      status: 'sign-now',
      hasAlert: true,
      alertText: 'Changes Pending'
    },
    {
      id: '8',
      time: '10:00 am',
      duration: '',
      patientName: 'Johnson, Emily',
      dob: '',
      insurance: '',
      visitType: '',
      status: 'complete'
    },
    {
      id: '9',
      time: '10:15 am',
      duration: '',
      patientName: 'Williams, Susan',
      dob: 'DOB: 07/21/1987',
      insurance: 'Sr M',
      visitType: 'Diabetes Check',
      status: 'exam-room',
      hasAlert: false
    },
    {
      id: '10',
      time: '10:30 am',
      duration: '25 min, 12 sec',
      patientName: 'Moore, Linda',
      dob: 'DOB: 04/03/1972',
      insurance: 'Sr M',
      visitType: 'Depression Management',
      status: 'done-visit',
      hasAlert: true,
      alertText: 'Observation | 1 min'
    },
    {
      id: '11',
      time: '10:45 am',
      duration: '',
      patientName: 'Anderson, James',
      dob: 'DOB: 08/31/1985',
      insurance: 'Day M',
      visitType: 'Sinusitis',
      status: 'none'
    },
    {
      id: '12',
      time: '11:15 am',
      duration: '58 min',
      patientName: 'Wilson, Emma',
      dob: 'DOB: 09/14/1992',
      insurance: 'Sr M',
      visitType: 'Birth Control Consult',
      status: 'none'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-gray-100 text-gray-600 text-xs">Complete</Badge>;
      case 'sign-now':
        return <Badge className="bg-orange-100 text-orange-700 text-xs">Sign Now</Badge>;
      case 'changes-pending':
        return <Badge className="bg-orange-100 text-orange-700 text-xs">Changes Pending</Badge>;
      case 'exam-room':
        return <Badge className="bg-teal-100 text-teal-700 text-xs">Exam Room | 1 min</Badge>;
      case 'done-visit':
        return <Badge className="bg-green-600 text-white text-xs">Done Visit</Badge>;
      default:
        return null;
    }
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = selectedDate.getDate() === day && 
                        selectedDate.getMonth() === month && 
                        selectedDate.getFullYear() === year;
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-8 flex items-center justify-center rounded text-sm transition-colors ${
            isSelected 
              ? 'bg-blue-600 text-white' 
              : isToday
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="flex gap-6">
      {/* Appointments List */}
      <div className="flex-1">
        <Card className="bg-white border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg">June 12, 2025 Appointments</h2>
                <p className="text-sm text-gray-500 mt-1">22 Online encounter</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  Cancel View
                </Button>
                <Button variant="outline" size="sm">
                  Full Schedule
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                  [Signed]
                </Button>
              </div>
            </div>
          </div>

          {/* Appointments */}
          <div className="divide-y divide-gray-100">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Time */}
                  <div className="w-20 flex-shrink-0">
                    <div className="text-sm">{apt.time}</div>
                    {apt.duration && (
                      <div className="text-xs text-gray-500">{apt.duration}</div>
                    )}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <a href="#" className="text-sm text-blue-600 hover:underline">
                        {apt.patientName}
                      </a>
                    </div>
                    {apt.dob && (
                      <div className="text-xs text-gray-600 space-x-2">
                        <span>{apt.dob}</span>
                        {apt.insurance && <span>| {apt.insurance}</span>}
                        {apt.visitType && <span>| {apt.visitType}</span>}
                      </div>
                    )}
                  </div>

                  {/* Status & Alerts */}
                  <div className="flex items-center gap-2">
                    {apt.hasAlert && apt.alertText && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs">
                        {apt.alertText}
                      </Badge>
                    )}
                    {getStatusBadge(apt.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Calendar Sidebar */}
      <div className="w-80 space-y-4">
        {/* Calendar */}
        <Card className="bg-white border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm">June 2025</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={prevMonth} className="h-7 w-7 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={nextMonth} className="h-7 w-7 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
              <div className="text-center">Su</div>
              <div className="text-center">Mo</div>
              <div className="text-center">Tu</div>
              <div className="text-center">We</div>
              <div className="text-center">Th</div>
              <div className="text-center">Fr</div>
              <div className="text-center">Sa</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {generateCalendar()}
            </div>
          </div>
        </Card>

        {/* Selected Day Info */}
        <Card className="bg-white border-gray-200 p-4">
          <h3 className="text-sm mb-3">SELECTED DAY</h3>
          <div className="text-sm mb-4">{formatDate(selectedDate)}</div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Appointments</span>
              <span className="text-blue-600">26</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Unsigned Notes</span>
              <span className="text-red-600">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Changes Not Submitted</span>
              <span className="text-orange-600">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Outstanding Tasks</span>
              <span>4</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
