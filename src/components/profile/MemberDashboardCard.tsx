import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface MemberDashboardCardProps {
  plotNumber: string;
  onNavigate?: (section: string) => void;
}

const MemberDashboardCard = ({ plotNumber, onNavigate }: MemberDashboardCardProps) => {
  return (
    <>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Информация об участке</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Номер участка</p>
              <p className="text-lg font-semibold">№ {plotNumber || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Площадь</p>
              <p className="text-lg font-semibold">6 соток</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Членский взнос</p>
              <Badge className="bg-green-500">Оплачен</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Статус</p>
              <Badge>Активный член</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Действия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Icon name="CreditCard" size={18} className="mr-2" />
            Оплатить взнос
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Icon name="History" size={18} className="mr-2" />
            История платежей
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('board-appeal')}
          >
            <Icon name="MessageSquare" size={18} className="mr-2" />
            Обращение в правление
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Icon name="Download" size={18} className="mr-2" />
            Скачать документы
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default MemberDashboardCard;