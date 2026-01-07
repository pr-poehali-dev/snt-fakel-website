import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import UserStatisticsCards from './role-management/UserStatisticsCards';
import UserFilters from './role-management/UserFilters';
import UserListItem from './role-management/UserListItem';

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

      <UserStatisticsCards stats={stats} />

      <UserFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
      />

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
              <UserListItem 
                key={user.id}
                user={user}
                roleNames={roleNames}
                roleColors={roleColors}
                onChangeRole={handleChangeRole}
                onApproveUser={handleApproveUser}
                onRejectUser={handleRejectUser}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default RoleManagement;
