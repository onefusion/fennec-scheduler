'use client';

import React, { useState } from 'react';
import { TimeSlot } from '@/lib/availability';
import { X, Calendar as CalendarIcon, Clock, CheckCircle2, Download, ExternalLink, User, Mail, FileText } from 'lucide-react';

interface BookingModalProps {
  slot: TimeSlot | null;
  hostName: string;
  requireApproval?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BookingModal({ slot, hostName, requireApproval, onClose, onSuccess }: BookingModalProps) {
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [topicNotes, setTopicNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success state after booking
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: string;
    cancelToken: string;
    status: string;
    icsUrl?: string;
  } | null>(null);

  if (!slot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorEmail.trim()) {
      setErrorMsg('Please provide your name and email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTimeUtc: slot.startTimeUtc,
          endTimeUtc: slot.endTimeUtc,
          visitorName,
          visitorEmail,
          topicNotes,
        }),
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete booking. Slot may have been taken.');
      }

      setConfirmedBooking(data.booking);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateGoogleCalendarUrl = () => {
    if (!slot) return '#';
    const startIso = new Date(slot.startTimeUtc).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = new Date(slot.endTimeUtc).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const text = encodeURIComponent(`Meeting with ${hostName}`);
    const details = encodeURIComponent(`Visitor: ${visitorName}\\nTopic: ${topicNotes || 'N/A'}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startIso}/${endIso}&details=${details}`;
  };

  const handleDownloadIcs = () => {
    if (!slot) return;
    const startIso = new Date(slot.startTimeUtc).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endIso = new Date(slot.endTimeUtc).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Friendly Fennec//Fennec Scheduler//EN',
      'BEGIN:VEVENT',
      `UID:fennec-${Date.now()}@fennec`,
      `DTSTAMP:${startIso}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:Meeting with ${hostName}`,
      `DESCRIPTION:Visitor: ${visitorName} (${visitorEmail})\\nTopic: ${topicNotes || 'None'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `meeting-with-${hostName.toLowerCase().replace(/\s+/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmedBooking ? (
          /* Booking Details Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Complete Your Booking</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Schedule a 30-minute slot with <span className="font-semibold text-amber-600 dark:text-amber-400">{hostName}</span>
              </p>
            </div>

            {/* Slot Details Banner */}
            <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-semibold">{slot.dateStrVisitor}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{slot.startTimeFormatted} - {slot.endTimeFormatted} (30 mins)</span>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-xl p-3 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Alex Smith"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:border-amber-600 dark:focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:border-amber-600 dark:focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Topic / Meeting Notes (Optional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={topicNotes}
                    onChange={(e) => setTopicNotes(e.target.value)}
                    placeholder="What would you like to discuss?"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:border-amber-600 dark:focus:border-amber-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-amber-600/20 transition-all duration-150 disabled:opacity-50"
            >
              {isSubmitting ? 'Confirming Booking...' : requireApproval ? 'Submit Request for Approval' : 'Confirm & Book Slot'}
            </button>
          </form>
        ) : (
          /* Booking Confirmation View */
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {confirmedBooking.status === 'pending' ? 'Request Submitted!' : 'Meeting Scheduled!'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
                {confirmedBooking.status === 'pending'
                  ? `Your meeting request has been sent to ${hostName}. You will receive an email once approved.`
                  : `A calendar invitation has been generated for ${visitorEmail}.`}
              </p>
            </div>

            <div className="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-2xl border border-stone-200 dark:border-stone-700 text-left text-xs space-y-1">
              <p><span className="font-semibold text-stone-500">Host:</span> {hostName}</p>
              <p><span className="font-semibold text-stone-500">Time:</span> {slot.startTimeFormatted} - {slot.endTimeFormatted}</p>
              <p><span className="font-semibold text-stone-500">Date:</span> {slot.dateStrVisitor}</p>
            </div>

            {/* Calendar Export Actions */}
            <div className="space-y-2 pt-2">
              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-black text-white dark:bg-stone-800 dark:hover:bg-stone-700 font-medium text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Add to Google Calendar</span>
              </a>

              <button
                onClick={handleDownloadIcs}
                className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900 font-medium text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Download .ics Calendar File</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 font-medium transition-colors pt-2"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
