import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { RealtimeService } from './realtime.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private realtimeService: RealtimeService,
  ) {}

  afterInit() {
    // Set the server reference in RealtimeService to avoid circular dependency
    this.realtimeService.setServer(this.server);
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.id;

      this.connectedUsers.set(userId, client.id);

      // Join user to their personal room
      await client.join(`user:${userId}`);

      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove user from connected users
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }

    console.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');
      const payload = this.jwtService.verify(token);
      const userId = payload.id;

      let hasAccess = false;

      // Check access based on user type
      if (payload.serviceProviderId) {
        // For service providers, get their chats
        const chats = await this.chatService.getServiceProviderChats(userId);
        hasAccess = chats.some((chat) => chat.id === data.chatId);
      } else {
        // For regular users, get their chats
        const chats = await this.chatService.getUserChats(userId);
        hasAccess = chats.some((chat) => chat.id === data.chatId);
      }

      if (!hasAccess) {
        client.emit('error', { message: 'Access denied to this chat' });
        return;
      }

      await client.join(`chat:${data.chatId}`);
      client.emit('joined_chat', { chatId: data.chatId });
    } catch (error) {
      console.error('Join chat error:', error);
      client.emit('error', { message: 'Failed to join chat' });
    }
  }

  @SubscribeMessage('leave_chat')
  async handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    await client.leave(`chat:${data.chatId}`);
    client.emit('left_chat', { chatId: data.chatId });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateMessageDto,
  ) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');
      const payload = this.jwtService.verify(token);
      const user = {
        id: payload.id,
        type: payload.serviceProviderId ? 'serviceProvider' : 'user',
      };

      const message = await this.chatService.sendMessage(user, data);

      // Send confirmation to sender
      client.emit('message_sent', { messageId: message.id });
    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');
      const payload = this.jwtService.verify(token);
      const userId = payload.id;

      // Use RealtimeService for consistent typing indicators
      this.realtimeService.emitTypingIndicator(data.chatId, userId, true);
    } catch (error) {
      // Ignore typing errors
    }
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');
      const payload = this.jwtService.verify(token);
      const userId = payload.id;

      // Use RealtimeService for consistent typing indicators
      this.realtimeService.emitTypingIndicator(data.chatId, userId, false);
    } catch (error) {
      // Ignore typing errors
    }
  }

  // These methods are now handled by RealtimeService for consistency
}
