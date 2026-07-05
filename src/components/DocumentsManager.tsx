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
import { getCurrentUser } from '@/lib/session';

interface Document {
  id: number;
  title: string;
  category: string;
  date: string;
  size: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
}

const DocumentsManager = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Уставные документы',
    description: '',
    file: null as File | null
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/75f35e00-3b1b-424f-8c93-684dfbd64afd?type=documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Ошибка загрузки документов');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, file });
  };

  const handleAdd = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    try {
      const { email: userEmail, role: userRole } = getCurrentUser();

      let fileUrl = '';
      let fileName = '';

      if (formData.file) {
        fileName = formData.file.name;
        
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
          reader.readAsDataURL(formData.file!);
        });

        fileUrl = `${fileName}|${base64}`;
      }

      const response = await fetch('https://functions.poehali.dev/75f35e00-3b1b-424f-8c93-684dfbd64afd?type=documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail,
          'X-User-Role': userRole
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          fileUrl,
          fileName
        })
      });

      if (response.ok) {
        await loadDocuments();
        window.dispatchEvent(new CustomEvent('documents-updated'));
        resetForm();
        toast.success('Документ добавлен');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка добавления документа');
      }
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Ошибка добавления документа');
    }
  };

  const handleEdit = (doc: Document) => {
    setIsEditing(true);
    setEditingId(doc.id);
    setFormData({
      title: doc.title,
      category: doc.category,
      description: doc.description,
      file: null
    });
  };

  const handleUpdate = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    try {
      const { email: userEmail, role: userRole } = getCurrentUser();

      let fileUrl = '';
      let fileName = '';

      if (formData.file) {
        fileName = formData.file.name;
        
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
          reader.readAsDataURL(formData.file!);
        });

        fileUrl = `${fileName}|${base64}`;
      }

      const response = await fetch('https://functions.poehali.dev/75f35e00-3b1b-424f-8c93-684dfbd64afd?type=documents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail,
          'X-User-Role': userRole
        },
        body: JSON.stringify({
          id: editingId,
          title: formData.title,
          category: formData.category,
          description: formData.description,
          fileUrl: fileUrl || undefined,
          fileName: fileName || undefined
        })
      });

      if (response.ok) {
        await loadDocuments();
        window.dispatchEvent(new CustomEvent('documents-updated'));
        resetForm();
        toast.success('Документ обновлён');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка обновления документа');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Ошибка обновления документа');
    }
  };

  const handleDelete = async (id: number) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;

    const confirmed = window.confirm(`Удалить документ "${doc.title}"?`);
    if (!confirmed) return;

    try {
      const { email: userEmail, role: userRole } = getCurrentUser();

      const response = await fetch('https://functions.poehali.dev/75f35e00-3b1b-424f-8c93-684dfbd64afd?type=documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail,
          'X-User-Role': userRole
        },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        await loadDocuments();
        window.dispatchEvent(new CustomEvent('documents-updated'));
        toast.success('Документ удалён');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка удаления документа');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Ошибка удаления документа');
    }
  };

  const handleDownload = (doc: Document) => {
    if (!doc.fileUrl) {
      toast.error('Файл не загружен');
      return;
    }

    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.fileName || doc.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Файл скачан');
  };

  const handleView = (doc: Document) => {
    if (!doc.fileUrl) {
      toast.error('Файл не загружен');
      return;
    }

    window.open(doc.fileUrl, '_blank');
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      category: 'Уставные документы',
      description: '',
      file: null
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileText" className="text-primary" />
            {isEditing ? 'Редактировать документ' : 'Добавить документ'}
          </CardTitle>
          <CardDescription>
            Управление документами СНТ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Название документа</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введите название документа"
            />
          </div>

          <div className="space-y-2">
            <Label>Категория</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Уставные документы">Уставные документы</SelectItem>
                <SelectItem value="Протоколы">Протоколы</SelectItem>
                <SelectItem value="Правила">Правила</SelectItem>
                <SelectItem value="Финансы">Финансы</SelectItem>
                <SelectItem value="Реестры">Реестры</SelectItem>
                <SelectItem value="Договоры">Договоры</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Краткое описание документа..."
            />
          </div>

          <div className="space-y-2">
            <Label>Файл документа (PDF, DOC, DOCX, XLS, XLSX)</Label>
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
            {formData.file && (
              <p className="text-sm text-muted-foreground">
                Выбран файл: {formData.file.name} ({formatFileSize(formData.file.size)})
              </p>
            )}
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
                <Icon name="Upload" size={18} className="mr-2" />
                Загрузить документ
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Все документы ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-20" />
              <p>Документов пока нет</p>
            </div>
          ) : (
            documents.map((doc) => (
              <Card key={doc.id} className="border-2 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name="FileText" className="text-white" size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{doc.title}</h3>
                          <Badge variant="outline" className="flex-shrink-0">{doc.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Calendar" size={14} />
                            {doc.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="HardDrive" size={14} />
                            {doc.size}
                          </span>
                          {doc.fileName && (
                            <span className="flex items-center gap-1">
                              <Icon name="File" size={14} />
                              {doc.fileName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {doc.fileUrl && (
                        <>
                          <Button
                            onClick={() => handleView(doc)}
                            variant="outline"
                            size="sm"
                            title="Просмотр"
                          >
                            <Icon name="Eye" size={16} />
                          </Button>
                          <Button
                            onClick={() => handleDownload(doc)}
                            size="sm"
                            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                            title="Скачать"
                          >
                            <Icon name="Download" size={16} />
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => handleEdit(doc)}
                        variant="ghost"
                        size="sm"
                        title="Редактировать"
                      >
                        <Icon name="Pencil" size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(doc.id)}
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

export default DocumentsManager;