import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState, LoginCredentials } from '@/lib/types';
import { authApi } from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'fraudshield_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const restoreAuthFromStorage = useCallback(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          user: User;
          token: string;
        };

        if (parsed.token && parsed.user) {
          setState({
            user: parsed.user,
            token: parsed.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } catch {
        // fall through to clearing auth state
      }
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  useEffect(() => {
    restoreAuthFromStorage();
  }, [restoreAuthFromStorage]);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const result = await authApi.login(credentials);
    
    if (result.success && result.data) {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          user: result.data.user,
          token: result.data.token,
        })
      );
      setState({
        user: result.data.user,
        token: result.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    }
    
    setState(prev => ({ ...prev, isLoading: false }));
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
