import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  useEffect(() => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const user = users.find((u: any) => u.email === currentUserEmail);
      if (user) {
        setPlotNumber(user.plotNumber || '');
        if (user.meterNumber) {
          setMeterNumber(user.meterNumber);
          setIsMeterLocked(true);
        }
      }
    }

    const today = new Date().getDate();
    setCanSubmit(today >= 22 && today <= 25);
  }, [currentUserEmail]);

  const handleSubmit = () => {
    if (!meterNumber.trim()) {
      toast.error('Введите номер прибора учёта');
      return;
    }

    if (!reading.trim() || isNaN(Number(reading))) {
      toast.error('Введите корректные показания');
      return;
    }

    if (!canSubmit) {
      toast.error('Показания принимаются только с 22 по 25 число месяца');
      return;
    }

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

    toast.success('Показания успешно переданы');
    setReading('');

    window.dispatchEvent(new Event('meter-readings-updated'));
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
                onChange={(e) => setMeterNumber(e.target.value)}
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

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || !meterNumber.trim() || !reading.trim()}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
        >
          <Icon name="Send" size={18} className="mr-2" />
          Передать показания
        </Button>

        {!canSubmit && (
          <p className="text-sm text-center text-muted-foreground">
            Передача показаний будет доступна с 22 по 25 число месяца
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MeterReadingsCard;