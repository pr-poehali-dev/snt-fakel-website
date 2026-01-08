export const profanityList = [
  'хуй', 'хуя', 'хуи', 'хуё', 'хер', 'пизд', 'ебал', 'ебан', 'ебат', 'ебл', 'ебу', 'еби',
  'бля', 'блят', 'сука', 'суки', 'сучк', 'говн', 'дерьм', 'срат', 'срал',
  'пидар', 'пидор', 'педик', 'даун', 'дебил', 'мудак', 'уёб', 'уеб'
];

export const containsProfanity = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
};

export const getRoleAvatar = (role: string): string => {
  switch (role) {
    case 'admin': return '⭐';
    case 'chairman': return '👑';
    case 'board_member': return '👥';
    default: return '👤';
  }
};

export const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.error('Error playing notification sound:', e);
  }
};
