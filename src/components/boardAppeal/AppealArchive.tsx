import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import AppealFilters from './AppealFilters';

interface AppealResponse {
  id: number;
  fromEmail: string;
  fromName: string;
  fromRole: string;
  message: string;
  timestamp: string;
}

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

interface AppealArchiveProps {
  currentUserEmail: string;
  userRole: string;
  onBack: () => void;
}

const AppealArchive = ({ currentUserEmail, userRole, onBack }: AppealArchiveProps) => {
  const [archivedAppeals, setArchivedAppeals] = useState<BoardAppeal[]>([]);
  const [expandedAppeal, setExpandedAppeal] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('resolved');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'status'>('date-desc');

  const isBoardMember = userRole === 'admin' || userRole === 'chairman' || userRole === 'board_member';
  const canDelete = userRole === 'admin' || userRole === 'chairman';

  useEffect(() => {
    loadArchivedAppeals();

    const handleUpdate = () => {
      loadArchivedAppeals();
    };

    window.addEventListener('board-appeals-updated', handleUpdate);
    return () => window.removeEventListener('board-appeals-updated', handleUpdate);
  }, []);

  const loadArchivedAppeals = () => {
    const saved = localStorage.getItem('snt_board_appeals');
    if (saved) {
      try {
        const allAppeals: BoardAppeal[] = JSON.parse(saved);
        const resolved = allAppeals.filter((appeal) => appeal.status === 'resolved');
        
        if (isBoardMember) {
          setArchivedAppeals(resolved);
        } else {
          const userResolvedAppeals = resolved.filter((appeal) => appeal.fromEmail === currentUserEmail);
          setArchivedAppeals(userResolvedAppeals);
        }
      } catch (e) {
        console.error('Error loading archived appeals:', e);
      }
    }
  };

  const filteredAppeals = archivedAppeals
    .filter((appeal) => {
      const matchesSearch = 
        appeal.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appeal.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appeal.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appeal.plotNumber.includes(searchTerm);
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === 'date-asc') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      return 0;
    });

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('resolved');
    setSortBy('date-desc');
  };

  const handleDeleteAppeal = (appealId: number) => {
    const saved = localStorage.getItem('snt_board_appeals');
    if (!saved) return;

    const allAppeals: BoardAppeal[] = JSON.parse(saved);
    const updatedAppeals = allAppeals.filter((appeal) => appeal.id !== appealId);

    localStorage.setItem('snt_board_appeals', JSON.stringify(updatedAppeals));
    window.dispatchEvent(new Event('board-appeals-updated'));

    setDeleteConfirmId(null);
    toast.success('Обращение удалено из архива');
  };

  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <Icon name="ArrowLeft" size={18} />
          Назад
        </Button>
        <h2 className="text-4xl font-bold">Архив обращений</h2>
      </div>

      <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
        <div className="flex items-start gap-3">
          <Icon name="Archive" className="text-green-600 mt-1" size={20} />
          <div>
            <p className="font-medium text-green-900">Архив решённых обращений</p>
            <p className="text-sm text-green-700 mt-1">
              Здесь хранятся все обращения со статусом "Решено". Вы можете просмотреть историю переписки и результаты решения вопросов.
            </p>
          </div>
        </div>
      </div>

      <AppealFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalCount={archivedAppeals.length}
        filteredCount={filteredAppeals.length}
        onReset={handleResetFilters}
      />

      {filteredAppeals.length === 0 && archivedAppeals.length > 0 && (
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

      {archivedAppeals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Archive" className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Архив пуст</h3>
          <p className="text-muted-foreground">
            {isBoardMember
              ? 'Здесь будут отображаться решённые обращения участников'
              : 'У вас пока нет решённых обращений'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppeals.map((appeal) => (
            <Card key={appeal.id} className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{appeal.subject}</CardTitle>
                      <Badge className="bg-green-500">Решено</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="User" size={14} />
                        {appeal.fromName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="MapPin" size={14} />
                        Участок №{appeal.plotNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={14} />
                        {appeal.timestamp}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedAppeal(expandedAppeal === appeal.id ? null : appeal.id)}
                      className="gap-2"
                    >
                      <Icon name={expandedAppeal === appeal.id ? "ChevronUp" : "ChevronDown"} size={16} />
                      {expandedAppeal === appeal.id ? 'Скрыть' : 'Подробнее'}
                    </Button>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(appeal.id)}
                        className="gap-2 text-red-600 hover:text-red-600 hover:bg-red-50"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {deleteConfirmId === appeal.id && (
                <CardContent>
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                    <div className="flex items-start gap-3">
                      <Icon name="AlertTriangle" className="text-red-600 mt-1" size={20} />
                      <div className="flex-1">
                        <p className="font-medium text-red-900 mb-2">Удалить обращение из архива?</p>
                        <p className="text-sm text-red-700 mb-4">
                          Это действие нельзя отменить. Обращение и все ответы будут удалены безвозвратно.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteAppeal(appeal.id)}
                            className="gap-2"
                          >
                            <Icon name="Trash2" size={16} />
                            Да, удалить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}

              {expandedAppeal === appeal.id && (
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="FileText" size={16} />
                      Обращение
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{appeal.message}</p>
                  </div>

                  {appeal.responses.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Icon name="MessageSquare" size={18} />
                        Ответы ({appeal.responses.length})
                      </h4>
                      {appeal.responses.map((response) => (
                        <div key={response.id} className="bg-blue-50 border-l-4 border-l-blue-500 p-4 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-blue-900">{response.fromName}</span>
                              <Badge className="bg-blue-500">{response.fromRole}</Badge>
                            </div>
                            <span className="text-xs text-blue-600">{response.timestamp}</span>
                          </div>
                          <p className="text-blue-900 whitespace-pre-wrap">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default AppealArchive;