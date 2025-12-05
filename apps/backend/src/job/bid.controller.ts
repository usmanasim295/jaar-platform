import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidStatus } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/auth.guard';
import { LanguageService } from '../common/services/language.service';
import { MessageService } from '../common/services/message.service';

@Controller('bid')
@UseGuards(AuthGuard)
export class BidController {
  constructor(
    private readonly bidService: BidService,
    private readonly languageService: LanguageService,
    private readonly messageService: MessageService,
  ) {}

  @Post()
  @Roles('SERVICE_PROVIDER')
  @UseInterceptors(FileInterceptor('document'))
  async create(
    @Body() createBidDto: CreateBidDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(pdf|doc|docx|jpg|jpeg|png)' }),
        ],
        fileIsRequired: false, // Document is optional
      }),
    )
    document?: Express.Multer.File,
    @Req() req?: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];

    const language = this.languageService.validateLanguage(lang);

    // Check if this is a service provider
    if (user.type !== 'serviceProvider') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'bid.only_service_providers_can_bid',
          language,
        ),
      );
    }
    const result = await this.bidService.create(
      createBidDto,
      user.id,
      document,
      language,
    );

    return {
      ...result,
      bid: this.languageService.transformNestedObjectForLanguage(
        result.bid,
        language,
        {
          job: ['services', 'hoa'],
          serviceProvider: [],
        },
      ),
    };
  }

  @Get()
  async findAll(
    @Query('jobId') jobId?: string,
    @Query('serviceProviderId') serviceProviderId?: string,
    @Query('lang') lang?: string,
  ) {
    const language = this.languageService.validateLanguage(lang);
    let bids;

    if (jobId) {
      bids = await this.bidService.findByJob(jobId);
    } else if (serviceProviderId) {
      bids = await this.bidService.findByServiceProvider(serviceProviderId);
    } else {
      bids = await this.bidService.findAll();
    }

    return this.languageService.transformNestedArrayForLanguage(
      bids,
      language,
      {
        job: ['services', 'hoa'],
        serviceProvider: [],
      },
    );
  }

  @Get('my-bids')
  @Roles('SERVICE_PROVIDER')
  async findMyBids(@Req() req: any, @Query('lang') lang?: string) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);

    // Check if this is a service provider
    if (user.type !== 'serviceProvider') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'bid.only_service_providers_can_view',
          language,
        ),
      );
    }
    const bids = await this.bidService.findByServiceProvider(user.id);

    return this.languageService.transformNestedArrayForLanguage(
      bids,
      language,
      {
        job: ['services', 'hoa'],
        serviceProvider: [],
      },
    );
  }

  @Get('job-bids')
  @Roles('HOME_OWNER', 'LEADER')
  async findJobBids(
    @Req() req: any,
    @Query('jobId') jobId: string,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const bids = await this.bidService.findBidsForJobOwner(
      jobId,
      user.id,
      user.role,
    );

    return this.languageService.transformNestedArrayForLanguage(
      bids,
      language,
      {
        job: ['services', 'hoa', 'leader', 'creator'],
        serviceProvider: [],
      },
    );
  }

  @Get('my-job-bids')
  @Roles('HOME_OWNER', 'LEADER')
  async findMyJobBids(
    @Req() req: any,
    @Query('lang') lang?: string,
    @Query('jobId') jobId?: string,
    @Query('jobType') jobType?: string,
    @Query('status') status?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const bids = await this.bidService.findBidsForUser(
      user.id,
      user.role,
      jobType,
      status,
      jobId,
    );

    return this.languageService.transformNestedArrayForLanguage(
      bids,
      language,
      {
        job: ['services', 'hoa', 'leader', 'creator'],
        serviceProvider: [],
      },
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('lang') lang?: string) {
    const language = this.languageService.validateLanguage(lang);
    const bid = await this.bidService.findOne(id, language);

    return this.languageService.transformNestedObjectForLanguage(
      bid,
      language,
      {
        job: ['services', 'hoa'],
        serviceProvider: [],
      },
    );
  }

  @Patch(':id/status')
  @Roles('HOME_OWNER', 'LEADER')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BidStatus,
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const result = await this.bidService.updateStatus(
      id,
      status,
      user.id,
      user.role,
    );

    return {
      ...result,
      bid: this.languageService.transformNestedObjectForLanguage(
        result.bid,
        language,
        {
          job: ['services', 'hoa'],
          serviceProvider: [],
        },
      ),
    };
  }

  @Delete(':id')
  @Roles('SERVICE_PROVIDER')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);

    // Check if this is a service provider

    if (user.type !== 'serviceProvider') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'bid.only_service_providers_can_delete',
          language,
        ),
      );
    }

    return this.bidService.remove(id, user.id, language);
  }
}
