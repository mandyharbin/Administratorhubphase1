import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { 
  CheckCircle, 
  FileText, 
  Heart,
  Users,
  Scissors,
  Home,
  Syringe,
  Pill,
  CreditCard,
  IdCard,
  Shield,
  Activity
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface MedicalHistoryItem {
  id: string;
  condition: string;
  diagnosedYear: string;
  status: string;
}

interface FamilyHistoryItem {
  id: string;
  relationship: string;
  condition: string;
  ageAtDiagnosis?: string;
}

interface SurgicalHistoryItem {
  id: string;
  procedure: string;
  year: string;
  hospital?: string;
}

interface SocialHistoryItem {
  category: string;
  value: string;
}

interface ImmunizationItem {
  id: string;
  vaccine: string;
  date: string;
  provider?: string;
}

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy?: string;
}

interface ChartReviewData {
  patientName: string;
  appointmentDate: string;
  completedDate: string;
  
  // Form sections
  medicalHistory: MedicalHistoryItem[];
  familyHistory: FamilyHistoryItem[];
  surgicalHistory: SurgicalHistoryItem[];
  socialHistory: SocialHistoryItem[];
  immunizations: ImmunizationItem[];
  medications: MedicationItem[];
  
  // Other completed forms
  financialConsent: boolean;
  hipaaAcknowledgment: boolean;
  covidScreening: {
    symptoms: string[];
    recentTravel: boolean;
  };
  insuranceCard: {
    uploaded: boolean;
    imageCount: number;
  };
  photoId: {
    uploaded: boolean;
  };
}

interface ChartReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ChartReviewData;
  onAccept?: (patientName: string, acceptedData: any) => void;
}

