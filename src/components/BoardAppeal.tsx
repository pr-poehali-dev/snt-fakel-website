import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface BoardAppeal {
  id: number;
  fromEmail: string;
  fromName: string;
  plotNumber: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'in_progress' | 'resolved';
  responses: AppealResponse[];
}

interface AppealResponse {
  id: number;
  fromEmail: string;
  fromName: string;
  fromRole: string;
  message: string;
  timestamp: string;
}

interface User {
  email: string;
  firstName: string;
  lastName: string;
  plotNumber: string;
  role: string;
}

interface BoardAppealProps {
  currentUserEmail: string;
  userRole: string;
  onBack: () => void;
}

const BoardAppeal = ({ currentUserEmail, userRole, onBack }: BoardAppealProps) => {
  const [appeals, setAppeals] = useState<BoardAppeal[]>([]);
  const [showNewAppeal, setShowNewAppeal] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedAppeal, setSelectedAppeal] = useState<number | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserPlot, setCurrentUserPlot] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'status'>('date-desc');

  const isBoardMember = userRole === 'admin' || userRole === 'chairman' || userRole === 'board_member';

  useEffect(() => {
    loadAppeals();
    loadCurrentUserInfo();

    const handleUpdate = () => {
      loadAppeals();
    };

    window.addEventListener('board-appeals-updated', handleUpdate);
    return () => window.removeEventListener('board-appeals-updated', handleUpdate);
  }, []);

  const loadCurrentUserInfo = () => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users: User[] = JSON.parse(usersJSON);
      const user = users.find((u) => u.email === currentUserEmail);
      if (user) {
        setCurrentUserName(`${user.firstName} ${user.lastName}`);
        setCurrentUserPlot(user.plotNumber);
      }
    }
  };

  const loadAppeals = () => {
    const saved = localStorage.getItem('snt_board_appeals');
    if (saved) {
      try {
        const allAppeals: BoardAppeal[] = JSON.parse(saved);
        
        if (isBoardMember) {
          setAppeals(allAppeals);
        } else {
          const userAppeals = allAppeals.filter((appeal) => appeal.fromEmail === currentUserEmail);
          setAppeals(userAppeals);
        }
      } catch (e) {
        console.error('Error loading appeals:', e);
      }
    }
  };

  const handleCreateAppeal = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Заполните тему и сообщение');
      return;
    }

    const saved = localStorage.getItem('snt_board_appeals');
    const allAppeals: BoardAppeal[] = saved ? JSON.parse(saved) : [];

    const currentTime = new Date();
    const timestamp = currentTime.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newAppeal: BoardAppeal = {
      id: Date.now(),
      fromEmail: currentUserEmail,
      fromName: currentUserName,
      plotNumber: currentUserPlot,
      subject: subject.trim(),
      message: message.trim(),
      timestamp,
      status: 'pending',
      responses: []
    };

    allAppeals.push(newAppeal);
    localStorage.setItem('snt_board_appeals', JSON.stringify(allAppeals));
    window.dispatchEvent(new Event('board-appeals-updated'));

    setSubject('');
    setMessage('');
    setShowNewAppeal(false);
    toast.success('Обращение отправлено в правление');
  };

  const handleAddResponse = (appealId: number) => {
    if (!responseMessage.trim()) {
      toast.error('Введите текст ответа');
      return;
    }

    const saved = localStorage.getItem('snt_board_appeals');
    if (!saved) return;

    const allAppeals: BoardAppeal[] = JSON.parse(saved);
    const currentTime = new Date();
    const timestamp = currentTime.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const roleNames: Record<string, string> = {
      admin: 'Администратор',
      chairman: 'Председатель',
      board_member: 'Член правления'
    };

    const response: AppealResponse = {
      id: Date.now(),
      fromEmail: currentUserEmail,
      fromName: currentUserName,
      fromRole: roleNames[userRole] || userRole,
      message: responseMessage.trim(),
      timestamp
    };

    const updatedAppeals = allAppeals.map((appeal) => {
      if (appeal.id === appealId) {
        return {
          ...appeal,
          responses: [...appeal.responses, response],
          status: 'in_progress' as const
        };
      }
      return appeal;
    });

    localStorage.setItem('snt_board_appeals', JSON.stringify(updatedAppeals));
    window.dispatchEvent(new Event('board-appeals-updated'));

    setResponseMessage('');
    toast.success('Ответ отправлен');
  };

  const handleChangeStatus = (appealId: number, status: 'pending' | 'in_progress' | 'resolved') => {
    const saved = localStorage.getItem('snt_board_appeals');
    if (!saved) return;

    const allAppeals: BoardAppeal[] = JSON.parse(saved);
    const updatedAppeals = allAppeals.map((appeal) =>
      appeal.id === appealId ? { ...appeal, status } : appeal
    );

    localStorage.setItem('snt_board_appeals', JSON.stringify(updatedAppeals));
    window.dispatchEvent(new Event('board-appeals-updated'));

    const statusNames: Record<string, string> = {
      pending: 'Ожидает рассмотрения',
      in_progress: 'В работе',
      resolved: 'Решено'
    };

    toast.success(`Статус изменён: ${statusNames[status]}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Ожидает рассмотрения</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">В работе</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Решено</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (showNewAppeal) {
    return (
      <section>
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewAppeal(false)}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={18} />
            Назад
          </Button>
          <h2 className="text-4xl font-bold">Новое обращение</h2>
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Обращение в правление СНТ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Тема обращения</label>
              <Input
                placeholder="Кратко опишите суть обращения"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Сообщение</label>
              <Textarea
                placeholder="Подробно опишите вашу проблему или вопрос..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
              />
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800">
                <Icon name="Info" size={16} className="inline mr-2" />
                Обращение увидят председатель, члены правления и администраторы СНТ
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateAppeal}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                <Icon name="Send" size={18} className="mr-2" />
                Отправить обращение
              </Button>
              <Button variant="outline" onClick={() => setShowNewAppeal(false)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Фильтрация и сортировка обращений
  const filteredAppeals = appeals
    .filter((appeal) => {
      const matchesSearch = 
        appeal.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appeal.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appeal.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appeal.plotNumber.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || appeal.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === 'date-asc') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortBy === 'status') {
        const statusOrder = { pending: 0, in_progress: 1, resolved: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={18} />
            Назад
          </Button>
          <h2 className="text-4xl font-bold">
            {isBoardMember ? 'Обращения участников' : 'Мои обращения'}
          </h2>
        </div>
        {!isBoardMember && (
          <Button
            onClick={() => setShowNewAppeal(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            <Icon name="Plus" size={18} className="mr-2" />
            Новое обращение
          </Button>
        )}
      </div>

      {/* Фильтры */}
      {appeals.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Поиск</label>
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Тема, участок, ФИО..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Статус</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">Все статусы</option>
                  <option value="pending">Ожидает рассмотрения</option>
                  <option value="in_progress">В работе</option>
                  <option value="resolved">Решено</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Сортировка</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="date-desc">Сначала новые</option>
                  <option value="date-asc">Сначала старые</option>
                  <option value="status">По статусу</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Найдено обращений: <span className="font-semibold text-foreground">{filteredAppeals.length}</span> из {appeals.length}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  <Icon name="X" size={16} className="mr-1" />
                  Сбросить фильтры
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredAppeals.length === 0 && appeals.length > 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon name="Search" size={64} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold mb-2">Ничего не найдено</p>
            <p className="text-muted-foreground mb-4">
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Сбросить фильтры
            </Button>
          </CardContent>
        </Card>
      ) : appeals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon name="MessageSquare" size={64} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold mb-2">
              {isBoardMember ? 'Нет обращений' : 'У вас пока нет обращений'}
            </p>
            <p className="text-muted-foreground mb-4">
              {isBoardMember
                ? 'Обращения участников будут отображаться здесь'
                : 'Создайте обращение, если у вас есть вопрос или проблема'}
            </p>
            {!isBoardMember && (
              <Button
                onClick={() => setShowNewAppeal(true)}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                <Icon name="Plus" size={18} className="mr-2" />
                Создать обращение
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppeals.map((appeal) => (
            <Card key={appeal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{appeal.subject}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        <Icon name="User" size={14} className="inline mr-1" />
                        {appeal.fromName}
                      </span>
                      <span>
                        <Icon name="MapPin" size={14} className="inline mr-1" />
                        Участок №{appeal.plotNumber}
                      </span>
                      <span>
                        <Icon name="Calendar" size={14} className="inline mr-1" />
                        {appeal.timestamp}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(appeal.status)}
                    {isBoardMember && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedAppeal(selectedAppeal === appeal.id ? null : appeal.id)}
                      >
                        <Icon name={selectedAppeal === appeal.id ? 'ChevronUp' : 'ChevronDown'} size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm whitespace-pre-wrap">{appeal.message}</p>
                </div>

                {appeal.responses.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <p className="font-semibold text-sm">Ответы:</p>
                    {appeal.responses.map((response) => (
                      <div key={response.id} className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold">{response.fromName}</span>
                          <Badge variant="outline" className="text-xs">{response.fromRole}</Badge>
                          <span className="text-xs text-muted-foreground ml-auto">{response.timestamp}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {isBoardMember && selectedAppeal === appeal.id && (
                  <div className="space-y-3 pt-3 border-t">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Ответ на обращение</label>
                      <Textarea
                        placeholder="Напишите ответ участнику..."
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddResponse(appeal.id)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Icon name="Send" size={16} className="mr-2" />
                        Отправить ответ
                      </Button>
                      {appeal.status !== 'resolved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleChangeStatus(appeal.id, 'resolved')}
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                          <Icon name="CheckCircle" size={16} className="mr-2" />
                          Пометить решённым
                        </Button>
                      )}
                      {appeal.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleChangeStatus(appeal.id, 'in_progress')}
                        >
                          Взять в работу
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default BoardAppeal;