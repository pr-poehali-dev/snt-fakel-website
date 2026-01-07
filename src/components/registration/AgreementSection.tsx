import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

interface AgreementSectionProps {
  agreementAccepted: boolean;
  errors: { [key: string]: string };
  onChange: (field: string, value: boolean) => void;
  onShowAgreement: () => void;
}

const AgreementSection = ({ agreementAccepted, errors, onChange, onShowAgreement }: AgreementSectionProps) => {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Icon name="ShieldCheck" size={20} className="text-primary" />
        Согласие на обработку данных
      </h3>
      <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
        <Checkbox
          id="agreementAccepted"
          checked={agreementAccepted}
          onCheckedChange={(checked) => onChange('agreementAccepted', checked as boolean)}
          className={errors.agreementAccepted ? 'border-red-500' : ''}
        />
        <div className="flex-1">
          <Label htmlFor="agreementAccepted" className="cursor-pointer font-medium">
            Я согласен на обработку персональных данных <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm text-blue-600 hover:text-blue-800"
            onClick={onShowAgreement}
          >
            Прочитать текст согласия
          </Button>
          {errors.agreementAccepted && <p className="text-xs text-red-500 mt-1">{errors.agreementAccepted}</p>}
        </div>
      </div>
    </div>
  );
};

export default AgreementSection;
