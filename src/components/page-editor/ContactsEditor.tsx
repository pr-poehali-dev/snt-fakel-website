import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContactsContent {
  title: string;
  addressTitle: string;
  addressText: string;
  contactsTitle: string;
  phone: string;
  email: string;
  detailsTitle: string;
  inn: string;
  kpp: string;
  account: string;
  bik: string;
}

interface ContactsEditorProps {
  content: ContactsContent;
  onChange: (content: ContactsContent) => void;
}

const ContactsEditor = ({ content, onChange }: ContactsEditorProps) => {
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
          <CardTitle className="text-lg">Адрес</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Заголовок раздела</Label>
            <Input
              value={content.addressTitle}
              onChange={(e) => onChange({ ...content, addressTitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Адрес (каждая строка с новой строки)</Label>
            <Textarea
              value={content.addressText}
              onChange={(e) => onChange({ ...content, addressText: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Контактная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Заголовок раздела</Label>
            <Input
              value={content.contactsTitle}
              onChange={(e) => onChange({ ...content, contactsTitle: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input
                value={content.phone}
                onChange={(e) => onChange({ ...content, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={content.email}
                onChange={(e) => onChange({ ...content, email: e.target.value })}
                placeholder="info@snt.ru"
                type="email"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Реквизиты организации</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Заголовок раздела</Label>
            <Input
              value={content.detailsTitle}
              onChange={(e) => onChange({ ...content, detailsTitle: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ИНН</Label>
              <Input
                value={content.inn}
                onChange={(e) => onChange({ ...content, inn: e.target.value })}
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label>КПП</Label>
              <Input
                value={content.kpp}
                onChange={(e) => onChange({ ...content, kpp: e.target.value })}
                placeholder="123456789"
              />
            </div>
            <div className="space-y-2">
              <Label>Расчётный счёт</Label>
              <Input
                value={content.account}
                onChange={(e) => onChange({ ...content, account: e.target.value })}
                placeholder="40703810000000000000"
              />
            </div>
            <div className="space-y-2">
              <Label>БИК</Label>
              <Input
                value={content.bik}
                onChange={(e) => onChange({ ...content, bik: e.target.value })}
                placeholder="044525225"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactsEditor;
