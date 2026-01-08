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

  const lights = Array.from({ length: 20 }, (_, i) => {
    const progress = i / 20;
    const spiralTurns = 4;
    const angle = progress * spiralTurns * 360;
    const radius = 35 + progress * 5;
    const topPos = 12 + progress * 68;
    
    const colors = ['red', 'blue', 'yellow', 'green', 'pink', 'purple', 'orange', 'cyan'];
    
    return {
      top: `${topPos}%`,
      left: `${50 + Math.cos(angle * Math.PI / 180) * radius}%`,
      color: colors[i % colors.length]
    };
  });

  const snowflakes = Array.from({ length: 8 }, (_, i) => ({
    left: `${10 + i * 10}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${3 + Math.random() * 2}s`
  }));

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
        <div className="tree-snow"></div>
        
        {lights.map((light, index) => (
          <div
            key={index}
            className={`tree-light light-${light.color}`}
            style={{
              top: light.top,
              left: light.left,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
        
        {snowflakes.map((flake, index) => (
          <div
            key={`snow-${index}`}
            className="snowflake-falling"
            style={{
              left: flake.left,
              animationDelay: flake.delay,
              animationDuration: flake.duration
            }}
          >
            ❄️
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChristmasTree;