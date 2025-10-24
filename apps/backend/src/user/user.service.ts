import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageService } from 'src/common/services/message.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private messageService: MessageService,
  ) {}

  async findOneById(id: string, language: 'en' | 'ar' = 'en') {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('auth.user_not_found', language),
      );
    }

    return user;
  }
}
