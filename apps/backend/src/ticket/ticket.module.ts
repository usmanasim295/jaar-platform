import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TranslationService } from '../common/services/translation.service';
import { LanguageService } from '../common/services/language.service';
import { MessageService } from '../common/services/message.service';
import { S3Service } from '../common/services/s3.service';

@Module({
  imports: [PrismaModule],
  controllers: [TicketController],
  providers: [
    TicketService,
    TranslationService,
    LanguageService,
    MessageService,
    S3Service,
  ],
  exports: [TicketService],
})
export class TicketModule {}
