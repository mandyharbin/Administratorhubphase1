import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  DollarSign,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Building2,
  Receipt,
  TrendingDown,
  Clock,
  Smartphone,
  Mail
} from 'lucide-react';

// Mock data (simulating Greenway FHIR responses)
const billingSummary = {
  resourceType: "Account",
  id: "billing-summary-001",
  status: "active",
  summary: {
    totalGross: { value: 2845.50, currency: "USD" },
    totalInsurancePayments: { value: 1920.00, currency: "USD" },
    totalPatientPayments: { value: 450.00, currency: "USD" },
    totalAdjustments: { value: -125.50, currency: "USD" },
    currentBalance: { value: 350.00, currency: "USD" },
    pastDue: { value: 0.00, currency: "USD" }
  },
  insurance: [{
    priority: 1,
    coverage: {
      reference: "Coverage/cov-001",
      display: "Blue Cross Blue Shield - PPO"
    }
  }],
  lastPayment: {
    date: "2025-11-15",
    amount: { value: 150.00, currency: "USD" },
    method: "Credit Card",
    confirmationNumber: "PAY-2025-11-15-001"
  },
  statementCount: 3
};

const statements = {
  resourceType: "Bundle",
  type: "searchset",
  total: 3,
  entry: [
    {
      resource: {
        resourceType: "Invoice",
        id: "INV-2025-11-001",
        status: "balanced",
        date: "2025-11-01",
        totalGross: { value: 485.00, currency: "USD" },
        totalNet: { value: 150.00, currency: "USD" },
        lineItem: [
          {
            sequence: 1,
            chargeItemCodeableConcept: {
              coding: [{ code: "99214", display: "Office Visit - Level 4" }]
            }
          }
        ],
        accountStatus: "paid"
      }
    },
    {
      resource: {
        resourceType: "Invoice",
        id: "INV-2025-10-001",
        status: "balanced",
        date: "2025-10-01",
        totalGross: { value: 1250.00, currency: "USD" },
        totalNet: { value: 200.00, currency: "USD" },
        lineItem: [
          {
            sequence: 1,
            chargeItemCodeableConcept: {
              coding: [{ code: "45378", display: "Colonoscopy, Diagnostic" }]
            }
          }
        ],
        accountStatus: "paid"
      }
    },
    {
      resource: {
        resourceType: "Invoice",
        id: "INV-2025-09-001",
        status: "issued",
        date: "2025-09-01",
        totalGross: { value: 110.50, currency: "USD" },
        totalNet: { value: 0.00, currency: "USD" },
        lineItem: [
          {
            sequence: 1,
            chargeItemCodeableConcept: {
              coding: [{ code: "85025", display: "Complete Blood Count (CBC)" }]
            }
          }
        ],
        accountStatus: "balanced"
      }
    }
  ]
};

const statementDetail = {
  resourceType: "Invoice",
  id: "INV-123",
  status: "balanced",
  date: "2025-08-15",
  serviceDate: "2025-08-01",
  totalGross: { value: 650.00, currency: "USD" },
  totalNet: { value: 0.00, currency: "USD" },
  lineItem: [
    {
      sequence: 1,
      chargeItemCodeableConcept: {
        coding: [{ code: "99215", display: "Office Visit - Level 5" }],
        text: "Annual Physical Examination"
      },
      priceComponent: [
        { type: "base", code: { text: "Charged Amount" }, amount: { value: 350.00, currency: "USD" } },
        { type: "deduction", code: { text: "Insurance Adjustment" }, amount: { value: -100.00, currency: "USD" } },
        { type: "deduction", code: { text: "Insurance Payment" }, amount: { value: -200.00, currency: "USD" } }
      ],
      netAmount: { value: 50.00, currency: "USD" }
    },
    {
      sequence: 2,
      chargeItemCodeableConcept: {
        coding: [{ code: "80053", display: "Comprehensive Metabolic Panel" }],
        text: "Lab Work - Metabolic Panel"
      },
      priceComponent: [
        { type: "base", code: { text: "Charged Amount" }, amount: { value: 200.00, currency: "USD" } },
        { type: "deduction", code: { text: "Insurance Adjustment" }, amount: { value: -50.00, currency: "USD" } },
        { type: "deduction", code: { text: "Insurance Payment" }, amount: { value: -120.00, currency: "USD" } }
      ],
      netAmount: { value: 30.00, currency: "USD" }
    },
    {
      sequence: 3,
      chargeItemCodeableConcept: {
        coding: [{ code: "82947", display: "Glucose, Blood Test" }],
        text: "Lab Work - Glucose Test"
      },
      priceComponent: [
        { type: "base", code: { text: "Charged Amount" }, amount: { value: 100.00, currency: "USD" } },
        { type: "deduction", code: { text: "Insurance Adjustment" }, amount: { value: -25.00, currency: "USD" } },
        { type: "deduction", code: { text: "Insurance Payment" }, amount: { value: -60.00, currency: "USD" } }
      ],
      netAmount: { value: 15.00, currency: "USD" }
    }
  ],
  totalPriceComponent: [
    { type: "base", code: { text: "Total Charges" }, amount: { value: 650.00, currency: "USD" } },
    { type: "deduction", code: { text: "Total Insurance Adjustments" }, amount: { value: -175.00, currency: "USD" } },
    { type: "deduction", code: { text: "Total Insurance Payments" }, amount: { value: -380.00, currency: "USD" } },
    { type: "deduction", code: { text: "Patient Payment Received" }, amount: { value: -95.00, currency: "USD" } }
  ],
  note: [{ text: "Thank you for your payment of $95.00 received on September 10, 2025. Your account is now paid in full." }],
  accountStatus: "balanced",
  participant: [{
    actor: { display: "Dr. Emily Chen, MD" }
  }],
  paymentStatus: { text: "Paid in Full" },
  payments: [
    {
      date: "2025-08-20",
      amount: { value: 380.00, currency: "USD" },
      type: { text: "Insurance Payment" },
      payer: { display: "Blue Cross Blue Shield" }
    },
    {
      date: "2025-09-10",
      amount: { value: 95.00, currency: "USD" },
      type: { text: "Patient Payment - Credit Card" },
      confirmationNumber: "PAY-2025-09-10-123"
    }
  ]
};

