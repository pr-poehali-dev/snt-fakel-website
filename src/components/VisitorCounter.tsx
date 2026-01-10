import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const VisitorCounter = () => {
  const [visitors, setVisitors] = useState({ today: 0, total: 0 });

  useEffect(() => {
    const counterData = localStorage.getItem('snt_visitor_counter');
    const today = new Date().toDateString();
    const sessionKey = 'snt_visitor_session';
    const hasVisitedToday = sessionStorage.getItem(sessionKey) === today;
    
    if (counterData) {
      const data = JSON.parse(counterData);
      
      if (data.lastVisit === today) {
        if (!hasVisitedToday) {
          const newData = {
            today: data.today + 1,
            total: data.total + 1,
            lastVisit: today
          };
          localStorage.setItem('snt_visitor_counter', JSON.stringify(newData));
          sessionStorage.setItem(sessionKey, today);
          setVisitors({ today: newData.today, total: newData.total });
        } else {
          setVisitors({ today: data.today, total: data.total });
        }
      } else {
        const newData = {
          today: 1,
          total: data.total + 1,
          lastVisit: today
        };
        localStorage.setItem('snt_visitor_counter', JSON.stringify(newData));
        sessionStorage.setItem(sessionKey, today);
        setVisitors({ today: newData.today, total: newData.total });
      }
    } else {
      const newData = {
        today: 1,
        total: 1,
        lastVisit: today
      };
      localStorage.setItem('snt_visitor_counter', JSON.stringify(newData));
      sessionStorage.setItem(sessionKey, today);
      setVisitors({ today: 1, total: 1 });
    }
  }, []);

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
    </div>
  );
};

export default VisitorCounter;