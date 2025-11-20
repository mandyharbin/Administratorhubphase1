import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Pencil, Trash2, MapPin, Users, Shield, Eye, Mail, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { InviteEmailPreview } from './InviteEmailPreview';

export function OrganizationAccess() {
  const [locations, setLocations] = useState([
    { id: '1', name: 'Main Campus Medical Center', address: '123 Healthcare Ave, Medical City, CA 90210', phone: '(555) 123-4567', hours: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM', parking: 'Free parking in rear lot', wayfinding: 'Enter through main entrance', discoverable: true },
    { id: '2', name: 'West Branch Clinic', address: '456 Medical Dr, Westside, CA 90211', phone: '(555) 234-5678', hours: 'Mon-Fri 9AM-5PM', parking: 'Street parking available', wayfinding: 'Suite 200, 2nd floor', discoverable: true },
    { id: '3', name: 'North Clinic', address: '789 Health Blvd, Northtown, CA 90212', phone: '(555) 345-6789', hours: 'Mon-Fri 8AM-5PM', parking: 'Validated parking in building garage', wayfinding: 'Check in at reception desk', discoverable: true },
    { id: '4', name: 'South Pediatric Center', address: '321 Kids Way, Southville, CA 90213', phone: '(555) 456-7890', hours: 'Mon-Fri 7AM-7PM, Sat 9AM-1PM', parking: 'Family parking spots near entrance', wayfinding: 'Colorful entrance with balloons', discoverable: true },
    { id: '5', name: 'East Urgent Care', address: '654 Quick St, Eastside, CA 90214', phone: '(555) 567-8901', hours: 'Mon-Sun 8AM-8PM', parking: '24-hour parking lot', wayfinding: 'Follow red signs for Urgent Care', discoverable: true },
    { id: '6', name: 'Downtown Specialty Clinic', address: '987 Specialist Ave, Downtown, CA 90215', phone: '(555) 678-9012', hours: 'Mon-Thu 9AM-6PM, Fri 9AM-4PM', parking: 'Metered parking on street', wayfinding: 'Take elevator to 5th floor', discoverable: false },
  ]);

  const handleToggleDiscoverable = (locationId: string) => {
    setLocations(locations.map(loc => 
      loc.id === locationId ? { ...loc, discoverable: !loc.discoverable } : loc
    ));
  };

  const [users, setUsers] = useState([
    { id: '1', name: 'Dr. Sarah Johnson', email: 'sjohnson@clinic.com', role: 'Clinical (Provider)', status: 'Active', inviteStatus: 'Accepted' },
    { id: '2', name: 'Mike Chen', email: 'mchen@clinic.com', role: 'Admin', status: 'Active', inviteStatus: 'Accepted' },
    { id: '3', name: 'Emily Rodriguez', email: 'erodriguez@clinic.com', role: 'Scheduling/Front Office', status: 'Active', inviteStatus: 'Accepted' },
  ]);

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('');

  const handleCreateUser = () => {
    if (!newUserName || !newUserEmail || !newUserRole) {
      return;
    }

    const roleLabels: { [key: string]: string } = {
      'admin': 'Admin',
      'clinical': 'Clinical',
      'billing': 'Billing',
      'front-office': 'Front Office',
      'view-only': 'View Only'
    };

    const newUser = {
      id: String(users.length + 1),
      name: newUserName,
      email: newUserEmail,
      role: roleLabels[newUserRole] || newUserRole,
      status: 'Active',
      inviteStatus: 'Pending'
    };

    setUsers([...users, newUser]);
    
    // Show success toast with invite sent
    toast.success(`Invite sent to ${newUserEmail}`, {
      description: 'User will receive an email with instructions to access the Admin Hub'
    });
    
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('');
    setIsUserDialogOpen(false);
  };

  const handleResendInvite = (userId: string, email: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, inviteStatus: 'Pending' } : u
    ));
    toast.success(`Invite resent to ${email}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Organization & Access</h2>
        <p className="text-gray-600 mt-1">Manage your organization profile, locations, users, and permissions</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Organization Profile</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Legal and operational information for your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="legal-name">Legal Name</Label>
                <Input id="legal-name" defaultValue="Healthcare Partners Medical Group" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Time Zone</Label>
                <Select defaultValue="pst">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                    <SelectItem value="cst">Central Time (CT)</SelectItem>
                    <SelectItem value="est">Eastern Time (ET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Main Phone</Label>
                  <Input id="phone" defaultValue="(555) 100-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Primary Address</Label>
                  <Input id="address" defaultValue="123 Healthcare Avenue, Medical City, CA 90210" />
                </div>
              </div>

              <div className="pt-4">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Clinic Locations</CardTitle>
                  <CardDescription>Manage clinic sites with hours, contact info, and wayfinding</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Location
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Location</DialogTitle>
                      <DialogDescription>Enter the details for a new clinic location</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="location-name">Location Name</Label>
                        <Input id="location-name" placeholder="e.g., Main Clinic" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location-address">Address</Label>
                        <Input id="location-address" placeholder="Street address" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location-phone">Phone</Label>
                          <Input id="location-phone" placeholder="(555) 000-0000" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location-hours">Hours</Label>
                          <Input id="location-hours" placeholder="Mon-Fri 9AM-5PM" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parking">Parking Instructions</Label>
                        <Input id="parking" placeholder="e.g., Free parking in rear lot" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wayfinding">Wayfinding Notes</Label>
                        <Input id="wayfinding" placeholder="e.g., Enter through main entrance" />
                      </div>
                      <Button className="w-full">Add Location</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Parking Instructions</TableHead>
                    <TableHead>Wayfinding Notes</TableHead>
                    <TableHead className="w-[180px]">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span className="text-left">Discoverable in Patient App</span>
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>{location.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{location.address}</TableCell>
                      <TableCell className="text-sm">{location.phone}</TableCell>
                      <TableCell className="text-sm text-gray-600">{location.hours}</TableCell>
                      <TableCell className="text-sm text-gray-600">{location.parking}</TableCell>
                      <TableCell className="text-sm text-gray-600">{location.wayfinding}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id={`discoverable-${location.id}`}
                            checked={location.discoverable}
                            onCheckedChange={() => handleToggleDiscoverable(location.id)}
                          />
                          <Label 
                            htmlFor={`discoverable-${location.id}`}
                            className="text-xs text-gray-600 cursor-pointer"
                          >
                            {location.discoverable ? 'Visible' : 'Hidden'}
                          </Label>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Email Preview Info Banner */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm">New users receive an invitation email to set up their account</div>
                    <div className="text-xs text-gray-600 mt-0.5">The email includes a secure link to create their password and set up MFA</div>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Preview Invite Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="!max-w-[96vw] w-[96vw] max-h-[92vh] overflow-hidden p-6">
                    <DialogHeader>
                      <DialogTitle>User Invitation Email Preview</DialogTitle>
                      <DialogDescription>
                        This is what new users will see when they receive an invitation to join the Admin Hub
                      </DialogDescription>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[calc(92vh-120px)]">
                      <InviteEmailPreview />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Users & Roles</CardTitle>
                  <CardDescription>Manage staff access with role-based permissions</CardDescription>
                </div>
                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>Create a new user account with assigned role</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-name">Full Name</Label>
                        <Input 
                          id="user-name" 
                          placeholder="Enter full name" 
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-email">Email</Label>
                        <Input 
                          id="user-email" 
                          type="email" 
                          placeholder="email@clinic.com"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-role">Role</Label>
                        <Select value={newUserRole} onValueChange={setNewUserRole}>
                          <SelectTrigger id="user-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="clinical">Clinical</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="front-office">Front Office</SelectItem>
                            <SelectItem value="view-only">View Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full" onClick={handleCreateUser}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Invite & Create User
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                          {user.inviteStatus === 'Accepted' ? (
                            <Button variant="ghost" size="sm" onClick={() => handleResendInvite(user.id, user.email)}>
                              <Mail className="w-4 h-4 text-blue-500" />
                            </Button>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Granular Permissions</CardTitle>
              <CardDescription>Configure detailed access controls for each role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48" rowSpan={2}>Permission</TableHead>
                      <TableHead className="text-center border-l" colSpan={4}>Admin</TableHead>
                      <TableHead className="text-center border-l" colSpan={4}>Clinical</TableHead>
                      <TableHead className="text-center border-l" colSpan={4}>Billing</TableHead>
                      <TableHead className="text-center border-l" colSpan={4}>Front Office</TableHead>
                      <TableHead className="text-center border-l" colSpan={4}>View Only</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead className="text-center text-xs border-l">View</TableHead>
                      <TableHead className="text-center text-xs">Add</TableHead>
                      <TableHead className="text-center text-xs">Edit</TableHead>
                      <TableHead className="text-center text-xs">Delete</TableHead>
                      <TableHead className="text-center text-xs border-l">View</TableHead>
                      <TableHead className="text-center text-xs">Add</TableHead>
                      <TableHead className="text-center text-xs">Edit</TableHead>
                      <TableHead className="text-center text-xs">Delete</TableHead>
                      <TableHead className="text-center text-xs border-l">View</TableHead>
                      <TableHead className="text-center text-xs">Add</TableHead>
                      <TableHead className="text-center text-xs">Edit</TableHead>
                      <TableHead className="text-center text-xs">Delete</TableHead>
                      <TableHead className="text-center text-xs border-l">View</TableHead>
                      <TableHead className="text-center text-xs">Add</TableHead>
                      <TableHead className="text-center text-xs">Edit</TableHead>
                      <TableHead className="text-center text-xs">Delete</TableHead>
                      <TableHead className="text-center text-xs border-l">View</TableHead>
                      <TableHead className="text-center text-xs">Add</TableHead>
                      <TableHead className="text-center text-xs">Edit</TableHead>
                      <TableHead className="text-center text-xs">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="text-sm">Disclaimers</div>
                          <div className="text-xs text-gray-500">Patient-facing disclaimers</div>
                        </div>
                      </TableCell>
                      {/* Admin */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      {/* Clinical */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* Billing */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* Front Office */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* View Only */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="text-sm">Patient Notices</div>
                          <div className="text-xs text-gray-500">Patient notifications and announcements</div>
                        </div>
                      </TableCell>
                      {/* Admin */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      {/* Clinical */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* Billing */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* Front Office */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      {/* View Only */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="text-sm">Audit Logs</div>
                          <div className="text-xs text-gray-500">System audit trail and activity</div>
                        </div>
                      </TableCell>
                      {/* Admin */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* Clinical */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* Billing */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* Front Office */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* View Only */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="text-sm">Users</div>
                          <div className="text-xs text-gray-500">User accounts and roles</div>
                        </div>
                      </TableCell>
                      {/* Admin */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      {/* Clinical */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* Billing */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* Front Office */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* View Only */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="text-sm">Knowledge Sources</div>
                          <div className="text-xs text-gray-500">Knowledge base documents</div>
                        </div>
                      </TableCell>
                      {/* Admin */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      {/* Clinical */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      {/* Billing */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      {/* Front Office */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      {/* View Only */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="text-sm">Locations</div>
                          <div className="text-xs text-gray-500">Practice locations and facilities</div>
                        </div>
                      </TableCell>
                      {/* Admin */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      {/* Clinical */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* Billing */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      {/* Front Office */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      {/* View Only */}
                      <TableCell className="text-center border-l"><div className="flex justify-center"><input type="checkbox" defaultChecked className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                      <TableCell className="text-center"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="pt-4">
                <Button>Save Permission Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}