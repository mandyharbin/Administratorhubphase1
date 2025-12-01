import React, { useState, useEffect } from 'react';
import { Building2, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';
import { mockLogin, mockGetSession } from '../utils/mockAuth';

interface AdminLoginProps {
  onLoginSuccess: (session: AdminSession) => void;
}

const USE_MOCK_AUTH = true; // Set to false when backend is ready

export interface AdminSession {
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

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('admin@highlandfamily.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // Check if we have a session token in localStorage
      const sessionToken = localStorage.getItem('admin_session_token');
      
      if (!sessionToken) {
        setIsCheckingSession(false);
        return;
      }

      if (USE_MOCK_AUTH) {
        // Use mock auth
        const session = await mockGetSession(sessionToken);
        if (session) {
          onLoginSuccess(session);
        } else {
          localStorage.removeItem('admin_session_token');
        }
      } else {
        // Use real backend
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/me`,
          {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Session-Token': sessionToken
            }
          }
        );

        if (response.ok) {
          const session = await response.json();
          onLoginSuccess(session);
        } else {
          // Session invalid, clear it
          localStorage.removeItem('admin_session_token');
        }
      }
    } catch (error) {
      console.log('No existing session found');
      localStorage.removeItem('admin_session_token');
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    console.log('🚀 handleLogin called, USE_MOCK_AUTH =', USE_MOCK_AUTH);
    setIsLoading(true);
    setError(null);

    try {
      if (USE_MOCK_AUTH) {
        // Use mock authentication for demo
        console.log('🔐 Using mock authentication (demo mode)');
        
        try {
          const session = await mockLogin(email);
          console.log('📦 Mock session received:', session);
          
          // Store session token
          if (session.sessionId) {
            localStorage.setItem('admin_session_token', session.sessionId);
            console.log('💾 Session stored in localStorage');
          }
          
          console.log('✅ Mock login successful:', session.email);
          onLoginSuccess(session);
          return;
        } catch (mockError) {
          console.error('❌ Mock login failed:', mockError);
          throw mockError;
        }
      }

      // Real backend authentication flow
      console.log('🔐 Attempting login to:', `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/auth/login`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          credentials: 'include',
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        let errorMessage = 'Authentication failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const session = await response.json();
      console.log('✅ Login successful:', session.email);
      
      if (session.sessionId) {
        localStorage.setItem('admin_session_token', session.sessionId);
      }
      
      onLoginSuccess(session);
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to authenticate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">BASE Admin Hub</h1>
          <p className="text-gray-600">Sign in to manage your organization</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Demo Hint */}
          {USE_MOCK_AUTH && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                <span className="font-medium">Demo Mode:</span> Use <span className="font-mono bg-gray-100 px-1 rounded">admin@highlandfamily.com</span> with any password
              </p>
            </div>
          )}

          {/* Info Text */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 text-center">
              Only authorized administrators can access this portal.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2024 BASE Health. All rights reserved.</p>
          <p className="mt-1">
            Having trouble signing in? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
