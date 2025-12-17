import { NafathVerificationStatus } from '@prisma/client';

export class NafathCreateRequestResponseDto {
  transId: string;
  random: string;
}

export class NafathStatusResponseDto {
  status: NafathVerificationStatus;
  random?: string;
}

export class NafathJwkResponseDto {
  keys: Array<{
    kty: string;
    e: string;
    use: string;
    kid: string;
    alg: string;
    n: string;
  }>;
}

export class NafathErrorResponseDto {
  status: string;
  timestamp: string | null;
  message: string;
  code: string;
  reference: number;
}
