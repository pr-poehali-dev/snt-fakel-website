import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

interface ChatInputProps {
  isLoggedIn: boolean;
  userRole: UserRole;
  isCurrentUserBlocked: boolean;
  newMessage: string;
  onMessageChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ChatInput = ({
  isLoggedIn,
  userRole,
  isCurrentUserBlocked,
  newMessage,
  onMessageChange,
  onSubmit
}: ChatInputProps) => {
  if (isCurrentUserBlocked) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-red-700">
          <Icon name="Ban" size={18} />
          <p className="text-sm font-medium">
            Вы заблокированы модератором и не можете писать в чат
          </p>
        </div>
      </div>
    );
  }

  if (isLoggedIn && (userRole === 'member' || userRole === 'board_member' || userRole === 'chairman' || userRole === 'admin')) {
    return (
      <>
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            placeholder="Написать сообщение..."
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
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
    );
  }

  return (
    <div className="text-center py-2">
      <p className="text-sm text-muted-foreground">
        {!isLoggedIn ? 'Войдите в личный кабинет для отправки сообщений' : 'Только члены СНТ могут писать в чат'}
      </p>
    </div>
  );
};

export default ChatInput;
