import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import BackButton from '../BackButton';

interface GalleryItem {
  id: number;
  title: string;
  season: string;
}

interface PageContent {
  rules: {
    title: string;
    mainTitle: string;
    mainText: string;
    rulesTitle: string;
    rulesItems: string[];
    behaviorTitle: string;
    behaviorText: string;
  };
  contacts: {
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
  };
  gallery: {
    title: string;
    enabled: boolean;
  };
}

const defaultContent: PageContent = {
  rules: {
    title: 'Правила и устав товарищества',
    mainTitle: 'Устав СНТ Факел',
    mainText: 'Садовое некоммерческое товарищество «Факел» создано в соответствии с законодательством РФ и осуществляет деятельность на основании настоящего устава.',
    rulesTitle: 'Основные положения:',
    rulesItems: [
      'Соблюдение тишины с 22:00 до 08:00',
      'Своевременная уплата членских взносов',
      'Содержание участка в надлежащем состоянии',
      'Участие в общих субботниках',
      'Соблюдение правил пожарной безопасности'
    ],
    behaviorTitle: 'Правила поведения',
    behaviorText: 'Участники товарищества обязуются соблюдать порядок, уважать права соседей, поддерживать чистоту на общей территории и участвовать в жизни сообщества.'
  },
  contacts: {
    title: 'Контакты и реквизиты',
    addressTitle: 'Адрес',
    addressText: 'Московская область, Раменский район\nСНТ «Факел»\nд. Малое Уварово',
    contactsTitle: 'Контакты',
    phone: '+7 (495) 123-45-67',
    email: 'info@snt-fakel.ru',
    detailsTitle: 'Реквизиты',
    inn: '5012345678',
    kpp: '501201001',
    account: '40703810000000000000',
    bik: '044525225'
  },
  gallery: {
    title: 'Галерея фото территории',
    enabled: true
  }
};

interface InfoSectionsProps {
  activeSection: string;
  gallery: GalleryItem[];
  onBack?: () => void;
}

const InfoSections = ({ activeSection, gallery, onBack }: InfoSectionsProps) => {
  const [content, setContent] = useState<PageContent>(defaultContent);

  useEffect(() => {
    const loadContent = () => {
      const savedContent = localStorage.getItem('pages_content');
      if (savedContent) {
        try {
          setContent(JSON.parse(savedContent));
        } catch (e) {
          console.error('Error loading pages content:', e);
        }
      }
    };

    loadContent();

    const handleContentUpdate = () => {
      loadContent();
    };

    window.addEventListener('pages-content-updated', handleContentUpdate);
    return () => window.removeEventListener('pages-content-updated', handleContentUpdate);
  }, []);
  if (activeSection === 'rules') {
    return (
      <section>
        {onBack && <BackButton onClick={onBack} />}
        <h2 className="text-4xl font-bold mb-8">{content.rules.title}</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" className="text-primary" />
                {content.rules.mainTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-muted-foreground mb-4">
                {content.rules.mainText}
              </p>
              <h4 className="font-semibold mt-6 mb-3">{content.rules.rulesTitle}</h4>
              <ul className="space-y-2 text-muted-foreground">
                {content.rules.rulesItems.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Scale" className="text-primary" />
                {content.rules.behaviorTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {content.rules.behaviorText}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (activeSection === 'gallery') {
    return (
      <section>
        {onBack && <BackButton onClick={onBack} />}
        <h2 className="text-4xl font-bold mb-8">{content.gallery.title}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gallery.map((photo) => (
            <Card key={photo.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-square bg-gradient-to-br from-orange-200 via-purple-200 to-pink-200 flex items-center justify-center">
                <Icon name="Image" size={48} className="text-white" />
              </div>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-1">{photo.title}</h4>
                <p className="text-sm text-muted-foreground">{photo.season}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (activeSection === 'contacts') {
    return (
      <section>
        {onBack && <BackButton onClick={onBack} />}
        <h2 className="text-4xl font-bold mb-8">{content.contacts.title}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="MapPin" className="text-primary" />
                {content.contacts.addressTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>
                {content.contacts.addressText}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Phone" className="text-primary" />
                {content.contacts.contactsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground flex items-center gap-2">
                <Icon name="Phone" size={16} />
                {content.contacts.phone}
              </p>
              <p className="text-muted-foreground flex items-center gap-2">
                <Icon name="Mail" size={16} />
                {content.contacts.email}
              </p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Building2" className="text-primary" />
                {content.contacts.detailsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">ИНН</p>
                  <p className="font-medium">{content.contacts.inn}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">КПП</p>
                  <p className="font-medium">{content.contacts.kpp}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Расчётный счёт</p>
                  <p className="font-medium">{content.contacts.account}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">БИК</p>
                  <p className="font-medium">{content.contacts.bik}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return null;
};

export default InfoSections;