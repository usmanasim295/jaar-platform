import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { RealtimeService } from './realtime.service';
import { FileManagementService } from './file-management.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TranslationService } from 'src/common/services/translation.service';
import { S3Service } from 'src/common/services/s3.service';
import { LanguageService } from 'src/common/services/language.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_TIME || '1d' },
    }),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    RealtimeService,
    FileManagementService,
    TranslationService,
    S3Service,
    LanguageService,
  ],
  exports: [ChatService, RealtimeService],
})
export class ChatModule {}
