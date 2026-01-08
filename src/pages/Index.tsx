import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import HomePage from '@/components/HomePage';
import ContentSections from '@/components/ContentSections';
import Footer from '@/components/Footer';
import Registration from '@/components/Registration';
import Login from '@/components/Login';
import PasswordReset from '@/components/PasswordReset';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('snt_session');
    if (!saved) return false;
    
    try {
      const session = JSON.parse(saved);
      const expiresAt = session.expiresAt || 0;
      
      if (Date.now() > expiresAt) {
        localStorage.removeItem('snt_session');
        return false;
      }
      
      return session.isLoggedIn;
    } catch {
      return false;
    }
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('snt_session');
    if (!saved) return 'guest';
    
    try {
      const session = JSON.parse(saved);
      const expiresAt = session.expiresAt || 0;
      
      if (Date.now() > expiresAt) {
        return 'guest';
      }
      
      return session.userRole;
    } catch {
      return 'guest';
    }
  });
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    const saved = localStorage.getItem('snt_session');
    if (!saved) return '';
    
    try {
      const session = JSON.parse(saved);
      const expiresAt = session.expiresAt || 0;
      
      if (Date.now() > expiresAt) {
        return '';
      }
      
      return session.currentUserEmail;
    } catch {
      return '';
    }
  });
  const [activeSection, setActiveSection] = useState('home');
  const [votes, setVotes] = useState<{ [key: number]: number }>({});
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    const initAdmin = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35');
        const data = await response.json();
        
        const adminExists = data.users?.find((u: any) => u.email === 'assapan-nn@yandex.ru');
        
        if (!adminExists) {
          const adminUser = {
            lastName: 'Администратор',
            firstName: 'Системный',
            middleName: '',
            email: 'assapan-nn@yandex.ru',
            password: 'Admin1#',
            phone: '79999999999',
            plotNumber: '1',
            role: 'admin',
            status: 'active',
            registeredAt: new Date().toISOString(),
            ownerIsSame: true,
            birthDate: '1980-01-01',
            emailVerified: true,
            phoneVerified: true
          };
          
          await fetch('https://functions.poehali.dev/32ad22ff-5797-4a0d-9192-2ca5dee74c35', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminUser)
          });
          
          console.log('Админ создан в БД');
        }
      } catch (error) {
        console.error('Ошибка инициализации админа:', error);
      }
    };
    
    initAdmin();
  }, []);

  const handleVote = (pollId: number, option: number) => {
    setVotes({ ...votes, [pollId]: option });
    toast.success('Ваш голос учтён!');
  };

  const handleLogin = (email: string, role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentUserEmail(email);
    setShowLogin(false);
    setActiveSection('home');
    
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('snt_session', JSON.stringify({
      isLoggedIn: true,
      userRole: role,
      currentUserEmail: email,
      expiresAt
    }));
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setActiveSection('login');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('guest');
    setCurrentUserEmail('');
    setActiveSection('home');
    
    localStorage.removeItem('snt_session');
    toast.success('Вы вышли из личного кабинета');
  };

  const handleRegisterClick = () => {
    setShowRegistration(true);
    setActiveSection('registration');
  };

  const handleRegistrationSuccess = (email: string, role: UserRole) => {
    setShowRegistration(false);
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentUserEmail(email);
    setActiveSection('home');
    
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('snt_session', JSON.stringify({
      isLoggedIn: true,
      userRole: role,
      currentUserEmail: email,
      expiresAt
    }));
  };

  const handleRegistrationCancel = () => {
    setShowRegistration(false);
    setActiveSection('home');
  };

  const handleLoginCancel = () => {
    setShowLogin(false);
    setActiveSection('home');
  };

  const handleLoginToRegister = () => {
    setShowLogin(false);
    setShowRegistration(true);
    setActiveSection('registration');
  };

  const handlePasswordResetClick = () => {
    setShowLogin(false);
    setShowPasswordReset(true);
    setActiveSection('password-reset');
  };

  const handlePasswordResetCancel = () => {
    setShowPasswordReset(false);
    setShowLogin(true);
    setActiveSection('login');
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
        handleLogout={handleLogout}
        onRegisterClick={handleRegisterClick}
        onLoginClick={handleShowLogin}
      />

      <main className="container mx-auto px-4 py-12">
        {showRegistration ? (
          <Registration 
            onSuccess={handleRegistrationSuccess}
            onCancel={handleRegistrationCancel}
          />
        ) : showLogin ? (
          <Login 
            onSuccess={handleLogin}
            onCancel={handleLoginCancel}
            onRegisterClick={handleLoginToRegister}
            onPasswordResetClick={handlePasswordResetClick}
          />
        ) : showPasswordReset ? (
          <PasswordReset 
            onCancel={handlePasswordResetCancel}
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
              currentUserEmail={currentUserEmail}
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