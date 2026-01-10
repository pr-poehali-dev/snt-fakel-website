import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import NewsEditorForm from './news-editor/NewsEditorForm';
import NewsListItem from './news-editor/NewsListItem';
import NewsHistoryDialog from './news-editor/NewsHistoryDialog';

interface NewsHistoryEntry {
  date: string;
  author: string;
  action: 'created' | 'edited' | 'published' | 'unpublished';
}

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  text: string;
  showOnMainPage?: boolean;
  mainPageExpiresAt?: string;
  createdBy?: string;
  createdAt?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  history?: NewsHistoryEntry[];
}

interface NewsEditorProps {
  onNavigate?: (section: string) => void;
}

const NewsEditor = ({ onNavigate }: NewsEditorProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedNewsHistory, setSelectedNewsHistory] = useState<NewsItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Важное',
    text: '',
    showOnMainPage: false,
    mainPageDuration: '7'
  });

  const getCurrentUser = () => {
    const session = localStorage.getItem('snt_session');
    if (session) {
      try {
        const { currentUserEmail } = JSON.parse(session);
        const usersJSON = localStorage.getItem('snt_users');
        if (usersJSON) {
          const users = JSON.parse(usersJSON);
          const user = users.find((u: any) => u.email === currentUserEmail);
          if (user) {
            return `${user.firstName} ${user.lastName}`;
          }
        }
      } catch (e) {
        console.error('Error getting current user:', e);
      }
    }
    return 'Неизвестный пользователь';
  };

  const getTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'истёк';
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'}`;
    } else {
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes} ${minutes === 1 ? 'минута' : minutes < 5 ? 'минуты' : 'минут'}`;
    }
  };

  useEffect(() => {
    loadNews();
    
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

    const currentUser = getCurrentUser();
    const now = new Date().toISOString();

    const newItem: NewsItem = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      text: formData.text,
      date: new Date().toLocaleDateString('ru-RU'),
      showOnMainPage: formData.showOnMainPage,
      mainPageExpiresAt: formData.showOnMainPage 
        ? new Date(Date.now() + parseInt(formData.mainPageDuration) * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      createdBy: currentUser,
      createdAt: now,
      history: [{
        date: now,
        author: currentUser,
        action: formData.showOnMainPage ? 'published' : 'created'
      }]
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

    const currentUser = getCurrentUser();
    const now = new Date().toISOString();

    const updatedNews = news.map(item => {
      if (item.id === editingId) {
        const historyEntry: NewsHistoryEntry = {
          date: now,
          author: currentUser,
          action: 'edited'
        };
        
        return { 
          ...item, 
          title: formData.title, 
          category: formData.category, 
          text: formData.text,
          showOnMainPage: formData.showOnMainPage,
          mainPageExpiresAt: formData.showOnMainPage 
            ? new Date(Date.now() + parseInt(formData.mainPageDuration) * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
          lastEditedBy: currentUser,
          lastEditedAt: now,
          history: [...(item.history || []), historyEntry]
        };
      }
      return item;
    });

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

  const handleToggleMainPage = (id: number, customDuration?: number) => {
    const item = news.find(n => n.id === id);
    if (!item) return;

    const currentUser = getCurrentUser();
    const now = new Date().toISOString();
    const isCurrentlyOnMain = item.showOnMainPage && item.mainPageExpiresAt && new Date(item.mainPageExpiresAt) > new Date();

    if (isCurrentlyOnMain && customDuration === undefined) {
      const historyEntry: NewsHistoryEntry = {
        date: now,
        author: currentUser,
        action: 'unpublished'
      };
      
      const updatedNews = news.map(n =>
        n.id === id
          ? { 
              ...n, 
              showOnMainPage: false, 
              mainPageExpiresAt: undefined,
              history: [...(n.history || []), historyEntry]
            }
          : n
      );
      saveNews(updatedNews);
      toast.success('Новость убрана с главной страницы');
    } else {
      const duration = customDuration || 7;
      const historyEntry: NewsHistoryEntry = {
        date: now,
        author: currentUser,
        action: 'published'
      };
      
      const updatedNews = news.map(n =>
        n.id === id
          ? { 
              ...n, 
              showOnMainPage: true, 
              mainPageExpiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
              history: [...(n.history || []), historyEntry]
            }
          : n
      );
      saveNews(updatedNews);
      toast.success(`Новость размещена на главной на ${duration} ${duration === 1 ? 'день' : duration < 5 ? 'дня' : 'дней'}`);
    }
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

  const handleShowHistory = (item: NewsItem) => {
    setSelectedNewsHistory(item);
    setShowHistoryDialog(true);
  };

  return (
    <div className="space-y-6">
      <NewsEditorForm
        formData={formData}
        isEditing={isEditing}
        onFormDataChange={setFormData}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onReset={resetForm}
        onNavigate={onNavigate}
      />

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
              <NewsListItem
                key={item.id}
                item={item}
                getTimeRemaining={getTimeRemaining}
                onToggleMainPage={handleToggleMainPage}
                onShowHistory={handleShowHistory}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </CardContent>
      </Card>

      <NewsHistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        selectedNews={selectedNewsHistory}
      />
    </div>
  );
};

export default NewsEditor;
