import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import ImportUsersDialog from './ImportUsersDialog';
import RoleManagementStats from './role-management/RoleManagementStats';
import RoleManagementFilters from './role-management/RoleManagementFilters';
import RoleManagementTableRow from './role-management/RoleManagementTableRow';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

type UserStatus = 'pending' | 'active' | 'rejected';

interface User {
  id?: number;
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
  payment_status?: string;
}

interface RoleManagementProps {
  onBack?: () => void;
}

const RoleManagement = ({ onBack }: RoleManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35');
      const data = await response.json();
      if (data.users) {
        setUsers(data.users.map((u: any) => ({
          ...u,
          lastName: u.last_name,
          firstName: u.first_name,
          middleName: u.middle_name || '',
          birthDate: u.birth_date || '',
          plotNumber: u.plot_number,
          ownerIsSame: u.owner_is_same,
          ownerLastName: u.owner_last_name || '',
          ownerFirstName: u.owner_first_name || '',
          ownerMiddleName: u.owner_middle_name || '',
          landDocNumber: u.land_doc_number || '',
          houseDocNumber: u.house_doc_number || '',
          registeredAt: u.registered_at
        })));
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      toast.error('Не удалось загрузить список пользователей');
    }
  };

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

  const handleChangeRole = async (userEmail: string, newRole: UserRole) => {
    const user = users.find(u => u.email === userEmail);
    if (!user) return;

    try {
      const response = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: (user as any).id,
          role: newRole,
          paymentStatus: (user as any).payment_status || 'unpaid'
        })
      });

      if (response.ok) {
        const updatedUsers = users.map(u => 
          u.email === userEmail ? { ...u, role: newRole } : u
        );
        setUsers(updatedUsers);
        toast.success(`Роль пользователя изменена на "${roleNames[newRole]}"`);
      } else {
        toast.error('Не удалось изменить роль');
      }
    } catch (error) {
      console.error('Ошибка изменения роли:', error);
      toast.error('Ошибка при изменении роли');
    }
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

  const handleDeleteUser = (userEmail: string) => {
    const user = users.find(u => u.email === userEmail);
    if (!user) return;

    const fullName = `${user.lastName} ${user.firstName} ${user.middleName}`;
    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить пользователя "${fullName}"?\n\nЭто действие нельзя отменить.`
    );

    if (!confirmed) return;

    const updatedUsers = users.filter(u => u.email !== userEmail);
    setUsers(updatedUsers);
    localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
    toast.success('Пользователь удалён');
  };

  const getCurrentAdminEmail = () => {
    const currentUserEmail = localStorage.getItem('current_user_email');
    return currentUserEmail || 'assapan-nn@yandex.ru';
  };

  const handleExportToExcel = () => {
    const exportData = filteredUsers.map((user, index) => ({
      '№': index + 1,
      'ФИО': `${user.lastName} ${user.firstName} ${user.middleName}`,
      'Дата рождения': user.birthDate || '',
      'Телефон': user.phone,
      'Email': user.email,
      'Номер участка': user.plotNumber,
      'Роль': roleNames[user.role],
      'Статус': user.status === 'active' ? 'Активен' : user.status === 'pending' ? 'Ожидает' : 'Отклонён',
      'Собственник': user.ownerIsSame ? 'Да' : `${user.ownerLastName} ${user.ownerFirstName} ${user.ownerMiddleName}`,
      'Док. на землю': user.landDocNumber || '',
      'Док. на дом': user.houseDocNumber || '',
      'Дата регистрации': new Date(user.registeredAt).toLocaleDateString('ru-RU')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    const columnWidths = [
      { wch: 5 },
      { wch: 30 },
      { wch: 15 },
      { wch: 18 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 }
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Пользователи');

    const fileName = `Пользователи_СНТ_Факел_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success('Файл Excel успешно сохранён');
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <Icon name="ArrowLeft" size={18} />
              Назад
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="UserCog" className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-4xl font-bold">База пользователей</h2>
              <p className="text-muted-foreground">Полная информация о всех зарегистрированных пользователях</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowImportDialog(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            <Icon name="Upload" size={18} className="mr-2" />
            Импорт из Excel
          </Button>
          <Button
            variant="outline"
            onClick={handleExportToExcel}
          >
            <Icon name="Download" size={18} className="mr-2" />
            Экспорт в Excel
          </Button>
        </div>
      </div>

      <RoleManagementStats stats={stats} />

      <RoleManagementFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        onExport={handleExportToExcel}
      />

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
                {filteredUsers.map((user) => (
                  <RoleManagementTableRow
                    key={user.email}
                    user={user}
                    isExpanded={expandedUser === user.email}
                    onToggleExpand={() => setExpandedUser(expandedUser === user.email ? null : user.email)}
                    onChangeRole={handleChangeRole}
                    onApproveUser={handleApproveUser}
                    onRejectUser={handleRejectUser}
                    onDeleteUser={handleDeleteUser}
                    getCurrentAdminEmail={getCurrentAdminEmail}
                    roleNames={roleNames}
                    roleColors={roleColors}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ImportUsersDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportSuccess={fetchUsers}
      />
    </section>
  );
};

export default RoleManagement;
