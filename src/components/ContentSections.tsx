import Chat from './Chat';
import DocumentsSection from './sections/DocumentsSection';
import NewsSection from './sections/NewsSection';
import InfoSections from './sections/InfoSections';
import ProfileSection from './sections/ProfileSection';
import RoleManagement from './RoleManagement';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  text: string;
}

interface GalleryItem {
  id: number;
  title: string;
  season: string;
}

interface ContentSectionsProps {
  activeSection: string;
  news: NewsItem[];
  gallery: GalleryItem[];
  isLoggedIn: boolean;
  userRole: UserRole;
  currentUserEmail: string;
  setActiveSection: (section: string) => void;
}

const ContentSections = ({ activeSection, news, gallery, isLoggedIn, userRole, currentUserEmail, setActiveSection }: ContentSectionsProps) => {
  if (!isLoggedIn && activeSection !== 'home') {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Требуется авторизация</h2>
          <p className="text-gray-600 mb-6">Для просмотра этого раздела необходимо войти в личный кабинет</p>
          <button
            onClick={() => setActiveSection('home')}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  if (activeSection === 'chat') {
    return <Chat isLoggedIn={isLoggedIn} userRole={userRole} currentUserEmail={currentUserEmail} />;
  }

  if (activeSection === 'documents') {
    return <DocumentsSection userRole={userRole} />;
  }

  if (activeSection === 'news') {
    return <NewsSection news={news} userRole={userRole} />;
  }

  if (activeSection === 'rules' || activeSection === 'gallery' || activeSection === 'contacts') {
    return <InfoSections activeSection={activeSection} gallery={gallery} />;
  }

  if (activeSection === 'profile' && isLoggedIn) {
    return <ProfileSection userRole={userRole} currentUserEmail={currentUserEmail} onNavigate={setActiveSection} />;
  }

  if (activeSection === 'role-management' && userRole === 'admin') {
    return <RoleManagement />;
  }

  return null;
};

export default ContentSections;