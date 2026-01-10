import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface NewsHistoryEntry {
  date: string;
  author: string;
  action: 'created' | 'edited' | 'published' | 'unpublished';
}

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  text: string;
  showOnMainPage?: boolean;
  mainPageExpiresAt?: string;
  createdBy?: string;
  createdAt?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  history?: NewsHistoryEntry[];
}

interface NewsHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNews: NewsItem | null;
}

const NewsHistoryDialog = ({ open, onOpenChange, selectedNews }: NewsHistoryDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="History" className="text-primary" />
            История изменений
          </DialogTitle>
          <DialogDescription>
            {selectedNews?.title}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          {selectedNews?.history && selectedNews.history.length > 0 ? (
            <div className="space-y-3">
              {[...selectedNews.history].reverse().map((entry, index) => {
                const date = new Date(entry.date);
                const actionText = {
                  created: 'Создана',
                  edited: 'Отредактирована',
                  published: 'Размещена на главной',
                  unpublished: 'Убрана с главной'
                }[entry.action];
                
                const actionColor = {
                  created: 'text-green-600',
                  edited: 'text-blue-600',
                  published: 'text-orange-600',
                  unpublished: 'text-gray-600'
                }[entry.action];

                return (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <Icon 
                        name={
                          entry.action === 'created' ? 'Plus' :
                          entry.action === 'edited' ? 'Pencil' :
                          entry.action === 'published' ? 'Star' : 'StarOff'
                        } 
                        size={16} 
                        className={actionColor}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{actionText}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.author} · {date.toLocaleString('ru-RU', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">История пуста</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NewsHistoryDialog;
