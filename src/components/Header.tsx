import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Icon name={showMobileMenu ? "X" : "Menu"} size={24} />
            </Button>
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

        {showMobileMenu && (
          <div className="md:hidden mb-4">
            <Card className="border-2 shadow-xl">
              <CardContent className="p-4 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => { setActiveSection('home'); setShowMobileMenu(false); }}
                >
                  <Icon name="Home" size={18} className="mr-2" />
                  Главная
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => { setActiveSection('news'); setShowMobileMenu(false); }}
                >
                  <Icon name="Newspaper" size={18} className="mr-2" />
                  Новости
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => { setActiveSection('chat'); setShowMobileMenu(false); }}
                >
                  <Icon name="MessageCircle" size={18} className="mr-2" />
                  Чат
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => { setActiveSection('documents'); setShowMobileMenu(false); }}
                >
                  <Icon name="FileText" size={18} className="mr-2" />
                  Документы
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => { setActiveSection('rules'); setShowMobileMenu(false); }}
                >
                  <Icon name="Scale" size={18} className="mr-2" />
                  Правила
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => { setActiveSection('gallery'); setShowMobileMenu(false); }}
                >
                  <Icon name="Image" size={18} className="mr-2" />
                  Галерея
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => { setActiveSection('contacts'); setShowMobileMenu(false); }}
                >
                  <Icon name="Phone" size={18} className="mr-2" />
                  Контакты
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => { setActiveSection('voting'); setShowMobileMenu(false); }}
                >
                  <Icon name="Vote" size={18} className="mr-2" />
                  Голосования
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="hidden md:grid grid-cols-4 md:grid-cols-8 gap-3 max-w-7xl mx-auto">
          <Card className="border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => setActiveSection('home')}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center mb-2 mx-auto shadow">
                <Icon name="Home" className="text-white" size={20} />
              </div>
              <h4 className="text-xs font-bold">Главная</h4>
            </CardContent>
          </Card>

          <Card className="border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => setActiveSection('news')}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-2 mx-auto shadow">
                <Icon name="Newspaper" className="text-white" size={20} />
              </div>
              <h4 className="text-xs font-bold">Новости</h4>
            </CardContent>
          </Card>

          <Card className="border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => setActiveSection('chat')}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-2 mx-auto shadow">
                <Icon name="MessageCircle" className="text-white" size={20} />
              </div>
              <h4 className="text-xs font-bold">Чат</h4>
            </CardContent>
          </Card>

          <Card className="border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => setActiveSection('documents')}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-2 mx-auto shadow">
                <Icon name="FileText" className="text-white" size={20} />
              </div>
              <h4 className="text-xs font-bold">Документы</h4>
            </CardContent>
          </Card>

          <Card className="border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => setActiveSection('rules')}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-2 mx-auto shadow">
                <Icon name="Scale" className="text-white" size={20} />
              </div>
              <h4 className="text-xs font-bold">Правила</h4>
            </CardContent>
          </Card>

          <Card className="border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => setActiveSection('gallery')}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-2 mx-auto shadow">
                <Icon name="Image" className="text-white" size={20} />
              </div>
              <h4 className="text-xs font-bold">Галерея</h4>
            </CardContent>
          </Card>

          <Card className="border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => setActiveSection('contacts')}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-2 mx-auto shadow">
                <Icon name="Phone" className="text-white" size={20} />
              </div>
              <h4 className="text-xs font-bold">Контакты</h4>
            </CardContent>
          </Card>

          <Card className="border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => setActiveSection('voting')}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-2 mx-auto shadow">
                <Icon name="Vote" className="text-white" size={20} />
              </div>
              <h4 className="text-xs font-bold">Голосования</h4>
            </CardContent>
          </Card>
        </div>
      </div>
    </header>
  );
};

export default Header;