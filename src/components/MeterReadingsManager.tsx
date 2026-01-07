import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

const MeterReadingsManager = () => {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

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

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold">Показания приборов учёта</h2>
        <Badge className="text-lg px-4 py-2">
          Всего записей: {readings.length}
        </Badge>
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnlockMeter(reading.email)}
                          title="Разблокировать номер ПУ"
                        >
                          <Icon name="Unlock" size={16} />
                        </Button>
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
              <li>Для изменения номера ПУ используйте кнопку разблокировки</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeterReadingsManager;
