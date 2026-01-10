import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface NewsEditorFormProps {
  formData: {
    title: string;
    category: string;
    text: string;
    images?: string[];
    showOnMainPage: boolean;
    mainPageDuration: string;
  };
  isEditing: boolean;
  onFormDataChange: (data: any) => void;
  onAdd: () => void;
  onUpdate: () => void;
  onReset: () => void;
  onNavigate?: (section: string) => void;
}

const NewsEditorForm = ({
  formData,
  isEditing,
  onFormDataChange,
  onAdd,
  onUpdate,
  onReset,
  onNavigate
}: NewsEditorFormProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Файл ${file.name} слишком большой. Максимум 5 МБ`);
          continue;
        }

        if (!file.type.startsWith('image/')) {
          toast.error(`Файл ${file.name} не является изображением`);
          continue;
        }

        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        newImages.push(base64);
      }

      if (newImages.length > 0) {
        onFormDataChange({ 
          ...formData, 
          images: [...(formData.images || []), ...newImages] 
        });
        toast.success(`Загружено ${newImages.length} ${newImages.length === 1 ? 'изображение' : 'изображений'}`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Ошибка при загрузке изображений');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    onFormDataChange({ ...formData, images: newImages });
    toast.success('Изображение удалено');
  };

  return (
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
            onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
            placeholder="Введите заголовок новости"
          />
        </div>

        <div className="space-y-2">
          <Label>Категория</Label>
          <Select value={formData.category} onValueChange={(value) => onFormDataChange({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Важное">Важное</SelectItem>
              <SelectItem value="Мероприятия">Мероприятия</SelectItem>
              <SelectItem value="Объявления">Объявления</SelectItem>
              <SelectItem value="Финансы">Финансы</SelectItem>
              <SelectItem value="Общее">Общее</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Текст новости</Label>
          <Textarea
            value={formData.text}
            onChange={(e) => onFormDataChange({ ...formData, text: e.target.value })}
            placeholder="Введите текст новости"
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <Label>Изображения</Label>
          <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Icon name={isUploading ? "Loader2" : "ImagePlus"} size={18} className={`mr-2 ${isUploading ? 'animate-spin' : ''}`} />
                    {isUploading ? 'Загрузка...' : 'Добавить изображения'}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground">
                Максимум 5 МБ на изображение. Форматы: JPG, PNG, GIF, WebP
              </p>
            </div>

            {formData.images && formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Удалить изображение"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-start space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <Checkbox
              id="show-main-page"
              checked={formData.showOnMainPage}
              onCheckedChange={(checked) => 
                onFormDataChange({ ...formData, showOnMainPage: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="show-main-page"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
              >
                <Icon name="Star" size={16} className="text-orange-600" />
                Разместить на главной странице
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Новость будет отображаться на главной странице в течение выбранного периода
              </p>
            </div>
          </div>

          {formData.showOnMainPage && (
            <div className="mt-3 ml-7 space-y-2">
              <Label>Срок размещения на главной</Label>
              <Select 
                value={formData.mainPageDuration} 
                onValueChange={(value) => onFormDataChange({ ...formData, mainPageDuration: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 день</SelectItem>
                  <SelectItem value="3">3 дня</SelectItem>
                  <SelectItem value="7">7 дней</SelectItem>
                  <SelectItem value="14">14 дней</SelectItem>
                  <SelectItem value="30">30 дней</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button onClick={onUpdate} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить изменения
              </Button>
              <Button onClick={onReset} variant="outline" className="border-gray-300">
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
              <Button onClick={onAdd} className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить новость
              </Button>
              <Button onClick={onReset} variant="outline" className="border-gray-300">
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
  );
};

export default NewsEditorForm;