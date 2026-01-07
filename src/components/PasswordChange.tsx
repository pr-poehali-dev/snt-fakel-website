import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface PasswordChangeProps {
  currentUserEmail: string;
  onCancel: () => void;
  onPasswordChanged: () => void;
}

const PasswordChange = ({ currentUserEmail, onCancel, onPasswordChanged }: PasswordChangeProps) => {
  const [step, setStep] = useState<'password' | 'verification'>('password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmitPassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Заполните все поля');
      return;
    }

    const usersJSON = localStorage.getItem('snt_users');
    if (!usersJSON) {
      toast.error('Ошибка загрузки данных');
      return;
    }

    const users = JSON.parse(usersJSON);
    const user = users.find((u: any) => u.email === currentUserEmail);
    
    if (!user) {
      toast.error('Пользователь не найден');
      return;
    }

    if (user.password !== currentPassword) {
      toast.error('Неверный текущий пароль');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error('Пароль должен содержать минимум 8 символов, заглавную букву, цифру и спецсимвол');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setPhone(user.phone);
    console.log(`СМС код для смены пароля: ${code} на номер ${user.phone}`);
    
    const verificationData = {
      email: currentUserEmail,
      code: code,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    };
    localStorage.setItem(`password_change_${currentUserEmail}`, JSON.stringify(verificationData));
    
    toast.success('Код отправлен на ваш телефон');
    setStep('verification');
  };

  const handleVerify = () => {
    if (!verificationCode) {
      toast.error('Введите код подтверждения');
      return;
    }

    const verificationDataJSON = localStorage.getItem(`password_change_${currentUserEmail}`);
    if (!verificationDataJSON) {
      toast.error('Код подтверждения не найден');
      return;
    }

    const verificationData = JSON.parse(verificationDataJSON);
    
    if (new Date() > new Date(verificationData.expiresAt)) {
      toast.error('Код истёк. Запросите новый');
      localStorage.removeItem(`password_change_${currentUserEmail}`);
      return;
    }

    if (verificationCode !== verificationData.code) {
      toast.error('Неверный код подтверждения');
      return;
    }

    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const updatedUsers = users.map((u: any) => 
        u.email === currentUserEmail ? { ...u, password: newPassword } : u
      );
      localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
      localStorage.removeItem(`password_change_${currentUserEmail}`);
      toast.success('Пароль успешно изменён');
      onPasswordChanged();
    }
  };

  const handleResendCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    console.log(`СМС код для смены пароля: ${code} на номер ${phone}`);
    
    const verificationData = {
      email: currentUserEmail,
      code: code,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    };
    localStorage.setItem(`password_change_${currentUserEmail}`, JSON.stringify(verificationData));
    toast.success('Код отправлен повторно');
  };

  if (step === 'verification') {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Shield" className="text-primary" />
            Подтверждение смены пароля
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Код отправлен на номер: {phone}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Код из СМС</Label>
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="0000"
              maxLength={4}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleVerify} className="flex-1">
              <Icon name="Check" size={16} className="mr-2" />
              Подтвердить
            </Button>
            <Button onClick={onCancel} variant="outline">
              <Icon name="X" size={16} className="mr-2" />
              Отмена
            </Button>
          </div>

          <Button onClick={handleResendCode} variant="ghost" className="w-full">
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Отправить код повторно
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Код действителен в течение 10 минут
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Lock" className="text-primary" />
          Смена пароля
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Текущий пароль</Label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Введите текущий пароль"
          />
        </div>

        <div className="space-y-2">
          <Label>Новый пароль</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Введите новый пароль"
          />
          <p className="text-xs text-muted-foreground">
            Минимум 8 символов, заглавная буква, цифра и спецсимвол (!@#$%^&*)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Подтвердите новый пароль</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторите новый пароль"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmitPassword} className="flex-1">
            <Icon name="ArrowRight" size={16} className="mr-2" />
            Продолжить
          </Button>
          <Button onClick={onCancel} variant="outline">
            <Icon name="X" size={16} className="mr-2" />
            Отмена
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordChange;
