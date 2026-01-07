import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface PersonalDataAgreementProps {
  onClose: () => void;
}

const PersonalDataAgreement = ({ onClose }: PersonalDataAgreementProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Согласие на обработку персональных данных</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 overflow-y-auto">
          <div className="space-y-4 text-sm">
            <p>
              Настоящим я, субъект персональных данных, в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» свободно, своей волей и в своем интересе даю согласие СНТ «Факел» (далее — Оператор) на обработку своих персональных данных.
            </p>

            <div>
              <h3 className="font-semibold mb-2">1. Перечень персональных данных, на обработку которых дается согласие:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Фамилия, имя, отчество</li>
                <li>Дата рождения</li>
                <li>Номер телефона</li>
                <li>Адрес электронной почты</li>
                <li>Номер участка</li>
                <li>Сведения о собственности на земельный участок и дом</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Цели обработки персональных данных:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Идентификация субъекта в качестве члена СНТ «Факел»</li>
                <li>Предоставление доступа к личному кабинету на сайте</li>
                <li>Информирование о событиях и новостях СНТ</li>
                <li>Организация голосований и собраний</li>
                <li>Ведение реестра членов СНТ</li>
                <li>Взаимодействие по вопросам уплаты членских взносов</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Действия с персональными данными:</h3>
              <p>
                Оператор вправе осуществлять сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (распространение, предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Срок действия согласия:</h3>
              <p>
                Настоящее согласие действует с момента его предоставления до момента отзыва субъектом персональных данных. Согласие может быть отозвано путем направления письменного заявления Оператору.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">5. Права субъекта персональных данных:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Получать информацию о наличии персональных данных</li>
                <li>Требовать уточнения, блокирования или уничтожения данных</li>
                <li>Отозвать согласие на обработку персональных данных</li>
                <li>Обжаловать действия или бездействие Оператора</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Контактная информация для обращений по вопросам обработки персональных данных: СНТ «Факел», email: info@sntfakel.ru
              </p>
            </div>
          </div>
        </CardContent>
        <div className="p-4 border-t">
          <Button onClick={onClose} className="w-full">
            Закрыть
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PersonalDataAgreement;
