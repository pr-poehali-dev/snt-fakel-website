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

interface MeterReadingsHistoryProps {
  readingsHistory: MeterReading[];
}

const MeterReadingsHistory = ({ readingsHistory }: MeterReadingsHistoryProps) => {
  if (readingsHistory.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Icon name="History" size={18} />
        История показаний
      </h4>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {readingsHistory.map((record, index) => (
          <div
            key={record.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              index === 0
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex-1">
              <p className="text-sm font-medium">
                {record.month}
                {index === 0 && (
                  <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                    Текущий
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {record.date}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-700">
                {record.reading} <span className="text-sm font-normal">кВт⋅ч</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeterReadingsHistory;
