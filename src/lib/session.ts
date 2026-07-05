export interface SntSession {
  isLoggedIn: boolean;
  userRole: string;
  currentUserEmail: string;
  isOwner: boolean;
  firstName: string;
  lastName: string;
  plotNumber: string;
  expiresAt: number;
}

export const getCurrentUser = (): { email: string; role: string } => {
  try {
    const session = localStorage.getItem('snt_session');
    if (session) {
      const parsed: SntSession = JSON.parse(session);
      return {
        email: parsed.currentUserEmail || '',
        role: parsed.userRole || 'member'
      };
    }
  } catch (e) {
    console.error('Error reading snt_session:', e);
  }
  return { email: '', role: 'member' };
};
