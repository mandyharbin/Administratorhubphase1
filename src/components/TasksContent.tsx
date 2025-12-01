import { useState, useEffect } from 'react';
import { Search, Pill, Clipboard, Users, Activity, MessageSquare, ExternalLink, ShoppingCart, Eye, FileText } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ChartReviewDialog } from './ChartReviewDialog';
import { toast } from 'sonner@2.0.3';

interface Task {
  id: string;
  patientName: string;
  patientMRN: string;
  taskType: 'Patient Messages' | 'Medication Refill' | 'Team Task' | 'Lab Review' | 'Unsigned Notes' | 'Orders & Charges' | 'Referrals';
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Overdue' | 'Pending';
  dueDate: string;
  createdDate: string;
  assignedTo: string;
  routedFrom?: string;
  hasPreVisitForms?: boolean;
  preVisitFormData?: any;
}

interface TasksContentProps {
  routedTasks?: Task[];
  onAcceptChartData?: (patientName: string, acceptedData: any) => void;
}

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    patientName: 'Johnson, Emily',
    patientMRN: 'MRN-78945',
    taskType: 'Patient Messages',
    description: 'Response needed: Blood pressure question',
    priority: 'High',
    status: 'Overdue',
    dueDate: 'October 15, 2025',
    createdDate: 'September 15, 2025',
    assignedTo: 'David Ford, MD'
  },
  {
    id: '2',
    patientName: 'Johnson, Emily',
    patientMRN: 'MRN-78945',
    taskType: 'Referrals',
    description: 'Diabetic Eye Exam - Create referral',
    priority: 'Medium',
    status: 'Pending',
    dueDate: 'November 30, 2025',
    createdDate: 'October 1, 2025',
    assignedTo: 'David Ford, MD'
  },
  {
    id: '3',
    patientName: 'Johnson, Emily',
    patientMRN: 'MRN-78945',
    taskType: 'Medication Refill',
    description: 'Atorvastatin 20mg - Renewal needed (5 days left)',
    priority: 'High',
    status: 'Pending',
    dueDate: 'October 29, 2025',
    createdDate: 'October 20, 2025',
    assignedTo: 'David Ford, MD'
  },
  {
    id: '4',
    patientName: 'Williams, Susan',
    patientMRN: 'MRN-12345',
    taskType: 'Patient Messages',
    description: 'Requesting appointment for follow-up',
    priority: 'Medium',
    status: 'Pending',
    dueDate: 'October 31, 2025',
    createdDate: 'October 15, 2025',
    assignedTo: 'David Ford, MD'
  },
  {
    id: '5',
    patientName: 'Johnson, Emily',
    patientMRN: 'MRN-78945',
    taskType: 'Team Task',
    description: 'Administer flu vaccine',
    priority: 'High',
    status: 'Pending',
    dueDate: 'June 12, 2024',
    createdDate: 'June 10, 2024',
    assignedTo: 'Sarah Chen, MA'
  },
  {
    id: '6',
    patientName: 'Johnson, Emily',
    patientMRN: 'MRN-78945',
    taskType: 'Team Task',
    description: 'Review medication list',
    priority: 'Medium',
    status: 'Pending',
    dueDate: 'June 12, 2024',
    createdDate: 'June 10, 2024',
    assignedTo: 'David Ford, MD'
  },
  {
    id: '7',
    patientName: 'Williams, Susan',
    patientMRN: 'MRN-12345',
    taskType: 'Lab Review',
    description: 'Review A1C results (7.2%)',
    priority: 'Medium',
    status: 'Pending',
    dueDate: 'June 12, 2024',
    createdDate: 'June 10, 2024',
    assignedTo: 'David Ford, MD'
  },
  {
    id: '8',
    patientName: 'Williams, Susan',
    patientMRN: 'MRN-12345',
    taskType: 'Medication Refill',
    description: 'Metformin 1000mg - Renewal needed',
    priority: 'High',
    status: 'Overdue',
    dueDate: 'October 20, 2025',
    createdDate: 'October 10, 2025',
    assignedTo: 'David Ford, MD'
  },
  {
    id: '9',
    patientName: 'Williams, Susan',
    patientMRN: 'MRN-12345',
    taskType: 'Patient Messages',
    description: 'Question about medication side effects',
    priority: 'High',
    status: 'Pending',
    dueDate: 'November 1, 2025',
    createdDate: 'September 25, 2025',
    assignedTo: 'David Ford, MD'
  },
  {
    id: '15',
    patientName: 'Johnson, Emily',
    patientMRN: 'MRN-78945',
    taskType: 'Unsigned Notes',
    description: 'Annual wellness visit 10/24/25',
    priority: 'High',
    status: 'Pending',
    dueDate: 'October 27, 2025',
    createdDate: 'October 24, 2025',
    assignedTo: 'David Ford, MD'
  },
  {
    id: '16',
    patientName: 'Martinez, Carlos',
    patientMRN: 'MRN-45678',
    taskType: 'Orders & Charges',
    description: 'Submit orders for MRI and lab work',
    priority: 'High',
    status: 'Pending',
    dueDate: 'October 26, 2025',
    createdDate: 'October 25, 2025',
    assignedTo: 'David Ford, MD'
  },
  {
    id: '17',
    patientName: 'Carter, Cody',
    patientMRN: 'MRN-34567',
    taskType: 'Referrals',
    description: 'Orthopedic consultation for knee pain',
    priority: 'Medium',
    status: 'Pending',
    dueDate: 'October 30, 2025',
    createdDate: 'October 23, 2025',
    assignedTo: 'David Ford, MD'
  }
];

