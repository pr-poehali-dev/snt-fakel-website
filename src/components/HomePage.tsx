import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type UserRole = 'guest' | 'member' | 'admin';

interface Poll {
  id: number;
  title: string;
  description: string;
  options: { text: string; votes: number }[];
  deadline: string;
  status: string;
}

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  text: string;
}

interface HomePageProps {
  polls: Poll[];
  news: NewsItem[];
  isLoggedIn: boolean;
  userRole: UserRole;
  votes: { [key: number]: number };
  handleVote: (pollId: number, option: number) => void;
  setActiveSection: (section: string) => void;
}

const HomePage = ({ polls, news, isLoggedIn, userRole, votes, handleVote, setActiveSection }: HomePageProps) => {
  return (
    <>
      <section className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-pink-100 px-4 py-2 rounded-full mb-6">
          <Icon name="Sparkles" size={18} className="text-orange-600" />
          <span className="text-sm font-medium text-orange-800">Добро пожаловать</span>
        </div>
        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
          СНТ Факел
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Современное садовое товарищество с удобной системой управления и электронным голосованием
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" onClick={() => setActiveSection('news')}>
            <Icon name="Newspaper" size={20} className="mr-2" />
            Новости
          </Button>
          <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
            <Icon name="Vote" size={20} className="mr-2" />
            Голосования
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-4 gap-6 mb-16">
        {[
          { icon: 'Users', label: 'Участников', value: '156', color: 'from-orange-500 to-orange-600' },
          { icon: 'Home', label: 'Участков', value: '180', color: 'from-purple-500 to-purple-600' },
          { icon: 'TreePine', label: 'Гектаров', value: '24', color: 'from-pink-500 to-pink-600' },
          { icon: 'Vote', label: 'Голосований', value: '12', color: 'from-blue-500 to-blue-600' },
        ].map((stat, idx) => (
          <Card key={idx} className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <Icon name={stat.icon as any} className="text-white" size={24} />
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Icon name="Vote" className="text-white" size={20} />
          </div>
          <h3 className="text-3xl font-bold">Активные голосования</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <Card key={poll.id} className="border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-pink-500">
                    {poll.status === 'active' ? 'Активно' : 'Завершено'}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Icon name="Clock" size={14} />
                    до {poll.deadline}
                  </span>
                </div>
                <CardTitle className="text-xl">{poll.title}</CardTitle>
                <CardDescription>{poll.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {poll.options.map((option, idx) => {
                  const total = poll.options.reduce((sum, o) => sum + o.votes, 0);
                  const percentage = Math.round((option.votes / total) * 100);
                  const isVoted = votes[poll.id] === idx;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{option.text}</span>
                        <span className="text-sm text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-pink-500 h-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{option.votes} голосов</span>
                        {isLoggedIn && (userRole === 'member' || userRole === 'admin') && !isVoted && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVote(poll.id, idx)}
                            className="text-primary hover:text-primary"
                          >
                            <Icon name="CheckCircle" size={16} className="mr-1" />
                            Выбрать
                          </Button>
                        )}
                        {isVoted && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Icon name="Check" size={14} className="mr-1" />
                            Ваш выбор
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
                {(!isLoggedIn || userRole === 'guest') && (
                  <p className="text-sm text-muted-foreground italic pt-2 border-t">
                    {!isLoggedIn ? 'Войдите в личный кабинет для участия в голосовании' : 'Только члены СНТ могут участвовать в голосовании'}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Icon name="Newspaper" className="text-white" size={20} />
          </div>
          <h3 className="text-3xl font-bold">Последние новости</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {news.map((item) => (
            <Card key={item.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{item.category}</Badge>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;