import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UserStatsQueryDto } from './dto/user-stats-query.dto';
import { AdminPaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateBlockStatusDto } from './dto/update-block-status.dto';
import { UpdateVerificationStatusDto } from './dto/update-verification-status.dto';
import { Public, Roles } from 'src/auth/auth.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('register')
  registerAdmin(@Body() dto: RegisterAdminDto, @Query('lang') lang?: string) {
    return this.adminService.registerAdmin(dto, lang);
  }

  @Public()
  @Post('login')
  loginAdmin(@Body() dto: LoginAdminDto, @Query('lang') lang?: string) {
    return this.adminService.loginAdmin(dto, lang);
  }

  @Get('summary')
  @Roles(Role.ADMIN)
  getSummary(@Query('lang') lang?: string) {
    return this.adminService.getTotals(lang);
  }

  @Get('user-stats')
  @Roles(Role.ADMIN)
  getUserStats(@Query() query: UserStatsQueryDto) {
    return this.adminService.getUserStats(query, query.lang);
  }

  @Get('service-providers/top')
  @Roles(Role.ADMIN)
  getTopServiceProviders(@Query('lang') lang?: string) {
    return this.adminService.getTopServiceProviders(lang);
  }

  @Get('service-providers/stats')
  @Roles(Role.ADMIN)
  getServiceProviderStats(@Query() query: UserStatsQueryDto) {
    return this.adminService.getServiceProviderStats(query, query.lang);
  }

  @Get('homeowners')
  @Roles(Role.ADMIN)
  getHomeOwners(@Query() query: AdminPaginationQueryDto) {
    return this.adminService.getHomeOwners(query, query.lang);
  }

  @Get('hoa-leaders')
  @Roles(Role.ADMIN)
  getHoaLeaders(@Query() query: AdminPaginationQueryDto) {
    return this.adminService.getLeaders(query, query.lang);
  }

  @Get('service-providers')
  @Roles(Role.ADMIN)
  getServiceProviders(@Query() query: AdminPaginationQueryDto) {
    return this.adminService.getServiceProviders(query, query.lang);
  }

  @Get('service-providers/pending')
  @Roles(Role.ADMIN)
  getUnverifiedServiceProviders(@Query() query: AdminPaginationQueryDto) {
    return this.adminService.getUnverifiedServiceProviders(query, query.lang);
  }

  @Get('users/:id')
  @Roles(Role.ADMIN)
  getUserDetail(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.adminService.getUserDetail(id, lang);
  }

  @Delete('users/:id')
  @Roles(Role.ADMIN)
  deleteUser(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.adminService.deleteUser(id, lang);
  }

  @Get('service-providers/:id')
  @Roles(Role.ADMIN)
  getServiceProviderDetail(
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ) {
    return this.adminService.getServiceProviderDetail(id, lang);
  }

  @Patch('users/:id/block')
  @Roles(Role.ADMIN)
  updateUserBlockStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBlockStatusDto,
    @Query('lang') lang?: string,
  ) {
    return this.adminService.updateUserBlockStatus(id, dto, lang);
  }

  @Patch('service-providers/:id/block')
  @Roles(Role.ADMIN)
  updateServiceProviderBlockStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBlockStatusDto,
    @Query('lang') lang?: string,
  ) {
    return this.adminService.updateServiceProviderBlockStatus(id, dto, lang);
  }

  @Patch('service-providers/:id/verify')
  @Roles(Role.ADMIN)
  updateServiceProviderVerificationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateVerificationStatusDto,
    @Query('lang') lang?: string,
  ) {
    return this.adminService.updateServiceProviderVerificationStatus(
      id,
      dto,
      lang,
    );
  }
}
