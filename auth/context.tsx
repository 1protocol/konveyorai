
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: { username: string } | null;
  loading: boolean;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent hydration errors by running this effect only on the client
    try {
      const storedUser = localStorage.getItem('konveyor-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('konveyor-user');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (username: string, pass: string) => {
    // Demo credentials
    if (username === 'admin' && pass === 'gemini123') {
      const userData = { username: 'admin' };
      localStorage.setItem('konveyor-user', JSON.stringify(userData));
      setUser(userData);
      return Promise.resolve();
    } else {
      return Promise.reject(new Error('Kullanıcı adı veya şifre hatalı.'));
    }
  };

  const logout = () => {
    localStorage.removeItem('konveyor-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
