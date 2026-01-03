import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState, LoginCredentials } from '@/lib/types';
import { authApi } from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'fraudshield_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const verifyStoredToken = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const result = await authApi.verifyToken(token);
      if (result.success && result.data) {
        setState({
          user: result.data,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
      localStorage.removeItem(TOKEN_KEY);
    }
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  useEffect(() => {
    verifyStoredToken();
  }, [verifyStoredToken]);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const result = await authApi.login(credentials);
    
    if (result.success && result.data) {
      localStorage.setItem(TOKEN_KEY, result.data.token);
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
    localStorage.removeItem(TOKEN_KEY);
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
