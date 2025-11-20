import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Upload, FileText, Pencil, Trash2, Settings, Download, Eye, Building2, Users, Sparkles, Info, GitBranch, History, Globe, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Practice {
  id: string;
  name: string;
  organizationId: string;
  locationCount: number;
  locations: Array<{
    id: string;
    name: string;
    address: string;
    phone: string;
  }>;
  useMedlinePlus: boolean;
  knowledgeSourceCount: number;
  lastUpdated: string;
}

interface Organization {
  id: string;
  name: string;
  practiceCount: number;
}

interface KnowledgeSource {
  id: string;
  organizationId: string;
  appliesTo: 'all' | string[];
  question: string;
  answer: string;
  category: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  versionHistory: VersionHistory[];
  tags: string[];
  languages: string[];
}

interface VersionHistory {
  version: string;
  updatedAt: string;
  updatedBy: string;
  changes: string;
}

export function TenantKnowledgeHub() {
  const [selectedPractice, setSelectedPractice] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [editSourceOpen, setEditSourceOpen] = useState(false);
  const [managePracticesOpen, setManagePracticesOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [testResponseOpen, setTestResponseOpen] = useState(false);
  const [currentSource, setCurrentSource] = useState<KnowledgeSource | null>(null);

  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [practices, setPractices] = useState<Practice[]>([
    {
      id: 'practice-001',
      name: 'Main Street Family Practice',
      organizationId: 'org-001',
      locationCount: 3,
      locations: [
        { id: 'loc-001', name: 'Main Street Clinic', address: '123 Main St, Anytown, ST 12345', phone: '(555) 123-4567' },
        { id: 'loc-002', name: 'Downtown Clinic', address: '456 Elm St, Anytown, ST 12345', phone: '(555) 234-5678' },
        { id: 'loc-003', name: 'Westside Clinic', address: '789 Oak St, Anytown, ST 12345', phone: '(555) 345-6789' }
      ],
      useMedlinePlus: true,
      knowledgeSourceCount: 24,
      lastUpdated: 'Nov 18, 2025'
    },
    {
      id: 'practice-002',
      name: 'Downtown Medical Center',
      organizationId: 'org-001',
      locationCount: 5,
      locations: [
        { id: 'loc-004', name: 'Downtown Main', address: '100 Center St, Anytown, ST 12345', phone: '(555) 111-2222' },
        { id: 'loc-005', name: 'Eastside Clinic', address: '101 Maple St, Anytown, ST 12345', phone: '(555) 222-3333' },
        { id: 'loc-006', name: 'Westside Branch', address: '789 Oak St, Anytown, ST 12345', phone: '(555) 333-4444' },
        { id: 'loc-007', name: 'Northside Clinic', address: '202 Pine St, Anytown, ST 12345', phone: '(555) 444-5555' },
        { id: 'loc-008', name: 'Southside Clinic', address: '303 Birch St, Anytown, ST 12345', phone: '(555) 555-6666' }
      ],
      useMedlinePlus: true,
      knowledgeSourceCount: 31,
      lastUpdated: 'Nov 17, 2025'
    },
    {
      id: 'practice-003',
      name: 'Westside Pediatrics',
      organizationId: 'org-001',
      locationCount: 2,
      locations: [
        { id: 'loc-009', name: 'Westside Main', address: '500 Pediatric Way, Anytown, ST 12345', phone: '(555) 666-7777' },
        { id: 'loc-010', name: 'Northside Kids', address: '202 Pine St, Anytown, ST 12345', phone: '(555) 777-8888' }
      ],
      useMedlinePlus: false,
      knowledgeSourceCount: 18,
      lastUpdated: 'Nov 15, 2025'
    },
    {
      id: 'practice-004',
      name: 'Eastside Urgent Care',
      organizationId: 'org-001',
      locationCount: 4,
      locations: [
        { id: 'loc-011', name: 'Eastside Main', address: '600 Urgent Dr, Anytown, ST 12345', phone: '(555) 888-9999' },
        { id: 'loc-012', name: 'Northside UC', address: '700 Quick St, Anytown, ST 12345', phone: '(555) 999-0000' },
        { id: 'loc-013', name: 'Southside UC', address: '800 Fast Ln, Anytown, ST 12345', phone: '(555) 101-1111' },
        { id: 'loc-014', name: 'Westside UC', address: '900 Rapid Ave, Anytown, ST 12345', phone: '(555) 111-1212' }
      ],
      useMedlinePlus: true,
      knowledgeSourceCount: 15,
      lastUpdated: 'Nov 16, 2025'
    },
    {
      id: 'practice-005',
      name: 'Northside Specialty Care',
      organizationId: 'org-001',
      locationCount: 2,
      locations: [
        { id: 'loc-015', name: 'Northside Main', address: '1000 Specialty Blvd, Anytown, ST 12345', phone: '(555) 121-1313' },
        { id: 'loc-016', name: 'Downtown Specialty', address: '1100 Expert St, Anytown, ST 12345', phone: '(555) 131-1414' }
      ],
      useMedlinePlus: true,
      knowledgeSourceCount: 22,
      lastUpdated: 'Nov 18, 2025'
    },
    {
      id: 'practice-006',
      name: 'Southside Womens Health',
      organizationId: 'org-001',
      locationCount: 3,
      locations: [
        { id: 'loc-017', name: 'Southside Main', address: '1200 Womens Way, Anytown, ST 12345', phone: '(555) 141-1515' },
        { id: 'loc-018', name: 'Eastside Women', address: '1300 Care Ct, Anytown, ST 12345', phone: '(555) 151-1616' },
        { id: 'loc-019', name: 'Westside Women', address: '1400 Health Ave, Anytown, ST 12345', phone: '(555) 161-1717' }
      ],
      useMedlinePlus: true,
      knowledgeSourceCount: 19,
      lastUpdated: 'Nov 17, 2025'
    }
  ]);

  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newTags, setNewTags] = useState('');
  const [newLanguages, setNewLanguages] = useState<string[]>(['en']);
  const [newAppliesTo, setNewAppliesTo] = useState<'all' | 'specific'>('all');
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);

  const [testMessages, setTestMessages] = useState<Array<{sender: string, content: string}>>([]);
  const [testInput, setTestInput] = useState('');
  const [isTestLoading, setIsTestLoading] = useState(false);

  useEffect(() => {
    loadKnowledgeSources();
  }, []);

  const loadKnowledgeSources = () => {
    const demoSources: KnowledgeSource[] = [
      {
        id: 'ks-001',
        organizationId: 'org-001',
        appliesTo: 'all',
        question: 'What are your office hours?',
        answer: 'Monday-Friday: 7:00 AM - 7:00 PM, Saturday: 9:00 AM - 1:00 PM, Sunday: Closed',
        category: 'general',
        version: '2.1',
        status: 'active',
        createdBy: 'admin@practice.com',
        createdAt: 'Oct 15, 2025',
        updatedAt: 'Nov 10, 2025',
        versionHistory: [
          { version: '2.1', updatedAt: 'Nov 10, 2025', updatedBy: 'admin@practice.com', changes: 'Extended Saturday hours' },
          { version: '2.0', updatedAt: 'Sep 5, 2025', updatedBy: 'admin@practice.com', changes: 'Added weekend hours' },
          { version: '1.0', updatedAt: 'Oct 15, 2025', updatedBy: 'admin@practice.com', changes: 'Initial version' }
        ],
        tags: ['hours', 'schedule', 'availability'],
        languages: ['en', 'es']
      },
      {
        id: 'ks-002',
        organizationId: 'org-001',
        appliesTo: 'all',
        question: 'What insurance do you accept?',
        answer: 'We accept most major insurance plans including Blue Cross Blue Shield, Aetna, United Healthcare, Cigna, Medicare, and Medicaid. Please call our billing department at (555) 123-4567 to verify your specific plan.',
        category: 'billing',
        version: '3.0',
        status: 'active',
        createdBy: 'billing@practice.com',
        createdAt: 'Oct 15, 2025',
        updatedAt: 'Nov 15, 2025',
        versionHistory: [
          { version: '3.0', updatedAt: 'Nov 15, 2025', updatedBy: 'billing@practice.com', changes: 'Added Medicaid' },
          { version: '2.0', updatedAt: 'Oct 25, 2025', updatedBy: 'billing@practice.com', changes: 'Updated insurance list' },
          { version: '1.0', updatedAt: 'Oct 15, 2025', updatedBy: 'billing@practice.com', changes: 'Initial version' }
        ],
        tags: ['insurance', 'billing', 'payment'],
        languages: ['en', 'es']
      },
      {
        id: 'ks-003',
        organizationId: 'org-001',
        appliesTo: 'all',
        question: 'What is your cancellation policy?',
        answer: 'We require at least 24 hours notice for appointment cancellations. Late cancellations or no-shows may result in a $50 fee. To cancel, please call us at (555) 123-4567 or use the patient portal.',
        category: 'scheduling',
        version: '2.0',
        status: 'active',
        createdBy: 'scheduling@practice.com',
        createdAt: 'Oct 15, 2025',
        updatedAt: 'Nov 1, 2025',
        versionHistory: [
          { version: '2.0', updatedAt: 'Nov 1, 2025', updatedBy: 'scheduling@practice.com', changes: 'Updated cancellation fee from $35 to $50' },
          { version: '1.0', updatedAt: 'Oct 15, 2025', updatedBy: 'scheduling@practice.com', changes: 'Initial version' }
        ],
        tags: ['cancellation', 'policy', 'appointments'],
        languages: ['en']
      },
      {
        id: 'ks-004',
        organizationId: 'org-001',
        appliesTo: ['practice-003'],
        question: 'Do you offer well-child visits?',
        answer: 'Yes! We provide comprehensive well-child visits for ages 0-18 including growth monitoring, developmental screenings, immunizations, and age-appropriate health education.',
        category: 'clinical',
        version: '1.0',
        status: 'active',
        createdBy: 'pediatric@practice.com',
        createdAt: 'Nov 10, 2025',
        updatedAt: 'Nov 10, 2025',
        versionHistory: [
          { version: '1.0', updatedAt: 'Nov 10, 2025', updatedBy: 'pediatric@practice.com', changes: 'Initial version' }
        ],
        tags: ['pediatrics', 'well-child', 'preventive'],
        languages: ['en', 'es']
      },
      {
        id: 'ks-005',
        organizationId: 'org-001',
        appliesTo: ['practice-004'],
        question: 'Do I need an appointment for urgent care?',
        answer: 'No appointment necessary! We accept walk-ins 7 days a week from 8:00 AM to 8:00 PM. You can also check in online to save time.',
        category: 'scheduling',
        version: '1.1',
        status: 'active',
        createdBy: 'urgent@practice.com',
        createdAt: 'Nov 5, 2025',
        updatedAt: 'Nov 12, 2025',
        versionHistory: [
          { version: '1.1', updatedAt: 'Nov 12, 2025', updatedBy: 'urgent@practice.com', changes: 'Added online check-in info' },
          { version: '1.0', updatedAt: 'Nov 5, 2025', updatedBy: 'urgent@practice.com', changes: 'Initial version' }
        ],
        tags: ['urgent care', 'walk-in', 'appointment'],
        languages: ['en']
      }
    ];
    setKnowledgeSources(demoSources);
  };

  const getFilteredSources = () => {
    let sources = knowledgeSources.filter(s => s.status === 'active');
    
    // Filter by practice
    if (selectedPractice !== 'all') {
      sources = sources.filter(s => 
        s.appliesTo === 'all' || (Array.isArray(s.appliesTo) && s.appliesTo.includes(selectedPractice))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      sources = sources.filter(s => s.category === selectedCategory);
    }
    
    return sources;
  };

  const getCurrentPractice = () => {
    return practices.find(p => p.id === selectedPractice);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: 'bg-blue-100 text-blue-700',
      billing: 'bg-green-100 text-green-700',
      scheduling: 'bg-purple-100 text-purple-700',
      clinical: 'bg-orange-100 text-orange-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const handleToggleMedlinePlus = (practiceId: string, enabled: boolean) => {
    setPractices(practices.map(p => 
      p.id === practiceId ? { ...p, useMedlinePlus: enabled } : p
    ));
  };

  const handleAddSource = () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      const newSource: KnowledgeSource = {
        id: `ks-${Date.now()}`,
        organizationId: 'org-001',
        appliesTo: newAppliesTo === 'all' ? 'all' : selectedPractices,
        question: newQuestion,
        answer: newAnswer,
        category: newCategory,
        version: '1.0',
        status: 'active',
        createdBy: 'admin@practice.com',
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        versionHistory: [{
          version: '1.0',
          updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          updatedBy: 'admin@practice.com',
          changes: 'Initial version'
        }],
        tags: newTags.split(',').map(t => t.trim()).filter(t => t),
        languages: newLanguages
      };
      setKnowledgeSources([...knowledgeSources, newSource]);
      resetForm();
      setAddSourceOpen(false);
    }
  };

  const handleEditSource = (source: KnowledgeSource) => {
    setCurrentSource(source);
    setNewQuestion(source.question);
    setNewAnswer(source.answer);
    setNewCategory(source.category);
    setNewTags(source.tags.join(', '));
    setNewLanguages(source.languages);
    setNewAppliesTo(source.appliesTo === 'all' ? 'all' : 'specific');
    setSelectedPractices(Array.isArray(source.appliesTo) ? source.appliesTo : []);
    setEditSourceOpen(true);
  };

  const handleSaveSource = () => {
    if (currentSource && newQuestion.trim() && newAnswer.trim()) {
      const previousVersion = currentSource.version;
      const versionParts = previousVersion.split('.');
      const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}`;
      
      const updatedSource = {
        ...currentSource,
        question: newQuestion,
        answer: newAnswer,
        category: newCategory,
        appliesTo: newAppliesTo === 'all' ? 'all' as const : selectedPractices,
        version: newVersion,
        updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        versionHistory: [
          {
            version: newVersion,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            updatedBy: 'admin@practice.com',
            changes: 'Updated content'
          },
          ...currentSource.versionHistory
        ],
        tags: newTags.split(',').map(t => t.trim()).filter(t => t),
        languages: newLanguages
      };
      
      setKnowledgeSources(knowledgeSources.map(s => 
        s.id === currentSource.id ? updatedSource : s
      ));
      
      setEditSourceOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setCurrentSource(null);
    setNewQuestion('');
    setNewAnswer('');
    setNewCategory('general');
    setNewTags('');
    setNewLanguages(['en']);
    setNewAppliesTo('all');
    setSelectedPractices([]);
  };

  const handleDeleteSource = (id: string) => {
    setKnowledgeSources(knowledgeSources.filter(s => s.id !== id));
  };

  const handleTogglePractice = (practiceId: string) => {
    setSelectedPractices(prev => 
      prev.includes(practiceId) 
        ? prev.filter(id => id !== practiceId)
        : [...prev, practiceId]
    );
  };

  const getPracticeNames = (appliesTo: 'all' | string[]) => {
    if (appliesTo === 'all') return 'All Practices';
    return practices
      .filter(p => appliesTo.includes(p.id))
      .map(p => p.name)
      .join(', ');
  };

  const handleSendTestMessage = async (message?: string) => {
    const messageToSend = message || testInput;
    if (!messageToSend.trim()) return;

    const userMessage = { sender: 'patient', content: messageToSend };
    setTestMessages(prev => [...prev, userMessage]);
    setTestInput('');
    setIsTestLoading(true);

    try {
      const currentPractice = getCurrentPractice();
      const knowledgeBase = getFilteredSources().map(s => ({
        question: s.question,
        answer: s.answer,
        category: s.category,
        version: s.version
      }));

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/chat-tenant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          tenantId: selectedPractice === 'all' ? 'org-001' : selectedPractice,
          userMessage: messageToSend,
          messages: testMessages,
          patientContext: null,
          knowledgeBase: knowledgeBase,
          useMedlinePlus: currentPractice?.useMedlinePlus || false,
          locations: currentPractice?.locations || []
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get AI response: ${response.statusText}`);
      }

      const data = await response.json();
      const aiMessage = { sender: 'ai', content: data.response };
      setTestMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error testing AI:', error);
      const errorMessage = { 
        sender: 'ai', 
        content: 'Sorry, I encountered an error processing your message. Please try again.' 
      };
      setTestMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleQuickTest = (question: string) => {
    setTestInput(question);
    handleSendTestMessage(question);
  };

  const handleResetTestChat = () => {
    setTestMessages([]);
    setTestInput('');
  };

  const filteredSources = getFilteredSources();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2>Healthcare Partners Medical Group</h2>
          </div>
          <p className="text-gray-600">Manage knowledge sources across 6 practices</p>
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-xs text-gray-600 mb-2 block">Select Practice</Label>
              <Select value={selectedPractice} onValueChange={setSelectedPractice}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>All Practices</span>
                      <Badge variant="outline" className="ml-2">Organization-wide</Badge>
                    </div>
                  </SelectItem>
                  {practices.map(practice => (
                    <SelectItem key={practice.id} value={practice.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{practice.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={managePracticesOpen} onOpenChange={setManagePracticesOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Practices
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Manage Practice Settings</DialogTitle>
                  <DialogDescription>Configure MedlinePlus integration for each practice</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {practices.map(practice => (
                    <Card key={practice.id}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="w-5 h-5 text-blue-600" />
                              <div>{practice.name}</div>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>{practice.locationCount} locations</div>
                              <div>{practice.knowledgeSourceCount} knowledge sources</div>
                              <div>Last updated: {practice.lastUpdated}</div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-end gap-2">
                              <Label className="text-xs text-gray-600">MedlinePlus</Label>
                              <Switch 
                                checked={practice.useMedlinePlus}
                                onCheckedChange={(checked) => handleToggleMedlinePlus(practice.id, checked)}
                              />
                            </div>
                            {practice.useMedlinePlus && (
                              <Badge className="bg-blue-100 text-blue-700">
                                <Globe className="w-3 h-3 mr-1" />
                                Enabled
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-gray-700">
                        <div className="mb-1"><strong>MedlinePlus Integration</strong></div>
                        <div>When enabled, the AI can search MedlinePlus for trusted health education content from the U.S. National Library of Medicine to supplement your knowledge base.</div>
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => setManagePracticesOpen(false)} className="w-full">
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={() => setTestResponseOpen(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Test AI Response
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm mb-2">
                {selectedPractice === 'all' 
                  ? <><strong>Viewing All Practices:</strong> Knowledge sources can apply to all practices or be practice-specific</>
                  : <><strong>Viewing {getCurrentPractice()?.name}:</strong> Showing org-wide + practice-specific knowledge sources</>
                }
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="flex items-start gap-2">
                  <GitBranch className="w-3 h-3 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="mb-0.5"><strong>Versioning</strong></div>
                    <div className="text-gray-700">Track all changes with version history</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="w-3 h-3 mt-0.5 text-purple-600 flex-shrink-0" />
                  <div>
                    <div className="mb-0.5"><strong>Multi-Practice</strong></div>
                    <div className="text-gray-700">Apply FAQs to all or specific practices</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Globe className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="mb-0.5"><strong>MedlinePlus</strong></div>
                    <div className="text-gray-700">Optional per-practice health education</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredSources.length} knowledge source{filteredSources.length !== 1 ? 's' : ''}
        </div>
        <div className="flex gap-2">
          <Dialog open={addSourceOpen} onOpenChange={(open) => { setAddSourceOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Knowledge Source
              </Button>
            </DialogTrigger>
          </Dialog>

          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/5">Question</TableHead>
                    <TableHead className="w-24">Category</TableHead>
                    <TableHead className="w-32">Applies To</TableHead>
                    <TableHead className="w-20">Version</TableHead>
                    <TableHead className="w-28">Updated</TableHead>
                    <TableHead className="text-right w-28">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSources.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No knowledge sources found for this selection
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSources.map(source => (
                      <TableRow key={source.id}>
                        <TableCell className="max-w-md">
                          <div>
                            <div className="text-sm mb-1">{source.question}</div>
                            <div className="text-xs text-gray-600 whitespace-normal">{source.answer}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(source.category)}>
                            {source.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {source.appliesTo === 'all' ? (
                            <Badge variant="outline">
                              <Building2 className="w-3 h-3 mr-1" />
                              All Practices
                            </Badge>
                          ) : (
                            <div className="text-xs text-gray-600">
                              {Array.isArray(source.appliesTo) && source.appliesTo.length} practice{Array.isArray(source.appliesTo) && source.appliesTo.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            <GitBranch className="w-3 h-3" />
                            v{source.version}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">{source.updatedAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setCurrentSource(source);
                                setVersionHistoryOpen(true);
                              }}
                            >
                              <History className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditSource(source)}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSource(source.id)}>
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Source Dialog Content */}
      <Dialog open={addSourceOpen} onOpenChange={(open) => { setAddSourceOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Knowledge Source</DialogTitle>
            <DialogDescription>Create a new FAQ for your AI assistant (v1.0)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <Label>Apply To</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="apply-all"
                    checked={newAppliesTo === 'all'}
                    onCheckedChange={(checked) => {
                      setNewAppliesTo(checked ? 'all' : 'specific');
                      if (checked) setSelectedPractices([]);
                    }}
                  />
                  <Label htmlFor="apply-all" className="cursor-pointer">
                    All Practices <Badge variant="outline" className="ml-2">Organization-wide</Badge>
                  </Label>
                </div>
                
                {newAppliesTo === 'specific' && (
                  <div className="ml-6 space-y-2 mt-3">
                    <div className="text-xs text-gray-600 mb-2">Select specific practices:</div>
                    {practices.map(practice => (
                      <div key={practice.id} className="flex items-center gap-2">
                        <Checkbox 
                          id={`practice-${practice.id}`}
                          checked={selectedPractices.includes(practice.id)}
                          onCheckedChange={() => handleTogglePractice(practice.id)}
                        />
                        <Label htmlFor={`practice-${practice.id}`} className="cursor-pointer text-sm">
                          {practice.name}
                        </Label>
                      </div>
                    ))}
                    {newAppliesTo === 'specific' && selectedPractices.length === 0 && (
                      <div className="flex items-center gap-2 text-xs text-orange-600 mt-2">
                        <AlertCircle className="w-3 h-3" />
                        <span>Please select at least one practice</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="scheduling">Scheduling</SelectItem>
                  <SelectItem value="clinical">Clinical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Question</Label>
              <Input 
                placeholder="What question will patients ask?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea 
                rows={5}
                placeholder="Provide the answer the AI should give"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input 
                placeholder="e.g., hours, schedule, availability"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleAddSource} 
                className="flex-1"
                disabled={newAppliesTo === 'specific' && selectedPractices.length === 0}
              >
                Create Knowledge Source
              </Button>
              <Button variant="outline" onClick={() => { setAddSourceOpen(false); resetForm(); }} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Source Dialog */}
      <Dialog open={editSourceOpen} onOpenChange={(open) => { setEditSourceOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Source</DialogTitle>
            <DialogDescription>
              Update will create version {currentSource ? `${currentSource.version.split('.')[0]}.${parseInt(currentSource.version.split('.')[1]) + 1}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <Label>Apply To</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="edit-apply-all"
                    checked={newAppliesTo === 'all'}
                    onCheckedChange={(checked) => {
                      setNewAppliesTo(checked ? 'all' : 'specific');
                      if (checked) setSelectedPractices([]);
                    }}
                  />
                  <Label htmlFor="edit-apply-all" className="cursor-pointer">
                    All Practices <Badge variant="outline" className="ml-2">Organization-wide</Badge>
                  </Label>
                </div>
                
                {newAppliesTo === 'specific' && (
                  <div className="ml-6 space-y-2 mt-3">
                    <div className="text-xs text-gray-600 mb-2">Select specific practices:</div>
                    {practices.map(practice => (
                      <div key={practice.id} className="flex items-center gap-2">
                        <Checkbox 
                          id={`edit-practice-${practice.id}`}
                          checked={selectedPractices.includes(practice.id)}
                          onCheckedChange={() => handleTogglePractice(practice.id)}
                        />
                        <Label htmlFor={`edit-practice-${practice.id}`} className="cursor-pointer text-sm">
                          {practice.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="scheduling">Scheduling</SelectItem>
                  <SelectItem value="clinical">Clinical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Question</Label>
              <Input 
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea 
                rows={5}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input 
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSaveSource} 
                className="flex-1"
                disabled={newAppliesTo === 'specific' && selectedPractices.length === 0}
              >
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => { setEditSourceOpen(false); resetForm(); }} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={versionHistoryOpen} onOpenChange={setVersionHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>Track all changes to this knowledge source</DialogDescription>
          </DialogHeader>
          
          {currentSource && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm mb-2"><strong>Question:</strong> {currentSource.question}</div>
                <div className="text-xs text-gray-600 mb-2">Current Version: {currentSource.version}</div>
                <div className="text-xs text-gray-600">Applies to: {getPracticeNames(currentSource.appliesTo)}</div>
              </div>

              <div className="space-y-3">
                {currentSource.versionHistory.map((version, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? 'default' : 'outline'}>
                          v{version.version}
                        </Badge>
                        {index === 0 && (
                          <Badge className="bg-green-100 text-green-700">Current</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">{version.updatedAt}</div>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">{version.changes}</div>
                    <div className="text-xs text-gray-500">by {version.updatedBy}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test AI Response Dialog */}
      <Dialog open={testResponseOpen} onOpenChange={setTestResponseOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Test AI Factory Agent</DialogTitle>
            <DialogDescription>
              {selectedPractice === 'all' 
                ? `Testing with all organization-wide knowledge sources`
                : `Testing with ${getCurrentPractice()?.name}'s knowledge base${getCurrentPractice()?.useMedlinePlus ? ' + MedlinePlus' : ''}`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-700">
                  <div className="mb-1"><strong>Active Configuration:</strong></div>
                  <div>Practice: {selectedPractice === 'all' ? 'All Practices' : getCurrentPractice()?.name}</div>
                  <div>Knowledge Sources: {filteredSources.length}</div>
                  {selectedPractice !== 'all' && <div>MedlinePlus: {getCurrentPractice()?.useMedlinePlus ? 'Enabled' : 'Disabled'}</div>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start text-left h-auto py-3 px-3 whitespace-normal"
                onClick={() => handleQuickTest('What are your office hours?')}
              >
                <span className="text-sm">What are your office hours?</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start text-left h-auto py-3 px-3 whitespace-normal"
                onClick={() => handleQuickTest('What insurance do you accept?')}
              >
                <span className="text-sm">What insurance do you accept?</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start text-left h-auto py-3 px-3 whitespace-normal"
                onClick={() => handleQuickTest('What is your address?')}
              >
                <span className="text-sm">What is your address?</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start text-left h-auto py-3 px-3 whitespace-normal"
                onClick={() => handleQuickTest('How do I cancel an appointment?')}
              >
                <span className="text-sm">How do I cancel an appointment?</span>
              </Button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto">
              {testMessages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-12">
                  Click a quick test button above or type your own question below
                </div>
              ) : (
                <>
                  {testMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-2xl px-4 py-2.5 max-w-[85%] ${
                        msg.sender === 'patient' 
                          ? 'bg-blue-600 text-white rounded-tr-sm' 
                          : 'bg-white border rounded-tl-sm'
                      }`}>
                        <div className="text-sm">{msg.content}</div>
                        {msg.sender === 'ai' && (
                          <div className="pt-2 mt-2 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FileText className="w-3 h-3" />
                              <span>Source: {selectedPractice === 'all' ? 'Healthcare Partners Medical Group' : getCurrentPractice()?.name} Knowledge Base</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTestLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Input 
                placeholder="Type your test question here..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendTestMessage();
                  }
                }}
                disabled={isTestLoading}
              />
              <Button onClick={() => handleSendTestMessage()} disabled={!testInput.trim() || isTestLoading}>
                <Sparkles className="w-4 h-4 mr-2" />
                Send
              </Button>
              {testMessages.length > 0 && (
                <Button variant="outline" onClick={handleResetTestChat} disabled={isTestLoading}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}