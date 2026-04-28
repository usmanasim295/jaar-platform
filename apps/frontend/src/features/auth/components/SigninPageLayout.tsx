'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { RouteProtection } from '@/components/RouteProtection';
import LanguageToggleButton from '@/components/LanguageToggleButton';
import SigninForm from '@/components/forms/SigninForm';
import Image from 'next/image';
import AuthImage from './AuthImage';
import { useRTL } from '@/hooks/useRTL';

export default function SigninPageLayout() {
  const { t } = useTranslation();
  const { isRTL, isClient } = useRTL();

  return (
    <RouteProtection requireAuth={false}>
      <div
        className="min-h-screen flex items-center justify-center"
        dir={isClient ? (isRTL ? 'rtl' : 'ltr') : 'ltr'}
      >
        <title>{t('Sign In')}</title>

        <div className="w-full h-[-webkit-fill-available] flex">
          {/* LEFT SIDE */}
          <div
            className={`w-full lg:w-1/2 py-4 px-4 sm:py-6 sm:px-8 flex flex-col pt-[60px] sm:pt-[80px] lg:pt-[100px] ${
              isClient && isRTL ? 'lg:pr-12 lg:pl-2' : 'lg:pl-12 lg:pr-2'
            }`}
          >
            <div className="flex justify-end mb-4">
              <LanguageToggleButton />
            </div>

            <Image
              src="/assets/icons/SiteLogo.svg"
              width={80}
              height={80}
              alt="logo"
              className="mb-6 sm:mb-8 lg:mb-12 w-[60px] h-[64px] sm:w-[80px] sm:h-[85px] lg:w-[117px] lg:h-[124px]"
            />

            <div className="mb-6 sm:mb-8">
              <h1 className="font-bold text-2xl sm:text-3xl lg:typo-heading2 mb-2 sm:mb-3 font-anevir">
                {t('Sign In')}
              </h1>
              <p className="text-sm sm:text-base lg:typo-body text-(--grey-text) font-jakarta">
                {t('Please provide details to sign in')}
              </p>
            </div>

            <SigninForm />
          </div>

          {/* RIGHT SIDE */}
          <AuthImage isRTL={isRTL} />
        </div>
      </div>
    </RouteProtection>
  );
}
