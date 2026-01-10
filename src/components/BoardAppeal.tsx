import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import AppealFilters from './boardAppeal/AppealFilters';
import AppealForm from './boardAppeal/AppealForm';
import AppealCard from './boardAppeal/AppealCard';

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

    const handleNavigateToArchive = () => {
      window.dispatchEvent(new CustomEvent('set-active-section', { detail: 'appeal-archive' }));
    };

    window.addEventListener('board-appeals-updated', handleUpdate);
    window.addEventListener('navigate-to-appeal-archive', handleNavigateToArchive);
    return () => {
      window.removeEventListener('board-appeals-updated', handleUpdate);
      window.removeEventListener('navigate-to-appeal-archive', handleNavigateToArchive);
    };
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

  const activeAppeals = appeals.filter((appeal) => appeal.status !== 'resolved');

  const filteredAppeals = activeAppeals
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

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date-desc');
  };

  if (showNewAppeal) {
    return (
      <AppealForm
        subject={subject}
        setSubject={setSubject}
        message={message}
        setMessage={setMessage}
        onSubmit={handleCreateAppeal}
        onCancel={() => setShowNewAppeal(false)}
      />
    );
  }

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
            {isBoardMember ? 'Обращения участников' : 'Мои обращения в правление'}
          </h2>
        </div>
        <div className="flex gap-2">
          {!isBoardMember && (
            <Button
              onClick={() => setShowNewAppeal(true)}
              className="gap-2"
            >
              <Icon name="Plus" size={18} />
              Новое обращение
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded flex items-center justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Icon name="Info" className="text-blue-600 mt-1" size={20} />
          <div>
            <p className="font-medium text-blue-900">Активные обращения</p>
            <p className="text-sm text-blue-700 mt-1">
              Здесь отображаются обращения в работе и ожидающие рассмотрения. Решённые обращения автоматически перемещаются в архив.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-appeal-archive'))}
          className="gap-2 ml-4"
        >
          <Icon name="Archive" size={18} />
          Архив
        </Button>
      </div>

      <AppealFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalCount={activeAppeals.length}
        filteredCount={filteredAppeals.length}
        onReset={handleResetFilters}
      />

      {filteredAppeals.length === 0 && activeAppeals.length > 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Search" className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
          <p className="text-muted-foreground mb-4">
            По вашему запросу обращений не найдено. Попробуйте изменить параметры поиска.
          </p>
          <Button variant="outline" onClick={handleResetFilters}>
            Сбросить фильтры
          </Button>
        </div>
      )}

      {activeAppeals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="MessageSquare" className="text-orange-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {isBoardMember ? 'Обращений пока нет' : 'У вас нет обращений'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {isBoardMember
              ? 'Как только участники отправят обращение, оно появится здесь'
              : 'Вы можете отправить обращение в правление СНТ'}
          </p>
          {!isBoardMember && (
            <Button onClick={() => setShowNewAppeal(true)} className="gap-2">
              <Icon name="Plus" size={18} />
              Создать обращение
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppeals.map((appeal) => (
            <AppealCard
              key={appeal.id}
              appeal={appeal}
              isBoardMember={isBoardMember}
              selectedAppeal={selectedAppeal}
              setSelectedAppeal={setSelectedAppeal}
              responseMessage={responseMessage}
              setResponseMessage={setResponseMessage}
              onAddResponse={handleAddResponse}
              onChangeStatus={handleChangeStatus}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BoardAppeal;