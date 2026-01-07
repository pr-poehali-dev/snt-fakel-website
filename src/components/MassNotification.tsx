import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const MassNotification = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [isSending, setIsSending] = useState(false);

  const getRecipients = () => {
    const usersJSON = localStorage.getItem('snt_users');
    if (!usersJSON) return [];
    
    const users = JSON.parse(usersJSON);
    const activeUsers = users.filter((u: any) => u.status === 'active' && u.role !== 'admin');
    
    if (selectedRecipients === 'all') {
      return activeUsers;
    }
    
    return activeUsers.filter((u: any) => {
      const paymentStatus = u.paymentStatus || 'unpaid';
      return paymentStatus === selectedRecipients;
    });
  };

  const recipients = getRecipients();

  const recipientOptions = [
    { value: 'all', label: 'Всем участникам', icon: 'Users', color: 'bg-blue-100 text-blue-800' },
    { value: 'paid', label: 'Оплатившим взносы', icon: 'CheckCircle', color: 'bg-green-100 text-green-800' },
    { value: 'unpaid', label: 'Не оплатившим взносы', icon: 'XCircle', color: 'bg-red-100 text-red-800' },
    { value: 'partial', label: 'Частично оплатившим', icon: 'AlertCircle', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Заполните тему и текст сообщения');
      return;
    }

    if (recipients.length === 0) {
      toast.error('Нет получателей для отправки');
      return;
    }

    const confirmed = window.confirm(
      `Отправить письмо на ${recipients.length} ${recipients.length === 1 ? 'адрес' : 'адресов'}?`
    );

    if (!confirmed) return;

    setIsSending(true);

    try {
      const emailList = recipients.map((u: any) => ({
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        plotNumber: u.plotNumber
      }));

      const response = await fetch('https://functions.poehali.dev/5ac0ef97-9284-4e76-8898-7c4815df6101', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipients: emailList,
          subject,
          message
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка отправки');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Успешно отправлено писем: ${result.sent}`);
        setSubject('');
        setMessage('');
        setSelectedRecipients('all');
      } else {
        toast.error('Ошибка отправки рассылки');
      }
    } catch (error) {
      console.error('Mass notification error:', error);
      toast.error('Не удалось отправить рассылку. Проверьте настройки SMTP.');
    } finally {
      setIsSending(false);
    }
  };

  const insertTemplate = (template: string) => {
    const templates: Record<string, { subject: string; message: string }> = {
      meeting: {
        subject: 'Уведомление о собрании СНТ "Факел"',
        message: `Уважаемые садоводы!

Уведомляем вас о проведении общего собрания членов СНТ "Факел".

Дата: [укажите дату]
Время: [укажите время]
Место: [укажите место]

Повестка дня:
1. [Первый вопрос]
2. [Второй вопрос]
3. [Третий вопрос]

Просим всех участников присутствовать лично или через доверенное лицо.

С уважением,
Правление СНТ "Факел"`
      },
      payment: {
        subject: 'Напоминание об оплате членских взносов',
        message: `Уважаемые садоводы!

Напоминаем о необходимости оплаты членских взносов за текущий период.

Сумма взноса: [укажите сумму]
Срок оплаты: до [укажите дату]

Реквизиты для оплаты:
[Укажите реквизиты]

Спасибо за своевременную оплату!

С уважением,
Правление СНТ "Факел"`
      },
      announcement: {
        subject: 'Важная информация для членов СНТ "Факел"',
        message: `Уважаемые садоводы!

[Ваше объявление]

С уважением,
Правление СНТ "Факел"`
      }
    };

    const selectedTemplate = templates[template];
    if (selectedTemplate) {
      setSubject(selectedTemplate.subject);
      setMessage(selectedTemplate.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Mail" className="text-primary" />
            Массовая рассылка уведомлений
          </CardTitle>
          <CardDescription>
            Отправка email-уведомлений участникам СНТ о собраниях, взносах и важных событиях
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Шаблоны */}
          <div className="space-y-2">
            <Label>Быстрые шаблоны</Label>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => insertTemplate('meeting')} variant="outline" size="sm">
                <Icon name="Calendar" size={16} className="mr-2" />
                Собрание
              </Button>
              <Button onClick={() => insertTemplate('payment')} variant="outline" size="sm">
                <Icon name="DollarSign" size={16} className="mr-2" />
                Напоминание об оплате
              </Button>
              <Button onClick={() => insertTemplate('announcement')} variant="outline" size="sm">
                <Icon name="Megaphone" size={16} className="mr-2" />
                Объявление
              </Button>
            </div>
          </div>

          {/* Выбор получателей */}
          <div className="space-y-2">
            <Label>Получатели</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recipientOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedRecipients(option.value as any)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRecipients === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name={option.icon as any} size={20} className="text-gray-600" />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <Badge className={option.color}>
                      {recipients.length}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Тема письма */}
          <div className="space-y-2">
            <Label>Тема письма</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Введите тему письма"
              maxLength={200}
            />
          </div>

          {/* Текст сообщения */}
          <div className="space-y-2">
            <Label>Текст сообщения</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Введите текст сообщения..."
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Письмо будет отправлено в виде обычного текста. Переносы строк сохраняются.
            </p>
          </div>

          {/* Предпросмотр получателей */}
          {recipients.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Письмо будет отправлено на {recipients.length} {recipients.length === 1 ? 'адрес' : 'адресов'}
                </span>
                <Icon name="Users" size={18} className="text-gray-500" />
              </div>
              {recipients.length <= 10 && (
                <div className="text-xs text-gray-600 space-y-1">
                  {recipients.map((u: any) => (
                    <div key={u.email}>
                      • {u.lastName} {u.firstName} ({u.email}) - участок №{u.plotNumber}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Кнопка отправки */}
          <div className="flex gap-3">
            <Button
              onClick={handleSend}
              disabled={isSending || !subject.trim() || !message.trim() || recipients.length === 0}
              className="flex-1"
              size="lg"
            >
              {isSending ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Icon name="Send" size={18} className="mr-2" />
                  Отправить рассылку ({recipients.length})
                </>
              )}
            </Button>
          </div>

          {/* Предупреждение */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Icon name="AlertTriangle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Важно:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Убедитесь, что SMTP настроен в секретах проекта</li>
                  <li>Проверьте текст перед отправкой - отменить рассылку будет невозможно</li>
                  <li>Рассылка может занять несколько минут при большом количестве получателей</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MassNotification;