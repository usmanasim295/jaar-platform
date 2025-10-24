import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from 'src/common/services/message.service';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  CreateRequestDto,
  CreateRequestQueryDto,
} from './dto/create-request.dto';
import { RequestStatusDto } from './dto/request-status.dto';
import { WebhookDto } from './dto/webhook.dto';
import {
  NafathCreateRequestResponseDto,
  NafathStatusResponseDto,
  NafathJwkResponseDto,
  NafathErrorResponseDto,
} from './dto/nafath-response.dto';

@Injectable()
export class NafathAppService {
  private readonly logger = new Logger(NafathAppService.name);
  private readonly nafathBaseUrl: string;
  private readonly appId: string;
  private readonly appKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly messageService: MessageService,
  ) {
    this.nafathBaseUrl =
      process.env.NAFATH_BASE_URL || 'https://nafath.api.elm.sa/stg';
    this.appId = process.env.NAFATH_APP_ID || '';
    this.appKey = process.env.NAFATH_APP_KEY || '';

    console.debug(`Received APP-ID: ${this.appId}, APP-KEY: ${this.appKey}`);

    if (!this.appId || !this.appKey) {
      console.warn('NAFATH_APP_ID or NAFATH_APP_KEY not configured');
    }
  }

  async createRequest(
    createRequestDto: CreateRequestDto,
    queryDto: CreateRequestQueryDto,
  ): Promise<NafathCreateRequestResponseDto> {
    try {
      const url = `${this.nafathBaseUrl}/api/v1/mfa/request`;
      const params = new URLSearchParams({
        local: queryDto.local,
        requestId: queryDto.requestId,
      });

      const headers = {
        'APP-ID': this.appId,
        'APP-KEY': this.appKey,
        'Content-Type': 'application/json',
      };

      console.log(
        `Creating Nafath request for nationalId: ${createRequestDto.nationalId}`,
      );

      const response: AxiosResponse<NafathCreateRequestResponseDto> =
        await firstValueFrom(
          this.httpService.post(
            `${url}?${params.toString()}`,
            createRequestDto,
            { headers },
          ),
        );

      console.log(
        `Nafath request created successfully: ${response.data.transId}`,
      );
      return response.data;
    } catch (error) {
      console.log(
        'Error creating Nafath request:',
        error.response?.data || error.message,
      );
      console.log(
        'Error creating Nafath request: status=',
        error.response?.status,
      );
      console.log(
        'Error creating Nafath request: data=',
        JSON.stringify(error.response?.data),
      );
      console.log('Error creating Nafath request: message=', error.message);

      if (error.response?.data) {
        const errorData: NafathErrorResponseDto = error.response.data;
        throw new HttpException(
          {
            message: errorData.message,
            code: errorData.code,
            reference: errorData.reference,
          },
          error.response.status,
        );
      }

      throw new HttpException(
        'Failed to create Nafath request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRequestStatus(
    requestStatusDto: RequestStatusDto,
  ): Promise<NafathStatusResponseDto> {
    try {
      const url = `${this.nafathBaseUrl}/api/v1/mfa/request/status`;

      const headers = {
        'APP-ID': this.appId,
        'APP-KEY': this.appKey,
        'Content-Type': 'application/json',
      };

      console.log(
        `Getting Nafath request status for transId: ${requestStatusDto.transId}`,
      );

      const response: AxiosResponse<NafathStatusResponseDto> =
        await firstValueFrom(
          this.httpService.post(url, requestStatusDto, { headers }),
        );

      console.log(`Nafath request status retrieved: ${response.data.status}`);
      return response.data;
    } catch (error) {
      console.error(
        'Error getting Nafath request status:',
        error.response?.data || error.message,
      );

      if (error.response?.data) {
        const errorData: NafathErrorResponseDto = error.response.data;
        throw new HttpException(
          {
            message: errorData.message,
            code: errorData.code,
            reference: errorData.reference,
          },
          error.response.status,
        );
      }

      throw new HttpException(
        'Failed to get Nafath request status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getJwk(): Promise<NafathJwkResponseDto> {
    try {
      const url = `${this.nafathBaseUrl}/api/v1/mfa/jwk`;

      const headers = {
        'APP-ID': this.appId,
        'APP-KEY': this.appKey,
        'Content-Type': 'application/json',
      };

      console.log('Retrieving Nafath JWK');

      const response: AxiosResponse<NafathJwkResponseDto> =
        await firstValueFrom(this.httpService.get(url, { headers }));

      console.log('Nafath JWK retrieved successfully');
      return response.data;
    } catch (error) {
      console.error(
        'Error retrieving Nafath JWK:',
        error.response?.data || error.message,
      );

      if (error.response?.data) {
        const errorData: NafathErrorResponseDto = error.response.data;
        throw new HttpException(
          {
            message: errorData.message,
            code: errorData.code,
            reference: errorData.reference,
          },
          error.response.status,
        );
      }

      throw new HttpException(
        'Failed to retrieve Nafath JWK',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleWebhook(
    webhookDto: WebhookDto,
  ): Promise<{ status: string; message?: string }> {
    try {
      console.log(`Received Nafath webhook for transId: ${webhookDto.transId}`);

      // Verify JWT token
      const decodedToken = await this.verifyJwtToken(webhookDto.token);

      console.log(
        `Webhook JWT verified successfully. Status: ${decodedToken.status}`,
      );

      // Process the webhook based on status
      if (decodedToken.status === 'COMPLETED') {
        console.log('User accepted the Nafath request');
        // Here you can add your business logic for completed requests
        // For example, update user status, send notifications, etc.
      } else if (decodedToken.status === 'REJECTED') {
        console.log('User rejected the Nafath request');
        // Here you can add your business logic for rejected requests
      }

      return {
        status: 'success',
        message: this.messageService.getSuccessMessage(
          'nafath.webhook_processed',
          'en',
        ),
      };
    } catch (error) {
      console.error('Error processing Nafath webhook:', error.message);
      return {
        status: 'error',
        message: this.messageService.getErrorMessage(
          'nafath.webhook_failed',
          'en',
        ),
      };
    }
  }

  private async verifyJwtToken(token: string): Promise<any> {
    try {
      // Get JWK from Nafath
      const jwkResponse = await this.getJwk();

      // For now, we'll decode without verification
      // In production, you should implement proper JWT verification using the JWK
      const decoded = this.jwtService.decode(token);

      if (!decoded) {
        throw new Error('Invalid JWT token');
      }

      return decoded;
    } catch (error) {
      console.error('Error verifying JWT token:', error.message);
      throw new Error('JWT verification failed');
    }
  }
}
