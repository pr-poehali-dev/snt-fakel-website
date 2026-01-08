import Icon from '@/components/ui/icon';

interface FooterProps {
  setActiveSection: (section: string) => void;
}

const Footer = ({ setActiveSection }: FooterProps) => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Icon name="Flame" className="text-white" size={20} />
              </div>
              <span className="font-bold text-xl">СНТ Факел</span>
            </div>
            <p className="text-sm text-gray-400">
              Современное садовое товарищество с удобной системой управления
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Мы в мессенджерах</h4>
            <div className="flex gap-4">
              <a 
                href="https://t.me/+jU8WF2optiVmNGRi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                title="Telegram"
              >
                <Icon name="Send" size={24} />
              </a>
              <a 
                href="https://my.mail.ru/mail/your_group/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full flex items-center justify-center transition-colors"
                title="MAX (Mail.ru)"
              >
                <Icon name="MessageCircle" size={24} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Icon name="Phone" size={16} />
                +7 (495) 123-45-67
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Mail" size={16} />
                info@snt-fakel.ru
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          © 2026 СНТ Факел. Все права защищены.
        </div>
      </div>
    </footer>
  );
};

export default Footer;