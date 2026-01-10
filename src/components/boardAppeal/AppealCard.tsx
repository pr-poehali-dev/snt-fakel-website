import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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

interface AppealCardProps {
  appeal: BoardAppeal;
  isBoardMember: boolean;
  canDelete: boolean;
  selectedAppeal: number | null;
  setSelectedAppeal: (id: number | null) => void;
  responseMessage: string;
  setResponseMessage: (value: string) => void;
  onAddResponse: (appealId: number) => void;
  onChangeStatus: (appealId: number, status: 'pending' | 'in_progress' | 'resolved') => void;
  onDelete?: (appealId: number) => void;
  getStatusBadge: (status: string) => JSX.Element;
}

const AppealCard = ({
  appeal,
  isBoardMember,
  canDelete,
  selectedAppeal,
  setSelectedAppeal,
  responseMessage,
  setResponseMessage,
  onAddResponse,
  onChangeStatus,
  onDelete,
  getStatusBadge
}: AppealCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{appeal.subject}</CardTitle>
              {getStatusBadge(appeal.status)}
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{appeal.message}</p>
        </div>

        {appeal.responses.length > 0 && (
          <div className="space-y-3 mb-4">
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

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
            {isExpanded ? 'Скрыть действия' : 'Показать действия'}
          </Button>

          {isBoardMember && appeal.status !== 'resolved' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChangeStatus(appeal.id, 'in_progress')}
                className="gap-2"
                disabled={appeal.status === 'in_progress'}
              >
                <Icon name="Play" size={16} />
                Взять в работу
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChangeStatus(appeal.id, 'resolved')}
                className="gap-2 text-green-600 hover:text-green-600"
              >
                <Icon name="CheckCircle" size={16} />
                Отметить решённым
              </Button>
            </>
          )}

          {isBoardMember && appeal.status === 'resolved' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChangeStatus(appeal.id, 'in_progress')}
              className="gap-2"
            >
              <Icon name="RotateCcw" size={16} />
              Вернуть в работу
            </Button>
          )}

          {canDelete && !showDeleteConfirm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-2 text-red-600 hover:text-red-600 hover:bg-red-50 ml-auto"
            >
              <Icon name="Trash2" size={16} />
              Удалить
            </Button>
          )}
        </div>

        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" className="text-red-600 mt-1" size={20} />
              <div className="flex-1">
                <p className="font-medium text-red-900 mb-2">Удалить обращение?</p>
                <p className="text-sm text-red-700 mb-4">
                  Это действие нельзя отменить. Обращение и все ответы будут удалены безвозвратно.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onDelete?.(appeal.id);
                      setShowDeleteConfirm(false);
                    }}
                    className="gap-2"
                  >
                    <Icon name="Trash2" size={16} />
                    Да, удалить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isExpanded && isBoardMember && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <label className="text-sm font-medium">Добавить ответ</label>
            <Textarea
              placeholder="Введите ваш ответ на обращение..."
              value={selectedAppeal === appeal.id ? responseMessage : ''}
              onChange={(e) => {
                setSelectedAppeal(appeal.id);
                setResponseMessage(e.target.value);
              }}
              rows={4}
            />
            <Button
              onClick={() => onAddResponse(appeal.id)}
              size="sm"
              className="gap-2"
              disabled={selectedAppeal !== appeal.id || !responseMessage.trim()}
            >
              <Icon name="Send" size={16} />
              Отправить ответ
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppealCard;