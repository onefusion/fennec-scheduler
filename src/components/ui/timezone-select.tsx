'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { COMMON_TIMEZONES } from '@/lib/timezones';

interface TimezoneSelectProps {
  value: string;
  onChange: (tz: string) => void;
}

export function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
  return (
    <div className="flex items-center space-x-2 text-xs text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 min-w-0">
      <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
      <span className="font-medium shrink-0">Time Zone:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        title={value}
        className="bg-transparent font-medium text-stone-800 dark:text-stone-200 outline-none cursor-pointer hover:text-amber-700 dark:hover:text-amber-400 transition-colors w-full min-w-0 truncate"
      >
        {COMMON_TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
            {tz.label} ({tz.value})
          </option>
        ))}
      </select>
    </div>
  );
}
