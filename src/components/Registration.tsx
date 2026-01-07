import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface RegistrationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const Registration = ({ onSuccess, onCancel }: RegistrationProps) => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    phone: '',
    email: '',
    plotNumber: '',
    password: '',
    confirmPassword: '',
    ownerIsSame: false,
    ownerLastName: '',
    ownerFirstName: '',
    ownerMiddleName: '',
    landDocNumber: '',
    houseDocNumber: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Если флажок "Собственник - я", копируем ФИО
      if (field === 'ownerIsSame' && value === true) {
        updated.ownerLastName = prev.lastName;
        updated.ownerFirstName = prev.firstName;
        updated.ownerMiddleName = prev.middleName;
      }
      
      // Если флажок снят, очищаем поля собственника
      if (field === 'ownerIsSame' && value === false) {
        updated.ownerLastName = '';
        updated.ownerFirstName = '';
        updated.ownerMiddleName = '';
        updated.landDocNumber = '';
        updated.houseDocNumber = '';
      }

      return updated;
    });
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11;
  };

  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Проверка длины
    if (password.length < 8) {
      errors.push('Минимум 8 символов');
    }
    
    // Проверка на русские буквы
    if (!/[а-яё]/i.test(password)) {
      errors.push('Должна быть хотя бы одна русская буква');
    }
    
    // Проверка на заглавную букву
    if (!/[А-ЯЁ]/.test(password)) {
      errors.push('Должна быть хотя бы одна заглавная русская буква');
    }
    
    // Проверка на цифру
    if (!/\d/.test(password)) {
      errors.push('Должна быть хотя бы одна цифра');
    }
    
    // Проверка на спецсимвол
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Должен быть хотя бы один символ (!@#$%^&* и т.д.)');
    }
    
    return { valid: errors.length === 0, errors };
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Проверка обязательных полей
    if (!formData.lastName.trim()) newErrors.lastName = 'Обязательное поле';
    if (!formData.firstName.trim()) newErrors.firstName = 'Обязательное поле';
    // middleName и birthDate теперь необязательные
    if (!formData.phone.trim()) newErrors.phone = 'Обязательное поле';
    if (!formData.email.trim()) newErrors.email = 'Обязательное поле';
    if (!formData.plotNumber.trim()) newErrors.plotNumber = 'Обязательное поле';
    if (!formData.password) newErrors.password = 'Обязательное поле';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Обязательное поле';

    // Проверка email
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    // Проверка телефона
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Некорректный номер (должен быть 11 цифр)';
    }

    // Проверка пароля
    if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.errors.join('; ');
      }
    }

    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    // Проверка возраста (должно быть 18+)
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        if (age - 1 < 18) {
          newErrors.birthDate = 'Вам должно быть не менее 18 лет';
        }
      } else if (age < 18) {
        newErrors.birthDate = 'Вам должно быть не менее 18 лет';
      }
    }

    // Если флажок не установлен, проверяем данные собственника
    if (!formData.ownerIsSame) {
      if (!formData.ownerLastName.trim()) newErrors.ownerLastName = 'Обязательное поле';
      if (!formData.ownerFirstName.trim()) newErrors.ownerFirstName = 'Обязательное поле';
      // ownerMiddleName необязательное
    }

    // Если флажок установлен, проверяем документы
    if (formData.ownerIsSame || (!formData.ownerIsSame && formData.ownerLastName)) {
      if (!formData.landDocNumber.trim()) newErrors.landDocNumber = 'Обязательное поле';
      if (!formData.houseDocNumber.trim()) newErrors.houseDocNumber = 'Обязательное поле';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    // Сохраняем пользователя в localStorage
    const usersJSON = localStorage.getItem('snt_users');
    const users = usersJSON ? JSON.parse(usersJSON) : [];
    
    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = users.find((u: any) => u.email === formData.email);
    if (existingUser) {
      toast.error('Пользователь с таким email уже зарегистрирован');
      return;
    }

    // Добавляем нового пользователя
    const newUser = {
      ...formData,
      role: 'member', // По умолчанию все новые пользователи - члены СНТ
      registeredAt: new Date().toISOString(),
      status: 'pending' // Ожидает подтверждения администратора
    };

    users.push(newUser);
    localStorage.setItem('snt_users', JSON.stringify(users));

    console.log('Регистрация:', newUser);
    toast.success('Регистрация успешно завершена! Теперь вы можете войти в личный кабинет.');
    onSuccess();
  };

  const passwordStrength = validatePassword(formData.password);

  return (
    <section className="max-w-4xl mx-auto">
      <Card className="border-2 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="UserPlus" className="text-white" size={24} />
            </div>
            <div>
              <CardTitle className="text-2xl">Регистрация в СНТ Факел</CardTitle>
              <CardDescription>Заполните все обязательные поля для регистрации</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Личные данные */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon name="User" size={20} className="text-primary" />
                Личные данные
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Отчество</Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => handleChange('middleName', e.target.value)}
                    className={errors.middleName ? 'border-red-500' : ''}
                  />
                  {errors.middleName && <p className="text-xs text-red-500">{errors.middleName}</p>}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Дата рождения</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    className={errors.birthDate ? 'border-red-500' : ''}
                  />
                  {errors.birthDate && <p className="text-xs text-red-500">{errors.birthDate}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Мобильный телефон <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plotNumber">Номер участка <span className="text-red-500">*</span></Label>
                  <Input
                    id="plotNumber"
                    placeholder="42"
                    value={formData.plotNumber}
                    onChange={(e) => handleChange('plotNumber', e.target.value)}
                    className={errors.plotNumber ? 'border-red-500' : ''}
                  />
                  {errors.plotNumber && <p className="text-xs text-red-500">{errors.plotNumber}</p>}
                </div>
              </div>
            </div>

            {/* Данные собственника */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon name="FileText" size={20} className="text-primary" />
                Данные собственника
              </h3>
              
              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                <Checkbox
                  id="ownerIsSame"
                  checked={formData.ownerIsSame}
                  onCheckedChange={(checked) => handleChange('ownerIsSame', checked as boolean)}
                />
                <Label htmlFor="ownerIsSame" className="cursor-pointer font-medium">
                  Я являюсь собственником участка
                </Label>
              </div>

              {!formData.ownerIsSame && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerLastName">Фамилия собственника <span className="text-red-500">*</span></Label>
                    <Input
                      id="ownerLastName"
                      value={formData.ownerLastName}
                      onChange={(e) => handleChange('ownerLastName', e.target.value)}
                      className={errors.ownerLastName ? 'border-red-500' : ''}
                    />
                    {errors.ownerLastName && <p className="text-xs text-red-500">{errors.ownerLastName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerFirstName">Имя собственника <span className="text-red-500">*</span></Label>
                    <Input
                      id="ownerFirstName"
                      value={formData.ownerFirstName}
                      onChange={(e) => handleChange('ownerFirstName', e.target.value)}
                      className={errors.ownerFirstName ? 'border-red-500' : ''}
                    />
                    {errors.ownerFirstName && <p className="text-xs text-red-500">{errors.ownerFirstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerMiddleName">Отчество собственника</Label>
                    <Input
                      id="ownerMiddleName"
                      value={formData.ownerMiddleName}
                      onChange={(e) => handleChange('ownerMiddleName', e.target.value)}
                      className={errors.ownerMiddleName ? 'border-red-500' : ''}
                    />
                    {errors.ownerMiddleName && <p className="text-xs text-red-500">{errors.ownerMiddleName}</p>}
                  </div>
                </div>
              )}

              {(formData.ownerIsSame || formData.ownerLastName) && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="landDocNumber">Номер документа на собственность земли <span className="text-red-500">*</span></Label>
                    <Input
                      id="landDocNumber"
                      placeholder="12-34/567-890"
                      value={formData.landDocNumber}
                      onChange={(e) => handleChange('landDocNumber', e.target.value)}
                      className={errors.landDocNumber ? 'border-red-500' : ''}
                    />
                    {errors.landDocNumber && <p className="text-xs text-red-500">{errors.landDocNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="houseDocNumber">Номер документа на собственность дома <span className="text-red-500">*</span></Label>
                    <Input
                      id="houseDocNumber"
                      placeholder="12-34/567-891"
                      value={formData.houseDocNumber}
                      onChange={(e) => handleChange('houseDocNumber', e.target.value)}
                      className={errors.houseDocNumber ? 'border-red-500' : ''}
                    />
                    {errors.houseDocNumber && <p className="text-xs text-red-500">{errors.houseDocNumber}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Учетные данные */}
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
                  onChange={(e) => handleChange('email', e.target.value)}
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
                      onChange={(e) => handleChange('password', e.target.value)}
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
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
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

            {/* Кнопки */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                size="lg"
              >
                <Icon name="UserPlus" size={20} className="mr-2" />
                Зарегистрироваться
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                size="lg"
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default Registration;