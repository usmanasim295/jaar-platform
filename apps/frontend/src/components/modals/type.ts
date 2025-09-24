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
  status?:
    | 'SENT_TO_LEADER'
    | 'POSTED_BY_LEADER'
    | 'OPEN'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';
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
  sender?: 'me' | 'them';
  type?: 'text' | 'offer';
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

// New Chat Types for Real-time Integration
export interface ChatMessage {
  id: string;
  chatId: string;
  content:
    | string
    | {
        en: string;
        ar: string;
      };
  type: 'TEXT' | 'IMAGE' | 'VOICE_NOTE' | 'FILE' | 'POLL';
  senderId?: string;
  senderServiceProviderId?: string;
  sender?: {
    id: string;
    nationalId: string;
    role: 'LEADER' | 'HOME_OWNER' | 'ADMIN';
  };
  senderServiceProvider?: {
    id: string;
    name: {
      en: string;
      ar: string;
    };
    email: string;
  };
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  replyToId?: string;
  replyTo?: ChatMessage;
  pollId?: string;
  poll?: {
    id: string;
    question: {
      en: string;
      ar: string;
    };
    options: PollOption[];
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PollOption {
  id: string;
  text: {
    en: string;
    ar: string;
  };
  pollId: string;
}

export interface Chat {
  id: string;
  type: 'ONE_TO_ONE' | 'COMMUNITY_GROUP' | 'SERVICE_CHAT';
  name: {
    en: string;
    ar: string;
  };
  participants: ChatParticipant[];
  community?: {
    id: string;
    hoaNumber: string;
    name: {
      en: string;
      ar: string;
    };
  };
  job?: {
    id: string;
    title: {
      en: string;
      ar: string;
    };
    jobType: 'COMMUNITY_SERVICE' | 'HOME_SERVICE';
  };
  messages: ChatMessage[];
  _count: {
    messages: number;
  };
  updatedAt: string;
}

export interface ChatParticipant {
  userId?: string;
  serviceProviderId?: string;
  user?: {
    id: string;
    nationalId: string;
    role: 'LEADER' | 'HOME_OWNER' | 'ADMIN';
  };
  serviceProvider?: {
    id: string;
    name: {
      en: string;
      ar: string;
    };
    email: string;
  };
}

export interface UnreadCount {
  totalUnread: number;
  chatUnreadCounts: Record<string, number>;
}

export interface CreateMessageRequest {
  chatId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'VOICE_NOTE' | 'FILE';
  replyToId?: string;
}

export interface CreatePollRequest {
  chatId: string;
  question: string;
  options: Array<{ text: string }>;
  isMultipleChoice?: boolean;
  expiresAt?: string;
}

export interface VotePollRequest {
  pollId: string;
  optionIds: string[];
}
