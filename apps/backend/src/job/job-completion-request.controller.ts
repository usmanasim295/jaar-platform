import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Query,
  UseGuards,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
  AnyFilesInterceptor,
} from '@nestjs/platform-express';
import { JobCompletionRequestService } from './job-completion-request.service';
import { CreateJobCompletionRequestDto } from './dto/create-job-completion-request.dto';
import { UpdateJobCompletionRequestDto } from './dto/update-job-completion-request.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/auth.guard';
import { LanguageService } from '../common/services/language.service';
import { S3Service } from '../common/services/s3.service';

@Controller('job-completion-request')
@UseGuards(AuthGuard)
export class JobCompletionRequestController {
  constructor(
    private readonly jobCompletionRequestService: JobCompletionRequestService,
    private readonly languageService: LanguageService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @Roles('SERVICE_PROVIDER')
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Body() createDto: CreateJobCompletionRequestDto,
    @UploadedFile() files?: Express.Multer.File[],
    @Req() req?: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];

    // Check if this is a service provider
    if (user.type !== 'serviceProvider') {
      throw new ForbiddenException(
        'Only service providers can create completion requests',
      );
    }

    const language = this.languageService.validateLanguage(lang);

    // Handle file uploads
    if (files && files.length > 0) {
      const imageUrls: string[] = [];
      let additionalDocumentUrl: string | undefined;

      for (const file of files) {
        if (file.fieldname === 'completionImages') {
          // Handle completion images
          const s3Key = this.s3Service.generateS3Key(
            'completion-images',
            user.id,
            file.originalname,
          );
          const imageUrl = await this.s3Service.uploadFileBuffer(file, s3Key);
          imageUrls.push(imageUrl);
        } else if (file.fieldname === 'additionalDocument') {
          // Handle additional document
          const s3Key = this.s3Service.generateS3Key(
            'completion-documents',
            user.id,
            file.originalname,
          );
          additionalDocumentUrl = await this.s3Service.uploadFileBuffer(
            file,
            s3Key,
          );
        }
      }

      (createDto as any).completionImages = imageUrls;
      if (additionalDocumentUrl) {
        createDto.additionalDocumentUrl = additionalDocumentUrl;
      }
    }

    const result = await this.jobCompletionRequestService.create(
      createDto,
      user.id,
    );

    return {
      ...result,
      completionRequest: this.languageService.transformNestedObjectForLanguage(
        result.completionRequest,
        language,
        {
          job: ['services', 'apartment', 'leader', 'creator'],
          serviceProvider: [],
          reviewer: [],
        },
      ),
    };
  }

  @Get('my-requests')
  @Roles('SERVICE_PROVIDER')
  async findMyRequests(
    @Req() req: any,
    @Query('lang') lang?: string,
    @Query('jobType') jobType?: string,
    @Query('status') status?: string,
  ) {
    const user = req['user'];

    // Check if this is a service provider
    if (user.type !== 'serviceProvider') {
      throw new ForbiddenException(
        'Only service providers can view their completion requests',
      );
    }

    const language = this.languageService.validateLanguage(lang);
    const requests =
      await this.jobCompletionRequestService.findByServiceProvider(
        user.id,
        jobType,
        status,
      );

    return this.languageService.transformNestedArrayForLanguage(
      requests,
      language,
      {
        job: ['services', 'apartment', 'leader', 'creator'],
        serviceProvider: [],
        reviewer: [],
      },
    );
  }

  @Get('my-jobs')
  @Roles('SERVICE_PROVIDER')
  async findMyJobs(
    @Req() req: any,
    @Query('lang') lang?: string,
    @Query('jobType') jobType?: string,
    @Query('status') status?: string,
  ) {
    const user = req['user'];

    // Check if this is a service provider
    if (user.type !== 'serviceProvider') {
      throw new ForbiddenException(
        'Only service providers can view their jobs',
      );
    }

    const language = this.languageService.validateLanguage(lang);
    const jobs = await this.jobCompletionRequestService.getServiceProviderJobs(
      user.id,
      jobType,
      status,
    );

    return this.languageService.transformNestedArrayForLanguage(
      jobs,
      language,
      {
        services: ['service'],
        apartment: [],
        leader: [],
        creator: [],
        bids: ['serviceProvider'],
        completionRequests: ['reviewer'],
      },
    );
  }

  @Get('pending')
  @Roles('HOME_OWNER', 'LEADER')
  async findPendingRequests(@Req() req: any, @Query('lang') lang?: string) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const requests = await this.jobCompletionRequestService.findPendingRequests(
      user.id,
      user.role,
    );

    return this.languageService.transformNestedArrayForLanguage(
      requests,
      language,
      {
        job: ['services', 'apartment', 'leader', 'creator'],
        serviceProvider: [],
      },
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('lang') lang?: string) {
    const language = this.languageService.validateLanguage(lang);
    const request = await this.jobCompletionRequestService.findOne(id);

    return this.languageService.transformNestedObjectForLanguage(
      request,
      language,
      {
        job: ['services', 'apartment', 'leader', 'creator'],
        serviceProvider: [],
        reviewer: [],
      },
    );
  }

  @Patch(':id/status')
  @Roles('HOME_OWNER', 'LEADER')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateJobCompletionRequestDto,
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const result = await this.jobCompletionRequestService.updateStatus(
      id,
      updateDto,
      user.id,
      user.role,
    );

    return {
      ...result,
      completionRequest: this.languageService.transformNestedObjectForLanguage(
        result.completionRequest,
        language,
        {
          job: ['services', 'apartment', 'leader', 'creator'],
          serviceProvider: [],
          reviewer: [],
        },
      ),
    };
  }
}
