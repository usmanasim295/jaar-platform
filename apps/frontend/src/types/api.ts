// API Response Types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  status: number;
}

// Service Provider Types
export interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  signupStep: number;
  governmentDocumentUrl: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  bankAccountNumber: string | null;
  bankDocumentUrl: string | null;
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  totalEarnings: number;
  totalJobs: number;
  createdAt: string;
  updatedAt: string;
  services?: ServiceProviderService[];
  serviceRates?: ServiceProviderRate[];
  locations?: ServiceProviderLocation[];
}

// Service Provider Service
export interface ServiceProviderService {
  id: string;
  serviceProviderId: string;
  serviceId: string;
  createdAt: string;
  service: {
    id: string;
    name: string;
    description: string;
    image: string | null;
  };
}

// Service Provider Rate
export interface ServiceProviderRate {
  id: string;
  serviceProviderId: string;
  serviceId: string;
  rate: string;
  description: string | null;
  createdAt: string;
  service: {
    id: string;
    name: string;
    description: string;
    image: string | null;
  };
}

// Service Provider Location
export interface ServiceProviderLocation {
  id: string;
  serviceProviderId: string;
  city: string;
  state: string;
  country: string;
  isActive: boolean;
  createdAt: string;
}

// Job Types
export interface JobService {
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
}

export interface JobApartment {
  id: string;
  name: string;
  hoaNumber: string;
  address?: string;
  city: string;
}

export interface JobLeader {
  id: string;
  nationalId: string;
  role: string;
}

export interface JobCreator {
  id: string;
  nationalId: string;
  role: string;
}

export interface JobBid {
  id: string;
  jobId: string;
  serviceProviderId: string;
  totalPrice: number;
  coverLetter: {
    ar: string;
    en: string;
  };
  documentUrl: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  serviceProvider: string;
}


export interface Job {
  id: string;
  title: string;
  description: string;
  charges: string;
  workDuration: string;
  startDate: string;
  endDate: string;
  timeSlot: string;
  location: string;
  experienceLevel: string | null;
  apartmentId: string;
  leaderId: string | null;
  createdBy: string;
  jobType: 'COMMUNITY_SERVICE' | 'HOME_SERVICE';
  status: 'SENT_TO_LEADER' | 'POSTED_BY_LEADER' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  services: JobService[];
  apartment: JobApartment;
  leader: JobLeader | null;
  creator: JobCreator;
  bids: JobBid[];
  completionRequests: JobCompletionRequest[];
}

// Service Provider Jobs API Response
export interface ServiceProviderJobsResponse {
  jobs: Job[];
}

// Job Completion Request Types
export interface JobCompletionRequest {
  id: string;
  jobId: string;
  serviceProviderId: string;
  completionNotes: string;
  completionImages: string[];
  additionalDocumentUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNotes: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: {
      ar: string;
      en: string;
    };
    description: {
      ar: string;
      en: string;
    };
    charges: {
      ar: string;
      en: string;
    };
    workDuration: {
      ar: string;
      en: string;
    };
    startDate: string;
    endDate: string;
    timeSlot: {
      ar: string;
      en: string;
    };
    location: {
      ar: string;
      en: string;
    };
    experienceLevel: {
      ar: string;
      en: string;
    };
    apartmentId: string;
    leaderId: string | null;
    createdBy: string;
    jobType: 'HOME_SERVICE' | 'COMMUNITY_SERVICE';
    status: 'SENT_TO_LEADER' | 'POSTED_BY_LEADER' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
    services: string;
    apartment: string;
    leader: string | null;
    creator: string;
  };
  serviceProvider: {
    id: string;
    name: string;
    rating: number;
    totalJobs: number;
    totalEarnings: number;
  };
  reviewer: string | null;
}

// Job Completion Request Submit Types
export interface JobCompletionRequestSubmit {
  jobId: string;
  completionNotes: string;
  completionImages?: File[];
  additionalDocument?: File;
}

export interface JobCompletionRequestResponse {
  message: string;
  completionRequest: JobCompletionRequest;
}

// Bid Types
export interface BidRequest {
  jobId: string;
  totalPrice: string;
  coverLetter: string;
  document?: File;
}

export interface BidResponse {
  message: string;
  bid: {
    id: string;
    jobId: string;
    serviceProviderId: string;
    totalPrice: number;
    coverLetter: string;
    documentUrl: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
    updatedAt: string;
    job: {
      id: string;
      title: {
        ar: string;
        en: string;
      };
      description: {
        ar: string;
        en: string;
      };
      charges: {
        ar: string;
        en: string;
      };
      workDuration: {
        ar: string;
        en: string;
      };
      startDate: string;
      endDate: string;
      timeSlot: {
        ar: string;
        en: string;
      };
      location: {
        ar: string;
        en: string;
      };
      experienceLevel: {
        ar: string;
        en: string;
      };
      apartmentId: string;
      leaderId: string;
      createdBy: string;
      jobType: 'COMMUNITY_SERVICE' | 'HOME_SERVICE';
      status: 'SENT_TO_LEADER' | 'POSTED_BY_LEADER' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      createdAt: string;
      updatedAt: string;
      services: string;
      apartment: string;
    };
    serviceProvider: {
      id: string;
      name: string;
      rating: number;
      totalJobs: number;
      totalEarnings: number;
    };
  };
}

// Delete Bid Response
export interface DeleteBidResponse {
  message: string;
}

// My Bids Types
export interface MyBid {
  id: string;
  jobId: string;
  serviceProviderId: string;
  totalPrice: number;
  coverLetter: string;
  documentUrl: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: {
      ar: string;
      en: string;
    };
    description: {
      ar: string;
      en: string;
    };
    charges: {
      ar: string;
      en: string;
    };
    workDuration: {
      ar: string;
      en: string;
    };
    startDate: string;
    endDate: string;
    timeSlot: {
      ar: string;
      en: string;
    };
    location: {
      ar: string;
      en: string;
    };
    experienceLevel: {
      ar: string;
      en: string;
    };
    apartmentId: string;
    leaderId: string | null;
    createdBy: string;
    jobType: 'COMMUNITY_SERVICE' | 'HOME_SERVICE';
    status: 'SENT_TO_LEADER' | 'POSTED_BY_LEADER' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
    services: string;
    apartment: string;
  };
}

// Signup Response
export interface SignupResponse {
  message: string;
  serviceProvider: ServiceProvider;
  nextStep: string;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string;
  image: string | null;
}

// Service Rate Types
export interface ServiceRate {
  serviceId: string;
  rate: string;
}

// Step Response Types
export interface StepResponse {
  message: string;
  nextStep: string;
}

// Signup Request Types
export interface SignupRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}

// Signin Request Types
export interface SigninRequest {
  email: string;
  password: string;
}

// Signin Response Types
export interface SigninResponse {
  access_token: string;
  serviceProvider: ServiceProvider;
  message: string;
}

// Step 1 Request (Document Upload)
export interface Step1Request {
  serviceProviderId: string;
  document: File;
}

// Step 2 Request (Service Selection)
export interface Step2Request {
  serviceProviderId: string;
  serviceIds: string[];
}

// Step 3 Request (Service Rates)
export interface Step3Request {
  serviceProviderId: string;
  serviceRates: ServiceRate[];
}

// API Error Types
export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

// Language Types
export type Language = 'en' | 'ar';

// Auth State Types
export interface AuthState {
  isAuthenticated: boolean;
  user: ServiceProvider | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
