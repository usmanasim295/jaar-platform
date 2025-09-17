import React, { FC } from 'react';
import { JobCompletionRequest } from '@/types/api';
import { useTranslation } from 'react-i18next';
import { Clock, CalenderBlank, MapPin } from '@/components/assets/icons';

interface CompletionRequestCardProps {
  completionRequest: JobCompletionRequest;
}

const CompletionRequestCard: FC<CompletionRequestCardProps> = ({ completionRequest }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'en' | 'ar';
  
  // Get localized job data
  const job = completionRequest.job;
  const jobTitle = job.title[currentLang] || job.title.en;
  const jobDescription = job.description[currentLang] || job.description.en;
  const jobCharges = job.charges[currentLang] || job.charges.en;
  const jobWorkDuration = job.workDuration[currentLang] || job.workDuration.en;
  const jobTimeSlot = job.timeSlot[currentLang] || job.timeSlot.en;
  const jobLocation = job.location[currentLang] || job.location.en;
  const jobExperienceLevel = job.experienceLevel[currentLang] || job.experienceLevel.en;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status color and text
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "APPROVED":
        return "bg-green-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return t("Pending Review");
      case "APPROVED":
        return t("Approved");
      case "REJECTED":
        return t("Rejected");
      default:
        return status;
    }
  };

  return (
    <div className="bg-[#FFFFFF] shadow-dark rounded-2xl p-6 mb-6 font-jakarta leading-[100%]">
      <div className="flex justify-between items-start mb-4">
        <h3 className="typo-heading3 font-semibold text-(--primary-black)">
          {jobTitle}
        </h3>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-lg text-white ${getStatusColor(completionRequest.status)}`}
        >
          {getStatusText(completionRequest.status)}
        </span>
      </div>

      <p className="typo-body font-medium text-(--primary-black) mb-4">
        {jobDescription}
      </p>

      {/* Completion Notes */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">{t("Completion Notes")}:</h4>
        <p className="text-gray-700">{completionRequest.completionNotes}</p>
      </div>

      {/* Job Details */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Charges */}
        <span className="flex items-center gap-[6px] p-[10px] bg-(--light-grey) text-[#15120F] typo-small rounded-lg font-medium">
          💰 {jobCharges}
        </span>

        {/* Work Duration */}
        <span className="flex items-center gap-[6px] p-[10px] bg-(--light-grey) text-[#15120F] typo-small rounded-lg font-medium">
          ⏱️ {jobWorkDuration}
        </span>

        {/* Date */}
        <span className="flex items-center gap-[6px] p-[10px] bg-(--light-grey) text-[#15120F] typo-small rounded-lg font-medium">
          <CalenderBlank size={16} /> {formatDate(job.startDate)}
        </span>

        {/* Time Slot */}
        <span className="flex items-center gap-[6px] p-[10px] bg-(--light-grey) text-[#15120F] typo-small rounded-lg">
          <Clock size={16} /> {jobTimeSlot}
        </span>

        {/* Location */}
        <span className="flex items-center gap-[6px] p-[10px] bg-(--light-grey) text-[#15120F] typo-small rounded-lg font-medium">
          <MapPin size={16} /> {jobLocation}
        </span>

        {/* Experience Level */}
        <span className="flex items-center gap-[6px] p-[10px] bg-(--light-grey) text-[#15120F] typo-small rounded-lg font-medium">
          🎯 {jobExperienceLevel}
        </span>
      </div>

      {/* Completion Images */}
      {completionRequest.completionImages && completionRequest.completionImages.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{t("Completion Images")}:</h4>
          <div className="grid grid-cols-2 gap-2">
            {completionRequest.completionImages.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`Completion ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Additional Document */}
      {completionRequest.additionalDocumentUrl && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{t("Additional Document")}:</h4>
          <a
            href={completionRequest.additionalDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {t("View Document")}
          </a>
        </div>
      )}

      {/* Review Notes */}
      {completionRequest.reviewNotes && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">{t("Review Notes")}:</h4>
          <p className="text-gray-700">{completionRequest.reviewNotes}</p>
        </div>
      )}

      {/* Request Details */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{t("Submitted")}: {formatDate(completionRequest.createdAt)}</span>
        <span>{t("Job Type")}: {job.jobType === 'HOME_SERVICE' ? t('Home Service') : t('Community Service')}</span>
      </div>
    </div>
  );
};

export default CompletionRequestCard;
