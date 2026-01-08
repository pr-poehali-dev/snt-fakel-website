import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface VotingResultsProps {
  votingId: number;
  onBack?: () => void;
}

interface VoteDetail {
  email: string;
  firstName: string;
  lastName: string;
  plotNumber: string;
  optionIndex?: number;
  optionIndexes?: number[];
  timestamp: string;
}

const VotingResults = ({ votingId, onBack }: VotingResultsProps) => {
  const [voting, setVoting] = useState<any>(null);
  const [voteDetails, setVoteDetails] = useState<VoteDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState<number | null>(null);

  useEffect(() => {
    loadVotingData();
  }, [votingId]);

  const loadVotingData = async () => {
    const votingsJSON = localStorage.getItem('snt_votings');
    if (!votingsJSON) return;

    const votings = JSON.parse(votingsJSON);
    let currentVoting = votings.find((v: any) => v.id === votingId);
    
    if (!currentVoting) return;
    
    // Проверяем, не истек ли срок голосования
    const now = new Date();
    const endDate = new Date(currentVoting.endDate);
    if (currentVoting.status === 'active' && endDate < now) {
      // Обновляем статус на завершено
      currentVoting = { ...currentVoting, status: 'completed' };
      const updatedVotings = votings.map((v: any) => 
        v.id === votingId ? currentVoting : v
      );
      localStorage.setItem('snt_votings', JSON.stringify(updatedVotings));
      window.dispatchEvent(new Event('votings-updated'));
    }
    
    setVoting(currentVoting);

    // Загрузить детали голосов из localStorage
    const details: VoteDetail[] = [];
    
    try {
      // Получаем все ключи из localStorage
      const allKeys = Object.keys(localStorage);
      const voteDetailKeys = allKeys.filter(key => key.startsWith(`voting_detail_${votingId}_`));
      
      for (const key of voteDetailKeys) {
        try {
          const detailJSON = localStorage.getItem(key);
          if (detailJSON) {
            const voteDetail = JSON.parse(detailJSON);
            
            // Извлекаем email из ключа
            const email = key.replace(`voting_detail_${votingId}_`, '');
            
            details.push({
              email: voteDetail.email || email,
              firstName: voteDetail.firstName || '',
              lastName: voteDetail.lastName || '',
              plotNumber: voteDetail.plotNumber || '',
              optionIndex: voteDetail.optionIndex,
              optionIndexes: voteDetail.optionIndexes,
              timestamp: voteDetail.timestamp || new Date().toISOString()
            });
          }
        } catch (e) {
          console.error('Error parsing vote detail:', e);
        }
      }

      setVoteDetails(details);
    } catch (error) {
      console.error('Error loading vote details:', error);
      toast.error('Не удалось загрузить детали голосования');
    }
  };

  const exportToCSV = () => {
    if (!voting) return;

    let csv = '\uFEFF';
    csv += 'Голосование,' + voting.title + '\n';
    csv += 'Описание,' + voting.description + '\n';
    csv += 'Дата окончания,' + new Date(voting.endDate).toLocaleDateString('ru-RU') + '\n';
    csv += 'Всего голосов,' + voteDetails.length + '\n\n';
    
    csv += 'Фамилия,Имя,Участок,Email,Выбранный вариант,Дата голосования\n';
    
    voteDetails.forEach(detail => {
      const options = detail.optionIndexes?.map((idx: number) => voting.options[idx]).join('; ') || voting.options[detail.optionIndex] || 'Неизвестно';
      csv += `${detail.lastName},${detail.firstName},${detail.plotNumber},${detail.email},"${options}",${new Date(detail.timestamp).toLocaleString('ru-RU')}\n`;
    });

    csv += '\n\nСтатистика по вариантам\n';
    csv += 'Вариант,Количество голосов,Процент\n';
    
    const totalVotes = Object.values(voting.votes || {}).reduce((sum: number, v: any) => sum + v, 0);
    voting.options.forEach((option: string, idx: number) => {
      const votes = voting.votes?.[idx] || 0;
      const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0';
      csv += `"${option}",${votes},${percentage}%\n`;
    });

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

  const exportToPDF = () => {
    if (!voting) return;

    const doc = new jsPDF();
    
    // Используем базовый шрифт (helvetica поддерживает Latin1)
    doc.setFont('helvetica');
    
    // Заголовок
    doc.setFontSize(18);
    doc.text('Rezultaty golosovaniya', 14, 20);
    
    // Информация о голосовании
    doc.setFontSize(12);
    doc.text(`Nazvanie: ${voting.title}`, 14, 30);
    doc.text(`Data okonchaniya: ${new Date(voting.endDate).toLocaleDateString('ru-RU')}`, 14, 38);
    doc.text(`Vsego golosov: ${voteDetails.length}`, 14, 46);
    
    // Статистика
    const statsData = voting.options.map((option: string, idx: number) => {
      const votes = voting.votes?.[idx] || 0;
      const totalVotes = Object.values(voting.votes || {}).reduce((sum: number, v: any) => sum + v, 0);
      const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0';
      return [option, votes.toString(), percentage + '%'];
    });
    
    autoTable(doc, {
      startY: 54,
      head: [['Variant', 'Golosa', 'Procent']],
      body: statsData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
    });
    
    // Детальный список
    const tableData = voteDetails.map(detail => {
      const options = detail.optionIndexes?.map((idx: number) => voting.options[idx]).join(', ') || voting.options[detail.optionIndex] || '';
      return [
        detail.plotNumber,
        `${detail.lastName} ${detail.firstName}`,
        detail.email,
        options,
        new Date(detail.timestamp).toLocaleString('ru-RU')
      ];
    });
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Uchastok', 'FIO', 'Email', 'Vybor', 'Data']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 },
    });
    
    doc.save(`golosovanie_${votingId}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Результаты экспортированы в PDF');
  };

  if (!voting) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalVotes = Object.values(voting.votes || {}).reduce((sum: number, v: any) => sum + v, 0);

  // Фильтрация и поиск
  const filteredVoteDetails = voteDetails.filter(detail => {
    const matchesSearch = searchTerm === '' || 
      detail.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.plotNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterOption === null || 
      (detail.optionIndexes 
        ? detail.optionIndexes.includes(filterOption) 
        : detail.optionIndex === filterOption);
    
    return matchesSearch && matchesFilter;
  });

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
        <div className="flex gap-2">
          {voting.status === 'completed' && !voting.archived && (
            <Button
              onClick={() => {
                const votingsJSON = localStorage.getItem('snt_votings');
                if (votingsJSON) {
                  const votings = JSON.parse(votingsJSON);
                  const updatedVotings = votings.map((v: any) => 
                    v.id === votingId ? { ...v, archived: true } : v
                  );
                  localStorage.setItem('snt_votings', JSON.stringify(updatedVotings));
                  window.dispatchEvent(new Event('votings-updated'));
                  toast.success('Голосование перемещено в архив');
                  if (onBack) onBack();
                }
              }}
              variant="outline"
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              <Icon name="Archive" size={18} className="mr-2" />
              Архивировать
            </Button>
          )}
          <Button
            onClick={async () => {
              try {
                // Получаем список всех пользователей
                const usersResponse = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35');
                const usersData = await usersResponse.json();
                const users = usersData.users || [];

                // Подсчитываем результаты
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
                  const data = await response.json();
                  toast.success(`Отправлено ${data.sent} уведомлений`);
                } else {
                  toast.error('Не удалось отправить уведомления');
                }
              } catch (error) {
                console.error('Error sending notifications:', error);
                toast.error('Ошибка при отправке уведомлений');
              }
            }}
            variant="outline"
            className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
          >
            <Icon name="Mail" size={18} className="mr-2" />
            Отправить уведомления
          </Button>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            <Icon name="FileSpreadsheet" size={18} className="mr-2" />
            CSV
          </Button>
          <Button
            onClick={exportToPDF}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
          >
            <Icon name="FileText" size={18} className="mr-2" />
            PDF
          </Button>
        </div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Детальный список голосов</CardTitle>
                <CardDescription>Кто и за что проголосовал</CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {filteredVoteDetails.length} {filteredVoteDetails.length === 1 ? 'голос' : 'голосов'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по ФИО, участку или email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterOption === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterOption(null)}
                >
                  Все варианты
                </Button>
                {voting?.options.map((option: string, idx: number) => (
                  <Button
                    key={idx}
                    variant={filterOption === idx ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterOption(idx)}
                    className={filterOption === idx ? "bg-indigo-500 hover:bg-indigo-600" : ""}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {filteredVoteDetails.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="SearchX" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {voteDetails.length === 0 ? 'Голосов пока нет' : 'Ничего не найдено'}
                </p>
              </div>
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
                    {filteredVoteDetails.map((detail, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">{detail.plotNumber}</td>
                        <td className="py-3 px-2">{detail.lastName} {detail.firstName}</td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{detail.email}</td>
                        <td className="py-3 px-2">
                          {detail.optionIndexes && detail.optionIndexes.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {detail.optionIndexes.map((optIdx: number) => (
                                <Badge key={optIdx} variant="outline" className="bg-indigo-50 border-indigo-300 text-indigo-700">
                                  {voting.options[optIdx]}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <Badge variant="outline" className="bg-indigo-50 border-indigo-300 text-indigo-700">
                              {voting.options[detail.optionIndex]}
                            </Badge>
                          )}
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