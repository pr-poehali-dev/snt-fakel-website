import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type UserRole = 'guest' | 'member' | 'admin';

interface HeaderProps {
  isLoggedIn: boolean;
  userRole: UserRole;
  activeSection: string;
  setActiveSection: (section: string) => void;
  handleLogin: (role: UserRole) => void;
}

const Header = ({ isLoggedIn, userRole, activeSection, setActiveSection, handleLogin }: HeaderProps) => {
  const [showLoginMenu, setShowLoginMenu] = useState(false);

  const roleNames = {
    guest: 'Гость',
    member: 'Член СНТ',
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
          <div className="relative">
            {!isLoggedIn ? (
              <>
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  onClick={() => setShowLoginMenu(!showLoginMenu)}
                >
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти
                </Button>
                {showLoginMenu && (
                  <Card className="absolute right-0 top-full mt-2 w-72 shadow-2xl border-2 z-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Выберите роль для входа</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-auto py-3"
                        onClick={() => { handleLogin('member'); setShowLoginMenu(false); }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon name="User" className="text-white" size={20} />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">Член СНТ</div>
                            <div className="text-xs text-muted-foreground">Голосование, чат, документы</div>
                          </div>
                        </div>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-auto py-3"
                        onClick={() => { handleLogin('admin'); setShowLoginMenu(false); }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon name="Shield" className="text-white" size={20} />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">Администратор</div>
                            <div className="text-xs text-muted-foreground">Полный доступ к управлению</div>
                          </div>
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Button variant="outline" onClick={() => setActiveSection('profile')} className="gap-2">
                <Icon name={userRole === 'admin' ? 'Shield' : 'User'} size={18} />
                {roleNames[userRole]}
                {userRole === 'admin' && (
                  <Badge className="ml-1 bg-gradient-to-r from-orange-500 to-pink-500">Admin</Badge>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;