'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlignBottom, Star } from '@/components/assets/icons';
import { formatNumberByLang } from '@/utils/format';
import i18n from '@/i18n';

interface ProfileCardProps {
  isProfileLoading: boolean;
  profileData: any;
  userName?: string;
  variant?: 'desktop' | 'mobile';
}

export default function ProfileCard({
  isProfileLoading,
  profileData,
  userName,
  variant = 'desktop',
}: ProfileCardProps) {
  const { t } = useTranslation();
  const isMobile = variant === 'mobile';
  const currentLang = i18n.language as 'en' | 'ar';
  return (
    <div
      className={`bg-(--white) ${isMobile ? 'p-4 sm:p-6' : 'p-6'} rounded-2xl shadow-dark`}
    >
      <div className={`flex items-center gap-3 ${isMobile ? 'pb-4' : 'pb-6'}`}>
        <div
          className={`${isMobile ? 'w-16 h-16' : 'w-[60px] h-[60px]'} rounded-full bg-gray-200 overflow-hidden flex-shrink-0`}
        >
          {isProfileLoading ? (
            <div className="w-full h-full bg-gray-200 animate-pulse" />
          ) : profileData?.profilePictureUrl ? (
            <img
              src={profileData?.profilePictureUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
              {userName?.charAt(0)?.toUpperCase() || t('U')}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`font-semibold ${isMobile ? 'text-base sm:text-lg' : 'typo-heading3'} text-(--primary) truncate`}
            title={profileData?.name || userName || t('User')}
          >
            {isProfileLoading ? (
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
            ) : (
              profileData?.name || userName || t('User')
            )}
          </div>
          {profileData?.bio && (
            <p
              className={`text-sm text-gray-600 mt-1 line-clamp-2 ${!isMobile && 'truncate'}`}
              title={profileData?.bio}
            >
              {profileData?.bio}
            </p>
          )}
        </div>
      </div>
      <hr className="border-(--light-grey) w-[100%]" />
      <div
        className={`flex items-center text-(--primary) gap-2 font-semibold ${isMobile ? 'text-sm mb-3 mt-4' : 'typo-label py-6'}`}
      >
        <AlignBottom className={isMobile ? 'w-4 h-4' : ''} />
        <h3>{t('Statistics')}</h3>
      </div>
      <div
        className={`flex gap-2 font-medium ${isMobile ? 'text-sm mb-3' : 'typo-small'} items-center`}
      >
        <Star className={isMobile ? 'w-4 h-4' : ''} />
        <div>
          {isProfileLoading ? (
            <div className="h-4 w-8 bg-gray-200 animate-pulse rounded" />
          ) : (
            formatNumberByLang(profileData?.rating, currentLang) || formatNumberByLang("0", currentLang)
          )}
        </div>
      </div>
      <div
        className={`${isMobile ? 'flex gap-4 sm:gap-8' : 'mt-4 typo-body text-gray-600 flex gap-8'}`}
      >
        <div>
          <h2
            className={`font-semibold ${isMobile ? 'text-base' : 'typo-label'} text-(--primary) pb-${isMobile ? '1' : '2'}`}
          >
            {isProfileLoading ? (
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded " />
            ) : (
              `﷼${formatNumberByLang(profileData?.totalEarnings , currentLang) || formatNumberByLang("0", currentLang)}`
            )}
          </h2>
          <p
            className={`mt-1 font-normal ${isMobile ? 'text-xs text-gray-600' : 'typo-small'}`}
          >
            {t('Total Earnings')}
          </p>
        </div>
        <div>
          <h2
            className={`font-semibold ${isMobile ? 'text-base' : 'typo-label'} text-(--primary) pb-${isMobile ? '1' : '2'}`}
          >
            {isProfileLoading ? (
              <div className="h-6 w-8 bg-gray-200 animate-pulse rounded" />
            ) : (
              formatNumberByLang(profileData?.totalJobs, currentLang) ||  formatNumberByLang("0", currentLang)
            )}
          </h2>
          <p
            className={`mt-1 font-normal ${isMobile ? 'text-xs text-gray-600' : 'typo-small'}`}
          >
            {t('Total Jobs')}
          </p>
        </div>
      </div>
    </div>
  );
}
