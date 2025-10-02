'use client';

import React, { FC, useState, useMemo } from 'react';
import { Clock, CalenderBlank, MapPin } from '@/components/assets/icons';
import { tagIcons } from '@/components/modals/tagIcons';
import { JobCardProps } from '@/components/modals/type';
import JobCard from '@/components/modals/JobCard';
import { useTranslation } from 'react-i18next';
import {
  useGetServiceProviderJobsQuery,
  useGetMyCompletionRequestsQuery,
} from '@/store/api';
import {
  transformJobToJobCard,
  filterJobs,
  getTabConfig,
} from '@/utils/jobUtils';
import { Job, JobCompletionRequest } from '@/types/api';
import CompletionRequestCard from '@/components/modals/CompletionRequestCard';
import { useAuth } from '@/contexts/AuthContext';

export default function OngoingJobsPage() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  // Filter states for completion requests
  const [completionJobTypeFilter, setCompletionJobTypeFilter] = useState<
    'HOME_SERVICE' | 'COMMUNITY_SERVICE' | ''
  >('');
  const [completionStatusFilter, setCompletionStatusFilter] = useState<
    'PENDING' | 'APPROVED' | 'REJECTED' | ''
  >('');

  // Get current language
  const currentLang = i18n.language as 'en' | 'ar';

  // Get tab configuration
  const tabConfig = getTabConfig();
  const activeTabConfig =
    tabConfig.find(tab => tab.id === activeTab) || tabConfig[0];

  // Fetch all jobs for the "all" tab, or specific filtered jobs for other tabs
  const {
    data: allJobs = [],
    isLoading: isLoadingAll,
    error: errorAll,
  } = useGetServiceProviderJobsQuery(
    {
      lang: currentLang,
    },
    {
      skip: !isAuthenticated, // Skip if not authenticated
    }
  );

  const {
    data: filteredJobs = [],
    isLoading: isLoadingFiltered,
    error: errorFiltered,
  } = useGetServiceProviderJobsQuery(
    {
      lang: currentLang,
      jobType: activeTabConfig.jobType,
      status: activeTabConfig.status,
    },
    {
      skip: !isAuthenticated || activeTab === 'all', // Skip if not authenticated or on "all" tab
    }
  );

  // Fetch completion requests for the completion-requests tab
  const {
    data: completionRequests = [],
    isLoading: isLoadingCompletionRequests,
    error: errorCompletionRequests,
  } = useGetMyCompletionRequestsQuery(
    {
      lang: currentLang,
      jobType: completionJobTypeFilter || undefined,
      status: completionStatusFilter || undefined,
    },
    {
      skip: !isAuthenticated || activeTab !== 'completion-requests', // Skip if not authenticated or not on completion-requests tab
    }
  );

  // Determine which data to use
  const jobs = activeTab === 'all' ? allJobs : filteredJobs;

  // Transform jobs
  const transformedJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    return jobs.map(transformJobToJobCard);
  }, [jobs]);

  // Determine error and loading states based on active tab
  const error =
    activeTab === 'all'
      ? errorAll
      : activeTab === 'completion-requests'
        ? errorCompletionRequests
        : errorFiltered;

  // Determine loading state based on active tab
  // Use isLoading (not isFetching) to only show skeleton on initial load, not refetch
  const isLoading =
    activeTab === 'all'
      ? isLoadingAll
      : activeTab === 'completion-requests'
        ? isLoadingCompletionRequests
        : isLoadingFiltered;

  // Loading state - Show skeleton while auth is loading OR data is loading
  if (isAuthLoading || isLoading) {
    return (
      <div className="p-[60px] pt-8 max-w-[1400px] mx-auto font-jakarta">
        <title>{t('Ongoing Jobs')}</title>

        {/* Tab Navigation Skeleton */}
        <div className="flex gap-2 justify-between border-b border-[#F6F6F6] mb-5 overflow-x-auto">
          {Array(7)
            .fill(0)
            .map((_, idx) => (
              <div
                key={idx}
                className="pb-[13px] h-6 w-32 bg-gray-200 animate-pulse rounded"
              />
            ))}
        </div>

        {/* Content Count Skeleton */}
        <div className="mb-6">
          <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* Job Cards Skeleton */}
        <div className="space-y-6">
          {Array(3)
            .fill(0)
            .map((_, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl shadow-dark bg-white animate-pulse"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 w-48 bg-gray-200 rounded" />
                  <div className="h-6 w-24 bg-gray-200 rounded" />
                </div>

                {/* Description */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-8 w-24 bg-gray-200 rounded-lg" />
                  <div className="h-8 w-28 bg-gray-200 rounded-lg" />
                  <div className="h-8 w-20 bg-gray-200 rounded-lg" />
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-10 w-32 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-[60px] pt-8 max-w-[1400px] mx-auto font-jakarta">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">
            {t('Error loading jobs. Please try again.')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-[60px] pt-8 max-w-[1400px] mx-auto font-jakarta">
      <title>{t('Ongoing Jobs')}</title>

      {/* Tab Navigation */}
      <div className="flex gap-8 border-b border-[#F6F6F6] mb-5 overflow-x-auto">
        {tabConfig.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-[13px] whitespace-nowrap typo-label ${
              tab.id === activeTab
                ? 'border-b-2 border-(--orange) text-(--primary-black) font-semibold'
                : 'text-(--grey-text) font-normal cursor-pointer hover:text-(--primary-black)'
            }`}
            title={tab.description}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>

      {/* Filters for Completion Requests Tab */}
      {activeTab === 'completion-requests' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('Filter Completion Requests')}
          </h3>
          <div className="flex flex-wrap gap-4">
            {/* Job Type Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Job Type')}
              </label>
              <select
                value={completionJobTypeFilter}
                onChange={e =>
                  setCompletionJobTypeFilter(
                    e.target.value as 'HOME_SERVICE' | 'COMMUNITY_SERVICE' | ''
                  )
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">{t('All Job Types')}</option>
                <option value="HOME_SERVICE">{t('Home Service')}</option>
                <option value="COMMUNITY_SERVICE">
                  {t('Community Service')}
                </option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Status')}
              </label>
              <select
                value={completionStatusFilter}
                onChange={e =>
                  setCompletionStatusFilter(
                    e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED' | ''
                  )
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">{t('All Statuses')}</option>
                <option value="PENDING">{t('Pending Review')}</option>
                <option value="APPROVED">{t('Approved')}</option>
                <option value="REJECTED">{t('Rejected')}</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setCompletionJobTypeFilter('');
                  setCompletionStatusFilter('');
                }}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {t('Clear Filters')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          {activeTab === 'completion-requests' ? (
            <>
              {t('Showing')} {completionRequests.length}{' '}
              {t('completion requests')}
              {activeTabConfig.description &&
                ` - ${t(activeTabConfig.description)}`}
            </>
          ) : (
            <>
              {t('Showing')} {transformedJobs.length} {t('jobs')}
              {activeTabConfig.description &&
                ` - ${t(activeTabConfig.description)}`}
            </>
          )}
        </p>
      </div>

      {/* Content List */}
      {activeTab === 'completion-requests' ? (
        // Completion Requests List
        completionRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-500 text-lg mb-2">
              {t('No completion requests found')}
            </div>
            <div className="text-gray-400 text-sm">
              {t('Submit completion requests for your jobs to see them here')}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {completionRequests.map(request => (
              <CompletionRequestCard
                key={request.id}
                completionRequest={request}
              />
            ))}
          </div>
        )
      ) : // Jobs List
      transformedJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-500 text-lg mb-2">{t('No jobs found')}</div>
          <div className="text-gray-400 text-sm">
            {t('Try selecting a different tab or check back later')}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {transformedJobs.map((job, index) => (
            <JobCard key={`${job.title}-${index}`} {...job} />
          ))}
        </div>
      )}
    </div>
  );
}
