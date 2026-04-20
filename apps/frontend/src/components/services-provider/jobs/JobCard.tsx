'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import { MapPin, Star } from '@/components/assets/icons';
import { tagIcons } from '@/components/modals/tagIcons';
import { Job } from '@/components/modals/type';

interface JobCardProps {
  job: Job & { jobType?: 'COMMUNITY_SERVICE' | 'HOME_SERVICE' | 'RFQ' };
  hasBidded: boolean;
  userBidStatus: { status: 'PENDING' | 'ACCEPTED' | 'REJECTED' } | null;
  onView: (job: Job) => void;
}

const jobTypeConfig: Record<
  'COMMUNITY_SERVICE' | 'HOME_SERVICE' | 'RFQ',
  { label: string; icon: string; className: string }
> = {
  COMMUNITY_SERVICE: {
    label: 'Community Service',
    icon: '🏘️',
    className: 'bg-blue-100 text-blue-800',
  },
  HOME_SERVICE: {
    label: 'Home Service',
    icon: '🏠',
    className: 'bg-green-100 text-green-800',
  },
  RFQ: {
    label: 'RFQ',
    icon: '📋',
    className: 'bg-purple-100 text-purple-800',
  },
};

export default function JobCard({
  job,
  hasBidded,
  userBidStatus,
  onView,
}: JobCardProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-dark bg-[#ffffff]">
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-base sm:typo-heading3 font-semibold text-(--primary-black) flex-1 capitalize">
          {job.title}
        </h3>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs sm:typo-small font-medium text-(--grey-text) whitespace-nowrap">
            {t('Posted')} {job.posted}
          </span>
          {hasBidded && userBidStatus && (
            <span className="text-xs sm:typo-small font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded whitespace-nowrap">
              {t('Already Bidded')} - {t(userBidStatus.status)}
            </span>
          )}
        </div>
      </div>
      <p className="leading-[22px] text-xs sm:text-sm font-medium text-(--primary-black) mt-3 sm:mt-4">
        {job.desc}
      </p>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
        {job.timeSlot && (
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{job.timeSlot}</span>
          </span>
        )}
        {job.experienceLevel && (
          <span className="flex items-center gap-2">
            <span className="font-medium">🎯 {job.experienceLevel}</span>
          </span>
        )}
        {job.jobType && jobTypeConfig[job.jobType] && (
          <span
            className={`px-2 py-1 rounded text-xs inline-flex items-center gap-1 ${jobTypeConfig[job.jobType].className}`}
          >
            <span>{jobTypeConfig[job.jobType].icon}</span>
            <span>{t(jobTypeConfig[job.jobType].label)}</span>
          </span>
        )}
        {job.status && (
          <span
            className={`px-2 py-1 rounded text-xs ${
              job.status === 'OPEN'
                ? 'bg-green-100 text-green-800'
                : job.status === 'IN_PROGRESS'
                  ? 'bg-orange-100 text-orange-800'
                  : job.status === 'COMPLETED'
                    ? 'bg-gray-100 text-gray-800'
                    : job.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
            }`}
          >
            {t(job.status.replace(/_/g, ' '))}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
        {job.tags.map((tag, i) => (
          <div
            key={i}
            className="text-xs sm:typo-small font-medium p-2 sm:p-[10px] bg-(--light-grey) rounded-lg text-[#15120F] flex items-center gap-1.5 sm:gap-2"
          >
            <span className="w-3 h-3 sm:w-4 sm:h-4">{tagIcons[tag]}</span>
            <span>{tag}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center gap-2 mt-3 sm:mt-4">
        {job.apartment && (
          <div className="flex items-center font-medium gap-1 sm:gap-[6px] text-xs leading-[100%] text-[var(--grey-text)] max-w-[70%]">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span
              className="truncate whitespace-nowrap overflow-hidden text-ellipsis block"
              title={`${job.apartment.name}, ${job.apartment.city}`}
            >
              {job.apartment.name}, {job.apartment.city}
            </span>
          </div>
        )}
        <Button
          onClick={() => onView(job)}
          className="!h-[32px] sm:!h-[35px] !w-[48px] sm:!w-[52px] !p-2 sm:!p-[10px] !text-xs !rounded-lg !font-medium"
        >
          {t('View')}
        </Button>
      </div>
    </div>
  );
}
