import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface SiteProtectionProps {
  onSuccess: () => void;
}

const SiteProtection = ({ onSuccess }: SiteProtectionProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const SITE_PASSWORD = 'snt2026';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === SITE_PASSWORD) {
      localStorage.setItem('snt_site_access', 'granted');
      toast.success('Доступ разрешен');
      onSuccess();
    } else {
      toast.error('Неверный пароль');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="Lock" className="text-white" size={24} />
            </div>
            <div>
              <CardTitle className="text-2xl">СНТ Факел</CardTitle>
              <CardDescription>Вход на сайт</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Пароль для доступа к сайту</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  autoFocus
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

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              size="lg"
            >
              <Icon name="Unlock" size={20} className="mr-2" />
              Войти на сайт
            </Button>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-center">
              <p className="text-muted-foreground">
                <Icon name="Info" size={14} className="inline mr-1" />
                Для получения пароля обратитесь к администратору СНТ
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteProtection;
