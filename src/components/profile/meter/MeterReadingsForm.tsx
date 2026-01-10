import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

interface MeterReadingsFormProps {
  canSubmit: boolean;
  meterNumber: string;
  handleMeterNumberChange: (value: string) => void;
  isMeterLocked: boolean;
  userRole?: string;
  setShowUnlockDialog: (show: boolean) => void;
  meterNumberConfirmed: boolean;
  setMeterNumberConfirmed: (confirmed: boolean) => void;
  reading: string;
  setReading: (value: string) => void;
  confirmed: boolean;
  setConfirmed: (confirmed: boolean) => void;
  handleSubmitClick: () => void;
}

const MeterReadingsForm = ({
  canSubmit,
  meterNumber,
  handleMeterNumberChange,
  isMeterLocked,
  userRole,
  setShowUnlockDialog,
  meterNumberConfirmed,
  setMeterNumberConfirmed,
  reading,
  setReading,
  confirmed,
  setConfirmed,
  handleSubmitClick,
}: MeterReadingsFormProps) => {
  return (
    <>
      <div className={`${canSubmit ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'} border rounded-lg p-3 text-sm`}>
        <Icon name="Info" size={16} className="inline mr-2" />
        {canSubmit 
          ? `Сегодня ${new Date().getDate()} число — период приёма показаний открыт!` 
          : 'Показания принимаются с 22 по 25 число каждого месяца'
        }
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Номер прибора учёта</Label>
          <div className="flex gap-2">
            <Input
              value={meterNumber}
              onChange={(e) => handleMeterNumberChange(e.target.value)}
              disabled={isMeterLocked || meterNumberConfirmed}
              placeholder="Введите номер ПУ"
            />
            {(isMeterLocked || meterNumberConfirmed) && (
              <div className="flex items-center">
                <Icon name="Lock" className="text-muted-foreground" size={20} />
              </div>
            )}
            {isMeterLocked && (userRole === 'admin' || userRole === 'chairman') && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowUnlockDialog(true)}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Icon name="Unlock" size={16} className="mr-1" />
                Разблокировать
              </Button>
            )}
          </div>
          {isMeterLocked && (
            <p className="text-xs text-muted-foreground mt-1">
              Для изменения номера обратитесь к администратору
            </p>
          )}
          {!isMeterLocked && meterNumberConfirmed && (
            <p className="text-xs text-green-600 mt-1">
              Номер подтверждён. После отправки показаний будет заблокирован навсегда.
            </p>
          )}
          {!isMeterLocked && (
            <Button
              type="button"
              variant={meterNumberConfirmed ? "default" : "outline"}
              size="sm"
              onClick={() => setMeterNumberConfirmed(!meterNumberConfirmed)}
              disabled={!meterNumber.trim()}
              className={`mt-2 w-full ${meterNumberConfirmed ? 'bg-green-500 hover:bg-green-600' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}`}
            >
              <Icon name={meterNumberConfirmed ? "CheckCircle2" : "Circle"} size={16} className="mr-2" />
              {meterNumberConfirmed ? 'Номер ПУ подтверждён' : 'Подтвердить правильность номера ПУ'}
            </Button>
          )}
        </div>

        <div>
          <Label>Текущие показания (кВт⋅ч)</Label>
          <Input
            type="number"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            placeholder="Введите показания"
            disabled={!canSubmit}
          />
        </div>
      </div>

      <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <Checkbox
          id="confirm-readings"
          checked={confirmed}
          onCheckedChange={(checked) => setConfirmed(checked as boolean)}
          disabled={!canSubmit}
        />
        <div className="flex-1">
          <label
            htmlFor="confirm-readings"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Подтверждаю правильность переданных показаний
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            Убедитесь, что показания введены корректно. После отправки изменить их будет невозможно.
          </p>
        </div>
      </div>

      <Button
        onClick={handleSubmitClick}
        disabled={!canSubmit || !meterNumber.trim() || !reading.trim() || !confirmed || (!isMeterLocked && !meterNumberConfirmed)}
        className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
      >
        <Icon name="Send" size={18} className="mr-2" />
        Передать показания
      </Button>

      {!canSubmit && (
        <p className="text-sm text-center text-muted-foreground">
          Передача показаний будет доступна с 22 по 25 число месяца
        </p>
      )}
    </>
  );
};

export default MeterReadingsForm;