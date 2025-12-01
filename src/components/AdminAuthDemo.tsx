import React, { useState } from 'react';
import { Shield, Building2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface TestScenario {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  expectedResult: 'success' | 'unauthorized' | 'not-found';
  description: string;
}

const testScenarios: TestScenario[] = [
  {
    id: 'scenario-1',
    name: 'Dr. Sarah Johnson',
    email: 'admin@highlandfamily.com',
    tenantId: 'tenant-001',
    expectedResult: 'success',
    description: 'Valid admin for Highland Family Medicine'
  },
  {
    id: 'scenario-2',
    name: 'Dr. Michael Chen',
    email: 'owner@citycare.com',
    tenantId: 'tenant-002',
    expectedResult: 'success',
    description: 'Valid admin for City Care Clinic'
  },
  {
    id: 'scenario-3',
    name: 'John Doe',
    email: 'john.doe@unauthorized.com',
    tenantId: 'none',
    expectedResult: 'not-found',
    description: 'Email not registered in CDM - should be rejected'
  },
  {
    id: 'scenario-4',
    name: 'Staff Member',
    email: 'staff@highlandfamily.com',
    tenantId: 'none',
    expectedResult: 'not-found',
    description: 'Regular staff (not admin) - should be rejected'
  }
];

export function AdminAuthDemo() {
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const [isTestingAll, setIsTestingAll] = useState(false);

  const testScenario = async (scenario: TestScenario) => {
    setTestResults(prev => ({ ...prev, [scenario.id]: null }));

    try {
      // Simulate calling the auth endpoint with different credentials
      const response = await fetch('/api/auth/gis-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulatedGISToken: 'mock-token',
          testEmail: scenario.email // For testing purposes
        })
      });

      const passed = scenario.expectedResult === 'success' 
        ? response.ok 
        : !response.ok;

      setTestResults(prev => ({ ...prev, [scenario.id]: passed }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [scenario.id]: false }));
    }
  };

  const testAllScenarios = async () => {
    setIsTestingAll(true);
    for (const scenario of testScenarios) {
      await testScenario(scenario);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    setIsTestingAll(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Admin Authentication Demo</h1>
        <p className="text-gray-600">
          Test the GIS SSO + CDM authorization flow with different user scenarios
        </p>
      </div>

      {/* Flow Diagram */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <h2 className="text-gray-900 mb-4">Authentication Flow</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-blue-600">1</span>
            </div>
            <p className="text-sm">User visits Admin Hub</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-8 h-px bg-gray-300"></div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-blue-600">2</span>
            </div>
            <p className="text-sm">GIS SSO Authentication</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-8 h-px bg-gray-300"></div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-blue-600">3</span>
            </div>
            <p className="text-sm">Token Validation</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex flex-col items-center text-center md:col-start-1">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-green-600">4</span>
            </div>
            <p className="text-sm">CDM Tenant Lookup</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-8 h-px bg-gray-300"></div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-green-600">5</span>
            </div>
            <p className="text-sm">Email Match Check</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-8 h-px bg-gray-300"></div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm">Session Created</p>
          </div>
        </div>
      </div>

      {/* CDM Mock Data */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-8">
        <div className="flex items-start gap-3 mb-4">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-gray-900 mb-2">CDM Tenant → Admin Mapping</h3>
            <p className="text-sm text-gray-600 mb-4">
              The Common Data Model (CDM) stores the authoritative mapping of which admin user is authorized for each tenant/org.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-blue-600" />
              <p className="font-medium text-gray-900">tenant-001</p>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">Org: <span className="text-gray-900">org-highland-family</span></p>
              <p className="text-gray-600">Admin Email: <span className="text-gray-900">admin@highlandfamily.com</span></p>
              <p className="text-gray-600">Practices: <span className="text-gray-900">2 locations</span></p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-blue-600" />
              <p className="font-medium text-gray-900">tenant-002</p>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">Org: <span className="text-gray-900">org-citycare</span></p>
              <p className="text-gray-600">Admin Email: <span className="text-gray-900">owner@citycare.com</span></p>
              <p className="text-gray-600">Practices: <span className="text-gray-900">1 location</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Scenarios */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">Test Scenarios</h2>
          <button
            onClick={testAllScenarios}
            disabled={isTestingAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {isTestingAll ? 'Testing...' : 'Test All Scenarios'}
          </button>
        </div>

        <div className="space-y-4">
          {testScenarios.map((scenario) => {
            const result = testResults[scenario.id];
            
            return (
              <div
                key={scenario.id}
                className={`border rounded-lg p-4 ${
                  result === true ? 'border-green-200 bg-green-50' :
                  result === false ? 'border-red-200 bg-red-50' :
                  'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-gray-900">{scenario.name}</p>
                      {scenario.expectedResult === 'success' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          Should Pass
                        </span>
                      )}
                      {scenario.expectedResult !== 'success' && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                          Should Fail
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{scenario.email}</p>
                    <p className="text-sm text-gray-500">{scenario.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {result === true && (
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm">Passed</span>
                      </div>
                    )}
                    {result === false && (
                      <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="w-5 h-5" />
                        <span className="text-sm">Failed</span>
                      </div>
                    )}
                    {result === null && (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    )}
                    <button
                      onClick={() => testScenario(scenario)}
                      disabled={result === null}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                    >
                      Test
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Features */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-gray-900 mb-4">Security Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">JWT Signature Validation</p>
              <p className="text-sm text-gray-600">
                All GIS tokens are validated using official public keys
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">CDM Authorization</p>
              <p className="text-sm text-gray-600">
                Tenant access controlled by CDM, not token claims
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">Secure Session Cookies</p>
              <p className="text-sm text-gray-600">
                HttpOnly, Secure, SameSite strict cookies
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">Tenant Isolation</p>
              <p className="text-sm text-gray-600">
                Strict enforcement prevents cross-tenant access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
