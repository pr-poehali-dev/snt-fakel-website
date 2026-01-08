import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface RulesContent {
  title: string;
  mainTitle: string;
  mainText: string;
  rulesTitle: string;
  rulesItems: string[];
  behaviorTitle: string;
  behaviorText: string;
}

interface RulesEditorProps {
  content: RulesContent;
  onChange: (content: RulesContent) => void;
}

const RulesEditor = ({ content, onChange }: RulesEditorProps) => {
  const updateRulesItem = (index: number, value: string) => {
    const newItems = [...content.rulesItems];
    newItems[index] = value;
    onChange({ ...content, rulesItems: newItems });
  };

  const addRulesItem = () => {
    onChange({
      ...content,
      rulesItems: [...content.rulesItems, 'Новое правило']
    });
  };

  const removeRulesItem = (index: number) => {
    onChange({
      ...content,
      rulesItems: content.rulesItems.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Заголовок страницы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Главный заголовок</Label>
            <Input
              value={content.title}
              onChange={(e) => onChange({ ...content, title: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Раздел "Устав СНТ"</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Название раздела</Label>
            <Input
              value={content.mainTitle}
              onChange={(e) => onChange({ ...content, mainTitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              value={content.mainText}
              onChange={(e) => onChange({ ...content, mainText: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Основные положения</CardTitle>
            <Button onClick={addRulesItem} size="sm">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Заголовок списка</Label>
            <Input
              value={content.rulesTitle}
              onChange={(e) => onChange({ ...content, rulesTitle: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <Label>Пункты правил</Label>
            {content.rulesItems.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateRulesItem(index, e.target.value)}
                  placeholder={`Правило ${index + 1}`}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeRulesItem(index)}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Правила поведения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Заголовок</Label>
            <Input
              value={content.behaviorTitle}
              onChange={(e) => onChange({ ...content, behaviorTitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Текст</Label>
            <Textarea
              value={content.behaviorText}
              onChange={(e) => onChange({ ...content, behaviorText: e.target.value })}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RulesEditor;
