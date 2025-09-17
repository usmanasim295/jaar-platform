"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { MapPin, CalenderBlank, Clock, Star } from "@/components/assets/icons";
import { JobDetailModalProps } from "./type";
import Link from "next/link";
import { tagIcons } from "./tagIcons";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
const JobDetails = ({ selectedJob, onClose, isOpen }: JobDetailModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Check if current service provider has already bid on this job
  const hasUserBidded = selectedJob?.bids?.some((bid: any) => bid.serviceProviderId === user?.id) || false;
  const userBidStatus = selectedJob?.bids?.find((bid: any) => bid.serviceProviderId === user?.id);
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black z-100 transition-opacity duration-300  ${
          isOpen
            ? "opacity-40 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[648px] bg-(--white) shadow-xl z-100 scroll-hide 
    transition-transform  duration-500 ease-in-out rounded-l-3xl overflow-y-auto pl-6 py-13 pr-10
    ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
      >
        <div className="border p-6 rounded-xl border-(--light-grey)">
          <h2 className="typo-heading3 font-semibold text-(--primary-black)">
            {t("Job Information")}
          </h2>

          <div className="pt-6 ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-15 h-15 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600">
                    {selectedJob?.apartment?.name?.charAt(0) || 'J'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold typo-heading3 text-(--primary) text-[15px]">
                    {selectedJob?.apartment?.name || t("Job")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedJob?.apartment?.city}
                  </p>
                </div>
              </div>
              {hasUserBidded ? (
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium">
                    {t("Already Bidded")}
                  </div>
                  <div className="text-xs text-gray-600">
                    {t("Bid Status")}: {t(userBidStatus?.status || "PENDING")}
                  </div>
                  <Link href={`/job/${selectedJob?.id}`}>
                    <Button className="!h-[35px] typo-small rounded-md !p-[10px] font-medium !bg-blue-100 !text-blue-600">
                      {t("View Bid Details")}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href={`/job/${selectedJob?.id}`}>
                  <Button className=" !h-[35px] typo-small rounded-md !p-[10px] font-medium">
                    {t("Bid On this Job")}
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Job pricing and details */}
            {selectedJob?.charges && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{t("Budget")}</span>
                  <span className="text-lg font-bold text-green-600">{selectedJob.charges}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 space-y-6">
          <div>
            <h3 className="text-(--primary) font-semibold typo-heading3 mb-4">
              {selectedJob?.title}
            </h3>
            <p className="typo-body font-medium text-(--primary-black) leading-relaxed">
              {selectedJob?.desc}
            </p>
          </div>

          <div>
            <h4 className="text-(--primary-black) font-semibold typo-heading3 mb-4">
              {t("Services Needed")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedJob?.tags.map((tag) => (
                <div
                  key={tag}
                  className="bg-[#f3f3f3] p-2.5 rounded-lg typo-small flex items-center gap-[6px] text-[#15120F] font-medium"
                >
                  {tagIcons[tag]} {tag}
                </div>
              ))}
            </div>
          </div>

          {/* Job Details */}
          <div>
            <h4 className="text-(--primary-black) font-semibold typo-heading3 mb-4">
              {t("Job Details")}
            </h4>
            <div className="space-y-3">
              {selectedJob?.workDuration && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{t("Duration")}:</span>
                  <span>{selectedJob.workDuration}</span>
                </div>
              )}
              {selectedJob?.timeSlot && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{t("Time Slot")}:</span>
                  <span>{selectedJob.timeSlot}</span>
                </div>
              )}
              {selectedJob?.experienceLevel && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{t("Experience Level")}:</span>
                  <span>{selectedJob.experienceLevel}</span>
                </div>
              )}
              {selectedJob?.jobType && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{t("Job Type")}:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedJob.jobType === 'COMMUNITY_SERVICE' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedJob.jobType === 'COMMUNITY_SERVICE' ? t('Community Service') : t('Home Service')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-(--primary-black) font-semibold typo-heading3 mb-4">
              {t("Work Duration & Location")}
            </h4>
            <div className="flex flex-wrap gap-2 items-center">
              {selectedJob?.startDate && selectedJob?.endDate && (
                <div className="bg-[#f3f3f3] px-3 py-[6px] rounded-lg typo-small text-[#15120F] font-medium flex items-center gap-2">
                  <CalenderBlank /> 
                  {new Date(selectedJob.startDate).toLocaleDateString()} - {new Date(selectedJob.endDate).toLocaleDateString()}
                </div>
              )}
              <div className="bg-[#f3f3f3] px-3 py-[6px] rounded-lg typo-small text-[#15120F] font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {selectedJob?.location}
              </div>
            </div>
          </div>

          {/* Apartment Information */}
          {selectedJob?.apartment && (
            <div>
              <h4 className="text-(--primary-black) font-semibold typo-heading3 mb-4">
                {t("Apartment Information")}
              </h4>
              <div className="bg-[#f3f3f3] p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{t("HOA Name")}:</span>
                    <span>{selectedJob.apartment.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("HOA Number")}:</span>
                    <span>{selectedJob.apartment.hoaNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("City")}:</span>
                    <span>{selectedJob.apartment.city}</span>
                  </div>
                  {selectedJob.apartment.address && (
                    <div className="flex justify-between">
                      <span className="font-medium">{t("Address")}:</span>
                      <span>{selectedJob.apartment.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobDetails;
