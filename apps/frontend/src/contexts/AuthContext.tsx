"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSignInMutation, useGetProfileQuery } from '@/store/api';
import type { AuthState, ServiceProvider, Language } from '@/types/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, lang: Language) => Promise<void>;
  logout: () => void;
  updateUser: (user: ServiceProvider) => void;
  clearError: () => void;
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const router = useRouter();
  const [signIn] = useSignInMutation();
  const { data: profileData, error: profileError } = useGetProfileQuery(
    authState.isAuthenticated && authState.user ? 
      { serviceProviderId: authState.user.id, lang: 'en' as Language } : 
      { serviceProviderId: '', lang: 'en' as Language },
    { skip: !authState.isAuthenticated || !authState.user }
  );

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setAuthState({
            isAuthenticated: true,
            user,
            token,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Invalid data in localStorage, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Update user data when profile is fetched
  useEffect(() => {
    if (profileData && authState.isAuthenticated) {
      setAuthState(prev => ({
        ...prev,
        user: profileData,
      }));
    }
  }, [profileData, authState.isAuthenticated]);

  const login = async (email: string, password: string, lang: Language = 'en') => {
    setIsLoggingIn(true);
    setAuthState(prev => ({ ...prev, error: null }));

    try {
      const response = await signIn({
        body: { email, password },
        lang,
      }).unwrap();

      const { access_token, serviceProvider } = response;

      // Store in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(serviceProvider));

      setAuthState({
        isAuthenticated: true,
        user: serviceProvider,
        token: access_token,
        isLoading: false,
        error: null,
      });

      // Redirect to main page
      router.push('/');
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Login failed';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('serviceProviderId');
    localStorage.removeItem('name');
    localStorage.removeItem('selectedServices');
    localStorage.removeItem('selectedServicesName');

    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });

    // Redirect to login page
    router.push('/signin');
  };

  const updateUser = (user: ServiceProvider) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
    localStorage.setItem('user', JSON.stringify(user));
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    updateUser,
    clearError,
    isLoggingIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
