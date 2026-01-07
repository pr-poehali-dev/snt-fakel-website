import Chat from './Chat';
import DocumentsSection from './sections/DocumentsSection';
import NewsSection from './sections/NewsSection';
import InfoSections from './sections/InfoSections';
import ProfileSection from './sections/ProfileSection';
import RoleManagement from './RoleManagement';

type UserRole = 'guest' | 'member' | 'chairman' | 'admin';

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
  setActiveSection: (section: string) => void;
}

const ContentSections = ({ activeSection, news, gallery, isLoggedIn, userRole, setActiveSection }: ContentSectionsProps) => {
  if (activeSection === 'chat') {
    return <Chat isLoggedIn={isLoggedIn} userRole={userRole} />;
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
    return <ProfileSection userRole={userRole} onNavigate={setActiveSection} />;
  }

  if (activeSection === 'role-management' && userRole === 'admin') {
    return <RoleManagement />;
  }

  return null;
};

export default ContentSections;