import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type UserRole = 'admin' | 'chairman' | 'board_member';

interface AdminDashboardCardProps {
  userRole: UserRole;
  onNavigate?: (section: string) => void;
}

const AdminDashboardCard = ({ userRole, onNavigate }: AdminDashboardCardProps) => {
  return (
    <>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name={userRole === 'admin' ? 'Shield' : userRole === 'chairman' ? 'Crown' : 'Users'} className="text-primary" />
            {userRole === 'admin' ? 'Панель администратора' : userRole === 'chairman' ? 'Панель председателя' : 'Панель члена правления'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Всего участников</p>
              <p className="text-2xl font-bold" id="total-members-count">-</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Активных голосований</p>
              <p className="text-2xl font-bold">2</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Новостей</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Документов</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Управление</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('members-list')}
          >
            <Icon name="Users" size={18} className="mr-2" />
            Список участников
            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full" id="members-badge">-</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start border-primary text-primary hover:bg-primary/5"
            onClick={() => onNavigate?.('mass-notification')}
          >
            <Icon name="Mail" size={18} className="mr-2" />
            Массовая рассылка
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Icon name="Vote" size={18} className="mr-2" />
            Создать голосование
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Icon name="FileText" size={18} className="mr-2" />
            Управление документами
          </Button>
          {userRole === 'admin' && (
            <>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate?.('site-settings')}
              >
                <Icon name="Settings" size={18} className="mr-2" />
                Настройки сайта
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-orange-500 text-orange-600 hover:bg-orange-50"
                onClick={() => onNavigate?.('role-management')}
              >
                <Icon name="UserCog" size={18} className="mr-2" />
                Управление ролями
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AdminDashboardCard;