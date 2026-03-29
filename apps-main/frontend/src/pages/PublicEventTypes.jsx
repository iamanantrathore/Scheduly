import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar, Zap } from 'lucide-react';

export default function PublicEventTypes() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Scheduly</h1>
          </div>
          <p className="text-lg text-gray-600">Book a meeting with us</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map((et) => (
            <div key={et.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div
                className="w-full h-1 rounded-full mb-4"
                style={{ backgroundColor: et.color || '#0069ff' }}
              />
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{et.name}</h3>
              {et.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{et.description}</p>
              )}
              <div className="flex items-center gap-1 mb-4 text-sm text-gray-600">
                <Clock size={14} />
                <span>{et.duration} minutes</span>
              </div>
              <a
                href={`/${et.slug}`}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                Book Now
              </a>
            </div>
          ))}
        </div>

        {eventTypes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No event types available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}