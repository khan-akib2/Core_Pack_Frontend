'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Box, Lock, Mail, EyeOff, Eye, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sloganIndex, setSloganIndex] = useState(0);

  const slogans = [
    "Convert your ideas\ninto successful\nbusiness.",
    "Streamlining your\nlogistics with\nsmart packaging.",
    "Sustainable wooden\nand corrugated\nsolutions.",
    "Empowering supply\nchains across\nIndia."
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % slogans.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const { setAuth } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    const tryBiometricLogin = async () => {
      if (!Capacitor.isNativePlatform()) return;
      const biometricEnabled = localStorage.getItem('cp_biometric_enabled') === 'true';
      if (!biometricEnabled) return;

      try {
        const { value: refreshToken } = await SecureStorage.get({ key: 'cp_refresh_token' });
        if (!refreshToken) return;

        const result = await NativeBiometric.isAvailable();
        if (!result.isAvailable) return;

        await NativeBiometric.verifyIdentity({
          reason: "Authenticate to unlock CorePack",
          title: "Biometric Unlock"
        });

        setLoading(true);
        // User authenticated natively, now refresh the session
        const response = await api.post('/auth/refresh-token', { refreshToken });
        const { user, accessToken, refreshToken: newRefreshToken } = response.data.data;
        setAuth(user, accessToken, newRefreshToken);
        router.push('/');
      } catch (err) {
        console.error('Biometric login failed:', err);
        setLoading(false);
      }
    };

    tryBiometricLogin();
  }, [router, setAuth]);

  // router and setAuth are already declared above

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#EAE6DF] flex items-center justify-center p-4 lg:p-8 font-sans">
      
      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1050px] bg-[#F4F5F7] rounded-2xl md:rounded-[2rem] shadow-2xl flex flex-col md:flex-row md:h-[90vh] max-h-[700px] p-4 lg:p-5"
      >
        
        {/* Left Side (Image & Text Floating Card) */}
        <div className="hidden md:flex w-1/2 relative rounded-3xl overflow-hidden bg-white">
          {/* Aesthetic Background Image */}
          <div className="absolute inset-0 z-0">
             <img src="/images/login-bg.jpg?v=2" alt="Aesthetic Background" className="w-full h-full object-cover scale-105" />
          </div>
          
          <div className="relative z-10 p-6 lg:p-8 w-full h-full flex flex-col">
            <AnimatePresence mode="wait">
              <motion.h1 
                key={sloganIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="text-2xl lg:text-[28px] font-serif  text-stone-800 leading-[1.3] tracking-wide whitespace-pre-line"
              >
                {slogans[sloganIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 lg:px-12 lg:pt-6 lg:pb-10 flex flex-col relative rounded-3xl">
          
          <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3, duration: 0.6 }}
             className="w-full max-w-sm mx-auto h-full flex flex-col"
          >
            {/* Logo area */}
            <div className="mb-8 mt-0">
              <img src="/branding/logo-trimmed.png" alt="Core Pack India" className="h-11 md:h-14 object-contain mix-blend-multiply" style={{ mixBlendMode: 'multiply' }} />
            </div>

            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight">Get Started</h2>
              <p className="text-[12px] md:text-[13px] text-slate-400 mt-2 font-medium">Welcome to Core Pack India — Let's get started</p>
            </div>

            <div className="w-full h-px bg-slate-100 mb-6"></div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-semibold overflow-hidden"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Your email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-[#EA580C] transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 shadow-sm rounded-xl text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                    placeholder="hi@corepack.in"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-medium text-slate-500 ml-1">Enter password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-[#EA580C] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-white border border-slate-200 shadow-sm rounded-xl text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-[#E85C0D] to-[#F97316] hover:from-[#D4530A] hover:to-[#EA580C] text-white font-semibold text-[13px] py-3.5 px-4 rounded-xl shadow-md shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-[#E85C0D] focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : 'Login to account'}
              </motion.button>
            </form>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
