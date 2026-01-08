import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ImportUsersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

interface ImportedUser {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  phone: string;
  email: string;
  plotNumber: string;
  password: string;
  ownerIsSame: boolean;
  ownerLastName?: string;
  ownerFirstName?: string;
  ownerMiddleName?: string;
  landDocNumber?: string;
  houseDocNumber?: string;
}

const ImportUsersDialog = ({ isOpen, onClose, onImportSuccess }: ImportUsersDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const templateData = [
      {
        'Фамилия*': 'Иванов',
        'Имя*': 'Иван',
        'Отчество': 'Иванович',
        'Дата рождения (ГГГГ-ММ-ДД)*': '1980-01-15',
        'Телефон*': '+79991234567',
        'Email*': 'ivanov@example.com',
        'Номер участка*': '101',
        'Пароль*': 'Password123!',
        'Собственник (да/нет)*': 'да',
        'Фамилия собственника': '',
        'Имя собственника': '',
        'Отчество собственника': '',
        'Номер документа на землю': '',
        'Номер документа на дом': ''
      },
      {
        'Фамилия*': 'Петров',
        'Имя*': 'Петр',
        'Отчество': 'Петрович',
        'Дата рождения (ГГГГ-ММ-ДД)*': '1975-06-20',
        'Телефон*': '+79997654321',
        'Email*': 'petrov@example.com',
        'Номер участка*': '102',
        'Пароль*': 'Secure456@',
        'Собственник (да/нет)*': 'нет',
        'Фамилия собственника': 'Петрова',
        'Имя собственника': 'Мария',
        'Отчество собственника': 'Ивановна',
        'Номер документа на землю': '12345',
        'Номер документа на дом': '67890'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    const columnWidths = [
      { wch: 15 }, // Фамилия
      { wch: 15 }, // Имя
      { wch: 15 }, // Отчество
      { wch: 25 }, // Дата рождения
      { wch: 18 }, // Телефон
      { wch: 25 }, // Email
      { wch: 15 }, // Номер участка
      { wch: 18 }, // Пароль
      { wch: 22 }, // Собственник
      { wch: 20 }, // Фамилия собственника
      { wch: 20 }, // Имя собственника
      { wch: 20 }, // Отчество собственника
      { wch: 25 }, // Документ на землю
      { wch: 25 }  // Документ на дом
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Шаблон');

    XLSX.writeFile(workbook, 'Шаблон_импорта_участников.xlsx');
    toast.success('Шаблон скачан');
  };

  const parseExcelFile = (file: File): Promise<ImportedUser[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const users: ImportedUser[] = jsonData.map((row: any) => {
            const ownerIsSame = (row['Собственник (да/нет)*'] || '').toLowerCase().trim() === 'да';

            return {
              lastName: (row['Фамилия*'] || '').toString().trim(),
              firstName: (row['Имя*'] || '').toString().trim(),
              middleName: (row['Отчество'] || '').toString().trim(),
              birthDate: (row['Дата рождения (ГГГГ-ММ-ДД)*'] || '').toString().trim(),
              phone: (row['Телефон*'] || '').toString().trim(),
              email: (row['Email*'] || '').toString().trim().toLowerCase(),
              plotNumber: (row['Номер участка*'] || '').toString().trim(),
              password: (row['Пароль*'] || '').toString().trim(),
              ownerIsSame: ownerIsSame,
              ownerLastName: ownerIsSame ? '' : (row['Фамилия собственника'] || '').toString().trim(),
              ownerFirstName: ownerIsSame ? '' : (row['Имя собственника'] || '').toString().trim(),
              ownerMiddleName: ownerIsSame ? '' : (row['Отчество собственника'] || '').toString().trim(),
              landDocNumber: (row['Номер документа на землю'] || '').toString().trim(),
              houseDocNumber: (row['Номер документа на дом'] || '').toString().trim()
            };
          });

          resolve(users);
        } catch (error) {
          reject(new Error('Ошибка чтения файла. Проверьте формат Excel.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Ошибка чтения файла'));
      };

      reader.readAsBinaryString(file);
    });
  };

  const validateUser = (user: ImportedUser, index: number): string | null => {
    if (!user.lastName) return `Строка ${index + 2}: Не указана фамилия`;
    if (!user.firstName) return `Строка ${index + 2}: Не указано имя`;
    if (!user.birthDate) return `Строка ${index + 2}: Не указана дата рождения`;
    if (!user.phone) return `Строка ${index + 2}: Не указан телефон`;
    if (!user.email) return `Строка ${index + 2}: Не указан email`;
    if (!user.plotNumber) return `Строка ${index + 2}: Не указан номер участка`;
    if (!user.password) return `Строка ${index + 2}: Не указан пароль`;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return `Строка ${index + 2}: Некорректный email ${user.email}`;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(user.birthDate)) {
      return `Строка ${index + 2}: Некорректная дата рождения (нужен формат ГГГГ-ММ-ДД)`;
    }

    if (!user.ownerIsSame && (!user.ownerLastName || !user.ownerFirstName)) {
      return `Строка ${index + 2}: Не указаны данные собственника`;
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Пожалуйста, выберите файл Excel (.xlsx или .xls)');
      return;
    }

    setIsProcessing(true);
    setErrors([]);
    setImportedCount(0);
    setErrorCount(0);

    try {
      const users = await parseExcelFile(file);

      const validationErrors: string[] = [];
      const validUsers: ImportedUser[] = [];

      users.forEach((user, index) => {
        const error = validateUser(user, index);
        if (error) {
          validationErrors.push(error);
        } else {
          validUsers.push(user);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setErrorCount(validationErrors.length);
      }

      if (validUsers.length === 0) {
        toast.error('Нет валидных записей для импорта');
        setIsProcessing(false);
        return;
      }

      const response = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'bulk_import',
          users: validUsers
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setImportedCount(data.imported || validUsers.length);
        toast.success(`Импортировано пользователей: ${data.imported || validUsers.length}`);
        setTimeout(() => {
          onImportSuccess();
          handleClose();
        }, 2000);
      } else {
        toast.error(data.error || 'Ошибка импорта');
      }

    } catch (error: any) {
      console.error('Ошибка импорта:', error);
      toast.error(error.message || 'Ошибка обработки файла');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClose = () => {
    setImportedCount(0);
    setErrorCount(0);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="FileSpreadsheet" className="text-green-600" size={24} />
            Импорт участников из Excel
          </DialogTitle>
          <DialogDescription>
            Загрузите файл Excel со списком участников СНТ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Icon name="Info" size={16} className="text-blue-600" />
              Инструкция:
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Скачайте шаблон Excel с примерами</li>
              <li>Заполните данные участников по образцу</li>
              <li>Обязательные поля отмечены звёздочкой (*)</li>
              <li>Загрузите заполненный файл</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={downloadTemplate}
              className="flex-1"
            >
              <Icon name="Download" size={18} className="mr-2" />
              Скачать шаблон
            </Button>

            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              {isProcessing ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Icon name="Upload" size={18} className="mr-2" />
                  Загрузить файл
                </>
              )}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />

          {importedCount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <Icon name="CheckCircle" size={20} />
                <span className="font-semibold">
                  Успешно импортировано: {importedCount} пользователей
                </span>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <Icon name="AlertCircle" size={20} />
                <span className="font-semibold">
                  Ошибки валидации ({errorCount}):
                </span>
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportUsersDialog;
