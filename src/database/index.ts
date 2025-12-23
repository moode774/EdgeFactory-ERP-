// ============================================
// قاعدة البيانات المحلية - Forest Edge Factory ERP
// Local Database - IndexedDB Implementation
// ============================================

const DB_NAME = 'ForestEdgeFactoryDB';
const DB_VERSION = 1;

// أسماء المتاجر (الجداول)
export const STORES = {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    CUSTOMERS: 'customers',
    SUPPLIERS: 'suppliers',
    WAREHOUSES: 'warehouses',
    INVENTORY_MOVEMENTS: 'inventoryMovements',
    SALES_ORDERS: 'salesOrders',
    SALES_ORDER_ITEMS: 'salesOrderItems',
    PURCHASE_ORDERS: 'purchaseOrders',
    PURCHASE_ORDER_ITEMS: 'purchaseOrderItems',
    QUOTATIONS: 'quotations',
    INVOICES: 'invoices',
    PAYMENTS: 'payments',
    WORK_ORDERS: 'workOrders',
    BOM: 'billOfMaterials',
    EXPENSES: 'expenses',
    CASH_TRANSACTIONS: 'cashTransactions',
    ACTIVITY_LOGS: 'activityLogs',
    SETTINGS: 'settings',
};

let db: IDBDatabase | null = null;

// ============================================
// تهيئة قاعدة البيانات
// ============================================

