import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface NewsListItemProps {
  item: NewsItem;
  getTimeRemaining: (expiresAt: string) => string;
  onToggleMainPage: (id: number, customDuration?: number) => void;
  onShowHistory: (item: NewsItem) => void;
  onEdit: (item: NewsItem) => void;
  onDelete: (id: number) => void;
}

const NewsListItem = ({
  item,
  getTimeRemaining,
  onToggleMainPage,
  onShowHistory,
  onEdit,
  onDelete
}: NewsListItemProps) => {
  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge>{item.category}</Badge>
              {item.showOnMainPage && item.mainPageExpiresAt && new Date(item.mainPageExpiresAt) > new Date() && (
                <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                  <Icon name="Star" size={12} className="mr-1" />
                  На главной · {getTimeRemaining(item.mainPageExpiresAt)}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">{item.date}</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
            <p className="text-muted-foreground">{item.text}</p>
            {item.createdBy && (
              <p className="text-xs text-muted-foreground mt-2">
                Создал: {item.createdBy}
                {item.lastEditedBy && item.lastEditedBy !== item.createdBy && (
                  <> · Ред.: {item.lastEditedBy}</>
                )}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {item.showOnMainPage && item.mainPageExpiresAt && new Date(item.mainPageExpiresAt) > new Date() ? (
              <div className="flex gap-1">
                <Button
                  onClick={() => onToggleMainPage(item.id)}
                  variant="ghost"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  title="Убрать с главной"
                >
                  <Icon name="StarOff" size={16} />
                </Button>
                <Select onValueChange={(value) => onToggleMainPage(item.id, parseInt(value))}>
                  <SelectTrigger className="h-8 w-[90px] text-xs">
                    <SelectValue placeholder="Срок" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 день</SelectItem>
                    <SelectItem value="3">3 дня</SelectItem>
                    <SelectItem value="7">7 дней</SelectItem>
                    <SelectItem value="14">14 дней</SelectItem>
                    <SelectItem value="30">30 дней</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <Select onValueChange={(value) => onToggleMainPage(item.id, parseInt(value))}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder="📌 На главную" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 день</SelectItem>
                  <SelectItem value="3">3 дня</SelectItem>
                  <SelectItem value="7">7 дней</SelectItem>
                  <SelectItem value="14">14 дней</SelectItem>
                  <SelectItem value="30">30 дней</SelectItem>
                </SelectContent>
              </Select>
            )}
            {item.history && item.history.length > 0 && (
              <Button
                onClick={() => onShowHistory(item)}
                variant="ghost"
                size="sm"
                title="История изменений"
              >
                <Icon name="History" size={16} />
              </Button>
            )}
            <Button
              onClick={() => onEdit(item)}
              variant="ghost"
              size="sm"
              title="Редактировать"
            >
              <Icon name="Pencil" size={16} />
            </Button>
            <Button
              onClick={() => onDelete(item.id)}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Удалить"
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsListItem;
