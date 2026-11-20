import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [loading, setLoading] = useState(true);

  // Verify and refresh user info on initial load if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
        } catch (err) {
          console.error("Session verification failed, logging out:", err);
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    return await authService.register(formData);
  };

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const refreshUser = async () => {
    try {
      const updated = await authService.getCurrentUser();
      setUser(updated);
      return updated;
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: !!(user && (user.is_staff || user.is_superuser)),
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
