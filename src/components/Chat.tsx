import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

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
  const [onlineUsers] = useState(12);
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
  }, [messages]);
  
  useEffect(() => {
    localStorage.setItem('snt_blocked_users', JSON.stringify(blockedUsers));
  }, [blockedUsers]);

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
      
      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="MessageCircle" className="text-primary" size={24} />
                Общий чат
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {onlineUsers} онлайн
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
            <CardTitle className="text-lg">Правила чата</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Icon name="Check" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Будьте вежливы и уважайте других участников</span>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Check" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Обсуждайте только вопросы, касающиеся СНТ</span>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="X" size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <span>Не используйте нецензурную лексику</span>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="X" size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <span>Не размещайте рекламу и спам</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <h4 className="font-semibold text-sm mb-3">Быстрые темы</h4>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs"
                onClick={() => isLoggedIn ? setNewMessage('Когда следующее собрание?') : toast.error('Войдите для отправки')}
              >
                <Icon name="Calendar" size={14} className="mr-2" />
                Общее собрание
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs"
                onClick={() => isLoggedIn ? setNewMessage('Подскажите график дежурств') : toast.error('Войдите для отправки')}
              >
                <Icon name="Users" size={14} className="mr-2" />
                График дежурств
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs"
                onClick={() => isLoggedIn ? setNewMessage('Как подать заявку на ремонт?') : toast.error('Войдите для отправки')}
              >
                <Icon name="Wrench" size={14} className="mr-2" />
                Ремонт и обслуживание
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Chat;