export const initDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error('فشل في فتح قاعدة البيانات'));
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            // =====================
            // المنتجات | Products
            // =====================
            if (!database.objectStoreNames.contains(STORES.PRODUCTS)) {
                const productsStore = database.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
                productsStore.createIndex('sku', 'sku', { unique: true });
                productsStore.createIndex('categoryCode', 'categoryCode', { unique: false });
                productsStore.createIndex('status', 'status', { unique: false });
                productsStore.createIndex('warehouseId', 'warehouseId', { unique: false });
            }

            // =====================
            // الفئات | Categories
            // =====================
            if (!database.objectStoreNames.contains(STORES.CATEGORIES)) {
                const categoriesStore = database.createObjectStore(STORES.CATEGORIES, { keyPath: 'code' });
                categoriesStore.createIndex('parentCode', 'parentCode', { unique: false });
            }

            // =====================
            // العملاء | Customers
            // =====================
            if (!database.objectStoreNames.contains(STORES.CUSTOMERS)) {
                const customersStore = database.createObjectStore(STORES.CUSTOMERS, { keyPath: 'id' });
                customersStore.createIndex('code', 'code', { unique: true });
                customersStore.createIndex('phone', 'phone', { unique: false });
                customersStore.createIndex('email', 'email', { unique: false });
                customersStore.createIndex('type', 'type', { unique: false });
            }

            // =====================
            // الموردين | Suppliers
            // =====================
            if (!database.objectStoreNames.contains(STORES.SUPPLIERS)) {
                const suppliersStore = database.createObjectStore(STORES.SUPPLIERS, { keyPath: 'id' });
                suppliersStore.createIndex('code', 'code', { unique: true });
                suppliersStore.createIndex('phone', 'phone', { unique: false });
            }

            // =====================
            // المستودعات | Warehouses
            // =====================
            if (!database.objectStoreNames.contains(STORES.WAREHOUSES)) {
                const warehousesStore = database.createObjectStore(STORES.WAREHOUSES, { keyPath: 'id' });
                warehousesStore.createIndex('code', 'code', { unique: true });
                warehousesStore.createIndex('isDefault', 'isDefault', { unique: false });
            }

            // =====================
            // حركات المخزون | Inventory Movements
            // =====================
            if (!database.objectStoreNames.contains(STORES.INVENTORY_MOVEMENTS)) {
                const movementsStore = database.createObjectStore(STORES.INVENTORY_MOVEMENTS, { keyPath: 'id' });
                movementsStore.createIndex('productId', 'productId', { unique: false });
                movementsStore.createIndex('warehouseId', 'warehouseId', { unique: false });
                movementsStore.createIndex('type', 'type', { unique: false });
                movementsStore.createIndex('date', 'date', { unique: false });
                movementsStore.createIndex('referenceType', 'referenceType', { unique: false });
            }

            // =====================
            // أوامر البيع | Sales Orders
            // =====================
            if (!database.objectStoreNames.contains(STORES.SALES_ORDERS)) {
                const salesStore = database.createObjectStore(STORES.SALES_ORDERS, { keyPath: 'id' });
                salesStore.createIndex('orderNumber', 'orderNumber', { unique: true });
                salesStore.createIndex('customerId', 'customerId', { unique: false });
                salesStore.createIndex('status', 'status', { unique: false });
                salesStore.createIndex('date', 'date', { unique: false });
            }

            // =====================
            // تفاصيل أوامر البيع | Sales Order Items
            // =====================
            if (!database.objectStoreNames.contains(STORES.SALES_ORDER_ITEMS)) {
                const salesItemsStore = database.createObjectStore(STORES.SALES_ORDER_ITEMS, { keyPath: 'id' });
                salesItemsStore.createIndex('orderId', 'orderId', { unique: false });
                salesItemsStore.createIndex('productId', 'productId', { unique: false });
            }

            // =====================
            // أوامر الشراء | Purchase Orders
            // =====================
            if (!database.objectStoreNames.contains(STORES.PURCHASE_ORDERS)) {
                const purchaseStore = database.createObjectStore(STORES.PURCHASE_ORDERS, { keyPath: 'id' });
                purchaseStore.createIndex('orderNumber', 'orderNumber', { unique: true });
                purchaseStore.createIndex('supplierId', 'supplierId', { unique: false });
                purchaseStore.createIndex('status', 'status', { unique: false });
                purchaseStore.createIndex('date', 'date', { unique: false });
            }

            // =====================
            // تفاصيل أوامر الشراء | Purchase Order Items
            // =====================
            if (!database.objectStoreNames.contains(STORES.PURCHASE_ORDER_ITEMS)) {
                const purchaseItemsStore = database.createObjectStore(STORES.PURCHASE_ORDER_ITEMS, { keyPath: 'id' });
                purchaseItemsStore.createIndex('orderId', 'orderId', { unique: false });
                purchaseItemsStore.createIndex('productId', 'productId', { unique: false });
            }

            // =====================
            // عروض الأسعار | Quotations
            // =====================
            if (!database.objectStoreNames.contains(STORES.QUOTATIONS)) {
                const quotationsStore = database.createObjectStore(STORES.QUOTATIONS, { keyPath: 'id' });
                quotationsStore.createIndex('quotationNumber', 'quotationNumber', { unique: true });
                quotationsStore.createIndex('customerId', 'customerId', { unique: false });
                quotationsStore.createIndex('status', 'status', { unique: false });
            }

            // =====================
            // الفواتير | Invoices
            // =====================
            if (!database.objectStoreNames.contains(STORES.INVOICES)) {
                const invoicesStore = database.createObjectStore(STORES.INVOICES, { keyPath: 'id' });
                invoicesStore.createIndex('invoiceNumber', 'invoiceNumber', { unique: true });
                invoicesStore.createIndex('type', 'type', { unique: false }); // sales, purchase
                invoicesStore.createIndex('customerId', 'customerId', { unique: false });
                invoicesStore.createIndex('supplierId', 'supplierId', { unique: false });
                invoicesStore.createIndex('status', 'status', { unique: false });
                invoicesStore.createIndex('date', 'date', { unique: false });
            }

            // =====================
            // المدفوعات | Payments
            // =====================
            if (!database.objectStoreNames.contains(STORES.PAYMENTS)) {
                const paymentsStore = database.createObjectStore(STORES.PAYMENTS, { keyPath: 'id' });
                paymentsStore.createIndex('invoiceId', 'invoiceId', { unique: false });
                paymentsStore.createIndex('type', 'type', { unique: false }); // income, expense
                paymentsStore.createIndex('method', 'method', { unique: false }); // cash, bank, check
                paymentsStore.createIndex('date', 'date', { unique: false });
            }

            // =====================
            // أوامر العمل | Work Orders
            // =====================
            if (!database.objectStoreNames.contains(STORES.WORK_ORDERS)) {
                const workOrdersStore = database.createObjectStore(STORES.WORK_ORDERS, { keyPath: 'id' });
                workOrdersStore.createIndex('orderNumber', 'orderNumber', { unique: true });
                workOrdersStore.createIndex('productId', 'productId', { unique: false });
                workOrdersStore.createIndex('status', 'status', { unique: false });
                workOrdersStore.createIndex('startDate', 'startDate', { unique: false });
            }

            // =====================
            // قائمة المواد | Bill of Materials
            // =====================
            if (!database.objectStoreNames.contains(STORES.BOM)) {
                const bomStore = database.createObjectStore(STORES.BOM, { keyPath: 'id' });
                bomStore.createIndex('productId', 'productId', { unique: false });
                bomStore.createIndex('componentId', 'componentId', { unique: false });
            }

            // =====================
            // المصروفات | Expenses
            // =====================
            if (!database.objectStoreNames.contains(STORES.EXPENSES)) {
                const expensesStore = database.createObjectStore(STORES.EXPENSES, { keyPath: 'id' });
                expensesStore.createIndex('category', 'category', { unique: false });
                expensesStore.createIndex('date', 'date', { unique: false });
            }

            // =====================
            // حركات الصندوق | Cash Transactions
            // =====================
            if (!database.objectStoreNames.contains(STORES.CASH_TRANSACTIONS)) {
                const cashStore = database.createObjectStore(STORES.CASH_TRANSACTIONS, { keyPath: 'id' });
                cashStore.createIndex('type', 'type', { unique: false }); // in, out
                cashStore.createIndex('date', 'date', { unique: false });
                cashStore.createIndex('referenceType', 'referenceType', { unique: false });
            }

            // =====================
            // سجل النشاطات | Activity Logs
            // =====================
            if (!database.objectStoreNames.contains(STORES.ACTIVITY_LOGS)) {
                const logsStore = database.createObjectStore(STORES.ACTIVITY_LOGS, { keyPath: 'id' });
                logsStore.createIndex('action', 'action', { unique: false });
                logsStore.createIndex('entityType', 'entityType', { unique: false });
                logsStore.createIndex('timestamp', 'timestamp', { unique: false });
            }

            // =====================
            // الإعدادات | Settings
            // =====================
            if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
                database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
            }
        };
    });
};

