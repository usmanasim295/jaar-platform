'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import i18n from '@/i18n';
import Link from 'next/link';

type SigninFormData = {
  email: string;
  password: string;
};

export default function SigninForm() {
  const { t } = useTranslation();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SigninFormData>();
  const [customError, setCustomError] = useState('');
  const router = useRouter();
  const { login, isAuthenticated, isLoggingIn, error } = useAuth();

  const onSubmit = async (data: SigninFormData) => {
    setCustomError('');

    try {
      await login(data.email, data.password, i18n.language as 'en' | 'ar');
    } catch (err: any) {
      console.error('Sign In Error:', err);
      setCustomError(err?.message || t('Invalid credentials'));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  return (
    <div>
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
            minLength: {
              value: 5,
              message: t('Email must be at least 5 characters'),
            },
            maxLength: {
              value: 50,
              message: t('Email must not exceed 50 characters'),
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
          rules={{ required: t('Password is required') }}
          error={errors.password?.message}
        />
        {(customError || error) && (
          <p className="text-red-500 text-sm">{customError || error}</p>
        )}

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

        <div className=" text-center">
          <p className="text-sm text-gray-600 font-jakarta">
            {t("Don't have an account?")}{' '}
            <Link href="/signup" className="text-[#2d6a87] font-medium">
              {t('Sign up first')}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
