'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import AdminSigninForm from '@/components/forms/AdminSigninForm';
import LanguageToggleButton from '@/components/LanguageToggleButton';
import { AdminRouteProtection } from '@/components/admin/AdminRouteProtection';
import { useRTL } from '@/hooks/useRTL';
import AuthImage from '@/features/auth/components/AuthImage';

const AdminLoginPage = () => {
  const { t } = useTranslation();
  const { isClient, isRTL } = useRTL();

  return (
    <AdminRouteProtection requireAuth={false}>
      <div
        className="min-h-screen flex items-center justify-center"
        dir={isClient ? (isRTL ? 'rtl' : 'ltr') : 'ltr'}
      >
        <title>{t('Admin Sign In')}</title>
        <div className="w-full h-[-webkit-fill-available] flex">
          <div
            className={`w-full lg:w-1/2 py-4 px-4 sm:py-6 sm:px-8 flex flex-col pt-[60px] sm:pt-[80px] lg:pt-[100px] ${
              isClient && isRTL ? 'lg:pr-12 lg:pl-2' : 'lg:pl-12 lg:pr-2'
            }`}
          >
            <div className="flex justify-end mb-6">
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
                {t('Welcome, Admin')}
              </h1>
              <p className="text-sm sm:text-base lg:typo-body text-(--grey-text) font-jakarta">
                {t('Please provide details to sign in')}
              </p>
            </div>

            <AdminSigninForm />
          </div>

          <AuthImage isRTL={isRTL} />
        </div>
      </div>
    </AdminRouteProtection>
  );
};

export default AdminLoginPage;
