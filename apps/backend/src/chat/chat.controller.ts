import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { LanguageService } from 'src/common/services/language.service';
import { S3Service } from 'src/common/services/s3.service';
import { FileManagementService } from './file-management.service';
import { AuthGuard, Roles } from 'src/auth/auth.guard';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly languageService: LanguageService,
    private readonly s3Service: S3Service,
    private readonly fileManagementService: FileManagementService,
  ) {}

  // Community Management - These are handled automatically during signup
  // No manual APIs needed as per requirements

  // One-to-One Chat
  @Post('one-to-one')
  async createOneToOneChat(
    @Req() req: Request,
    @Body() body: { otherUserId: string },
  ) {
    const user = req['user'];
    return this.chatService.createOneToOneChat(user.id, body.otherUserId);
  }

  // Service Provider Chat
  @Post('service-provider')
  @Roles('LEADER', 'HOME_OWNER')
  async createServiceProviderChat(
    @Req() req: Request,
    @Body() body: { jobId: string; serviceProviderId: string },
  ) {
    const user = req['user'];
    return this.chatService.createServiceProviderChat(
      body.jobId,
      body.serviceProviderId,
      user.id,
    );
  }

  // Message Management
  @Post('message')
  async sendMessage(
    @Req() req: Request,
    @Body() dto: CreateMessageDto,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const message = await this.chatService.sendMessage(user, dto);

    return {
      message: this.languageService.transformObjectForLanguage(
        message,
        language,
        ['content'],
      ),
    };
  }

  // Single File Upload API for all file types
  @Post('message/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: /.*/ }), // Allow all file types
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const user = req['user'];
    const fileType = this.fileManagementService.getFileTypeFromMime(
      file.mimetype,
    );
    const fileData = await this.fileManagementService.uploadChatFile(
      file,
      fileType,
      user.id,
    );

    return {
      ...fileData,
      metadata: this.fileManagementService.getFileMetadata(file),
    };
  }

  @Get('message/:chatId')
  async getMessages(
    @Param('chatId') chatId: string,
    @Query() dto: QueryMessagesDto,
    @Query('lang') lang?: string,
  ) {
    const language = this.languageService.validateLanguage(lang);
    const result = await this.chatService.getMessages(chatId, dto);

    return {
      ...result,
      messages: result.messages.map((message) =>
        this.languageService.transformObjectForLanguage(message, language, [
          'content',
        ]),
      ),
    };
  }

  // Poll Management
  @Post('poll')
  async createPoll(
    @Req() req: Request,
    @Body() dto: CreatePollDto,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const poll = await this.chatService.createPoll(user.id, dto);

    return {
      poll: this.languageService.transformObjectForLanguage(poll, language, [
        'question',
        'options',
      ]),
    };
  }

  @Post('poll/vote')
  async votePoll(@Req() req: Request, @Body() dto: VotePollDto) {
    const user = req['user'];
    return this.chatService.votePoll(user.id, dto);
  }

  @Get('poll/:pollId/results')
  async getPollResults(
    @Param('pollId') pollId: string,
    @Query('lang') lang?: string,
  ) {
    const language = this.languageService.validateLanguage(lang);
    const poll = await this.chatService.getPollResults(pollId);

    return {
      poll: this.languageService.transformObjectForLanguage(poll, language, [
        'question',
        'options',
      ]),
    };
  }

  // User Chats
  @Get('user-chats')
  async getUserChats(@Req() req: Request, @Query('lang') lang?: string) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    const chats = await this.chatService.getUserChats(user.id);

    return {
      chats: chats.map((chat) => {
        const transformedChat = this.languageService.transformObjectForLanguage(
          chat,
          language,
          ['name', 'community', 'job', 'messages'],
        );

        // Ensure community field is properly handled
        if (
          transformedChat.community &&
          typeof transformedChat.community === 'object'
        ) {
          transformedChat.community =
            this.languageService.transformObjectForLanguage(
              transformedChat.community,
              language,
              ['name'],
            );
        }

        // Transform service provider names in participants
        if (
          transformedChat.participants &&
          Array.isArray(transformedChat.participants)
        ) {
          transformedChat.participants = transformedChat.participants.map(
            (participant: any) => {
              if (
                participant.serviceProvider &&
                participant.serviceProvider.name
              ) {
                participant.serviceProvider =
                  this.languageService.transformObjectForLanguage(
                    participant.serviceProvider,
                    language,
                    ['name'],
                  );
              }
              return participant;
            },
          );
        }

        return transformedChat;
      }),
    };
  }

  // Get Service Provider Chats
  @Get('service-provider/chats')
  async getServiceProviderChats(
    @Req() req: Request,
    @Query('lang') lang?: string,
  ) {
    const serviceProvider = req['user'];

    // Ensure this is a service provider request
    if (serviceProvider.type !== 'serviceProvider') {
      throw new ForbiddenException(
        'Only service providers can access this endpoint',
      );
    }

    const language = this.languageService.validateLanguage(lang);
    const chats = await this.chatService.getServiceProviderChats(
      serviceProvider.id,
    );

    return {
      chats: chats.map((chat) => {
        const transformedChat = this.languageService.transformObjectForLanguage(
          chat,
          language,
          ['name', 'community', 'job', 'messages'],
        );

        // Ensure community field is properly handled
        if (
          transformedChat.community &&
          typeof transformedChat.community === 'object'
        ) {
          transformedChat.community =
            this.languageService.transformObjectForLanguage(
              transformedChat.community,
              language,
              ['name'],
            );
        }

        // Transform service provider names in participants
        if (
          transformedChat.participants &&
          Array.isArray(transformedChat.participants)
        ) {
          transformedChat.participants = transformedChat.participants.map(
            (participant: any) => {
              if (
                participant.serviceProvider &&
                participant.serviceProvider.name
              ) {
                participant.serviceProvider =
                  this.languageService.transformObjectForLanguage(
                    participant.serviceProvider,
                    language,
                    ['name'],
                  );
              }
              return participant;
            },
          );
        }

        return transformedChat;
      }),
    };
  }

  // Community Members
  @Get('community/:communityId/members')
  async getCommunityMembers(
    @Req() req: Request,
    @Param('communityId') communityId: string,
  ) {
    const user = req['user'];
    return this.chatService.getCommunityMembers(communityId, user.id);
  }

  // Apartment Home Owners
  @Get('apartment/:apartmentId/home-owners')
  async getApartmentHomeOwners(@Param('apartmentId') apartmentId: string) {
    return this.chatService.getApartmentHomeOwners(apartmentId);
  }

  // Get leader for home owner
  @Get('apartment/:apartmentId/leader')
  async getApartmentLeader(@Param('apartmentId') apartmentId: string) {
    return this.chatService.getApartmentLeader(apartmentId);
  }

  // Get user's community
  @Get('user/:userId/community')
  async getUserCommunity(@Param('userId') userId: string) {
    return this.chatService.getUserCommunity(userId);
  }

  // Mark messages as read
  @Post('chat/:chatId/mark-read')
  async markMessagesAsRead(
    @Req() req: Request,
    @Param('chatId') chatId: string,
  ) {
    const user = req['user'];
    return this.chatService.markMessagesAsRead(user.id, chatId);
  }

  // Get unread message count
  @Get('unread-count')
  async getUnreadCount(@Req() req: Request) {
    const user = req['user'];
    return this.chatService.getUnreadCount(user.id);
  }
}
