import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, JobType } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus, JobType as PrismaJobType, Prisma } from '@prisma/client';
import { TranslationService } from '../common/services/translation.service';
import { MessageService } from '../common/services/message.service';
import {
  jobCreatedInclude,
  jobPublicListInclude,
  jobDetailInclude,
  jobByApartmentInclude,
  jobByLeaderInclude,
  jobListInclude,
  jobPendingCommunityInclude,
  jobWithHoaLeaderInclude,
  jobWithFullPartiesInclude,
  hoaWithLeadersInclude,
  serviceProviderAcceptedJobsInclude,
} from './job-includes';

type Lang = 'en' | 'ar';

type UserWithHOAsForCreate = Prisma.UserGetPayload<{
  include: {
    userHOAs: { include: { hoa: true } };
  };
}>;

type CreateJobPlacement = {
  hoaId: string;
  leaderId: string | undefined;
  initialStatus: JobStatus;
};

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
    language: Lang = 'en',
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userHOAs: {
          include: {
            hoa: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('job.user_not_found', language),
      );
    }

    const serviceIds = this.getServiceIdsFromCreateJobDto(
      createJobDto,
      language,
    );
    await this.assertAllServicesExist(serviceIds, language);
    await this.validateServiceQuestionAnswersForCreate(
      createJobDto,
      language,
      serviceIds,
    );
    if (createJobDto.jobType === JobType.RFQ) {
      await this.assertAllServiceQuestionsAnsweredForRfq(
        createJobDto,
        language,
        serviceIds,
      );
    }

    const { hoaId, leaderId, initialStatus } =
      await this.resolveCreateJobPlacement(
        user,
        createJobDto,
        userId,
        userRole,
        language,
      );

    const [
      titleTranslations,
      descriptionTranslations,
      timeSlotTranslations,
      workDurationTranslations,
      locationTranslations,
      experienceLevelTranslations,
    ] = await Promise.all([
      this.translationService.createTranslationObject(createJobDto.title),
      this.translationService.createTranslationObject(createJobDto.description),
      createJobDto.timeSlot
        ? this.translationService.createTranslationObject(createJobDto.timeSlot)
        : Promise.resolve({ en: '', ar: '' }),
      createJobDto.workDuration
        ? this.translationService.createTranslationObject(
            createJobDto.workDuration,
          )
        : Promise.resolve({ en: '', ar: '' }),
      createJobDto.location
        ? this.translationService.createTranslationObject(createJobDto.location)
        : Promise.resolve({ en: '', ar: '' }),
      createJobDto.experienceLevel
        ? this.translationService.createTranslationObject(
            createJobDto.experienceLevel,
          )
        : Promise.resolve({ en: '', ar: '' }),
    ]);

    const flatAnswers = this.flattenServiceQuestionAnswersFromDto(createJobDto);

    type ServiceQuestionAnswerRow = {
      serviceQuestionId: string;
      answer: { en: string; ar: string };
    };
    const serviceQuestionAnswerPayload: ServiceQuestionAnswerRow[] =
      flatAnswers.length > 0
        ? await Promise.all(
            flatAnswers.map(async (item) => ({
              serviceQuestionId: item.serviceQuestionId,
              answer: await this.translationService.createTranslationObject(
                item.answer,
              ),
            })),
          )
        : [];

    const job = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const createdJob = await tx.job.create({
          data: {
            title: titleTranslations,
            description: descriptionTranslations,
            startDate: createJobDto.startDate
              ? new Date(createJobDto.startDate)
              : undefined,
            endDate: createJobDto.endDate
              ? new Date(createJobDto.endDate)
              : undefined,
            timeSlot: createJobDto.timeSlot ? timeSlotTranslations : undefined,
            workDuration: createJobDto.workDuration
              ? workDurationTranslations
              : undefined,
            location: createJobDto.location ? locationTranslations : undefined,
            experienceLevel: createJobDto.experienceLevel
              ? experienceLevelTranslations
              : undefined,
            hoaId: hoaId,
            leaderId: leaderId,
            createdBy: userId,
            jobType: createJobDto.jobType,
            status: initialStatus,
          },
        });

        await Promise.all(
          serviceIds.map((serviceId) =>
            tx.jobService.create({
              data: {
                jobId: createdJob.id,
                serviceId: serviceId,
              },
            }),
          ),
        );

        if (serviceQuestionAnswerPayload.length > 0) {
          await Promise.all(
            serviceQuestionAnswerPayload.map((row) =>
              tx.serviceQuestionAnswer.create({
                data: {
                  jobId: createdJob.id,
                  serviceQuestionId: row.serviceQuestionId,
                  answer: row.answer,
                },
              }),
            ),
          );
        }

        return createdJob;
      },
    );

    const jobWithServices = await this.prisma.job.findUnique({
      where: { id: job.id },
      include: jobCreatedInclude,
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
        status: {
          in: ['OPEN', 'POSTED_BY_LEADER'],
        },
      },
      include: jobPublicListInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, language: Lang = 'en') {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: jobDetailInclude,
    });

    if (!job) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('job.job_not_found', language),
      );
    }

    return job;
  }

  async findByApartment(hoaId: string) {
    return this.prisma.job.findMany({
      where: { hoaId },
      include: jobByApartmentInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByLeader(leaderId: string, language: Lang = 'en') {
    await this.requireLeaderRole(
      leaderId,
      language,
      'job.only_leaders_can_view_jobs',
    );

    return this.prisma.job.findMany({
      where: { leaderId },
      include: jobByLeaderInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByCreator(
    userId: string,
    userRole: string,
    status?: JobStatus,
    jobType?: string,
  ) {
    const statusFilter = status ? { status } : {};
    const jobTypeFilter = jobType
      ? { jobType: jobType as 'HOME_SERVICE' | 'COMMUNITY_SERVICE' }
      : {};

    if (userRole === 'LEADER') {
      const userHOAs = await this.prisma.userHOA.findMany({
        where: { userId: userId, isLeader: true },
        select: { hoaId: true },
      });
      const hoaIds = userHOAs.map((uh) => uh.hoaId);

      const leaderJobs = await this.prisma.job.findMany({
        where: {
          createdBy: userId,
          ...statusFilter,
          ...jobTypeFilter,
        },
        include: jobListInclude,
        orderBy: { createdAt: 'desc' },
      });

      const shouldFetchCommunityJobs =
        !jobType || jobType === 'COMMUNITY_SERVICE';
      const communityJobs = shouldFetchCommunityJobs
        ? await this.prisma.job.findMany({
            where: {
              hoaId: { in: hoaIds },
              jobType: 'COMMUNITY_SERVICE',
              ...statusFilter,
            },
            include: jobListInclude,
            orderBy: { createdAt: 'desc' },
          })
        : [];

      const jobs = [...leaderJobs, ...communityJobs];
      jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return jobs;
    }

    return this.prisma.job.findMany({
      where: {
        createdBy: userId,
        ...statusFilter,
        ...jobTypeFilter,
      },
      include: jobListInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPendingCommunityJobs(leaderId: string, language: Lang = 'en') {
    await this.requireLeaderRole(
      leaderId,
      language,
      'job.only_leaders_can_view_pending_community',
    );

    return this.prisma.job.findMany({
      where: {
        jobType: 'COMMUNITY_SERVICE',
        status: 'SENT_TO_LEADER',
        hoa: {
          userHOAs: {
            some: {
              userId: leaderId,
              isLeader: true,
            },
          },
        },
      },
      include: jobPendingCommunityInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    leaderId: string,
    language: Lang = 'en',
  ) {
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

    if (existingJob.status !== JobStatus.OPEN) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.cannot_update_not_open',
          language,
        ),
      );
    }

    if (updateJobDto.serviceIds && updateJobDto.serviceIds.length > 0) {
      await this.assertAllServicesExist(updateJobDto.serviceIds, language);
    }

    const translateIfPresent = async (value?: string) =>
      value
        ? await this.translationService.createTranslationObject(value)
        : undefined;

    const [
      titleTranslations,
      descriptionTranslations,
      timeSlotTranslations,
      workDurationTranslations,
      locationTranslations,
      experienceLevelTranslations,
    ] = await Promise.all([
      translateIfPresent(updateJobDto.title),
      translateIfPresent(updateJobDto.description),
      translateIfPresent(updateJobDto.timeSlot),
      translateIfPresent(updateJobDto.workDuration),
      translateIfPresent(updateJobDto.location),
      translateIfPresent(updateJobDto.experienceLevel),
    ]);

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.job.update({
        where: { id },
        data: {
          title: titleTranslations,
          description: descriptionTranslations,
          startDate: updateJobDto.startDate
            ? new Date(updateJobDto.startDate)
            : undefined,
          endDate: updateJobDto.endDate
            ? new Date(updateJobDto.endDate)
            : undefined,
          timeSlot: timeSlotTranslations,
          workDuration: workDurationTranslations,
          location: locationTranslations,
          experienceLevel: experienceLevelTranslations,
        },
      });

      if (updateJobDto.serviceIds) {
        await tx.jobService.deleteMany({
          where: { jobId: id },
        });

        await Promise.all(
          updateJobDto.serviceIds.map((serviceId) =>
            tx.jobService.create({
              data: {
                jobId: id,
                serviceId: serviceId,
              },
            }),
          ),
        );
      }
    });

    const jobWithServices = await this.prisma.job.findUnique({
      where: { id },
      include: jobWithHoaLeaderInclude,
    });

    return {
      message: this.messageService.getSuccessMessage(
        'job.updated_success',
        language,
      ),
      job: jobWithServices,
    };
  }

  async remove(id: string, leaderId: string, language: Lang = 'en') {
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

    if (existingJob.status !== JobStatus.OPEN) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.cannot_delete_not_open',
          language,
        ),
      );
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.jobService.deleteMany({
        where: { jobId: id },
      });

      await tx.bid.deleteMany({
        where: { jobId: id },
      });

      await tx.job.delete({
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
    language: Lang = 'en',
  ) {
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
      include: jobWithHoaLeaderInclude,
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
    language: Lang = 'en',
  ) {
    await this.requireLeaderRole(
      leaderId,
      language,
      'job.only_leaders_can_approve_community',
    );

    await this.loadCommunityJobForLeaderActionOrThrow(
      jobId,
      leaderId,
      language,
      'approve',
    );

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'POSTED_BY_LEADER',
        leaderId: leaderId,
      },
      include: jobWithFullPartiesInclude,
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
    language: Lang = 'en',
  ) {
    await this.requireLeaderRole(
      leaderId,
      language,
      'job.only_leaders_can_reject_community',
    );

    await this.loadCommunityJobForLeaderActionOrThrow(
      jobId,
      leaderId,
      language,
      'reject',
    );

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'CANCELLED',
      },
      include: jobWithFullPartiesInclude,
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
    const whereClause: Prisma.JobWhereInput = {
      bids: {
        some: {
          serviceProviderId: serviceProviderId,
          status: 'ACCEPTED',
        },
      },
    };

    if (jobType) {
      whereClause.jobType = jobType as PrismaJobType;
    }

    if (status) {
      whereClause.status = status as JobStatus;
    }

    return this.prisma.job.findMany({
      where: whereClause,
      include: serviceProviderAcceptedJobsInclude(serviceProviderId),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // --- Private helpers ---

  private async resolveCreateJobPlacement(
    user: UserWithHOAsForCreate,
    createJobDto: CreateJobDto,
    userId: string,
    userRole: string,
    language: Lang,
  ): Promise<CreateJobPlacement> {
    switch (createJobDto.jobType) {
      case JobType.HOME_SERVICE:
        return this.resolveHomeServiceCreatePlacement(
          user,
          createJobDto,
          userId,
          userRole,
          language,
        );
      case JobType.COMMUNITY_SERVICE:
        return this.resolveCommunityServiceCreatePlacement(
          user,
          createJobDto,
          userId,
          userRole,
          language,
        );
      case JobType.RFQ:
        return this.resolveRfqCreatePlacement(
          createJobDto,
          userId,
          userRole,
          language,
        );
      default:
        throw new BadRequestException(
          this.messageService.getErrorMessage('job.invalid_job_type', language),
        );
    }
  }

  private async resolveHomeServiceCreatePlacement(
    user: UserWithHOAsForCreate,
    createJobDto: CreateJobDto,
    userId: string,
    userRole: string,
    language: Lang,
  ): Promise<CreateJobPlacement> {
    if (userRole === 'HOME_OWNER') {
      const userHOA = user.userHOAs.find((uh) => !uh.isLeader);
      if (!userHOA) {
        throw new BadRequestException(
          this.messageService.getErrorMessage(
            'job.apartment_not_linked',
            language,
          ),
        );
      }

      if (
        createJobDto.apartmentId &&
        createJobDto.apartmentId !== userHOA.hoaId
      ) {
        throw new ForbiddenException(
          this.messageService.getErrorMessage(
            'job.home_service_apartment_mismatch',
            language,
          ),
        );
      }

      return {
        hoaId: userHOA.hoaId,
        leaderId: undefined,
        initialStatus: JobStatus.OPEN,
      };
    }

    if (userRole === 'LEADER') {
      const { hoaId } = await this.assertLeaderLeadsApartment(
        userId,
        createJobDto.apartmentId,
        language,
      );
      return {
        hoaId,
        leaderId: userId,
        initialStatus: JobStatus.OPEN,
      };
    }

    throw new ForbiddenException(
      this.messageService.getErrorMessage(
        'job.invalid_role_home_service',
        language,
      ),
    );
  }

  private async resolveCommunityServiceCreatePlacement(
    user: UserWithHOAsForCreate,
    createJobDto: CreateJobDto,
    userId: string,
    userRole: string,
    language: Lang,
  ): Promise<CreateJobPlacement> {
    if (!createJobDto.apartmentId) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.apartment_id_required_community',
          language,
        ),
      );
    }

    const hoa = await this.prisma.hoa.findUnique({
      where: { id: createJobDto.apartmentId },
      include: {
        userHOAs: {
          where: { isLeader: true },
          include: {
            user: true,
          },
        },
      },
    });

    if (!hoa) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'job.apartment_not_found',
          language,
        ),
      );
    }

    const leaderUserHOA = hoa.userHOAs.find((uh) => uh.isLeader);
    if (!leaderUserHOA) {
      throw new BadRequestException(
        this.messageService.getErrorMessage('apartment.no_leader', language),
      );
    }

    if (userRole === 'HOME_OWNER') {
      const userHOA = user.userHOAs.find(
        (uh) => uh.hoaId === hoa.id && !uh.isLeader,
      );
      if (!userHOA) {
        throw new ForbiddenException(
          this.messageService.getErrorMessage(
            'job.not_authorized_community',
            language,
          ),
        );
      }

      return {
        hoaId: hoa.id,
        leaderId: leaderUserHOA.userId,
        initialStatus: JobStatus.SENT_TO_LEADER,
      };
    }

    if (userRole === 'LEADER') {
      if (leaderUserHOA.userId !== userId) {
        throw new ForbiddenException(
          this.messageService.getErrorMessage(
            'job.not_authorized_apartment',
            language,
          ),
        );
      }

      return {
        hoaId: hoa.id,
        leaderId: userId,
        initialStatus: JobStatus.OPEN,
      };
    }

    throw new ForbiddenException(
      this.messageService.getErrorMessage(
        'job.invalid_role_community_service',
        language,
      ),
    );
  }

  private async resolveRfqCreatePlacement(
    createJobDto: CreateJobDto,
    userId: string,
    userRole: string,
    language: Lang,
  ): Promise<CreateJobPlacement> {
    if (userRole !== 'LEADER') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'job.invalid_role_home_service',
          language,
        ),
      );
    }

    const { hoaId } = await this.assertLeaderLeadsApartment(
      userId,
      createJobDto.apartmentId,
      language,
    );

    return {
      hoaId,
      leaderId: userId,
      initialStatus: JobStatus.OPEN,
    };
  }

  private async requireLeaderRole(
    userId: string,
    language: Lang,
    messageKey: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'LEADER') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(messageKey, language),
      );
    }
  }

  private async assertAllServicesExist(
    serviceIds: string[],
    language: Lang,
  ): Promise<void> {
    const services = await this.prisma.service.findMany({
      where: {
        id: { in: serviceIds },
      },
    });

    if (services.length !== serviceIds.length) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('job.services_not_found', language),
      );
    }
  }

  /** Unique service UUIDs from `services` (order preserved); rejects duplicate service ids. */
  private getServiceIdsFromCreateJobDto(
    createJobDto: CreateJobDto,
    language: Lang,
  ): string[] {
    const ids = (createJobDto.services ?? []).map((s) => s.id);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.duplicate_service_in_job',
          language,
        ),
      );
    }
    return ids;
  }

  /** Maps nested `services[].questions` to the flat list used for validation and persistence. */
  private flattenServiceQuestionAnswersFromDto(
    createJobDto: CreateJobDto,
  ): { serviceQuestionId: string; answer: string }[] {
    const out: { serviceQuestionId: string; answer: string }[] = [];
    for (const svc of createJobDto.services ?? []) {
      for (const q of svc.questions ?? []) {
        out.push({ serviceQuestionId: q.id, answer: q.answer });
      }
    }
    return out;
  }

  private async validateServiceQuestionAnswersForCreate(
    createJobDto: CreateJobDto,
    language: Lang,
    serviceIds: string[],
  ): Promise<void> {
    const flatAnswers = this.flattenServiceQuestionAnswersFromDto(createJobDto);
    if (flatAnswers.length === 0) {
      return;
    }

    const questionIds = [
      ...new Set(flatAnswers.map((a) => a.serviceQuestionId)),
    ];
    const serviceQuestions: { id: string; serviceId: string }[] =
      await this.prisma.serviceQuestion.findMany({
        where: { id: { in: questionIds } },
        select: { id: true, serviceId: true },
      });

    if (serviceQuestions.length !== questionIds.length) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.invalid_service_questions',
          language,
        ),
      );
    }

    const questionById = new Map(serviceQuestions.map((q) => [q.id, q]));

    for (const svc of createJobDto.services ?? []) {
      for (const q of svc.questions ?? []) {
        const row = questionById.get(q.id);
        if (row && row.serviceId !== svc.id) {
          throw new BadRequestException(
            this.messageService.getErrorMessage(
              'job.invalid_service_questions',
              language,
            ),
          );
        }
      }
    }

    const serviceIdSet = new Set(serviceIds);
    const questionNotInJobServices = serviceQuestions.some(
      (sq) => !serviceIdSet.has(sq.serviceId),
    );
    if (questionNotInJobServices) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.service_question_not_in_job_services',
          language,
        ),
      );
    }
  }

  /** For RFQ: every ServiceQuestion belonging to the selected services must be answered. */
  private async assertAllServiceQuestionsAnsweredForRfq(
    createJobDto: CreateJobDto,
    language: Lang,
    serviceIds: string[],
  ): Promise<void> {
    const serviceQuestions: { id: string; serviceId: string }[] =
      await this.prisma.serviceQuestion.findMany({
        where: { serviceId: { in: serviceIds } },
        select: { id: true, serviceId: true },
      });

    if (serviceQuestions.length === 0) {
      return;
    }

    const answeredQuestionIds = new Set(
      this.flattenServiceQuestionAnswersFromDto(createJobDto).map(
        (a) => a.serviceQuestionId,
      ),
    );

    const missingQuestion = serviceQuestions.find(
      (q) => !answeredQuestionIds.has(q.id),
    );

    if (missingQuestion) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.rfq_questions_required',
          language,
        ),
      );
    }
  }

  /** Leader must lead the given apartment (HOA). Used for HOME_SERVICE (leader) and RFQ. */
  private async assertLeaderLeadsApartment(
    userId: string,
    apartmentId: string | undefined,
    language: Lang,
  ): Promise<{ hoaId: string }> {
    if (!apartmentId) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'job.apartment_id_required_leader',
          language,
        ),
      );
    }

    const userHOA = await this.prisma.userHOA.findFirst({
      where: {
        hoaId: apartmentId,
        userId: userId,
        isLeader: true,
      },
    });

    if (!userHOA) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'job.not_authorized_apartment',
          language,
        ),
      );
    }

    return { hoaId: userHOA.hoaId };
  }

  private async loadCommunityJobForLeaderActionOrThrow(
    jobId: string,
    leaderId: string,
    language: Lang,
    action: 'approve' | 'reject',
  ): Promise<void> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        hoa: {
          include: hoaWithLeadersInclude,
        },
      },
    });

    if (!job) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('job.job_not_found', language),
      );
    }

    const wrongTypeKey =
      action === 'approve'
        ? 'job.only_community_jobs_can_be_approved'
        : 'job.only_community_jobs_can_be_rejected';

    if (job.jobType !== 'COMMUNITY_SERVICE') {
      throw new BadRequestException(
        this.messageService.getErrorMessage(wrongTypeKey, language),
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

    const leaderUserHOA = job.hoa.userHOAs.find((uh) => uh.isLeader);
    if (!leaderUserHOA || leaderUserHOA.userId !== leaderId) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          action === 'approve'
            ? 'job.not_authorized_apartment'
            : 'job.not_authorized_reject_apartment',
          language,
        ),
      );
    }
  }
}
