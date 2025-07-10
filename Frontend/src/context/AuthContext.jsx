import { createContext, useContext, useState, useEffect } from 'react';

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
      const res = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include',
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
      }
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
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
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
    isAdmin: user?.role === 'admin',
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
