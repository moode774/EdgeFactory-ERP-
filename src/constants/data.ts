import { Category } from '../types';

export const CATEGORIES: Category[] = [
    {
        code: 'WD', nameAr: 'الأخشاب واللوحات', nameEn: 'Wood & Panels',
        color: '#5F6266', icon: 'layers',
        subcategories: [
            { code: 'MDF', nameAr: 'ألواح MDF', nameEn: 'MDF Boards' },
            { code: 'PLY', nameAr: 'خشب رقائقي', nameEn: 'Plywood' },
            { code: 'NAT', nameAr: 'خشب طبيعي', nameEn: 'Natural Wood' },
            { code: 'FOR', nameAr: 'فورمايكا / قشرة', nameEn: 'Formica / Veneer' },
            { code: 'PRT', nameAr: 'خشب حبيبي', nameEn: 'Particle Board' },
            { code: 'MLM', nameAr: 'ميلامين', nameEn: 'Melamine' },
        ]
    },
    {
        code: 'HW', nameAr: 'إكسسوارات وقطع معدنية', nameEn: 'Hardware',
        color: '#A5A9AE', icon: 'settings',
        subcategories: [
            { code: 'HND', nameAr: 'مقابض', nameEn: 'Handles' },
            { code: 'HNG', nameAr: 'مفصلات', nameEn: 'Hinges' },
            { code: 'DRS', nameAr: 'سكك أدراج', nameEn: 'Drawer Slides' },
            { code: 'SCR', nameAr: 'براغي ومسامير', nameEn: 'Screws & Bolts' },
            { code: 'LCK', nameAr: 'أقفال', nameEn: 'Locks' },
            { code: 'BRK', nameAr: 'زوايا وكتائف', nameEn: 'Brackets & Corners' },
        ]
    },
    {
        code: 'EB', nameAr: 'شرائط الحواف', nameEn: 'Edgeband',
        color: '#888C91', icon: 'minus',
        subcategories: [
            { code: 'PVC', nameAr: 'شريط PVC', nameEn: 'PVC Tape' },
            { code: 'WVT', nameAr: 'شريط قشرة خشب', nameEn: 'Wood Veneer Tape' },
            { code: 'HGT', nameAr: 'شريط لامع', nameEn: 'High Gloss Tape' },
            { code: 'ABS', nameAr: 'شريط ABS', nameEn: 'ABS Tape' },
            { code: 'ACR', nameAr: 'شريط أكريليك', nameEn: 'Acrylic Tape' },
        ]
    },
    {
        code: 'TB', nameAr: 'أدوات ومعدات قص', nameEn: 'Tools & Blades',
        color: '#181B1E', icon: 'tool',
        subcategories: [
            { code: 'SAW', nameAr: 'شفرات منشار', nameEn: 'Saw Blades' },
            { code: 'DRL', nameAr: 'ريشة ثقب', nameEn: 'Drill Bits' },
            { code: 'RTR', nameAr: 'ريشة راوتر', nameEn: 'Router Bits' },
            { code: 'SND', nameAr: 'أقراص صنفرة', nameEn: 'Sanding Discs' },
            { code: 'MSR', nameAr: 'أدوات قياس', nameEn: 'Measuring Tools' },
        ]
    },
    {
        code: 'CN', nameAr: 'مواد استهلاكية', nameEn: 'Consumables',
        color: '#CFD1D4', icon: 'droplet',
        subcategories: [
            { code: 'GLU', nameAr: 'غراء ولواصق', nameEn: 'Glue & Adhesives' },
            { code: 'PNT', nameAr: 'دهانات ومخففات', nameEn: 'Paints & Thinner' },
            { code: 'SDP', nameAr: 'ورق صنفرة', nameEn: 'Sandpaper' },
            { code: 'CLN', nameAr: 'مواد تنظيف', nameEn: 'Cleaning Materials' },
            { code: 'FIL', nameAr: 'معجون وحشو', nameEn: 'Filler & Putty' },
        ]
    },
    {
        code: 'FR', nameAr: 'منتجات تامة الصنع', nameEn: 'Furniture',
        color: '#4B4D50', icon: 'box',
        subcategories: [
            { code: 'TBC', nameAr: 'طاولات وكراسي', nameEn: 'Tables & Chairs' },
            { code: 'CAB', nameAr: 'خزائن ومطابخ', nameEn: 'Cabinets & Kitchen Units' },
            { code: 'BED', nameAr: 'غرف نوم', nameEn: 'Bedroom Furniture' },
            { code: 'OFC', nameAr: 'أثاث مكتبي', nameEn: 'Office Furniture' },
            { code: 'RDY', nameAr: 'منتجات جاهزة', nameEn: 'Readymade Products' },
        ]
    }
];

export const UNITS = [
    { code: 'pcs', nameAr: 'قطعة', nameEn: 'Pieces' },
    { code: 'sheet', nameAr: 'لوح', nameEn: 'Sheet' },
    { code: 'kg', nameAr: 'كيلوغرام', nameEn: 'Kilogram' },
    { code: 'roll', nameAr: 'رول', nameEn: 'Roll' },
    { code: 'set', nameAr: 'طقم', nameEn: 'Set' },
    { code: 'meter', nameAr: 'متر', nameEn: 'Meter' },
    { code: 'box', nameAr: 'صندوق', nameEn: 'Box' },
    { code: 'drum', nameAr: 'برميل', nameEn: 'Drum' },
];
