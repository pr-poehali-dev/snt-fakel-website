import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import Chat from './Chat';

type UserRole = 'guest' | 'member' | 'admin';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  text: string;
}

interface GalleryItem {
  id: number;
  title: string;
  season: string;
}

interface ContentSectionsProps {
  activeSection: string;
  news: NewsItem[];
  gallery: GalleryItem[];
  isLoggedIn: boolean;
  userRole: UserRole;
}

const ContentSections = ({ activeSection, news, gallery, isLoggedIn, userRole }: ContentSectionsProps) => {
  if (activeSection === 'chat') {
    return <Chat isLoggedIn={isLoggedIn} userRole={userRole} />;
  }

  if (activeSection === 'documents') {
    const documents = [
      {
        id: 1,
        title: 'Устав СНТ Факел',
        category: 'Уставные документы',
        date: '15.03.2024',
        size: '2.4 МБ',
        description: 'Полная версия устава садового некоммерческого товарищества "Факел"',
      },
      {
        id: 2,
        title: 'Протокол общего собрания от 25.12.2025',
        category: 'Протоколы',
        date: '25.12.2025',
        size: '1.2 МБ',
        description: 'Протокол годового собрания участников СНТ',
      },
      {
        id: 3,
        title: 'Правила внутреннего распорядка',
        category: 'Правила',
        date: '10.01.2025',
        size: '856 КБ',
        description: 'Правила поведения на территории СНТ',
      },
      {
        id: 4,
        title: 'Смета расходов на 2026 год',
        category: 'Финансы',
        date: '05.01.2026',
        size: '1.8 МБ',
        description: 'Утвержденная смета расходов товарищества',
      },
      {
        id: 5,
        title: 'Реестр членов СНТ',
        category: 'Реестры',
        date: '01.01.2026',
        size: '3.2 МБ',
        description: 'Актуальный список участников товарищества',
      },
      {
        id: 6,
        title: 'Договор на вывоз ТБО',
        category: 'Договоры',
        date: '15.11.2025',
        size: '640 КБ',
        description: 'Договор с компанией по вывозу мусора',
      },
    ];

    return (
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold">Документы СНТ</h2>
          {userRole === 'admin' && (
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
              <Icon name="Upload" size={18} className="mr-2" />
              Загрузить документ
            </Button>
          )}
        </div>
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Все документы</TabsTrigger>
            <TabsTrigger value="charter">Уставные</TabsTrigger>
            <TabsTrigger value="protocols">Протоколы</TabsTrigger>
            <TabsTrigger value="finance">Финансы</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-all duration-300">
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
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline">
                        <Icon name="Eye" size={16} className="mr-1" />
                        Просмотр
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                        <Icon name="Download" size={16} className="mr-1" />
                        Скачать
                      </Button>
                      {userRole === 'admin' && (
                        <Button size="sm" variant="ghost">
                          <Icon name="Trash2" size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="charter" className="space-y-4">
            {documents.filter(doc => doc.category === 'Уставные документы').map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name="FileText" className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{doc.title}</h3>
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
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Icon name="Eye" size={16} className="mr-1" />
                        Просмотр
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                        <Icon name="Download" size={16} className="mr-1" />
                        Скачать
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="protocols" className="space-y-4">
            {documents.filter(doc => doc.category === 'Протоколы').map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name="FileText" className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{doc.title}</h3>
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
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Icon name="Eye" size={16} className="mr-1" />
                        Просмотр
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                        <Icon name="Download" size={16} className="mr-1" />
                        Скачать
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="finance" className="space-y-4">
            {documents.filter(doc => doc.category === 'Финансы').map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name="FileText" className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{doc.title}</h3>
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
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Icon name="Eye" size={16} className="mr-1" />
                        Просмотр
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                        <Icon name="Download" size={16} className="mr-1" />
                        Скачать
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </section>
    );
  }

  if (activeSection === 'news') {
    return (
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold">Объявления и новости</h2>
          {userRole === 'admin' && (
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить новость
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
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge>{item.category}</Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                      {userRole === 'admin' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Icon name="Pencil" size={14} />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </section>
    );
  }

  if (activeSection === 'rules') {
    return (
      <section>
        <h2 className="text-4xl font-bold mb-8">Правила и устав товарищества</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" className="text-primary" />
                Устав СНТ Факел
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-muted-foreground mb-4">
                Садовое некоммерческое товарищество «Факел» создано в соответствии с законодательством РФ
                и осуществляет деятельность на основании настоящего устава.
              </p>
              <h4 className="font-semibold mt-6 mb-3">Основные положения:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Соблюдение тишины с 22:00 до 08:00</li>
                <li>• Своевременная уплата членских взносов</li>
                <li>• Содержание участка в надлежащем состоянии</li>
                <li>• Участие в общих субботниках</li>
                <li>• Соблюдение правил пожарной безопасности</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Scale" className="text-primary" />
                Правила поведения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Участники товарищества обязуются соблюдать порядок, уважать права соседей,
                поддерживать чистоту на общей территории и участвовать в жизни сообщества.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (activeSection === 'gallery') {
    return (
      <section>
        <h2 className="text-4xl font-bold mb-8">Галерея фото территории</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gallery.map((photo) => (
            <Card key={photo.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-square bg-gradient-to-br from-orange-200 via-purple-200 to-pink-200 flex items-center justify-center">
                <Icon name="Image" size={48} className="text-white" />
              </div>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-1">{photo.title}</h4>
                <p className="text-sm text-muted-foreground">{photo.season}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (activeSection === 'contacts') {
    return (
      <section>
        <h2 className="text-4xl font-bold mb-8">Контакты и реквизиты</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="MapPin" className="text-primary" />
                Адрес
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Московская область, Раменский район<br />
                СНТ «Факел»<br />
                д. Малое Уварово
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Phone" className="text-primary" />
                Контакты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground flex items-center gap-2">
                <Icon name="Phone" size={16} />
                +7 (495) 123-45-67
              </p>
              <p className="text-muted-foreground flex items-center gap-2">
                <Icon name="Mail" size={16} />
                info@snt-fakel.ru
              </p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Building2" className="text-primary" />
                Реквизиты
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">ИНН</p>
                  <p className="font-medium">5012345678</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">КПП</p>
                  <p className="font-medium">501201001</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Расчётный счёт</p>
                  <p className="font-medium">40703810000000000000</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">БИК</p>
                  <p className="font-medium">044525225</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (activeSection === 'profile' && isLoggedIn) {
    const roleNames = {
      guest: 'Гость',
      member: 'Член СНТ',
      admin: 'Администратор'
    };

    return (
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold">Личный кабинет</h2>
          <Badge className={`text-lg px-4 py-2 ${userRole === 'admin' ? 'bg-gradient-to-r from-orange-500 to-pink-500' : ''}`}>
            {roleNames[userRole]}
          </Badge>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {userRole === 'admin' ? (
            <>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Shield" className="text-primary" />
                    Панель администратора
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Всего участников</p>
                      <p className="text-2xl font-bold">156</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Активных голосований</p>
                      <p className="text-2xl font-bold">2</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Новостей</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Документов</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Управление</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Icon name="Users" size={18} className="mr-2" />
                    Список участников
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Icon name="Vote" size={18} className="mr-2" />
                    Создать голосование
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Icon name="FileText" size={18} className="mr-2" />
                    Управление документами
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Icon name="Settings" size={18} className="mr-2" />
                    Настройки сайта
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Информация об участке</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Номер участка</p>
                      <p className="text-lg font-semibold">№ 42</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Площадь</p>
                      <p className="text-lg font-semibold">6 соток</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Членский взнос</p>
                      <Badge className="bg-green-500">Оплачен</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Статус</p>
                      <Badge>Активный член</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Icon name="Receipt" size={18} className="mr-2" />
                    История платежей
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Icon name="MessageSquare" size={18} className="mr-2" />
                    Обращение в правление
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Icon name="Download" size={18} className="mr-2" />
                    Скачать документы
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>
    );
  }

  return null;
};

export default ContentSections;