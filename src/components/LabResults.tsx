import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Calendar,
  RefreshCw,
  FileText,
  ChevronRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface LabResultsProps {
  patientId: string;
  useLiveData?: boolean;
}

interface LabTest {
  code: string;
  name: string;
  value: number;
  unit: string;
  referenceRange: {
    low: number;
    high: number;
  };
  interpretation: 'normal' | 'high' | 'low' | 'critical';
  effectiveDate: string;
  category: string;
}

interface LabPanel {
  name: string;
  date: string;
  orderedBy: string;
  status: string;
  tests: LabTest[];
}

const FHIR_BASE_URL = 'https://fhir-api.fhirstaging.aws.greenwayhealth.com/fhir/R4/2.16.840.1.113883.3.441.350831';

export function LabResults({ patientId, useLiveData = false }: LabResultsProps) {
  const [labPanels, setLabPanels] = useState<LabPanel[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveFHIRData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lab observations
      const response = await fetch(
        `${FHIR_BASE_URL}/Observation?patient=${patientId}&category=laboratory&_sort=-date&_count=100`,
        {
          headers: { 'Accept': 'application/fhir+json' }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch lab results: ${response.status}`);
      }

      const bundle = await response.json();
      const observations = bundle.entry?.map((e: any) => e.resource) || [];

      // Group by date (DiagnosticReport would be better, but using date grouping)
      const panelMap = new Map<string, LabTest[]>();

      observations.forEach((obs: any) => {
        const date = obs.effectiveDateTime || obs.issued || '';
        const dateKey = date.split('T')[0]; // Group by day

        const test: LabTest = {
          code: obs.code?.coding?.[0]?.code || 'unknown',
          name: obs.code?.text || obs.code?.coding?.[0]?.display || 'Unknown Test',
          value: obs.valueQuantity?.value || 0,
          unit: obs.valueQuantity?.unit || '',
          referenceRange: {
            low: obs.referenceRange?.[0]?.low?.value || 0,
            high: obs.referenceRange?.[0]?.high?.value || 0
          },
          interpretation: interpretResult(obs.interpretation?.[0]?.coding?.[0]?.code),
          effectiveDate: date,
          category: obs.category?.[0]?.coding?.[0]?.display || 'Laboratory'
        };

        if (!panelMap.has(dateKey)) {
          panelMap.set(dateKey, []);
        }
        panelMap.get(dateKey)?.push(test);
      });

      // Convert to panel format
      const panels: LabPanel[] = Array.from(panelMap.entries()).map(([date, tests]) => ({
        name: determinePanelName(tests),
        date: tests[0]?.effectiveDate || date,
        orderedBy: 'Provider',
        status: 'final',
        tests
      }));

      setLabPanels(panels);
      setLoading(false);
    } catch (err: any) {
      console.error('FHIR lab results error:', err);
      setError(err.message || 'Failed to fetch lab results');
      setLoading(false);
    }
  };

  const fetchMockData = async () => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 600));

    const mockPanels: LabPanel[] = [
      {
        name: 'Comprehensive Metabolic Panel',
        date: '2025-11-15T08:30:00Z',
        orderedBy: 'Dr. Sarah Martinez',
        status: 'final',
        tests: [
          { code: '2345-7', name: 'Glucose', value: 95, unit: 'mg/dL', referenceRange: { low: 70, high: 100 }, interpretation: 'normal', effectiveDate: '2025-11-15T08:30:00Z', category: 'Chemistry' },
          { code: '2160-0', name: 'Creatinine', value: 0.9, unit: 'mg/dL', referenceRange: { low: 0.7, high: 1.3 }, interpretation: 'normal', effectiveDate: '2025-11-15T08:30:00Z', category: 'Chemistry' },
          { code: '3094-0', name: 'BUN', value: 18, unit: 'mg/dL', referenceRange: { low: 7, high: 20 }, interpretation: 'normal', effectiveDate: '2025-11-15T08:30:00Z', category: 'Chemistry' },
          { code: '2951-2', name: 'Sodium', value: 140, unit: 'mmol/L', referenceRange: { low: 136, high: 145 }, interpretation: 'normal', effectiveDate: '2025-11-15T08:30:00Z', category: 'Chemistry' },
          { code: '2823-3', name: 'Potassium', value: 4.2, unit: 'mmol/L', referenceRange: { low: 3.5, high: 5.1 }, interpretation: 'normal', effectiveDate: '2025-11-15T08:30:00Z', category: 'Chemistry' },
        ]
      },
      {
        name: 'Lipid Panel',
        date: '2025-11-15T08:30:00Z',
        orderedBy: 'Dr. Sarah Martinez',
        status: 'final',
        tests: [
          { code: '2093-3', name: 'Total Cholesterol', value: 195, unit: 'mg/dL', referenceRange: { low: 0, high: 200 }, interpretation: 'normal', effectiveDate: '2025-11-15T08:30:00Z', category: 'Lipids' },
          { code: '2085-9', name: 'HDL Cholesterol', value: 58, unit: 'mg/dL', referenceRange: { low: 40, high: 999 }, interpretation: 'normal', effectiveDate: '2025-11-15T08:30:00Z', category: 'Lipids' },
          { code: '2571-8', name: 'Triglycerides', value: 125, unit: 'mg/dL', referenceRange: { low: 0, high: 150 }, interpretation: 'normal', effectiveDate: '2025-11-15T08:30:00Z', category: 'Lipids' },
          { code: '13457-7', name: 'LDL Cholesterol', value: 112, unit: 'mg/dL', referenceRange: { low: 0, high: 100 }, interpretation: 'high', effectiveDate: '2025-11-15T08:30:00Z', category: 'Lipids' },
        ]
      },
      {
        name: 'Complete Blood Count',
        date: '2025-09-20T09:15:00Z',
        orderedBy: 'Dr. Sarah Martinez',
        status: 'final',
        tests: [
          { code: '6690-2', name: 'WBC Count', value: 7.2, unit: 'K/uL', referenceRange: { low: 4.5, high: 11.0 }, interpretation: 'normal', effectiveDate: '2025-09-20T09:15:00Z', category: 'Hematology' },
          { code: '789-8', name: 'RBC Count', value: 4.8, unit: 'M/uL', referenceRange: { low: 4.2, high: 5.9 }, interpretation: 'normal', effectiveDate: '2025-09-20T09:15:00Z', category: 'Hematology' },
          { code: '718-7', name: 'Hemoglobin', value: 14.2, unit: 'g/dL', referenceRange: { low: 12.0, high: 16.0 }, interpretation: 'normal', effectiveDate: '2025-09-20T09:15:00Z', category: 'Hematology' },
          { code: '777-3', name: 'Platelet Count', value: 245, unit: 'K/uL', referenceRange: { low: 150, high: 400 }, interpretation: 'normal', effectiveDate: '2025-09-20T09:15:00Z', category: 'Hematology' },
        ]
      },
      {
        name: 'Lipid Panel',
        date: '2025-05-10T08:30:00Z',
        orderedBy: 'Dr. Sarah Martinez',
        status: 'final',
        tests: [
          { code: '2093-3', name: 'Total Cholesterol', value: 210, unit: 'mg/dL', referenceRange: { low: 0, high: 200 }, interpretation: 'high', effectiveDate: '2025-05-10T08:30:00Z', category: 'Lipids' },
          { code: '2085-9', name: 'HDL Cholesterol', value: 55, unit: 'mg/dL', referenceRange: { low: 40, high: 999 }, interpretation: 'normal', effectiveDate: '2025-05-10T08:30:00Z', category: 'Lipids' },
          { code: '2571-8', name: 'Triglycerides', value: 145, unit: 'mg/dL', referenceRange: { low: 0, high: 150 }, interpretation: 'normal', effectiveDate: '2025-05-10T08:30:00Z', category: 'Lipids' },
          { code: '13457-7', name: 'LDL Cholesterol', value: 126, unit: 'mg/dL', referenceRange: { low: 0, high: 100 }, interpretation: 'high', effectiveDate: '2025-05-10T08:30:00Z', category: 'Lipids' },
        ]
      },
      {
        name: 'Lipid Panel',
        date: '2024-11-08T08:30:00Z',
        orderedBy: 'Dr. Sarah Martinez',
        status: 'final',
        tests: [
          { code: '2093-3', name: 'Total Cholesterol', value: 218, unit: 'mg/dL', referenceRange: { low: 0, high: 200 }, interpretation: 'high', effectiveDate: '2024-11-08T08:30:00Z', category: 'Lipids' },
          { code: '2085-9', name: 'HDL Cholesterol', value: 52, unit: 'mg/dL', referenceRange: { low: 40, high: 999 }, interpretation: 'normal', effectiveDate: '2024-11-08T08:30:00Z', category: 'Lipids' },
          { code: '2571-8', name: 'Triglycerides', value: 158, unit: 'mg/dL', referenceRange: { low: 0, high: 150 }, interpretation: 'high', effectiveDate: '2024-11-08T08:30:00Z', category: 'Lipids' },
          { code: '13457-7', name: 'LDL Cholesterol', value: 134, unit: 'mg/dL', referenceRange: { low: 0, high: 100 }, interpretation: 'high', effectiveDate: '2024-11-08T08:30:00Z', category: 'Lipids' },
        ]
      },
    ];

    setLabPanels(mockPanels);
    setLoading(false);
  };

  useEffect(() => {
    if (useLiveData) {
      fetchLiveFHIRData();
    } else {
      fetchMockData();
    }
  }, [patientId, useLiveData]);

  const interpretResult = (code: string): 'normal' | 'high' | 'low' | 'critical' => {
    if (!code) return 'normal';
    const lower = code.toLowerCase();
    if (lower.includes('h') || lower.includes('high')) return 'high';
    if (lower.includes('l') || lower.includes('low')) return 'low';
    if (lower.includes('critical') || lower.includes('panic')) return 'critical';
    return 'normal';
  };

  const determinePanelName = (tests: LabTest[]): string => {
    const categories = new Set(tests.map(t => t.category));
    if (categories.has('Lipids')) return 'Lipid Panel';
    if (categories.has('Hematology')) return 'Complete Blood Count';
    if (categories.has('Chemistry')) return 'Metabolic Panel';
    return 'Laboratory Results';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getInterpretationBadge = (interpretation: string) => {
    switch (interpretation) {
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700">High</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-700">Low</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-700">Critical</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-700">Normal</Badge>;
    }
  };

  const getTrendData = (testCode: string) => {
    // Find all instances of this test across all panels
    const dataPoints: { date: string, value: number, dateObj: Date }[] = [];
    
    labPanels.forEach(panel => {
      const test = panel.tests.find(t => t.code === testCode);
      if (test) {
        dataPoints.push({
          date: formatDate(test.effectiveDate),
          value: test.value,
          dateObj: new Date(test.effectiveDate)
        });
      }
    });

    // Sort by date
    return dataPoints.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  };

  const handleRefresh = () => {
    if (useLiveData) {
      fetchLiveFHIRData();
    } else {
      fetchMockData();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 mb-2">Unable to load lab results</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If viewing trend for a specific test
  if (selectedTest) {
    const allTests = labPanels.flatMap(p => p.tests);
    const test = allTests.find(t => t.code === selectedTest);
    const trendData = getTrendData(selectedTest);

    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-4 pb-24">
          <Button variant="ghost" size="sm" onClick={() => setSelectedTest(null)} className="mb-2">
            ← Back to All Results
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{test?.name}</span>
                {test && getInterpretationBadge(test.interpretation)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {test && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Latest Value</div>
                    <div className="text-gray-900">{test.value} {test.unit}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Reference Range</div>
                    <div className="text-gray-900 text-sm">{test.referenceRange.low} - {test.referenceRange.high}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Latest Test</div>
                    <div className="text-gray-900 text-sm">{formatDate(test.effectiveDate)}</div>
                  </div>
                </div>
              )}

              {trendData.length > 1 && test && (
                <div>
                  <h4 className="text-sm text-gray-600 mb-3">Trend Over Time</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <ReferenceLine y={test.referenceRange.high} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'High', fontSize: 11 }} />
                      <ReferenceLine y={test.referenceRange.low} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Low', fontSize: 11 }} />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {trendData.length === 1 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No historical data available for trending
                </div>
              )}

              <div>
                <h4 className="text-sm text-gray-600 mb-3">Test History</h4>
                <div className="space-y-2">
                  {trendData.reverse().map((point, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-gray-900">{point.value} {test?.unit}</div>
                        <div className="text-xs text-gray-500">{point.date}</div>
                      </div>
                      {test && (
                        <div>
                          {point.value > test.referenceRange.high ? (
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                          ) : point.value < test.referenceRange.low ? (
                            <TrendingDown className="w-5 h-5 text-blue-500" />
                          ) : (
                            <span className="text-green-600 text-xs">✓</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-4 pb-24">
        {useLiveData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Live FHIR Data</span>
            </div>
            <Button onClick={handleRefresh} variant="ghost" size="sm" className="h-auto p-1">
              <RefreshCw className="w-4 h-4 text-green-600" />
            </Button>
          </div>
        )}

        {labPanels.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No lab results available</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recent">Recent Results</TabsTrigger>
              <TabsTrigger value="all">All Tests</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4 mt-4">
              {labPanels.slice(0, 3).map((panel, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{panel.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(panel.date)}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {panel.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {panel.tests.map((test, testIdx) => (
                      <button
                        key={testIdx}
                        onClick={() => setSelectedTest(test.code)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 text-left">
                          <div className="text-gray-900">{test.name}</div>
                          <div className="text-sm text-gray-500">
                            {test.value} {test.unit}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getInterpretationBadge(test.interpretation)}
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                    <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                      Ordered by: {panel.orderedBy}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="all" className="space-y-4 mt-4">
              {labPanels.map((panel, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{panel.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(panel.date)}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {panel.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {panel.tests.map((test, testIdx) => (
                      <button
                        key={testIdx}
                        onClick={() => setSelectedTest(test.code)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 text-left">
                          <div className="text-gray-900">{test.name}</div>
                          <div className="text-sm text-gray-500">
                            {test.value} {test.unit}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getInterpretationBadge(test.interpretation)}
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                    <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                      Ordered by: {panel.orderedBy}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ScrollArea>
  );
}
