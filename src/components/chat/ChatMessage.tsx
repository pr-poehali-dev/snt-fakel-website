import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';

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
  deletedAt?: string;
  edited?: boolean;
  editedAt?: string;
}

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  isBlocked: boolean;
  isModerator: boolean;
  currentUserEmail: string;
  isUserOnline?: boolean;
  onDeleteMessage: (messageId: number) => void;
  onEditMessage: (messageId: number, newText: string) => void;
  onBlockUser: (userEmail: string, userName: string) => void;
  onUnblockUser: (userEmail: string) => void;
}

const ChatMessage = ({
  message,
  isOwnMessage,
  isBlocked,
  isModerator,
  currentUserEmail,
  isUserOnline = false,
  onDeleteMessage,
  onEditMessage,
  onBlockUser,
  onUnblockUser
}: ChatMessageProps) => {
  const [hideDeleted, setHideDeleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  useEffect(() => {
    if (message.deleted && message.deletedAt) {
      const deletedTime = new Date(message.deletedAt).getTime();
      const currentTime = Date.now();
      const elapsed = currentTime - deletedTime;
      const remaining = 10000 - elapsed;

      if (remaining <= 0) {
        setHideDeleted(true);
        return;
      }

      const timer = setTimeout(() => {
        setHideDeleted(true);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [message.deleted, message.deletedAt]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const messageDateMoscow = new Date(timestamp);
      const nowMoscow = new Date();
      
      const diffMs = nowMoscow.getTime() - messageDateMoscow.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'только что';
      if (diffMins < 60) return `${diffMins} мин. назад`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} ч. назад`;
      
      return messageDateMoscow.toLocaleString('ru-RU', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return timestamp;
    }
  };
  const showModerationButtons = isModerator && message.userEmail && message.userEmail !== currentUserEmail;
  
  // Debug log
  console.log('ChatMessage render:', {
    messageId: message.id,
    userName: message.userName,
    userEmail: message.userEmail,
    currentUserEmail,
    isOwnMessage,
    isModerator,
    showModerationButtons
  });
  
  if (message.deleted && hideDeleted) {
    return null;
  }

  if (message.deleted) {
    return (
      <div className="flex gap-3 opacity-50">
        <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2">
          <p className="text-xs text-muted-foreground italic">
            <Icon name="Trash2" size={12} className="inline mr-1" />
            Сообщение удалено
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''} group`}
    >
      <Avatar className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-200 to-pink-200 text-2xl relative">
        {message.avatar}
        {isUserOnline && !isOwnMessage && (
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
        )}
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
          {isUserOnline && !isOwnMessage && (
            <Badge variant="outline" className="text-xs bg-green-50 border-green-300 text-green-700">
              Онлайн
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
        </div>
        <div className="flex items-start gap-2">
          {isEditing ? (
            <div className="flex-1 flex gap-2 items-center">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (editText.trim() && editText.trim() !== message.text) {
                      onEditMessage(message.id, editText.trim());
                      setIsEditing(false);
                    }
                  }
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditText(message.text);
                  }
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-green-50"
                onClick={() => {
                  if (editText.trim() && editText.trim() !== message.text) {
                    onEditMessage(message.id, editText.trim());
                    setIsEditing(false);
                  }
                }}
                title="Сохранить"
              >
                <Icon name="Check" size={16} className="text-green-500" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-red-50"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(message.text);
                }}
                title="Отменить"
              >
                <Icon name="X" size={16} className="text-red-500" />
              </Button>
            </div>
          ) : (
            <div
              className={`rounded-2xl px-4 py-2 max-w-lg ${
                isOwnMessage
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white ml-auto'
                  : 'bg-secondary'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              {message.edited && (
                <p className="text-xs mt-1 opacity-70">
                  <Icon name="Edit" size={10} className="inline mr-1" />
                  изменено
                </p>
              )}
            </div>
          )}
          {isOwnMessage && !isEditing && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                title="Редактировать"
              >
                <Icon name="Edit" size={14} className="text-blue-500" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMessage(message.id);
                }}
                title="Удалить своё сообщение"
              >
                <Icon name="Trash2" size={14} className="text-red-500" />
              </Button>
            </div>
          )}
          {showModerationButtons && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMessage(message.id);
                }}
                title="Удалить сообщение"
              >
                <Icon name="Trash2" size={14} className="text-red-500" />
              </Button>
              {!isBlocked ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-orange-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBlockUser(message.userEmail!, message.userName);
                  }}
                  title="Заблокировать пользователя"
                >
                  <Icon name="Ban" size={14} className="text-orange-500" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnblockUser(message.userEmail!);
                  }}
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
};

export default ChatMessage;