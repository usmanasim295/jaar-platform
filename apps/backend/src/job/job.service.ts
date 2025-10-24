import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, JobType } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus } from '@prisma/client';
import { TranslationService } from '../common/services/translation.service';
import { MessageService } from '../common/services/message.service';

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
    private messageService: MessageService,
  ) {}

  async create(
    createJobDto: CreateJobDto,
    userId: string,
    userRole: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('job.user_not_found', language),
      );
    }

    // Verify all services exist
    const services = await this.prisma.service.findMany({
      where: {
        id: { in: createJobDto.serviceIds },
      },
    });

    if (services.length !== createJobDto.serviceIds.length) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('job.services_not_found', language),
      );
    }

    let apartmentId: string;
    let leaderId: string | undefined;
    let initialStatus: JobStatus;

    if (createJobDto.jobType === JobType.HOME_SERVICE) {
      if (userRole === 'HOME_OWNER') {
        // Home service: use the home owner's assigned apartment
        if (!user.apartmentId) {
          throw new BadRequestException(
            this.messageService.getErrorMessage(
              'job.apartment_not_linked',
              language,
            ),
          );
        }

        // If payload provides apartmentId, ensure it matches the user's apartment
        if (
          createJobDto.apartmentId &&
          createJobDto.apartmentId !== user.apartmentId
        ) {
          throw new ForbiddenException(
            this.messageService.getErrorMessage(
              'job.home_service_apartment_mismatch',
              language,
            ),
          );
        }

        apartmentId = user.apartmentId;
        leaderId = undefined;
        initialStatus = JobStatus.OPEN; // Visible to service providers immediately
      } else if (userRole === 'LEADER') {
        // Leader posting a home service job (allowed): require apartment they lead
        if (!createJobDto.apartmentId) {
          throw new BadRequestException(
            this.messageService.getErrorMessage(
              'job.apartment_id_required_leader',
              language,
            ),
          );
        }

        const apartment = await this.prisma.apartment.findFirst({
          where: { id: createJobDto.apartmentId, leaderId: userId },
        });
        if (!apartment) {
          throw new ForbiddenException(
            this.messageService.getErrorMessage(
              'job.not_authorized_apartment',
              language,
            ),
          );
        }

        apartmentId = apartment.id;
        leaderId = userId;
        initialStatus = JobStatus.OPEN;
      } else {
        throw new ForbiddenException(
          this.messageService.getErrorMessage(
            'job.invalid_role_home_service',
            language,
          ),
        );
      }
    } else if (createJobDto.jobType === JobType.COMMUNITY_SERVICE) {
      // For community service, apartmentId is required
      if (!createJobDto.apartmentId) {
        throw new BadRequestException(
          this.messageService.getErrorMessage(
            'job.apartment_id_required_community',
            language,
          ),
        );
      }

      const apartment = await this.prisma.apartment.findUnique({
        where: { id: createJobDto.apartmentId },
        include: { leader: true },
      });

      if (!apartment) {
        throw new NotFoundException(
          this.messageService.getErrorMessage(
            'job.apartment_not_found',
            language,
          ),
        );
      }

      if (!apartment.leaderId) {
        throw new BadRequestException(
          this.messageService.getErrorMessage('apartment.no_leader', language),
        );
      }

      if (userRole === 'HOME_OWNER') {
        // Home owner can only target their own apartment
        if (!user.apartmentId || user.apartmentId !== apartment.id) {
          throw new ForbiddenException(
            this.messageService.getErrorMessage(
              'job.not_authorized_community',
              language,
            ),
          );
        }

        apartmentId = apartment.id;
        leaderId = apartment.leaderId;
        initialStatus = JobStatus.SENT_TO_LEADER; // Sent to leader for approval
      } else if (userRole === 'LEADER') {
        // Leader must be the leader of this apartment
        if (apartment.leaderId !== userId) {
          throw new ForbiddenException(
            this.messageService.getErrorMessage(
              'job.not_authorized_apartment',
              language,
            ),
          );
        }

        apartmentId = apartment.id;
        leaderId = userId;
        initialStatus = JobStatus.OPEN; // Directly open when leader posts community job
      } else {
        throw new ForbiddenException(
          this.messageService.getErrorMessage(
            'job.invalid_role_community_service',
            language,
          ),
        );
      }
    } else {
      throw new BadRequestException(
        this.messageService.getErrorMessage('job.invalid_job_type', language),
      );
    }

    // Translate fields BEFORE starting the transaction
    const [
      titleTranslations,
      descriptionTranslations,
      timeSlotTranslations,
      experienceLevelTranslations,
    ] = await Promise.all([
      this.translationService.createTranslationObject(createJobDto.title),
      this.translationService.createTranslationObject(createJobDto.description),
      this.translationService.createTranslationObject(createJobDto.timeSlot),
      createJobDto.experienceLevel
        ? this.translationService.createTranslationObject(
            createJobDto.experienceLevel,
          )
        : { en: '', ar: '' },
    ]);

    // Now start the transaction for DB operations only
    const job = await this.prisma.$transaction(async (prisma) => {
      // Create the job
      const createdJob = await prisma.job.create({
        data: {
          title: titleTranslations,
          description: descriptionTranslations,
          startDate: new Date(createJobDto.startDate),
          endDate: new Date(createJobDto.endDate),
          timeSlot: timeSlotTranslations,
          experienceLevel: createJobDto.experienceLevel
            ? experienceLevelTranslations
            : undefined,
          apartmentId: apartmentId,
          leaderId: leaderId,
          createdBy: userId,
          jobType: createJobDto.jobType,
          status: initialStatus,
        },
      });

      // Create job-service relationships
      await Promise.all(
        createJobDto.serviceIds.map((serviceId) =>
          prisma.jobService.create({
            data: {
              jobId: createdJob.id,
              serviceId: serviceId,
            },
          }),
        ),
      );

      return createdJob;
    });

    // Return job with services included
    const jobWithServices = await this.prisma.job.findUnique({
      where: { id: job.id },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        apartment: {
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
    });

    const message =
      createJobDto.jobType === JobType.HOME_SERVICE
        ? this.messageService.getSuccessMessage(
            'job.home_service_created',
            language,
          )
        : userRole === 'HOME_OWNER'
          ? this.messageService.getSuccessMessage(
              'job.community_service_sent_to_leader',
              language,
            )
          : this.messageService.getSuccessMessage(
              'job.community_service_created',
              language,
            );

    return {
      message,
      job: jobWithServices,
    };
  }

  async findAll() {
    return this.prisma.job.findMany({
      where: {
        // Only show jobs that are open for bidding or posted by leader
        status: {
          in: ['OPEN', 'POSTED_BY_LEADER'],
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        apartment: {
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
          include: {
            serviceProvider: {
              select: {
                id: true,
                name: true,
                rating: true,
                totalJobs: true,
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
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        apartment: {
          select: {
            id: true,
            name: true,
            hoaNumber: true,
            address: true,
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
        bids: {
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
        },
      },
    });

    if (!job) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('job.job_not_found', language),
      );
    }

    return job;
  }

  async findByApartment(apartmentId: string) {
    return this.prisma.job.findMany({
      where: { apartmentId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        apartment: {
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
        bids: {
          include: {
            serviceProvider: {
              select: {
                id: true,
                name: true,
                rating: true,
                totalJobs: true,
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

  async findByLeader(leaderId: string, language: 'en' | 'ar' = 'en') {
    // Verify the user is a leader
    const leader = await this.prisma.user.findUnique({
      where: { id: leaderId },
    });

    if (!leader || leader.role !== 'LEADER') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'job.only_leaders_can_view_jobs',
          language,
        ),
      );
    }

    return this.prisma.job.findMany({
      where: { leaderId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        apartment: {
          select: {
            id: true,
            name: true,
            hoaNumber: true,
            city: true,
          },
        },
        bids: {
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
            totalPrice: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // async findByCreator(userId: string) {
  //   return this.prisma.job.findMany({
  //     where: { createdBy: userId },
  //     include: {
  //       services: {
  //         include: {
  //           service: true,
  //         },
  //       },
  //       apartment: {
  //         select: {
  //           id: true,
  //           name: true,
  //           hoaNumber: true,
  //           city: true,
  //         },
  //       },
  //       leader: {
  //         select: {
  //           id: true,
  //           nationalId: true,
  //           role: true,
  //         },
  //       },
  //       creator: {
  //         select: {
  //           id: true,
  //           nationalId: true,
  //           role: true,
  //         },
  //       },
  //       bids: {
  //         include: {
  //           serviceProvider: {
  //             select: {
  //               id: true,
  //               name: true,
  //               rating: true,
  //               totalJobs: true,
  //               totalEarnings: true,
  //             },
  //           },
  //         },
  //         orderBy: {
  //           totalPrice: 'asc',
  //         },
  //       },
  //     },
  //     orderBy: {
  //       createdAt: 'desc',
  //     },
  //   });
  // }

  async findByCreator(
    userId: string,
    userRole: string,
    status?: JobStatus,
    jobType?: string,
  ) {
    let jobs: any[] = [];

    // Build filters if provided
    const statusFilter = status ? { status } : {};
    const jobTypeFilter = jobType
      ? { jobType: jobType as 'HOME_SERVICE' | 'COMMUNITY_SERVICE' }
      : {};

    if (userRole === 'LEADER') {
      // Get apartments managed by this leader
      const apartments = await this.prisma.apartment.findMany({
        where: { leaderId: userId },
        select: { id: true },
      });
      const apartmentIds = apartments.map((a) => a.id);

      // Fetch jobs created by leader
      const leaderJobs = await this.prisma.job.findMany({
        where: {
          createdBy: userId,
          ...statusFilter,
          ...jobTypeFilter,
        },
        include: {
          services: { include: { service: true } },
          apartment: {
            select: { id: true, name: true, hoaNumber: true, city: true },
          },
          leader: { select: { id: true, nationalId: true, role: true } },
          creator: { select: { id: true, nationalId: true, role: true } },
          bids: {
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
            orderBy: { totalPrice: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Fetch community service jobs created by home owners for leader's apartments
      // Only fetch if no jobType filter or if filter is COMMUNITY_SERVICE
      const shouldFetchCommunityJobs =
        !jobType || jobType === 'COMMUNITY_SERVICE';
      const communityJobs = shouldFetchCommunityJobs
        ? await this.prisma.job.findMany({
            where: {
              apartmentId: { in: apartmentIds },
              jobType: 'COMMUNITY_SERVICE',
              ...statusFilter,
            },
            include: {
              services: { include: { service: true } },
              apartment: {
                select: { id: true, name: true, hoaNumber: true, city: true },
              },
              leader: { select: { id: true, nationalId: true, role: true } },
              creator: { select: { id: true, nationalId: true, role: true } },
              bids: {
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
                orderBy: { totalPrice: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        : [];

      jobs = [...leaderJobs, ...communityJobs];
      // Optionally, sort all jobs by createdAt descending
      jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      // For home owners, just fetch their jobs
      jobs = await this.prisma.job.findMany({
        where: {
          createdBy: userId,
          ...statusFilter,
          ...jobTypeFilter,
        },
        include: {
          services: { include: { service: true } },
          apartment: {
            select: { id: true, name: true, hoaNumber: true, city: true },
          },
          leader: { select: { id: true, nationalId: true, role: true } },
          creator: { select: { id: true, nationalId: true, role: true } },
          bids: {
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
            orderBy: { totalPrice: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return jobs;
  }

  async findPendingCommunityJobs(
    leaderId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the user is a leader
    const leader = await this.prisma.user.findUnique({
      where: { id: leaderId },
    });

    if (!leader || leader.role !== 'LEADER') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'job.only_leaders_can_view_pending_community',
          language,
        ),
      );
    }

    return this.prisma.job.findMany({
      where: {
        jobType: 'COMMUNITY_SERVICE',
        status: 'SENT_TO_LEADER',
        apartment: {
          leaderId: leaderId,
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        apartment: {
          select: {
            id: true,
            name: true,
            hoaNumber: true,
            city: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    leaderId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the job exists and belongs to this leader
    const existingJob = await this.prisma.job.findFirst({
      where: {
        id,
        leaderId,
      },
    });

    if (!existingJob) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'job.not_found_or_unauthorized_update',
          language,
        ),
      );
    }

    // Only allow updates if job is still open
    if (existingJob.status !== JobStatus.OPEN) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.cannot_update_not_open',
          language,
        ),
      );
    }

    // If serviceIds are being updated, verify all services exist
    if (updateJobDto.serviceIds && updateJobDto.serviceIds.length > 0) {
      const services = await this.prisma.service.findMany({
        where: {
          id: { in: updateJobDto.serviceIds },
        },
      });

      if (services.length !== updateJobDto.serviceIds.length) {
        throw new NotFoundException(
          this.messageService.getErrorMessage(
            'job.services_not_found',
            language,
          ),
        );
      }
    }

    // Update the job with transaction to handle service updates
    const updatedJob = await this.prisma.$transaction(async (prisma) => {
      // Update job fields
      const job = await prisma.job.update({
        where: { id },
        data: {
          title: updateJobDto.title,
          description: updateJobDto.description,
          startDate: updateJobDto.startDate
            ? new Date(updateJobDto.startDate)
            : undefined,
          endDate: updateJobDto.endDate
            ? new Date(updateJobDto.endDate)
            : undefined,
          timeSlot: updateJobDto.timeSlot,
          experienceLevel: updateJobDto.experienceLevel,
        },
      });

      // If serviceIds are provided, update the services
      if (updateJobDto.serviceIds) {
        // Remove existing services
        await prisma.jobService.deleteMany({
          where: { jobId: id },
        });

        // Add new services
        await Promise.all(
          updateJobDto.serviceIds.map((serviceId) =>
            prisma.jobService.create({
              data: {
                jobId: id,
                serviceId: serviceId,
              },
            }),
          ),
        );
      }

      return job;
    });

    // Return updated job with services included
    const jobWithServices = await this.prisma.job.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        apartment: {
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
      },
    });

    return {
      message: this.messageService.getSuccessMessage(
        'job.updated_success',
        language,
      ),
      job: jobWithServices,
    };
  }

  async remove(id: string, leaderId: string, language: 'en' | 'ar' = 'en') {
    // Verify the job exists and belongs to this leader
    const existingJob = await this.prisma.job.findFirst({
      where: {
        id,
        leaderId,
      },
    });

    if (!existingJob) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'job.not_found_or_unauthorized_delete',
          language,
        ),
      );
    }

    // Only allow deletion if job is still open
    if (existingJob.status !== JobStatus.OPEN) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.cannot_delete_not_open',
          language,
        ),
      );
    }

    // Delete the job with transaction to handle related records
    await this.prisma.$transaction(async (prisma) => {
      // First delete all related JobService records
      await prisma.jobService.deleteMany({
        where: { jobId: id },
      });

      // Then delete all related bids
      await prisma.bid.deleteMany({
        where: { jobId: id },
      });

      // Finally delete the job
      await prisma.job.delete({
        where: { id },
      });
    });

    return {
      message: this.messageService.getSuccessMessage(
        'job.deleted_success',
        language,
      ),
    };
  }

  async updateStatus(
    id: string,
    status: JobStatus,
    leaderId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the job exists and belongs to this leader
    const existingJob = await this.prisma.job.findFirst({
      where: {
        id,
        leaderId,
      },
    });

    if (!existingJob) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'job.not_found_or_unauthorized_update',
          language,
        ),
      );
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: { status },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        apartment: {
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
      },
    });

    return {
      message: this.messageService.getSuccessMessage(
        'job.status_updated_success',
        language,
      ),
      job: updatedJob,
    };
  }

  async approveCommunityJob(
    jobId: string,
    leaderId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the user is a leader
    const leader = await this.prisma.user.findUnique({
      where: { id: leaderId },
    });

    if (!leader || leader.role !== 'LEADER') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'job.only_leaders_can_approve_community',
          language,
        ),
      );
    }

    // Verify the job exists and is a community service job
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        apartment: {
          include: { leader: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('job.job_not_found', language),
      );
    }

    if (job.jobType !== 'COMMUNITY_SERVICE') {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.only_community_jobs_can_be_approved',
          language,
        ),
      );
    }

    if (job.status !== 'SENT_TO_LEADER') {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.not_sent_to_leader_status',
          language,
        ),
      );
    }

    // Verify the leader is authorized to approve this job
    if (job.apartment.leaderId !== leaderId) {
      throw new ForbiddenException(
        'You are not authorized to approve jobs for this apartment',
      );
    }

    // Update job status to POSTED_BY_LEADER
    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'POSTED_BY_LEADER',
        leaderId: leaderId, // Ensure leader is set
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        apartment: {
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
    });

    return {
      message: this.messageService.getSuccessMessage(
        'job.community_approved',
        language,
      ),
      job: updatedJob,
    };
  }

  async rejectCommunityJob(
    jobId: string,
    leaderId: string,
    reason?: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the user is a leader
    const leader = await this.prisma.user.findUnique({
      where: { id: leaderId },
    });

    if (!leader || leader.role !== 'LEADER') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'job.only_leaders_can_reject_community',
          language,
        ),
      );
    }

    // Verify the job exists and is a community service job
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        apartment: {
          include: { leader: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('job.job_not_found', language),
      );
    }

    if (job.jobType !== 'COMMUNITY_SERVICE') {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.only_community_jobs_can_be_rejected',
          language,
        ),
      );
    }

    if (job.status !== 'SENT_TO_LEADER') {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.not_sent_to_leader_status',
          language,
        ),
      );
    }

    // Verify the leader is authorized to reject this job
    if (job.apartment.leaderId !== leaderId) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'job.not_authorized_reject_apartment',
          language,
        ),
      );
    }

    // Update job status to CANCELLED
    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'CANCELLED',
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        apartment: {
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
    });

    return {
      message: this.messageService.getSuccessMessage(
        'job.community_rejected',
        language,
      ),
      job: updatedJob,
    };
  }

  async findServiceProviderJobs(
    serviceProviderId: string,
    jobType?: string,
    status?: string,
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
        apartment: {
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
