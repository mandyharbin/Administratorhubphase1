import React from 'react';
import { CheckCircle, Building2 } from 'lucide-react';

export function LogoutComplete() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6">
          <Building2 className="w-8 h-8 text-white" />
        </div>

        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        {/* Message */}
        <h1 className="text-gray-900 mb-3">You have signed out</h1>
        <p className="text-gray-600 mb-8">
          You have been successfully signed out of the BASE Admin Hub. Your session has been terminated for security.
        </p>

        {/* Action Button */}
        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
        >
          Sign in again
        </button>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-500">
          <p>© 2024 BASE Health. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
