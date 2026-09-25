'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { FennecHeader } from '@/components/fennec-brand';
import { Calendar } from 'lucide-react';

export default function RescheduleBookingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const handleRescheduleRedirect = async () => {
    // Cancel old booking and navigate to public booking page
    await fetch('/api/bookings/token-cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelToken: token }),
    });

    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          <FennecHeader subtitle="Reschedule your appointment" />

          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Pick a New Time Slot</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Rescheduling will release your current appointment and allow you to select a new 30-minute time slot.
            </p>
          </div>

          <button
            onClick={handleRescheduleRedirect}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-amber-600/20 transition-all"
          >
            Select New Time Slot &rarr;
          </button>
        </div>
      </main>
    </div>
  );
}
