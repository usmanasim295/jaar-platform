'use client';
import { useState, FC, useEffect } from 'react';
import { Chats } from '@/components/modals/type';
import { MagnifyingGlass } from '../assets/icons';
import { useTranslation } from 'react-i18next';

interface MessagesChatsProps {
  setSelectedChat: React.Dispatch<React.SetStateAction<Chats | null>>;
  selectedChat: Chats | null;
}

const MessagesChats: FC<MessagesChatsProps> = ({
  setSelectedChat,
  selectedChat,
}) => {
  const [activeTab, setActiveTab] = useState('Unread');
  const [searchTerm, setSearchTerm] = useState('');

  const [chats] = useState<Chats[]>([
    {
      id: 1,
      name: 'Nguyen',
      img: 'https://randomuser.me/api/portraits/women/40.jpg',
      messages: [
        {
          id: 1,
          sender: 'them',
          type: 'text',
          content:
            'pulvinar eleifend. In eu dolor tellus. Nam metus orci, eleifend at con egetpulvinar eleifend. In eu dolor tellus. Nam metus orci, eleifend at con eget',
          time: '08:30 AM',
        },
        {
          id: 2,
          sender: 'me',
          type: 'text',
          content: 'pulvinar eleifend. In eu dolor tellus. Nam metus',
          time: '08:30 AM',
        },
        {
          id: 3,
          sender: 'them',
          type: 'offer',
          content: 'Hiring Offer',
          offerTitle: 'Plumbing Contract',
          offerDescription:
            'consectetur adipiscing elit. Proin molestie consectetur adipiscing elit. Proinmlem olestie consectetur adipiscing elit. Proin molestie',
          time: '08:30 AM',
        },
      ],
    },
    {
      id: 2,
      name: 'Alex Johnson',
      img: 'https://randomuser.me/api/portraits/men/42.jpg',
      messages: [
        {
          id: 1,
          sender: 'them',
          type: 'text',
          content:
            'Hey! I wanted to discuss the project timeline with you. Do you have a few minutes?',
          time: '09:00 AM',
        },
        {
          id: 2,
          sender: 'me',
          type: 'text',
          content:
            "Sure, let me wrap up something quickly and I'll tell you in 5 minutes.",
          time: '09:02 AM',
        },
        {
          id: 3,
          sender: 'them',
          type: 'offer',
          content: 'Design Proposal',
          offerTitle: 'Website Redesign Package',
          offerDescription:
            'Includes full UI/UX redesign, mobile responsiveness, and SEO optimization. Delivery in 3 weeks.',
          time: '09:05 AM',
        },
      ],
    },
  ]);
  const { t } = useTranslation();

  const [activeChat, setActiveChat] = useState<Chats>(chats[0]);

  const filteredChats = chats.filter(chat => {
    const nameMatch = chat.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return nameMatch;
  });

  useEffect(() => {
    setSelectedChat(activeChat);
  }, [selectedChat, activeChat]);

  return (
    <div>
      {/* Tabs */}
      <div className="flex justify-center p-[6px] gap-2  rounded-lg border border-[#E5E5E5] m-6">
        {['All', 'Unread', 'Archived'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-[6px] typo-body font-medium transition-colors duration-200 ${
              tab === activeTab
                ? 'bg-(--orange) text-(--white)'
                : 'text-[#333333] hover:bg-gray-100'
            }`}
          >
            {t(tab)}
          </button>
        ))}
      </div>

      <div className="m-6  p-2 rounded-[10px] border border-[#E5E5E5] text-sm flex gap-2 w-auto items-center">
        <MagnifyingGlass />
        <input
          type="text"
          placeholder={t('Search keywords')}
          className="focus:outline-none "
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Chat List */}
      {filteredChats.map(chat => (
        <div
          key={chat.id}
          onClick={() => setActiveChat(chat)}
          className={`px-6 py-[14px] cursor-pointer gap-2 flex justify-between mt-3  ${
            chat === activeChat
              ? 'bg-[#F3F3F3]'
              : 'bg-[#fcfafa] hover:bg-[#F3F3F3]'
          }`}
        >
          <div className="gap-2 flex justify-between">
            <img
              src={chat.img}
              alt="User"
              width={45}
              height={45}
              className="rounded-full"
            />
            <div>
              <div className="flex justify-between items-center">
                <p className="font-medium typo-label text-[#15120F] mb-[7px]">
                  {chat.name}
                </p>
              </div>
              <div className="flex-1">
                <p className="typo-body font-normal text-[#808080]">
                  {/* Lorem ipsum dolor sit amet... */}
                  {chat.messages[chat.messages.length - 1].content
                    .split(' ')
                    .slice(0, 5)
                    .join('') + ' ...'}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {chat.messages[chat.messages.length - 1].time.split(' ')[0]}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MessagesChats;
