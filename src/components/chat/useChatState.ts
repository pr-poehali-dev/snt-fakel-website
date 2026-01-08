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

export const defaultMessages: Message[] = [];

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

  // Сохранение в localStorage + синхронизация через storage event
  useEffect(() => {
    localStorage.setItem('snt_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('snt_blocked_users', JSON.stringify(blockedUsers));
  }, [blockedUsers]);

  // Слушаем изменения storage от других вкладок/браузеров
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'snt_chat_messages' && e.newValue) {
        try {
          const newMessages = JSON.parse(e.newValue);
          setMessages(newMessages);
        } catch (err) {
          console.error('Error parsing messages:', err);
        }
      }
      
      if (e.key === 'snt_blocked_users' && e.newValue) {
        try {
          const newBlocked = JSON.parse(e.newValue);
          setBlockedUsers(newBlocked);
        } catch (err) {
          console.error('Error parsing blocked users:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    messages,
    setMessages,
    blockedUsers,
    setBlockedUsers,
    newMessage,
    setNewMessage
  };
};