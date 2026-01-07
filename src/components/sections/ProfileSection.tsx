import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

interface ProfileSectionProps {
  userRole: UserRole;
  currentUserEmail: string;
  onNavigate?: (section: string) => void;
}

interface UserData {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  phone: string;
  email: string;
  plotNumber: string;
  ownerLastName: string;
  ownerFirstName: string;
  ownerMiddleName: string;
  landDocNumber: string;
  houseDocNumber: string;
}

const ProfileSection = ({ userRole, currentUserEmail, onNavigate }: ProfileSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    phone: '',
    email: '',
    plotNumber: '',
    ownerLastName: '',
    ownerFirstName: '',
    ownerMiddleName: '',
    landDocNumber: '',
    houseDocNumber: ''
  });

  useEffect(() => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const user = users.find((u: any) => u.email === currentUserEmail);
      if (user) {
        setUserData({
          lastName: user.lastName || '',
          firstName: user.firstName || '',
          middleName: user.middleName || '',
          birthDate: user.birthDate || '',
          phone: user.phone || '',
          email: user.email || '',
          plotNumber: user.plotNumber || '',
          ownerLastName: user.ownerLastName || '',
          ownerFirstName: user.ownerFirstName || '',
          ownerMiddleName: user.ownerMiddleName || '',
          landDocNumber: user.landDocNumber || '',
          houseDocNumber: user.houseDocNumber || ''
        });
      }
    }
  }, [currentUserEmail]);

  const handleSave = () => {
    if (userData.email !== currentUserEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        toast.error('Введите корректный email');
        return;
      }

      const usersJSON = localStorage.getItem('snt_users');
      if (usersJSON) {
        const users = JSON.parse(usersJSON);
        const emailExists = users.find((u: any) => u.email === userData.email && u.email !== currentUserEmail);
        if (emailExists) {
          toast.error('Пользователь с таким email уже существует');
          return;
        }
      }
    }

    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const updatedUsers = users.map((u: any) => 
        u.email === currentUserEmail ? { ...u, ...userData } : u
      );
      localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
      setIsEditing(false);
      toast.success('Данные успешно обновлены');
      
      if (userData.email !== currentUserEmail) {
        toast.info('Email изменён. Используйте новый email для входа', { duration: 5000 });
      }
    }
  };

  const handleCancel = () => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const user = users.find((u: any) => u.email === currentUserEmail);
      if (user) {
        setUserData({
          lastName: user.lastName || '',
          firstName: user.firstName || '',
          middleName: user.middleName || '',
          birthDate: user.birthDate || '',
          phone: user.phone || '',
          email: user.email || '',
          plotNumber: user.plotNumber || '',
          ownerLastName: user.ownerLastName || '',
          ownerFirstName: user.ownerFirstName || '',
          ownerMiddleName: user.ownerMiddleName || '',
          landDocNumber: user.landDocNumber || '',
          houseDocNumber: user.houseDocNumber || ''
        });
      }
    }
    setIsEditing(false);
  };

  const roleNames = {
    guest: 'Гость',
    member: 'Член СНТ',
    board_member: 'Член правления',
    chairman: 'Председатель',
    admin: 'Администратор'
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold">Личный кабинет</h2>
        <Badge className={`text-lg px-4 py-2 ${userRole === 'admin' ? 'bg-gradient-to-r from-orange-500 to-pink-500' : userRole === 'chairman' ? 'bg-purple-500' : userRole === 'board_member' ? 'bg-green-500' : ''}`}>
          {roleNames[userRole]}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {userRole === 'board_member' || userRole === 'chairman' || userRole === 'admin' ? (
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
                {userRole === 'admin' && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-orange-500 text-orange-600 hover:bg-orange-50"
                    onClick={() => onNavigate?.('role-management')}
                  >
                    <Icon name="UserCog" size={18} className="mr-2" />
                    Управление ролями
                  </Button>
                )}
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
                    <p className="text-lg font-semibold">№ {userData.plotNumber || '—'}</p>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Личные данные</CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Icon name="Pencil" size={16} className="mr-2" />
                Редактировать
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" className="bg-green-500 hover:bg-green-600">
                  <Icon name="Check" size={16} className="mr-2" />
                  Сохранить
                </Button>
                <Button onClick={handleCancel} size="sm" variant="outline">
                  <Icon name="X" size={16} className="mr-2" />
                  Отмена
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="User" size={20} className="text-primary" />
              Основная информация
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Фамилия</Label>
                {isEditing ? (
                  <Input 
                    value={userData.lastName} 
                    onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                  />
                ) : (
                  <p className="text-lg">{userData.lastName || '—'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Имя</Label>
                {isEditing ? (
                  <Input 
                    value={userData.firstName} 
                    onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                  />
                ) : (
                  <p className="text-lg">{userData.firstName || '—'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Отчество</Label>
                {isEditing ? (
                  <Input 
                    value={userData.middleName} 
                    onChange={(e) => setUserData({...userData, middleName: e.target.value})}
                  />
                ) : (
                  <p className="text-lg">{userData.middleName || '—'}</p>
                )}
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Дата рождения</Label>
                {isEditing ? (
                  <Input 
                    type="date"
                    value={userData.birthDate} 
                    onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
                  />
                ) : (
                  <p className="text-lg">{userData.birthDate ? new Date(userData.birthDate).toLocaleDateString('ru-RU') : '—'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Телефон</Label>
                {isEditing ? (
                  <Input 
                    value={userData.phone} 
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                  />
                ) : (
                  <p className="text-lg">{userData.phone || '—'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Номер участка</Label>
                {isEditing ? (
                  <Input 
                    value={userData.plotNumber} 
                    onChange={(e) => setUserData({...userData, plotNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-lg">{userData.plotNumber || '—'}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              {isEditing ? (
                <>
                  <Input 
                    type="email"
                    value={userData.email} 
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">После изменения email используйте новый адрес для входа</p>
                </>
              ) : (
                <p className="text-lg">{userData.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="FileText" size={20} className="text-primary" />
              Данные собственника
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Фамилия собственника</Label>
                {isEditing ? (
                  <Input 
                    value={userData.ownerLastName} 
                    onChange={(e) => setUserData({...userData, ownerLastName: e.target.value})}
                  />
                ) : (
                  <p className="text-lg">{userData.ownerLastName || '—'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Имя собственника</Label>
                {isEditing ? (
                  <Input 
                    value={userData.ownerFirstName} 
                    onChange={(e) => setUserData({...userData, ownerFirstName: e.target.value})}
                  />
                ) : (
                  <p className="text-lg">{userData.ownerFirstName || '—'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Отчество собственника</Label>
                {isEditing ? (
                  <Input 
                    value={userData.ownerMiddleName} 
                    onChange={(e) => setUserData({...userData, ownerMiddleName: e.target.value})}
                  />
                ) : (
                  <p className="text-lg">{userData.ownerMiddleName || '—'}</p>
                )}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Документ на собственность земли</Label>
                {isEditing ? (
                  <Input 
                    value={userData.landDocNumber} 
                    onChange={(e) => setUserData({...userData, landDocNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-lg">{userData.landDocNumber || '—'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Документ на собственность дома</Label>
                {isEditing ? (
                  <Input 
                    value={userData.houseDocNumber} 
                    onChange={(e) => setUserData({...userData, houseDocNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-lg">{userData.houseDocNumber || '—'}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ProfileSection;