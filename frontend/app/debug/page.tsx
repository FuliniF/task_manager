'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [cookieInfo, setCookieInfo] = useState<any>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [profileInfo, setProfileInfo] = useState<any>(null);

  const checkCookies = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/debug/cookies', {
        credentials: 'include' // Important: include cookies
      });
      const data = await response.json();
      setCookieInfo(data);
    } catch (error) {
      setCookieInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const checkTokenInfo = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/debug/token-info', {
        credentials: 'include'
      });
      const data = await response.json();
      setTokenInfo(data);
    } catch (error) {
      setTokenInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const checkProfile = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/profile', {
        credentials: 'include'
      });
      const data = await response.json();
      setProfileInfo(data);
    } catch (error) {
      setProfileInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const clearCookies = () => {
    // Note: Can't directly clear httpOnly cookies from JavaScript
    // This would need to be done via a backend endpoint
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    alert('Attempted to clear cookies (but httpOnly cookies need backend clearing)');
  };

  useEffect(() => {
    checkCookies();
    checkTokenInfo();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Debug Dashboard</h1>
      
      <div className="space-y-6">
        {/* Cookie Info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Cookie Information</h2>
          <button 
            onClick={checkCookies}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-4 mb-4"
          >
            Refresh Cookie Info
          </button>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-black">
            {JSON.stringify(cookieInfo, null, 2)}
          </pre>
        </div>

        {/* Token Info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Token Validation</h2>
          <button 
            onClick={checkTokenInfo}
            className="bg-green-500 text-white px-4 py-2 rounded mr-4 mb-4"
          >
            Check Token
          </button>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-black">
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </div>

        {/* Profile Info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Profile Endpoint Test</h2>
          <button 
            onClick={checkProfile}
            className="bg-purple-500 text-white px-4 py-2 rounded mr-4 mb-4"
          >
            Test Profile Endpoint
          </button>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-black">
            {JSON.stringify(profileInfo, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={clearCookies}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear Cookies (Limited)
            </button>
            <a 
              href="/api/auth/login"
              className="bg-blue-500 text-white px-4 py-2 rounded inline-block"
            >
              Login
            </a>
            <button 
              onClick={async () => {
                const response = await fetch('http://127.0.0.1:5000/logout', {
                  method: 'POST',
                  credentials: 'include'
                });
                alert('Logout attempted');
                checkCookies();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Browser Cookies (Non-HttpOnly only) */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Browser Cookies (JS Accessible Only)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-black">
            {typeof window !== 'undefined' ? (document.cookie || 'No JS-accessible cookies found') : 'No JS-accessible cookies found'}
          </pre>
          <p className="text-sm text-gray-600 mt-2">
            Note: HttpOnly cookies won't appear here - use the backend debug endpoints above.
          </p>
        </div>
      </div>
    </div>
  );
}
