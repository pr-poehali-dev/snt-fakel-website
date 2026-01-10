import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import MeterManagementCard from './profile/MeterManagementCard';

interface MeterReading {
  id: string;
  email: string;
  plotNumber: string;
  meterNumber: string;
  reading: number;
  date: string;
  month: string;
}

interface User {
  email: string;
  firstName: string;
  lastName: string;
  plotNumber: string;
  meterNumber?: string;
}

interface MeterReadingsManagerProps {
  onBack?: () => void;
}

const MeterReadingsManager = ({ onBack }: MeterReadingsManagerProps) => {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<{ email: string; name: string; plotNumber: string; meterNumber: string } | null>(null);
  const [newMeterNumber, setNewMeterNumber] = useState('');

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('meter-readings-updated', handleUpdate);
    return () => window.removeEventListener('meter-readings-updated', handleUpdate);
  }, []);

  const loadData = () => {
    const readingsJSON = localStorage.getItem('snt_meter_readings');
    const usersJSON = localStorage.getItem('snt_users');

    if (readingsJSON) {
      const allReadings = JSON.parse(readingsJSON);
      setReadings(allReadings.sort((a: MeterReading, b: MeterReading) => 
        new Date(b.date.split('.').reverse().join('-')).getTime() - 
        new Date(a.date.split('.').reverse().join('-')).getTime()
      ));
    }

    if (usersJSON) {
      setUsers(JSON.parse(usersJSON));
    }
  };

  const handleUnlockMeter = (email: string) => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const updatedUsers = users.map((u: any) =>
        u.email === email ? { ...u, meterNumber: undefined } : u
      );
      localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      toast.success('Номер прибора учёта разблокирован');
    }
  };

  const handleEditMeterClick = (reading: MeterReading) => {
    const user = users.find(u => u.email === reading.email);
    if (user) {
      setEditingUser({
        email: reading.email,
        name: getUserName(reading.email),
        plotNumber: reading.plotNumber,
        meterNumber: reading.meterNumber
      });
      setNewMeterNumber(reading.meterNumber);
      setShowEditDialog(true);
    }
  };

  const handleSaveMeterNumber = () => {
    if (!editingUser) return;

    if (!newMeterNumber.trim()) {
      toast.error('Введите номер прибора учёта');
      return;
    }

    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const updatedUsers = users.map((u: any) =>
        u.email === editingUser.email ? { ...u, meterNumber: newMeterNumber.trim() } : u
      );
      localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);

      // Обновляем все показания с старым номером ПУ
      const readingsJSON = localStorage.getItem('snt_meter_readings');
      if (readingsJSON) {
        const allReadings = JSON.parse(readingsJSON);
        const updatedReadings = allReadings.map((r: MeterReading) =>
          r.email === editingUser.email ? { ...r, meterNumber: newMeterNumber.trim() } : r
        );
        localStorage.setItem('snt_meter_readings', JSON.stringify(updatedReadings));
        setReadings(updatedReadings);
      }

      toast.success('Номер прибора учёта изменён');
      setShowEditDialog(false);
      setEditingUser(null);
      setNewMeterNumber('');
    }
  };

  const getUserName = (email: string) => {
    const user = users.find(u => u.email === email);
    return user ? `${user.lastName} ${user.firstName}` : email;
  };

  const uniqueMonths = Array.from(new Set(readings.map(r => r.month)));

  const filteredReadings = readings.filter(reading => {
    const matchesSearch = 
      reading.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserName(reading.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.meterNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMonth = selectedMonth === 'all' || reading.month === selectedMonth;

    return matchesSearch && matchesMonth;
  });

  const exportToExcel = () => {
    const dataToExport = filteredReadings.map(reading => ({
      'Участок': reading.plotNumber,
      'ФИО': getUserName(reading.email),
      'Номер ПУ': reading.meterNumber,
      'Показания (кВт⋅ч)': reading.reading,
      'Дата передачи': reading.date,
      'Месяц': reading.month
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Показания ПУ');

    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 15 },
      { wch: 18 },
      { wch: 15 },
      { wch: 20 }
    ];

    const fileName = selectedMonth === 'all' 
      ? `Показания_ПУ_все_месяцы_${new Date().toLocaleDateString('ru-RU')}.xlsx`
      : `Показания_ПУ_${selectedMonth}_${new Date().toLocaleDateString('ru-RU')}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    toast.success('Excel файл успешно скачан');
  };

  return (
    <section>
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 mb-6"
        >
          <Icon name="ArrowLeft" size={18} />
          Назад
        </Button>
      )}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold">Показания приборов учёта</h2>
        <div className="flex items-center gap-3">
          <Button
            onClick={exportToExcel}
            disabled={filteredReadings.length === 0}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Icon name="Download" size={18} className="mr-2" />
            Скачать Excel
          </Button>
          <Badge className="text-lg px-4 py-2">
            Всего записей: {readings.length}
          </Badge>
        </div>
      </div>

      <div className="mb-6">
        <MeterManagementCard />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Filter" className="text-primary" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Поиск</label>
              <Input
                placeholder="Участок, ФИО, номер ПУ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Месяц</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="all">Все месяцы</option>
                {uniqueMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Участок</TableHead>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Номер ПУ</TableHead>
                  <TableHead>Показания (кВт⋅ч)</TableHead>
                  <TableHead>Дата передачи</TableHead>
                  <TableHead>Месяц</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReadings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Нет данных для отображения
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReadings.map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell className="font-medium">{reading.plotNumber}</TableCell>
                      <TableCell>{getUserName(reading.email)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{reading.meterNumber}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{reading.reading}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{reading.date}</TableCell>
                      <TableCell className="text-sm">{reading.month}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditMeterClick(reading)}
                            title="Редактировать номер ПУ"
                          >
                            <Icon name="Pencil" size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (window.confirm(`Разблокировать номер ПУ для ${getUserName(reading.email)} (уч. №${reading.plotNumber})?\n\nУчастник сможет ввести новый номер при следующей передаче показаний.`)) {
                                handleUnlockMeter(reading.email);
                              }
                            }}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            title="Разблокировать номер ПУ"
                          >
                            <Icon name="Unlock" size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" className="text-blue-600 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Информация:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Показания принимаются с 22 по 25 число каждого месяца</li>
              <li>После первого ввода номер прибора учёта блокируется автоматически</li>
              <li>Для изменения номера ПУ используйте кнопку редактирования или разблокировки</li>
              <li><Icon name="Pencil" size={14} className="inline" /> — изменить номер ПУ немедленно</li>
              <li><Icon name="Unlock" size={14} className="inline" /> — разблокировать для самостоятельного ввода участником</li>
            </ul>
          </div>
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Pencil" className="text-primary" />
              Изменение номера прибора учёта
            </DialogTitle>
            <DialogDescription>
              {editingUser && `${editingUser.name} · Участок №${editingUser.plotNumber}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="meter-number">Номер прибора учёта</Label>
              <Input
                id="meter-number"
                value={newMeterNumber}
                onChange={(e) => setNewMeterNumber(e.target.value)}
                placeholder="Введите новый номер ПУ"
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <Icon name="AlertCircle" size={16} className="inline mr-2" />
              Новый номер ПУ будет применён ко всем записям этого участника
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setEditingUser(null);
                setNewMeterNumber('');
              }}
            >
              Отменить
            </Button>
            <Button
              onClick={handleSaveMeterNumber}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            >
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MeterReadingsManager;