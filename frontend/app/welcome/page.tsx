'use client';
import { useEffect, useState } from 'react';

import TaskManager from '../components/TaskManager';
import Calendar from '../calendar/page';  // Imported Calendar page component
import Loading from '../components/loading';

export default function WelcomePage() {
    // const [cookieStatus, setCookieStatus] = useState<string>('Checking...');
    // const [debugInfo, setDebugInfo] = useState<any>(null);
    const [userStatus, setUserStatus] = useState<string>('');
    const [isClient, setIsClient] = useState(false); 

    // useEffect(() => {
    //     // Test if the cookie is accessible to your API routes
    //     const checkCookie = async () => {
    //         try {
    //             const response = await fetch('/api/test-cookie', {
    //                 credentials: 'include'
    //             });
                
    //             if (!response.ok) {
    //                 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    //             }
                
    //             const result = await response.json();
    //             setCookieStatus(`Cookie status: ${result.hasToken ? 'Found' : 'Not found'}`);
    //             setDebugInfo(result);
    //         } catch (error) {
    //             console.error('Cookie check error:', error);
    //             setCookieStatus(`Error checking cookie: ${error instanceof Error ? error.message : 'Unknown error'}`);
    //         }
    //     };

    //     checkCookie();
    // }, []);

    // New effect to check user status
    useEffect(() => {
        setIsClient(true); // Set to true when the component is mounted on the client
    }, []);

    useEffect(() => {
        if (!isClient) return; // Ensure this runs only on the client
        const checkUserStatus = async () => {
            try {
                const response = await fetch('/api/get-status', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const data = await response.json();
                setUserStatus(data.status);
            } catch (error) {
                console.error('Status check error:', error);
                setUserStatus('unknown');
            }
        };
        checkUserStatus();
    }, [isClient]);

    if (!isClient) {
        return null; // Render nothing on the server
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 p-4`}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl text-emerald-900 font-bold mb-4 font-serif">
                        Welcome to Goal Reacher!
                    </h1>
                    {/* debug info */}
                    {/* <p className="text-emerald-900">{cookieStatus}</p>
                    {debugInfo && (
                        <div className="text-sm text-gray-600 mt-2">
                            <p>Token length: {debugInfo.tokenLength}</p>
                            <p>All cookies: {JSON.stringify(debugInfo.allCookies)}</p>
                        </div>
                    )} */}
                    <p className="text-lg text-gray-700 mb-6 font-serif">
                        Transform your goals into actionable plans with AI assistance
                    </p>
                    {/* logout button */}
                    {/* <div>
                        <link
                            href="/api/auth/logout"
                            className="bg-red-500 text-white px-4 py-2 rounded">
                            Logout
                        </link>
                    </div> */}
                </div>

                {userStatus !== "working" ? <TaskManager /> : <Calendar />}
                {/* {userStatus === '' ? (
                    <Loading />
                ) : userStatus === "working" ? (
                    <Calendar />
                ) : (
                    <TaskManager />
                )} */}
            </div>
        </div>
    );
}