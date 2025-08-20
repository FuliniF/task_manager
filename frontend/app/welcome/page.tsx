'use client';

import TaskManager from '../components/TaskManager';
export default function WelcomePage() {
    return (
        <div className={`min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 p-4`}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl text-emerald-900 font-bold mb-4 font-serif">
                        Welcome to Goal Reacher!
                    </h1>
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
                
                <TaskManager />
            </div>
        </div>
    );
}