import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface BlockedUser {
  email: string;
  blockedBy: string;
  blockedAt: string;
  reason?: string;
}

interface UserInfo {
  email: string;
  firstName: string;
  lastName: string;
  plotNumber: string;
}

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

interface ModerationStats {
  totalMessages: number;
  deletedMessages: number;
  activeUsers: number;
  blockedUsers: number;
  deletedToday: number;
}

interface ChatModerationPanelProps {
  onBack: () => void;
}

const ChatModerationPanel = ({ onBack }: ChatModerationPanelProps) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [userInfoMap, setUserInfoMap] = useState<Map<string, UserInfo>>(new Map());
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    totalMessages: 0,
    deletedMessages: 0,
    activeUsers: 0,
    blockedUsers: 0,
    deletedToday: 0
  });

  useEffect(() => {
    loadBlockedUsers();
    loadUserInfo();
    loadMessages();
    calculateStats();

    const handleStorageChange = () => {
      loadBlockedUsers();
      loadMessages();
      calculateStats();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('chat-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chat-updated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    calculateStats();
  }, [messages, blockedUsers]);

  const loadBlockedUsers = () => {
    const saved = localStorage.getItem('snt_blocked_users');
    if (saved) {
      try {
        setBlockedUsers(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading blocked users:', e);
      }
    }
  };

  const loadUserInfo = () => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      try {
        const users = JSON.parse(usersJSON);
        const map = new Map<string, UserInfo>();
        users.forEach((user: any) => {
          map.set(user.email, {
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            plotNumber: user.plotNumber || ''
          });
        });
        setUserInfoMap(map);
      } catch (e) {
        console.error('Error loading user info:', e);
      }
    }
  };

  const loadMessages = () => {
    const saved = localStorage.getItem('snt_chat_messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading messages:', e);
      }
    }
  };

  const calculateStats = () => {
    const totalMessages = messages.length;
    const deletedMessages = messages.filter(m => m.deleted).length;
    const uniqueUsers = new Set(messages.filter(m => m.userEmail).map(m => m.userEmail)).size;
    
    // Подсчитываем удалённые сообщения за сегодня
    const today = new Date().toLocaleDateString('ru-RU');
    const deletedToday = messages.filter(m => {
      if (!m.deleted) return false;
      // Предполагаем, что сообщения удаляются в день их создания или позже
      return true; // Упрощённо считаем все удалённые
    }).length;

    setStats({
      totalMessages,
      deletedMessages,
      activeUsers: uniqueUsers,
      blockedUsers: blockedUsers.length,
      deletedToday: 0 // Будем обновлять при реальной реализации с датами удаления
    });
  };

  const handleUnblock = (userEmail: string) => {
    const updatedBlocked = blockedUsers.filter(u => u.email !== userEmail);
    setBlockedUsers(updatedBlocked);
    localStorage.setItem('snt_blocked_users', JSON.stringify(updatedBlocked));
    
    // Trigger storage event for Chat component
    window.dispatchEvent(new Event('storage'));
    
    const userInfo = userInfoMap.get(userEmail);
    const userName = userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : userEmail;
    toast.success(`Пользователь ${userName} разблокирован`);
  };

  const formatDate = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <Icon name="ArrowLeft" size={18} />
          Назад
        </Button>
        <h2 className="text-4xl font-bold">Модерация чата</h2>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Всего сообщений</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalMessages}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="MessageCircle" className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Удалено</p>
                  <p className="text-2xl font-bold mt-1">{stats.deletedMessages}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalMessages > 0 
                      ? `${Math.round((stats.deletedMessages / stats.totalMessages) * 100)}%`
                      : '0%'
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Icon name="Trash2" className="text-orange-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Активных участников</p>
                  <p className="text-2xl font-bold mt-1">{stats.activeUsers}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="Users" className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Заблокировано</p>
                  <p className="text-2xl font-bold mt-1">{stats.blockedUsers}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Icon name="Ban" className="text-red-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ShieldAlert" className="text-red-500" />
              Заблокированные пользователи
              <Badge variant="outline" className="ml-auto">
                {blockedUsers.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {blockedUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="CheckCircle" size={48} className="mx-auto mb-3 text-green-500" />
                <p>Нет заблокированных пользователей</p>
                <p className="text-sm mt-1">Все участники могут писать в чат</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedUsers.map((blocked) => {
                  const userInfo = userInfoMap.get(blocked.email);
                  const blockedByInfo = userInfoMap.get(blocked.blockedBy);
                  
                  return (
                    <div
                      key={blocked.email}
                      className="flex items-start justify-between p-4 border rounded-lg bg-red-50 border-red-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="User" size={16} className="text-red-600" />
                          <p className="font-semibold text-red-900">
                            {userInfo 
                              ? `${userInfo.firstName} ${userInfo.lastName}` 
                              : blocked.email
                            }
                          </p>
                          {userInfo?.plotNumber && (
                            <Badge variant="outline" className="text-xs">
                              Участок №{userInfo.plotNumber}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-red-700 mb-1">
                          <Icon name="Mail" size={12} className="inline mr-1" />
                          {blocked.email}
                        </p>
                        <div className="text-xs text-red-600 space-y-1 mt-2">
                          <p>
                            <Icon name="Calendar" size={12} className="inline mr-1" />
                            Заблокирован: {formatDate(blocked.blockedAt)}
                          </p>
                          <p>
                            <Icon name="Shield" size={12} className="inline mr-1" />
                            Заблокировал: {blockedByInfo 
                              ? `${blockedByInfo.firstName} ${blockedByInfo.lastName}` 
                              : blocked.blockedBy
                            }
                          </p>
                          {blocked.reason && (
                            <p>
                              <Icon name="AlertCircle" size={12} className="inline mr-1" />
                              Причина: {blocked.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblock(blocked.email)}
                        className="ml-4 border-green-500 text-green-600 hover:bg-green-50"
                      >
                        <Icon name="Unlock" size={16} className="mr-1" />
                        Разблокировать
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Trash2" className="text-orange-500" />
              Удалённые сообщения
              <Badge variant="outline" className="ml-auto">
                {stats.deletedMessages}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.deletedMessages === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="MessageCircle" size={48} className="mx-auto mb-3 text-gray-400" />
                <p>Нет удалённых сообщений</p>
                <p className="text-sm mt-1">Все сообщения в порядке</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {messages.filter(m => m.deleted).map((msg) => {
                  const userInfo = msg.userEmail ? userInfoMap.get(msg.userEmail) : null;
                  const deletedByInfo = msg.deletedBy ? userInfoMap.get(msg.deletedBy) : null;
                  
                  return (
                    <div
                      key={msg.id}
                      className="p-3 border rounded-lg bg-orange-50 border-orange-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-orange-900">
                            {userInfo 
                              ? `${userInfo.firstName} ${userInfo.lastName}` 
                              : msg.userName
                            }
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {msg.userRole}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 italic line-through mb-2">{msg.text}</p>
                      <p className="text-xs text-orange-600">
                        <Icon name="Shield" size={12} className="inline mr-1" />
                        Удалил: {deletedByInfo 
                          ? `${deletedByInfo.firstName} ${deletedByInfo.lastName}` 
                          : msg.deletedBy || 'Модератор'
                        }
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" className="text-blue-500" />
              Правила модерации
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Возможности модератора:
              </p>
              <ul className="text-sm text-blue-800 space-y-1 ml-4">
                <li>• Удаление сообщений с нарушениями</li>
                <li>• Блокировка пользователей за нарушение правил</li>
                <li>• Разблокировка пользователей через эту панель</li>
              </ul>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
              <p className="text-sm font-semibold text-amber-900 mb-1">
                Автоматическая фильтрация:
              </p>
              <p className="text-sm text-amber-800">
                Сообщения с ненормативной лексикой автоматически блокируются системой и не попадают в чат
              </p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <p className="text-sm font-semibold text-green-900 mb-1">
                Как модерировать:
              </p>
              <ul className="text-sm text-green-800 space-y-1 ml-4">
                <li>• Наведите курсор на сообщение в чате</li>
                <li>• Нажмите кнопку корзины для удаления</li>
                <li>• Нажмите кнопку блокировки для блокировки автора</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ChatModerationPanel;