const eobs = {
  resourceType: "Bundle",
  type: "searchset",
  total: 4,
  entry: [
    {
      resource: {
        resourceType: "ExplanationOfBenefit",
        id: "EOB-2025-11-001",
        status: "active",
        type: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/claim-type", code: "professional" }] },
        use: "claim",
        patient: { reference: "Patient/pat-001", display: "Sarah Johnson" },
        created: "2025-11-05",
        insurer: { display: "Blue Cross Blue Shield" },
        provider: { display: "North Valley Medical Center" },
        outcome: "complete",
        insurance: [{
          focal: true,
          coverage: { reference: "Coverage/cov-001" }
        }],
        item: [{
          sequence: 1,
          productOrService: { coding: [{ code: "99214", display: "Office Visit - Level 4" }] },
          servicedDate: "2025-11-01",
          adjudication: [
            { category: { coding: [{ code: "submitted" }] }, amount: { value: 485.00, currency: "USD" } },
            { category: { coding: [{ code: "copay" }] }, amount: { value: 50.00, currency: "USD" } },
            { category: { coding: [{ code: "eligible" }] }, amount: { value: 385.00, currency: "USD" } },
            { category: { coding: [{ code: "benefit" }] }, amount: { value: 335.00, currency: "USD" } }
          ]
        }],
        total: [
          { category: { coding: [{ code: "submitted" }] }, amount: { value: 485.00, currency: "USD" } },
          { category: { coding: [{ code: "benefit" }] }, amount: { value: 335.00, currency: "USD" } }
        ],
        payment: {
          type: { coding: [{ code: "complete" }] },
          amount: { value: 335.00, currency: "USD" },
          date: "2025-11-10"
        }
      }
    },
    {
      resource: {
        resourceType: "ExplanationOfBenefit",
        id: "EOB-2025-10-001",
        status: "active",
        type: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/claim-type", code: "professional" }] },
        use: "claim",
        patient: { reference: "Patient/pat-001", display: "Sarah Johnson" },
        created: "2025-10-08",
        insurer: { display: "Blue Cross Blue Shield" },
        provider: { display: "Gastroenterology Associates" },
        outcome: "complete",
        insurance: [{
          focal: true,
          coverage: { reference: "Coverage/cov-001" }
        }],
        item: [{
          sequence: 1,
          productOrService: { coding: [{ code: "45378", display: "Colonoscopy, Diagnostic" }] },
          servicedDate: "2025-10-01",
          adjudication: [
            { category: { coding: [{ code: "submitted" }] }, amount: { value: 1250.00, currency: "USD" } },
            { category: { coding: [{ code: "deductible" }] }, amount: { value: 200.00, currency: "USD" } },
            { category: { coding: [{ code: "eligible" }] }, amount: { value: 1050.00, currency: "USD" } },
            { category: { coding: [{ code: "benefit" }] }, amount: { value: 1050.00, currency: "USD" } }
          ]
        }],
        total: [
          { category: { coding: [{ code: "submitted" }] }, amount: { value: 1250.00, currency: "USD" } },
          { category: { coding: [{ code: "benefit" }] }, amount: { value: 1050.00, currency: "USD" } }
        ],
        payment: {
          type: { coding: [{ code: "complete" }] },
          amount: { value: 1050.00, currency: "USD" },
          date: "2025-10-15"
        }
      }
    },
    {
      resource: {
        resourceType: "ExplanationOfBenefit",
        id: "EOB-2025-09-001",
        status: "active",
        type: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/claim-type", code: "professional" }] },
        use: "claim",
        patient: { reference: "Patient/pat-001", display: "Sarah Johnson" },
        created: "2025-09-05",
        insurer: { display: "Blue Cross Blue Shield" },
        provider: { display: "LabCorp Diagnostics" },
        outcome: "complete",
        insurance: [{
          focal: true,
          coverage: { reference: "Coverage/cov-001" }
        }],
        item: [{
          sequence: 1,
          productOrService: { coding: [{ code: "85025", display: "Complete Blood Count (CBC)" }] },
          servicedDate: "2025-09-01",
          adjudication: [
            { category: { coding: [{ code: "submitted" }] }, amount: { value: 110.50, currency: "USD" } },
            { category: { coding: [{ code: "copay" }] }, amount: { value: 0.00, currency: "USD" } },
            { category: { coding: [{ code: "eligible" }] }, amount: { value: 110.50, currency: "USD" } },
            { category: { coding: [{ code: "benefit" }] }, amount: { value: 110.50, currency: "USD" } }
          ]
        }],
        total: [
          { category: { coding: [{ code: "submitted" }] }, amount: { value: 110.50, currency: "USD" } },
          { category: { coding: [{ code: "benefit" }] }, amount: { value: 110.50, currency: "USD" } }
        ],
        payment: {
          type: { coding: [{ code: "complete" }] },
          amount: { value: 110.50, currency: "USD" },
          date: "2025-09-10"
        }
      }
    },
    {
      resource: {
        resourceType: "ExplanationOfBenefit",
        id: "EOB-2025-08-001",
        status: "active",
        type: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/claim-type", code: "professional" }] },
        use: "claim",
        patient: { reference: "Patient/pat-001", display: "Sarah Johnson" },
        created: "2025-08-10",
        insurer: { display: "Blue Cross Blue Shield" },
        provider: { display: "Dr. Emily Chen, MD" },
        outcome: "complete",
        insurance: [{
          focal: true,
          coverage: { reference: "Coverage/cov-001" }
        }],
        item: [
          {
            sequence: 1,
            productOrService: { coding: [{ code: "99215", display: "Annual Physical Examination" }] },
            servicedDate: "2025-08-01",
            adjudication: [
              { category: { coding: [{ code: "submitted" }] }, amount: { value: 350.00, currency: "USD" } },
              { category: { coding: [{ code: "copay" }] }, amount: { value: 50.00, currency: "USD" } },
              { category: { coding: [{ code: "eligible" }] }, amount: { value: 250.00, currency: "USD" } },
              { category: { coding: [{ code: "benefit" }] }, amount: { value: 200.00, currency: "USD" } }
            ]
          },
          {
            sequence: 2,
            productOrService: { coding: [{ code: "80053", display: "Comprehensive Metabolic Panel" }] },
            servicedDate: "2025-08-01",
            adjudication: [
              { category: { coding: [{ code: "submitted" }] }, amount: { value: 200.00, currency: "USD" } },
              { category: { coding: [{ code: "copay" }] }, amount: { value: 30.00, currency: "USD" } },
              { category: { coding: [{ code: "eligible" }] }, amount: { value: 150.00, currency: "USD" } },
              { category: { coding: [{ code: "benefit" }] }, amount: { value: 120.00, currency: "USD" } }
            ]
          },
          {
            sequence: 3,
            productOrService: { coding: [{ code: "82947", display: "Glucose, Blood Test" }] },
            servicedDate: "2025-08-01",
            adjudication: [
              { category: { coding: [{ code: "submitted" }] }, amount: { value: 100.00, currency: "USD" } },
              { category: { coding: [{ code: "copay" }] }, amount: { value: 15.00, currency: "USD" } },
              { category: { coding: [{ code: "eligible" }] }, amount: { value: 75.00, currency: "USD" } },
              { category: { coding: [{ code: "benefit" }] }, amount: { value: 60.00, currency: "USD" } }
            ]
          }
        ],
        total: [
          { category: { coding: [{ code: "submitted" }] }, amount: { value: 650.00, currency: "USD" } },
          { category: { coding: [{ code: "benefit" }] }, amount: { value: 380.00, currency: "USD" } }
        ],
        payment: {
          type: { coding: [{ code: "complete" }] },
          amount: { value: 380.00, currency: "USD" },
          date: "2025-08-20"
        }
      }
    }
  ]
};

