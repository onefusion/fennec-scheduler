'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { FennecHeader } from '@/components/fennec-brand';
import { CalendarPicker } from '@/components/ui/calendar-picker';
import { TimezoneSelect } from '@/components/ui/timezone-select';
import { SlotGrid } from '@/components/ui/slot-grid';
import { BookingModal } from '@/components/ui/booking-modal';
import { TimeSlot } from '@/lib/availability';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, ShieldAlert } from 'lucide-react';

export const runtime = 'edge';

export default function PublicBookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [visitorTz, setVisitorTz] = useState<string>('America/Chicago');
  const [hostName, setHostName] = useState<string>('Friendly Fennec');
  const [requireApproval, setRequireApproval] = useState<boolean>(false);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Auto-detect visitor's browser timezone on client load
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setVisitorTz(detected);
      }
    } catch (_e) {
      // fallback
    }
  }, []);

  // Fetch available slots whenever selectedDate or visitorTz changes
  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      try {
        const res = await fetch(`/api/bookings?date=${dateStr}&tz=${encodeURIComponent(visitorTz)}`);
        const data: any = await res.json();
        if (res.ok) {
          setSlots(data.slots || []);
          if (data.hostName) setHostName(data.hostName);
          if (typeof data.requireHostApproval === 'boolean') setRequireApproval(data.requireHostApproval);
        }
      } catch (err) {
        console.error('Failed to fetch slots', err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, visitorTz]);

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <FennecHeader
          title={`Book time with ${hostName}`}
          subtitle="Select a date and available 30-minute time slot below"
        />

        {requireApproval && (
          <div className="max-w-xl mx-auto mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center space-x-3 text-xs text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Note:</strong> {hostName} manually reviews booking requests. Your slot will be reserved pending approval.
            </span>
          </div>
        )}

        {/* Main Grid: Calendar Picker + Slots */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 items-start">
          {/* Left Column: Calendar & Timezone Selector */}
          <div className="md:col-span-6 space-y-4">
            <CalendarPicker
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
            />

            <TimezoneSelect value={visitorTz} onChange={(tz) => setVisitorTz(tz)} />
          </div>

          {/* Right Column: Available Time Slots */}
          <div className="md:col-span-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h3>
              </div>
              <div className="flex items-center space-x-1 text-xs text-stone-500">
                <Clock className="w-3.5 h-3.5" />
                <span>30 Min Slots</span>
              </div>
            </div>

            <SlotGrid
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
              isLoading={isLoadingSlots}
            />
          </div>
        </div>
      </main>

      {/* Booking Form Modal */}
      {isModalOpen && selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          hostName={hostName}
          requireApproval={requireApproval}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSlot(null);
          }}
          onSuccess={() => {
            // Re-fetch slots to reflect newly booked time
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            fetch(`/api/bookings?date=${dateStr}&tz=${encodeURIComponent(visitorTz)}`)
              .then((r) => r.json() as Promise<any>)
              .then((d) => setSlots(d.slots || []));
          }}
        />
      )}

      <footer className="py-6 text-center text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200/50 dark:border-stone-800/50 mt-12">
        <p>Powered by <span className="font-semibold text-amber-600 dark:text-amber-400">Fennec Scheduler</span> &bull; Open Source</p>
      </footer>
    </div>
  );
}
