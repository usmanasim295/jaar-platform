import i18n from '@/i18n';

// Get localized text based on current language
export const getLocalizedText = (text: { ar: string; en: string }) => {
  return i18n.language === 'ar' ? text.ar : text.en;
};

export const resolveLocale = () => {
  const lang = i18n.language;
  if (!lang) return undefined;
  if (lang.startsWith('ar')) return 'ar-SA';
  return lang;
};

// Format date
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(resolveLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getStatusBadge = (status: string) => {
  const baseClasses =
    'px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium';
  switch (status) {
    case 'PENDING':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'ACCEPTED':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'REJECTED':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

export const getJobStatusBadge = (status: string) => {
  const baseClasses = 'px-2 py-1 rounded text-[10px] sm:text-xs font-medium';
  switch (status) {
    case 'SENT_TO_LEADER':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'POSTED_BY_LEADER':
      return `${baseClasses} bg-purple-100 text-purple-800`;
    case 'OPEN':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'IN_PROGRESS':
      return `${baseClasses} bg-orange-100 text-orange-800`;
    case 'COMPLETED':
      return `${baseClasses} bg-gray-100 text-gray-800`;
    case 'CANCELLED':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};
