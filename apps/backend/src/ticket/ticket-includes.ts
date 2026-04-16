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

/** List view: hoa summary + creator */
export const ticketListInclude: Prisma.TicketInclude = {
  hoa: { select: hoaSummarySelect },
  creator: { select: userSummarySelect },
};

/** Detail view: hoa summary + creator + reviewer */
export const ticketDetailInclude: Prisma.TicketInclude = {
  hoa: { select: hoaSummarySelect },
  creator: { select: userSummarySelect },
  reviewer: { select: userSummarySelect },
};

/** After create: hoa + creator (no reviewer yet) */
export const ticketCreatedInclude: Prisma.TicketInclude = {
  hoa: { select: hoaSummarySelect },
  creator: { select: userSummarySelect },
};

/** After approve/reject: full parties */
export const ticketWithFullPartiesInclude: Prisma.TicketInclude = {
  hoa: { select: hoaSummarySelect },
  creator: { select: userSummarySelect },
  reviewer: { select: userSummarySelect },
};
