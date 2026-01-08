import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import VotingCard from './VotingCard';
import CompletedVotings from './CompletedVotings';

interface VotingPageProps {
  isLoggedIn: boolean;
  userRole: string;
  setActiveSection: (section: string) => void;
}

const VotingPage = ({ isLoggedIn, userRole, setActiveSection }: VotingPageProps) => {
  const [activeVotings, setActiveVotings] = useState<any[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

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
  }, []);

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
        <CompletedVotings userRole={userRole} setActiveSection={setActiveSection} />
      )}
    </div>
  );
};

export default VotingPage;
