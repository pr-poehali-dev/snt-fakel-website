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

  const handleSubmit = (e: React.FormEvent) => {
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

    const usersJSON = localStorage.getItem('snt_users');
    const users = usersJSON ? JSON.parse(usersJSON) : [];
    const user = users.find((u: any) => u.email === email);

    setTimeout(() => {
      setIsLoading(false);

      if (user) {
        const resetToken = Math.random().toString(36).substring(2, 15);
        const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;
        
        const resetRequests = JSON.parse(localStorage.getItem('password_reset_requests') || '[]');
        resetRequests.push({
          email: email,
          token: resetToken,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        });
        localStorage.setItem('password_reset_requests', JSON.stringify(resetRequests));

        const emailHTML = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Восстановление пароля</h2>
            <p>Здравствуйте!</p>
            <p>Вы запросили восстановление пароля для входа в личный кабинет СНТ "Факел".</p>
            <p>Для сброса пароля перейдите по ссылке:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Восстановить пароль</a>
            <p style="color: #666; font-size: 14px;">Ссылка действительна в течение 1 часа.</p>
            <p style="color: #666; font-size: 14px;">Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
            <p style="margin-top: 30px; color: #666;">С уважением,<br>Администрация СНТ "Факел"</p>
          </div>
        `;

        fetch('https://functions.poehali.dev/2672fb97-4151-4228-bb1c-4d0b3a502216', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_email: email,
            subject: 'Восстановление пароля - СНТ "Факел"',
            html_content: emailHTML,
            text_content: `Восстановление пароля. Перейдите по ссылке: ${resetLink}. Ссылка действительна в течение 1 часа.`
          })
        }).catch(error => {
          console.warn('Ошибка отправки email:', error);
        });

        console.log(`
===========================================
ПИСЬМО ДЛЯ ВОССТАНОВЛЕНИЯ ПАРОЛЯ
===========================================
Кому: ${email}
Тема: Восстановление пароля СНТ Факел

Здравствуйте!

Вы запросили восстановление пароля для входа в личный кабинет СНТ Факел.

Для сброса пароля перейдите по ссылке:
${resetLink}

Ссылка действительна в течение 1 часа.

Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.

С уважением,
Администрация СНТ Факел
===========================================
        `);

        setEmailSent(true);
        toast.success('Ссылка для восстановления пароля отправлена на вашу почту');
      } else {
        toast.error('Пользователь с таким email не найден');
      }
    }, 800);
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