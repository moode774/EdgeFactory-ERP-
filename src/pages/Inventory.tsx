import React, { useState } from 'react';
import { Download, Plus, Image, Edit3, Trash2, Search, Filter, X, Package, DollarSign, Layers } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../constants/data';
import { exportToCSV } from '../utils/helpers';
import { useLanguage } from '../contexts/LanguageContext';

const InventoryPage = ({ products, lang, onAddClick, onEditClick, onDeleteClick, filterCategory, setFilterCategory, filterStatus, setFilterStatus }: any) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const getCategory = (code: string) => CATEGORIES.find(c => c.code === code);

    // Filter products based on search
    const filteredProducts = products.filter((product: Product) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return product.nameAr?.toLowerCase().includes(term) ||
            product.nameEn?.toLowerCase().includes(term) ||
            product.sku?.toLowerCase().includes(term);
    });

    return (
        <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen flex flex-col">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{t('inventory')}</h1>
                        <p className="text-slate-500 font-medium">{lang === 'ar' ? 'إدارة مخزون المنتجات' : 'Manage your product inventory'}</p>
                    </div>
                    <button
                        onClick={onAddClick}
                        className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg transform active:scale-95"
                    >
                        <Plus size={20} /> {t('addProduct')}
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('searchProducts')}
                            className="w-full h-12 pl-12 pr-4 text-base border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-700 focus:border-slate-700 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Search size={20} />
                        </div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-slate-500" />
                            <span className="text-sm font-bold text-slate-600">{t('filter')}:</span>
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-700 focus:border-slate-700 transition-all outline-none"
                        >
                            <option value="">{t('all')} {t('categories')}</option>
                            {CATEGORIES.map((cat) => <option key={cat.code} value={cat.code}>{lang === 'ar' ? cat.nameAr : cat.nameEn}</option>)}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-700 focus:border-slate-700 transition-all outline-none"
                        >
                            <option value="">{t('all')} {t('status')}</option>
                            <option value="active">{t('inStock')}</option>
                            <option value="low_stock">{t('lowStock')}</option>
                            <option value="out_of_stock">{t('outOfStock')}</option>
                        </select>
                        <button
                            onClick={() => exportToCSV(products, lang)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all"
                        >
                            <Download size={16} /> {t('export')}
                        </button>
                    </div>

                    {/* Results Count */}
                    {searchTerm && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="text-sm text-slate-600 font-medium">
                                {lang === 'ar' ? `تم العثور على` : 'Found'} <span className="font-bold text-slate-900">{filteredProducts.length}</span> {lang === 'ar' ? 'منتج' : `product${filteredProducts.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden flex-1 shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                                <th className="px-6 py-4 font-bold text-left">{t('productName')}</th>
                                <th className="px-6 py-4 font-bold text-left">{t('sku')}</th>
                                <th className="px-6 py-4 font-bold text-left">{t('category')}</th>
                                <th className="px-6 py-4 font-bold text-center">{t('quantity')}</th>
                                <th className="px-6 py-4 font-bold text-left">{t('price')}</th>
                                <th className="px-6 py-4 font-bold text-center">{t('status')}</th>
                                <th className="px-6 py-4">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredProducts.length > 0 ? filteredProducts.map((product: Product) => {
                                const category = getCategory(product.categoryCode);
                                const isExpiringSoon = product.expiryDate && new Date(product.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                                const isExpired = product.expiryDate && new Date(product.expiryDate) < new Date();
                                return (
                                    <tr key={product.id} className="hover:bg-slate-50 group transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {product.images && product.images.length > 0 ? (
                                                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm">
                                                        <img src={product.images[0]} alt={product.nameEn} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50">
                                                        <Image size={24} className="text-slate-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-slate-900 text-base">{lang === 'ar' ? product.nameAr : product.nameEn}</div>
                                                    {product.dimensions && <div className="text-xs text-slate-500 mt-0.5" dir="ltr">{product.dimensions}</div>}
                                                    {product.batchNumber && <div className="text-xs text-blue-600 font-medium mt-0.5">Batch #{product.batchNumber}</div>}
                                                    {isExpired && <div className="text-xs text-red-600 font-bold mt-0.5">⚠️ Expired</div>}
                                                    {isExpiringSoon && !isExpired && <div className="text-xs text-orange-600 font-medium mt-0.5">⚠️ Expiring Soon</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-slate-700 font-medium bg-slate-100 px-2 py-1 rounded text-xs">
                                                {product.sku}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border" style={{
                                                backgroundColor: `${category?.color}15`,
                                                color: category?.color,
                                                borderColor: `${category?.color}40`
                                            }}>
                                                {lang === 'ar' ? category?.nameAr : category?.nameEn}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="font-bold text-slate-900 text-base">{product.quantity}</div>
                                            <div className="text-xs text-slate-500">{product.unit}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.sellingPrice > 0 && (
                                                <div className="text-emerald-600 font-bold text-base">{product.sellingPrice.toFixed(2)} SAR</div>
                                            )}
                                            {product.costPrice > 0 && (
                                                <div className="text-slate-500 text-xs mt-0.5">Cost: {product.costPrice.toFixed(2)}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${product.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                product.status === 'low_stock' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${product.status === 'active' ? 'bg-emerald-500' :
                                                    product.status === 'low_stock' ? 'bg-orange-500' : 'bg-red-500'
                                                    }`}></span>
                                                {product.status === 'active' ? t('inStock') :
                                                    product.status === 'low_stock' ? t('lowStock') : t('outOfStock')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onEditClick(product)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteClick(product)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg border-2 border-red-200 hover:border-red-300 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="inline-block p-6 bg-slate-100 rounded-full mb-4">
                                            <Package size={48} className="text-slate-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-700 mb-2">
                                            {searchTerm ? t('noResultsFound') : t('noData')}
                                        </h3>
                                        <p className="text-slate-500">
                                            {searchTerm ? (lang === 'ar' ? 'جرب كلمة بحث أخرى' : 'Try a different search term') : (lang === 'ar' ? 'أضف منتجك الأول للبدء' : 'Add your first product to get started')}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;
