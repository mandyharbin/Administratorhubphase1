import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function DetectionLexicons() {
  const [lexicons, setLexicons] = useState({
    clinical: ['symptoms', 'pain', 'medication', 'prescription', 'doctor', 'nurse', 'refill', 'sick', 'injury'],
    scheduling: ['appointment', 'schedule', 'reschedule', 'cancel', 'book', 'available', 'when can i', 'slot', 'time'],
    billing: ['bill', 'payment', 'insurance', 'cost', 'charge', 'invoice', 'balance', 'how much', 'pay'],
  });

  const [newPhrase, setNewPhrase] = useState({
    clinical: '',
    scheduling: '',
    billing: ''
  });

  const handleAddPhrase = (category: 'clinical' | 'scheduling' | 'billing') => {
    const phrase = newPhrase[category].trim();
    if (phrase) {
      setLexicons({
        ...lexicons,
        [category]: [...lexicons[category], phrase]
      });
      setNewPhrase({
        ...newPhrase,
        [category]: ''
      });
    }
  };

  const handleDeletePhrase = (category: 'clinical' | 'scheduling' | 'billing', index: number) => {
    setLexicons({
      ...lexicons,
      [category]: lexicons[category].filter((_, idx) => idx !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Detection Lexicons</h2>
        <p className="text-gray-600 mt-1">Manage detection words and phrases for intelligent routing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clinical Phrases</CardTitle>
          <CardDescription>Words and phrases that indicate clinical questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Add new phrase or synonym..." 
                value={newPhrase.clinical}
                onChange={(e) => setNewPhrase({ ...newPhrase, clinical: e.target.value })}
              />
              <Button onClick={() => handleAddPhrase('clinical')}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {lexicons.clinical.map((phrase, idx) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1 flex items-center gap-2">
                  {phrase}
                  <button className="hover:text-red-600" onClick={() => handleDeletePhrase('clinical', idx)}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling Phrases</CardTitle>
          <CardDescription>Words and phrases that indicate scheduling requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Add new phrase or synonym..." 
                value={newPhrase.scheduling}
                onChange={(e) => setNewPhrase({ ...newPhrase, scheduling: e.target.value })}
              />
              <Button onClick={() => handleAddPhrase('scheduling')}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {lexicons.scheduling.map((phrase, idx) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1 flex items-center gap-2">
                  {phrase}
                  <button className="hover:text-red-600" onClick={() => handleDeletePhrase('scheduling', idx)}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Phrases</CardTitle>
          <CardDescription>Words and phrases that indicate billing inquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Add new phrase or synonym..." 
                value={newPhrase.billing}
                onChange={(e) => setNewPhrase({ ...newPhrase, billing: e.target.value })}
              />
              <Button onClick={() => handleAddPhrase('billing')}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {lexicons.billing.map((phrase, idx) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1 flex items-center gap-2">
                  {phrase}
                  <button className="hover:text-red-600" onClick={() => handleDeletePhrase('billing', idx)}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}