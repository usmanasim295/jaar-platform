import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { NafathAppController } from './nafath-app.controller';
import { NafathAppService } from './nafath-app.service';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from 'src/common/services/message.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [NafathAppController],
  providers: [NafathAppService, JwtService, MessageService, PrismaService],
  exports: [NafathAppService],
})
export class NafathAppModule {}
