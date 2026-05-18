import React, { FC, useState } from 'react';
import { JobCardProps } from './type';
import { Clock, CalenderBlank, MapPin } from '@/components/assets/icons';
import { tagIcons } from '@/components/modals/tagIcons';
import { useTranslation } from 'react-i18next';
import JobCompletionRequestModal from './JobCompletionRequestModal';
import { formatDateByLang, formatNumberByLang } from '@/utils/format';
const JobCard: FC<JobCardProps> = ({
  title,
  description,
  tags,
  date,
  time,
  tickets,
  status,
  timeSlot,
  experienceLevel,
  apartment,
  services,
  bids,
  jobId,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'en' | 'ar';
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  const resolveLocale = () => {
    const lang = i18n.language;
    if (!lang) return undefined;
    if (lang.startsWith('ar')) return 'ar-SA';
    return lang;
  };

  // Format date from ISO string
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(resolveLocale(), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-[#00A400]';
      case 'COMPLETED':
        return 'bg-[#00A400]';
      case 'CANCELLED':
        return 'bg-[#FF0000]';
      case 'OPEN':
        return 'bg-(--orange)';
      default:
        return 'bg-(--orange)';
    }
  };

  // Get status text
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return t('In Progress');
      case 'COMPLETED':
        return t('Completed');
      case 'CANCELLED':
        return t('Cancelled');
      case 'OPEN':
        return t('Open');
      default:
        return status || t('Active');
    }
  };

  // Get job type text
  const getJobTypeText = (jobType?: string) => {
    switch (jobType) {
      case 'HOME_SERVICE':
        return t('Home Service');
      case 'COMMUNITY_SERVICE':
        return t('Community Service');
      default:
        return jobType;
    }
  };

  // Count accepted bids
  const acceptedBidsCount =
    bids?.filter(bid => bid.status === 'ACCEPTED').length || 0;

  const currentBidStatus = bids && bids.length > 0 ? bids[0].status : null;

  return (
    <div className="bg-[#FFFFFF] shadow-dark rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 font-jakarta leading-[100%]">
      <div className="flex flex-col sm:flex-row lg:justify-between lg:items-start gap-2 sm:gap-0">
        <h3 className="text-lg sm:text-xl lg:typo-heading3 font-semibold text-(--primary-black) capitalize">
          {formatNumberByLang(title, currentLang)}
        </h3>

        {currentBidStatus === 'REJECTED' ? (
          <div className="flex items-center gap-2 text-(--danger) text-sm lg:typo-body font-normal">
            <span className="h-2.5 sm:h-3 lg:h-3 w-2.5 sm:w-3 lg:w-3 bg-(--danger) rounded-full font-normal"></span>
            {t('Bid Status')}: {t('Rejected')}
          </div>
        ) : (
          acceptedBidsCount > 0 && (
            <div className="flex items-center gap-2 text-(--danger) text-sm lg:typo-body font-normal">
              <span className="h-2.5 sm:h-3 lg:h-3 w-2.5 sm:w-3 lg:w-3 bg-(--danger) rounded-full font-normal"></span>
              {formatNumberByLang(acceptedBidsCount, currentLang)} {t('Bids')}
            </div>
          )
        )}
      </div>

      {description && (
        <p className="text-sm sm:text-base lg:typo-body font-medium text-(--primary-black) my-3 sm:my-4 lg:my-4">
          {formatNumberByLang(description, currentLang)}
        </p>
      )}

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-3 lg:gap-x-2">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-2">
          {/* Services */}
          {services &&
            services.map((service, index) => (
              <span
                key={index}
                className="flex items-center gap-1 sm:gap-[6px] lg:gap-[6px] p-2 sm:p-2.5 lg:p-[10px] bg-(--light-grey) text-[#15120F] text-xs sm:text-sm lg:typo-small rounded-lg font-medium"
              >
                {tagIcons[service.service] || tagIcons['Ac Service']}{' '}
                {service.service}
              </span>
            ))}

          {/* Date */}
          {date && (
            <span className="flex items-center gap-1 sm:gap-[6px] lg:gap-[6px] p-2 sm:p-2.5 lg:p-[10px] bg-(--light-grey) text-[#15120F] text-xs sm:text-sm lg:typo-small rounded-lg font-medium">
              <CalenderBlank size={16} /> {formatDateByLang(date, currentLang)}
            </span>
          )}

          {/* Time Slot */}
          {timeSlot && (
            <span className="flex items-center gap-1 sm:gap-[6px] lg:gap-[6px] p-2 sm:p-2.5 lg:p-[10px] bg-(--light-grey) text-[#15120F] text-xs sm:text-sm lg:typo-small rounded-lg">
              <Clock size={16} /> {timeSlot}
            </span>
          )}

          {/* Apartment Location */}
          {apartment && (
            <span className="flex items-center gap-1 sm:gap-[6px] lg:gap-[6px] p-2 sm:p-2.5 lg:p-[10px] bg-(--light-grey) text-[#15120F] text-xs sm:text-sm lg:typo-small rounded-lg font-medium">
              <MapPin size={16} className="h-4 w-4" /> {apartment.name},{' '}
              {apartment.city}
            </span>
          )}

          {/* Experience Level */}
          {experienceLevel && (
            <span className="flex items-center gap-1 sm:gap-[6px] lg:gap-[6px] p-2 sm:p-2.5 lg:p-[10px] bg-(--light-grey) text-[#15120F] text-xs sm:text-sm lg:typo-small rounded-lg font-medium">
              🎯 {experienceLevel}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {currentBidStatus !== 'REJECTED' && (
            <div className="flex items-center gap-1.5 px-3 h-8 sm:h-9 bg-gray-50 border border-gray-200 rounded-full select-none">
              <span
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${getStatusColor(status)}`}
              />

              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {t('Status')}:{' '}
                <span className={`font-semibold ${getStatusText(status)}`}>
                  {getStatusText(status)}
                </span>
              </span>
            </div>
          )}

          {status === 'IN_PROGRESS' && jobId && (
            <button
              type="button"
              onClick={() => setIsCompletionModalOpen(true)}
              className="
        h-8 sm:h-9 px-4 sm:px-5
        bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
        text-white text-xs sm:text-sm font-semibold
        rounded-lg shadow-sm hover:shadow
        cursor-pointer select-none
        transition-all duration-200 ease-in-out
        flex items-center justify-center gap-2
      "
            >
              {t('Submit Completion')}
            </button>
          )}
        </div>
      </div>

      {/* Job Completion Request Modal */}
      <JobCompletionRequestModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        jobId={jobId || ''}
        jobTitle={title}
      />
    </div>
  );
};
export default JobCard;
