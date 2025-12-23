import { ProductStatus, Language } from '../types';
import { ProductDB } from '../services/storage';

export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const generateSKU = (categoryCode: string, subcategoryCode: string, spec?: string): string => {
    const products = ProductDB.getAll();
    let baseSku = `${categoryCode}-${subcategoryCode}`;
    if (spec) baseSku += `-${spec.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10)}`;
    if (!products.find(p => p.sku === baseSku)) return baseSku;
    let counter = 1;
    while (products.find(p => p.sku === `${baseSku}-${String(counter).padStart(2, '0')}`)) counter++;
    return `${baseSku}-${String(counter).padStart(2, '0')}`;
};

export const calculateStatus = (quantity: number, minQuantity: number): ProductStatus => {
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= minQuantity) return 'low_stock';
    return 'active';
};

export const exportToCSV = (products: any[], lang: Language) => {
    const headers = lang === 'ar'
        ? ['SKU', 'الاسم', 'الفئة', 'الكمية', 'الوحدة', 'الحالة', 'الموقع']
        : ['SKU', 'Name', 'Category', 'Quantity', 'Unit', 'Status', 'Location'];
    const rows = products.map(p => [
        p.sku, lang === 'ar' ? p.nameAr : p.nameEn, p.categoryCode,
        p.quantity, p.unit, p.status, p.location || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prostock-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
};

