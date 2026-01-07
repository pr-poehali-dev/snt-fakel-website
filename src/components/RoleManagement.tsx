import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

type UserStatus = 'pending' | 'active' | 'rejected';

interface User {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  phone: string;
  email: string;
  plotNumber: string;
  password: string;
  ownerIsSame: boolean;
  ownerLastName: string;
  ownerFirstName: string;
  ownerMiddleName: string;
  landDocNumber: string;
  houseDocNumber: string;
  role: UserRole;
  status: UserStatus;
  registeredAt: string;
}

const RoleManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');

  useEffect(() => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const storedUsers = JSON.parse(usersJSON);
      setUsers(storedUsers);
    }
  }, []);

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

  const handleChangeRole = (userEmail: string, newRole: UserRole) => {
    const updatedUsers = users.map(user => 
      user.email === userEmail ? { ...user, role: newRole } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
    toast.success(`Роль пользователя изменена на "${roleNames[newRole]}"`);
  };

  const handleApproveUser = (userEmail: string) => {
    const updatedUsers = users.map(user => 
      user.email === userEmail ? { ...user, status: 'active' as UserStatus } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
    toast.success('Регистрация подтверждена');
  };

  const handleRejectUser = (userEmail: string) => {
    const updatedUsers = users.map(user => 
      user.email === userEmail ? { ...user, status: 'rejected' as UserStatus } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
    toast.success('Регистрация отклонена');
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.lastName} ${user.firstName} ${user.middleName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) ||
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
          <h2 className="text-4xl font-bold">База пользователей</h2>
          <p className="text-muted-foreground">Полная информация о всех зарегистрированных пользователях</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Всего пользователей</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Активных</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Ожидают подтверждения</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.admins}</p>
              <p className="text-sm text-muted-foreground">Администраторов</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Поиск по ФИО, email, номеру участка..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="pending">Ожидают</SelectItem>
                <SelectItem value="rejected">Отклонённые</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRole} onValueChange={(value: any) => setFilterRole(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все роли</SelectItem>
                <SelectItem value="member">Член СНТ</SelectItem>
                <SelectItem value="board_member">Член правления</SelectItem>
                <SelectItem value="chairman">Председатель</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Управление ролями ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Нажмите на строку для просмотра всех данных пользователя
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">ФИО</th>
                  <th className="text-left p-3 font-semibold">Email</th>
                  <th className="text-left p-3 font-semibold">Участок</th>
                  <th className="text-left p-3 font-semibold">Роль</th>
                  <th className="text-left p-3 font-semibold">Статус</th>
                  <th className="text-left p-3 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const fullName = `${user.lastName} ${user.firstName} ${user.middleName}`;
                  const isExpanded = expandedUser === user.email;
                  
                  return (
                    <React.Fragment key={user.email}>
                      <tr 
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => setExpandedUser(isExpanded ? null : user.email)}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Icon name={isExpanded ? "ChevronDown" : "ChevronRight"} size={16} className="text-muted-foreground" />
                            <span className="font-medium">{fullName}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{user.email}</td>
                        <td className="p-3">
                          <Badge variant="outline">№ {user.plotNumber}</Badge>
                        </td>
                        <td className="p-3">
                          <Select value={user.role} onValueChange={(value: UserRole) => handleChangeRole(user.email, value)}>
                            <SelectTrigger className="w-40" onClick={(e) => e.stopPropagation()}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Член СНТ</SelectItem>
                              <SelectItem value="board_member">Член правления</SelectItem>
                              <SelectItem value="chairman">Председатель</SelectItem>
                              <SelectItem value="admin">Администратор</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          {user.status === 'active' && <Badge className="bg-green-100 text-green-700">Активен</Badge>}
                          {user.status === 'pending' && <Badge className="bg-orange-100 text-orange-700">Ожидает</Badge>}
                          {user.status === 'rejected' && <Badge className="bg-red-100 text-red-700">Отклонён</Badge>}
                        </td>
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            {user.status === 'pending' && (
                              <>
                                <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleApproveUser(user.email)}>
                                  <Icon name="Check" size={16} />
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleRejectUser(user.email)}>
                                  <Icon name="X" size={16} />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-blue-50 border-b">
                          <td colSpan={6} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Icon name="User" size={18} className="text-orange-600" />
                                  Личные данные
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="font-medium">ФИО:</span> {fullName}</p>
                                  <p><span className="font-medium">Дата рождения:</span> {user.birthDate || 'Не указана'}</p>
                                  <p><span className="font-medium">Телефон:</span> {user.phone}</p>
                                  <p><span className="font-medium">Email:</span> {user.email}</p>
                                  <p><span className="font-medium">Номер участка:</span> {user.plotNumber}</p>
                                  <p><span className="font-medium">Дата регистрации:</span> {new Date(user.registeredAt).toLocaleDateString('ru-RU')}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Icon name="FileText" size={18} className="text-orange-600" />
                                  Данные собственника
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {user.ownerIsSame ? (
                                    <p className="text-green-600 font-medium">✓ Является собственником участка</p>
                                  ) : (
                                    <>
                                      <p><span className="font-medium">Собственник:</span> {user.ownerLastName} {user.ownerFirstName} {user.ownerMiddleName}</p>
                                    </>
                                  )}
                                  <p><span className="font-medium">Док. на землю:</span> {user.landDocNumber || 'Не указан'}</p>
                                  <p><span className="font-medium">Док. на дом:</span> {user.houseDocNumber || 'Не указан'}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Icon name="Shield" size={18} className="text-orange-600" />
                                  Учётная запись
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium">Роль:</span> <Badge className={roleColors[user.role]}>{roleNames[user.role]}</Badge></div>
                                  <div><span className="font-medium">Статус:</span> 
                                    {user.status === 'active' && <Badge className="bg-green-100 text-green-700 ml-2">Активен</Badge>}
                                    {user.status === 'pending' && <Badge className="bg-orange-100 text-orange-700 ml-2">Ожидает</Badge>}
                                    {user.status === 'rejected' && <Badge className="bg-red-100 text-red-700 ml-2">Отклонён</Badge>}
                                  </div>
                                  <p><span className="font-medium">Пароль:</span> <span className="text-muted-foreground">••••••••</span></p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default RoleManagement;