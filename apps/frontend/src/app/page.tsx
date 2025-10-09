'use client';
import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import JobDetails from '@/components/modals/JobDetails';
import {
  AlignBottom,
  CLeaning,
  MagnifyingGlass,
  MapPin,
  Star,
  Clock,
  CalenderBlank,
  AirConditionIcon,
  CleaningIcon,
  CableIcon,
  PlumberIcon,
  PainterIcon,
  PestControl,
  Currency,
} from '@/components/assets/icons';
import { Job } from '@/components/modals/type';
import { tagIcons } from '@/components/modals/tagIcons';
import { useTranslation } from 'react-i18next';
import { RouteProtection } from '@/components/RouteProtection';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProfileQuery, useGetJobsQuery } from '@/store/api';
import { useEffect } from 'react';
import i18n from '@/i18n';
import type { ServiceProviderService, ServiceProviderRate } from '@/types/api';
import type { Job as ApiJob } from '@/types/api';

// Service icon mapping (works for both English and Arabic)
const serviceIconMap: Record<string, React.ElementType> = {
  // English names
  'AC Services': AirConditionIcon,
  'Cleaning Services': CleaningIcon,
  Electrician: CableIcon,
  Plumber: PlumberIcon,
  Painter: PainterIcon,
  'Pest Control': PestControl,
  // Arabic names
  'خدمات تكييف الهواء': AirConditionIcon,
  'خدمات التنظيف': CleaningIcon,
  كهربائي: CableIcon,
  سباك: PlumberIcon,
  رسام: PainterIcon,
  'مكافحة الآفات': PestControl,
};

// Check if current service provider has already bid on a job
const hasUserBidded = (
  job: ApiJob,
  currentUserId: string | undefined
): boolean => {
  if (!currentUserId) return false;
  return (
    job.bids?.some(bid => bid.serviceProviderId === currentUserId) || false
  );
};

// Get user's bid status for a job
const getUserBidStatus = (job: ApiJob, currentUserId: string | undefined) => {
  if (!currentUserId) return null;
  return job.bids?.find(bid => bid.serviceProviderId === currentUserId) || null;
};

