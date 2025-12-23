import React from 'react';
import { CATEGORIES } from '../constants/data';
import { getCategoryIcon } from '../components/common/CategoryIcons';
import { Product } from '../types';

const CategoriesPage = ({ lang, products }: any) => (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((category) => (
            <div key={category.code} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="p-4" style={{ backgroundColor: `${category.color}10` }}>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: category.color, color: 'white' }}>
                            {getCategoryIcon(category.icon, 24)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{lang === 'ar' ? category.nameAr : category.nameEn}</h3>
                            <p className="text-sm text-slate-500">{products.filter((p: Product) => p.categoryCode === category.code).length} {lang === 'ar' ? 'منتج' : 'products'}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 space-y-1">
                    {category.subcategories.map((sub) => (
                        <div key={sub.code} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }}></span>
                                <span className="text-slate-700">{lang === 'ar' ? sub.nameAr : sub.nameEn}</span>
                                <span className="text-xs text-slate-400 font-mono">({sub.code})</span>
                            </div>
                            <span className="text-xs text-slate-500 bg-white px-1.5 py-0.5 rounded">{products.filter((p: Product) => p.subcategoryCode === sub.code).length}</span>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export default CategoriesPage;
