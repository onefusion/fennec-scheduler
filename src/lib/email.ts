import { Booking } from '@/schema';
import { generateIcsForBooking } from './ical';

export async function sendBookingEmailNotification({
  booking,
  hostName,
  hostEmail,
  type,
  siteUrl,
}: {
  booking: Booking;
  hostName: string;
  hostEmail: string;
  type: 'created_confirmed' | 'created_pending' | 'host_confirmed' | 'host_denied' | 'cancelled';
  siteUrl: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const cancelUrl = `${siteUrl}/cancel/${booking.cancelToken}`;
  const rescheduleUrl = `${siteUrl}/reschedule/${booking.cancelToken}`;

  const icsData = generateIcsForBooking(booking, hostName, hostEmail);

  let subject = '';
  let htmlContent = '';

  switch (type) {
    case 'created_confirmed':
      subject = `Confirmed: Meeting with ${hostName}`;
      htmlContent = `
        <h2>Your meeting with ${hostName} is confirmed!</h2>
        <p><strong>Name:</strong> ${booking.visitorName}</p>
        <p><strong>Date & Time:</strong> ${booking.startTimeUtc} (UTC)</p>
        <p><strong>Topic:</strong> ${booking.topicNotes || 'N/A'}</p>
        <hr/>
        <p>Need to make changes?</p>
        <p><a href="${rescheduleUrl}">Reschedule Meeting</a> | <a href="${cancelUrl}">Cancel Meeting</a></p>
      `;
      break;

    case 'created_pending':
      subject = `Pending Approval: Meeting request with ${hostName}`;
      htmlContent = `
        <h2>Your meeting request has been submitted!</h2>
        <p>${hostName} reviews incoming requests. You will receive an email update once your booking is confirmed or denied.</p>
        <p><strong>Topic:</strong> ${booking.topicNotes || 'N/A'}</p>
      `;
      break;

    case 'host_confirmed':
      subject = `Approved! Your meeting with ${hostName} has been confirmed`;
      htmlContent = `
        <h2>Good news! ${hostName} confirmed your booking.</h2>
        <p><strong>Date & Time:</strong> ${booking.startTimeUtc} (UTC)</p>
        <p><a href="${rescheduleUrl}">Reschedule</a> | <a href="${cancelUrl}">Cancel</a></p>
      `;
      break;

    case 'host_denied':
      subject = `Update: Meeting request with ${hostName}`;
      htmlContent = `
        <h2>Meeting Request Declined</h2>
        <p>Unfortunately, ${hostName} was unable to confirm your booking for this time slot.</p>
      `;
      break;

    case 'cancelled':
      subject = `Cancelled: Meeting with ${hostName}`;
      htmlContent = `
        <h2>Meeting Cancelled</h2>
        <p>The meeting scheduled for ${booking.startTimeUtc} has been cancelled.</p>
      `;
      break;
  }

  if (!resendApiKey) {
    console.log(`[EMAIL FALLBACK] (${type}) Subject: ${subject}`);
    console.log(`[EMAIL FALLBACK] Sent to: ${booking.visitorEmail}`);
    return { success: true, mode: 'fallback' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `Fennec Scheduler <noreply@fennecscheduler.com>`,
        to: [booking.visitorEmail, hostEmail],
        subject: subject,
        html: htmlContent,
        attachments:
          type === 'created_confirmed' || type === 'host_confirmed'
            ? [
                {
                  filename: 'invite.ics',
                  content: Buffer.from(icsData).toString('base64'),
                },
              ]
            : [],
      }),
    });

    if (!res.ok) {
      console.warn('Resend API call returned non-200 status', await res.text());
    }
    return { success: true, mode: 'resend' };
  } catch (err) {
    console.error('Failed to send email via Resend', err);
    return { success: false, error: err };
  }
}
