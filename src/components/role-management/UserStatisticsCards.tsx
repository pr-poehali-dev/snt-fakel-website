import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface UserStatisticsCardsProps {
  stats: {
    total: number;
    active: number;
    pending: number;
    members: number;
  };
}

const UserStatisticsCards = ({ stats }: UserStatisticsCardsProps) => {
  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Icon name="Users" className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Всего пользователей</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Активных</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Icon name="Clock" className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Ожидают проверки</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Icon name="User" className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.members}</p>
              <p className="text-sm text-muted-foreground">Членов СНТ</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStatisticsCards;
