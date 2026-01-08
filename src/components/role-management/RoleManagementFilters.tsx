import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface RoleManagementFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterStatus: UserStatus | 'all';
  setFilterStatus: (value: UserStatus | 'all') => void;
  filterRole: UserRole | 'all';
  setFilterRole: (value: UserRole | 'all') => void;
  onExport: () => void;
}

const RoleManagementFilters = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterRole,
  setFilterRole,
  onExport
}: RoleManagementFiltersProps) => {
  return (
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
          <Button 
            variant="outline" 
            className="border-green-500 text-green-600 hover:bg-green-50"
            onClick={onExport}
          >
            <Icon name="Download" size={18} className="mr-2" />
            Экспорт в Excel
          </Button>
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
  );
};

export default RoleManagementFilters;
