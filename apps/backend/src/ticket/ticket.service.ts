import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketPaginationQueryDto } from './dto/ticket-pagination-query.dto';
import { TicketStatus, Prisma } from '@prisma/client';
import { TranslationService } from '../common/services/translation.service';
import { MessageService } from '../common/services/message.service';
import {
  ticketCreatedInclude,
  ticketListInclude,
  ticketDetailInclude,
  ticketWithFullPartiesInclude,
} from './ticket-includes';

type Lang = 'en' | 'ar';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
    private messageService: MessageService,
  ) {}

  async create(
    createTicketDto: CreateTicketDto,
    userId: string,
    userRole: string,
    language: Lang = 'en',
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userHOAs: {
          include: { hoa: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('ticket.user_not_found', language),
      );
    }

    let hoaId: string;

    if (userRole === 'HOME_OWNER') {
      const userHOA = user.userHOAs.find((uh) => !uh.isLeader);
      if (!userHOA) {
        throw new BadRequestException(
          this.messageService.getErrorMessage(
            'ticket.hoa_not_linked',
            language,
          ),
        );
      }

      if (createTicketDto.hoaId && createTicketDto.hoaId !== userHOA.hoaId) {
        throw new ForbiddenException(
          this.messageService.getErrorMessage(
            'ticket.hoa_mismatch',
            language,
          ),
        );
      }

      hoaId = userHOA.hoaId;
    } else if (userRole === 'LEADER') {
      if (!createTicketDto.hoaId) {
        // Auto-resolve from leader's HOAs
        const leaderHOA = user.userHOAs.find((uh) => uh.isLeader);
        if (!leaderHOA) {
          throw new BadRequestException(
            this.messageService.getErrorMessage(
              'ticket.hoa_not_linked',
              language,
            ),
          );
        }
        hoaId = leaderHOA.hoaId;
      } else {
        // Validate leader owns this HOA
        const leaderHOA = user.userHOAs.find(
          (uh) => uh.hoaId === createTicketDto.hoaId && uh.isLeader,
        );
        if (!leaderHOA) {
          throw new ForbiddenException(
            this.messageService.getErrorMessage(
              'ticket.not_authorized_hoa',
              language,
            ),
          );
        }
        hoaId = leaderHOA.hoaId;
      }
    } else {
      throw new ForbiddenException(
        this.messageService.getErrorMessage('ticket.unauthorized', language),
      );
    }

    const service = await this.prisma.service.findUnique({
      where: { id: createTicketDto.serviceId },
    });

    if (!service) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('ticket.service_not_found', language),
      );
    }

    const [titleTranslations, descriptionTranslations] = await Promise.all([
      this.translationService.createTranslationObject(createTicketDto.title),
      this.translationService.createTranslationObject(
        createTicketDto.description,
      ),
    ]);

    const ticket = await this.prisma.ticket.create({
      data: {
        title: titleTranslations,
        description: descriptionTranslations,
        serviceId: createTicketDto.serviceId,
        priority: createTicketDto.priority,
        images: (createTicketDto as any).images ?? [],
        hoaId,
        createdBy: userId,
      },
      include: ticketCreatedInclude,
    });

    return {
      message: this.messageService.getSuccessMessage(
        'ticket.created',
        language,
      ),
      ticket,
    };
  }

  async findMyTickets(userId: string, query: TicketPaginationQueryDto) {
    const { skip, take, page, limit } = this.buildPagination(query);

    const where: Prisma.TicketWhereInput = { createdBy: userId };
    if (query.status) {
      where.status = query.status as TicketStatus;
    }
    if (query.serviceId) {
      where.serviceId = query.serviceId;
    }

    const [total, tickets] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        include: ticketListInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      data: tickets,
      meta: this.buildMeta(total, page, limit),
    };
  }

  async findPendingByLeader(
    leaderId: string,
    query: TicketPaginationQueryDto,
    language: Lang = 'en',
  ) {
    await this.requireLeaderRole(leaderId, language);
    const { skip, take, page, limit } = this.buildPagination(query);

    const where: Prisma.TicketWhereInput = {
      status: 'PENDING',
      hoa: {
        userHOAs: {
          some: {
            userId: leaderId,
            isLeader: true,
          },
        },
      },
    };

    const [total, tickets] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        include: ticketListInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      data: tickets,
      meta: this.buildMeta(total, page, limit),
    };
  }

  async findByHoa(
    hoaId: string,
    leaderId: string,
    query: TicketPaginationQueryDto,
    language: Lang = 'en',
  ) {
    await this.requireLeaderRole(leaderId, language);

    const leaderHOA = await this.prisma.userHOA.findFirst({
      where: {
        hoaId,
        userId: leaderId,
        isLeader: true,
      },
    });

    if (!leaderHOA) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'ticket.not_authorized_hoa',
          language,
        ),
      );
    }

    const { skip, take, page, limit } = this.buildPagination(query);

    const where: Prisma.TicketWhereInput = { hoaId };
    if (query.status) {
      where.status = query.status as TicketStatus;
    }
    if (query.serviceId) {
      where.serviceId = query.serviceId;
    }

    const [total, tickets] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        include: ticketListInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      data: tickets,
      meta: this.buildMeta(total, page, limit),
    };
  }

  async findOne(id: string, language: Lang = 'en') {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: ticketDetailInclude,
    });

    if (!ticket) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('ticket.not_found', language),
      );
    }

    return ticket;
  }

  async approve(
    ticketId: string,
    leaderId: string,
    updateTicketDto: UpdateTicketDto,
    language: Lang = 'en',
  ) {
    await this.requireLeaderRole(leaderId, language);
    await this.validateLeaderOwnsTicketHoa(ticketId, leaderId, language);

    const reasonTranslations = updateTicketDto.reason
      ? await this.translationService.createTranslationObject(
          updateTicketDto.reason,
        )
      : undefined;

    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'APPROVED',
        reviewedBy: leaderId,
        reason: reasonTranslations,
      },
      include: ticketWithFullPartiesInclude,
    });

    return {
      message: this.messageService.getSuccessMessage(
        'ticket.approved',
        language,
      ),
      ticket,
    };
  }

  async reject(
    ticketId: string,
    leaderId: string,
    updateTicketDto: UpdateTicketDto,
    language: Lang = 'en',
  ) {
    await this.requireLeaderRole(leaderId, language);
    await this.validateLeaderOwnsTicketHoa(ticketId, leaderId, language);

    const reasonTranslations = updateTicketDto.reason
      ? await this.translationService.createTranslationObject(
          updateTicketDto.reason,
        )
      : undefined;

    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'REJECTED',
        reviewedBy: leaderId,
        reason: reasonTranslations,
      },
      include: ticketWithFullPartiesInclude,
    });

    return {
      message: this.messageService.getSuccessMessage(
        'ticket.rejected',
        language,
      ),
      ticket,
    };
  }

  async remove(ticketId: string, userId: string, language: Lang = 'en') {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('ticket.not_found', language),
      );
    }

    if (ticket.createdBy !== userId) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage('ticket.unauthorized', language),
      );
    }

    if (ticket.status !== 'PENDING') {
      throw new BadRequestException(
        this.messageService.getErrorMessage('ticket.cannot_delete', language),
      );
    }

    await this.prisma.ticket.delete({
      where: { id: ticketId },
    });

    return {
      message: this.messageService.getSuccessMessage(
        'ticket.deleted',
        language,
      ),
    };
  }

  // --- Private helpers ---

  private buildPagination(query: TicketPaginationQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;
    const take = limit;
    return { skip, take, page, limit };
  }

  private buildMeta(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  private async requireLeaderRole(
    userId: string,
    language: Lang,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'LEADER') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage('ticket.unauthorized', language),
      );
    }
  }

  private async validateLeaderOwnsTicketHoa(
    ticketId: string,
    leaderId: string,
    language: Lang,
  ): Promise<void> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        hoa: {
          include: {
            userHOAs: {
              where: { isLeader: true },
              include: { user: true },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('ticket.not_found', language),
      );
    }

    if (ticket.status !== 'PENDING') {
      throw new BadRequestException(
        this.messageService.getErrorMessage('ticket.not_pending', language),
      );
    }

    const leaderHOA = ticket.hoa.userHOAs.find((uh) => uh.isLeader);
    if (!leaderHOA || leaderHOA.userId !== leaderId) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'ticket.not_authorized_hoa',
          language,
        ),
      );
    }
  }
}
