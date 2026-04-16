import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TranslationService } from '../common/services/translation.service';
import { LanguageService } from '../common/services/language.service';
import { MessageService } from '../common/services/message.service';

@Module({
  imports: [PrismaModule],
  controllers: [TicketController],
  providers: [TicketService, TranslationService, LanguageService, MessageService],
  exports: [TicketService],
})
export class TicketModule {}
