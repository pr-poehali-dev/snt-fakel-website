import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SiteStatisticsProps {
  onBack?: () => void;
}

const SiteStatistics = ({ onBack }: SiteStatisticsProps) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStatistics();

    const interval = setInterval(loadStatistics, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadStatistics = () => {
    try {
      const usersJSON = localStorage.getItem('snt_users');
      const messagesJSON = localStorage.getItem('snt_messages');
      const readingsJSON = localStorage.getItem('snt_meter_readings');
      const votingsJSON = localStorage.getItem('snt_votings');
      const appealsFCJSON = localStorage.getItem('snt_financial_committee_appeals');
      const appealsBoardJSON = localStorage.getItem('snt_board_appeals');

      const users = usersJSON ? JSON.parse(usersJSON) : [];
      const messages = messagesJSON ? JSON.parse(messagesJSON) : [];
      const readings = readingsJSON ? JSON.parse(readingsJSON) : [];
      const votings = votingsJSON ? JSON.parse(votingsJSON) : [];
      const appealsFC = appealsFCJSON ? JSON.parse(appealsFCJSON) : [];
      const appealsBoard = appealsBoardJSON ? JSON.parse(appealsBoardJSON) : [];

      // Онлайн пользователи
      const now = Date.now();
      const onlineTimeout = 5 * 60 * 1000;
      const onlineUsers = users.filter((u: any) => {
        const lastActivity = u.lastActivity || 0;
        return (now - lastActivity) < onlineTimeout;
      });

      // Распределение по ролям (только если есть пользователи с этой ролью)
      const roleDistribution = [
        { name: 'Члены СНТ', value: users.filter((u: any) => u.role === 'member').length, color: '#3b82f6' },
        { name: 'Правление', value: users.filter((u: any) => u.role === 'board_member').length, color: '#10b981' },
        { name: 'Председатель', value: users.filter((u: any) => u.role === 'chairman').length, color: '#8b5cf6' },
        { name: 'Администраторы', value: users.filter((u: any) => u.role === 'admin').length, color: '#f59e0b' },
      ].filter(role => role.value > 0);

    // Активность по дням (последние 7 дней)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    });

    const activityByDay = last7Days.map(day => {
      const dayMessages = messages.filter((m: any) => {
        const msgDate = new Date(m.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
        return msgDate === day;
      });

      return {
        date: day,
        messages: dayMessages.length,
        users: new Set(dayMessages.map((m: any) => m.email)).size
      };
    });

      // Статистика показаний ПУ по месяцам
      const readingsByMonth = readings.reduce((acc: any, r: any) => {
        const month = r.month;
        if (!acc[month]) acc[month] = 0;
        acc[month]++;
        return acc;
      }, {});

      const meterReadingsData = Object.entries(readingsByMonth).length > 0
        ? Object.entries(readingsByMonth)
            .slice(-6)
            .map(([month, count]) => ({
              month,
              count
            }))
        : [{ month: 'Нет данных', count: 0 }];

      // Статистика голосований
      const activeVotings = votings.filter((v: any) => {
        const now = new Date();
        const endDate = new Date(v.endDate.split('.').reverse().join('-'));
        return now <= endDate;
      }).length;

      const completedVotings = votings.length - activeVotings;

      setStats({
        totalUsers: users.length,
        onlineUsers: onlineUsers.length,
        totalMessages: messages.length,
        totalReadings: readings.length,
        totalVotings: votings.length,
        activeVotings,
        completedVotings,
        totalAppeals: appealsFC.length + appealsBoard.length,
        roleDistribution: roleDistribution.length > 0 ? roleDistribution : [{ name: 'Нет данных', value: 1, color: '#e5e7eb' }],
        activityByDay,
        meterReadingsData
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
      setStats({
        totalUsers: 0,
        onlineUsers: 0,
        totalMessages: 0,
        totalReadings: 0,
        totalVotings: 0,
        activeVotings: 0,
        completedVotings: 0,
        totalAppeals: 0,
        roleDistribution: [{ name: 'Нет данных', value: 1, color: '#e5e7eb' }],
        activityByDay: [],
        meterReadingsData: [{ month: 'Нет данных', count: 0 }]
      });
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon name="Loader2" className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-muted-foreground">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  return (
    <section>
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 mb-6"
        >
          <Icon name="ArrowLeft" size={18} />
          Назад
        </Button>
      )}

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold">Статистика сайта</h2>
      </div>

      {/* Карточки сводной статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего пользователей</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="Users" className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Сейчас онлайн</p>
                <p className="text-3xl font-bold text-green-600">{stats.onlineUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="Wifi" className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Сообщений в чате</p>
                <p className="text-3xl font-bold">{stats.totalMessages}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon name="MessageCircle" className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Голосований</p>
                <p className="text-3xl font-bold">{stats.totalVotings}</p>
                <p className="text-xs text-muted-foreground mt-1">Активных: {stats.activeVotings}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon name="Vote" className="text-orange-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Распределение по ролям */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="PieChart" className="text-primary" />
              Распределение пользователей по ролям
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.roleDistribution && stats.roleDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.roleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.roleDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>

        {/* Активность по дням */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" className="text-primary" />
              Активность за последние 7 дней
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.activityByDay && stats.activityByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.activityByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="messages" stroke="#8b5cf6" name="Сообщения" strokeWidth={2} />
                  <Line type="monotone" dataKey="users" stroke="#10b981" name="Активные пользователи" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Показания ПУ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" className="text-primary" />
            Показания приборов учёта по месяцам
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.meterReadingsData && stats.meterReadingsData.length > 0 && stats.meterReadingsData[0].month !== 'Нет данных' ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.meterReadingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#f59e0b" name="Количество показаний" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Нет данных для отображения
            </div>
          )}
        </CardContent>
      </Card>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Icon name="Gauge" className="mx-auto text-blue-600 mb-2" size={32} />
              <p className="text-sm text-muted-foreground">Всего показаний ПУ</p>
              <p className="text-2xl font-bold">{stats.totalReadings}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Icon name="FileText" className="mx-auto text-purple-600 mb-2" size={32} />
              <p className="text-sm text-muted-foreground">Всего обращений</p>
              <p className="text-2xl font-bold">{stats.totalAppeals}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Icon name="CheckCircle" className="mx-auto text-green-600 mb-2" size={32} />
              <p className="text-sm text-muted-foreground">Завершено голосований</p>
              <p className="text-2xl font-bold">{stats.completedVotings}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SiteStatistics;