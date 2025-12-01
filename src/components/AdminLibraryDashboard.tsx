import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import {
  Search,
  Plus,
  Filter,
  Download,
  Trash2,
  Copy,
  Eye,
  Edit,
  History,
  Share2,
  Power,
  PowerOff,
  X,
  FileText,
  ClipboardList,
  Shield,
  File,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  SlidersHorizontal
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { InfoBanner } from './InfoBanner';
import { toast } from 'sonner@2.0.3';
import { EnhancedFormBuilder } from './EnhancedFormBuilder';
import { ConsentTemplateBuilder } from './ConsentTemplateBuilder';
import { DocumentCreator } from './DocumentCreator';
import { ChecklistBuilderEngine } from './ChecklistBuilderEngine';
import { FormViewDialog } from './FormViewDialog';
import { VersionHistoryDialog } from './VersionHistoryDialog';

interface Asset {
  id: string;
  name: string;
  type: 'Form' | 'Consent' | 'Document' | 'Checklist';
  version: string;
  status: 'draft' | 'active' | 'retired';
  category: string;
  lastModified: string;
  modifiedBy: string;
  description?: string;
}

type SortField = 'name' | 'type' | 'version' | 'status' | 'category' | 'lastModified';
type SortDirection = 'asc' | 'desc';

export function AdminLibraryDashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('lastModified');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createType, setCreateType] = useState<'form' | 'consent' | 'document' | 'checklist'>('form');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Load mock data
  useEffect(() => {
    const mockAssets: Asset[] = [
      {
        id: 'QR-001',
        name: 'New Patient Intake Form',
        type: 'Form',
        version: '1.2.0',
        status: 'active',
        category: 'Pre-Visit',
        lastModified: 'November 20, 2025',
        modifiedBy: 'Sarah Chen',
        description: 'Comprehensive intake questionnaire for new patients'
      },
      {
        id: 'CON-001',
        name: 'HIPAA Privacy Consent',
        type: 'Consent',
        version: '2.0.0',
        status: 'active',
        category: 'Privacy',
        lastModified: 'November 18, 2025',
        modifiedBy: 'Michael Torres',
        description: 'HIPAA privacy practices acknowledgment'
      },
      {
        id: 'QR-002',
        name: 'Annual Physical Questionnaire',
        type: 'Form',
        version: '0.5.0',
        status: 'draft',
        category: 'Pre-Visit',
        lastModified: 'November 24, 2025',
        modifiedBy: 'Sarah Chen',
        description: 'Pre-visit questionnaire for annual physical exams'
      },
      {
        id: 'DOC-001',
        name: 'Welcome Letter - New Patients',
        type: 'Document',
        version: '1.0.0',
        status: 'active',
        category: 'Welcome',
        lastModified: 'November 15, 2025',
        modifiedBy: 'Admin User',
        description: 'Welcome letter with practice information'
      },
      {
        id: 'PD-CL-001',
        name: 'New Patient Onboarding',
        type: 'Checklist',
        version: '1.1.0',
        status: 'active',
        category: 'Onboarding',
        lastModified: 'November 22, 2025',
        modifiedBy: 'Sarah Chen',
        description: 'Complete checklist for new patient registration'
      },
      {
        id: 'CON-002',
        name: 'Financial Responsibility Agreement',
        type: 'Consent',
        version: '1.5.0',
        status: 'active',
        category: 'Financial',
        lastModified: 'November 10, 2025',
        modifiedBy: 'Michael Torres',
        description: 'Payment and financial responsibility consent'
      },
      {
        id: 'QR-003',
        name: 'COVID-19 Screening',
        type: 'Form',
        version: '3.0.0',
        status: 'active',
        category: 'Screening',
        lastModified: 'November 01, 2025',
        modifiedBy: 'Lisa Wong',
        description: 'Daily COVID-19 symptom screening questionnaire'
      },
      {
        id: 'DOC-002',
        name: 'Patient Rights and Responsibilities',
        type: 'Document',
        version: '1.0.0',
        status: 'active',
        category: 'Administrative',
        lastModified: 'October 30, 2025',
        modifiedBy: 'Admin User',
        description: 'Patient rights and responsibilities document'
      },
      {
        id: 'PD-CL-002',
        name: 'Pre-Surgery Preparation',
        type: 'Checklist',
        version: '2.0.0',
        status: 'active',
        category: 'Surgical',
        lastModified: 'November 12, 2025',
        modifiedBy: 'David Ford',
        description: 'Pre-operative checklist and instructions'
      },
      {
        id: 'CON-003',
        name: 'Telehealth Consent',
        type: 'Consent',
        version: '0.3.0',
        status: 'draft',
        category: 'Telehealth',
        lastModified: 'November 23, 2025',
        modifiedBy: 'Sarah Chen',
        description: 'Consent for telehealth visits'
      },
      {
        id: 'QR-004',
        name: 'Medication History',
        type: 'Form',
        version: '1.0.0',
        status: 'retired',
        category: 'Medical History',
        lastModified: 'September 15, 2025',
        modifiedBy: 'Lisa Wong',
        description: 'Legacy medication history form - replaced by QR-005'
      },
    ];
    setAssets(mockAssets);
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(assets.map(a => a.category));
    return Array.from(cats).sort();
  }, [assets]);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let filtered = assets.filter(asset => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        asset.name.toLowerCase().includes(searchLower) ||
        asset.id.toLowerCase().includes(searchLower) ||
        asset.description?.toLowerCase().includes(searchLower) ||
        asset.category.toLowerCase().includes(searchLower);

      // Type filter
      const matchesType = typeFilter === 'All' || asset.type === typeFilter;
      
      // Status filter
      const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
      
      // Category filter
      const matchesCategory = categoryFilter === 'All' || asset.category === categoryFilter;

      return matchesSearch && matchesType && matchesStatus && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'lastModified') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [assets, searchQuery, typeFilter, statusFilter, categoryFilter, sortField, sortDirection]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle selection
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedAssets);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedAssets(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedAssets.size === filteredAssets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(filteredAssets.map(a => a.id)));
    }
  };

  // Bulk actions
  const handleBulkActivate = () => {
    const selectedItems = assets.filter(a => selectedAssets.has(a.id));
    const hasRetired = selectedItems.some(a => a.status === 'retired');
    
    if (hasRetired) {
      toast.error('Cannot activate retired items. Please deselect retired items.');
      return;
    }

    toast.success(`Activated ${selectedAssets.size} item(s)`);
    setSelectedAssets(new Set());
  };

  const handleBulkDeactivate = () => {
    toast.success(`Deactivated ${selectedAssets.size} item(s)`);
    setSelectedAssets(new Set());
  };

  const handleBulkExport = () => {
    toast.success(`Exported ${selectedAssets.size} item(s)`);
    setSelectedAssets(new Set());
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedAssets.size} item(s)?`)) {
      toast.success(`Deleted ${selectedAssets.size} item(s)`);
      setSelectedAssets(new Set());
    }
  };

  const handleBulkShare = () => {
    toast.success(`Shared ${selectedAssets.size} item(s)`);
    setSelectedAssets(new Set());
  };

  // Row actions
  const handleDuplicate = (asset: Asset) => {
    toast.success(`Duplicated: ${asset.name}`);
  };

  const handleDelete = (asset: Asset) => {
    if (confirm(`Are you sure you want to delete "${asset.name}"?`)) {
      toast.success(`Deleted: ${asset.name}`);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-amber-100 text-amber-700';
      case 'retired': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Form': return <FileText className="w-4 h-4" />;
      case 'Consent': return <Shield className="w-4 h-4" />;
      case 'Document': return <File className="w-4 h-4" />;
      case 'Checklist': return <ClipboardList className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Remove filter chip
  const removeFilter = (filterType: 'type' | 'status' | 'category') => {
    switch (filterType) {
      case 'type': setTypeFilter('All'); break;
      case 'status': setStatusFilter('All'); break;
      case 'category': setCategoryFilter('All'); break;
    }
  };

  const activeFilters = [
    typeFilter !== 'All' && { type: 'type' as const, value: typeFilter },
    statusFilter !== 'All' && { type: 'status' as const, value: statusFilter },
    categoryFilter !== 'All' && { type: 'category' as const, value: categoryFilter },
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Admin Library</h2>
          <p className="text-gray-600 mt-1">
            Manage forms, consents, documents, and checklists
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-[#007CBE] hover:bg-[#006BA6]">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setCreateType('form'); setCreateDrawerOpen(true); }}>
              <FileText className="w-4 h-4 mr-2" />
              Form (Questionnaire)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setCreateType('consent'); setCreateDrawerOpen(true); }}>
              <Shield className="w-4 h-4 mr-2" />
              Consent Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setCreateType('document'); setCreateDrawerOpen(true); }}>
              <File className="w-4 h-4 mr-2" />
              Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setCreateType('checklist'); setCreateDrawerOpen(true); }}>
              <ClipboardList className="w-4 h-4 mr-2" />
              Checklist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <InfoBanner 
        title="What is this section used for?"
        description="Centralized repository for managing all patient-facing assets including forms (questionnaires), consent templates, educational documents, and to-do checklists. Version control, bulk operations, status management, and organization by category and type."
      />

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search across name, ID, description, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => filter && (
                <Badge key={filter.type} variant="secondary" className="pl-3 pr-1 py-1">
                  <span className="text-xs capitalize">{filter.type}: {filter.value}</span>
                  <button
                    onClick={() => removeFilter(filter.type)}
                    className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTypeFilter('All');
                  setStatusFilter('All');
                  setCategoryFilter('All');
                }}
                className="h-7 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Form">Forms</SelectItem>
                    <SelectItem value="Consent">Consents</SelectItem>
                    <SelectItem value="Document">Documents</SelectItem>
                    <SelectItem value="Checklist">Checklists</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedAssets.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedAssets.size} item(s) selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkActivate}>
                  <Power className="w-4 h-4 mr-2" />
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkDeactivate}>
                  <PowerOff className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredAssets.length} of {assets.length} items
      </div>

      {/* Table */}
      {filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || activeFilters.length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first form, consent, document, or checklist'}
              </p>
              <Button onClick={() => setCreateDrawerOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <Checkbox
                      checked={selectedAssets.size === filteredAssets.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 font-medium hover:text-[#007CBE]"
                    >
                      Name / Title
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('type')}
                      className="flex items-center gap-1 font-medium hover:text-[#007CBE]"
                    >
                      Type
                      {sortField === 'type' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('version')}
                      className="flex items-center gap-1 font-medium hover:text-[#007CBE]"
                    >
                      Version
                      {sortField === 'version' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 font-medium hover:text-[#007CBE]"
                    >
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center gap-1 font-medium hover:text-[#007CBE]"
                    >
                      Category
                      {sortField === 'category' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('lastModified')}
                      className="flex items-center gap-1 font-medium hover:text-[#007CBE]"
                    >
                      Last Modified
                      {sortField === 'lastModified' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedAssets.has(asset.id)}
                        onCheckedChange={() => toggleSelection(asset.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs text-gray-500">{asset.id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(asset.type)}
                        <span className="text-sm">{asset.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {asset.version}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{asset.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>{asset.lastModified}</div>
                        <div className="text-xs text-gray-500">by {asset.modifiedBy}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingAsset(asset);
                            setCreateType(asset.type.toLowerCase() as any);
                            setCreateDrawerOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDuplicate(asset)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedAsset(asset);
                              setVersionHistoryOpen(true);
                            }}>
                              <History className="w-4 h-4 mr-2" />
                              Version History
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(asset)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Dialogs/Drawers */}
      {createDrawerOpen && createType === 'form' && (
        <EnhancedFormBuilder
          open={createDrawerOpen}
          onOpenChange={setCreateDrawerOpen}
          editingForm={editingAsset}
        />
      )}
      {createDrawerOpen && createType === 'consent' && (
        <ConsentTemplateBuilder
          open={createDrawerOpen}
          onOpenChange={setCreateDrawerOpen}
          editingConsent={editingAsset}
        />
      )}
      {createDrawerOpen && createType === 'document' && (
        <DocumentCreator
          open={createDrawerOpen}
          onOpenChange={setCreateDrawerOpen}
          editingDocument={editingAsset}
        />
      )}
      {createDrawerOpen && createType === 'checklist' && (
        <ChecklistBuilderEngine
          open={createDrawerOpen}
          onOpenChange={setCreateDrawerOpen}
          editingChecklist={editingAsset}
        />
      )}
      
      <FormViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        form={selectedAsset}
        onEdit={() => {
          setEditingAsset(selectedAsset);
          setViewDialogOpen(false);
          if (selectedAsset) {
            setCreateType(selectedAsset.type.toLowerCase() as any);
          }
          setCreateDrawerOpen(true);
        }}
      />

      <VersionHistoryDialog
        open={versionHistoryOpen}
        onOpenChange={setVersionHistoryOpen}
        asset={selectedAsset}
      />
    </div>
  );
}