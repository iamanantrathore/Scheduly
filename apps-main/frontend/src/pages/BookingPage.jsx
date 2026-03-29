import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Clock, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import Calendar from '../components/Calendar';
import TimeSlots from '../components/TimeSlots';

const STEPS = { SELECT_DATE_TIME: 1, BOOKING_FORM: 2 };

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [eventType, setEventType] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [timezone, setTimezone] = useState('UTC');
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [step, setStep] = useState(STEPS.SELECT_DATE_TIME);
  const [form, setForm] = useState({ name: '', email: '', notes: '' });
  const [customAnswers, setCustomAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    Promise.all([
      axios.get(`/api/event-types/slug/${slug}`),
      axios.get('/api/availability'),
    ])
      .then(([etRes, availRes]) => {
        setEventType(etRes.data);
        setAvailability(availRes.data);
        setTimezone(availRes.data[0]?.timezone || 'UTC');
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingEvent(false));
  }, [slug]);

  useEffect(() => {
    if (!selectedDate || !eventType) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    axios
      .get(`/api/booking/${slug}/slots?date=${dateStr}`)
      .then((res) => setSlots(res.data.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, eventType, slug]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const customQuestions = eventType.custom_questions
        ? (typeof eventType.custom_questions === 'string' ? JSON.parse(eventType.custom_questions) : eventType.custom_questions)
        : [];
      
      const custom_answers = customQuestions.map((q) => ({
        question: q,
        answer: customAnswers[q] || '',
      }));

      const res = await axios.post(`/api/booking/${slug}`, {
        invitee_name: form.name,
        invitee_email: form.email,
        date: dateStr,
        time: selectedSlot,
        notes: form.notes,
        custom_answers,
      });
      navigate(`/booking/confirm/${res.data.id}`);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const activeDays = availability
    .filter((a) => a.is_active)
    .map((a) => a.day_of_week);

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-500">This booking page doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left panel - event info */}
          <div
            className="md:w-72 lg:w-80 flex-shrink-0 p-8 border-b md:border-b-0 md:border-r border-gray-100"
            style={{ borderLeftColor: eventType.color, borderLeftWidth: 4 }}
          >
            <div className="mb-6">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mb-4"
                style={{ backgroundColor: eventType.color }}
              >
                {eventType.name[0]}
              </div>
              <p className="text-sm text-gray-500 mb-1">Admin User</p>
              <h1 className="text-xl font-bold text-gray-900">{eventType.name}</h1>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={15} style={{ color: eventType.color }} />
                <span>{eventType.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe size={15} style={{ color: eventType.color }} />
                <span>{timezone}</span>
              </div>
            </div>

            {eventType.description && (
              <p className="mt-6 text-sm text-gray-500 leading-relaxed">{eventType.description}</p>
            )}

            {step === STEPS.BOOKING_FORM && selectedDate && selectedSlot && (
              <div
                className="mt-6 p-3 rounded-lg text-sm"
                style={{ backgroundColor: eventType.color + '15', color: eventType.color }}
              >
                <p className="font-semibold">{format(selectedDate, 'EEEE, MMMM d')}</p>
                <p className="mt-0.5">
                  {format(new Date(`2000-01-01T${selectedSlot}:00`), 'h:mm a')}
                </p>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex-1 p-8">
            {step === STEPS.SELECT_DATE_TIME && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Select a Date &amp; Time</h2>
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <Calendar
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      availableDays={activeDays}
                    />
                  </div>
                  {selectedDate && (
                    <div className="lg:w-48">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        {format(selectedDate, 'EEEE, MMM d')}
                      </h3>
                      <TimeSlots
                        slots={slots}
                        selectedSlot={selectedSlot}
                        onSelectSlot={(slot) => {
                          setSelectedSlot(slot);
                          setStep(STEPS.BOOKING_FORM);
                        }}
                        loading={loadingSlots}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {step === STEPS.BOOKING_FORM && (
              <>
                <button
                  onClick={() => { setStep(STEPS.SELECT_DATE_TIME); setSelectedSlot(null); }}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>

                <h2 className="text-lg font-semibold text-gray-900 mb-6">Enter your details</h2>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Jane Smith"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="jane@example.com"
                      className="input"
                      required
                    />
                  </div>
                  {eventType.custom_questions && (typeof eventType.custom_questions === 'string' ? JSON.parse(eventType.custom_questions) : eventType.custom_questions).length > 0 && (
                    <div className="border-t pt-5 mt-5">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Additional Questions</h3>
                      {(typeof eventType.custom_questions === 'string' ? JSON.parse(eventType.custom_questions) : eventType.custom_questions).map((question) => (
                        <div key={question} className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {question}
                          </label>
                          <input
                            type="text"
                            value={customAnswers[question] || ''}
                            onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [question]: e.target.value }))}
                            className="input"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Additional Notes
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Anything you'd like to share before our meeting?"
                      className="input resize-none"
                      rows={4}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-3"
                    style={{ backgroundColor: eventType.color }}
                  >
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
