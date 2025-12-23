export type Language = 'ar' | 'en';
export type ProductStatus = 'active' | 'low_stock' | 'out_of_stock';
export type UserRole = 'admin' | 'employee';

// واجهة المستخدم
export interface User {
    id: string;
    username: string;
    password: string; // محلي - بدون تشفير
    nameAr: string;
    nameEn: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
}

// حالة المصادقة
export interface AuthState {
    isLoggedIn: boolean;
    currentUser: User | null;
}

export interface Warehouse {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
    address?: string;
    isDefault: boolean;
}

export interface Product {
    id: string;
    sku: string;
    nameAr: string;
    nameEn: string;
    categoryCode: string;
    subcategoryCode: string;
    quantity: number;
    minQuantity: number;
    maxQuantity?: number;
    unit: string;
    costPrice: number;
    sellingPrice: number;
    dimensions?: string;
    dimensionLength?: number; // الطول
    dimensionWidth?: number;  // العرض  
    dimensionHeight?: number; // الارتفاع
    dimensionThickness?: number; // السُمك
    location?: string;
    warehouseId?: string;
    batchNumber?: string;
    expiryDate?: string;
    barcode?: string;
    referenceNumber?: string; // كود المنتج / رقم المرجع
    notes?: string;
    images?: string[]; // Base64 encoded images
    status: ProductStatus;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    code: string;
    nameAr: string;
    nameEn: string;
    color: string;
    icon: string;
    subcategories: { code: string; nameAr: string; nameEn: string; }[];
}

export interface ActivityLog {
    id: string;
    action: 'add' | 'update' | 'delete';
    productName: string;
    timestamp: string;
}

// واجهة العميل
export interface Customer {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
    type: 'individual' | 'company';
    phone: string;
    email?: string;
    address?: string;
    balance: number;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// واجهة المورد
export interface Supplier {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    address?: string;
    balance: number;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// واجهة أمر البيع
export interface SalesOrder {
    id: string;
    orderNumber: string;
    customerId: string;
    customerName?: string;
    date: string;
    status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
    items: SalesOrderItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paidAmount: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SalesOrderItem {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

// واجهة أمر الشراء
export interface PurchaseOrder {
    id: string;
    orderNumber: string;
    supplierId: string;
    supplierName?: string;
    date: string;
    status: 'draft' | 'pending' | 'received' | 'cancelled';
    items: PurchaseOrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    paidAmount: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PurchaseOrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    total: number;
}

// واجهة المصروفات
export interface Expense {
    id: string;
    category: 'rent' | 'utilities' | 'salaries' | 'supplies' | 'maintenance' | 'other';
    amount: number;
    description: string;
    date: string;
    paymentMethod: 'cash' | 'bank' | 'card';
    reference?: string;
    notes?: string;
    createdAt: string;
}

// واجهة حركات المخزون | Inventory Movement Interface
export type MovementType = 'sale' | 'purchase' | 'adjustment' | 'return_sale' | 'return_purchase' | 'transfer';

export interface InventoryMovement {
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    type: MovementType;
    quantity: number; // موجب للإضافة، سالب للخصم
    quantityBefore: number;
    quantityAfter: number;
    referenceType: 'sales_order' | 'purchase_order' | 'manual' | 'adjustment';
    referenceId?: string;
    referenceNumber?: string;
    notes?: string;
    createdBy?: string;
    createdAt: string;
}

// واجهة الفاتورة | Invoice Interface
export type InvoiceType = 'sales' | 'purchase';
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'partial' | 'cancelled';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    type: InvoiceType;
    orderId: string;
    orderNumber: string;
    customerId?: string;
    customerName?: string;
    supplierId?: string;
    supplierName?: string;
    items: any[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paidAmount: number;
    dueDate?: string;
    status: InvoiceStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// واجهة المدفوعات | Payment Interface
export type PaymentMethod = 'cash' | 'bank' | 'card' | 'check';

export interface Payment {
    id: string;
    paymentNumber: string;
    type: 'income' | 'expense';
    invoiceId?: string;
    invoiceNumber?: string;
    customerId?: string;
    customerName?: string;
    supplierId?: string;
    supplierName?: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
    date: string;
    createdAt: string;
}

// واجهة حركات الصندوق | Cash Transaction Interface
export interface CashTransaction {
    id: string;
    transactionNumber: string;
    type: 'in' | 'out';
    category: 'sale' | 'purchase' | 'expense' | 'salary' | 'other';
    amount: number;
    description: string;
    paymentId?: string;
    reference?: string;
    balance: number; // الرصيد بعد العملية
    date: string;
    createdAt: string;
}

// واجهة عرض السعر | Quotation Interface
export interface Quotation {
    id: string;
    quotationNumber: string;
    customerId?: string; // اختياري لعميل جديد غير مسجل
    customerName: string;
    date: string;
    validUntil: string;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
    items: SalesOrderItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// واجهة قائمة المواد | Bill of Materials (BOM) Interface
export interface BOMItem {
    productId: string; // المادة الخام
    productName: string; // اسم المادة لتسهيل العرض
    quantity: number; // الكمية المطلوبة
    unitCost: number; // التكلفة الحالية
    totalCost: number;
}

export interface BOM {
    id: string;
    name: string; // اسم التركيبة
    productId: string; // المنتج النهائي الذي يتم تصنيعه
    productName: string;
    components: BOMItem[];
    laborCost: number; // تكلفة العمالة
    overheadCost: number; // تكاليف تشغيلية إضافية
    totalCost: number; // إجمالي تكلفة التصنيع
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// واجهة عنصر أمر العمل | Work Order Item Interface
export interface WorkOrderItem {
    id: string;
    productId?: string;
    itemName: string;         // اسم المنتج/العنصر
    quantity: number;
    unit: string;
    dimensionMode?: 'numeric' | 'text'; // وضع المقاسات: أرقام (3 حقول) أو نص (حقل واحد)
    dimensions?: {
        width?: number | string;   // يمكن أن يكون رقم أو نص مثل "AS PER SHOP DRAWING"
        length?: number | string;
        height?: number | string;
    };
    modelCode?: string;       // كود الموديل
    paintColor?: string;      // لون الدهان
    paintCode?: string;       // كود الدهان
    glossPercentage?: number | string; // نسبة اللمعان - يمكن أن تكون رقم أو نص فارغ
    veneer?: string;          // القشرة
    notes?: string;
}

// واجهة طلب المواد | Material Request Interface
export interface MaterialRequest {
    id: string;
    productId?: string; // Optional - manual materials won't have productId
    productName: string;
    quantity: number;
    unit: string;
    size?: {
        width?: number;
        length?: number;
        thickness?: number;
    };
    category?: 'wood' | 'accessories' | 'other';
    isManual?: boolean; // Track if material was added manually or from database
    notes?: string; // Additional notes for manual materials
}

// واجهة أمر العمل | Work Order Interface
export interface WorkOrder {
    id: string;
    orderNumber: string;          // رقم أمر العمل P04222
    jobOrderNumber: string;       // رقم طلب العمل 25-00060
    jobOrderDate: string;         // تاريخ الطلب
    customerId?: string;
    customerName: string;         // اسم العميل
    startDate: string;
    endDate?: string;
    priority: 'normal' | 'high' | 'very_high' | 'urgent';
    items: WorkOrderItem[];       // المنتجات المطلوب تصنيعها
    materials: MaterialRequest[]; // قائمة المواد المطلوب صرفها
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    preparedBy?: string;          // أعده
    receivedBy?: string;          // استلمه
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
