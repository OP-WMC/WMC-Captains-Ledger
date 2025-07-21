import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

// Hook for consuming auth
export const useAuth = () => useContext(AuthContext);

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error("Auth fetch error", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);

  const login = async (userData) => {
    setUser(userData);
  };

  const logout = async () => {
  try {
    await axios.post('/auth/logout');
  } catch (err) {
    console.error("Logout error", err);
  }
  setUser(null);
  window.location.href = '/login';
};

  const updateUserBalance = (newBalance) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
    }
  };

  const value = {
    user,
    isAdmin:
      user?.role === 'admin' ||
      (user?.tempAdmin && user?.adminStart && user?.adminEnd &&
        new Date() >= new Date(user.adminStart) &&
        new Date() <= new Date(user.adminEnd)),
    loading,
    login,
    logout,
    updateUserBalance
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
