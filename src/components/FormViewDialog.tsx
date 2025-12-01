import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  FileText, 
  Calendar, 
  CheckCircle2,
  Edit,
  Download,
  Eye,
  Globe
} from 'lucide-react';

interface FormViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  onEdit?: () => void;
}

export function FormViewDialog({ open, onOpenChange, form, onEdit }: FormViewDialogProps) {
  if (!form) return null;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Questionnaire': 'bg-blue-100 text-blue-700',
      'Consent': 'bg-purple-100 text-purple-700',
      'Intake': 'bg-green-100 text-green-700',
      'Assessment': 'bg-orange-100 text-orange-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-700',
      'draft': 'bg-amber-100 text-amber-700',
      'retired': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle>{form.name}</DialogTitle>
              <DialogDescription className="sr-only">View form details and metadata</DialogDescription>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{form.id}</Badge>
                <Badge className={getTypeColor(form.type)}>{form.type}</Badge>
                <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
                <Badge variant="outline">v{form.version}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button size="sm" variant="outline" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-6 py-4">
            {/* Form Metadata */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</div>
                  <p className="text-sm">{form.description}</p>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Category</div>
                  <Badge variant="outline">{form.category}</Badge>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Estimated Time</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{form.estimatedTime}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Languages</div>
                  <div className="flex flex-wrap gap-1">
                    {form.languages?.map((lang: string) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        <Globe className="w-3 h-3 mr-1" />
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Required For</div>
                  <div className="flex flex-wrap gap-1">
                    {form.requiredFor?.map((req: string) => (
                      <Badge key={req} variant="secondary" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Last Updated</div>
                  <p className="text-sm">{form.lastUpdated} by {form.createdBy}</p>
                </div>
              </div>
            </div>

            {/* Questions Preview */}
            {form.type === 'Questionnaire' && (
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg">Form Questions ({form.questions})</h3>
                </div>
                
                <div className="space-y-3">
                  {/* Sample Questions - In real app, these would come from the form data */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                        1
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">What is your primary reason for today's visit?</p>
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        </div>
                        <p className="text-xs text-gray-500">Type: Text</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                        2
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">Are you currently experiencing any pain?</p>
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        </div>
                        <p className="text-xs text-gray-500">Type: Yes/No</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">When did your symptoms begin?</p>
                        </div>
                        <p className="text-xs text-gray-500">Type: Date</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-3 text-sm text-gray-500">
                    ... and {Math.max(0, form.questions - 3)} more questions
                  </div>
                </div>
              </div>
            )}

            {/* Consent PDF Preview */}
            {form.type === 'Consent' && (
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg">Consent Document</h3>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium mb-1">{form.name}.pdf</p>
                  <p className="text-sm text-gray-600 mb-4">PDF document attached</p>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview PDF
                  </Button>
                </div>
              </div>
            )}

            {/* Usage Statistics */}
            <div className="border-t pt-6">
              <h3 className="text-lg mb-4">Usage Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl text-blue-700 mb-1">247</div>
                  <div className="text-xs text-gray-600">Total Submissions</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl text-green-700 mb-1">89%</div>
                  <div className="text-xs text-gray-600">Completion Rate</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <div className="text-2xl text-amber-700 mb-1">8.5 min</div>
                  <div className="text-xs text-gray-600">Avg. Time</div>
                </div>
              </div>
            </div>

            {/* FHIR Resource Preview */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg">FHIR Resource</h3>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download JSON
                </Button>
              </div>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs">
{`{
  "resourceType": "Questionnaire",
  "id": "${form.id}",
  "status": "${form.status}",
  "version": "${form.version}",
  "name": "${form.name}",
  "title": "${form.name}",
  "description": "${form.description}",
  "date": "2025-11-24T00:00:00Z",
  "publisher": "Practice Management System",
  "purpose": "${form.category}",
  "item": [
    {
      "linkId": "1",
      "text": "What is your primary reason for today's visit?",
      "type": "text",
      "required": true
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}