import { useState, useEffect } from 'react';
import { Plus, Download, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Lexicon {
  id: string;
  category: string;
  keywords: string[];
  phrases: string[];
  routeToRole: string;
  weight: number;
  isActive: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface RoutingPolicy {
  id: string;
  policyName: string;
  category: string;
  confidenceThreshold: number;
  routeToRole: string;
  requiresBusinessHours: boolean;
  slaMinutes: number;
  notificationMethods: string[];
  isActive: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function LexiconsRouting() {
  const [lexicons, setLexicons] = useState<Lexicon[]>([]);
  const [policies, setPolicies] = useState<RoutingPolicy[]>([]);
  const [isLexiconDialogOpen, setIsLexiconDialogOpen] = useState(false);
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const [editingLexicon, setEditingLexicon] = useState<Lexicon | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<RoutingPolicy | null>(null);
  const [activeTab, setActiveTab] = useState('lexicons');

  // Load data on mount
  useEffect(() => {
    loadLexicons();
    loadPolicies();
  }, []);

  const loadLexicons = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/lexicons`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setLexicons(data.lexicons || []);
      }
    } catch (error) {
      console.error('Error loading lexicons:', error);
    }
  };

  const loadPolicies = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/routing-policies`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies || []);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
    }
  };

  const saveLexicon = async (lexicon: Lexicon) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/lexicons`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lexicon),
        }
      );
      if (response.ok) {
        await loadLexicons();
        setIsLexiconDialogOpen(false);
        setEditingLexicon(null);
      }
    } catch (error) {
      console.error('Error saving lexicon:', error);
    }
  };

  const savePolicy = async (policy: RoutingPolicy) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/routing-policies`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(policy),
        }
      );
      if (response.ok) {
        await loadPolicies();
        setIsPolicyDialogOpen(false);
        setEditingPolicy(null);
      }
    } catch (error) {
      console.error('Error saving policy:', error);
    }
  };

  const deleteLexicon = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/lexicons/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (response.ok) {
        await loadLexicons();
      }
    } catch (error) {
      console.error('Error deleting lexicon:', error);
    }
  };

  const deletePolicy = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/routing-policies/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (response.ok) {
        await loadPolicies();
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  const exportToJSON = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/export-config`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting config:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Lexicons & Routing</h2>
          <p className="text-gray-500 mt-1">
            Configure detection lexicons and routing policies for the AI Assistant
          </p>
        </div>
        <Button onClick={exportToJSON} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export JSON
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lexicons">Detection Lexicons</TabsTrigger>
          <TabsTrigger value="policies">Routing Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="lexicons" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Define keywords and phrases to categorize patient inquiries
            </p>
            <Button onClick={() => setIsLexiconDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lexicon
            </Button>
          </div>

          <div className="grid gap-4">
            {lexicons.map((lexicon) => (
              <div
                key={lexicon.id}
                className="border border-gray-200 rounded-lg p-4 bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-gray-900">{lexicon.category}</h3>
                      <Badge variant={lexicon.isActive ? 'default' : 'secondary'}>
                        {lexicon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        Route to: {lexicon.routeToRole}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Keywords: </span>
                        <span className="text-sm text-gray-900">
                          {lexicon.keywords.join(', ')}
                        </span>
                      </div>
                      {lexicon.phrases.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600">Phrases: </span>
                          <span className="text-sm text-gray-900">
                            "{lexicon.phrases.join('", "')}"
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-600">Weight: </span>
                        <span className="text-sm text-gray-900">{lexicon.weight}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingLexicon(lexicon);
                        setIsLexiconDialogOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteLexicon(lexicon.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {lexicons.length === 0 && (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No lexicons configured yet</p>
                <Button
                  variant="link"
                  onClick={() => setIsLexiconDialogOpen(true)}
                  className="mt-2"
                >
                  Create your first lexicon
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Configure routing rules for escalating to staff
            </p>
            <Button onClick={() => setIsPolicyDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Policy
            </Button>
          </div>

          <div className="grid gap-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="border border-gray-200 rounded-lg p-4 bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-gray-900">{policy.policyName}</h3>
                      <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Category: </span>
                        <span className="text-sm text-gray-900">{policy.category}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Route to: </span>
                        <span className="text-sm text-gray-900">{policy.routeToRole}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Confidence Threshold: </span>
                        <span className="text-sm text-gray-900">
                          {(policy.confidenceThreshold * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">SLA: </span>
                        <span className="text-sm text-gray-900">
                          {policy.slaMinutes} minutes
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Business Hours: </span>
                        <span className="text-sm text-gray-900">
                          {policy.requiresBusinessHours ? 'Required' : 'Not Required'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Notifications: </span>
                        <span className="text-sm text-gray-900">
                          {policy.notificationMethods.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPolicy(policy);
                        setIsPolicyDialogOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePolicy(policy.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {policies.length === 0 && (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No routing policies configured yet</p>
                <Button
                  variant="link"
                  onClick={() => setIsPolicyDialogOpen(true)}
                  className="mt-2"
                >
                  Create your first policy
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <LexiconDialog
        open={isLexiconDialogOpen}
        onOpenChange={setIsLexiconDialogOpen}
        lexicon={editingLexicon}
        onSave={saveLexicon}
        onClose={() => {
          setIsLexiconDialogOpen(false);
          setEditingLexicon(null);
        }}
      />

      <PolicyDialog
        open={isPolicyDialogOpen}
        onOpenChange={setIsPolicyDialogOpen}
        policy={editingPolicy}
        onSave={savePolicy}
        onClose={() => {
          setIsPolicyDialogOpen(false);
          setEditingPolicy(null);
        }}
      />
    </div>
  );
}

function LexiconDialog({
  open,
  onOpenChange,
  lexicon,
  onSave,
  onClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lexicon: Lexicon | null;
  onSave: (lexicon: Lexicon) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Lexicon>(
    lexicon || {
      id: crypto.randomUUID(),
      category: '',
      keywords: [],
      phrases: [],
      routeToRole: 'admin',
      weight: 0.8,
      isActive: true,
      created_by: '',
      created_at: '',
      updated_at: '',
    }
  );

  useEffect(() => {
    if (lexicon) {
      setFormData(lexicon);
    } else {
      setFormData({
        id: crypto.randomUUID(),
        category: '',
        keywords: [],
        phrases: [],
        routeToRole: 'admin',
        weight: 0.8,
        isActive: true,
        created_by: '',
        created_at: '',
        updated_at: '',
      });
    }
  }, [lexicon, open]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lexicon ? 'Edit Lexicon' : 'Add Lexicon'}</DialogTitle>
          <DialogDescription>
            Configure keywords and phrases to detect patient inquiry categories
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input
              placeholder="e.g., billing, scheduling, clinical"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Keywords (comma-separated)</Label>
            <Textarea
              placeholder="bill, payment, charge, balance, owe, invoice"
              value={formData.keywords.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Phrases (comma-separated)</Label>
            <Textarea
              placeholder="payment plan, how much do I owe, insurance coverage"
              value={formData.phrases.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phrases: e.target.value.split(',').map((p) => p.trim()).filter(Boolean),
                })
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Route to Role</Label>
              <Select
                value={formData.routeToRole}
                onValueChange={(value) => setFormData({ ...formData, routeToRole: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="scheduling">Scheduling</SelectItem>
                  <SelectItem value="clinical">Clinical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Weight (0.0 - 1.0)</Label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Lexicon</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PolicyDialog({
  open,
  onOpenChange,
  policy,
  onSave,
  onClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: RoutingPolicy | null;
  onSave: (policy: RoutingPolicy) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<RoutingPolicy>(
    policy || {
      id: crypto.randomUUID(),
      policyName: '',
      category: '',
      confidenceThreshold: 0.75,
      routeToRole: 'admin',
      requiresBusinessHours: false,
      slaMinutes: 30,
      notificationMethods: ['push', 'email'],
      isActive: true,
      created_by: '',
      created_at: '',
      updated_at: '',
    }
  );

  useEffect(() => {
    if (policy) {
      setFormData(policy);
    } else {
      setFormData({
        id: crypto.randomUUID(),
        policyName: '',
        category: '',
        confidenceThreshold: 0.75,
        routeToRole: 'admin',
        requiresBusinessHours: false,
        slaMinutes: 30,
        notificationMethods: ['push', 'email'],
        isActive: true,
        created_by: '',
        created_at: '',
        updated_at: '',
      });
    }
  }, [policy, open]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{policy ? 'Edit Routing Policy' : 'Add Routing Policy'}</DialogTitle>
          <DialogDescription>
            Configure rules for routing patient inquiries to staff
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Policy Name</Label>
            <Input
              placeholder="e.g., Billing Routing Policy"
              value={formData.policyName}
              onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              placeholder="e.g., billing, scheduling, clinical"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Confidence Threshold</Label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={formData.confidenceThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confidenceThreshold: parseFloat(e.target.value),
                  })
                }
              />
              <p className="text-xs text-gray-500">
                Route to staff if AI confidence is below this threshold
              </p>
            </div>

            <div className="space-y-2">
              <Label>SLA (minutes)</Label>
              <Input
                type="number"
                min="1"
                value={formData.slaMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, slaMinutes: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Route to Role</Label>
            <Select
              value={formData.routeToRole}
              onValueChange={(value) => setFormData({ ...formData, routeToRole: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="scheduling">Scheduling</SelectItem>
                <SelectItem value="clinical">Clinical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notification Methods</Label>
            <div className="flex gap-3">
              {['push', 'sms', 'email'].map((method) => (
                <label key={method} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.notificationMethods.includes(method)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          notificationMethods: [...formData.notificationMethods, method],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          notificationMethods: formData.notificationMethods.filter(
                            (m) => m !== method
                          ),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{method}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresBusinessHours"
              checked={formData.requiresBusinessHours}
              onChange={(e) =>
                setFormData({ ...formData, requiresBusinessHours: e.target.checked })
              }
              className="rounded"
            />
            <Label htmlFor="requiresBusinessHours">Requires Business Hours</Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="policyActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="policyActive">Active</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Policy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}