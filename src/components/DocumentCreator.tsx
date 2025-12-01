import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { File, Save, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';

interface DocumentCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDocument?: any;
}

export function DocumentCreator({ open, onOpenChange, editingDocument }: DocumentCreatorProps) {
  const [formData, setFormData] = useState({
    title: editingDocument?.name || '',
    category: editingDocument?.category || 'Welcome',
    content: '',
    status: editingDocument?.status || 'draft'
  });

  const handleSave = () => {
    const document = {
      resourceType: 'DocumentReference',
      id: editingDocument?.id || `DOC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'current',
      type: { text: formData.title },
      category: [{ text: formData.category }],
      content: formData.content,
      version: '1.0.0'
    };

    toast.success('Document created');
    console.log('Created document:', document);
    setTimeout(() => {
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <File className="w-5 h-5" />
            {editingDocument ? 'Edit Document' : 'Create New Document'}
          </DialogTitle>
          <DialogDescription>
            {editingDocument ? 'Modify document content and settings' : 'Create a new document with rich text content'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="e.g., Welcome Letter - New Patients"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Welcome">Welcome</SelectItem>
                  <SelectItem value="Administrative">Administrative</SelectItem>
                  <SelectItem value="Educational">Educational</SelectItem>
                  <SelectItem value="Policy">Policy</SelectItem>
                  <SelectItem value="Instructions">Instructions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <div className="border rounded-lg p-4 bg-white min-h-[400px]">
              <Textarea
                placeholder="Start writing your document..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={15}
                className="border-none focus:ring-0 p-0"
              />
            </div>
            <p className="text-xs text-gray-500">
              Rich text formatting, images, and branding controls will be available in the full editor
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-[#007CBE] hover:bg-[#006BA6]">
                <Save className="w-4 h-4 mr-2" />
                Save Document
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}