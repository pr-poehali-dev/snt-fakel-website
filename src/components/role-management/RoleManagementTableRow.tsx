import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface RoleManagementTableRowProps {
  user: User;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChangeRole: (email: string, role: UserRole) => void;
  onApproveUser: (email: string) => void;
  onRejectUser: (email: string) => void;
  onDeleteUser: (email: string) => void;
  getCurrentAdminEmail: () => string;
  roleNames: Record<UserRole, string>;
  roleColors: Record<UserRole, string>;
}

const RoleManagementTableRow = ({
  user,
  isExpanded,
  onToggleExpand,
  onChangeRole,
  onApproveUser,
  onRejectUser,
  onDeleteUser,
  getCurrentAdminEmail,
  roleNames,
  roleColors
}: RoleManagementTableRowProps) => {
  const fullName = `${user.lastName} ${user.firstName} ${user.middleName}`;

  return (
    <React.Fragment>
      <tr 
        className="border-b hover:bg-gray-50 cursor-pointer"
        onClick={onToggleExpand}
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
          <Select value={user.role} onValueChange={(value: UserRole) => onChangeRole(user.email, value)}>
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
                <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => onApproveUser(user.email)}>
                  <Icon name="Check" size={16} />
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => onRejectUser(user.email)}>
                  <Icon name="X" size={16} />
                </Button>
              </>
            )}
            {user.email !== getCurrentAdminEmail() && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 hover:bg-red-50 border-red-300" 
                onClick={() => onDeleteUser(user.email)}
                title="Удалить пользователя"
              >
                <Icon name="Trash2" size={16} />
              </Button>
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
};

export default RoleManagementTableRow;