const payments = {
  resourceType: "Bundle",
  type: "searchset",
  total: 6,
  entry: [
    {
      resource: {
        resourceType: "PaymentReconciliation",
        id: "PAY-2025-11-15-001",
        status: "active",
        period: { start: "2025-11-15", end: "2025-11-15" },
        created: "2025-11-15",
        paymentIssuer: { display: "Sarah Johnson (Patient)" },
        requestor: { display: "North Valley Medical Center" },
        outcome: "complete",
        disposition: "Payment processed successfully",
        paymentDate: "2025-11-15",
        paymentAmount: { value: 150.00, currency: "USD" },
        paymentIdentifier: { value: "PAY-2025-11-15-001" },
        detail: [{
          type: { coding: [{ code: "payment" }] },
          request: { reference: "Invoice/INV-2025-11-001" },
          response: { display: "Office Visit - Level 4" },
          amount: { value: 150.00, currency: "USD" },
          date: "2025-11-15"
        }],
        formCode: { coding: [{ code: "credit-card", display: "Credit Card (Visa ending in 4532)" }] }
      }
    },
    {
      resource: {
        resourceType: "PaymentReconciliation",
        id: "PAY-2025-11-10-ERA",
        status: "active",
        period: { start: "2025-11-10", end: "2025-11-10" },
        created: "2025-11-10",
        paymentIssuer: { display: "Blue Cross Blue Shield" },
        requestor: { display: "North Valley Medical Center" },
        outcome: "complete",
        disposition: "ERA 835 - Electronic Remittance Advice",
        paymentDate: "2025-11-10",
        paymentAmount: { value: 335.00, currency: "USD" },
        paymentIdentifier: { value: "ERA-835-202511-001" },
        detail: [{
          type: { coding: [{ code: "payment" }] },
          request: { reference: "Claim/CLM-2025-11-001" },
          response: { display: "Office Visit - Level 4" },
          amount: { value: 335.00, currency: "USD" },
          date: "2025-11-10"
        }],
        formCode: { coding: [{ code: "eft", display: "Electronic Funds Transfer (EFT)" }] }
      }
    },
    {
      resource: {
        resourceType: "PaymentReconciliation",
        id: "PAY-2025-10-18-001",
        status: "active",
        period: { start: "2025-10-18", end: "2025-10-18" },
        created: "2025-10-18",
        paymentIssuer: { display: "Sarah Johnson (Patient)" },
        requestor: { display: "Gastroenterology Associates" },
        outcome: "complete",
        disposition: "Payment processed successfully",
        paymentDate: "2025-10-18",
        paymentAmount: { value: 200.00, currency: "USD" },
        paymentIdentifier: { value: "PAY-2025-10-18-001" },
        detail: [{
          type: { coding: [{ code: "payment" }] },
          request: { reference: "Invoice/INV-2025-10-001" },
          response: { display: "Colonoscopy, Diagnostic - Deductible" },
          amount: { value: 200.00, currency: "USD" },
          date: "2025-10-18"
        }],
        formCode: { coding: [{ code: "debit-card", display: "Debit Card (ending in 7821)" }] }
      }
    },
    {
      resource: {
        resourceType: "PaymentReconciliation",
        id: "PAY-2025-10-15-ERA",
        status: "active",
        period: { start: "2025-10-15", end: "2025-10-15" },
        created: "2025-10-15",
        paymentIssuer: { display: "Blue Cross Blue Shield" },
        requestor: { display: "Gastroenterology Associates" },
        outcome: "complete",
        disposition: "ERA 835 - Electronic Remittance Advice",
        paymentDate: "2025-10-15",
        paymentAmount: { value: 1050.00, currency: "USD" },
        paymentIdentifier: { value: "ERA-835-202510-001" },
        detail: [{
          type: { coding: [{ code: "payment" }] },
          request: { reference: "Claim/CLM-2025-10-001" },
          response: { display: "Colonoscopy, Diagnostic" },
          amount: { value: 1050.00, currency: "USD" },
          date: "2025-10-15"
        }],
        formCode: { coding: [{ code: "eft", display: "Electronic Funds Transfer (EFT)" }] }
      }
    },
    {
      resource: {
        resourceType: "PaymentReconciliation",
        id: "PAY-2025-09-10-123",
        status: "active",
        period: { start: "2025-09-10", end: "2025-09-10" },
        created: "2025-09-10",
        paymentIssuer: { display: "Sarah Johnson (Patient)" },
        requestor: { display: "Dr. Emily Chen, MD" },
        outcome: "complete",
        disposition: "Payment processed successfully - Account paid in full",
        paymentDate: "2025-09-10",
        paymentAmount: { value: 95.00, currency: "USD" },
        paymentIdentifier: { value: "PAY-2025-09-10-123" },
        detail: [{
          type: { coding: [{ code: "payment" }] },
          request: { reference: "Invoice/INV-123" },
          response: { display: "Annual Physical - Patient Responsibility" },
          amount: { value: 95.00, currency: "USD" },
          date: "2025-09-10"
        }],
        formCode: { coding: [{ code: "credit-card", display: "Credit Card (Visa ending in 4532)" }] }
      }
    },
    {
      resource: {
        resourceType: "PaymentReconciliation",
        id: "PAY-2025-08-20-ERA",
        status: "active",
        period: { start: "2025-08-20", end: "2025-08-20" },
        created: "2025-08-20",
        paymentIssuer: { display: "Blue Cross Blue Shield" },
        requestor: { display: "Dr. Emily Chen, MD" },
        outcome: "complete",
        disposition: "ERA 835 - Electronic Remittance Advice",
        paymentDate: "2025-08-20",
        paymentAmount: { value: 380.00, currency: "USD" },
        paymentIdentifier: { value: "ERA-835-202508-001" },
        detail: [{
          type: { coding: [{ code: "payment" }] },
          request: { reference: "Claim/CLM-2025-08-001" },
          response: { display: "Annual Physical + Labs" },
          amount: { value: 380.00, currency: "USD" },
          date: "2025-08-20"
        }],
        formCode: { coding: [{ code: "eft", display: "Electronic Funds Transfer (EFT)" }] }
      }
    }
  ]
};

