import React, { useState } from 'react';
import { Plus, Users, Edit3, Trash2, X, Phone, Mail, MapPin, User, Building2, Search, DollarSign } from 'lucide-react';
import { Customer } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const CustomersPage = ({ lang, customers, onAdd, onEdit, onDelete }: any) => {
    const { t } = useLanguage();
    const [showModal, setShowModal] = useState(false);
    const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
    const [form, setForm] = useState({ nameAr: '', nameEn: '', type: 'individual' as 'individual' | 'company', phone: '', email: '', address: '', notes: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = () => {
        if (!form.nameAr || !form.phone) return alert('Fill required fields');
        if (editCustomer) {
            onEdit(editCustomer.id, form);
        } else {
            onAdd(form);
        }
        setShowModal(false);
        setEditCustomer(null);
        setForm({ nameAr: '', nameEn: '', type: 'individual', phone: '', email: '', address: '', notes: '' });
    };

    // Filter customers based on search
    const filteredCustomers = customers.filter((customer: Customer) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return customer.nameAr?.toLowerCase().includes(term) ||
            customer.nameEn?.toLowerCase().includes(term) ||
            customer.phone?.toLowerCase().includes(term) ||
            customer.code?.toLowerCase().includes(term);
    });

    return (
        <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{t('customers')}</h1>
                        <p className="text-slate-500 font-medium">{lang === 'ar' ? 'إدارة علاقات العملاء' : 'Manage your customer relationships'}</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditCustomer(null);
                            setForm({ nameAr: '', nameEn: '', type: 'individual', phone: '', email: '', address: '', notes: '' });
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg transform active:scale-95"
                    >
                        <Plus size={20} /> {t('addCustomer')}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('searchCustomers')}
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
                                {lang === 'ar' ? `تم العثور على` : 'Found'} <span className="font-bold text-slate-900">{filteredCustomers.length}</span> {lang === 'ar' ? 'عميل' : `customer${filteredCustomers.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer: Customer) => (
                    <div key={customer.id} className="group bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-xl hover:border-slate-300 transition-all duration-200">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg ${customer.type === 'company'
                                    ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                    }`}>
                                    {customer.type === 'company' ? <Building2 size={28} /> : <User size={28} />}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg">{lang === 'ar' ? customer.nameAr : customer.nameEn || customer.nameAr}</h3>
                                    {customer.nameEn && <p className="text-xs text-slate-500 font-medium">{customer.nameEn}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Type & Code */}
                        <div className="flex gap-2 mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${customer.type === 'company'
                                ? 'bg-purple-100 text-purple-700 border-purple-200'
                                : 'bg-blue-100 text-blue-700 border-blue-200'
                                }`}>
                                {customer.type === 'company' ? (lang === 'ar' ? 'شركة' : 'Company') : (lang === 'ar' ? 'فرد' : 'Individual')}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                                {customer.code}
                            </span>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <div className="p-1.5 bg-slate-100 rounded-lg">
                                    <Phone size={14} className="text-slate-600" />
                                </div>
                                <span className="font-medium">{customer.phone}</span>
                            </div>
                            {customer.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <div className="p-1.5 bg-slate-100 rounded-lg">
                                        <Mail size={14} className="text-slate-600" />
                                    </div>
                                    <span className="font-medium truncate">{customer.email}</span>
                                </div>
                            )}
                            {customer.address && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <div className="p-1.5 bg-slate-100 rounded-lg">
                                        <MapPin size={14} className="text-slate-600" />
                                    </div>
                                    <span className="font-medium truncate">{customer.address}</span>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center pt-4 border-t-2 border-slate-100">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('balance')}</p>
                                <p className={`text-xl font-black ${customer.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {customer.balance.toLocaleString()} SAR
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditCustomer(customer);
                                        setForm({
                                            nameAr: customer.nameAr,
                                            nameEn: customer.nameEn,
                                            type: customer.type,
                                            phone: customer.phone,
                                            email: customer.email || '',
                                            address: customer.address || '',
                                            notes: customer.notes || ''
                                        });
                                        setShowModal(true);
                                    }}
                                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    onClick={() => onDelete(customer.id)}
                                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {filteredCustomers.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <div className="inline-block p-6 bg-slate-100 rounded-full mb-4">
                            <Users size={48} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">
                            {searchTerm ? t('noResultsFound') : t('noData')}
                        </h3>
                        <p className="text-slate-500">
                            {searchTerm ? (lang === 'ar' ? 'جرب كلمة بحث أخرى' : 'Try a different search term') : (lang === 'ar' ? 'أضف عميلك الأول للبدء' : 'Add your first customer to get started')}
                        </p>
                    </div>
                )}
            </div>

            {/* Customer Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b-2 border-slate-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">
                                    {editCustomer ? t('edit') + ' ' + t('customerName') : t('addCustomer')}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">{lang === 'ar' ? 'املأ معلومات العميل' : 'Fill in the customer information'}</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                <X size={24} className="text-slate-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                        <User size={16} /> Name (Arabic) *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.nameAr}
                                        onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-medium focus:ring-2 focus:ring-slate-700 focus:border-slate-700 transition-all outline-none"
                                        placeholder="اسم العميل"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                        <User size={16} /> Name (English)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.nameEn}
                                        onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-medium focus:ring-2 focus:ring-slate-700 focus:border-slate-700 transition-all outline-none"
                                        placeholder="Customer Name"
                                    />
                                </div>
                            </div>

                            {/* Type & Phone */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                        <Building2 size={16} /> Type
                                    </label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as 'individual' | 'company' })}
                                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-medium focus:ring-2 focus:ring-slate-700 focus:border-slate-700 transition-all outline-none"
                                    >
                                        <option value="individual">Individual</option>
                                        <option value="company">Company</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                        <Phone size={16} /> Phone *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-medium focus:ring-2 focus:ring-slate-700 focus:border-slate-700 transition-all outline-none"
                                        placeholder="+966 XX XXX XXXX"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                    <Mail size={16} /> Email
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-medium focus:ring-2 focus:ring-slate-700 focus:border-slate-700 transition-all outline-none"
                                    placeholder="customer@example.com"
                                />
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
                                {editCustomer ? t('edit') : t('save')} {t('customerName')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersPage;
