import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { AddHouseDto } from './dto/add-house.dto';
import { TranslationService } from '../common/services/translation.service';
import { MessageService } from '../common/services/message.service';

@Injectable()
export class ApartmentService {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
    private messageService: MessageService,
  ) {}

  async create(
    createApartmentDto: CreateApartmentDto,
    leaderId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the user is a leader
    const leader = await this.prisma.user.findUnique({
      where: { id: leaderId },
    });

    if (!leader || leader.role !== 'LEADER') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'apartment.only_leaders_can_create',
          language,
        ),
      );
    }

    // Check if HOA number already exists
    const existingHoa = await this.prisma.hoa.findUnique({
      where: { hoaNumber: createApartmentDto.hoaNumber },
      include: {
        userHOAs: {
          where: { isLeader: true },
        },
      },
    });

    if (existingHoa) {
      if (existingHoa.userHOAs.length > 0) {
        throw new ConflictException(
          this.messageService.getErrorMessage(
            'apartment.hoa_has_leader',
            language,
          ),
        );
      } else {
        // Update existing HOA and create UserHOA relationship
        const [updatedHoa] = await Promise.all([
          this.prisma.hoa.update({
            where: { hoaNumber: createApartmentDto.hoaNumber },
            data: {
              name: createApartmentDto.name,
              address: createApartmentDto.address,
              city: createApartmentDto.city,
              state: createApartmentDto.state,
            },
            include: {
              userHOAs: {
                where: { isLeader: true },
                include: {
                  user: {
                    select: {
                      id: true,
                      nationalId: true,
                      role: true,
                    },
                  },
                },
              },
            },
          }),
          this.prisma.userHOA.create({
            data: {
              userId: leaderId,
              hoaId: existingHoa.id,
              isLeader: true,
            },
          }),
        ]);

        return {
          message: this.messageService.getSuccessMessage(
            'apartment.updated_and_leader_assigned',
            language,
          ),
          apartment: updatedHoa,
        };
      }
    }

    // Translate HOA details
    const [
      nameTranslations,
      addressTranslations,
      cityTranslations,
      stateTranslations,
    ] = await Promise.all([
      this.translationService.createTranslationObject(createApartmentDto.name),
      this.translationService.createTranslationObject(
        createApartmentDto.address,
      ),
      this.translationService.createTranslationObject(createApartmentDto.city),
      createApartmentDto.state
        ? this.translationService.createTranslationObject(
            createApartmentDto.state,
          )
        : { en: '', ar: '' },
    ]);

    // Create new HOA and UserHOA relationship
    const apartment = await this.prisma.hoa.create({
      data: {
        name: nameTranslations,
        hoaNumber: createApartmentDto.hoaNumber,
        address: addressTranslations,
        city: cityTranslations,
        state: createApartmentDto.state ? stateTranslations : undefined,
        userHOAs: {
          create: {
            userId: leaderId,
            isLeader: true,
          },
        },
      },
      include: {
        userHOAs: {
          where: { isLeader: true },
          include: {
            user: {
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

    return {
      message: this.messageService.getSuccessMessage(
        'apartment.created',
        language,
      ),
      apartment,
    };
  }

  async findAll() {
    return this.prisma.hoa.findMany({
      include: {
        userHOAs: {
          where: { isLeader: true },
          include: {
            user: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            jobs: true,
          },
        },
      },
    });
  }

  async findOne(id: string, language: 'en' | 'ar' = 'en') {
    const hoa = await this.prisma.hoa.findUnique({
      where: { id },
      include: {
        userHOAs: {
          where: { isLeader: true },
          include: {
            user: {
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
            jobs: true,
          },
        },
      },
    });

    if (!hoa) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('apartment.not_found', language),
      );
    }

    return hoa;
  }

  // async findByLeader(leaderId: string, language: 'en' | 'ar' = 'en') {
  //   // Verify the user is a leader
  //   const leader = await this.prisma.user.findUnique({
  //     where: { id: leaderId },
  //   });

  //   if (!leader || leader.role !== 'LEADER') {
  //     throw new ForbiddenException(
  //       this.messageService.getErrorMessage(
  //         'apartment.only_leaders_can_view',
  //         language,
  //       ),
  //     );
  //   }

  //   // Get HOAs where user is a leader
  //   const userHOAs = await this.prisma.userHOA.findMany({
  //     where: {
  //       userId: leaderId,
  //       isLeader: true,
  //     },
  //     select: {
  //       hoaId: true,
  //     },
  //   });

  //   const hoaIds = userHOAs.map((uh) => uh.hoaId);

  //   return this.prisma.hoa.findMany({
  //     where: { id: { in: hoaIds } },
  //     include: {
  //       userHOAs: {
  //         where: { isLeader: true },
  //         include: {
  //           user: {
  //             select: {
  //               id: true,
  //               nationalId: true,
  //               role: true,
  //             },
  //           },
  //         },
  //       },
  //       jobs: {
  //         include: {
  //           services: {
  //             include: {
  //               service: true,
  //             },
  //           },
  //           bids: {
  //             include: {
  //               serviceProvider: {
  //                 select: {
  //                   id: true,
  //                   name: true,
  //                   rating: true,
  //                   totalJobs: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         orderBy: {
  //           createdAt: 'desc',
  //         },
  //       },
  //       _count: {
  //         select: {
  //           jobs: true,
  //         },
  //       },
  //     },
  //   });
  // }

  // Get all HOAs for a user (both as leader and as member)
  async getApartments(userId: string, language: 'en' | 'ar' = 'en') {
    // Verify the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('auth.user_not_found', language),
      );
    }

    // Get all UserHOA relationships for this user
    const userHOAs = await this.prisma.userHOA.findMany({
      where: {
        userId: userId,
      },
      select: {
        hoaId: true,
        isLeader: true,
      },
    });

    const hoaIds = userHOAs.map((uh) => uh.hoaId);

    if (hoaIds.length === 0) {
      return [];
    }

    // Get all HOAs with their details
    const hoas = await this.prisma.hoa.findMany({
      where: { id: { in: hoaIds } },
      include: {
        userHOAs: {
          include: {
            user: {
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
            jobs: true,
          },
        },
      },
    });

    // Add isLeader flag to each HOA based on the user's relationship
    return hoas.map((hoa) => {
      const userHOA = userHOAs.find((uh) => uh.hoaId === hoa.id);
      return {
        ...hoa,
        isLeader: userHOA?.isLeader || false,
      };
    });
  }

  async update(
    id: string,
    updateApartmentDto: CreateApartmentDto,
    leaderId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the HOA exists and user is a leader
    const userHOA = await this.prisma.userHOA.findFirst({
      where: {
        hoaId: id,
        userId: leaderId,
        isLeader: true,
      },
    });

    if (!userHOA) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'apartment.not_found_or_unauthorized',
          language,
        ),
      );
    }

    const updatedHoa = await this.prisma.hoa.update({
      where: { id },
      data: updateApartmentDto,
      include: {
        userHOAs: {
          where: { isLeader: true },
          include: {
            user: {
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

    return {
      message: this.messageService.getSuccessMessage(
        'apartment.updated',
        language,
      ),
      apartment: updatedHoa,
    };
  }

  async remove(id: string, leaderId: string, language: 'en' | 'ar' = 'en') {
    // Verify the HOA exists and user is a leader
    const userHOA = await this.prisma.userHOA.findFirst({
      where: {
        hoaId: id,
        userId: leaderId,
        isLeader: true,
      },
    });

    if (!userHOA) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'apartment.not_found_or_unauthorized_delete',
          language,
        ),
      );
    }

    // Check if HOA has jobs
    const hoaWithRelations = await this.prisma.hoa.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jobs: true,
          },
        },
      },
    });

    if (!hoaWithRelations) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('apartment.not_found', language),
      );
    }

    if (hoaWithRelations._count.jobs > 0) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'apartment.cannot_delete_with_jobs',
          language,
        ),
      );
    }

    await this.prisma.hoa.delete({
      where: { id },
    });

    return {
      message: this.messageService.getSuccessMessage(
        'apartment.deleted_success',
        language,
      ),
    };
  }

  // async addHouse(
  //   apartmentId: string,
  //   houseData: AddHouseDto,
  //   leaderId: string,
  //   language: 'en' | 'ar' = 'en',
  // ) {
  //   throw new BadRequestException(
  //     this.messageService.getErrorMessage(
  //       'apartment.house_feature_disabled',
  //       language,
  //     ),
  //   );
  // }

  // async removeHouse(
  //   houseId: string,
  //   leaderId: string,
  //   language: 'en' | 'ar' = 'en',
  // ) {
  //   throw new BadRequestException(
  //     this.messageService.getErrorMessage(
  //       'apartment.house_feature_disabled',
  //       language,
  //     ),
  //   );
  // }

  // Create HOA without leader (for home owners who sign up first)
  async createWithoutLeader(hoaNumber: string, language: 'en' | 'ar' = 'en') {
    // Use translation service to translate default values
    const nameTranslations =
      await this.translationService.createTranslationObject(`HOA ${hoaNumber}`);
    const addressTranslations =
      await this.translationService.createTranslationObject(
        'Address to be updated by leader',
      );
    const cityTranslations =
      await this.translationService.createTranslationObject(
        'City to be updated by leader',
      );

    return this.prisma.hoa.create({
      data: {
        hoaNumber: hoaNumber,
        name: nameTranslations,
        address: addressTranslations,
        city: cityTranslations,
      },
    });
  }

  // Assign leader to existing HOA
  async assignLeader(
    hoaNumber: string,
    leaderId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the user is a leader
    const leader = await this.prisma.user.findUnique({
      where: { id: leaderId },
    });

    if (!leader || leader.role !== 'LEADER') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'apartment.only_leaders_can_be_assigned',
          language,
        ),
      );
    }

    // Check if HOA exists
    const hoa = await this.prisma.hoa.findUnique({
      where: { hoaNumber: hoaNumber },
      include: {
        userHOAs: {
          where: { isLeader: true },
        },
      },
    });

    if (!hoa) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('apartment.not_found', language),
      );
    }

    if (hoa.userHOAs.length > 0) {
      throw new ConflictException(
        this.messageService.getErrorMessage(
          'apartment.already_has_leader',
          language,
        ),
      );
    }

    // Create UserHOA relationship for leader
    await this.prisma.userHOA.create({
      data: {
        userId: leaderId,
        hoaId: hoa.id,
        isLeader: true,
      },
    });

    // Fetch updated HOA
    const updatedHoa = await this.prisma.hoa.findUnique({
      where: { hoaNumber: hoaNumber },
      include: {
        userHOAs: {
          where: { isLeader: true },
          include: {
            user: {
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

    return {
      message: this.messageService.getSuccessMessage(
        'apartment.leader_assigned',
        language,
      ),
      apartment: updatedHoa,
    };
  }
}
