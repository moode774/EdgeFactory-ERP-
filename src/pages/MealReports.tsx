import React, { useState, useEffect } from 'react';
import { MealReport, MealRecord } from '../types/mealReport';
import { MealReportDB } from '../services/MealReportService';
import MealReportPreview from '../components/mealReports/MealReportPreview';
import { Plus, Printer, Edit3, Trash2, Eye, FileText, Users, Calendar, Save, X, UserPlus } from 'lucide-react';

const MealReports: React.FC = () => {
    const [reports, setReports] = useState<MealReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<MealReport | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingReport, setEditingReport] = useState<MealReport | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryTime: '07:00 صباحاً',
        supplierName: '',
        supplierContact: '',
        driverName: '',
        vehicleNumber: '',
        receivedBy: '',
        approvedBy: '',
        notes: '',
        status: 'draft' as 'draft' | 'approved' | 'archived'
    });

    const [mealRecords, setMealRecords] = useState<MealRecord[]>([]);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        const data = await MealReportDB.getAll();
        setReports(data);
    };

    const handleAddRecord = () => {
        const newRecord: MealRecord = {
            id: `record-${Date.now()}`,
            personName: '',
            nationality: 'هندي',
            mealCount: 1,
            mealType: 'غداء'
        };
        setMealRecords([...mealRecords, newRecord]);
    };

    const handleUpdateRecord = (id: string, field: keyof MealRecord, value: any) => {
        setMealRecords(mealRecords.map(record =>
            record.id === id ? { ...record, [field]: value } : record
        ));
    };

    const handleDeleteRecord = (id: string) => {
        setMealRecords(mealRecords.filter(record => record.id !== id));
    };

    const handleSubmit = async () => {
        if (mealRecords.length === 0) {
            alert('يرجى إضافة شخص واحد على الأقل');
            return;
        }

        const reportData = {
            documentNumber: '', // Will be generated
            date: formData.date,
            deliveryInfo: {
                deliveryDate: formData.deliveryDate,
                deliveryTime: formData.deliveryTime,
                supplierName: formData.supplierName,
                supplierContact: formData.supplierContact,
                driverName: formData.driverName,
                vehicleNumber: formData.vehicleNumber
            },
            mealRecords: mealRecords,
            notes: formData.notes,
            signatures: {
                receivedBy: formData.receivedBy,
                approvedBy: formData.approvedBy
            },
            status: formData.status
        };

        try {
            if (editingReport) {
                await MealReportDB.update(editingReport.id, reportData);
                alert('✅ تم تحديث التقرير بنجاح');
            } else {
                await MealReportDB.add(reportData, 'current-user'); // Replace with actual user ID
                alert('✅ تم إضافة التقرير بنجاح');
            }

            setShowForm(false);
            setEditingReport(null);
            resetForm();
            loadReports();
        } catch (error) {
            alert('❌ حدث خطأ أثناء حفظ التقرير');
        }
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            deliveryDate: new Date().toISOString().split('T')[0],
            deliveryTime: '07:00 صباحاً',
            supplierName: '',
            supplierContact: '',
            driverName: '',
            vehicleNumber: '',
            receivedBy: '',
            approvedBy: '',
            notes: '',
            status: 'draft'
        });
        setMealRecords([]);
    };

    const handleEdit = (report: MealReport) => {
        setEditingReport(report);
        setFormData({
            date: report.date,
            deliveryDate: report.deliveryInfo.deliveryDate,
            deliveryTime: report.deliveryInfo.deliveryTime,
            supplierName: report.deliveryInfo.supplierName,
            supplierContact: report.deliveryInfo.supplierContact,
            driverName: report.deliveryInfo.driverName,
            vehicleNumber: report.deliveryInfo.vehicleNumber,
            receivedBy: report.signatures.receivedBy,
            approvedBy: report.signatures.approvedBy,
            notes: report.notes,
            status: report.status
        });
        setMealRecords(report.mealRecords);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
            await MealReportDB.delete(id);
            loadReports();
            alert('✅ تم حذف التقرير بنجاح');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const totalMeals = mealRecords.reduce((sum, record) => sum + record.mealCount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pb-20">
            {/* Header */}
            <div className="bg-white border-b-2 border-slate-200 shadow-sm sticky top-0 z-40 no-print">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-3 rounded-xl text-white shadow-lg">
                                <FileText className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">نظام تقارير الوجبات اليومية</h1>
                                <p className="text-sm text-slate-600 font-medium">Forest Edge - إدارة كشوفات الوجبات الرسمية</p>
                            </div>
                        </div>

                        <button
                            onClick={() => { resetForm(); setShowForm(true); setEditingReport(null); }}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-black hover:shadow-2xl transition-all active:scale-95 shadow-lg"
                        >
                            <Plus size={20} />
                            تقرير جديد
                        </button>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-slate-900 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <h2 className="text-xl font-black">{editingReport ? 'تعديل التقرير' : 'تقرير جديد'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Only Date */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ التقرير</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                                />
                            </div>

                            {/* Meal Records */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <Users size={20} />
                                        قائمة الأسماء ({mealRecords.length} شخص)
                                    </h3>
                                    <button
                                        onClick={handleAddRecord}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition-colors"
                                    >
                                        <UserPlus size={18} />
                                        إضافة شخص
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {mealRecords.map((record, index) => (
                                        <div key={record.id} className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 relative">
                                            <button
                                                onClick={() => handleDeleteRecord(record.id)}
                                                className="absolute top-2 left-2 p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            <div className="grid grid-cols-3 gap-3 pr-8">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1">الاسم</label>
                                                    <input
                                                        type="text"
                                                        value={record.personName}
                                                        onChange={(e) => handleUpdateRecord(record.id, 'personName', e.target.value)}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                                                        placeholder="اسم الشخص"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1">الجنسية</label>
                                                    <select
                                                        value={record.nationality}
                                                        onChange={(e) => handleUpdateRecord(record.id, 'nationality', e.target.value)}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                                                    >
                                                        <option value="هندي">هندي</option>
                                                        <option value="باكستاني">باكستاني</option>
                                                        <option value="بنغالي">بنغالي</option>
                                                        <option value="فلبيني">فلبيني</option>
                                                        <option value="مصري">مصري</option>
                                                        <option value="سعودي">سعودي</option>
                                                        <option value="أخرى">أخرى</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1">نوع الوجبة</label>
                                                    <input
                                                        type="text"
                                                        value={record.mealType}
                                                        onChange={(e) => handleUpdateRecord(record.id, 'mealType', e.target.value)}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                                                        placeholder="مثال: غداء"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2.5 bg-slate-200 text-slate-800 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                                >
                                    <Save size={18} />
                                    {editingReport ? 'تحديث' : 'حفظ'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && selectedReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-[210mm] w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-slate-900 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between no-print">
                            <h2 className="text-xl font-black">معاينة التقرير</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-colors"
                                >
                                    <Printer size={18} />
                                    طباعة
                                </button>
                                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <MealReportPreview report={selectedReport} />
                    </div>
                </div>
            )}

            {/* Reports List */}
            <div className="max-w-7xl mx-auto px-6 py-8 no-print">
                <h2 className="text-xl font-black text-slate-900 mb-6">التقارير المحفوظة ({reports.length})</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden hover:shadow-2xl transition-all">
                            <div className="bg-slate-900 text-white px-4 py-3">
                                <p className="text-xs font-bold opacity-80 mb-1">رقم المستند</p>
                                <p className="text-lg font-black">{report.documentNumber}</p>
                            </div>

                            <div className="p-4">
                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">التاريخ:</span>
                                        <span className="font-bold text-slate-900">{new Date(report.date).toLocaleDateString('ar-SA')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">المورد:</span>
                                        <span className="font-bold text-slate-900">{report.deliveryInfo.supplierName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">عدد الأشخاص:</span>
                                        <span className="font-bold text-slate-900">{report.mealRecords.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">إجمالي الوجبات:</span>
                                        <span className="font-black text-lg text-slate-900">{report.totalMeals}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setSelectedReport(report); setShowPreview(true); }}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition-colors text-sm"
                                    >
                                        <Eye size={16} />
                                        معاينة
                                    </button>
                                    <button
                                        onClick={() => handleEdit(report)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(report.id)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors text-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {reports.length === 0 && (
                    <div className="text-center py-20">
                        <FileText className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                        <p className="text-xl font-bold text-slate-400">لا توجد تقارير محفوظة</p>
                        <p className="text-sm text-slate-500 mt-2">اضغط على "تقرير جديد" لإنشاء أول تقرير</p>
                    </div>
                )}
            </div>

            <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.5cm;
          }
          
          body {
            background: white !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
};

export default MealReports;
