import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface AppealFormProps {
  subject: string;
  setSubject: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const AppealForm = ({
  subject,
  setSubject,
  message,
  setMessage,
  onSubmit,
  onCancel
}: AppealFormProps) => {
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="gap-2"
        >
          <Icon name="ArrowLeft" size={18} />
          Назад
        </Button>
        <h2 className="text-4xl font-bold">Новое обращение</h2>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Обращение в правление СНТ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Тема обращения</label>
            <Input
              placeholder="Кратко опишите суть обращения"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Сообщение</label>
            <Textarea
              placeholder="Подробно опишите вашу проблему или вопрос..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
            />
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-900">
              <strong>Обратите внимание:</strong> Ваше обращение будет видно всем членам правления. 
              Пожалуйста, излагайте суть вопроса чётко и корректно.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onSubmit} className="gap-2">
              <Icon name="Send" size={18} />
              Отправить обращение
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default AppealForm;
