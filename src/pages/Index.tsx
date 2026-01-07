import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [votes, setVotes] = useState<{ [key: number]: number }>({});

  const handleVote = (pollId: number, option: number) => {
    setVotes({ ...votes, [pollId]: option });
    toast.success('Ваш голос учтён!');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    toast.success('Добро пожаловать в СНТ Факел!');
  };

  const polls = [
    {
      id: 1,
      title: 'Благоустройство детской площадки',
      description: 'Проголосуйте за установку нового оборудования',
      options: [
        { text: 'Горка и качели', votes: 45 },
        { text: 'Песочница и домик', votes: 32 },
        { text: 'Спортивный комплекс', votes: 23 },
      ],
      deadline: '15 января 2026',
      status: 'active',
    },
    {
      id: 2,
      title: 'Размер членских взносов на 2026 год',
      description: 'Утверждение суммы ежегодного взноса',
      options: [
        { text: '12 000 рублей', votes: 67 },
        { text: '15 000 рублей', votes: 28 },
        { text: '10 000 рублей', votes: 15 },
      ],
      deadline: '20 января 2026',
      status: 'active',
    },
  ];

  const news = [
    {
      id: 1,
      title: 'Начало отопительного сезона',
      date: '5 января 2026',
      category: 'Важное',
      text: 'Уважаемые жители! Напоминаем о правилах пожарной безопасности в зимний период.',
    },
    {
      id: 2,
      title: 'График вывоза мусора',
      date: '3 января 2026',
      category: 'Объявление',
      text: 'Обновлённый график: вторник и пятница с 9:00 до 11:00.',
    },
    {
      id: 3,
      title: 'Общее собрание',
      date: '28 декабря 2025',
      category: 'Мероприятия',
      text: 'Приглашаем всех участников на годовое собрание 25 января в 15:00.',
    },
  ];

  const gallery = [
    { id: 1, title: 'Центральная аллея', season: 'Лето 2025' },
    { id: 2, title: 'Детская площадка', season: 'Весна 2025' },
    { id: 3, title: 'Территория зимой', season: 'Зима 2025' },
    { id: 4, title: 'Праздник урожая', season: 'Осень 2025' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-purple-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="Flame" className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  СНТ Факел
                </h1>
                <p className="text-sm text-muted-foreground">Садовое товарищество</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {['home', 'news', 'rules', 'gallery', 'contacts'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === section
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'news' && 'Новости'}
                  {section === 'rules' && 'Правила'}
                  {section === 'gallery' && 'Галерея'}
                  {section === 'contacts' && 'Контакты'}
                </button>
              ))}
            </nav>
            {!isLoggedIn ? (
              <Button 
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                onClick={handleLogin}
              >
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setActiveSection('profile')}>
                <Icon name="User" size={18} className="mr-2" />
                Личный кабинет
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {activeSection === 'home' && (
          <>
            <section className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-pink-100 px-4 py-2 rounded-full mb-6">
                <Icon name="Sparkles" size={18} className="text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Добро пожаловать</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                СНТ Факел
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Современное садовое товарищество с удобной системой управления и электронным голосованием
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" onClick={() => setActiveSection('news')}>
                  <Icon name="Newspaper" size={20} className="mr-2" />
                  Новости
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
                  <Icon name="Vote" size={20} className="mr-2" />
                  Голосования
                </Button>
              </div>
            </section>

            <section className="grid md:grid-cols-4 gap-6 mb-16">
              {[
                { icon: 'Users', label: 'Участников', value: '156', color: 'from-orange-500 to-orange-600' },
                { icon: 'Home', label: 'Участков', value: '180', color: 'from-purple-500 to-purple-600' },
                { icon: 'TreePine', label: 'Гектаров', value: '24', color: 'from-pink-500 to-pink-600' },
                { icon: 'Vote', label: 'Голосований', value: '12', color: 'from-blue-500 to-blue-600' },
              ].map((stat, idx) => (
                <Card key={idx} className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon name={stat.icon as any} className="text-white" size={24} />
                    </div>
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Icon name="Vote" className="text-white" size={20} />
                </div>
                <h3 className="text-3xl font-bold">Активные голосования</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {polls.map((poll) => (
                  <Card key={poll.id} className="border-2 hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-gradient-to-r from-orange-500 to-pink-500">
                          {poll.status === 'active' ? 'Активно' : 'Завершено'}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Icon name="Clock" size={14} />
                          до {poll.deadline}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{poll.title}</CardTitle>
                      <CardDescription>{poll.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {poll.options.map((option, idx) => {
                        const total = poll.options.reduce((sum, o) => sum + o.votes, 0);
                        const percentage = Math.round((option.votes / total) * 100);
                        const isVoted = votes[poll.id] === idx;
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{option.text}</span>
                              <span className="text-sm text-muted-foreground">{percentage}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-orange-500 to-pink-500 h-full transition-all duration-500" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{option.votes} голосов</span>
                              {isLoggedIn && !isVoted && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleVote(poll.id, idx)}
                                  className="text-primary hover:text-primary"
                                >
                                  <Icon name="CheckCircle" size={16} className="mr-1" />
                                  Выбрать
                                </Button>
                              )}
                              {isVoted && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <Icon name="Check" size={14} className="mr-1" />
                                  Ваш выбор
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {!isLoggedIn && (
                        <p className="text-sm text-muted-foreground italic pt-2 border-t">
                          Войдите в личный кабинет для участия в голосовании
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Icon name="Newspaper" className="text-white" size={20} />
                </div>
                <h3 className="text-3xl font-bold">Последние новости</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {news.map((item) => (
                  <Card key={item.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{item.category}</Badge>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}

        {activeSection === 'news' && (
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
        )}

        {activeSection === 'rules' && (
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
        )}

        {activeSection === 'gallery' && (
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
        )}

        {activeSection === 'contacts' && (
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
        )}

        {activeSection === 'profile' && isLoggedIn && (
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
        )}
      </main>

      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Icon name="Flame" className="text-white" size={20} />
                </div>
                <span className="font-bold text-xl">СНТ Факел</span>
              </div>
              <p className="text-sm text-gray-400">
                Современное садовое товарищество с удобной системой управления
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Быстрые ссылки</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => setActiveSection('news')} className="hover:text-white transition-colors">Новости</button></li>
                <li><button onClick={() => setActiveSection('rules')} className="hover:text-white transition-colors">Правила</button></li>
                <li><button onClick={() => setActiveSection('gallery')} className="hover:text-white transition-colors">Галерея</button></li>
                <li><button onClick={() => setActiveSection('contacts')} className="hover:text-white transition-colors">Контакты</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Icon name="Phone" size={16} />
                  +7 (495) 123-45-67
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Mail" size={16} />
                  info@snt-fakel.ru
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 СНТ Факел. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;