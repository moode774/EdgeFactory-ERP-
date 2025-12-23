import React from 'react';
import { Search, Bell, X } from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useLanguage } from '../../contexts/LanguageContext';

const Header = ({ lang, setLang, titleAr, titleEn, searchQuery, setSearchQuery, notifications }: any) => {
    const { t } = useLanguage();
    return (
        <header className="h-20 bg-white border-b-2 border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            {/* Title */}
            <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {titleEn || 'Manufacturing'}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-0.5">Production management system</p>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('search') + '...'}
                        className="bg-slate-50 border-2 border-slate-300 rounded-xl py-3 pl-12 pr-4 w-80 text-sm font-medium focus:ring-2 focus:ring-slate-700 focus:border-slate-700 outline-none transition-all placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Notifications */}
                {notifications && notifications.length > 0 && (
                    <div className="relative group">
                        <button className="relative p-3 bg-orange-50 hover:bg-orange-100 rounded-xl text-orange-600 transition-all border-2 border-orange-200 hover:border-orange-300">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                                {notifications.length}
                            </span>
                        </button>
                        <div className="absolute top-full mt-3 right-0 w-80 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="p-4 border-b-2 border-slate-200 bg-slate-50 rounded-t-2xl">
                                <p className="font-black text-slate-900 text-base">{t('notifications')}</p>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.map((n: any, i: number) => (
                                    <div key={i} className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <p className={`font-bold text-sm ${n.type === 'danger' ? 'text-red-600' : 'text-orange-600'}`}>
                                            {n.title}
                                        </p>
                                        <p className="text-slate-600 text-xs mt-1 font-medium">{n.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Language Switcher */}
                <LanguageSwitcher />
            </div>
        </header>
    );
};

export default Header;
