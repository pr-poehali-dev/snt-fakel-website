import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AppealFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: 'all' | 'pending' | 'in_progress' | 'resolved';
  setStatusFilter: (value: 'all' | 'pending' | 'in_progress' | 'resolved') => void;
  sortBy: 'date-desc' | 'date-asc' | 'status';
  setSortBy: (value: 'date-desc' | 'date-asc' | 'status') => void;
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}

const AppealFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  totalCount,
  filteredCount,
  onReset
}: AppealFiltersProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Поиск по теме, сообщению, автору, участку..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                className="px-4 py-2 border rounded-md bg-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Все статусы</option>
                <option value="pending">Ожидает рассмотрения</option>
                <option value="in_progress">В работе</option>
                <option value="resolved">Решено</option>
              </select>

              <select
                className="px-4 py-2 border rounded-md bg-background"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="date-desc">Сначала новые</option>
                <option value="date-asc">Сначала старые</option>
                <option value="status">По статусу</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Найдено обращений: <span className="font-semibold">{filteredCount}</span> из {totalCount}
            </p>
            
            {(searchTerm || statusFilter !== 'all' || sortBy !== 'date-desc') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="gap-2"
              >
                <Icon name="X" size={16} />
                Сбросить фильтры
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppealFilters;
