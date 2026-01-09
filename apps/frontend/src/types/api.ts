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
  startDate: string;
  endDate: string;
  timeSlot: string;
  experienceLevel: string | null;
  apartmentId: string;
  leaderId: string | null;
  createdBy: string;
  jobType: 'COMMUNITY_SERVICE' | 'HOME_SERVICE';
  status:
    | 'SENT_TO_LEADER'
    | 'POSTED_BY_LEADER'
    | 'OPEN'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';
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
    startDate: string;
    endDate: string;
    timeSlot: {
      ar: string;
      en: string;
    };
    experienceLevel?: {
      ar: string;
      en: string;
    } | null;
    apartmentId: string;
    leaderId: string | null;
    createdBy: string;
    jobType: 'HOME_SERVICE' | 'COMMUNITY_SERVICE';
    status:
      | 'SENT_TO_LEADER'
      | 'POSTED_BY_LEADER'
      | 'OPEN'
      | 'IN_PROGRESS'
      | 'COMPLETED'
      | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
    services: Array<{
      id: string;
      jobId: string;
      serviceId: string;
      service: {
        id: string;
        name: {
          ar: string;
          en: string;
        };
        description: {
          ar: string;
          en: string;
        };
        image: string | null;
      };
    }>;
    apartment?: {
      id: string;
      name: {
        ar: string;
        en: string;
      };
      city: {
        ar: string;
        en: string;
      };
      hoaNumber: string;
    };
    leader: {
      id: string;
      nationalId: string;
      role: 'LEADER' | 'HOME_OWNER' | 'ADMIN';
    } | null;
    creator: {
      id: string;
      nationalId: string;
      role: 'LEADER' | 'HOME_OWNER' | 'ADMIN';
    };
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
      startDate: string;
      endDate: string;
      timeSlot: {
        ar: string;
        en: string;
      };
      experienceLevel?: {
        ar: string;
        en: string;
      } | null;
      apartmentId: string;
      leaderId: string;
      createdBy: string;
      jobType: 'COMMUNITY_SERVICE' | 'HOME_SERVICE';
      status:
        | 'SENT_TO_LEADER'
        | 'POSTED_BY_LEADER'
        | 'OPEN'
        | 'IN_PROGRESS'
        | 'COMPLETED'
        | 'CANCELLED';
      createdAt: string;
      updatedAt: string;
      services: Array<{
        id: string;
        jobId: string;
        serviceId: string;
        service: {
          id: string;
          name: {
            ar: string;
            en: string;
          };
          description: {
            ar: string;
            en: string;
          };
          image: string | null;
        };
      }>;
      apartment?: {
        id: string;
        name: {
          ar: string;
          en: string;
        };
        city: {
          ar: string;
          en: string;
        };
      };
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
    startDate: string;
    endDate: string;
    timeSlot: {
      ar: string;
      en: string;
    };
    experienceLevel?: {
      ar: string;
      en: string;
    } | null;
    apartmentId: string;
    leaderId: string | null;
    createdBy: string;
    jobType: 'COMMUNITY_SERVICE' | 'HOME_SERVICE';
    status:
      | 'SENT_TO_LEADER'
      | 'POSTED_BY_LEADER'
      | 'OPEN'
      | 'IN_PROGRESS'
      | 'COMPLETED'
      | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
    services: Array<{
      id: string;
      jobId: string;
      serviceId: string;
      service: {
        id: string;
        name: {
          ar: string;
          en: string;
        };
        description: {
          ar: string;
          en: string;
        };
        image: string | null;
      };
    }>;
    apartment: {
      id: string;
      name: {
        ar: string;
        en: string;
      };
      city: {
        ar: string;
        en: string;
      };
    };
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

// Admin Types
export interface AdminInfo {
  id: string;
  email: string;
  createdAt: string;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  admin: AdminInfo | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  admin: AdminInfo;
  message: string;
}

export interface AdminSummaryResponse {
  totals: {
    homeOwners: number;
    leaders: number;
    serviceProviders: number;
  };
  message: string;
}

