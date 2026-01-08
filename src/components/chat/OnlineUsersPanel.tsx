import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

interface OnlineUser {
  email: string;
  name: string;
  plotNumber: string;
  role: string;
  avatar: string;
  lastSeen: number;
}

interface OnlineUsersPanelProps {
  isLoggedIn: boolean;
  userRole: UserRole;
  onlineUsers: OnlineUser[];
  unreadCounts: Record<string, number>;
  onOpenPrivateChat: (userEmail: string) => void;
  getRoleAvatar: (role: string) => string;
}

const OnlineUsersPanel = ({
  isLoggedIn,
  userRole,
  onlineUsers,
  unreadCounts,
  onOpenPrivateChat,
  getRoleAvatar
}: OnlineUsersPanelProps) => {
  const getLastSeenText = (lastSeen: number) => {
    const now = Date.now();
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins === 1) return '1 мин. назад';
    if (diffMins < 5) return `${diffMins} мин. назад`;
    return 'недавно';
  };

  return (
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

          {onlineUsers.length === 0 && isLoggedIn && (
            <div className="p-6 text-center text-muted-foreground">
              <Icon name="Users" size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Пока никого нет</p>
            </div>
          )}

          {onlineUsers.map((user) => {
            const unreadCount = unreadCounts[user.email] || 0;
            const lastSeenText = getLastSeenText(user.lastSeen);
            return (
              <div
                key={user.email}
                className="p-3 border-b hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onOpenPrivateChat(user.email)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-200 to-pink-200 text-xl relative">
                    {user.avatar}
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Участок №{user.plotNumber}</p>
                      <span className="text-xs text-green-600">• {lastSeenText}</span>
                    </div>
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
                      onOpenPrivateChat(user.email);
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
  );
};

export default OnlineUsersPanel;