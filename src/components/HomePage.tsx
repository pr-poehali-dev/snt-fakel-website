import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import MeterReadingsNotification from './MeterReadingsNotification';
import CompletedVotings from './CompletedVotings';
import { toast } from 'sonner';

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
  const [activeVotings, setActiveVotings] = useState<any[]>([]);

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

    const loadVotings = async () => {
      const votingsJSON = localStorage.getItem('snt_votings');
      if (votingsJSON) {
        try {
          const votings = JSON.parse(votingsJSON);
          const now = new Date();
          const completedVotingIds: string[] = [];
          
          // Автоматически закрываем истекшие голосования
          const updatedVotings = votings.map((v: any) => {
            const endDate = new Date(v.endDate);
            if (v.status === 'active' && endDate < now) {
              completedVotingIds.push(v.id);
              return { ...v, status: 'completed' };
            }
            return v;
          });
          
          // Сохраняем обновленные голосования и отправляем уведомления
          if (completedVotingIds.length > 0) {
            localStorage.setItem('snt_votings', JSON.stringify(updatedVotings));
            window.dispatchEvent(new Event('votings-updated'));
            
            // Отправляем уведомления для каждого завершённого голосования
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
        // Проверяем, не отправляли ли мы уже уведомление для этого голосования
        const notificationSentKey = `voting_notification_sent_${voting.id}`;
        if (localStorage.getItem(notificationSentKey)) {
          return;
        }

        // Получаем список всех пользователей
        const usersResponse = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35');
        const usersData = await usersResponse.json();
        const users = usersData.users || [];

        // Подсчитываем результаты
        const totalVotes = Object.values(voting.votes || {}).reduce((sum: number, count: any) => sum + count, 0);
        const results = voting.options.map((option: string, idx: number) => {
          const votes = voting.votes?.[idx] || 0;
          const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0';
          return { option, votes, percentage };
        });

        // Отправляем уведомления
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
          // Отмечаем, что уведомление отправлено
          localStorage.setItem(notificationSentKey, 'true');
          console.log(`Уведомления о завершении голосования "${voting.title}" отправлены`);
        }
      } catch (error) {
        console.error('Error sending voting completion notification:', error);
      }
    };

    loadContent();
    loadVotings();

    const handleContentUpdate = () => {
      loadContent();
    };

    const handleVotingsUpdate = () => {
      loadVotings();
    };

    // Периодическая проверка истекших голосований (каждые 60 секунд)
    const interval = setInterval(() => {
      loadVotings();
    }, 60000);

    window.addEventListener('site-content-updated', handleContentUpdate);
    window.addEventListener('votings-updated', handleVotingsUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('site-content-updated', handleContentUpdate);
      window.removeEventListener('votings-updated', handleVotingsUpdate);
    };
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
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        {content.hero.description}
      </p>
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
      {isLoggedIn && userRole !== 'guest' && (
        <MeterReadingsNotification onNavigateToProfile={() => setActiveSection('profile')} />
      )}

      {content.blockOrder.map((blockId) => {
        const renderBlock = blockComponents[blockId];
        return renderBlock ? renderBlock() : null;
      })}

      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Icon name="Vote" className="text-white" size={20} />
          </div>
          <h3 className="text-3xl font-bold">Активные голосования</h3>
        </div>
        {activeVotings.length === 0 ? (
          <Card className="border-2">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Vote" size={32} className="text-gray-400" />
              </div>
              <p className="text-lg text-muted-foreground">Нет активных голосований</p>
              <p className="text-sm text-muted-foreground mt-2">Новые голосования появятся здесь</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {activeVotings.map((voting) => {
              const currentEmail = localStorage.getItem('current_user_email') || 'guest';
              const userVotesJSON = localStorage.getItem(`voting_${voting.id}_${currentEmail}`);
              const userVotes = userVotesJSON ? JSON.parse(userVotesJSON) : [];
              const hasVoted = userVotes.length > 0;
              
              // Проверка на собственность участка
              const sessionJSON = localStorage.getItem('snt_session');
              const isOwner = sessionJSON ? JSON.parse(sessionJSON).isOwner === true : false;
              
              return (
                <Card key={voting.id} className="border-2 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500">
                        Активно
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Icon name="Clock" size={14} />
                        до {new Date(voting.endDate).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{voting.title}</CardTitle>
                    <CardDescription>{voting.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {voting.options.map((option: string, idx: number) => {
                      const optionVotes = voting.votes?.[idx] || 0;
                      const totalVotes = Object.values(voting.votes || {}).reduce((sum: number, v: any) => sum + v, 0);
                      const percentage = totalVotes > 0 ? Math.round((optionVotes / (totalVotes as number)) * 100) : 0;
                      const isVoted = userVotes.includes(idx);
                      
                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{option}</span>
                            <span className="text-sm text-muted-foreground">{percentage}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{optionVotes} голосов</span>
                            {isLoggedIn && isOwner && (userRole === 'member' || userRole === 'board_member' || userRole === 'chairman' || userRole === 'admin') && !hasVoted && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  // Проверяем, не истек ли срок голосования
                                  const now = new Date();
                                  const endDate = new Date(voting.endDate);
                                  if (endDate < now) {
                                    toast.error('Голосование завершено');
                                    window.dispatchEvent(new Event('votings-updated'));
                                    return;
                                  }
                                  
                                  const votingsJSON = localStorage.getItem('snt_votings');
                                  if (votingsJSON) {
                                    const votings = JSON.parse(votingsJSON);
                                    const votingIndex = votings.findIndex((v: any) => v.id === voting.id);
                                    if (votingIndex !== -1) {
                                      if (!votings[votingIndex].votes) votings[votingIndex].votes = {};
                                      votings[votingIndex].votes[idx] = (votings[votingIndex].votes[idx] || 0) + 1;
                                      localStorage.setItem('snt_votings', JSON.stringify(votings));
                                      
                                      const voteData = {
                                        optionIndex: idx,
                                        timestamp: new Date().toISOString()
                                      };
                                      localStorage.setItem(`voting_${voting.id}_${currentEmail}`, JSON.stringify([idx]));
                                      localStorage.setItem(`voting_detail_${voting.id}_${currentEmail}`, JSON.stringify(voteData));
                                      
                                      window.dispatchEvent(new Event('votings-updated'));
                                      toast.success('Ваш голос учтён!');
                                    }
                                  }
                                }}
                                className="text-primary hover:text-primary"
                              >
                                <Icon name="CheckCircle" size={16} className="mr-1" />
                                Голосовать
                              </Button>
                            )}
                            {isLoggedIn && !isOwner && !hasVoted && (
                              <span className="text-xs text-muted-foreground italic">
                                Только собственники
                              </span>
                            )}
                            {isVoted && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <Icon name="Check" size={14} className="mr-1" />
                                Проголосовали
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <p className="text-xs text-muted-foreground flex items-start gap-2">
                        <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" />
                        <span>Голосовать могут только собственники участков. Перевыбор невозможен. Голосование завершится {new Date(voting.endDate).toLocaleDateString('ru-RU')}.</span>
                      </p>
                      {(userRole === 'admin' || userRole === 'chairman') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveSection(`voting-results-${voting.id}`)}
                          className="w-full border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Icon name="BarChart3" size={16} className="mr-2" />
                          Просмотреть результаты
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <CompletedVotings userRole={userRole} setActiveSection={setActiveSection} />

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
  );
};

export default HomePage;