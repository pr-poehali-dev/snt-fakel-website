import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

const BackButton = ({ onClick, label = 'На главную' }: BackButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="lg"
      className="mb-6 border-2 hover:shadow-lg transition-all duration-300 hover:-translate-x-1 group"
    >
      <Icon 
        name="ArrowLeft" 
        size={20} 
        className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" 
      />
      {label}
    </Button>
  );
};

export default BackButton;
