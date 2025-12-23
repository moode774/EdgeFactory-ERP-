import React, { useState } from 'react';
import { Plus, Warehouse as WarehouseIcon, Edit3, Trash2, X, MapPin, Building2, Search, Package } from 'lucide-react';
import { Warehouse } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const WarehousesPage = ({ lang, warehouses, onAdd, onEdit, onDelete }: any) => {
    const { t } = useLanguage();
    const [showModal, setShowModal] = useState(false);
    const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
    const [form, setForm] = useState({ nameAr: '', nameEn: '', address: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = () => {
        if (!form.nameAr || !form.nameEn) return alert('Complete required fields');
        if (editWarehouse) {
            onEdit(editWarehouse.id, form);
        } else {
            onAdd(form);
        }
        setShowModal(false);
        setEditWarehouse(null);
        setForm({ nameAr: '', nameEn: '', address: '' });
    };

    // Filter warehouses based on search
    const filteredWarehouses = warehouses.filter((warehouse: Warehouse) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return warehouse.nameAr?.toLowerCase().includes(term) ||
            warehouse.nameEn?.toLowerCase().includes(term) ||
            warehouse.code?.toLowerCase().includes(term) ||
            warehouse.address?.toLowerCase().includes(term);
    });

    return (
        <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{t('warehouses')}</h1>
                        <p className="text-slate-500 font-medium">{lang === 'ar' ? 'إدارة مواقع التخزين' : 'Manage your storage locations'}</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditWarehouse(null);
                            setForm({ nameAr: '', nameEn: '', address: '' });
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg transform active:scale-95"
                    >
                        <Plus size={20} /> {t('addWarehouse')}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={lang === 'ar' ? 'ابحث عن المستودعات...' : 'Search warehouses...'}
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
                    {searchTerm && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-sm text-slate-600 font-medium">
                                {lang === 'ar' ? `تم العثور على` : 'Found'} <span className="font-bold text-slate-900">{filteredWarehouses.length}</span> {lang === 'ar' ? 'مستودع' : `warehouse${filteredWarehouses.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Warehouses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWarehouses.map((warehouse: Warehouse) => (
                    <div
                        key={warehouse.id}
                        className="group bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-xl hover:border-slate-300 transition-all duration-200 relative overflow-hidden"
                    >
                        {/* Default Badge */}
                        {warehouse.isDefault && (
                            <div className="absolute top-0 right-0">
                                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl text-xs font-bold uppercase tracking-wider shadow-lg">
                                    {lang === 'ar' ? 'افتراضي' : 'Default'}
                                </div>
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white shadow-lg">
                                    <WarehouseIcon size={28} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg">{lang === 'ar' ? warehouse.nameAr : warehouse.nameEn}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{lang === 'ar' ? warehouse.nameEn : warehouse.nameAr}</p>
                                </div>
                            </div>
                        </div>

                        {/* Code */}
                        <div className="mb-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                                <Package size={14} className="text-slate-600" />
                                <span className="text-sm font-bold text-slate-700 font-mono">{warehouse.code}</span>
                            </div>
                        </div>

                        {/* Address */}
                        {warehouse.address && (
                            <div className="flex items-start gap-2 text-sm text-slate-600 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <MapPin size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                                <span className="font-medium">{warehouse.address}</span>
                            </div>
                        )}

                        {/* Actions */}
                        {!warehouse.isDefault && (
                            <div className="flex gap-2 pt-4 border-t-2 border-slate-100">
                                <button
                                    onClick={() => {
                                        setEditWarehouse(warehouse);
                                        setForm({
                                            nameAr: warehouse.nameAr,
                                            nameEn: warehouse.nameEn || '',
                                            address: warehouse.address || ''
                                        });
                                        setShowModal(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all font-bold text-sm"
                                >
                                    <Edit3 size={16} /> {t('edit')}
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this warehouse?')) onDelete(warehouse.id);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 p-2.5 text-red-600 hover:bg-red-50 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all font-bold text-sm"
                                >
                                    <Trash2 size={16} /> {t('delete')}
                                </button>
                            </div>
                        )}

                        {warehouse.isDefault && (
                            <div className="pt-4 border-t-2 border-slate-100">
                                <p className="text-xs text-slate-500 text-center font-medium">
                                    {lang === 'ar' ? 'هذا هو المستودع الافتراضي ولا يمكن تعديله' : 'This is the default warehouse and cannot be modified'}
                                </p>
                            </div>
                        )}
                    </div>
                ))}

                {/* Empty State */}
                {filteredWarehouses.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <div className="inline-block p-6 bg-slate-100 rounded-full mb-4">
                            <WarehouseIcon size={48} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">
                            {searchTerm ? t('noResultsFound') : t('noData')}
                        </h3>
                        <p className="text-slate-500">
                            {searchTerm ? (lang === 'ar' ? 'جرب كلمة بحث أخرى' : 'Try a different search term') : (lang === 'ar' ? 'أضف مستودعك الأول للبدء' : 'Add your first warehouse to get started')}
                        </p>
                    </div>
                )}
            </div>

            {/* Warehouse Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b-2 border-slate-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">
                                    {editWarehouse ? t('edit') + ' ' + t('warehouseName') : t('addWarehouse')}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">{lang === 'ar' ? 'املأ معلومات المستودع' : 'Fill in the warehouse information'}</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                <X size={24} className="text-slate-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                        <Building2 size={16} /> Name (Arabic) *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.nameAr}
                                        onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-medium focus:ring-2 focus:ring-slate-700 focus:border-slate-700 transition-all outline-none"
                                        placeholder="اسم المخزن"
                                        dir="rtl"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                        <Building2 size={16} /> Name (English) *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.nameEn}
                                        onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-medium focus:ring-2 focus:ring-slate-700 focus:border-slate-700 transition-all outline-none"
                                        placeholder="Warehouse Name"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                    <MapPin size={16} /> Address
                                </label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-medium focus:ring-2 focus:ring-slate-700 focus:border-slate-700 transition-all outline-none"
                                    placeholder="Full address"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-5 border-t-2 border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl text-base font-bold transition-all"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-8 py-3 bg-slate-900 text-white rounded-xl text-base font-bold hover:bg-slate-800 transition-all shadow-lg transform active:scale-95"
                            >
                                {editWarehouse ? t('edit') : t('save')} {t('warehouseName')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehousesPage;
