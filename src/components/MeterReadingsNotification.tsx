import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface MeterReadingsNotificationProps {
  onNavigateToProfile: () => void;
}

const MeterReadingsNotification = ({ onNavigateToProfile }: MeterReadingsNotificationProps) => {
  const [showNotification, setShowNotification] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const checkReadingsPeriod = () => {
      const today = new Date();
      const currentDay = today.getDate();
      
      if (currentDay >= 20 && currentDay <= 25) {
        setShowNotification(true);
        const daysRemaining = 25 - currentDay;
        setDaysLeft(daysRemaining);
      } else {
        setShowNotification(false);
      }
    };

    checkReadingsPeriod();
    
    const interval = setInterval(checkReadingsPeriod, 6 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!showNotification) {
    return null;
  }

  const today = new Date().getDate();
  const isLastDay = today === 25;
  const isFirstDay = today >= 20 && today <= 21;

  return (
    <Card className={`border-2 ${isLastDay ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'} mb-6 animate-pulse`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 ${isLastDay ? 'bg-red-500' : 'bg-orange-500'} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon name="Gauge" className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold mb-2 ${isLastDay ? 'text-red-900' : 'text-orange-900'}`}>
              {isLastDay ? '⚠️ Последний день!' : isFirstDay ? '📢 Напоминание' : '⏰ Не забудьте'}
            </h3>
            <p className={`mb-4 ${isLastDay ? 'text-red-800' : 'text-orange-800'}`}>
              {isLastDay 
                ? 'Сегодня последний день для передачи показаний приборов учёта электроэнергии! Поторопитесь!'
                : daysLeft === 0
                  ? 'Сегодня последний день приёма показаний приборов учёта электроэнергии.'
                  : `Идёт приём показаний приборов учёта электроэнергии. Осталось ${daysLeft} ${daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}.`
              }
            </p>
            <div className="flex gap-2">
              <Button
                onClick={onNavigateToProfile}
                className={`${isLastDay ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
              >
                <Icon name="Send" size={18} className="mr-2" />
                Передать показания
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowNotification(false)}
                className={isLastDay ? 'text-red-600 hover:text-red-700' : 'text-orange-600 hover:text-orange-700'}
              >
                Напомнить позже
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeterReadingsNotification;
