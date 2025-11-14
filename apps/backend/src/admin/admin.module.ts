import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LanguageService } from 'src/common/services/language.service';
import { MessageService } from 'src/common/services/message.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, LanguageService, MessageService],
})
export class AdminModule {}
