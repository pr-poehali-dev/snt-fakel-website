import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type UserRole = 'guest' | 'member' | 'admin';

interface Message {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  text: string;
  timestamp: string;
  avatar: string;
}

interface ChatProps {
  isLoggedIn: boolean;
  userRole: UserRole;
}

const Chat = ({ isLoggedIn, userRole }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      userId: 1,
      userName: 'Иван Петров',
      userRole: 'Председатель',
      text: 'Добрый день! Напоминаю о субботнике в эту субботу с 10:00.',
      timestamp: '10:30',
      avatar: '👨‍💼'
    },
    {
      id: 2,
      userId: 2,
      userName: 'Мария Сидорова',
      userRole: 'Участник',
      text: 'Здравствуйте! Подскажите, когда будет вывоз мусора?',
      timestamp: '11:15',
      avatar: '👩'
    },
    {
      id: 3,
      userId: 1,
      userName: 'Иван Петров',
      userRole: 'Председатель',
      text: 'Вывоз мусора во вторник и пятницу с 9:00 до 11:00.',
      timestamp: '11:20',
      avatar: '👨‍💼'
    },
    {
      id: 4,
      userId: 3,
      userName: 'Алексей Новиков',
      userRole: 'Участник',
      text: 'На субботнике буду! Что нужно взять с собой?',
      timestamp: '12:05',
      avatar: '👨'
    },
    {
      id: 5,
      userId: 1,
      userName: 'Иван Петров',
      userRole: 'Председатель',
      text: 'Грабли, мешки для мусора и хорошее настроение! 😊',
      timestamp: '12:10',
      avatar: '👨‍💼'
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers] = useState(12);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

    if (newMessage.trim() === '') {
      return;
    }

    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');

    const roleNames = {
      member: 'Участник',
      admin: 'Администратор'
    };

    const message: Message = {
      id: messages.length + 1,
      userId: 999,
      userName: 'Вы',
      userRole: roleNames[userRole],
      text: newMessage,
      timestamp: `${hours}:${minutes}`,
      avatar: userRole === 'admin' ? '⭐' : '👤'
    };

    setMessages([...messages, message]);
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
                  const isOwnMessage = message.userName === 'Вы';
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-200 to-pink-200 text-2xl">
                        {message.avatar}
                      </Avatar>
                      <div className={`flex-1 ${isOwnMessage ? 'items-end' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {!isOwnMessage && (
                            <>
                              <span className="font-semibold text-sm">{message.userName}</span>
                              {message.userRole === 'Председатель' && (
                                <Badge variant="outline" className="text-xs bg-gradient-to-r from-orange-100 to-pink-100 border-orange-300">
                                  {message.userRole}
                                </Badge>
                              )}
                            </>
                          )}
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-2 max-w-lg ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white ml-auto'
                              : 'bg-secondary'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="border-t p-4">
              {isLoggedIn && (userRole === 'member' || userRole === 'admin') ? (
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