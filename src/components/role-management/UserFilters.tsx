import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';
type UserStatus = 'pending' | 'active' | 'rejected';

interface UserFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: UserStatus | 'all';
  setFilterStatus: (status: UserStatus | 'all') => void;
  filterRole: UserRole | 'all';
  setFilterRole: (role: UserRole | 'all') => void;
}

const UserFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  filterStatus, 
  setFilterStatus, 
  filterRole, 
  setFilterRole 
}: UserFiltersProps) => {
  return (
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
  );
};

export default UserFilters;
