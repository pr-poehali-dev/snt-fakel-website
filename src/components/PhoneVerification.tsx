import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface PhoneVerificationProps {
  phone: string;
  onVerified: () => void;
  onCancel: () => void;
}

const PhoneVerification = ({ phone, onVerified, onCancel }: PhoneVerificationProps) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const generateCode = () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(newCode);

    console.log(`
===========================================
СМС С КОДОМ ПОДТВЕРЖДЕНИЯ ТЕЛЕФОНА
===========================================
Номер: ${phone}

СНТ Факел
Ваш код подтверждения: ${newCode}
Код действителен 10 минут.
===========================================
    `);

    const verificationData = {
      phone: phone,
      code: newCode,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    };
    localStorage.setItem(`phone_verification_${phone}`, JSON.stringify(verificationData));

    toast.success('Код отправлен на ваш телефон');
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

      const savedData = localStorage.getItem(`phone_verification_${phone}`);
      if (savedData) {
        const verificationData = JSON.parse(savedData);
        const expiresAt = new Date(verificationData.expiresAt);
        
        if (new Date() > expiresAt) {
          toast.error('Код истёк. Запросите новый код');
          return;
        }

        if (code === verificationData.code) {
          localStorage.removeItem(`phone_verification_${phone}`);
          toast.success('Телефон успешно подтверждён!');
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
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="Phone" className="text-white" size={24} />
            </div>
            <div>
              <CardTitle className="text-2xl">Подтверждение телефона</CardTitle>
              <CardDescription>Введите код из СМС</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Код отправлен на номер:
              </p>
              <p className="font-semibold text-green-700">{phone}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Код подтверждения</Label>
              <Input
                id="code"
                type="text"
                placeholder="0000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Код действителен 10 минут
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handleVerify}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                size="lg"
                disabled={isLoading || code.length !== 4}
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
              <p>• СМС должна прийти в течение 1-2 минут</p>
              <p>• Нажмите "Отправить код повторно" если СМС не пришла</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneVerification;
