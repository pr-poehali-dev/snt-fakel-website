import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface MeterReadingsDialogsProps {
  showMeterConfirmDialog: boolean;
  setShowMeterConfirmDialog: (show: boolean) => void;
  showConfirmDialog: boolean;
  setShowConfirmDialog: (show: boolean) => void;
  showUnlockDialog: boolean;
  setShowUnlockDialog: (show: boolean) => void;
  plotNumber: string;
  tempMeterNumber: string;
  meterNumber: string;
  reading: string;
  handleConfirmMeterNumber: () => void;
  handleConfirmSubmit: () => void;
  handleUnlockMeterNumber: () => void;
}

const MeterReadingsDialogs = ({
  showMeterConfirmDialog,
  setShowMeterConfirmDialog,
  showConfirmDialog,
  setShowConfirmDialog,
  showUnlockDialog,
  setShowUnlockDialog,
  plotNumber,
  tempMeterNumber,
  meterNumber,
  reading,
  handleConfirmMeterNumber,
  handleConfirmSubmit,
  handleUnlockMeterNumber,
}: MeterReadingsDialogsProps) => {
  return (
    <>
      <Dialog open={showMeterConfirmDialog} onOpenChange={setShowMeterConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Gauge" className="text-blue-500" />
              Подтверждение номера прибора учёта
            </DialogTitle>
            <DialogDescription>
              Проверьте правильность введённого номера ПУ
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Участок:</span>
                <span className="font-semibold">№{plotNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Номер прибора учёта:</span>
                <span className="font-semibold text-lg">{tempMeterNumber}</span>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <Icon name="AlertCircle" size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Внимание!</p>
                  <p>После подтверждения номер ПУ будет сохранён и заблокирован. Изменить его можно будет только через администратора или председателя.</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowMeterConfirmDialog(false)}
            >
              Изменить номер
            </Button>
            <Button
              onClick={handleConfirmMeterNumber}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Icon name="Check" size={18} className="mr-2" />
              Подтвердить номер ПУ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="AlertCircle" className="text-orange-500" />
              Подтверждение данных
            </DialogTitle>
            <DialogDescription>
              Пожалуйста, проверьте правильность введённых данных перед отправкой
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Участок:</span>
                <span className="font-semibold">№{plotNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Номер ПУ:</span>
                <span className="font-semibold">{meterNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Показания:</span>
                <span className="font-semibold text-lg">{reading} кВт⋅ч</span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <Icon name="Info" size={16} className="inline mr-2" />
              После отправки данные нельзя будет изменить в текущем месяце
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Отменить
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            >
              <Icon name="Check" size={18} className="mr-2" />
              Подтвердить отправку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Unlock" className="text-orange-500" />
              Разблокировка номера прибора учёта
            </DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите разблокировать номер ПУ для этого участка?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex gap-2">
                <Icon name="AlertTriangle" size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-1">Внимание!</p>
                  <p>После разблокировки пользователь сможет изменить номер прибора учёта. Текущий номер будет удалён.</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Участок:</span>
                <span className="font-semibold">№{plotNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Текущий номер ПУ:</span>
                <span className="font-semibold">{meterNumber}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUnlockDialog(false)}
            >
              Отменить
            </Button>
            <Button
              onClick={handleUnlockMeterNumber}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Icon name="Unlock" size={18} className="mr-2" />
              Разблокировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MeterReadingsDialogs;
