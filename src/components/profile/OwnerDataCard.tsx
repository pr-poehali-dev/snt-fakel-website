import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface OwnerData {
  ownerLastName: string;
  ownerFirstName: string;
  ownerMiddleName: string;
  landDocNumber: string;
  houseDocNumber: string;
}

interface OwnerDataCardProps {
  ownerData: OwnerData;
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

const OwnerDataCard = ({ ownerData, isEditing, onChange }: OwnerDataCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Icon name="FileText" size={20} className="text-primary" />
          Данные собственника
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Фамилия собственника</Label>
            {isEditing ? (
              <Input 
                value={ownerData.ownerLastName} 
                onChange={(e) => onChange('ownerLastName', e.target.value)}
              />
            ) : (
              <p className="text-lg">{ownerData.ownerLastName || '—'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Имя собственника</Label>
            {isEditing ? (
              <Input 
                value={ownerData.ownerFirstName} 
                onChange={(e) => onChange('ownerFirstName', e.target.value)}
              />
            ) : (
              <p className="text-lg">{ownerData.ownerFirstName || '—'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Отчество собственника</Label>
            {isEditing ? (
              <Input 
                value={ownerData.ownerMiddleName} 
                onChange={(e) => onChange('ownerMiddleName', e.target.value)}
              />
            ) : (
              <p className="text-lg">{ownerData.ownerMiddleName || '—'}</p>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label>Номер документа на собственность земли</Label>
            {isEditing ? (
              <Input 
                value={ownerData.landDocNumber} 
                onChange={(e) => onChange('landDocNumber', e.target.value)}
                placeholder="12-34/567-890"
              />
            ) : (
              <p className="text-lg">{ownerData.landDocNumber || '—'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Номер документа на собственность дома</Label>
            {isEditing ? (
              <Input 
                value={ownerData.houseDocNumber} 
                onChange={(e) => onChange('houseDocNumber', e.target.value)}
                placeholder="12-34/567-891"
              />
            ) : (
              <p className="text-lg">{ownerData.houseDocNumber || '—'}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OwnerDataCard;
