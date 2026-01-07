import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import Chat from './Chat';

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
}

const ContentSections = ({ activeSection, news, gallery, isLoggedIn }: ContentSectionsProps) => {
  if (activeSection === 'chat') {
    return <Chat isLoggedIn={isLoggedIn} />;
  }
  if (activeSection === 'news') {
    return (
      <section>
        <h2 className="text-4xl font-bold mb-8">Объявления и новости</h2>
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
                    <span className="text-sm text-muted-foreground">{item.date}</span>
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
    return (
      <section>
        <h2 className="text-4xl font-bold mb-8">Личный кабинет участника</h2>
        <div className="grid md:grid-cols-3 gap-6">
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
        </div>
      </section>
    );
  }

  return null;
};

export default ContentSections;