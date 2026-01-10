import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface PlotMeterData {
  plotNumber: string;
  meterNumber: string;
  users: Array<{
    email: string;
    fullName: string;
  }>;
  lastReading?: {
    value: number;
    date: string;
    submittedBy: string;
  };
}

interface MeterReading {
  id: string;
  email: string;
  plotNumber: string;
  meterNumber: string;
  reading: number;
  date: string;
  month: string;
}

const MeterManagementCard = () => {
  const [plotsData, setPlotsData] = useState<PlotMeterData[]>([]);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);

  useEffect(() => {
    loadPlotsData();

    const handleUpdate = () => {
      loadPlotsData();
    };

    window.addEventListener('meter-readings-updated', handleUpdate);
    return () => window.removeEventListener('meter-readings-updated', handleUpdate);
  }, []);

  const loadPlotsData = () => {
    const usersJSON = localStorage.getItem('snt_users');
    if (!usersJSON) return;

    const users = JSON.parse(usersJSON);
    const readingsJSON = localStorage.getItem('snt_meter_readings');
    const readings: MeterReading[] = readingsJSON ? JSON.parse(readingsJSON) : [];

    const plotsMap = new Map<string, PlotMeterData>();

    users.forEach((user: any) => {
      const plotNumber = user.plotNumber;
      if (!plotNumber) return;

      const fullName = `${user.lastName || ''} ${user.firstName || ''} ${user.middleName || ''}`.trim();

      if (plotsMap.has(plotNumber)) {
        const plotData = plotsMap.get(plotNumber)!;
        plotData.users.push({
          email: user.email,
          fullName: fullName || user.email
        });
        
        if (user.meterNumber && !plotData.meterNumber) {
          plotData.meterNumber = user.meterNumber;
        }
      } else {
        plotsMap.set(plotNumber, {
          plotNumber,
          meterNumber: user.meterNumber || '',
          users: [{
            email: user.email,
            fullName: fullName || user.email
          }]
        });
      }
    });

    // Добавляем информацию о последних показаниях
    plotsMap.forEach((plotData) => {
      const plotReadings = readings
        .filter((r) => r.plotNumber === plotData.plotNumber)
        .sort((a, b) => new Date(b.date.split('.').reverse().join('-')).getTime() - new Date(a.date.split('.').reverse().join('-')).getTime());

      if (plotReadings.length > 0) {
        const lastReading = plotReadings[0];
        const submitter = users.find((u: any) => u.email === lastReading.email);
        const submitterName = submitter 
          ? `${submitter.lastName} ${submitter.firstName}`.trim() 
          : 'Неизвестно';

        plotData.lastReading = {
          value: lastReading.reading,
          date: lastReading.date,
          submittedBy: submitterName
        };
      }
    });

    const sortedPlots = Array.from(plotsMap.values()).sort((a, b) => 
      parseInt(a.plotNumber) - parseInt(b.plotNumber)
    );

    setPlotsData(sortedPlots);
  };

  const handleUnlockClick = (plotNumber: string) => {
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
    loadPlotsData();
    setShowUnlockDialog(false);
    setSelectedPlot(null);
    toast.success(`Номер ПУ для участка №${selectedPlot} разблокирован`);
    
    window.dispatchEvent(new Event('meter-readings-updated'));
  };

  return (
    <>
      <Card>
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
              <TabsTrigger value="readings" className="flex items-center gap-2">
                <Icon name="BarChart3" size={16} />
                Показания
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
                                onClick={() => handleUnlockClick(plot.plotNumber)}
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

            <TabsContent value="readings" className="mt-4">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Участок</TableHead>
                      <TableHead>Номер ПУ</TableHead>
                      <TableHead>Показания</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Подал</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plotsData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          <Icon name="Search" className="mx-auto mb-2" size={32} />
                          <p>Нет данных о показаниях</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      plotsData.map((plot) => (
                        <TableRow key={plot.plotNumber}>
                          <TableCell className="font-medium">№{plot.plotNumber}</TableCell>
                          <TableCell>
                            {plot.meterNumber ? (
                              <span className="font-mono text-sm">{plot.meterNumber}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {plot.lastReading ? (
                              <div className="flex items-center gap-2">
                                <Icon name="Zap" size={16} className="text-primary" />
                                <span className="font-semibold">{plot.lastReading.value} кВт·ч</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Не переданы</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {plot.lastReading ? (
                              <span className="text-sm">{plot.lastReading.date}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {plot.lastReading ? (
                              <span className="text-sm">{plot.lastReading.submittedBy}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon name="TrendingUp" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Информация о показаниях:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Отображаются последние переданные показания по каждому участку</li>
                      <li>Показания принимаются с 22 по 25 число каждого месяца</li>
                      <li>Один участок = одни показания в месяц от любого пользователя участка</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
    </>
  );
};

export default MeterManagementCard;
