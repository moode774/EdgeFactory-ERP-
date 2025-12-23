import React, { useMemo } from 'react';
import { Package, Check, AlertTriangle, X, Activity, Plus, Edit3, Trash2, TrendingUp, Box, Layers, ShoppingCart } from 'lucide-react';
import { Product, ActivityLog } from '../types';
import { CATEGORIES } from '../constants/data';
import { getCategoryIcon } from '../components/common/CategoryIcons';
import { useLanguage } from '../contexts/LanguageContext';

const Dashboard = ({ lang, products, recentActivity }: any) => {
    const { t } = useLanguage();
    const stats = useMemo(() => ({
        total: products.length,
        active: products.filter((p: Product) => p.status === 'active').length,
        lowStock: products.filter((p: Product) => p.status === 'low_stock').length,
        outOfStock: products.filter((p: Product) => p.status === 'out_of_stock').length,
    }), [products]);

    return (
        <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{t('dashboard')}</h1>
                <p className="text-slate-500 font-medium">{t('stockOverview')}</p>
            </div>

            {/* Stats Cards - Premium Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Products */}
                <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <Package className="text-white" size={24} />
                            </div>
                            <div className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                                <span className="text-xs font-bold text-white/80">TOTAL</span>
                            </div>
                        </div>
                        <h3 className="text-5xl font-black text-white mb-2">{stats.total}</h3>
                        <p className="text-slate-300 font-semibold text-sm">{t('totalProducts')}</p>
                    </div>
                </div>

                {/* Active Products */}
                <div className="group relative bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <Check className="text-white" size={24} />
                            </div>
                            <div className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                                <span className="text-xs font-bold text-white/80">ACTIVE</span>
                            </div>
                        </div>
                        <h3 className="text-5xl font-black text-white mb-2">{stats.active}</h3>
                        <p className="text-emerald-100 font-semibold text-sm">{t('inStock')}</p>
                    </div>
                </div>

                {/* Low Stock */}
                <div className="group relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <AlertTriangle className="text-white" size={24} />
                            </div>
                            <div className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                                <span className="text-xs font-bold text-white/80">WARNING</span>
                            </div>
                        </div>
                        <h3 className="text-5xl font-black text-white mb-2">{stats.lowStock}</h3>
                        <p className="text-orange-100 font-semibold text-sm">{t('lowStock')}</p>
                    </div>
                </div>

                {/* Out of Stock */}
                <div className="group relative bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <X className="text-white" size={24} />
                            </div>
                            <div className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                                <span className="text-xs font-bold text-white/80">CRITICAL</span>
                            </div>
                        </div>
                        <h3 className="text-5xl font-black text-white mb-2">{stats.outOfStock}</h3>
                        <p className="text-red-100 font-semibold text-sm">{t('outOfStock')}</p>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">{t('categories')}</h2>
                        <p className="text-slate-500 text-sm mt-1">{lang === 'ar' ? 'توزيع المنتجات حسب الفئة' : 'Product distribution by category'}</p>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-xl">
                        <Layers className="text-slate-600" size={24} />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {CATEGORIES.map((cat) => {
                        const count = products.filter((p: Product) => p.categoryCode === cat.code).length;
                        return (
                            <div
                                key={cat.code}
                                className="group bg-slate-50 hover:bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-all duration-200 cursor-pointer hover:shadow-lg"
                            >
                                <div
                                    className="p-3 rounded-xl w-fit mb-3 transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                                >
                                    {getCategoryIcon(cat.icon, 20)}
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">{lang === 'ar' ? cat.nameAr : cat.nameEn}</h4>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-black text-slate-900">{count}</p>
                                    <span className="text-xs text-slate-400 font-medium">{t('items')}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">{t('recentActivity')}</h2>
                        <p className="text-slate-500 text-sm mt-1">{lang === 'ar' ? 'آخر التغييرات على مخزونك' : 'Latest changes to your inventory'}</p>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-xl">
                        <Activity className="text-slate-600" size={24} />
                    </div>
                </div>
                <div className="space-y-3">
                    {recentActivity.length > 0 ? recentActivity.slice(0, 8).map((log: ActivityLog) => (
                        <div
                            key={log.id}
                            className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all duration-200 group"
                        >
                            <div className={`p-3 rounded-xl ${log.action === 'add' ? 'bg-emerald-100 text-emerald-600' :
                                log.action === 'update' ? 'bg-blue-100 text-blue-600' :
                                    'bg-red-100 text-red-600'
                                }`}>
                                {log.action === 'add' ? <Plus size={18} /> : log.action === 'update' ? <Edit3 size={18} /> : <Trash2 size={18} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900 group-hover:text-slate-700">{log.productName}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{new Date(log.timestamp).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${log.action === 'add' ? 'bg-emerald-100 text-emerald-700' :
                                log.action === 'update' ? 'bg-blue-100 text-blue-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {log.action.toUpperCase()}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12">
                            <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                                <Activity className="text-slate-400" size={32} />
                            </div>
                            <p className="text-slate-400 font-medium">{t('noData')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
