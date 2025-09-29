'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlass } from '@/components/assets/icons';
import { Chat, UnreadCount } from '@/components/modals/type';
import { ChatListSkeleton, EmptyState } from './ChatSkeleton';
import { MessageCircle, Users, Archive } from 'lucide-react';

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  unreadCount: UnreadCount;
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onMarkAsRead: (chatId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  loading,
  error,
  unreadCount,
  selectedChat,
  onSelectChat,
  onMarkAsRead,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter chats based on active tab and search term
  const filteredChats = chats.filter(chat => {
    // Safe access to chat name with fallbacks
    const chatNameEn = chat.name?.en || '';
    const chatNameAr = chat.name?.ar || '';

    const nameMatch =
      chatNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chatNameAr.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'Unread') {
      return nameMatch && (unreadCount.chatUnreadCounts[chat.id] || 0) > 0;
    }

    return nameMatch;
  });

  const getChatDisplayName = (chat: Chat) => {
    // For service provider chats, show the other participant's name
    if (chat.type === 'SERVICE_CHAT' || chat.type === 'ONE_TO_ONE') {
      const otherParticipant = chat.participants?.find(p => p.user);
      if (otherParticipant?.user) {
        return otherParticipant.user.nationalId || 'Unknown User';
      }
    }

    // For community chats, show the community name
    if (chat.type === 'COMMUNITY_GROUP' && chat.community) {
      return chat.community.name?.en || chat.community.name?.ar || 'Community';
    }

    return chat.name?.en || chat.name?.ar || 'Unknown Chat';
  };

  const getChatAvatar = (chat: Chat) => {
    // For service provider chats, show the other participant's avatar
    if (chat.type === 'SERVICE_CHAT' || chat.type === 'ONE_TO_ONE') {
      const otherParticipant = chat.participants?.find(p => p.user);
      if (otherParticipant?.user) {
        const name = otherParticipant.user.nationalId || 'User';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
      }
    }

    // For community chats, show a community icon
    if (chat.type === 'COMMUNITY_GROUP') {
      return `https://ui-avatars.com/api/?name=Community&background=random`;
    }

    const chatName = chat.name?.en || chat.name?.ar || 'Chat';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=random`;
  };

  const getLastMessage = (chat: Chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }

    const lastMessage = chat.messages[chat.messages.length - 1];

    if (!lastMessage) {
      return 'No messages yet';
    }

    if (lastMessage.type === 'POLL') {
      return '📊 Poll created';
    }

    if (lastMessage.type === 'IMAGE') {
      return '📷 Image';
    }

    if (lastMessage.type === 'VOICE_NOTE') {
      return '🎤 Voice note';
    }

    if (lastMessage.type === 'FILE') {
      // Check MIME type for more specific preview
      const mimeType = lastMessage.mimeType;
      if (mimeType?.startsWith('video/')) {
        return '🎥 Video';
      }
      if (mimeType?.startsWith('audio/')) {
        return '🎵 Audio';
      }
      if (mimeType?.startsWith('image/')) {
        return '📷 Image';
      }
      if (mimeType?.includes('pdf')) {
        return '📄 PDF';
      }
      if (mimeType?.includes('word') || mimeType?.includes('document')) {
        return '📝 Document';
      }
      if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
        return '📊 Spreadsheet';
      }
      return '📎 File';
    }

    // Handle both string and object content formats
    if (typeof lastMessage.content === 'string') {
      return lastMessage.content;
    }
    if (
      typeof lastMessage.content === 'object' &&
      lastMessage.content !== null
    ) {
      return lastMessage.content.en || lastMessage.content.ar || 'Message';
    }
    return 'Message';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return <ChatListSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Chats"
        description={error}
        icon={MessageCircle}
      />
    );
  }

  // Don't show empty state - always show the tabs and search bar

  return (
    <div>
      {/* Tabs */}
      <div className="flex justify-center p-[6px] gap-2 rounded-lg border border-[#E5E5E5] m-6">
        {(['All', 'Unread'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-[6px] typo-body font-medium transition-colors duration-200 ${
              tab === activeTab
                ? 'bg-(--primary) text-white'
                : 'text-[#333333] hover:bg-gray-100'
            }`}
          >
            {t(tab)}
            {tab === 'Unread' && unreadCount.totalUnread > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {unreadCount.totalUnread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="m-6 p-2 rounded-[10px] border border-[#E5E5E5] text-sm flex gap-2 w-auto items-center">
        <MagnifyingGlass />
        <input
          type="text"
          placeholder={t('Search keywords')}
          className="focus:outline-none flex-1"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Chat List */}
      <div className="space-y-1">
        {filteredChats.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="text-gray-400 mb-2">
              {activeTab === 'Unread' ? (
                <MessageCircle className="w-8 h-8 mx-auto" />
              ) : (
                <Users className="w-8 h-8 mx-auto" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              {activeTab === 'Unread' ? 'No Unread Messages' : 'No Chats Found'}
            </p>
            <p className="text-xs text-gray-500">
              {activeTab === 'Unread'
                ? 'You have no unread messages at the moment.'
                : searchTerm
                  ? 'No chats match your search criteria.'
                  : 'Start a conversation by accepting a job or creating a new chat.'}
            </p>
          </div>
        ) : (
          filteredChats.map(chat => {
            const unreadCountForChat =
              unreadCount.chatUnreadCounts[chat.id] || 0;
            const isSelected = selectedChat?.id === chat.id;

            return (
              <div
                key={chat.id}
                onClick={() => {
                  onSelectChat(chat);
                  if (unreadCountForChat > 0) {
                    onMarkAsRead(chat.id);
                  }
                }}
                className={`px-6 py-[14px] cursor-pointer gap-2 flex justify-between transition-colors duration-200 ${
                  isSelected
                    ? 'bg-[#F3F3F3]'
                    : 'bg-[#fcfafa] hover:bg-[#F3F3F3]'
                }`}
              >
                <div className="flex gap-2 flex-1 min-w-0">
                  <div className="relative">
                    <img
                      src={getChatAvatar(chat)}
                      alt="Chat"
                      width={45}
                      height={45}
                      className="rounded-full shrink-0"
                    />
                    {unreadCountForChat > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCountForChat > 9 ? '9+' : unreadCountForChat}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium typo-label text-[#15120F] truncate">
                        {getChatDisplayName(chat)}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">
                        {formatTime(chat.messages[0].updatedAt)}
                      </span>
                    </div>
                    <p className="typo-body font-normal text-[#808080] truncate">
                      {getLastMessage(chat)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
