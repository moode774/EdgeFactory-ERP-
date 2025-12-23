import React, { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import { Product, Language } from '../../types';
import { CATEGORIES, UNITS } from '../../constants/data';
import { generateSKU } from '../../utils/helpers';

const ProductModal = ({ isOpen, onClose, lang, onSave, editProduct }: any) => {
    const [form, setForm] = useState<{
        nameAr: string; nameEn: string; categoryCode: string; subcategoryCode: string;
        quantity: number | string; minQuantity: number | string; maxQuantity: number | string; unit: string;
        costPrice: number | string; sellingPrice: number | string;
        dimensionLength: number | string; dimensionWidth: number | string; dimensionHeight: number | string; dimensionThickness: number | string;
        location: string;
        batchNumber: string; expiryDate: string; barcode: string; referenceNumber: string;
        notes: string; images: string[];
    }>({
        nameAr: '', nameEn: '', categoryCode: 'WD', subcategoryCode: '',
        quantity: '', minQuantity: 10, maxQuantity: '', unit: 'pcs',
        costPrice: '', sellingPrice: '',
        dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionThickness: '',
        location: '',
        batchNumber: '', expiryDate: '', barcode: '', referenceNumber: '',
        notes: '', images: []
    });
    const [sku, setSku] = useState('');

    useEffect(() => {
        if (editProduct) {
            setForm({
                nameAr: editProduct.nameAr, nameEn: editProduct.nameEn,
                categoryCode: editProduct.categoryCode, subcategoryCode: editProduct.subcategoryCode,
                quantity: editProduct.quantity, minQuantity: editProduct.minQuantity,
                maxQuantity: editProduct.maxQuantity || 0,
                unit: editProduct.unit,
                costPrice: editProduct.costPrice || 0, sellingPrice: editProduct.sellingPrice || 0,
                dimensionLength: editProduct.dimensionLength || '', dimensionWidth: editProduct.dimensionWidth || '',
                dimensionHeight: editProduct.dimensionHeight || '', dimensionThickness: editProduct.dimensionThickness || '',
                location: editProduct.location || '',
                batchNumber: editProduct.batchNumber || '', expiryDate: editProduct.expiryDate || '',
                barcode: editProduct.barcode || '', referenceNumber: editProduct.referenceNumber || '',
                notes: editProduct.notes || '', images: editProduct.images || []
            });
            setSku(editProduct.sku);
        } else {
            setForm({
                nameAr: '', nameEn: '', categoryCode: 'WD', subcategoryCode: '',
                quantity: '', minQuantity: 10, maxQuantity: '', unit: 'pcs',
                costPrice: '', sellingPrice: '',
                dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionThickness: '',
                location: '',
                batchNumber: '', expiryDate: '', barcode: '', referenceNumber: '',
                notes: '', images: []
            });
            setSku('');
        }
    }, [editProduct, isOpen]);


    useEffect(() => {
        if (form.categoryCode && form.subcategoryCode && !editProduct) {
            const dimString = form.dimensionLength ? `${form.dimensionLength}x${form.dimensionWidth || 0}` : '';
            setSku(generateSKU(form.categoryCode, form.subcategoryCode, dimString));
        }
    }, [form.categoryCode, form.subcategoryCode, form.dimensionLength, form.dimensionWidth, editProduct]);

    const selectedCategory = CATEGORIES.find(c => c.code === form.categoryCode);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert(lang === 'ar' ? 'حجم الصورة كبير جداً (الحد الأقصى 5MB)' : 'Image too large (max 5MB)');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setForm(prev => ({ ...prev, images: [...prev.images, base64] }));
            };
            reader.readAsDataURL(file);
        });
        e.target.value = ''; // Reset input
    };

    const removeImage = (index: number) => {
        setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg relative z-10">
                <div className="px-5 py-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">{editProduct ? (lang === 'ar' ? 'تعديل المنتج' : 'Edit Product') : (lang === 'ar' ? 'إضافة منتج' : 'Add Product')}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X size={18} /></button>
                </div>
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'الفئة' : 'Category'} *</label>
                            <select value={form.categoryCode} onChange={(e) => setForm({ ...form, categoryCode: e.target.value, subcategoryCode: '' })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                {CATEGORIES.map((cat) => <option key={cat.code} value={cat.code}>{lang === 'ar' ? cat.nameAr : cat.nameEn}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'الفئة الفرعية' : 'Subcategory'} *</label>
                            <select value={form.subcategoryCode} onChange={(e) => setForm({ ...form, subcategoryCode: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                <option value="">{lang === 'ar' ? '-- اختر --' : '-- Select --'}</option>
                                {selectedCategory?.subcategories.map((sub) => <option key={sub.code} value={sub.code}>{lang === 'ar' ? sub.nameAr : sub.nameEn}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'الاسم (عربي)' : 'Name (AR)'}</label>
                            <input type="text" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-right" dir="rtl" placeholder="اسم المنتج" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (EN)'} *</label>
                            <input type="text" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" dir="ltr" placeholder="Product Name" />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'الكمية' : 'Qty'}</label>
                            <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'الحد الأدنى' : 'Min'}</label>
                            <input type="number" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'الوحدة' : 'Unit'}</label>
                            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                {UNITS.map((u) => <option key={u.code} value={u.code}>{lang === 'ar' ? u.nameAr : u.nameEn}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'الموقع' : 'Location'}</label>
                            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="A-01" />
                        </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/50">
                        <h4 className="text-xs font-bold text-emerald-700 mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px]">$</span>
                            {lang === 'ar' ? 'التسعير' : 'Pricing'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'سعر التكلفة' : 'Cost Price'}</label>
                                <input type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'سعر البيع' : 'Selling Price'}</label>
                                <input type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
                            </div>
                        </div>
                        {Number(form.costPrice) > 0 && Number(form.sellingPrice) > 0 && (
                            <div className="mt-2 text-xs text-emerald-600">
                                {lang === 'ar' ? 'الربح: ' : 'Profit: '}
                                {(Number(form.sellingPrice) - Number(form.costPrice)).toFixed(2)} ({((Number(form.sellingPrice) - Number(form.costPrice)) / Number(form.costPrice) * 100).toFixed(1)}%)
                            </div>
                        )}
                    </div>

                    {/* Batch Tracking Section */}
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200/50">
                        <h4 className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px]">#</span>
                            {lang === 'ar' ? 'تتبع الدفعات' : 'Batch Tracking'}
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'رقم الدفعة' : 'Batch No.'}</label>
                                <input type="text" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="BTH-2024-001" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'تاريخ الصلاحية' : 'Expiry Date'}</label>
                                <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'الباركود' : 'Barcode'}</label>
                                <input type="text" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="1234567890123" />
                            </div>
                        </div>
                    </div>

                    {/* Reference Number & Dimensions Section */}
                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200/50">
                        <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px]">📐</span>
                            {lang === 'ar' ? 'الأبعاد والمقاسات' : 'Dimensions & Sizes'}
                        </h4>
                        <div className="grid grid-cols-5 gap-2">
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'كود المنتج' : 'Code'}</label>
                                <input type="text" value={form.referenceNumber} onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm" placeholder="REF-001" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'الطول (L)' : 'Length'}</label>
                                <input type="number" value={form.dimensionLength} onChange={(e) => setForm({ ...form, dimensionLength: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm" placeholder="0" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'العرض (W)' : 'Width'}</label>
                                <input type="number" value={form.dimensionWidth} onChange={(e) => setForm({ ...form, dimensionWidth: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm" placeholder="0" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'الارتفاع (H)' : 'Height'}</label>
                                <input type="number" value={form.dimensionHeight} onChange={(e) => setForm({ ...form, dimensionHeight: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm" placeholder="0" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1">{lang === 'ar' ? 'السُمك (T)' : 'Thickness'}</label>
                                <input type="number" value={form.dimensionThickness} onChange={(e) => setForm({ ...form, dimensionThickness: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm" placeholder="0" />
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <label className="text-xs font-medium text-slate-500 block mb-2">{lang === 'ar' ? 'صور المنتج' : 'Product Images'}</label>
                        <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 bg-stone-50/50 hover:border-amber-500 transition-colors duration-200">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center py-2">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                    <Camera className="text-slate-600" size={24} />
                                </div>
                                <span className="text-sm text-stone-600 font-medium">{lang === 'ar' ? 'اضغط لرفع الصور' : 'Click to upload images'}</span>
                                <span className="text-xs text-stone-400 mt-1">{lang === 'ar' ? 'PNG, JPG حتى 5MB (يمكن اختيار عدة صور)' : 'PNG, JPG up to 5MB (multiple allowed)'}</span>
                            </label>
                        </div>

                        {/* Image Previews */}
                        {form.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-4 gap-2">
                                {form.images.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img src={img} alt={`Product ${index + 1}`} className="w-full h-20 object-cover rounded-lg border border-stone-200" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md hover:bg-red-600"
                                        >
                                            <X size={12} />
                                        </button>
                                        {index === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded">{lang === 'ar' ? 'رئيسية' : 'Main'}</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${selectedCategory?.color}10`, borderColor: `${selectedCategory?.color}30`, borderWidth: 1 }}>
                        <span className="text-xs text-slate-500 block mb-1">SKU</span>
                        <span className="font-mono font-bold" style={{ color: selectedCategory?.color }}>{sku || '---'}</span>
                    </div>
                </div>
                <div className="px-5 py-4 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="px-5 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl text-sm font-medium transition-all duration-200">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                    <button onClick={() => {
                        if (!form.nameEn || !form.subcategoryCode) return alert(lang === 'ar' ? 'أكمل الحقول المطلوبة' : 'Fill required fields');
                        const dataToSave = {
                            ...form,
                            quantity: Number(form.quantity) || 0,
                            minQuantity: Number(form.minQuantity) || 0,
                            maxQuantity: Number(form.maxQuantity) || 0,
                            costPrice: Number(form.costPrice) || 0,
                            sellingPrice: Number(form.sellingPrice) || 0
                        };
                        onSave(dataToSave);
                        onClose();
                    }}
                        className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-all duration-200 shadow-md">
                        {editProduct ? (lang === 'ar' ? 'حفظ' : 'Save') : (lang === 'ar' ? 'إضافة' : 'Add')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
