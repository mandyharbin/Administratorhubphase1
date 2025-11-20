import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { GripVertical, Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';

export function RoutingPolicies() {
  const [roles, setRoles] = useState([
    { id: '1', name: 'Clinical', priority: 1, minScore: 0.75, color: 'bg-red-100 text-red-800' },
    { id: '2', name: 'Scheduling', priority: 2, minScore: 0.70, color: 'bg-blue-100 text-blue-800' },
    { id: '3', name: 'Billing', priority: 3, minScore: 0.70, color: 'bg-green-100 text-green-800' },
    { id: '4', name: 'General', priority: 4, minScore: 0.60, color: 'bg-gray-100 text-gray-800' },
  ]);

  const [destinations, setDestinations] = useState([
    { id: '1', role: 'Clinical', primary: 'EHR Queue - Clinical', secondary: 'Staff Mailbox - Nursing' },
    { id: '2', role: 'Scheduling', primary: 'EHR Queue - Front Desk', secondary: 'Phone Callback Request' },
    { id: '3', role: 'Billing', primary: 'Ticketing - Billing Dept', secondary: 'Shared Mailbox - Billing' },
  ]);

  const [editingRole, setEditingRole] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMinScore, setEditMinScore] = useState('0.70');

  const [editingDestination, setEditingDestination] = useState<any>(null);
  const [editDestDialogOpen, setEditDestDialogOpen] = useState(false);
  const [editPrimary, setEditPrimary] = useState('');
  const [editSecondary, setEditSecondary] = useState('');

  const [autoReplies, setAutoReplies] = useState({
    clinical: "I've identified this as a clinical question. Routing your message to our clinical team for review and response.",
    scheduling: "This sounds like a scheduling question. I'm sending your message to our front office team who can assist you with appointments.",
    billing: "I've identified this as a billing-related inquiry. Routing to our billing department for assistance.",
    general: "I'm not able to fully answer your question. Let me connect you with a staff member who can help you better."
  });

  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editReplyDialogOpen, setEditReplyDialogOpen] = useState(false);
  const [editReplyText, setEditReplyText] = useState('');
  const [editReplyName, setEditReplyName] = useState('');

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setEditMinScore(role.minScore.toString());
    setEditDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (editingRole) {
      setRoles(roles.map(r => 
        r.id === editingRole.id 
          ? { ...r, minScore: parseFloat(editMinScore) }
          : r
      ));
      setEditDialogOpen(false);
      setEditingRole(null);
    }
  };

  const handleEditDestination = (dest: any) => {
    setEditingDestination(dest);
    setEditPrimary(dest.primary);
    setEditSecondary(dest.secondary);
    setEditDestDialogOpen(true);
  };

  const handleSaveDestination = () => {
    if (editingDestination) {
      setDestinations(destinations.map(d => 
        d.id === editingDestination.id 
          ? { ...d, primary: editPrimary, secondary: editSecondary }
          : d
      ));
      setEditDestDialogOpen(false);
      setEditingDestination(null);
    }
  };

  const handleEditReply = (name: string) => {
    setEditingReply(name);
    setEditReplyText(autoReplies[name]);
    setEditReplyName(name);
    setEditReplyDialogOpen(true);
  };

  const handleSaveReply = () => {
    if (editingReply) {
      setAutoReplies({
        ...autoReplies,
        [editReplyName]: editReplyText
      });
      setEditReplyDialogOpen(false);
      setEditingReply(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Routing Policies</h2>
        <p className="text-gray-600 mt-1">Configure AI routing rules, thresholds, and escalation paths</p>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles">Roles & Priorities</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="auto-replies">Auto-Replies</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Routing Roles</CardTitle>
              <CardDescription>Standard routing roles with configurable priorities. Drag to reorder priority.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {roles.map((role, index) => (
                  <div
                    key={role.id}
                    className="flex items-center gap-3 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${role.color}`}>
                          {role.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Min score: {role.minScore}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Confidence Thresholds</CardTitle>
              <CardDescription>Set AI confidence levels for answering vs. routing to staff</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Answer Confidence Threshold</Label>
                    <span className="text-sm">0.80</span>
                  </div>
                  <Slider defaultValue={[80]} max={100} step={5} />
                  <p className="text-xs text-gray-500">
                    AI will attempt to answer if confidence is above this threshold. Below this, message will be routed to staff.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Minimum Role Score to Route</Label>
                    <span className="text-sm">0.70</span>
                  </div>
                  <Slider defaultValue={[70]} max={100} step={5} />
                  <p className="text-xs text-gray-500">
                    Minimum confidence needed to route to a specific role. Below this, routes to General.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Score Gap for Clarification</Label>
                    <span className="text-sm">0.15</span>
                  </div>
                  <Slider defaultValue={[15]} max={50} step={5} />
                  <p className="text-xs text-gray-500">
                    If top 2 roles are within this gap, AI will ask patient to clarify their request.
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm mb-4">Conflict Handling</h3>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm">Enable Score Gap Clarifier</div>
                    <div className="text-sm text-gray-500">Ask patient to clarify when top roles have similar scores</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="mt-3 p-4 border rounded-lg">
                  <Label htmlFor="clarify-prompt">Clarification Prompt</Label>
                  <Textarea 
                    id="clarify-prompt"
                    className="mt-2"
                    rows={3}
                    defaultValue="I can help with both billing and scheduling questions. Which would you like assistance with?"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button>Save Thresholds</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Routing Destinations</CardTitle>
              <CardDescription>Configure primary and fallback destinations for each standard role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {destinations.map((dest) => (
                  <div key={dest.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                            {dest.role}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 w-24">Primary:</span>
                            <span>{dest.primary}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 w-24">Fallback:</span>
                            <span>{dest.secondary}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditDestination(dest)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto-replies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Reply Messages</CardTitle>
              <CardDescription>Canned responses for each routing role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm">Clinical</Label>
                    <Button variant="outline" size="sm" onClick={() => handleEditReply('clinical')}>Edit</Button>
                  </div>
                  <Textarea 
                    rows={2}
                    value={autoReplies.clinical}
                    readOnly
                    className="text-sm"
                  />
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm">Scheduling</Label>
                    <Button variant="outline" size="sm" onClick={() => handleEditReply('scheduling')}>Edit</Button>
                  </div>
                  <Textarea 
                    rows={2}
                    value={autoReplies.scheduling}
                    readOnly
                    className="text-sm"
                  />
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm">Billing</Label>
                    <Button variant="outline" size="sm" onClick={() => handleEditReply('billing')}>Edit</Button>
                  </div>
                  <Textarea 
                    rows={2}
                    value={autoReplies.billing}
                    readOnly
                    className="text-sm"
                  />
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm">General / Unable to Answer</Label>
                    <Button variant="outline" size="sm" onClick={() => handleEditReply('general')}>Edit</Button>
                  </div>
                  <Textarea 
                    rows={2}
                    value={autoReplies.general}
                    readOnly
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button>Save Auto-Replies</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update the minimum score for this role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-min-score">Minimum Score</Label>
              <Input
                id="edit-min-score"
                type="number"
                step="0.01"
                value={editMinScore}
                onChange={(e) => setEditMinScore(e.target.value)}
              />
            </div>
          </div>
          <div className="pt-4">
            <Button onClick={handleSaveRole}>Save Role</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDestDialogOpen} onOpenChange={setEditDestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Destination</DialogTitle>
            <DialogDescription>Update the primary and secondary destinations for this role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-primary">Primary Destination</Label>
              <Input
                id="edit-primary"
                value={editPrimary}
                onChange={(e) => setEditPrimary(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-secondary">Secondary (Fallback) Destination</Label>
              <Input
                id="edit-secondary"
                value={editSecondary}
                onChange={(e) => setEditSecondary(e.target.value)}
              />
            </div>
          </div>
          <div className="pt-4">
            <Button onClick={handleSaveDestination}>Save Destination</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editReplyDialogOpen} onOpenChange={setEditReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Auto-Reply</DialogTitle>
            <DialogDescription>Update the auto-reply message for this role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-reply-text">Auto-Reply Text</Label>
              <Textarea
                id="edit-reply-text"
                value={editReplyText}
                onChange={(e) => setEditReplyText(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="pt-4">
            <Button onClick={handleSaveReply}>Save Auto-Reply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}