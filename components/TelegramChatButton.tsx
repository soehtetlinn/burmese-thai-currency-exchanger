import React from 'react';

interface TelegramChatButtonProps {
  username?: string;
}

export const TelegramChatButton: React.FC<TelegramChatButtonProps> = ({ username }) => {
  const raw = username || (import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string) || 'good_shl_96_bot';
  const botUsername = String(raw).trim().replace(/^@+/, '');
  const href = botUsername ? `https://t.me/${botUsername}` : 'https://t.me';

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-[#229ED9] hover:bg-[#1c8bbf] text-white w-14 h-14 flex items-center justify-center"
      aria-label="Chat on Telegram"
      title={botUsername ? `Chat with @${botUsername}` : 'Open Telegram'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" className="w-7 h-7" fill="currentColor">
        <path d="M120,0C53.7,0,0,53.7,0,120s53.7,120,120,120s120-53.7,120-120S186.3,0,120,0z M175.7,83.1l-22.8,107.5 c-1.7,7.6-6.1,9.5-12.3,5.9l-34-25.1l-16.4,15.8c-1.8,1.8-3.3,3.3-6.7,3.3l2.4-34.2l62.3-56.3c2.7-2.4-0.6-3.8-4.2-1.4l-77,48.4 l-33.2-10.4c-7.2-2.3-7.4-7.2,1.6-10.6l129.8-50.1C173.2,74.7,177.1,77.5,175.7,83.1z"/>
      </svg>
    </a>
  );
};


