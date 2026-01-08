import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

interface LoginProps {
  onSuccess: (email: string, role: UserRole) => void;
  onCancel: () => void;
  onRegisterClick: () => void;
  onPasswordResetClick: () => void;
}

const Login = ({ onSuccess, onCancel, onRegisterClick, onPasswordResetClick }: LoginProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error('Введите email');
      return;
    }

    if (!formData.password) {
      toast.error('Введите пароль');
      return;
    }

    setIsLoading(true);

    try {
      const url = 'https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35';
      console.log('Отправка запроса на авторизацию');
      console.log('Email:', formData.email);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'login',
          email: formData.email,
          password: formData.password
        })
      });
      
      console.log('Получен ответ:', response.status, response.statusText);
      const data = await response.json();
      console.log('Данные ответа:', data);

      setIsLoading(false);

      if (response.ok && data.success && data.user) {
        toast.success(`Добро пожаловать, ${data.user.first_name}!`);
        onSuccess(data.user.email, data.user.role || 'member');
      } else if (response.status === 401) {
        toast.error('❌ Неверный email или пароль');
      } else if (data.error) {
        toast.error(data.error);
      } else {
        toast.error('Ошибка входа. Попробуйте снова');
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      setIsLoading(false);
      toast.error('Не удалось подключиться к серверу. Проверьте интернет-соединение и попробуйте снова через несколько секунд.', {
        duration: 5000
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="LogIn" className="text-white" size={24} />
            </div>
            <div>
              <CardTitle className="text-2xl">Вход в личный кабинет</CardTitle>
              <CardDescription>Введите ваш email и пароль</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.ru"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Вход...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" size={20} className="mr-2" />
                    Войти
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                size="lg"
                disabled={isLoading}
              >
                Отмена
              </Button>
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={onPasswordResetClick}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={isLoading}
              >
                Забыли пароль?
              </Button>
            </div>

            <div className="pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Ещё не зарегистрированы?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={onRegisterClick}
                className="w-full"
                disabled={isLoading}
              >
                <Icon name="UserPlus" size={18} className="mr-2" />
                Зарегистрироваться
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;