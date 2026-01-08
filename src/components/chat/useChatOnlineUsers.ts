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
      // Загружаем пользователей из БД
      const response = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35');
      const data = await response.json();
      
      if (!data.users) return;
      
      const users: User[] = data.users;
      const currentUser = users.find((u: User) => u.email === currentUserEmail);
      if (!currentUser) return;

      // Обновляем свой статус в localStorage
      const onlineJSON = localStorage.getItem('snt_online_users');
      const onlineList: OnlineUser[] = onlineJSON ? JSON.parse(onlineJSON) : [];

      const userIndex = onlineList.findIndex((u) => u.email === currentUserEmail);
      const onlineUser: OnlineUser = {
        email: currentUserEmail,
        name: `${currentUser.first_name} ${currentUser.last_name}`,
        plotNumber: currentUser.plot_number,
        role: currentUser.role,
        avatar: getRoleAvatar(currentUser.role),
        lastSeen: Date.now()
      };

      if (userIndex >= 0) {
        onlineList[userIndex] = onlineUser;
      } else {
        onlineList.push(onlineUser);
      }

      localStorage.setItem('snt_online_users', JSON.stringify(onlineList));
      
      // Показываем других онлайн пользователей (исключая себя)
      setOnlineUsers(onlineList.filter((u) => u.email !== currentUserEmail));
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const cleanupInactiveUsers = () => {
    const onlineJSON = localStorage.getItem('snt_online_users');
    if (!onlineJSON) return;

    const onlineList: OnlineUser[] = JSON.parse(onlineJSON);
    const now = Date.now();
    const activeUsers = onlineList.filter((u) => now - u.lastSeen < 120000); // 2 минуты

    localStorage.setItem('snt_online_users', JSON.stringify(activeUsers));
    setOnlineUsers(activeUsers.filter((u) => u.email !== currentUserEmail));
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
