import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import RulesEditor from './page-editor/RulesEditor';
import ContactsEditor from './page-editor/ContactsEditor';
import GalleryEditor from './page-editor/GalleryEditor';

interface PageContent {
  rules: {
    title: string;
    mainTitle: string;
    mainText: string;
    rulesTitle: string;
    rulesItems: string[];
    behaviorTitle: string;
    behaviorText: string;
  };
  contacts: {
    title: string;
    addressTitle: string;
    addressText: string;
    contactsTitle: string;
    phone: string;
    email: string;
    detailsTitle: string;
    inn: string;
    kpp: string;
    account: string;
    bik: string;
  };
  gallery: {
    title: string;
    enabled: boolean;
  };
}

const defaultContent: PageContent = {
  rules: {
    title: 'Правила и устав товарищества',
    mainTitle: 'Устав СНТ Факел',
    mainText: 'Садовое некоммерческое товарищество «Факел» создано в соответствии с законодательством РФ и осуществляет деятельность на основании настоящего устава.',
    rulesTitle: 'Основные положения:',
    rulesItems: [
      'Соблюдение тишины с 22:00 до 08:00',
      'Своевременная уплата членских взносов',
      'Содержание участка в надлежащем состоянии',
      'Участие в общих субботниках',
      'Соблюдение правил пожарной безопасности'
    ],
    behaviorTitle: 'Правила поведения',
    behaviorText: 'Участники товарищества обязуются соблюдать порядок, уважать права соседей, поддерживать чистоту на общей территории и участвовать в жизни сообщества.'
  },
  contacts: {
    title: 'Контакты и реквизиты',
    addressTitle: 'Адрес',
    addressText: 'Московская область, Раменский район\nСНТ «Факел»\nд. Малое Уварово',
    contactsTitle: 'Контакты',
    phone: '+7 (495) 123-45-67',
    email: 'info@snt-fakel.ru',
    detailsTitle: 'Реквизиты',
    inn: '5012345678',
    kpp: '501201001',
    account: '40703810000000000000',
    bik: '044525225'
  },
  gallery: {
    title: 'Галерея фото территории',
    enabled: true
  }
};

interface PageEditorProps {
  onBack?: () => void;
}

const PageEditor = ({ onBack }: PageEditorProps) => {
  const [content, setContent] = useState<PageContent>(defaultContent);
  const [activeTab, setActiveTab] = useState<string>('rules');

  useEffect(() => {
    const savedContent = localStorage.getItem('pages_content');
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent));
      } catch (e) {
        console.error('Error loading pages content:', e);
      }
    }
  }, []);

  const saveContent = () => {
    const contentToSave = JSON.parse(JSON.stringify(content));
    localStorage.setItem('pages_content', JSON.stringify(contentToSave));
    toast.success('Изменения сохранены!');
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('pages-content-updated'));
      window.dispatchEvent(new Event('storage'));
    }, 0);
  };

  const resetContent = () => {
    if (window.confirm('Вернуть настройки по умолчанию? Все изменения будут удалены.')) {
      setContent(defaultContent);
      localStorage.removeItem('pages_content');
      toast.success('Настройки сброшены');
      window.dispatchEvent(new CustomEvent('pages-content-updated'));
    }
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
            <Icon name="FileEdit" className="text-primary" />
            Редактор страниц
          </CardTitle>
          <CardDescription>
            Редактирование содержимого страниц Правила, Контакты и Галерея
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rules">
                <Icon name="FileText" size={16} className="mr-2" />
                Правила
              </TabsTrigger>
              <TabsTrigger value="contacts">
                <Icon name="Phone" size={16} className="mr-2" />
                Контакты
              </TabsTrigger>
              <TabsTrigger value="gallery">
                <Icon name="Image" size={16} className="mr-2" />
                Галерея
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rules">
              <RulesEditor
                content={content.rules}
                onChange={(rules) => setContent({ ...content, rules })}
              />
            </TabsContent>

            <TabsContent value="contacts">
              <ContactsEditor
                content={content.contacts}
                onChange={(contacts) => setContent({ ...content, contacts })}
              />
            </TabsContent>

            <TabsContent value="gallery">
              <GalleryEditor
                content={content.gallery}
                onChange={(gallery) => setContent({ ...content, gallery })}
              />
            </TabsContent>

            <div className="flex gap-3 pt-6 border-t">
              <Button onClick={saveContent} className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить изменения
              </Button>
              <Button onClick={resetContent} variant="outline">
                <Icon name="RotateCcw" size={18} className="mr-2" />
                Сбросить
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageEditor;
