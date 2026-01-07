import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type UserRole = 'guest' | 'member' | 'admin';

interface ProfileSectionProps {
  userRole: UserRole;
}

const ProfileSection = ({ userRole }: ProfileSectionProps) => {
  const roleNames = {
    guest: 'Гость',
    member: 'Член СНТ',
    admin: 'Администратор'
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold">Личный кабинет</h2>
        <Badge className={`text-lg px-4 py-2 ${userRole === 'admin' ? 'bg-gradient-to-r from-orange-500 to-pink-500' : ''}`}>
          {roleNames[userRole]}
        </Badge>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {userRole === 'admin' ? (
          <>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Shield" className="text-primary" />
                  Панель администратора
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Всего участников</p>
                    <p className="text-2xl font-bold">156</p>
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
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Users" size={18} className="mr-2" />
                  Список участников
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Vote" size={18} className="mr-2" />
                  Создать голосование
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="FileText" size={18} className="mr-2" />
                  Управление документами
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Settings" size={18} className="mr-2" />
                  Настройки сайта
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Информация об участке</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Номер участка</p>
                    <p className="text-lg font-semibold">№ 42</p>
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
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Receipt" size={18} className="mr-2" />
                  История платежей
                </Button>
                <Button variant="outline" className="w-full justify-start">
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
        )}
      </div>
    </section>
  );
};

export default ProfileSection;
