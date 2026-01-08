import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface CreateVotingProps {
  onBack?: () => void;
}

const CreateVoting = ({ onBack }: CreateVotingProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    } else {
      toast.error('Максимум 10 вариантов ответа');
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    } else {
      toast.error('Минимум 2 варианта ответа');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Введите название голосования');
      return;
    }

    if (!description.trim()) {
      toast.error('Введите описание голосования');
      return;
    }

    if (!endDate) {
      toast.error('Укажите дату окончания голосования');
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('Необходимо минимум 2 варианта ответа');
      return;
    }

    const votingData = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      endDate,
      options: validOptions,
      isMultipleChoice,
      createdAt: new Date().toISOString(),
      votes: {},
      status: 'active'
    };

    const votingsJSON = localStorage.getItem('snt_votings');
    const votings = votingsJSON ? JSON.parse(votingsJSON) : [];
    votings.push(votingData);
    localStorage.setItem('snt_votings', JSON.stringify(votings));

    window.dispatchEvent(new Event('votings-updated'));

    const sendNotifications = async () => {
      try {
        const usersResponse = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35');
        const usersData = await usersResponse.json();
        const activeUsers = usersData.users?.filter((u: any) => u.status === 'active' && u.email_verified) || [];

        for (const user of activeUsers) {
          await fetch('https://functions.poehali.dev/2672fb97-4151-4228-bb1c-4d0b3a502216', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: user.email,
              subject: `Новое голосование: ${title.trim()}`,
              html: `
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"></head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                    <h2 style="color: #6366f1;">🗳️ Новое голосование в СНТ Факел</h2>
                    <p>Здравствуйте, ${user.first_name}!</p>
                    <p>Создано новое голосование, в котором вы можете принять участие:</p>
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin-top: 0; color: #6366f1;">${title.trim()}</h3>
                      <p>${description.trim()}</p>
                      <p><strong>Дата окончания:</strong> ${new Date(endDate).toLocaleDateString('ru-RU')}</p>
                      <p><strong>Варианты ответа:</strong></p>
                      <ul>
                        ${validOptions.map(opt => `<li>${opt}</li>`).join('')}
                      </ul>
                    </div>
                    <p>Пройдите на сайт СНТ Факел, чтобы проголосовать.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">СНТ Факел - Система управления садовым товариществом</p>
                  </div>
                </body>
                </html>
              `
            })
          });
        }
      } catch (error) {
        console.error('Error sending notifications:', error);
      }
    };

    sendNotifications();

    toast.success('Голосование создано и разослано всем участникам');
    
    setTitle('');
    setDescription('');
    setEndDate('');
    setOptions(['', '']);
    setIsMultipleChoice(false);
    
    if (onBack) {
      onBack();
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <Icon name="ArrowLeft" size={18} />
              Назад
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="Vote" className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-4xl font-bold">Создать голосование</h2>
              <p className="text-muted-foreground">Создайте новое голосование для членов СНТ</p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Параметры голосования</CardTitle>
          <CardDescription>Заполните все поля для создания голосования</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Название голосования <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Благоустройство территории"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Описание <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Подробное описание вопроса голосования..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                maxLength={1000}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Дата окончания <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={today}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  Варианты ответа <span className="text-red-500">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={options.length >= 10}
                >
                  <Icon name="Plus" size={16} className="mr-1" />
                  Добавить вариант
                </Button>
              </div>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Вариант ${index + 1}`}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      maxLength={200}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="multipleChoice"
                checked={isMultipleChoice}
                onChange={(e) => setIsMultipleChoice(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="multipleChoice" className="text-sm">
                Разрешить выбор нескольких вариантов
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                <Icon name="CheckCircle" size={18} className="mr-2" />
                Создать голосование
              </Button>
              {onBack && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                >
                  Отмена
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default CreateVoting;