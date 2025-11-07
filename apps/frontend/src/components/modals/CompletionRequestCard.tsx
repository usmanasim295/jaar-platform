import React, { FC } from 'react';
import { JobCompletionRequest } from '@/types/api';
import { useTranslation } from 'react-i18next';
import { Clock, CalenderBlank, MapPin } from '@/components/assets/icons';

interface CompletionRequestCardProps {
  completionRequest: JobCompletionRequest;
}

const CompletionRequestCard: FC<CompletionRequestCardProps> = ({
  completionRequest,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'en' | 'ar';

  // Get localized job data
  const job = completionRequest.job;
  const jobTitle = job.title[currentLang] || job.title.en;
  const jobDescription = job.description[currentLang] || job.description.en;
  const jobTimeSlot = job.timeSlot[currentLang] || job.timeSlot.en;
  const jobExperienceLevel = job.experienceLevel
    ? job.experienceLevel[currentLang] || job.experienceLevel.en
    : null;
  const apartmentName = job.apartment?.name
    ? job.apartment.name[currentLang] || job.apartment.name.en
    : null;
  const apartmentCity = job.apartment?.city
    ? job.apartment.city[currentLang] || job.apartment.city.en
    : null;

  // Format date
  const resolveLocale = () => {
    const lang = i18n.language;
    if (!lang) return undefined;
    if (lang.startsWith('ar')) return 'ar-SA';
    return lang;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(resolveLocale(), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get status color and text
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'APPROVED':
        return 'bg-green-500';
      case 'REJECTED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t('Pending Review');
      case 'APPROVED':
        return t('Approved');
      case 'REJECTED':
        return t('Rejected');
      default:
        return status;
    }
  };

  return (
    <div className="bg-[#FFFFFF] shadow-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 font-jakarta leading-[100%]">
      <div className="flex justify-between items-start gap-3 sm:gap-0 mb-3">
        <h3 className="text-lg sm:text-xl lg:typo-heading3 font-semibold text-(--primary-black) leading-tight">
          {jobTitle}
        </h3>
        <span
          className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-lg text-white self-start sm:self-auto ${getStatusColor(completionRequest.status)}`}
        >
          {getStatusText(completionRequest.status)}
        </span>
      </div>

      <p className="text-sm sm:text-base lg:typo-body font-medium text-(--primary-black) mb-4 leading-relaxed">
        {jobDescription}
      </p>

      {/* Completion Notes */}
      <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-2">
          {t('Completion Notes')}:
        </h4>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          {completionRequest.completionNotes}
        </p>
      </div>

      {/* Job Details */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
        {/* Date */}
        <span className="flex items-center gap-1 sm:gap-[6px] p-2 sm:p-[10px] bg-(--light-grey) text-[#15120F] text-xs sm:typo-small rounded-lg font-medium">
          <CalenderBlank size={14} className="sm:w-4 sm:h-4" />{' '}
          {formatDate(job.startDate)}
        </span>

        {/* Time Slot */}
        <span className="flex items-center gap-1 sm:gap-[6px] p-2 sm:p-[10px] bg-(--light-grey) text-[#15120F] text-xs sm:typo-small rounded-lg">
          <Clock size={14} className="sm:w-4 sm:h-4" /> {jobTimeSlot}
        </span>

        {/* Apartment Location */}
        {apartmentName && apartmentCity && (
          <span className="flex items-center gap-1 sm:gap-[6px] p-2 sm:p-[10px] bg-(--light-grey) text-[#15120F] text-xs sm:typo-small rounded-lg font-medium">
            <MapPin size={14} className="sm:w-4 sm:h-4" /> {apartmentName},{' '}
            {apartmentCity}
          </span>
        )}

        {/* Experience Level */}
        {jobExperienceLevel && (
          <span className="flex items-center gap-1 sm:gap-[6px] p-2 sm:p-[10px] bg-(--light-grey) text-[#15120F] text-xs sm:typo-small rounded-lg font-medium">
            🎯 {jobExperienceLevel}
          </span>
        )}
      </div>

      {/* Completion Images */}
      {completionRequest.completionImages &&
        completionRequest.completionImages.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-2">
              {t('Completion Images')}:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {completionRequest.completionImages.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Completion ${index + 1}`}
                  className="w-full h-20 sm:h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

      {/* Additional Document */}
      {completionRequest.additionalDocumentUrl && (
        <div className="mb-4">
          <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-2">
            {t('Additional Document')}:
          </h4>
          <a
            href={completionRequest.additionalDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm sm:text-base"
          >
            {t('View Document')}
          </a>
        </div>
      )}

      {/* Review Notes */}
      {completionRequest.reviewNotes && (
        <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-2">
            {t('Review Notes')}:
          </h4>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            {completionRequest.reviewNotes}
          </p>
        </div>
      )}

      {/* Request Details */}
      <div className="flex justify-between items-center gap-2 sm:gap-0 text-xs sm:text-sm text-gray-500">
        <span>
          {t('Submitted')}: {formatDate(completionRequest.createdAt)}
        </span>
        <span>
          {t('Job Type')}:{' '}
          {job.jobType === 'HOME_SERVICE'
            ? t('Home Service')
            : t('Community Service')}
        </span>
      </div>
    </div>
  );
};

export default CompletionRequestCard;
