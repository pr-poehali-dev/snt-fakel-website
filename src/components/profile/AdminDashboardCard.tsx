import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type UserRole = 'admin' | 'chairman' | 'board_member';

interface AdminDashboardCardProps {
  userRole: UserRole;
  onNavigate?: (section: string) => void;
}

const AdminDashboardCard = ({ userRole, onNavigate }: AdminDashboardCardProps) => {
  const [stats, setStats] = useState({
    members: 0,
    activeVotings: 0,
    news: 0,
    documents: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      // Загрузить количество участников
      try {
        const response = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35');
        const data = await response.json();
        const membersCount = data.users?.length || 0;
        
        // Загрузить голосования
        const votingsJSON = localStorage.getItem('snt_votings');
        let activeVotingsCount = 0;
        if (votingsJSON) {
          const votings = JSON.parse(votingsJSON);
          const now = new Date();
          activeVotingsCount = votings.filter((v: any) => {
            const endDate = new Date(v.endDate);
            return v.status === 'active' && endDate >= now;
          }).length;
        }
        
        // Загрузить новости
        const newsJSON = localStorage.getItem('snt_news');
        const newsCount = newsJSON ? JSON.parse(newsJSON).length : 0;
        
        // Загрузить документы
        const docsJSON = localStorage.getItem('snt_documents');
        let docsCount = 0;
        if (docsJSON) {
          try {
            const docs = JSON.parse(docsJSON);
            docsCount = Array.isArray(docs) ? docs.filter((d: any) => d && d.fileUrl).length : 0;
          } catch (e) {
            console.error('Error parsing documents:', e);
          }
        }
        
        setStats({
          members: membersCount,
          activeVotings: activeVotingsCount,
          news: newsCount,
          documents: docsCount
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    loadStats();
    
    // Обновлять статистику при изменениях
    const handleUpdate = () => loadStats();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('votings-updated', handleUpdate);
    window.addEventListener('news-updated', handleUpdate);
    window.addEventListener('documents-updated', handleUpdate);
    
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('votings-updated', handleUpdate);
      window.removeEventListener('news-updated', handleUpdate);
      window.removeEventListener('documents-updated', handleUpdate);
    };
  }, []);

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
              <p className="text-2xl font-bold">{stats.members}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Активных голосований</p>
              <p className="text-2xl font-bold">{stats.activeVotings}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Новостей</p>
              <p className="text-2xl font-bold">{stats.news}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Документов</p>
              <p className="text-2xl font-bold">{stats.documents}</p>
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
            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{stats.members}</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start border-primary text-primary hover:bg-primary/5"
            onClick={() => onNavigate?.('mass-notification')}
          >
            <Icon name="Mail" size={18} className="mr-2" />
            Массовая рассылка
          </Button>
          {(userRole === 'admin' || userRole === 'chairman') && (
            <Button 
              variant="outline" 
              className="w-full justify-start border-purple-500 text-purple-600 hover:bg-purple-50"
              onClick={() => onNavigate?.('page-editor')}
            >
              <Icon name="FileEdit" size={18} className="mr-2" />
              Редактор страниц
            </Button>
          )}
          <Button 
            variant="outline" 
            className="w-full justify-start border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => onNavigate?.('meter-readings')}
          >
            <Icon name="Gauge" size={18} className="mr-2" />
            Показания ПУ
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start border-blue-500 text-blue-600 hover:bg-blue-50"
            onClick={() => onNavigate?.('board-appeal')}
          >
            <Icon name="MessageSquare" size={18} className="mr-2" />
            Обращения участников
          </Button>
          {(userRole === 'admin' || userRole === 'chairman') && (
            <Button 
              variant="outline" 
              className="w-full justify-start border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => onNavigate?.('chat-moderation')}
            >
              <Icon name="ShieldAlert" size={18} className="mr-2" />
              Модерация чата
            </Button>
          )}
          {(userRole === 'admin' || userRole === 'chairman') && (
            <Button 
              variant="outline" 
              className="w-full justify-start border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              onClick={() => onNavigate?.('create-voting')}
            >
              <Icon name="Vote" size={18} className="mr-2" />
              Создать голосование
            </Button>
          )}
          <Button variant="outline" className="w-full justify-start">
            <Icon name="FileText" size={18} className="mr-2" />
            Управление документами
          </Button>
          {(userRole === 'admin' || userRole === 'chairman') && (
            <Button 
              variant="outline" 
              className="w-full justify-start border-pink-500 text-pink-600 hover:bg-pink-50"
              onClick={() => onNavigate?.('holiday-decor')}
            >
              <Icon name="Sparkles" size={18} className="mr-2" />
              Праздничный декор
            </Button>
          )}
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