import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

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

const PageEditor = () => {
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
    
    // Force immediate update
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

  const updateRulesItem = (index: number, value: string) => {
    const newItems = [...content.rules.rulesItems];
    newItems[index] = value;
    setContent({
      ...content,
      rules: { ...content.rules, rulesItems: newItems }
    });
  };

  const addRulesItem = () => {
    setContent({
      ...content,
      rules: {
        ...content.rules,
        rulesItems: [...content.rules.rulesItems, 'Новое правило']
      }
    });
  };

  const removeRulesItem = (index: number) => {
    setContent({
      ...content,
      rules: {
        ...content.rules,
        rulesItems: content.rules.rulesItems.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
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

            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Заголовок страницы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Главный заголовок</Label>
                    <Input
                      value={content.rules.title}
                      onChange={(e) => setContent({
                        ...content,
                        rules: { ...content.rules, title: e.target.value }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Раздел "Устав СНТ"</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Название раздела</Label>
                    <Input
                      value={content.rules.mainTitle}
                      onChange={(e) => setContent({
                        ...content,
                        rules: { ...content.rules, mainTitle: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Описание</Label>
                    <Textarea
                      value={content.rules.mainText}
                      onChange={(e) => setContent({
                        ...content,
                        rules: { ...content.rules, mainText: e.target.value }
                      })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Основные положения</CardTitle>
                    <Button onClick={addRulesItem} size="sm">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Заголовок списка</Label>
                    <Input
                      value={content.rules.rulesTitle}
                      onChange={(e) => setContent({
                        ...content,
                        rules: { ...content.rules, rulesTitle: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-3">
                    {content.rules.rulesItems.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateRulesItem(index, e.target.value)}
                          placeholder="Текст правила"
                        />
                        {content.rules.rulesItems.length > 1 && (
                          <Button
                            onClick={() => removeRulesItem(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Раздел "Правила поведения"</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Название раздела</Label>
                    <Input
                      value={content.rules.behaviorTitle}
                      onChange={(e) => setContent({
                        ...content,
                        rules: { ...content.rules, behaviorTitle: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Текст</Label>
                    <Textarea
                      value={content.rules.behaviorText}
                      onChange={(e) => setContent({
                        ...content,
                        rules: { ...content.rules, behaviorText: e.target.value }
                      })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Заголовок страницы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Главный заголовок</Label>
                    <Input
                      value={content.contacts.title}
                      onChange={(e) => setContent({
                        ...content,
                        contacts: { ...content.contacts, title: e.target.value }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Адрес</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Название раздела</Label>
                    <Input
                      value={content.contacts.addressTitle}
                      onChange={(e) => setContent({
                        ...content,
                        contacts: { ...content.contacts, addressTitle: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Адрес (каждая строка с новой линии)</Label>
                    <Textarea
                      value={content.contacts.addressText}
                      onChange={(e) => setContent({
                        ...content,
                        contacts: { ...content.contacts, addressText: e.target.value }
                      })}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Контактные данные</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Название раздела</Label>
                    <Input
                      value={content.contacts.contactsTitle}
                      onChange={(e) => setContent({
                        ...content,
                        contacts: { ...content.contacts, contactsTitle: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Телефон</Label>
                    <Input
                      value={content.contacts.phone}
                      onChange={(e) => setContent({
                        ...content,
                        contacts: { ...content.contacts, phone: e.target.value }
                      })}
                      placeholder="+7 (XXX) XXX-XX-XX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={content.contacts.email}
                      onChange={(e) => setContent({
                        ...content,
                        contacts: { ...content.contacts, email: e.target.value }
                      })}
                      placeholder="info@snt-example.ru"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Реквизиты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Название раздела</Label>
                    <Input
                      value={content.contacts.detailsTitle}
                      onChange={(e) => setContent({
                        ...content,
                        contacts: { ...content.contacts, detailsTitle: e.target.value }
                      })}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ИНН</Label>
                      <Input
                        value={content.contacts.inn}
                        onChange={(e) => setContent({
                          ...content,
                          contacts: { ...content.contacts, inn: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>КПП</Label>
                      <Input
                        value={content.contacts.kpp}
                        onChange={(e) => setContent({
                          ...content,
                          contacts: { ...content.contacts, kpp: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Расчётный счёт</Label>
                      <Input
                        value={content.contacts.account}
                        onChange={(e) => setContent({
                          ...content,
                          contacts: { ...content.contacts, account: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>БИК</Label>
                      <Input
                        value={content.contacts.bik}
                        onChange={(e) => setContent({
                          ...content,
                          contacts: { ...content.contacts, bik: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Настройки галереи</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Заголовок страницы</Label>
                    <Input
                      value={content.gallery.title}
                      onChange={(e) => setContent({
                        ...content,
                        gallery: { ...content.gallery, title: e.target.value }
                      })}
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">О галерее:</p>
                        <p>Фотографии галереи хранятся в базе данных и управляются отдельно. Здесь можно изменить только заголовок страницы.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

export default PageEditor;