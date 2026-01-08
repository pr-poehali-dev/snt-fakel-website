import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ArchivedVotingsProps {
  userRole: string;
  setActiveSection: (section: string) => void;
}

const ArchivedVotings = ({ userRole, setActiveSection }: ArchivedVotingsProps) => {
  const [archivedVotings, setArchivedVotings] = useState<any[]>([]);

  useEffect(() => {
    loadArchivedVotings();

    const handleUpdate = () => {
      loadArchivedVotings();
    };

    window.addEventListener('votings-updated', handleUpdate);
    return () => window.removeEventListener('votings-updated', handleUpdate);
  }, []);

  const loadArchivedVotings = () => {
    const votingsJSON = localStorage.getItem('snt_votings');
    if (votingsJSON) {
      try {
        const votings = JSON.parse(votingsJSON);
        const archived = votings.filter((v: any) => v.archived === true);
        setArchivedVotings(archived);
      } catch (e) {
        console.error('Error loading archived votings:', e);
      }
    }
  };

  const calculateResults = (voting: any) => {
    const totalVotes = Object.values(voting.votes || {}).reduce((sum: number, count: any) => sum + count, 0);
    return voting.options.map((option: string, idx: number) => {
      const votes = voting.votes?.[idx] || 0;
      const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0';
      return { option, votes, percentage };
    });
  };

  const handleUnarchive = (votingId: number) => {
    const votingsJSON = localStorage.getItem('snt_votings');
    if (votingsJSON) {
      const votings = JSON.parse(votingsJSON);
      const updatedVotings = votings.map((v: any) => 
        v.id === votingId ? { ...v, archived: false } : v
      );
      localStorage.setItem('snt_votings', JSON.stringify(updatedVotings));
      window.dispatchEvent(new Event('votings-updated'));
    }
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
          <Icon name="Archive" className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-4xl font-bold">Архив голосований</h2>
          <p className="text-muted-foreground">История завершённых и архивированных голосований</p>
        </div>
      </div>

      {archivedVotings.length === 0 ? (
        <Card className="border-2">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Archive" size={32} className="text-gray-400" />
            </div>
            <p className="text-lg text-muted-foreground">Архив пуст</p>
            <p className="text-sm text-muted-foreground mt-2">Архивированные голосования появятся здесь</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {archivedVotings.map((voting) => {
            const results = calculateResults(voting);
            const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
            const currentEmail = localStorage.getItem('current_user_email') || 'guest';
            const userVotesJSON = localStorage.getItem(`voting_${voting.id}_${currentEmail}`);
            const userVotes = userVotesJSON ? JSON.parse(userVotesJSON) : [];
            const userVotedIndex = userVotes.length > 0 ? userVotes[0] : null;

            return (
              <Card key={voting.id} className="border-2 bg-amber-50/30">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="bg-amber-200 text-amber-800">
                      <Icon name="Archive" size={14} className="mr-1" />
                      Архив
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      {new Date(voting.endDate).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{voting.title}</CardTitle>
                  <CardDescription>{voting.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-muted-foreground">Всего голосов</span>
                      <span className="text-2xl font-bold">{totalVotes}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground">Результаты:</h4>
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
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500" 
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{result.votes} голосов</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    {(userRole === 'admin' || userRole === 'chairman') && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveSection(`voting-results-${voting.id}`)}
                          className="w-full border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Icon name="BarChart3" size={16} className="mr-2" />
                          Детальные результаты
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnarchive(voting.id)}
                          className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
                        >
                          <Icon name="ArchiveRestore" size={16} className="mr-2" />
                          Восстановить из архива
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ArchivedVotings;
