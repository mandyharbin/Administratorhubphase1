import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Upload, FileText, Pencil, Trash2, Settings, Download, Eye, Building2, Users, Sparkles, Info, GitBranch, History, Globe, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { InfoBanner } from './InfoBanner';

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
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);

  // Article Import Form State
  const [articleTitle, setArticleTitle] = useState('');
  const [articleBody, setArticleBody] = useState('');
  const [articleCategory, setArticleCategory] = useState('general');
  const [articleAppliesTo, setArticleAppliesTo] = useState<'all' | 'specific'>('all');
  const [articlePractices, setArticlePractices] = useState<string[]>([]);
  const [articleTags, setArticleTags] = useState('');
  const [articleAudience, setArticleAudience] = useState('');
  const [articleCondition, setArticleCondition] = useState('');
  const [articleLanguage, setArticleLanguage] = useState('en');
  const [articleAuthor, setArticleAuthor] = useState('');
  const [articleSource, setArticleSource] = useState('');
  const [articleReviewDate, setArticleReviewDate] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

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
        const errorData = await response.json().catch(() => ({}));
        console.error('Error testing AI:', errorData);
        throw new Error(`Failed to get AI response: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      // Check if we're in demo mode (fallback due to invalid API key)
      if (data.isDemoMode) {
        const demoWarning = { 
          sender: 'system', 
          content: '⚠️ Demo Mode Active: OpenAI API key is invalid. Showing sample responses. Please update your API key in Supabase secrets.' 
        };
        setTestMessages(prev => [...prev, demoWarning]);
      }
      
      const aiMessage = { sender: 'ai', content: data.response };
      setTestMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error testing AI:', error);
      const errorMessage = { 
        sender: 'ai', 
        content: 'Sorry, I encountered an error processing your message. The OpenAI API key may be invalid or expired. Please check the console for details.' 
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportFile(file);
    setImporting(true);
    
    try {
      const text = await file.text();
      let parsed: any[] = [];
      
      // Parse based on file type
      if (file.name.endsWith('.json')) {
        parsed = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parser
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(',');
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || '';
          });
          parsed.push(row);
        }
      }
      
      // Validate and set preview
      const validated = parsed.filter(item => item.question && item.answer);
      setImportPreview(validated);
      
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please check the format.');
      setImportFile(null);
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = () => {
    const newSources: KnowledgeSource[] = importPreview.map(item => ({
      id: `ks-${Date.now()}-${Math.random()}`,
      organizationId: 'org-001',
      appliesTo: item.appliesto?.toLowerCase() === 'all' || !item.appliesto ? 'all' : [selectedPractice],
      question: item.question,
      answer: item.answer,
      category: item.category?.toLowerCase() || 'general',
      version: '1.0',
      status: 'active' as const,
      createdBy: 'admin@practice.com',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      versionHistory: [{
        version: '1.0',
        updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        updatedBy: 'admin@practice.com',
        changes: 'Imported from file'
      }],
      tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
      languages: ['en']
    }));
    
    setKnowledgeSources([...knowledgeSources, ...newSources]);
    setImportOpen(false);
    setImportFile(null);
    setImportPreview([]);
    alert(`Successfully imported ${newSources.length} knowledge sources!`);
  };

  const handleImportArticle = () => {
    console.log('Import Article clicked', { 
      articleTitle, 
      articleBody: articleBody.substring(0, 100),
      currentSourcesCount: knowledgeSources.length
    });
    
    if (!articleTitle.trim() || !articleBody.trim()) {
      alert('Please provide both title and article body');
      return;
    }

    const newSource: KnowledgeSource = {
      id: `ks-article-${Date.now()}`,
      organizationId: 'org-001',
      appliesTo: articleAppliesTo === 'all' ? 'all' : articlePractices,
      question: articleTitle,
      answer: articleBody,
      category: articleCategory,
      version: '1.0',
      status: 'active',
      createdBy: articleAuthor || 'admin@practice.com',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      versionHistory: [{
        version: '1.0',
        updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        updatedBy: articleAuthor || 'admin@practice.com',
        changes: 'Initial article import'
      }],
      tags: [...(articleTags.split(',').map(t => t.trim()).filter(t => t)), 'imported-article'],
      languages: [articleLanguage]
    };

    console.log('Creating new article source:', {
      id: newSource.id,
      question: newSource.question,
      category: newSource.category,
      appliesTo: newSource.appliesTo,
      status: newSource.status,
      tags: newSource.tags
    });
    
    const updatedSources = [...knowledgeSources, newSource];
    console.log('Updated sources count:', updatedSources.length);
    setKnowledgeSources(updatedSources);
    
    resetArticleForm();
    setImportOpen(false);
    
    setTimeout(() => {
      alert(`Article "${articleTitle}" imported successfully! Check the Knowledge Sources table under "${articleCategory}" category.`);
    }, 100);
  };

  const resetArticleForm = () => {
    setArticleTitle('');
    setArticleBody('');
    setArticleCategory('general');
    setArticleAppliesTo('all');
    setArticlePractices([]);
    setArticleTags('');
    setArticleAudience('');
    setArticleCondition('');
    setArticleLanguage('en');
    setArticleAuthor('');
    setArticleSource('');
    setArticleReviewDate('');
  };

  const handleToggleArticlePractice = (practiceId: string) => {
    setArticlePractices(prev => 
      prev.includes(practiceId) 
        ? prev.filter(id => id !== practiceId)
        : [...prev, practiceId]
    );
  };

  const processFile = async (file: File) => {
    setUploadingFile(true);
    
    try {
      // For simple text files, process client-side
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      let extractedText = '';
      
      if (fileType === 'txt') {
        extractedText = await file.text();
        const lines = extractedText.split('\n').filter(line => line.trim());
        
        // Try to extract title from first line if it's short
        if (!articleTitle && lines.length > 0 && lines[0].trim().length < 100) {
          setArticleTitle(lines[0].trim());
          extractedText = lines.slice(1).join('\n').trim();
        }
      } 
      else if (fileType === 'pdf' || fileType === 'doc' || fileType === 'docx') {
        // For PDF and DOCX files, send to server for processing
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/process-file`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: formData
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process file');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setArticleTitle(result.title);
          extractedText = result.body;
          console.log(`${fileType.toUpperCase()} file processed successfully: ${result.body.length} characters`);
        } else {
          throw new Error(result.error || 'Failed to extract text from file');
        }
      }
      else {
        throw new Error(`Unsupported file type: ${fileType}. Please use TXT, PDF, or DOCX files.`);
      }
      
      // Clean up whitespace
      extractedText = extractedText.trim().replace(/\s+/g, ' ');
      
      if (extractedText.length > 0) {
        setArticleBody(extractedText);
        
        // Auto-populate title from filename if still empty
        if (!articleTitle) {
          const titleFromFile = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setArticleTitle(titleFromFile);
        }
        
        console.log(`File processed successfully: ${extractedText.length} characters extracted`);
      } else {
        throw new Error('No text could be extracted from the file. Please paste the content manually.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert(`Error processing ${file.name}. ${error instanceof Error ? error.message : 'Please try again or paste the content manually.'}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleArticleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await processFile(file);
    
    // Reset file input
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const filteredSources = getFilteredSources();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2>Knowledge Hub</h2>
          </div>
        </div>
      </div>

      <InfoBanner 
        title="What is this section used for?"
        description="View and manage knowledge sources from a tenant-wide perspective. Filter and browse content across multiple practice locations, import articles and documents with AI extraction, and test the AI's understanding of your knowledge base with the built-in testing interface."
      />

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

          <Dialog open={importOpen} onOpenChange={(open) => { setImportOpen(open); if (!open) resetArticleForm(); }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import Article
              </Button>
            </DialogTrigger>
            <DialogContent className="!w-[98vw] !h-[95vh] !max-w-[98vw] !max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import Patient Education Article</DialogTitle>
                <DialogDescription>
                  Add educational content that the AI can reference when responding to patients
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Content Type Badge */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-600">Content Type:</Label>
                  <Badge className="bg-blue-100 text-blue-700">
                    <FileText className="w-3 h-3 mr-1" />
                    Patient Education Article
                  </Badge>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label>Title <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="Article title or topic"
                        value={articleTitle}
                        onChange={(e) => setArticleTitle(e.target.value)}
                      />
                    </div>

                    {/* Article Body */}
                    <div className="space-y-2">
                      <Label>Article Body <span className="text-red-500">*</span></Label>
                      
                      {/* Drag and Drop Zone */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-4 transition-all ${
                          isDragging 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-2 py-3">
                          <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div className="text-center">
                            <p className="text-sm">
                              {isDragging ? (
                                <span className="text-blue-600">Drop file here</span>
                              ) : (
                                <>
                                  <span>Drag & drop a file here, or </span>
                                  <input
                                    type="file"
                                    id="article-file-upload"
                                    accept=".txt,.pdf,.doc,.docx"
                                    onChange={handleArticleFileUpload}
                                    className="hidden"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById('article-file-upload')?.click()}
                                    className="text-blue-600 hover:underline"
                                  >
                                    browse
                                  </button>
                                </>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Supports: TXT, PDF, Word (DOC/DOCX)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Text Area for manual input/editing */}
                      <Textarea 
                        rows={6}
                        placeholder="Or type/paste article content here..."
                        value={articleBody}
                        onChange={(e) => setArticleBody(e.target.value)}
                        disabled={uploadingFile}
                      />
                      
                      {uploadingFile && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processing file...
                        </div>
                      )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={articleCategory} onValueChange={setArticleCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="clinical">Clinical</SelectItem>
                          <SelectItem value="scheduling">Scheduling</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600">
                        <Info className="w-3 h-3 inline mr-1" />
                        Article will appear in the Knowledge Sources table under this category
                      </p>
                    </div>

                    {/* Applies To */}
                    <div className="space-y-2">
                      <Label>Applies To</Label>
                      <div className="p-4 border rounded-lg bg-gray-50 space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="article-apply-all"
                            checked={articleAppliesTo === 'all'}
                            onCheckedChange={(checked) => {
                              setArticleAppliesTo(checked ? 'all' : 'specific');
                              if (checked) setArticlePractices([]);
                            }}
                          />
                          <Label htmlFor="article-apply-all" className="cursor-pointer">
                            All Practices <Badge variant="outline" className="ml-2 text-xs">Organization-wide</Badge>
                          </Label>
                        </div>
                        
                        {articleAppliesTo === 'specific' && (
                          <div className="ml-6 space-y-2 mt-3 max-h-32 overflow-y-auto">
                            <div className="text-xs text-gray-600 mb-2">Select practices:</div>
                            {practices.map(practice => (
                              <div key={practice.id} className="flex items-center gap-2">
                                <Checkbox 
                                  id={`article-practice-${practice.id}`}
                                  checked={articlePractices.includes(practice.id)}
                                  onCheckedChange={() => handleToggleArticlePractice(practice.id)}
                                />
                                <Label htmlFor={`article-practice-${practice.id}`} className="cursor-pointer text-sm">
                                  {practice.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <Label>Tags (Keywords)</Label>
                      <Input 
                        placeholder="diabetes, medication, insulin"
                        value={articleTags}
                        onChange={(e) => setArticleTags(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">Comma-separated keywords for search. "imported-article" tag will be added automatically.</p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Audience */}
                    <div className="space-y-2">
                      <Label>Audience</Label>
                      <Input 
                        placeholder="Adults, Seniors, Parents, etc."
                        value={articleAudience}
                        onChange={(e) => setArticleAudience(e.target.value)}
                      />
                    </div>

                    {/* Condition/Topic */}
                    <div className="space-y-2">
                      <Label>Condition/Topic</Label>
                      <Input 
                        placeholder="Diabetes, Hypertension, Wellness, etc."
                        value={articleCondition}
                        onChange={(e) => setArticleCondition(e.target.value)}
                      />
                    </div>

                    {/* Review Date */}
                    <div className="space-y-2">
                      <Label>Review Date</Label>
                      <Input 
                        type="date"
                        value={articleReviewDate}
                        onChange={(e) => setArticleReviewDate(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">Next content review date</p>
                    </div>

                    {/* Source */}
                    <div className="space-y-2">
                      <Label>Source</Label>
                      <Input 
                        placeholder="Internal, CDC, Mayo Clinic, etc."
                        value={articleSource}
                        onChange={(e) => setArticleSource(e.target.value)}
                      />
                    </div>

                    {/* Review Badge */}
                    <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-start gap-2">
                        <Eye className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm mb-1"><strong>Review Status</strong></div>
                          <div className="text-xs text-gray-700">Content will be marked as reviewed on import</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Preview Section */}
                {articleTitle && articleBody && (
                  <div className="border-t pt-6 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <div><strong>AI Preview: How this will appear to patients</strong></div>
                    </div>
                    
                    <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                      <CardContent className="py-4">
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm mb-2">{articleTitle}</div>
                            <div className="text-xs text-gray-700">
                              {articleBody.substring(0, 200)}{articleBody.length > 200 ? '...' : ''}
                            </div>
                          </div>
                          <Button variant="link" size="sm" className="text-blue-600 p-0 h-auto">
                            Read more →
                          </Button>
                          {(articleAppliesTo === 'all' || articlePractices.length > 0) && (
                            <div className="pt-3 border-t border-gray-200">
                              <div className="text-xs text-gray-600 mb-2">
                                <strong>Available at:</strong>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {articleAppliesTo === 'all' ? (
                                  <Badge variant="outline" className="text-xs">
                                    <Building2 className="w-3 h-3 mr-1" />
                                    All Practices
                                  </Badge>
                                ) : (
                                  articlePractices.map(practiceId => {
                                    const practice = practices.find(p => p.id === practiceId);
                                    return practice ? (
                                      <Badge key={practiceId} variant="outline" className="text-xs">
                                        {practice.name}
                                      </Badge>
                                    ) : null;
                                  })
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleImportArticle}
                    disabled={!articleTitle.trim() || !articleBody.trim()}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Import Article
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{source.question}</span>
                              {source.tags.includes('imported-article') && (
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  <FileText className="w-3 h-3 mr-1" />
                                  Article
                                </Badge>
                              )}
                            </div>
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
                onClick={() => handleQuickTest('When is my next appointment?')}
              >
                <span className="text-sm">When is my next appointment?</span>
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