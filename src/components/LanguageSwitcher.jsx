import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    if (language === 'en') setLanguage('ar');
    else if (language === 'ar') setLanguage('fr');
    else setLanguage('en');
  };

  return (
    <button onClick={toggleLanguage} className="p-2 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors" style={{color: 'var(--text-secondary)'}}>
      <Globe size={20} />
      <span className="text-xs ml-1 uppercase">{language}</span>
    </button>
  );
};

export default LanguageSwitcher;
