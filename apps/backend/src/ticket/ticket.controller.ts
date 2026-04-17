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
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketPaginationQueryDto } from './dto/ticket-pagination-query.dto';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { LanguageService } from '../common/services/language.service';
import { S3Service } from '../common/services/s3.service';

@Controller('ticket')
@UseGuards(AuthGuard)
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly languageService: LanguageService,
    private readonly s3Service: S3Service,
  ) {}

  private transformTicketData(tickets: any[], language: 'en' | 'ar') {
    return tickets.map((ticket) => {
      const transformed = this.languageService.transformObjectForLanguage(
        ticket,
        language,
        ['title', 'description', 'reason'],
      );

      if (transformed.hoa) {
        transformed.hoa = this.languageService.transformObjectForLanguage(
          transformed.hoa,
          language,
          ['name', 'city'],
        );
      }

      if (transformed.service) {
        transformed.service = this.languageService.transformObjectForLanguage(
          transformed.service,
          language,
          ['name', 'description'],
        );
      }

      return transformed;
    });
  }

  @Post()
  @Roles('HOME_OWNER', 'LEADER')
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);

    // Upload images to S3 if provided
    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const s3Key = this.s3Service.generateS3Key(
          'ticket-images',
          user.id,
          file.originalname,
        );
        const imageUrl = await this.s3Service.uploadFileBuffer(file, s3Key);
        imageUrls.push(imageUrl);
      }
    }
    (createTicketDto as any).images = imageUrls;

    const result = await this.ticketService.create(
      createTicketDto,
      user.id,
      user.role,
      language,
    );

    return {
      ...result,
      ticket: result.ticket
        ? this.transformTicketData([result.ticket], language)[0]
        : null,
    };
  }

  @Get('my-tickets')
  @Roles('HOME_OWNER', 'LEADER')
  async findMyTickets(
    @Req() req: any,
    @Query() query: TicketPaginationQueryDto,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(query.lang);
    const result = await this.ticketService.findMyTickets(user.id, query);

    return {
      data: this.transformTicketData(result.data, language),
      meta: result.meta,
    };
  }

  @Get('pending')
  @Roles('LEADER')
  async findPendingTickets(
    @Req() req: any,
    @Query() query: TicketPaginationQueryDto,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(query.lang);
    const result = await this.ticketService.findPendingByLeader(
      user.id,
      query,
      language,
    );

    return {
      data: this.transformTicketData(result.data, language),
      meta: result.meta,
    };
  }

  @Get('hoa/:hoaId')
  @Roles('LEADER')
  async findByHoa(
    @Param('hoaId') hoaId: string,
    @Req() req: any,
    @Query() query: TicketPaginationQueryDto,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(query.lang);
    const result = await this.ticketService.findByHoa(
      hoaId,
      user.id,
      query,
      language,
    );

    return {
      data: this.transformTicketData(result.data, language),
      meta: result.meta,
    };
  }

  @Get(':id')
  @Roles('HOME_OWNER', 'LEADER')
  async findOne(@Param('id') id: string, @Query('lang') lang?: string) {
    const language = this.languageService.validateLanguage(lang);
    const ticket = await this.ticketService.findOne(id, language);

    return this.transformTicketData([ticket], language)[0];
  }

  @Patch(':id/approve')
  @Roles('LEADER')
  async approve(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const result = await this.ticketService.approve(
      id,
      user.id,
      updateTicketDto,
      language,
    );

    return {
      ...result,
      ticket: this.transformTicketData([result.ticket], language)[0],
    };
  }

  @Patch(':id/reject')
  @Roles('LEADER')
  async reject(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const result = await this.ticketService.reject(
      id,
      user.id,
      updateTicketDto,
      language,
    );

    return {
      ...result,
      ticket: this.transformTicketData([result.ticket], language)[0],
    };
  }

  @Delete(':id')
  @Roles('HOME_OWNER', 'LEADER')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    return this.ticketService.remove(id, user.id, language);
  }
}
