import { useState } from 'react';
import { ChevronLeft, FileText, Activity, Pill, AlertTriangle, Syringe, TestTube, Stethoscope, Image as ImageIcon, Users } from 'lucide-react';
import { Badge } from './ui/badge';
import { JohnSmithFacesheet } from './JohnSmithFacesheet';

interface PatientChartViewProps {
  patientName: string;
  patientId: string;
  chartData: any;
  onBack: () => void;
}

type ChartTab = 'chart' | 'orders' | 'notes' | 'problems' | 'meds' | 'allergies' | 'vitals' | 'labs' | 'encounters' | 'immunizations' | 'imaging';

export function PatientChartView({ patientName, patientId, chartData, onBack }: PatientChartViewProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>('chart');
  const hasData = chartData && Object.keys(chartData).length > 0;

  // If it's John Smith, always show the facesheet (regardless of active tab when first loaded)
  if (patientName === 'Smith, John' && activeTab === 'chart') {
    return <JohnSmithFacesheet onBack={onBack} chartData={chartData} />;
  }

  const navItems = [
    { id: 'chart' as ChartTab, label: 'Chart', icon: FileText },
    { id: 'orders' as ChartTab, label: 'Orders & Charges', icon: Activity },
    { id: 'notes' as ChartTab, label: 'Notes', icon: FileText },
    { id: 'problems' as ChartTab, label: 'Problems', icon: AlertTriangle },
    { id: 'meds' as ChartTab, label: 'Meds', icon: Pill },
    { id: 'allergies' as ChartTab, label: 'Allergies', icon: AlertTriangle },
    { id: 'vitals' as ChartTab, label: 'Vitals', icon: Activity },
    { id: 'labs' as ChartTab, label: 'Labs', icon: TestTube },
    { id: 'encounters' as ChartTab, label: 'Encounters', icon: Stethoscope },
    { id: 'immunizations' as ChartTab, label: 'Immunizations', icon: Syringe },
    { id: 'imaging' as ChartTab, label: 'Imaging', icon: ImageIcon },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Patient Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1976D2] text-white flex items-center justify-center">
              <span className="text-sm font-medium">
                {patientName.split(',')[1]?.[0]?.trim() || 'J'}{patientName.split(',')[0]?.[0] || 'S'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg text-gray-900">{patientName}</h1>
                <span className="text-sm text-gray-500">{patientId}</span>
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              In Room
            </button>
            <button className="px-3 py-1.5 text-sm bg-[#1976D2] text-white rounded hover:bg-[#1565C0] transition-colors">
              Start Visit
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              TV Cart
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              Note
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              Collapse Chart
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <div className="w-[200px] bg-white border-r border-gray-200 overflow-y-auto">
          <div className="py-2">
            <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide">
              Patient View
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-[#1976D2] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chart' && (
            <div className="p-6 max-w-[1400px] mx-auto">
              {!hasData ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <FileText className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg text-gray-900 mb-2">No Chart Data Available</h3>
                  <p className="text-sm text-gray-600">
                    This patient's chart is empty. Accept pre-visit forms from the Tasks tab to populate the chart.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* AI Snapshot Section */}
                  <div className="bg-[#E3F2FD] rounded-lg border border-[#90CAF9] p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded bg-[#1976D2] text-white flex items-center justify-center flex-shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base text-gray-900 mb-2 font-medium">AI Snapshot</h3>
                        {chartData.lastUpdated && (
                          <p className="text-xs text-gray-600 mb-3">
                            Last updated: {new Date(chartData.lastUpdated).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        )}
                        <div className="space-y-2 text-sm text-gray-800">
                          {chartData.medicalHistory && chartData.medicalHistory.length > 0 && (
                            <div className="flex gap-2">
                              <span className="text-gray-600">•</span>
                              <span>Patient has significant medical history including {chartData.medicalHistory.map((h: any) => h.condition).join(', ')}</span>
                            </div>
                          )}
                          {chartData.medications && chartData.medications.length > 0 && (
                            <div className="flex gap-2">
                              <span className="text-gray-600">•</span>
                              <span>Currently taking {chartData.medications.length} medications including {chartData.medications.slice(0, 2).map((m: any) => m.name).join(', ')}</span>
                            </div>
                          )}
                          {chartData.familyHistory && chartData.familyHistory.length > 0 && (
                            <div className="flex gap-2">
                              <span className="text-gray-600">•</span>
                              <span>Family history notable for {chartData.familyHistory.map((f: any) => f.condition).join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Problems & Conditions */}
                      {chartData.medicalHistory && chartData.medicalHistory.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200">
                          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-base text-gray-900 font-medium flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              Problems & Conditions
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                Active
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                                All
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {chartData.medicalHistory.map((item: any) => (
                              <div key={item.id} className="pb-3 border-b border-gray-100 last:border-0">
                                <div className="text-sm text-gray-900 font-medium">{item.condition}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  ICD-10: {item.icd10 || 'Not specified'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Status: {item.status} | Diagnosed: {item.diagnosedYear}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Social History */}
                      {chartData.socialHistory && chartData.socialHistory.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200">
                          <div className="px-4 py-3 border-b border-gray-200">
                            <h3 className="text-base text-gray-900 font-medium flex items-center gap-2">
                              <Users className="w-4 h-4 text-green-600" />
                              Social History
                            </h3>
                          </div>
                          <div className="p-4 space-y-2">
                            {chartData.socialHistory.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                <span className="text-sm text-gray-600">{item.category}</span>
                                <span className="text-sm text-gray-900 font-medium">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Medications */}
                      {chartData.medications && chartData.medications.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200">
                          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-base text-gray-900 font-medium flex items-center gap-2">
                              <Pill className="w-4 h-4 text-orange-600" />
                              Medications
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                Current
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                                All
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {chartData.medications.map((item: any) => (
                              <div key={item.id} className="pb-3 border-b border-gray-100 last:border-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="text-sm text-gray-900 font-medium">{item.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">{item.dosage}</div>
                                    <div className="text-xs text-gray-500">{item.frequency}</div>
                                    {item.prescribedBy && (
                                      <div className="text-xs text-gray-500">Prescribed by: {item.prescribedBy}</div>
                                    )}
                                  </div>
                                  <Badge className="bg-green-100 text-green-700 text-xs ml-2">
                                    Active
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Allergies & Intolerances */}
                      <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="text-base text-gray-900 font-medium flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            Allergies & Intolerances
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                              Drug
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                              All
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            <div className="pb-2 border-b border-gray-100">
                              <div className="text-sm text-gray-900 font-medium">penicillin</div>
                              <div className="text-xs text-gray-500 mt-1">Reaction: Dry cough / Severity: Moderate</div>
                            </div>
                            <div className="pb-2 border-b border-gray-100">
                              <div className="text-sm text-gray-900 font-medium">ibuprofen (OTC & RX/bold)</div>
                              <div className="text-xs text-gray-500 mt-1">Reaction: Angioedema (Delayed) / Severity: Severe</div>
                            </div>
                            <div className="pb-2">
                              <div className="text-sm text-gray-900 font-medium">lisinopril</div>
                              <div className="text-xs text-gray-500 mt-1">Reaction: Dry cough / Severity: Moderate</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Family History */}
                  {chartData.familyHistory && chartData.familyHistory.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <h3 className="text-base text-gray-900 font-medium flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Family History
                        </h3>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {chartData.familyHistory.map((item: any) => (
                            <div key={item.id} className="pb-3 border-b border-gray-100">
                              <div className="text-sm text-gray-900 font-medium">{item.condition}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.relationship} - Age at diagnosis: {item.ageAtDiagnosis}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Surgical History */}
                  {chartData.surgicalHistory && chartData.surgicalHistory.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <h3 className="text-base text-gray-900 font-medium flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-purple-600" />
                          Surgical History
                        </h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {chartData.surgicalHistory.map((item: any) => (
                          <div key={item.id} className="pb-3 border-b border-gray-100 last:border-0">
                            <div className="text-sm text-gray-900 font-medium">{item.procedure}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.year} - {item.hospital}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Immunizations */}
                  {chartData.immunizations && chartData.immunizations.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <h3 className="text-base text-gray-900 font-medium flex items-center gap-2">
                          <Syringe className="w-4 h-4 text-teal-600" />
                          Immunizations
                        </h3>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {chartData.immunizations.map((item: any) => (
                            <div key={item.id} className="pb-3 border-b border-gray-100">
                              <div className="text-sm text-gray-900 font-medium">{item.vaccine}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.date}
                                {item.provider && ` - ${item.provider}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Other tabs - placeholder content */}
          {activeTab !== 'chart' && (
            <div className="p-6">
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <h3 className="text-lg text-gray-900 mb-2">{navItems.find(i => i.id === activeTab)?.label}</h3>
                <p className="text-sm text-gray-600">Content for this section coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}