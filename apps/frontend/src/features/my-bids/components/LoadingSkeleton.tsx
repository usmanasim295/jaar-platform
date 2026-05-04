import { RouteProtection } from '@/components/RouteProtection';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const LoadingSkeleton = () => {
  const { t } = useTranslation();

  return (
    <RouteProtection>
      <div className="flex justify-center px-4 sm:px-6 md:px-8 lg:px-10 pt-4 sm:pt-6 md:pt-8 gap-4 md:gap-6 font-jakarta mb-12 sm:mb-16 md:mb-24">
        <div className="w-full max-w-[1300px]">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">
            {t('My Bids')}
          </h1>
          <div className="space-y-4 sm:space-y-6">
            {Array(3)
              .fill(0)
              .map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-dark p-4 sm:p-5 md:p-6 animate-pulse"
                >
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="h-5 sm:h-6 w-32 sm:w-48 bg-gray-200 rounded"></div>
                    <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-3 sm:h-4 w-full bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded mb-3 sm:mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 rounded"></div>
                    <div className="h-7 sm:h-8 w-20 sm:w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </RouteProtection>
  );
};
