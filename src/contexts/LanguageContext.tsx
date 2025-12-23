import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations: Record<Language, Record<string, any>> = {
    en: {
        // Common
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        print: 'Print',
        close: 'Close',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
        loading: 'Loading...',
        noData: 'No data available',
        view: 'View',
        download: 'Download',
        upload: 'Upload',
        refresh: 'Refresh',
        total: 'Total',
        active: 'Active',
        inactive: 'Inactive',
        all: 'All',
        name: 'Name',
        description: 'Description',
        date: 'Date',
        time: 'Time',
        createdAt: 'Created At',
        updatedAt: 'Updated At',

        // Sidebar
        dashboard: 'Dashboard',
        manufacturing: 'Manufacturing',
        inventory: 'Inventory',
        customers: 'Customers',
        suppliers: 'Suppliers',
        warehouses: 'Warehouses',
        reports: 'Reports',
        settings: 'Settings',
        quotations: 'Quotations',
        categories: 'Categories',
        mealReports: 'Meal Reports',
        employees: 'Employees',
        logout: 'Logout',
        admin: 'Admin',
        employee: 'Employee',
        notifications: 'Notifications',

        // Dashboard
        totalProducts: 'Total Products',
        inStock: 'In Stock',
        lowStock: 'Low Stock',
        outOfStock: 'Out of Stock',
        recentActivity: 'Recent Activity',
        stockOverview: 'Stock Overview',
        topCategories: 'Top Categories',
        quickActions: 'Quick Actions',
        addProduct: 'Add Product',
        viewInventory: 'View Inventory',
        generateReport: 'Generate Report',
        stockAlerts: 'Stock Alerts',
        productsLowStock: 'products are low on stock',
        productsOutOfStock: 'products are out of stock',
        viewAll: 'View All',

        // Manufacturing
        manufacturingOrder: 'Manufacturing Order',
        productionControl: 'Production Control System',
        newOrder: 'New Order',
        workOrders: 'Work Orders',
        orderNumber: 'Order Number',
        customerName: 'Customer Name',
        priority: 'Priority',
        startDate: 'Start Date',
        endDate: 'End Date',
        status: 'Status',
        actions: 'Actions',
        planned: 'Planned',
        inProgress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
        grid: 'Grid',
        list: 'List',
        summary: 'Summary',
        deleteAll: 'Delete All',
        importJSON: 'Import JSON',
        refNo: 'Ref. No.',
        woNo: 'WO No.',

        // Stepper
        details: 'DETAILS',
        products: 'PRODUCTS',
        wood: 'WOOD',
        hardware: 'HARDWARE',
        review: 'REVIEW',

        // Form Labels
        refNumber: 'Ref. No.',
        woNumber: 'WO Number',
        priorityLevel: 'Priority Level',
        jobOrderNumber: 'Job Order Number',

        // Priority
        normal: 'Normal',
        high: 'High',
        urgent: 'Urgent',
        normalPriority: 'Normal Priority',
        highPriority: 'High Priority',
        urgentCritical: 'Urgent / Critical',

        // Items
        itemsToManufacture: 'Items to Manufacture',
        itemName: 'Item Name',
        quantity: 'Qty',
        unit: 'Unit',
        dimensions: 'Dimensions',
        height: 'H',
        length: 'L',
        width: 'W',
        modelCode: 'Model',
        paintColor: 'Paint Color',
        paintCode: 'Paint Code',
        glossPercentage: 'Glossy %',
        veneer: 'Veneer',
        notes: 'Notes',

        // Materials
        woodMaterials: 'Wood Materials',
        hardwareAccessories: 'Hardware & Accessories',
        materialName: 'Material Name',
        thickness: 'Thick',

        // Buttons
        addItem: 'Add Item',
        addWood: 'Add Wood',
        addHardware: 'Add Hardware',
        pasteExcel: 'Paste Excel',
        nextStep: 'Next Step',
        back: 'Back',
        saveFinish: 'Save & Finish',
        addNew: 'Add New',
        addCustomer: 'Add Customer',
        addSupplier: 'Add Supplier',
        addWarehouse: 'Add Warehouse',

        // Units
        pcs: 'PCS',
        sheet: 'SHEET',
        set: 'SET',
        box: 'BOX',
        pkt: 'PKT',
        selectUnit: '-- Select Unit --',
        customUnit: '+ Custom',

        // Review
        orderInformation: 'Order Information',
        materialRequest: 'Material Request',
        accessories: 'ACCESSORIES',
        reviewMessage: 'Review all information above and click "Save & Finish" to complete the work order',

        // Inventory
        productName: 'Product Name',
        sku: 'SKU',
        category: 'Category',
        price: 'Price',
        stock: 'Stock',
        minStock: 'Min Stock',
        location: 'Location',
        supplier: 'Supplier',
        image: 'Image',
        productDetails: 'Product Details',
        stockStatus: 'Stock Status',
        productImage: 'Product Image',
        noImage: 'No Image',
        uploadImage: 'Upload Image',
        removeImage: 'Remove Image',

        // Customers
        customerCode: 'Customer Code',
        balance: 'Balance',
        customerDetails: 'Customer Details',
        contactInfo: 'Contact Information',
        billingAddress: 'Billing Address',
        shippingAddress: 'Shipping Address',
        customerType: 'Customer Type',
        creditLimit: 'Credit Limit',
        paymentTerms: 'Payment Terms',

        // Suppliers
        supplierCode: 'Supplier Code',
        supplierName: 'Supplier',
        supplierDetails: 'Supplier Details',
        contactPerson: 'Contact Person',
        taxNumber: 'Tax Number',
        bankAccount: 'Bank Account',
        paymentMethod: 'Payment Method',

        // Warehouses
        warehouseCode: 'Warehouse Code',
        warehouseName: 'Warehouse Name',
        warehouseDetails: 'Warehouse Details',
        capacity: 'Capacity',
        manager: 'Manager',
        city: 'City',
        country: 'Country',
        postalCode: 'Postal Code',

        // Reports
        inventoryReport: 'Inventory Report',
        salesReport: 'Sales Report',
        purchaseReport: 'Purchase Report',
        stockMovement: 'Stock Movement',
        profitLoss: 'Profit & Loss',
        exportToPDF: 'Export to PDF',
        exportToExcel: 'Export to Excel',
        reportType: 'Report Type',
        dateRange: 'Date Range',
        from: 'From',
        to: 'To',

        // Settings
        generalSettings: 'General Settings',
        userManagement: 'User Management',
        systemSettings: 'System Settings',
        backupRestore: 'Backup & Restore',
        companyInfo: 'Company Information',
        companyName: 'Company Name',
        companyLogo: 'Company Logo',
        language: 'Language',
        currency: 'Currency',
        timezone: 'Timezone',
        dateFormat: 'Date Format',
        users: 'Users',
        username: 'Username',
        password: 'Password',
        role: 'Role',
        permissions: 'Permissions',
        user: 'User',
        viewer: 'Viewer',
        createBackup: 'Create Backup',
        restoreBackup: 'Restore Backup',
        resetSystem: 'Reset System',
        confirmReset: 'Are you sure you want to reset the system? All data will be lost!',

        // Quotations
        quotationNumber: 'Quotation Number',
        quotationDate: 'Quotation Date',
        validUntil: 'Valid Until',
        quotationDetails: 'Quotation Details',
        items: 'Items',
        subtotal: 'Subtotal',
        tax: 'Tax',
        discount: 'Discount',
        grandTotal: 'Grand Total',
        terms: 'Terms & Conditions',
        draft: 'Draft',
        sent: 'Sent',
        accepted: 'Accepted',
        rejected: 'Rejected',

        // Categories
        categoryName: 'Category Name',
        categoryCode: 'Category Code',
        subcategory: 'Subcategory',
        productCount: 'Product Count',
        categoryDetails: 'Category Details',

        // Placeholders
        searchCustomer: 'Search or enter customer...',
        enterItemName: 'Item name...',
        enterMaterialName: 'Material name...',
        enterNotes: 'Notes...',
        customUnitPlaceholder: 'Custom unit...',
        searchProducts: 'Search products...',
        searchCustomers: 'Search customers...',
        searchSuppliers: 'Search suppliers...',
        enterProductName: 'Enter product name...',
        enterSKU: 'Enter SKU...',
        enterPrice: 'Enter price...',
        enterQuantity: 'Enter quantity...',
        selectCategory: 'Select category...',
        selectSupplier: 'Select supplier...',
        selectWarehouse: 'Select warehouse...',

        // Messages
        deleteConfirm: 'Are you sure you want to delete this item?',
        saveSuccess: 'Saved successfully!',
        deleteSuccess: 'Deleted successfully!',
        updateSuccess: 'Updated successfully!',
        errorOccurred: 'An error occurred. Please try again.',
        noResultsFound: 'No results found',
        requiredField: 'This field is required',
    },
    ar: {
        // Common
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        add: 'إضافة',
        search: 'بحث',
        filter: 'تصفية',
        export: 'تصدير',
        import: 'استيراد',
        print: 'طباعة',
        close: 'إغلاق',
        confirm: 'تأكيد',
        yes: 'نعم',
        no: 'لا',
        loading: 'جاري التحميل...',
        noData: 'لا توجد بيانات',
        view: 'عرض',
        download: 'تحميل',
        upload: 'رفع',
        refresh: 'تحديث',
        total: 'الإجمالي',
        active: 'نشط',
        inactive: 'غير نشط',
        all: 'الكل',
        name: 'الاسم',
        description: 'الوصف',
        date: 'التاريخ',
        time: 'الوقت',
        createdAt: 'تاريخ الإنشاء',
        updatedAt: 'تاريخ التحديث',

        // Sidebar
        dashboard: 'لوحة التحكم',
        manufacturing: 'التصنيع',
        inventory: 'المخزون',
        customers: 'العملاء',
        suppliers: 'الموردين',
        warehouses: 'المستودعات',
        reports: 'التقارير',
        settings: 'الإعدادات',
        quotations: 'عروض الأسعار',
        categories: 'الفئات',
        mealReports: 'تقارير الوجبات',
        employees: 'الموظفين',
        logout: 'تسجيل الخروج',
        admin: 'مدير',
        employee: 'موظف',
        notifications: 'الإشعارات',

        // Dashboard
        totalProducts: 'إجمالي المنتجات',
        inStock: 'متوفر',
        lowStock: 'مخزون منخفض',
        outOfStock: 'نفذ من المخزون',
        recentActivity: 'النشاط الأخير',
        stockOverview: 'نظرة عامة على المخزون',
        topCategories: 'أهم الفئات',
        quickActions: 'إجراءات سريعة',
        addProduct: 'إضافة منتج',
        viewInventory: 'عرض المخزون',
        generateReport: 'إنشاء تقرير',
        stockAlerts: 'تنبيهات المخزون',
        productsLowStock: 'منتجات منخفضة المخزون',
        productsOutOfStock: 'منتجات نفذت من المخزون',
        viewAll: 'عرض الكل',

        // Manufacturing
        manufacturingOrder: 'أمر تصنيع',
        productionControl: 'نظام التحكم بالإنتاج',
        newOrder: 'أمر جديد',
        workOrders: 'أوامر العمل',
        orderNumber: 'رقم الأمر',
        customerName: 'اسم العميل',
        priority: 'الأولوية',
        startDate: 'تاريخ البدء',
        endDate: 'تاريخ الانتهاء',
        status: 'الحالة',
        actions: 'الإجراءات',
        planned: 'مخطط',
        inProgress: 'قيد التنفيذ',
        completed: 'مكتمل',
        cancelled: 'ملغي',
        grid: 'شبكة',
        list: 'قائمة',
        summary: 'ملخص',
        deleteAll: 'حذف الكل',
        importJSON: 'استيراد JSON',
        refNo: 'رقم مرجعي',
        woNo: 'رقم الأمر',

        // Stepper
        details: 'التفاصيل',
        products: 'المنتجات',
        wood: 'الخشب',
        hardware: 'الإكسسوارات',
        review: 'المراجعة',

        // Form Labels
        refNumber: 'رقم المرجع',
        woNumber: 'رقم أمر العمل',
        priorityLevel: 'مستوى الأولوية',
        jobOrderNumber: 'رقم أمر الوظيفة',

        // Priority
        normal: 'عادي',
        high: 'عالي',
        urgent: 'عاجل',
        normalPriority: 'أولوية عادية',
        highPriority: 'أولوية عالية',
        urgentCritical: 'عاجل / حرج',

        // Items
        itemsToManufacture: 'الأصناف المراد تصنيعها',
        itemName: 'اسم الصنف',
        quantity: 'الكمية',
        unit: 'الوحدة',
        dimensions: 'الأبعاد',
        height: 'ع',
        length: 'ط',
        width: 'ض',
        modelCode: 'الموديل',
        paintColor: 'لون الدهان',
        paintCode: 'كود الدهان',
        glossPercentage: 'نسبة اللمعان',
        veneer: 'القشرة',
        notes: 'ملاحظات',

        // Materials
        woodMaterials: 'المواد الخشبية',
        hardwareAccessories: 'الإكسسوارات والعدد',
        materialName: 'اسم المادة',
        thickness: 'السماكة',

        // Buttons
        addItem: 'إضافة صنف',
        addWood: 'إضافة خشب',
        addHardware: 'إضافة إكسسوار',
        pasteExcel: 'لصق من إكسل',
        nextStep: 'الخطوة التالية',
        back: 'رجوع',
        saveFinish: 'حفظ وإنهاء',
        addNew: 'إضافة جديد',
        addCustomer: 'إضافة عميل',
        addSupplier: 'إضافة مورد',
        addWarehouse: 'إضافة مستودع',

        // Units
        pcs: 'قطعة',
        sheet: 'لوح',
        set: 'طقم',
        box: 'صندوق',
        pkt: 'حزمة',
        selectUnit: '-- اختر الوحدة --',
        customUnit: '+ وحدة مخصصة',

        // Review
        orderInformation: 'معلومات الأمر',
        materialRequest: 'طلب المواد',
        accessories: 'الإكسسوارات',
        reviewMessage: 'راجع جميع المعلومات أعلاه واضغط "حفظ وإنهاء" لإكمال أمر العمل',

        // Inventory
        productName: 'اسم المنتج',
        sku: 'رمز المنتج',
        category: 'الفئة',
        price: 'السعر',
        stock: 'المخزون',
        minStock: 'الحد الأدنى',
        location: 'الموقع',
        supplier: 'المورد',
        image: 'الصورة',
        productDetails: 'تفاصيل المنتج',
        stockStatus: 'حالة المخزون',
        productImage: 'صورة المنتج',
        noImage: 'لا توجد صورة',
        uploadImage: 'رفع صورة',
        removeImage: 'إزالة الصورة',

        // Customers
        customerCode: 'كود العميل',
        phone: 'الهاتف',
        email: 'البريد الإلكتروني',
        address: 'العنوان',
        balance: 'الرصيد',
        customerDetails: 'تفاصيل العميل',
        contactInfo: 'معلومات الاتصال',
        billingAddress: 'عنوان الفواتير',
        shippingAddress: 'عنوان الشحن',
        customerType: 'نوع العميل',
        creditLimit: 'حد الائتمان',
        paymentTerms: 'شروط الدفع',

        // Suppliers
        supplierCode: 'كود المورد',
        supplierName: 'اسم المورد',
        supplierDetails: 'تفاصيل المورد',
        contactPerson: 'الشخص المسؤول',
        taxNumber: 'الرقم الضريبي',
        bankAccount: 'الحساب البنكي',
        paymentMethod: 'طريقة الدفع',

        // Warehouses
        warehouseCode: 'كود المستودع',
        warehouseName: 'اسم المستودع',
        warehouseDetails: 'تفاصيل المستودع',
        capacity: 'السعة',
        manager: 'المدير',
        city: 'المدينة',
        country: 'الدولة',
        postalCode: 'الرمز البريدي',

        // Reports
        inventoryReport: 'تقرير المخزون',
        salesReport: 'تقرير المبيعات',
        purchaseReport: 'تقرير المشتريات',
        stockMovement: 'حركة المخزون',
        profitLoss: 'الأرباح والخسائر',
        exportToPDF: 'تصدير إلى PDF',
        exportToExcel: 'تصدير إلى Excel',
        reportType: 'نوع التقرير',
        dateRange: 'الفترة الزمنية',
        from: 'من',
        to: 'إلى',

        // Settings
        generalSettings: 'الإعدادات العامة',
        userManagement: 'إدارة المستخدمين',
        systemSettings: 'إعدادات النظام',
        backupRestore: 'النسخ الاحتياطي والاستعادة',
        companyInfo: 'معلومات الشركة',
        companyName: 'اسم الشركة',
        companyLogo: 'شعار الشركة',
        language: 'اللغة',
        currency: 'العملة',
        timezone: 'المنطقة الزمنية',
        dateFormat: 'تنسيق التاريخ',
        users: 'المستخدمون',
        username: 'اسم المستخدم',
        password: 'كلمة المرور',
        role: 'الدور',
        permissions: 'الصلاحيات',
        user: 'مستخدم',
        viewer: 'مشاهد',
        createBackup: 'إنشاء نسخة احتياطية',
        restoreBackup: 'استعادة نسخة احتياطية',
        resetSystem: 'إعادة تعيين النظام',
        confirmReset: 'هل أنت متأكد من إعادة تعيين النظام؟ سيتم فقدان جميع البيانات!',

        // Quotations
        quotationNumber: 'رقم عرض السعر',
        quotationDate: 'تاريخ العرض',
        validUntil: 'صالح حتى',
        quotationDetails: 'تفاصيل عرض السعر',
        items: 'الأصناف',
        subtotal: 'المجموع الفرعي',
        tax: 'الضريبة',
        discount: 'الخصم',
        grandTotal: 'الإجمالي الكلي',
        terms: 'الشروط والأحكام',
        draft: 'مسودة',
        sent: 'مرسل',
        accepted: 'مقبول',
        rejected: 'مرفوض',

        // Categories
        categoryName: 'اسم الفئة',
        categoryCode: 'كود الفئة',
        subcategory: 'فئة فرعية',
        productCount: 'عدد المنتجات',
        categoryDetails: 'تفاصيل الفئة',

        // Placeholders
        searchCustomer: 'ابحث أو أدخل اسم العميل...',
        enterItemName: 'اسم الصنف...',
        enterMaterialName: 'اسم المادة...',
        enterNotes: 'ملاحظات...',
        customUnitPlaceholder: 'وحدة مخصصة...',
        searchProducts: 'ابحث عن المنتجات...',
        searchCustomers: 'ابحث عن العملاء...',
        searchSuppliers: 'ابحث عن الموردين...',
        enterProductName: 'أدخل اسم المنتج...',
        enterSKU: 'أدخل رمز المنتج...',
        enterPrice: 'أدخل السعر...',
        enterQuantity: 'أدخل الكمية...',
        selectCategory: 'اختر الفئة...',
        selectSupplier: 'اختر المورد...',
        selectWarehouse: 'اختر المستودع...',

        // Messages
        deleteConfirm: 'هل أنت متأكد من حذف هذا العنصر؟',
        saveSuccess: 'تم الحفظ بنجاح!',
        deleteSuccess: 'تم الحذف بنجاح!',
        updateSuccess: 'تم التحديث بنجاح!',
        errorOccurred: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
        noResultsFound: 'لم يتم العثور على نتائج',
        requiredField: 'هذا الحقل مطلوب',
    }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        return (saved === 'ar' || saved === 'en') ? saved : 'en';
    });

    const isRTL = language === 'ar';

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }, [language, isRTL]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            value = value?.[k];
        }

        return typeof value === 'string' ? value : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};
