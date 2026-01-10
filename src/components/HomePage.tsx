import { useState, useEffect } from 'react';
import MeterReadingsNotification from './MeterReadingsNotification';
import CompletedVotings from './CompletedVotings';
import VotingCard from './VotingCard';
import HolidayDecor from './HolidayDecor';
import ChristmasTree from './ChristmasTree';
import HomePageHero from './home/HomePageHero';
import HomePageBenefits from './home/HomePageBenefits';
import HomePageAbout from './home/HomePageAbout';
import HomePageNewsSection from './home/HomePageNewsSection';

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
  images?: string[];
  showOnMainPage?: boolean;
  mainPageExpiresAt?: string;
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

const HomePage = ({ polls, news: initialNews, isLoggedIn, userRole, votes, handleVote, setActiveSection }: HomePageProps) => {
  const [content, setContent] = useState<HomePageContent>(defaultContent);
  const [activeVotings, setActiveVotings] = useState<any[]>([]);
  const [news, setNews] = useState<NewsItem[]>(initialNews);

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

    const loadNews = () => {
      const savedNews = localStorage.getItem('snt_news');
      if (savedNews) {
        try {
          const parsedNews = JSON.parse(savedNews);
          setNews(parsedNews);
        } catch (e) {
          console.error('Error loading news:', e);
        }
      } else {
        setNews(initialNews);
      }
    };

    const loadVotings = async () => {
      const votingsJSON = localStorage.getItem('snt_votings');
      if (votingsJSON) {
        try {
          const votings = JSON.parse(votingsJSON);
          const now = new Date();
          const completedVotingIds: string[] = [];
          
          const updatedVotings = votings.map((v: any) => {
            const endDate = new Date(v.endDate);
            if (v.status === 'active' && endDate < now) {
              completedVotingIds.push(v.id);
              return { ...v, status: 'completed' };
            }
            return v;
          });
          
          if (completedVotingIds.length > 0) {
            localStorage.setItem('snt_votings', JSON.stringify(updatedVotings));
            window.dispatchEvent(new Event('votings-updated'));
            
            for (const votingId of completedVotingIds) {
              const voting = updatedVotings.find((v: any) => v.id === votingId);
              if (voting) {
                await sendVotingCompletionNotification(voting);
              }
            }
          }
          
          const active = updatedVotings.filter((v: any) => {
            const endDate = new Date(v.endDate);
            return v.status === 'active' && endDate >= now;
          });
          setActiveVotings(active);
        } catch (e) {
          console.error('Error loading votings:', e);
        }
      }
    };

    const sendVotingCompletionNotification = async (voting: any) => {
      try {
        const notificationSentKey = `voting_notification_sent_${voting.id}`;
        if (localStorage.getItem(notificationSentKey)) {
          return;
        }

        const usersResponse = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35');
        const usersData = await usersResponse.json();
        const users = usersData.users || [];

        const totalVotes = Object.values(voting.votes || {}).reduce((sum: number, count: any) => sum + count, 0);
        const results = voting.options.map((option: string, idx: number) => {
          const votes = voting.votes?.[idx] || 0;
          const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0';
          return { option, votes, percentage };
        });

        const response = await fetch('https://functions.poehali.dev/ba6cda1e-5207-4b2e-b0b9-30cce2155cd1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            votingTitle: voting.title,
            votingId: voting.id,
            results,
            users
          })
        });

        if (response.ok) {
          localStorage.setItem(notificationSentKey, 'true');
          console.log(`Уведомления о завершении голосования "${voting.title}" отправлены`);
        }
      } catch (error) {
        console.error('Error sending voting completion notification:', error);
      }
    };

    loadContent();
    loadVotings();
    loadNews();

    const handleContentUpdate = () => {
      loadContent();
    };

    const handleVotingsUpdate = () => {
      loadVotings();
    };

    const handleNewsUpdate = () => {
      loadNews();
    };

    const interval = setInterval(() => {
      loadVotings();
    }, 60000);

    window.addEventListener('site-content-updated', handleContentUpdate);
    window.addEventListener('votings-updated', handleVotingsUpdate);
    window.addEventListener('news-updated', handleNewsUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('site-content-updated', handleContentUpdate);
      window.removeEventListener('votings-updated', handleVotingsUpdate);
      window.removeEventListener('news-updated', handleNewsUpdate);
    };
  }, [initialNews]);

  const renderBlock = (blockType: string) => {
    switch (blockType) {
      case 'hero':
        return <HomePageHero key="hero" content={content.hero} />;
      case 'benefits':
        return <HomePageBenefits key="benefits" benefits={content.benefits} />;
      case 'about':
        return <HomePageAbout key="about" content={content.about} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-16">
        {content.blockOrder.map((blockType) => renderBlock(blockType))}

        {isLoggedIn && userRole !== 'guest' && <MeterReadingsNotification />}

        {activeVotings.length > 0 && (
          <section>
            <h3 className="text-3xl font-bold mb-8">Активные голосования</h3>
            <div className="space-y-6">
              {activeVotings.map((voting) => (
                <VotingCard
                  key={voting.id}
                  voting={voting}
                  isLoggedIn={isLoggedIn}
                  userRole={userRole}
                  setActiveSection={setActiveSection}
                />
              ))}
            </div>
          </section>
        )}

        <CompletedVotings userRole={userRole} setActiveSection={setActiveSection} />

        <HomePageNewsSection news={news} setActiveSection={setActiveSection} />
      </div>
      
      <HolidayDecor />
      <ChristmasTree side="left" />
      <ChristmasTree side="right" />
    </>
  );
};

export default HomePage;