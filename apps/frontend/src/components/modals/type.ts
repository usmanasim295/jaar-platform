export type Job = {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  location: string;
  posted: string;
  highlighted?: boolean;
  charges?: string;
  workDuration?: string;
  startDate?: string;
  endDate?: string;
  timeSlot?: string;
  experienceLevel?: string | null;
  jobType?: 'COMMUNITY_SERVICE' | 'HOME_SERVICE';
  status?: 'SENT_TO_LEADER' | 'POSTED_BY_LEADER' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  apartment?: {
    id: string;
    name: string;
    hoaNumber: string;
    address?: string;
    city: string;
  };
  services?: Array<{
    id: string;
    jobId: string;
    serviceId: string;
    createdAt: string;
    service: {
      id: string;
      name: string;
      description: string;
      image: string | null;
      createdAt: string;
      updatedAt: string;
    };
  }>;
  bids?: Array<{
    id: string;
    jobId: string;
    serviceProviderId: string;
    totalPrice: number;
    coverLetter: string;
    documentUrl: string | null;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
    updatedAt: string;
    serviceProvider: {
      id: string;
      name: string;
      rating: number;
      totalJobs: number;
    };
  }>;
};

export type JobDetailModalProps = {
  selectedJob: Job | null;
  onClose: () => void;
  isOpen: boolean;
};

// type.ts
export interface JobCardProps {
  title: string;
  description?: string;
  tags?: string[];
  date?: string;
  time?: string;
  location?: string;
  tickets?: number;
  status?: string;
  charges?: string;
  workDuration?: string;
  timeSlot?: string;
  experienceLevel?: string;
  apartment?: {
    name: string;
    city: string;
  };
  services?: Array<{
    service: string;
  }>;
  bids?: Array<{
    status: string;
    totalPrice: number;
  }>;
  jobId?: string;
}

export interface Messages {
  id: number;
  sender?: "me" | "them";
  type?: "text" | "offer";
  content: string;
  time: string;
  offerTitle?: string;
  offerDescription?: string;
  img?: string;
}

export interface Chats {
  id: number;
  name: string;
  img?: string;
  messages: Messages[];
}
