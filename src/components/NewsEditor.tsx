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
}

const NewsEditor = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Важное',
    text: ''
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
      date: new Date().toLocaleDateString('ru-RU')
    };

    const updatedNews = [newItem, ...news];
    saveNews(updatedNews);
    resetForm();
    toast.success('Новость добавлена');
  };

  const handleEdit = (item: NewsItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormData({
      title: item.title,
      category: item.category,
      text: item.text
    });
  };

  const handleUpdate = () => {
    if (!formData.title.trim() || !formData.text.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    const updatedNews = news.map(item =>
      item.id === editingId
        ? { ...item, title: formData.title, category: formData.category, text: formData.text }
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
      text: ''
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

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button onClick={handleUpdate} className="flex-1">
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить изменения
                </Button>
                <Button onClick={resetForm} variant="outline">
                  <Icon name="X" size={18} className="mr-2" />
                  Отмена
                </Button>
              </>
            ) : (
              <Button onClick={handleAdd} className="flex-1">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить новость
              </Button>
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
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>{item.category}</Badge>
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