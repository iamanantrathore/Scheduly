import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Save, RefreshCw } from 'lucide-react';

export default function EmailTemplates() {
  const [templates, setTemplates] = useState({
    bookingConfirmation: {
      subject: 'Booking Confirmed: {event_name}',
      body: `Hi {invitee_name},

Your booking for "{event_name}" has been confirmed!

📅 Date: {date}
🕐 Time: {time}
📍 Location: {location}

We'll send you a reminder 24 hours before the meeting.

Best regards,
Scheduly Team`
    },
    bookingCancellation: {
      subject: 'Booking Cancelled: {event_name}',
      body: `Hi {invitee_name},

Your booking for "{event_name}" on {date} at {time} has been cancelled.

If you need to reschedule, please book a new time.

Best regards,
Scheduly Team`
    },
    reminder: {
      subject: 'Reminder: {event_name} tomorrow',
      body: `Hi {invitee_name},

This is a reminder for your upcoming meeting "{event_name}".

📅 Date: {date}
🕐 Time: {time}
📍 Location: {location}

See you then!

Best regards,
Scheduly Team`
    }
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const res = await axios.get('/api/email-templates');
      setTemplates(res.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setMessage('Failed to load templates');
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');

    try {
      // Save to backend
      await axios.post('/api/email-templates', templates);
      setMessage('Templates saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save templates');
    } finally {
      setSaving(false);
    }
  }

  function handleTemplateChange(type, field, value) {
    setTemplates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  }

  const templateTypes = [
    { key: 'bookingConfirmation', title: 'Booking Confirmation', description: 'Sent when a booking is confirmed' },
    { key: 'bookingCancellation', title: 'Booking Cancellation', description: 'Sent when a booking is cancelled' },
    { key: 'reminder', title: 'Meeting Reminder', description: 'Sent 24 hours before the meeting' }
  ];

  const variables = [
    '{invitee_name}', '{event_name}', '{date}', '{time}', '{location}'
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Templates</h1>
        <p className="text-gray-600">Customize the email notifications sent to your invitees</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {message}
        </div>
      )}

      {/* Variables Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Available Variables</h3>
        <div className="flex flex-wrap gap-2">
          {variables.map(variable => (
            <code key={variable} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {variable}
            </code>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="space-y-6">
        {templateTypes.map(({ key, title, description }) => (
          <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={templates[key].subject}
                  onChange={(e) => handleTemplateChange(key, 'subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Body
                </label>
                <textarea
                  rows={8}
                  value={templates[key].body}
                  onChange={(e) => handleTemplateChange(key, 'body', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Templates'}
        </button>
      </div>
    </div>
  );
}