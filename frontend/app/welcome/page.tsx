'use client';

export default function WelcomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl text-indigo-700 font-bold mb-8">
                Welcome to Goal Reacher!
            </h1>
            <p className="text-lg text-gray-700 mb-4">
                Hi, you are here because you logged in successfully. Yay!
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
    );
}