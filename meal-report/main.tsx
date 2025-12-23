import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MealDelivery, MealCategory, AppConfig } from './types';
import MealReport from './components/MealReport';
import { Printer, Plus, Edit3, Save, Calendar, Trash2, Eye } from 'lucide-react';

const App: React.FC = () => {
    const [config] = useState<AppConfig>({
        companyName: 'فورست إيدج للخدمات اللوجستية',
        companyNameEn: 'Forest Edge Logistics Services',
        department: 'قسم التموين والإعاشة',
        location: 'المملكة العربية السعودية',
        contactNumber: '+966 XX XXX XXXX',
        documentRef: `FE-MEAL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
    });

    const [deliveries, setDeliveries] = useState<MealDelivery[]>([
        {
            id: '1',
            deliveryDate: new Date(),
            deliveryTime: '07:30 صباحاً',
            supplierName: 'مؤسسة الأطعمة المتميزة',
            supplierContact: '+966 50 123 4567',
            driverName: 'أحمد محمد العتيبي',
            vehicleNumber: 'أ ب ج 1234',
            categories: [
                {
                    id: 'south-asia',
                    name: 'مجموعة جنوب آسيا',
                    shortName: 'جنوب آسيا',
                    count: 38,
                    description: 'وجبات مخصصة للجنسيات (باكستان، الهند، بنغلاديش)',
                    color: '#f59e0b'
                },
                {
                    id: 'philippines',
                    name: 'الجنسية الفلبينية',
                    shortName: 'الفلبين',
                    count: 7,
                    description: 'وجبات مخصصة للعمالة الفلبينية',
                    color: '#3b82f6'
                },
                {
                    id: 'egypt',
                    name: 'الجنسية المصرية',
                    shortName: 'مصر',
                    count: 13,
                    description: 'وجبات مخصصة للعمالة المصرية',
                    color: '#ef4444'
                },
                {
                    id: 'saudi',
                    name: 'الجنسية السعودية',
                    shortName: 'السعودية',
                    count: 12,
                    description: 'وجبات مخصصة للموظفين السعوديين',
                    color: '#10b981'
                }
            ],
            notes: 'جميع الوجبات مطابقة للمواصفات المطلوبة. تم الفحص والتأكد من جودة التغليف ودرجة الحرارة المناسبة.',
            receivedBy: 'خالد بن عبدالله المطيري',
            approvedBy: 'محمد بن سعد الشهري',
            status: 'approved'
        }
    ]);

    const [selectedDelivery, setSelectedDelivery] = useState<MealDelivery>(deliveries[0]);
    const [isEditing, setIsEditing] = useState(false);
    const [showPreview, setShowPreview] = useState(true);

    const handlePrint = () => {
        window.print();
    };

    const handleUpdateCategory = (categoryId: string, newCount: number) => {
        setSelectedDelivery(prev => ({
            ...prev,
            categories: prev.categories.map(cat =>
                cat.id === categoryId ? { ...cat, count: newCount } : cat
            )
        }));
    };

    const handleAddCategory = () => {
        const newCategory: MealCategory = {
            id: `cat-${Date.now()}`,
            name: 'فئة جديدة',
            shortName: 'جديد',
            count: 0,
            description: 'وصف الفئة',
            color: '#6366f1'
        };

        setSelectedDelivery(prev => ({
            ...prev,
            categories: [...prev.categories, newCategory]
        }));
    };

    const handleRemoveCategory = (categoryId: string) => {
        setSelectedDelivery(prev => ({
            ...prev,
            categories: prev.categories.filter(cat => cat.id !== categoryId)
        }));
    };

    const totalMeals = selectedDelivery.categories.reduce((sum, cat) => sum + cat.count, 0);

    return (
        <div className="min-h-screen pb-20">
            {/* Control Panel */}
            <div className="no-print glass-effect sticky top-0 z-50 shadow-2xl">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-[#2d5016] to-[#4a7c2c] p-3 rounded-2xl text-white shadow-lg">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-800">نظام تقارير الوجبات - Forest Edge</h1>
                                <p className="text-sm text-gray-600 font-medium">إدارة وطباعة التقارير الرسمية للوجبات اليومية</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md ${showPreview
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <Eye size={20} />
                                {showPreview ? 'إخفاء المعاينة' : 'عرض المعاينة'}
                            </button>

                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md ${isEditing
                                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                            >
                                {isEditing ? <Save size={20} /> : <Edit3 size={20} />}
                                {isEditing ? 'حفظ التعديلات' : 'تعديل البيانات'}
                            </button>

                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#2d5016] to-[#4a7c2c] text-white rounded-xl font-black hover:shadow-2xl transition-all active:scale-95 shadow-lg"
                            >
                                <Printer size={20} />
                                طباعة التقرير الرسمي
                            </button>
                        </div>
                    </div>

                    {/* Editing Panel */}
                    {isEditing && (
                        <div className="animate-fade-in bg-white rounded-2xl p-6 shadow-inner border-2 border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ التوصيل</label>
                                    <input
                                        type="date"
                                        value={selectedDelivery.deliveryDate.toISOString().split('T')[0]}
                                        onChange={(e) => setSelectedDelivery(prev => ({ ...prev, deliveryDate: new Date(e.target.value) }))}
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7c2c] focus:border-[#4a7c2c] outline-none font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">وقت الاستلام</label>
                                    <input
                                        type="text"
                                        value={selectedDelivery.deliveryTime}
                                        onChange={(e) => setSelectedDelivery(prev => ({ ...prev, deliveryTime: e.target.value }))}
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7c2c] focus:border-[#4a7c2c] outline-none font-medium"
                                        placeholder="مثال: 07:30 صباحاً"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">اسم المورد</label>
                                    <input
                                        type="text"
                                        value={selectedDelivery.supplierName}
                                        onChange={(e) => setSelectedDelivery(prev => ({ ...prev, supplierName: e.target.value }))}
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7c2c] focus:border-[#4a7c2c] outline-none font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">رقم تواصل المورد</label>
                                    <input
                                        type="text"
                                        value={selectedDelivery.supplierContact}
                                        onChange={(e) => setSelectedDelivery(prev => ({ ...prev, supplierContact: e.target.value }))}
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7c2c] focus:border-[#4a7c2c] outline-none font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">اسم السائق</label>
                                    <input
                                        type="text"
                                        value={selectedDelivery.driverName}
                                        onChange={(e) => setSelectedDelivery(prev => ({ ...prev, driverName: e.target.value }))}
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7c2c] focus:border-[#4a7c2c] outline-none font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">رقم المركبة</label>
                                    <input
                                        type="text"
                                        value={selectedDelivery.vehicleNumber}
                                        onChange={(e) => setSelectedDelivery(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7c2c] focus:border-[#4a7c2c] outline-none font-medium"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-bold text-gray-700">فئات الوجبات</label>
                                    <button
                                        onClick={handleAddCategory}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#2d5016] text-white rounded-lg font-bold hover:bg-[#4a7c2c] transition-colors"
                                    >
                                        <Plus size={18} />
                                        إضافة فئة جديدة
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedDelivery.categories.map((cat) => (
                                        <div key={cat.id} className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 relative">
                                            <button
                                                onClick={() => handleRemoveCategory(cat.id)}
                                                className="absolute top-2 left-2 p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            <div className="mb-3">
                                                <label className="block text-xs font-bold text-gray-600 mb-1">اسم الفئة</label>
                                                <input
                                                    type="text"
                                                    value={cat.shortName}
                                                    onChange={(e) => setSelectedDelivery(prev => ({
                                                        ...prev,
                                                        categories: prev.categories.map(c =>
                                                            c.id === cat.id ? { ...c, shortName: e.target.value } : c
                                                        )
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c2c] outline-none text-sm font-medium"
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="block text-xs font-bold text-gray-600 mb-1">الوصف</label>
                                                <input
                                                    type="text"
                                                    value={cat.description}
                                                    onChange={(e) => setSelectedDelivery(prev => ({
                                                        ...prev,
                                                        categories: prev.categories.map(c =>
                                                            c.id === cat.id ? { ...c, description: e.target.value } : c
                                                        )
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c2c] outline-none text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-gray-600 mb-1">العدد</label>
                                                    <input
                                                        type="number"
                                                        value={cat.count}
                                                        onChange={(e) => handleUpdateCategory(cat.id, parseInt(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c2c] outline-none text-lg font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1">اللون</label>
                                                    <input
                                                        type="color"
                                                        value={cat.color}
                                                        onChange={(e) => setSelectedDelivery(prev => ({
                                                            ...prev,
                                                            categories: prev.categories.map(c =>
                                                                c.id === cat.id ? { ...c, color: e.target.value } : c
                                                            )
                                                        }))}
                                                        className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات إضافية</label>
                                <textarea
                                    value={selectedDelivery.notes}
                                    onChange={(e) => setSelectedDelivery(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7c2c] focus:border-[#4a7c2c] outline-none font-medium resize-none"
                                    rows={3}
                                    placeholder="أدخل أي ملاحظات إضافية هنا..."
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Preview */}
            {showPreview && (
                <div className="max-w-[210mm] mx-auto mt-8 px-4 sm:px-0 animate-fade-in">
                    <div className="print-area shadow-2xl rounded-2xl overflow-hidden">
                        <MealReport delivery={selectedDelivery} config={config} />
                    </div>
                </div>
            )}

            {/* Stats Badge */}
            <div className="no-print fixed bottom-6 left-6 glass-effect p-5 rounded-2xl shadow-2xl border-2 border-white">
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">إجمالي الوجبات</p>
                    <p className="text-4xl font-black bg-gradient-to-r from-[#2d5016] to-[#4a7c2c] bg-clip-text text-transparent">
                        {totalMeals}
                    </p>
                    <p className="text-xs text-gray-600 font-medium mt-1">وجبة مستلمة</p>
                </div>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
