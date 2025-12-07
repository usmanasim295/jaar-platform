import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from 'src/common/services/message.service';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatusDto } from './dto/request-status.dto';
import { WebhookDto } from './dto/webhook.dto';
import {
  NafathCreateRequestResponseDto,
  NafathStatusResponseDto,
  NafathJwkResponseDto,
  // NafathErrorResponseDto,
} from './dto/nafath-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
    private readonly prisma: PrismaService,
  ) {
    // Remove quotes and whitespace from env variables
    this.nafathBaseUrl = (
      process.env.NAFATH_BASE_URL || 'https://nafath.api.elm.sa'
    )
      .replace(/^["']|["']$/g, '')
      .trim();
    this.appId = (process.env.NAFATH_APP_ID || '')
      .replace(/^["']|["']$/g, '')
      .trim();
    this.appKey = (process.env.NAFATH_APP_KEY || '')
      .replace(/^["']|["']$/g, '')
      .trim();

    // console.debug(`Received APP-ID: ${this.appId}, APP-KEY: ${this.appKey}`);
    // console.debug(`NAFATH_BASE_URL: ${this.nafathBaseUrl}`);

    if (!this.appId || !this.appKey) {
      console.warn('NAFATH_APP_ID or NAFATH_APP_KEY not configured');
    }
  }

  private buildCurl(
    method: 'GET' | 'POST',
    url: string,
    headers: Record<string, string>,
    body?: unknown,
  ): string {
    // Remove quotes from URL if present
    const cleanUrl = url.replace(/^["']|["']$/g, '');

    // Build header parts, ensuring values don't have extra quotes
    const headerParts = Object.entries(headers).map(([key, value]) => {
      // Remove quotes from header values
      const cleanValue = String(value).replace(/^["']|["']$/g, '');
      // Escape single quotes in values
      const escapedValue = cleanValue.replace(/'/g, "'\\''");
      return `-H '${key}: ${escapedValue}'`;
    });

    // Build data part
    const dataPart = body
      ? ` -d '${JSON.stringify(body).replace(/'/g, "'\\''")}'`
      : '';

    return `curl -X ${method} '${cleanUrl}' ${headerParts.join(' ')}${dataPart}`;
  }

  async createRequest(
    createRequestDto: CreateRequestDto,
  ): Promise<NafathStatusResponseDto> {
    try {
      // Ensure base URL doesn't have trailing slash and construct full URL
      const baseUrl = this.nafathBaseUrl.replace(/\/$/, '');
      const url = `${baseUrl}/api/v1/mfa/request`;

      const existingNafathVerification =
        await this.prisma.nafathVerification.findFirst({
          where: {
            nationalId: createRequestDto.nationalId,
          },
        });
      let nafathVerification = existingNafathVerification;
      if (
        existingNafathVerification &&
        existingNafathVerification.status === 'COMPLETED'
      ) {
        return { status: existingNafathVerification.status };
      } else if (existingNafathVerification) {
        nafathVerification = await this.prisma.nafathVerification.update({
          where: { nationalId: createRequestDto.nationalId },
          data: {
            status: 'WAITING',
          },
        });
      } else {
        nafathVerification = await this.prisma.nafathVerification.create({
          data: {
            nationalId: createRequestDto.nationalId,
            status: 'WAITING',
          },
        });
      }
      const params = new URLSearchParams({
        local: 'en',
        requestId: nafathVerification.id,
      });
      const fullUrl = `${url}?${params.toString()}`;

      const headers = {
        'APP-ID': this.appId,
        'APP-KEY': this.appKey,
        'Content-Type': 'application/json',
      };

      console.log(
        `Creating Nafath request for nationalId: ${createRequestDto.nationalId}`,
      );
      console.log(`Full URL: ${fullUrl}`);
      console.log(`Headers:`, JSON.stringify(headers, null, 2));
      const body = {
        service: 'Login',
        ...createRequestDto,
      };
      // Log curl equivalent
      const curlCreate = this.buildCurl('POST', fullUrl, headers, body);
      console.log('[NAFATH CURL] Create Request:', curlCreate);

      const response: AxiosResponse<NafathCreateRequestResponseDto> =
        await firstValueFrom(
          this.httpService.post(fullUrl, createRequestDto, { headers }),
        );

      console.log(
        `Nafath request created successfully: ${response.data.transId}`,
      );
      nafathVerification = await this.prisma.nafathVerification.update({
        where: { id: nafathVerification.id },
        data: {
          transId: response.data.transId,
          random: response.data.random,
        },
      });
      return { status: nafathVerification.status };
    } catch (error: any) {
      // Comprehensive error logging
      console.error('========== NAFATH CREATE REQUEST ERROR ==========');
      console.error('Error Type:', error?.constructor?.name || typeof error);
      console.error('Error Message:', error?.message);
      console.error('Error Stack:', error?.stack);

      if (error?.response) {
        console.error('HTTP Status:', error.response.status);
        console.error('HTTP Status Text:', error.response.statusText);
        console.error(
          'Response Headers:',
          JSON.stringify(error.response.headers, null, 2),
        );
        console.error(
          'Response Data:',
          JSON.stringify(error.response.data, null, 2),
        );
      }

      if (error?.request) {
        console.error(
          'Request Config:',
          JSON.stringify(
            {
              url: error.config?.url,
              method: error.config?.method,
              headers: error.config?.headers,
              data: error.config?.data,
            },
            null,
            2,
          ),
        );
      }

      if (error?.config) {
        console.error(
          'Axios Config:',
          JSON.stringify(
            {
              url: error.config.url,
              method: error.config.method,
              baseURL: error.config.baseURL,
              timeout: error.config.timeout,
              headers: error.config.headers,
            },
            null,
            2,
          ),
        );
      }

      console.error(
        'Full Error Object:',
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      console.error('=================================================');

      throw new HttpException(
        {
          message: error.message || 'Failed to create Nafath request',
          error: 'NafathRequestError',
        },
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRequestStatus(
    requestStatusDto: RequestStatusDto,
  ): Promise<NafathStatusResponseDto> {
    try {
      // Ensure base URL doesn't have trailing slash
      const baseUrl = this.nafathBaseUrl.replace(/\/$/, '');
      const url = `${baseUrl}/api/v1/mfa/request/status`;

      const nafathVerification = await this.prisma.nafathVerification.findFirst(
        {
          where: {
            nationalId: requestStatusDto.nationalId,
          },
        },
      );

      const headers = {
        'APP-ID': this.appId,
        'APP-KEY': this.appKey,
        'Content-Type': 'application/json',
      };

      console.log(
        `Getting Nafath request status for transId: ${requestStatusDto.transId}`,
      );
      console.log(`Full URL: ${url}`);
      console.log(`Headers:`, JSON.stringify(headers, null, 2));

      // Log curl equivalent
      const curlStatus = this.buildCurl('POST', url, headers, requestStatusDto);
      console.log('[NAFATH CURL] Get Status:', curlStatus);
      const body = {
        transId: nafathVerification.transId,
        random: nafathVerification.random,
        nationalId: nafathVerification.nationalId,
      };
      const response: AxiosResponse<NafathStatusResponseDto> =
        await firstValueFrom(this.httpService.post(url, body, { headers }));

      console.log(`Nafath request status retrieved: ${response.data.status}`);
      return response.data;
    } catch (error: any) {
      // Comprehensive error logging
      console.error('========== NAFATH GET STATUS ERROR ==========');
      console.error('Error Type:', error?.constructor?.name || typeof error);
      console.error('Error Message:', error?.message);
      console.error('Error Stack:', error?.stack);

      if (error?.response) {
        console.error('HTTP Status:', error.response.status);
        console.error('HTTP Status Text:', error.response.statusText);
        console.error(
          'Response Headers:',
          JSON.stringify(error.response.headers, null, 2),
        );
        console.error(
          'Response Data:',
          JSON.stringify(error.response.data, null, 2),
        );
      }

      if (error?.config) {
        console.error(
          'Axios Config:',
          JSON.stringify(
            {
              url: error.config.url,
              method: error.config.method,
              baseURL: error.config.baseURL,
              headers: error.config.headers,
              data: error.config.data,
            },
            null,
            2,
          ),
        );
      }

      console.error(
        'Full Error Object:',
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      console.error('=============================================');

      throw new HttpException(
        {
          message: error.message || 'Failed to get Nafath request status',
          error: 'NafathStatusError',
        },
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getJwk(): Promise<NafathJwkResponseDto> {
    try {
      // Ensure base URL doesn't have trailing slash
      const baseUrl = this.nafathBaseUrl.replace(/\/$/, '');
      const url = `${baseUrl}/api/v1/mfa/jwk`;

      const headers = {
        'APP-ID': this.appId,
        'APP-KEY': this.appKey,
        'Content-Type': 'application/json',
      };

      console.log('Retrieving Nafath JWK');
      console.log(`Full URL: ${url}`);
      console.log(`Headers:`, JSON.stringify(headers, null, 2));

      // Log curl equivalent
      const curlJwk = this.buildCurl('GET', url, headers);
      console.log('[NAFATH CURL] Get JWK:', curlJwk);

      const response: AxiosResponse<NafathJwkResponseDto> =
        await firstValueFrom(this.httpService.get(url, { headers }));

      console.log('Nafath JWK retrieved successfully');
      return response.data;
    } catch (error: any) {
      // Comprehensive error logging
      console.error('========== NAFATH GET JWK ERROR ==========');
      console.error('Error Type:', error?.constructor?.name || typeof error);
      console.error('Error Message:', error?.message);
      console.error('Error Stack:', error?.stack);

      if (error?.response) {
        console.error('HTTP Status:', error.response.status);
        console.error('HTTP Status Text:', error.response.statusText);
        console.error(
          'Response Headers:',
          JSON.stringify(error.response.headers, null, 2),
        );
        console.error(
          'Response Data:',
          JSON.stringify(error.response.data, null, 2),
        );
      }

      if (error?.config) {
        console.error(
          'Axios Config:',
          JSON.stringify(
            {
              url: error.config.url,
              method: error.config.method,
              baseURL: error.config.baseURL,
              headers: error.config.headers,
            },
            null,
            2,
          ),
        );
      }

      console.error(
        'Full Error Object:',
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      console.error('==========================================');

      throw new HttpException(
        {
          message: error.message || 'Failed to retrieve Nafath JWK',
          error: 'NafathJwkError',
        },
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleWebhook(
    webhookDto: WebhookDto,
  ): Promise<{ status: string; message?: string }> {
    try {
      console.log(`Received Nafath webhook for transId: ${webhookDto.transId}`);

      await this.prisma.tempNafathWebhook.create({
        data: {
          response: webhookDto,
        },
      });
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