export default function Home() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [search, setSearch] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Get detailed profile data
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

  // Get jobs data
  const {
    data: jobsData,
    isLoading: isJobsLoading,
    refetch: refetchJobs,
  } = useGetJobsQuery(i18n.language as 'en' | 'ar', {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  // Refetch data when user changes or component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      refetchProfile();
      refetchJobs();
    }
  }, [isAuthenticated, user?.id, refetchJobs, refetchProfile]);

  // Transform API jobs to modal format
  const transformJob = (apiJob: ApiJob): Job => {
    const getTimeAgo = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 1) return t('Just now');
      if (diffInHours < 24) return `${diffInHours} ${t('hours ago')}`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} ${t('days ago')}`;
      return date.toLocaleDateString();
    };

    // Map service IDs to service names (you might want to fetch this from services API)

    return {
      id: apiJob.id,
      title: apiJob.title,
      desc: apiJob.description,
      tags: apiJob.services.map(service => service.service.name),
      posted: getTimeAgo(apiJob.createdAt),
      startDate: apiJob.startDate,
      endDate: apiJob.endDate,
      timeSlot: apiJob.timeSlot,
      experienceLevel: apiJob.experienceLevel,
      jobType: apiJob.jobType,
      status: apiJob.status,
      apartment: apiJob.apartment,
      services: apiJob.services,
    };
  };

  const jobs = jobsData ? jobsData.map(transformJob) : [];

  const filteredJobs = jobs.filter(
    job =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <RouteProtection>
      <div className="flex justify-center px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 lg:pt-8 gap-6 font-jakarta min-h-screen">
        <title>Find Jobs</title>
        <div className="w-full max-w-[1300px] flex gap-4 sm:gap-6 flex-col lg:flex-row">
          {/* Mobile/Tablet Horizontal Cards - Only show on screens < lg */}
          <div className="lg:hidden">
            {/* Horizontal scrollable cards */}
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {/* Profile Card - Collapsed */}
              <div
                onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                className="flex-shrink-0 bg-(--white) p-4 mt-2.5 ml-2.5 rounded-xl shadow-dark cursor-pointer min-w-[280px] hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    {isProfileLoading ? (
                      <div className="w-full h-full bg-gray-200 animate-pulse" />
                    ) : profileData?.profilePictureUrl ? (
                      <img
                        src={profileData.profilePictureUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-(--primary) truncate">
                      {isProfileLoading ? (
                        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                      ) : (
                        profileData?.name || user?.name || 'User'
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{t('View Profile')}</p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isProfileExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Services Card - Collapsed */}
              <div
                onClick={() => setIsServicesExpanded(!isServicesExpanded)}
                className="flex-shrink-0 bg-(--white) p-4 mt-2.5 mr-2.5 rounded-xl shadow-dark cursor-pointer min-w-[280px] hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 h-12">
                  {/* <div className="w-12 h-12 rounded-full bg-(--primary) flex items-center justify-center">
                    {(() => {
                      // if (isProfileLoading) {
                      //   return <CleaningIcon className="w-6 h-6 text-white" />;
                      // }
                      const firstService = profileData?.services?.[0]?.service?.name;
                      const IconComponent = firstService ? serviceIconMap[firstService] : CleaningIcon;
                      return <IconComponent className="w-6 h-6 text-white" />;
                    })()}
                  </div> */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-(--primary-black)">
                      {t('Services')}
                    </div>
                    <p className="text-xs text-gray-500">
                      {isProfileLoading
                        ? '...'
                        : `${profileData?.services?.length || 0} ${t('services')}`}
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isServicesExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expanded Profile Content */}
            {isProfileExpanded && (
              <div className="bg-(--white) p-4 sm:p-6 rounded-xl shadow-dark mb-4 animate-fadeIn">
                <div className="flex items-center gap-3 pb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                    {isProfileLoading ? (
                      <div className="w-full h-full bg-gray-200 animate-pulse" />
                    ) : profileData?.profilePictureUrl ? (
                      <img
                        src={profileData.profilePictureUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base sm:text-lg text-(--primary)">
                      {isProfileLoading ? (
                        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                      ) : (
                        profileData?.name || user?.name || 'User'
                      )}
                    </div>
                    {profileData?.bio && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {profileData.bio}
                      </p>
                    )}
                  </div>
                </div>
                <hr className="border-(--light-grey) mb-4" />
                <div className="flex items-center text-(--primary) gap-2 font-semibold text-sm mb-3">
                  <AlignBottom className="w-4 h-4" />
                  <h3>{t('Statistics')}</h3>
                </div>
                <div className="flex gap-2 font-medium text-sm items-center mb-3">
                  <Star className="w-4 h-4" />
                  <div>
                    {isProfileLoading ? (
                      <div className="h-4 w-8 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      profileData?.rating || 0
                    )}
                  </div>
                </div>
                <div className="flex gap-4 sm:gap-8">
                  <div>
                    <h2 className="font-semibold text-base text-(--primary) pb-1">
                      {isProfileLoading ? (
                        <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
                      ) : (
                        `$${profileData?.totalEarnings || 0}`
                      )}
                    </h2>
                    <p className="font-normal text-xs text-gray-600">
                      {t('Total Earnings')}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-semibold text-base text-(--primary) pb-1">
                      {isProfileLoading ? (
                        <div className="h-6 w-8 bg-gray-200 animate-pulse rounded" />
                      ) : (
                        profileData?.totalJobs || 0
                      )}
                    </h2>
                    <p className="font-normal text-xs text-gray-600">
                      {t('Total Jobs')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Expanded Services Content */}
            {isServicesExpanded && (
              <div className="bg-(--white) p-4 sm:p-6 rounded-xl shadow-dark mb-4 animate-fadeIn">
                <h4 className="font-semibold text-base sm:text-lg mb-3 text-(--primary-black)">
                  {t('Services Provided By You')}
                </h4>
                <div className="space-y-2">
                  {isProfileLoading ? (
                    Array(2)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center p-3 border border-(--light-grey) rounded-lg gap-3"
                        >
                          <div className="w-10 h-10 bg-gray-200 animate-pulse rounded flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1" />
                            <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
                          </div>
                        </div>
                      ))
                  ) : profileData?.services &&
                    profileData.services.length > 0 ? (
                    profileData.services.map(
                      (
                        serviceProviderService: ServiceProviderService,
                        i: number
                      ) => {
                        const serviceName =
                          serviceProviderService.service?.name || 'Service';
                        const IconComponent =
                          serviceIconMap[serviceName] || CleaningIcon;

                        return (
                          <div
                            key={i}
                            className="flex items-center p-3 border border-(--light-grey) rounded-lg text-sm text-(--primary-black) gap-3"
                          >
                            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10">
                              <IconComponent className="text-gray-600 w-8 h-8" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{serviceName}</p>
                              {profileData.serviceRates?.find(
                                (rate: ServiceProviderRate) =>
                                  rate.serviceId ===
                                  serviceProviderService.serviceId
                              ) && (
                                <p className="text-xs text-gray-600">
                                  $
                                  {
                                    profileData.serviceRates.find(
                                      (rate: ServiceProviderRate) =>
                                        rate.serviceId ===
                                        serviceProviderService.serviceId
                                    )?.rate
                                  }
                                  /hour
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <p className="text-sm">{t('No services added yet')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-[75%]">
            <div className="flex-1">
              <div className="relative w-full p-3 sm:p-4 flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-(--grey-text) bg-(--light-grey) h-[45px] sm:h-[50px] rounded-lg sm:rounded-[10px]">
                <MagnifyingGlass className="w-5 h-5 sm:w-6 sm:h-6" />
                <input
                  type="text"
                  placeholder={t('Search Jobs')}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-(--light-grey) placeholder:text-sm sm:placeholder:typo-body pr-2 sm:pr-4 py-2 sm:py-3 text-sm sm:typo-body text-(--black) focus:outline-none"
                />
              </div>

              <h2 className="text-(--primary-black) text-lg sm:typo-heading3 font-semibold mb-3 sm:mb-4">
                {t('Find Jobs')}
              </h2>

              {/*  Job Cards */}
              <div className="space-y-4 sm:space-y-6 mb-6">
                {isJobsLoading ? (
                  // Loading skeleton
                  Array(3)
                    .fill(0)
                    .map((_, idx) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-dark bg-[#ffffff] animate-pulse"
                      >
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                          <div className="h-5 sm:h-6 w-36 sm:w-48 bg-gray-200 rounded"></div>
                          <div className="h-4 w-16 sm:w-20 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded mb-3 sm:mb-4"></div>
                        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                          <div className="h-7 sm:h-8 w-20 sm:w-24 bg-gray-200 rounded"></div>
                          <div className="h-7 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded"></div>
                          <div className="h-7 sm:h-8 w-24 sm:w-28 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="h-4 w-48 sm:w-64 bg-gray-200 rounded"></div>
                          <div className="h-7 sm:h-8 w-14 sm:w-16 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))
                ) : filteredJobs.length === 0 ? (
                  <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-dark bg-[#ffffff]">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base sm:typo-heading3 font-semibold text-(--primary-black)">
                        {t('No jobs found.')}
                      </h3>
                    </div>
                  </div>
                ) : (
                  filteredJobs.map((job, idx) => {
                    // Get the original API job data for bidding status check
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
                      <div
                        key={idx}
                        className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-dark bg-[#ffffff]"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-base sm:typo-heading3 font-semibold text-(--primary-black) flex-1">
                            {job.title}
                          </h3>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-xs sm:typo-small font-medium text-(--grey-text) whitespace-nowrap">
                              {t('Posted')} {job.posted}
                            </span>
                            {hasBidded && userBidStatus && (
                              <span className="text-xs sm:typo-small font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded whitespace-nowrap">
                                {t('Already Bidded')} -{' '}
                                {t(userBidStatus.status)}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="leading-[22px] text-xs sm:text-sm font-medium text-(--primary-black) mt-3 sm:mt-4">
                          {job.desc}
                        </p>

                        {/* Additional job details */}
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
                          {job.timeSlot && (
                            <span className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">
                                {job.timeSlot}
                              </span>
                            </span>
                          )}
                          {job.experienceLevel && (
                            <span className="flex items-center gap-2">
                              <span className="font-medium">
                                🎯 {job.experienceLevel}
                              </span>
                            </span>
                          )}
                          {job.jobType && (
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                job.jobType === 'COMMUNITY_SERVICE'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {job.jobType === 'COMMUNITY_SERVICE'
                                ? t('Community Service')
                                : t('Home Service')}
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
                              <span className="w-3 h-3 sm:w-4 sm:h-4">
                                {tagIcons[tag]}
                              </span>
                              <span>{tag}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center  gap-2 mt-3 sm:mt-4">
                          {job.apartment && (
<div className="flex items-center font-medium cursor-pointer gap-1 sm:gap-[6px] text-xs leading-[100%] text-[var(--grey-text)] max-w-[70%] overflow-visible relative group">
  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />

  <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis block">
    {job.apartment.name}, {job.apartment.city}
  </span>

  {/* Tooltip always shows on hover */}
  <span className="absolute left-4 -top-7 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap z-50">
    {job.apartment.name}, {job.apartment.city}
  </span>
  
</div>

                          )}
                          <Button
                            onClick={() => {
                              setSelectedJob(job);
                              setIsPopupOpen(true);
                            }}
                            className="!h-[32px] sm:!h-[35px] !w-[48px] sm:!w-[52px] !p-2 sm:!p-[10px] !text-xs !rounded-lg !font-medium"
                          >
                            {t('View')}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar - Only show on lg screens */}
          <div className="hidden lg:block lg:w-[25%] lg:pl-4">
            <div className="w-full">
              <div className="sticky top-24 space-y-6">
                <div className="bg-(--white) p-6 rounded-2xl shadow-dark">
                  <div className="flex items-center gap-3 pb-6">
                    <div className="w-[60px] h-[60px] rounded-full bg-gray-200 overflow-hidden">
                      {isProfileLoading ? (
                        <div className="w-full h-full bg-gray-200 animate-pulse" />
                      ) : profileData?.profilePictureUrl ? (
                        <img
                          src={profileData.profilePictureUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold typo-heading3 text-(--primary) ">
                        {isProfileLoading ? (
                          <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                        ) : (
                          profileData?.name || user?.name || 'User'
                        )}
                      </div>
                      {profileData?.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {profileData.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <hr className="border-(--light-grey) w-[100%] " />
                  <div className="flex items-center text-(--primary) gap-2 font-semibold typo-label py-6">
                    <AlignBottom />
                    <h3>{t('Statistics')}</h3>
                  </div>
                  <div className="flex gap-2 font-medium typo-small items-center ">
                    <Star />
                    <div>
                      {isProfileLoading ? (
                        <div className="h-4 w-8 bg-gray-200 animate-pulse rounded" />
                      ) : (
                        profileData?.rating || 0
                      )}
                    </div>
                  </div>
                  <div className="mt-4 typo-body text-gray-600 flex gap-8">
                    <div>
                      <h2 className="font-semibold typo-label text-(--primary) pb-2">
                        {isProfileLoading ? (
                          <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
                        ) : (
                          `$${profileData?.totalEarnings || 0}`
                        )}
                      </h2>
                      <p className="font-normal typo-small">
                        {t('Total Earnings')}
                      </p>
                    </div>
                    <div>
                      <h2 className="font-semibold typo-label text-(--primary) pb-2">
                        {isProfileLoading ? (
                          <div className="h-6 w-8 bg-gray-200 animate-pulse rounded" />
                        ) : (
                          profileData?.totalJobs || 0
                        )}
                      </h2>
                      <p className="font-normal typo-small">
                        {t('Total Jobs')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-(--white) p-6 rounded-lg shadow-dark my-6 ">
                  <h4 className="font-semibold typo-heading3 mb-[18px] text-(--primary-black)">
                    {t('Services Provided By You')}
                  </h4>
                  <div className="space-y-2">
                    {isProfileLoading ? (
                      Array(2)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center p-4 border border-(--light-grey) rounded-lg gap-4"
                          >
                            <div className="w-12 h-12 bg-gray-200 animate-pulse rounded flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1" />
                              <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
                            </div>
                          </div>
                        ))
                    ) : profileData?.services &&
                      profileData.services.length > 0 ? (
                      profileData.services.map(
                        (
                          serviceProviderService: ServiceProviderService,
                          i: number
                        ) => {
                          const serviceName =
                            serviceProviderService.service?.name || 'Service';
                          const IconComponent =
                            serviceIconMap[serviceName] || CleaningIcon;

                          return (
                            <div
                              key={i}
                              className="flex items-center p-4 border border-(--light-grey) rounded-lg typo-body text-(--primary-black) gap-4"
                            >
                              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12">
                                <IconComponent className="text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">{serviceName}</p>
                                {profileData.serviceRates?.find(
                                  (rate: ServiceProviderRate) =>
                                    rate.serviceId ===
                                    serviceProviderService.serviceId
                                ) && (
                                  <p className="text-sm text-gray-600">
                                    $
                                    {
                                      profileData.serviceRates.find(
                                        (rate: ServiceProviderRate) =>
                                          rate.serviceId ===
                                          serviceProviderService.serviceId
                                      )?.rate
                                    }
                                    /hour
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        <p>{t('No services added yet')}</p>
                      </div>
                    )}
                  </div>
                </div>
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
