import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { InfoBanner } from './InfoBanner';
import {
  ArrowRight,
  Smartphone,
  Server,
  Database,
  Monitor,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Eye,
  AlertCircle,
  Play,
  RotateCcw,
  ChevronRight,
  Activity,
  Zap,
  MessageSquare,
  ClipboardCheck,
  Upload,
  Download,
  ArrowDown
} from 'lucide-react';

interface Lane {
  id: string;
  title: string;
}

interface Node {
  id: string;
  lane: string;
  title: string;
  subtitle: string;
  details: string;
  type: 'action' | 'event' | 'state' | 'process';
  fhir_calls: string[];
}

const dataFlowStructure = {
  lanes: [
    {
      id: "lane_patient",
      title: "Patient App"
    },
    {
      id: "lane_fhir",
      title: "HealthLake (FHIR Store)"
    },
    {
      id: "lane_integration",
      title: "Integration Service"
    },
    {
      id: "lane_ehr",
      title: "EHR (Staff UI)"
    }
  ],
  nodes: [
    {
      id: "P1",
      lane: "lane_patient",
      title: "Open Pre‑Visit Checklist",
      subtitle: "GET /billing/patient/checklist?patientId=123",
      details: "Tasks: Intake Form, Financial Consent, Insurance Upload",
      type: "action" as const,
      fhir_calls: [
        "GET Task?for=Patient/123&_include=Task:focus"
      ]
    },
    {
      id: "P2",
      lane: "lane_patient",
      title: "Complete Intake Form",
      subtitle: "GET Questionnaire/new-patient-intake",
      details: "Render Questionnaire (SDC), validate locally",
      type: "action" as const,
      fhir_calls: [
        "GET Questionnaire?url=.../new-patient-intake"
      ]
    },
    {
      id: "P3",
      lane: "lane_patient",
      title: "Submit Intake",
      subtitle: "POST QuestionnaireResponse (status=in-progress→completed)",
      details: "Include coded answers (SNOMED/LOINC) + text; link Patient/Encounter",
      type: "event" as const,
      fhir_calls: [
        "POST QuestionnaireResponse"
      ]
    },
    {
      id: "P4",
      lane: "lane_patient",
      title: "Sign Financial Consent",
      subtitle: "POST Consent + DocumentReference + Provenance.signature",
      details: "Attach signed artifact (PDF) and signature metadata",
      type: "event" as const,
      fhir_calls: [
        "POST Consent",
        "POST DocumentReference",
        "POST Provenance"
      ]
    },
    {
      id: "HL1",
      lane: "lane_fhir",
      title: "FHIR Stores Submission",
      subtitle: "QuestionnaireResponse.status=completed",
      details: "HealthLake persists resources; ready for eventing",
      type: "state" as const,
      fhir_calls: []
    },
    {
      id: "HL2",
      lane: "lane_fhir",
      title: "Subscription Trigger",
      subtitle: "criteria: QuestionnaireResponse?status=completed",
      details: "REST hook notifies Integration endpoint",
      type: "event" as const,
      fhir_calls: [
        "Subscription (rest-hook)"
      ]
    },
    {
      id: "INT1",
      lane: "lane_integration",
      title: "Assemble Bundle",
      subtitle: "GET QR + Patient + Encounter + Consent/DocRef",
      details: "Fetch related resources by references/ids",
      type: "process" as const,
      fhir_calls: [
        "GET QuestionnaireResponse/{id}",
        "GET Patient/{id}",
        "GET Encounter/{id}",
        "GET Consent?patient=...",
        "GET DocumentReference?subject=..."
      ]
    },
    {
      id: "INT2",
      lane: "lane_integration",
      title: "Create PDF Snapshot (optional)",
      subtitle: "Render Intake → DocumentReference",
      details: "Human-readable artifact for chart & audit",
      type: "process" as const,
      fhir_calls: [
        "POST DocumentReference (if generated here)"
      ]
    },
    {
      id: "INT3",
      lane: "lane_integration",
      title: "Generate Discrete Data",
      subtitle: "Map key answers → Observation/Condition/etc.",
      details: "SNOMED/LOINC/ICD-10 codified; retain vendor concept id if present",
      type: "process" as const,
      fhir_calls: [
        "POST Observation",
        "POST Condition"
      ]
    },
    {
      id: "INT4",
      lane: "lane_integration",
      title: "Notify EHR (Message)",
      subtitle: "POST Communication (in-basket)",
      details: "Payload: summary + refs to QR/Consent/DocRef",
      type: "event" as const,
      fhir_calls: [
        "POST Communication"
      ]
    },
    {
      id: "INT5",
      lane: "lane_integration",
      title: "Assign Work (Task)",
      subtitle: "POST Task → PractitionerRole/Team",
      details: "Reason: Review pre-visit forms before encounter",
      type: "event" as const,
      fhir_calls: [
        "POST Task"
      ]
    },
    {
      id: "EHR1",
      lane: "lane_ehr",
      title: "Staff Inbox Receives Message",
      subtitle: "Communication.status=in-progress",
      details: "Link opens DocumentReference + discrete data view",
      type: "state" as const,
      fhir_calls: []
    },
    {
      id: "EHR2",
      lane: "lane_ehr",
      title: "Open Intake PDF",
      subtitle: "GET DocumentReference + Binary",
      details: "Human-friendly review",
      type: "action" as const,
      fhir_calls: [
        "GET DocumentReference/{id}",
        "GET Binary/{id}"
      ]
    },
    {
      id: "EHR3",
      lane: "lane_ehr",
      title: "Review & File Discrete Data",
      subtitle: "Accept/merge Observations/Conditions",
      details: "Optionally edit before filing to chart",
      type: "process" as const,
      fhir_calls: [
        "PUT/PATCH Observation",
        "PUT/PATCH Condition"
      ]
    },
    {
      id: "EHR4",
      lane: "lane_ehr",
      title: "Complete Work",
      subtitle: "PATCH Task.status=completed; Communication.status=completed",
      details: "Closes pre-visit admin loop",
      type: "event" as const,
      fhir_calls: [
        "PATCH Task/{id}",
        "PATCH Communication/{id}"
      ]
    },
    {
      id: "HL3",
      lane: "lane_fhir",
      title: "Status Sync (optional)",
      subtitle: "Mirror EHR Task status back to FHIR",
      details: "Keeps HealthLake ledger aligned",
      type: "state" as const,
      fhir_calls: [
        "PATCH Task/{id} (FHIR mirror)"
      ]
    }
  ]
};

