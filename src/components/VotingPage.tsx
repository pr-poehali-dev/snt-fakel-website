import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import VotingCard from './VotingCard';

interface VotingPageProps {
  isLoggedIn: boolean;
  userRole: string;
  setActiveSection: (section: string) => void;
}

const VotingPage = ({ isLoggedIn, userRole, setActiveSection }: VotingPageProps) => {
  const [activeVotings, setActiveVotings] = useState<any[]>([]);
  const [completedVotings, setCompletedVotings] = useState<any[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title'>('date-desc');

  useEffect(() => {
    loadVotings();

    const handleUpdate = () => {
      loadVotings();
    };

    window.addEventListener('votings-updated', handleUpdate);
    
    // Периодическая проверка (каждые 60 секунд)
    const interval = setInterval(() => {
      loadVotings();
    }, 60000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('votings-updated', handleUpdate);
    };
  }, [sortBy]);

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
        
        const completed = updatedVotings.filter((v: any) => v.status === 'completed' && !v.archived);
        
        // Сортировка
        completed.sort((a: any, b: any) => {
          if (sortBy === 'date-desc') {
            return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
          } else if (sortBy === 'date-asc') {
            return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          } else if (sortBy === 'title') {
            return a.title.localeCompare(b.title);
          }
          return 0;
        });
        
        setActiveVotings(active);
        setCompletedVotings(completed);
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
      }
    } catch (error) {
      console.error('Error sending voting completion notification:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Icon name="Vote" className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Голосования</h1>
            <p className="text-muted-foreground">Активные и завершённые голосования СНТ</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={!showCompleted ? "default" : "outline"}
            onClick={() => setShowCompleted(false)}
            className={!showCompleted ? "bg-gradient-to-r from-indigo-500 to-purple-500" : ""}
          >
            <Icon name="Clock" size={18} className="mr-2" />
            Активные ({activeVotings.length})
          </Button>
          <Button
            variant={showCompleted ? "default" : "outline"}
            onClick={() => setShowCompleted(true)}
            className={showCompleted ? "bg-gradient-to-r from-gray-500 to-gray-600" : ""}
          >
            <Icon name="Archive" size={18} className="mr-2" />
            Завершённые
          </Button>
        </div>
      </div>

      {!showCompleted ? (
        <section>
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
          )}
        </section>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Завершённые голосования</h3>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'date-desc' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy('date-desc')}
              >
                <Icon name="ArrowDown" size={16} className="mr-1" />
                Новые
              </Button>
              <Button
                variant={sortBy === 'date-asc' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy('date-asc')}
              >
                <Icon name="ArrowUp" size={16} className="mr-1" />
                Старые
              </Button>
              <Button
                variant={sortBy === 'title' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy('title')}
              >
                <Icon name="SortAsc" size={16} className="mr-1" />
                По названию
              </Button>
            </div>
          </div>
          
          {completedVotings.length === 0 ? (
            <Card className="border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Archive" size={32} className="text-gray-400" />
                </div>
                <p className="text-lg text-muted-foreground">Нет завершённых голосований</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {completedVotings.map((voting) => {
                const totalVotes = Object.values(voting.votes || {}).reduce((sum: number, count: any) => sum + count, 0);
                const results = voting.options.map((option: string, idx: number) => {
                  const votes = voting.votes?.[idx] || 0;
                  const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0';
                  return { option, votes, percentage };
                });
                
                const currentEmail = localStorage.getItem('current_user_email') || 'guest';
                const userVotesJSON = localStorage.getItem(`voting_${voting.id}_${currentEmail}`);
                const userVotes = userVotesJSON ? JSON.parse(userVotesJSON) : [];
                const userVotedIndex = userVotes.length > 0 ? userVotes[0] : null;

                return (
                  <Card key={voting.id} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                          <Icon name="CheckCircle2" size={14} className="mr-1" />
                          Завершено
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Icon name="Calendar" size={14} />
                          {new Date(voting.endDate).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{voting.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{voting.description}</p>
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-muted-foreground">Всего голосов</span>
                          <span className="text-2xl font-bold">{totalVotes}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h5 className="font-semibold text-sm text-muted-foreground">Результаты:</h5>
                        {results.map((result, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{result.option}</span>
                                {(userVotedIndex === idx || (Array.isArray(userVotes) && userVotes.includes(idx))) && (
                                  <Badge variant="outline" className="text-xs bg-green-50 border-green-300 text-green-700">
                                    Ваш выбор
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm font-semibold">{result.percentage}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-gray-500 to-gray-600 h-full transition-all duration-500" 
                                style={{ width: `${result.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{result.votes} голосов</span>
                          </div>
                        ))}
                      </div>

                      {(userRole === 'admin' || userRole === 'chairman') && (
                        <div className="pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveSection(`voting-results-${voting.id}`)}
                            className="w-full border-gray-500 text-gray-600 hover:bg-gray-50"
                          >
                            <Icon name="BarChart3" size={16} className="mr-2" />
                            Детальные результаты
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default VotingPage;