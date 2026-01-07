import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

type UserRole = 'guest' | 'member' | 'admin';

interface DocumentsSectionProps {
  userRole: UserRole;
}

const DocumentsSection = ({ userRole }: DocumentsSectionProps) => {
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
};

export default DocumentsSection;