export function FHIRDataFlowDiagram() {
  const [currentNodeIndex, setCurrentNodeIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const runAnimation = async () => {
    setIsAnimating(true);
    setSelectedNode(null);
    
    for (let i = 0; i < dataFlowStructure.nodes.length; i++) {
      setCurrentNodeIndex(i);
      await new Promise(resolve => setTimeout(resolve, 1800));
    }
    
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    setCurrentNodeIndex(-1);
    setIsAnimating(false);
    setSelectedNode(null);
  };

  const isNodeActive = (index: number) => index <= currentNodeIndex;
  const isNodeCurrent = (index: number) => index === currentNodeIndex;

  const getNodeColor = (node: Node) => {
    switch (node.type) {
      case 'action': return 'blue';
      case 'event': return 'green';
      case 'state': return 'gray';
      case 'process': return 'orange';
      default: return 'gray';
    }
  };

  const getLaneIcon = (laneId: string) => {
    switch (laneId) {
      case 'lane_patient': return Smartphone;
      case 'lane_fhir': return Database;
      case 'lane_integration': return Zap;
      case 'lane_ehr': return Monitor;
      default: return Server;
    }
  };

  const getLaneColor = (laneId: string) => {
    switch (laneId) {
      case 'lane_patient': return 'blue';
      case 'lane_fhir': return 'green';
      case 'lane_integration': return 'orange';
      case 'lane_ehr': return 'purple';
      default: return 'gray';
    }
  };

  // Group nodes by lane
  const nodesByLane = dataFlowStructure.lanes.map(lane => ({
    lane,
    nodes: dataFlowStructure.nodes
      .map((node, index) => ({ node, index }))
      .filter(({ node }) => node.lane === lane.id)
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>FHIR Data Flow: Patient Forms to EHR</h2>
          <p className="text-gray-600 mt-1">
            Complete end-to-end data flow with FHIR API calls
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={runAnimation}
            disabled={isAnimating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {isAnimating ? 'Running...' : 'Run Animation'}
          </Button>
          <Button
            variant="outline"
            onClick={resetAnimation}
            disabled={isAnimating}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <InfoBanner 
        title="What is this section used for?"
        description="Visualize the complete FHIR-compliant data flow from patient form submission to EHR storage. See step-by-step how patient data is validated, mapped to FHIR resources (QuestionnaireResponse, Observation, Condition), and written to the EHR via standardized FHIR R4 API calls."
      />

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Action (User Interaction)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Event (API Call/Trigger)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm">Process (Transformation)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-sm">State (Data Storage)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swimlanes */}
      <div className="grid grid-cols-4 gap-4">
        {nodesByLane.map(({ lane, nodes }) => {
          const Icon = getLaneIcon(lane.id);
          const laneColor = getLaneColor(lane.id);
          
          return (
            <div key={lane.id} className="space-y-3">
              {/* Lane Header */}
              <Card className={`bg-${laneColor}-50 border-${laneColor}-200`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 text-${laneColor}-600`} />
                    <CardTitle className="text-base">{lane.title}</CardTitle>
                  </div>
                </CardHeader>
              </Card>

              {/* Nodes in this lane */}
              {nodes.map(({ node, index }, nodeIndex) => {
                const nodeColor = getNodeColor(node);
                const isActive = isNodeActive(index);
                const isCurrent = isNodeCurrent(index);
                const isSelected = selectedNode?.id === node.id;

                return (
                  <React.Fragment key={node.id}>
                    {/* Arrow between nodes */}
                    {nodeIndex > 0 && (
                      <div className="flex justify-center py-1">
                        <ArrowDown 
                          className={`w-5 h-5 transition-colors ${
                            isActive ? `text-${nodeColor}-500` : 'text-gray-300'
                          }`} 
                        />
                      </div>
                    )}

                    {/* Node Card */}
                    <Card 
                      className={`border-2 transition-all cursor-pointer ${
                        isActive 
                          ? `border-${nodeColor}-500 bg-${nodeColor}-50` 
                          : 'border-gray-200 bg-white opacity-60'
                      } ${
                        isCurrent ? `ring-4 ring-${nodeColor}-300` : ''
                      } ${
                        isSelected ? `ring-2 ring-${nodeColor}-500` : ''
                      }`}
                      onClick={() => setSelectedNode(node)}
                    >
                      <CardContent className="pt-4 pb-3">
                        {/* Node Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] bg-${nodeColor}-100 text-${nodeColor}-800 border-${nodeColor}-300`}
                              >
                                {node.type.toUpperCase()}
                              </Badge>
                              <span className="text-[10px] text-gray-500">{node.id}</span>
                            </div>
                            <h4 className="font-medium text-sm">{node.title}</h4>
                          </div>
                          {isActive && (
                            <CheckCircle2 className={`w-4 h-4 text-${nodeColor}-600 flex-shrink-0`} />
                          )}
                        </div>

                        {/* Subtitle */}
                        <div className="text-xs text-gray-700 mb-2 font-mono bg-white p-2 rounded border">
                          {node.subtitle}
                        </div>

                        {/* Details */}
                        <div className="text-xs text-gray-600 mb-2">
                          {node.details}
                        </div>

                        {/* FHIR Calls */}
                        {node.fhir_calls.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              FHIR API Calls:
                            </div>
                            <div className="space-y-1">
                              {node.fhir_calls.map((call, i) => (
                                <div 
                                  key={i} 
                                  className={`text-[10px] font-mono bg-${nodeColor}-50 text-${nodeColor}-800 px-2 py-1 rounded border border-${nodeColor}-200`}
                                >
                                  {call}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Status Badge */}
                        {isCurrent && (
                          <div className="mt-2">
                            <Badge className={`bg-${nodeColor}-600 text-xs`}>
                              Currently Processing
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Node Details: {selectedNode.id}</CardTitle>
                <CardDescription>{selectedNode.title}</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedNode(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Type</div>
                <Badge variant="outline" className={`bg-${getNodeColor(selectedNode)}-100`}>
                  {selectedNode.type.toUpperCase()}
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Lane</div>
                <div className="text-sm text-gray-600">
                  {dataFlowStructure.lanes.find(l => l.id === selectedNode.lane)?.title}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">API Endpoint</div>
              <div className="text-sm font-mono bg-gray-100 p-2 rounded border">
                {selectedNode.subtitle}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Details</div>
              <div className="text-sm text-gray-600">
                {selectedNode.details}
              </div>
            </div>

            {selectedNode.fhir_calls.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">FHIR API Calls</div>
                <div className="space-y-2">
                  {selectedNode.fhir_calls.map((call, i) => (
                    <div key={i} className="text-sm font-mono bg-blue-50 text-blue-900 px-3 py-2 rounded border border-blue-200">
                      {call}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Information */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {dataFlowStructure.nodes.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Across 4 system lanes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">FHIR Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">12+</div>
            <p className="text-sm text-gray-600 mt-1">
              Task, QuestionnaireResponse, Consent, Observation, etc.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Integration Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">5</div>
            <p className="text-sm text-gray-600 mt-1">
              Key transformation & routing steps
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technical Architecture */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Architecture Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">FHIR Resources Created</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>QuestionnaireResponse</strong> - Patient form answers with coded values (SNOMED/LOINC)
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Consent</strong> - Financial consent record with signature
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>DocumentReference</strong> - PDF artifacts for human review
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Provenance</strong> - Digital signature metadata and audit trail
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Observation</strong> - Discrete clinical data (smoking status, vitals, etc.)
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Condition</strong> - Codified diagnoses and health conditions
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Communication</strong> - Staff inbox message with references
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Task</strong> - Work assignment for pre-visit review
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Integration Patterns</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <strong>Event-Driven Architecture</strong> - FHIR Subscriptions with REST hooks trigger processing
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <strong>Async Processing</strong> - Queue-based transformation pipeline
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <strong>Standards-Based</strong> - FHIR R4 throughout entire data flow
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <strong>Terminology Mapping</strong> - SNOMED CT, LOINC, ICD-10 coding
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <strong>Audit Trail</strong> - Complete provenance chain with signatures
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <strong>Bi-directional Sync</strong> - EHR task status mirrored to HealthLake
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <strong>SDC Questionnaire:</strong> Uses FHIR Structured Data Capture for advanced form rendering with skip logic and validation
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Key Benefits</h3>
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-blue-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">Patient Experience</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Complete forms once on mobile, automatically available to all providers across the network
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-green-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">Data Quality</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Structured FHIR data with standardized codes, ready for clinical decision support and analytics
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-purple-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-sm">Staff Efficiency</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Automated intake, discrete data ready to review, no manual data entry required
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
