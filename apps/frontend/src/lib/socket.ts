import { io, Socket } from 'socket.io-client';
import { CONFIG } from './config';
import { ChatMessage, Chat, PollOption } from '@/components/modals/type';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(CONFIG.WS_BASE_URL, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connect_error', error => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', reason => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;

        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          this.handleReconnect();
        }
      });

      this.socket.on('error', error => {
        console.error('Socket error:', error);
      });
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      setTimeout(() => {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        this.socket?.connect();
      }, delay);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join chat room
  joinChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_chat', { chatId });
    }
  }

  // Leave chat room
  leaveChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_chat', { chatId });
    }
  }

  // Send message
  sendMessage(messageData: {
    chatId: string;
    content: string;
    type?: 'TEXT' | 'IMAGE' | 'VOICE_NOTE' | 'FILE';
    replyToId?: string;
  }) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', messageData);
    }
  }

  // Typing indicators
  startTyping(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { chatId });
    }
  }

  stopTyping(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { chatId });
    }
  }

  // Event listeners
  onNewMessage(callback: (message: ChatMessage) => void) {
    this.socket?.on('new_message', callback);
  }

  onMessageSent(callback: (data: { messageId: string }) => void) {
    this.socket?.on('message_sent', callback);
  }

  onNewPoll(
    callback: (poll: {
      id: string;
      chatId: string;
      question: { en: string; ar: string };
      options: PollOption[];
      createdBy: string;
      createdAt: string;
    }) => void
  ) {
    this.socket?.on('new_poll', callback);
  }

  onPollVote(
    callback: (vote: {
      pollId: string;
      voterId: string;
      optionId: string;
      timestamp: string;
    }) => void
  ) {
    this.socket?.on('poll_vote', callback);
  }

  onUserTyping(
    callback: (data: {
      chatId: string;
      userId: string;
      isTyping: boolean;
      timestamp: string;
    }) => void
  ) {
    this.socket?.on('user_typing', callback);
  }

  onUserJoined(
    callback: (data: {
      chatId: string;
      userId: string;
      timestamp: string;
    }) => void
  ) {
    this.socket?.on('user_joined', callback);
  }

  onUserLeft(
    callback: (data: {
      chatId: string;
      userId: string;
      timestamp: string;
    }) => void
  ) {
    this.socket?.on('user_left', callback);
  }

  onJoinedChat(callback: (data: { chatId: string; status: string }) => void) {
    this.socket?.on('joined_chat', callback);
  }

  onLeftChat(callback: (data: { chatId: string; status: string }) => void) {
    this.socket?.on('left_chat', callback);
  }

  onError(
    callback: (error: {
      message: string;
      code?: string;
      timestamp: string;
    }) => void
  ) {
    this.socket?.on('error', callback);
  }

  // Remove event listeners
  offNewMessage() {
    this.socket?.off('new_message');
  }

  offMessageSent() {
    this.socket?.off('message_sent');
  }

  offNewPoll() {
    this.socket?.off('new_poll');
  }

  offPollVote() {
    this.socket?.off('poll_vote');
  }

  offUserTyping() {
    this.socket?.off('user_typing');
  }

  offUserJoined() {
    this.socket?.off('user_joined');
  }

  offUserLeft() {
    this.socket?.off('user_left');
  }

  offJoinedChat() {
    this.socket?.off('joined_chat');
  }

  offLeftChat() {
    this.socket?.off('left_chat');
  }

  offError() {
    this.socket?.off('error');
  }

  // Utility methods
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create singleton instance
export const socketService = new SocketService();
export default socketService;
