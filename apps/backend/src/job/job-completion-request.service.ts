import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobCompletionRequestDto } from './dto/create-job-completion-request.dto';
import {
  UpdateJobCompletionRequestDto,
  JobCompletionRequestStatus,
} from './dto/update-job-completion-request.dto';
import { TranslationService } from '../common/services/translation.service';
import { MessageService } from '../common/services/message.service';
import { JobStatus } from '@prisma/client';

@Injectable()
export class JobCompletionRequestService {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
    private messageService: MessageService,
  ) {}

  async create(
    createDto: CreateJobCompletionRequestDto & { completionImages?: string[] },
    serviceProviderId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the service provider exists and is active
    const serviceProvider = await this.prisma.serviceProvider.findUnique({
      where: { id: serviceProviderId },
    });

    if (!serviceProvider) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'completion.service_provider_not_found',
          language,
        ),
      );
    }

    if (!serviceProvider.isActive) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'completion.account_not_active',
          language,
        ),
      );
    }

    // Verify the job exists and is in progress
    const job = await this.prisma.job.findUnique({
      where: { id: createDto.jobId },
      include: {
        hoa: true,
        leader: true,
        creator: true,
      },
    });

    if (!job) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('job.job_not_found', language),
      );
    }

    if (job.status !== JobStatus.IN_PROGRESS) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.must_be_in_progress',
          language,
        ),
      );
    }

    // Check if service provider has an accepted bid for this job
    const acceptedBid = await this.prisma.bid.findFirst({
      where: {
        jobId: createDto.jobId,
        serviceProviderId: serviceProviderId,
        status: 'ACCEPTED',
      },
    });

    if (!acceptedBid) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage('job.no_accepted_bid', language),
      );
    }

    // Check if completion request already exists
    const existingRequest = await this.prisma.jobCompletionRequest.findUnique({
      where: {
        jobId_serviceProviderId: {
          jobId: createDto.jobId,
          serviceProviderId: serviceProviderId,
        },
      },
    });

    if (existingRequest) {
      throw new ConflictException(
        this.messageService.getErrorMessage(
          'job.completion_already_exists',
          language,
        ),
      );
    }

    // Translate completion notes
    const completionNotesTranslations =
      await this.translationService.createTranslationObject(
        createDto.completionNotes,
      );

    // Create the completion request
    const completionRequest = await this.prisma.jobCompletionRequest.create({
      data: {
        jobId: createDto.jobId,
        serviceProviderId: serviceProviderId,
        completionNotes: completionNotesTranslations,
        completionImages: createDto.completionImages || [],
        additionalDocumentUrl: createDto.additionalDocumentUrl,
        status: 'PENDING',
      },
      include: {
        job: {
          include: {
            services: {
              include: {
                service: true,
              },
            },
            hoa: {
              select: {
                id: true,
                name: true,
                hoaNumber: true,
                city: true,
              },
            },
            leader: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
            creator: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
          },
        },
        serviceProvider: {
          select: {
            id: true,
            name: true,
            rating: true,
            totalJobs: true,
            totalEarnings: true,
          },
        },
      },
    });

    return {
      message: this.messageService.getSuccessMessage(
        'job.completion_submitted',
        language,
      ),
      completionRequest,
    };
  }

  async findByServiceProvider(
    serviceProviderId: string,
    jobType?: string,
    status?: string,
    language: 'en' | 'ar' = 'en',
  ) {
    const whereClause: any = {
      serviceProviderId: serviceProviderId,
    };

    if (jobType) {
      whereClause.job = {
        jobType: jobType,
      };
    }

    if (status) {
      whereClause.status = status;
    }

    return this.prisma.jobCompletionRequest.findMany({
      where: whereClause,
      include: {
        job: {
          include: {
            services: {
              include: {
                service: true,
              },
            },
            hoa: {
              select: {
                id: true,
                name: true,
                hoaNumber: true,
                city: true,
              },
            },
            leader: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
            creator: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
          },
        },
        serviceProvider: {
          select: {
            id: true,
            name: true,
            rating: true,
            totalJobs: true,
            totalEarnings: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            nationalId: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async findPendingRequests(
    userId: string,
    userRole: string,
    language: 'en' | 'ar' = 'en',
  ) {
    let whereClause: any = {
      status: 'PENDING',
    };

    if (userRole === 'LEADER') {
      // Leader sees completion requests for HOAs where they are the leader
      whereClause.job = {
        hoa: {
          userHOAs: {
            some: {
              userId: userId,
              isLeader: true,
            },
          },
        },
      };
    } else if (userRole === 'HOME_OWNER') {
      // Home owner sees completion requests for jobs they created
      whereClause.job = {
        createdBy: userId,
      };
    } else {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'completion.invalid_user_role',
          language,
        ),
      );
    }

    return this.prisma.jobCompletionRequest.findMany({
      where: whereClause,
      include: {
        job: {
          include: {
            services: {
              include: {
                service: true,
              },
            },
            hoa: {
              select: {
                id: true,
                name: true,
                hoaNumber: true,
                city: true,
              },
            },
            leader: {
              // Keep if this relation exists on Job
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
            creator: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
          },
        },
        serviceProvider: {
          select: {
            id: true,
            name: true,
            rating: true,
            totalJobs: true,
            totalEarnings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(
    id: string,
    updateDto: UpdateJobCompletionRequestDto,
    userId: string,
    userRole: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the completion request exists
    const completionRequest = await this.prisma.jobCompletionRequest.findUnique(
      {
        where: { id },
        include: {
          job: {
            include: {
              hoa: true,
              leader: true,
              creator: true,
            },
          },
        },
      },
    );

    if (!completionRequest) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'job.completion_request_not_found',
          language,
        ),
      );
    }

    if (completionRequest.status !== 'PENDING') {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.completion_not_pending',
          language,
        ),
      );
    }

    let isAuthorized = false;

    if (userRole === 'HOME_OWNER') {
      isAuthorized = completionRequest.job.createdBy === userId;
    } else if (userRole === 'LEADER') {
      if (completionRequest.job.leaderId === userId) {
        isAuthorized = true;
      } else if (completionRequest.job.hoaId) {
        const isLeader = await this.prisma.userHOA.findFirst({
          where: {
            userId,
            hoaId: completionRequest.job.hoaId,
            isLeader: true,
          },
        });
        isAuthorized = !!isLeader;
      }
    }

    if (!isAuthorized) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'job.not_authorized_update_completion',
          language,
        ),
      );
    }

    // Translate review notes if provided
    let reviewNotesTranslations: { en: string; ar: string } | undefined =
      undefined;
    if (updateDto.reviewNotes) {
      reviewNotesTranslations =
        await this.translationService.createTranslationObject(
          updateDto.reviewNotes,
        );
    }

    // Update the completion request
    const updatedRequest = await this.prisma.jobCompletionRequest.update({
      where: { id },
      data: {
        status: updateDto.status,
        reviewNotes: reviewNotesTranslations,
        reviewedBy: userId,
      },
      include: {
        job: {
          include: {
            services: {
              include: {
                service: true,
              },
            },
            hoa: {
              select: {
                id: true,
                name: true,
                hoaNumber: true,
                city: true,
              },
            },
            leader: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
            creator: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
          },
        },
        serviceProvider: {
          select: {
            id: true,
            name: true,
            rating: true,
            totalJobs: true,
            totalEarnings: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            nationalId: true,
            role: true,
          },
        },
      },
    });

    // If approved, update job status to COMPLETED
    if (updateDto.status === JobCompletionRequestStatus.APPROVED) {
      await this.prisma.job.update({
        where: { id: completionRequest.jobId },
        data: { status: JobStatus.COMPLETED },
      });
    }

    const messageKey =
      updateDto.status === 'APPROVED'
        ? 'job.completion_approved'
        : 'job.completion_rejected';

    return {
      message: this.messageService.getSuccessMessage(messageKey, language),
      completionRequest: updatedRequest,
    };
  }

  async findOne(
    id: string,
    userId: string,
    userRole: string,
    language: 'en' | 'ar' = 'en',
  ) {
    const completionRequest = await this.prisma.jobCompletionRequest.findUnique(
      {
        where: { id },
        include: {
          job: {
            include: {
              services: {
                include: { service: true },
              },
              hoa: {
                include: {
                  userHOAs: true, // Needed for authorization
                },
              },
              leader: {
                select: { id: true, nationalId: true, role: true },
              },
              creator: {
                select: { id: true, nationalId: true, role: true },
              },
            },
          },
          serviceProvider: {
            select: {
              id: true,
              name: true,
              rating: true,
              totalJobs: true,
              totalEarnings: true,
            },
          },
          reviewer: {
            select: { id: true, nationalId: true, role: true },
          },
        },
      },
    );

    if (!completionRequest) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'job.completion_request_not_found',
          language,
        ),
      );
    }

    // Authorization Check
    let isAuthorized = false;

    if (userRole === 'LEADER') {
      isAuthorized =
        completionRequest.job.hoa?.userHOAs?.some(
          (u) => u.userId === userId && u.isLeader === true,
        ) || completionRequest.job.leaderId === userId;
    } else if (userRole === 'HOME_OWNER') {
      isAuthorized = completionRequest.job.createdBy === userId;
    } else if (userRole === 'SERVICE_PROVIDER') {
      isAuthorized = completionRequest.serviceProviderId === userId;
    }

    if (!isAuthorized) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'job.not_authorized_to_view',
          language,
        ),
      );
    }

    return completionRequest;
  }

  async getServiceProviderJobs(
    serviceProviderId: string,
    jobType?: string,
    status?: string,
    language: 'en' | 'ar' = 'en',
  ) {
    const whereClause: any = {
      bids: {
        some: {
          serviceProviderId: serviceProviderId,
          status: 'ACCEPTED',
        },
      },
    };

    if (jobType) {
      whereClause.jobType = jobType;
    }

    if (status) {
      whereClause.status = status;
    }

    return this.prisma.job.findMany({
      where: whereClause,
      include: {
        services: {
          include: {
            service: true,
          },
        },
        hoa: {
          select: {
            id: true,
            name: true,
            hoaNumber: true,
            city: true,
          },
        },
        leader: {
          select: {
            id: true,
            nationalId: true,
            role: true,
          },
        },
        creator: {
          select: {
            id: true,
            nationalId: true,
            role: true,
          },
        },
        bids: {
          where: {
            serviceProviderId: serviceProviderId,
            status: 'ACCEPTED',
          },
          include: {
            serviceProvider: {
              select: {
                id: true,
                name: true,
                rating: true,
                totalJobs: true,
                totalEarnings: true,
              },
            },
          },
        },
        completionRequests: {
          where: {
            serviceProviderId: serviceProviderId,
          },
          include: {
            reviewer: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
