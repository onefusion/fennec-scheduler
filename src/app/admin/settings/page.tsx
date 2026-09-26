'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { COMMON_TIMEZONES } from '@/lib/timezones';
import { Save, CheckCircle2, Copy, ShieldAlert, Palette, Calendar } from 'lucide-react';

export const runtime = 'edge';

const THEME_PRESETS = [
  { name: 'Friendly Fennec (Warm Amber)', primary: '#E07A5F', accent: '#F59E0B' },
  { name: 'Emerald Forest', primary: '#059669', accent: '#10B981' },
  { name: 'Sapphire Ocean', primary: '#2563EB', accent: '#3B82F6' },
  { name: 'Violet Sunset', primary: '#7C3AED', accent: '#8B5CF6' },
  { name: 'Rose Quartz', primary: '#E11D48', accent: '#F43F5E' },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [hostName, setHostName] = useState('Friendly Fennec');
  const [hostEmail, setHostEmail] = useState('fennec@example.com');
  const [newPassword, setNewPassword] = useState('');
  const [timezone, setTimezone] = useState('America/Chicago');
  const [requireHostApproval, setRequireHostApproval] = useState(false);
  const [minAdvanceNoticeHours, setMinAdvanceNoticeHours] = useState(2);
  const [maxFutureBookingDays, setMaxFutureBookingDays] = useState(30);

  const [primaryThemeColor, setPrimaryThemeColor] = useState('#E07A5F');
  const [accentThemeColor, setAccentThemeColor] = useState('#F59E0B');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [icalFeedUrl, setIcalFeedUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIcalFeedUrl(`${window.location.origin}/api/ical`);
    }

    fetch('/api/admin/settings')
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login');
          return null;
        }
        return res.json() as Promise<any>;
      })
      .then((data) => {
        if (data) {
          if (data.hostName) setHostName(data.hostName);
          if (data.hostEmail) setHostEmail(data.hostEmail);
          if (data.timezone) setTimezone(data.timezone);
          if (typeof data.requireHostApproval === 'boolean') setRequireHostApproval(data.requireHostApproval);
          if (typeof data.minAdvanceNoticeHours === 'number') setMinAdvanceNoticeHours(data.minAdvanceNoticeHours);
          if (typeof data.maxFutureBookingDays === 'number') setMaxFutureBookingDays(data.maxFutureBookingDays);
          if (data.primaryThemeColor) setPrimaryThemeColor(data.primaryThemeColor);
          if (data.accentThemeColor) setAccentThemeColor(data.accentThemeColor);
        }
      });
  }, [router]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName,
          hostEmail,
          newPassword: newPassword || undefined,
          timezone,
          requireHostApproval,
          minAdvanceNoticeHours,
          maxFutureBookingDays,
          primaryThemeColor,
          accentThemeColor,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setNewPassword('');
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyIcalUrl = () => {
    navigator.clipboard.writeText(icalFeedUrl);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAdmin />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Host & App Settings</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Configure your profile, approval workflow, theme colors, and calendar integrations.
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 p-3 rounded-2xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Host Profile Section */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 pb-2 border-b border-stone-100 dark:border-stone-800">
              Host Profile & Credentials
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Display / Host Name
                </label>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Host Email Address
                </label>
                <input
                  type="email"
                  required
                  value={hostEmail}
                  onChange={(e) => setHostEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Primary Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label} ({tz.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Update Admin Password (Optional)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* Booking Rules & Approval Flow */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 pb-2 border-b border-stone-100 dark:border-stone-800">
              Booking Rules & Approval Workflow
            </h2>

            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <label className="flex items-center space-x-2 font-bold text-sm text-stone-900 dark:text-stone-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireHostApproval}
                    onChange={(e) => setRequireHostApproval(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                  <span>Require Host Approval (Confirm / Deny)</span>
                </label>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  When enabled, visitor bookings start as <code>pending</code>. You will confirm or deny requests from your dashboard.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Minimum Advance Notice (Hours)
                </label>
                <input
                  type="number"
                  min={0}
                  max={72}
                  value={minAdvanceNoticeHours}
                  onChange={(e) => setMinAdvanceNoticeHours(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Maximum Future Horizon (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={maxFutureBookingDays}
                  onChange={(e) => setMaxFutureBookingDays(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* Custom Theme Color Palette */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-stone-100 dark:border-stone-800">
              <Palette className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Theme & Accent Colors</h2>
            </div>

            <p className="text-xs text-stone-500">Pick a preset color palette or enter custom Hex codes:</p>

            <div className="flex flex-wrap gap-2">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setPrimaryThemeColor(preset.primary);
                    setAccentThemeColor(preset.accent);
                  }}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.primary }} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Primary Theme Color (Hex)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={primaryThemeColor}
                    onChange={(e) => setPrimaryThemeColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={primaryThemeColor}
                    onChange={(e) => setPrimaryThemeColor(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Accent Color (Hex)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={accentThemeColor}
                    onChange={(e) => setAccentThemeColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={accentThemeColor}
                    onChange={(e) => setAccentThemeColor(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* iCal Feed Export Section */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-stone-100 dark:border-stone-800">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Calendar Sync Feed (iCal / Webcal)</h2>
            </div>
            <p className="text-xs text-stone-500">
              Subscribe to this live feed URL in Google Calendar, Apple Calendar, or Outlook to see your bookings automatically.
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={icalFeedUrl}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none font-mono text-stone-600 dark:text-stone-300"
              />
              <button
                type="button"
                onClick={handleCopyIcalUrl}
                className="px-3 py-2 bg-stone-900 text-white dark:bg-stone-800 text-xs font-medium rounded-xl shrink-0 flex items-center space-x-1 hover:bg-black transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedFeed ? 'Copied!' : 'Copy Feed URL'}</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-amber-600/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save All Settings'}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
