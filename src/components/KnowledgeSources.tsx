import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Upload, FileText, Pencil, Trash2, File, Download, Search, Eye, Clock, AlertCircle, Languages, FileUp, FileDown, ChevronRight, Tag, ThumbsUp, ThumbsDown, MessageSquare, Sparkles, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { useState } from 'react';
import { InfoBanner } from './InfoBanner';

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

export function KnowledgeSources() {
  const [faqs, setFaqs] = useState([
    // General FAQs
    { id: '1', question: 'What are your office hours?', answer: '8 AM - 5 PM Monday - Friday, Saturday 9 AM - 1 PM (By appointment only), Sunday Closed', role: 'general' },
    { id: '2', question: 'Where is your office located?', answer: 'Main Office: 123 Medical Plaza Drive, Suite 200, Anytown, ST 12345', role: 'general' },
    { id: '3', question: 'How can I contact the office?', answer: 'Main Line: (555) 123-4567, Fax: (555) 123-4568, Email: info@medicalpractice.com', role: 'general' },
    { id: '4', question: 'Is parking available?', answer: 'Free parking is available in the lot behind our building. Handicapped accessible parking is available near the main entrance.', role: 'general' },
    
    // Billing FAQs
    { id: '5', question: 'What insurance do you accept?', answer: 'We accept most major insurance plans including Blue Cross Blue Shield, Aetna, United Healthcare, Cigna, Medicare, and Medicaid.', role: 'billing' },
    { id: '6', question: 'How do I verify my insurance?', answer: 'Please call our billing department at (555) 123-4567 with your insurance card information, and we\'ll verify your coverage before your appointment.', role: 'billing' },
    { id: '7', question: 'What payment methods do you accept?', answer: 'We accept cash, credit cards (Visa, MasterCard, American Express, Discover), debit cards, HSA/FSA cards, and personal checks.', role: 'billing' },
    { id: '8', question: 'Do you offer payment plans?', answer: 'Yes, we offer flexible payment plans for balances over $500. Please speak with our billing team to set up a payment arrangement.', role: 'billing' },
    
    // Scheduling FAQs
    { id: '9', question: 'How do I schedule an appointment?', answer: 'You can schedule an appointment by calling our office at (555) 123-4567, using our patient portal, or sending a secure message through the app.', role: 'scheduling' },
    { id: '10', question: 'What is your cancellation policy?', answer: 'We require at least 24 hours notice for appointment cancellations. Late cancellations or no-shows may result in a $50 fee.', role: 'scheduling' },
    { id: '11', question: 'How early should I arrive?', answer: 'Please arrive 15 minutes before your scheduled appointment time to complete any necessary paperwork.', role: 'scheduling' },
    { id: '12', question: 'What should I bring to my appointment?', answer: 'Please bring: Photo ID, Insurance card(s), List of current medications, Any relevant medical records from other providers.', role: 'scheduling' },
    
    // Clinical FAQs
    { id: '13', question: 'How do I request a prescription refill?', answer: 'You can request prescription refills through the patient portal, by calling our office, or asking your pharmacy to contact us directly.', role: 'clinical' },
    { id: '14', question: 'What should I do if I have a medical emergency?', answer: 'For medical emergencies, please call 911 immediately. For urgent medical needs after hours, please call our answering service at (555) 123-4567.', role: 'clinical' },
  ]);

  const [documents, setDocuments] = useState([
    { id: '1', name: 'Office Hours & Location Info', type: 'PDF', size: '245 KB', uploadedDate: 'Mar 10', role: 'General' },
    { id: '2', name: 'Insurance & Payment FAQ', type: 'PDF', size: '189 KB', uploadedDate: 'Mar 8', role: 'Billing' },
    { id: '3', name: 'Appointment Policies', type: 'PDF', size: '156 KB', uploadedDate: 'Mar 5', role: 'Scheduling' },
    { id: '4', name: 'Common Lab Test Info', type: 'PDF', size: '312 KB', uploadedDate: 'Mar 1', role: 'Clinical' },
    { id: '5', name: 'Patient Portal Guide', type: 'PDF', size: '428 KB', uploadedDate: 'Feb 28', role: 'General' },
  ]);

  const [addFaqOpen, setAddFaqOpen] = useState(false);
  const [editFaqOpen, setEditFaqOpen] = useState(false);
  const [uploadDocOpen, setUploadDocOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<any>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newRole, setNewRole] = useState('general');
  const [uploadRole, setUploadRole] = useState('general');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleAddFaq = () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      setFaqs([...faqs, {
        id: Date.now().toString(),
        question: newQuestion,
        answer: newAnswer,
        role: newRole
      }]);
      setNewQuestion('');
      setNewAnswer('');
      setNewRole('general');
      setAddFaqOpen(false);
    }
  };

  const handleEditFaq = (faq: any) => {
    setCurrentFaq(faq);
    setNewQuestion(faq.question);
    setNewAnswer(faq.answer);
    setNewRole(faq.role);
    setEditFaqOpen(true);
  };

  const handleSaveFaq = () => {
    if (currentFaq && newQuestion.trim() && newAnswer.trim()) {
      setFaqs(faqs.map(f => 
        f.id === currentFaq.id 
          ? { ...f, question: newQuestion, answer: newAnswer, role: newRole }
          : f
      ));
      setEditFaqOpen(false);
      setCurrentFaq(null);
      setNewQuestion('');
      setNewAnswer('');
      setNewRole('general');
    }
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
  };

  const getFaqsByRole = (role: string) => {
    return faqs.filter(f => f.role === role);
  };

  const handleUploadDoc = () => {
    if (selectedFile) {
      const newDoc = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: selectedFile.type,
        size: `${Math.round(selectedFile.size / 1024)} KB`,
        uploadedDate: new Date().toLocaleDateString(),
        role: uploadRole
      };
      setDocuments([...documents, newDoc]);
      setSelectedFile(null);
      setUploadRole('general');
      setUploadDocOpen(false);
    }
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  const knowledgeDocs = [
    { id: '1', title: 'Office Hours & Location Info', role: 'General', updated: '2024-03-10', status: 'Active' },
    { id: '2', title: 'Insurance & Payment FAQ', role: 'Billing', updated: '2024-03-08', status: 'Active' },
    { id: '3', title: 'Appointment Policies', role: 'Scheduling', updated: '2024-03-05', status: 'Active' },
    { id: '4', title: 'Common Lab Test Info', role: 'Clinical', updated: '2024-03-01', status: 'Active' },
    { id: '5', title: 'Patient Portal Guide', role: 'General', updated: '2024-02-28', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2>Knowledge Sources</h2>
        <p className="text-gray-600 mt-1">Manage knowledge base FAQs by role category</p>
      </div>

      <InfoBanner 
        title="What is this section used for?"
        description="Build and maintain the knowledge base that powers the AI Receptionist. Create role-based FAQs, upload documents, manage content by category (Billing, Scheduling, Clinical, General), and track content performance with analytics on answer confidence and user feedback."
      />

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div>
                <div className="text-sm mb-2">The AI Assistant uses your knowledge base to answer patient questions.</div>
                <div className="text-xs text-gray-700 space-y-1">
                  <div><strong>Supported file types:</strong> PDF (.pdf), Word (.doc, .docx), Text (.txt), Markdown (.md)</div>
                  <div><strong>How it works:</strong> Upload documents or add FAQs, and the AI will automatically reference them when answering patient questions</div>
                  <div><strong>Processing:</strong> Documents are analyzed and indexed within 2-5 minutes after upload</div>
                </div>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white">
                    <Sparkles className="w-4 h-4 mr-2" />
                    See AI in Action - Test Response
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>AI Assistant Response Preview</DialogTitle>
                    <DialogDescription>
                      See how the AI uses your knowledge base to answer patient questions
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    {/* Patient Question Examples */}
                    <div className="space-y-3">
                      <Label>Example Patient Questions</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" className="justify-start text-xs h-auto py-2 px-3">
                          <MessageSquare className="w-3 h-3 mr-2 flex-shrink-0" />
                          What are your appointment policies?
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start text-xs h-auto py-2 px-3">
                          <MessageSquare className="w-3 h-3 mr-2 flex-shrink-0" />
                          What insurance do you accept?
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start text-xs h-auto py-2 px-3">
                          <MessageSquare className="w-3 h-3 mr-2 flex-shrink-0" />
                          Where are you located?
                        </Button>
                      </div>
                    </div>

                    {/* Simulated Conversation */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="space-y-4">
                        {/* Patient Message */}
                        <div className="flex justify-end">
                          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                            <div className="text-sm">What are your appointment policies?</div>
                          </div>
                        </div>

                        {/* AI Typing Indicator */}
                        <div className="flex justify-start">
                          <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-2.5">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] space-y-3">
                            <div className="text-sm space-y-2">
                              <p>Here's what you need to know about our appointment policies:</p>
                              
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong>Scheduling:</strong> You can book appointments by calling (555) 123-4567, using our patient portal, or sending a secure message through the app.
                                </div>
                                
                                <div>
                                  <strong>Cancellation Policy:</strong> We require at least 24 hours notice for cancellations. Late cancellations or no-shows may result in a $50 fee.
                                </div>
                                
                                <div>
                                  <strong>Arrival Time:</strong> Please arrive 15 minutes early to complete any necessary paperwork.
                                </div>
                                
                                <div>
                                  <strong>What to Bring:</strong>
                                  <ul className="list-disc ml-5 mt-1 space-y-0.5">
                                    <li>Photo ID</li>
                                    <li>Insurance card(s)</li>
                                    <li>List of current medications</li>
                                    <li>Any relevant medical records from other providers</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                            
                            {/* Knowledge Source Reference */}
                            <div className="pt-2 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <FileText className="w-3 h-3" />
                                <span>Source: Appointment Policies (Scheduling Knowledge Base)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* How It Works */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <div className="text-sm">How the AI uses your knowledge base:</div>
                      </div>
                      <div className="space-y-2 text-xs text-gray-700 ml-6">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-[10px]">1</div>
                          <div>Patient asks a question in the chat</div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-[10px]">2</div>
                          <div>AI searches your FAQs and uploaded documents for relevant information</div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-[10px]">3</div>
                          <div>AI generates a natural, conversational response using your official policies</div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-[10px]">4</div>
                          <div>If AI cannot answer, the message is routed to staff with "Talk to Staff" option</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mb-4">
        <div className="flex gap-2">
          <Dialog open={addFaqOpen} onOpenChange={setAddFaqOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New FAQ</DialogTitle>
                <DialogDescription>Create a question-answer pair for the AI knowledge base</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="faq-question">Question</Label>
                  <Input 
                    id="faq-question" 
                    placeholder="e.g., What are your office hours?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faq-answer">Answer</Label>
                  <Textarea 
                    id="faq-answer"
                    rows={5}
                    placeholder="e.g., 8 AM - 5 PM Monday - Friday"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faq-role">Role Category</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger id="faq-role">
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

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddFaq} className="flex-1">Add FAQ</Button>
                  <Button variant="outline" onClick={() => setAddFaqOpen(false)} className="flex-1">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadDocOpen} onOpenChange={setUploadDocOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>Upload a document for the AI knowledge base</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-file">File</Label>
                  <Input 
                    id="doc-file" 
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-role">Role Category</Label>
                  <Select value={uploadRole} onValueChange={setUploadRole}>
                    <SelectTrigger id="doc-role">
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

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUploadDoc} className="flex-1">Upload Document</Button>
                  <Button variant="outline" onClick={() => setUploadDocOpen(false)} className="flex-1">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* General FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>General FAQs</CardTitle>
            <CardDescription>{getFaqsByRole('general').length} questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getFaqsByRole('general').length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">No FAQs yet</div>
              ) : (
                getFaqsByRole('general').map((faq) => (
                  <div key={faq.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm mb-1">
                          <strong>Q:</strong> {faq.question}
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>A:</strong> {faq.answer}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditFaq(faq)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFaq(faq.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Billing FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Billing FAQs</CardTitle>
            <CardDescription>{getFaqsByRole('billing').length} questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getFaqsByRole('billing').length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">No FAQs yet</div>
              ) : (
                getFaqsByRole('billing').map((faq) => (
                  <div key={faq.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm mb-1">
                          <strong>Q:</strong> {faq.question}
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>A:</strong> {faq.answer}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditFaq(faq)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFaq(faq.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scheduling FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduling FAQs</CardTitle>
            <CardDescription>{getFaqsByRole('scheduling').length} questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getFaqsByRole('scheduling').length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">No FAQs yet</div>
              ) : (
                getFaqsByRole('scheduling').map((faq) => (
                  <div key={faq.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm mb-1">
                          <strong>Q:</strong> {faq.question}
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>A:</strong> {faq.answer}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditFaq(faq)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFaq(faq.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clinical FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical FAQs</CardTitle>
            <CardDescription>{getFaqsByRole('clinical').length} questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getFaqsByRole('clinical').length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">No FAQs yet</div>
              ) : (
                getFaqsByRole('clinical').map((faq) => (
                  <div key={faq.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm mb-1">
                          <strong>Q:</strong> {faq.question}
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>A:</strong> {faq.answer}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditFaq(faq)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFaq(faq.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit FAQ Dialog */}
      <Dialog open={editFaqOpen} onOpenChange={setEditFaqOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>Update the question-answer pair</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-faq-question">Question</Label>
              <Input 
                id="edit-faq-question" 
                placeholder="e.g., What are your office hours?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-faq-answer">Answer</Label>
              <Textarea 
                id="edit-faq-answer"
                rows={5}
                placeholder="e.g., 8 AM - 5 PM Monday - Friday"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-faq-role">Role Category</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger id="edit-faq-role">
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

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveFaq} className="flex-1">Save Changes</Button>
              <Button variant="outline" onClick={() => setEditFaqOpen(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Documents Section */}
      <div>
        <h3>Uploaded Documents</h3>
        <p className="text-gray-600 mt-1 mb-4">Knowledge base documents available to AI</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4 text-gray-400" />
                      <span>{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.type}</Badge>
                  </TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>{doc.uploadedDate}</TableCell>
                  <TableCell>
                    <Badge>{doc.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteDoc(doc.id)}>
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
    </div>
  );
}