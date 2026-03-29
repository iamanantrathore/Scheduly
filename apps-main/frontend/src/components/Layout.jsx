import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, Users, Zap, LogOut, BarChart3, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Scheduly</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem to="/admin" icon={BarChart3} label="Dashboard" />
          <NavItem to="/admin/event-types" icon={Zap} label="Event Types" />
          <NavItem to="/admin/availability" icon={Clock} label="Availability" />
          <NavItem to="/admin/meetings" icon={CalendarDays} label="Meetings" />
          <NavItem to="/admin/email-templates" icon={Mail} label="Email Templates" />
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
              A
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@scheduly.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
