import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface VotingResultsProps {
  votingId: number;
  onBack?: () => void;
}

interface VoteDetail {
  email: string;
  firstName: string;
  lastName: string;
  plotNumber: string;
  optionIndex: number;
  timestamp: string;
}

const VotingResults = ({ votingId, onBack }: VotingResultsProps) => {
  const [voting, setVoting] = useState<any>(null);
  const [voteDetails, setVoteDetails] = useState<VoteDetail[]>([]);

  useEffect(() => {
    loadVotingData();
  }, [votingId]);

  const loadVotingData = async () => {
    const votingsJSON = localStorage.getItem('snt_votings');
    if (!votingsJSON) return;

    const votings = JSON.parse(votingsJSON);
    const currentVoting = votings.find((v: any) => v.id === votingId);
    
    if (!currentVoting) return;
    setVoting(currentVoting);

    // Загрузить детали голосов
    const details: VoteDetail[] = [];
    
    try {
      const usersResponse = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35');
      const usersData = await usersResponse.json();
      const users = usersData.users || [];

      for (const user of users) {
        const voteJSON = localStorage.getItem(`voting_${votingId}_${user.email}`);
        if (voteJSON) {
          const votes = JSON.parse(voteJSON);
          if (votes.length > 0) {
            const detailJSON = localStorage.getItem(`voting_detail_${votingId}_${user.email}`);
            let timestamp = new Date().toISOString();
            
            if (detailJSON) {
              try {
                const voteDetail = JSON.parse(detailJSON);
                timestamp = voteDetail.timestamp || timestamp;
              } catch (e) {
                console.error('Error parsing vote detail:', e);
              }
            }
            
            details.push({
              email: user.email,
              firstName: user.first_name,
              lastName: user.last_name,
              plotNumber: user.plot_number,
              optionIndex: votes[0],
              timestamp
            });
          }
        }
      }

      setVoteDetails(details);
    } catch (error) {
      console.error('Error loading vote details:', error);
      toast.error('Не удалось загрузить детали голосования');
    }
  };

  const exportToExcel = () => {
    if (!voting) return;

    // Создать CSV данные
    let csv = '\uFEFF'; // UTF-8 BOM для корректного отображения кириллицы в Excel
    csv += 'Голосование,' + voting.title + '\n';
    csv += 'Описание,' + voting.description + '\n';
    csv += 'Дата окончания,' + new Date(voting.endDate).toLocaleDateString('ru-RU') + '\n';
    csv += 'Всего голосов,' + voteDetails.length + '\n\n';
    
    csv += 'Фамилия,Имя,Участок,Email,Выбранный вариант,Дата голосования\n';
    
    voteDetails.forEach(detail => {
      const optionText = voting.options[detail.optionIndex] || 'Неизвестно';
      csv += `${detail.lastName},${detail.firstName},${detail.plotNumber},${detail.email},"${optionText}",${new Date(detail.timestamp).toLocaleString('ru-RU')}\n`;
    });

    // Добавить статистику по вариантам
    csv += '\n\nСтатистика по вариантам\n';
    csv += 'Вариант,Количество голосов,Процент\n';
    
    const totalVotes = Object.values(voting.votes || {}).reduce((sum: number, v: any) => sum + v, 0);
    voting.options.forEach((option: string, idx: number) => {
      const votes = voting.votes?.[idx] || 0;
      const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0';
      csv += `"${option}",${votes},${percentage}%\n`;
    });

    // Создать blob и скачать
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `голосование_${votingId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Результаты экспортированы в CSV');
  };

  if (!voting) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalVotes = Object.values(voting.votes || {}).reduce((sum: number, v: any) => sum + v, 0);

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <Icon name="ArrowLeft" size={18} />
              Назад
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="BarChart3" className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-4xl font-bold">Результаты голосования</h2>
              <p className="text-muted-foreground">{voting.title}</p>
            </div>
          </div>
        </div>
        <Button
          onClick={exportToExcel}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          <Icon name="Download" size={18} className="mr-2" />
          Экспорт в CSV
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Общая информация</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Всего голосов</p>
              <p className="text-2xl font-bold">{totalVotes}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Участников</p>
              <p className="text-2xl font-bold">{voteDetails.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Статус</p>
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500">
                {voting.status === 'active' ? 'Активно' : 'Завершено'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Окончание</p>
              <p className="text-lg font-semibold">{new Date(voting.endDate).toLocaleDateString('ru-RU')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика по вариантам</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {voting.options.map((option: string, idx: number) => {
              const optionVotes = voting.votes?.[idx] || 0;
              const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
              
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{optionVotes} голосов</span>
                      <span className="text-sm font-semibold">{percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Детальный список голосов</CardTitle>
            <CardDescription>Кто и за что проголосовал</CardDescription>
          </CardHeader>
          <CardContent>
            {voteDetails.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Голосов пока нет</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-semibold">Участок</th>
                      <th className="text-left py-3 px-2 font-semibold">ФИО</th>
                      <th className="text-left py-3 px-2 font-semibold">Email</th>
                      <th className="text-left py-3 px-2 font-semibold">Выбранный вариант</th>
                      <th className="text-left py-3 px-2 font-semibold">Дата голосования</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voteDetails.map((detail, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">{detail.plotNumber}</td>
                        <td className="py-3 px-2">{detail.lastName} {detail.firstName}</td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{detail.email}</td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="bg-indigo-50 border-indigo-300 text-indigo-700">
                            {voting.options[detail.optionIndex]}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">
                          {new Date(detail.timestamp).toLocaleString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default VotingResults;