import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../common/services/s3.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidStatus } from '@prisma/client';
import { TranslationService } from '../common/services/translation.service';
import { MessageService } from '../common/services/message.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class BidService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private translationService: TranslationService,
    private messageService: MessageService,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
  ) {}

  async create(
    createBidDto: CreateBidDto,
    serviceProviderId: string,
    document?: Express.Multer.File,
    language: 'en' | 'ar' = 'en',
  ) {
    // Validate and convert totalPrice to number
    const totalPrice = parseFloat(createBidDto.totalPrice);
    if (isNaN(totalPrice) || totalPrice <= 0) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'bid.total_price_invalid',
          language,
        ),
      );
    }

    // Verify the service provider exists and is active
    const serviceProvider = await this.prisma.serviceProvider.findUnique({
      where: { id: serviceProviderId },
    });

    if (!serviceProvider) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'service_provider.not_found',
          language,
        ),
      );
    }

    if (!serviceProvider.isActive) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'service_provider.account_not_active',
          language,
        ),
      );
    }

    // Verify the job exists and is open
    const job = await this.prisma.job.findUnique({
      where: { id: createBidDto.jobId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        hoa: true,
      },
    });

    if (!job) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('job.job_not_found', language),
      );
    }

    if (job.status !== 'OPEN' && job.status !== 'POSTED_BY_LEADER') {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'bid.cannot_bid_job_not_open',
          language,
        ),
      );
    }

    // Check if service provider already has a bid on this job
    const existingBid = await this.prisma.bid.findUnique({
      where: {
        jobId_serviceProviderId: {
          jobId: createBidDto.jobId,
          serviceProviderId: serviceProviderId,
        },
      },
    });

    if (existingBid) {
      throw new ConflictException(
        this.messageService.getErrorMessage('bid.already_bid_on_job', language),
      );
    }

    // Verify the service provider offers the service required by the job
    const jobServices = await this.prisma.jobService.findMany({
      where: { jobId: createBidDto.jobId },
      include: { service: true },
    });

    if (jobServices.length === 0) {
      throw new BadRequestException(
        this.messageService.getErrorMessage('bid.job_no_services', language),
      );
    }

    // Check if service provider offers any of the required services
    // const serviceProviderServices = await this.prisma.serviceProviderService.findMany({
    //   where: {
    //     serviceProviderId: serviceProviderId,
    //     serviceId: { in: jobServices.map(js => js.serviceId) },
    //   },
    // });

    // if (serviceProviderServices.length === 0) {
    //   throw new ForbiddenException('You do not offer any of the services required for this job');
    // }

    let documentUrl: string | undefined;

    // Upload document to S3 if provided
    if (document) {
      const s3Key = this.s3Service.generateS3Key(
        'bid-documents',
        serviceProviderId,
        document.originalname,
      );
      documentUrl = await this.s3Service.uploadFileBuffer(document, s3Key);
    }

    // Create the bid
    // Translate cover letter
    const coverLetterTranslations =
      await this.translationService.createTranslationObject(
        createBidDto.coverLetter,
      );

    const bid = await this.prisma.bid.create({
      data: {
        jobId: createBidDto.jobId,
        serviceProviderId: serviceProviderId,
        totalPrice: totalPrice,
        coverLetter: coverLetterTranslations,
        documentUrl: documentUrl,
        status: BidStatus.PENDING,
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
                city: true,
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
      message: this.messageService.getSuccessMessage('bid.submitted', language),
      bid,
    };
  }

  async findAll() {
    return this.prisma.bid.findMany({
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
                city: true,
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

  async findByJob(jobId: string) {
    return this.prisma.bid.findMany({
      where: { jobId },
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
      orderBy: {
        totalPrice: 'asc', // Show lowest bids first
      },
    });
  }

  async findByServiceProvider(serviceProviderId: string) {
    return this.prisma.bid.findMany({
      where: { serviceProviderId },
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
                city: true,
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

  async findOne(id: string, language: 'en' | 'ar' = 'en') {
    const bid = await this.prisma.bid.findUnique({
      where: { id },
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
                city: true,
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

    if (!bid) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('job.bid_not_found', language),
      );
    }

    return bid;
  }

  async updateStatus(
    id: string,
    status: BidStatus,
    userId: string,
    userRole: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the bid exists
    const bid = await this.prisma.bid.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            leader: true,
            creator: true,
            hoa: true,
          },
        },
      },
    });

    if (!bid) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('job.bid_not_found', language),
      );
    }

    // Check authorization based on job type and user role
    let isAuthorized = false;

    if (bid.job.jobType === 'HOME_SERVICE') {
      // For home service jobs, only the job creator (home owner) can accept/reject bids
      if (userRole === 'HOME_OWNER' && bid.job.createdBy === userId) {
        isAuthorized = true;
      }
    } else if (bid.job.jobType === 'COMMUNITY_SERVICE') {
      // For community service jobs, only the leader can accept/reject bids
      if (userRole === 'LEADER' && bid.job.leaderId === userId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'bid.not_authorized_update_status',
          language,
        ),
      );
    }

    // Update the bid status
    const updatedBid = await this.prisma.bid.update({
      where: { id },
      data: { status },
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
                city: true,
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

    // If bid is accepted, update job status to IN_PROGRESS and create chat
    if (status === BidStatus.ACCEPTED) {
      await this.prisma.job.update({
        where: { id: bid.jobId },
        data: { status: 'IN_PROGRESS' },
      });

      // Create chat between service provider and job poster
      try {
        await this.chatService.initiateServiceProviderChat(
          bid.jobId,
          bid.serviceProviderId,
        );
      } catch (error) {
        // If chat already exists or creation fails, log but don't fail the bid acceptance
        console.log('Chat creation info:', error.message);
      }
    }

    return {
      message: this.messageService.getSuccessMessage(
        'bid.status_updated',
        language,
      ),
      bid: updatedBid,
    };
  }

  async remove(
    id: string,
    serviceProviderId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the bid exists and belongs to this service provider
    const existingBid = await this.prisma.bid.findFirst({
      where: {
        id,
        serviceProviderId,
      },
    });

    if (!existingBid) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'bid.not_found_or_unauthorized_delete',
          language,
        ),
      );
    }

    // Only allow deletion if bid is still pending
    if (existingBid.status !== BidStatus.PENDING) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'bid.cannot_delete_not_pending',
          language,
        ),
      );
    }

    await this.prisma.bid.delete({
      where: { id },
    });

    return {
      message: this.messageService.getSuccessMessage('bid.deleted', language),
    };
  }

  async findBidsForJobOwner(
    jobId: string,
    userId: string,
    userRole: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // First verify the job exists and get its details
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
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

    // Check authorization based on job type and user role
    let isAuthorized = false;

    if (job.jobType === 'HOME_SERVICE') {
      // For home service jobs, only the job creator (home owner) can view bids
      if (userRole === 'HOME_OWNER' && job.createdBy === userId) {
        isAuthorized = true;
      }
    } else if (job.jobType === 'COMMUNITY_SERVICE') {
      // For community service jobs, only the leader can view bids
      if (userRole === 'LEADER' && job.leaderId === userId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'bid.not_authorized_view_job',
          language,
        ),
      );
    }

    // Fetch bids for the job
    return this.prisma.bid.findMany({
      where: { jobId },
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
      },
      orderBy: {
        totalPrice: 'asc', // Show lowest bids first
      },
    });
  }

  async findBidsForUser(
    userId: string,
    userRole: string,
    jobType?: string,
    status?: string,
    jobId?: string,
    language: 'en' | 'ar' = 'en',
  ) {
    let whereClause: any = {};

    // If jobId is provided, filter by specific job and verify authorization
    if (jobId) {
      // First verify the job exists and get its details
      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
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

      // Check authorization based on job type and user role
      let isAuthorized = false;

      if (job.jobType === 'HOME_SERVICE') {
        // For home service jobs, only the job creator (home owner) can view bids
        if (userRole === 'HOME_OWNER' && job.createdBy === userId) {
          isAuthorized = true;
        }
      } else if (job.jobType === 'COMMUNITY_SERVICE') {
        // For community service jobs, only the leader can view bids
        if (userRole === 'LEADER' && job.leaderId === userId) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        throw new ForbiddenException(
          this.messageService.getErrorMessage(
            'bid.not_authorized_view_job',
            language,
          ),
        );
      }

      // Filter by specific job
      whereClause.jobId = jobId;
    } else {
      // No specific job, apply role-based filtering
      if (userRole === 'HOME_OWNER') {
        // Home owner can see bids for jobs they created
        whereClause.job = {
          createdBy: userId,
          jobType: 'HOME_SERVICE', // Home owners only see home service jobs
        };
      } else if (userRole === 'LEADER') {
        // Leader can see bids for jobs they posted or community service jobs in their apartments
        whereClause.job = {
          OR: [
            { leaderId: userId }, // Jobs posted by this leader
            {
              jobType: 'COMMUNITY_SERVICE',
              hoa: {
                leaderId: userId, // Community service jobs in apartments they manage
              },
            },
          ],
        };
      } else {
        throw new ForbiddenException(
          this.messageService.getErrorMessage(
            'bid.invalid_user_role',
            language,
          ),
        );
      }

      // Add job type filter if provided
      if (jobType) {
        if (whereClause.job.OR) {
          // For leaders, filter the OR conditions
          whereClause.job.OR = whereClause.job.OR.map((condition: any) => ({
            ...condition,
            jobType: jobType,
          }));
        } else {
          whereClause.job.jobType = jobType;
        }
      }
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status;
    }

    return this.prisma.bid.findMany({
      where: whereClause,
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
      },
      orderBy: [
        { job: { createdAt: 'desc' } }, // Sort by job creation date
        { totalPrice: 'asc' }, // Then by bid price
      ],
    });
  }
}
