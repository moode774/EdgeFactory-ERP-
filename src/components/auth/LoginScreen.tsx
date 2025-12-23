import React, { useState } from 'react';
import { Box, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { User, Language } from '../../types';
import { AuthDB } from '../../services/storage';
import { HybridUserDB } from '../../services/hybridStorage';

const LoginScreen = ({ onLogin, lang }: { onLogin: (user: User) => void; lang: Language }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('🔐 LoginScreen: Attempting login with:', username);
            const user = await HybridUserDB.authenticate(username, password);

            if (user) {
                console.log('✅ LoginScreen: Login successful:', user);
                AuthDB.login(user);
                onLogin(user);
            } else {
                console.log('❌ LoginScreen: Login failed - no user returned');
                setError(lang === 'ar'
                    ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من أن الحساب موجود في Firebase Authentication'
                    : 'Invalid email or password. Make sure the account exists in Firebase Authentication');
            }
        } catch (error: any) {
            console.error('❌ LoginScreen: Login error:', error);
            let errorMessage = lang === 'ar' ? 'حدث خطأ في تسجيل الدخول' : 'Login error occurred';

            if (error.code === 'auth/user-not-found') {
                errorMessage = lang === 'ar' ? 'المستخدم غير موجود في Firebase' : 'User not found in Firebase';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = lang === 'ar' ? 'كلمة المرور غير صحيحة' : 'Wrong password';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = lang === 'ar' ? 'البريد الإلكتروني غير صالح' : 'Invalid email format';
            } else if (error.message) {
                errorMessage += ': ' + error.message;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                        <img src="./logo.png" alt="Forest Edge Factory" className="w-full h-full object-contain drop-shadow-2xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">Forest Edge Factory</h1>
                    <p className="text-slate-400 text-sm">{lang === 'ar' ? 'نظام إدارة المخزون' : 'Inventory Management System'}</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-6 text-center">
                        {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                                    placeholder={lang === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter email'}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors pr-12"
                                    placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <Lock size={18} />
                                    {lang === 'ar' ? 'دخول' : 'Login'}
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 text-center">
                        <p className="text-slate-400 text-xs">
                            {lang === 'ar' ? 'استخدم حساب Firebase Authentication' : 'Use Firebase Authentication account'}
                        </p>
                        <p className="text-slate-300 text-xs mt-1">{lang === 'ar' ? 'البريد الإلكتروني وكلمة المرور' : 'Email & Password'}</p>
                    </div>
                </form>

                <p className="text-center text-slate-500 text-xs mt-6">
                    © 2024 Forest Edge Factory
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;
