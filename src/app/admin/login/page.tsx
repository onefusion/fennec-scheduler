'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { FennecBrandLogo } from '@/components/fennec-brand';
import { Lock, Mail, User, Sparkles, ArrowRight } from 'lucide-react';

export const runtime = 'edge';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [hostName, setHostName] = useState('Friendly Fennec');
  const [hostEmail, setHostEmail] = useState('');
  const [timezone, setTimezone] = useState('America/Chicago');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check whether system is initialized
    fetch('/api/admin/login')
      .then((res) => res.json() as Promise<any>)
      .then((data) => {
        setIsInitialized(Boolean(data.isInitialized));
        if (data.hostName) setHostName(data.hostName);
      })
      .catch(() => setIsInitialized(true));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName, hostEmail, password, timezone }),
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Setup failed');
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialized === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex p-3 bg-amber-50 dark:bg-amber-950/50 rounded-2xl border border-amber-200 dark:border-amber-900 mb-2">
              <FennecBrandLogo className="w-10 h-10" />
            </div>

            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {!isInitialized ? 'Welcome to Fennec Scheduler' : 'Host Admin Login'}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {!isInitialized
                ? 'Complete this 1-minute setup wizard to create your admin account.'
                : 'Enter your password to manage availability and bookings.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-xl p-3 text-xs">
              {errorMsg}
            </div>
          )}

          {!isInitialized ? (
            /* First-Run Onboarding Setup Wizard Form */
            <form onSubmit={handleOnboardingSetup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Host Name / Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Friendly Fennec"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Host Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={hostEmail}
                    onChange={(e) => setHostEmail(e.target.value)}
                    placeholder="fennec@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Create Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-amber-600/20 flex items-center justify-center space-x-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? 'Setting up...' : 'Complete Setup & Open Dashboard'}</span>
              </button>
            </form>
          ) : (
            /* Regular Admin Password Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-amber-600/20 flex items-center justify-center space-x-2 transition-all"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
