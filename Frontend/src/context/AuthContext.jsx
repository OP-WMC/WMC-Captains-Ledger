// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/auth/me');
        setUser(res.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      await axios.post('/auth/login', credentials);
      const res = await axios.get('/auth/me');
      setUser(res.data);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    window.location.href = '/login';
  };

  const updateUserBalance = (newBalance) => {
    if (user) {
      setUser({ ...user, balance: newBalance });
    }
  };

  const isAdmin =
    user?.role === 'admin' ||
    (user?.tempAdmin &&
      user?.adminStart &&
      user?.adminEnd &&
      new Date() >= new Date(user.adminStart) &&
      new Date() <= new Date(user.adminEnd));

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, updateUserBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuth() {
  return useContext(AuthContext);
}

export { useAuth };
