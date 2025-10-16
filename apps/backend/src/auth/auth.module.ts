import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { ApartmentModule } from 'src/apartment/apartment.module';
import { S3Service } from 'src/common/services/s3.service';
import { TranslationService } from 'src/common/services/translation.service';
import { LanguageService } from 'src/common/services/language.service';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [
    PrismaModule,
    ApartmentModule,
    ChatModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: (process.env.JWT_TIME as any) || '1d' },
    }),
  ],
  providers: [
    AuthService,
    S3Service,
    TranslationService,
    LanguageService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
