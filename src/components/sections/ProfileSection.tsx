import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EmailVerification from '../EmailVerification';
import PhoneVerification from '../PhoneVerification';
import PasswordChange from '../PasswordChange';
import AdminDashboardCard from '../profile/AdminDashboardCard';
import MemberDashboardCard from '../profile/MemberDashboardCard';
import PersonalDataCard from '../profile/PersonalDataCard';
import OwnerDataCard from '../profile/OwnerDataCard';
import MeterReadingsCard from '../profile/MeterReadingsCard';
import MeterManagementCard from '../profile/MeterManagementCard';

type UserRole = 'guest' | 'member' | 'board_member' | 'chairman' | 'admin';

interface ProfileSectionProps {
  userRole: UserRole;
  currentUserEmail: string;
  onNavigate?: (section: string) => void;
}

interface UserData {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  phone: string;
  email: string;
  plotNumber: string;
  ownerLastName: string;
  ownerFirstName: string;
  ownerMiddleName: string;
  landDocNumber: string;
  houseDocNumber: string;
}

const ProfileSection = ({ userRole, currentUserEmail, onNavigate }: ProfileSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    phone: '',
    email: '',
    plotNumber: '',
    ownerLastName: '',
    ownerFirstName: '',
    ownerMiddleName: '',
    landDocNumber: '',
    houseDocNumber: ''
  });
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'chairman': return 'Председатель';
      case 'board_member': return 'Член правления';
      case 'member': return 'Член СНТ';
      case 'guest': return 'Гость';
      default: return 'Гость';
    }
  };

  useEffect(() => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const user = users.find((u: any) => u.email === currentUserEmail);
      if (user) {
        setUserData({
          lastName: user.lastName || '',
          firstName: user.firstName || '',
          middleName: user.middleName || '',
          birthDate: user.birthDate || '',
          phone: user.phone || '',
          email: user.email || '',
          plotNumber: user.plotNumber || '',
          ownerLastName: user.ownerLastName || '',
          ownerFirstName: user.ownerFirstName || '',
          ownerMiddleName: user.ownerMiddleName || '',
          landDocNumber: user.landDocNumber || '',
          houseDocNumber: user.houseDocNumber || ''
        });
        setOriginalEmail(user.email || '');
        setOriginalPhone(user.phone || '');
      }

      const activeMembers = users.filter((u: any) => u.status === 'active').length;
      const totalMembersElement = document.getElementById('total-members-count');
      const membersBadgeElement = document.getElementById('members-badge');
      if (totalMembersElement) totalMembersElement.textContent = activeMembers.toString();
      if (membersBadgeElement) membersBadgeElement.textContent = activeMembers.toString();
    }
  }, [currentUserEmail]);

  const handleSave = () => {
    const emailChanged = userData.email !== originalEmail;
    const phoneChanged = userData.phone !== originalPhone;

    if (emailChanged) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        toast.error('Введите корректный email');
        return;
      }

      const usersJSON = localStorage.getItem('snt_users');
      if (usersJSON) {
        const users = JSON.parse(usersJSON);
        const emailExists = users.find((u: any) => u.email === userData.email && u.email !== currentUserEmail);
        if (emailExists) {
          toast.error('Пользователь с таким email уже существует');
          return;
        }
      }

      setShowEmailVerification(true);
      return;
    }

    if (phoneChanged) {
      const usersJSON = localStorage.getItem('snt_users');
      if (usersJSON) {
        const users = JSON.parse(usersJSON);
        const phoneExists = users.find((u: any) => u.phone === userData.phone && u.email !== currentUserEmail);
        if (phoneExists) {
          toast.error('Пользователь с таким телефоном уже существует');
          return;
        }
      }

      setShowPhoneVerification(true);
      return;
    }

    saveUserData();
  };

  const saveUserData = () => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const updatedUsers = users.map((u: any) => 
        u.email === currentUserEmail ? { ...u, ...userData } : u
      );
      localStorage.setItem('snt_users', JSON.stringify(updatedUsers));
      
      if (userData.email !== currentUserEmail) {
        const session = localStorage.getItem('snt_session');
        if (session) {
          const sessionData = JSON.parse(session);
          sessionData.currentUserEmail = userData.email;
          sessionData.expiresAt = sessionData.expiresAt || Date.now() + (7 * 24 * 60 * 60 * 1000);
          localStorage.setItem('snt_session', JSON.stringify(sessionData));
        }
      }
      
      setIsEditing(false);
      setOriginalEmail(userData.email);
      setOriginalPhone(userData.phone);
      toast.success('Данные успешно обновлены');
    }
  };

  const handleCancel = () => {
    const usersJSON = localStorage.getItem('snt_users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const user = users.find((u: any) => u.email === currentUserEmail);
      if (user) {
        setUserData({
          lastName: user.lastName || '',
          firstName: user.firstName || '',
          middleName: user.middleName || '',
          birthDate: user.birthDate || '',
          phone: user.phone || '',
          email: user.email || '',
          plotNumber: user.plotNumber || '',
          ownerLastName: user.ownerLastName || '',
          ownerFirstName: user.ownerFirstName || '',
          ownerMiddleName: user.ownerMiddleName || '',
          landDocNumber: user.landDocNumber || '',
          houseDocNumber: user.houseDocNumber || ''
        });
      }
    }
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setUserData({ ...userData, [field]: value });
  };

  const roleNames = {
    guest: 'Гость',
    member: 'Член СНТ',
    board_member: 'Член правления',
    chairman: 'Председатель',
    admin: 'Администратор'
  };

  if (showEmailVerification) {
    return (
      <EmailVerification
        email={userData.email}
        onVerified={() => {
          setShowEmailVerification(false);
          toast.success('Email подтверждён');
          saveUserData();
        }}
        onCancel={() => {
          setShowEmailVerification(false);
          setUserData({ ...userData, email: originalEmail });
        }}
      />
    );
  }

  if (showPhoneVerification) {
    return (
      <PhoneVerification
        phone={userData.phone}
        onVerified={() => {
          setShowPhoneVerification(false);
          toast.success('Телефон подтверждён');
          saveUserData();
        }}
        onCancel={() => {
          setShowPhoneVerification(false);
          setUserData({ ...userData, phone: originalPhone });
        }}
      />
    );
  }

  if (showPasswordChange) {
    return (
      <PasswordChange
        currentUserEmail={currentUserEmail}
        onCancel={() => setShowPasswordChange(false)}
        onPasswordChanged={() => setShowPasswordChange(false)}
      />
    );
  }

  return (
    <section>
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold">Личный кабинет</h2>
          <Badge className={`text-lg px-4 py-2 ${userRole === 'admin' ? 'bg-gradient-to-r from-orange-500 to-pink-500' : userRole === 'chairman' ? 'bg-purple-500' : userRole === 'board_member' ? 'bg-green-500' : ''}`}>
            {roleNames[userRole]}
          </Badge>
        </div>
        {userData.firstName && userData.lastName && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-lg">
              <span className="font-semibold text-blue-900">
                {userData.firstName} {userData.lastName}
              </span>
              {userData.plotNumber && (
                <span className="text-blue-700 ml-2">• Участок №{userData.plotNumber}</span>
              )}
              {userData.email && (
                <span className="text-blue-600 ml-2">• {userData.email}</span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {userRole === 'board_member' || userRole === 'chairman' || userRole === 'admin' ? (
          <AdminDashboardCard 
            userRole={userRole as 'admin' | 'chairman' | 'board_member'} 
            onNavigate={onNavigate}
          />
        ) : (
          <MemberDashboardCard plotNumber={userData.plotNumber} onNavigate={onNavigate} />
        )}
      </div>

      <PersonalDataCard
        userData={{
          lastName: userData.lastName,
          firstName: userData.firstName,
          middleName: userData.middleName,
          birthDate: userData.birthDate,
          phone: userData.phone,
          email: userData.email,
          plotNumber: userData.plotNumber
        }}
        originalEmail={originalEmail}
        originalPhone={originalPhone}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onChange={handleChange}
        onPasswordChange={() => setShowPasswordChange(true)}
      />

      <div className="mt-6 space-y-6">
        <OwnerDataCard
          ownerData={{
            ownerLastName: userData.ownerLastName,
            ownerFirstName: userData.ownerFirstName,
            ownerMiddleName: userData.ownerMiddleName,
            landDocNumber: userData.landDocNumber,
            houseDocNumber: userData.houseDocNumber
          }}
          isEditing={isEditing}
          onChange={handleChange}
        />

        {(userRole === 'admin' || userRole === 'chairman') ? (
          <MeterManagementCard />
        ) : (
          <div className="grid">
            <MeterReadingsCard currentUserEmail={currentUserEmail} userRole={userRole} />
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileSection;