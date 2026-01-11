// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig'; // <--- 1. IMPORT THIS

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // 2. Use API_BASE_URL and add credentials: 'include'
        const res = await fetch(`${API_BASE_URL}/auth/check.php`, {
            method: "GET",
            credentials: 'include'  // <--- CRITICAL: Sends the cookie!
        });
        const data = await res.json();
        
        if (data.success) {
          handleSignIn(data.data);
        }
      } catch (error) {
        console.error("Session check failed", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserSession();
  }, []);

  const handleSignIn = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, handleSignIn, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};