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

  const updateOnlineStatus = () => {
    if (!currentUserEmail) return;

    const usersJSON = localStorage.getItem('snt_users');
    if (!usersJSON) return;

    const users: User[] = JSON.parse(usersJSON);
    const currentUser = users.find((u) => u.email === currentUserEmail);
    if (!currentUser) return;

    const onlineJSON = localStorage.getItem('snt_online_users');
    const onlineList: OnlineUser[] = onlineJSON ? JSON.parse(onlineJSON) : [];

    const userIndex = onlineList.findIndex((u) => u.email === currentUserEmail);
    const onlineUser: OnlineUser = {
      email: currentUserEmail,
      name: `${currentUser.firstName} ${currentUser.lastName}`,
      plotNumber: currentUser.plotNumber,
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
    setOnlineUsers(onlineList.filter((u) => u.email !== currentUserEmail));
  };

  const cleanupInactiveUsers = () => {
    const onlineJSON = localStorage.getItem('snt_online_users');
    if (!onlineJSON) return;

    const onlineList: OnlineUser[] = JSON.parse(onlineJSON);
    const now = Date.now();
    const activeUsers = onlineList.filter((u) => now - u.lastSeen < 120000);

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
