import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import MeterReadingsForm from './meter/MeterReadingsForm';
import MeterReadingsDialogs from './meter/MeterReadingsDialogs';
import MeterReadingsHistory from './meter/MeterReadingsHistory';

interface MeterReadingsCardProps {
  currentUserEmail: string;
  userRole?: string;
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

const MeterReadingsCard = ({ currentUserEmail, userRole }: MeterReadingsCardProps) => {
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
  const [meterNumberConfirmed, setMeterNumberConfirmed] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  useEffect(() => {
    loadUserData();

    const handleUpdate = () => {
      loadUserData();
    };

    window.addEventListener('meter-readings-updated', handleUpdate);
    return () => window.removeEventListener('meter-readings-updated', handleUpdate);
  }, [currentUserEmail]);

  const loadUserData = () => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const user = users.find((u: any) => u.email === currentUserEmail);
      if (user) {
        const userPlot = user.plotNumber || '';
        setPlotNumber(userPlot);
        
        // Синхронизация номера ПУ с другими пользователями участка
        if (userPlot) {
          const plotUser = users.find((u: any) => u.plotNumber === userPlot && u.meterNumber);
          if (plotUser && plotUser.meterNumber) {
            setMeterNumber(plotUser.meterNumber);
            setIsMeterLocked(true);
            setMeterNumberConfirmed(true);
          } else if (user.meterNumber) {
            setMeterNumber(user.meterNumber);
            setIsMeterLocked(true);
            setMeterNumberConfirmed(true);
          }
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
  };

  const handleMeterNumberChange = (newValue: string) => {
    if (isMeterLocked) return;
    
    setMeterNumber(newValue);
    setMeterNumberConfirmed(false);
  };

  const handleSubmitClick = () => {
    if (!meterNumber.trim()) {
      toast.error('Введите номер прибора учёта');
      return;
    }

    if (!isMeterLocked && !meterNumberConfirmed) {
      toast.error('Подтвердите правильность номера прибора учёта');
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

    if (!isMeterLocked) {
      setTempMeterNumber(meterNumber);
      setShowMeterConfirmDialog(true);
    } else {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmMeterNumber = () => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const user = users.find((u: any) => u.email === currentUserEmail);
      const userPlot = user?.plotNumber;
      
      if (!userPlot) {
        toast.error('Не указан номер участка');
        setShowMeterConfirmDialog(false);
        return;
      }
      
      // Синхронизация номера ПУ для всех пользователей участка
      const updatedUsers = users.map((u: any) =>
        u.plotNumber === userPlot ? { ...u, meterNumber: meterNumber.trim() } : u
      );
      localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
      setIsMeterLocked(true);
      setMeterNumberConfirmed(true);
      toast.success('Номер прибора учёта сохранён для всех пользователей участка');
      
      // Отправляем событие для обновления таблицы управления
      window.dispatchEvent(new Event('meter-readings-updated'));
    }
    
    setShowMeterConfirmDialog(false);
    setShowConfirmDialog(true);
  };

  const handleUnlockMeterNumber = () => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const updatedUsers = users.map((u: any) =>
        u.email === currentUserEmail ? { ...u, meterNumber: '' } : u
      );
      localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
      setIsMeterLocked(false);
      setMeterNumber('');
      setMeterNumberConfirmed(false);
    }
    setShowUnlockDialog(false);
    toast.success('Номер прибора учёта разблокирован');
  };

  const handleConfirmSubmit = () => {
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
          <MeterReadingsForm
            canSubmit={canSubmit}
            meterNumber={meterNumber}
            handleMeterNumberChange={handleMeterNumberChange}
            isMeterLocked={isMeterLocked}
            userRole={userRole}
            setShowUnlockDialog={setShowUnlockDialog}
            meterNumberConfirmed={meterNumberConfirmed}
            setMeterNumberConfirmed={setMeterNumberConfirmed}
            reading={reading}
            setReading={setReading}
            confirmed={confirmed}
            setConfirmed={setConfirmed}
            handleSubmitClick={handleSubmitClick}
          />
        )}

        <MeterReadingsDialogs
          showMeterConfirmDialog={showMeterConfirmDialog}
          setShowMeterConfirmDialog={setShowMeterConfirmDialog}
          showConfirmDialog={showConfirmDialog}
          setShowConfirmDialog={setShowConfirmDialog}
          showUnlockDialog={showUnlockDialog}
          setShowUnlockDialog={setShowUnlockDialog}
          plotNumber={plotNumber}
          tempMeterNumber={tempMeterNumber}
          meterNumber={meterNumber}
          reading={reading}
          handleConfirmMeterNumber={handleConfirmMeterNumber}
          handleConfirmSubmit={handleConfirmSubmit}
          handleUnlockMeterNumber={handleUnlockMeterNumber}
        />

        <MeterReadingsHistory readingsHistory={readingsHistory} />
      </CardContent>
    </Card>
  );
};

export default MeterReadingsCard;