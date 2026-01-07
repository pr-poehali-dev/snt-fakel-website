import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

interface HeaderProps {
  isLoggedIn: boolean;
  userRole: UserRole;
  activeSection: string;
  setActiveSection: (section: string) => void;
  handleLogout: () => void;
  onRegisterClick: () => void;
  onLoginClick: () => void;
}

const Header = ({ isLoggedIn, userRole, activeSection, setActiveSection, handleLogout, onRegisterClick, onLoginClick }: HeaderProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roleNames = {
    guest: 'Гость',
    member: 'Член СНТ',
    board_member: 'Член правления',
    chairman: 'Председатель',
    admin: 'Администратор'
  };

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
            {['home', 'news', 'chat', 'documents', 'rules', 'gallery', 'contacts'].map((section) => (
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
                {section === 'documents' && 'Документы'}
                {section === 'rules' && 'Правила'}
                {section === 'gallery' && 'Галерея'}
                {section === 'contacts' && 'Контакты'}
              </button>
            ))}
          </nav>
          <div className="relative flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Button 
                  variant="outline"
                  onClick={onRegisterClick}
                >
                  <Icon name="UserPlus" size={18} className="mr-2" />
                  Регистрация
                </Button>
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  onClick={onLoginClick}
                >
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowProfileMenu(!showProfileMenu)} className="gap-2">
                  <Icon name={
                    userRole === 'admin' ? 'Shield' : 
                    userRole === 'chairman' ? 'Crown' : 
                    userRole === 'board_member' ? 'Users' : 
                    'User'
                  } size={18} />
                  {roleNames[userRole]}
                  {userRole === 'admin' && (
                    <Badge className="ml-1 bg-gradient-to-r from-orange-500 to-pink-500">Admin</Badge>
                  )}
                  {userRole === 'chairman' && (
                    <Badge className="ml-1 bg-purple-500">Chairman</Badge>
                  )}
                  {userRole === 'board_member' && (
                    <Badge className="ml-1 bg-green-500">Board</Badge>
                  )}
                </Button>
                {showProfileMenu && (
                  <Card className="absolute right-0 top-full mt-2 w-56 shadow-2xl border-2 z-50">
                    <CardContent className="p-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => { setActiveSection('profile'); setShowProfileMenu(false); }}
                      >
                        <Icon name="User" size={18} className="mr-2" />
                        Личный кабинет
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                        onClick={() => { handleLogout(); setShowProfileMenu(false); }}
                      >
                        <Icon name="LogOut" size={18} className="mr-2" />
                        Выйти
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;