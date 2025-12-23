import React from 'react';
import { MealDelivery, AppConfig } from '../types';
import Logo from './Logo';
import { Package, Truck, User, Phone, Calendar, Clock, FileText, CheckCircle2 } from 'lucide-react';

interface MealReportProps {
    delivery: MealDelivery;
    config: AppConfig;
}

const MealReport: React.FC<MealReportProps> = ({ delivery, config }) => {
    const totalMeals = delivery.categories.reduce((sum, cat) => sum + cat.count, 0);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    return (
        <div className="bg-white p-8 min-h-[297mm] flex flex-col relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <Logo size="large" showText={false} />
            </div>

            {/* Header Section */}
            <div className="border-4 border-[#2d5016] rounded-2xl p-6 mb-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <Logo size="medium" showText={true} />

                    <div className="text-left">
                        <div className="bg-[#2d5016] text-white px-4 py-2 rounded-lg inline-block mb-2">
                            <span className="text-xs font-bold">رقم المستند</span>
                            <p className="text-lg font-black">{config.documentRef}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">تاريخ الإصدار: {formatDate(new Date())}</p>
                    </div>
                </div>

                <div className="border-t-2 border-[#4a7c2c] pt-4 mt-4">
                    <h1 className="text-3xl font-black text-center text-[#2d5016] mb-2" style={{ fontFamily: 'Amiri, serif' }}>
                        تقرير استلام الوجبات اليومي الرسمي
                    </h1>
                    <p className="text-center text-gray-600 font-medium">
                        {config.companyName} - {config.department}
                    </p>
                    <p className="text-center text-sm text-gray-500 mt-1">
                        {config.location} | {config.contactNumber}
                    </p>
                </div>
            </div>

            {/* Delivery Information */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border-2 border-[#4a7c2c] rounded-xl p-4 bg-gradient-to-br from-green-50 to-white">
                    <div className="flex items-center gap-2 mb-3 text-[#2d5016]">
                        <Calendar className="w-5 h-5" />
                        <h3 className="font-bold text-lg">معلومات التوصيل</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">تاريخ التوصيل:</span>
                            <span className="font-bold">{formatDate(delivery.deliveryDate)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">وقت الاستلام:</span>
                            <span className="font-bold">{delivery.deliveryTime}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">رقم المركبة:</span>
                            <span className="font-bold font-mono">{delivery.vehicleNumber}</span>
                        </div>
                    </div>
                </div>

                <div className="border-2 border-[#4a7c2c] rounded-xl p-4 bg-gradient-to-br from-green-50 to-white">
                    <div className="flex items-center gap-2 mb-3 text-[#2d5016]">
                        <Truck className="w-5 h-5" />
                        <h3 className="font-bold text-lg">بيانات المورد والسائق</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">اسم المورد:</span>
                            <span className="font-bold">{delivery.supplierName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">رقم التواصل:</span>
                            <span className="font-bold font-mono">{delivery.supplierContact}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">اسم السائق:</span>
                            <span className="font-bold">{delivery.driverName}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Meal Categories */}
            <div className="flex-grow mb-6">
                <div className="bg-[#2d5016] text-white px-4 py-3 rounded-t-xl flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    <h2 className="text-xl font-bold">تفاصيل الوجبات المستلمة</h2>
                </div>

                <div className="border-2 border-[#2d5016] rounded-b-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-green-100 to-green-50">
                                <th className="border-b-2 border-[#4a7c2c] px-4 py-3 text-right font-bold text-sm">#</th>
                                <th className="border-b-2 border-[#4a7c2c] px-4 py-3 text-right font-bold">فئة الوجبة</th>
                                <th className="border-b-2 border-[#4a7c2c] px-4 py-3 text-right font-bold text-sm">الوصف التفصيلي</th>
                                <th className="border-b-2 border-[#4a7c2c] px-4 py-3 text-center font-bold">العدد</th>
                                <th className="border-b-2 border-[#4a7c2c] px-4 py-3 text-center font-bold text-sm">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {delivery.categories.map((cat, index) => (
                                <tr key={cat.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="border-b border-gray-200 px-4 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2d5016] text-white font-bold text-sm">
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="border-b border-gray-200 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: cat.color }}></div>
                                            <span className="font-bold text-lg">{cat.shortName}</span>
                                        </div>
                                    </td>
                                    <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-600">
                                        {cat.description}
                                    </td>
                                    <td className="border-b border-gray-200 px-4 py-3 text-center">
                                        <span className="inline-block bg-[#2d5016] text-white font-black px-4 py-2 rounded-lg text-xl">
                                            {cat.count}
                                        </span>
                                    </td>
                                    <td className="border-b border-gray-200 px-4 py-3 text-center">
                                        <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                                    </td>
                                </tr>
                            ))}

                            {/* Total Row */}
                            <tr className="bg-gradient-to-r from-[#2d5016] to-[#4a7c2c] text-white font-bold">
                                <td colSpan={3} className="px-4 py-4 text-right text-xl">
                                    إجمالي عدد الوجبات المستلمة
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className="inline-block bg-white text-[#2d5016] font-black px-6 py-2 rounded-lg text-2xl">
                                        {totalMeals}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-center text-sm">وجبة</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notes Section */}
            {delivery.notes && (
                <div className="mb-6 border-2 border-yellow-400 bg-yellow-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-yellow-800">
                        <FileText className="w-5 h-5" />
                        <h3 className="font-bold">ملاحظات إضافية</h3>
                    </div>
                    <p className="text-sm text-gray-700">{delivery.notes}</p>
                </div>
            )}

            {/* Signatures Section */}
            <div className="border-t-4 border-[#2d5016] pt-6 mt-auto">
                <div className="grid grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-3 h-24 flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="font-bold text-sm mb-1">استلم بواسطة</p>
                        <p className="text-xs text-gray-600">{delivery.receivedBy || '........................'}</p>
                        <div className="border-t border-gray-400 mt-2 pt-1">
                            <p className="text-xs text-gray-500">التوقيع والتاريخ</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-3 h-24 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="font-bold text-sm mb-1">اعتمد بواسطة</p>
                        <p className="text-xs text-gray-600">{delivery.approvedBy || '........................'}</p>
                        <div className="border-t border-gray-400 mt-2 pt-1">
                            <p className="text-xs text-gray-500">التوقيع والتاريخ</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="border-4 border-[#2d5016] rounded-lg p-6 mb-3 h-24 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white">
                            <p className="font-black text-2xl text-[#2d5016] opacity-30 rotate-12">ختم</p>
                            <p className="font-bold text-xs text-[#4a7c2c] opacity-30">رسمي</p>
                        </div>
                        <p className="font-bold text-sm mb-1">الختم الرسمي</p>
                        <p className="text-xs text-gray-600">Forest Edge</p>
                        <div className="border-t border-gray-400 mt-2 pt-1">
                            <p className="text-xs text-gray-500">ختم الشركة</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-300 text-center">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                    هذا المستند رسمي ومعتمد للاستخدام في عمليات الجرد والتدقيق المالي والإداري
                    <br />
                    تم الإنشاء آلياً عبر نظام Forest Edge لإدارة التموين والإعاشة - جميع الحقوق محفوظة © 2024
                </p>
            </div>
        </div>
    );
};

export default MealReport;
