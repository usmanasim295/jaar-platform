import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ServiceModule } from './service/service.module';
import { JobModule } from './job/job.module';
import { ServiceProviderModule } from './service-provider/service-provider.module';
import { ApartmentModule } from './apartment/apartment.module';
import { ChatModule } from './chat/chat.module';
import { NafathAppModule } from './nafath-app/nafath-app.module';
import { AdminModule } from './admin/admin.module';
import { TicketModule } from './ticket/ticket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    PrismaModule,
    AuthModule,
    UserModule,
    ServiceModule,
    JobModule,
    ServiceProviderModule,
    ApartmentModule,
    ChatModule,
    NafathAppModule,
    AdminModule,
    TicketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
