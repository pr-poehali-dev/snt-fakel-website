import { useState, useEffect } from 'react';

export const useOnlineUsers = () => {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const updateOnlineStatus = async () => {
      // Пытаемся получить из БД
      try {
        const response = await fetch('https://functions.poehali.dev/36da760a-f60b-4b9a-ab53-5fa753cf41a4?type=online');
        if (response.ok) {
          const data = await response.json();
          setOnlineCount(data.onlineUsers || 0);
          return;
        }
      } catch (error) {
        console.error('Error fetching online users from API:', error);
      }
      
      // Fallback на localStorage
      const now = Date.now();
      const onlineTimeout = 5 * 60 * 1000;
      
      const usersJSON = localStorage.getItem('snt_users');
      if (!usersJSON) return;

      const users = JSON.parse(usersJSON);
      const onlineUsers = users.filter((u: any) => {
        const lastActivity = u.lastActivity || 0;
        return (now - lastActivity) < onlineTimeout;
      });

      setOnlineCount(onlineUsers.length);
    };

    updateOnlineStatus();

    const interval = setInterval(updateOnlineStatus, 60000);

    window.addEventListener('user-activity', updateOnlineStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('user-activity', updateOnlineStatus);
    };
  }, []);

  return onlineCount;
};

export const updateUserActivity = async (email: string) => {
  // Обновляем в localStorage (для старых компонентов)
  const usersJSON = localStorage.getItem('snt_users');
  if (usersJSON) {
    const users = JSON.parse(usersJSON);
    const updatedUsers = users.map((u: any) =>
      u.email === email ? { ...u, lastActivity: Date.now() } : u
    );
    localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
  }
  
  // Синхронизируем с БД
  try {
    await fetch('https://functions.poehali.dev/36da760a-f60b-4b9a-ab53-5fa753cf41a4?type=online', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: email,
        lastActivity: Date.now()
      })
    });
  } catch (error) {
    console.error('Error syncing user activity to DB:', error);
  }
  
  window.dispatchEvent(new Event('user-activity'));
};