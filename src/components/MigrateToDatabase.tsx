import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface MigrateToDatabaseProps {
  userEmail: string;
  userRole: string;
}

const MigrateToDatabase = ({ userEmail, userRole }: MigrateToDatabaseProps) => {
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const migrateContent = async () => {
    setMigrating(true);
    setResults([]);
    const migrated: string[] = [];

    try {
      const API_URL = 'https://functions.poehali.dev/75f35e00-3b1b-424f-8c93-684dfbd64afd';

      // Миграция страниц (rules, contacts, gallery)
      const pagesData = localStorage.getItem('pages_content');
      if (pagesData) {
        try {
          const pages = JSON.parse(pagesData);
          for (const [key, content] of Object.entries(pages)) {
            await fetch(API_URL + '?type=pages', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'X-User-Email': userEmail,
                'X-User-Role': userRole
              },
              body: JSON.stringify({ key, content })
            });
            migrated.push(`✅ Страница: ${key}`);
          }
        } catch (e) {
          migrated.push(`❌ Ошибка миграции страниц: ${e}`);
        }
      }

      // Миграция настроек главной страницы
      const siteData = localStorage.getItem('site_content');
      if (siteData) {
        try {
          const content = JSON.parse(siteData);
          await fetch(API_URL + '?type=pages', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Email': userEmail,
              'X-User-Role': userRole
            },
            body: JSON.stringify({ key: 'home', content })
          });
          migrated.push('✅ Главная страница');
        } catch (e) {
          migrated.push(`❌ Ошибка миграции главной: ${e}`);
        }
      }

      // Миграция новостей
      const newsData = localStorage.getItem('snt_news');
      if (newsData) {
        try {
          const news = JSON.parse(newsData);
          for (const item of news) {
            const response = await fetch(API_URL + '?type=news', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-User-Email': userEmail,
                'X-User-Role': userRole
              },
              body: JSON.stringify({
                id: item.id,
                title: item.title,
                text: item.text,
                category: item.category,
                images: item.images || [],
                showOnMainPage: item.showOnMainPage,
                mainPageExpiresAt: item.mainPageExpiresAt,
              })
            });
            
            if (response.status === 409) {
              migrated.push(`⚠️ Новость уже существует: ${item.title}`);
            } else if (response.ok) {
              migrated.push(`✅ Новость: ${item.title}`);
            } else {
              migrated.push(`❌ Ошибка миграции новости ${item.title}`);
            }
          }
        } catch (e) {
          migrated.push(`❌ Ошибка миграции новостей: ${e}`);
        }
      }

      // Миграция документов
      const documentsData = localStorage.getItem('snt_documents');
      if (documentsData) {
        try {
          const docs = JSON.parse(documentsData);
          for (const doc of docs) {
            const response = await fetch(API_URL + '?type=documents', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-User-Email': userEmail,
                'X-User-Role': userRole
              },
              body: JSON.stringify({
                id: doc.id,
                title: doc.title,
                category: doc.category,
                description: doc.description,
                fileUrl: doc.fileUrl,
                fileName: doc.fileName
              })
            });
            
            if (response.status === 409) {
              migrated.push(`⚠️ Документ уже существует: ${doc.title}`);
            } else if (response.ok) {
              migrated.push(`✅ Документ: ${doc.title}`);
            } else {
              migrated.push(`❌ Ошибка миграции документа ${doc.title}`);
            }
          }
        } catch (e) {
          migrated.push(`❌ Ошибка миграции документов: ${e}`);
        }
      }

      setResults(migrated);
      
      if (migrated.length > 0) {
        toast.success(`Миграция завершена! Перенесено элементов: ${migrated.filter(r => r.startsWith('✅')).length}`);
      } else {
        toast.info('Нет данных для миграции');
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Ошибка при миграции данных');
      setResults([...migrated, `❌ Общая ошибка: ${error}`]);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Database" />
          Миграция контента в базу данных
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-900">
            <strong>Важно:</strong> Эта функция перенесёт весь контент сайта (новости, страницы, настройки) 
            из локального хранилища браузера в общую базу данных. После миграции все пользователи будут видеть 
            одинаковый актуальный контент на всех устройствах.
          </p>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
            <h4 className="font-semibold mb-2">Результаты миграции:</h4>
            <ul className="space-y-1 text-sm">
              {results.map((result, index) => (
                <li key={index} className={result.startsWith('❌') ? 'text-red-600' : 'text-green-600'}>
                  {result}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={migrateContent}
          disabled={migrating}
          className="w-full gap-2"
          size="lg"
        >
          {migrating ? (
            <>
              <Icon name="Loader2" className="animate-spin" size={20} />
              Миграция в процессе...
            </>
          ) : (
            <>
              <Icon name="Upload" size={20} />
              Начать миграцию данных
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Миграция безопасна и не удаляет данные из localStorage
        </p>
      </CardContent>
    </Card>
  );
};

export default MigrateToDatabase;