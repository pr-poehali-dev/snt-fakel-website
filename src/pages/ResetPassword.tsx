import { useSearchParams } from 'react-router-dom';
import ResetPasswordForm from '@/components/ResetPasswordForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      <Header 
        isLoggedIn={false}
        userRole="guest"
        activeSection="reset-password"
        setActiveSection={() => {}}
        handleLogout={() => {}}
        onRegisterClick={() => {}}
        onLoginClick={() => {}}
      />
      
      <main className="container mx-auto px-4 py-12">
        <ResetPasswordForm token={token} />
      </main>

      <Footer setActiveSection={() => {}} />
    </div>
  );
};

export default ResetPassword;
