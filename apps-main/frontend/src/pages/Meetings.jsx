import { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import MeetingCard from '../components/MeetingCard';

export default function Meetings() {
  const [tab, setTab] = useState('upcoming');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editNotes, setEditNotes] = useState('');

  async function fetchMeetings(type) {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/meetings?type=${type}`);
      setMeetings(res.data);
    } catch {
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMeetings(tab);
  }, [tab]);

  async function handleCancel(meeting) {
    if (!window.confirm(`Delete meeting with ${meeting.invitee_name}?`)) return;
    try {
      await axios.delete(`/api/meetings/${meeting.id}`);
      fetchMeetings(tab);
    } catch {
      setError('Failed to cancel meeting');
    }
  }

  function openEditModal(meeting) {
    setEditingMeeting(meeting);
    const start = parseISO(meeting.start_time);
    setEditDate(format(start, 'yyyy-MM-dd'));
    setEditTime(format(start, 'HH:mm'));
    setEditNotes(meeting.notes || '');
  }

  function closeEditModal() {
    setEditingMeeting(null);
    setEditDate('');
    setEditTime('');
    setEditNotes('');
  }

  async function handleUpdateMeeting(e) {
    e.preventDefault();
    if (!editingMeeting) return;

    try {
      await axios.put(`/api/meetings/${editingMeeting.id}`, {
        date: editDate,
        time: editTime,
        notes: editNotes,
      });
      closeEditModal();
      fetchMeetings(tab);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update meeting');
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <p className="text-gray-500 mt-1">View and manage your scheduled meetings</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {['upcoming', 'past'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5 h-28 animate-pulse">
              <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full bg-gray-200 mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-2/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-16 card">
          <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No {tab} meetings
          </h3>
          <p className="text-gray-500">
            {tab === 'upcoming'
              ? 'Your upcoming scheduled meetings will appear here'
              : 'Your past meetings will appear here'}
          </p>
        </div>
      ) : (
         <div className="grid gap-4 md:grid-cols-2">
           {meetings.map((meeting) => (
             <MeetingCard
               key={meeting.id}
               meeting={meeting}
               onEdit={tab === 'upcoming' ? openEditModal : null}
               onCancel={tab === 'upcoming' ? handleCancel : null}
             />
           ))}
         </div>
       )}

      {editingMeeting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Edit meeting</h2>
              <p className="text-sm text-gray-500 mt-1">
                Update schedule for {editingMeeting.invitee_name}
              </p>
            </div>
            <form onSubmit={handleUpdateMeeting} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                <input
                  type="date"
                  className="input"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
                <input
                  type="time"
                  className="input"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-4 py-2 text-sm">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
     </div>
   );
}
