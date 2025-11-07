'use client';

import React, { useState, useEffect } from 'react';
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
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const resolveLocale = () => {
    if (!i18n.language) return undefined;
    if (i18n.language.startsWith('ar')) return 'ar-SA';
    return i18n.language;
  };

  // Add custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .chat-list-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .chat-list-scroll::-webkit-scrollbar-track {
        background: #f7fafc;
      }
      .chat-list-scroll::-webkit-scrollbar-thumb {
        background: #cbd5e0;
        border-radius: 3px;
      }
      .chat-list-scroll::-webkit-scrollbar-thumb:hover {
        background: #a0aec0;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Filter and sort chats based on active tab and search term
  const filteredChats = chats
    .filter(chat => {
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
    })
    .sort((a, b) => {
      // Sort by most recent message or chat update (WhatsApp style)
      const aTime =
        a.messages && a.messages[0]
          ? new Date(a.messages[0].updatedAt).getTime()
          : new Date(a.updatedAt).getTime();
      const bTime =
        b.messages && b.messages[0]
          ? new Date(b.messages[0].updatedAt).getTime()
          : new Date(b.updatedAt).getTime();

      return bTime - aTime; // Most recent first
    });

  const getChatDisplayName = (chat: Chat) => {
    // For service provider chats, show the other participant's name
    if (chat.type === 'SERVICE_CHAT' || chat.type === 'ONE_TO_ONE') {
      const otherParticipant = chat.participants?.find(p => p.user);
      if (otherParticipant?.user) {
        return otherParticipant.user.nationalId || t('Unknown User');
      }
    }

    // For community chats, show the community name
    if (chat.type === 'COMMUNITY_GROUP' && chat.community) {
      return (
        chat.community.name?.en || chat.community.name?.ar || t('Community')
      );
    }

    return chat.name?.en || chat.name?.ar || t('Unknown Chat');
  };

  const getChatSubtitle = (chat: Chat) => {
    // For service chats, show the job title
    if (chat.type === 'SERVICE_CHAT' && chat.job && chat.job.title) {
      // Handle both string and object formats
      if (typeof chat.job.title === 'string') {
        return chat.job.title;
      }
      // If it's an object with language keys
      if (typeof chat.job.title === 'object') {
        return (chat.job.title as any).en || (chat.job.title as any).ar || '';
      }
    }
    return '';
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
      return t('No messages yet');
    }

    const lastMessage = chat.messages[chat.messages.length - 1];

    if (!lastMessage) {
      return t('No messages yet');
    }

    if (lastMessage.type === 'POLL') {
      return `📊 ${t('Poll created')}`;
    }

    if (lastMessage.type === 'IMAGE') {
      return `📷 ${t('Image')}`;
    }

    if (lastMessage.type === 'VOICE_NOTE') {
      return `🎤 ${t('Voice note')}`;
    }

    if (lastMessage.type === 'FILE') {
      // Check MIME type for more specific preview
      const mimeType = lastMessage.mimeType;
      if (mimeType?.startsWith('video/')) {
        return `🎥 ${t('Video')}`;
      }
      if (mimeType?.startsWith('audio/')) {
        return `🎵 ${t('Audio')}`;
      }
      if (mimeType?.startsWith('image/')) {
        return `📷 ${t('Image')}`;
      }
      if (mimeType?.includes('pdf')) {
        return `📄 ${t('PDF')}`;
      }
      if (mimeType?.includes('word') || mimeType?.includes('document')) {
        return `📝 ${t('Document')}`;
      }
      if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
        return `📊 ${t('Spreadsheet')}`;
      }
      return `📎 ${t('File')}`;
    }

    // Handle both string and object content formats
    if (typeof lastMessage.content === 'string') {
      return lastMessage.content;
    }
    if (
      typeof lastMessage.content === 'object' &&
      lastMessage.content !== null
    ) {
      // Prioritize current language
      const currentLang = i18n.language;
      if (currentLang === 'ar') {
        return lastMessage.content.ar || lastMessage.content.en || t('Message');
      } else {
        return lastMessage.content.en || lastMessage.content.ar || t('Message');
      }
    }
    return t('Message');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString(resolveLocale(), {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString(resolveLocale(), { weekday: 'short' });
    } else {
      return date.toLocaleDateString(resolveLocale(), {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (loading) {
    return <ChatListSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        title={t('Error Loading Chats')}
        description={error}
        icon={MessageCircle}
      />
    );
  }

  // Don't show empty state - always show the tabs and search bar

  return (
    <div className="flex flex-col h-full gap-y-2">
      {/* Tabs */}
      <div className="flex justify-center p-1 sm:p-[6px] gap-1.5 sm:gap-2 rounded-lg border border-[#E5E5E5] m-3 sm:m-4 md:m-6 flex-shrink-0">
        {(['All', 'Unread'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-[6px] text-sm sm:typo-body font-medium transition-colors duration-200 ${
              tab === activeTab
                ? 'bg-(--primary) text-white'
                : 'text-[#333333] hover:bg-gray-100'
            }`}
          >
            {t(tab)}
            {tab === 'Unread' && unreadCount.totalUnread > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full px-1 sm:px-1.5 py-0.5">
                {unreadCount.totalUnread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mx-3 sm:mx-4 md:mx-6 mt-0 p-2 rounded-[10px] border border-[#E5E5E5] text-xs sm:text-sm flex gap-2 w-auto items-center flex-shrink-0">
        <MagnifyingGlass className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <input
          type="text"
          placeholder={t('Search keywords')}
          className="focus:outline-none flex-1 text-xs sm:text-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Chat List */}
      <div
        className="chat-list-scroll flex-1 overflow-y-auto overflow-x-hidden space-y-1"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 #F7FAFC',
        }}
      >
        {filteredChats.length === 0 ? (
          <div className="px-4 sm:px-6 py-6 sm:py-8 text-center">
            <div className="text-gray-400 mb-2">
              {activeTab === 'Unread' ? (
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
              ) : (
                <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              {activeTab === 'Unread'
                ? t('No Unread Messages')
                : t('No Chats Found')}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 px-2">
              {activeTab === 'Unread'
                ? t('You have no unread messages at the moment.')
                : searchTerm
                  ? t('No chats match your search criteria.')
                  : t(
                      'Start a conversation by accepting a job or creating a new chat.'
                    )}
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
                className={`px-3 sm:px-4 md:px-6 py-3 sm:py-[14px] cursor-pointer gap-2 flex justify-between transition-colors duration-200 ${
                  isSelected
                    ? 'bg-[#F3F3F3]'
                    : 'bg-[#fcfafa] hover:bg-[#F3F3F3]'
                }`}
              >
                <div className="flex gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={getChatAvatar(chat)}
                      alt="Chat"
                      className="w-10 h-10 sm:w-11 sm:h-11 md:w-[45px] md:h-[45px] rounded-full"
                    />
                    {unreadCountForChat > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        {unreadCountForChat > 9 ? '9+' : unreadCountForChat}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:typo-label text-[#15120F] truncate">
                          {getChatDisplayName(chat)}
                        </p>
                        {getChatSubtitle(chat) && (
                          <p className="text-[10px] sm:text-xs font-medium text-[#2d6a87] truncate mt-0.5 capitalize">
                            {getChatSubtitle(chat)}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-400 shrink-0 ml-2">
                        {chat.messages && chat.messages[0]
                          ? formatTime(chat.messages[0].updatedAt)
                          : formatTime(chat.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xs sm:typo-body font-normal text-[#808080] truncate max-w-[140px] sm:max-w-[170px] mt-[-2px] sm:mt-[-4px]">
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
