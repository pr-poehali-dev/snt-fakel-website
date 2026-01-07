import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface AccountDataFormProps {
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  errors: { [key: string]: string };
  passwordStrength: { valid: boolean; errors: string[] };
  onChange: (field: string, value: string) => void;
}

const AccountDataForm = ({ formData, errors, passwordStrength, onChange }: AccountDataFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Icon name="Lock" size={20} className="text-primary" />
        Учетные данные для входа
      </h3>
      <div className="space-y-2">
        <Label htmlFor="email">Email (логин) <span className="text-red-500">*</span></Label>
        <Input
          id="email"
          type="email"
          placeholder="example@mail.ru"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        <p className="text-xs text-muted-foreground">Этот email будет использоваться для входа на сайт</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Пароль <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => onChange('password', e.target.value)}
              className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          {formData.password && !passwordStrength.valid && (
            <div className="text-xs space-y-1 mt-2">
              {passwordStrength.errors.map((err, idx) => (
                <p key={idx} className="text-orange-600 flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} />
                  {err}
                </p>
              ))}
            </div>
          )}
          {formData.password && passwordStrength.valid && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Icon name="CheckCircle" size={12} />
              Надежный пароль
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Подтвердите пароль <span className="text-red-500">*</span></Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-1">
        <p className="font-medium flex items-center gap-1">
          <Icon name="Info" size={16} className="text-blue-600" />
          Требования к паролю:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-5">
          <li>Минимум 8 символов</li>
          <li>Хотя бы одна русская заглавная буква</li>
          <li>Хотя бы одна цифра</li>
          <li>Хотя бы один специальный символ (!@#$%^&* и т.д.)</li>
        </ul>
      </div>
    </div>
  );
};

export default AccountDataForm;
