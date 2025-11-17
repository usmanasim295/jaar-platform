import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  LanguageService,
  SupportedLanguage,
} from 'src/common/services/language.service';
import { MessageService } from 'src/common/services/message.service';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UserStatsQueryDto } from './dto/user-stats-query.dto';
import { AdminPaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateBlockStatusDto } from './dto/update-block-status.dto';
import { UpdateVerificationStatusDto } from './dto/update-verification-status.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly languageService: LanguageService,
    private readonly messageService: MessageService,
  ) {}

  async registerAdmin(dto: RegisterAdminDto, lang?: string) {
    const language = this.languageService.validateLanguage(lang);
    const email = dto.email.toLowerCase();

    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      throw new ConflictException(
        this.messageService.getErrorMessage('admin.email_exists', language),
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const admin = await this.prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return {
      message: this.messageService.getSuccessMessage(
        'admin.register_success',
        language,
      ),
      admin: {
        id: admin.id,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    };
  }

  async loginAdmin(dto: LoginAdminDto, lang?: string) {
    const language = this.languageService.validateLanguage(lang);
    const email = dto.email.toLowerCase();

    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException(
        this.messageService.getErrorMessage(
          'admin.invalid_credentials',
          language,
        ),
      );
    }

    if (admin.isBlocked) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage('auth.account_blocked', language),
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        this.messageService.getErrorMessage(
          'admin.invalid_credentials',
          language,
        ),
      );
    }

    const payload = {
      adminId: admin.id,
      email: admin.email,
      role: Role.ADMIN,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      message: this.messageService.getSuccessMessage(
        'admin.login_success',
        language,
      ),
      access_token: accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    };
  }

  async getTotals(lang?: string) {
    const language = this.languageService.validateLanguage(lang);

    const [homeOwners, leaders, serviceProviders] =
      await this.prisma.$transaction([
        this.prisma.user.count({ where: { role: Role.HOME_OWNER } }),
        this.prisma.user.count({ where: { role: Role.LEADER } }),
        this.prisma.serviceProvider.count(),
      ]);

    return {
      totals: {
        homeOwners,
        leaders,
        serviceProviders,
      },
      message: this.messageService.getSuccessMessage(
        'general.success',
        language,
      ),
    };
  }

  async getUserStats(query: UserStatsQueryDto, lang?: string) {
    const language = this.languageService.validateLanguage(lang);
    const filter = query.filter || 'weekly';
    const startDate = this.computeStartDate(filter);

    const [homeOwners, leaders] = await this.prisma.$transaction([
      this.prisma.user.count({
        where: {
          role: Role.HOME_OWNER,
          createdAt: {
            gte: startDate,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          role: Role.LEADER,
          createdAt: {
            gte: startDate,
          },
        },
      }),
    ]);

    return {
      filter,
      homeOwners,
      leaders,
      total: homeOwners + leaders,
      message: this.messageService.getSuccessMessage(
        'general.success',
        language,
      ),
    };
  }

  async getTopServiceProviders(lang?: string) {
    const language = this.languageService.validateLanguage(lang);

    const providersRaw = await this.prisma.serviceProvider.findMany({
      orderBy: [
        { totalEarnings: 'desc' },
        { rating: 'desc' },
        { totalJobs: 'desc' },
      ],
      take: 5,
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        rating: true,
        totalEarnings: true,
        totalJobs: true,
        isBlocked: true,
        isVerified: true,
        createdAt: true,
        name: true,
        firstName: true,
        lastName: true,
      },
    });

    return {
      providers: this.transformServiceProviders(providersRaw, language),
      message: this.messageService.getSuccessMessage(
        'general.success',
        language,
      ),
    };
  }

  async getServiceProviderStats(query: UserStatsQueryDto, lang?: string) {
    const language = this.languageService.validateLanguage(lang);
    const filter = query.filter || 'weekly';

    const rangeInfo = this.computeServiceProviderRange(filter);
    const { startDate } = rangeInfo;

    const providers = await this.prisma.serviceProvider.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const createdDates = providers.map((provider) => provider.createdAt);
    let series: { date: string; count: number }[] = [];

    if (filter === 'yearly') {
      const range = rangeInfo.range;
      const months =
        'months' in range ? (range as { months: number }).months : 12;
      series = this.buildMonthlySeries(createdDates, months);
    } else {
      const range = rangeInfo.range;
      const days = 'days' in range ? (range as { days: number }).days : 7;
      series = this.buildDailySeries(createdDates, days);
    }

    const total = series.reduce((acc, item) => acc + item.count, 0);

    return {
      filter,
      total,
      data: series,
      message: this.messageService.getSuccessMessage(
        'general.success',
        language,
      ),
    };
  }

  async getUserDetail(userId: string, lang?: string) {
    const language = this.languageService.validateLanguage(lang);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userDoc: true,
        ownedHouses: {
          include: {
            apartment: {
              include: {
                community: true,
              },
            },
          },
        },
        managedApartments: {
          include: {
            community: true,
            _count: {
              select: {
                jobs: true,
              },
            },
          },
        },
        createdJobs: {
          include: {
            services: {
              include: {
                service: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('auth.user_not_found', language),
      );
    }

    // Transform all jobs for stats calculation
    const allCreatedJobs = user.createdJobs
      .map((job) => this.transformJobForLanguage(job, language))
      .filter((job): job is NonNullable<typeof job> => Boolean(job));

    // Calculate stats from created jobs only
    const totalJobs = allCreatedJobs.length;
    // const totalOngoingJobs = allCreatedJobs.filter(
    //   (job) => job.status === 'OPEN' || job.status === 'IN_PROGRESS',
    // ).length;
    const totalOngoingJobs = allCreatedJobs.filter(
      (job) => job.status === 'IN_PROGRESS',
    ).length;
    const totalCompletedJobs = allCreatedJobs.filter(
      (job) => job.status === 'COMPLETED',
    ).length;

    // Limit to 10 most recent for display
    const createdJobs = allCreatedJobs.slice(0, 10);

    const ownedHouses =
      user.role === Role.HOME_OWNER
        ? user.ownedHouses.map((house) => {
            const apartment = house.apartment as any;
            return {
              id: house.id,
              houseNumber: house.houseNumber,
              apartmentName: apartment
                ? this.languageService.extractTranslation(
                    apartment.name,
                    language,
                  )
                : '',
              city: apartment
                ? this.languageService.extractTranslation(
                    apartment.city,
                    language,
                  )
                : '',
              community: apartment?.community
                ? this.languageService.extractTranslation(
                    apartment.community.name,
                    language,
                  )
                : '',
              createdAt: house.createdAt,
            };
          })
        : [];

    const managedApartments =
      user.role === Role.LEADER
        ? user.managedApartments.map((apartment) => ({
            id: apartment.id,
            name: this.languageService.extractTranslation(
              apartment.name as any,
              language,
            ),
            city: this.languageService.extractTranslation(
              apartment.city as any,
              language,
            ),
            community: apartment.community
              ? this.languageService.extractTranslation(
                  apartment.community.name as any,
                  language,
                )
              : '',
            jobsCount: apartment._count?.jobs ?? 0,
          }))
        : [];

    return {
      data: {
        id: user.id,
        role: user.role,
        nationalId: user.nationalId,
        status: user.isBlocked ? 'Blocked' : 'Active',
        isBlocked: user.isBlocked,
        createdAt: user.createdAt,
        documents: user.userDoc?.imageUrls ?? [],
        stats: {
          totalJobs,
          totalOngoingJobs,
          totalCompletedJobs,
        },
        ownedHouses,
        managedApartments,
        createdJobs,
      },
      message: this.messageService.getSuccessMessage(
        'general.success',
        language,
      ),
    };
  }

  async getServiceProviderDetail(serviceProviderId: string, lang?: string) {
    const language = this.languageService.validateLanguage(lang);

    const serviceProvider = await this.prisma.serviceProvider.findUnique({
      where: { id: serviceProviderId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        serviceRates: {
          include: {
            service: true,
          },
        },
        locations: true,
        completionRequests: {
          include: {
            job: {
              include: {
                services: {
                  include: { service: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!serviceProvider) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'service_provider.not_found',
          language,
        ),
      );
    }

    const translatedName = this.languageService.extractTranslation(
      serviceProvider.name as any,
      language,
    );
    const translatedFirstName = this.languageService.extractTranslation(
      serviceProvider.firstName as any,
      language,
    );
    const translatedLastName = this.languageService.extractTranslation(
      serviceProvider.lastName as any,
      language,
    );
    const translatedBio = this.languageService.extractTranslation(
      serviceProvider.bio as any,
      language,
    );

    const services = serviceProvider.services.map((item) => ({
      id: item.serviceId,
      name: item.service
        ? this.languageService.extractTranslation(
            item.service.name as any,
            language,
          )
        : '',
    }));

    const serviceRates = serviceProvider.serviceRates.map((item) => ({
      id: item.serviceId,
      name: item.service
        ? this.languageService.extractTranslation(
            item.service.name as any,
            language,
          )
        : '',
      rate: item.rate,
      description: item.description,
    }));

    const locations = serviceProvider.locations.map((location) => ({
      id: location.id,
      city: location.city,
      state: location.state,
      country: location.country,
      isActive: location.isActive,
    }));

    const recentCompletions = serviceProvider.completionRequests.map(
      (request) => ({
        id: request.id,
        status: request.status,
        submittedAt: request.createdAt,
        job: request.job
          ? this.transformJobForLanguage(request.job, language)
          : null,
      }),
    );

    const completedJobs = recentCompletions.filter(
      (completion) => completion.status === 'APPROVED',
    ).length;

    return {
      data: {
        id: serviceProvider.id,
        name: translatedName || serviceProvider.email,
        firstName: translatedFirstName || '',
        lastName: translatedLastName || '',
        bio: translatedBio || '',
        email: serviceProvider.email,
        phoneNumber: serviceProvider.phoneNumber,
        status: serviceProvider.isBlocked ? 'Blocked' : 'Active',
        isBlocked: serviceProvider.isBlocked,
        isVerified: serviceProvider.isVerified,
        createdAt: serviceProvider.createdAt,
        rating: serviceProvider.rating,
        totalJobs: serviceProvider.totalJobs,
        totalEarnings: serviceProvider.totalEarnings,
        documents: {
          government: serviceProvider.governmentDocumentUrl,
          bank: serviceProvider.bankDocumentUrl,
          profilePicture: serviceProvider.profilePictureUrl,
        },
        stats: {
          totalJobs: serviceProvider.totalJobs,
          completedJobs,
          pendingJobs:
            serviceProvider.completionRequests.length - completedJobs,
        },
        services,
        serviceRates,
        locations,
        recentCompletions,
      },
      message: this.messageService.getSuccessMessage(
        'general.success',
        language,
      ),
    };
  }

  async getHomeOwners(query: AdminPaginationQueryDto, lang?: string) {
    const language = this.languageService.validateLanguage(lang);
    const { skip, take, page, limit } = this.buildPagination(query);

    const where: Prisma.UserWhereInput = {
      role: Role.HOME_OWNER,
    };

    if (query.search) {
      where.OR = [
        {
          nationalId: {
            contains: query.search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              ownedHouses: true,
            },
          },
        },
      }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        name: user.nationalId,
        createdDate: user.createdAt,
        apartments: user._count.ownedHouses,
        status: user.isBlocked ? 'Blocked' : 'Active',
        isBlocked: user.isBlocked,
      })),
      meta: this.buildMeta(total, page, limit),
      message: this.messageService.getSuccessMessage(
        'general.success',
        language,
      ),
    };
  }

  async getLeaders(query: AdminPaginationQueryDto, lang?: string) {
    const language = this.languageService.validateLanguage(lang);
    const { skip, take, page, limit } = this.buildPagination(query);

    const where: Prisma.UserWhereInput = {
      role: Role.LEADER,
    };

    if (query.search) {
      where.OR = [
        {
          nationalId: {
            contains: query.search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    const [total, leaders] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              managedApartments: true,
            },
          },
          communityMemberships: {
            select: {
              communityId: true,
            },
            take: 1,
          },
        },
      }),
    ]);

    return {
      data: leaders.map((leader) => ({
        id: leader.id,
        name: leader.nationalId,
        createdDate: leader.createdAt,
        apartments: leader._count.managedApartments,
        communityId: leader.communityMemberships[0]?.communityId || null,
        status: leader.isBlocked ? 'Blocked' : 'Active',
        isBlocked: leader.isBlocked,
      })),
      meta: this.buildMeta(total, page, limit),
      message: this.messageService.getSuccessMessage(
        'general.success',
        language,
      ),
    };
  }

  async getServiceProviders(query: AdminPaginationQueryDto, lang?: string) {
    const language = this.languageService.validateLanguage(lang);
    const { skip, take, page, limit } = this.buildPagination(query);

    const where: Prisma.ServiceProviderWhereInput = {};

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { phoneNumber: { contains: query.search, mode: 'insensitive' } },
        {
          name: {
            path: ['en'],
            string_contains: query.search,
          } as any,
        },
        {
          name: {
            path: ['ar'],
            string_contains: query.search,
          } as any,
        },
      ];
    }

    const [total, providers] = await this.prisma.$transaction([
      this.prisma.serviceProvider.count({ where }),
      this.prisma.serviceProvider.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: this.transformServiceProviders(providers, language),
      meta: this.buildMeta(total, page, limit),
      message: this.messageService.getSuccessMessage(
        'general.success',
        language,
      ),
    };
  }

  async getUnverifiedServiceProviders(
    query: AdminPaginationQueryDto,
    lang?: string,
  ) {
    const language = this.languageService.validateLanguage(lang);
    const { skip, take, page, limit } = this.buildPagination(query);

    const where: Prisma.ServiceProviderWhereInput = {
      isVerified: false,
    };

    if (query.search) {
      where.AND = [
        {
          OR: [
            { email: { contains: query.search, mode: 'insensitive' } },
            { phoneNumber: { contains: query.search, mode: 'insensitive' } },
            {
              name: {
                path: ['en'],
                string_contains: query.search,
              } as any,
            },
            {
              name: {
                path: ['ar'],
                string_contains: query.search,
              } as any,
            },
          ],
        },
      ];
    }

    const [total, providers] = await this.prisma.$transaction([
      this.prisma.serviceProvider.count({ where }),
      this.prisma.serviceProvider.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: this.transformServiceProviders(providers, language),
      meta: this.buildMeta(total, page, limit),
      message: this.messageService.getSuccessMessage(
        'general.success',
        language,
      ),
    };
  }

  async updateUserBlockStatus(
    userId: string,
    dto: UpdateBlockStatusDto,
    lang?: string,
  ) {
    const language = this.languageService.validateLanguage(lang);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('auth.user_not_found', language),
      );
    }

    if (user.role === Role.ADMIN) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'auth.access_denied_insufficient_role',
          language,
        ),
      );
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isBlocked: dto.isBlocked },
    });

    return {
      message: this.messageService.getSuccessMessage(
        'admin.block_status_updated',
        language,
      ),
      user: {
        id: updated.id,
        role: updated.role,
        isBlocked: updated.isBlocked,
      },
    };
  }

  async updateServiceProviderBlockStatus(
    serviceProviderId: string,
    dto: UpdateBlockStatusDto,
    lang?: string,
  ) {
    const language = this.languageService.validateLanguage(lang);
    const serviceProvider = await this.prisma.serviceProvider.findUnique({
      where: { id: serviceProviderId },
    });

    if (!serviceProvider) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'service_provider.not_found',
          language,
        ),
      );
    }

    const updated = await this.prisma.serviceProvider.update({
      where: { id: serviceProviderId },
      data: { isBlocked: dto.isBlocked },
    });

    return {
      message: this.messageService.getSuccessMessage(
        'admin.block_status_updated',
        language,
      ),
      serviceProvider: this.transformServiceProviders([updated], language)[0],
    };
  }

  async updateServiceProviderVerificationStatus(
    serviceProviderId: string,
    dto: UpdateVerificationStatusDto,
    lang?: string,
  ) {
    const language = this.languageService.validateLanguage(lang);
    const serviceProvider = await this.prisma.serviceProvider.findUnique({
      where: { id: serviceProviderId },
    });

    if (!serviceProvider) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'service_provider.not_found',
          language,
        ),
      );
    }

    const updated = await this.prisma.serviceProvider.update({
      where: { id: serviceProviderId },
      data: { isVerified: dto.isVerified },
    });

    return {
      message: this.messageService.getSuccessMessage(
        'admin.verification_status_updated',
        language,
      ),
      serviceProvider: this.transformServiceProviders([updated], language)[0],
    };
  }

  private computeStartDate(filter: 'weekly' | 'monthly' | 'yearly'): Date {
    const now = new Date();
    if (filter === 'weekly') {
      const date = new Date(now);
      date.setDate(date.getDate() - 7);
      return date;
    }

    if (filter === 'monthly') {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return new Date(now.getFullYear(), 0, 1);
  }

  private buildPagination(query: AdminPaginationQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;
    const take = limit;

    return { skip, take, page, limit };
  }

  private buildMeta(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  private transformJobForLanguage(job: any, language: SupportedLanguage) {
    if (!job) {
      return null;
    }

    const services = Array.isArray(job.services)
      ? job.services.map((jobService: any) => ({
          id: jobService.serviceId ?? jobService.service?.id,
          name: jobService.service
            ? this.languageService.extractTranslation(
                jobService.service.name as any,
                language,
              )
            : '',
        }))
      : [];

    return {
      id: job.id,
      title: this.languageService.extractTranslation(
        job.title as any,
        language,
      ),
      description: this.languageService.extractTranslation(
        job.description as any,
        language,
      ),
      status: job.status,
      createdAt: job.createdAt,
      services,
    };
  }

  private startOfDay(date: Date) {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  private startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private computeServiceProviderRange(filter: 'weekly' | 'monthly' | 'yearly') {
    const today = this.startOfDay(new Date());

    if (filter === 'weekly') {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      return { startDate, range: { days: 7 } };
    }

    if (filter === 'monthly') {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      return { startDate, range: { days: 30 } };
    }

    const startDate = this.startOfMonth(
      new Date(today.getFullYear(), today.getMonth() - 11, 1),
    );
    return { startDate, range: { months: 12 } };
  }

  private buildDailySeries(dates: Date[], totalDays: number) {
    const counts = dates.reduce<Record<string, number>>((acc, date) => {
      const dayKey = this.startOfDay(date).toISOString().split('T')[0];
      acc[dayKey] = (acc[dayKey] || 0) + 1;
      return acc;
    }, {});

    const today = this.startOfDay(new Date());
    const series: { date: string; count: number }[] = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() - i);
      const key = currentDate.toISOString().split('T')[0];
      series.push({
        date: currentDate.toISOString(),
        count: counts[key] || 0,
      });
    }

    return series;
  }

  private buildMonthlySeries(dates: Date[], totalMonths: number) {
    const counts = dates.reduce<Record<string, number>>((acc, date) => {
      const monthDate = this.startOfMonth(date);
      const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const currentMonth = this.startOfMonth(new Date());
    const series: { date: string; count: number }[] = [];

    for (let i = totalMonths - 1; i >= 0; i--) {
      const monthDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - i,
        1,
      );
      const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      series.push({
        date: monthDate.toISOString(),
        count: counts[key] || 0,
      });
    }

    return series;
  }

  private transformServiceProviders(
    providers: {
      id: string;
      email: string;
      phoneNumber: string;
      rating: number;
      totalEarnings: number;
      totalJobs: number;
      isBlocked: boolean;
      isVerified: boolean;
      createdAt: Date;
      name: Prisma.JsonValue | null;
      firstName: Prisma.JsonValue | null;
      lastName: Prisma.JsonValue | null;
    }[],
    language: SupportedLanguage,
  ) {
    return providers.map((provider) => {
      const translated = this.languageService.transformObjectForLanguage(
        {
          ...provider,
        },
        language,
        ['name', 'firstName', 'lastName'],
      ) as {
        name?: string;
        firstName?: string;
        lastName?: string;
      };

      const combinedName = [translated.firstName, translated.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

      const displayName =
        (typeof translated.name === 'string' && translated.name) ||
        combinedName ||
        provider.email;

      return {
        id: provider.id,
        name: displayName,
        email: provider.email,
        rating: provider.rating,
        totalEarnings: provider.totalEarnings,
        completedJobs: provider.totalJobs,
        status: provider.isBlocked ? 'Blocked' : 'Active',
        isBlocked: provider.isBlocked,
        isVerified: provider.isVerified,
        createdDate: provider.createdAt,
      };
    });
  }
}
