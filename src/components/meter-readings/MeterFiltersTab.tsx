import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface MeterFiltersTabProps {
  searchTerm: string;
  selectedMonth: string;
  uniqueMonths: string[];
  onSearchChange: (value: string) => void;
  onMonthChange: (value: string) => void;
}

const MeterFiltersTab = ({ 
  searchTerm, 
  selectedMonth, 
  uniqueMonths, 
  onSearchChange, 
  onMonthChange 
}: MeterFiltersTabProps) => {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Поиск</label>
          <Input
            placeholder="Участок, ФИО, номер ПУ..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Месяц</label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
          >
            <option value="all">Все месяцы</option>
            {uniqueMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="TrendingUp" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">Фильтруются показания:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>По участку, ФИО пользователя или номеру ПУ</li>
              <li>По выбранному месяцу передачи показаний</li>
              <li>Результаты отображаются в таблице ниже и доступны для экспорта</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default MeterFiltersTab;
