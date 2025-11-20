import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Search, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Shield, 
  Download,
  Filter,
  Users,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface RegistrationRecord {
  id: string;
  tokenId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  dateOfBirth: string;
  registrationType: 'patient' | 'authorized-rep';
  authRepRelationship?: string;
  status: 'issued' | 'scanned' | 'verified' | 'expired' | 'revoked';
  issuedDate: string;
  issuedBy: string;
  scannedDate?: string;
  verifiedDate?: string;
  expirationDate: string;
  revokedDate?: string;
  revokedBy?: string;
  revokedReason?: string;
  qrCodeUrl?: string;
  deviceInfo?: string;
  ipAddress?: string;
  location?: string;
}

export function RegistrationManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');

  // Mock data - in real app, this would come from the EHR
  const [registrations] = useState<RegistrationRecord[]>([
    {
      id: '1',
      tokenId: 'QR-2025-001234',
      patientName: 'Sarah Johnson',
      patientEmail: 'sarah.johnson@email.com',
      patientPhone: '(555) 123-4567',
      dateOfBirth: '1985-03-15',
      registrationType: 'patient',
      status: 'verified',
      issuedDate: '2025-01-10T09:30:00',
      issuedBy: 'Dr. Smith',
      scannedDate: '2025-01-10T14:22:00',
      verifiedDate: '2025-01-10T14:25:00',
      expirationDate: '2025-01-17T09:30:00',
      deviceInfo: 'iPhone 15 Pro',
      location: 'Main Campus Medical Center'
    },
    {
      id: '2',
      tokenId: 'QR-2025-001235',
      patientName: 'Michael Chen',
      patientEmail: 'michael.chen@email.com',
      patientPhone: '(555) 234-5678',
      dateOfBirth: '1978-07-22',
      registrationType: 'patient',
      status: 'scanned',
      issuedDate: '2025-01-12T11:00:00',
      issuedBy: 'Dr. Williams',
      scannedDate: '2025-01-12T15:45:00',
      expirationDate: '2025-01-19T11:00:00',
      deviceInfo: 'Samsung Galaxy S24',
      location: 'North Clinic'
    },
    {
      id: '3',
      tokenId: 'QR-2025-001236',
      patientName: 'Emma Martinez (for John Martinez)',
      patientEmail: 'emma.martinez@email.com',
      patientPhone: '(555) 345-6789',
      dateOfBirth: '2015-11-08',
      registrationType: 'authorized-rep',
      authRepRelationship: 'Parent',
      status: 'verified',
      issuedDate: '2025-01-11T10:15:00',
      issuedBy: 'Dr. Brown',
      scannedDate: '2025-01-11T13:20:00',
      verifiedDate: '2025-01-11T13:23:00',
      expirationDate: '2025-01-18T10:15:00',
      deviceInfo: 'iPhone 14',
      location: 'Pediatric Care Center'
    },
    {
      id: '4',
      tokenId: 'QR-2025-001237',
      patientName: 'Robert Thompson',
      patientEmail: 'robert.thompson@email.com',
      patientPhone: '(555) 456-7890',
      dateOfBirth: '1942-05-30',
      registrationType: 'patient',
      status: 'expired',
      issuedDate: '2025-01-05T08:45:00',
      issuedBy: 'Dr. Davis',
      expirationDate: '2025-01-12T08:45:00',
      location: 'Senior Care Facility'
    },
    {
      id: '5',
      tokenId: 'QR-2025-001238',
      patientName: 'Lisa Anderson',
      patientEmail: 'lisa.anderson@email.com',
      patientPhone: '(555) 567-8901',
      dateOfBirth: '1990-09-18',
      registrationType: 'patient',
      status: 'issued',
      issuedDate: '2025-01-13T14:30:00',
      issuedBy: 'Dr. Garcia',
      expirationDate: '2025-01-20T14:30:00',
      location: 'Downtown Health Center'
    },
    {
      id: '6',
      tokenId: 'QR-2025-001239',
      patientName: 'James Wilson',
      patientEmail: 'james.wilson@email.com',
      patientPhone: '(555) 678-9012',
      dateOfBirth: '1968-12-03',
      registrationType: 'patient',
      status: 'revoked',
      issuedDate: '2025-01-08T09:00:00',
      issuedBy: 'Dr. Martinez',
      revokedDate: '2025-01-09T10:30:00',
      revokedBy: 'Admin Staff',
      revokedReason: 'Duplicate registration detected',
      expirationDate: '2025-01-15T09:00:00',
      location: 'West End Clinic'
    },
    {
      id: '7',
      tokenId: 'QR-2025-001240',
      patientName: 'Patricia Lee (for David Lee)',
      patientEmail: 'patricia.lee@email.com',
      patientPhone: '(555) 789-0123',
      dateOfBirth: '1938-04-12',
      registrationType: 'authorized-rep',
      authRepRelationship: 'Spouse/Caregiver',
      status: 'expired',
      issuedDate: '2025-01-04T11:20:00',
      issuedBy: 'Dr. Johnson',
      expirationDate: '2025-01-11T11:20:00',
      location: 'Senior Care Facility'
    },
    {
      id: '8',
      tokenId: 'QR-2025-001241',
      patientName: 'Maria Rodriguez',
      patientEmail: 'maria.rodriguez@email.com',
      patientPhone: '(555) 890-1234',
      dateOfBirth: '1995-06-25',
      registrationType: 'patient',
      status: 'scanned',
      issuedDate: '2025-01-13T16:00:00',
      issuedBy: 'Dr. Taylor',
      scannedDate: '2025-01-13T18:30:00',
      expirationDate: '2025-01-20T16:00:00',
      deviceInfo: 'Google Pixel 8',
      location: 'South Clinic'
    },
  ]);

  // Calculate statistics
  const stats = {
    total: registrations.length,
    issued: registrations.filter(r => r.status === 'issued').length,
    scanned: registrations.filter(r => r.status === 'scanned').length,
    verified: registrations.filter(r => r.status === 'verified').length,
    expired: registrations.filter(r => r.status === 'expired').length,
    revoked: registrations.filter(r => r.status === 'revoked').length,
    patients: registrations.filter(r => r.registrationType === 'patient').length,
    authReps: registrations.filter(r => r.registrationType === 'authorized-rep').length,
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.tokenId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.patientEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.patientPhone?.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    const matchesType = typeFilter === 'all' || reg.registrationType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: RegistrationRecord['status']) => {
    const variants = {
      'issued': { className: 'bg-blue-100 text-blue-700', icon: QrCode },
      'scanned': { className: 'bg-purple-100 text-purple-700', icon: Clock },
      'verified': { className: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      'expired': { className: 'bg-orange-100 text-orange-700', icon: AlertCircle },
      'revoked': { className: 'bg-red-100 text-red-700', icon: XCircle },
    };

    const variant = variants[status];
    const Icon = variant.icon;

    return (
      <Badge className={variant.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: RegistrationRecord['registrationType']) => {
    return type === 'patient' ? (
      <Badge variant="outline" className="text-blue-600 border-blue-300">
        <Users className="w-3 h-3 mr-1" />
        Patient
      </Badge>
    ) : (
      <Badge variant="outline" className="text-purple-600 border-purple-300">
        <Shield className="w-3 h-3 mr-1" />
        Auth Rep
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const exportData = () => {
    // In real app, this would export to CSV or Excel
    console.log('Exporting registration data...', filteredRegistrations);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Registration Management</h2>
        <p className="text-gray-600 mt-1">
          Monitor patient and authorized representative self-registration from the EHR
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Registrations</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500">
            {stats.patients} patients, {stats.authReps} auth reps
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Tokens</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {stats.issued + stats.scanned}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500">
            {stats.issued} issued, {stats.scanned} scanned
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Verified</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.verified}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500">
            Successfully completed registration
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Needs Attention</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {stats.expired + stats.revoked}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500">
            {stats.expired} expired, {stats.revoked} revoked
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Registration Records</CardTitle>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, phone, or token ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="scanned">Scanned</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="authorized-rep">Authorized Rep</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="text-sm text-gray-600">
            Showing {filteredRegistrations.length} of {registrations.length} registrations
          </div>

          {/* Registrations Table */}
          <div className="border rounded-lg">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead>Token ID</TableHead>
                    <TableHead>Patient/Representative</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        No registrations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">{reg.tokenId}</TableCell>
                        <TableCell>
                          <div>
                            <div>{reg.patientName}</div>
                            {reg.authRepRelationship && (
                              <div className="text-xs text-gray-500">{reg.authRepRelationship}</div>
                            )}
                            <div className="text-xs text-gray-500">{reg.patientEmail}</div>
                            <div className="text-xs text-gray-500">{reg.patientPhone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(reg.registrationType)}</TableCell>
                        <TableCell>{getStatusBadge(reg.status)}</TableCell>
                        <TableCell className="text-sm">
                          <div>{formatDate(reg.issuedDate)}</div>
                          <div className="text-xs text-gray-500">by {reg.issuedBy}</div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className={reg.status === 'expired' ? 'text-orange-600' : ''}>
                            {formatDate(reg.expirationDate)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{reg.location}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Expired Registrations Alert */}
      {stats.expired > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-1" />
              <div className="flex-1">
                <CardTitle className="text-lg text-orange-900">
                  {stats.expired} Expired Registration{stats.expired !== 1 ? 's' : ''}
                </CardTitle>
                <CardDescription className="text-orange-700 mt-1">
                  The following patients have expired registration tokens and may need new ones issued from the EHR
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {registrations
                .filter(r => r.status === 'expired')
                .map(reg => (
                  <div key={reg.id} className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{reg.patientName}</span>
                          {getTypeBadge(reg.registrationType)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Token: <span className="font-mono">{reg.tokenId}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Email: {reg.patientEmail} • Phone: {reg.patientPhone}
                        </div>
                        <div className="text-sm text-gray-600">
                          Expired: {formatDate(reg.expirationDate)} • Location: {reg.location}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gray-600">Issued by</div>
                        <div>{reg.issuedBy}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(reg.issuedDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Action Required:</strong> To resend registration invitations, please access the EHR system 
                and generate new QR codes/tokens for the patients listed above.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revoked Registrations Info */}
      {stats.revoked > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-1" />
              <div className="flex-1">
                <CardTitle className="text-lg text-red-900">
                  {stats.revoked} Revoked Registration{stats.revoked !== 1 ? 's' : ''}
                </CardTitle>
                <CardDescription className="text-red-700 mt-1">
                  These registrations were cancelled or invalidated
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {registrations
                .filter(r => r.status === 'revoked')
                .map(reg => (
                  <div key={reg.id} className="bg-white p-3 rounded-lg border border-red-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{reg.patientName}</span>
                          {getTypeBadge(reg.registrationType)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Token: <span className="font-mono">{reg.tokenId}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Email: {reg.patientEmail} • Phone: {reg.patientPhone}
                        </div>
                        <div className="text-sm text-red-600 mt-1">
                          <strong>Reason:</strong> {reg.revokedReason}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gray-600">Revoked by</div>
                        <div>{reg.revokedBy}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {reg.revokedDate && formatDate(reg.revokedDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
