import { useEffect, useState } from 'react';
import './ChristmasTree.css';

interface ChristmasTreeProps {
  side: 'left' | 'right';
}

const ChristmasTree = ({ side }: ChristmasTreeProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkDecor = () => {
      const saved = localStorage.getItem('snt_holiday_decors');
      if (!saved) {
        setIsVisible(false);
        return;
      }

      try {
        const decors = JSON.parse(saved);
        const now = new Date();
        
        const active = decors.find((decor: any) => {
          if (!decor.isActive) return false;
          const start = new Date(decor.startDate);
          const end = new Date(decor.endDate);
          end.setHours(23, 59, 59);
          return now >= start && now <= end && decor.emoji === '🎄';
        });
        
        setIsVisible(!!active);
      } catch (e) {
        console.error('Error loading decor:', e);
      }
    };

    checkDecor();
    window.addEventListener('decor-updated', checkDecor);
    
    return () => window.removeEventListener('decor-updated', checkDecor);
  }, []);

  if (!isVisible) return null;

  const lights = [
    { top: '15%', color: 'red' },
    { top: '25%', color: 'blue' },
    { top: '20%', color: 'yellow' },
    { top: '35%', color: 'green' },
    { top: '30%', color: 'pink' },
    { top: '45%', color: 'purple' },
    { top: '40%', color: 'orange' },
    { top: '55%', color: 'cyan' },
    { top: '50%', color: 'red' },
    { top: '65%', color: 'blue' },
    { top: '60%', color: 'yellow' },
    { top: '75%', color: 'green' },
    { top: '70%', color: 'pink' },
    { top: '85%', color: 'purple' },
    { top: '80%', color: 'orange' },
  ];

  return (
    <div className={`christmas-tree ${side}`}>
      <div className="tree-container">
        <div className="star">⭐</div>
        
        <div className="tree-layer tree-layer-1"></div>
        <div className="tree-layer tree-layer-2"></div>
        <div className="tree-layer tree-layer-3"></div>
        <div className="tree-layer tree-layer-4"></div>
        <div className="tree-layer tree-layer-5"></div>
        
        <div className="tree-trunk"></div>
        
        {lights.map((light, index) => (
          <div
            key={index}
            className={`tree-light light-${light.color}`}
            style={{
              top: light.top,
              left: side === 'left' ? `${40 + Math.random() * 20}%` : `${40 + Math.random() * 20}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ChristmasTree;
