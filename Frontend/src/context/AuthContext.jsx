// import { createContext, useContext, useState, useEffect } from "react";
// import axios from "../api/axios"; // make sure axios.js has withCredentials: true set



// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Fetch logged-in user
//   useEffect(() => {
//     const fetchUser = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get("/auth/me");
//         setUser(res.data);
//       } catch (error) {
//         if (error.response?.status === 401) {
//           // No logged-in user
//           setUser(null);
//         } else {
//           console.error("Error fetching user:", error);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, []);

//   // Login user
//   const login = async (credentials) => {
//     try {
//       setLoading(true);
//       await axios.post("/auth/login", credentials);
//       const res = await axios.get("/auth/me");
//       setUser(res.data);
//     } catch (error) {
//       console.error("Login error:", error);
//       throw error; // let UI handle errors
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Logout user
//   const logout = async () => {
//     try {
//       await axios.post("/auth/logout");
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//     setUser(null);
//     window.location.href = "/login";
//   };

//   // Update user balance locally
//   const updateUserBalance = (newBalance) => {
//     if (user) {
//       setUser({ ...user, balance: newBalance });
//     }
//   };

//   // Admin check
//   const isAdmin =
//     user?.role === "admin" ||
//     (user?.tempAdmin &&
//       user?.adminStart &&
//       user?.adminEnd &&
//       new Date() >= new Date(user.adminStart) &&
//       new Date() <= new Date(user.adminEnd));

//   return (
//     <AuthContext.Provider
//       value={{ user, setUser, loading, login, logout, isAdmin, updateUserBalance }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export function useAuth() {
//   return useContext(AuthContext);
// }
// const AuthContext = createContext();

import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();



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
    setUser,
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
// Hook for consuming auth
export const useAuth = () => useContext(AuthContext);