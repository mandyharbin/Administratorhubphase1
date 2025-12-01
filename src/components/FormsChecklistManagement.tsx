import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Users,
  MapPin,
  Calendar,
  AlertCircle,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Play
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { FormBuilderDialog } from './FormBuilderDialog';
import { FormViewDialog } from './FormViewDialog';

export function FormsChecklistManagement() {
  const [activeTab, setActiveTab] = useState<'forms' | 'checklists' | 'generate'>('forms');
  const [forms, setForms] = useState<any>(null);
  const [checklists, setChecklists] = useState<any>(null);
  const [providers, setProviders] = useState<any>(null);
  const [locations, setLocations] = useState<any>(null);
  const [taskInstances, setTaskInstances] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogMode, setCreateDialogMode] = useState<'form' | 'consent' | 'checklist'>('form');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [editingForm, setEditingForm] = useState<any>(null);

  // Load data from mock JSON files
  useEffect(() => {
    loadForms();
    loadChecklists();
    loadProviders();
    loadLocations();
  }, []);

  const loadForms = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/forms`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const data = await response.json();
      setForms(data);
    } catch (error) {
      console.error('Error loading forms:', error);
    }
  };

  const loadChecklists = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/checklists`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const data = await response.json();
      setChecklists(data);
    } catch (error) {
      console.error('Error loading checklists:', error);
    }
  };

  const loadProviders = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/providers`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/locations`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const generateTasksForPatient = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/task-instances`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const data = await response.json();
      setTaskInstances(data);
    } catch (error) {
      console.error('Error generating tasks:', error);
    }
  };

  // Filter forms based on search and category
  const filteredForms = forms?.forms?.filter((form: any) => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || form.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Filter checklists
  const filteredChecklists = checklists?.checklists?.filter((checklist: any) => {
    return checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           checklist.description.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Questionnaire': return 'bg-blue-100 text-blue-800';
      case 'Consent': return 'bg-purple-100 text-purple-800';
      case 'Screening': return 'bg-yellow-100 text-yellow-800';
      case 'Assessment': return 'bg-pink-100 text-pink-800';
      case 'Survey': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Forms & Checklist Management</h2>
        <p className="text-gray-600 mt-1">
          Manage questionnaires, consent forms, and patient checklists
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalog">Forms Catalog</TabsTrigger>
          <TabsTrigger value="checklists">Checklist Definitions</TabsTrigger>
          <TabsTrigger value="notifications">Staff Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search forms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option>All</option>
                  {forms?.categories?.map((category: string) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <Button
                  onClick={() => {
                    setCreateDialogOpen(true);
                    setCreateDialogMode('form');
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Form
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form: any) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {form.id}
                        </Badge>
                        <Badge className={getTypeColor(form.type)}>
                          {form.type}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{form.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {form.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Category:</span>
                      <Badge variant="outline">{form.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(form.status)}>
                        {form.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span>{form.version}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Est. Time:</span>
                      <span className="text-gray-900">{form.estimatedTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Questions:</span>
                      <span className="text-gray-900">{form.questions}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-500 mb-2">Required for:</div>
                    <div className="flex flex-wrap gap-1">
                      {form.requiredFor.map((req: string) => (
                        <Badge key={req} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-500 mb-2">Languages:</div>
                    <div className="flex gap-1">
                      {form.languages.map((lang: string) => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedForm(form);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditingForm(form);
                        setCreateDialogOpen(true);
                        setCreateDialogMode('form');
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 pt-2">
                    Updated {form.lastUpdated} by {form.createdBy}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="checklists" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search checklists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => {
                setCreateDialogOpen(true);
                setCreateDialogMode('checklist');
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Checklist
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredChecklists.map((checklist: any) => (
              <Card key={checklist.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{checklist.id}</Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {checklist.category}
                        </Badge>
                        <Badge className={getStatusColor(checklist.status)}>
                          {checklist.status}
                        </Badge>
                      </div>
                      <CardTitle>{checklist.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {checklist.description}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-600">Est. Time</div>
                      <div className="font-medium">{checklist.estimatedTime}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-gray-400" />
                      <span>{checklist.tasks.length} tasks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span>{checklist.tasks.filter((t: any) => t.required).length} required</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {checklist.tasks.map((task: any, index: number) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-gray-300 text-xs font-medium">
                          {task.order}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{task.title}</span>
                            {task.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {task.description}
                          </p>
                          {task.formName && (
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <FileText className="w-3 h-3 text-blue-600" />
                              <span className="text-blue-600">{task.formName}</span>
                              <span className="text-gray-400">({task.formId})</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            ~{task.estimatedTime}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2">Applies to:</div>
                    <div className="flex flex-wrap gap-2">
                      {checklist.appliesTo.map((type: string) => (
                        <Badge key={type} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Checklist
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500">
                    Created by {checklist.createdBy} • Last updated {checklist.lastUpdated}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Completion Notifications</CardTitle>
              <CardDescription>
                When patients complete their forms, a message is automatically sent to the staff inbox in the Unified Staff Portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900">How It Works</h3>
                    <ul className="mt-2 space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <span className="font-medium">1.</span>
                        <span>Patient completes checklist tasks in their mobile app</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium">2.</span>
                        <span>System automatically generates a staff notification message</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium">3.</span>
                        <span>Message appears in Unified Staff Portal inbox with patient details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium">4.</span>
                        <span>Staff can review completed forms and prepare for appointment</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Example Notification Messages */}
              <div>
                <h3 className="font-medium mb-4">Recent Form Completion Notifications</h3>
                <div className="space-y-3">
                  {/* Notification 1 - All Forms Complete */}
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">Patient Forms Completed</h4>
                            <Badge className="bg-green-100 text-green-800">Complete</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            <strong>John Smith</strong> has completed all required forms for their upcoming appointment
                          </p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Patient:</span>
                              <div className="font-medium">John Smith (MRN: 0001234)</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Appointment:</span>
                              <div className="font-medium">November 30, 2025 at 2:00 PM</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Provider:</span>
                              <div className="font-medium">Dr. Sarah Chen</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Location:</span>
                              <div className="font-medium">Main Campus</div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-sm font-medium mb-2">Completed Forms:</div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-green-50">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                New Patient Intake
                              </Badge>
                              <Badge variant="outline" className="bg-green-50">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Financial Consent
                              </Badge>
                              <Badge variant="outline" className="bg-green-50">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                HIPAA Privacy
                              </Badge>
                              <Badge variant="outline" className="bg-green-50">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                COVID-19 Screening
                              </Badge>
                              <Badge variant="outline" className="bg-green-50">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Insurance Card
                              </Badge>
                              <Badge variant="outline" className="bg-green-50">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Photo ID
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-3">
                            Completed on November 24, 2025 at 4:05 PM
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notification 2 - Partial Complete */}
                  <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">Partial Form Completion</h4>
                            <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            <strong>Emily Rodriguez</strong> has completed 3 of 5 required forms
                          </p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Patient:</span>
                              <div className="font-medium">Emily Rodriguez (MRN: 0001235)</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Appointment:</span>
                              <div className="font-medium">November 28, 2025 at 10:00 AM</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Provider:</span>
                              <div className="font-medium">Dr. Michael Torres</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Location:</span>
                              <div className="font-medium">Brandon Medical Center</div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm font-medium mb-2">Completed:</div>
                                <div className="space-y-1">
                                  <Badge variant="outline" className="bg-green-50 w-full justify-start">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    New Patient Intake
                                  </Badge>
                                  <Badge variant="outline" className="bg-green-50 w-full justify-start">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Financial Consent
                                  </Badge>
                                  <Badge variant="outline" className="bg-green-50 w-full justify-start">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Insurance Card
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium mb-2">Pending:</div>
                                <div className="space-y-1">
                                  <Badge variant="outline" className="bg-gray-50 w-full justify-start">
                                    <Clock className="w-3 h-3 mr-1" />
                                    HIPAA Privacy
                                  </Badge>
                                  <Badge variant="outline" className="bg-gray-50 w-full justify-start">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Photo ID
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-3">
                            Last updated on November 24, 2025 at 2:30 PM
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notification 3 - Needs Attention */}
                  <Card className="border-l-4 border-l-red-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">Forms Overdue</h4>
                            <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            <strong>Michael Johnson</strong> has not completed required forms. Appointment is in 2 days.
                          </p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Patient:</span>
                              <div className="font-medium">Michael Johnson (MRN: 0001236)</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Appointment:</span>
                              <div className="font-medium">November 26, 2025 at 3:30 PM</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Provider:</span>
                              <div className="font-medium">Dr. Lisa Wong</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Location:</span>
                              <div className="font-medium">Westshore Clinic</div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-sm font-medium mb-2">Outstanding Required Forms:</div>
                            <div className="space-y-1">
                              <Badge variant="outline" className="bg-red-50 w-full justify-start">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                New Patient Intake (Due: Nov 24)
                              </Badge>
                              <Badge variant="outline" className="bg-red-50 w-full justify-start">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Financial Consent (Due: Nov 24)
                              </Badge>
                              <Badge variant="outline" className="bg-red-50 w-full justify-start">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                HIPAA Privacy (Due: Nov 24)
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <Button size="sm" className="w-full">
                              <Users className="w-4 h-4 mr-2" />
                              Contact Patient
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Integration Info */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-base">Integration with Unified Staff Portal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>These notifications automatically appear in the <strong>Unified Staff Portal</strong> message inbox</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Staff can filter by completion status, provider, location, and urgency</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Clicking on a message opens the full patient record with completed forms</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Push notifications sent for overdue forms requiring staff follow-up</span>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <FormBuilderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode={createDialogMode}
        editingForm={editingForm}
      />
      <FormViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        form={selectedForm}
        onEdit={() => {
          setEditingForm(selectedForm);
          setViewDialogOpen(false);
          setCreateDialogOpen(true);
          setCreateDialogMode('form');
        }}
      />
    </div>
  );
}