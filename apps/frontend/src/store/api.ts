import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  API_CONFIG,
  API_ENDPOINTS,
  getHeaders,
  getFormHeaders,
  getLanguageParam,
} from '@/lib/api-config';
import i18n from '@/i18n';
import type {
  SignupRequest,
  SignupResponse,
  SigninRequest,
  SigninResponse,
  Service,
  ServiceProvider,
  Step1Request,
  Step2Request,
  Step3Request,
  StepResponse,
  Language,
  ApiError,
  Job,
  BidRequest,
  BidResponse,
  MyBid,
  DeleteBidResponse,
  ServiceProviderJobsResponse,
  JobCompletionRequest,
  JobCompletionRequestSubmit,
  JobCompletionRequestResponse,
} from '@/types/api';

// Custom base query with error handling
const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from localStorage or state
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Custom base query without retry logic for better error handling
const baseQueryWithErrorHandling = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  const result = await baseQuery(args, api, extraOptions);

  // Transform error for better handling
  if (result.error) {
    // Handle specific HTTP status codes
    if (result.error.status === 413) {
      return {
        ...result,
        error: {
          ...result.error,
          data: {
            message:
              typeof window !== 'undefined'
                ? i18n.t('File too large. Please choose a smaller file.')
                : 'File too large. Please choose a smaller file.',
            status: 413,
          },
        },
      };
    }

    if (result.error.status === 400) {
      return {
        ...result,
        error: {
          ...result.error,
          data: {
            message:
              typeof window !== 'undefined'
                ? i18n.t('Invalid request. Please check your input.')
                : 'Invalid request. Please check your input.',
            status: 400,
          },
        },
      };
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    'ServiceProvider',
    'Services',
    'Profile',
    'Jobs',
    'MyBids',
    'CompletionRequests',
  ],
  endpoints: builder => ({
    // Authentication endpoints
    signUp: builder.mutation<
      SignupResponse,
      { body: SignupRequest; lang: Language }
    >({
      query: ({ body, lang }) => ({
        url: `${API_ENDPOINTS.SIGNUP}${getLanguageParam(lang)}`,
        method: 'POST',
        body,
        headers: getHeaders(),
      }),
      invalidatesTags: ['ServiceProvider'],
    }),

    signIn: builder.mutation<
      SigninResponse,
      { body: SigninRequest; lang: Language }
    >({
      query: ({ body, lang }) => ({
        url: `${API_ENDPOINTS.SIGNIN}${getLanguageParam(lang)}`,
        method: 'POST',
        body,
        headers: getHeaders(),
      }),
      invalidatesTags: [
        'ServiceProvider',
        'Profile',
        'Jobs',
        'MyBids',
        'CompletionRequests',
      ],
    }),

    // Profile setup steps
    uploadDocument: builder.mutation<
      StepResponse,
      { data: Step1Request; lang: Language }
    >({
      query: ({ data, lang }) => {
        const formData = new FormData();
        formData.append('serviceProviderId', data.serviceProviderId);
        formData.append('document', data.document);

        return {
          url: `${API_ENDPOINTS.STEP1}${getLanguageParam(lang)}`,
          method: 'POST',
          body: formData,
          headers: getFormHeaders(),
        };
      },
      invalidatesTags: ['ServiceProvider'],
    }),

    selectServices: builder.mutation<
      StepResponse,
      { data: Step2Request; lang: Language }
    >({
      query: ({ data, lang }) => ({
        url: `${API_ENDPOINTS.STEP2}${getLanguageParam(lang)}`,
        method: 'POST',
        body: data,
        headers: getHeaders(),
      }),
      invalidatesTags: ['ServiceProvider'],
    }),

    setServiceRates: builder.mutation<
      StepResponse,
      { data: Step3Request; lang: Language }
    >({
      query: ({ data, lang }) => ({
        url: `${API_ENDPOINTS.STEP3}${getLanguageParam(lang)}`,
        method: 'POST',
        body: data,
        headers: getHeaders(),
      }),
      invalidatesTags: ['ServiceProvider'],
    }),

    // Generic step mutation for steps 4-7
    updateProfileStep: builder.mutation<
      StepResponse,
      {
        step: number;
        data: any;
        lang: Language;
      }
    >({
      query: ({ step, data, lang }) => {
        // Map step numbers to correct endpoints
        const stepEndpoints = {
          4: API_ENDPOINTS.STEP4,
          5: API_ENDPOINTS.STEP5,
          6: API_ENDPOINTS.STEP6,
          7: API_ENDPOINTS.STEP7,
        };

        const endpoint =
          stepEndpoints[step as keyof typeof stepEndpoints] ||
          API_ENDPOINTS.STEP4;

        // Use form headers for file uploads (steps 5, 6, 7)
        const isFileUpload = step >= 5;

        return {
          url: `${endpoint}${getLanguageParam(lang)}`,
          method: 'POST',
          body: data,
          headers: isFileUpload ? getFormHeaders() : getHeaders(),
        };
      },
      invalidatesTags: ['ServiceProvider'],
    }),

    // Services
    getServices: builder.query<Service[], Language>({
      query: (lang = API_CONFIG.DEFAULT_LANGUAGE as Language) =>
        `${API_ENDPOINTS.SERVICES}${getLanguageParam(lang)}`,
      providesTags: ['Services'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Profile
    getProfile: builder.query<
      ServiceProvider,
      { serviceProviderId: string; lang: Language }
    >({
      query: ({
        serviceProviderId,
        lang = API_CONFIG.DEFAULT_LANGUAGE as Language,
      }) =>
        `${API_ENDPOINTS.PROFILE}/${serviceProviderId}${getLanguageParam(lang)}`,
      providesTags: (result, error, { serviceProviderId }) => [
        { type: 'Profile', id: serviceProviderId },
      ],
    }),

    // Jobs
    getJobs: builder.query<Job[], Language>({
      query: (lang = API_CONFIG.DEFAULT_LANGUAGE as Language) =>
        `${API_ENDPOINTS.JOBS}${getLanguageParam(lang)}`,
      providesTags: ['Jobs'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    getJobById: builder.query<Job, { jobId: string; lang: Language }>({
      query: ({ jobId, lang = API_CONFIG.DEFAULT_LANGUAGE as Language }) =>
        `${API_ENDPOINTS.JOB_DETAIL}/${jobId}${getLanguageParam(lang)}`,
      providesTags: ['Jobs'],
    }),

    // Service Provider Jobs
    getServiceProviderJobs: builder.query<
      Job[],
      {
        lang: Language;
        jobType?: 'HOME_SERVICE' | 'COMMUNITY_SERVICE';
        status?: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OPEN';
      }
    >({
      query: ({
        lang = API_CONFIG.DEFAULT_LANGUAGE as Language,
        jobType,
        status,
      }) => {
        const params = new URLSearchParams();
        params.append('lang', lang);
        if (jobType) params.append('jobType', jobType);
        if (status) params.append('status', status);

        return `${API_ENDPOINTS.SERVICE_PROVIDER_JOBS}?${params.toString()}`;
      },
      providesTags: ['Jobs'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Bids
    submitBid: builder.mutation<
      BidResponse,
      { bidData: BidRequest; lang: Language }
    >({
      query: ({ bidData, lang }) => {
        const formData = new FormData();
        formData.append('jobId', bidData.jobId);
        formData.append('totalPrice', bidData.totalPrice);
        formData.append('coverLetter', bidData.coverLetter);
        if (bidData.document) {
          formData.append('document', bidData.document);
        }

        return {
          url: `${API_ENDPOINTS.BID}${getLanguageParam(lang)}`,
          method: 'POST',
          body: formData,
          headers: getFormHeaders(),
        };
      },
      invalidatesTags: ['Jobs', 'MyBids'],
    }),

    getMyBids: builder.query<MyBid[], Language>({
      query: (lang = API_CONFIG.DEFAULT_LANGUAGE as Language) =>
        `${API_ENDPOINTS.MY_BIDS}${getLanguageParam(lang)}`,
      providesTags: ['MyBids'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    deleteBid: builder.mutation<
      DeleteBidResponse,
      { bidId: string; lang: Language }
    >({
      query: ({ bidId, lang = API_CONFIG.DEFAULT_LANGUAGE as Language }) => ({
        url: `${API_ENDPOINTS.BID}/${bidId}${getLanguageParam(lang)}`,
        method: 'DELETE',
        headers: getHeaders(),
      }),
      invalidatesTags: ['MyBids'],
    }),

    // Initiate chat from bid
    initiateChat: builder.mutation<any, { jobId: string; lang: Language }>({
      query: ({ jobId, lang = API_CONFIG.DEFAULT_LANGUAGE as Language }) => ({
        url: `${API_ENDPOINTS.INITIATE_CHAT}${getLanguageParam(lang)}`,
        method: 'POST',
        body: { jobId },
        headers: getHeaders(),
      }),
    }),

    // Job Completion Requests
    submitJobCompletionRequest: builder.mutation<
      JobCompletionRequestResponse,
      {
        completionData: JobCompletionRequestSubmit;
        lang: Language;
      }
    >({
      query: ({ completionData, lang }) => {
        const formData = new FormData();
        formData.append('jobId', completionData.jobId);
        formData.append('completionNotes', completionData.completionNotes);

        if (completionData.completionImages) {
          completionData.completionImages.forEach((image, index) => {
            formData.append('completionImages', image);
          });
        }

        if (completionData.additionalDocument) {
          formData.append(
            'additionalDocument',
            completionData.additionalDocument
          );
        }

        return {
          url: `${API_ENDPOINTS.JOB_COMPLETION_REQUEST}${getLanguageParam(lang)}`,
          method: 'POST',
          body: formData,
          headers: getFormHeaders(),
        };
      },
      invalidatesTags: ['CompletionRequests', 'Jobs'],
    }),

    getMyCompletionRequests: builder.query<
      JobCompletionRequest[],
      {
        lang: Language;
        jobType?: 'HOME_SERVICE' | 'COMMUNITY_SERVICE';
        status?: 'PENDING' | 'APPROVED' | 'REJECTED';
      }
    >({
      query: ({
        lang = API_CONFIG.DEFAULT_LANGUAGE as Language,
        jobType,
        status,
      }) => {
        const params = new URLSearchParams();
        params.append('lang', lang);
        if (jobType) params.append('jobType', jobType);
        if (status) params.append('status', status);

        return `${API_ENDPOINTS.MY_COMPLETION_REQUESTS}?${params.toString()}`;
      },
      providesTags: ['CompletionRequests'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
  }),
});

export const {
  useSignUpMutation,
  useSignInMutation,
  useUploadDocumentMutation,
  useSelectServicesMutation,
  useSetServiceRatesMutation,
  useUpdateProfileStepMutation,
  useGetServicesQuery,
  useGetProfileQuery,
  useGetJobsQuery,
  useGetJobByIdQuery,
  useGetServiceProviderJobsQuery,
  useSubmitBidMutation,
  useGetMyBidsQuery,
  useDeleteBidMutation,
  useInitiateChatMutation,
  useSubmitJobCompletionRequestMutation,
  useGetMyCompletionRequestsQuery,
} = api;
