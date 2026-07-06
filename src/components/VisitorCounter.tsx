import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const VISITOR_API_URL = 'https://functions.poehali.dev/7df5da0f-03ad-44be-92cc-3123468556ce?type=visitor';

const VisitorCounter = () => {
  const [visitors, setVisitors] = useState({ today: 0, total: 0, registered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionKey = 'snt_visitor_tracked';
    const hasTrackedVisit = sessionStorage.getItem(sessionKey) === 'true';

    const fetchAndTrackVisitors = async () => {
      try {
        if (!hasTrackedVisit) {
          // Новый визит - увеличиваем счётчик
          const response = await fetch(VISITOR_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          setVisitors(data);
          sessionStorage.setItem(sessionKey, 'true');
        } else {
          // Уже был визит - просто получаем данные
          const response = await fetch(VISITOR_API_URL);
          const data = await response.json();
          setVisitors(data);
        }
      } catch (error) {
        console.error('Error tracking visitor:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndTrackVisitors();

    // Обновляем данные каждую минуту
    const interval = setInterval(async () => {
      try {
        const response = await fetch(VISITOR_API_URL);
        const data = await response.json();
        setVisitors(data);
      } catch (error) {
        console.error('Error updating visitor stats:', error);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Icon name="Users" size={16} />
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Icon name="Users" size={16} />
        <span>Сегодня: <span className="font-semibold text-foreground">{visitors.today}</span></span>
      </div>
      <div className="flex items-center gap-2">
        <Icon name="TrendingUp" size={16} />
        <span>Всего: <span className="font-semibold text-foreground">{visitors.total}</span></span>
      </div>
      <div className="flex items-center gap-2">
        <Icon name="UserCheck" size={16} />
        <span>Участников: <span className="font-semibold text-foreground">{visitors.registered}</span></span>
      </div>
    </div>
  );
};

export default VisitorCounter;