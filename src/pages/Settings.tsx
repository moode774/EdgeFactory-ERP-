import React, { useState } from 'react';
import { Database, Download, Upload, Trash2 } from 'lucide-react';
import { ProductDB, CustomerDB, SupplierDB, ActivityDB, Storage, STORAGE_KEYS } from '../services/storage';

const SettingsPage = ({ lang, products, customers, suppliers, onImport }: any) => {
    const [importing, setImporting] = useState(false);

    const exportAllData = () => {
        const data = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            products: ProductDB.getAll(),
            customers: CustomerDB.getAll(),
            suppliers: SupplierDB.getAll(),
            activity: ActivityDB.getAll()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forest-edge-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.products) Storage.set(STORAGE_KEYS.PRODUCTS, data.products);
                if (data.customers) Storage.set(STORAGE_KEYS.CUSTOMERS, data.customers);
                if (data.suppliers) Storage.set(STORAGE_KEYS.SUPPLIERS, data.suppliers);
                alert(lang === 'ar' ? 'تم استيراد البيانات بنجاح! سيتم تحديث الصفحة.' : 'Data imported successfully! Page will refresh.');
                window.location.reload();
            } catch (err) {
                alert(lang === 'ar' ? 'خطأ في قراءة الملف' : 'Error reading file');
            }
            setImporting(false);
        };
        reader.readAsText(file);
    };

    const clearAllData = () => {
        if (!confirm(lang === 'ar' ? 'هل أنت متأكد؟ سيتم حذف جميع البيانات!' : 'Are you sure? All data will be deleted!')) return;
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        window.location.reload();
    };

    const stats = {
        products: products.length,
        customers: customers.length,
        suppliers: suppliers.length
    };

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-slate-800">{lang === 'ar' ? 'الإعدادات' : 'Settings'}</h2>

            {/* Data Stats */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-800 mb-4">{lang === 'ar' ? 'إحصائيات البيانات' : 'Data Statistics'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-bold text-slate-800">{stats.products}</p>
                        <p className="text-xs text-slate-500">{lang === 'ar' ? 'منتج' : 'Products'}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-bold text-slate-800">{stats.customers}</p>
                        <p className="text-xs text-slate-500">{lang === 'ar' ? 'عميل' : 'Customers'}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-bold text-slate-800">{stats.suppliers}</p>
                        <p className="text-xs text-slate-500">{lang === 'ar' ? 'مورد' : 'Suppliers'}</p>
                    </div>
                </div>
            </div>

            {/* Backup & Restore */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Database size={20} /> {lang === 'ar' ? 'النسخ الاحتياطي والاستعادة' : 'Backup & Restore'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={exportAllData} className="flex items-center justify-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-emerald-700 font-medium transition-colors border border-emerald-200">
                        <Download size={20} />
                        {lang === 'ar' ? 'تصدير النسخة الاحتياطية' : 'Export Backup'}
                    </button>
                    <label className="flex items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-700 font-medium transition-colors border border-blue-200 cursor-pointer">
                        <Upload size={20} />
                        {importing ? (lang === 'ar' ? 'جاري الاستيراد...' : 'Importing...') : (lang === 'ar' ? 'استيراد نسخة احتياطية' : 'Import Backup')}
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
                    </label>
                    <button onClick={clearAllData} className="flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-xl text-red-700 font-medium transition-colors border border-red-200">
                        <Trash2 size={20} />
                        {lang === 'ar' ? 'مسح جميع البيانات' : 'Clear All Data'}
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-4">{lang === 'ar' ? 'ملاحظة: يتم تخزين البيانات محلياً في المتصفح.' : 'Note: Data is stored locally in the browser.'}</p>
            </div>

            {/* App Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-800 mb-4">{lang === 'ar' ? 'معلومات التطبيق' : 'App Info'}</h3>
                <div className="space-y-2 text-sm">
                    <p><span className="text-slate-500">{lang === 'ar' ? 'الإصدار:' : 'Version:'}</span> <span className="font-medium">1.0.0</span></p>
                    <p><span className="text-slate-500">{lang === 'ar' ? 'المطور:' : 'Developer:'}</span> <span className="font-medium">Forest Edge Factory</span></p>
                    <p><span className="text-slate-500">{lang === 'ar' ? 'آخر تحديث:' : 'Last Update:'}</span> <span className="font-medium">{new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span></p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

