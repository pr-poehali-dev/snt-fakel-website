import { useState, useEffect } from 'react';

export type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

export interface Message {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  text: string;
  timestamp: string;
  avatar: string;
  userEmail?: string;
  deleted?: boolean;
  deletedBy?: string;
}

export interface BlockedUser {
  email: string;
  blockedBy: string;
  blockedAt: string;
  reason?: string;
}

export const defaultMessages: Message[] = [
  {
    id: 1,
    userId: 1,
    userName: 'Иван Петров (уч. 15)',
    userRole: 'Председатель',
    text: 'Добрый день! Напоминаю о субботнике в эту субботу с 10:00.',
    timestamp: '10:30',
    avatar: '👨‍💼'
  },
  {
    id: 2,
    userId: 2,
    userName: 'Мария Сидорова (уч. 42)',
    userRole: 'Участник',
    text: 'Здравствуйте! Подскажите, когда будет вывоз мусора?',
    timestamp: '11:15',
    avatar: '👩'
  },
  {
    id: 3,
    userId: 1,
    userName: 'Иван Петров (уч. 15)',
    userRole: 'Председатель',
    text: 'Вывоз мусора во вторник и пятницу с 9:00 до 11:00.',
    timestamp: '11:20',
    avatar: '👨‍💼'
  },
  {
    id: 4,
    userId: 3,
    userName: 'Алексей Новиков (уч. 8)',
    userRole: 'Участник',
    text: 'На субботнике буду! Что нужно взять с собой?',
    timestamp: '12:05',
    avatar: '👨'
  },
  {
    id: 5,
    userId: 1,
    userName: 'Иван Петров (уч. 15)',
    userRole: 'Председатель',
    text: 'Грабли, мешки для мусора и хорошее настроение! 😊',
    timestamp: '12:10',
    avatar: '👨‍💼'
  },
];

export const useChatState = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('snt_chat_messages');
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (e) {
        console.error('Error loading chat messages:', e);
        return defaultMessages;
      }
    }
    return defaultMessages;
  });

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(() => {
    const saved = localStorage.getItem('snt_blocked_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('snt_chat_messages', JSON.stringify(messages));
    window.dispatchEvent(new Event('chat-updated'));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('snt_blocked_users', JSON.stringify(blockedUsers));
  }, [blockedUsers]);

  return {
    messages,
    setMessages,
    blockedUsers,
    setBlockedUsers,
    newMessage,
    setNewMessage
  };
};
