import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from 'src/common/services/message.service';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatusDto } from './dto/request-status.dto';
import { WebhookDto } from './dto/webhook.dto';
import {
  NafathCreateRequestResponseDto,
  NafathStatusResponseDto,
  NafathJwkResponseDto,
} from './dto/nafath-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NafathVerificationStatus } from '@prisma/client';

/**
 * Constants for Nafath API configuration
 */
const NAFATH_API_ENDPOINTS = {
  CREATE_REQUEST: '/api/v1/mfa/request',
  REQUEST_STATUS: '/api/v1/mfa/request/status',
  REQUEST_UPDATE: '/api/v1/mfa/request/update',
  JWK: '/api/v1/mfa/jwk',
} as const;

const NAFATH_HEADERS = {
  APP_ID: 'APP-ID',
  APP_KEY: 'APP-KEY',
  CONTENT_TYPE: 'Content-Type',
} as const;

const DEFAULT_CONFIG = {
  BASE_URL: 'https://nafath.api.elm.sa',
  SERVICE: 'Login',
  LOCALE: 'en',
  DEFAULT_ALGORITHM: 'RS256' as jwt.Algorithm,
} as const;

/**
 * Interface for JWT decoded token
 */
interface DecodedJwtToken {
  status: NafathVerificationStatus;
  nationalId?: string;
  [key: string]: unknown;
}

/**
 * Interface for national address structure from Nafath
 */
interface NationalAddress {
  streetName?: string;
  streetL2?: string;
  buildingNumber?: string;
  postCode?: string;
  city?: string;
  cityL2?: string;
  regionName?: string;
  regionNameL2?: string;
  district?: string;
  districtL2?: string;
}

/**
 * Interface for Nafath token payload
 */
interface NafathTokenPayload {
  firstName?: string;
  englishFirstName?: string;
  familyName?: string;
  englishLastName?: string;
  fatherName?: string;
  englishSecondName?: string;
  gender?: 'M' | 'F';
  dateOfBirthH?: string;
  dateOfBirthG?: string;
  nationality?: string;
  nationalAddress?: NationalAddress[];
  status: NafathVerificationStatus;
  [key: string]: unknown;
}

/**
 * Interface for filtered user data structure
 */
interface FilteredUserData {
  firstName: { ar: string; en: string };
  lastName: { ar: string; en: string };
  fatherName: { ar: string; en: string };
  gender: { ar: string; en: string };
  dateOfBirth: { ar: string; en: string };
  nationality: { ar: string; en: string };
  street?: { ar: string; en: string };
  buildingNumber?: { ar: string; en: string };
  postalCode?: { ar: string; en: string };
  city?: { ar: string; en: string };
  region?: { ar: string; en: string };
  district?: { ar: string; en: string };
}

/**
 * Interface for JWK structure
 */
interface JwkKey {
  kty: string;
  n: string;
  e: string;
  alg?: string;
  kid?: string;
}

@Injectable()
export class NafathAppService {
  private readonly logger = new Logger(NafathAppService.name);
  private readonly nafathBaseUrl: string;
  private readonly nafathUpdateBaseUrl: string;
  private readonly appId: string;
  private readonly appKey: string;
  private readonly service: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly messageService: MessageService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.nafathBaseUrl = this.sanitizeEnvVar(
      this.configService.get<string>('NAFATH_BASE_URL') ||
        DEFAULT_CONFIG.BASE_URL,
    );
    this.nafathUpdateBaseUrl = this.sanitizeEnvVar(
      this.configService.get<string>('NAFATH_UPDATE_BASE_URL') ||
        DEFAULT_CONFIG.BASE_URL,
    );
    this.appId = this.sanitizeEnvVar(
      this.configService.get<string>('NAFATH_APP_ID') || '',
    );
    this.appKey = this.sanitizeEnvVar(
      this.configService.get<string>('NAFATH_APP_KEY') || '',
    );
    this.service = this.sanitizeEnvVar(
      this.configService.get<string>('NAFATH_SERVICE') ||
        DEFAULT_CONFIG.SERVICE,
    );

