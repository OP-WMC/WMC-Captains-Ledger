import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock users for demonstration
  const mockUsers = [
    {
      id: 1,
      name: 'Sam Wilson',
      email: 'captain@avengers.com',
      role: 'admin',
      avatar: '🦅',
      codename: 'Captain America',
      balance: 50000
    },
    {
      id: 2,
      name: 'Bucky Barnes',
      email: 'bucky@avengers.com',
      role: 'user',
      avatar: '🤖',
      codename: 'Winter Soldier',
      balance: 35000
    },
    {
      id: 3,
      name: 'Sharon Carter',
      email: 'sharon@avengers.com',
      role: 'user',
      avatar: '🕊️',
      codename: 'Agent 13',
      balance: 42000
    },
    {
      id: 4,
      name: 'John Walker',
      email: 'walker@avengers.com',
      role: 'user',
      avatar: '⚡',
      codename: 'US Agent',
      balance: 28000
    }
  ];

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('captains-ledger-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login - in real app, this would be an API call
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('captains-ledger-user', JSON.stringify(foundUser));
      return { success: true, user: foundUser };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const register = (name, email, password, codename) => {
    // Mock registration
    const newUser = {
      id: mockUsers.length + 1,
      name,
      email,
      role: 'user',
      avatar: '🦸',
      codename,
      balance: 10000
    };
    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('captains-ledger-user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('captains-ledger-user');
  };

  const updateUserBalance = (newBalance) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('captains-ledger-user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUserBalance,
    loading,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 