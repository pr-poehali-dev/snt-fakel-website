import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

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
      role: 'board_member',
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
    },
    {
      id: 6,
      name: 'Ольга Васильева',
      email: 'olga@example.com',
      role: 'board_member',
      plotNumber: '34',
      joinDate: '2021-03-18',
      status: 'active'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');

  // Загружаем пользователей из localStorage при монтировании
  const loadUsersFromStorage = () => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const storedUsers = JSON.parse(usersJSON);
      const formattedUsers = storedUsers.map((u: any, idx: number) => ({
        id: idx + 100,
        name: `${u.lastName} ${u.firstName} ${u.middleName || ''}`.trim(),
        email: u.email,
        role: u.role || 'member',
        plotNumber: u.plotNumber,
        joinDate: u.registeredAt ? new Date(u.registeredAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: u.status || 'pending'
      }));
      setUsers([...users, ...formattedUsers]);
    }
  };

  // Загружаем при первом рендере
  useState(() => {
    loadUsersFromStorage();
  });

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

  const handleApproveUser = (userId: number) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, status: 'active' as UserStatus } : user
    );
    setUsers(updatedUsers);
    
    // Обновляем localStorage
    const user = users.find(u => u.id === userId);
    if (user && user.id >= 100) {
      const usersJSON = localStorage.getItem('snt_users');
      if (usersJSON) {
        const storedUsers = JSON.parse(usersJSON);
        const updated = storedUsers.map((u: any) => 
          u.email === user.email ? { ...u, status: 'active' } : u
        );
        localStorage.setItem('snt_users', JSON.stringify(updated));
      }
    }
    
    toast.success('Регистрация подтверждена');
  };

  const handleRejectUser = (userId: number) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, status: 'rejected' as UserStatus } : user
    );
    setUsers(updatedUsers);
    
    // Обновляем localStorage
    const user = users.find(u => u.id === userId);
    if (user && user.id >= 100) {
      const usersJSON = localStorage.getItem('snt_users');
      if (usersJSON) {
        const storedUsers = JSON.parse(usersJSON);
        const updated = storedUsers.map((u: any) => 
          u.email === user.email ? { ...u, status: 'rejected' } : u
        );
        localStorage.setItem('snt_users', JSON.stringify(updated));
      }
    }
    
    toast.success('Регистрация отклонена');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.plotNumber?.includes(searchQuery);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
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
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Icon name="Clock" className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Ожидают проверки</p>
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
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Фильтры и поиск</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по имени, email или номеру участка..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm font-medium self-center">Статус:</span>
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  size="sm"
                >
                  Все
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('pending')}
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Icon name="Clock" size={14} className="mr-1" />
                  Ожидают
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('active')}
                  size="sm"
                >
                  Активные
                </Button>
                <Button
                  variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('rejected')}
                  size="sm"
                >
                  Отклонённые
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap md:ml-4">
                <span className="text-sm font-medium self-center">Роль:</span>
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
              </div>
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
                            onClick={() => handleApproveUser(user.id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Icon name="CheckCircle" size={16} className="mr-1" />
                            Подтвердить
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectUser(user.id)}
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
                            variant="outline"
                            onClick={() => handleRejectUser(user.id)}
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
                          onClick={() => handleApproveUser(user.id)}
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
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default RoleManagement;