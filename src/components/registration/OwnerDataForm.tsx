import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

interface OwnerDataFormProps {
  formData: {
    ownerIsSame: boolean;
    ownerLastName: string;
    ownerFirstName: string;
    ownerMiddleName: string;
    landDocNumber: string;
    houseDocNumber: string;
  };
  errors: { [key: string]: string };
  onChange: (field: string, value: string | boolean) => void;
}

const OwnerDataForm = ({ formData, errors, onChange }: OwnerDataFormProps) => {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Icon name="FileText" size={20} className="text-primary" />
        Данные собственника
      </h3>
      
      <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
        <Checkbox
          id="ownerIsSame"
          checked={formData.ownerIsSame}
          onCheckedChange={(checked) => onChange('ownerIsSame', checked as boolean)}
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
              onChange={(e) => onChange('ownerLastName', e.target.value)}
              className={errors.ownerLastName ? 'border-red-500' : ''}
            />
            {errors.ownerLastName && <p className="text-xs text-red-500">{errors.ownerLastName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerFirstName">Имя собственника <span className="text-red-500">*</span></Label>
            <Input
              id="ownerFirstName"
              value={formData.ownerFirstName}
              onChange={(e) => onChange('ownerFirstName', e.target.value)}
              className={errors.ownerFirstName ? 'border-red-500' : ''}
            />
            {errors.ownerFirstName && <p className="text-xs text-red-500">{errors.ownerFirstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerMiddleName">Отчество собственника</Label>
            <Input
              id="ownerMiddleName"
              value={formData.ownerMiddleName}
              onChange={(e) => onChange('ownerMiddleName', e.target.value)}
              className={errors.ownerMiddleName ? 'border-red-500' : ''}
            />
            {errors.ownerMiddleName && <p className="text-xs text-red-500">{errors.ownerMiddleName}</p>}
          </div>
        </div>
      )}

      {formData.ownerIsSame && (
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="landDocNumber">Номер документа на собственность земли</Label>
            <Input
              id="landDocNumber"
              placeholder="12-34/567-890"
              value={formData.landDocNumber}
              onChange={(e) => onChange('landDocNumber', e.target.value)}
              className={errors.landDocNumber ? 'border-red-500' : ''}
            />
            {errors.landDocNumber && <p className="text-xs text-red-500">{errors.landDocNumber}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="houseDocNumber">Номер документа на собственность дома</Label>
            <Input
              id="houseDocNumber"
              placeholder="12-34/567-891"
              value={formData.houseDocNumber}
              onChange={(e) => onChange('houseDocNumber', e.target.value)}
              className={errors.houseDocNumber ? 'border-red-500' : ''}
            />
            {errors.houseDocNumber && <p className="text-xs text-red-500">{errors.houseDocNumber}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDataForm;