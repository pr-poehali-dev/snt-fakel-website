import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  isBlocked: boolean;
  isModerator: boolean;
  onDeleteMessage: (messageId: number) => void;
  onBlockUser: (userEmail: string, userName: string) => void;
  onUnblockUser: (userEmail: string) => void;
}

const ChatMessage = ({
  message,
  isOwnMessage,
  isBlocked,
  isModerator,
  onDeleteMessage,
  onBlockUser,
  onUnblockUser
}: ChatMessageProps) => {
  if (message.deleted) {
    return (
      <div className="flex gap-3 opacity-50">
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
                onClick={() => onDeleteMessage(message.id)}
                title="Удалить сообщение"
              >
                <Icon name="Trash2" size={14} className="text-red-500" />
              </Button>
              {!isBlocked ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => onBlockUser(message.userEmail!, message.userName)}
                  title="Заблокировать пользователя"
                >
                  <Icon name="Ban" size={14} className="text-orange-500" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => onUnblockUser(message.userEmail!)}
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
