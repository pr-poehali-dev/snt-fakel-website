import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface PersonalDataFormProps {
  formData: {
    lastName: string;
    firstName: string;
    middleName: string;
    birthDate: string;
    phone: string;
    plotNumber: string;
  };
  errors: { [key: string]: string };
  onChange: (field: string, value: string) => void;
}

const PersonalDataForm = ({ formData, errors, onChange }: PersonalDataFormProps) => {
  return (
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
            onChange={(e) => onChange('lastName', e.target.value)}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">Имя <span className="text-red-500">*</span></Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="middleName">Отчество</Label>
          <Input
            id="middleName"
            value={formData.middleName}
            onChange={(e) => onChange('middleName', e.target.value)}
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
            onChange={(e) => onChange('birthDate', e.target.value)}
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
            onChange={(e) => onChange('phone', e.target.value)}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="plotNumber">Номер участка <span className="text-red-500">*</span></Label>
          <Input
            id="plotNumber"
            type="number"
            min="1"
            max="250"
            placeholder="1-250"
            value={formData.plotNumber}
            onChange={(e) => onChange('plotNumber', e.target.value)}
            className={errors.plotNumber ? 'border-red-500' : ''}
          />
          {errors.plotNumber && <p className="text-xs text-red-500">{errors.plotNumber}</p>}
        </div>
      </div>
    </div>
  );
};

export default PersonalDataForm;