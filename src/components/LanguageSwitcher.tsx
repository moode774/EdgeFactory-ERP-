import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-200 font-bold text-sm"
            title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
        >
            <Globe size={18} />
            <span className="uppercase">{language === 'en' ? 'AR' : 'EN'}</span>
        </button>
    );
};
