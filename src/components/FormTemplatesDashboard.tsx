import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  Download,
  Upload,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  GitBranch,
  BarChart3,
  FileText,
  Shield,
  ClipboardList,
  Database,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { InfoBanner } from './InfoBanner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { FormBuilderQuickGuide } from './FormBuilderQuickGuide';
import { ChecklistBuilderEngine } from './ChecklistBuilderEngine';
import { ChecklistBuilderGuide } from './ChecklistBuilderGuide';
import { OCRFormUploader } from './OCRFormUploader';
import { PatientFormPreview } from './PatientFormPreview';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Template {
  id: string;
  title: string;
  type: 'form' | 'consent' | 'checklist';
  status: 'draft' | 'published' | 'archived';
  version: string;
  lastModified: string;
  author: string;
  submissions: number;
  mappedFields: number;
  totalFields: number;
  fhirCompliant: boolean;
}

export function FormTemplatesDashboard({ onCreateNew, onCreateChecklist, onEdit }: { onCreateNew: () => void; onCreateChecklist: () => void; onEdit: (id: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [quickGuideOpen, setQuickGuideOpen] = useState(false);
  const [checklistGuideOpen, setChecklistGuideOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [checklistBuilderOpen, setChecklistBuilderOpen] = useState(false);
  const [ocrUploaderOpen, setOcrUploaderOpen] = useState(false);
  const [ocrForms, setOcrForms] = useState<Template[]>([]);

  // Fetch OCR forms on mount
  useEffect(() => {
    fetchOCRForms();
  }, []);

  const fetchOCRForms = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/ocr/forms`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch OCR forms');
        return;
      }

      const data = await response.json();
      
      // Transform OCR forms to Template format
      const transformedForms: Template[] = (data.forms || []).map((form: any) => ({
        id: form.id || form.resourceType + '-' + Date.now(),
        title: form.title || 'Untitled OCR Form',
        type: (form.metadata?.type || form.type || 'form') as 'form' | 'consent' | 'checklist',
        status: (form.status === 'draft' ? 'draft' : 'published') as 'draft' | 'published' | 'archived',
        version: '1.0.0',
        lastModified: form.createdAt ? new Date(form.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently',
        author: 'OCR System',
        submissions: 0,
        mappedFields: form.item?.filter((item: any) => item.extension).length || 0,
        totalFields: form.item?.length || 0,
        fhirCompliant: true,
      }));

      setOcrForms(transformedForms);
      console.log(`✓ Loaded ${transformedForms.length} OCR forms`);
    } catch (error) {
      console.error('Error fetching OCR forms:', error);
    }
  };

  // Refresh OCR forms when uploader closes
  const handleOCRUploaderClose = (open: boolean) => {
    setOcrUploaderOpen(open);
    if (!open) {
      // Refresh forms when dialog closes
      fetchOCRForms();
    }
  };

  const templates: Template[] = [
    {
      id: 'form-1',
      title: 'New Patient Intake Form',
      type: 'form',
      status: 'published',
      version: '2.1.0',
      lastModified: 'November 20, 2025',
      author: 'Dr. Sarah Chen',
      submissions: 342,
      mappedFields: 18,
      totalFields: 22,
      fhirCompliant: true,
    },
    {
      id: 'consent-1',
      title: 'HIPAA Privacy Consent',
      type: 'consent',
      status: 'published',
      version: '1.0.0',
      lastModified: 'November 15, 2025',
      author: 'Admin User',
      submissions: 456,
      mappedFields: 5,
      totalFields: 5,
      fhirCompliant: true,
    },
    {
      id: 'form-2',
      title: 'Pre-Surgery Assessment',
      type: 'form',
      status: 'draft',
      version: '0.5.0',
      lastModified: 'November 22, 2025',
      author: 'Dr. Michael Rodriguez',
      submissions: 0,
      mappedFields: 12,
      totalFields: 15,
      fhirCompliant: false,
    },
    {
      id: 'checklist-1',
      title: 'Post-Discharge Checklist',
      type: 'checklist',
      status: 'published',
      version: '1.2.0',
      lastModified: 'November 18, 2025',
      author: 'Nurse Johnson',
      submissions: 128,
      mappedFields: 8,
      totalFields: 10,
      fhirCompliant: true,
    },
    {
      id: 'consent-2',
      title: 'Telehealth Consent Form',
      type: 'consent',
      status: 'published',
      version: '1.1.0',
      lastModified: 'November 10, 2025',
      author: 'Admin User',
      submissions: 289,
      mappedFields: 6,
      totalFields: 6,
      fhirCompliant: true,
    },
    {
      id: 'form-3',
      title: 'Pediatric Well Visit',
      type: 'form',
      status: 'archived',
      version: '3.0.0',
      lastModified: 'October 30, 2025',
      author: 'Dr. Emily Park',
      submissions: 567,
      mappedFields: 25,
      totalFields: 25,
      fhirCompliant: true,
    },
  ];

  // Combine static templates with OCR forms
  const allTemplates = [...ocrForms, ...templates];

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-700',
      draft: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-gray-100 text-gray-700',
    };
    return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      form: FileText,
      consent: Shield,
      checklist: ClipboardList,
    };
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const handleBulkPublish = () => {
    toast.success(`Published ${selectedTemplates.length} templates`);
    setSelectedTemplates([]);
  };

  const handleBulkArchive = () => {
    toast.success(`Archived ${selectedTemplates.length} templates`);
    setSelectedTemplates([]);
  };

  const handleDuplicate = (template: Template) => {
    toast.success(`Duplicated "${template.title}"`);
  };

  const handleDelete = (template: Template) => {
    toast.success(`Deleted "${template.title}"`);
  };

  const openVersionHistory = (template: Template) => {
    setSelectedTemplate(template);
    setVersionHistoryOpen(true);
  };

  const openAnalytics = (template: Template) => {
    setSelectedTemplate(template);
    setAnalyticsOpen(true);
  };

  const openPreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-1">Form & Consent Templates</h2>
          <p className="text-gray-600">Create and manage FHIR-compliant forms, consents, and checklists</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setChecklistGuideOpen(true)}>
            <HelpCircle className="w-4 h-4 mr-2" />
            Checklist Guide
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-[#007CBE] hover:bg-[#006BA6]">
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onCreateNew}>
                <FileText className="w-4 h-4 mr-2" />
                Form or Consent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChecklistBuilderOpen(true)}>
                <ClipboardList className="w-4 h-4 mr-2" />
                Checklist
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOcrUploaderOpen(true)}>
                <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                <div>
                  <div>Upload & OCR Extract</div>
                  <div className="text-xs text-gray-500">AI-powered form generation</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <InfoBanner 
        title="What is this section used for?"
        description="Design and manage patient-facing forms, consent documents, and to-do checklists using a drag-and-drop FHIR-compliant builder. Upload paper forms for AI-powered OCR extraction, version control your templates, and map fields to FHIR resources for seamless EHR integration."
      />

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="form">Forms</SelectItem>
            <SelectItem value="consent">Consents</SelectItem>
            <SelectItem value="checklist">Checklists</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedTemplates.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium">{selectedTemplates.length} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleBulkPublish}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Publish
            </Button>
            <Button size="sm" variant="outline" onClick={handleBulkArchive}>
              <Download className="w-4 h-4 mr-2" />
              Archive
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedTemplates([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTemplates.includes(template.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTemplates([...selectedTemplates, template.id]);
                    } else {
                      setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                    }
                  }}
                  className="rounded"
                />
                <div className="p-2 bg-blue-50 rounded">
                  {getTypeIcon(template.type)}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(template.id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openVersionHistory(template)}>
                    <GitBranch className="w-4 h-4 mr-2" />
                    Version History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openAnalytics(template)}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(template)} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-medium mb-2">{template.title}</h3>

            <div className="flex items-center gap-2 mb-3">
              {getStatusBadge(template.status)}
              <Badge variant="outline" className="text-xs">v{template.version}</Badge>
              {template.fhirCompliant && (
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  <Database className="w-3 h-3 mr-1" />
                  FHIR
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center justify-between">
                <span>Submissions:</span>
                <span className="font-medium">{template.submissions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>FHIR Mapping:</span>
                <span className="font-medium">
                  {template.mappedFields}/{template.totalFields}
                  {template.mappedFields === template.totalFields && (
                    <CheckCircle2 className="w-3 h-3 inline ml-1 text-green-600" />
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <User className="w-3 h-3" />
              <span>{template.author}</span>
              <span>•</span>
              <Calendar className="w-3 h-3" />
              <span>{template.lastModified}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(template.id)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => openPreview(template)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No templates found</p>
          <Button variant="outline" className="mt-4" onClick={onCreateNew}>
            Create your first template
          </Button>
        </div>
      )}

      {/* Version History Dialog */}
      <Dialog open={versionHistoryOpen} onOpenChange={setVersionHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.title} - All versions and changes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {[
              { version: '2.1.0', date: 'November 20, 2025', author: 'Dr. Sarah Chen', changes: 'Added conditional logic to pregnancy questions' },
              { version: '2.0.0', date: 'November 15, 2025', author: 'Dr. Sarah Chen', changes: 'Major FHIR mapping update, added Observation resources' },
              { version: '1.5.0', date: 'November 1, 2025', author: 'Dr. Sarah Chen', changes: 'Added medication history section' },
              { version: '1.0.0', date: 'October 20, 2025', author: 'Admin User', changes: 'Initial release' },
            ].map((version, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <GitBranch className="w-4 h-4 text-blue-600" />
                  </div>
                  {index < 3 && <div className="w-px h-full bg-gray-200 mt-2" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">v{version.version}</Badge>
                    {index === 0 && <Badge className="bg-green-100 text-green-700 text-xs">Current</Badge>}
                  </div>
                  <p className="text-sm mb-2">{version.changes}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span>{version.author}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{version.date}</span>
                  </div>
                  {index > 0 && (
                    <Button variant="outline" size="sm" className="mt-3">
                      Restore this version
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Template Analytics</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.title} - Usage statistics and insights
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Total Submissions</div>
                <div className="text-2xl font-semibold">{selectedTemplate?.submissions}</div>
                <div className="text-xs text-green-600 mt-1">↑ 12% this month</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">FHIR Coverage</div>
                <div className="text-2xl font-semibold">
                  {selectedTemplate && Math.round((selectedTemplate.mappedFields / selectedTemplate.totalFields) * 100)}%
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {selectedTemplate?.mappedFields} of {selectedTemplate?.totalFields} fields
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
                <div className="text-2xl font-semibold">94%</div>
                <div className="text-xs text-gray-600 mt-1">High completion</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Mapped FHIR Resources</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Questionnaire</span>
                  <Badge variant="outline">{selectedTemplate?.totalFields} fields</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Observation</span>
                  <Badge variant="outline">8 fields</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Condition</span>
                  <Badge variant="outline">3 fields</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Recent Errors</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-red-900">FHIR validation error</p>
                    <p className="text-red-700">Field "heart_rate" missing required unit (UCUM)</p>
                    <p className="text-xs text-red-600 mt-1">2 occurrences in last 7 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {selectedTemplate && (
        <PatientFormPreview 
          open={previewOpen} 
          onOpenChange={setPreviewOpen}
          template={selectedTemplate}
        />
      )}

      {/* Quick Guide Dialog */}
      <Dialog open={quickGuideOpen} onOpenChange={setQuickGuideOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Form Builder Quick Guide</DialogTitle>
            <DialogDescription>
              Get started with creating and managing FHIR-compliant forms, consents, and checklists
            </DialogDescription>
          </DialogHeader>

          <FormBuilderQuickGuide />
        </DialogContent>
      </Dialog>

      {/* Checklist Builder Dialog */}
      <ChecklistBuilderEngine 
        open={checklistBuilderOpen} 
        onOpenChange={setChecklistBuilderOpen}
      />

      {/* Checklist Guide Dialog */}
      <Dialog open={checklistGuideOpen} onOpenChange={setChecklistGuideOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checklist Builder Guide</DialogTitle>
            <DialogDescription>
              Learn how to create and save patient checklists with forms, consents, and documents
            </DialogDescription>
          </DialogHeader>
          <ChecklistBuilderGuide />
        </DialogContent>
      </Dialog>

      {/* OCR Uploader Dialog */}
      <OCRFormUploader 
        open={ocrUploaderOpen} 
        onOpenChange={handleOCRUploaderClose}
      />
    </div>
  );
}