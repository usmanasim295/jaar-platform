import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageService } from 'src/common/services/message.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, MessageService],
  exports: [UserService],
})
export class UserModule {}