type View = 'overview' | 'summary' | 'statements' | 'statement-detail' | 'eobs' | 'payments' | 'make-payment' | 'payment-success';

export function BillingIntegrationDemo() {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [selectedStatement, setSelectedStatement] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(350.00);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'bank'>('credit');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [paymentConfirmation, setPaymentConfirmation] = useState<any>(null);

  const MobileFrame = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="mx-auto" style={{ width: '390px' }}>
        {/* Mobile device frame */}
        <div className="bg-gray-900 rounded-t-[2.5rem] px-6 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="text-white text-sm">9:41</div>
            <div className="w-20 h-6 bg-gray-800 rounded-full" />
            <div className="flex items-center gap-1">
              <div className="text-white text-xs">100%</div>
            </div>
          </div>
        </div>
        <div 
          className="bg-white border-x-2 border-b-2 border-gray-900 rounded-b-[2.5rem] overflow-hidden shadow-2xl"
          style={{ height: '844px' }}
        >
          {children}
        </div>
      </div>
    );
  };

  // Overview / Demo Selection
  if (currentView === 'overview') {
    return (
      <div className="space-y-6">
        <div>
          <h2>Billing Integration Demo</h2>
          <p className="text-gray-600 mt-1">
            Patient billing portal with Greenway Health FHIR Billing API integration
          </p>
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <strong className="text-blue-900">💳 Payment Integration:</strong>
            <span className="text-blue-800 ml-2">
              Payment flow uses mock data for demo. See <code className="bg-blue-100 px-1 rounded">/PAYMENT_INTEGRATION_GUIDE.md</code> for production integration with Stripe/Square/InstaMed.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Billing Views */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                Patient Mobile Views
              </CardTitle>
              <CardDescription>FHIR-based billing screens for patient app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: 'summary', label: 'Billing Summary', icon: DollarSign, desc: 'Account balance & overview' },
                { id: 'statements', label: 'Statements', icon: FileText, desc: 'All billing statements' },
                { id: 'statement-detail', label: 'Statement Detail', icon: Receipt, desc: 'Line-item breakdown' },
                { id: 'eobs', label: 'EOBs (Explanation of Benefits)', icon: Building2, desc: 'Insurance claims' },
                { id: 'payments', label: 'Payment History', icon: CreditCard, desc: 'Patient & payer payments' }
              ].map((view) => {
                const Icon = view.icon;
                return (
                  <Button
                    key={view.id}
                    variant="outline"
                    onClick={() => setCurrentView(view.id as View)}
                    className="w-full justify-start h-auto py-3"
                  >
                    <div className="flex items-start gap-3 text-left">
                      <Icon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm">{view.label}</div>
                        <div className="text-xs text-gray-600">{view.desc}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Architecture & Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Integration Architecture
              </CardTitle>
              <CardDescription>Greenway Health FHIR Billing API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <strong>Patient App</strong>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    <span>Backend API (REST facade)</span>
                  </div>
                  <div className="flex items-center gap-2 ml-8">
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    <span>AWS HealthLake FHIR APIs</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm mb-2">FHIR Resources:</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Account</Badge>
                  <Badge variant="outline" className="text-xs">Invoice</Badge>
                  <Badge variant="outline" className="text-xs">Claim</Badge>
                  <Badge variant="outline" className="text-xs">ExplanationOfBenefit</Badge>
                  <Badge variant="outline" className="text-xs">PaymentReconciliation</Badge>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-xs text-amber-900">
                  <strong>Note:</strong> All data shown is from mock JSON files simulating Greenway FHIR responses.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Endpoints & Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                <div className="text-green-600 mb-1">GET /billing/summary</div>
                <div className="text-gray-600">Account balance & totals</div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                <div className="text-green-600 mb-1">GET /billing/statements</div>
                <div className="text-gray-600">List of all invoices</div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                <div className="text-green-600 mb-1">GET /billing/statements/{'{id}'}</div>
                <div className="text-gray-600">Detailed invoice breakdown</div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                <div className="text-green-600 mb-1">GET /billing/eobs</div>
                <div className="text-gray-600">Explanation of Benefits</div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                <div className="text-green-600 mb-1">GET /billing/payments</div>
                <div className="text-gray-600">Payment history</div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                <div className="text-green-600 mb-1">POST /billing/payment</div>
                <div className="text-gray-600">Submit patient payment</div>
              </div>
            </div>

            <div className="text-xs text-gray-600">
              <strong>Base URL:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded">https://api.greenwayhealth.com/fhir</code>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Billing Summary View
  if (currentView === 'summary') {
    const summary = billingSummary.summary;
    const lastPayment = billingSummary.lastPayment;

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentView('overview')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Overview
        </button>

        <div className="text-center mb-6">
          <h3>Billing Summary</h3>
          <p className="text-sm text-gray-600 mt-1">Account balance & payment overview</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col overflow-auto">
            {/* Header */}
            <div className="bg-green-600 text-white p-4">
              <h3 className="text-white">Billing</h3>
              <p className="text-green-100 text-xs">Account Summary</p>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-6">
              {/* Current Balance Card */}
              <Card className="border-2 border-green-600">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Current Balance</div>
                    <div className="text-4xl mb-2">
                      ${summary.currentBalance.value.toFixed(2)}
                    </div>
                    {summary.pastDue.value > 0 ? (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Past Due: ${summary.pastDue.value.toFixed(2)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        No Past Due Balance
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Summary Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-xs text-gray-600 mb-1">Total Charges</div>
                    <div className="text-xl">${summary.totalGross.value.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-xs text-gray-600 mb-1">Insurance Paid</div>
                    <div className="text-xl text-blue-600">${summary.totalInsurancePayments.value.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-xs text-gray-600 mb-1">You Paid</div>
                    <div className="text-xl text-green-600">${summary.totalPatientPayments.value.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-xs text-gray-600 mb-1">Adjustments</div>
                    <div className="text-xl text-orange-600">${summary.totalAdjustments.value.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Last Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    Last Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm">${lastPayment.amount.value.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">{lastPayment.method}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{new Date(lastPayment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-xs text-gray-600">{lastPayment.confirmationNumber}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setPaymentAmount(summary.currentBalance.value);
                    setCurrentView('make-payment');
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Make a Payment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setCurrentView('statements')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Statements ({billingSummary.statementCount})
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setCurrentView('payments')}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Payment History
                </Button>
              </div>

              {/* Insurance Info */}
              {billingSummary.insurance && billingSummary.insurance.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Primary Insurance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">{billingSummary.insurance[0].coverage.display}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </MobileFrame>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Response</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <div className="bg-gray-50 p-3 rounded font-mono overflow-auto max-h-60">
              <pre>{JSON.stringify(billingSummary, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Statements List View
  if (currentView === 'statements') {
    const statementList = statements.entry;

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentView('overview')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Overview
        </button>

        <div className="text-center mb-6">
          <h3>Statements</h3>
          <p className="text-sm text-gray-600 mt-1">All billing statements & invoices</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-green-600 text-white p-4">
              <h3 className="text-white">Statements</h3>
              <p className="text-green-100 text-xs">{statementList.length} total statements</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {statementList.map((entry: any, index: number) => {
                const invoice = entry.resource;
                const isPaid = invoice.accountStatus === 'paid' || invoice.accountStatus === 'balanced';
                const statementDate = new Date(invoice.date);

                return (
                  <Card 
                    key={invoice.id}
                    className="cursor-pointer hover:border-green-600 transition-colors"
                    onClick={() => {
                      setSelectedStatement(invoice);
                      setCurrentView('statement-detail');
                    }}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm mb-1">{invoice.id}</div>
                          <div className="text-xs text-gray-600">
                            {statementDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-600">Amount Due</div>
                          <div className="text-lg">${invoice.totalNet.value.toFixed(2)}</div>
                        </div>
                        {isPaid ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Due
                          </Badge>
                        )}
                      </div>

                      {invoice.lineItem && invoice.lineItem.length > 0 && (
                        <div className="text-xs text-gray-600 mt-2">
                          {invoice.lineItem.length} line item{invoice.lineItem.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </MobileFrame>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Response</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <div className="bg-gray-50 p-3 rounded font-mono overflow-auto max-h-60">
              <pre>{JSON.stringify(statements, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Statement Detail View
  if (currentView === 'statement-detail') {
    const statement = selectedStatement || statementDetail;
    const statementDate = new Date(statement.date);
    const serviceDate = statement.serviceDate ? new Date(statement.serviceDate) : statementDate;

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentView('overview')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Overview
        </button>

        <div className="text-center mb-6">
          <h3>Statement Detail</h3>
          <p className="text-sm text-gray-600 mt-1">Line-item breakdown with insurance adjudication</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-green-600 text-white p-4">
              <button 
                onClick={() => setCurrentView('statements')}
                className="mb-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-white">{statement.id}</h3>
              <p className="text-green-100 text-xs">
                {statementDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Total Balance */}
              <Card className="border-2 border-green-600">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Amount Due</div>
                    <div className="text-4xl mb-2">${statement.totalNet.value.toFixed(2)}</div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {statement.paymentStatus?.text || statement.accountStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Service Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Date</span>
                    <span>{serviceDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {statement.participant && statement.participant.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provider</span>
                      <span>{statement.participant[0].actor.display}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statement Date</span>
                    <span>{statementDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Charges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statement.lineItem.map((item: any, index: number) => {
                    const hasComponents = item.priceComponent && item.priceComponent.length > 0;
                    
                    return (
                      <div key={item.sequence} className="pb-4 border-b last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-sm mb-1">
                              {item.chargeItemCodeableConcept.text || item.chargeItemCodeableConcept.coding[0].display}
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.chargeItemCodeableConcept.coding[0].code}
                            </div>
                          </div>
                        </div>

                        {hasComponents && (
                          <div className="space-y-1 text-xs">
                            {item.priceComponent.map((comp: any, compIndex: number) => (
                              <div key={compIndex} className="flex justify-between">
                                <span className="text-gray-600">{comp.code?.text || comp.type}</span>
                                <span className={comp.amount.value < 0 ? 'text-green-600' : ''}>
                                  ${Math.abs(comp.amount.value).toFixed(2)}
                                </span>
                              </div>
                            ))}
                            {item.netAmount && (
                              <div className="flex justify-between pt-1 border-t">
                                <strong>Your Responsibility</strong>
                                <strong>${item.netAmount.value.toFixed(2)}</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Payment Summary */}
              {statement.totalPriceComponent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {statement.totalPriceComponent.map((comp: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className={comp.type === 'base' ? '' : 'text-gray-600'}>
                          {comp.code.text}
                        </span>
                        <span className={comp.amount.value < 0 ? 'text-green-600' : ''}>
                          ${Math.abs(comp.amount.value).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t">
                      <strong>Total Balance</strong>
                      <strong>${statement.totalNet.value.toFixed(2)}</strong>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment History */}
              {statement.payments && statement.payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Payments Received</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {statement.payments.map((payment: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <div className="text-sm">{payment.type.text}</div>
                          <div className="text-xs text-gray-600">
                            {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          {payment.payer && (
                            <div className="text-xs text-gray-600">{payment.payer.display}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm">${payment.amount.value.toFixed(2)}</div>
                          {payment.confirmationNumber && (
                            <div className="text-xs text-gray-600">{payment.confirmationNumber}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {statement.note && statement.note.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="text-xs text-blue-900">
                      {statement.note[0].text}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                {statement.totalNet.value > 0 && (
                  <Button className="w-full" variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ${statement.totalNet.value.toFixed(2)}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </MobileFrame>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">FHIR Invoice Resource</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <div className="bg-gray-50 p-3 rounded font-mono overflow-auto max-h-60">
              <pre>{JSON.stringify(statement, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // EOBs (Explanation of Benefits) View
  if (currentView === 'eobs') {
    const eobList = eobs.entry;

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentView('overview')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Overview
        </button>

        <div className="text-center mb-6">
          <h3>Explanation of Benefits (EOBs)</h3>
          <p className="text-sm text-gray-600 mt-1">Insurance claim adjudication details</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-green-600 text-white p-4">
              <h3 className="text-white">EOBs</h3>
              <p className="text-green-100 text-xs">{eobList.length} insurance claims</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {eobList.map((entry: any) => {
                const eob = entry.resource;
                const serviceDate = new Date(eob.item[0].servicedDate);
                const paymentDate = new Date(eob.payment.date);
                const submitted = eob.total.find((t: any) => t.category.coding[0].code === 'submitted')?.amount.value || 0;
                const benefit = eob.total.find((t: any) => t.category.coding[0].code === 'benefit')?.amount.value || 0;
                const patientResp = submitted - benefit;

                return (
                  <Card key={eob.id}>
                    <CardContent className="pt-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm mb-1">{eob.id}</div>
                          <div className="text-xs text-gray-600">
                            {eob.provider.display}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Processed
                        </Badge>
                      </div>

                      {/* Service */}
                      <div className="bg-gray-50 rounded p-2 text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Service</span>
                          <span>{serviceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div>{eob.item[0].productOrService.coding[0].display}</div>
                      </div>

                      {/* Amounts */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Charged Amount</span>
                          <span>${submitted.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                          <span>Insurance Paid</span>
                          <strong>${benefit.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <strong>Your Responsibility</strong>
                          <strong>${patientResp.toFixed(2)}</strong>
                        </div>
                      </div>

                      {/* Insurance */}
                      <div className="flex items-center justify-between pt-2 border-t text-xs">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3 text-blue-600" />
                          <span className="text-gray-600">{eob.insurer.display}</span>
                        </div>
                        <span className="text-gray-600">Paid {paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </MobileFrame>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Response - FHIR ExplanationOfBenefit Resources</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <div className="bg-gray-50 p-3 rounded font-mono overflow-auto max-h-60">
              <pre>{JSON.stringify(eobs, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment History View
  if (currentView === 'payments') {
    const paymentList = payments.entry;

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentView('overview')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Overview
        </button>

        <div className="text-center mb-6">
          <h3>Payment History</h3>
          <p className="text-sm text-gray-600 mt-1">All payments from patients and insurance payers</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-green-600 text-white p-4">
              <h3 className="text-white">Payment History</h3>
              <p className="text-green-100 text-xs">{paymentList.length} payments received</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {paymentList.map((entry: any) => {
                const payment = entry.resource;
                const paymentDate = new Date(payment.paymentDate);
                const isPatient = payment.paymentIssuer.display.includes('Patient');

                return (
                  <Card key={payment.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-sm mb-1">
                            ${payment.paymentAmount.value.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {payment.paymentIssuer.display}
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={isPatient ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}
                        >
                          {isPatient ? <CreditCard className="w-3 h-3 mr-1" /> : <Building2 className="w-3 h-3 mr-1" />}
                          {isPatient ? 'Patient' : 'Insurance'}
                        </Badge>
                      </div>

                      {/* Payment Details */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date</span>
                          <span>{paymentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Method</span>
                          <span>{payment.formCode.coding[0].display}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">For</span>
                          <span>{payment.detail[0].response.display}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Confirmation</span>
                          <span className="font-mono">{payment.paymentIdentifier.value}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-xs text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          <span>{payment.disposition}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </MobileFrame>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Response - FHIR PaymentReconciliation Resources</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <div className="bg-gray-50 p-3 rounded font-mono overflow-auto max-h-60">
              <pre>{JSON.stringify(payments, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Make Payment View
  if (currentView === 'make-payment') {
    const summary = billingSummary.summary;
    
    const handlePayment = async () => {
      // PRODUCTION INTEGRATION PATTERN:
      // 
      // Step 1: Tokenize card with Stripe.js (frontend - PCI compliant)
      // const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      // const { token, error } = await stripe.createToken(cardElement);
      // 
      // Step 2: Send token to YOUR backend (not raw card data)
      // const response = await fetch('/api/billing/payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     paymentToken: token.id,        // Stripe token (safe to send)
      //     amount: paymentAmount,
      //     patientId: '0efed85b-e8a2-417b-a1f4-6a30fd74e7c2',
      //     invoiceId: 'INV-2025-11-001'
      //   })
      // });
      // 
      // Step 3: Backend processes payment with Stripe API using SECRET key
      // const charge = await stripe.charges.create({
      //   amount: amount * 100, // Stripe uses cents
      //   currency: 'usd',
      //   source: paymentToken,
      //   description: 'Medical bill payment'
      // });
      // 
      // Step 4: Backend updates FHIR PaymentReconciliation resource
      // Step 5: Return confirmation to frontend
      
      // DEMO: Mock confirmation (in production, this comes from backend)
      const confirmation = {
        confirmationNumber: `PAY-${Date.now()}`,
        amount: paymentAmount,
        method: paymentMethod === 'credit' ? `Credit Card ending in ${cardNumber.slice(-4)}` : 
                paymentMethod === 'debit' ? `Debit Card ending in ${cardNumber.slice(-4)}` :
                'Bank Account (ACH)',
        date: new Date().toISOString(),
        status: 'completed'
      };
      setPaymentConfirmation(confirmation);
      setCurrentView('payment-success');
    };

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentView('summary')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Billing Summary
        </button>

        <div className="text-center mb-6">
          <h3>Make a Payment</h3>
          <p className="text-sm text-gray-600 mt-1">Pay your balance securely</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-green-600 text-white p-4">
              <button 
                onClick={() => setCurrentView('summary')}
                className="mb-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-white">Make a Payment</h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Amount Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Payment Amount</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    onClick={() => setPaymentAmount(summary.currentBalance.value)}
                    className={`w-full p-3 border-2 rounded-lg text-left ${
                      paymentAmount === summary.currentBalance.value ? 'border-green-600 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm">Full Balance</div>
                        <div className="text-xs text-gray-600">Pay entire amount</div>
                      </div>
                      <div className="text-lg">${summary.currentBalance.value.toFixed(2)}</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentAmount(50.00)}
                    className={`w-full p-3 border-2 rounded-lg text-left ${
                      paymentAmount === 50.00 ? 'border-green-600 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm">Minimum Payment</div>
                        <div className="text-xs text-gray-600">Required amount</div>
                      </div>
                      <div className="text-lg">$50.00</div>
                    </div>
                  </button>

                  <div className="border-2 border-gray-200 rounded-lg p-3">
                    <label className="text-sm block mb-2">Custom Amount</label>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">$</span>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                        className="flex-1 text-lg border-0 outline-none"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max={summary.currentBalance.value}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('credit')}
                    className={`w-full p-3 border-2 rounded-lg flex items-center gap-3 ${
                      paymentMethod === 'credit' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <div className="text-left flex-1">
                      <div className="text-sm">Credit Card</div>
                      <div className="text-xs text-gray-600">Visa, Mastercard, Amex</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('debit')}
                    className={`w-full p-3 border-2 rounded-lg flex items-center gap-3 ${
                      paymentMethod === 'debit' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <div className="text-left flex-1">
                      <div className="text-sm">Debit Card</div>
                      <div className="text-xs text-gray-600">Bank debit card</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={`w-full p-3 border-2 rounded-lg flex items-center gap-3 ${
                      paymentMethod === 'bank' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <div className="text-left flex-1">
                      <div className="text-sm">Bank Account (ACH)</div>
                      <div className="text-xs text-gray-600">Direct bank transfer</div>
                    </div>
                  </button>
                </CardContent>
              </Card>

              {/* Card Details (if card selected) */}
              {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Card Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-2 border rounded text-sm"
                        maxLength={16}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full p-2 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full p-2 border rounded text-sm"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="Sarah Johnson"
                        className="w-full p-2 border rounded text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Summary */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Amount</span>
                      <span className="text-lg">${paymentAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Fee</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-green-300">
                      <strong>Total Today</strong>
                      <strong className="text-lg">${paymentAmount.toFixed(2)}</strong>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 py-6"
                onClick={handlePayment}
                disabled={paymentAmount <= 0 || (paymentMethod !== 'bank' && cardNumber.length < 13)}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Pay ${paymentAmount.toFixed(2)}
              </Button>

              <p className="text-xs text-center text-gray-600">
                Your payment is secure and encrypted. By continuing, you agree to process this payment.
              </p>
            </div>
          </div>
        </MobileFrame>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Production Integration - Stripe Payment Processing</CardTitle>
            <CardDescription>In production, use Stripe/Square/InstaMed for PCI-compliant payment processing</CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-3">
            <div>
              <div className="mb-2">
                <strong>Step 1: Frontend tokenizes card with Stripe.js</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded font-mono overflow-auto">
                <pre>{`const { paymentMethod } = await stripe.createPaymentMethod({
  type: 'card',
  card: cardElement
});`}</pre>
              </div>
            </div>

            <div>
              <div className="mb-2">
                <strong>Step 2: Send token to YOUR backend (not card data)</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded font-mono overflow-auto">
                <pre>{JSON.stringify({
                  endpoint: "POST /api/billing/payment",
                  body: {
                    paymentMethodId: "pm_1ABC123...",  // Stripe token (safe)
                    amount: paymentAmount,
                    patientId: "0efed85b-e8a2-417b-a1f4-6a30fd74e7c2",
                    invoiceId: "INV-2025-11-001"
                  }
                }, null, 2)}</pre>
              </div>
            </div>

            <div>
              <div className="mb-2">
                <strong>Step 3: Backend processes with Stripe API</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded font-mono overflow-auto">
                <pre>{`const paymentIntent = await stripe.paymentIntents.create({
  amount: ${Math.round(paymentAmount * 100)}, // cents
  currency: 'usd',
  payment_method: paymentMethodId,
  confirm: true
});`}</pre>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <strong className="text-blue-900">PCI Compliance:</strong>
                  <p className="text-blue-800 mt-1">
                    Never send raw card data to your backend. Use vendor SDKs (Stripe Elements, Square) to tokenize on frontend.
                  </p>
                  <p className="text-blue-800 mt-1">
                    See <code className="bg-blue-100 px-1 rounded">/PAYMENT_INTEGRATION_GUIDE.md</code> for complete setup instructions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment Success View
  if (currentView === 'payment-success') {
    const confirmation = paymentConfirmation;

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentView('summary')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Billing Summary
        </button>

        <div className="text-center mb-6">
          <h3>Payment Successful</h3>
          <p className="text-sm text-gray-600 mt-1">Your payment has been processed</p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-green-600 text-white p-4">
              <h3 className="text-white">Payment Confirmation</h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Success Icon */}
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-green-600 mb-2">Payment Successful!</h3>
                <p className="text-sm text-gray-600">
                  Your payment has been processed and applied to your account.
                </p>
              </div>

              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid</span>
                    <strong className="text-lg">${confirmation.amount.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span>{confirmation.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span>{new Date(confirmation.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confirmation Number</span>
                    <span className="font-mono text-xs">{confirmation.confirmationNumber}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Status</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {confirmation.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* New Balance */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">New Account Balance</div>
                    <div className="text-3xl text-blue-600">
                      ${(billingSummary.summary.currentBalance.value - confirmation.amount).toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Receipt */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Receipt className="w-4 h-4 mr-2" />
                  Download Receipt (PDF)
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Receipt
                </Button>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => setCurrentView('summary')}
                >
                  Return to Billing Summary
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setCurrentView('payments')}
                >
                  View Payment History
                </Button>
              </div>

              <p className="text-xs text-center text-gray-600 pt-4">
                A confirmation email has been sent to your registered email address.
              </p>
            </div>
          </div>
        </MobileFrame>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Response - FHIR PaymentNotice</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <div className="bg-gray-50 p-3 rounded font-mono overflow-auto max-h-60">
              <pre>{JSON.stringify({
                resourceType: "PaymentNotice",
                id: confirmation.confirmationNumber,
                status: "active",
                created: confirmation.date,
                amount: {
                  value: confirmation.amount,
                  currency: "USD"
                },
                paymentStatus: {
                  coding: [{
                    code: "paid",
                    display: "Paid"
                  }]
                }
              }, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback - should never reach here
  return (
    <div className="space-y-6">
      <button 
        onClick={() => setCurrentView('overview')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Overview
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Unknown View</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setCurrentView('overview')}>
            Return to Overview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}