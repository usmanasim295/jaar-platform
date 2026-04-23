'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { Menu, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, useChatMessages } from '@/hooks/useChat';
import { ChatList } from '@/components/chat/ChatList';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { Chat } from '@/components/modals/type';
import { useSearchParams, useRouter } from 'next/navigation';
import { set } from 'react-hook-form';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function ChatUIContent() {
  const { t, i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

 // Handle RTL detection
  React.useEffect(() => {
    setIsRTL(i18n.language === 'ar');
  }, [i18n.language]);

  // Chat functionality - ALL HOOKS MUST BE CALLED AT THE TOP LEVEL
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    hasMore,
    messagesEndRef,
    sendMessage,
    uploadFileWithMessage,
    loadMoreMessages,
    addMessage,
  } = useChatMessages(selectedChat?.id || null);

  const {
    chats,
    loading: chatsLoading,
    error: chatsError,
    unreadCount,
    isConnected,
    fetchChats,
    markMessagesAsRead,
  } = useChat(selectedChat?.id, addMessage);

  // Auto-select chat from URL parameter - MUST BE BEFORE CONDITIONAL RETURNS
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const chatIdFromUrl = searchParams.get('chatId');
      if (chatIdFromUrl && chats.length > 0 && !selectedChat) {
        const chatToSelect = chats.find(chat => chat.id === chatIdFromUrl);
        if (chatToSelect) {
          setSelectedChat(chatToSelect);
        }
      }
    }
  }, [searchParams, chats, selectedChat, isLoading, isAuthenticated]);

  // Show loading state while auth is loading
  if (isLoading) {
    return (
      <div className="max-w-[1400px] sm:px-[60px] px-3 mx-auto mt-4 sm:mt-6 md:mt-8 font-jakarta mb-4">
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500 mx-auto mb-3 sm:mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-[1400px] sm:px-[60px] px-3 mx-auto mt-4 sm:mt-6 md:mt-8 font-jakarta mb-4">
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="text-center px-4">
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              {t('Please log in to access messages')}
            </p>
            <a
              href="/signin"
              className="bg-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-orange-600 inline-block"
            >
              {t('Go to Login')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Handle chat selection
  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setSidebarOpen(false); // Close sidebar on mobile

    // Update URL with the new chat ID
    router.push(`/messages?chatId=${chat.id}`, { scroll: false });
  };

  // Handle mark messages as read
  const handleMarkAsRead = (chatId: string) => {
    markMessagesAsRead(chatId);
  };

  const pickLang = (obj: { en?: string; ar?: string } | undefined) => {
    if (!obj) return '';
    const preferAr = i18n.language === 'ar';
    return preferAr ? obj.ar || obj.en || '' : obj.en || obj.ar || '';
  };

  // Get chat display name
  const getChatDisplayName = (chat: Chat) => {
    // For SERVICE_CHAT, prefer the job title (what the chat is about)
    if (chat.type === 'SERVICE_CHAT' && chat.job?.title) {
      if (typeof chat.job.title === 'string') return chat.job.title;
      return pickLang(chat.job.title as any);
    }

    if (chat.type === 'SERVICE_CHAT' || chat.type === 'ONE_TO_ONE') {
      const otherParticipant = chat.participants?.find(p => p.user);
      if (otherParticipant?.user) {
        return otherParticipant.user.nationalId || 'Unknown User';
      }
    }

    if (chat.type === 'COMMUNITY_GROUP' && chat.community) {
      return pickLang(chat.community.name as any) || 'Community';
    }

    return pickLang(chat.name as any) || 'Unknown Chat';
  };

  // Get chat avatar
  const getChatAvatar = (chat: Chat) => {
    // For SERVICE_CHAT, use the job title for avatar initials
    if (chat.type === 'SERVICE_CHAT' && chat.job?.title) {
      const title =
        typeof chat.job.title === 'string'
          ? chat.job.title
          : pickLang(chat.job.title as any) || 'Service';
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=random`;
    }

    if (chat.type === 'SERVICE_CHAT' || chat.type === 'ONE_TO_ONE') {
      const otherParticipant = chat.participants?.find(p => p.user);
      if (otherParticipant?.user) {
        const name = otherParticipant.user.nationalId || 'User';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
      }
    }

    if (chat.type === 'COMMUNITY_GROUP') {
      return `https://ui-avatars.com/api/?name=Community&background=random`;
    }

    const chatName = chat.name?.en || chat.name?.ar || 'Chat';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=random`;
  };

  return (
    <div className="max-w-[1400px] sm:px-[60px] px-3 mx-auto mt-4 sm:mt-6 md:mt-8 font-jakarta relative">
      <title>Messages</title>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile menu button - always visible on mobile */}
          <button
            className="lg:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h2 className="font-semibold text-xl sm:text-2xl md:typo-heading3">
            {t('Messages')}
          </h2>
        </div>
      </div>

      <div className="shadow-dark rounded-xl flex flex-col lg:flex-row mt-4 sm:mt-6 h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)] lg:h-[75vh] overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-white/10 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
        className={`absolute shadow-2xl top-0 left-0 h-full w-[85%] sm:w-[320px] bg-white border-r border-[#F3F3F3] transform transition-transform duration-300 z-50 lg:relative lg:translate-x-0 lg:w-[360px] ${isRTL ? 'right-0' : 'left-0'}  ${
        sidebarOpen
          ? 'translate-x-0'
          : isRTL
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
          // className={`absolute shadow-2xl top-0 left-0 h-full w-[85%] sm:w-[320px] bg-white border-r border-[#F3F3F3] transform transition-transform duration-300 z-50 lg:relative lg:translate-x-0 lg:w-[360px] ${
          //   sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          // }`}
        >
          <ChatList
            chats={chats}
            loading={chatsLoading}
            error={chatsError}
            unreadCount={unreadCount}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>

        {/* Main Chat Area */}
        <div className="w-full lg:w-[75%] flex flex-col bg-white h-full">
          {/* Chat Header */}
          {selectedChat && (
            <div className="flex items-center gap-2 sm:gap-3 border-b border-[#E6E6E6] px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex-shrink-0">
              <img
                src={getChatAvatar(selectedChat)}
                alt="Chat"
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-base sm:text-lg md:typo-heading3 text-[#333333] truncate">
                  {getChatDisplayName(selectedChat)}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {selectedChat.type === 'SERVICE_CHAT'
                    ? t('Service Chat')
                    : selectedChat.type === 'COMMUNITY_GROUP'
                      ? t('Community Chat')
                      : t('Direct Message')}
                </p>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden min-h-0">
            <ChatMessages
              chat={selectedChat}
              messages={messages}
              loading={messagesLoading}
              error={messagesError}
              hasMore={hasMore}
              messagesEndRef={messagesEndRef}
              onSendMessage={sendMessage}
              onUploadFile={uploadFileWithMessage}
              onLoadMore={loadMoreMessages}
              currentUserId={user?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatUI() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1400px] sm:px-[60px] px-3 mx-auto mt-4 sm:mt-6 md:mt-8 font-jakarta mb-4">
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
      }
    >
      <ChatUIContent />
    </Suspense>
  );
}
