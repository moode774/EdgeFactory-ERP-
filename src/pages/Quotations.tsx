import React, { useState } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { Quotation, Customer, Product } from '../types';
import { generateId } from '../utils/helpers';

const QuotationsPage = ({ lang, quotations, customers, products, onSave, onDelete }: any) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [notes, setNotes] = useState('');

    const handleSave = () => {
        if (!selectedCustomer || items.length === 0) return alert(lang === 'ar' ? 'أكمل البيانات' : 'Complete the form');
        const customer = customers.find((c: Customer) => c.id === selectedCustomer);
        const subtotal = items.reduce((sum, i) => sum + i.total, 0);
        const tax = subtotal * 0.15;
        const total = subtotal + tax;

        onSave({
            customerId: selectedCustomer,
            customerName: customer?.nameAr || 'Unknown',
            items, subtotal, tax, total, notes, discount: 0
        });
        setShowModal(false); setSelectedCustomer(''); setItems([]); setNotes('');
    };

    const addItem = (productId: string) => {
        const product = products.find((p: Product) => p.id === productId);
        if (!product) return;
        setItems([...items, {
            id: generateId(), productId: product.id, productName: lang === 'ar' ? product.nameAr : product.nameEn,
            quantity: 1, unitPrice: product.sellingPrice || 0, total: product.sellingPrice || 0
        }]);
    };

    const updateItem = (id: string, qty: number) => {
        setItems(items.map(i => i.id === id ? { ...i, quantity: qty, total: qty * i.unitPrice } : i));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">{lang === 'ar' ? 'عروض الأسعار' : 'Quotations'}</h2>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl font-medium shadow-lg hover:bg-slate-700">
                    <Plus size={18} />{lang === 'ar' ? 'عرض سعر جديد' : 'New Quotation'}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50 border-b text-slate-500">
                        <th className="px-4 py-3 text-right">#</th>
                        <th className="px-4 py-3 text-right">{lang === 'ar' ? 'العميل' : 'Customer'}</th>
                        <th className="px-4 py-3 text-right">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                        <th className="px-4 py-3 text-right">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                        <th className="px-4 py-3 text-right">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="px-4 py-3 text-right">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {quotations.length > 0 ? quotations.map((q: Quotation) => (
                            <tr key={q.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-mono text-purple-600">{q.quotationNumber}</td>
                                <td className="px-4 py-3">{q.customerName}</td>
                                <td className="px-4 py-3 text-slate-500">{new Date(q.date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}</td>
                                <td className="px-4 py-3 font-bold">{q.total.toLocaleString()}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${q.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {q.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 flex gap-2 justify-end">
                                    <button onClick={() => onDelete(q.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-400"><FileText size={48} className="mx-auto mb-4 opacity-30" /><p>{lang === 'ar' ? 'لا توجد عروض أسعار' : 'No quotations'}</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b bg-slate-800 text-white rounded-t-xl"><h3 className="font-bold">{lang === 'ar' ? 'عرض سعر جديد' : 'New Quotation'}</h3></div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'العميل' : 'Customer'}</label>
                                    <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                                        <option value="">{lang === 'ar' ? '-- اختر عميل --' : '-- Select Customer --'}</option>
                                        {customers.map((c: Customer) => <option key={c.id} value={c.id}>{lang === 'ar' ? c.nameAr : c.nameEn}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'إضافة منتج' : 'Add Product'}</label>
                                    <select onChange={e => addItem(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                                        <option value="">{lang === 'ar' ? '-- اختر منتج --' : '-- Add Product --'}</option>
                                        {products.map((p: Product) => <option key={p.id} value={p.id}>{lang === 'ar' ? p.nameAr : p.nameEn}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50"><tr className="text-slate-500"><th className="px-4 py-2 text-right">{lang === 'ar' ? 'المنتج' : 'Product'}</th><th className="px-4 py-2 w-24">{lang === 'ar' ? 'الكمية' : 'Qty'}</th><th className="px-4 py-2 w-24">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th></tr></thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id} className="border-t">
                                                <td className="px-4 py-2">{item.productName}</td>
                                                <td className="px-4 py-2"><input type="number" value={item.quantity} onChange={e => updateItem(item.id, Number(e.target.value))} className="w-20 border rounded px-1" /></td>
                                                <td className="px-4 py-2">{item.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t flex justify-end gap-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-slate-800 text-white rounded-lg">{lang === 'ar' ? 'حفظ' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuotationsPage;
