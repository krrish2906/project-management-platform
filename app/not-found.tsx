'use client';

import React from 'react';
import { Home, ArrowLeft, Search, MessageSquare, Mail, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                {/* Main 404 Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">


                    {/* Content Section */}
                    <div className="p-8 md:p-12">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-36 h-36 rounded-full bg-blue-50 mb-6">
                                <span className="text-6xl font-bold text-blue-500">404</span>
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                Oops! Page Not Found
                            </h2>
                            <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
                                The page you're looking for doesn't exist or has been moved.
                                Don't worry, let's get you back on track.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <button
                                onClick={() => router.back()}
                                className="inline-flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all hover:shadow-md"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Go Back</span>
                            </button>

                            <button
                                onClick={() => router.push('/')}
                                className="inline-flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg"
                            >
                                <Home className="w-5 h-5" />
                                <span>Back to Home</span>
                            </button>
                        </div>

                        {/* Quick Links Grid */}
                        {/* <div className="border-t border-gray-200 pt-8">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider text-center mb-6">
                                Quick Links
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button
                                    onClick={() => router.push('/')}
                                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                                        <Home className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Home</span>
                                </button>
                            </div>
                        </div> */}
                    </div>

                    {/* Footer Section */}
                    <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FileText className="w-4 h-4" />
                                <span>Error Code: <span className="font-mono font-semibold">404</span></span>
                            </div>
                            <div className="text-sm text-gray-500">
                                Need help? <a href="/support" className="text-blue-600 hover:text-blue-700 font-medium">Contact Support</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info Card */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500" suppressHydrationWarning>
                        Timestamp: {new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
