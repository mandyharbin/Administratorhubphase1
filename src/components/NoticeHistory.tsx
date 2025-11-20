import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Search, Eye, Download, Filter, Calendar, CheckCircle, XCircle, Clock, Send, Users, FileText, ChevronRight, Plus, Ban, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState } from 'react';
import { PatientNotices } from './PatientNotices';

interface NoticeRecord {
  id: string;
  noticeName: string;
  noticeType: string;
  sentDate: string;
  sentTime: string;
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  content: string;
  recipients: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'delivered' | 'failed' | 'pending';
    deliveredAt?: string;
    failureReason?: string;
  }>;
}

interface NoticeHistoryProps {
  onNavigateToNotices?: () => void;
}

export function NoticeHistory({ onNavigateToNotices }: NoticeHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedNotice, setSelectedNotice] = useState<NoticeRecord | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [createNoticeOpen, setCreateNoticeOpen] = useState(false);
  const [retryConfirmOpen, setRetryConfirmOpen] = useState(false);
  const [noticeToRetry, setNoticeToRetry] = useState<NoticeRecord | null>(null);

  // Helper function to generate sample recipients
  const generateRecipients = (count: number, deliveredCount: number, failedCount: number, pendingCount: number, dateTime: string) => {
    const names = [
      'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Jessica Martinez',
      'Robert Taylor', 'Amanda Williams', 'Christopher Brown', 'Jennifer Davis', 'Matthew Wilson',
      'Ashley Garcia', 'Daniel Anderson', 'Lisa Thompson', 'James Moore', 'Maria Jackson',
      'John White', 'Patricia Harris', 'Richard Martin', 'Linda Thompson', 'William Garcia',
      'Karen Miller', 'Joseph Lee', 'Nancy Walker', 'Thomas Hall', 'Betty Allen',
      'Charles Young', 'Sandra King', 'Steven Wright', 'Margaret Lopez', 'Paul Hill',
      'Donna Scott', 'Mark Green', 'Carol Adams', 'Donald Baker', 'Michelle Nelson',
      'Kevin Carter', 'Laura Mitchell', 'Kenneth Perez', 'Susan Roberts', 'Brian Turner',
      'Dorothy Phillips', 'Edward Campbell', 'Lisa Parker', 'Timothy Evans', 'Helen Edwards',
      'Jason Collins', 'Sharon Stewart', 'Jeffrey Morris', 'Deborah Rogers', 'Ryan Reed',
      'Cynthia Cook', 'Jacob Morgan', 'Angela Bell', 'Gary Murphy', 'Melissa Bailey',
      'Nicholas Rivera', 'Debra Cooper', 'Eric Richardson', 'Stephanie Cox', 'Jonathan Howard',
      'Rebecca Ward', 'Stephen Torres', 'Kathleen Peterson', 'Larry Gray', 'Amy Ramirez',
      'Justin James', 'Shirley Watson', 'Scott Brooks', 'Anna Kelly', 'Brandon Sanders',
      'Virginia Price', 'Raymond Bennett', 'Catherine Wood', 'Patrick Barnes', 'Pamela Ross'
    ];
    
    const recipients = [];
    let deliveredAdded = 0;
    let failedAdded = 0;
    let pendingAdded = 0;
    
    for (let i = 0; i < count; i++) {
      const name = names[i % names.length];
      const email = name.toLowerCase().replace(' ', '.') + '@email.com';
      const phone = `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      
      let status: 'delivered' | 'failed' | 'pending';
      let deliveredAt: string | undefined;
      let failureReason: string | undefined;
      
      if (deliveredAdded < deliveredCount) {
        status = 'delivered';
        deliveredAt = dateTime;
        deliveredAdded++;
      } else if (failedAdded < failedCount) {
        status = 'failed';
        const reasons = ['Invalid email address', 'Phone number not in service', 'Bounced email', 'Opted out of notifications'];
        failureReason = reasons[i % reasons.length];
        failedAdded++;
      } else {
        status = 'pending';
        pendingAdded++;
      }
      
      recipients.push({
        id: String(i + 1),
        name,
        email,
        phone,
        status,
        deliveredAt,
        failureReason
      });
    }
    
    return recipients;
  };

  const notices: NoticeRecord[] = [
    {
      id: '1',
      noticeName: 'Flu Shot Walk-In Availability',
      noticeType: 'Appointment Notice',
      sentDate: 'Nov 15, 2025',
      sentTime: '2:30 PM',
      totalSent: 1247,
      delivered: 1198,
      failed: 12,
      pending: 37,
      content: 'Flu shots are now available at all our office locations. No appointment necessary - just walk in during business hours (Mon-Fri, 8 AM - 5 PM). Covered by most insurance plans. Protect yourself and your family this flu season.',
      recipients: generateRecipients(52, 48, 2, 2, 'Nov 15, 2025, 2:31 PM')
    },
    {
      id: '2',
      noticeName: 'Updated HIPAA Privacy Policy',
      noticeType: 'Orders Notification',
      sentDate: 'Nov 12, 2025',
      sentTime: '9:00 AM',
      totalSent: 2834,
      delivered: 2801,
      failed: 33,
      pending: 0,
      content: 'Our HIPAA Privacy Notice has been updated effective November 15, 2025. The updated notice includes new provisions regarding electronic health records and patient portal access. You can view the full notice in your patient portal or request a printed copy at your next visit.',
      recipients: generateRecipients(68, 64, 4, 0, 'Nov 12, 2025, 9:02 AM')
    },
    {
      id: '3',
      noticeName: 'Patient Satisfaction Survey 2025',
      noticeType: 'Survey Invites',
      sentDate: 'Nov 10, 2025',
      sentTime: '10:15 AM',
      totalSent: 1563,
      delivered: 1542,
      failed: 8,
      pending: 13,
      content: 'We value your feedback! Please take 5 minutes to complete our annual patient satisfaction survey. Your responses help us improve our services. As a thank you, you\'ll be entered to win a $100 gift card. Survey link expires on Nov 30, 2025.',
      recipients: generateRecipients(45, 40, 3, 2, 'Nov 10, 2025, 10:16 AM')
    },
    {
      id: '4',
      noticeName: 'November Birthday Wishes',
      noticeType: 'Birthday Messages',
      sentDate: 'Nov 8, 2025',
      sentTime: '3:45 PM',
      totalSent: 2156,
      delivered: 2089,
      failed: 19,
      pending: 48,
      content: 'Happy Birthday from all of us at Wellness Medical Center! We hope you have a wonderful day celebrating. As a birthday gift, enjoy 20% off any wellness services booked this month. Thank you for being part of our patient family!',
      recipients: generateRecipients(75, 68, 3, 4, 'Nov 8, 2025, 3:46 PM')
    },
    {
      id: '5',
      noticeName: 'Thanksgiving Holiday Hours',
      noticeType: 'Appointment Notice',
      sentDate: 'Nov 22, 2025',
      sentTime: '11:30 AM',
      totalSent: 3421,
      delivered: 0,
      failed: 0,
      pending: 3421,
      content: 'Our office will have modified hours during the upcoming holiday season. We will be closed on Thanksgiving Day (Nov 28, 2025) and the day after (Nov 29, 2025). We will resume normal hours on Monday, Dec 2, 2025. For urgent medical needs during this time, please call our answering service.',
      recipients: generateRecipients(60, 0, 0, 60, 'Nov 22, 2025, 11:32 AM')
    },
    {
      id: '6',
      noticeName: 'Lab Results Available',
      noticeType: 'Orders Notification',
      sentDate: 'Nov 3, 2025',
      sentTime: '8:00 AM',
      totalSent: 487,
      delivered: 456,
      failed: 15,
      pending: 16,
      content: 'Your recent lab results are now available in your patient portal. Please log in to review them. If you have any questions or concerns about your results, please don\'t hesitate to contact our office or send a secure message to your care team.',
      recipients: generateRecipients(42, 38, 2, 2, 'Nov 3, 2025, 8:01 AM')
    },
    {
      id: '7',
      noticeName: 'Annual Wellness Visit Reminder',
      noticeType: 'Appointment Notice',
      sentDate: 'Oct 28, 2025',
      sentTime: '1:00 PM',
      totalSent: 2967,
      delivered: 2934,
      failed: 11,
      pending: 22,
      content: 'It\'s time for your annual wellness visit! These preventive care appointments are typically covered 100% by insurance. Schedule yours today to review your health goals, update medications, and complete any needed screenings. Call us or book online.',
      recipients: generateRecipients(55, 50, 3, 2, 'Oct 28, 2025, 1:02 PM')
    },
    {
      id: '8',
      noticeName: 'Mammogram Screening Due',
      noticeType: 'Recall Reminders',
      sentDate: 'Oct 25, 2025',
      sentTime: '9:30 AM',
      totalSent: 842,
      delivered: 821,
      failed: 7,
      pending: 14,
      content: 'Hi, you are due for your annual mammogram screening. Early detection is key to successful treatment. Please call (555) 123-4567 to schedule your appointment at our Women\'s Health Center.',
      recipients: generateRecipients(38, 35, 2, 1, 'Oct 25, 2025, 9:31 AM')
    },
    {
      id: '9',
      noticeName: 'Appointment Tomorrow Reminder',
      noticeType: 'Appointment Notice',
      sentDate: 'Oct 22, 2025',
      sentTime: '4:00 PM',
      totalSent: 156,
      delivered: 152,
      failed: 2,
      pending: 2,
      content: 'Hi, this is a reminder that you have an appointment with Dr. Anderson tomorrow at 10:30 AM at our Main Campus Medical Center. Please reply CONFIRM to confirm or call us at (555) 123-4567 if you need to reschedule.',
      recipients: generateRecipients(28, 26, 1, 1, 'Oct 22, 2025, 4:01 PM')
    },
    {
      id: '10',
      noticeName: 'Missed Appointment Follow-Up',
      noticeType: 'No Show',
      sentDate: 'Oct 20, 2025',
      sentTime: '2:15 PM',
      totalSent: 23,
      delivered: 19,
      failed: 3,
      pending: 1,
      content: 'Hi, you didn\'t make it to your appointment today. Please call (555) 123-4567 to reschedule your appointment.',
      recipients: generateRecipients(15, 12, 2, 1, 'Oct 20, 2025, 2:16 PM')
    },
    {
      id: '11',
      noticeName: 'Payment Received Confirmation',
      noticeType: 'Financial Updates',
      sentDate: 'Oct 18, 2025',
      sentTime: '11:45 AM',
      totalSent: 347,
      delivered: 344,
      failed: 2,
      pending: 1,
      content: 'Thank you for your payment of $125.00 received on Oct 18, 2025. Your new account balance is $0.00. Questions? Call (555) 123-4500 or visit your patient portal.',
      recipients: generateRecipients(32, 30, 1, 1, 'Oct 18, 2025, 11:46 AM')
    },
    {
      id: '12',
      noticeName: 'Colonoscopy Screening Overdue',
      noticeType: 'Recall Reminders',
      sentDate: 'Oct 15, 2025',
      sentTime: '10:00 AM',
      totalSent: 534,
      delivered: 512,
      failed: 11,
      pending: 11,
      content: 'Hi, you are due for your colonoscopy screening. This important preventive screening is recommended every 10 years for adults over 45. Please call (555) 123-4567 to schedule.',
      recipients: generateRecipients(40, 36, 3, 1, 'Oct 15, 2025, 10:02 AM')
    },
    {
      id: '13',
      noticeName: 'Blood Work Results Available',
      noticeType: 'Clinical Updates',
      sentDate: 'Oct 12, 2025',
      sentTime: '8:30 AM',
      totalSent: 267,
      delivered: 259,
      failed: 5,
      pending: 3,
      content: 'Your recent lab results from Oct 8, 2025 are now available in your patient portal. Please log in to review them. If you have questions, contact Dr. Martinez at (555) 123-4567.',
      recipients: generateRecipients(30, 28, 1, 1, 'Oct 12, 2025, 8:31 AM')
    },
    {
      id: '14',
      noticeName: 'Same Day Openings Available',
      noticeType: 'Appointment Broadcast',
      sentDate: 'Oct 10, 2025',
      sentTime: '7:00 AM',
      totalSent: 1854,
      delivered: 1821,
      failed: 18,
      pending: 15,
      content: 'Same-day appointments now available! We have openings today with Dr. Chen at North Clinic. Call (555) 123-4567 or book online at our patient portal. Don\'t miss this opportunity!',
      recipients: generateRecipients(48, 44, 2, 2, 'Oct 10, 2025, 7:02 AM')
    },
    {
      id: '15',
      noticeName: 'October Birthday Wishes',
      noticeType: 'Birthday Messages',
      sentDate: 'Oct 8, 2025',
      sentTime: '9:00 AM',
      totalSent: 1923,
      delivered: 1876,
      failed: 21,
      pending: 26,
      content: 'Happy Birthday from all of us at Wellness Medical Center! We hope you have a wonderful day celebrating. Thank you for trusting us with your care.',
      recipients: generateRecipients(62, 58, 2, 2, 'Oct 8, 2025, 9:01 AM')
    },
    {
      id: '16',
      noticeName: 'New Balance Statement',
      noticeType: 'Financial Updates',
      sentDate: 'Oct 5, 2025',
      sentTime: '3:00 PM',
      totalSent: 892,
      delivered: 867,
      failed: 14,
      pending: 11,
      content: 'Your recent visit resulted in a balance of $250.00. View your statement in the patient portal or call our billing department at (555) 123-4500 for payment options.',
      recipients: generateRecipients(44, 40, 3, 1, 'Oct 5, 2025, 3:02 PM')
    },
    {
      id: '17',
      noticeName: 'Diabetes Care Program Enrollment',
      noticeType: 'Recall Reminders',
      sentDate: 'Oct 3, 2025',
      sentTime: '1:30 PM',
      totalSent: 421,
      delivered: 408,
      failed: 8,
      pending: 5,
      content: 'Hi, you are due for your diabetes management check-up. Our Diabetes Care Program offers personalized support and education. Please call (555) 123-4567 to schedule.',
      recipients: generateRecipients(36, 33, 2, 1, 'Oct 3, 2025, 1:32 PM')
    },
    {
      id: '18',
      noticeName: 'MRI Results Ready for Review',
      noticeType: 'Clinical Updates',
      sentDate: 'Sep 28, 2025',
      sentTime: '10:45 AM',
      totalSent: 34,
      delivered: 32,
      failed: 1,
      pending: 1,
      content: 'Your MRI results are ready for review in your patient portal. Your provider will discuss these with you at your next visit or may contact you sooner if needed.',
      recipients: generateRecipients(18, 16, 1, 1, 'Sep 28, 2025, 10:46 AM')
    },
    {
      id: '19',
      noticeName: 'Weekend Appointments Now Available',
      noticeType: 'Appointment Broadcast',
      sentDate: 'Sep 25, 2025',
      sentTime: '8:00 AM',
      totalSent: 2103,
      delivered: 2067,
      failed: 19,
      pending: 17,
      content: 'Limited weekend appointment slots now available at North Clinic! Saturday & Sunday 9am-3pm. Perfect for busy schedules. Book now or call (555) 123-4567.',
      recipients: generateRecipients(54, 50, 2, 2, 'Sep 25, 2025, 8:02 AM')
    },
    {
      id: '20',
      noticeName: 'Flu Season Reminder',
      noticeType: 'Appointment Notice',
      sentDate: 'Sep 20, 2025',
      sentTime: '9:00 AM',
      totalSent: 4521,
      delivered: 4476,
      failed: 28,
      pending: 17,
      content: 'Flu season is here! Schedule your flu shot today. Available at all locations, no appointment needed. Walk-ins welcome Mon-Fri 8am-5pm. Most insurance plans cover 100%.',
      recipients: generateRecipients(70, 66, 2, 2, 'Sep 20, 2025, 9:02 AM')
    },
  ];

  // Phase 1 rollout - hide certain notice types
  const hiddenNoticeTypes = ['Survey Invites', 'Orders Notification', 'Prescription Notification', 'Payment Plan Notices'];
  
  const activeNotices = notices.filter(notice => !hiddenNoticeTypes.includes(notice.noticeType));

  const getFilteredNotices = () => {
    return activeNotices.filter(notice => {
      const matchesSearch = notice.noticeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notice.noticeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notice.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'success' && notice.failed === 0) ||
                           (statusFilter === 'has-failures' && notice.failed > 0) ||
                           (statusFilter === 'pending' && notice.pending > 0);
      
      const matchesType = typeFilter === 'all' || notice.noticeType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const totalNotices = activeNotices.length;
  const totalSent = activeNotices.reduce((sum, n) => sum + n.totalSent, 0);
  const totalDelivered = activeNotices.reduce((sum, n) => sum + n.delivered, 0);
  const totalFailed = activeNotices.reduce((sum, n) => sum + n.failed, 0);
  const totalPending = activeNotices.reduce((sum, n) => sum + n.pending, 0);

  const handleViewDetails = (notice: NoticeRecord) => {
    setSelectedNotice(notice);
    setViewDetailsOpen(true);
    setRecipientSearch(''); // Reset search when opening new notice
  };

  const handleCancelNotice = (noticeId: string) => {
    console.log('Canceling scheduled notice:', noticeId);
    // In a real app, this would call an API to cancel the scheduled notice
    alert('Notice cancelled successfully');
  };

  const handleRetryPending = (noticeId: string) => {
    const notice = notices.find(n => n.id === noticeId);
    if (notice) {
      setNoticeToRetry(notice);
      setRetryConfirmOpen(true);
    }
  };

  const handleConfirmRetry = () => {
    if (noticeToRetry) {
      console.log('Retrying pending recipients for notice:', noticeToRetry.id);
      // In a real app, this would call an API to retry sending to pending recipients
      alert('Retrying pending recipients...');
      setRetryConfirmOpen(false);
    }
  };

  // Helper function to check if a notice is scheduled for the future
  const isFutureNotice = (sentDate: string): boolean => {
    const today = new Date('2025-11-19'); // Current date in the prototype
    const noticeDate = new Date(sentDate);
    return noticeDate > today;
  };

  const getStatusColor = (status: 'delivered' | 'failed' | 'pending') => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: 'delivered' | 'failed' | 'pending') => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-3 h-3" />;
      case 'failed':
        return <XCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Notice History</h2>
          <p className="text-gray-600 mt-1">Track patient notice delivery and engagement</p>
        </div>
        <Button onClick={() => setCreateNoticeOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Notice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search notices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Fully Delivered</SelectItem>
                <SelectItem value="has-failures">Has Failures</SelectItem>
                <SelectItem value="pending">Has Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Appointment Notice">Appointment Notice</SelectItem>
                <SelectItem value="Appointment Broadcast">Appointment Broadcast</SelectItem>
                <SelectItem value="Birthday Messages">Birthday Messages</SelectItem>
                <SelectItem value="Clinical Updates">Clinical Updates</SelectItem>
                <SelectItem value="Financial Updates">Financial Updates</SelectItem>
                <SelectItem value="No Show">No Show</SelectItem>
                <SelectItem value="Recall Reminders">Recall Reminders</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notice History Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notice Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredNotices().map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{notice.noticeName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{notice.noticeType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{notice.sentDate}</div>
                      <div className="text-gray-500 text-xs">{notice.sentTime}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span>{notice.totalSent.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {notice.delivered.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {notice.failed > 0 ? (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {notice.failed}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {notice.pending > 0 ? (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {notice.pending}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(notice)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      
                      {/* Show Cancel button for future scheduled notices */}
                      {isFutureNotice(notice.sentDate) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCancelNotice(notice.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                      
                      {/* Show Retry Pending button for sent notices with pending recipients */}
                      {!isFutureNotice(notice.sentDate) && notice.pending > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRetryPending(notice.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Resend Pending
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="!max-w-[1600px] w-[1600px] max-h-[90vh] flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl">Notice Details</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Complete information about this notice delivery
            </DialogDescription>
          </DialogHeader>

          {selectedNotice && (
            <div className="space-y-6 py-2 overflow-y-auto flex-1">
              {/* Top Section: Notice Info */}
              <div className="space-y-4 bg-gray-50 p-5 rounded-lg border">
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Notice Name</Label>
                  <div className="mt-2 text-base">{selectedNotice.noticeName}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Notice Type</Label>
                  <div className="mt-2">
                    <Badge variant="outline">{selectedNotice.noticeType}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Sent Date & Time</Label>
                  <div className="mt-2 text-base">{selectedNotice.sentDate} at {selectedNotice.sentTime}</div>
                </div>
              </div>

              {/* Notice Content */}
              <div>
                <Label className="text-xs text-gray-500 mb-3 block uppercase tracking-wide">Notice Content</Label>
                <div className="p-5 bg-gray-50 rounded-lg border text-base leading-relaxed">
                  {selectedNotice.content}
                </div>
              </div>

              {/* Recipients List */}
              {selectedNotice.recipients.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">
                      Recipients Sample ({selectedNotice.recipients.filter(recipient => {
                        const searchLower = recipientSearch.toLowerCase();
                        return recipient.name.toLowerCase().includes(searchLower) ||
                               recipient.email.toLowerCase().includes(searchLower) ||
                               recipient.phone.includes(recipientSearch);
                      }).length} of {selectedNotice.recipients.length} shown)
                    </Label>
                    <div className="relative w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search recipients by name, email, or phone..."
                        value={recipientSearch}
                        onChange={(e) => setRecipientSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="py-4">Patient Name</TableHead>
                          <TableHead className="py-4">Email</TableHead>
                          <TableHead className="py-4">Phone</TableHead>
                          <TableHead className="py-4">Status</TableHead>
                          <TableHead className="py-4">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedNotice.recipients
                          .filter(recipient => {
                            const searchLower = recipientSearch.toLowerCase();
                            return recipient.name.toLowerCase().includes(searchLower) ||
                                   recipient.email.toLowerCase().includes(searchLower) ||
                                   recipient.phone.includes(recipientSearch);
                          })
                          .map((recipient) => (
                          <TableRow key={recipient.id} className="hover:bg-gray-50">
                            <TableCell className="py-4">{recipient.name}</TableCell>
                            <TableCell className="text-sm text-gray-600 py-4">{recipient.email}</TableCell>
                            <TableCell className="text-sm text-gray-600 py-4">{recipient.phone}</TableCell>
                            <TableCell className="py-4">
                              <Badge variant="outline" className={getStatusColor(recipient.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(recipient.status)}
                                  <span className="capitalize">{recipient.status}</span>
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 py-4">
                              {recipient.status === 'delivered' && recipient.deliveredAt}
                              {recipient.status === 'failed' && recipient.failureReason}
                              {recipient.status === 'pending' && 'In queue'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Notice Dialog */}
      <Dialog open={createNoticeOpen} onOpenChange={setCreateNoticeOpen}>
        <DialogContent className="!max-w-[1600px] w-[1600px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl">Create New Notice</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Configure and send notices to patients using templates or custom messages
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <PatientNotices />
          </div>
        </DialogContent>
      </Dialog>

      {/* Retry Pending Confirmation Dialog */}
      <Dialog open={retryConfirmOpen} onOpenChange={setRetryConfirmOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Resend to Pending Recipients</DialogTitle>
            <DialogDescription>
              Are you sure you want to resend this notice to all pending recipients?
            </DialogDescription>
          </DialogHeader>

          {noticeToRetry && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Notice Name</Label>
                  <div className="mt-1">{noticeToRetry.noticeName}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Pending Recipients</Label>
                  <div className="mt-1 text-2xl font-semibold text-yellow-600">{noticeToRetry.pending.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Send className="w-4 h-4" />
                <span>This will attempt to send the notice to all {noticeToRetry.pending.toLocaleString()} pending recipients.</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setRetryConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRetry} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Send className="w-4 h-4 mr-2" />
              Resend to Pending
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}