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
  first_name: string;
  last_name: string;
  plot_number: string;
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
      // Обновляем свой статус на сервере и получаем список онлайн пользователей
      const response = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_online_status',
          email: currentUserEmail
        })
      });
      
      const data = await response.json();
      
      if (!data.onlineUsers) return;
      
      // Преобразуем список онлайн пользователей
      const onlineList: OnlineUser[] = data.onlineUsers
        .filter((u: any) => u.email !== currentUserEmail)
        .map((u: any) => ({
          email: u.email,
          name: `${u.first_name} ${u.last_name}`,
          plotNumber: u.plot_number,
          role: u.role,
          avatar: getRoleAvatar(u.role),
          lastSeen: new Date(u.last_seen).getTime()
        }));
      
      setOnlineUsers(onlineList);
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const cleanupInactiveUsers = () => {
    // Очистка теперь происходит на сервере автоматически
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
    if (!currentUserEmail) return;

    updateOnlineStatus();
    loadUnreadCounts();

    const interval = setInterval(() => {
      updateOnlineStatus();
      cleanupInactiveUsers();
    }, 30000); // Обновление каждые 30 секунд

    const handleStorageChange = () => {
      cleanupInactiveUsers();
    };

    const handlePrivateMessagesUpdate = () => {
      loadUnreadCounts();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('private-messages-updated', handlePrivateMessagesUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('private-messages-updated', handlePrivateMessagesUpdate);
    };
  }, [currentUserEmail]);

  return {
    onlineUsers,
    unreadCounts,
    loadUnreadCounts
  };
};