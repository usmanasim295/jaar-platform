import { Job } from '@/types/api';
import { JobCardProps } from '@/components/modals/type';

// Transform API Job to JobCardProps
export const transformJobToJobCard = (job: Job): JobCardProps => {
  return {
    title: job.title,
    description: job.description,
    tags: job.services?.map(service => service.service.name) || [],
    date: job.startDate,
    time: job.timeSlot,
    tickets: job.bids?.filter(bid => bid.status === 'ACCEPTED').length || 0,
    status: job.status,
    timeSlot: job.timeSlot,
    experienceLevel: job.experienceLevel || undefined,
    apartment: job.apartment
      ? {
          name: job.apartment.name,
          city: job.apartment.city,
        }
      : undefined,
    services: job.services?.map(service => ({
      service: service.service.name,
    })),
    bids: job.bids?.map(bid => ({
      status: bid.status,
      totalPrice: bid.totalPrice,
    })),
    jobId: job.id,
  };
};

// Filter jobs by type and status
export const filterJobs = (
  jobs: Job[],
  jobType?: 'HOME_SERVICE' | 'COMMUNITY_SERVICE',
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OPEN'
): Job[] => {
  return jobs.filter(job => {
    const matchesJobType = !jobType || job.jobType === jobType;
    const matchesStatus = !status || job.status === status;
    return matchesJobType && matchesStatus;
  });
};

// Get tab configuration
export const getTabConfig = () => [
  {
    id: 'all',
    label: 'All Ongoing Jobs',
    jobType: undefined,
    status: undefined,
    description: 'All jobs regardless of type or status',
  },
  {
    id: 'community',
    label: 'Community Service Jobs',
    jobType: 'RFQ' as const,
    status: undefined,
    description: 'Community service related jobs',
  },
  {
    id: 'home',
    label: 'Home Service Jobs',
    jobType: 'HOME_SERVICE' as const,
    status: undefined,
    description: 'Home service related jobs',
  },
  {
    id: 'in-progress',
    label: 'In Progress Jobs',
    jobType: undefined,
    status: 'IN_PROGRESS' as const,
    description: 'Jobs currently in progress',
  },
  {
    id: 'completed',
    label: 'Completed Jobs',
    jobType: undefined,
    status: 'COMPLETED' as const,
    description: 'Successfully completed jobs',
  },
  {
    id: 'cancelled',
    label: 'Cancelled Jobs',
    jobType: undefined,
    status: 'CANCELLED' as const,
    description: 'Cancelled jobs',
  },
  {
    id: 'completion-requests',
    label: 'Completion Requests',
    jobType: undefined,
    status: undefined,
    description: 'Your submitted completion requests',
  },
];
