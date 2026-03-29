import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Lock } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (login(password)) {
      navigate('/admin');
    } else {
      setError('Invalid password');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Scheduly</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
          <p className="text-gray-600 mt-2">Enter your password to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter admin password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Demo password: <code className="bg-gray-100 px-1 py-0.5 rounded">admin123</code>
          </div>
        </form>
      </div>
    </div>
  );
}