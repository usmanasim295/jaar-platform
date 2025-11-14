'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import i18n from '@/i18n';

type AdminSigninFormData = {
  email: string;
  password: string;
};

export default function AdminSigninForm() {
  const { t } = useTranslation();
  const { login, clearError, error, isLoggingIn } = useAdminAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminSigninFormData>();
  const [customError, setCustomError] = useState<string | null>(null);

  const onSubmit = async (data: AdminSigninFormData) => {
    setCustomError(null);
    clearError();

    try {
      await login(data.email, data.password, i18n.language as 'en' | 'ar');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('Invalid credentials');
      setCustomError(message);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full font-jakarta max-w-[424px]"
    >
      <InputField
        name="email"
        control={control}
        type="email"
        placeholder={t('Email')}
        inputClassName="h-[60px]"
        placeholderAnimate
        rules={{
          required: t('Email is required'),
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: t('Enter a valid email address'),
          },
        }}
        error={errors.email?.message}
      />

      <InputField
        name="password"
        control={control}
        type="password"
        placeholder={t('Password')}
        inputClassName="h-[60px]"
        placeholderAnimate
        rules={{
          required: t('Password is required'),
          minLength: {
            value: 6,
            message: t('Password must be at least 6 characters'),
          },
        }}
        error={errors.password?.message}
      />

      {(customError || errors.root?.message) && (
        <p className="text-red-500 text-sm">
          {customError || errors.root?.message}
        </p>
      )}
      {error && !customError && <p className="text-red-500 text-sm">{error}</p>}

      <Button
        type="submit"
        variant="primary"
        disabled={isLoggingIn}
        className="w-full mt-6 font-anevir disabled:opacity-50"
      >
        {isLoggingIn ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
            {t('Signing In...')}
          </div>
        ) : (
          t('Sign In')
        )}
      </Button>
    </form>
  );
}
