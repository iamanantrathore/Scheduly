import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Clock } from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    TIME_OPTIONS.push(`${hh}:${mm}`);
  }
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function Availability() {
  const [availability, setAvailability] = useState([]);
  const [timezone, setTimezone] = useState('UTC');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/availability')
      .then((res) => {
        if (res.data.length === 0) {
          // Initialize with defaults
          setAvailability(
            Array.from({ length: 7 }, (_, i) => ({
              day_of_week: i,
              start_time: '09:00',
              end_time: '17:00',
              is_active: i >= 1 && i <= 5 ? 1 : 0,
            }))
          );
        } else {
          setAvailability(res.data);
          setTimezone(res.data[0]?.timezone || 'UTC');
        }
      })
      .catch(() => setError('Failed to load availability'))
      .finally(() => setLoading(false));
  }, []);

  function updateDay(dayIndex, field, value) {
    setAvailability((prev) =>
      prev.map((d) => d.day_of_week === dayIndex ? { ...d, [field]: value } : d)
    );
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await axios.put('/api/availability', { availability, timezone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save availability');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="card p-6 space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="text-gray-500 mt-1">Set your weekly schedule</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={16} />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">{error}</div>}

      <div className="card p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Tokyo">Tokyo</option>
        </select>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
          Availability saved successfully!
        </div>
      )}

      <div className="card divide-y divide-gray-100">
        {availability.map((day) => (
          <div key={day.day_of_week} className="px-6 py-4 flex items-center gap-4">
            {/* Toggle */}
            <button
              onClick={() => updateDay(day.day_of_week, 'is_active', day.is_active ? 0 : 1)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                day.is_active ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  day.is_active ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>

            {/* Day name */}
            <span className={`w-24 text-sm font-medium ${day.is_active ? 'text-gray-900' : 'text-gray-400'}`}>
              {DAY_NAMES[day.day_of_week]}
            </span>

            {day.is_active ? (
              <div className="flex items-center gap-3 flex-1">
                <select
                  value={day.start_time}
                  onChange={(e) => updateDay(day.day_of_week, 'start_time', e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{formatTime(t)}</option>
                  ))}
                </select>
                <span className="text-gray-400 text-sm">to</span>
                <select
                  value={day.end_time}
                  onChange={(e) => updateDay(day.day_of_week, 'end_time', e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{formatTime(t)}</option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-sm text-gray-400 italic">Unavailable</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
        <Clock size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">Timezone</p>
          <p className="text-sm text-blue-700 mt-0.5">{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
        </div>
      </div>
    </div>
  );
}
