import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const AuthContext = createContext(null);

const API_BASE = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on mount
    const storedUser = localStorage.getItem('neuroscan_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('neuroscan_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('neuroscan_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.detail || data.error || 'Invalid credentials' };
    } catch {
      return { success: false, error: 'Network error — is the backend running?' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('neuroscan_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.detail || data.error || 'Failed to create account' };
    } catch {
      return { success: false, error: 'Network error — is the backend running?' };
    }
  };

  /**
   * googleLogin — receives the ID token credential string from Google Identity Services
   * after the user has completed the real Google sign-in popup.
   * Sends the token to FastAPI for verification. NEVER creates a session client-side.
   */
  const googleLogin = async (credential) => {
    if (!credential) {
      return { success: false, error: 'No Google credential received.' };
    }
    try {
      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('neuroscan_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.detail || data.error || 'Google authentication failed' };
    } catch {
      return { success: false, error: 'Network error — is the backend running?' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('neuroscan_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, googleLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
