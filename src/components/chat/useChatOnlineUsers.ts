import { useState, useEffect } from 'react';

export interface OnlineUser {
  email: string;
  name: string;
  plotNumber: string;
  role: string;
  avatar: string;
  lastSeen: number;
}

interface User {
  email: string;
  firstName: string;
  lastName: string;
  plotNumber: string;
  role: string;
  status: string;
}

export const useChatOnlineUsers = (
  currentUserEmail: string,
  getRoleAvatar: (role: string) => string,
  playNotificationSound: () => void
) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const updateOnlineStatus = async () => {
    if (!currentUserEmail) return;

    try {
      // Загружаем пользователей из БД
      const usersResponse = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35');
      const usersData = await usersResponse.json();
      
      console.log('Online status: loaded users', usersData.users?.length);
      
      if (!usersData.users) return;
      
      // Загружаем сообщения из чата
      const messagesResponse = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35?action=chat_messages');
      const messagesData = await messagesResponse.json();
      
      console.log('Online status: loaded messages', messagesData.messages?.length);
      
      if (!messagesData.messages) return;
      
      // Определяем онлайн пользователей по последней активности (5 минут)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const activeEmails = new Set<string>();
      
      messagesData.messages.forEach((msg: any) => {
        const msgTime = new Date(msg.timestamp).getTime();
        if (msgTime > fiveMinutesAgo && msg.userEmail && msg.userEmail !== currentUserEmail) {
          activeEmails.add(msg.userEmail);
          console.log('Online status: active user found', msg.userEmail, 'message time:', msg.timestamp);
        }
      });
      
      console.log('Online status: active emails', Array.from(activeEmails));
      
      // Формируем список онлайн пользователей
      const onlineList: OnlineUser[] = [];
      
      usersData.users.forEach((u: any) => {
        if (activeEmails.has(u.email)) {
          // Находим последнее сообщение этого пользователя
          const userMessages = messagesData.messages
            .filter((m: any) => m.userEmail === u.email)
            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          const lastMsg = userMessages[0];
          const lastSeen = lastMsg ? new Date(lastMsg.timestamp).getTime() : Date.now();
          
          onlineList.push({
            email: u.email,
            name: `${u.first_name} ${u.last_name}`,
            plotNumber: u.plot_number,
            role: u.role,
            avatar: getRoleAvatar(u.role),
            lastSeen
          });
        }
      });
      
      console.log('Online status: final online list', onlineList);
      
      setOnlineUsers(onlineList);
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const cleanupInactiveUsers = () => {
    // Очистка теперь происходит автоматически через updateOnlineStatus
    // Эта функция оставлена для совместимости
  };

  const loadUnreadCounts = () => {
    const saved = localStorage.getItem('snt_private_messages');
    if (!saved) return;

    try {
      const allMessages = JSON.parse(saved);
      const counts: Record<string, number> = {};

      allMessages.forEach((msg: any) => {
        if (msg.toEmail === currentUserEmail && !msg.read) {
          counts[msg.fromEmail] = (counts[msg.fromEmail] || 0) + 1;
        }
      });

      const totalUnread = Object.values(counts).reduce((sum: number, count) => sum + count, 0);
      const previousTotalUnread = Object.values(unreadCounts).reduce((sum: number, count) => sum + count, 0);

      if (totalUnread > previousTotalUnread) {
        playNotificationSound();
      }

      setUnreadCounts(counts);
    } catch (e) {
      console.error('Error loading unread counts:', e);
    }
  };

  useEffect(() => {
    updateOnlineStatus();
    loadUnreadCounts();

    const interval = setInterval(() => {
      updateOnlineStatus();
      cleanupInactiveUsers();
    }, 30000);

    const handlePrivateMessagesUpdate = () => {
      loadUnreadCounts();
    };

    window.addEventListener('private-messages-updated', handlePrivateMessagesUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('private-messages-updated', handlePrivateMessagesUpdate);
    };
  }, [currentUserEmail]);

  return {
    onlineUsers,
    unreadCounts,
    loadUnreadCounts
  };
};