// Mock authentication for development/demo purposes
// In production, this would be replaced with real GIS SSO + CDM integration

interface AdminSession {
  sessionId?: string;
  userId: string;
  email: string;
  name: string;
  tenantId: string;
  orgId: string;
  practices: Array<{ id: string; name: string }>;
  roles: string[];
  featureFlags: {
    knowledgeHub: boolean;
    communications: boolean;
  };
}

const mockTenants = {
  'admin@highlandfamily.com': {
    userId: 'gis-user-123',
    email: 'admin@highlandfamily.com',
    name: 'Dr. Sarah Johnson',
    tenantId: 'tenant-001',
    orgId: 'org-highland-family',
    practices: [
      { id: 'practice-001', name: 'Highland Family Medicine - Main' },
      { id: 'practice-002', name: 'Highland Family Medicine - North' }
    ],
    roles: ['admin'],
    featureFlags: {
      knowledgeHub: true,
      communications: true
    }
  },
  'owner@citycare.com': {
    userId: 'gis-user-456',
    email: 'owner@citycare.com',
    name: 'Dr. Michael Chen',
    tenantId: 'tenant-002',
    orgId: 'org-citycare',
    practices: [
      { id: 'practice-003', name: 'City Care Clinic' }
    ],
    roles: ['admin'],
    featureFlags: {
      knowledgeHub: true,
      communications: true
    }
  }
};

export async function mockLogin(email: string = 'admin@highlandfamily.com'): Promise<AdminSession> {
  console.log('📝 mockLogin called with email:', email);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const userData = mockTenants[email as keyof typeof mockTenants];
  console.log('👤 User data found:', userData ? 'Yes' : 'No');

  if (!userData) {
    throw new Error('You are not authorized for Admin Hub. Your account is not registered as an organization administrator.');
  }

  // Generate a simple session ID for the mock
  const sessionId = 'mock-session-' + Date.now() + '-' + Math.random().toString(36).substring(7);
  console.log('🔑 Generated session ID:', sessionId);
  
  const result = {
    sessionId,
    ...userData
  };
  
  console.log('✅ mockLogin returning:', result);
  return result;
}

export async function mockGetSession(sessionId: string): Promise<AdminSession | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  // For mock, just return the first user
  const userData = mockTenants['admin@highlandfamily.com'];
  
  return {
    sessionId,
    ...userData
  };
}

export async function mockLogout(): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  console.log('✅ Mock logout successful');
}
