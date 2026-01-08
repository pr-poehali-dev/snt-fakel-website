import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import PrivateChat from './PrivateChat';

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
  
  // Список матерных слов
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
    }, 30000); // Обновление каждые 30 секунд

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
    const activeUsers = onlineList.filter((u) => now - u.lastSeen < 120000); // 2 минуты

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
      toast.error('Вы заблокированы модератором и не можете писать в чат');
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

    // Получаем данные текущего пользователя из localStorage
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
                  const isOwnMessage = message.userId === 999;
                  const isBlocked = message.userEmail && blockedUsers.some(u => u.email === message.userEmail);
                  
                  if (message.deleted) {
                    return (
                      <div key={message.id} className="flex gap-3 opacity-50">
                        <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2">
                          <p className="text-xs text-muted-foreground italic">
                            <Icon name="Trash2" size={12} className="inline mr-1" />
                            Сообщение удалено модератором
                          </p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''} group`}
                    >
                      <Avatar className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-200 to-pink-200 text-2xl">
                        {message.avatar}
                      </Avatar>
                      <div className={`flex-1 ${isOwnMessage ? 'items-end' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{message.userName}</span>
                          {message.userRole === 'Председатель' && (
                            <Badge variant="outline" className="text-xs bg-gradient-to-r from-orange-100 to-pink-100 border-orange-300">
                              {message.userRole}
                            </Badge>
                          )}
                          {isBlocked && (
                            <Badge variant="outline" className="text-xs bg-red-100 border-red-300 text-red-700">
                              Заблокирован
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div
                            className={`rounded-2xl px-4 py-2 max-w-lg ${
                              isOwnMessage
                                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white ml-auto'
                                : 'bg-secondary'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                          {isModerator && !isOwnMessage && message.userEmail && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => handleDeleteMessage(message.id)}
                                title="Удалить сообщение"
                              >
                                <Icon name="Trash2" size={14} className="text-red-500" />
                              </Button>
                              {!isBlocked ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleBlockUser(message.userEmail!, message.userName)}
                                  title="Заблокировать пользователя"
                                >
                                  <Icon name="Ban" size={14} className="text-orange-500" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleUnblockUser(message.userEmail!)}
                                  title="Разблокировать пользователя"
                                >
                                  <Icon name="CheckCircle" size={14} className="text-green-500" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="border-t p-4">
              {isCurrentUserBlocked ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <Icon name="Ban" size={18} />
                    <p className="text-sm font-medium">
                      Вы заблокированы модератором и не можете писать в чат
                    </p>
                  </div>
                </div>
              ) : isLoggedIn && (userRole === 'member' || userRole === 'board_member' || userRole === 'chairman' || userRole === 'admin') ? (
                <>
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Написать сообщение..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                    >
                      <Icon name="Send" size={18} />
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-2">
                    <Icon name="ShieldAlert" size={12} className="inline mr-1" />
                    Использование ненормативной лексики запрещено
                  </p>
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">
                    {!isLoggedIn ? 'Войдите в личный кабинет для отправки сообщений' : 'Только члены СНТ могут писать в чат'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" className="text-green-500" />
              Онлайн
              <Badge variant="outline" className="ml-auto">
                {onlineUsers.length + 1}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {/* Текущий пользователь */}
              {isLoggedIn && (
                <div className="p-3 border-b bg-blue-50">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-400 text-xl">
                      {getRoleAvatar(userRole)}
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Вы (онлайн)</p>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">В сети</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Другие пользователи онлайн */}
              {onlineUsers.length === 0 && isLoggedIn && (
                <div className="p-6 text-center text-muted-foreground">
                  <Icon name="Users" size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Пока никого нет</p>
                </div>
              )}

              {onlineUsers.map((user) => {
                const unreadCount = unreadCounts[user.email] || 0;
                return (
                  <div
                    key={user.email}
                    className="p-3 border-b hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleOpenPrivateChat(user.email)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-200 to-pink-200 text-xl relative">
                        {user.avatar}
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground">Участок №{user.plotNumber}</p>
                      </div>
                      {unreadCount > 0 && (
                        <Badge variant="default" className="bg-red-500 text-white">
                          {unreadCount}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPrivateChat(user.email);
                        }}
                      >
                        <Icon name="MessageCircle" size={16} className="text-blue-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Приватный чат */}
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