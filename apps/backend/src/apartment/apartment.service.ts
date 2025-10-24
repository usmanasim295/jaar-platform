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
    const existingApartment = await this.prisma.apartment.findUnique({
      where: { hoaNumber: createApartmentDto.hoaNumber },
    });

    if (existingApartment) {
      if (existingApartment.leaderId) {
        throw new ConflictException(
          this.messageService.getErrorMessage(
            'apartment.hoa_has_leader',
            language,
          ),
        );
      } else {
        // Update existing apartment to assign this leader
        const updatedApartment = await this.prisma.apartment.update({
          where: { hoaNumber: createApartmentDto.hoaNumber },
          data: {
            leaderId: leaderId,
            name: createApartmentDto.name,
            address: createApartmentDto.address,
            city: createApartmentDto.city,
            state: createApartmentDto.state,
            country: createApartmentDto.country || 'Saudi Arabia',
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

        return {
          message: this.messageService.getSuccessMessage(
            'apartment.updated_and_leader_assigned',
            language,
          ),
          apartment: updatedApartment,
        };
      }
    }

    // Translate apartment details
    const [
      nameTranslations,
      addressTranslations,
      cityTranslations,
      stateTranslations,
      countryTranslations,
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
      this.translationService.createTranslationObject(
        createApartmentDto.country || 'Saudi Arabia',
      ),
    ]);

    // Create new apartment
    const apartment = await this.prisma.apartment.create({
      data: {
        name: nameTranslations,
        hoaNumber: createApartmentDto.hoaNumber,
        address: addressTranslations,
        city: cityTranslations,
        state: createApartmentDto.state ? stateTranslations : undefined,
        country: countryTranslations,
        leaderId: leaderId,
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

    return {
      message: this.messageService.getSuccessMessage(
        'apartment.created',
        language,
      ),
      apartment,
    };
  }

  async findAll() {
    return this.prisma.apartment.findMany({
      include: {
        leader: {
          select: {
            id: true,
            nationalId: true,
            role: true,
          },
        },
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
        _count: {
          select: {
            houses: true,
            jobs: true,
          },
        },
      },
    });
  }

  async findOne(id: string, language: 'en' | 'ar' = 'en') {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id },
      include: {
        leader: {
          select: {
            id: true,
            nationalId: true,
            role: true,
          },
        },
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
    });

    if (!apartment) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('apartment.not_found', language),
      );
    }

    return apartment;
  }

  async findByLeader(leaderId: string, language: 'en' | 'ar' = 'en') {
    // Verify the user is a leader
    const leader = await this.prisma.user.findUnique({
      where: { id: leaderId },
    });

    if (!leader || leader.role !== 'LEADER') {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'apartment.only_leaders_can_view',
          language,
        ),
      );
    }

    return this.prisma.apartment.findMany({
      where: { leaderId },
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
    });
  }

  async update(
    id: string,
    updateApartmentDto: CreateApartmentDto,
    leaderId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the apartment exists and belongs to this leader
    const existingApartment = await this.prisma.apartment.findFirst({
      where: {
        id,
        leaderId,
      },
    });

    if (!existingApartment) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'apartment.not_found_or_unauthorized',
          language,
        ),
      );
    }

    const updatedApartment = await this.prisma.apartment.update({
      where: { id },
      data: updateApartmentDto,
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

    return {
      message: this.messageService.getSuccessMessage(
        'apartment.updated',
        language,
      ),
      apartment: updatedApartment,
    };
  }

  async remove(id: string, leaderId: string, language: 'en' | 'ar' = 'en') {
    // Verify the apartment exists and belongs to this leader
    const existingApartment = await this.prisma.apartment.findFirst({
      where: {
        id,
        leaderId,
      },
    });

    if (!existingApartment) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'apartment.not_found_or_unauthorized_delete',
          language,
        ),
      );
    }

    // Check if apartment has houses or jobs
    const apartmentWithRelations = await this.prisma.apartment.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            houses: true,
            jobs: true,
          },
        },
      },
    });

    if (!apartmentWithRelations) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('apartment.not_found', language),
      );
    }

    if (apartmentWithRelations._count.houses > 0) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'apartment.cannot_delete_with_houses',
          language,
        ),
      );
    }

    if (apartmentWithRelations._count.jobs > 0) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'apartment.cannot_delete_with_jobs',
          language,
        ),
      );
    }

    await this.prisma.apartment.delete({
      where: { id },
    });

    return {
      message: this.messageService.getSuccessMessage(
        'apartment.deleted_success',
        language,
      ),
    };
  }

  async addHouse(
    apartmentId: string,
    houseData: AddHouseDto,
    leaderId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the apartment exists and belongs to this leader
    const apartment = await this.prisma.apartment.findFirst({
      where: {
        id: apartmentId,
        leaderId,
      },
    });

    if (!apartment) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'apartment.not_found_or_unauthorized_add_houses',
          language,
        ),
      );
    }

    // Verify the house owner exists and is a home owner
    const houseOwner = await this.prisma.user.findUnique({
      where: { id: houseData.ownerId },
    });

    if (!houseOwner || houseOwner.role !== 'HOME_OWNER') {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'apartment.house_owner_must_be_home_owner',
          language,
        ),
      );
    }

    // Create the house
    const house = await this.prisma.house.create({
      data: {
        houseNumber: houseData.houseNumber,
        apartmentId: apartmentId,
        ownerId: houseData.ownerId,
      },
      include: {
        apartment: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        owner: {
          select: {
            id: true,
            nationalId: true,
            role: true,
          },
        },
      },
    });

    return {
      message: this.messageService.getSuccessMessage(
        'apartment.house_added',
        language,
      ),
      house,
    };
  }

  async removeHouse(
    houseId: string,
    leaderId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Verify the house exists and belongs to an apartment managed by this leader
    const house = await this.prisma.house.findFirst({
      where: {
        id: houseId,
        apartment: {
          leaderId: leaderId,
        },
      },
      include: {
        apartment: true,
      },
    });

    if (!house) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'apartment.house_not_found_or_unauthorized_remove',
          language,
        ),
      );
    }

    await this.prisma.house.delete({
      where: { id: houseId },
    });

    return {
      message: this.messageService.getSuccessMessage(
        'apartment.house_removed',
        language,
      ),
    };
  }

  // Create apartment without leader (for home owners who sign up first)
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
    const countryTranslations =
      await this.translationService.createTranslationObject('Saudi Arabia');

    return this.prisma.apartment.create({
      data: {
        hoaNumber,
        name: nameTranslations,
        address: addressTranslations,
        city: cityTranslations,
        country: countryTranslations,
      },
    });
  }

  // Assign leader to existing apartment
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

    // Check if apartment exists
    const apartment = await this.prisma.apartment.findUnique({
      where: { hoaNumber },
    });

    if (!apartment) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('apartment.not_found', language),
      );
    }

    if (apartment.leaderId) {
      throw new ConflictException(
        this.messageService.getErrorMessage(
          'apartment.already_has_leader',
          language,
        ),
      );
    }

    // Assign leader to apartment
    const updatedApartment = await this.prisma.apartment.update({
      where: { hoaNumber },
      data: { leaderId },
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

    return {
      message: this.messageService.getSuccessMessage(
        'apartment.leader_assigned',
        language,
      ),
      apartment: updatedApartment,
    };
  }
}
