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
    setNewMessage
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

  const handleDeleteMessage = (messageId: number) => {
    console.log('Delete message attempt:', { messageId, isModerator, userRole });
    
    if (!isModerator) {
      toast.error('Только модераторы могут удалять сообщения');
      return;
    }
    
    const updatedMessages = messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, deleted: true, deletedBy: currentUserEmail } 
        : msg
    );
    setMessages(updatedMessages);
    toast.success('Сообщение удалено');
  };
  
  const handleBlockUser = (userEmail: string, userName: string) => {
    console.log('Block user attempt:', { userEmail, userName, isModerator, userRole });
    
    if (!isModerator) {
      toast.error('Только модераторы могут блокировать пользователей');
      return;
    }
    
    if (blockedUsers.some(u => u.email === userEmail)) {
      toast.error('Пользователь уже заблокирован');
      return;
    }
    
    const newBlock = {
      email: userEmail,
      blockedBy: currentUserEmail,
      blockedAt: new Date().toISOString(),
      reason: 'Нарушение правил чата'
    };
    
    const updatedBlockedUsers = [...blockedUsers, newBlock];
    setBlockedUsers(updatedBlockedUsers);
    console.log('User blocked successfully:', newBlock);
    toast.success(`Пользователь ${userName} заблокирован`);
  };
  
  const handleUnblockUser = (userEmail: string) => {
    console.log('Unblock user attempt:', { userEmail, isModerator, userRole });
    
    if (!isModerator) {
      toast.error('Только модераторы могут разблокировать пользователей');
      return;
    }
    
    const updatedBlockedUsers = blockedUsers.filter(u => u.email !== userEmail);
    setBlockedUsers(updatedBlockedUsers);
    console.log('User unblocked successfully');
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
