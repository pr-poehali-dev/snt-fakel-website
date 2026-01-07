import { useState } from 'react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import HomePage from '@/components/HomePage';
import ContentSections from '@/components/ContentSections';
import Footer from '@/components/Footer';
import Registration from '@/components/Registration';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [activeSection, setActiveSection] = useState('home');
  const [votes, setVotes] = useState<{ [key: number]: number }>({});
  const [showRegistration, setShowRegistration] = useState(false);

  const handleVote = (pollId: number, option: number) => {
    setVotes({ ...votes, [pollId]: option });
    toast.success('Ваш голос учтён!');
  };

  const handleLogin = (role: UserRole = 'member') => {
    setIsLoggedIn(true);
    setUserRole(role);
    const roleNames = {
      guest: 'Гость',
      member: 'Член СНТ',
      board_member: 'Член правления',
      chairman: 'Председатель',
      admin: 'Администратор'
    };
    toast.success(`Добро пожаловать в СНТ Факел! Роль: ${roleNames[role]}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('guest');
    setActiveSection('home');
    toast.success('Вы вышли из личного кабинета');
  };

  const handleRegisterClick = () => {
    setShowRegistration(true);
    setActiveSection('registration');
  };

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
    setActiveSection('home');
  };

  const handleRegistrationCancel = () => {
    setShowRegistration(false);
    setActiveSection('home');
  };

  const polls = [
    {
      id: 1,
      title: 'Благоустройство детской площадки',
      description: 'Проголосуйте за установку нового оборудования',
      options: [
        { text: 'Горка и качели', votes: 45 },
        { text: 'Песочница и домик', votes: 32 },
        { text: 'Спортивный комплекс', votes: 23 },
      ],
      deadline: '15 января 2026',
      status: 'active',
    },
    {
      id: 2,
      title: 'Размер членских взносов на 2026 год',
      description: 'Утверждение суммы ежегодного взноса',
      options: [
        { text: '12 000 рублей', votes: 67 },
        { text: '15 000 рублей', votes: 28 },
        { text: '10 000 рублей', votes: 15 },
      ],
      deadline: '20 января 2026',
      status: 'active',
    },
  ];

  const news = [
    {
      id: 1,
      title: 'Начало отопительного сезона',
      date: '5 января 2026',
      category: 'Важное',
      text: 'Уважаемые жители! Напоминаем о правилах пожарной безопасности в зимний период.',
    },
    {
      id: 2,
      title: 'График вывоза мусора',
      date: '3 января 2026',
      category: 'Объявление',
      text: 'Обновлённый график: вторник и пятница с 9:00 до 11:00.',
    },
    {
      id: 3,
      title: 'Общее собрание',
      date: '28 декабря 2025',
      category: 'Мероприятия',
      text: 'Приглашаем всех участников на годовое собрание 25 января в 15:00.',
    },
  ];

  const gallery = [
    { id: 1, title: 'Центральная аллея', season: 'Лето 2025' },
    { id: 2, title: 'Детская площадка', season: 'Весна 2025' },
    { id: 3, title: 'Территория зимой', season: 'Зима 2025' },
    { id: 4, title: 'Праздник урожая', season: 'Осень 2025' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      <Header 
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        onRegisterClick={handleRegisterClick}
      />

      <main className="container mx-auto px-4 py-12">
        {showRegistration ? (
          <Registration 
            onSuccess={handleRegistrationSuccess}
            onCancel={handleRegistrationCancel}
          />
        ) : (
          <>
            {activeSection === 'home' && (
              <HomePage 
                polls={polls}
                news={news}
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                votes={votes}
                handleVote={handleVote}
                setActiveSection={setActiveSection}
              />
            )}

            <ContentSections 
              activeSection={activeSection}
              news={news}
              gallery={gallery}
              isLoggedIn={isLoggedIn}
              userRole={userRole}
              setActiveSection={setActiveSection}
            />
          </>
        )}
      </main>

      <Footer setActiveSection={setActiveSection} />
    </div>
  );
};

export default Index;