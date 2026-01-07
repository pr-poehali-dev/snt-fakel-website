import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface UserData {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  phone: string;
  email: string;
  plotNumber: string;
}

interface PersonalDataCardProps {
  userData: UserData;
  originalEmail: string;
  originalPhone: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: string, value: string) => void;
}

const PersonalDataCard = ({ 
  userData, 
  originalEmail,
  originalPhone,
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onChange 
}: PersonalDataCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Личные данные</CardTitle>
          {!isEditing ? (
            <Button onClick={onEdit} variant="outline">
              <Icon name="Pencil" size={16} className="mr-2" />
              Редактировать
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={onSave} size="sm" className="bg-green-500 hover:bg-green-600">
                <Icon name="Check" size={16} className="mr-2" />
                Сохранить
              </Button>
              <Button onClick={onCancel} size="sm" variant="outline">
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
                  onChange={(e) => onChange('lastName', e.target.value)}
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
                  onChange={(e) => onChange('firstName', e.target.value)}
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
                  onChange={(e) => onChange('middleName', e.target.value)}
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
                  onChange={(e) => onChange('birthDate', e.target.value)}
                />
              ) : (
                <p className="text-lg">{userData.birthDate ? new Date(userData.birthDate).toLocaleDateString('ru-RU') : '—'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Телефон
                {!isEditing && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                    <Icon name="CheckCircle" size={12} className="mr-1" />
                    Подтверждён
                  </Badge>
                )}
              </Label>
              {isEditing ? (
                <>
                  <Input 
                    value={userData.phone} 
                    onChange={(e) => onChange('phone', e.target.value)}
                  />
                  {userData.phone !== originalPhone && (
                    <p className="text-xs text-orange-600">Потребуется подтверждение через СМС</p>
                  )}
                </>
              ) : (
                <p className="text-lg">{userData.phone || '—'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Номер участка</Label>
              {isEditing ? (
                <Input 
                  value={userData.plotNumber} 
                  onChange={(e) => onChange('plotNumber', e.target.value)}
                />
              ) : (
                <p className="text-lg">{userData.plotNumber || '—'}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Email
              {!isEditing && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                  <Icon name="CheckCircle" size={12} className="mr-1" />
                  Подтверждён
                </Badge>
              )}
            </Label>
            {isEditing ? (
              <>
                <Input 
                  type="email"
                  value={userData.email} 
                  onChange={(e) => onChange('email', e.target.value)}
                />
                {userData.email !== originalEmail ? (
                  <p className="text-xs text-orange-600">Потребуется подтверждение через код на новую почту</p>
                ) : (
                  <p className="text-xs text-muted-foreground">После изменения email используйте новый адрес для входа</p>
                )}
              </>
            ) : (
              <p className="text-lg">{userData.email}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalDataCard;
