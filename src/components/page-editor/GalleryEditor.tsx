import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GalleryContent {
  title: string;
  enabled: boolean;
}

interface GalleryEditorProps {
  content: GalleryContent;
  onChange: (content: GalleryContent) => void;
}

const GalleryEditor = ({ content, onChange }: GalleryEditorProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Настройки галереи</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Заголовок страницы</Label>
            <Input
              value={content.title}
              onChange={(e) => onChange({ ...content, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Статус галереи</Label>
            <Select
              value={content.enabled ? 'enabled' : 'disabled'}
              onValueChange={(value) => onChange({ ...content, enabled: value === 'enabled' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Включена</SelectItem>
                <SelectItem value="disabled">Отключена</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryEditor;
