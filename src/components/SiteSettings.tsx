import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  benefits: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  about: {
    title: string;
    description: string;
  };
  blockOrder: string[];
}

interface SiteSettingsProps {
  onBack?: () => void;
}

const defaultContent: HomePageContent = {
  hero: {
    title: 'СНТ "Факел"',
    subtitle: 'Нижний Новгород',
    description: 'Добро пожаловать на официальный сайт садоводческого некоммерческого товарищества "Факел"'
  },
  benefits: [
    {
      id: 'benefit1',
      title: 'Электронные голосования',
      description: 'Участвуйте в принятии решений онлайн',
      icon: 'Vote'
    },
    {
      id: 'benefit2',
      title: 'База документов',
      description: 'Все важные документы в одном месте',
      icon: 'FileText'
    },
    {
      id: 'benefit3',
      title: 'Новости и объявления',
      description: 'Будьте в курсе всех событий',
      icon: 'Newspaper'
    },
    {
      id: 'benefit4',
      title: 'Личный кабинет',
      description: 'Управление своими данными',
      icon: 'User'
    }
  ],
  about: {
    title: 'О нашем товариществе',
    description: 'СНТ "Факел" - это современное садоводческое товарищество с развитой инфраструктурой и активным управлением.'
  },
  blockOrder: ['hero', 'benefits', 'about']
};

const SiteSettings = ({ onBack }: SiteSettingsProps) => {
  const [content, setContent] = useState<HomePageContent>(defaultContent);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

  useEffect(() => {
    const savedContent = localStorage.getItem('site_content');
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent));
      } catch (e) {
        console.error('Error loading site content:', e);
      }
    }
  }, []);

  const saveContent = () => {
    localStorage.setItem('site_content', JSON.stringify(content));
    toast.success('Настройки сохранены!');
    window.dispatchEvent(new CustomEvent('site-content-updated'));
  };

  const resetContent = () => {
    if (window.confirm('Вернуть настройки по умолчанию? Все изменения будут удалены.')) {
      setContent(defaultContent);
      localStorage.removeItem('site_content');
      toast.success('Настройки сброшены');
      window.dispatchEvent(new CustomEvent('site-content-updated'));
    }
  };

  const handleDragStart = (blockId: string) => {
    setDraggedBlock(blockId);
  };

  const handleDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    if (draggedBlock && draggedBlock !== blockId) {
      const newOrder = [...content.blockOrder];
      const draggedIndex = newOrder.indexOf(draggedBlock);
      const targetIndex = newOrder.indexOf(blockId);
      
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedBlock);
      
      setContent({ ...content, blockOrder: newOrder });
    }
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
  };

  const updateBenefit = (id: string, field: string, value: string) => {
    setContent({
      ...content,
      benefits: content.benefits.map(b => 
        b.id === id ? { ...b, [field]: value } : b
      )
    });
  };

  const addBenefit = () => {
    const newBenefit = {
      id: `benefit${Date.now()}`,
      title: 'Новое преимущество',
      description: 'Описание',
      icon: 'Star'
    };
    setContent({
      ...content,
      benefits: [...content.benefits, newBenefit]
    });
  };

  const removeBenefit = (id: string) => {
    setContent({
      ...content,
      benefits: content.benefits.filter(b => b.id !== id)
    });
  };

  const blockNames: Record<string, string> = {
    hero: 'Главный баннер',
    benefits: 'Преимущества',
    about: 'О товариществе'
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Settings" className="text-primary" />
            Настройки сайта
          </CardTitle>
          <CardDescription>
            Редактирование содержимого главной страницы и порядка блоков
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">
                <Icon name="FileEdit" size={16} className="mr-2" />
                Содержимое
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Icon name="LayoutDashboard" size={16} className="mr-2" />
                Расположение блоков
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {/* Главный баннер */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Главный баннер</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Заголовок</Label>
                    <Input
                      value={content.hero.title}
                      onChange={(e) => setContent({
                        ...content,
                        hero: { ...content.hero, title: e.target.value }
                      })}
                      placeholder="Название СНТ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Подзаголовок</Label>
                    <Input
                      value={content.hero.subtitle}
                      onChange={(e) => setContent({
                        ...content,
                        hero: { ...content.hero, subtitle: e.target.value }
                      })}
                      placeholder="Населённый пункт"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Описание</Label>
                    <Textarea
                      value={content.hero.description}
                      onChange={(e) => setContent({
                        ...content,
                        hero: { ...content.hero, description: e.target.value }
                      })}
                      rows={3}
                      placeholder="Приветственное сообщение"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Преимущества */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Преимущества</CardTitle>
                    <Button onClick={addBenefit} size="sm">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.benefits.map((benefit, index) => (
                    <Card key={benefit.id} className="border-2">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Карточка {index + 1}
                          </span>
                          {content.benefits.length > 1 && (
                            <Button
                              onClick={() => removeBenefit(benefit.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Иконка (название из Lucide Icons)</Label>
                          <Input
                            value={benefit.icon}
                            onChange={(e) => updateBenefit(benefit.id, 'icon', e.target.value)}
                            placeholder="Vote, FileText, Star..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Заголовок</Label>
                          <Input
                            value={benefit.title}
                            onChange={(e) => updateBenefit(benefit.id, 'title', e.target.value)}
                            placeholder="Название преимущества"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Описание</Label>
                          <Textarea
                            value={benefit.description}
                            onChange={(e) => updateBenefit(benefit.id, 'description', e.target.value)}
                            rows={2}
                            placeholder="Краткое описание"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* О товариществе */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">О товариществе</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Заголовок</Label>
                    <Input
                      value={content.about.title}
                      onChange={(e) => setContent({
                        ...content,
                        about: { ...content.about, title: e.target.value }
                      })}
                      placeholder="Заголовок раздела"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Описание</Label>
                    <Textarea
                      value={content.about.description}
                      onChange={(e) => setContent({
                        ...content,
                        about: { ...content.about, description: e.target.value }
                      })}
                      rows={4}
                      placeholder="Информация о товариществе"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Порядок блоков на главной странице</CardTitle>
                  <CardDescription>
                    Перетаскивайте блоки для изменения их порядка
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {content.blockOrder.map((blockId, index) => (
                    <div
                      key={blockId}
                      draggable
                      onDragStart={() => handleDragStart(blockId)}
                      onDragOver={(e) => handleDragOver(e, blockId)}
                      onDragEnd={handleDragEnd}
                      className={`p-4 bg-white border-2 rounded-lg cursor-move transition-all ${
                        draggedBlock === blockId ? 'opacity-50 border-primary' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon name="GripVertical" size={20} className="text-gray-400" />
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium">{blockNames[blockId]}</span>
                        </div>
                        <Icon name="Move" size={18} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Как изменить порядок:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Зажмите блок мышкой и перетащите в нужное место</li>
                      <li>Отпустите кнопку мыши для фиксации позиции</li>
                      <li>Нажмите "Сохранить" для применения изменений</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-6 border-t">
            <Button onClick={saveContent} size="lg" className="flex-1">
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить изменения
            </Button>
            <Button onClick={resetContent} variant="outline" size="lg">
              <Icon name="RotateCcw" size={18} className="mr-2" />
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettings;