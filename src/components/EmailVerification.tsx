import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onCancel: () => void;
}

const EmailVerification = ({ email, onVerified, onCancel }: EmailVerificationProps) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    generateCode();
  }, []);

  const generateCode = async () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);

    const verificationData = {
      email: email,
      code: newCode,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    };
    localStorage.setItem(`email_verification_${email}`, JSON.stringify(verificationData));

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f97316;">Подтверждение email - СНТ Факел</h2>
        <p>Здравствуйте!</p>
        <p>Ваш код подтверждения email:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${newCode}
        </div>
        <p>Введите этот код на сайте для подтверждения адреса электронной почты.</p>
        <p style="color: #ef4444;">Код действителен в течение 10 минут.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Если вы не запрашивали подтверждение, проигнорируйте это письмо.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          С уважением,<br>
          Администрация СНТ Факел
        </p>
      </div>
    `;

    const textContent = `
Здравствуйте!

Ваш код подтверждения email: ${newCode}

Введите этот код на сайте для подтверждения адреса электронной почты.

Код действителен в течение 10 минут.

Если вы не запрашивали подтверждение, проигнорируйте это письмо.

С уважением,
Администрация СНТ Факел
    `;

    try {
      const response = await fetch('https://functions.poehali.dev/2672fb97-4151-4228-bb1c-4d0b3a502216', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: email,
          subject: 'Подтверждение email - СНТ Факел',
          html_content: htmlContent,
          text_content: textContent
        })
      });

      if (response.ok) {
        toast.success('Код отправлен на вашу почту');
      } else {
        const error = await response.json();
        console.error('Ошибка отправки email:', error);
        toast.error('Не удалось отправить код. Проверьте почту или попробуйте позже');
      }
    } catch (error) {
      console.error('Ошибка отправки email:', error);
      toast.error('Не удалось отправить код. Проверьте почту или попробуйте позже');
    }
  };

  const handleSendCode = () => {
    generateCode();
  };

  const handleVerify = () => {
    if (!code.trim()) {
      toast.error('Введите код подтверждения');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const savedData = localStorage.getItem(`email_verification_${email}`);
      if (savedData) {
        const verificationData = JSON.parse(savedData);
        const expiresAt = new Date(verificationData.expiresAt);
        
        if (new Date() > expiresAt) {
          toast.error('Код истёк. Запросите новый код');
          return;
        }

        if (code === verificationData.code) {
          localStorage.removeItem(`email_verification_${email}`);
          toast.success('Email успешно подтверждён!');
          onVerified();
        } else {
          toast.error('Неверный код подтверждения');
        }
      } else {
        toast.error('Сначала запросите код подтверждения');
      }
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="Mail" className="text-white" size={24} />
            </div>
            <div>
              <CardTitle className="text-2xl">Подтверждение email</CardTitle>
              <CardDescription>Введите код из письма</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Код отправлен на адрес:
              </p>
              <p className="font-semibold text-blue-700">{email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Код подтверждения</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Код действителен 10 минут
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handleVerify}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                size="lg"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Icon name="CheckCircle" size={20} className="mr-2" />
                    Подтвердить
                  </>
                )}
              </Button>

              <Button
                onClick={handleSendCode}
                variant="outline"
                size="lg"
              >
                <Icon name="RefreshCw" size={20} className="mr-2" />
                Отправить код повторно
              </Button>

              <Button
                onClick={onCancel}
                variant="ghost"
                size="lg"
              >
                Отмена
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
              <p>• Проверьте входящие письма</p>
              <p>• Если письма нет, проверьте папку "Спам"</p>
              <p>• Нажмите "Отправить код повторно" если код не пришёл</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;