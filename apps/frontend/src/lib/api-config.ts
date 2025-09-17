import { CONFIG } from "./config";

// API Configuration
export const API_CONFIG = {
  BASE_URL: CONFIG.API_BASE_URL,
  DEFAULT_LANGUAGE: CONFIG.DEFAULT_LANGUAGE,
  RETRY_ATTEMPTS: CONFIG.RETRY_ATTEMPTS,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  SIGNUP: "/service-provider/signup",
  SIGNIN: "/service-provider/login",

  // Profile Setup Steps
  STEP1: "/service-provider/step1",
  STEP2: "/service-provider/step2",
  STEP3: "/service-provider/step3",
  STEP4: "/service-provider/step4",
  STEP5: "/service-provider/step5",
  STEP6: "/service-provider/step6",
  STEP7: "/service-provider/step7",

  // Services
  SERVICES: "/service",

  // Profile
  PROFILE: "/service-provider/profile",

  // Jobs
  JOBS: "/job",
  JOB_DETAIL: "/job",
  SERVICE_PROVIDER_JOBS: "/job/service-provider-jobs",

  // Bids
  BID: "/bid",
  MY_BIDS: "/bid/my-bids",

  // Job Completion Requests
  JOB_COMPLETION_REQUEST: "/job-completion-request",
  MY_COMPLETION_REQUESTS: "/job-completion-request/my-requests",
} as const;

// Request Headers
export const getHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});

// Form Data Headers (for file uploads)
export const getFormHeaders = (token?: string) => ({
  ...(token && { Authorization: `Bearer ${token}` }),
});

// Language parameter helper
export const getLanguageParam = (lang: any = API_CONFIG.DEFAULT_LANGUAGE) =>
  `?lang=${lang}`;
