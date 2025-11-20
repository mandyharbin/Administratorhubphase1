import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Upload, FileText, Pencil, Trash2, File, Download, Search, Eye, Clock, AlertCircle, Languages, FileUp, FileDown, ChevronRight, Tag, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { useState } from 'react';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  roles: string[];
  status: 'draft' | 'published' | 'archived';
  version: string;
  lastReviewed: string;
  languages: string[];
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  relatedArticles: string[];
}

export function KnowledgeSourcesEnhanced() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [addArticleOpen, setAddArticleOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  const [articles, setArticles] = useState<Article[]>([
    {
      id: '1',
      title: 'Office Hours and Location',
      content: 'Our office is open Monday-Friday 8:00 AM - 5:00 PM...',
      category: 'General Information',
      tags: ['hours', 'location', 'contact'],
      roles: ['general', 'billing', 'scheduling', 'clinical'],
      status: 'published',
      version: '2.0',
      lastReviewed: 'Mar 10',
      languages: ['English', 'Spanish'],
      viewCount: 1247,
      helpfulCount: 98,
      notHelpfulCount: 5,
      relatedArticles: ['2', '5']
    },
    {
      id: '2',
      title: 'Insurance Verification Process',
      content: 'To verify insurance coverage, please provide...',
      category: 'Billing',
      tags: ['insurance', 'verification', 'billing'],
      roles: ['billing'],
      status: 'published',
      version: '1.5',
      lastReviewed: 'Mar 8',
      languages: ['English'],
      viewCount: 892,
      helpfulCount: 76,
      notHelpfulCount: 12,
      relatedArticles: ['3', '4']
    },
    {
      id: '3',
      title: 'Appointment Cancellation Policy',
      content: 'We require at least 24 hours notice...',
      category: 'Scheduling',
      tags: ['appointments', 'cancellation', 'policy'],
      roles: ['scheduling', 'general'],
      status: 'published',
      version: '1.0',
      lastReviewed: 'Feb 15',
      languages: ['English', 'Spanish'],
      viewCount: 654,
      helpfulCount: 45,
      notHelpfulCount: 8,
      relatedArticles: ['1']
    },
    {
      id: '4',
      title: 'Payment Plans and Options',
      content: 'We offer flexible payment plans...',
      category: 'Billing',
      tags: ['payment', 'plans', 'billing'],
      roles: ['billing'],
      status: 'published',
      version: '1.2',
      lastReviewed: 'Jan 20',
      languages: ['English'],
      viewCount: 423,
      helpfulCount: 32,
      notHelpfulCount: 3,
      relatedArticles: ['2']
    },
    {
      id: '5',
      title: 'Patient Portal Setup Guide',
      content: 'Follow these steps to set up your patient portal...',
      category: 'General Information',
      tags: ['portal', 'setup', 'guide'],
      roles: ['general'],
      status: 'published',
      version: '3.1',
      lastReviewed: 'Dec 5',
      languages: ['English', 'Spanish', 'French'],
      viewCount: 1876,
      helpfulCount: 142,
      notHelpfulCount: 18,
      relatedArticles: ['1']
    }
  ]);

  const categories = [
    { id: 'general-information', name: 'General Information', parent: null },
    { id: 'billing', name: 'Billing', parent: null },
    { id: 'insurance', name: 'Insurance', parent: 'billing' },
    { id: 'payment', name: 'Payment Plans', parent: 'billing' },
    { id: 'scheduling', name: 'Scheduling', parent: null },
    { id: 'appointments', name: 'Appointments', parent: 'scheduling' },
    { id: 'clinical', name: 'Clinical', parent: null },
    { id: 'prescriptions', name: 'Prescriptions', parent: 'clinical' },
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesRole = selectedRole === 'all' || article.roles.includes(selectedRole);
    
    return matchesSearch && matchesCategory && matchesRole;
  });

  const outdatedArticles = articles.filter(article => {
    const reviewDate = new Date(article.lastReviewed);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return reviewDate < sixMonthsAgo;
  });

  const isOutdated = (article: Article) => {
    const reviewDate = new Date(article.lastReviewed);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return reviewDate < sixMonthsAgo;
  };

  const getEffectivenessRate = (article: Article) => {
    const total = article.helpfulCount + article.notHelpfulCount;
    if (total === 0) return 0;
    return Math.round((article.helpfulCount / total) * 100);
  };

  const handleBulkImport = () => {
    // Handle CSV/JSON import
    console.log('Bulk import triggered');
    setBulkImportOpen(false);
  };

  const handleExport = (format: 'pdf' | 'html') => {
    // Handle export
    console.log(`Export as ${format}`);
    setExportDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Knowledge Sources</h2>
        <p className="text-gray-600 mt-1">Manage AI knowledge base with articles, documents, and FAQs</p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search articles, tags, content..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileUp className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Import Articles</DialogTitle>
                <DialogDescription>Import articles from CSV or JSON file</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>File Format</Label>
                  <Select defaultValue="csv">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Upload File</Label>
                  <Input type="file" accept=".csv,.json" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleBulkImport} className="flex-1">Import</Button>
                  <Button variant="outline" onClick={() => setBulkImportOpen(false)} className="flex-1">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileDown className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Knowledge Base</DialogTitle>
                <DialogDescription>Export all articles to PDF or HTML</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => handleExport('pdf')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button variant="outline" onClick={() => handleExport('html')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as HTML
                  </Button>
                </div>
                <Button variant="outline" onClick={() => setExportDialogOpen(false)} className="w-full">Cancel</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={addArticleOpen} onOpenChange={setAddArticleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Article</DialogTitle>
                <DialogDescription>Add rich content with images, links, and formatting</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Article title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Information</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="scheduling">Scheduling</SelectItem>
                        <SelectItem value="clinical">Clinical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content (Rich Text)</Label>
                  <Textarea 
                    rows={8}
                    placeholder="Article content with markdown support for **bold**, *italic*, [links](url), and images..."
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">Supports Markdown formatting, images, and links</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tags (comma separated)</Label>
                    <Input placeholder="hours, location, contact" />
                  </div>
                  <div className="space-y-2">
                    <Label>Version</Label>
                    <Input placeholder="1.0" defaultValue="1.0" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Access Roles (select multiple)</Label>
                  <div className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">General</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Billing</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Scheduling</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Clinical</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Languages</Label>
                  <div className="flex gap-2">
                    <Badge className="cursor-pointer">English (Primary)</Badge>
                    <Button variant="outline" size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Translation
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm">Publish article immediately</p>
                    <p className="text-xs text-gray-500">Article will be available to AI and users</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Create Article</Button>
                  <Button variant="outline" onClick={() => setAddArticleOpen(false)} className="flex-1">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-gray-600">Category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="General Information">General Information</SelectItem>
              <SelectItem value="Billing">Billing</SelectItem>
              <SelectItem value="Scheduling">Scheduling</SelectItem>
              <SelectItem value="Clinical">Clinical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm text-gray-600">Role:</Label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="scheduling">Scheduling</SelectItem>
              <SelectItem value="clinical">Clinical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {outdatedArticles.length > 0 && (
          <Badge variant="outline" className="ml-auto">
            <AlertCircle className="w-3 h-3 mr-1" />
            {outdatedArticles.length} articles need review
          </Badge>
        )}
      </div>

      {/* Articles Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Last Reviewed</TableHead>
                <TableHead>Languages</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Effectiveness</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{article.title}</span>
                          {isOutdated(article) && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                              <Clock className="w-3 h-3 mr-1" />
                              Needs Review
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {article.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="w-2 h-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline">v{article.version}</Badge>
                  </TableCell>
                  <TableCell>{article.lastReviewed}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Languages className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{article.languages.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>{article.viewCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <ThumbsUp className="w-3 h-3" />
                        {article.helpfulCount}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <ThumbsDown className="w-3 h-3" />
                        {article.notHelpfulCount}
                      </div>
                      <span className="text-xs text-gray-600">({getEffectivenessRate(article)}%)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        article.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : article.status === 'draft'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }
                    >
                      {article.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
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

      {/* Category Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle>Category Hierarchy</CardTitle>
          <CardDescription>Hierarchical organization of knowledge categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.filter(c => !c.parent).map(category => (
              <div key={category.id}>
                <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>{category.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {articles.filter(a => a.category === category.name).length}
                  </Badge>
                </div>
                {categories
                  .filter(c => c.parent === category.id)
                  .map(subCategory => (
                    <div key={subCategory.id} className="flex items-center gap-2 p-2 pl-8 hover:bg-gray-50 rounded">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{subCategory.name}</span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
