import i18n from '@/i18n';
import { Job } from '@/components/modals/type';
import type { Job as ApiJob } from '@/types/api';

/** Format how long ago a date was (locale-aware) */
export const getTimeAgo = (
  dateString: string,
  t: (key: string) => string
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return t('Just now');
  if (diffInHours < 24) return `${diffInHours} ${t('hours ago')}`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ${t('days ago')}`;

  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
  return date.toLocaleDateString(locale);
};

/** Transform API job response to the Job type used by JobCard/JobDetails */
export const transformJob = (
  apiJob: ApiJob,
  t: (key: string) => string
): Job => {
  return {
    id: apiJob.id,
    title: apiJob.title,
    desc: apiJob.description,
    tags: apiJob.services.map(service => service.service.name),
    posted: getTimeAgo(apiJob.createdAt, t),
    startDate: apiJob.startDate,
    endDate: apiJob.endDate,
    timeSlot: apiJob.timeSlot,
    experienceLevel: apiJob.experienceLevel,
    jobType: apiJob.jobType,
    status: apiJob.status,
    apartment: apiJob.apartment,
    services: apiJob.services,
    serviceQuestionAnswers: apiJob.serviceQuestionAnswers,
  };
};
