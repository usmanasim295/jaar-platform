import type { Prisma } from '@prisma/client';

type JobBidsArgs = NonNullable<Prisma.JobInclude['bids']>;

/** Job → services → service */
export const jobServicesInclude = {
  services: { include: { service: true } },
} satisfies Prisma.JobInclude;

export const hoaSummarySelect = {
  id: true,
  name: true,
  hoaNumber: true,
  city: true,
} satisfies Prisma.HoaSelect;

export const hoaDetailSelect = {
  ...hoaSummarySelect,
  address: true,
} satisfies Prisma.HoaSelect;

export const userSummarySelect = {
  id: true,
  nationalId: true,
  role: true,
} satisfies Prisma.UserSelect;

const serviceProviderBidBasic = {
  id: true,
  name: true,
  rating: true,
  totalJobs: true,
} satisfies Prisma.ServiceProviderSelect;

const serviceProviderBidFull = {
  ...serviceProviderBidBasic,
  totalEarnings: true,
} satisfies Prisma.ServiceProviderSelect;

export const bidsOrderedAsc = (
  providerSelect:
    | typeof serviceProviderBidBasic
    | typeof serviceProviderBidFull = serviceProviderBidBasic,
): JobBidsArgs => ({
  include: {
    serviceProvider: { select: providerSelect },
  },
  orderBy: { totalPrice: 'asc' },
});

/** HOA with leader UserHOA rows (for community approve/reject). */
export const hoaWithLeadersInclude = {
  userHOAs: {
    where: { isLeader: true },
    include: { user: true },
  },
} satisfies Prisma.HoaInclude;

const serviceQuestionAnswersInclude = {
  serviceQuestionAnswers: {
    include: {
      serviceQuestion: {
        include: { service: true },
      },
    },
  },
} satisfies Prisma.JobInclude;

/** Standard list/detail: services, hoa summary, leader, creator, bids (full provider). */
export const jobListInclude: Prisma.JobInclude = {
  ...jobServicesInclude,
  hoa: { select: hoaSummarySelect },
  leader: { select: userSummarySelect },
  creator: { select: userSummarySelect },
  bids: bidsOrderedAsc(serviceProviderBidFull),
  ...serviceQuestionAnswersInclude,
};

/** Public job listing (findAll): includes creator; bids use basic provider fields. */
export const jobPublicListInclude: Prisma.JobInclude = {
  ...jobServicesInclude,
  hoa: { select: hoaSummarySelect },
  leader: { select: userSummarySelect },
  creator: { select: userSummarySelect },
  bids: bidsOrderedAsc(serviceProviderBidBasic),
  ...serviceQuestionAnswersInclude,
};

/** Single job detail: hoa includes address; bids ordered with full provider; RFQ answers included. */
export const jobDetailInclude: Prisma.JobInclude = {
  ...jobServicesInclude,
  hoa: { select: hoaDetailSelect },
  leader: { select: userSummarySelect },
  bids: bidsOrderedAsc(serviceProviderBidFull),
  ...serviceQuestionAnswersInclude,
};

/** Leader’s job list: no creator on primary query (matches previous behavior). */
export const jobByLeaderInclude: Prisma.JobInclude = {
  ...jobServicesInclude,
  hoa: { select: hoaSummarySelect },
  bids: bidsOrderedAsc(serviceProviderBidFull),
};

/** By apartment: services, hoa, leader, bids (basic provider). */
export const jobByApartmentInclude: Prisma.JobInclude = {
  ...jobServicesInclude,
  hoa: { select: hoaSummarySelect },
  leader: { select: userSummarySelect },
  bids: bidsOrderedAsc(serviceProviderBidBasic),
};

/** Pending community jobs for leader: services, hoa, creator only. */
export const jobPendingCommunityInclude: Prisma.JobInclude = {
  ...jobServicesInclude,
  hoa: { select: hoaSummarySelect },
  creator: { select: userSummarySelect },
};

/** Create/update response: services, hoa, leader (no bids). */
export const jobWithHoaLeaderInclude: Prisma.JobInclude = {
  ...jobServicesInclude,
  hoa: { select: hoaSummarySelect },
  leader: { select: userSummarySelect },
};

/** Create success payload includes creator. */
export const jobCreatedInclude: Prisma.JobInclude = {
  ...jobWithHoaLeaderInclude,
  creator: { select: userSummarySelect },
};

/** Approve/reject/update status: services, hoa, leader, creator. */
export const jobWithFullPartiesInclude: Prisma.JobInclude = {
  ...jobServicesInclude,
  hoa: { select: hoaSummarySelect },
  leader: { select: userSummarySelect },
  creator: { select: userSummarySelect },
};

/** Jobs where this provider has an accepted bid (+ completion requests). */
export function serviceProviderAcceptedJobsInclude(
  serviceProviderId: string,
): Prisma.JobInclude {
  return {
    ...jobServicesInclude,
    hoa: { select: hoaSummarySelect },
    leader: { select: userSummarySelect },
    creator: { select: userSummarySelect },
    bids: {
      where: {
        serviceProviderId,
        status: 'ACCEPTED',
      },
      include: {
        serviceProvider: { select: serviceProviderBidFull },
      },
    },
    completionRequests: {
      where: { serviceProviderId },
      include: {
        reviewer: { select: userSummarySelect },
      },
    },
  };
}
