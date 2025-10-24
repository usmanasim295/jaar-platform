import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { NafathAppService } from './nafath-app.service';
import {
  CreateRequestDto,
  CreateRequestQueryDto,
} from './dto/create-request.dto';
import { RequestStatusDto } from './dto/request-status.dto';
import { WebhookDto, WebhookResponseDto } from './dto/webhook.dto';
import {
  NafathCreateRequestResponseDto,
  NafathStatusResponseDto,
  NafathJwkResponseDto,
} from './dto/nafath-response.dto';
import { Public } from 'src/auth/auth.guard';

@Controller('nafath')
export class NafathAppController {
  private readonly logger = new Logger(NafathAppController.name);

  constructor(private readonly nafathAppService: NafathAppService) {}

  @Public()
  @Post('request')
  @HttpCode(HttpStatus.OK)
  async createRequest(
    @Body() createRequestDto: CreateRequestDto,
    @Query() queryDto: CreateRequestQueryDto,
  ): Promise<NafathCreateRequestResponseDto> {
    console.log(
      `Creating Nafath request for nationalId: ${createRequestDto.nationalId}`,
    );
    return this.nafathAppService.createRequest(createRequestDto, queryDto);
  }

  @Public()
  @Post('request/status')
  @HttpCode(HttpStatus.OK)
  async getRequestStatus(
    @Body() requestStatusDto: RequestStatusDto,
  ): Promise<NafathStatusResponseDto> {
    this.logger.log(
      `Getting Nafath request status for transId: ${requestStatusDto.transId}`,
    );
    return this.nafathAppService.getRequestStatus(requestStatusDto);
  }

  @Public()
  @Get('jwk')
  @HttpCode(HttpStatus.OK)
  async getJwk(): Promise<NafathJwkResponseDto> {
    this.logger.log('Retrieving Nafath JWK');
    return this.nafathAppService.getJwk();
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() webhookDto: WebhookDto,
  ): Promise<WebhookResponseDto> {
    this.logger.log(
      `Received Nafath webhook for transId: ${webhookDto.transId}`,
    );
    return this.nafathAppService.handleWebhook(webhookDto);
  }
}
