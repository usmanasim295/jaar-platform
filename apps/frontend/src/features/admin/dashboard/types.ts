export type SummaryCard = {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
};
export type ServiceProviderRow = {
  id: string;
  name: string;
  createdDate?: string;
  rating: number;
  totalEarnings: number;
  completedJobs: number;
  status: string;
  isBlocked: boolean;
};

export const FILTER_PRESETS = ['weekly', 'monthly', 'yearly'] as const;
export type FilterPreset = (typeof FILTER_PRESETS)[number];

export const filterLabels: Record<FilterPreset, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};