    if (!this.appId || !this.appKey) {
      this.logger.warn(
        'NAFATH_APP_ID or NAFATH_APP_KEY not configured properly',
      );
    }
  }

  /**
   * Sanitizes environment variable by removing quotes and trimming whitespace
   */
  private sanitizeEnvVar(value: string): string {
    return value.replace(/^["']|["']$/g, '').trim();
  }

  /**
   * Builds a normalized URL by ensuring base URL doesn't have trailing slash
   */
  private buildUrl(endpoint: string, baseUrl?: string): string {
    const base = (baseUrl || this.nafathBaseUrl).replace(/\/$/, '');
    return `${base}${endpoint}`;
  }

  /**
   * Builds standard Nafath API headers
   */
  private buildHeaders(): Record<string, string> {
    return {
      [NAFATH_HEADERS.APP_ID]: this.appId,
      [NAFATH_HEADERS.APP_KEY]: this.appKey,
      [NAFATH_HEADERS.CONTENT_TYPE]: 'application/json',
    };
  }

  /**
   * Builds a curl command string for debugging purposes
   */
  private buildCurlCommand(
    method: 'GET' | 'POST',
    url: string,
    headers: Record<string, string>,
    body?: unknown,
  ): string {
    const cleanUrl = url.replace(/^["']|["']$/g, '');
    const headerParts = Object.entries(headers).map(([key, value]) => {
      const cleanValue = String(value).replace(/^["']|["']$/g, '');
      const escapedValue = cleanValue.replace(/'/g, "'\\''");
      return `-H '${key}: ${escapedValue}'`;
    });

    const dataPart = body
      ? ` -d '${JSON.stringify(body).replace(/'/g, "'\\''")}'`
      : '';

    return `curl -X ${method} '${cleanUrl}' ${headerParts.join(' ')}${dataPart}`;
  }

  /**
   * Handles and logs HTTP errors consistently
   */
  private handleHttpError(
    error: AxiosError | Error,
    operation: string,
    defaultMessage: string,
  ): never {
    this.logger.error(`========== NAFATH ${operation} ERROR ==========`);
    this.logger.error(
      `Error Type: ${error?.constructor?.name || typeof error}`,
    );
    this.logger.error(`Error Message: ${error?.message}`);

    if (error.stack) {
      this.logger.error(`Error Stack: ${error.stack}`);
    }

    if ('response' in error && error.response) {
      const axiosError = error;
      this.logger.error(`HTTP Status: ${axiosError.response?.status}`);
      this.logger.error(`HTTP Status Text: ${axiosError.response?.statusText}`);
      this.logger.error(
        `Response Headers: ${JSON.stringify(axiosError.response?.headers, null, 2)}`,
      );
      this.logger.error(
        `Response Data: ${JSON.stringify(axiosError.response?.data, null, 2)}`,
      );
    }

    if ('config' in error && error.config) {
      const axiosError = error;
      const configData: unknown = axiosError.config?.data
        ? JSON.parse(JSON.stringify(axiosError.config.data))
        : undefined;
      this.logger.error(
        `Axios Config: ${JSON.stringify(
          {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            baseURL: axiosError.config?.baseURL,
            timeout: axiosError.config?.timeout,
            headers: axiosError.config?.headers,
            data: configData,
          },
          null,
          2,
        )}`,
      );
    }

    this.logger.error('=============================================');

    const httpStatus =
      'response' in error && error.response?.status
        ? error.response.status
        : HttpStatus.INTERNAL_SERVER_ERROR;

    throw new HttpException(
      {
        message: error.message || defaultMessage,
        error: `${operation}Error`,
      },
      httpStatus,
    );
  }

  /**
   * Finds or creates a Nafath verification record
   */
  private async findOrCreateVerification(
    nationalId: string,
  ): Promise<{ id: string; status: NafathVerificationStatus }> {
    const existing = await this.prisma.nafathVerification.findFirst({
      where: { nationalId },
    });

    if (existing?.status === NafathVerificationStatus.COMPLETED) {
      return existing;
    }

    if (existing) {
      const updated = await this.prisma.nafathVerification.update({
        where: { id: existing.id },
        data: { status: NafathVerificationStatus.WAITING },
      });
      return updated;
    }

    const created = await this.prisma.nafathVerification.create({
      data: {
        nationalId,
        status: NafathVerificationStatus.WAITING,
      },
    });

    return created;
  }

  /**
   * Creates a new Nafath authentication request
   */
  async createRequest(
    createRequestDto: CreateRequestDto,
  ): Promise<NafathStatusResponseDto> {
    try {
      const url = this.buildUrl(NAFATH_API_ENDPOINTS.CREATE_REQUEST);
      const existingVerification =
        await this.prisma.nafathVerification.findFirst({
          where: { nationalId: createRequestDto.nationalId },
        });

      // If already completed, return early with user info if available
      if (existingVerification?.status === NafathVerificationStatus.COMPLETED) {
        const user = await this.prisma.user.findUnique({
          where: { nationalId: createRequestDto.nationalId },
        });
        return {
          status: existingVerification.status,
          ...(user && { userId: user.id }),
        };
      }

      // Find or create verification record
      const nafathVerification = await this.findOrCreateVerification(
        createRequestDto.nationalId,
      );

      const params = new URLSearchParams({
        local: DEFAULT_CONFIG.LOCALE,
        requestId: nafathVerification.id,
      });
      const fullUrl = `${url}?${params.toString()}`;
      const headers = this.buildHeaders();
      const body = {
        service: this.service,
        ...createRequestDto,
      };

      this.logger.log(
        `Creating Nafath request for nationalId: ${createRequestDto.nationalId}`,
      );
      this.logger.debug(`Full URL: ${fullUrl}`);
      this.logger.debug(`Headers: ${JSON.stringify(headers, null, 2)}`);
      this.logger.debug(
        `[NAFATH CURL] Create Request: ${this.buildCurlCommand('POST', fullUrl, headers, body)}`,
      );

      const response: AxiosResponse<NafathCreateRequestResponseDto> =
        await firstValueFrom(this.httpService.post(fullUrl, body, { headers }));

      this.logger.log(
        `Nafath request created successfully: ${response.data.transId}`,
      );

      const updatedVerification = await this.prisma.nafathVerification.update({
        where: { id: nafathVerification.id },
        data: {
          transId: response.data.transId,
          random: response.data.random,
        },
      });

      return {
        status: updatedVerification.status,
        random: updatedVerification.random || '',
      };
    } catch (error) {
      this.handleHttpError(
        error as AxiosError,
        'CREATE_REQUEST',
        'Failed to create Nafath request',
      );
    }
  }

  /**
   * Gets the status of a Nafath verification request
   */
  async getRequestStatus(
    requestStatusDto: RequestStatusDto,
  ): Promise<NafathStatusResponseDto> {
    try {
      const url = this.buildUrl(NAFATH_API_ENDPOINTS.REQUEST_STATUS);
      const nafathVerification = await this.prisma.nafathVerification.findFirst(
        {
          where: { nationalId: requestStatusDto.nationalId },
        },
      );

      if (!nafathVerification) {
        throw new NotFoundException(
          'Nafath verification not found for this national ID',
        );
      }

      if (!nafathVerification.transId || !nafathVerification.random) {
        throw new BadRequestException(
          'Nafath verification missing transaction ID or random value',
        );
      }

      const headers = this.buildHeaders();
      const body = {
        transId: nafathVerification.transId,
        random: nafathVerification.random,
        nationalId: nafathVerification.nationalId,
      };

      this.logger.log(
        `Getting Nafath request status for transId: ${nafathVerification.transId}`,
      );
      this.logger.debug(`Full URL: ${url}`);
      this.logger.debug(
        `[NAFATH CURL] Get Status: ${this.buildCurlCommand('POST', url, headers, body)}`,
      );

      const response: AxiosResponse<NafathStatusResponseDto> =
        await firstValueFrom(this.httpService.post(url, body, { headers }));

      this.logger.log(
        `Nafath request status retrieved: ${response.data.status}`,
      );

      await this.prisma.nafathVerification.update({
        where: { id: nafathVerification.id },
        data: { status: response.data.status },
      });

      return { status: response.data.status };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleHttpError(
        error as AxiosError,
        'GET_STATUS',
        'Failed to get Nafath request status',
      );
    }
  }

  /**
   * Gets JWK (JSON Web Key) from Nafath API
   */
  async getJwk(): Promise<NafathJwkResponseDto> {
    try {
      const url = this.buildUrl(NAFATH_API_ENDPOINTS.JWK);
      const headers = this.buildHeaders();

      this.logger.log('Retrieving Nafath JWK');
      this.logger.debug(`Full URL: ${url}`);
      this.logger.debug(
        `[NAFATH CURL] Get JWK: ${this.buildCurlCommand('GET', url, headers)}`,
      );

      const response: AxiosResponse<NafathJwkResponseDto> =
        await firstValueFrom(this.httpService.get(url, { headers }));

      this.logger.log('Nafath JWK retrieved successfully');
      return response.data;
    } catch (error) {
      this.handleHttpError(
        error as AxiosError,
        'GET_JWK',
        'Failed to retrieve Nafath JWK',
      );
    }
  }

  /**
   * Handles webhook callbacks from Nafath
   */
  async handleWebhook(
    webhookDto: WebhookDto,
  ): Promise<{ status: string; message?: string }> {
    try {
      this.logger.log(
        `Received Nafath webhook for transId: ${webhookDto.transId}`,
      );

      // Store webhook payload for debugging/auditing
      await this.prisma.tempNafathWebhook.create({
        data: {
          response: {
            token: webhookDto.token,
            transId: webhookDto.transId,
            requestId: webhookDto.requestId,
          },
        },
      });

      // Verify and decode JWT token
      const decodedToken = await this.verifyJwtToken(webhookDto.token);

      this.logger.log(
        `Webhook JWT verified successfully. Status: ${decodedToken.status}`,
      );
      this.logger.debug(
        `Decoded Token: ${JSON.stringify(decodedToken, null, 2)}`,
      );

      // Process webhook based on status
      const nafathVerification = await this.prisma.nafathVerification.findFirst(
        {
          where: { transId: webhookDto.transId },
        },
      );

      if (!nafathVerification) {
        this.logger.warn(
          `No verification found for transId: ${webhookDto.transId}`,
        );
        return {
          status: 'error',
          message: this.messageService.getErrorMessage(
            'nafath.webhook_failed',
            DEFAULT_CONFIG.LOCALE,
          ),
        };
      }

      await this.processWebhookStatus(decodedToken, nafathVerification.id);

      return {
        status: 'success',
        message: this.messageService.getSuccessMessage(
          'nafath.webhook_processed',
          DEFAULT_CONFIG.LOCALE,
        ),
      };
    } catch (error) {
      this.logger.error(
        `Error processing Nafath webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        status: 'error',
        message: this.messageService.getErrorMessage(
          'nafath.webhook_failed',
          DEFAULT_CONFIG.LOCALE,
        ),
      };
    }
  }

  /**
   * Processes webhook status updates
   */
  private async processWebhookStatus(
    decodedToken: DecodedJwtToken,
    verificationId: string,
  ): Promise<void> {
    const baseUpdateData = {
      status: decodedToken.status,
    };

    if (decodedToken.status === NafathVerificationStatus.COMPLETED) {
      this.logger.log('User accepted the Nafath request');
      const transformedData = this.transformNafathData(
        decodedToken as unknown as NafathTokenPayload,
      );
      await this.prisma.nafathVerification.update({
        where: { id: verificationId },
        data: {
          ...baseUpdateData,
          details: transformedData as unknown as Parameters<
            typeof this.prisma.nafathVerification.update
          >[0]['data']['details'],
        },
      });
    } else if (decodedToken.status === NafathVerificationStatus.REJECTED) {
      this.logger.log('User rejected the Nafath request');
      await this.prisma.nafathVerification.update({
        where: { id: verificationId },
        data: baseUpdateData,
      });
    } else if (decodedToken.status === NafathVerificationStatus.EXPIRED) {
      this.logger.log('Nafath request expired');
      await this.prisma.nafathVerification.update({
        where: { id: verificationId },
        data: baseUpdateData,
      });
    }
  }

  /**
   * Updates Nafath request status manually
   */
  async statusUpdate(
    requestStatusDto: RequestStatusDto,
  ): Promise<NafathStatusResponseDto> {
    if (!this.nafathUpdateBaseUrl) {
      this.logger.warn(
        'NAFATH_UPDATE_BASE_URL not configured, skipping update',
      );
      throw new BadRequestException('Status update is not available');
    }

    try {
      const url = this.buildUrl(
        NAFATH_API_ENDPOINTS.REQUEST_UPDATE,
        this.nafathUpdateBaseUrl,
      );
      const nafathVerification = await this.prisma.nafathVerification.findFirst(
        {
          where: { nationalId: requestStatusDto.nationalId },
        },
      );

      if (!nafathVerification) {
        throw new NotFoundException(
          'Nafath verification not found for this national ID',
        );
      }

      if (!nafathVerification.transId || !nafathVerification.random) {
        throw new BadRequestException(
          'Nafath verification missing transaction ID or random value',
        );
      }

      const headers = this.buildHeaders();
      const body = {
        transId: nafathVerification.transId,
        random: nafathVerification.random,
        accept: requestStatusDto.accept,
      };

      this.logger.log(
        `Updating Nafath request status for transId: ${nafathVerification.transId}`,
      );
      this.logger.debug(`Full URL: ${url}`);

      const response: AxiosResponse<NafathStatusResponseDto> =
        await firstValueFrom(this.httpService.post(url, body, { headers }));

      this.logger.log(`Nafath request status updated: ${response.data.status}`);

      await this.prisma.nafathVerification.update({
        where: { id: nafathVerification.id },
        data: { status: response.data.status },
      });

      return response.data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleHttpError(
        error as AxiosError,
        'STATUS_UPDATE',
        'Failed to update Nafath request status',
      );
    }
  }

  /**
   * Verifies JWT token from Nafath webhook
   */
  private async verifyJwtToken(token: string): Promise<DecodedJwtToken> {
    try {
      const jwkResponse = await this.getJwk();

      // Decode JWT header to get the key ID (kid)
      const decodedHeader = jwt.decode(token, { complete: true });
      if (!decodedHeader || typeof decodedHeader === 'string') {
        throw new Error('Invalid JWT token format');
      }

      const kid = decodedHeader.header.kid;
      if (!kid) {
        throw new Error('JWT token missing key ID (kid) in header');
      }

      this.logger.debug(`JWT Key ID (kid): ${kid}`);

      // Find the matching JWK by kid
      const jwk = jwkResponse.keys.find((key) => key.kid === kid);
      if (!jwk) {
        throw new Error(`JWK not found for kid: ${kid}`);
      }

      this.logger.debug(`Found JWK for kid: ${kid}`);

      // Convert JWK to PEM format and verify
      const publicKeyPem = this.jwkToPem(jwk);
      const algorithm = (jwk.alg ||
        DEFAULT_CONFIG.DEFAULT_ALGORITHM) as jwt.Algorithm;

      const decoded = jwt.verify(token, publicKeyPem, {
        algorithms: [algorithm],
      }) as DecodedJwtToken;

      if (!decoded || !decoded.status) {
        throw new Error('Invalid JWT token: missing status');
      }

      return decoded;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error during JWT verification';
      this.logger.error(`Error verifying JWT token: ${errorMessage}`);
      throw new Error(`JWT verification failed: ${errorMessage}`);
    }
  }

  /**
   * Converts a JWK (JSON Web Key) to PEM format
   */
  private jwkToPem(jwk: JwkKey): string {
    if (jwk.kty !== 'RSA') {
      throw new Error(
        `Unsupported key type: ${jwk.kty}. Only RSA keys are supported.`,
      );
    }

    if (!jwk.n || !jwk.e) {
      throw new Error('JWK missing required parameters (n or e)');
    }

    try {
      const publicKey = crypto.createPublicKey({
        key: {
          kty: jwk.kty,
          n: jwk.n,
          e: jwk.e,
        },
        format: 'jwk',
      });

      return publicKey.export({
        type: 'spki',
        format: 'pem',
      }) as string;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to convert JWK to PEM: ${errorMessage}`);
    }
  }

  /**
   * Transforms Nafath token payload into structured user data format
   */
  private transformNafathData(payload: NafathTokenPayload): FilteredUserData {
    const data: FilteredUserData = {
      firstName: {
        ar: payload.firstName || '',
        en: payload.englishFirstName || '',
      },
      lastName: {
        ar: payload.familyName || '',
        en: payload.englishLastName || '',
      },
      fatherName: {
        ar: payload.fatherName || '',
        en: payload.englishSecondName || '',
      },
      gender: this.mapGender(payload.gender),
      dateOfBirth: {
        ar: payload.dateOfBirthH || '',
        en: payload.dateOfBirthG || '',
      },
      nationality: {
        ar: payload.nationality || '',
        en: payload.nationality || '',
      },
    };

    // Add address information if available
    const address = payload.nationalAddress?.[0];
    if (address) {
      data.street = {
        ar: address.streetName || '',
        en: address.streetL2 || '',
      };
      data.buildingNumber = {
        ar: address.buildingNumber || '',
        en: address.buildingNumber || '',
      };
      data.postalCode = {
        ar: address.postCode || '',
        en: address.postCode || '',
      };
      data.city = {
        ar: address.city || '',
        en: address.cityL2 || '',
      };
      data.region = {
        ar: address.regionName || '',
        en: address.regionNameL2 || '',
      };
      data.district = {
        ar: address.district || '',
        en: address.districtL2 || '',
      };
    }

    return data;
  }

  /**
   * Maps gender code to bilingual format
   */
  private mapGender(gender?: 'M' | 'F'): { ar: string; en: string } {
    if (gender === 'M') {
      return { ar: 'ذكر', en: 'Male' };
    }
    if (gender === 'F') {
      return { ar: 'أنثى', en: 'Female' };
    }
    return { ar: '', en: '' };
  }
}
