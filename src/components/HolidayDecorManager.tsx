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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Button onClick={onBack} variant="outline" size="sm">
          <Icon name="ArrowLeft" size={18} className="mr-2" />
          Назад
        </Button>
        <div className="flex items-center gap-3">
          <div className="text-4xl">✨</div>
          <h1 className="text-2xl sm:text-3xl font-bold">Праздничный декор</h1>
        </div>
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
              <div className="flex gap-2">
                <Input
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  placeholder="🎄"
                  className="text-3xl text-center flex-1"
                  maxLength={4}
                />
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 mt-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {['🎄', '❄️', '⛄', '☃️', '🎅', '🤶', '🎁', '🔔', '🕯️', '🧦', '🎉', '🎊', '🎈', '🎀', '🎂', '🍰', '🥳', '🪅', '💖', '❤️', '💝', '💕', '💗', '💓', '💞', '💘', '🌹', '🌷', '💐', '🌺', '🌸', '🌼', '🌻', '🌵', '🍀', '☘️', '🌿', '🍃', '🎃', '👻', '💀', '🦇', '🕷️', '🕸️', '🧙', '🧛', '🧟', '🦃', '🍂', '🍁', '🥧', '🐰', '🥚', '🐣', '🐥', '🌱', '🎆', '🎇', '✨', '⭐', '🌟', '💫', '🌠', '🎭', '🎨', '🎪', '🎡', '🎢', '🎠', '🚀', '🛸', '🌈', '☀️', '🌙', '⚡', '🔥', '💧', '🌊', '🎵', '🎶', '🎸', '🎹', '🎺', '🎷', '🥁', '🏆', '🥇', '🏅', '🎖️', '👑', '💎', '💰', '🎓', '📚', '✏️', '🖊️', '🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍩', '🍪', '🍬', '🍭', '🍫', '🍦', '🍧', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🪖', '🎗️', '🕊️', '🏵️', '🔴', '⚪', '🔵', '🟥', '⬜', '🟦', '🇷🇺'].map((emoji, index) => (
                  <button
                    key={`${emoji}-${index}`}
                    type="button"
                    onClick={() => setFormData({ ...formData, emoji })}
                    className={`text-3xl p-2 rounded hover:bg-gray-100 transition-colors ${formData.emoji === emoji ? 'bg-primary/10 ring-2 ring-primary' : ''}`}
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
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
            <Label>Анимация</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {[
                { value: 'falling-emoji', label: '⬇️ Падение', desc: 'Обычное падение' },
                { value: 'snowflake', label: '❄️ Снегопад', desc: 'Плавное падение со смещением' },
                { value: 'confetti', label: '🎊 Конфетти', desc: 'Вращение при падении' },
                { value: 'hearts', label: '💖 Полёт', desc: 'Плавное движение вверх-вниз' },
                { value: 'spiral', label: '🌀 Спираль', desc: 'Вращение по спирали' },
                { value: 'bounce', label: '🎾 Прыжки', desc: 'Прыгающее движение' },
                { value: 'zigzag', label: '⚡ Зигзаг', desc: 'Движение зигзагом' },
                { value: 'fade-in-out', label: '✨ Мерцание', desc: 'Плавное появление и исчезновение' },
                { value: 'wave', label: '🌊 Волны', desc: 'Движение волной' },
                { value: 'fireworks', label: '🎆 Салют', desc: 'Разлёт как салют' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, cssClass: option.value })}
                  className={`p-3 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                    formData.cssClass === option.value 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={option.desc}
                >
                  <div className="font-semibold text-sm mb-1">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.desc}</div>
                </button>
              ))}
            </div>
            <Input
              value={formData.cssClass}
              onChange={(e) => setFormData({ ...formData, cssClass: e.target.value })}
              placeholder="Или введите свой класс"
              className="mt-2"
            />
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
              <Card key={decor.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                      <div className="text-5xl flex-shrink-0">{decor.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
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
                            Класс: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{decor.cssClass}</code>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        onClick={() => toggleActive(decor.id)}
                        variant="ghost"
                        size="sm"
                        title={decor.isActive ? 'Отключить' : 'Включить'}
                        className="hover:bg-gray-100"
                      >
                        <Icon name={decor.isActive ? 'Eye' : 'EyeOff'} size={16} />
                      </Button>
                      <Button
                        onClick={() => handleEdit(decor)}
                        variant="ghost"
                        size="sm"
                        title="Редактировать"
                        className="hover:bg-blue-50 hover:text-blue-600"
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