export function TasksContent({ routedTasks = [], onAcceptChartData }: TasksContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('David Ford, MD');
  const [allTasks, setAllTasks] = useState<Task[]>(() => {
    // Initialize with both INITIAL_TASKS and any routedTasks
    return [...INITIAL_TASKS, ...routedTasks];
  });
  const [chartReviewOpen, setChartReviewOpen] = useState(false);

  useEffect(() => {
    // When routedTasks prop changes, update allTasks
    setAllTasks(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newTasks = routedTasks.filter(t => !existingIds.has(t.id));
      if (newTasks.length > 0) {
        toast.success(`${newTasks.length} new task(s) routed to you`);
        return [...prev, ...newTasks];
      }
      return prev;
    });
  }, [routedTasks]);

  const tasksForCounts = allTasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.patientMRN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignedTo === assigneeFilter;

    return matchesSearch && matchesPriority && matchesStatus && matchesAssignee;
  });

  const filteredTasks = tasksForCounts.filter(task => {
    const matchesType = typeFilter === 'all' || task.taskType === typeFilter;
    return matchesType;
  });

  const taskTypeCounts = {
    'Patient Messages': tasksForCounts.filter(t => t.taskType === 'Patient Messages').length,
    'Medication Refill': tasksForCounts.filter(t => t.taskType === 'Medication Refill').length,
    'Team Task': tasksForCounts.filter(t => t.taskType === 'Team Task').length,
    'Lab Review': tasksForCounts.filter(t => t.taskType === 'Lab Review').length,
    'Unsigned Notes': tasksForCounts.filter(t => t.taskType === 'Unsigned Notes').length,
    'Orders & Charges': tasksForCounts.filter(t => t.taskType === 'Orders & Charges').length,
    'Referrals': tasksForCounts.filter(t => t.taskType === 'Referrals').length,
  };

  const getTaskIcon = (taskType: Task['taskType']) => {
    switch (taskType) {
      case 'Patient Messages':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'Medication Refill':
        return <Pill className="w-4 h-4 text-purple-600" />;
      case 'Team Task':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'Lab Review':
        return <Activity className="w-4 h-4 text-red-600" />;
      case 'Unsigned Notes':
        return <Clipboard className="w-4 h-4 text-orange-600" />;
      case 'Orders & Charges':
        return <ShoppingCart className="w-4 h-4 text-green-600" />;
      case 'Referrals':
        return <ExternalLink className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
      case 'Low':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Overdue':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'Pending':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const handleCompleteTask = (taskId: string) => {
    setAllTasks(prev => prev.filter(t => t.id !== taskId));
    toast.success('Task completed successfully');
  };

  const handleViewForms = () => {
    setChartReviewOpen(true);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl mb-1">Outstanding Tasks</h1>
        <p className="text-sm text-gray-600">All patient tasks across your panel</p>
      </div>

      {/* Task Type Buckets */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        <button 
          onClick={() => setTypeFilter(typeFilter === 'Patient Messages' ? 'all' : 'Patient Messages')}
          className={`bg-white rounded-lg border ${typeFilter === 'Patient Messages' ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : 'border-gray-200'} p-2 hover:border-blue-400 transition-all cursor-pointer text-left`}
        >
          <div className="flex items-center gap-1 mb-1">
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl text-gray-900 mb-0.5">{taskTypeCounts['Patient Messages']}</div>
          <div className="text-xs text-gray-600 leading-tight">Patient Messages</div>
        </button>

        <button 
          onClick={() => setTypeFilter(typeFilter === 'Medication Refill' ? 'all' : 'Medication Refill')}
          className={`bg-white rounded-lg border ${typeFilter === 'Medication Refill' ? 'border-purple-500 ring-2 ring-purple-500 ring-opacity-20' : 'border-gray-200'} p-2 hover:border-purple-400 transition-all cursor-pointer text-left`}
        >
          <div className="flex items-center gap-1 mb-1">
            <Pill className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl text-gray-900 mb-0.5">{taskTypeCounts['Medication Refill']}</div>
          <div className="text-xs text-gray-600 leading-tight">Med Refills</div>
        </button>

        <button 
          onClick={() => setTypeFilter(typeFilter === 'Team Task' ? 'all' : 'Team Task')}
          className={`bg-white rounded-lg border ${typeFilter === 'Team Task' ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : 'border-gray-200'} p-2 hover:border-blue-400 transition-all cursor-pointer text-left`}
        >
          <div className="flex items-center gap-1 mb-1">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl text-gray-900 mb-0.5">{taskTypeCounts['Team Task']}</div>
          <div className="text-xs text-gray-600 leading-tight">Team Tasks</div>
        </button>

        <button 
          onClick={() => setTypeFilter(typeFilter === 'Lab Review' ? 'all' : 'Lab Review')}
          className={`bg-white rounded-lg border ${typeFilter === 'Lab Review' ? 'border-red-500 ring-2 ring-red-500 ring-opacity-20' : 'border-gray-200'} p-2 hover:border-red-400 transition-all cursor-pointer text-left`}
        >
          <div className="flex items-center gap-1 mb-1">
            <Activity className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl text-gray-900 mb-0.5">{taskTypeCounts['Lab Review']}</div>
          <div className="text-xs text-gray-600 leading-tight">Lab Reviews</div>
        </button>

        <button 
          onClick={() => setTypeFilter(typeFilter === 'Unsigned Notes' ? 'all' : 'Unsigned Notes')}
          className={`bg-white rounded-lg border ${typeFilter === 'Unsigned Notes' ? 'border-orange-500 ring-2 ring-orange-500 ring-opacity-20' : 'border-gray-200'} p-2 hover:border-orange-400 transition-all cursor-pointer text-left`}
        >
          <div className="flex items-center gap-1 mb-1">
            <Clipboard className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-xl text-gray-900 mb-0.5">{taskTypeCounts['Unsigned Notes']}</div>
          <div className="text-xs text-gray-600 leading-tight">Unsigned Notes</div>
        </button>

        <button 
          onClick={() => setTypeFilter(typeFilter === 'Orders & Charges' ? 'all' : 'Orders & Charges')}
          className={`bg-white rounded-lg border ${typeFilter === 'Orders & Charges' ? 'border-green-500 ring-2 ring-green-500 ring-opacity-20' : 'border-gray-200'} p-2 hover:border-green-400 transition-all cursor-pointer text-left`}
        >
          <div className="flex items-center gap-1 mb-1">
            <ShoppingCart className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-xl text-gray-900 mb-0.5">{taskTypeCounts['Orders & Charges']}</div>
          <div className="text-xs text-gray-600 leading-tight">Orders & Charges</div>
        </button>

        <button 
          onClick={() => setTypeFilter(typeFilter === 'Referrals' ? 'all' : 'Referrals')}
          className={`bg-white rounded-lg border ${typeFilter === 'Referrals' ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-20' : 'border-gray-200'} p-2 hover:border-indigo-400 transition-all cursor-pointer text-left`}
        >
          <div className="flex items-center gap-1 mb-1">
            <ExternalLink className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl text-gray-900 mb-0.5">{taskTypeCounts['Referrals']}</div>
          <div className="text-xs text-gray-600 leading-tight">Referrals</div>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by patient name, MRN, or task description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Patient Messages">Patient Messages</SelectItem>
              <SelectItem value="Medication Refill">Medication Refill</SelectItem>
              <SelectItem value="Team Task">Team Task</SelectItem>
              <SelectItem value="Lab Review">Lab Review</SelectItem>
              <SelectItem value="Unsigned Notes">Unsigned Notes</SelectItem>
              <SelectItem value="Orders & Charges">Orders & Charges</SelectItem>
              <SelectItem value="Referrals">Referrals</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              <SelectItem value="David Ford, MD">David Ford, MD</SelectItem>
              <SelectItem value="Sarah Chen, MA">Sarah Chen, MA</SelectItem>
              <SelectItem value="Michael Rodriguez, MA">Michael Rodriguez, MA</SelectItem>
              <SelectItem value="Jessica Martinez, Front Desk">Jessica Martinez, Front Desk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Task Type</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm">{task.patientName}</div>
                      <div className="text-xs text-gray-500">{task.patientMRN}</div>
                      {task.routedFrom && (
                        <Badge className="mt-1 bg-purple-100 text-purple-700 text-xs">
                          Routed from {task.routedFrom}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getTaskIcon(task.taskType)}
                      <span className="text-sm">{task.taskType}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{task.description}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm">{task.dueDate}</div>
                      <div className="text-xs text-gray-500">Created: {task.createdDate}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{task.assignedTo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        className="bg-[#007CBE] hover:bg-[#006BA6]"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        Complete
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                      >
                        View
                      </Button>
                      {task.hasPreVisitForms && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleViewForms}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pre-Visit Forms Modal - ChartReviewDialog */}
      <ChartReviewDialog
        open={chartReviewOpen}
        onOpenChange={setChartReviewOpen}
        onAccept={onAcceptChartData}
        data={{
          patientName: 'Smith, John',
          appointmentDate: 'November 30, 2025 at 2:00 PM',
          completedDate: 'November 24, 2025 at 2:45 PM',
          medicalHistory: [
            { id: 'mh-1', condition: 'Type 2 Diabetes', diagnosedYear: '2018', status: 'Active' },
            { id: 'mh-2', condition: 'Hypertension', diagnosedYear: '2015', status: 'Active' },
            { id: 'mh-3', condition: 'Seasonal Allergies', diagnosedYear: '2010', status: 'Active' },
            { id: 'mh-4', condition: 'Asthma', diagnosedYear: '2005', status: 'Well-controlled' }
          ],
          familyHistory: [
            { id: 'fh-1', relationship: 'Father', condition: 'Coronary Artery Disease', ageAtDiagnosis: '55' },
            { id: 'fh-2', relationship: 'Mother', condition: 'Type 2 Diabetes', ageAtDiagnosis: '62' },
            { id: 'fh-3', relationship: 'Sister', condition: 'Breast Cancer', ageAtDiagnosis: '48' }
          ],
          surgicalHistory: [
            { id: 'sh-1', procedure: 'Appendectomy', year: '2012', hospital: 'Memorial Hospital' },
            { id: 'sh-2', procedure: 'Knee Arthroscopy', year: '2019', hospital: 'Sports Medicine Center' }
          ],
          socialHistory: [
            { category: 'Smoking Status', value: 'Former smoker, quit 5 years ago' },
            { category: 'Alcohol Use', value: 'Social drinker, 2-3 drinks per week' },
            { category: 'Exercise', value: 'Walks 30 minutes daily' },
            { category: 'Occupation', value: 'Software Engineer' },
            { category: 'Marital Status', value: 'Married' }
          ],
          immunizations: [
            { id: 'im-1', vaccine: 'Influenza', date: 'October 15, 2025', provider: 'CVS Pharmacy' },
            { id: 'im-2', vaccine: 'COVID-19 Booster', date: 'September 10, 2025', provider: 'Walgreens' },
            { id: 'im-3', vaccine: 'Tdap', date: 'March 20, 2023' },
            { id: 'im-4', vaccine: 'Pneumococcal', date: 'January 5, 2022' }
          ],
          medications: [
            { id: 'med-1', name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', prescribedBy: 'Dr. Sarah Chen' },
            { id: 'med-2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', prescribedBy: 'Dr. Sarah Chen' },
            { id: 'med-3', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', prescribedBy: 'Dr. Sarah Chen' },
            { id: 'med-4', name: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'As needed for asthma', prescribedBy: 'Dr. Michael Roberts' }
          ],
          financialConsent: true,
          hipaaAcknowledgment: true,
          covidScreening: {
            symptoms: [],
            recentTravel: false
          },
          insuranceCard: {
            uploaded: true,
            imageCount: 2
          },
          photoId: {
            uploaded: true
          }
        }}
      />
    </>
  );
}