import { RouteProtection } from '@/components/RouteProtection';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const FallbackError = () => {
  const { t } = useTranslation();

  return (
    <RouteProtection>
      <div className="flex justify-center px-4 sm:px-6 md:px-8 lg:px-10 pt-4 sm:pt-6 md:pt-8 gap-4 md:gap-6 font-jakarta mb-12 sm:mb-16 md:mb-24">
        <div className="w-full max-w-[1300px] text-center py-8 sm:py-12 px-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-red-600 mb-3 sm:mb-4">
            {t('Error')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {t('Failed to load your bids. Please try again.')}
          </p>
        </div>
      </div>
    </RouteProtection>
  );
};
