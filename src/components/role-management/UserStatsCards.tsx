import { Card, CardContent } from '@/components/ui/card';

interface UserStatsCardsProps {
  stats: {
    total: number;
    active: number;
    pending: number;
    admins: number;
  };
}

const UserStatsCards = ({ stats }: UserStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Всего пользователей</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-muted-foreground">Активных</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Ожидают подтверждения</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.admins}</p>
            <p className="text-sm text-muted-foreground">Администраторов</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStatsCards;
