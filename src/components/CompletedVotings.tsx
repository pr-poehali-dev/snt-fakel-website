import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface CompletedVotingsProps {
  userRole: string;
  setActiveSection: (section: string) => void;
}

const CompletedVotings = ({ userRole, setActiveSection }: CompletedVotingsProps) => {
  const [completedVotings, setCompletedVotings] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title'>('date-desc');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; votingId: string | null }>({ show: false, votingId: null });

  useEffect(() => {
    loadCompletedVotings();

    const handleUpdate = () => {
      loadCompletedVotings();
    };

    window.addEventListener('votings-updated', handleUpdate);
    return () => window.removeEventListener('votings-updated', handleUpdate);
  }, [sortBy]);

  const loadCompletedVotings = () => {
    const votingsJSON = localStorage.getItem('snt_votings');
    if (votingsJSON) {
      try {
        const votings = JSON.parse(votingsJSON);
        const completed = votings.filter((v: any) => v.status === 'completed' && !v.archived);
        
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
        
        setCompletedVotings(completed);
      } catch (e) {
        console.error('Error loading completed votings:', e);
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

  const handleDeleteVoting = (votingId: string) => {
    const votingsJSON = localStorage.getItem('snt_votings');
    if (!votingsJSON) return;

    const votings = JSON.parse(votingsJSON);
    const updatedVotings = votings.filter((v: any) => v.id !== votingId);
    localStorage.setItem('snt_votings', JSON.stringify(updatedVotings));

    const allKeys = Object.keys(localStorage);
    const voteKeys = allKeys.filter(key => 
      key.startsWith(`voting_${votingId}_`) || 
      key.startsWith(`voting_detail_${votingId}_`)
    );

    voteKeys.forEach(key => localStorage.removeItem(key));

    window.dispatchEvent(new Event('votings-updated'));
    toast.success('Голосование удалено');
    setDeleteConfirm({ show: false, votingId: null });
  };

  if (completedVotings.length === 0) {
    return (
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
            <Icon name="Archive" className="text-white" size={20} />
          </div>
          <h3 className="text-3xl font-bold">Завершённые голосования</h3>
        </div>
        <Card className="border-2">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Archive" size={32} className="text-gray-400" />
            </div>
            <p className="text-lg text-muted-foreground">Нет завершённых голосований</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
            <Icon name="Archive" className="text-white" size={20} />
          </div>
          <h3 className="text-3xl font-bold">Завершённые голосования</h3>
        </div>
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

      <div className="grid md:grid-cols-2 gap-6">
        {completedVotings.map((voting) => {
          const results = calculateResults(voting);
          const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
          const currentEmail = localStorage.getItem('current_user_email') || 'guest';
          const userVotesJSON = localStorage.getItem(`voting_${voting.id}_${currentEmail}`);
          const userVotes = userVotesJSON ? JSON.parse(userVotesJSON) : [];
          const userVotedIndex = userVotes.length > 0 ? userVotes[0] : null;

          return (
            <Card key={voting.id} className="border-2">
              <CardHeader>
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
                          className="bg-gradient-to-r from-gray-500 to-gray-600 h-full transition-all duration-500" 
                          style={{ width: `${result.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{result.votes} голосов</span>
                    </div>
                  ))}
                </div>

                {(userRole === 'admin' || userRole === 'chairman') && (
                  <div className="pt-4 border-t space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveSection(`voting-results-${voting.id}`)}
                      className="w-full border-gray-500 text-gray-600 hover:bg-gray-50"
                    >
                      <Icon name="BarChart3" size={16} className="mr-2" />
                      Детальные результаты
                    </Button>
                    {userRole === 'admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm({ show: true, votingId: voting.id })}
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Icon name="Trash2" size={16} className="mr-2" />
                        Удалить голосование
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={deleteConfirm.show} onOpenChange={(open) => setDeleteConfirm({ show: open, votingId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" className="text-red-500" />
              Удаление голосования
            </DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить это голосование? Все данные и результаты будут безвозвратно удалены.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ show: false, votingId: null })}
            >
              Отменить
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm.votingId && handleDeleteVoting(deleteConfirm.votingId)}
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CompletedVotings;