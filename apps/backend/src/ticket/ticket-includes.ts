import type { Prisma } from '@prisma/client';

const hoaSummarySelect = {
  id: true,
  name: true,
  hoaNumber: true,
  city: true,
} satisfies Prisma.HoaSelect;

const userSummarySelect = {
  id: true,
  nationalId: true,
  role: true,
} satisfies Prisma.UserSelect;

const serviceSummarySelect = {
  id: true,
  name: true,
  description: true,
  image: true,
} satisfies Prisma.ServiceSelect;

/** List view: hoa summary + creator + service */
export const ticketListInclude: Prisma.TicketInclude = {
  hoa: { select: hoaSummarySelect },
  creator: { select: userSummarySelect },
  service: { select: serviceSummarySelect },
};

/** Detail view: hoa summary + creator + reviewer + service */
export const ticketDetailInclude: Prisma.TicketInclude = {
  hoa: { select: hoaSummarySelect },
  creator: { select: userSummarySelect },
  reviewer: { select: userSummarySelect },
  service: { select: serviceSummarySelect },
};

/** After create: hoa + creator + service (no reviewer yet) */
export const ticketCreatedInclude: Prisma.TicketInclude = {
  hoa: { select: hoaSummarySelect },
  creator: { select: userSummarySelect },
  service: { select: serviceSummarySelect },
};

/** After approve/reject: full parties + service */
export const ticketWithFullPartiesInclude: Prisma.TicketInclude = {
  hoa: { select: hoaSummarySelect },
  creator: { select: userSummarySelect },
  reviewer: { select: userSummarySelect },
  service: { select: serviceSummarySelect },
};
