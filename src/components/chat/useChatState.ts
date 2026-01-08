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
  deletedAt?: string;
}

export interface BlockedUser {
  email: string;
  blockedBy: string;
  blockedAt: string;
  reason?: string;
}

const API_URL = 'https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35';

export const useChatState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Загрузка сообщений из базы данных
  const loadMessages = async () => {
    try {
      const response = await fetch(`${API_URL}?action=chat_messages`);
      const data = await response.json();
      
      if (data.messages) {
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          userId: 0,
          userName: msg.userName,
          userRole: msg.userRole,
          text: msg.text,
          timestamp: msg.timestamp,
          avatar: msg.avatar,
          userEmail: msg.userEmail,
          deleted: msg.deleted,
          deletedBy: msg.deletedBy,
          deletedAt: msg.deletedAt
        }));
        setMessages(formattedMessages);
      }
      
      if (data.blocked) {
        const formattedBlocked = data.blocked.map((b: any) => ({
          email: b.email,
          blockedBy: b.blockedBy,
          blockedAt: b.blockedAt,
          reason: b.reason
        }));
        setBlockedUsers(formattedBlocked);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка при монтировании
  useEffect(() => {
    loadMessages();
    
    // Автообновление каждые 3 секунды
    const interval = setInterval(loadMessages, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    messages,
    setMessages,
    blockedUsers,
    setBlockedUsers,
    newMessage,
    setNewMessage,
    loading,
    refreshMessages: loadMessages
  };
};