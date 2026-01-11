import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const GALLERY_API_URL = 'https://functions.poehali.dev/d4a2053d-18ef-4fe7-9550-1dac64919f00';

interface GalleryPhoto {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  season?: string;
  displayOrder: number;
  isVisible: boolean;
  uploadedBy?: string;
  createdAt?: string;
}

interface GalleryManagerProps {
  userEmail: string;
  userRole: string;
  onBack: () => void;
}

const GalleryManager = ({ userEmail, userRole, onBack }: GalleryManagerProps) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Форма добавления/редактирования
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [season, setSeason] = useState('');
  const [imageData, setImageData] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canManage = userRole === 'admin' || userRole === 'chairman';

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const response = await fetch(GALLERY_API_URL);
      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast.error('Не удалось загрузить фотографии');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Выберите файл изображения');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhoto = async () => {
    if (!title || !imageData) {
      toast.error('Заполните название и выберите изображение');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(GALLERY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail,
          'X-User-Role': userRole
        },
        body: JSON.stringify({
          title,
          description,
          season,
          imageData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const data = await response.json();
      setPhotos([data.photo, ...photos]);
      
      // Очистка формы
      setTitle('');
      setDescription('');
      setSeason('');
      setImageData('');
      setShowAddForm(false);
      
      toast.success('Фотография добавлена в галерею');
    } catch (error) {
      console.error('Error adding photo:', error);
      toast.error('Не удалось добавить фотографию');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdatePhoto = async (photoId: number, updates: Partial<GalleryPhoto>) => {
    try {
      const response = await fetch(GALLERY_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail,
          'X-User-Role': userRole
        },
        body: JSON.stringify({
          id: photoId,
          ...updates
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update photo');
      }

      const data = await response.json();
      setPhotos(photos.map(p => p.id === photoId ? data.photo : p));
      setEditingId(null);
      
      toast.success('Изменения сохранены');
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Не удалось обновить фотографию');
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Удалить эту фотографию из галереи?')) return;

    try {
      const response = await fetch(`${GALLERY_API_URL}?id=${photoId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': userEmail,
          'X-User-Role': userRole
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      setPhotos(photos.filter(p => p.id !== photoId));
      toast.success('Фотография удалена');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Не удалось удалить фотографию');
    }
  };

  const toggleVisibility = (photo: GalleryPhoto) => {
    handleUpdatePhoto(photo.id, { isVisible: !photo.isVisible });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Icon name="Loader2" className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-muted-foreground">Загрузка галереи...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <Icon name="ArrowLeft" size={20} />
            Назад
          </Button>
          <h2 className="text-3xl font-bold">Управление галереей</h2>
          <Badge variant="outline">{photos.length} фото</Badge>
        </div>
        {canManage && (
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
            <Icon name={showAddForm ? "X" : "Plus"} size={20} />
            {showAddForm ? 'Отмена' : 'Добавить фото'}
          </Button>
        )}
      </div>

      {showAddForm && canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ImagePlus" />
              Добавить фотографию
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Название</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Летний субботник 2026"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Описание (опционально)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое описание фотографии"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Сезон (опционально)</label>
              <Input
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="Например: Лето 2026, Весна"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Изображение</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Icon name="Upload" size={20} />
                  Выбрать файл
                </Button>
                {imageData && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Icon name="Check" size={16} />
                    Файл выбран
                  </div>
                )}
              </div>
              {imageData && (
                <div className="mt-4">
                  <img
                    src={imageData}
                    alt="Preview"
                    className="max-w-xs rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddPhoto}
                disabled={uploading || !title || !imageData}
                className="gap-2"
              >
                {uploading ? (
                  <>
                    <Icon name="Loader2" className="animate-spin" size={20} />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Check" size={20} />
                    Добавить в галерею
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setTitle('');
                  setDescription('');
                  setSeason('');
                  setImageData('');
                }}
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {photos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon name="ImageOff" className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">
              В галерее пока нет фотографий
            </p>
            {canManage && (
              <Button
                className="mt-4 gap-2"
                onClick={() => setShowAddForm(true)}
              >
                <Icon name="Plus" size={20} />
                Добавить первое фото
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
                {!photo.isVisible && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-yellow-500">
                      Скрыто
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <h4 className="font-semibold">{photo.title}</h4>
                  {photo.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {photo.description}
                    </p>
                  )}
                  {photo.season && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {photo.season}
                    </p>
                  )}
                </div>

                {canManage && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleVisibility(photo)}
                      className="flex-1 gap-2"
                    >
                      <Icon name={photo.isVisible ? "EyeOff" : "Eye"} size={16} />
                      {photo.isVisible ? 'Скрыть' : 'Показать'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="gap-2 text-red-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default GalleryManager;
