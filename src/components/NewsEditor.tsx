import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  text: string;
  showOnMainPage?: boolean;
  mainPageExpiresAt?: string;
}

interface NewsEditorProps {
  onNavigate?: (section: string) => void;
}

const NewsEditor = ({ onNavigate }: NewsEditorProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Важное',
    text: '',
    showOnMainPage: false,
    mainPageDuration: '7'
  });

  useEffect(() => {
    loadNews();
    
    // Проверить, есть ли новость для редактирования
    const editingId = localStorage.getItem('editing_news_id');
    if (editingId) {
      const id = parseInt(editingId);
      const savedNews = localStorage.getItem('snt_news');
      if (savedNews) {
        const allNews = JSON.parse(savedNews);
        const itemToEdit = allNews.find((n: NewsItem) => n.id === id);
        if (itemToEdit) {
          handleEdit(itemToEdit);
        }
      }
      localStorage.removeItem('editing_news_id');
    }
  }, []);

  const loadNews = () => {
    const savedNews = localStorage.getItem('snt_news');
    if (savedNews) {
      try {
        setNews(JSON.parse(savedNews));
      } catch (e) {
        console.error('Error loading news:', e);
      }
    }
  };

  const saveNews = (updatedNews: NewsItem[]) => {
    localStorage.setItem('snt_news', JSON.stringify(updatedNews));
    setNews(updatedNews);
    window.dispatchEvent(new CustomEvent('news-updated'));
  };

  const handleAdd = () => {
    if (!formData.title.trim() || !formData.text.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    const newItem: NewsItem = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      text: formData.text,
      date: new Date().toLocaleDateString('ru-RU'),
      showOnMainPage: formData.showOnMainPage,
      mainPageExpiresAt: formData.showOnMainPage 
        ? new Date(Date.now() + parseInt(formData.mainPageDuration) * 24 * 60 * 60 * 1000).toISOString()
        : undefined
    };

    const updatedNews = [newItem, ...news];
    saveNews(updatedNews);
    resetForm();
    toast.success(formData.showOnMainPage ? 'Новость добавлена и размещена на главной' : 'Новость добавлена');
  };

  const handleEdit = (item: NewsItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormData({
      title: item.title,
      category: item.category,
      text: item.text,
      showOnMainPage: item.showOnMainPage || false,
      mainPageDuration: '7'
    });
  };

  const handleUpdate = () => {
    if (!formData.title.trim() || !formData.text.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    const updatedNews = news.map(item =>
      item.id === editingId
        ? { 
            ...item, 
            title: formData.title, 
            category: formData.category, 
            text: formData.text,
            showOnMainPage: formData.showOnMainPage,
            mainPageExpiresAt: formData.showOnMainPage 
              ? new Date(Date.now() + parseInt(formData.mainPageDuration) * 24 * 60 * 60 * 1000).toISOString()
              : undefined
          }
        : item
    );

    saveNews(updatedNews);
    resetForm();
    toast.success('Новость обновлена');
  };

  const handleDelete = (id: number) => {
    const item = news.find(n => n.id === id);
    if (!item) return;

    const confirmed = window.confirm(`Удалить новость "${item.title}"?`);
    if (!confirmed) return;

    const updatedNews = news.filter(n => n.id !== id);
    saveNews(updatedNews);
    toast.success('Новость удалена');
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      category: 'Важное',
      text: '',
      showOnMainPage: false,
      mainPageDuration: '7'
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Newspaper" className="text-primary" />
            {isEditing ? 'Редактировать новость' : 'Добавить новость'}
          </CardTitle>
          <CardDescription>
            Управление новостями и объявлениями СНТ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Заголовок</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введите заголовок новости"
            />
          </div>

          <div className="space-y-2">
            <Label>Категория</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Важное">Важное</SelectItem>
                <SelectItem value="Мероприятия">Мероприятия</SelectItem>
                <SelectItem value="Объявления">Объявления</SelectItem>
                <SelectItem value="Финансы">Финансы</SelectItem>
                <SelectItem value="Новости">Новости</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Текст новости</Label>
            <Textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={6}
              placeholder="Введите текст новости..."
            />
          </div>

          <div className="space-y-4 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showOnMainPage"
                checked={formData.showOnMainPage}
                onChange={(e) => setFormData({ ...formData, showOnMainPage: e.target.checked })}
                className="w-5 h-5 rounded border-orange-300 text-orange-500 focus:ring-orange-500"
              />
              <Label htmlFor="showOnMainPage" className="text-base font-semibold cursor-pointer">
                <Icon name="Star" size={18} className="inline mr-1 text-orange-500" />
                Разместить на главной странице
              </Label>
            </div>
            
            {formData.showOnMainPage && (
              <div className="space-y-2 ml-7">
                <Label>Длительность размещения</Label>
                <Select 
                  value={formData.mainPageDuration} 
                  onValueChange={(value) => setFormData({ ...formData, mainPageDuration: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 день</SelectItem>
                    <SelectItem value="3">3 дня</SelectItem>
                    <SelectItem value="7">7 дней (неделя)</SelectItem>
                    <SelectItem value="14">14 дней (2 недели)</SelectItem>
                    <SelectItem value="30">30 дней (месяц)</SelectItem>
                    <SelectItem value="60">60 дней (2 месяца)</SelectItem>
                    <SelectItem value="90">90 дней (3 месяца)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button onClick={handleUpdate} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить изменения
                </Button>
                <Button onClick={resetForm} variant="outline" className="border-gray-300">
                  <Icon name="X" size={18} className="mr-2" />
                  Сбросить
                </Button>
                <Button onClick={() => onNavigate?.('news')} variant="outline" className="border-orange-300">
                  <Icon name="ArrowLeft" size={18} className="mr-2" />
                  К новостям
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleAdd} className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить новость
                </Button>
                <Button onClick={resetForm} variant="outline" className="border-gray-300">
                  <Icon name="RotateCcw" size={18} className="mr-2" />
                  Очистить форму
                </Button>
                <Button onClick={() => onNavigate?.('news')} variant="outline" className="border-orange-300">
                  <Icon name="ArrowLeft" size={18} className="mr-2" />
                  К новостям
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Все новости ({news.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {news.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Newspaper" size={48} className="mx-auto mb-4 opacity-20" />
              <p>Новостей пока нет</p>
            </div>
          ) : (
            news.map((item) => (
              <Card key={item.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge>{item.category}</Badge>
                        {item.showOnMainPage && item.mainPageExpiresAt && new Date(item.mainPageExpiresAt) > new Date() && (
                          <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                            <Icon name="Star" size={12} className="mr-1" />
                            На главной
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.text}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        onClick={() => handleEdit(item)}
                        variant="ghost"
                        size="sm"
                        title="Редактировать"
                      >
                        <Icon name="Pencil" size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
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

export default NewsEditor;