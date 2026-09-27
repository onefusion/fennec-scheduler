'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { WeeklySchedule, DateOverride } from '@/schema';
import { Save, Plus, Trash2, Calendar, Clock, CheckCircle2 } from 'lucide-react';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminAvailabilityPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New override form state
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideBlocked, setOverrideBlocked] = useState(true);
  const [overrideRecurrence, setOverrideRecurrence] = useState<'none' | 'weekly' | 'yearly'>('none');

  useEffect(() => {
    fetch('/api/admin/availability')
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login');
          return null;
        }
        return res.json() as Promise<any>;
      })
      .then((data) => {
        if (data) {
          // Fill default 0-6 days if missing
          const existingMap = new Map<number, WeeklySchedule>((data.schedules || []).map((s: WeeklySchedule) => [s.dayOfWeek, s]));
          const fullSchedules: WeeklySchedule[] = [];

          for (let i = 0; i < 7; i++) {
            const existing = existingMap.get(i);
            if (existing) {
              fullSchedules.push(existing);
            } else {
              fullSchedules.push({
                id: i,
                dayOfWeek: i,
                startTime: '09:00',
                endTime: '17:00',
                isActive: i >= 1 && i <= 5, // Mon-Fri active by default
              });
            }
          }

          setSchedules(fullSchedules);
          setOverrides(data.overrides || []);
        }
      });
  }, [router]);

  const handleScheduleChange = (dayOfWeek: number, field: keyof WeeklySchedule, value: any) => {
    setSchedules((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveSchedules = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save schedule', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideDate) return;

    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          override: {
            date: overrideDate,
            isBlocked: overrideBlocked,
            recurrence: overrideRecurrence,
          },
        }),
      });

      if (res.ok) {
        // Refresh overrides
        const fresh: any = await fetch('/api/admin/availability').then((r) => r.json());
        setOverrides(fresh.overrides || []);
        setOverrideDate('');
        setOverrideRecurrence('none');
      }
    } catch (err) {
      console.error('Failed to add override', err);
    }
  };

  const handleDeleteOverride = async (id: number) => {
    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ override: { action: 'delete', id } }),
      });

      if (res.ok) {
        setOverrides((prev) => prev.filter((o) => o.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete override', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAdmin />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Availability & Schedule</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Set your weekly recurring hours and specific date overrides.
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 p-3 rounded-2xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Weekly schedule saved successfully!</span>
          </div>
        )}

        {/* Weekly Recurring Schedule Table */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Weekly Hours</h2>
            </div>
            <button
              onClick={handleSaveSchedules}
              disabled={isSaving}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-amber-600/20 flex items-center space-x-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Schedule'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {schedules.map((s) => (
              <div
                key={s.dayOfWeek}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 gap-3"
              >
                <div className="flex items-center space-x-3 w-36">
                  <input
                    type="checkbox"
                    checked={s.isActive}
                    onChange={(e) => handleScheduleChange(s.dayOfWeek, 'isActive', e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                  <span className={`text-sm font-semibold ${s.isActive ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'}`}>
                    {DAYS_OF_WEEK[s.dayOfWeek]}
                  </span>
                </div>

                {s.isActive ? (
                  <div className="flex items-center space-x-2 text-xs">
                    <input
                      type="time"
                      value={s.startTime}
                      onChange={(e) => handleScheduleChange(s.dayOfWeek, 'startTime', e.target.value)}
                      className="px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl outline-none"
                    />
                    <span className="text-stone-400">to</span>
                    <input
                      type="time"
                      value={s.endTime}
                      onChange={(e) => handleScheduleChange(s.dayOfWeek, 'endTime', e.target.value)}
                      className="px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-stone-400 italic">Unavailable / Unavailable</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Date Overrides Section */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Date-Specific Overrides</h2>
          </div>

          {/* Add Override Form */}
          <form onSubmit={handleAddOverride} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="date"
              required
              value={overrideDate}
              onChange={(e) => setOverrideDate(e.target.value)}
              className="px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none"
            />
            <label className="flex items-center space-x-2 text-xs text-stone-700 dark:text-stone-300">
              <input
                type="checkbox"
                checked={overrideBlocked}
                onChange={(e) => setOverrideBlocked(e.target.checked)}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
              <span>Block out whole day</span>
            </label>

            <select
              value={overrideRecurrence}
              onChange={(e) => setOverrideRecurrence(e.target.value as 'none' | 'weekly' | 'yearly')}
              className="px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none"
            >
              <option value="none">Repeats: Never</option>
              <option value="weekly">Repeats: Weekly (same day of week)</option>
              <option value="yearly">Repeats: Yearly (same date, e.g. a holiday)</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 hover:bg-black text-white dark:bg-stone-800 dark:hover:bg-stone-700 font-medium text-xs rounded-xl flex items-center justify-center space-x-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Override</span>
            </button>
          </form>

          {/* Overrides List */}
          {overrides.length === 0 ? (
            <p className="text-xs text-stone-400 italic py-2">No specific date overrides defined.</p>
          ) : (
            <div className="space-y-2 pt-2">
              {overrides.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-stone-900 dark:text-stone-100">{o.date}</span>
                    <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                      {o.isBlocked ? 'Blocked Out' : 'Custom Hours'}
                    </span>
                    {o.recurrence !== 'none' && (
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        Repeats {o.recurrence === 'weekly' ? 'Weekly' : 'Yearly'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteOverride(o.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
