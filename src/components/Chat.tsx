import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import PrivateChat from './PrivateChat';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import OnlineUsersPanel from './chat/OnlineUsersPanel';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

interface Message {
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

interface BlockedUser {
  email: string;
  blockedBy: string;
  blockedAt: string;
  reason?: string;
}

interface User {
  email: string;
  firstName: string;
  lastName: string;
  plotNumber: string;
  role: string;
  status: string;
}

interface OnlineUser {
  email: string;
  name: string;
  plotNumber: string;
  role: string;
  avatar: string;
  lastSeen: number;
}

interface ChatProps {
  isLoggedIn: boolean;
  userRole: UserRole;
  currentUserEmail: string;
}

const defaultMessages: Message[] = [
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

const Chat = ({ isLoggedIn, userRole, currentUserEmail }: ChatProps) => {
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
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [privateChatOpen, setPrivateChatOpen] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const isModerator = userRole === 'chairman' || userRole === 'admin';
  const isCurrentUserBlocked = blockedUsers.some(u => u.email === currentUserEmail);
  
  const profanityList = [
    'хуй', 'хуя', 'хуи', 'хуё', 'хер', 'пизд', 'ебал', 'ебан', 'ебат', 'ебл', 'ебу', 'еби',
    'бля', 'блят', 'сука', 'суки', 'сучк', 'говн', 'дерьм', 'срат', 'срал',
    'пидар', 'пидор', 'педик', 'даун', 'дебил', 'мудак', 'уёб', 'уеб'
  ];
  
  const containsProfanity = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return profanityList.some(word => lowerText.includes(word));
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('snt_chat_messages', JSON.stringify(messages));
    window.dispatchEvent(new Event('chat-updated'));
  }, [messages]);
  
  useEffect(() => {
    localStorage.setItem('snt_blocked_users', JSON.stringify(blockedUsers));
  }, [blockedUsers]);

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

  const getRoleAvatar = (role: string): string => {
    switch (role) {
      case 'admin': return '⭐';
      case 'chairman': return '👑';
      case 'board_member': return '👥';
      default: return '👤';
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.error('Error playing notification sound:', e);
    }
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

  const handleOpenPrivateChat = (userEmail: string) => {
    setPrivateChatOpen(userEmail);
  };

  const handleDeleteMessage = (messageId: number) => {
    if (!isModerator) return;
    
    const updatedMessages = messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, deleted: true, deletedBy: currentUserEmail } 
        : msg
    );
    setMessages(updatedMessages);
    toast.success('Сообщение удалено');
  };
  
  const handleBlockUser = (userEmail: string, userName: string) => {
    if (!isModerator) return;
    
    if (blockedUsers.some(u => u.email === userEmail)) {
      toast.error('Пользователь уже заблокирован');
      return;
    }
    
    const newBlock: BlockedUser = {
      email: userEmail,
      blockedBy: currentUserEmail,
      blockedAt: new Date().toISOString(),
      reason: 'Нарушение правил чата'
    };
    
    setBlockedUsers([...blockedUsers, newBlock]);
    toast.success(`Пользователь ${userName} заблокирован`);
  };
  
  const handleUnblockUser = (userEmail: string) => {
    if (!isModerator) return;
    
    setBlockedUsers(blockedUsers.filter(u => u.email !== userEmail));
    toast.success('Пользователь разблокирован');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      toast.error('Войдите в личный кабинет для отправки сообщений');
      return;
    }

    if (userRole === 'guest') {
      toast.error('Только члены СНТ могут писать в чат');
      return;
    }
    
    if (isCurrentUserBlocked) {
      toast.error('❌ Вы заблокированы модератором и не можете писать в чат. Для разблокировки обратитесь к администратору.', {
        duration: 5000,
        style: {
          background: '#fee2e2',
          border: '1px solid #ef4444',
          color: '#991b1b'
        }
      });
      return;
    }

    if (newMessage.trim() === '') {
      return;
    }
    
    if (containsProfanity(newMessage)) {
      toast.error('Сообщение содержит недопустимые слова');
      return;
    }

    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');

    const roleNames: Record<'member' | 'board_member' | 'chairman' | 'admin', string> = {
      member: 'Участник',
      board_member: 'Член правления',
      chairman: 'Председатель',
      admin: 'Администратор'
    };

    const usersJSON = localStorage.getItem('snt_users');
    let currentUserName = 'Вы';
    if (usersJSON && currentUserEmail) {
      const users = JSON.parse(usersJSON);
      const user = users.find((u: any) => u.email === currentUserEmail);
      if (user) {
        currentUserName = `${user.firstName} ${user.lastName} (уч. ${user.plotNumber})`;
      }
    }

    const message: Message = {
      id: messages.length + 1,
      userId: 999,
      userName: currentUserName,
      userRole: roleNames[userRole],
      text: newMessage,
      timestamp: `${hours}:${minutes}`,
      avatar: userRole === 'admin' ? '⭐' : userRole === 'chairman' ? '👑' : userRole === 'board_member' ? '👥' : '👤',
      userEmail: currentUserEmail
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    setNewMessage('');
    toast.success('Сообщение отправлено');
  };

  return (
    <section>
      <h2 className="text-4xl font-bold mb-8">Общий чат СНТ</h2>
      
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-4">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="MessageCircle" className="text-primary" size={24} />
                Общий чат
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {onlineUsers.length + 1} онлайн
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px] overflow-y-auto p-6" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.userEmail === currentUserEmail;
                  const isBlocked = message.userEmail && blockedUsers.some(u => u.email === message.userEmail);
                  
                  return (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwnMessage={isOwnMessage}
                      isBlocked={!!isBlocked}
                      isModerator={isModerator}
                      currentUserEmail={currentUserEmail}
                      onDeleteMessage={handleDeleteMessage}
                      onBlockUser={handleBlockUser}
                      onUnblockUser={handleUnblockUser}
                    />
                  );
                })}
              </div>
            </div>
            
            <div className="border-t p-4">
              <ChatInput
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                isCurrentUserBlocked={isCurrentUserBlocked}
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onSubmit={handleSendMessage}
              />
            </div>
          </CardContent>
        </Card>

        <OnlineUsersPanel
          isLoggedIn={isLoggedIn}
          userRole={userRole}
          onlineUsers={onlineUsers}
          unreadCounts={unreadCounts}
          onOpenPrivateChat={handleOpenPrivateChat}
          getRoleAvatar={getRoleAvatar}
        />
      </div>

      {privateChatOpen && (
        <PrivateChat
          currentUserEmail={currentUserEmail}
          recipientEmail={privateChatOpen}
          recipientName={
            onlineUsers.find((u) => u.email === privateChatOpen)?.name || 'Пользователь'
          }
          onClose={() => {
            setPrivateChatOpen(null);
            loadUnreadCounts();
          }}
        />
      )}
    </section>
  );
};

export default Chat;