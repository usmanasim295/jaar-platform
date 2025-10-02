'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useSignInMutation, api } from '@/store/api';
import { useDispatch } from 'react-redux';
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
  const dispatch = useDispatch();
  const [signIn] = useSignInMutation();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);

          // Validate token is still valid by checking if user data matches
          // Clear cache before setting new auth state
          dispatch(api.util.resetApiState());

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
          dispatch(api.util.resetApiState());
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
  }, [dispatch]);

  const login = async (
    email: string,
    password: string,
    lang: Language = 'en'
  ) => {
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

      // Reset all RTK Query cache to fetch fresh data for new user
      dispatch(api.util.resetApiState());

      // Redirect to main page
      router.push('/');
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || 'Login failed';
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

    // Reset all RTK Query cache
    dispatch(api.util.resetApiState());

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
