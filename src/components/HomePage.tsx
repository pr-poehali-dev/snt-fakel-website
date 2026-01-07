import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

interface Poll {
  id: number;
  title: string;
  description: string;
  options: { text: string; votes: number }[];
  deadline: string;
  status: string;
}

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  text: string;
}

interface HomePageProps {
  polls: Poll[];
  news: NewsItem[];
  isLoggedIn: boolean;
  userRole: UserRole;
  votes: { [key: number]: number };
  handleVote: (pollId: number, option: number) => void;
  setActiveSection: (section: string) => void;
}

interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  benefits: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  about: {
    title: string;
    description: string;
  };
  blockOrder: string[];
}

const defaultContent: HomePageContent = {
  hero: {
    title: 'СНТ "Факел"',
    subtitle: 'Нижний Новгород',
    description: 'Добро пожаловать на официальный сайт садоводческого некоммерческого товарищества "Факел"'
  },
  benefits: [],
  about: {
    title: 'О нашем товариществе',
    description: 'СНТ "Факел" - это современное садоводческое товарищество с развитой инфраструктурой и активным управлением.'
  },
  blockOrder: ['hero', 'benefits', 'about']
};

const HomePage = ({ polls, news, isLoggedIn, userRole, votes, handleVote, setActiveSection }: HomePageProps) => {
  const [content, setContent] = useState<HomePageContent>(defaultContent);

  useEffect(() => {
    const loadContent = () => {
      const savedContent = localStorage.getItem('site_content');
      if (savedContent) {
        try {
          setContent(JSON.parse(savedContent));
        } catch (e) {
          console.error('Error loading site content:', e);
        }
      }
    };

    loadContent();

    const handleContentUpdate = () => {
      loadContent();
    };

    window.addEventListener('site-content-updated', handleContentUpdate);
    return () => window.removeEventListener('site-content-updated', handleContentUpdate);
  }, []);

  const renderHero = () => (
    <section key="hero" className="mb-16 text-center">
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-pink-100 px-4 py-2 rounded-full mb-6">
        <Icon name="Sparkles" size={18} className="text-orange-600" />
        <span className="text-sm font-medium text-orange-800">{content.hero.subtitle}</span>
      </div>
      <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
        {content.hero.title}
      </h2>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
        {content.hero.description}
      </p>
      <div className="flex gap-4 justify-center">
        <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" onClick={() => setActiveSection('about')}>
          <Icon name="Info" size={20} className="mr-2" />
          О товариществе
        </Button>
        <Button size="lg" variant="outline" onClick={() => setActiveSection('contacts')}>
          <Icon name="Phone" size={20} className="mr-2" />
          Контакты
        </Button>
      </div>
    </section>
  );

  const renderBenefits = () => {
    if (!content.benefits || content.benefits.length === 0) return null;
    
    return (
      <section key="benefits" className="mb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.benefits.map((benefit) => (
            <Card key={benefit.id} className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <Icon name={benefit.icon as any} className="text-white" size={24} />
                </div>
                <h4 className="text-lg font-bold mb-2">{benefit.title}</h4>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  };

  const renderAbout = () => (
    <section key="about" className="mb-16">
      <Card className="border-2 bg-gradient-to-br from-orange-50 to-pink-50">
        <CardContent className="pt-8 pb-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Icon name="Info" className="text-white" size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4">{content.about.title}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {content.about.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );

  const blockComponents: Record<string, () => JSX.Element> = {
    hero: renderHero,
    benefits: renderBenefits,
    about: renderAbout
  };

  return (
    <>
      {content.blockOrder.map((blockId) => {
        const renderBlock = blockComponents[blockId];
        return renderBlock ? renderBlock() : null;
      })}
    </>
  );
};

export default HomePage;