import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

export function MessagingTemplates() {
  const [patientTemplates, setPatientTemplates] = useState([
    { id: '1', name: 'Route Confirmation', description: 'Sent when message is routed to staff', content: "Thank you for your message. I've forwarded your inquiry to our {role} team. A staff member will respond within {response_time}.", variables: ['{role}', '{response_time}', '{staff_name}'] },
    { id: '2', name: 'Fallback Message', description: 'When AI cannot answer or route', content: "I apologize, but I'm unable to assist with this request. Please call our office at {office_phone} and our staff will be happy to help you.", variables: ['{office_phone}', '{office_hours}'] },
    { id: '3', name: 'Delivery Success', description: 'Confirmation that message was delivered', content: "Your message has been successfully delivered to our {role} team.", variables: ['{role}'] },
    { id: '4', name: 'Delivery Failure', description: 'When message delivery fails', content: "We're experiencing technical difficulties and couldn't deliver your message. Please try again, or contact us at {office_phone}.", variables: ['{office_phone}'] },
    { id: '5', name: 'After-Hours Message', description: 'Sent when contacting outside office hours', content: "Thank you for contacting us. Our office is currently closed. We're open {office_hours}. Your message will be reviewed when we reopen. For urgent medical needs, please call 911 or visit the nearest emergency room.", variables: ['{office_hours}'] },
    { id: '6', name: 'Appointment Limitation Notice', description: 'When patient asks to schedule/cancel appointments', content: "I can provide information about appointments, but I'm unable to schedule, reschedule, or cancel appointments. Please call {scheduling_phone} or use our patient portal to manage your appointments.", variables: ['{scheduling_phone}', '{portal_url}'] },
  ]);

  const [editOpen, setEditOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [editContent, setEditContent] = useState('');

  const handleEdit = (template: any) => {
    setCurrentTemplate(template);
    setEditContent(template.content);
    setEditOpen(true);
  };

  const handleSave = () => {
    if (currentTemplate) {
      setPatientTemplates(patientTemplates.map(t => 
        t.id === currentTemplate.id 
          ? { ...t, content: editContent }
          : t
      ));
      setEditOpen(false);
      setCurrentTemplate(null);
    }
  };

  const handleDelete = (id: string) => {
    setPatientTemplates(patientTemplates.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Messaging Templates</h2>
        <p className="text-gray-600 mt-1">Configure automated message templates for patients and staff</p>
      </div>

      <Tabs defaultValue="patient" className="space-y-6">
        <TabsList>
          <TabsTrigger value="patient">Patient-Facing</TabsTrigger>
          <TabsTrigger value="staff">Staff-Facing</TabsTrigger>
        </TabsList>

        <TabsContent value="patient" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient-Facing Templates</CardTitle>
              <CardDescription>Automated messages sent to patients during conversations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {patientTemplates.map(template => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="text-sm">{template.name}</Label>
                      <p className="text-xs text-gray-500">{template.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Textarea 
                    rows={3}
                    defaultValue={template.content}
                  />
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {template.variables.map(variable => (
                      <code key={variable} className="bg-gray-100 px-2 py-1 rounded">{variable}</code>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <Button>Save Patient Templates</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff-Facing Templates</CardTitle>
              <CardDescription>Internal notifications and ticket formats for staff members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-sm">EHR Queue Subject Line</Label>
                    <p className="text-xs text-gray-500">Subject for messages sent to EHR</p>
                  </div>
                  <Button variant="outline" size="sm">Reset to Default</Button>
                </div>
                <Input 
                  defaultValue="Patient Message - {role} - {patient_name}"
                />
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{role}'}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{patient_name}'}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{patient_mrn}'}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{timestamp}'}</code>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-sm">EHR Queue Message Body</Label>
                    <p className="text-xs text-gray-500">Template for EHR queue messages</p>
                  </div>
                  <Button variant="outline" size="sm">Reset to Default</Button>
                </div>
                <Textarea 
                  rows={8}
                  defaultValue={`Patient: {patient_name} (MRN: {patient_mrn})
Channel: {channel}
Received: {timestamp}

AI Routing: {role} ({confidence_score}% confidence)

Original Message:
{patient_message}

---
AI Summary: {ai_summary}`}
                />
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-sm">Ticketing System Subject</Label>
                    <p className="text-xs text-gray-500">Subject for ticketing system</p>
                  </div>
                  <Button variant="outline" size="sm">Reset to Default</Button>
                </div>
                <Input 
                  defaultValue="[{role}] Patient Inquiry - {patient_name}"
                />
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-sm">Ticketing System Body</Label>
                    <p className="text-xs text-gray-500">Template for ticket body</p>
                  </div>
                  <Button variant="outline" size="sm">Reset to Default</Button>
                </div>
                <Textarea 
                  rows={6}
                  defaultValue={`Patient: {patient_name}
MRN: {patient_mrn}
Channel: {channel}
Category: {role}

Message:
{patient_message}`}
                />
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-sm">Staff Alert Labels</Label>
                    <p className="text-xs text-gray-500">Tags/labels applied to routed messages</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="label-clinical" className="text-xs">Clinical</Label>
                    <Input id="label-clinical" defaultValue="CLINICAL, PATIENT-MSG" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="label-scheduling" className="text-xs">Scheduling</Label>
                    <Input id="label-scheduling" defaultValue="SCHEDULING, APPOINTMENT" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="label-billing" className="text-xs">Billing</Label>
                    <Input id="label-billing" defaultValue="BILLING, PAYMENT" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="label-general" className="text-xs">General</Label>
                    <Input id="label-general" defaultValue="GENERAL, INFO" />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-sm">Callback Request Format</Label>
                    <p className="text-xs text-gray-500">Template for phone callback requests</p>
                  </div>
                  <Button variant="outline" size="sm">Reset to Default</Button>
                </div>
                <Textarea 
                  rows={5}
                  defaultValue={`CALLBACK REQUEST

Patient: {patient_name}
Phone: {patient_phone}
Preferred Time: {preferred_time}
Reason: {callback_reason}

Message: {patient_message}`}
                />
              </div>

              <div className="pt-4">
                <Button>Save Staff Templates</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Make changes to the template content.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={5}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}