export function ChartReviewDialog({ open, onOpenChange, data, onAccept }: ChartReviewDialogProps) {
  // Selection states for each category
  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<Set<string>>(new Set());
  const [selectedFamilyHistory, setSelectedFamilyHistory] = useState<Set<string>>(new Set());
  const [selectedSurgicalHistory, setSelectedSurgicalHistory] = useState<Set<string>>(new Set());
  const [selectedSocialHistory, setSelectedSocialHistory] = useState<Set<string>>(new Set());
  const [selectedImmunizations, setSelectedImmunizations] = useState<Set<string>>(new Set());
  const [selectedMedications, setSelectedMedications] = useState<Set<string>>(new Set());
  
  const [acceptedSections, setAcceptedSections] = useState<Set<string>>(new Set());

  const toggleSelection = (category: string, id: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    setter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllInCategory = (items: any[], setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    setter(new Set(items.map(item => item.id)));
  };

  const deselectAllInCategory = (setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    setter(new Set());
  };

  const acceptSelectedItems = () => {
    const totalSelected = 
      selectedMedicalHistory.size +
      selectedFamilyHistory.size +
      selectedSurgicalHistory.size +
      selectedSocialHistory.size +
      selectedImmunizations.size +
      selectedMedications.size;

    if (totalSelected === 0) {
      toast.error('Please select at least one item to accept');
      return;
    }

    toast.success(`${totalSelected} item${totalSelected !== 1 ? 's' : ''} added to patient chart`);
    
    // Mark sections as accepted
    const newAccepted = new Set(acceptedSections);
    if (selectedMedicalHistory.size > 0) newAccepted.add('medical');
    if (selectedFamilyHistory.size > 0) newAccepted.add('family');
    if (selectedSurgicalHistory.size > 0) newAccepted.add('surgical');
    if (selectedSocialHistory.size > 0) newAccepted.add('social');
    if (selectedImmunizations.size > 0) newAccepted.add('immunizations');
    if (selectedMedications.size > 0) newAccepted.add('medications');
    setAcceptedSections(newAccepted);

    // Clear selections
    setSelectedMedicalHistory(new Set());
    setSelectedFamilyHistory(new Set());
    setSelectedSurgicalHistory(new Set());
    setSelectedSocialHistory(new Set());
    setSelectedImmunizations(new Set());
    setSelectedMedications(new Set());
  };

  const acceptAllItems = () => {
    const totalItems = 
      data.medicalHistory.length +
      data.familyHistory.length +
      data.surgicalHistory.length +
      data.socialHistory.length +
      data.immunizations.length +
      data.medications.length;

    toast.success(`All ${totalItems} items added to patient chart`, {
      description: 'Medical history, family history, surgical history, social history, immunizations, and medications have been imported.'
    });

    setAcceptedSections(new Set(['medical', 'family', 'surgical', 'social', 'immunizations', 'medications']));
    
    // Clear all selections
    setSelectedMedicalHistory(new Set());
    setSelectedFamilyHistory(new Set());
    setSelectedSurgicalHistory(new Set());
    setSelectedSocialHistory(new Set());
    setSelectedImmunizations(new Set());
    setSelectedMedications(new Set());
    
    // Call onAccept callback if provided
    if (onAccept) {
      onAccept(data.patientName, {
        medicalHistory: data.medicalHistory,
        familyHistory: data.familyHistory,
        surgicalHistory: data.surgicalHistory,
        socialHistory: data.socialHistory,
        immunizations: data.immunizations,
        medications: data.medications,
        financialConsent: data.financialConsent,
        hipaaAcknowledgment: data.hipaaAcknowledgment,
        covidScreening: data.covidScreening,
        insuranceCard: data.insuranceCard,
        photoId: data.photoId
      });
    }
  };

  const allAccepted = acceptedSections.size === 6;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <div className="p-6 pb-4 flex-shrink-0">
          <DialogHeader>
            <DialogTitle>Review Patient Forms - {data.patientName}</DialogTitle>
            <DialogDescription>
              Review and accept patient form submissions to chart. Completed on {data.completedDate}
            </DialogDescription>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-600 mt-1">
                  Appointment: {data.appointmentDate}
                </div>
              </div>
              {allAccepted && (
                <Badge className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  All Data Accepted
                </Badge>
              )}
            </div>
          </DialogHeader>

          {!allAccepted && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <strong>Review Instructions:</strong> Check each section below. Use checkboxes to select specific items, 
                  or click "Accept All to Chart" to import everything at once. No codes will be visible - only patient-friendly descriptions.
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4 pb-4 border-b">
            <Button onClick={acceptAllItems} disabled={allAccepted} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept All to Chart
            </Button>
            <Button 
              onClick={acceptSelectedItems} 
              variant="outline"
              disabled={
                selectedMedicalHistory.size === 0 &&
                selectedFamilyHistory.size === 0 &&
                selectedSurgicalHistory.size === 0 &&
                selectedSocialHistory.size === 0 &&
                selectedImmunizations.size === 0 &&
                selectedMedications.size === 0
              }
            >
              Accept Selected Items
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6">
            {/* Past Medical History */}
            <Section
              title="Past Medical History"
              icon={Heart}
              iconColor="text-red-600"
              bgColor="bg-red-50"
              borderColor="border-red-200"
              items={data.medicalHistory}
              selectedItems={selectedMedicalHistory}
              onToggleItem={(id) => toggleSelection('medical', id, setSelectedMedicalHistory)}
              onSelectAll={() => selectAllInCategory(data.medicalHistory, setSelectedMedicalHistory)}
              onDeselectAll={() => deselectAllInCategory(setSelectedMedicalHistory)}
              isAccepted={acceptedSections.has('medical')}
              renderItem={(item: MedicalHistoryItem) => (
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.condition}</div>
                  <div className="text-xs text-gray-600">
                    Diagnosed: {item.diagnosedYear} • Status: {item.status}
                  </div>
                </div>
              )}
            />

            {/* Family History */}
            <Section
              title="Family History"
              icon={Users}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-200"
              items={data.familyHistory}
              selectedItems={selectedFamilyHistory}
              onToggleItem={(id) => toggleSelection('family', id, setSelectedFamilyHistory)}
              onSelectAll={() => selectAllInCategory(data.familyHistory, setSelectedFamilyHistory)}
              onDeselectAll={() => deselectAllInCategory(setSelectedFamilyHistory)}
              isAccepted={acceptedSections.has('family')}
              renderItem={(item: FamilyHistoryItem) => (
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.relationship} - {item.condition}</div>
                  {item.ageAtDiagnosis && (
                    <div className="text-xs text-gray-600">Age at diagnosis: {item.ageAtDiagnosis}</div>
                  )}
                </div>
              )}
            />

            {/* Surgical History */}
            <Section
              title="Surgical History"
              icon={Scissors}
              iconColor="text-purple-600"
              bgColor="bg-purple-50"
              borderColor="border-purple-200"
              items={data.surgicalHistory}
              selectedItems={selectedSurgicalHistory}
              onToggleItem={(id) => toggleSelection('surgical', id, setSelectedSurgicalHistory)}
              onSelectAll={() => selectAllInCategory(data.surgicalHistory, setSelectedSurgicalHistory)}
              onDeselectAll={() => deselectAllInCategory(setSelectedSurgicalHistory)}
              isAccepted={acceptedSections.has('surgical')}
              renderItem={(item: SurgicalHistoryItem) => (
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.procedure}</div>
                  <div className="text-xs text-gray-600">
                    Year: {item.year}{item.hospital && ` • ${item.hospital}`}
                  </div>
                </div>
              )}
            />

            {/* Social History */}
            <Section
              title="Social History"
              icon={Home}
              iconColor="text-green-600"
              bgColor="bg-green-50"
              borderColor="border-green-200"
              items={data.socialHistory.map((item, idx) => ({ id: `social-${idx}`, ...item }))}
              selectedItems={selectedSocialHistory}
              onToggleItem={(id) => toggleSelection('social', id, setSelectedSocialHistory)}
              onSelectAll={() => selectAllInCategory(data.socialHistory.map((item, idx) => ({ id: `social-${idx}`, ...item })), setSelectedSocialHistory)}
              onDeselectAll={() => deselectAllInCategory(setSelectedSocialHistory)}
              isAccepted={acceptedSections.has('social')}
              renderItem={(item: any) => (
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.category}</div>
                  <div className="text-xs text-gray-600">{item.value}</div>
                </div>
              )}
            />

            {/* Immunizations */}
            <Section
              title="Immunizations"
              icon={Syringe}
              iconColor="text-teal-600"
              bgColor="bg-teal-50"
              borderColor="border-teal-200"
              items={data.immunizations}
              selectedItems={selectedImmunizations}
              onToggleItem={(id) => toggleSelection('immunizations', id, setSelectedImmunizations)}
              onSelectAll={() => selectAllInCategory(data.immunizations, setSelectedImmunizations)}
              onDeselectAll={() => deselectAllInCategory(setSelectedImmunizations)}
              isAccepted={acceptedSections.has('immunizations')}
              renderItem={(item: ImmunizationItem) => (
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.vaccine}</div>
                  <div className="text-xs text-gray-600">
                    Date: {item.date}{item.provider && ` • ${item.provider}`}
                  </div>
                </div>
              )}
            />

            {/* Medications */}
            <Section
              title="Current Medications"
              icon={Pill}
              iconColor="text-orange-600"
              bgColor="bg-orange-50"
              borderColor="border-orange-200"
              items={data.medications}
              selectedItems={selectedMedications}
              onToggleItem={(id) => toggleSelection('medications', id, setSelectedMedications)}
              onSelectAll={() => selectAllInCategory(data.medications, setSelectedMedications)}
              onDeselectAll={() => deselectAllInCategory(setSelectedMedications)}
              isAccepted={acceptedSections.has('medications')}
              renderItem={(item: MedicationItem) => (
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.name} - {item.dosage}</div>
                  <div className="text-xs text-gray-600">
                    {item.frequency}{item.prescribedBy && ` • Prescribed by ${item.prescribedBy}`}
                  </div>
                </div>
              )}
            />

            {/* Acceptance Summary */}
            {allAccepted && (
              <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900">Chart Updated Successfully</h3>
                    <p className="text-sm text-green-700">All form data has been imported to the patient's chart</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-green-800">{data.medicalHistory.length} Medical History Items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-green-800">{data.familyHistory.length} Family History Items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-green-800">{data.surgicalHistory.length} Surgical Procedures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-green-800">{data.socialHistory.length} Social History Items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-green-800">{data.immunizations.length} Immunizations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-green-800">{data.medications.length} Medications</span>
                  </div>
                </div>
              </div>
            )}

            {/* Other Completed Forms */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Other Completed Forms
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <Shield className="w-4 h-4 text-gray-600" />
                  <span>Financial Consent Agreement - Signed</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <Shield className="w-4 h-4 text-gray-600" />
                  <span>HIPAA Privacy Notice - Acknowledged</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <Activity className="w-4 h-4 text-gray-600" />
                  <span>COVID-19 Screening - No symptoms, No recent travel</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <span>Insurance Card - {data.insuranceCard.imageCount} images uploaded</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <IdCard className="w-4 h-4 text-gray-600" />
                  <span>Photo ID - Uploaded</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SectionProps<T extends { id: string }> {
  title: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  items: T[];
  selectedItems: Set<string>;
  onToggleItem: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isAccepted: boolean;
  renderItem: (item: T) => React.ReactNode;
}

function Section<T extends { id: string }>({
  title,
  icon: Icon,
  iconColor,
  bgColor,
  borderColor,
  items,
  selectedItems,
  onToggleItem,
  onSelectAll,
  onDeselectAll,
  isAccepted,
  renderItem
}: SectionProps<T>) {
  const allSelected = items.length > 0 && items.every(item => selectedItems.has(item.id));

  return (
    <div className={`border rounded-lg overflow-hidden ${isAccepted ? 'border-green-300 bg-green-50/50' : ''}`}>
      <div className={`p-3 ${isAccepted ? 'bg-green-100' : bgColor} border-b ${borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <h3 className="font-medium">{title}</h3>
          <Badge variant="outline" className="text-xs">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </Badge>
          {isAccepted && (
            <Badge className="bg-green-600 text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Accepted
            </Badge>
          )}
        </div>
        {!isAccepted && items.length > 0 && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={allSelected ? onDeselectAll : onSelectAll}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        )}
      </div>
      <div className="p-3">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500 italic">No items reported</div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  isAccepted
                    ? 'bg-white/50 border-green-200'
                    : selectedItems.has(item.id)
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {!isAccepted && (
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => onToggleItem(item.id)}
                    className="mt-1"
                  />
                )}
                {isAccepted && (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                )}
                {renderItem(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}