'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { api, useAdminLoginMutation } from '@/store/api';
import type {
  AdminAuthState,
  AdminInfo,
  Language,
} from '@/types/api';
import i18n from '@/i18n';

interface AdminAuthContextType extends AdminAuthState {
  login: (email: string, password: string, lang?: Language) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  isLoggingIn: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

interface AdminAuthProviderProps {
  children: ReactNode;
}

const initialState: AdminAuthState = {
  isAuthenticated: false,
  admin: null,
  token: null,
  isLoading: true,
  error: null,
};

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [state, setState] = useState<AdminAuthState>(initialState);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [loginMutation] = useAdminLoginMutation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminInfo');

    if (token && adminData) {
      try {
        const admin: AdminInfo = JSON.parse(adminData);
        setState({
          isAuthenticated: true,
          admin,
          token,
          isLoading: false,
          error: null,
        });
        return;
      } catch (error) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
      }
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  const login = async (
    email: string,
    password: string,
    lang: Language = (i18n.language as Language) || 'en',
  ) => {
    setIsLoggingIn(true);
    setState(prev => ({ ...prev, error: null }));

    try {
      const response = await loginMutation({
        body: { email, password },
        lang,
      }).unwrap();

      const { access_token, admin } = response;

      localStorage.setItem('adminToken', access_token);
      localStorage.setItem('adminInfo', JSON.stringify(admin));

      setState({
        isAuthenticated: true,
        admin,
        token: access_token,
        isLoading: false,
        error: null,
      });

      dispatch(api.util.resetApiState());
      router.push('/admin/dashboard');
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || i18n.t('Login failed');
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
    }

    dispatch(api.util.resetApiState());
    setState({
      isAuthenticated: false,
      admin: null,
      token: null,
      isLoading: false,
      error: null,
    });

    router.push('/admin');
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value = useMemo<AdminAuthContextType>(
    () => ({
      ...state,
      login,
      logout,
      clearError,
      isLoggingIn,
    }),
    [state, isLoggingIn],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

