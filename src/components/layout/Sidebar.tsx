import React from 'react';
import { LayoutDashboard, Package, Users, Truck, Box, FileText, Wrench, Layers, BarChart3, Settings, LogOut, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Sidebar = ({ activeTab, setActiveTab, lang, isRTL, currentUser, onLogout }: any) => {
    const { t } = useLanguage();
    const navItems = [
        { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard size={20} /> },
        { id: 'inventory', label: t('inventory'), icon: <Package size={20} /> },
        { id: 'customers', label: t('customers'), icon: <Users size={20} /> },
        { id: 'suppliers', label: t('suppliers'), icon: <Truck size={20} /> },
        { id: 'warehouses', label: t('warehouses'), icon: <Box size={20} /> },
        { id: 'quotations', label: t('quotations'), icon: <FileText size={20} /> },
        { id: 'manufacturing', label: t('manufacturing'), icon: <Wrench size={20} /> },
        { id: 'mealReports', label: t('mealReports'), icon: <UtensilsCrossed size={20} /> },
        { id: 'employees', label: t('employees'), icon: <Users size={20} /> },
        { id: 'categories', label: t('categories'), icon: <Layers size={20} /> },
        { id: 'reports', label: t('reports'), icon: <BarChart3 size={20} /> },
        { id: 'settings', label: t('settings'), icon: <Settings size={20} /> },
    ];

    return (
        <div className="h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col w-72 flex-shrink-0 border-r border-slate-700/50 shadow-2xl">
            {/* Logo Section */}
            <div className="h-24 flex items-center px-6 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mr-3 overflow-hidden bg-white/10 backdrop-blur-sm p-2 shadow-lg">
                    <img src="./logo.png" alt="ForestEdge" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="font-black text-xl tracking-tight">
                        Forest<span className="text-slate-400">Edge</span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
                        Furniture & Interior
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`group w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
                                ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-900/50 scale-[1.02]'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </div>
                                <span className="tracking-wide">{item.label}</span>
                            </div>
                            {isActive && (
                                <ChevronRight size={16} className="animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile Section */}
            <div className="p-5 border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-black text-base shadow-lg border-2 border-slate-500/30">
                            {currentUser?.nameEn?.charAt(0) || currentUser?.nameAr?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">
                                {currentUser?.nameEn || currentUser?.nameAr || 'User'}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                                {currentUser?.role === 'admin' ? t('admin') : t('employee')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2.5 hover:bg-red-500/20 rounded-xl transition-all duration-300 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/30"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
