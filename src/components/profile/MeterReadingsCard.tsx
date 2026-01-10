import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface MeterReadingsCardProps {
  currentUserEmail: string;
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

const MeterReadingsCard = ({ currentUserEmail }: MeterReadingsCardProps) => {
  const [meterNumber, setMeterNumber] = useState('');
  const [reading, setReading] = useState('');
  const [isMeterLocked, setIsMeterLocked] = useState(false);
  const [plotNumber, setPlotNumber] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedBy, setSubmittedBy] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submittedReading, setSubmittedReading] = useState<number | null>(null);
  const [submittedDate, setSubmittedDate] = useState('');
  const [readingsHistory, setReadingsHistory] = useState<MeterReading[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showMeterConfirmDialog, setShowMeterConfirmDialog] = useState(false);
  const [tempMeterNumber, setTempMeterNumber] = useState('');

  useEffect(() => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const user = users.find((u: any) => u.email === currentUserEmail);
      if (user) {
        const userPlot = user.plotNumber || '';
        setPlotNumber(userPlot);
        if (user.meterNumber) {
          setMeterNumber(user.meterNumber);
          setIsMeterLocked(true);
        }

        const readingsJSON = localStorage.getItem('snt_meter_readings');
        if (readingsJSON && userPlot) {
          const readings: MeterReading[] = JSON.parse(readingsJSON);
          const now = new Date();
          const currentMonth = now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
          
          const plotReadings = readings.filter((r) => r.plotNumber === userPlot);
          plotReadings.sort((a, b) => new Date(b.date.split('.').reverse().join('-')).getTime() - new Date(a.date.split('.').reverse().join('-')).getTime());
          setReadingsHistory(plotReadings);
          
          const plotReading = plotReadings.find((r) => r.month === currentMonth);
          
          if (plotReading) {
            setAlreadySubmitted(true);
            setSubmittedReading(plotReading.reading);
            setSubmittedDate(plotReading.date);
            const submitter = users.find((u: any) => u.email === plotReading.email);
            if (submitter) {
              setSubmittedBy(`${submitter.firstName} ${submitter.lastName}`);
            }
          }
        }
      }
    }

    const today = new Date().getDate();
    setCanSubmit(today >= 22 && today <= 25);
  }, [currentUserEmail]);

  const handleMeterNumberChange = (newValue: string) => {
    if (isMeterLocked) return;
    
    setMeterNumber(newValue);
  };

  const handleSubmitClick = () => {
    if (!meterNumber.trim()) {
      toast.error('Введите номер прибора учёта');
      return;
    }

    if (!reading.trim() || isNaN(Number(reading))) {
      toast.error('Введите корректные показания');
      return;
    }

    if (!confirmed) {
      toast.error('Подтвердите правильность показаний');
      return;
    }

    if (!canSubmit) {
      toast.error('Показания принимаются только с 22 по 25 число месяца');
      return;
    }

    if (alreadySubmitted) {
      toast.error(`Показания по участку №${plotNumber} уже переданы в этом месяце`);
      return;
    }

    // Если номер ПУ не был заблокирован (первый ввод или после разблокировки),
    // сначала показываем подтверждение номера ПУ
    if (!isMeterLocked) {
      setTempMeterNumber(meterNumber);
      setShowMeterConfirmDialog(true);
    } else {
      // Если номер ПУ уже заблокирован, сразу показываем диалог с показаниями
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmMeterNumber = () => {
    setShowMeterConfirmDialog(false);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {

    if (!isMeterLocked) {
      const usersJSON = localStorage.getItem('snt_users');
      if (usersJSON) {
        const users = JSON.parse(usersJSON);
        const updatedUsers = users.map((u: any) =>
          u.email === currentUserEmail ? { ...u, meterNumber: meterNumber.trim() } : u
        );
        localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
        setIsMeterLocked(true);
      }
    }

    const readingsJSON = localStorage.getItem('snt_meter_readings');
    const readings: MeterReading[] = readingsJSON ? JSON.parse(readingsJSON) : [];

    const now = new Date();
    const monthYear = now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

    const newReading: MeterReading = {
      id: Date.now().toString(),
      email: currentUserEmail,
      plotNumber,
      meterNumber: meterNumber.trim(),
      reading: Number(reading),
      date: now.toLocaleDateString('ru-RU'),
      month: monthYear
    };

    readings.push(newReading);
    localStorage.setItem('snt_meter_readings', JSON.stringify(readings));

    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const user = users.find((u: any) => u.email === currentUserEmail);
      if (user) {
        setSubmittedBy(`${user.firstName} ${user.lastName}`);
        setAlreadySubmitted(true);
        setSubmittedReading(Number(reading));
        setSubmittedDate(new Date().toLocaleDateString('ru-RU'));
      }
    }

    toast.success('Показания успешно переданы');
    setReading('');
    setConfirmed(false);

    window.dispatchEvent(new Event('meter-readings-updated'));
    setShowConfirmDialog(false);
  };

  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Gauge" className="text-primary" />
          Показания прибора учёта электроэнергии
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alreadySubmitted && (
          <div className="bg-green-50 border-green-200 border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="CheckCircle" size={24} className="text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">
                  Показания по участку №{plotNumber} уже переданы
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Показания передал: <span className="font-medium">{submittedBy}</span>
                  {submittedDate && <span className="ml-2">• {submittedDate}</span>}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  В текущем месяце можно передать показания только один раз на участок
                </p>
              </div>
            </div>
          </div>
        )}

        {!alreadySubmitted && (
          <>
            <div className={`${canSubmit ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'} border rounded-lg p-3 text-sm`}>
              <Icon name="Info" size={16} className="inline mr-2" />
              {canSubmit 
                ? `Сегодня ${new Date().getDate()} число — период приёма показаний открыт!` 
                : 'Показания принимаются с 22 по 25 число каждого месяца'
              }
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Номер прибора учёта</Label>
                <div className="flex gap-2">
                  <Input
                    value={meterNumber}
                    onChange={(e) => handleMeterNumberChange(e.target.value)}
                    disabled={isMeterLocked}
                    placeholder="Введите номер ПУ"
                  />
                  {isMeterLocked && (
                    <div className="flex items-center">
                      <Icon name="Lock" className="text-muted-foreground" size={20} />
                    </div>
                  )}
                </div>
                {isMeterLocked && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Для изменения номера обратитесь к администратору
                  </p>
                )}
              </div>

              <div>
                <Label>Текущие показания (кВт⋅ч)</Label>
                <Input
                  type="number"
                  value={reading}
                  onChange={(e) => setReading(e.target.value)}
                  placeholder="Введите показания"
                  disabled={!canSubmit}
                />
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Checkbox
                id="confirm-readings"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                disabled={!canSubmit}
              />
              <div className="flex-1">
                <label
                  htmlFor="confirm-readings"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Подтверждаю правильность переданных показаний
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Убедитесь, что показания введены корректно. После отправки изменить их будет невозможно.
                </p>
              </div>
            </div>

            <Button
              onClick={handleSubmitClick}
              disabled={!canSubmit || !meterNumber.trim() || !reading.trim() || !confirmed}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            >
              <Icon name="Send" size={18} className="mr-2" />
              Передать показания
            </Button>

            <Dialog open={showMeterConfirmDialog} onOpenChange={setShowMeterConfirmDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icon name="Gauge" className="text-blue-500" />
                    Подтверждение номера прибора учёта
                  </DialogTitle>
                  <DialogDescription>
                    Проверьте правильность введённого номера ПУ
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Участок:</span>
                      <span className="font-semibold">№{plotNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Номер прибора учёта:</span>
                      <span className="font-semibold text-lg">{tempMeterNumber}</span>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex gap-2">
                      <Icon name="AlertCircle" size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Внимание!</p>
                        <p>После подтверждения номер ПУ будет сохранён и заблокирован. Изменить его можно будет только через администратора или председателя.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowMeterConfirmDialog(false)}
                  >
                    Изменить номер
                  </Button>
                  <Button
                    onClick={handleConfirmMeterNumber}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Icon name="Check" size={18} className="mr-2" />
                    Подтвердить номер ПУ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icon name="AlertCircle" className="text-orange-500" />
                    Подтверждение данных
                  </DialogTitle>
                  <DialogDescription>
                    Пожалуйста, проверьте правильность введённых данных перед отправкой
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Участок:</span>
                      <span className="font-semibold">№{plotNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Номер ПУ:</span>
                      <span className="font-semibold">{meterNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Показания:</span>
                      <span className="font-semibold text-lg">{reading} кВт⋅ч</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <Icon name="Info" size={16} className="inline mr-2" />
                    После отправки данные нельзя будет изменить в текущем месяце
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Отменить
                  </Button>
                  <Button
                    onClick={handleConfirmSubmit}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  >
                    <Icon name="Check" size={18} className="mr-2" />
                    Подтвердить отправку
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {!canSubmit && (
              <p className="text-sm text-center text-muted-foreground">
                Передача показаний будет доступна с 22 по 25 число месяца
              </p>
            )}
          </>
        )}

        {readingsHistory.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="History" size={18} />
              История показаний
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {readingsHistory.map((record, index) => (
                <div
                  key={record.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === 0
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {record.month}
                      {index === 0 && (
                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                          Текущий
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {record.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-700">
                      {record.reading} <span className="text-sm font-normal">кВт⋅ч</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeterReadingsCard;