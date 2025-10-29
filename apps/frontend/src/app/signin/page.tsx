'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import SigninForm from '@/components/forms/SigninForm';
import { useTranslation } from 'react-i18next';
import { RouteProtection } from '@/components/RouteProtection';
import LanguageToggleButton from '@/components/LanguageToggleButton';
import i18n from '@/i18n';

const page = () => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsRTL(i18n.language === 'ar');
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      setIsRTL(i18n.language === 'ar');
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, []);

  return (
    <RouteProtection requireAuth={false}>
      <div
        className="min-h-screen flex items-center justify-center"
        dir={isClient ? (isRTL ? 'rtl' : 'ltr') : 'ltr'}
      >
        <title>{t('Sign In')}</title>
        <div className="w-full h-[-webkit-fill-available] flex">
          {/* Form */}
          <div
            className={`w-full lg:w-1/2 py-4 px-4 sm:py-6 sm:px-8 flex flex-col pt-[60px] sm:pt-[80px] lg:pt-[100px] ${
              isClient && isRTL ? 'lg:pr-12 lg:pl-2' : 'lg:pl-12 lg:pr-2'
            }`}
          >
            {/* Language Toggle */}
            <div className="flex justify-end mb-4">
              <LanguageToggleButton />
            </div>

            <Image
              src="/assets/icons/SiteLogo.svg"
              width={80}
              height={85}
              alt="JAR logo"
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

          {/* Image - Hidden on mobile and tablet */}
          <div
            className="hidden lg:block sticky top-0 w-1/2 h-[100vh]"
          >
            <div className="relative w-full h-full">
              {isRTL ? (
                <Image
                  src="/assets/rtlAuthImage.svg"
                  alt="image"
                  fill
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/assets/ltrAuthImage.svg"
                  alt="image"
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </RouteProtection>
  );
};

export default page;
