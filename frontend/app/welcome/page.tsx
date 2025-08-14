'use client';

import TaskManager from '../components/TaskManager';

export default function WelcomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl text-indigo-700 font-bold mb-4">
                        Welcome to Goal Reacher!
                    </h1>
                    <p className="text-lg text-gray-700 mb-6">
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
                
                <TaskManager />
            </div>
        </div>
    );
}