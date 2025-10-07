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
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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

  // Service Provider Chat (created by Leader or Home Owner)
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

  // Service Provider Initiates Chat (from their bids)
  @Post('service-provider/initiate')
  @Roles('SERVICE_PROVIDER')
  async initiateServiceProviderChat(
    @Req() req: Request,
    @Body() body: { jobId: string },
  ) {
    const user = req['user'];
    if (!user.serviceProviderId) {
      throw new BadRequestException('Service provider ID not found');
    }
    return this.chatService.initiateServiceProviderChat(
      body.jobId,
      user.serviceProviderId,
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

  // Multiple File Upload API for all file types
  @Post('message/upload')
  @UseInterceptors(FilesInterceptor('file', 10)) // Allow up to 10 files
  async uploadFile(
    @Req() req: Request,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          // Remove FileTypeValidator to allow all file types
        ],
        fileIsRequired: true,
      }),
    )
    files: Express.Multer.File[],
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);

    // Get parameters from form-data
    const chatId = (req as any).body?.chatId;
    const content = (req as any).body?.content;
    const replyToId = (req as any).body?.replyToId;

    if (!chatId) {
      throw new BadRequestException('chatId is required');
    }

    if (!content) {
      throw new BadRequestException('content is required');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    // Upload all files and collect file data
    const uploadedFiles: any[] = [];
    for (const file of files) {
      const fileType = this.fileManagementService.getFileTypeFromMime(
        file.mimetype,
      );
      const fileData = await this.fileManagementService.uploadChatFile(
        file,
        fileType,
        user.id,
      );
      uploadedFiles.push(fileData);
    }

    // Determine message type based on the first file
    const firstFileType = this.fileManagementService.getFileTypeFromMime(
      files[0].mimetype,
    );
    let messageType: any;
    if (firstFileType === 'images') {
      messageType = 'IMAGE';
    } else if (firstFileType === 'voice') {
      messageType = 'VOICE_NOTE';
    } else if (firstFileType === 'documents' || firstFileType === 'files') {
      messageType = 'FILE';
    } else {
      messageType = 'FILE'; // Default to FILE for unknown types
    }

    // Create message with multiple files
    const messageDto = {
      chatId,
      content,
      type: messageType,
      replyToId: replyToId || undefined,
      fileUrl: uploadedFiles[0].fileUrl, // Primary file URL
      fileName: uploadedFiles[0].fileName, // Primary file name
      fileSize: uploadedFiles[0].fileSize, // Primary file size
      mimeType: uploadedFiles[0].mimeType, // Primary file MIME type
      // Store additional files in a custom field (you might want to add this to your schema)
      additionalFiles: uploadedFiles.slice(1).map((file) => ({
        fileUrl: file.fileUrl,
        fileName: file.fileName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
      })),
    };

    const message = await this.chatService.sendMessage(user, messageDto);

    return {
      message: this.languageService.transformObjectForLanguage(
        message,
        language,
        ['content'],
      ),
      uploadedFiles: uploadedFiles, // Return all uploaded file info
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
      messages: result.messages.map((message) => {
        // Transform the main message object
        const transformedMessage =
          this.languageService.transformObjectForLanguage(message, language, [
            'content',
          ]);

        // Transform poll data if it exists
        if (message.poll) {
          transformedMessage.poll =
            this.languageService.transformObjectForLanguage(
              message.poll,
              language,
              ['question'],
            );

          // Transform poll options array
          if (message.poll.options && Array.isArray(message.poll.options)) {
            transformedMessage.poll.options =
              this.languageService.transformArrayForLanguage(
                message.poll.options,
                language,
                ['text'],
              );
          }
        }

        return transformedMessage;
      }),
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

    // Transform the poll object with proper handling of nested options array
    const transformedPoll = this.languageService.transformObjectForLanguage(
      poll,
      language,
      ['question'],
    );

    // Transform the options array separately
    if (poll.options && Array.isArray(poll.options)) {
      transformedPoll.options = this.languageService.transformArrayForLanguage(
        poll.options,
        language,
        ['text'],
      );
    }

    return {
      poll: transformedPoll,
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

    // Transform the poll object with proper handling of nested options array
    const transformedPoll = this.languageService.transformObjectForLanguage(
      poll,
      language,
      ['question'],
    );

    // Transform the options array separately
    if (poll.options && Array.isArray(poll.options)) {
      transformedPoll.options = this.languageService.transformArrayForLanguage(
        poll.options,
        language,
        ['text'],
      );
    }

    return {
      poll: transformedPoll,
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
          ['name', 'community'],
        );

        // Transform messages array separately to avoid corruption
        if (
          transformedChat.messages &&
          Array.isArray(transformedChat.messages)
        ) {
          transformedChat.messages = transformedChat.messages.map(
            (message: any) => {
              return this.languageService.transformObjectForLanguage(
                message,
                language,
                ['content'],
              );
            },
          );
        }

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

        // Transform job title if present
        if (
          transformedChat.job &&
          typeof transformedChat.job === 'object' &&
          transformedChat.job.title
        ) {
          transformedChat.job = this.languageService.transformObjectForLanguage(
            transformedChat.job,
            language,
            ['title'],
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
          ['name', 'community'],
        );

        // Transform messages array separately to avoid corruption
        if (
          transformedChat.messages &&
          Array.isArray(transformedChat.messages)
        ) {
          transformedChat.messages = transformedChat.messages.map(
            (message: any) => {
              return this.languageService.transformObjectForLanguage(
                message,
                language,
                ['content'],
              );
            },
          );
        }

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

        // Transform job title if present
        if (
          transformedChat.job &&
          typeof transformedChat.job === 'object' &&
          transformedChat.job.title
        ) {
          transformedChat.job = this.languageService.transformObjectForLanguage(
            transformedChat.job,
            language,
            ['title'],
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
