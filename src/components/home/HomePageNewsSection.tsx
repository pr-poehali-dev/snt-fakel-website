import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  text: string;
  showOnMainPage?: boolean;
  mainPageExpiresAt?: string;
}

interface HomePageNewsSectionProps {
  news: NewsItem[];
  setActiveSection: (section: string) => void;
}

const HomePageNewsSection = ({ news, setActiveSection }: HomePageNewsSectionProps) => {
  const [newsCarouselIndex, setNewsCarouselIndex] = useState(0);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const mainPageNews = news.filter((item: any) => {
    const isOnMainPage = item.showOnMainPage && 
                         item.mainPageExpiresAt && 
                         new Date(item.mainPageExpiresAt) > new Date();
    const isImportantCategory = ['Важное', 'Мероприятия', 'Объявления'].includes(item.category);
    return isOnMainPage && isImportantCategory;
  }).slice(0, 12);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(mainPageNews.length / itemsPerPage);
  const showArrows = mainPageNews.length > itemsPerPage;

  const visibleNews = mainPageNews.slice(
    newsCarouselIndex * itemsPerPage,
    (newsCarouselIndex + 1) * itemsPerPage
  );

  const handlePrev = () => {
    setNewsCarouselIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setNewsCarouselIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  if (mainPageNews.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Icon name="Newspaper" className="text-white" size={20} />
          </div>
          <h3 className="text-3xl font-bold">Последние новости</h3>
        </div>
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Icon name="Newspaper" size={48} className="mx-auto mb-4 opacity-20" />
            <p>Нет новостей на главной странице</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Icon name="Newspaper" className="text-white" size={20} />
        </div>
        <h3 className="text-3xl font-bold">Последние новости</h3>
      </div>

      <div className="relative">
        {showArrows && (
          <Button
            onClick={handlePrev}
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 rounded-full w-10 h-10 bg-white shadow-lg hover:bg-orange-50"
          >
            <Icon name="ChevronLeft" size={20} />
          </Button>
        )}
        
        <div className="grid md:grid-cols-3 gap-6">
          {visibleNews.map((item: any) => (
            <Card 
              key={item.id} 
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 cursor-pointer"
              onClick={() => setSelectedNews(item)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{item.category}</Badge>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{item.text}</p>
                <div className="flex items-center gap-1 text-xs text-orange-500 mt-3 font-medium">
                  <span>Читать полностью</span>
                  <Icon name="ChevronRight" size={14} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {showArrows && (
          <Button
            onClick={handleNext}
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 rounded-full w-10 h-10 bg-white shadow-lg hover:bg-orange-50"
          >
            <Icon name="ChevronRight" size={20} />
          </Button>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setNewsCarouselIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === newsCarouselIndex 
                    ? 'bg-orange-500 w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <Button 
          onClick={() => setActiveSection('news')}
          variant="outline"
          className="border-2 border-blue-300 hover:bg-blue-50"
        >
          <Icon name="Newspaper" size={18} className="mr-2" />
          Все новости
        </Button>
      </div>

      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedNews && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="text-sm">{selectedNews.category}</Badge>
                  <span className="text-sm text-muted-foreground">{selectedNews.date}</span>
                </div>
                <DialogTitle className="text-2xl">{selectedNews.title}</DialogTitle>
              </DialogHeader>
              <DialogDescription className="text-base text-foreground whitespace-pre-wrap leading-relaxed">
                {selectedNews.text}
              </DialogDescription>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HomePageNewsSection;
