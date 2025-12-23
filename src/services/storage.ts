import {
    User, AuthState, Product, ActivityLog, Customer, Supplier, SalesOrder,
    PurchaseOrder, Expense, Warehouse, InventoryMovement, Invoice, Payment,
    CashTransaction, Quotation, BOM, WorkOrder
} from '../types';

export const STORAGE_KEYS = {
    PRODUCTS: 'prostock_products',
    ACTIVITY: 'prostock_activity',
    SETTINGS: 'prostock_settings',
    CUSTOMERS: 'prostock_customers',
    SUPPLIERS: 'prostock_suppliers',
    SALES_ORDERS: 'prostock_sales_orders',
    PURCHASE_ORDERS: 'prostock_purchase_orders',
    EXPENSES: 'prostock_expenses',
    WAREHOUSES: 'prostock_warehouses',
    USERS: 'prostock_users',
    AUTH_SESSION: 'prostock_auth_session',
    INVENTORY_MOVEMENTS: 'prostock_inventory_movements',
    INVOICES: 'prostock_invoices',
    PAYMENTS: 'prostock_payments',
    CASH_TRANSACTIONS: 'prostock_cash_transactions',
    QUOTATIONS: 'prostock_quotations',
    WORK_ORDERS: 'prostock_work_orders',
    BOM: 'prostock_bom',
};

// التحقق من وجود Electron API
declare global {
    interface Window {
        electronAPI?: {
            readData: (key: string) => Promise<any>;
            writeData: (key: string, value: any) => Promise<boolean>;
            isElectron: () => boolean;
            getDataPath: () => Promise<string>;
        };
    }
}

const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron();

export const Storage = {
    get<T>(key: string, defaultValue: T): T {
        try {
            if (isElectron && window.electronAPI) {
                // استخدام نظام الملفات في Electron (سيكون sync في المستقبل)
                // للآن نستخدم localStorage كـ cache
                const item = localStorage.getItem(key);
                if (item) {
                    return JSON.parse(item);
                }

                // تحميل من الملف في الخلفية
                window.electronAPI.readData(key).then(data => {
                    if (data !== null) {
                        localStorage.setItem(key, JSON.stringify(data));
                    }
                });

                return defaultValue;
            } else {
                // استخدام localStorage في المتصفح (للتطوير)
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            }
        } catch {
            return defaultValue;
        }
    },

    set<T>(key: string, value: T): void {
        try {
            if (isElectron && window.electronAPI) {
                // حفظ في localStorage كـ cache
                localStorage.setItem(key, JSON.stringify(value));

                // حفظ في الملف
                window.electronAPI.writeData(key, value).catch(err => {
                    console.error('❌ خطأ في حفظ البيانات:', err);
                });
            } else {
                // استخدام localStorage في المتصفح (للتطوير)
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error('❌ خطأ في Storage.set:', error);
        }
    }
};

// المستخدم الافتراضي | Default User
export const DEFAULT_ADMIN: User = {
    id: 'admin-001',
    username: 'admin',
    password: 'admin123',
    nameAr: 'مدير النظام',
    nameEn: 'System Admin',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString()
};

// دوال تخزين المستخدمين | User Storage
export const UserDB = {
    getAll: (): User[] => {
        const users = Storage.get<User[]>(STORAGE_KEYS.USERS, []);
        // إضافة المستخدم الافتراضي إذا لم يوجد مستخدمين
        if (users.length === 0) {
            Storage.set(STORAGE_KEYS.USERS, [DEFAULT_ADMIN]);
            return [DEFAULT_ADMIN];
        }
        return users;
    },
    save: (users: User[]) => Storage.set(STORAGE_KEYS.USERS, users),
    add(user: User) {
        const users = this.getAll();
        users.push(user);
        this.save(users);
        return users;
    },
    update(id: string, updates: Partial<User>) {
        const users = this.getAll();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) users[index] = { ...users[index], ...updates };
        this.save(users);
        return users;
    },
    delete(id: string) {
        // لا تحذف المستخدم الافتراضي
        const users = this.getAll().filter(u => u.id !== 'admin-001' && u.id !== id);
        this.save(users);
        return users;
    },
    authenticate(username: string, password: string): User | null {
        const users = this.getAll();
        return users.find(u => u.username === username && u.password === password && u.isActive) || null;
    }
};

