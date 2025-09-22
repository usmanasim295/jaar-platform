import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
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
      signOptions: { expiresIn: process.env.JWT_TIME },
    }),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    FileManagementService,
    TranslationService,
    S3Service,
    LanguageService,
  ],
  exports: [ChatService],
})
export class ChatModule {}
