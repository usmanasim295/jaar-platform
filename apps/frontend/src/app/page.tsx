'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import JobDetails from '@/components/modals/JobDetails';
import { Job } from '@/components/modals/type';
import { RouteProtection } from '@/components/RouteProtection';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProfileQuery, useGetJobsQuery } from '@/store/api';
import i18n from '@/i18n';
import ProfileCard from '@/components/services-provider/jobs/ProfileCard';
import ServicesCard from '@/components/services-provider/jobs/ServicesCard';
import MobileProfileSummary from '@/components/services-provider/jobs/MobileProfileSummary';
import MobileServicesSummary from '@/components/services-provider/jobs/MobileServicesSummary';
import JobSearchBar from '@/components/services-provider/jobs/JobSearchBar';
import JobCard from '@/components/services-provider/jobs/JobCard';
import JobListSkeleton from '@/components/services-provider/jobs/JobListSkeleton';
import { transformJob } from '@/utils/transformJob';
import { hasUserBidded, getUserBidStatus } from '@/utils/bidHelpers';

export default function Home() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [search, setSearch] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  console.log('🚀 ~ Home ~ selectedJob:', selectedJob);

  const {
    data: profileData,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetProfileQuery(
    isAuthenticated && user
      ? { serviceProviderId: user.id, lang: i18n.language as 'en' | 'ar' }
      : { serviceProviderId: '', lang: 'en' as 'en' | 'ar' },
    {
      skip: !isAuthenticated || !user,
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    data: jobsData,
    isLoading: isJobsLoading,
    refetch: refetchJobs,
  } = useGetJobsQuery(i18n.language as 'en' | 'ar', {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      refetchProfile();
      refetchJobs();
    }
  }, [isAuthenticated, user?.id, refetchJobs, refetchProfile]);

  const jobs = jobsData ? jobsData.map(apiJob => transformJob(apiJob, t)) : [];

  const filteredJobs = jobs.filter(
    job =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsPopupOpen(true);
  };

  return (
    <RouteProtection>
      <div className="flex justify-center px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 lg:pt-8 gap-6 font-jakarta min-h-screen">
        <title>Find Jobs</title>
        <div className="w-full max-w-[1300px] flex gap-4 sm:gap-6 flex-col lg:flex-row">
          {/* Mobile/Tablet Horizontal Cards */}
          <div className="lg:hidden">
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              <MobileProfileSummary
                isProfileLoading={isProfileLoading}
                profileData={profileData}
                userName={user?.name}
                isExpanded={isProfileExpanded}
                onToggle={() => setIsProfileExpanded(!isProfileExpanded)}
              />
              <MobileServicesSummary
                isProfileLoading={isProfileLoading}
                profileData={profileData}
                isExpanded={isServicesExpanded}
                onToggle={() => setIsServicesExpanded(!isServicesExpanded)}
              />
            </div>

            {isProfileExpanded && (
              <div className="animate-fadeIn mb-4">
                <ProfileCard
                  isProfileLoading={isProfileLoading}
                  profileData={profileData}
                  userName={user?.name}
                  variant="mobile"
                />
              </div>
            )}

            {isServicesExpanded && (
              <div className="animate-fadeIn">
                <ServicesCard
                  isProfileLoading={isProfileLoading}
                  profileData={profileData}
                  variant="mobile"
                />
              </div>
            )}
          </div>

          {/* Main Content - Jobs List */}
          <div className="w-full lg:w-[75%]">
            <div className="flex-1">
              <JobSearchBar value={search} onChange={setSearch} />

              <h2 className="text-(--primary-black) text-lg sm:typo-heading3 font-semibold mb-3 sm:mb-4">
                {t('Find Jobs')}
              </h2>

              <div className="space-y-4 sm:space-y-6 mb-6">
                {isJobsLoading ? (
                  <JobListSkeleton />
                ) : filteredJobs.length === 0 ? (
                  <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-dark bg-[#ffffff]">
                    <h3 className="text-base sm:typo-heading3 font-semibold text-(--primary-black)">
                      {t('No jobs found.')}
                    </h3>
                  </div>
                ) : (
                  filteredJobs.map(job => {
                    const originalJob = jobsData?.find(
                      apiJob => apiJob.id === job.id
                    );
                    const userBidStatus = originalJob
                      ? getUserBidStatus(originalJob, user?.id)
                      : null;
                    const hasBidded = originalJob
                      ? hasUserBidded(originalJob, user?.id)
                      : false;

                    return (
                      <JobCard
                        key={job.id}
                        job={job}
                        hasBidded={hasBidded}
                        userBidStatus={userBidStatus}
                        onView={handleViewJob}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-[25%] lg:pl-4">
            <div className="w-full">
              <div className="sticky top-24 space-y-6">
                <ProfileCard
                  isProfileLoading={isProfileLoading}
                  profileData={profileData}
                  userName={user?.name}
                  variant="desktop"
                />
                <ServicesCard
                  isProfileLoading={isProfileLoading}
                  profileData={profileData}
                  variant="desktop"
                />
              </div>
            </div>
          </div>
        </div>

        <JobDetails
          selectedJob={selectedJob}
          onClose={() => setIsPopupOpen(false)}
          isOpen={isPopupOpen}
        />
      </div>
    </RouteProtection>
  );
}
