import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface MigrateVotingsToDatabaseProps {
  userEmail: string;
  userRole: string;
  onBack: () => void;
}

const API_URL = 'https://functions.poehali.dev/7df5da0f-03ad-44be-92cc-3123468556ce';

const MigrateVotingsToDatabase = ({ userEmail, userRole, onBack }: MigrateVotingsToDatabaseProps) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState<string[]>([]);

  const migrateVotings = async () => {
    if (userRole !== 'admin' && userRole !== 'chairman') {
      toast.error('Недостаточно прав для миграции');
      return;
    }

    setIsMigrating(true);
    setMigrationResults([]);
    const results: string[] = [];

    try {
      const votingsJSON = localStorage.getItem('snt_votings');
      if (!votingsJSON) {
        results.push('⚠️ В localStorage нет голосований для миграции');
        setMigrationResults(results);
        setIsMigrating(false);
        return;
      }

      const votings = JSON.parse(votingsJSON);
      results.push(`📊 Найдено голосований: ${votings.length}`);
      setMigrationResults([...results]);

      for (const voting of votings) {
        try {
          const response = await fetch(API_URL + '?type=votings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Email': userEmail,
              'X-User-Role': userRole
            },
            body: JSON.stringify({
              id: voting.id,
              title: voting.title,
              description: voting.description || '',
              options: voting.options,
              startDate: voting.startDate,
              endDate: voting.endDate,
              status: voting.status || 'active',
              createdBy: voting.createdBy || userEmail
            })
          });

          if (response.ok) {
            results.push(`✅ Голосование: ${voting.title}`);
            
            // Мигрируем голоса пользователей
            if (voting.votes) {
              const votesEntries = Object.entries(voting.votes);
              for (const [voteUserEmail, optionIndex] of votesEntries) {
                try {
                  const voteResponse = await fetch(API_URL + '?type=votings', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-User-Email': userEmail,
                      'X-User-Role': userRole
                    },
                    body: JSON.stringify({
                      action: 'vote',
                      votingId: voting.id,
                      userEmail: voteUserEmail,
                      optionIndex: optionIndex as number
                    })
                  });
                  
                  if (voteResponse.ok) {
                    const voteData = await voteResponse.json();
                    if (voteData.message === 'Vote already exists') {
                      results.push(`  ⚠️ Голос уже существует: ${voteUserEmail}`);
                    } else {
                      results.push(`  ✅ Голос: ${voteUserEmail}`);
                    }
                  }
                } catch (error) {
                  results.push(`  ❌ Ошибка при миграции голоса: ${error}`);
                }
              }
            }
          } else if (response.status === 409) {
            const errorData = await response.json();
            results.push(`⚠️ Голосование уже существует: ${voting.title}`);
          } else {
            const errorData = await response.json();
            results.push(`❌ Ошибка при миграции голосования ${voting.title}: ${errorData.error || 'Unknown error'}`);
          }
        } catch (error) {
          results.push(`❌ Ошибка при миграции голосования ${voting.title}: ${error}`);
        }
        
        setMigrationResults([...results]);
      }

      results.push('');
      results.push('✅ Миграция завершена!');
      results.push('ℹ️ Данные в localStorage сохранены как резервная копия');
      setMigrationResults(results);
      toast.success('Миграция голосований завершена');

    } catch (error) {
      results.push(`❌ Критическая ошибка: ${error}`);
      setMigrationResults(results);
      toast.error('Ошибка при миграции голосований');
    } finally {
      setIsMigrating(false);
    }
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
        <h2 className="text-4xl font-bold">Миграция голосований в базу данных</h2>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Database" size={24} />
            Синхронизация голосований
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <div className="flex items-start gap-3">
                <Icon name="Info" className="text-blue-600 mt-1" size={20} />
                <div>
                  <p className="font-medium text-blue-900 mb-2">Что делает миграция?</p>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Переносит все голосования из localStorage в базу данных</li>
                    <li>Синхронизирует голоса всех пользователей</li>
                    <li>Обеспечивает синхронизацию между всеми устройствами</li>
                    <li>Сохраняет данные в localStorage как резервную копию</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" className="text-yellow-600 mt-1" size={20} />
                <div>
                  <p className="font-medium text-yellow-900 mb-2">Важно!</p>
                  <p className="text-sm text-yellow-700">
                    Миграцию нужно выполнить один раз. После миграции все голосования будут автоматически синхронизироваться между устройствами.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={migrateVotings}
              disabled={isMigrating}
              className="w-full gap-2"
              size="lg"
            >
              {isMigrating ? (
                <>
                  <Icon name="Loader2" className="animate-spin" size={20} />
                  Миграция в процессе...
                </>
              ) : (
                <>
                  <Icon name="Database" size={20} />
                  Начать миграцию голосований
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {migrationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="FileText" size={24} />
              Результаты миграции
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
              {migrationResults.map((result, index) => (
                <div key={index} className={
                  result.startsWith('✅') ? 'text-green-400' :
                  result.startsWith('❌') ? 'text-red-400' :
                  result.startsWith('⚠️') ? 'text-yellow-400' :
                  result.startsWith('📊') ? 'text-blue-400' :
                  result.startsWith('ℹ️') ? 'text-cyan-400' :
                  'text-gray-300'
                }>
                  {result}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default MigrateVotingsToDatabase;