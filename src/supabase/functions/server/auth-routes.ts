import { Hono } from "npm:hono";
import { setCookie, deleteCookie, getCookie } from "npm:hono/cookie";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Mock CDM API - In production, this would call the real CDM API
// This simulates the tenant → admin mapping from CDM
const mockCDMData = {
  "tenant-001": {
    tenantId: "tenant-001",
    orgId: "org-highland-family",
    adminEmail: "admin@highlandfamily.com",
    adminUserGuid: "gis-user-123",
    practices: [
      { id: "practice-001", name: "Highland Family Medicine - Main" },
      { id: "practice-002", name: "Highland Family Medicine - North" }
    ]
  },
  "tenant-002": {
    tenantId: "tenant-002",
    orgId: "org-citycare",
    adminEmail: "owner@citycare.com",
    adminUserGuid: "gis-user-456",
    practices: [
      { id: "practice-003", name: "City Care Clinic" }
    ]
  }
};

// Mock GIS token validation
// In production, this would validate the JWT signature, issuer, audience, expiration
interface GISTokenClaims {
  sub: string; // User ID
  email: string;
  name: string;
  iss: string; // Issuer
  aud: string; // Audience
  exp: number; // Expiration
}

function validateGISToken(token: string): GISTokenClaims | null {
  // In production, this would:
  // 1. Verify JWT signature using GIS public keys
  // 2. Check issuer matches GIS
  // 3. Check audience matches our client ID
  // 4. Check token hasn't expired
  // 5. Extract claims
  
  // For prototype, we'll simulate validation
  if (!token || token !== 'mock-gis-token') {
    return null;
  }

  // Return mock claims
  return {
    sub: 'gis-user-123',
    email: 'admin@highlandfamily.com',
    name: 'Dr. Sarah Johnson',
    iss: 'https://gis.auth.example.com',
    aud: 'adminhub-client-id',
    exp: Date.now() / 1000 + 3600 // 1 hour from now
  };
}

// Fetch tenant admin mapping from CDM
async function fetchTenantAdmin(email: string): Promise<any | null> {
  // In production, this would call:
  // GET /cdm/admin-mappings?email={email}
  // or
  // GET /cdm/tenants/{tenantId}/admin
  
  // For prototype, search our mock data
  for (const [tenantId, data] of Object.entries(mockCDMData)) {
    if (data.adminEmail.toLowerCase() === email.toLowerCase()) {
      return data;
    }
  }
  
  return null;
}

// Mock user credentials database
// In production, this would be stored securely with hashed passwords
const mockUsers = {
  'admin@highlandfamily.com': {
    password: 'password', // In production: hashed password
    tenantId: 'tenant-001'
  },
  'owner@citycare.com': {
    password: 'password', // In production: hashed password
    tenantId: 'tenant-002'
  }
};

// POST /api/auth/login
// Email/Password authentication for internal admin users
app.post('/make-server-66fdb7c0/api/auth/login', async (c) => {
  console.log('🔐 Email/Password login request received');
  
  try {
    const body = await c.req.json();
    const { email, password } = body;
    
    console.log('📝 Login attempt for:', email);

    // Step 1: Validate credentials
    const user = mockUsers[email.toLowerCase()];
    
    if (!user || user.password !== password) {
      console.log('❌ Invalid credentials for:', email);
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    console.log('✅ Credentials validated:', email);

    // Step 2: Fetch tenant admin mapping from CDM
    const tenantAdmin = await fetchTenantAdmin(email);
    
    if (!tenantAdmin) {
      console.log('❌ Authorization failed: Email not found in CDM:', email);
      return c.json({ 
        error: 'You are not authorized for Admin Hub. Your account is not registered as an organization administrator.'
      }, 403);
    }

    console.log('✅ CDM authorization successful:', tenantAdmin.tenantId);

    // Step 3: Create session
    const session = {
      userId: crypto.randomUUID(),
      email: tenantAdmin.adminEmail,
      name: email === 'admin@highlandfamily.com' ? 'Dr. Sarah Johnson' : 'Dr. Michael Chen',
      tenantId: tenantAdmin.tenantId,
      orgId: tenantAdmin.orgId,
      practices: tenantAdmin.practices,
      roles: ['admin'],
      featureFlags: {
        knowledgeHub: true,
        communications: true
      },
      createdAt: Date.now(),
      expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
    };

    // Store session in KV store
    const sessionId = crypto.randomUUID();
    await kv.set(`session:${sessionId}`, session);

    // Set secure cookie (for production)
    setCookie(c, 'admin_session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/'
    });

    console.log('✅ Session created for:', email, 'tenant:', tenantAdmin.tenantId);

    // Return session data with sessionId (for prototype - in production, cookie only)
    return c.json({
      sessionId: sessionId, // For prototype to store in localStorage
      userId: session.userId,
      email: session.email,
      name: session.name,
      tenantId: session.tenantId,
      orgId: session.orgId,
      practices: session.practices,
      roles: session.roles,
      featureFlags: session.featureFlags
    });

  } catch (error) {
    console.error('Error in login:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/me
// Returns current session information
app.get('/make-server-66fdb7c0/api/me', async (c) => {
  try {
    // Try to get session ID from cookie first, then from Authorization header (for prototype)
    let sessionId = getCookie(c, 'admin_session');
    
    if (!sessionId) {
      // For prototype: check Authorization header for session token
      const authHeader = c.req.header('X-Session-Token');
      if (authHeader) {
        sessionId = authHeader;
      }
    }
    
    if (!sessionId) {
      return c.json({ error: 'Not authenticated' }, 401);
    }

    // Fetch session from KV store
    const session = await kv.get(`session:${sessionId}`);
    
    if (!session) {
      // Session expired or invalid
      deleteCookie(c, 'admin_session');
      return c.json({ error: 'Session expired' }, 401);
    }

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      await kv.del(`session:${sessionId}`);
      deleteCookie(c, 'admin_session');
      return c.json({ error: 'Session expired' }, 401);
    }

    // Return session data
    return c.json({
      userId: session.userId,
      email: session.email,
      name: session.name,
      tenantId: session.tenantId,
      orgId: session.orgId,
      practices: session.practices,
      roles: session.roles,
      featureFlags: session.featureFlags
    });

  } catch (error) {
    console.error('Error fetching session:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/auth/logout
// Clears session and returns GIS logout URL
app.post('/make-server-66fdb7c0/api/auth/logout', async (c) => {
  try {
    // Try to get session ID from cookie first, then from header (for prototype)
    let sessionId = getCookie(c, 'admin_session');
    
    if (!sessionId) {
      const authHeader = c.req.header('X-Session-Token');
      if (authHeader) {
        sessionId = authHeader;
      }
    }
    
    if (sessionId) {
      // Delete session from KV store
      await kv.del(`session:${sessionId}`);
    }

    // Clear cookie
    deleteCookie(c, 'admin_session');

    return c.json({
      success: true,
      message: 'Logged out successfully.'
    });

  } catch (error) {
    console.error('Error during logout:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Middleware to verify authentication for protected routes
export function requireAuth() {
  return async (c: any, next: any) => {
    const sessionId = getCookie(c, 'admin_session');
    
    if (!sessionId) {
      return c.json({ error: 'Not authenticated' }, 401);
    }

    const session = await kv.get(`session:${sessionId}`);
    
    if (!session || session.expiresAt < Date.now()) {
      deleteCookie(c, 'admin_session');
      return c.json({ error: 'Session expired' }, 401);
    }

    // Attach session to context
    c.set('session', session);
    await next();
  };
}

export default app;
