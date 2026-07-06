import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import PrivateChat from './PrivateChat';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import OnlineUsersPanel from './chat/OnlineUsersPanel';
import { useChatState, UserRole, Message } from './chat/useChatState';
import { useChatOnlineUsers } from './chat/useChatOnlineUsers';
import { containsProfanity, getRoleAvatar, playNotificationSound } from './chat/chatHelpers';

interface ChatProps {
  isLoggedIn: boolean;
  userRole: UserRole;
  currentUserEmail: string;
}

const Chat = ({ isLoggedIn, userRole, currentUserEmail }: ChatProps) => {
  const {
    messages,
    setMessages,
    blockedUsers,
    setBlockedUsers,
    newMessage,
    setNewMessage,
    loading,
    refreshMessages
  } = useChatState();

  const {
    onlineUsers,
    unreadCounts,
    loadUnreadCounts
  } = useChatOnlineUsers(currentUserEmail, getRoleAvatar, playNotificationSound);

  const [privateChatOpen, setPrivateChatOpen] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const isModerator = userRole === 'chairman' || userRole === 'admin' || userRole === 'board_member';
  const isCurrentUserBlocked = blockedUsers.some(u => u.email === currentUserEmail);
  
  useEffect(() => {
    console.log('Chat Debug:', {
      userRole,
      isModerator,
      currentUserEmail,
      isCurrentUserBlocked,
      blockedUsersCount: blockedUsers.length
    });
  }, [userRole, isModerator, currentUserEmail, isCurrentUserBlocked, blockedUsers]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOpenPrivateChat = (userEmail: string) => {
    setPrivateChatOpen(userEmail);
  };

  const handleDeleteMessage = async (messageId: number) => {
    console.log('Delete message attempt:', { messageId, isModerator, userRole });
    
    const message = messages.find(msg => msg.id === messageId);
    
    if (!message) {
      toast.error('Сообщение не найдено');
      return;
    }
    
    const isOwnMessage = message.userEmail === currentUserEmail;
    
    if (!isModerator && !isOwnMessage) {
      toast.error('Вы можете удалять только свои сообщения');
      return;
    }
    
    try {
      const response = await fetch('https://functions.poehali.dev/47c18793-f4fd-491f-a9da-f1ff24e64e51', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_message',
          messageId,
          deletedBy: currentUserEmail
        })
      });
      
      if (response.ok) {
        toast.success('Сообщение удалено');
        refreshMessages();
      } else {
        toast.error('Ошибка при удалении сообщения');
      }
    } catch (error) {
      toast.error('Ошибка соединения');
    }
  };

  const handleEditMessage = async (messageId: number, newText: string) => {
    const message = messages.find(msg => msg.id === messageId);
    
    if (!message) {
      toast.error('Сообщение не найдено');
      return;
    }
    
    const isOwnMessage = message.userEmail === currentUserEmail;
    
    if (!isOwnMessage) {
      toast.error('Вы можете редактировать только свои сообщения');
      return;
    }

    if (newText.trim() === message.text) {
      return;
    }

    if (newText.trim() === '') {
      toast.error('Сообщение не может быть пустым');
      return;
    }
    
    try {
      const response = await fetch('https://functions.poehali.dev/47c18793-f4fd-491f-a9da-f1ff24e64e51', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_message',
          messageId,
          newText: newText.trim(),
          editedBy: currentUserEmail
        })
      });
      
      if (response.ok) {
        toast.success('Сообщение изменено');
        refreshMessages();
      } else {
        toast.error('Ошибка при редактировании сообщения');
      }
    } catch (error) {
      toast.error('Ошибка соединения');
    }
  };
  
  const handleBlockUser = async (userEmail: string, userName: string) => {
    console.log('Block user attempt:', { userEmail, userName, isModerator, userRole });
    
    if (!isModerator) {
      toast.error('Только модераторы могут блокировать пользователей');
      return;
    }
    
    if (blockedUsers.some(u => u.email === userEmail)) {
      toast.error('Пользователь уже заблокирован');
      return;
    }
    
    // Получаем роль пользователя, которого пытаемся заблокировать
    let targetUserRole: string | null = null;
    try {
      const userResponse = await fetch(`https://functions.poehali.dev/47c18793-f4fd-491f-a9da-f1ff24e64e51`);
      const userData = await userResponse.json();
      const targetUser = userData.users?.find((u: any) => u.email === userEmail);
      if (targetUser) {
        targetUserRole = targetUser.role;
      }
    } catch (err) {
      console.error('Error fetching target user role:', err);
    }
    
    // Защита: админ не может блокировать председателя и наоборот
    if (targetUserRole === 'admin' && userRole === 'chairman') {
      toast.error('Председатель не может заблокировать администратора');
      return;
    }
    
    if (targetUserRole === 'chairman' && userRole === 'admin') {
      toast.error('Администратор не может заблокировать председателя');
      return;
    }
    
    try {
      const response = await fetch('https://functions.poehali.dev/47c18793-f4fd-491f-a9da-f1ff24e64e51', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'block_user',
          email: userEmail,
          blockedBy: currentUserEmail,
          reason: 'Нарушение правил чата'
        })
      });
      
      if (response.ok) {
        toast.success(`Пользователь ${userName} заблокирован`);
        refreshMessages();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка при блокировке');
      }
    } catch (error) {
      toast.error('Ошибка соединения');
    }
  };
  
  const handleUnblockUser = async (userEmail: string) => {
    console.log('Unblock user attempt:', { userEmail, isModerator, userRole });
    
    if (!isModerator) {
      toast.error('Только модераторы могут разблокировать пользователей');
      return;
    }
    
    try {
      const response = await fetch('https://functions.poehali.dev/47c18793-f4fd-491f-a9da-f1ff24e64e51', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unblock_user',
          email: userEmail
        })
      });
      
      if (response.ok) {
        // Немедленно обновляем локальное состояние
        setBlockedUsers(prev => prev.filter(u => u.email !== userEmail));
        
        toast.success('Пользователь разблокирован и может писать в чат');
        
        // Обновляем данные с сервера
        await refreshMessages();
        
        // Отправляем событие для других компонентов
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('chat-updated'));
      } else {
        const errorData = await response.json();
        toast.error(`Ошибка при разблокировке: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Unblock error:', error);
      toast.error('Ошибка соединения с сервером');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
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

    const roleNames: Record<'member' | 'board_member' | 'chairman' | 'admin', string> = {
      member: 'Участник',
      board_member: 'Член правления',
      chairman: 'Председатель',
      admin: 'Администратор'
    };

    const avatar = userRole === 'admin' ? '⭐' : userRole === 'chairman' ? '👑' : userRole === 'board_member' ? '👥' : '👤';

    // Получить имя пользователя из БД
    let currentUserName = 'Пользователь';
    try {
      const userResponse = await fetch(`https://functions.poehali.dev/47c18793-f4fd-491f-a9da-f1ff24e64e51`);
      const userData = await userResponse.json();
      const user = userData.users?.find((u: any) => u.email === currentUserEmail);
      if (user) {
        currentUserName = `${user.first_name} ${user.last_name} (уч. ${user.plot_number})`;
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }

    try {
      const response = await fetch('https://functions.poehali.dev/47c18793-f4fd-491f-a9da-f1ff24e64e51', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          userEmail: currentUserEmail,
          userName: currentUserName,
          userRole: roleNames[userRole],
          avatar: avatar,
          text: newMessage
        })
      });
      
      if (response.ok) {
        setNewMessage('');
        toast.success('Сообщение отправлено');
        refreshMessages();
      } else {
        toast.error('Ошибка при отправке сообщения');
      }
    } catch (error) {
      toast.error('Ошибка соединения');
    }
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
              <div className="flex items-center gap-3">
                {(userRole === 'admin' || userRole === 'chairman') && (
                  <button
                    onClick={async () => {
                      if (confirm('Вы уверены? Это удалит ВСЕ сообщения из чата безвозвратно!')) {
                        try {
                          // Удалить все сообщения через API
                          const allMessages = messages.filter(m => !m.deleted);
                          for (const msg of allMessages) {
                            await fetch('https://functions.poehali.dev/47c18793-f4fd-491f-a9da-f1ff24e64e51', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                action: 'delete_message',
                                messageId: msg.id,
                                deletedBy: currentUserEmail
                              })
                            });
                          }
                          toast.success('Чат очищен');
                          refreshMessages();
                        } catch (error) {
                          toast.error('Ошибка при очистке чата');
                        }
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Icon name="Trash2" size={14} />
                    Очистить чат
                  </button>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {onlineUsers.length + 1} онлайн
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px] overflow-y-auto p-6" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.userEmail === currentUserEmail;
                  const isBlocked = message.userEmail && blockedUsers.some(u => u.email === message.userEmail);
                  const isUserOnline = message.userEmail ? onlineUsers.some(u => u.email === message.userEmail) : false;
                  
                  return (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwnMessage={isOwnMessage}
                      isBlocked={!!isBlocked}
                      isModerator={isModerator}
                      currentUserEmail={currentUserEmail}
                      isUserOnline={isUserOnline}
                      onDeleteMessage={handleDeleteMessage}
                      onEditMessage={handleEditMessage}
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