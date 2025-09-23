import { Injectable } from '@nestjs/common';

@Injectable()
export class RealtimeService {
  private server: any; // Will be set by ChatGateway

  setServer(server: any) {
    this.server = server;
  }

  /**
   * Emit new message event to all users in a chat
   */
  emitNewMessage(chatId: string, message: any) {
    if (this.server) {
      this.server.to(`chat:${chatId}`).emit('new_message', message);
    }
  }

  /**
   * Emit new poll event to all users in a chat
   */
  emitNewPoll(chatId: string, poll: any) {
    if (this.server) {
      this.server.to(`chat:${chatId}`).emit('new_poll', poll);
    }
  }

  /**
   * Emit poll vote event to all users in a chat
   */
  emitPollVote(
    chatId: string,
    pollId: string,
    voterId: string,
    optionId: string,
  ) {
    if (this.server) {
      this.server.to(`chat:${chatId}`).emit('poll_vote', {
        pollId,
        voterId,
        optionId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Emit typing indicator to other users in a chat
   */
  emitTypingIndicator(chatId: string, userId: string, isTyping: boolean) {
    if (this.server) {
      this.server.to(`chat:${chatId}`).emit('user_typing', {
        chatId,
        userId,
        isTyping,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Emit user joined chat event
   */
  emitUserJoinedChat(chatId: string, userId: string) {
    if (this.server) {
      this.server.to(`chat:${chatId}`).emit('user_joined', {
        chatId,
        userId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Emit user left chat event
   */
  emitUserLeftChat(chatId: string, userId: string) {
    if (this.server) {
      this.server.to(`chat:${chatId}`).emit('user_left', {
        chatId,
        userId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Emit new community member event
   */
  emitNewCommunityMember(communityId: string, userId: string) {
    if (this.server) {
      this.server.to(`community:${communityId}`).emit('new_member', {
        userId,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
