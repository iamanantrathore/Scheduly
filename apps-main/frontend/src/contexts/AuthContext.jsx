import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (simple check for demo)
    const loggedIn = localStorage.getItem('scheduly_auth') === 'true';
    setIsAuthenticated(loggedIn);
    setLoading(false);
  }, []);

  const login = (password) => {
    // Simple password check for demo
    if (password === 'admin123') {
      localStorage.setItem('scheduly_auth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('scheduly_auth');
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}