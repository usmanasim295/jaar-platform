'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { serviceIconMap, defaultServiceIcon } from '@/constants/serviceIcons';
import type {
  ServiceProviderService,
  ServiceProviderRate,
} from '@/types/api';

interface ServicesCardProps {
  isProfileLoading: boolean;
  profileData: any;
  variant?: 'desktop' | 'mobile';
}

export default function ServicesCard({
  isProfileLoading,
  profileData,
  variant = 'desktop',
}: ServicesCardProps) {
  const { t } = useTranslation();
  const isMobile = variant === 'mobile';

  return (
    <div
      className={`bg-(--white) ${isMobile ? 'p-4 sm:p-6 mb-4' : 'p-6 my-6'} rounded-${isMobile ? 'xl' : 'lg'} shadow-dark`}
    >
      <h4
        className={`font-semibold ${isMobile ? 'text-base sm:text-lg mb-3' : 'typo-heading3 mb-[18px]'} text-(--primary-black)`}
      >
        {t('Services Provided By You')}
      </h4>
      <div className="space-y-2">
        {isProfileLoading ? (
          Array(2)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className={`flex items-center ${isMobile ? 'p-3' : 'p-4'} border border-(--light-grey) rounded-lg ${isMobile ? 'gap-3' : 'gap-4'}`}
              >
                <div
                  className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gray-200 animate-pulse rounded flex-shrink-0`}
                />
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1" />
                  <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ))
        ) : profileData?.services && profileData.services.length > 0 ? (
          profileData.services.map(
            (service: ServiceProviderService, i: number) => {
              const serviceName = service.service?.name || t('Service');
              const IconComponent =
                serviceIconMap[serviceName] || defaultServiceIcon;
              const rate = profileData.serviceRates?.find(
                (r: ServiceProviderRate) => r.serviceId === service.serviceId
              );

              return (
                <div
                  key={i}
                  className={`flex items-center ${isMobile ? 'p-3 text-sm gap-3' : 'p-4 typo-body gap-4'} border border-(--light-grey) rounded-lg text-(--primary-black)`}
                >
                  <div
                    className={`flex-shrink-0 flex items-center justify-center ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`}
                  >
                    <IconComponent
                      className={`text-gray-600 ${isMobile ? 'w-8 h-8' : ''}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{serviceName}</p>
                    {rate && (
                      <p
                        className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}
                      >
                        ﷼{rate.rate}/{t('hour')}
                      </p>
                    )}
                  </div>
                </div>
              );
            }
          )
        ) : (
          <div className="text-center text-gray-500 py-4">
            <p className={isMobile ? 'text-sm' : ''}>
              {t('No services added yet')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
