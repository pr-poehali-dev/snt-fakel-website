import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface PrivateMessage {
  id: number;
  fromEmail: string;
  toEmail: string;
  fromName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

interface User {
  email: string;
  firstName: string;
  lastName: string;
  plotNumber: string;
  role: string;
  status: string;
}

interface PrivateChatProps {
  currentUserEmail: string;
  recipientEmail: string;
  recipientName: string;
  onClose: () => void;
}

const PrivateChat = ({ currentUserEmail, recipientEmail, recipientName, onClose }: PrivateChatProps) => {
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    loadCurrentUserName();
    markMessagesAsRead();

    const handleUpdate = () => {
      loadMessages();
    };

    window.addEventListener('private-messages-updated', handleUpdate);
    return () => window.removeEventListener('private-messages-updated', handleUpdate);
  }, [recipientEmail]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadCurrentUserName = () => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const user = users.find((u: User) => u.email === currentUserEmail);
      if (user) {
        setCurrentUserName(`${user.firstName} ${user.lastName}`);
      }
    }
  };

  const loadMessages = () => {
    const saved = localStorage.getItem('snt_private_messages');
    if (saved) {
      try {
        const allMessages: PrivateMessage[] = JSON.parse(saved);
        const conversation = allMessages.filter(
          (msg) =>
            (msg.fromEmail === currentUserEmail && msg.toEmail === recipientEmail) ||
            (msg.fromEmail === recipientEmail && msg.toEmail === currentUserEmail)
        );
        conversation.sort((a, b) => a.id - b.id);
        setMessages(conversation);
      } catch (e) {
        console.error('Error loading private messages:', e);
      }
    }
  };

  const markMessagesAsRead = () => {
    const saved = localStorage.getItem('snt_private_messages');
    if (saved) {
      try {
        const allMessages: PrivateMessage[] = JSON.parse(saved);
        const updated = allMessages.map((msg) =>
          msg.fromEmail === recipientEmail && msg.toEmail === currentUserEmail && !msg.read
            ? { ...msg, read: true }
            : msg
        );
        localStorage.setItem('snt_private_messages', JSON.stringify(updated));
        window.dispatchEvent(new Event('private-messages-updated'));
      } catch (e) {
        console.error('Error marking messages as read:', e);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim() === '') {
      return;
    }

    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');

    const saved = localStorage.getItem('snt_private_messages');
    const allMessages: PrivateMessage[] = saved ? JSON.parse(saved) : [];

    const message: PrivateMessage = {
      id: Date.now(),
      fromEmail: currentUserEmail,
      toEmail: recipientEmail,
      fromName: currentUserName,
      text: newMessage,
      timestamp: `${hours}:${minutes}`,
      read: false
    };

    allMessages.push(message);
    localStorage.setItem('snt_private_messages', JSON.stringify(allMessages));
    window.dispatchEvent(new Event('private-messages-updated'));

    setNewMessage('');
    toast.success('Сообщение отправлено');
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 shadow-2xl z-50">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Avatar className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-200 text-lg">
              💬
            </Avatar>
            {recipientName}
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <Icon name="X" size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] overflow-y-auto p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Icon name="MessageCircle" size={48} className="mb-2 opacity-50" />
              <p className="text-sm">Нет сообщений</p>
              <p className="text-xs mt-1">Начните переписку!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isOwnMessage = message.fromEmail === currentUserEmail;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-3 py-2 ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t p-3">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Написать сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 text-sm"
            />
            <Button
              type="submit"
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Icon name="Send" size={16} />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivateChat;