// دوال جلسة المستخدم | Auth Session
export const AuthDB = {
    getSession: (): AuthState => {
        return Storage.get<AuthState>(STORAGE_KEYS.AUTH_SESSION, { isLoggedIn: false, currentUser: null });
    },
    login(user: User) {
        const session: AuthState = { isLoggedIn: true, currentUser: user };
        Storage.set(STORAGE_KEYS.AUTH_SESSION, session);
        return session;
    },
    logout() {
        const session: AuthState = { isLoggedIn: false, currentUser: null };
        Storage.set(STORAGE_KEYS.AUTH_SESSION, session);
        return session;
    }
};

export const ProductDB = {
    getAll: (): Product[] => Storage.get(STORAGE_KEYS.PRODUCTS, []),
    save: (products: Product[]) => Storage.set(STORAGE_KEYS.PRODUCTS, products),
    add(product: Product) {
        const products = this.getAll();
        products.push(product);
        this.save(products);
        return products;
    },
    update(id: string, updates: Partial<Product>) {
        const products = this.getAll();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(products);
        }
        return products;
    },
    delete(id: string) {
        const products = this.getAll().filter(p => p.id !== id);
        this.save(products);
        return products;
    }
};

export const ActivityDB = {
    getAll: (): ActivityLog[] => Storage.get(STORAGE_KEYS.ACTIVITY, []),
    add(action: 'add' | 'update' | 'delete', productName: string) {
        const logs = this.getAll();
        logs.unshift({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            action, productName,
            timestamp: new Date().toISOString()
        });
        if (logs.length > 100) logs.pop();
        Storage.set(STORAGE_KEYS.ACTIVITY, logs);
        return logs;
    }
};

