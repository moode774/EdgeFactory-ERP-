import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../constants/data';
import { getCategoryIcon } from '../components/common/CategoryIcons';

const ReportsPage = ({ lang, products }: any) => {
    const stats = useMemo(() => {
        const totalProducts = products.length;
        const activeProducts = products.filter((p: Product) => p.status === 'active').length;
        const lowStockProducts = products.filter((p: Product) => p.status === 'low_stock').length;
        const outOfStockProducts = products.filter((p: Product) => p.status === 'out_of_stock').length;

        const totalValue = products.reduce((sum: number, p: Product) => sum + (p.sellingPrice || 0) * p.quantity, 0);
        const totalCost = products.reduce((sum: number, p: Product) => sum + (p.costPrice || 0) * p.quantity, 0);
        const potentialProfit = totalValue - totalCost;

        const expiringProducts = products.filter((p: Product) =>
            p.expiryDate && new Date(p.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );
        const expiredProducts = products.filter((p: Product) =>
            p.expiryDate && new Date(p.expiryDate) < new Date()
        );

        const categoryStats = CATEGORIES.map(cat => ({
            ...cat,
            count: products.filter((p: Product) => p.categoryCode === cat.code).length,
            value: products.filter((p: Product) => p.categoryCode === cat.code)
                .reduce((sum: number, p: Product) => sum + (p.sellingPrice || 0) * p.quantity, 0)
        }));

        return { totalProducts, activeProducts, lowStockProducts, outOfStockProducts, totalValue, totalCost, potentialProfit, expiringProducts, expiredProducts, categoryStats };
    }, [products]);

    return (
        <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-xl p-5 text-white">
                    <h3 className="text-slate-300 text-sm font-medium mb-1">{lang === 'ar' ? 'قيمة المخزون (بيع)' : 'Inventory Value (Sell)'}</h3>
                    <p className="text-3xl font-bold">{stats.totalValue.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs mt-2">{lang === 'ar' ? 'ريال سعودي' : 'SAR'}</p>
                </div>
                <div className="bg-slate-700 rounded-xl p-5 text-white">
                    <h3 className="text-slate-300 text-sm font-medium mb-1">{lang === 'ar' ? 'إجمالي التكلفة' : 'Total Cost'}</h3>
                    <p className="text-3xl font-bold">{stats.totalCost.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs mt-2">{lang === 'ar' ? 'ريال سعودي' : 'SAR'}</p>
                </div>
                <div className="bg-slate-600 rounded-xl p-5 text-white">
                    <h3 className="text-slate-200 text-sm font-medium mb-1">{lang === 'ar' ? 'الربح المتوقع' : 'Expected Profit'}</h3>
                    <p className="text-3xl font-bold">{stats.potentialProfit.toLocaleString()}</p>
                    <p className="text-slate-300 text-xs mt-2">{stats.totalCost > 0 ? `${((stats.potentialProfit / stats.totalCost) * 100).toFixed(1)}%` : '0%'}</p>
                </div>
                <div className="bg-slate-500 rounded-xl p-5 text-white">
                    <h3 className="text-slate-200 text-sm font-medium mb-1">{lang === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}</h3>
                    <p className="text-3xl font-bold">{stats.totalProducts}</p>
                    <p className="text-slate-300 text-xs mt-2">{stats.activeProducts} {lang === 'ar' ? 'نشط' : 'active'}</p>
                </div>
            </div>

            {/* Alerts Section */}
            {(stats.lowStockProducts > 0 || stats.outOfStockProducts > 0 || stats.expiringProducts.length > 0) && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" size={20} />
                        {lang === 'ar' ? 'التنبيهات' : 'Alerts'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.lowStockProducts > 0 && (
                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                <p className="text-orange-600 font-bold text-2xl">{stats.lowStockProducts}</p>
                                <p className="text-orange-700 text-sm">{lang === 'ar' ? 'منتج بمخزون منخفض' : 'Low stock products'}</p>
                            </div>
                        )}
                        {stats.outOfStockProducts > 0 && (
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                <p className="text-red-600 font-bold text-2xl">{stats.outOfStockProducts}</p>
                                <p className="text-red-700 text-sm">{lang === 'ar' ? 'منتج نفذ من المخزون' : 'Out of stock products'}</p>
                            </div>
                        )}
                        {stats.expiringProducts.length > 0 && (
                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                <p className="text-amber-600 font-bold text-2xl">{stats.expiringProducts.length}</p>
                                <p className="text-amber-700 text-sm">{lang === 'ar' ? 'منتج قرب انتهاء الصلاحية' : 'Expiring soon'}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Category Analysis */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-800 mb-4">{lang === 'ar' ? 'تحليل الفئات' : 'Category Analysis'}</h3>
                <div className="space-y-3">
                    {stats.categoryStats.map(cat => (
                        <div key={cat.code} className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                                {getCategoryIcon(cat.icon, 18)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-slate-700">{lang === 'ar' ? cat.nameAr : cat.nameEn}</span>
                                    <span className="text-slate-500 text-sm">{cat.count} {lang === 'ar' ? 'منتج' : 'products'}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-500" style={{
                                        width: `${stats.totalProducts > 0 ? (cat.count / stats.totalProducts) * 100 : 0}%`,
                                        backgroundColor: cat.color
                                    }}></div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-slate-800">{cat.value.toLocaleString()}</p>
                                <p className="text-xs text-slate-400">{lang === 'ar' ? 'ريال' : 'SAR'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Expired Products List */}
            {stats.expiredProducts.length > 0 && (
                <div className="bg-white rounded-xl border border-red-200 p-5">
                    <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} />
                        {lang === 'ar' ? 'منتجات منتهية الصلاحية' : 'Expired Products'}
                    </h3>
                    <div className="space-y-2">
                        {stats.expiredProducts.slice(0, 5).map((p: Product) => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-800">{lang === 'ar' ? p.nameAr : p.nameEn}</p>
                                    <p className="text-xs text-slate-500">{p.sku}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-red-600 font-semibold">{p.expiryDate}</p>
                                    <p className="text-xs text-slate-400">{p.quantity} {p.unit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
