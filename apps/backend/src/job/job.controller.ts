import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/auth.guard';
import { LanguageService } from '../common/services/language.service';
import { MessageService } from '../common/services/message.service';
import { BadRequestException } from '@nestjs/common';
import { JobType as PrismaJobType } from '@prisma/client';
@Controller('job')
@UseGuards(AuthGuard)
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly languageService: LanguageService,
    private readonly messageService: MessageService,
  ) {}

  private transformJobData(jobs: any[], language: 'en' | 'ar') {
    return jobs.map((job) => {
      // Transform main job fields
      const transformedJob = this.languageService.transformObjectForLanguage(
        job,
        language,
        [
          'title',
          'description',
          'timeSlot',
          'workDuration',
          'location',
          'experienceLevel',
        ],
      );

      // Transform HOA data
      if (transformedJob.hoa) {
        transformedJob.hoa = this.languageService.transformObjectForLanguage(
          transformedJob.apartment,
          language,
          ['name', 'address', 'city', 'state', 'country'],
        );
      }

      // Transform services array
      if (transformedJob.services) {
        transformedJob.services = transformedJob.services.map(
          (serviceItem: any) => ({
            ...serviceItem,
            service: serviceItem.service
              ? this.languageService.transformObjectForLanguage(
                  serviceItem.service,
                  language,
                  ['name', 'description'],
                )
              : serviceItem.service,
          }),
        );
      }

      // Transform bids array
      if (transformedJob.bids) {
        transformedJob.bids = transformedJob.bids.map((bid: any) => ({
          ...bid,
          coverLetter: this.languageService.extractTranslation(
            bid.coverLetter,
            language,
          ),
          serviceProvider: bid.serviceProvider
            ? this.languageService.transformObjectForLanguage(
                bid.serviceProvider,
                language,
                ['name', 'bio', 'firstName', 'lastName'],
              )
            : bid.serviceProvider,
        }));
      }

      // Transform RFQ serviceQuestionAnswers
      if (transformedJob.serviceQuestionAnswers) {
        transformedJob.serviceQuestionAnswers =
          transformedJob.serviceQuestionAnswers.map((item: any) => ({
            ...item,
            answer: this.languageService.extractTranslation(
              item.answer,
              language,
            ),
            serviceQuestion: item.serviceQuestion
              ? {
                  ...item.serviceQuestion,
                  question: this.languageService.extractTranslation(
                    item.serviceQuestion.question,
                    language,
                  ),
                  service: item.serviceQuestion.service
                    ? this.languageService.transformObjectForLanguage(
                        item.serviceQuestion.service,
                        language,
                        ['name', 'description'],
                      )
                    : item.serviceQuestion.service,
                }
              : item.serviceQuestion,
          }));
      }

      return transformedJob;
    });
  }

  @Post()
  @Roles('HOME_OWNER', 'LEADER')
  async create(
    @Body() createJobDto: CreateJobDto,
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const result = await this.jobService.create(
      createJobDto,
      user.id,
      user.role,
      language,
    );

    return {
      ...result,
      job: result.job
        ? this.languageService.transformNestedObjectForLanguage(
            result.job,
            language,
            {
              services: ['service'],
              hoa: [],
              leader: [],
              creator: [],
              bids: ['serviceProvider'],
            },
          )
        : null,
    };
  }

  @Get()
  async findAll(@Query('lang') lang?: string) {
    const language = this.languageService.validateLanguage(lang);
    const jobs = await this.jobService.findAll();

    return this.transformJobData(jobs, language);
  }

  // @Get('my-jobs')
  // @Roles('HOME_OWNER', 'LEADER')
  // async findMyJobs(@Req() req: any, @Query('lang') lang?: string) {
  //   const user = req['user'];
  //   const language = this.languageService.validateLanguage(lang);
  //   const jobs = await this.jobService.findByCreator(user.id);

  //   return this.languageService.transformNestedArrayForLanguage(
  //     jobs,
  //     language,
  //     {
  //       services: ['service'],
  //       apartment: [],
  //       leader: [],
  //       creator: [],
  //       bids: ['serviceProvider']
  //     }
  //   );
  // }

  @Get('my-jobs')
  @Roles('HOME_OWNER', 'LEADER')
  async filterByJobType(
    @Req() req: any,

    @Query('jobType') jobType: PrismaJobType,
    @Query('status') status?: JobStatus,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];

    if (!jobType) {
      throw new BadRequestException('jobType is required');
    }

    const language = this.languageService.validateLanguage(lang);

    const jobs = await this.jobService.findByJobType(
      user.id,
      user.role,
      jobType,
      status,
    );
    return this.transformJobData(jobs, language);
  }

  @Get('pending-community-jobs')
  @Roles('LEADER')
  async findPendingCommunityJobs(
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const jobs = await this.jobService.findPendingCommunityJobs(user.id);

    return this.transformJobData(jobs, language);
  }

  @Get('leader-jobs')
  @Roles('LEADER')
  async findLeaderJobs(@Req() req: any, @Query('lang') lang?: string) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const jobs = await this.jobService.findByLeader(user.id);

    return this.transformJobData(jobs, language);
  }

  @Get('service-provider-jobs')
  @Roles('SERVICE_PROVIDER')
  async findServiceProviderJobs(
    @Req() req: any,
    @Query('lang') lang?: string,
    @Query('jobType') jobType?: string,
    @Query('status') status?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);

    // Check if this is a service provider
    if (user.type !== 'serviceProvider') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'job.only_service_providers_can_view_jobs',
          language,
        ),
      );
    }
    const jobs = await this.jobService.findServiceProviderJobs(
      user.id,
      jobType,
      status,
    );

    return this.transformJobData(jobs, language);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('lang') lang?: string) {
    const language = this.languageService.validateLanguage(lang);
    const job = await this.jobService.findOne(id, language);

    return this.transformJobData([job], language)[0];
  }

  @Patch(':id/approve')
  @Roles('LEADER')
  async approveCommunityJob(
    @Param('id') id: string,
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const result = await this.jobService.approveCommunityJob(
      id,
      user.id,
      language,
    );

    return {
      ...result,
      job: this.languageService.transformNestedObjectForLanguage(
        result.job,
        language,
        {
          services: ['service'],
          apartment: [],
          leader: [],
          creator: [],
        },
      ),
    };
  }

  @Patch(':id/reject')
  @Roles('LEADER')
  async rejectCommunityJob(
    @Param('id') id: string,
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const result = await this.jobService.rejectCommunityJob(
      id,
      user.id,
      language,
    );

    return {
      ...result,
      job: this.languageService.transformNestedObjectForLanguage(
        result.job,
        language,
        {
          services: ['service'],
          apartment: [],
          leader: [],
          creator: [],
        },
      ),
    };
  }

  @Patch(':id')
  @Roles('LEADER')
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const result = await this.jobService.update(
      id,
      updateJobDto,
      user.id,
      language,
    );

    return {
      ...result,
      job: result.job
        ? this.languageService.transformNestedObjectForLanguage(
            result.job,
            language,
            {
              services: ['service'],
              hoa: [],
              leader: [],
            },
          )
        : null,
    };
  }

  @Patch(':id/status')
  @Roles('LEADER')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: JobStatus,
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const result = await this.jobService.updateStatus(
      id,
      status,
      user.id,
      language,
    );

    return {
      ...result,
      job: this.languageService.transformNestedObjectForLanguage(
        result.job,
        language,
        {
          services: ['service'],
          apartment: [],
          leader: [],
        },
      ),
    };
  }

  @Delete(':id')
  @Roles('LEADER')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    return this.jobService.remove(id, user.id, language);
  }

  @Get('my-jobs/:id')
  @Roles('HOME_OWNER', 'LEADER')
  async getMyJobDetail(
    @Param('id') id: string,
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);

    const job = await this.jobService.findMyJobById(
      id,
      user.id,
      user.role,
      language,
    );

    return this.transformJobData([job], language)[0];
  }
}
