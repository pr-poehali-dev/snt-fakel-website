import { useEffect, useState } from 'react';
import './HolidayDecor.css';

interface DecorElement {
  id: number;
  name: string;
  emoji: string;
  cssClass: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const HolidayDecor = () => {
  const [activeDecor, setActiveDecor] = useState<DecorElement | null>(null);

  useEffect(() => {
    const loadActiveDecor = () => {
      const saved = localStorage.getItem('snt_holiday_decors');
      if (!saved) return;

      try {
        const decors: DecorElement[] = JSON.parse(saved);
        const now = new Date();
        
        const active = decors.find(decor => {
          if (!decor.isActive) return false;
          
          const start = new Date(decor.startDate);
          const end = new Date(decor.endDate);
          end.setHours(23, 59, 59);
          
          return now >= start && now <= end;
        });
        
        setActiveDecor(active || null);
      } catch (e) {
        console.error('Error loading decor:', e);
      }
    };

    loadActiveDecor();

    const handleUpdate = () => loadActiveDecor();
    window.addEventListener('decor-updated', handleUpdate);
    
    return () => window.removeEventListener('decor-updated', handleUpdate);
  }, []);

  if (!activeDecor) return null;

  const decorClass = activeDecor.cssClass || 'falling-emoji';

  return (
    <div className="holiday-decor-container">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className={decorClass}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
            fontSize: `${20 + Math.random() * 20}px`
          }}
        >
          {activeDecor.emoji}
        </div>
      ))}
    </div>
  );
};

export default HolidayDecor;
