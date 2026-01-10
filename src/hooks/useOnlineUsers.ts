import { useState, useEffect } from 'react';

export const useOnlineUsers = () => {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const now = Date.now();
      const onlineTimeout = 5 * 60 * 1000; // 5 минут
      
      const usersJSON = localStorage.getItem('snt_users');
      if (!usersJSON) return;

      const users = JSON.parse(usersJSON);
      const onlineUsers = users.filter((u: any) => {
        const lastActivity = u.lastActivity || 0;
        return (now - lastActivity) < onlineTimeout;
      });

      setOnlineCount(onlineUsers.length);
    };

    // Обновляем при монтировании
    updateOnlineStatus();

    // Обновляем каждую минуту
    const interval = setInterval(updateOnlineStatus, 60000);

    // Слушаем изменения активности
    window.addEventListener('user-activity', updateOnlineStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('user-activity', updateOnlineStatus);
    };
  }, []);

  return onlineCount;
};

export const updateUserActivity = (email: string) => {
  const usersJSON = localStorage.getItem('snt_users');
  if (!usersJSON) return;

  const users = JSON.parse(usersJSON);
  const updatedUsers = users.map((u: any) =>
    u.email === email ? { ...u, lastActivity: Date.now() } : u
  );

  localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
  window.dispatchEvent(new Event('user-activity'));
};