// دوال تخزين العملاء
export const CustomerDB = {
    getAll: (): Customer[] => Storage.get(STORAGE_KEYS.CUSTOMERS, []),
    save: (customers: Customer[]) => Storage.set(STORAGE_KEYS.CUSTOMERS, customers),
    add(customer: Customer) {
        const customers = this.getAll();
        customers.push(customer);
        this.save(customers);
        return customers;
    },
    update(id: string, updates: Partial<Customer>) {
        const customers = this.getAll();
        const index = customers.findIndex(c => c.id === id);
        if (index !== -1) {
            customers[index] = { ...customers[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(customers);
        }
        return customers;
    },
    delete(id: string) {
        const customers = this.getAll().filter(c => c.id !== id);
        this.save(customers);
        return customers;
    },
    generateCode() {
        const customers = this.getAll();
        return `CUS${String(customers.length + 1).padStart(4, '0')}`;
    }
};

// دوال تخزين الموردين
export const SupplierDB = {
    getAll: (): Supplier[] => Storage.get(STORAGE_KEYS.SUPPLIERS, []),
    save: (suppliers: Supplier[]) => Storage.set(STORAGE_KEYS.SUPPLIERS, suppliers),
    add(supplier: Supplier) {
        const suppliers = this.getAll();
        suppliers.push(supplier);
        this.save(suppliers);
        return suppliers;
    },
    update(id: string, updates: Partial<Supplier>) {
        const suppliers = this.getAll();
        const index = suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            suppliers[index] = { ...suppliers[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(suppliers);
        }
        return suppliers;
    },
    delete(id: string) {
        const suppliers = this.getAll().filter(s => s.id !== id);
        this.save(suppliers);
        return suppliers;
    },
    generateCode() {
        const suppliers = this.getAll();
        return `SUP${String(suppliers.length + 1).padStart(4, '0')}`;
    }
};

// دوال تخزين أوامر البيع
export const SalesOrderDB = {
    getAll: (): SalesOrder[] => Storage.get(STORAGE_KEYS.SALES_ORDERS, []),
    save: (orders: SalesOrder[]) => Storage.set(STORAGE_KEYS.SALES_ORDERS, orders),
    add(order: SalesOrder) {
        const orders = this.getAll();
        orders.push(order);
        this.save(orders);
        return orders;
    },
    update(id: string, updates: Partial<SalesOrder>) {
        const orders = this.getAll();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(orders);
        }
        return orders;
    },
    delete(id: string) {
        const orders = this.getAll().filter(o => o.id !== id);
        this.save(orders);
        return orders;
    },
    generateOrderNumber() {
        const orders = this.getAll();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `SO${year}${month}-${String(orders.length + 1).padStart(4, '0')}`;
    }
};

// دوال تخزين أوامر الشراء
export const PurchaseOrderDB = {
    getAll: (): PurchaseOrder[] => Storage.get(STORAGE_KEYS.PURCHASE_ORDERS, []),
    save: (orders: PurchaseOrder[]) => Storage.set(STORAGE_KEYS.PURCHASE_ORDERS, orders),
    add(order: PurchaseOrder) {
        const orders = this.getAll();
        orders.push(order);
        this.save(orders);
        return orders;
    },
    update(id: string, updates: Partial<PurchaseOrder>) {
        const orders = this.getAll();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(orders);
        }
        return orders;
    },
    delete(id: string) {
        const orders = this.getAll().filter(o => o.id !== id);
        this.save(orders);
        return orders;
    },
    generateOrderNumber() {
        const orders = this.getAll();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `PO${year}${month}-${String(orders.length + 1).padStart(4, '0')}`;
    }
};

// دوال تخزين المصروفات
export const ExpenseDB = {
    getAll: (): Expense[] => Storage.get(STORAGE_KEYS.EXPENSES, []),
    save: (expenses: Expense[]) => Storage.set(STORAGE_KEYS.EXPENSES, expenses),
    add(expense: Expense) {
        const expenses = this.getAll();
        expenses.push(expense);
        this.save(expenses);
        return expenses;
    },
    delete(id: string) {
        const expenses = this.getAll().filter(e => e.id !== id);
        this.save(expenses);
        return expenses;
    },
    getTotalByCategory() {
        const expenses = this.getAll();
        return expenses.reduce((acc: any, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
        }, {});
    }
};

// دوال تخزين المخازن
export const WarehouseDB = {
    getAll: (): Warehouse[] => Storage.get(STORAGE_KEYS.WAREHOUSES, [
        { id: 'default', code: 'WH001', nameAr: 'المخزن الرئيسي', nameEn: 'Main Warehouse', address: '', isDefault: true }
    ]),
    save: (warehouses: Warehouse[]) => Storage.set(STORAGE_KEYS.WAREHOUSES, warehouses),
    add(warehouse: Warehouse) {
        const warehouses = this.getAll();
        warehouses.push(warehouse);
        this.save(warehouses);
        return warehouses;
    },
    update(id: string, updates: Partial<Warehouse>) {
        const warehouses = this.getAll();
        const index = warehouses.findIndex(w => w.id === id);
        if (index !== -1) warehouses[index] = { ...warehouses[index], ...updates };
        this.save(warehouses);
        return warehouses;
    },
    delete(id: string) {
        const warehouses = this.getAll();
        const newWarehouses = warehouses.filter(w => w.id !== id);
        this.save(newWarehouses);
        return newWarehouses;
    },
    generateCode() {
        const warehouses = this.getAll();
        return `WH${String(warehouses.length + 1).padStart(3, '0')}`;
    }
};

export const InventoryMovementDB = {
    getAll: (): InventoryMovement[] => Storage.get(STORAGE_KEYS.INVENTORY_MOVEMENTS, []),
    add(movement: InventoryMovement) {
        const movements = this.getAll();
        movements.unshift(movement); // الأحدث أولاً
        Storage.set(STORAGE_KEYS.INVENTORY_MOVEMENTS, movements);
        return movements;
    }
};

export const InvoiceDB = {
    getAll: (): Invoice[] => Storage.get(STORAGE_KEYS.INVOICES, []),
    save: (invoices: Invoice[]) => Storage.set(STORAGE_KEYS.INVOICES, invoices),
    add(invoice: Invoice) {
        const invoices = this.getAll();
        invoices.push(invoice);
        this.save(invoices);
        return invoices;
    },
    update(id: string, updates: Partial<Invoice>) {
        const invoices = this.getAll();
        const index = invoices.findIndex(i => i.id === id);
        if (index !== -1) {
            invoices[index] = { ...invoices[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(invoices);
        }
        return invoices;
    },
    generateInvoiceNumber(type: 'sales' | 'purchase') {
        const invoices = this.getAll();
        const prefix = type === 'sales' ? 'INV-SA' : 'INV-PO';
        return `${prefix}-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(5, '0')}`;
    }
};

export const PaymentDB = {
    getAll: (): Payment[] => Storage.get(STORAGE_KEYS.PAYMENTS, []),
    save: (payments: Payment[]) => Storage.set(STORAGE_KEYS.PAYMENTS, payments),
    add(payment: Payment) {
        const payments = this.getAll();
        payments.push(payment);
        this.save(payments);
        return payments;
    },
    generateNumber() {
        const payments = this.getAll();
        return `PAY-${new Date().getFullYear()}-${String(payments.length + 1).padStart(5, '0')}`;
    }
};

export const CashTransactionDB = {
    getAll: (): CashTransaction[] => Storage.get(STORAGE_KEYS.CASH_TRANSACTIONS, []),
    save: (trxs: CashTransaction[]) => Storage.set(STORAGE_KEYS.CASH_TRANSACTIONS, trxs),
    add(trx: CashTransaction) {
        const trxs = this.getAll();
        // حساب الرصيد التراكمي
        const lastBalance = trxs.length > 0 ? trxs[trxs.length - 1].balance : 0;
        const newBalance = trx.type === 'in' ? lastBalance + trx.amount : lastBalance - trx.amount;

        // إعادة تعيين الرصيد للمعاملة الحالية
        const newTrx = { ...trx, balance: newBalance };
        trxs.push(newTrx);
        this.save(trxs);
        return trxs;
    },
    generateNumber() {
        const trxs = this.getAll();
        return `CSH-${new Date().getFullYear()}-${String(trxs.length + 1).padStart(5, '0')}`;
    }
};

export const QuotationDB = {
    getAll: (): Quotation[] => Storage.get(STORAGE_KEYS.QUOTATIONS, []),
    save: (quotations: Quotation[]) => Storage.set(STORAGE_KEYS.QUOTATIONS, quotations),
    add(quotation: Quotation) {
        const quotations = this.getAll();
        quotations.push(quotation);
        this.save(quotations);
        return quotations;
    },
    delete(id: string) {
        const quotations = this.getAll().filter(q => q.id !== id);
        this.save(quotations);
        return quotations;
    },
    update(id: string, updates: Partial<Quotation>) {
        const quotations = this.getAll();
        const index = quotations.findIndex(q => q.id === id);
        if (index !== -1) {
            quotations[index] = { ...quotations[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(quotations);
        }
        return quotations;
    },
    generateNumber() {
        const quotations = this.getAll();
        return `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(4, '0')}`;
    }
};

export const BOMDB = {
    getAll: (): BOM[] => Storage.get(STORAGE_KEYS.BOM, []),
    save: (bomList: BOM[]) => Storage.set(STORAGE_KEYS.BOM, bomList),
    add(bom: BOM) {
        const bomList = this.getAll();
        bomList.push(bom);
        this.save(bomList);
        return bomList;
    },
    delete(id: string) {
        const bomList = this.getAll().filter(b => b.id !== id);
        this.save(bomList);
        return bomList;
    }
};

export const WorkOrderDB = {
    getAll: (): WorkOrder[] => Storage.get(STORAGE_KEYS.WORK_ORDERS, []),
    save: (orders: WorkOrder[]) => Storage.set(STORAGE_KEYS.WORK_ORDERS, orders),
    add(order: WorkOrder) {
        const orders = this.getAll();
        orders.push(order);
        this.save(orders);
        return orders;
    },
    update(id: string, updates: Partial<WorkOrder>) {
        const orders = this.getAll();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(orders);
        }
        return orders;
    },
    // رقم أمر العمل بصيغة P04222
    generateOrderNumber() {
        const orders = this.getAll();
        const nextNumber = orders.length + 1;
        return `P${String(nextNumber).padStart(5, '0')}`;
    },
    // رقم طلب العمل بصيغة 25-00064 (تلقائي ومتسلسل)
    generateJobOrderNumber() {
        const orders = this.getAll();
        const year = new Date().getFullYear().toString().slice(-2);
        const baseNumber = 64; // Starting from 25-00064

        // Find the highest existing order number for the current year
        let maxNumber = baseNumber - 1; // Start from 63 so first order will be 64

        orders.forEach(order => {
            if (order.jobOrderNumber) {
                // Extract the year and number from format "25-00064"
                const parts = order.jobOrderNumber.split('-');
                if (parts.length === 2 && parts[0] === year) {
                    const num = parseInt(parts[1], 10);
                    if (!isNaN(num) && num > maxNumber) {
                        maxNumber = num;
                    }
                }
            }
        });

        const nextNumber = maxNumber + 1;
        return `${year}-${String(nextNumber).padStart(5, '0')}`;
    },
    delete(id: string) {
        const orders = this.getAll().filter(o => o.id !== id);
        this.save(orders);
        return orders;
    },
    // تنفيذ أمر العمل - خصم المواد من المخزون
    executeWorkOrder(workOrderId: string): { success: boolean; message: string; unavailableItems?: string[] } {
        const orders = this.getAll();
        const order = orders.find(o => o.id === workOrderId);

        if (!order) {
            return { success: false, message: 'أمر العمل غير موجود' };
        }

        if (order.status === 'completed') {
            return { success: false, message: 'أمر العمل تم تنفيذه مسبقاً' };
        }

        const products = ProductDB.getAll();
        const unavailableItems: string[] = [];

        // التحقق من توفر المواد أولاً
        for (const material of order.materials) {
            const product = products.find(p => p.id === material.productId);
            if (!product) {
                unavailableItems.push(`${material.productName} (غير موجود في المخزون)`);
            } else if (product.quantity < material.quantity) {
                unavailableItems.push(`${material.productName} (متوفر: ${product.quantity}, مطلوب: ${material.quantity})`);
            }
        }

        if (unavailableItems.length > 0) {
            return { success: false, message: 'الكميات غير متوفرة', unavailableItems };
        }

        // خصم المواد من المخزون
        for (const material of order.materials) {
            const productIndex = products.findIndex(p => p.id === material.productId);
            if (productIndex !== -1) {
                const product = products[productIndex];
                const newQuantity = product.quantity - material.quantity;
                products[productIndex] = {
                    ...product,
                    quantity: newQuantity,
                    status: newQuantity === 0 ? 'out_of_stock' : newQuantity <= product.minQuantity ? 'low_stock' : 'active',
                    updatedAt: new Date().toISOString()
                };
            }
        }

        // حفظ تحديثات المنتجات
        ProductDB.save(products);

        // تحديث حالة أمر العمل
        this.update(workOrderId, { status: 'in_progress' });

        return { success: true, message: 'تم تنفيذ أمر العمل وخصم المواد بنجاح' };
    }
};
