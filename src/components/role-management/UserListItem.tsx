import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';
type UserStatus = 'pending' | 'active' | 'rejected';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  plotNumber?: string;
  joinDate: string;
  status: UserStatus;
}

interface UserListItemProps {
  user: User;
  roleNames: Record<UserRole, string>;
  roleColors: Record<UserRole, string>;
  onChangeRole: (userId: number, newRole: UserRole) => void;
  onApproveUser: (userId: number) => void;
  onRejectUser: (userId: number) => void;
}

const UserListItem = ({ 
  user, 
  roleNames, 
  roleColors, 
  onChangeRole, 
  onApproveUser, 
  onRejectUser 
}: UserListItemProps) => {
  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full flex items-center justify-center text-2xl">
              {user.role === 'admin' ? '⭐' : user.role === 'chairman' ? '👑' : user.role === 'board_member' ? '👥' : '👤'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{user.name}</h4>
                <Badge 
                  variant="outline" 
                  className={roleColors[user.role]}
                >
                  {roleNames[user.role]}
                </Badge>
                {user.status === 'pending' && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                    <Icon name="Clock" size={12} className="mr-1" />
                    Ожидает проверки
                  </Badge>
                )}
                {user.status === 'rejected' && (
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                    <Icon name="XCircle" size={12} className="mr-1" />
                    Отклонён
                  </Badge>
                )}
                {user.status === 'active' && (
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    <Icon name="CheckCircle" size={12} className="mr-1" />
                    Активен
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon name="Mail" size={14} />
                  {user.email}
                </span>
                {user.plotNumber && (
                  <span className="flex items-center gap-1">
                    <Icon name="Home" size={14} />
                    Участок {user.plotNumber}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Icon name="Calendar" size={14} />
                  С {new Date(user.joinDate).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {user.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onApproveUser(user.id)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Icon name="CheckCircle" size={16} className="mr-1" />
                  Подтвердить
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRejectUser(user.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Icon name="XCircle" size={16} className="mr-1" />
                  Отклонить
                </Button>
              </div>
            )}

            {user.status === 'active' && (
              <>
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={user.role === 'member' ? 'default' : 'ghost'}
                    onClick={() => onChangeRole(user.id, 'member')}
                    title="Член СНТ"
                  >
                    <Icon name="User" size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant={user.role === 'board_member' ? 'default' : 'ghost'}
                    onClick={() => onChangeRole(user.id, 'board_member')}
                    title="Член правления"
                  >
                    <Icon name="Users" size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant={user.role === 'chairman' ? 'default' : 'ghost'}
                    onClick={() => onChangeRole(user.id, 'chairman')}
                    title="Председатель"
                  >
                    <Icon name="Crown" size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant={user.role === 'admin' ? 'default' : 'ghost'}
                    onClick={() => onChangeRole(user.id, 'admin')}
                    title="Администратор"
                  >
                    <Icon name="Shield" size={16} />
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRejectUser(user.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  title="Деактивировать"
                >
                  <Icon name="UserX" size={16} />
                </Button>
              </>
            )}

            {user.status === 'rejected' && (
              <Button
                size="sm"
                onClick={() => onApproveUser(user.id)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Icon name="CheckCircle" size={16} className="mr-1" />
                Активировать
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserListItem;
