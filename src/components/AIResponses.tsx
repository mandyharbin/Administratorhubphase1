import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Bot, Save, Edit2 } from 'lucide-react';
import { InfoBanner } from './InfoBanner';

export function AIResponses() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');

  const [responses, setResponses] = useState([
    {
      id: 'route-confirmation',
      name: 'Route Confirmation',
      description: 'Sent when message is routed to staff',
      content: "Thank you for your message. I've forwarded your inquiry to our {role} team. A staff member will respond within {response_time}.",
      autoSent: true
    },
    {
      id: 'fallback',
      name: 'Fallback Message',
      description: 'When AI cannot answer or route',
      content: "I apologize, but I'm unable to assist with this request. Please call our office at {office_phone} and our staff will be happy to help you.",
      autoSent: true
    },
    {
      id: 'after-hours',
      name: 'After-Hours Message',
      description: 'Sent when contacting outside office hours',
      content: "Thank you for contacting us. Our office is currently closed. We're open {office_hours}. Your message will be reviewed when we reopen. For urgent medical needs, please call 911 or visit the nearest emergency room.",
      autoSent: true
    },
    {
      id: 'appointment-limitation',
      name: 'Appointment Limitation Notice',
      description: 'When patient asks to schedule/cancel appointments',
      content: "I can provide information about appointments, but I'm unable to schedule, reschedule, or cancel appointments. Please call {scheduling_phone} or use our patient portal to manage your appointments.",
      autoSent: true
    }
  ]);

  const handleEdit = (response: typeof responses[0]) => {
    setEditingId(response.id);
    setEditedContent(response.content);
  };

  const handleSave = (responseId: string) => {
    setResponses(responses.map(r => 
      r.id === responseId ? { ...r, content: editedContent } : r
    ));
    setEditingId(null);
    setEditedContent('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedContent('');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <Bot className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl">AI Auto Replies</h1>
          <p className="text-gray-500">Configure automated responses sent by the AI assistant</p>
        </div>
      </div>

      <InfoBanner 
        title="What is this section used for?"
        description="Customize the automated messages sent by the AI Receptionist in specific scenarios, such as routing confirmations, after-hours responses, fallback messages, and appointment limitation notices. These messages support dynamic variables like {role}, {response_time}, and {office_phone}."
      />

      <div className="bg-white rounded-lg border border-[#BDBDBD] p-6 space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            These messages are automatically sent by the AI assistant in specific scenarios. 
            You can customize the content while preserving the variable placeholders in curly braces.
          </p>
        </div>

        <div className="space-y-4">
          {responses.map((response) => (
            <div key={response.id} className="border border-[#BDBDBD] rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{response.name}</span>
                  {response.autoSent && (
                    <Badge variant="outline" className="text-xs">AUTO</Badge>
                  )}
                </div>
                {editingId !== response.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(response)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              
              <p className="text-sm text-gray-500 mb-3">{response.description}</p>
              
              {editingId === response.id ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`edit-${response.id}`}>Message Content</Label>
                    <Textarea
                      id={`edit-${response.id}`}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use variables like {'{role}'}, {'{response_time}'}, {'{office_phone}'}, {'{office_hours}'}, {'{scheduling_phone}'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave(response.id)}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-3 rounded border border-[#BDBDBD] text-sm">
                  {response.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
