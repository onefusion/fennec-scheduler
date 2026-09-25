'use client';

import React from 'react';
import { TimeSlot } from '@/lib/availability';
import { Clock } from 'lucide-react';

interface SlotGridProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

export function SlotGrid({ slots, selectedSlot, onSelectSlot, isLoading }: SlotGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-500">Finding available 30-min times...</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-stone-700">
        <Clock className="w-10 h-10 text-stone-300 dark:text-stone-600 mb-2" />
        <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No times available</p>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mt-1">
          There are no available 30-minute slots for this date. Please pick another day on the calendar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.startTimeUtc === slot.startTimeUtc;

          return (
            <button
              key={slot.startTimeUtc}
              onClick={() => onSelectSlot(slot)}
              className={`
                px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 flex items-center justify-between
                ${
                  isSelected
                    ? 'border-amber-600 bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-[1.02]'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
                }
              `}
            >
              <span className="font-semibold">{slot.startTimeFormatted}</span>
              <span className={`text-xs ${isSelected ? 'text-amber-100' : 'text-stone-400'}`}>
                30 min
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
