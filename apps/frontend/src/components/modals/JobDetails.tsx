'use client';

import React, { useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import {
  MapPin,
  CalenderBlank,
  Clock,
  Star,
  Currency,
} from '@/components/assets/icons';
import { JobDetailModalProps } from './type';
import Link from 'next/link';
import { tagIcons } from './tagIcons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
const JobDetails = ({ selectedJob, onClose, isOpen }: JobDetailModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Check if current service provider has already bid on this job
  const hasUserBidded =
    selectedJob?.bids?.some((bid: any) => bid.serviceProviderId === user?.id) ||
    false;
  const userBidStatus = selectedJob?.bids?.find(
    (bid: any) => bid.serviceProviderId === user?.id
  );

  // Scroll to top when modal opens or job changes
  useEffect(() => {
    if (isOpen && modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [isOpen, selectedJob?.id]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black z-100 transition-opacity duration-300  ${
          isOpen
            ? 'opacity-40 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        ref={modalContentRef}
        className={`fixed top-0 right-0 h-full w-full max-w-full md:max-w-[648px] bg-(--white) shadow-xl z-100 scroll-hide 
    transition-transform  duration-500 ease-in-out md:rounded-l-3xl overflow-y-auto px-4 sm:px-6 md:pl-6 md:pr-10 py-6 sm:py-8 md:py-13
    ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      >
        <div className="border p-4 sm:p-6 rounded-xl border-(--light-grey)">
          <h2 className="typo-heading3 font-semibold text-(--primary-black)">
            {t('Job Information')}
          </h2>

          <div className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-base sm:text-lg font-semibold text-gray-600">
                    {selectedJob?.apartment?.name?.charAt(0) || 'J'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold typo-heading3 text-(--primary) text-[15px] truncate">
                    {selectedJob?.apartment?.name || t('Job')}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {selectedJob?.apartment?.city}
                  </p>
                </div>
              </div>
              {hasUserBidded ? (
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium">
                    {t('Already Bidded')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {t('Bid Status')}: {t(userBidStatus?.status || 'PENDING')}
                  </div>
                  <Link
                    href={`/job/${selectedJob?.id}`}
                    className="w-full sm:w-auto"
                  >
                    <Button className="!h-[35px] sm:!h-[35px] typo-small rounded-md !p-[10px] font-medium !bg-blue-100 !text-blue-600 w-full sm:w-auto">
                      {t('View Bid Details')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link
                  href={`/job/${selectedJob?.id}`}
                  className="w-full sm:w-auto"
                >
                  <Button className="!h-[40px] sm:!h-[35px] typo-small rounded-md !p-[10px] font-medium w-full sm:w-auto">
                    {t('Bid On this Job')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 sm:pt-6 space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-(--primary) font-semibold typo-heading3 mb-3 sm:mb-4">
              {selectedJob?.title}
            </h3>
            <p className="typo-body font-medium text-(--primary-black) leading-relaxed break-words">
              {selectedJob?.desc}
            </p>
          </div>

          <div>
            <h4 className="text-(--primary-black) font-semibold typo-heading3 mb-3 sm:mb-4">
              {t('Services Needed')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedJob?.tags.map(tag => (
                <div
                  key={tag}
                  className="bg-[#f3f3f3] p-2 sm:p-2.5 rounded-lg typo-small flex items-center gap-[6px] text-[#15120F] font-medium"
                >
                  {tagIcons[tag]} <span className="break-words">{tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Job Details */}
          <div>
            <h4 className="text-(--primary-black) font-semibold typo-heading3 mb-3 sm:mb-4">
              {t('Job Details')}
            </h4>
            <div className="space-y-2 sm:space-y-3">
              {selectedJob?.timeSlot && (
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <Star className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium">{t('Time Slot')}:</span>
                  <span className="break-words">{selectedJob.timeSlot}</span>
                </div>
              )}
              {selectedJob?.experienceLevel && (
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <Currency className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium">{t('Experience Level')}:</span>
                  <span className="break-words">
                    {selectedJob.experienceLevel}
                  </span>
                </div>
              )}
              {selectedJob?.jobType && (
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className="font-medium">{t('Job Type')}:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      selectedJob.jobType === 'COMMUNITY_SERVICE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {selectedJob.jobType === 'COMMUNITY_SERVICE'
                      ? t('Community Service')
                      : t('Home Service')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-(--primary-black) font-semibold typo-heading3 mb-3 sm:mb-4">
              {t('Work Schedule')}
            </h4>
            <div className="flex flex-wrap gap-2 items-center">
              {selectedJob?.startDate && selectedJob?.endDate && (
                <div className="bg-[#f3f3f3] px-2 sm:px-3 py-[6px] rounded-lg typo-small text-[#15120F] font-medium flex items-center gap-2">
                  <CalenderBlank className="flex-shrink-0" />
                  <span className="break-words">
                    {new Date(selectedJob.startDate).toLocaleDateString()} -{' '}
                    {new Date(selectedJob.endDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Apartment Information */}
          {selectedJob?.apartment && (
            <div>
              <h4 className="text-(--primary-black) font-semibold typo-heading3 mb-3 sm:mb-4">
                {t('Apartment Information')}
              </h4>
              <div className="bg-[#f3f3f3] p-3 sm:p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="font-medium text-sm">
                      {t('HOA Name')}:
                    </span>
                    <span className="text-sm break-words sm:text-right">
                      {selectedJob.apartment.name}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="font-medium text-sm">
                      {t('HOA Number')}:
                    </span>
                    <span className="text-sm break-words sm:text-right">
                      {selectedJob.apartment.hoaNumber}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="font-medium text-sm">{t('City')}:</span>
                    <span className="text-sm break-words sm:text-right">
                      {selectedJob.apartment.city}
                    </span>
                  </div>
                  {selectedJob.apartment.address && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                      <span className="font-medium text-sm">
                        {t('Address')}:
                      </span>
                      <span className="text-sm break-words sm:text-right">
                        {selectedJob.apartment.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="pt-6">
            <Button
              onClick={onClose}
              className="w-full !h-[45px] sm:!h-[48px] typo-body font-medium"
            >
              {t('Close')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobDetails;