// ============================================
// عمليات قاعدة البيانات الأساسية (CRUD)
// ============================================

export class DatabaseService {
    // إضافة سجل
    static async add<T extends { id?: string }>(storeName: string, data: T): Promise<T> {
        const database = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            if (!data.id) {
                data.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }

            const request = store.add(data);
            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(new Error('فشل في إضافة السجل'));
        });
    }

    // تحديث سجل
    static async update<T>(storeName: string, data: T): Promise<T> {
        const database = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(new Error('فشل في تحديث السجل'));
        });
    }

    // حذف سجل
    static async delete(storeName: string, id: string): Promise<void> {
        const database = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('فشل في حذف السجل'));
        });
    }

    // الحصول على سجل بالمعرف
    static async getById<T>(storeName: string, id: string): Promise<T | undefined> {
        const database = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('فشل في جلب السجل'));
        });
    }

    // الحصول على جميع السجلات
    static async getAll<T>(storeName: string): Promise<T[]> {
        const database = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(new Error('فشل في جلب السجلات'));
        });
    }

    // البحث بفهرس
    static async getByIndex<T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T[]> {
        const database = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(new Error('فشل في البحث'));
        });
    }

    // عد السجلات
    static async count(storeName: string): Promise<number> {
        const database = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('فشل في عد السجلات'));
        });
    }

    // مسح جميع السجلات
    static async clear(storeName: string): Promise<void> {
        const database = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('فشل في مسح السجلات'));
        });
    }
}

// ============================================
// تصدير الخدمة
// ============================================

export default DatabaseService;
