import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface VotingCardProps {
  voting: any;
  isLoggedIn: boolean;
  userRole: string;
  setActiveSection: (section: string) => void;
}

const VotingCard = ({ voting, isLoggedIn, userRole, setActiveSection }: VotingCardProps) => {
  const currentEmail = localStorage.getItem('current_user_email') || 'guest';
  const userVotesJSON = localStorage.getItem(`voting_${voting.id}_${currentEmail}`);
  const userVotes = userVotesJSON ? JSON.parse(userVotesJSON) : [];
  const hasVoted = userVotes.length > 0;
  
  const sessionJSON = localStorage.getItem('snt_session');
  const isOwner = sessionJSON ? JSON.parse(sessionJSON).isOwner === true : false;
  
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleOption = (idx: number) => {
    if (voting.isMultipleChoice) {
      setSelectedOptions(prev => 
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      );
    } else {
      handleSingleVote(idx);
    }
  };

  const handleSingleVote = (idx: number) => {
    const now = new Date();
    const endDate = new Date(voting.endDate);
    if (endDate < now) {
      toast.error('Голосование завершено');
      window.dispatchEvent(new Event('votings-updated'));
      return;
    }
    
    const votingsJSON = localStorage.getItem('snt_votings');
    if (votingsJSON) {
      const votings = JSON.parse(votingsJSON);
      const votingIndex = votings.findIndex((v: any) => v.id === voting.id);
      if (votingIndex !== -1) {
        if (!votings[votingIndex].votes) votings[votingIndex].votes = {};
        votings[votingIndex].votes[idx] = (votings[votingIndex].votes[idx] || 0) + 1;
        localStorage.setItem('snt_votings', JSON.stringify(votings));
        
        const session = sessionJSON ? JSON.parse(sessionJSON) : null;
        
        const voteData = {
          optionIndex: idx,
          timestamp: new Date().toISOString(),
          firstName: session?.firstName || '',
          lastName: session?.lastName || '',
          plotNumber: session?.plotNumber || '',
          email: currentEmail
        };
        localStorage.setItem(`voting_${voting.id}_${currentEmail}`, JSON.stringify([idx]));
        localStorage.setItem(`voting_detail_${voting.id}_${currentEmail}`, JSON.stringify(voteData));
        
        window.dispatchEvent(new Event('votings-updated'));
        toast.success('Ваш голос учтён!');
      }
    }
  };

  const handleDeleteVoting = () => {
    const votingsJSON = localStorage.getItem('snt_votings');
    if (!votingsJSON) return;
    
    const votings = JSON.parse(votingsJSON);
    const updatedVotings = votings.filter((v: any) => v.id !== voting.id);
    localStorage.setItem('snt_votings', JSON.stringify(updatedVotings));
    
    const allKeys = Object.keys(localStorage);
    const voteKeys = allKeys.filter(key => 
      key.startsWith(`voting_${voting.id}_`) || 
      key.startsWith(`voting_detail_${voting.id}_`)
    );
    
    voteKeys.forEach(key => localStorage.removeItem(key));
    
    window.dispatchEvent(new Event('votings-updated'));
    toast.success('Голосование удалено');
    setShowDeleteConfirm(false);
  };

  const handleMultipleVote = () => {
    if (selectedOptions.length === 0) {
      toast.error('Выберите хотя бы один вариант');
      return;
    }

    const now = new Date();
    const endDate = new Date(voting.endDate);
    if (endDate < now) {
      toast.error('Голосование завершено');
      window.dispatchEvent(new Event('votings-updated'));
      return;
    }
    
    const votingsJSON = localStorage.getItem('snt_votings');
    if (votingsJSON) {
      const votings = JSON.parse(votingsJSON);
      const votingIndex = votings.findIndex((v: any) => v.id === voting.id);
      if (votingIndex !== -1) {
        if (!votings[votingIndex].votes) votings[votingIndex].votes = {};
        
        selectedOptions.forEach(idx => {
          votings[votingIndex].votes[idx] = (votings[votingIndex].votes[idx] || 0) + 1;
        });
        
        localStorage.setItem('snt_votings', JSON.stringify(votings));
        
        const session = sessionJSON ? JSON.parse(sessionJSON) : null;
        
        const voteData = {
          optionIndexes: selectedOptions,
          timestamp: new Date().toISOString(),
          firstName: session?.firstName || '',
          lastName: session?.lastName || '',
          plotNumber: session?.plotNumber || '',
          email: currentEmail
        };
        localStorage.setItem(`voting_${voting.id}_${currentEmail}`, JSON.stringify(selectedOptions));
        localStorage.setItem(`voting_detail_${voting.id}_${currentEmail}`, JSON.stringify(voteData));
        
        window.dispatchEvent(new Event('votings-updated'));
        toast.success(`Ваш голос учтён! Выбрано вариантов: ${selectedOptions.length}`);
      }
    }
  };

  return (
    <Card className="border-2 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500">
            Активно
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Icon name="Clock" size={14} />
            до {new Date(voting.endDate).toLocaleDateString('ru-RU')}
          </span>
        </div>
        <CardTitle className="text-xl">{voting.title}</CardTitle>
        <CardDescription>{voting.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {voting.isMultipleChoice && !hasVoted && isLoggedIn && isOwner && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <Icon name="Info" size={16} />
              Можно выбрать несколько вариантов
            </p>
          </div>
        )}
        
        {voting.options.map((option: string, idx: number) => {
          const optionVotes = voting.votes?.[idx] || 0;
          const totalVotes = Object.values(voting.votes || {}).reduce((sum: number, v: any) => sum + v, 0);
          const percentage = totalVotes > 0 ? Math.round((optionVotes / (totalVotes as number)) * 100) : 0;
          const isVoted = userVotes.includes(idx);
          const isSelected = selectedOptions.includes(idx);
          
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{option}</span>
                <span className="text-sm text-muted-foreground">{percentage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{optionVotes} голосов</span>
                {isLoggedIn && isOwner && (userRole === 'member' || userRole === 'board_member' || userRole === 'chairman' || userRole === 'admin') && !hasVoted && (
                  voting.isMultipleChoice ? (
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleToggleOption(idx)}
                      className={isSelected ? "bg-indigo-500 hover:bg-indigo-600" : ""}
                    >
                      <Icon name={isSelected ? "CheckSquare" : "Square"} size={16} className="mr-1" />
                      {isSelected ? "Выбрано" : "Выбрать"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleOption(idx)}
                      className="text-primary hover:text-primary"
                    >
                      <Icon name="CheckCircle" size={16} className="mr-1" />
                      Голосовать
                    </Button>
                  )
                )}
                {isLoggedIn && !isOwner && !hasVoted && (
                  <span className="text-xs text-muted-foreground italic">
                    Только собственники
                  </span>
                )}
                {isVoted && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Icon name="Check" size={14} className="mr-1" />
                    Проголосовали
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
        
        {voting.isMultipleChoice && !hasVoted && isLoggedIn && isOwner && selectedOptions.length > 0 && (
          <Button
            onClick={handleMultipleVote}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            <Icon name="CheckCircle2" size={18} className="mr-2" />
            Подтвердить выбор ({selectedOptions.length})
          </Button>
        )}
        
        <div className="mt-4 pt-4 border-t space-y-3">
          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" />
            <span>
              Голосовать могут только собственники участков. Перевыбор невозможен. 
              {voting.isMultipleChoice && ' Можно выбрать несколько вариантов.'} 
              Голосование завершится {new Date(voting.endDate).toLocaleDateString('ru-RU')}.
            </span>
          </p>
          {(userRole === 'admin' || userRole === 'chairman') && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection(`voting-results-${voting.id}`)}
                className="w-full border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              >
                <Icon name="BarChart3" size={16} className="mr-2" />
                Просмотреть результаты
              </Button>
              
              {userRole === 'admin' && (
                showDeleteConfirm ? (
                  <div className="space-y-2">
                    <p className="text-sm text-center text-red-600 font-medium">
                      Удалить голосование?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1"
                      >
                        Отмена
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteVoting}
                        className="flex-1"
                      >
                        <Icon name="Trash2" size={16} className="mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Удалить голосование
                  </Button>
                )
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VotingCard;