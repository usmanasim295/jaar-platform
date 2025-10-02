'use client';
import { useState, useEffect, Suspense } from 'react';
import { Menu, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, useChatMessages } from '@/hooks/useChat';
import { ChatList } from '@/components/chat/ChatList';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { Chat } from '@/components/modals/type';
import { useSearchParams, useRouter } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function ChatUIContent() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

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
      <div className="max-w-[1400px] sm:px-[60px] px-3 mx-auto mt-8 font-jakarta mb-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-[1400px] sm:px-[60px] px-3 mx-auto mt-8 font-jakarta mb-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Please log in to access messages
            </p>
            <a
              href="/signin"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Go to Login
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

  // Get chat display name
  const getChatDisplayName = (chat: Chat) => {
    if (chat.type === 'SERVICE_CHAT' || chat.type === 'ONE_TO_ONE') {
      const otherParticipant = chat.participants?.find(p => p.user);
      if (otherParticipant?.user) {
        return otherParticipant.user.nationalId || 'Unknown User';
      }
    }

    if (chat.type === 'COMMUNITY_GROUP' && chat.community) {
      return chat.community.name?.en || chat.community.name?.ar || 'Community';
    }

    return chat.name?.en || chat.name?.ar || 'Unknown Chat';
  };

  // Get chat avatar
  const getChatAvatar = (chat: Chat) => {
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
    <div className="max-w-[1400px] sm:px-[60px] px-3 mx-auto mt-8 font-jakarta mb-4 relative">
      <title>Messages</title>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold typo-heading3">{t('Messages')}</h2>

        {/* Connection Status */}
        {/* <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm">Disconnected</span>
            </div>
          )}
        </div> */}
      </div>

      <div className="shadow-dark rounded-xl flex flex-col lg:flex-row mt-6 sm:h-[75vh] overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`absolute top-0 left-0 h-full w-3/4 sm:w-[300px] bg-white border-x border-[#F3F3F3] transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-[360px] ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
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
        <div className="w-full lg:w-[75%] flex flex-col bg-white">
          {/* Chat Header */}
          {selectedChat && (
            <div className="flex items-center justify-between gap-3 border-b border-[#E6E6E6]">
              <div className="flex items-center gap-3 pt-4 pb-5 pl-6">
                <button
                  className="lg:hidden p-1 rounded hover:bg-gray-100"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={24} />
                </button>

                <img
                  src={getChatAvatar(selectedChat)}
                  alt="Chat"
                  width={56}
                  height={56}
                  className="rounded-full"
                />
                {/* <div className="relative">
                  <span className="absolute -left-8 -bottom-7 ml-1 h-3.5 w-3.5 bg-green-500 rounded-full"></span>
                </div> */}
                <div>
                  <p className="font-medium typo-heading3 text-[#333333]">
                    {getChatDisplayName(selectedChat)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedChat.type === 'SERVICE_CHAT'
                      ? 'Service Chat'
                      : selectedChat.type === 'COMMUNITY_GROUP'
                        ? 'Community Chat'
                        : 'Direct Message'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden">
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
        <div className="max-w-[1400px] sm:px-[60px] px-3 mx-auto mt-8 font-jakarta mb-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
      }
    >
      <ChatUIContent />
    </Suspense>
  );
}
