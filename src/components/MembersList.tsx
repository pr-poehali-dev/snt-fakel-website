import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as XLSX from 'xlsx';

interface User {
  lastName: string;
  firstName: string;
  middleName: string;
  email: string;
  phone: string;
  plotNumber: string;
  role: string;
  status: string;
  registeredAt: string;
  ownerIsSame: boolean;
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
}

const MembersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'plot' | 'date'>('name');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35');
        const data = await response.json();
        
        if (data.users) {
          const usersWithPayment = data.users.map((user: any) => ({
            lastName: user.last_name,
            firstName: user.first_name,
            middleName: user.middle_name || '',
            email: user.email,
            phone: user.phone,
            plotNumber: user.plot_number,
            role: user.role,
            status: user.status,
            registeredAt: user.registered_at,
            ownerIsSame: user.owner_is_same || false,
            paymentStatus: user.payment_status as 'paid' | 'unpaid' | 'partial'
          }));
          setUsers(usersWithPayment);
          localStorage.setItem('snt_users', JSON.stringify(usersWithPayment));
        }
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        
        const usersJSON = localStorage.getItem('snt_users');
        if (usersJSON) {
          const storedUsers = JSON.parse(usersJSON);
          setUsers(storedUsers);
        }
      }
    };
    
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const fullName = `${user.lastName} ${user.firstName} ${user.middleName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.plotNumber?.includes(searchQuery);
    
    const matchesPayment = filterPayment === 'all' || user.paymentStatus === filterPayment;
    
    return matchesSearch && matchesPayment && user.status === 'active';
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'name') {
      return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
    } else if (sortBy === 'plot') {
      return parseInt(a.plotNumber || '0') - parseInt(b.plotNumber || '0');
    } else if (sortBy === 'date') {
      return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
    }
    return 0;
  });

  const owners = users.filter(u => u.status === 'active' && u.ownerIsSame);
  
  const stats = {
    total: users.filter(u => u.status === 'active').length,
    paid: owners.filter(u => u.paymentStatus === 'paid').length,
    unpaid: owners.filter(u => u.paymentStatus === 'unpaid').length,
    partial: owners.filter(u => u.paymentStatus === 'partial').length
  };

  const handleExportToExcel = () => {
    const exportData = filteredUsers.map((user, index) => ({
      '№': index + 1,
      'ФИО': `${user.lastName} ${user.firstName} ${user.middleName}`,
      'Номер участка': user.plotNumber,
      'Телефон': user.phone,
      'Email': user.email,
      'Статус оплаты': user.ownerIsSame 
        ? (user.paymentStatus === 'paid' ? 'Оплачено' : user.paymentStatus === 'partial' ? 'Частично' : 'Не оплачено')
        : 'Не собственник',
      'Дата регистрации': new Date(user.registeredAt).toLocaleDateString('ru-RU')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    const columnWidths = [
      { wch: 5 },
      { wch: 30 },
      { wch: 15 },
      { wch: 18 },
      { wch: 25 },
      { wch: 18 },
      { wch: 18 }
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Участники');

    const fileName = `Участники_СНТ_Факел_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success('Файл Excel успешно сохранён');
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
          <Icon name="Users" className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-4xl font-bold">Список участников</h2>
          <p className="text-muted-foreground">Обобщённые данные по всем участникам СНТ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Всего участников</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
              <p className="text-sm text-muted-foreground">Оплатили взнос</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.partial}</p>
              <p className="text-sm text-muted-foreground">Частичная оплата</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.unpaid}</p>
              <p className="text-sm text-muted-foreground">Не оплатили</p>
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
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-green-500 text-green-600 hover:bg-green-50"
              onClick={handleExportToExcel}
            >
              <Icon name="Download" size={18} className="mr-2" />
              Экспорт в Excel
            </Button>
            <Select value={filterPayment} onValueChange={(value: any) => setFilterPayment(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Статус оплаты" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="paid">Оплачено</SelectItem>
                <SelectItem value="partial">Частично</SelectItem>
                <SelectItem value="unpaid">Не оплачено</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">По имени</SelectItem>
                <SelectItem value="plot">По участку</SelectItem>
                <SelectItem value="date">По дате регистрации</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Таблица участников ({sortedUsers.length})</CardTitle>
          <CardDescription>
            Список всех активных участников с информацией об оплате членских взносов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">№</th>
                  <th className="text-left p-3 font-semibold">ФИО</th>
                  <th className="text-left p-3 font-semibold">Участок</th>
                  <th className="text-left p-3 font-semibold">Телефон</th>
                  <th className="text-left p-3 font-semibold">Email</th>
                  <th className="text-left p-3 font-semibold">Статус оплаты</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user, index) => {
                  const fullName = `${user.lastName} ${user.firstName} ${user.middleName}`;
                  
                  return (
                    <tr key={user.email} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-muted-foreground">{index + 1}</td>
                      <td className="p-3">
                        <span className="font-medium">{fullName}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">№ {user.plotNumber}</Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{user.phone}</td>
                      <td className="p-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="p-3">
                        {user.ownerIsSame ? (
                          <>
                            {user.paymentStatus === 'paid' && (
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                <Icon name="CheckCircle" size={14} className="mr-1" />
                                Оплачено
                              </Badge>
                            )}
                            {user.paymentStatus === 'partial' && (
                              <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                                <Icon name="AlertCircle" size={14} className="mr-1" />
                                Частично
                              </Badge>
                            )}
                            {user.paymentStatus === 'unpaid' && (
                              <Badge className="bg-red-100 text-red-700 border-red-300">
                                <Icon name="XCircle" size={14} className="mr-1" />
                                Не оплачено
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600">
                            <Icon name="User" size={14} className="mr-1" />
                            Не собственник
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sortedUsers.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Участники не найдены</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default MembersList;