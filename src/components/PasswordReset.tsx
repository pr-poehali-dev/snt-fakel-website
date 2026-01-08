import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface PasswordResetProps {
  onCancel: () => void;
}

const PasswordReset = ({ onCancel }: PasswordResetProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Введите email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Введите корректный email');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'request_password_reset',
          email: email
        })
      });

      const data = await response.json();

      setIsLoading(false);

      if (response.ok && data.success) {
        setEmailSent(true);
        toast.success('Ссылка для восстановления пароля отправлена на вашу почту');
      } else {
        toast.error(data.error || 'Ошибка при отправке запроса');
      }
    } catch (error) {
      console.error('Ошибка восстановления пароля:', error);
      setIsLoading(false);
      toast.error('Не удалось отправить запрос. Попробуйте позже.');
    }
  };

  if (emailSent) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md border-2 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="CheckCircle" className="text-white" size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl">Письмо отправлено</CardTitle>
                <CardDescription>Проверьте вашу почту</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Мы отправили ссылку для восстановления пароля на адрес:
                </p>
                <p className="font-semibold text-blue-700">{email}</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Проверьте входящие письма</p>
                <p>• Если письма нет, проверьте папку "Спам"</p>
                <p>• Ссылка действительна в течение 1 часа</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full"
              >
                <Icon name="ArrowLeft" size={18} className="mr-2" />
                Вернуться к входу
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="KeyRound" className="text-white" size={24} />
            </div>
            <div>
              <CardTitle className="text-2xl">Восстановление пароля</CardTitle>
              <CardDescription>Введите email для восстановления</CardDescription>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <p className="text-xs text-muted-foreground">
                Мы отправим ссылку для восстановления пароля на указанный email
              </p>
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
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={20} className="mr-2" />
                    Отправить ссылку
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;