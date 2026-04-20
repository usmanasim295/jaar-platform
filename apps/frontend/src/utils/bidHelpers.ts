import type { Job as ApiJob } from '@/types/api';

/** Check if current service provider has already bid on a job */
export const hasUserBidded = (
  job: ApiJob,
  currentUserId: string | undefined
): boolean => {
  if (!currentUserId) return false;
  return (
    job.bids?.some(bid => bid.serviceProviderId === currentUserId) || false
  );
};

/** Get user's bid for a job (returns the bid or null) */
export const getUserBidStatus = (
  job: ApiJob,
  currentUserId: string | undefined
) => {
  if (!currentUserId) return null;
  return job.bids?.find(bid => bid.serviceProviderId === currentUserId) || null;
};
