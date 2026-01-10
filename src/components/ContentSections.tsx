import Chat from './Chat';
import DocumentsSection from './sections/DocumentsSection';
import NewsSection from './sections/NewsSection';
import InfoSections from './sections/InfoSections';
import ProfileSection from './sections/ProfileSection';
import RoleManagement from './RoleManagement';
import MembersList from './MembersList';
import MassNotification from './MassNotification';
import SiteSettings from './SiteSettings';
import PageEditor from './PageEditor';
import NewsEditor from './NewsEditor';
import DocumentsManager from './DocumentsManager';
import MeterReadingsManager from './MeterReadingsManager';
import ChatModerationPanel from './ChatModerationPanel';
import BoardAppeal from './BoardAppeal';
import CreateVoting from './CreateVoting';
import VotingResults from './VotingResults';
import HolidayDecorManager from './HolidayDecorManager';
import SiteStatistics from './SiteStatistics';

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
  const publicSections = ['home', 'gallery', 'contacts', 'rules'];
  
  if (!isLoggedIn && !publicSections.includes(activeSection)) {
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
    return <DocumentsSection userRole={userRole} onNavigate={setActiveSection} />;
  }

  if (activeSection === 'news') {
    return <NewsSection news={news} userRole={userRole} onNavigate={setActiveSection} />;
  }

  if (activeSection === 'news-editor' && (userRole === 'admin' || userRole === 'chairman' || userRole === 'board_member')) {
    return <NewsEditor onNavigate={setActiveSection} />;
  }

  if (activeSection === 'documents-manager' && (userRole === 'admin' || userRole === 'chairman' || userRole === 'board_member')) {
    return <DocumentsManager />;
  }

  if (activeSection === 'rules' || activeSection === 'gallery' || activeSection === 'contacts') {
    return <InfoSections activeSection={activeSection} gallery={gallery} />;
  }

  if (activeSection === 'profile' && isLoggedIn) {
    return <ProfileSection userRole={userRole} currentUserEmail={currentUserEmail} onNavigate={setActiveSection} />;
  }

  if (activeSection === 'role-management' && (userRole === 'admin' || userRole === 'chairman')) {
    return <RoleManagement onBack={() => setActiveSection('profile')} currentUserRole={userRole} />;
  }

  if (activeSection === 'members-list' && (userRole === 'admin' || userRole === 'chairman' || userRole === 'board_member')) {
    return <MembersList onBack={() => setActiveSection('profile')} />;
  }

  if (activeSection === 'mass-notification' && (userRole === 'admin' || userRole === 'chairman' || userRole === 'board_member')) {
    return <MassNotification onBack={() => setActiveSection('profile')} />;
  }

  if (activeSection === 'site-settings' && userRole === 'admin') {
    return <SiteSettings onBack={() => setActiveSection('profile')} />;
  }

  if (activeSection === 'holiday-decor' && (userRole === 'admin' || userRole === 'chairman')) {
    return <HolidayDecorManager onBack={() => setActiveSection('profile')} />;
  }

  if (activeSection === 'page-editor' && (userRole === 'admin' || userRole === 'chairman')) {
    return <PageEditor onBack={() => setActiveSection('profile')} />;
  }

  if (activeSection === 'meter-readings' && (userRole === 'admin' || userRole === 'chairman')) {
    return <MeterReadingsManager onBack={() => setActiveSection('profile')} />;
  }

  if (activeSection === 'chat-moderation' && (userRole === 'admin' || userRole === 'chairman')) {
    return <ChatModerationPanel onBack={() => setActiveSection('profile')} />;
  }

  if (activeSection === 'board-appeal' && isLoggedIn) {
    return (
      <BoardAppeal
        currentUserEmail={currentUserEmail}
        userRole={userRole}
        onBack={() => setActiveSection('profile')}
      />
    );
  }

  if (activeSection === 'create-voting' && (userRole === 'admin' || userRole === 'chairman')) {
    return <CreateVoting onBack={() => setActiveSection('profile')} />;
  }

  if (activeSection.startsWith('voting-results-') && (userRole === 'admin' || userRole === 'chairman')) {
    const votingId = parseInt(activeSection.replace('voting-results-', ''));
    return <VotingResults votingId={votingId} onBack={() => setActiveSection('home')} />;
  }

  if (activeSection === 'statistics' && (userRole === 'admin' || userRole === 'chairman')) {
    return <SiteStatistics onBack={() => setActiveSection('profile')} />;
  }

  return null;
};

export default ContentSections;