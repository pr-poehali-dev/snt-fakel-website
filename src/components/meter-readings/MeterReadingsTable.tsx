import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

interface MeterReading {
  id: string;
  email: string;
  plotNumber: string;
  meterNumber: string;
  reading: number;
  date: string;
  month: string;
}

interface MeterReadingsTableProps {
  readings: MeterReading[];
  getUserName: (email: string) => string;
  onEditMeterClick: (reading: MeterReading) => void;
  onUnlockPlot: (plotNumber: string) => void;
}

const MeterReadingsTable = ({ 
  readings, 
  getUserName, 
  onEditMeterClick, 
  onUnlockPlot 
}: MeterReadingsTableProps) => {
  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Участок</TableHead>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Номер ПУ</TableHead>
                  <TableHead>Показания (кВт⋅ч)</TableHead>
                  <TableHead>Дата передачи</TableHead>
                  <TableHead>Месяц</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Нет данных для отображения
                    </TableCell>
                  </TableRow>
                ) : (
                  readings.map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell className="font-medium">{reading.plotNumber}</TableCell>
                      <TableCell>{getUserName(reading.email)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{reading.meterNumber}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{reading.reading}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{reading.date}</TableCell>
                      <TableCell className="text-sm">{reading.month}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEditMeterClick(reading)}
                            title="Редактировать номер ПУ"
                          >
                            <Icon name="Pencil" size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onUnlockPlot(reading.plotNumber)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            title="Разблокировать номер ПУ"
                          >
                            <Icon name="Unlock" size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" className="text-blue-600 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Информация:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Показания принимаются с 22 по 25 число каждого месяца</li>
              <li>После первого ввода номер прибора учёта блокируется автоматически</li>
              <li>Для изменения номера ПУ используйте кнопку редактирования или разблокировки</li>
              <li><Icon name="Pencil" size={14} className="inline" /> — изменить номер ПУ немедленно</li>
              <li><Icon name="Unlock" size={14} className="inline" /> — разблокировать для самостоятельного ввода участником</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default MeterReadingsTable;
