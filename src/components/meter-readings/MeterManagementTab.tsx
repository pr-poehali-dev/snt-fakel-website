import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PlotData {
  plotNumber: string;
  meterNumber: string;
  users: Array<{ email: string; fullName: string }>;
  lastReading?: { value: number; date: string; submittedBy: string };
}

interface MeterManagementTabProps {
  plotsData: PlotData[];
  onUnlockPlot: (plotNumber: string) => void;
}

const MeterManagementTab = ({ plotsData, onUnlockPlot }: MeterManagementTabProps) => {
  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Участок</TableHead>
              <TableHead>Номер ПУ</TableHead>
              <TableHead>Пользователи</TableHead>
              <TableHead className="w-[120px] text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plotsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  <Icon name="Search" className="mx-auto mb-2" size={32} />
                  <p>Нет данных о приборах учёта</p>
                </TableCell>
              </TableRow>
            ) : (
              plotsData.map((plot) => (
                <TableRow key={plot.plotNumber}>
                  <TableCell className="font-medium">№{plot.plotNumber}</TableCell>
                  <TableCell>
                    {plot.meterNumber ? (
                      <div className="flex items-center gap-2">
                        <Icon name="Lock" size={16} className="text-muted-foreground" />
                        <span className="font-mono">{plot.meterNumber}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Не указан</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {plot.users.map((user, idx) => (
                        <div key={idx} className="text-sm">
                          {user.fullName}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {plot.meterNumber ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUnlockPlot(plot.plotNumber)}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <Icon name="Unlock" size={16} className="mr-1" />
                        Разблокировать
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Важная информация:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Номер ПУ автоматически синхронизируется между всеми пользователями участка</li>
              <li>После разблокировки пользователь сможет изменить номер ПУ</li>
              <li>Новый номер ПУ будет доступен всем пользователям участка</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default MeterManagementTab;
