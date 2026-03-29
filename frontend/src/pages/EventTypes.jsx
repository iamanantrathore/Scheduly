import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Zap } from 'lucide-react';
import EventTypeCard from '../components/EventTypeCard';
import EventTypeModal from '../components/EventTypeModal';

export default function EventTypes() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  async function fetchEventTypes() {
    try {
      const res = await axios.get('/api/event-types');
      setEventTypes(res.data);
    } catch {
      setError('Failed to load event types');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEventTypes();
  }, []);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(et) {
    setEditing(et);
    setModalOpen(true);
  }

  async function handleSave(form) {
    if (editing) {
      await axios.put(`/api/event-types/${editing.id}`, form);
    } else {
      await axios.post('/api/event-types', form);
    }
    setModalOpen(false);
    fetchEventTypes();
  }

  async function handleDelete(et) {
    if (!window.confirm(`Delete "${et.name}"? This cannot be undone.`)) return;
    await axios.delete(`/api/event-types/${et.id}`);
    fetchEventTypes();
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="text-gray-500 mt-1">Create and manage your meeting types</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Event Type
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5 h-48 animate-pulse">
              <div className="h-1 bg-gray-200 rounded mb-4" />
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-full mb-1" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="text-center py-16 card">
          <Zap size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No event types yet</h3>
          <p className="text-gray-500 mb-6">Create your first event type to get started</p>
          <button onClick={openCreate} className="btn-primary">
            Create Event Type
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventTypes.map((et) => (
            <EventTypeCard
              key={et.id}
              eventType={et}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <EventTypeModal
          eventType={editing}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
