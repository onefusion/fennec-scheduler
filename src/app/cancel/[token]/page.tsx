'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { FennecHeader } from '@/components/fennec-brand';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function CancelBookingPage() {
  const params = useParams();
  const token = params.token as string;

  const [isCancelled, setIsCancelled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCancel = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/bookings/token-cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelToken: token }),
      });

      if (!res.ok) {
        const data: any = await res.json();
        throw new Error(data.error || 'Failed to cancel booking.');
      }

      setIsCancelled(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          <FennecHeader subtitle="Manage your appointment" />

          {!isCancelled ? (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Cancel Appointment?</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Are you sure you want to cancel your scheduled meeting slot? This action cannot be undone.
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-xl p-3 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-red-600/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Cancelling...' : 'Yes, Cancel Meeting'}
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Appointment Cancelled</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Your meeting has been cancelled. The host and attendee have been notified.
              </p>

              <a
                href="/"
                className="inline-block mt-4 text-xs font-semibold text-amber-600 hover:underline"
              >
                Book a new time slot &rarr;
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
