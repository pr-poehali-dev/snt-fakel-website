import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import PersonalDataAgreement from './PersonalDataAgreement';
import PersonalDataForm from './registration/PersonalDataForm';
import OwnerDataForm from './registration/OwnerDataForm';
import AccountDataForm from './registration/AccountDataForm';
import AgreementSection from './registration/AgreementSection';
import EmailVerification from './EmailVerification';
import PhoneVerification from './PhoneVerification';

interface RegistrationProps {
  onSuccess: (email: string, role: string) => void;
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
    houseDocNumber: '',
    agreementAccepted: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAgreement, setShowAgreement] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Нормализация телефона для сравнения (оставляем только цифры)
  const normalizePhone = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'ownerIsSame' && value === true) {
        updated.ownerLastName = prev.lastName;
        updated.ownerFirstName = prev.firstName;
        updated.ownerMiddleName = prev.middleName;
      }
      
      if (field === 'ownerIsSame' && value === false) {
        updated.ownerLastName = '';
        updated.ownerFirstName = '';
        updated.ownerMiddleName = '';
        updated.landDocNumber = '';
        updated.houseDocNumber = '';
      }

      return updated;
    });
    
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
    
    if (password.length < 8) {
      errors.push('Минимум 8 символов');
    }
    
    if (!/[а-яё]/i.test(password)) {
      errors.push('Должна быть хотя бы одна русская буква');
    }
    
    if (!/[А-ЯЁ]/.test(password)) {
      errors.push('Должна быть хотя бы одна заглавная русская буква');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Должна быть хотя бы одна цифра');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Должен быть хотя бы один символ (!@#$%^&* и т.д.)');
    }
    
    return { valid: errors.length === 0, errors };
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.lastName.trim()) newErrors.lastName = 'Обязательное поле';
    if (!formData.firstName.trim()) newErrors.firstName = 'Обязательное поле';
    if (!formData.phone.trim()) newErrors.phone = 'Обязательное поле';
    if (!formData.email.trim()) newErrors.email = 'Обязательное поле';
    if (!formData.plotNumber.trim()) newErrors.plotNumber = 'Обязательное поле';
    if (!formData.password) newErrors.password = 'Обязательное поле';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Обязательное поле';
    if (!formData.agreementAccepted) newErrors.agreementAccepted = 'Необходимо согласие на обработку данных';

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Некорректный номер (должен быть 11 цифр)';
    }

    if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.errors.join('; ');
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

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

    if (!formData.ownerIsSame) {
      if (!formData.ownerLastName.trim()) newErrors.ownerLastName = 'Обязательное поле';
      if (!formData.ownerFirstName.trim()) newErrors.ownerFirstName = 'Обязательное поле';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveUserToDatabase = async () => {
    // Проверка уже выполнена в handleSubmit, сразу сохраняем
    const newUser = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName,
      phone: formData.phone,
      plotNumber: formData.plotNumber,
      birthDate: formData.birthDate || null,
      role: 'member',
      status: 'active',
      ownerIsSame: formData.ownerIsSame,
      isPlotOwner: formData.ownerIsSame,
      ownerFirstName: formData.ownerFirstName || null,
      ownerLastName: formData.ownerLastName || null,
      ownerMiddleName: formData.ownerMiddleName || null,
      landDocNumber: formData.landDocNumber || null,
      houseDocNumber: formData.houseDocNumber || null,
      emailVerified: true,
      phoneVerified: false,
      registeredAt: new Date().toISOString()
    };

    try {
      const response = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || 'Ошибка регистрации');
        return;
      }
      
      if (data.error) {
        toast.error(`Ошибка регистрации: ${data.error}`);
        return;
      }
      
      console.log('Пользователь сохранен в БД:', data);
      
      // Отправляем уведомление администратору
      fetch('https://functions.poehali.dev/92ff7699-756a-4d4c-b3ab-dceb5c33e4f8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'admin_registration', user_data: newUser })
      }).catch(error => {
        console.warn('Ошибка отправки уведомления администратору:', error);
      });
      
      toast.success('Регистрация завершена! Добро пожаловать!');
      onSuccess(formData.email, 'member');
    } catch (error) {
      console.error('Ошибка сохранения пользователя в БД:', error);
      toast.error('Ошибка регистрации. Попробуйте позже.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    // КРИТИЧНО: Проверяем базу ПЕРЕД показом окна подтверждения email
    try {
      const usersResponse = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35');
      const usersData = await usersResponse.json();
      const existingUsers = usersData.users || [];
      
      const emailExists = existingUsers.find((u: any) => u.email.toLowerCase() === formData.email.toLowerCase());
      if (emailExists) {
        toast.error('Пользователь с таким email уже зарегистрирован');
        setErrors({ ...errors, email: 'Email уже используется' });
        return;
      }
      
      const normalizedFormPhone = normalizePhone(formData.phone);
      const phoneExists = existingUsers.find((u: any) => normalizePhone(u.phone) === normalizedFormPhone);
      if (phoneExists) {
        toast.error('Пользователь с таким номером телефона уже зарегистрирован');
        setErrors({ ...errors, phone: 'Номер телефона уже используется' });
        return;
      }
      
      // КРИТИЧЕСКАЯ ПРОВЕРКА: если пользователь указывает себя собственником
      if (formData.ownerIsSame) {
        const plotOwner = existingUsers.find((u: any) => u.plot_number === formData.plotNumber && u.is_plot_owner === true);
        
        if (plotOwner) {
          const ownerName = `${plotOwner.last_name} ${plotOwner.first_name} ${plotOwner.middle_name || ''}`.trim();
          toast.error(`Участок №${formData.plotNumber} уже имеет собственника: ${ownerName}`);
          setErrors({ ...errors, plotNumber: 'У этого участка уже есть собственник' });
          return;
        }
      }
    } catch (error) {
      console.error('Ошибка проверки данных:', error);
      toast.error('Ошибка проверки данных. Попробуйте позже.');
      return;
    }

    if (!emailVerified) {
      setShowEmailVerification(true);
      return;
    }

    saveUserToDatabase();
  };

  const passwordStrength = validatePassword(formData.password);

  if (showEmailVerification) {
    return (
      <EmailVerification
        email={formData.email}
        onVerified={() => {
          setEmailVerified(true);
          setShowEmailVerification(false);
          toast.success('Email подтверждён');
          saveUserToDatabase();
        }}
        onCancel={() => setShowEmailVerification(false)}
      />
    );
  }

  if (showPhoneVerification) {
    return (
      <PhoneVerification
        phone={formData.phone}
        onVerified={() => {
          setPhoneVerified(true);
          setShowPhoneVerification(false);
          toast.success('Телефон подтверждён');
          handleSubmit(new Event('submit') as any);
        }}
        onCancel={() => setShowPhoneVerification(false)}
      />
    );
  }

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
            <PersonalDataForm
              formData={{
                lastName: formData.lastName,
                firstName: formData.firstName,
                middleName: formData.middleName,
                birthDate: formData.birthDate,
                phone: formData.phone,
                plotNumber: formData.plotNumber
              }}
              errors={errors}
              onChange={handleChange}
            />

            <OwnerDataForm
              formData={{
                ownerIsSame: formData.ownerIsSame,
                ownerLastName: formData.ownerLastName,
                ownerFirstName: formData.ownerFirstName,
                ownerMiddleName: formData.ownerMiddleName,
                landDocNumber: formData.landDocNumber,
                houseDocNumber: formData.houseDocNumber
              }}
              errors={errors}
              onChange={handleChange}
            />

            <AccountDataForm
              formData={{
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
              }}
              errors={errors}
              passwordStrength={passwordStrength}
              onChange={handleChange}
            />

            <AgreementSection
              agreementAccepted={formData.agreementAccepted}
              errors={errors}
              onChange={handleChange}
              onShowAgreement={() => setShowAgreement(true)}
            />

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
      {showAgreement && <PersonalDataAgreement onClose={() => setShowAgreement(false)} />}
    </section>
  );
};

export default Registration;