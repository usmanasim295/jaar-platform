import { Module, forwardRef } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { JobCompletionRequestService } from './job-completion-request.service';
import { JobCompletionRequestController } from './job-completion-request.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Service } from '../common/services/s3.service';
import { TranslationService } from '../common/services/translation.service';
import { LanguageService } from '../common/services/language.service';
import { MessageService } from '../common/services/message.service';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [PrismaModule, forwardRef(() => ChatModule)],
  controllers: [JobController, BidController, JobCompletionRequestController],
  providers: [
    JobService,
    BidService,
    JobCompletionRequestService,
    S3Service,
    TranslationService,
    LanguageService,
    MessageService,
  ],
  exports: [JobService, BidService, JobCompletionRequestService],
})
export class JobModule {}
