import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Users, TrendingUp, Zap } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEventTypes: 0,
    totalBookings: 0,
    upcomingMeetings: 0,
    totalMeetings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [eventTypesRes, bookingsRes, meetingsRes] = await Promise.all([
        axios.get('/api/event-types'),
        axios.get('/api/bookings'),
        axios.get('/api/meetings')
      ]);

      const now = new Date();
      const upcoming = meetingsRes.data.filter(meeting => new Date(meeting.start_time) > now);

      setStats({
        totalEventTypes: eventTypesRes.data.length,
        totalBookings: bookingsRes.data.length,
        upcomingMeetings: upcoming.length,
        totalMeetings: meetingsRes.data.length
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: 'Event Types',
      value: stats.totalEventTypes,
      icon: Zap,
      color: 'blue'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'Upcoming Meetings',
      value: stats.upcomingMeetings,
      icon: Clock,
      color: 'orange'
    },
    {
      title: 'Total Meetings',
      value: stats.totalMeetings,
      icon: Users,
      color: 'purple'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your scheduling activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon size={24} className={`text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/event-types"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Zap size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Create Event Type</p>
              <p className="text-sm text-gray-600">Set up new meeting types</p>
            </div>
          </a>

          <a
            href="/admin/availability"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Clock size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Set Availability</p>
              <p className="text-sm text-gray-600">Configure your schedule</p>
            </div>
          </a>

          <a
            href="/admin/meetings"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">View Meetings</p>
              <p className="text-sm text-gray-600">Manage your bookings</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}