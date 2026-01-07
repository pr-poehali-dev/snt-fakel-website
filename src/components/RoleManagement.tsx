import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  plotNumber?: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

const RoleManagement = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Иван Петров',
      email: 'ivan@example.com',
      role: 'chairman',
      plotNumber: '12',
      joinDate: '2020-03-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Мария Сидорова',
      email: 'maria@example.com',
      role: 'member',
      plotNumber: '45',
      joinDate: '2021-05-20',
      status: 'active'
    },
    {
      id: 3,
      name: 'Алексей Новиков',
      email: 'alexey@example.com',
      role: 'member',
      plotNumber: '78',
      joinDate: '2019-08-10',
      status: 'active'
    },
    {
      id: 4,
      name: 'Елена Кузнецова',
      email: 'elena@example.com',
      role: 'member',
      plotNumber: '23',
      joinDate: '2022-01-12',
      status: 'active'
    },
    {
      id: 5,
      name: 'Дмитрий Соколов',
      email: 'dmitry@example.com',
      role: 'admin',
      plotNumber: '56',
      joinDate: '2018-11-05',
      status: 'active'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');

  const roleNames = {
    guest: 'Гость',
    member: 'Член СНТ',
    board_member: 'Член правления',
    chairman: 'Председатель',
    admin: 'Администратор'
  };

  const roleColors = {
    guest: 'bg-gray-100 text-gray-700 border-gray-300',
    member: 'bg-blue-100 text-blue-700 border-blue-300',
    board_member: 'bg-green-100 text-green-700 border-green-300',
    chairman: 'bg-purple-100 text-purple-700 border-purple-300',
    admin: 'bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 border-orange-300'
  };

  const handleChangeRole = (userId: number, newRole: UserRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    toast.success(`Роль пользователя изменена на "${roleNames[newRole]}"`);
  };

  const handleToggleStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } 
        : user
    ));
    const user = users.find(u => u.id === userId);
    toast.success(
      user?.status === 'active' 
        ? 'Пользователь деактивирован' 
        : 'Пользователь активирован'
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.plotNumber?.includes(searchQuery);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    members: users.filter(u => u.role === 'member').length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'chairman' || u.role === 'board_member').length
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <Icon name="UserCog" className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-4xl font-bold">Управление ролями</h2>
          <p className="text-muted-foreground">Назначайте роли и управляйте доступом пользователей</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Icon name="Users" className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Всего пользователей</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Icon name="CheckCircle" className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Активных</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Icon name="User" className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.members}</p>
                <p className="text-sm text-muted-foreground">Членов СНТ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Icon name="Shield" className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Администраторов</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Фильтры и поиск</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по имени, email или номеру участка..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterRole === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterRole('all')}
                size="sm"
              >
                Все
              </Button>
              <Button
                variant={filterRole === 'member' ? 'default' : 'outline'}
                onClick={() => setFilterRole('member')}
                size="sm"
              >
                Члены СНТ
              </Button>
              <Button
                variant={filterRole === 'board_member' ? 'default' : 'outline'}
                onClick={() => setFilterRole('board_member')}
                size="sm"
              >
                Правление
              </Button>
              <Button
                variant={filterRole === 'chairman' ? 'default' : 'outline'}
                onClick={() => setFilterRole('chairman')}
                size="sm"
              >
                Председатель
              </Button>
              <Button
                variant={filterRole === 'admin' ? 'default' : 'outline'}
                onClick={() => setFilterRole('admin')}
                size="sm"
              >
                Админы
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список пользователей ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Измените роль пользователя или деактивируйте учетную запись
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <Card key={user.id} className="border-2">
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
                          {user.status === 'inactive' && (
                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                              Неактивен
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

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 border rounded-lg p-1">
                        <Button
                          size="sm"
                          variant={user.role === 'member' ? 'default' : 'ghost'}
                          onClick={() => handleChangeRole(user.id, 'member')}
                          title="Член СНТ"
                        >
                          <Icon name="User" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant={user.role === 'board_member' ? 'default' : 'ghost'}
                          onClick={() => handleChangeRole(user.id, 'board_member')}
                          title="Член правления"
                        >
                          <Icon name="Users" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant={user.role === 'chairman' ? 'default' : 'ghost'}
                          onClick={() => handleChangeRole(user.id, 'chairman')}
                          title="Председатель"
                        >
                          <Icon name="Crown" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant={user.role === 'admin' ? 'default' : 'ghost'}
                          onClick={() => handleChangeRole(user.id, 'admin')}
                          title="Администратор"
                        >
                          <Icon name="Shield" size={16} />
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant={user.status === 'active' ? 'outline' : 'default'}
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        <Icon 
                          name={user.status === 'active' ? 'UserX' : 'UserCheck'} 
                          size={16} 
                        />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default RoleManagement;