import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from './dtos/signup.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { S3Service } from 'src/common/services/s3.service';
import { ApartmentService } from 'src/apartment/apartment.service';
import { TranslationService } from 'src/common/services/translation.service';
import { MessageService } from 'src/common/services/message.service';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private s3Service: S3Service,
    private apartmentService: ApartmentService,
    private translationService: TranslationService,
    private messageService: MessageService,
    private chatService: ChatService,
  ) {}

  // Single signup method for all user types
  async signup(
    dto: SignupDto,
    document: Express.Multer.File,
    language: 'en' | 'ar' = 'en',
  ) {
    // Only allow HOME_OWNER and LEADER roles for signup
    if (dto.role === Role.ADMIN) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'auth.cannot_register_admin',
          language,
        ),
      );
    }

    // Check if national ID already exists
    const existingUserByNationalId = await this.prisma.user.findUnique({
      where: { nationalId: dto.nationalId },
      include: { userDoc: true },
    });

    if (existingUserByNationalId) {
      throw new ConflictException(
        this.messageService.getErrorMessage(
          'auth.national_id_exists',
          language,
        ),
      );
    }

    // Check HOA number logic based on role
    if (dto.role === Role.LEADER) {
      // For LEADER: Check if HOA number already has a leader
      const existingApartmentWithLeader = await this.prisma.apartment.findFirst(
        {
          where: {
            hoaNumber: dto.hoaNumber,
            leader: {
              role: Role.LEADER,
            },
          },
        },
      );

      if (existingApartmentWithLeader) {
        throw new ConflictException(
          this.messageService.getErrorMessage('auth.hoa_has_leader', language),
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user first
    const user = await this.prisma.user.create({
      data: {
        nationalId: dto.nationalId,
        password: hashedPassword,
        role: dto.role,
      },
    });

    // Upload document to S3
    const s3Key = this.s3Service.generateS3Key(
      'user-documents',
      user.id,
      document.originalname,
    );
    const s3Url = await this.s3Service.uploadFileBuffer(document, s3Key);

    // Create user document record
    await this.prisma.userDoc.create({
      data: {
        userId: user.id,
        imageUrls: [s3Url],
      },
    });

    let apartment: any = null;

    // Ensure apartment exists for this HOA number
    const existingApartment = await this.prisma.apartment.findUnique({
      where: { hoaNumber: dto.hoaNumber },
    });

    if (!existingApartment) {
      // Create apartment without leader for this HOA number
      await this.apartmentService.createWithoutLeader(dto.hoaNumber);
    }

    // Fetch the apartment (it exists now)
    const apartmentRecord = await this.prisma.apartment.findUnique({
      where: { hoaNumber: dto.hoaNumber },
    });

    // If LEADER role and apartment details provided, update apartment with details and assign leader
    if (
      dto.role === Role.LEADER &&
      dto.apartmentName &&
      dto.apartmentAddress &&
      dto.apartmentCity
    ) {
      // Translate apartment details
      const [
        nameTranslations,
        addressTranslations,
        cityTranslations,
        stateTranslations,
        countryTranslations,
      ] = await Promise.all([
        this.translationService.createTranslationObject(dto.apartmentName),
        this.translationService.createTranslationObject(dto.apartmentAddress),
        this.translationService.createTranslationObject(dto.apartmentCity),
        dto.apartmentState
          ? this.translationService.createTranslationObject(dto.apartmentState)
          : { en: '', ar: '' },
        this.translationService.createTranslationObject(
          dto.apartmentCountry || 'Saudi Arabia',
        ),
      ]);

      apartment = await this.prisma.apartment.update({
        where: { hoaNumber: dto.hoaNumber },
        data: {
          leaderId: user.id,
          name: nameTranslations,
          address: addressTranslations,
          city: cityTranslations,
          state: dto.apartmentState ? stateTranslations : undefined,
          country: countryTranslations,
        },
        include: {
          leader: {
            select: {
              id: true,
              nationalId: true,
              role: true,
            },
          },
        },
      });
    } else if (dto.role === Role.LEADER) {
      // Leader without apartment details - assign to existing apartment
      apartment = await this.prisma.apartment.update({
        where: { hoaNumber: dto.hoaNumber },
        data: { leaderId: user.id },
        include: {
          leader: {
            select: {
              id: true,
              nationalId: true,
              role: true,
            },
          },
        },
      });
    } else if (dto.role === Role.HOME_OWNER && apartmentRecord) {
      // Assign home owner to this apartment
      await this.prisma.user.update({
        where: { id: user.id },
        data: { apartmentId: apartmentRecord.id },
      });
    }

    // Create or get community and add user to it
    let community: any = null;
    if (apartmentRecord) {
      community = await this.chatService.createOrGetCommunity(
        dto.hoaNumber,
        apartmentRecord.id,
      );
      await this.chatService.addUserToCommunity(user.id, dto.hoaNumber);

      // Create or get community group chat and add user to it
      if (community) {
        const groupChat = await this.chatService.createCommunityGroupChat(
          community.id,
        );
        // Add user to all existing community group chats (including the one just created/retrieved)
        await this.chatService.addUserToAllCommunityGroupChats(
          user.id,
          community.id,
        );
      }
    }

    const { password, ...userWithoutPassword } = user;
    return {
      message: this.messageService.getSuccessMessage(
        'auth.signup_success',
        language,
      ),
      user: userWithoutPassword,
      documentUrl: s3Url,
      apartment: apartment || apartmentRecord,
      community,
    };
  }

  async login(loginDto: LoginDto, language: 'en' | 'ar' = 'en') {
    const user = await this.prisma.user.findUnique({
      where: { nationalId: loginDto.nationalId },
      include: {
        userDoc: true,
        // Include managed apartments if user is a leader
        managedApartments: {
          include: {
            houses: {
              include: {
                owner: {
                  select: {
                    id: true,
                    nationalId: true,
                    role: true,
                  },
                },
              },
            },
            jobs: {
              include: {
                services: {
                  include: {
                    service: true,
                  },
                },
                bids: {
                  include: {
                    serviceProvider: {
                      select: {
                        id: true,
                        name: true,
                        rating: true,
                        totalJobs: true,
                      },
                    },
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
            _count: {
              select: {
                houses: true,
                jobs: true,
              },
            },
          },
        },
        // Include owned houses if user is a home owner
        ownedHouses: {
          include: {
            apartment: {
              select: {
                id: true,
                name: true,
                hoaNumber: true,
                address: true,
                city: true,
                state: true,
                country: true,
                leader: {
                  select: {
                    id: true,
                    nationalId: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
        // Include posted jobs if user is a leader
        postedJobs: {
          include: {
            services: {
              include: {
                service: true,
              },
            },
            apartment: {
              select: {
                id: true,
                name: true,
                hoaNumber: true,
                city: true,
              },
            },
            bids: {
              include: {
                serviceProvider: {
                  select: {
                    id: true,
                    name: true,
                    rating: true,
                    totalJobs: true,
                    totalEarnings: true,
                  },
                },
              },
              orderBy: {
                totalPrice: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        // Include the direct apartment relation for home owners
        apartment: {
          select: {
            id: true,
            hoaNumber: true,
            name: true,
            address: true,
            city: true,
            state: true,
            country: true,
            leader: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        this.messageService.getErrorMessage(
          'auth.invalid_credentials',
          language,
        ),
      );
    }

    if (!user.password) {
      throw new UnauthorizedException(
        this.messageService.getErrorMessage('auth.password_not_set', language),
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        this.messageService.getErrorMessage(
          'auth.invalid_credentials',
          language,
        ),
      );
    }

    const payload = {
      id: user.id,
      nationalId: user.nationalId,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;

    return {
      access_token: token,
      user: userWithoutPassword,
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    language: 'en' | 'ar' = 'en',
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('auth.user_not_found', language),
      );
    }

    if (!user.password) {
      throw new UnauthorizedException(
        this.messageService.getErrorMessage('auth.password_not_set', language),
      );
    }

    const passwordMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException(
        this.messageService.getErrorMessage(
          'auth.current_password_incorrect',
          language,
        ),
      );
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return {
      message: this.messageService.getSuccessMessage(
        'auth.password_changed',
        language,
      ),
    };
  }
}
