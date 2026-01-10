import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);
  const [plotsData, setPlotsData] = useState<Array<{
    plotNumber: string;
    meterNumber: string;
    users: Array<{ email: string; fullName: string }>;
    lastReading?: { value: number; date: string; submittedBy: string };
  }>>([]);

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
      const usersArr = JSON.parse(usersJSON);
      setUsers(usersArr);
      
      // Загружаем данные для управления ПУ
      const plotsMap = new Map<string, any>();
      usersArr.forEach((user: any) => {
        const plotNumber = user.plotNumber;
        if (!plotNumber) return;

        const fullName = `${user.lastName || ''} ${user.firstName || ''} ${user.middleName || ''}`.trim();

        if (plotsMap.has(plotNumber)) {
          const plotData = plotsMap.get(plotNumber)!;
          plotData.users.push({ email: user.email, fullName: fullName || user.email });
          if (user.meterNumber && !plotData.meterNumber) {
            plotData.meterNumber = user.meterNumber;
          }
        } else {
          plotsMap.set(plotNumber, {
            plotNumber,
            meterNumber: user.meterNumber || '',
            users: [{ email: user.email, fullName: fullName || user.email }]
          });
        }
      });

      // Добавляем последние показания
      if (readingsJSON) {
        const allReadings = JSON.parse(readingsJSON);
        plotsMap.forEach((plotData) => {
          const plotReadings = allReadings
            .filter((r: MeterReading) => r.plotNumber === plotData.plotNumber)
            .sort((a: MeterReading, b: MeterReading) => 
              new Date(b.date.split('.').reverse().join('-')).getTime() - 
              new Date(a.date.split('.').reverse().join('-')).getTime()
            );

          if (plotReadings.length > 0) {
            const lastReading = plotReadings[0];
            const submitter = usersArr.find((u: any) => u.email === lastReading.email);
            const submitterName = submitter ? `${submitter.lastName} ${submitter.firstName}`.trim() : 'Неизвестно';
            plotData.lastReading = {
              value: lastReading.reading,
              date: lastReading.date,
              submittedBy: submitterName
            };
          }
        });
      }

      const sortedPlots = Array.from(plotsMap.values()).sort((a, b) => 
        parseInt(a.plotNumber) - parseInt(b.plotNumber)
      );
      setPlotsData(sortedPlots);
    }
  };

  const handleUnlockPlot = (plotNumber: string) => {
    setSelectedPlot(plotNumber);
    setShowUnlockDialog(true);
  };

  const handleConfirmUnlock = () => {
    if (!selectedPlot) return;

    const usersJSON = localStorage.getItem('snt_users');
    if (!usersJSON) return;

    const users = JSON.parse(usersJSON);
    const updatedUsers = users.map((u: any) =>
      u.plotNumber === selectedPlot ? { ...u, meterNumber: '' } : u
    );

    localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
    loadData();
    setShowUnlockDialog(false);
    setSelectedPlot(null);
    toast.success(`Номер ПУ для участка №${selectedPlot} разблокирован`);
    
    window.dispatchEvent(new Event('meter-readings-updated'));
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Gauge" className="text-primary" />
            Управление приборами учёта
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="meters" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="meters" className="flex items-center gap-2">
                <Icon name="Lock" size={16} />
                Приборы учёта
              </TabsTrigger>
              <TabsTrigger value="filters" className="flex items-center gap-2">
                <Icon name="Filter" size={16} />
                Фильтры показаний
              </TabsTrigger>
            </TabsList>

            <TabsContent value="meters" className="mt-4">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Участок</TableHead>
                      <TableHead>Номер ПУ</TableHead>
                      <TableHead>Пользователи</TableHead>
                      <TableHead className="w-[120px] text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plotsData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          <Icon name="Search" className="mx-auto mb-2" size={32} />
                          <p>Нет данных о приборах учёта</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      plotsData.map((plot) => (
                        <TableRow key={plot.plotNumber}>
                          <TableCell className="font-medium">№{plot.plotNumber}</TableCell>
                          <TableCell>
                            {plot.meterNumber ? (
                              <div className="flex items-center gap-2">
                                <Icon name="Lock" size={16} className="text-muted-foreground" />
                                <span className="font-mono">{plot.meterNumber}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Не указан</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {plot.users.map((user, idx) => (
                                <div key={idx} className="text-sm">
                                  {user.fullName}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {plot.meterNumber ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnlockPlot(plot.plotNumber)}
                                className="border-orange-300 text-orange-700 hover:bg-orange-50"
                              >
                                <Icon name="Unlock" size={16} className="mr-1" />
                                Разблокировать
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Важная информация:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Номер ПУ автоматически синхронизируется между всеми пользователями участка</li>
                      <li>После разблокировки пользователь сможет изменить номер ПУ</li>
                      <li>Новый номер ПУ будет доступен всем пользователям участка</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filters" className="mt-4">
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
            </TabsContent>
          </Tabs>
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
                            onClick={() => handleUnlockPlot(reading.plotNumber)}
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

      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" className="text-orange-500" />
              Подтверждение разблокировки
            </DialogTitle>
            <DialogDescription>
              Вы действительно хотите разблокировать номер прибора учёта для участка №{selectedPlot}?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
            <p className="text-sm text-amber-900">
              После разблокировки пользователи участка смогут изменить номер прибора учёта.
              Убедитесь, что это необходимо.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnlockDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleConfirmUnlock}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Icon name="Unlock" size={16} className="mr-2" />
              Разблокировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MeterReadingsManager;