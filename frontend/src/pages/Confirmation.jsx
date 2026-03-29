import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { CheckCircle, Calendar, Clock, Mail, User, ExternalLink } from 'lucide-react';

function buildGoogleCalendarUrl(booking) {
  const start = parseISO(booking.start_time);
  const end = parseISO(booking.end_time);

  const fmt = (d) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: booking.event_type_name || 'Meeting',
    dates: `${fmt(start)}/${fmt(end)}`,
    details: booking.notes || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function Confirmation() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await axios.get(`/api/meetings/${bookingId}`);
        setBooking(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Booking not found');
        } else {
          setError('Failed to load booking details');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  const startDate = parseISO(booking.start_time);
  const endDate = parseISO(booking.end_time);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">You're scheduled!</h1>
          <p className="text-gray-500 mt-1">
            A confirmation has been sent to <strong>{booking.invitee_email}</strong>
          </p>
        </div>

        {/* Booking details card */}
        <div className="card p-6 mb-4">
          <div
            className="w-full h-1 rounded-full mb-5"
            style={{ backgroundColor: booking.color || '#0069ff' }}
          />

          <h2 className="font-semibold text-gray-900 text-lg mb-4">{booking.event_type_name}</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User size={15} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">{booking.invitee_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail size={15} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">{booking.invitee_email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={15} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">{format(startDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock size={15} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">
                {format(startDate, 'h:mm a')} – {format(endDate, 'h:mm a')}
                <span className="text-gray-400 ml-1">({booking.duration} min)</span>
              </span>
            </div>
          </div>

          {booking.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 italic">"{booking.notes}"</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href={buildGoogleCalendarUrl(booking)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border border-gray-300 bg-white text-gray-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Calendar size={16} />
            Add to Google Calendar
            <ExternalLink size={14} className="ml-auto text-gray-400" />
          </a>

          <Link
            to={`/${booking.slug}`}
            className="flex items-center justify-center w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
          >
            Book another meeting
          </Link>
        </div>
      </div>
    </div>
  );
}
