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
  AdminLoginRequest,
  AdminLoginResponse,
  AdminSummaryResponse,
  AdminUserStatsResponse,
  AdminTopServiceProvidersResponse,
  AdminServiceProviderStatsResponse,
  AdminPaginatedResponse,
  AdminHomeownerRow,
  AdminLeaderRow,
  AdminServiceProviderRow,
  AdminUpdateBlockStatusRequest,
  AdminUpdateBlockStatusResponse,
  AdminUpdateServiceProviderBlockStatusResponse,
  AdminUpdateVerificationStatusRequest,
  AdminUpdateVerificationStatusResponse,
  AdminUserDetailResponse,
  AdminServiceProviderDetailResponse,
} from '@/types/api';

// Custom base query with error handling
const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  prepareHeaders: (headers, { endpoint }) => {
    if (typeof window === 'undefined') {
      return headers;
    }

    const endpointName = endpoint ?? '';
    const isAdminEndpoint = endpointName.toLowerCase().includes('admin');
    const tokenKey = isAdminEndpoint ? 'adminToken' : 'token';
    const token = localStorage.getItem(tokenKey);

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
    'AdminSummary',
    'AdminUserStats',
    'AdminTopProviders',
    'AdminHomeowners',
    'AdminLeaders',
    'AdminServiceProviders',
    'AdminServiceProviderStats',
    'AdminUserDetail',
    'AdminServiceProviderDetail',
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

    // Admin Authentication
    adminLogin: builder.mutation<
      AdminLoginResponse,
      { body: AdminLoginRequest; lang: Language }
    >({
      query: ({ body, lang }) => ({
        url: `${API_ENDPOINTS.ADMIN_LOGIN}${getLanguageParam(lang)}`,
        method: 'POST',
        body,
        headers: getHeaders(),
      }),
      invalidatesTags: [
        'AdminSummary',
        'AdminUserStats',
        'AdminTopProviders',
        'AdminHomeowners',
        'AdminLeaders',
        'AdminServiceProviders',
      ],
    }),

    // Admin Dashboard
    getAdminSummary: builder.query<AdminSummaryResponse, Language | void>({
      query: (lang = API_CONFIG.DEFAULT_LANGUAGE as Language) =>
        `${API_ENDPOINTS.ADMIN_SUMMARY}${getLanguageParam(lang)}`,
      providesTags: ['AdminSummary'],
    }),

    getAdminUserStats: builder.query<
      AdminUserStatsResponse,
      { lang: Language; filter: 'weekly' | 'monthly' | 'yearly' }
    >({
      query: ({ lang, filter }) => {
        const params = new URLSearchParams();
        params.append('lang', lang);
        params.append('filter', filter);
        return `${API_ENDPOINTS.ADMIN_USER_STATS}?${params.toString()}`;
      },
      providesTags: ['AdminUserStats'],
    }),

    getAdminTopServiceProviders: builder.query<
      AdminTopServiceProvidersResponse,
      Language | void
    >({
      query: (lang = API_CONFIG.DEFAULT_LANGUAGE as Language) =>
        `${API_ENDPOINTS.ADMIN_TOP_SERVICE_PROVIDERS}${getLanguageParam(lang)}`,
      providesTags: ['AdminTopProviders'],
    }),

    getAdminServiceProviderStats: builder.query<
      AdminServiceProviderStatsResponse,
      { lang: Language; filter: 'weekly' | 'monthly' | 'yearly' }
    >({
      query: ({ lang, filter }) => {
        const params = new URLSearchParams();
        params.append('lang', lang);
        params.append('filter', filter);
        return `${API_ENDPOINTS.ADMIN_SERVICE_PROVIDER_STATS}?${params.toString()}`;
      },
      providesTags: ['AdminServiceProviderStats'],
    }),

    getAdminUserDetail: builder.query<
      AdminUserDetailResponse,
      { id: string; lang: Language }
    >({
      query: ({ id, lang }) =>
        `${API_ENDPOINTS.ADMIN_USERS}/${id}${getLanguageParam(lang)}`,
      providesTags: ['AdminHomeowners', 'AdminLeaders'],
    }),

    getAdminServiceProviderDetail: builder.query<
      AdminServiceProviderDetailResponse,
      { id: string; lang: Language }
    >({
      query: ({ id, lang }) =>
        `${API_ENDPOINTS.ADMIN_SERVICE_PROVIDERS}/${id}${getLanguageParam(lang)}`,
      providesTags: ['AdminServiceProviders', 'AdminTopProviders'],
    }),

    // Admin Tables
    getAdminHomeowners: builder.query<
      AdminPaginatedResponse<AdminHomeownerRow>,
      { lang: Language; page: number; limit: number; search?: string }
    >({
      query: ({ lang, page, limit, search }) => {
        const params = new URLSearchParams();
        params.append('lang', lang);
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (search) {
          params.append('search', search);
        }

        return `${API_ENDPOINTS.ADMIN_HOMEOWNERS}?${params.toString()}`;
      },
      providesTags: ['AdminHomeowners'],
    }),

    getAdminLeaders: builder.query<
      AdminPaginatedResponse<AdminLeaderRow>,
      { lang: Language; page: number; limit: number; search?: string }
    >({
      query: ({ lang, page, limit, search }) => {
        const params = new URLSearchParams();
        params.append('lang', lang);
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (search) {
          params.append('search', search);
        }

        return `${API_ENDPOINTS.ADMIN_HOA_LEADERS}?${params.toString()}`;
      },
      providesTags: ['AdminLeaders'],
    }),

    getAdminServiceProviders: builder.query<
      AdminPaginatedResponse<AdminServiceProviderRow>,
      { lang: Language; page: number; limit: number; search?: string }
    >({
      query: ({ lang, page, limit, search }) => {
        const params = new URLSearchParams();
        params.append('lang', lang);
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (search) {
          params.append('search', search);
        }

        return `${API_ENDPOINTS.ADMIN_SERVICE_PROVIDERS}?${params.toString()}`;
      },
      providesTags: ['AdminServiceProviders', 'AdminTopProviders'],
    }),

    getAdminUnverifiedServiceProviders: builder.query<
      AdminPaginatedResponse<AdminServiceProviderRow>,
      { lang: Language; page: number; limit: number; search?: string }
    >({
      query: ({ lang, page, limit, search }) => {
        const params = new URLSearchParams();
        params.append('lang', lang);
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (search) {
          params.append('search', search);
        }

        return `${API_ENDPOINTS.ADMIN_SERVICE_PROVIDERS_PENDING}?${params.toString()}`;
      },
      providesTags: ['AdminServiceProviders', 'AdminTopProviders'],
    }),

    updateAdminUserBlockStatus: builder.mutation<
      AdminUpdateBlockStatusResponse,
      { id: string; body: AdminUpdateBlockStatusRequest; lang: Language }
    >({
      query: ({ id, body, lang }) => ({
        url: `${API_ENDPOINTS.ADMIN_USERS}/${id}/block${getLanguageParam(lang)}`,
        method: 'PATCH',
        body,
        headers: getHeaders(),
      }),
      invalidatesTags: ['AdminHomeowners', 'AdminLeaders'],
    }),

    updateAdminServiceProviderBlockStatus: builder.mutation<
      AdminUpdateServiceProviderBlockStatusResponse,
      { id: string; body: AdminUpdateBlockStatusRequest; lang: Language }
    >({
      query: ({ id, body, lang }) => ({
        url: `${API_ENDPOINTS.ADMIN_SERVICE_PROVIDERS}/${id}/block${getLanguageParam(
          lang
        )}`,
        method: 'PATCH',
        body,
        headers: getHeaders(),
      }),
      invalidatesTags: [
        'AdminServiceProviders',
        'AdminTopProviders',
        'AdminServiceProviderStats',
        'AdminServiceProviderDetail',
      ],
    }),

    updateAdminServiceProviderVerificationStatus: builder.mutation<
      AdminUpdateVerificationStatusResponse,
      { id: string; body: AdminUpdateVerificationStatusRequest; lang: Language }
    >({
      query: ({ id, body, lang }) => ({
        url: `${API_ENDPOINTS.ADMIN_SERVICE_PROVIDERS}/${id}/verify${getLanguageParam(
          lang
        )}`,
        method: 'PATCH',
        body,
        headers: getHeaders(),
      }),
      invalidatesTags: [
        'AdminServiceProviders',
        'AdminTopProviders',
        'AdminServiceProviderStats',
        'AdminServiceProviderDetail',
      ],
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
  useAdminLoginMutation,
  useGetAdminSummaryQuery,
  useGetAdminUserStatsQuery,
  useGetAdminTopServiceProvidersQuery,
  useGetAdminServiceProviderStatsQuery,
  useGetAdminUserDetailQuery,
  useGetAdminServiceProviderDetailQuery,
  useGetAdminHomeownersQuery,
  useGetAdminLeadersQuery,
  useGetAdminServiceProvidersQuery,
  useGetAdminUnverifiedServiceProvidersQuery,
  useUpdateAdminUserBlockStatusMutation,
  useUpdateAdminServiceProviderBlockStatusMutation,
  useUpdateAdminServiceProviderVerificationStatusMutation,
} = api;
