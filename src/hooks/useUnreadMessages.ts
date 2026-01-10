import { useState, useEffect } from 'react';

export const useUnreadMessages = (currentUserEmail: string) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUserEmail) {
      setUnreadCount(0);
      return;
    }

    const calculateUnreadMessages = () => {
      const privateChatsJSON = localStorage.getItem('snt_private_chats');
      if (!privateChatsJSON) {
        setUnreadCount(0);
        return;
      }

      try {
        const privateChats = JSON.parse(privateChatsJSON);
        let total = 0;

        Object.keys(privateChats).forEach((chatKey) => {
          if (!chatKey.includes(currentUserEmail)) return;

          const chat = privateChats[chatKey];
          const messages = chat.messages || [];
          
          const unread = messages.filter((msg: any) => 
            msg.sender !== currentUserEmail && !msg.read
          ).length;
          
          total += unread;
        });

        setUnreadCount(total);
      } catch (e) {
        console.error('Error calculating unread messages:', e);
        setUnreadCount(0);
      }
    };

    calculateUnreadMessages();

    const handleUpdate = () => {
      calculateUnreadMessages();
    };

    window.addEventListener('private-chat-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('private-chat-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [currentUserEmail]);

  return unreadCount;
};
