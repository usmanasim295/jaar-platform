import React, { FC, useState } from 'react';
import { JobCardProps } from './type';
import { Clock, CalenderBlank, MapPin } from '@/components/assets/icons';
import { tagIcons } from '@/components/modals/tagIcons';
import { useTranslation } from 'react-i18next';
import JobCompletionRequestModal from './JobCompletionRequestModal';
const JobCard: FC<JobCardProps> = ({
  title,
  description,
  tags,
  date,
  time,
  location,
  tickets,
  status,
  charges,
  workDuration,
  timeSlot,
  experienceLevel,
  apartment,
  services,
  bids,
  jobId,
}) => {
  const { t } = useTranslation();
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  // Format date from ISO string
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
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

  return (
    <div className="bg-[#FFFFFF] shadow-dark rounded-2xl p-6 mb-6 font-jakarta leading-[100%]">
      <div className="flex justify-between items-start">
        <h3 className="typo-heading3 font-semibold text-(--primary-black) ">
          {title}
        </h3>
        {acceptedBidsCount > 0 && (
          <div className="flex items-center gap-2 text-(--danger) typo-body font-normal">
            <span className="h-3 w-3 bg-(--danger) rounded-full font-normal typo-body"></span>
            {acceptedBidsCount} {t('Bids')}
          </div>
        )}
      </div>

      {description && (
        <p className="typo-body font-medium text-(--primary-black) my-4">
          {description}
        </p>
      )}

      <div className="flex justify-between items-end gap-x-2">
        <div className="flex flex-wrap gap-2 ">
          {/* Services */}
          {services &&
            services.map((service, index) => (
              <span
                key={index}
                className="flex items-center gap-[6px] p-[10px] bg-(--light-grey) text-[#15120F] typo-small rounded-lg font-medium"
              >
                {tagIcons[service.service] || tagIcons['Ac Service']}{' '}
                {service.service}
              </span>
            ))}

          {/* Charges */}
          {charges && (
            <span className="flex items-center gap-[6px] p-[10px] bg-(--light-grey) text-[#15120F] typo-small rounded-lg font-medium">
              💰 {charges}
            </span>
          )}

          {/* Work Duration */}
          {workDuration && (
            <span className="flex items-center gap-[6px] p-[10px] bg-(--light-grey) text-[#15120F] typo-small rounded-lg font-medium">
              ⏱️ {workDuration}
            </span>
          )}

          {/* Date */}
          {date && (
            <span className="flex items-center gap-[6px] p-[10px] bg-(--light-grey) text-[#15120F] typo-small rounded-lg font-medium">
              <CalenderBlank size={16} /> {formatDate(date)}
            </span>
          )}

          {/* Time Slot */}
          {timeSlot && (
            <span className="flex items-center gap-[6px] p-[10px] bg-(--light-grey) text-[#15120F] typo-small rounded-lg">
              <Clock size={16} /> {timeSlot}
            </span>
          )}

          {/* Location */}
          <span className="flex items-center gap-[6px] p-[10px] bg-(--light-grey) text-[#15120F] typo-small rounded-lg font-medium">
            <MapPin size={16} />{' '}
            {apartment?.name
              ? `${apartment.name}, ${apartment.city}`
              : location}
          </span>

          {/* Experience Level */}
          {experienceLevel && (
            <span className="flex items-center gap-[6px] p-[10px] bg-(--light-grey) text-[#15120F] typo-small rounded-lg font-medium">
              🎯 {experienceLevel}
            </span>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <span
            className={` min-w-[127px] flex flex-col items-center justify-center h-9 typo-small font-medium rounded-lg text-(--white) ${getStatusColor(status)}`}
          >
            {t('Status')}: {getStatusText(status)}
          </span>

          {/* Completion Request Button - Only show for IN_PROGRESS jobs */}
          {status === 'IN_PROGRESS' && jobId && (
            <button
              onClick={() => setIsCompletionModalOpen(true)}
              className=" h-9 min-w-[165px] bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
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