export interface AdminUserStatsResponse {
  filter: 'weekly' | 'monthly' | 'yearly';
  homeOwners: number;
  leaders: number;
  total: number;
  message: string;
}

export interface AdminServiceProviderRow {
  id: string;
  name: string;
  email: string;
  rating: number;
  totalEarnings: number;
  completedJobs: number;
  status: string;
  isBlocked: boolean;
  isVerified: boolean;
  createdDate: string;
}

export interface AdminTopServiceProvidersResponse {
  providers: AdminServiceProviderRow[];
  message: string;
}

export interface AdminServiceProviderStatsPoint {
  date: string;
  count: number;
}

export interface AdminServiceProviderStatsResponse {
  filter: 'weekly' | 'monthly' | 'yearly';
  total: number;
  data: AdminServiceProviderStatsPoint[];
  message: string;
}

export interface AdminUserDetailJob {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  services: { id: string; name: string }[];
}

export interface AdminUserOwnedProperty {
  id: string;
  houseNumber: string | null;
  apartmentName: string;
  city: string;
  community: string;
  createdAt: string;
}

export interface AdminUserManagedCommunity {
  id: string;
  name: string;
  city: string;
  community: string;
  jobsCount: number;
}

export interface AdminUserDetailData {
  id: string;
  role: string;
  nationalId: string;
  status: string;
  isBlocked: boolean;
  createdAt: string;
  documents: string[];
  stats: {
    totalJobs: number;
    totalOngoingJobs: number;
    totalCompletedJobs: number;
  };
  ownedHouses: AdminUserOwnedProperty[];
  managedApartments: AdminUserManagedCommunity[];
  createdJobs: AdminUserDetailJob[];
}

export interface AdminUserDetailResponse {
  data: AdminUserDetailData;
  message: string;
}

export interface AdminServiceProviderRecentCompletion {
  id: string;
  status: string;
  submittedAt: string;
  job: AdminUserDetailJob | null;
}

export interface AdminServiceProviderDetailData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  bio: string;
  email: string;
  phoneNumber: string;
  status: string;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
  rating: number;
  totalJobs: number;
  totalEarnings: number;
  documents: {
    government?: string | null;
    bank?: string | null;
    profilePicture?: string | null;
  };
  stats: {
    totalJobs: number;
    completedJobs: number;
    pendingJobs: number;
  };
  services: { id: string; name: string }[];
  serviceRates: {
    id: string;
    name: string;
    rate: string;
    description?: string | null;
  }[];
  locations: {
    id: string;
    city: string;
    state?: string | null;
    country: string;
    isActive: boolean;
  }[];
  recentCompletions: AdminServiceProviderRecentCompletion[];
}

export interface AdminServiceProviderDetailResponse {
  data: AdminServiceProviderDetailData;
  message: string;
}

export interface AdminPaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminPaginatedResponse<T> {
  data: T[];
  meta: AdminPaginatedMeta;
  message: string;
}

export interface AdminHomeownerRow {
  id: string;
  name: string;
  createdDate: string;
  apartments: number;
  status: string;
  isBlocked: boolean;
  deletedAt?: string;
}

export interface AdminLeaderRow {
  id: string;
  name: string;
  createdDate: string;
  apartments: number;
  communityId: string | null;
  status: string;
  isBlocked: boolean;
  deletedAt?: string;
}

export interface AdminUpdateBlockStatusRequest {
  isBlocked: boolean;
}

export interface AdminUpdateBlockStatusResponse {
  message: string;
  user: {
    id: string;
    role: string;
    isBlocked: boolean;
  };
}

export interface AdminUpdateServiceProviderBlockStatusResponse {
  message: string;
  serviceProvider: AdminServiceProviderRow;
}

export interface AdminUpdateVerificationStatusRequest {
  isVerified: boolean;
}

export interface AdminUpdateVerificationStatusResponse {
  message: string;
  serviceProvider: AdminServiceProviderRow;
}
