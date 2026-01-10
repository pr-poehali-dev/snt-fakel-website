import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  text: string;
  images?: string[];
}

interface NewsSectionProps {
  news: NewsItem[];
  userRole: UserRole;
  onNavigate?: (section: string) => void;
}

const NewsSection = ({ news: initialNews, userRole, onNavigate }: NewsSectionProps) => {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  
  const handleEdit = (item: NewsItem) => {
    // Сохранить ID редактируемой новости и перейти к редактору
    localStorage.setItem('editing_news_id', item.id.toString());
    onNavigate?.('news-editor');
  };
  
  const handleDelete = (item: NewsItem) => {
    const confirmed = window.confirm(`Удалить новость "${item.title}"?`);
    if (!confirmed) return;
    
    const updatedNews = news.filter(n => n.id !== item.id);
    localStorage.setItem('snt_news', JSON.stringify(updatedNews));
    setNews(updatedNews);
    window.dispatchEvent(new CustomEvent('news-updated'));
    toast.success('Новость удалена');
  };

  useEffect(() => {
    const loadNews = () => {
      const savedNews = localStorage.getItem('snt_news');
      if (savedNews) {
        try {
          setNews(JSON.parse(savedNews));
        } catch (e) {
          console.error('Error loading news:', e);
        }
      } else {
        setNews(initialNews);
      }
    };

    loadNews();

    const handleNewsUpdate = () => {
      loadNews();
    };

    window.addEventListener('news-updated', handleNewsUpdate);
    return () => window.removeEventListener('news-updated', handleNewsUpdate);
  }, [initialNews]);
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold">Объявления и новости</h2>
        {(userRole === 'board_member' || userRole === 'chairman' || userRole === 'admin') && (
          <Button 
            onClick={() => onNavigate?.('news-editor')}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            <Icon name="Settings" size={18} className="mr-2" />
            Управление новостями
          </Button>
        )}
      </div>
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="important">Важное</TabsTrigger>
          <TabsTrigger value="events">Мероприятия</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-6">
          {news.map((item) => (
            <Card key={item.id}>
              {item.images && item.images.length > 0 && (
                <div className="w-full h-64 overflow-hidden">
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge>{item.category}</Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                    {(userRole === 'board_member' || userRole === 'chairman' || userRole === 'admin') && (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                          title="Редактировать"
                        >
                          <Icon name="Pencil" size={14} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Удалить"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.images && item.images.length > 1 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {item.images.slice(1).map((image, index) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`${item.title} - изображение ${index + 2}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                <p className="text-muted-foreground whitespace-pre-wrap">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default NewsSection;