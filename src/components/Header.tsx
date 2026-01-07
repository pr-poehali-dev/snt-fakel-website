import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface HeaderProps {
  isLoggedIn: boolean;
  activeSection: string;
  setActiveSection: (section: string) => void;
  handleLogin: () => void;
}

const Header = ({ isLoggedIn, activeSection, setActiveSection, handleLogin }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-purple-100 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="Flame" className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                СНТ Факел
              </h1>
              <p className="text-sm text-muted-foreground">Садовое товарищество</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {['home', 'news', 'chat', 'rules', 'gallery', 'contacts'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`text-sm font-medium transition-colors ${
                  activeSection === section
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {section === 'home' && 'Главная'}
                {section === 'news' && 'Новости'}
                {section === 'chat' && 'Чат'}
                {section === 'rules' && 'Правила'}
                {section === 'gallery' && 'Галерея'}
                {section === 'contacts' && 'Контакты'}
              </button>
            ))}
          </nav>
          {!isLoggedIn ? (
            <Button 
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              onClick={handleLogin}
            >
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setActiveSection('profile')}>
              <Icon name="User" size={18} className="mr-2" />
              Личный кабинет
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;