import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  ClipboardList,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Users,
  MapPin,
  Calendar,
  FileText,
  Shield,
  File,
  Settings
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface ChecklistBuilderEngineProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingChecklist?: any;
}

interface DraggableItemProps {
  item: any;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  updateItem: (index: number, field: string, value: any) => void;
  removeItem: (index: number) => void;
}

const DraggableItem = ({ item, index, moveItem, updateItem, removeItem }: DraggableItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'CHECKLIST_ITEM',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'CHECKLIST_ITEM',
    hover(draggedItem: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) {
        return;
      }

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  return (
    <div 
      ref={ref} 
      className={`bg-gray-50 rounded-lg p-4 transition-all ${isDragging ? 'opacity-50' : 'opacity-100'} ${isOver ? 'border-2 border-blue-400' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="cursor-move">
          <GripVertical className="w-5 h-5 text-gray-400 mt-2" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{index + 1}</Badge>
              <span className="font-medium">{item.assetName}</span>
              <Badge variant="secondary" className="text-xs">{item.assetType}</Badge>
              {item.required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Estimated time"
              value={item.estimatedTime}
              onChange={(e) => updateItem(index, 'estimatedTime', e.target.value)}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`required-${index}`}
                checked={item.required}
                onChange={(e) => updateItem(index, 'required', e.target.checked)}
                className="rounded"
              />
              <label htmlFor={`required-${index}`} className="text-sm">
                Required
              </label>
            </div>
          </div>

          <Textarea
            placeholder="Instructions for this item (optional)"
            value={item.instructions}
            onChange={(e) => updateItem(index, 'instructions', e.target.value)}
            rows={2}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeItem(index)}
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    </div>
  );
};

export function ChecklistBuilderEngine({ open, onOpenChange, editingChecklist }: ChecklistBuilderEngineProps) {
  const [formData, setFormData] = useState({
    name: editingChecklist?.name || '',
    description: editingChecklist?.description || '',
    category: editingChecklist?.category || 'Onboarding',
    status: editingChecklist?.status || 'draft'
  });

  const [items, setItems] = useState(editingChecklist?.items || []);
  const [rules, setRules] = useState<any[]>([]);
  const [selectedAppointmentTypes, setSelectedAppointmentTypes] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const availableForms = [
    { id: 'QR-001', name: 'New Patient Intake Form', type: 'Form' },
    { id: 'QR-002', name: 'Annual Physical Questionnaire', type: 'Form' },
    { id: 'QR-003', name: 'COVID-19 Screening', type: 'Form' },
    { id: 'CON-001', name: 'HIPAA Privacy Consent', type: 'Consent' },
    { id: 'CON-002', name: 'Financial Responsibility Agreement', type: 'Consent' },
    { id: 'DOC-001', name: 'Welcome Letter', type: 'Document' },
  ];

  const appointmentTypes = ['New Patient', 'Follow-up', 'Annual Physical', 'Surgical Consultation'];
  const providers = ['Dr. Sarah Chen', 'Dr. Michael Torres', 'Dr. Lisa Wong', 'Dr. David Ford'];
  const locations = ['Main Campus', 'Brandon Medical Center', 'Westshore Clinic'];

  const addItem = (assetId: string) => {
    const asset = availableForms.find(f => f.id === assetId);
    if (!asset) return;

    setItems([...items, {
      id: `item-${items.length + 1}`,
      assetId: asset.id,
      assetName: asset.name,
      assetType: asset.type,
      order: items.length + 1,
      required: true,
      estimatedTime: '5-10 min',
      instructions: ''
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_: any, i: number) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = items[dragIndex];
    const newItems = [...items];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, dragItem);
    setItems(newItems);
  };

  const addRule = () => {
    setRules([...rules, {
      id: `rule-${rules.length + 1}`,
      field: 'appointmentType',
      operator: 'equals',
      value: ''
    }]);
  };

  const handleSave = () => {
    const planDefinition = {
      resourceType: 'PlanDefinition',
      id: editingChecklist?.id || 'PD-CL-001',
      status: 'active',
      name: formData.name,
      description: formData.description,
      type: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/plan-definition-type',
          code: 'workflow-definition'
        }]
      },
      action: items.map((item: any, idx: number) => ({
        id: item.id,
        title: item.assetName,
        description: item.instructions,
        definitionCanonical: `Questionnaire/${item.assetId}`,
        priority: item.required ? 'routine' : 'asap',
        prefix: String(idx + 1)
      })),
      useContext: [
        ...selectedAppointmentTypes.map(type => ({
          code: { system: 'http://terminology.hl7.org/CodeSystem/usage-context-type', code: 'focus' },
          valueCodeableConcept: { text: type }
        })),
        ...selectedProviders.map(provider => ({
          code: { system: 'http://terminology.hl7.org/CodeSystem/usage-context-type', code: 'user' },
          valueCodeableConcept: { text: provider }
        })),
        ...selectedLocations.map(location => ({
          code: { system: 'http://terminology.hl7.org/CodeSystem/usage-context-type', code: 'venue' },
          valueCodeableConcept: { text: location }
        }))
      ]
    };

    const url = `https://gpmobile.app/checklist/${Math.random().toString(36).substr(2, 9)}`;

    toast.success(`Checklist saved! URL: ${url}`);
    console.log('Created PlanDefinition:', planDefinition);
    console.log('Generated URL:', url);

    setTimeout(() => {
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            {editingChecklist ? 'Edit Checklist' : 'Create New Checklist'}
          </DialogTitle>
          <DialogDescription>
            {editingChecklist ? 'Modify checklist items and assignment rules' : 'Build a new patient checklist with forms, consents, and documents. Drag and drop to reorder items.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="builder" className="flex-1">
          <TabsList>
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="rules">Assignment Rules</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-4 max-h-[calc(95vh-200px)] overflow-y-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Checklist Name *</Label>
                  <Input
                    placeholder="e.g., New Patient Onboarding"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Onboarding">Onboarding</SelectItem>
                      <SelectItem value="Pre-Visit">Pre-Visit</SelectItem>
                      <SelectItem value="Post-Visit">Post-Visit</SelectItem>
                      <SelectItem value="Surgical">Surgical</SelectItem>
                      <SelectItem value="Administrative">Administrative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Checklist Items</Label>
                  <Select onValueChange={addItem}>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="+ Add Form/Consent/Document" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableForms.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          <div className="flex items-center gap-2">
                            {form.type === 'Form' && <FileText className="w-4 h-4" />}
                            {form.type === 'Consent' && <Shield className="w-4 h-4" />}
                            {form.type === 'Document' && <File className="w-4 h-4" />}
                            {form.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DndProvider backend={HTML5Backend}>
                  <div className="space-y-3">
                    {items.map((item: any, index: number) => (
                      <DraggableItem
                        key={item.id}
                        item={item}
                        index={index}
                        moveItem={moveItem}
                        updateItem={updateItem}
                        removeItem={removeItem}
                      />
                    ))}

                    {items.length === 0 && (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        No items added yet. Select forms, consents, or documents to add.
                      </div>
                    )}
                  </div>
                </DndProvider>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4 max-h-[calc(95vh-200px)] overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Applies To</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select when this checklist should be assigned to patients
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Appointment Types
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {appointmentTypes.map((type) => (
                        <Badge
                          key={type}
                          variant={selectedAppointmentTypes.includes(type) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            if (selectedAppointmentTypes.includes(type)) {
                              setSelectedAppointmentTypes(selectedAppointmentTypes.filter(t => t !== type));
                            } else {
                              setSelectedAppointmentTypes([...selectedAppointmentTypes, type]);
                            }
                          }}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Providers
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {providers.map((provider) => (
                        <Badge
                          key={provider}
                          variant={selectedProviders.includes(provider) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            if (selectedProviders.includes(provider)) {
                              setSelectedProviders(selectedProviders.filter(p => p !== provider));
                            } else {
                              setSelectedProviders([...selectedProviders, provider]);
                            }
                          }}
                        >
                          {provider}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Locations
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {locations.map((location) => (
                        <Badge
                          key={location}
                          variant={selectedLocations.includes(location) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            if (selectedLocations.includes(location)) {
                              setSelectedLocations(selectedLocations.filter(l => l !== location));
                            } else {
                              setSelectedLocations([...selectedLocations, location]);
                            }
                          }}
                        >
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium mb-2">Advanced Rule Builder</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Create complex conditional rules with AND/OR logic (coming soon)
                </p>
                <Button variant="outline" disabled>
                  <Settings className="w-4 h-4 mr-2" />
                  Add Advanced Rule
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="max-h-[calc(95vh-200px)] overflow-y-auto">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <h3 className="text-xl mb-2">{formData.name || 'Untitled Checklist'}</h3>
                {formData.description && (
                  <p className="text-sm text-gray-600 mb-6">{formData.description}</p>
                )}

                <div className="space-y-3">
                  {items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.assetName}</span>
                          {item.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                        {item.instructions && (
                          <p className="text-xs text-gray-600">{item.instructions}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Est. {item.estimatedTime}</p>
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <p className="text-center text-gray-400 py-8">
                      No items to preview
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Will be assigned to:</p>
                    <div className="space-y-1">
                      {selectedAppointmentTypes.length > 0 && (
                        <p>• Appointment types: {selectedAppointmentTypes.join(', ')}</p>
                      )}
                      {selectedProviders.length > 0 && (
                        <p>• Providers: {selectedProviders.join(', ')}</p>
                      )}
                      {selectedLocations.length > 0 && (
                        <p>• Locations: {selectedLocations.join(', ')}</p>
                      )}
                      {selectedAppointmentTypes.length === 0 && selectedProviders.length === 0 && selectedLocations.length === 0 && (
                        <p className="text-amber-600">No assignment rules configured</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#007CBE] hover:bg-[#006BA6]">
            <Save className="w-4 h-4 mr-2" />
            Save Checklist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}