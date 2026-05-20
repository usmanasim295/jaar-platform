import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { TranslationService } from 'src/common/services/translation.service';
import { S3Service } from 'src/common/services/s3.service';
import { MessageService } from 'src/common/services/message.service';
import { Role, ChatType, MessageType, CommunityRole } from '@prisma/client';
import { RealtimeService } from './realtime.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
    private s3Service: S3Service,
    private messageService: MessageService,
    private realtimeService: RealtimeService,
  ) {}

  // Community Management - These methods are used internally during signup
  async createOrGetCommunity(hoaNumber: string, hoaId: string) {
    let community = await this.prisma.community.findUnique({
      where: { hoaNumber },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
          },
        },
        hoa: true,
      },
    });

    if (!community) {
      // Create new community
      const communityName =
        await this.translationService.createTranslationObject(
          `Community ${hoaNumber}`,
        );

      community = await this.prisma.community.create({
        data: {
          hoaNumber,
          name: communityName,
          hoaId,
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  nationalId: true,
                  role: true,
                },
              },
            },
          },
          hoa: true,
        },
      });
    }

    return community;
  }

  async addUserToCommunity(
    userId: string,
    hoaNumber: string,
    language: 'en' | 'ar' = 'en',
  ) {
    const community = await this.prisma.community.findUnique({
      where: { hoaNumber },
    });

    if (!community) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'chat.community_not_found',
          language,
        ),
      );
    }

    // Check if user is already a member
    const existingMember = await this.prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId,
        },
      },
    });

    if (existingMember) {
      return existingMember;
    }

    // Get user role to determine community role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('auth.user_not_found', language),
      );
    }

    const communityRole =
      user.role === Role.LEADER ? CommunityRole.LEADER : CommunityRole.MEMBER;

    const member = await this.prisma.communityMember.create({
      data: {
        communityId: community.id,
        userId,
        role: communityRole,
      },
    });

    // Emit real-time event for new community member
    this.realtimeService.emitNewCommunityMember(community.id, userId);

    return member;
  }

  // Chat Management
  async createCommunityGroupChat(
    communityId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
      include: { members: true },
    });

    if (!community) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'chat.community_not_found',
          language,
        ),
      );
    }

    // Check if group chat already exists
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        communityId,
        type: ChatType.COMMUNITY_GROUP,
      },
    });

    if (existingChat) {
      return existingChat;
    }

    const chatName = await this.translationService.createTranslationObject(
      `Community Chat - ${community.hoaNumber}`,
    );

    const chat = await this.prisma.chat.create({
      data: {
        type: ChatType.COMMUNITY_GROUP,
        name: chatName,
        communityId,
      },
    });

    // Add all community members to the chat
    const participants = community.members.map((member) => ({
      chatId: chat.id,
      userId: member.userId,
    }));

    await this.prisma.chatParticipant.createMany({
      data: participants,
    });

    return chat;
  }

  async addUserToGroupChat(userId: string, chatId: string) {
    // Check if user is already a participant
    const existingParticipant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (existingParticipant) {
      return existingParticipant;
    }

    // Add user to the chat
    const participant = await this.prisma.chatParticipant.create({
      data: {
        chatId,
        userId,
      },
    });

    // Emit real-time event for user joining chat
    this.realtimeService.emitUserJoinedChat(chatId, userId);

    return participant;
  }

  // Add user to all existing community group chats
  async addUserToAllCommunityGroupChats(userId: string, communityId: string) {
    // Get all community group chats
    const groupChats = await this.prisma.chat.findMany({
      where: {
        communityId,
        type: ChatType.COMMUNITY_GROUP,
      },
    });

    // Add user to each group chat
    for (const chat of groupChats) {
      await this.addUserToGroupChat(userId, chat.id);
    }

    return groupChats;
  }

  async createOneToOneChat(
    participant1Id: string,
    participant2Id: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Check if chat already exists between these two users
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        type: ChatType.ONE_TO_ONE,
        AND: [
          {
            participants: {
              some: {
                userId: participant1Id,
              },
            },
          },
          {
            participants: {
              some: {
                userId: participant2Id,
              },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (existingChat) {
      return existingChat;
    }

    // Get the other user's details for the chat name
    const otherUser = await this.prisma.user.findUnique({
      where: { id: participant2Id },
      select: { nationalId: true, role: true },
    });

    if (!otherUser) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'chat.other_user_not_found',
          language,
        ),
      );
    }

    // Create chat name with the other user's details
    const chatName = await this.translationService.createTranslationObject(
      `${otherUser.nationalId} (${otherUser.role})`,
    );

    const chat = await this.prisma.chat.create({
      data: {
        type: ChatType.ONE_TO_ONE,
        name: chatName,
      },
    });

    // Add both participants
    await this.prisma.chatParticipant.createMany({
      data: [
        { chatId: chat.id, userId: participant1Id },
        { chatId: chat.id, userId: participant2Id },
      ],
    });

    // Return chat with participants
    return this.prisma.chat.findUnique({
      where: { id: chat.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async createServiceProviderChat(
    jobId: string,
    serviceProviderId: string,
    requestingUserId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        hoa: {
          include: {
            userHOAs: {
              where: { isLeader: true },
              include: {
                user: true,
              },
            },
          },
        },
        creator: true,
      },
    });

    if (!job) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('chat.job_not_found', language),
      );
    }

    // Validate that the requesting user has permission to create this chat
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
      select: { role: true },
    });

    if (!requestingUser) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'chat.requesting_user_not_found',
          language,
        ),
      );
    }

    // Check permissions based on job type and user role
    if (job.jobType === 'COMMUNITY_SERVICE') {
      // Only leaders can create chats for community services
      if (requestingUser.role !== 'LEADER') {
        throw new ForbiddenException(
          this.messageService.getErrorMessage(
            'chat.only_leaders_can_create_community_chats',
            language,
          ),
        );
      }
      // Verify the leader is the HOA leader
      const leaderUserHOA = job.hoa.userHOAs?.find((uh) => uh.isLeader);
      if (!leaderUserHOA || leaderUserHOA.userId !== requestingUserId) {
        throw new ForbiddenException(
          this.messageService.getErrorMessage(
            'chat.only_apartment_leader_can_create_community_chats',
            language,
          ),
        );
      }
    } else if (job.jobType === 'HOME_SERVICE') {
      // Homeowners can create chats for home services they posted
      if (
        requestingUser.role === 'HOME_OWNER' &&
        job.createdBy !== requestingUserId
      ) {
        throw new ForbiddenException(
          this.messageService.getErrorMessage(
            'chat.only_job_creator_can_create_home_chats',
            language,
          ),
        );
      }
      // Leaders can also create chats for home services in their HOA
      if (requestingUser.role === 'LEADER') {
        const leaderUserHOA = job.hoa.userHOAs?.find((uh) => uh.isLeader);
        if (!leaderUserHOA || leaderUserHOA.userId !== requestingUserId) {
          throw new ForbiddenException(
            this.messageService.getErrorMessage(
              'chat.only_apartment_leader_can_create_home_chats',
              language,
            ),
          );
        }
      }
    }

    // Check if chat already exists for this job and service provider
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        jobId,
        type: ChatType.SERVICE_CHAT,
        participants: {
          some: {
            serviceProviderId,
          },
        },
      },
    });

    if (existingChat) {
      return this.prisma.chat.findUnique({
        where: { id: existingChat.id },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  nationalId: true,
                  role: true,
                },
              },
              serviceProvider: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              status: true,
              jobType: true,
            },
          },
          community: {
            select: {
              id: true,
              hoaNumber: true,
              name: true,
            },
          },
          messages: {
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
              sender: {
                select: {
                  id: true,
                  nationalId: true,
                  role: true,
                },
              },
              senderServiceProvider: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      });
    }

    // Get service provider details for chat name
    const serviceProvider = await this.prisma.serviceProvider.findUnique({
      where: { id: serviceProviderId },
      select: { name: true },
    });

    if (!serviceProvider) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'chat.service_provider_not_found',
          language,
        ),
      );
    }

    // Create chat name with service provider name
    const serviceProviderName = serviceProvider.name as any;
    const displayName =
      serviceProviderName?.en || serviceProviderName?.ar || 'Service Provider';

    const chatName = await this.translationService.createTranslationObject(
      `Service Chat - ${displayName}`,
    );

    const chat = await this.prisma.chat.create({
      data: {
        type: ChatType.SERVICE_CHAT,
        name: chatName,
        jobId,
      },
    });

    // Add participants based on job type
    const participants: any[] = [{ chatId: chat.id, serviceProviderId }];

    if (job.jobType === 'COMMUNITY_SERVICE') {
      // Only leader can chat for community service
      const leaderUserHOA = job.hoa.userHOAs?.find((uh) => uh.isLeader);
      if (leaderUserHOA && leaderUserHOA.user) {
        participants.push({
          chatId: chat.id,
          userId: leaderUserHOA.user.id,
        });
      }
    } else {
      // Home service - only job creator can chat
      participants.push({ chatId: chat.id, userId: job.creator.id });
    }

    await this.prisma.chatParticipant.createMany({
      data: participants,
    });

    return chat;
  }

  // Service provider initiates chat (from their bids)
  async initiateServiceProviderChat(
    jobId: string,
    serviceProviderId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        hoa: {
          include: {
            userHOAs: {
              where: { isLeader: true },
              include: {
                user: true,
              },
            },
          },
        },
        creator: true,
        bids: {
          where: { serviceProviderId },
          select: { id: true, status: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('chat.job_not_found', language),
      );
    }

    // Verify the service provider has a bid for this job
    if (!job.bids || job.bids.length === 0) {
      throw new ForbiddenException(
        'You must have a bid on this job to initiate a chat',
      );
    }

    // Check if chat already exists for this job and service provider
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        jobId,
        type: ChatType.SERVICE_CHAT,
        participants: {
          some: {
            serviceProviderId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
            serviceProvider: {
              select: {
                id: true,
                name: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (existingChat) {
      return existingChat;
    }

    // Get service provider details for chat name
    const serviceProvider = await this.prisma.serviceProvider.findUnique({
      where: { id: serviceProviderId },
      select: { name: true },
    });

    if (!serviceProvider) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'chat.service_provider_not_found',
          language,
        ),
      );
    }

    // Create chat name with service provider name
    const serviceProviderName = serviceProvider.name as any;
    const displayName =
      serviceProviderName?.en || serviceProviderName?.ar || 'Service Provider';

    const chatName = await this.translationService.createTranslationObject(
      `Service Chat - ${displayName}`,
    );

    const chat = await this.prisma.chat.create({
      data: {
        type: ChatType.SERVICE_CHAT,
        name: chatName,
        jobId,
      },
    });

    // Add participants based on job type
    const participants: any[] = [{ chatId: chat.id, serviceProviderId }];

    if (job.jobType === 'COMMUNITY_SERVICE') {
      // For community service, chat with the leader
      const leaderUserHOA = job.hoa.userHOAs?.find((uh) => uh.isLeader);
      if (!leaderUserHOA || !leaderUserHOA.user) {
        // Cleanup if no leader found
        await this.prisma.chat.delete({ where: { id: chat.id } });
        throw new NotFoundException(
          'Leader not found for this community service job',
        );
      }
      participants.push({
        chatId: chat.id,
        userId: leaderUserHOA.user.id,
      });
    } else if (job.jobType === 'HOME_SERVICE') {
      // For home service, chat with the job creator (home owner)
      if (!job.creator) {
        // Cleanup if no creator found
        await this.prisma.chat.delete({ where: { id: chat.id } });
        throw new NotFoundException(
          'Job creator not found for this home service job',
        );
      }
      participants.push({ chatId: chat.id, userId: job.creator.id });
    } else if (job.jobType === 'RFQ') {
      // For RFQ, chat with the leader who created the job
      if (!job.creator) {
        await this.prisma.chat.delete({ where: { id: chat.id } });
        throw new NotFoundException('Job creator not found for this RFQ job');
      }
      participants.push({ chatId: chat.id, userId: job.creator.id });
    }

    await this.prisma.chatParticipant.createMany({
      data: participants,
    });

    // Return the chat with full details
    return this.prisma.chat.findUnique({
      where: { id: chat.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
            serviceProvider: {
              select: {
                id: true,
                name: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  // Message Management
  async sendMessage(
    sender: any,
    dto: CreateMessageDto & {
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      latitude?: number;
      longitude?: number;
    },
    language: 'en' | 'ar' = 'en',
  ) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: dto.chatId },
      include: {
        participants: true,
        community: { include: { members: true } },
      },
    });

    if (!chat) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('chat.chat_not_found', language),
      );
    }

    const senderId = sender.id;
    const isAuthorized = await this.checkChatPermission(senderId, chat);
    if (!isAuthorized) {
      throw new ForbiddenException(
        this.messageService.getErrorMessage('chat.not_authorized', language),
      );
    }

    // Handle content translation
    let contentTranslation: any = undefined;
    if (dto.content) {
      contentTranslation =
        await this.translationService.createTranslationObject(dto.content);
    }

    // Default type to TEXT if not provided
    const messageType = dto.type || MessageType.TEXT;

    // Determine if sender is a user or service provider
    const isServiceProvider = sender.type === 'serviceProvider';

    const messageData: any = {
      chatId: dto.chatId,
      type: messageType,
      content: contentTranslation,
      fileUrl: dto.fileUrl,
      fileName: dto.fileName,
      fileSize: dto.fileSize,
      mimeType: dto.mimeType,
      latitude: dto.latitude,
      longitude: dto.longitude,
      pollId: dto.pollId,
      replyToId: dto.replyToId,
    };

    if (isServiceProvider) {
      messageData.senderServiceProviderId = senderId;
      messageData.senderId = null;
    } else {
      messageData.senderId = senderId;
      messageData.senderServiceProviderId = null;
    }

    const message = await this.prisma.message.create({
      data: messageData,
      include: {
        sender: { select: { id: true, nationalId: true, role: true } },
        senderServiceProvider: {
          select: { id: true, name: true, email: true },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
            senderServiceProvider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        poll: { include: { options: true } },
      },
    });

    // Update lastReadAt for sender
    if (isServiceProvider) {
      await this.prisma.chatParticipant.updateMany({
        where: { chatId: dto.chatId, serviceProviderId: senderId },
        data: { lastReadAt: new Date() },
      });
    } else {
      await this.prisma.chatParticipant.updateMany({
        where: { chatId: dto.chatId, userId: senderId },
        data: { lastReadAt: new Date() },
      });
    }

    await this.prisma.chat.update({
      where: { id: dto.chatId },
      data: { updatedAt: new Date() },
    });

    this.realtimeService.emitNewMessage(dto.chatId, message);

    return message;
  }
  async getMessages(
    chatId: string,
    dto: QueryMessagesDto,
    language: 'en' | 'ar' = 'en',
  ) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('chat.chat_not_found', language),
      );
    }

    const where: any = {
      chatId,
      isDeleted: false,
    };

    if (dto.cursor) {
      where.id = dto.order === 'desc' ? { lt: dto.cursor } : { gt: dto.cursor };
    }

    const messages = await this.prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            nationalId: true,
            role: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
            senderServiceProvider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        poll: {
          include: {
            options: {
              include: {
                votes: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: dto.order,
      },
      take: dto.limit,
    });

    return {
      messages,
      hasMore: messages.length === dto.limit,
      nextCursor: messages.length > 0 ? messages[messages.length - 1].id : null,
    };
  }

  // Poll Management
  async createPoll(creatorId: string, dto: CreatePollDto) {
    // Handle translation for question
    const questionTranslation =
      await this.translationService.createTranslationObject(dto.question);

    const poll = await this.prisma.poll.create({
      data: {
        question: questionTranslation,
        isMultipleChoice: dto.isMultipleChoice || false,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdBy: creatorId,
        communityId: dto.communityId,
        chatId: dto.chatId,
      },
    });

    // Create poll options with translation
    const optionsData = await Promise.all(
      dto.options.map(async (option) => ({
        pollId: poll.id,
        text: await this.translationService.createTranslationObject(
          option.text,
        ),
      })),
    );

    const options = await this.prisma.pollOption.createMany({
      data: optionsData,
    });

    // Get the created options
    const createdOptions = await this.prisma.pollOption.findMany({
      where: { pollId: poll.id },
    });

    // Create a message in the chat for the poll
    if (dto.chatId) {
      const message = await this.prisma.message.create({
        data: {
          chatId: dto.chatId,
          senderId: creatorId,
          type: 'POLL',
          content: questionTranslation, // Store poll question as message content
          pollId: poll.id,
        },
        include: {
          sender: {
            select: {
              id: true,
              nationalId: true,
              role: true,
            },
          },
          poll: {
            include: {
              options: true,
            },
          },
        },
      });

      // Emit real-time events for new poll
      this.realtimeService.emitNewPoll(dto.chatId, {
        id: poll.id,
        chatId: dto.chatId,
        question: questionTranslation,
        options: createdOptions,
        createdBy: creatorId,
        createdAt: poll.createdAt,
      });
      this.realtimeService.emitNewMessage(dto.chatId, message);
    }

    return {
      ...poll,
      options: createdOptions,
    };
  }

  async votePoll(
    voterId: string,
    dto: VotePollDto,
    language: 'en' | 'ar' = 'en',
  ) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: dto.pollId },
      include: { options: true },
    });

    if (!poll) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('chat.poll_not_found', language),
      );
    }

    if (!poll.isActive) {
      throw new BadRequestException(
        this.messageService.getErrorMessage('chat.poll_not_active', language),
      );
    }

    if (poll.expiresAt && new Date() > poll.expiresAt) {
      throw new BadRequestException(
        this.messageService.getErrorMessage('chat.poll_expired', language),
      );
    }

    if (!poll.isMultipleChoice && dto.optionIds.length > 1) {
      throw new BadRequestException(
        'Multiple choice not allowed for this poll',
      );
    }

    // Check if user has already voted
    const existingVote = await this.prisma.pollVote.findFirst({
      where: {
        pollId: dto.pollId,
        voterId,
      },
    });

    if (existingVote) {
      throw new ConflictException(
        this.messageService.getErrorMessage('chat.already_voted', language),
      );
    }

    // Validate option IDs
    const validOptionIds = poll.options.map((option) => option.id);
    const invalidOptions = dto.optionIds.filter(
      (id) => !validOptionIds.includes(id),
    );
    if (invalidOptions.length > 0) {
      throw new BadRequestException(
        this.messageService.getErrorMessage(
          'chat.invalid_poll_options',
          language,
        ),
      );
    }

    // Create votes
    const votes = await this.prisma.pollVote.createMany({
      data: dto.optionIds.map((optionId) => ({
        pollId: dto.pollId,
        optionId,
        voterId,
      })),
    });

    // Emit real-time events for each vote
    if (poll.chatId) {
      for (const optionId of dto.optionIds) {
        this.realtimeService.emitPollVote(
          poll.chatId,
          dto.pollId,
          voterId,
          optionId,
        );
      }
    }

    return votes;
  }

  async getPollResults(pollId: string, language: 'en' | 'ar' = 'en') {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: {
              include: {
                voter: {
                  select: {
                    id: true,
                    nationalId: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            nationalId: true,
            role: true,
          },
        },
      },
    });

    if (!poll) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('chat.poll_not_found', language),
      );
    }

    return poll;
  }

  // Helper Methods
  private async checkChatPermission(
    userId: string,
    chat: any,
  ): Promise<boolean> {
    // Check if user is a participant in the chat
    const isParticipant = chat.participants.some(
      (p: any) => p.userId === userId || p.serviceProviderId === userId,
    );
    if (isParticipant) return true;

    // For community chats, check if user is a community member
    if (chat.community) {
      const isCommunityMember = chat.community.members.some(
        (m: any) => m.userId === userId,
      );
      return isCommunityMember;
    }

    return false;
  }

  // Get user's chats
  async getUserChats(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            OR: [{ userId }, { serviceProviderId: userId }],
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
            serviceProvider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        community: {
          select: {
            id: true,
            hoaNumber: true,
            name: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            jobType: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
            senderServiceProvider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return chats;
  }

  // Get service provider's chats
  async getServiceProviderChats(serviceProviderId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            serviceProviderId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
            serviceProvider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        community: {
          select: {
            id: true,
            hoaNumber: true,
            name: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            jobType: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
            senderServiceProvider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return chats;
  }

  // Get community members for leader
  async getCommunityMembers(
    communityId: string,
    requestingUserId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // Get the requesting user's role
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
      select: { role: true },
    });

    if (!requestingUser) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('auth.user_not_found', language),
      );
    }

    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                nationalId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!community) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'chat.community_not_found',
          language,
        ),
      );
    }

    // Role-based filtering
    if (requestingUser.role === 'LEADER') {
      // Leaders can see all members
      return community.members;
    } else if (requestingUser.role === 'HOME_OWNER') {
      // Homeowners can only see leaders
      return community.members.filter(
        (member) => member.user.role === 'LEADER',
      );
    } else {
      // Service providers or other roles cannot access this endpoint
      throw new ForbiddenException(
        this.messageService.getErrorMessage(
          'chat.access_denied_community_members',
          language,
        ),
      );
    }
  }

  // Get HOA home owners for leader
  async getApartmentHomeOwners(hoaId: string, language: 'en' | 'ar' = 'en') {
    const hoa = await this.prisma.hoa.findUnique({
      where: { id: hoaId },
    });

    if (!hoa) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('apartment.not_found', language),
      );
    }

    // Get all users who are members of this HOA
    const userHOAs = await this.prisma.userHOA.findMany({
      where: { hoaId },
      include: { user: true },
    });
    return userHOAs.map((uh) => uh.user);
  }

  // Get HOA leader for home owner
  async getApartmentLeader(hoaId: string, language: 'en' | 'ar' = 'en') {
    const userHOA = await this.prisma.userHOA.findFirst({
      where: { hoaId, isLeader: true },
      include: {
        user: {
          select: {
            id: true,
            nationalId: true,
            role: true,
          },
        },
      },
    });

    if (!userHOA) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('apartment.not_found', language),
      );
    }

    if (!userHOA.user) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'apartment.no_leader_assigned',
          language,
        ),
      );
    }

    return userHOA.user;
  }

  // Get user's community
  async getUserCommunity(userId: string, language: 'en' | 'ar' = 'en') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userHOAs: {
          include: {
            hoa: {
              include: {
                community: {
                  include: {
                    members: {
                      include: {
                        user: {
                          select: {
                            id: true,
                            nationalId: true,
                            role: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.userHOAs || user.userHOAs.length === 0) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'chat.user_community_not_found',
          language,
        ),
      );
    }

    // Get the first HOA's community (user can belong to multiple HOAs)
    const firstHoa = user.userHOAs[0]?.hoa;
    if (!firstHoa || !firstHoa.community) {
      throw new NotFoundException(
        this.messageService.getErrorMessage(
          'chat.user_community_not_found',
          language,
        ),
      );
    }

    return firstHoa.community;
  }

  // Mark messages as read
  async markMessagesAsRead(
    userId: string,
    chatId: string,
    language: 'en' | 'ar' = 'en',
  ) {
    // First, try to find the participant as a regular user
    let participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    // If not found as regular user, try as service provider
    if (!participant) {
      participant = await this.prisma.chatParticipant.findUnique({
        where: {
          chatId_serviceProviderId: {
            chatId,
            serviceProviderId: userId,
          },
        },
      });
    }

    if (!participant) {
      throw new NotFoundException(
        this.messageService.getErrorMessage('chat.user_not_in_chat', language),
      );
    }

    // Update the participant's lastReadAt
    if (participant.userId) {
      // Update for regular user
      return this.prisma.chatParticipant.update({
        where: {
          chatId_userId: {
            chatId,
            userId,
          },
        },
        data: {
          lastReadAt: new Date(),
        },
      });
    } else if (participant.serviceProviderId) {
      // Update for service provider
      return this.prisma.chatParticipant.update({
        where: {
          chatId_serviceProviderId: {
            chatId,
            serviceProviderId: userId,
          },
        },
        data: {
          lastReadAt: new Date(),
        },
      });
    }

    throw new NotFoundException(
      this.messageService.getErrorMessage('chat.invalid_participant', language),
    );
  }

  // Get unread message count
  async getUnreadCount(userId: string, language: 'en' | 'ar' = 'en') {
    // Get chats where user is a participant (either as regular user or service provider)
    const userChats = await this.prisma.chatParticipant.findMany({
      where: {
        OR: [{ userId }, { serviceProviderId: userId }],
      },
      include: {
        chat: true,
      },
    });

    let totalUnread = 0;
    const chatUnreadCounts = {};

    for (const participant of userChats) {
      const lastReadAt = participant.lastReadAt || new Date(0);

      // Get all unread messages in this chat
      const unreadMessages = await this.prisma.message.findMany({
        where: {
          chatId: participant.chatId,
          createdAt: { gt: lastReadAt },
        },
        select: {
          senderId: true,
          senderServiceProviderId: true,
        },
      });

      // Filter out messages sent by this user (either as regular user or service provider)
      const unreadFromOthers = unreadMessages.filter((message) => {
        // If message has senderId, check if it's not from this user
        if (message.senderId && message.senderId !== userId) {
          return true;
        }
        // If message has senderServiceProviderId, check if it's not from this user
        if (
          message.senderServiceProviderId &&
          message.senderServiceProviderId !== userId
        ) {
          return true;
        }
        // If message has no sender (shouldn't happen), exclude it
        return false;
      });

      const unreadCount = unreadFromOthers.length;
      totalUnread += unreadCount;
      chatUnreadCounts[participant.chatId] = unreadCount;
    }

    return {
      totalUnread,
      chatUnreadCounts,
    };
  }
}
