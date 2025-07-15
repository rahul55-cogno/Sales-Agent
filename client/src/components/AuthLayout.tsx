import React from 'react';
import { Shield, TrendingUp, Users, Star } from 'lucide-react';
interface AuthLayoutProps {
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-green-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold">SalesAssist</h1>
                        </div>
                        <p className="text-xl font-light leading-relaxed text-blue-100">
                            Supercharge your sales process with AI-powered insights and automation.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Enterprise Security</h3>
                                <p className="text-blue-100">Your data is protected with bank-level security and compliance.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Team Collaboration</h3>
                                <p className="text-blue-100">Seamlessly collaborate with your sales team in real-time.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Star className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Proven Results</h3>
                                <p className="text-blue-100">Join thousands of sales professionals who've boosted their productivity by 40%.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-1/4 -right-16 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                <div className="absolute bottom-1/4 -left-16 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile header */}
                    <div className="text-center lg:hidden">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">SalesAssist</h1>
                        </div>
                        <p className="text-gray-600">
                            Supercharge your sales process with AI-powered insights
                        </p>
                    </div>

                    <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
                            <p className="text-gray-600">
                                Sign in to your account to access your sales dashboard
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};