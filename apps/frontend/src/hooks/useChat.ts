import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import {
  API_CONFIG,
  API_ENDPOINTS,
  getHeaders,
  getLanguageParam,
} from '@/lib/api-config';
import { socketService } from '@/lib/socket';
import {
  Chat,
  ChatMessage,
  UnreadCount,
  CreateMessageRequest,
  CreatePollRequest,
  VotePollRequest,
} from '@/components/modals/type';

export const useChat = (
  selectedChatId?: string,
  onMessageForViewedChat?: (message: ChatMessage) => void
) => {
  const { token, user } = useAuth();
  const { i18n } = useTranslation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<UnreadCount>({
    totalUnread: 0,
    chatUnreadCounts: {},
  });
  const [isConnected, setIsConnected] = useState(false);

  // Fetch service provider chats
  const fetchChats = useCallback(async () => {
    if (!token || !user) return;

    try {
      setLoading(true);
      setError(null);

      // Use service provider endpoint since this app is for service providers
      const endpoint = API_ENDPOINTS.SERVICE_PROVIDER_CHATS;

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${endpoint}?lang=${i18n.language}`,
        {
          method: 'GET',
          headers: getHeaders(token),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      setChats(data.chats || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, [token, user, i18n.language]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.UNREAD_COUNT}`,
        {
          method: 'GET',
          headers: getHeaders(token),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [token]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (chatId: string) => {
      if (!token) return;

      try {
        await fetch(
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.MARK_MESSAGES_READ}/${chatId}/mark-read`,
          {
            method: 'POST',
            headers: getHeaders(token),
          }
        );

        // Update local unread count
        setUnreadCount(prev => ({
          ...prev,
          chatUnreadCounts: {
            ...prev.chatUnreadCounts,
            [chatId]: 0,
          },
          totalUnread: Math.max(
            0,
            prev.totalUnread - (prev.chatUnreadCounts[chatId] || 0)
          ),
        }));
      } catch (err) {
        console.error('Failed to mark messages as read:', err);
      }
    },
    [token]
  );

  // Initialize socket connection
  useEffect(() => {
    if (token && user) {
      socketService
        .connect(token)
        .then(() => {
          setIsConnected(true);
        })
        .catch(err => {
          console.error('Socket connection failed:', err);
          setIsConnected(false);
        });
    }

    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [token, user]);

  // Fetch initial data - refetch when language changes
  useEffect(() => {
    if (token) {
      fetchChats();
      fetchUnreadCount();
    }
  }, [token, fetchChats, fetchUnreadCount]); // Refetch when language changes

  // Setup socket event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Join all chat rooms when socket connects to receive real-time updates
    chats.forEach(chat => {
      socketService.joinChat(chat.id);
    });

    // Listen for new messages to update chat list and unread counts
    socketService.onNewMessage((message: ChatMessage) => {
      // console.log('🔄 Real-time message received:', message);
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => {
          if (chat.id === message.chatId) {
            // console.log(
            //   '✅ Updating chat:',
            //   chat.id,
            //   'with message:',
            //   message.content
            // );
            // For chat list, we only keep the most recent message for display
            // Replace the existing last message with the new one
            return {
              ...chat,
              messages: [message], // Keep only the latest message for chat list display
              updatedAt: message.createdAt,
            };
          }
          return chat;
        });
        // console.log('📝 All chats after update:', updatedChats);
        return updatedChats;
      });

      // Only update unread count if the message is NOT from the current user
      const isFromCurrentUser =
        message.senderServiceProviderId === user?.id ||
        message.senderId === user?.id;

      // console.log(
      //   '👤 Message from current user?',
      //   isFromCurrentUser,
      //   'User ID:',
      //   user?.id,
      //   'Sender ID:',
      //   message.senderId,
      //   'Sender SP ID:',
      //   message.senderServiceProviderId
      // );

      // Check if user is currently viewing this chat
      const isViewingThisChat = selectedChatId === message.chatId;
      // console.log(
      //   '👁️ User viewing this chat?',
      //   isViewingThisChat,
      //   'Selected chat:',
      //   selectedChatId,
      //   'Message chat:',
      //   message.chatId
      // );

      // If user is viewing this chat, call the callback to update messages
      if (isViewingThisChat && onMessageForViewedChat) {
        // console.log(
        //   '🎯 Calling callback to update messages for viewed chat:',
        //   message.chatId
        // );
        onMessageForViewedChat(message);
      }

      if (!isFromCurrentUser) {
        if (isViewingThisChat) {
          // User is viewing this chat, automatically mark as read
          // console.log(
          //   '✅ Auto-marking message as read for viewed chat:',
          //   message.chatId
          // );
          markMessagesAsRead(message.chatId);
        } else {
          // User is not viewing this chat, update unread count
          // console.log('🔢 Updating unread count for chat:', message.chatId);
          setUnreadCount(prev => {
            const newUnreadCount = {
              ...prev,
              chatUnreadCounts: {
                ...prev.chatUnreadCounts,
                [message.chatId]:
                  (prev.chatUnreadCounts[message.chatId] || 0) + 1,
              },
              totalUnread: prev.totalUnread + 1,
            };
            // console.log('📊 New unread count:', newUnreadCount);
            return newUnreadCount;
          });
        }
      }
    });

    // Listen for new polls
    socketService.onNewPoll(poll => {
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === poll.chatId) {
            // Add poll as a message
            const pollMessage: ChatMessage = {
              id: `poll-${poll.id}`,
              chatId: poll.chatId,
              content: poll.question,
              type: 'POLL',
              senderId: poll.createdBy,
              createdAt: poll.createdAt,
              updatedAt: poll.createdAt,
              isDeleted: false,
              poll: {
                id: poll.id,
                question: poll.question,
                options: poll.options,
              },
            };

            return {
              ...chat,
              messages: [...chat.messages, pollMessage],
              updatedAt: poll.createdAt,
            };
          }
          return chat;
        });
      });
    });

    // Listen for poll votes
    socketService.onPollVote(vote => {
      // You can update poll results here if needed
    });

    // Note: Typing indicators are handled by individual chat components
    // No need to handle them here as they're managed by ChatMessages component

    // Listen for errors
    socketService.onError(error => {
      console.error('Socket error:', error);
      setError(error.message);
    });

    return () => {
      socketService.offNewMessage();
      socketService.offNewPoll();
      socketService.offPollVote();
      socketService.offError();
    };
  }, [isConnected, chats, selectedChatId, markMessagesAsRead]);

  return {
    chats,
    loading,
    error,
    unreadCount,
    isConnected,
    fetchChats,
    fetchUnreadCount,
    markMessagesAsRead,
  };
};

export const useChatMessages = (chatId: string | null) => {
  const { token, user } = useAuth();
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Helper function to deduplicate messages by ID
  const deduplicateMessages = (messages: ChatMessage[]): ChatMessage[] => {
    const seen = new Set<string>();
    return messages.filter(message => {
      if (seen.has(message.id)) {
        return false;
      }
      seen.add(message.id);
      return true;
    });
  };

  // Fetch messages for a specific chat
  const fetchMessages = useCallback(
    async (cursor?: string, append = false) => {
      if (!chatId || !token) return;

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: '1',
          limit: '50',
          order: 'desc',
          lang: i18n.language,
          ...(cursor && { cursor }),
        });

        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT_MESSAGES}/${chatId}?${params}`,
          {
            method: 'GET',
            headers: getHeaders(token),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();

        if (append) {
          // For descending order, append older messages to the end, avoiding duplicates
          setMessages(prev => {
            const combined = [...prev, ...data.messages];
            return deduplicateMessages(combined);
          });
        } else {
          // Initial load - set messages as they come (newest first)
          setMessages(deduplicateMessages(data.messages || []));

          // Auto-scroll to bottom when initially loading messages
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }

        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch messages'
        );
      } finally {
        setLoading(false);
      }
    },
    [chatId, token, i18n.language]
  );

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(() => {
    if (hasMore && nextCursor && !loading) {
      fetchMessages(nextCursor, true);
    }
  }, [hasMore, nextCursor, loading, fetchMessages]);

  // Send message
  const sendMessage = useCallback(
    async (
      content: string,
      type: 'TEXT' | 'IMAGE' | 'VOICE_NOTE' | 'FILE' = 'TEXT',
      replyToId?: string
    ) => {
      if (!chatId || !token || !content.trim() || !user) return;

      // console.log('📤 Sending message:', { chatId, content, type, replyToId });

      const messageData: CreateMessageRequest = {
        chatId,
        content: content.trim(),
        type,
        ...(replyToId && { replyToId }),
      };

      try {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SEND_MESSAGE}?lang=${i18n.language}`,
          {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(messageData),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();
        // console.log('📥 Send message response:', data);

        // Don't manually add to state - let the real-time event handle it
        // This prevents duplicate messages

        return data.message;
      } catch (err) {
        console.error('❌ Send message error:', err);
        setError(err instanceof Error ? err.message : 'Failed to send message');
        throw err;
      }
    },
    [chatId, token, user]
  );

  // Upload file with message
  const uploadFileWithMessage = useCallback(
    async (file: File, content: string, replyToId?: string) => {
      if (!chatId || !token) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', chatId);
      formData.append('content', content);
      if (replyToId) {
        formData.append('replyToId', replyToId);
      }

      try {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.UPLOAD_MESSAGE_FILE}?lang=${i18n.language}`,
          {
            method: 'POST',
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const data = await response.json();

        // Don't manually add to state - let the real-time event handle it
        // This prevents duplicate messages

        return data.message;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload file');
        throw err;
      }
    },
    [chatId, token]
  );

  // Create poll
  const createPoll = useCallback(
    async (
      question: string,
      options: string[],
      isMultipleChoice = false,
      expiresAt?: string
    ) => {
      if (!chatId || !token) return;

      const pollData: CreatePollRequest = {
        chatId,
        question,
        options: options.map(text => ({ text })),
        isMultipleChoice,
        ...(expiresAt && { expiresAt }),
      };

      try {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CREATE_POLL}?lang=${i18n.language}`,
          {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(pollData),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to create poll');
        }

        const data = await response.json();
        return data.poll;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create poll');
        throw err;
      }
    },
    [chatId, token]
  );

  // Vote on poll
  const votePoll = useCallback(
    async (pollId: string, optionIds: string[]) => {
      if (!token) return;

      const voteData: VotePollRequest = {
        pollId,
        optionIds,
      };

      try {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VOTE_POLL}`,
          {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(voteData),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to vote on poll');
        }

        return response.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to vote on poll');
        throw err;
      }
    },
    [token]
  );

  // Fetch messages when chatId changes
  useEffect(() => {
    if (chatId) {
      fetchMessages();
    } else {
      setMessages([]);
      setHasMore(true);
      setNextCursor(null);
    }
  }, [chatId, fetchMessages]);

  // Auto-scroll to bottom when messages change (for initial load)
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length]); // Only trigger when message count changes, not on every message update

  // Join chat room when chatId changes
  useEffect(() => {
    if (!chatId) return;

    // Join chat room
    socketService.joinChat(chatId);

    return () => {
      socketService.leaveChat(chatId);
    };
  }, [chatId]);

  // Function to add a new message to the state (called by parent)
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => {
      // Add new message to the beginning since we're using descending order
      const newMessages = [message, ...prev];
      const deduplicated = deduplicateMessages(newMessages);
      return deduplicated;
    });

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  return {
    messages,
    loading,
    error,
    hasMore,
    messagesEndRef,
    fetchMessages,
    loadMoreMessages,
    sendMessage,
    uploadFileWithMessage,
    createPoll,
    votePoll,
    addMessage,
  };
};
