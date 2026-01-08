import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface DecorElement {
  id: number;
  name: string;
  emoji: string;
  cssClass: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface HolidayDecorManagerProps {
  onBack: () => void;
}

const HolidayDecorManager = ({ onBack }: HolidayDecorManagerProps) => {
  const [decors, setDecors] = useState<DecorElement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🎄',
    cssClass: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadDecors();
  }, []);

  const loadDecors = () => {
    const saved = localStorage.getItem('snt_holiday_decors');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDecors(parsed);
      } catch (e) {
        console.error('Error loading decors:', e);
      }
    }
  };

  const saveDecors = (updatedDecors: DecorElement[]) => {
    localStorage.setItem('snt_holiday_decors', JSON.stringify(updatedDecors));
    setDecors(updatedDecors);
    window.dispatchEvent(new CustomEvent('decor-updated'));
  };

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.emoji.trim() || !formData.startDate || !formData.endDate) {
      toast.error('Заполните все поля');
      return;
    }

    const newDecor: DecorElement = {
      id: Date.now(),
      name: formData.name,
      emoji: formData.emoji,
      cssClass: formData.cssClass,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: true
    };

    const updatedDecors = [...decors, newDecor];
    saveDecors(updatedDecors);
    resetForm();
    toast.success('Декор добавлен');
  };

  const handleEdit = (decor: DecorElement) => {
    setIsEditing(true);
    setEditingId(decor.id);
    setFormData({
      name: decor.name,
      emoji: decor.emoji,
      cssClass: decor.cssClass,
      startDate: decor.startDate,
      endDate: decor.endDate
    });
  };

  const handleUpdate = () => {
    if (!formData.name.trim() || !formData.emoji.trim() || !formData.startDate || !formData.endDate) {
      toast.error('Заполните все поля');
      return;
    }

    const updatedDecors = decors.map(decor =>
      decor.id === editingId
        ? { ...decor, ...formData }
        : decor
    );

    saveDecors(updatedDecors);
    resetForm();
    toast.success('Декор обновлён');
  };

  const handleDelete = (id: number) => {
    const confirmed = window.confirm('Удалить этот элемент декора?');
    if (!confirmed) return;

    const updatedDecors = decors.filter(d => d.id !== id);
    saveDecors(updatedDecors);
    toast.success('Декор удалён');
  };

  const toggleActive = (id: number) => {
    const updatedDecors = decors.map(d =>
      d.id === id ? { ...d, isActive: !d.isActive } : d
    );
    saveDecors(updatedDecors);
    toast.success('Статус изменён');
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      emoji: '🎄',
      cssClass: '',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="outline">
          <Icon name="ArrowLeft" size={18} className="mr-2" />
          Назад
        </Button>
        <h1 className="text-3xl font-bold">Праздничный декор</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Sparkles" className="text-primary" />
            {isEditing ? 'Редактировать декор' : 'Добавить праздничный декор'}
          </CardTitle>
          <CardDescription>
            Добавляйте праздничные элементы (снежинки, конфетти, сердечки и т.д.) на главную страницу
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Название праздника</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Новый год, 8 марта и т.д."
              />
            </div>

            <div className="space-y-2">
              <Label>Эмодзи / Символ</Label>
              <Input
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                placeholder="🎄 ❄️ 🎉 💖 🎈"
                className="text-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Дата начала</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Дата окончания</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>CSS класс (необязательно)</Label>
            <Input
              value={formData.cssClass}
              onChange={(e) => setFormData({ ...formData, cssClass: e.target.value })}
              placeholder="snowflake, confetti, hearts"
            />
            <p className="text-xs text-muted-foreground">
              Для кастомной анимации. Стандартные: snowflake (падающий снег), confetti (конфетти), hearts (сердечки)
            </p>
          </div>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleUpdate} 
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить изменения
                </Button>
                <Button onClick={resetForm} variant="outline">
                  <Icon name="X" size={18} className="mr-2" />
                  Отмена
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleAdd} 
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить декор
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Активные декоры ({decors.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {decors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Sparkles" size={48} className="mx-auto mb-4 opacity-20" />
              <p>Праздничных декоров пока нет</p>
            </div>
          ) : (
            decors.map((decor) => (
              <Card key={decor.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-5xl">{decor.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{decor.name}</h3>
                          <Badge variant={decor.isActive ? 'default' : 'secondary'}>
                            {decor.isActive ? 'Активен' : 'Отключён'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(decor.startDate).toLocaleDateString('ru-RU')} — {new Date(decor.endDate).toLocaleDateString('ru-RU')}
                        </p>
                        {decor.cssClass && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Класс: <code className="bg-gray-100 px-1 rounded">{decor.cssClass}</code>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleActive(decor.id)}
                        variant="ghost"
                        size="sm"
                        title={decor.isActive ? 'Отключить' : 'Включить'}
                      >
                        <Icon name={decor.isActive ? 'Eye' : 'EyeOff'} size={16} />
                      </Button>
                      <Button
                        onClick={() => handleEdit(decor)}
                        variant="ghost"
                        size="sm"
                        title="Редактировать"
                      >
                        <Icon name="Pencil" size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(decor.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Удалить"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HolidayDecorManager;
