'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Booking } from '@/schema';
import { format, parseISO } from 'date-fns';
import { Check, X, Calendar, Clock, Mail, ShieldAlert, LogOut, CheckCircle2, Search } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const bookingsRes = await fetch('/api/admin/availability'); // auth check
      if (bookingsRes.status === 401) {
        router.push('/admin/login');
        return;
      }

      // Fetch bookings list directly from API
      const listRes = await fetch('/api/bookings?date=all');
      const listData: any = await listRes.json();
      setBookingsList(listData.bookings || []);
    } catch (_e) {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveAction = async (bookingId: string, action: 'confirm' | 'deny') => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Approve action failed', err);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Cancel booking failed', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const pendingBookings = bookingsList.filter((b) => b.status === 'pending');
  const confirmedBookings = bookingsList.filter((b) => b.status === 'confirmed');

  const tabFilteredBookings =
    activeTab === 'pending'
      ? pendingBookings
      : activeTab === 'confirmed'
      ? confirmedBookings
      : bookingsList;

  const searchTerm = searchQuery.trim().toLowerCase();
  const displayedBookings = searchTerm
    ? tabFilteredBookings.filter(
        (b) =>
          b.visitorName.toLowerCase().includes(searchTerm) ||
          b.visitorEmail.toLowerCase().includes(searchTerm)
      )
    : tabFilteredBookings;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAdmin />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Host Admin Dashboard</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Manage incoming slot bookings, approvals, and scheduling rules.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/60 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by visitor name or email..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-stone-200 dark:border-stone-800 pb-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Pending Approval ({pendingBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('confirmed')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all ${
              activeTab === 'confirmed'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed ({confirmedBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all ${
              activeTab === 'all'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <span>All Bookings ({bookingsList.length})</span>
          </button>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
            <Calendar className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No bookings found</p>
            <p className="text-xs text-stone-400 mt-1">
              {searchTerm
                ? `No ${activeTab} bookings match "${searchQuery}".`
                : `There are no ${activeTab} bookings at this time.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedBookings.map((b) => {
              const startDate = parseISO(b.startTimeUtc);

              return (
                <div
                  key={b.id}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{b.visitorName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase tracking-wider ${
                          b.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-stone-600 dark:text-stone-400 pt-1">
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        <span>{b.visitorEmail}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{format(startDate, 'EEE, MMM d @ h:mm a')} UTC</span>
                      </span>
                    </div>

                    {b.topicNotes && (
                      <p className="text-stone-500 dark:text-stone-400 italic pt-1">
                        &quot;{b.topicNotes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveAction(b.id, 'confirm')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl flex items-center space-x-1 shadow-xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>
                        <button
                          onClick={() => handleApproveAction(b.id, 'deny')}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-xl flex items-center space-x-1 shadow-xs transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Deny</span>
                        </button>
                      </>
                    )}

                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-stone-600 dark:text-stone-400 hover:text-red-600 font-medium text-xs rounded-xl transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
