// ============================================
// Hybrid Storage Service - Firebase + LocalStorage
// خدمة التخزين الهجينة - يستخدم Firebase أولاً ثم localStorage كاحتياطي
// ============================================

import { FirebaseService, isFirebaseInitialized } from './firebase';
import {
    User, AuthState, Product, ActivityLog, Customer, Supplier,
    Warehouse, Quotation, WorkOrder
} from '../types';

// ============================================
// Check if Firebase is available
// ============================================
export const isFirebaseAvailable = () => isFirebaseInitialized;

// ============================================
// Hybrid Product Service
// ============================================
export const HybridProductDB = {
    async getAll(): Promise<Product[]> {
        try {
            if (isFirebaseInitialized) {
                const products = await FirebaseService.products.getAll();
                // Always use Firebase data when connected, even if empty
                localStorage.setItem('prostock_products', JSON.stringify(products));
                console.log(`📦 Loaded ${products.length} products from Firebase`);
                return products as Product[];
            }
        } catch (error) {
            console.error('Firebase error, using localStorage:', error);
        }
        // Only use localStorage if Firebase is not available
        const cached = localStorage.getItem('prostock_products');
        console.log('📦 Using localStorage (Firebase not available)');
        return cached ? JSON.parse(cached) : [];
    },

    async add(product: Product): Promise<Product[]> {
        let firebaseSuccess = false;
        try {
            if (isFirebaseInitialized) {
                console.log('🔥 Attempting to add product to Firebase:', product.id);
                await FirebaseService.products.add(product);
                firebaseSuccess = true;
                console.log('✅ Product successfully added to Firebase');
            } else {
                console.warn('⚠️ Firebase not available, saving to localStorage only');
            }
        } catch (error: any) {
            console.error('❌ Firebase add error:', error);
            alert(`تحذير: فشل حفظ المنتج في Firebase!\nWarning: Failed to save product to Firebase!\n\nError: ${error.message}\n\nتم الحفظ في التخزين المحلي فقط.\nSaved to localStorage only.`);
        }

        // Always save to localStorage too
        const products = await this.getAll();
        const exists = products.find(p => p.id === product.id);
        if (!exists) {
            products.push(product);
        }
        localStorage.setItem('prostock_products', JSON.stringify(products));

        if (firebaseSuccess) {
            console.log('✅ Product saved to both Firebase and localStorage');
        } else {
            console.log('📦 Product saved to localStorage only');
        }

        return products;
    },

    async update(id: string, updates: Partial<Product>): Promise<Product[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.products.update(id, updates);
            }
        } catch (error) {
            console.error('Firebase update error:', error);
        }
        const products = await this.getAll();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem('prostock_products', JSON.stringify(products));
        }
        return products;
    },

    async delete(id: string): Promise<Product[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.products.delete(id);
            }
        } catch (error) {
            console.error('Firebase delete error:', error);
        }
        const products = (await this.getAll()).filter(p => p.id !== id);
        localStorage.setItem('prostock_products', JSON.stringify(products));
        return products;
    }
};

// ============================================
// Hybrid Customer Service
// ============================================
export const HybridCustomerDB = {
    async getAll(): Promise<Customer[]> {
        try {
            if (isFirebaseInitialized) {
                const customers = await FirebaseService.customers.getAll();
                localStorage.setItem('prostock_customers', JSON.stringify(customers));
                return customers as Customer[];
            }
        } catch (error) {
            console.error('Firebase error:', error);
        }
        const cached = localStorage.getItem('prostock_customers');
        return cached ? JSON.parse(cached) : [];
    },

    async add(customer: Customer): Promise<Customer[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.customers.add(customer);
            }
        } catch (error) {
            console.error('Firebase add error:', error);
        }
        const customers = await this.getAll();
        const exists = customers.find(c => c.id === customer.id);
        if (!exists) customers.push(customer);
        localStorage.setItem('prostock_customers', JSON.stringify(customers));
        return customers;
    },

    async update(id: string, updates: Partial<Customer>): Promise<Customer[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.customers.update(id, updates);
            }
        } catch (error) {
            console.error('Firebase update error:', error);
        }
        const customers = await this.getAll();
        const index = customers.findIndex(c => c.id === id);
        if (index !== -1) {
            customers[index] = { ...customers[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem('prostock_customers', JSON.stringify(customers));
        }
        return customers;
    },

    async delete(id: string): Promise<Customer[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.customers.delete(id);
            }
        } catch (error) {
            console.error('Firebase delete error:', error);
        }
        const customers = (await this.getAll()).filter(c => c.id !== id);
        localStorage.setItem('prostock_customers', JSON.stringify(customers));
        return customers;
    },

    generateCode(): string {
        const cached = localStorage.getItem('prostock_customers');
        const customers = cached ? JSON.parse(cached) : [];
        return `CUS${String(customers.length + 1).padStart(4, '0')}`;
    }
};

// ============================================
// Hybrid Supplier Service
// ============================================
export const HybridSupplierDB = {
    async getAll(): Promise<Supplier[]> {
        try {
            if (isFirebaseInitialized) {
                const suppliers = await FirebaseService.suppliers.getAll();
                localStorage.setItem('prostock_suppliers', JSON.stringify(suppliers));
                return suppliers as Supplier[];
            }
        } catch (error) {
            console.error('Firebase error:', error);
        }
        const cached = localStorage.getItem('prostock_suppliers');
        return cached ? JSON.parse(cached) : [];
    },

    async add(supplier: Supplier): Promise<Supplier[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.suppliers.add(supplier);
            }
        } catch (error) {
            console.error('Firebase add error:', error);
        }
        const suppliers = await this.getAll();
        const exists = suppliers.find(s => s.id === supplier.id);
        if (!exists) suppliers.push(supplier);
        localStorage.setItem('prostock_suppliers', JSON.stringify(suppliers));
        return suppliers;
    },

    async update(id: string, updates: Partial<Supplier>): Promise<Supplier[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.suppliers.update(id, updates);
            }
        } catch (error) {
            console.error('Firebase update error:', error);
        }
        const suppliers = await this.getAll();
        const index = suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            suppliers[index] = { ...suppliers[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem('prostock_suppliers', JSON.stringify(suppliers));
        }
        return suppliers;
    },

    async delete(id: string): Promise<Supplier[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.suppliers.delete(id);
            }
        } catch (error) {
            console.error('Firebase delete error:', error);
        }
        const suppliers = (await this.getAll()).filter(s => s.id !== id);
        localStorage.setItem('prostock_suppliers', JSON.stringify(suppliers));
        return suppliers;
    },

    generateCode(): string {
        const cached = localStorage.getItem('prostock_suppliers');
        const suppliers = cached ? JSON.parse(cached) : [];
        return `SUP${String(suppliers.length + 1).padStart(4, '0')}`;
    }
};

// ============================================
// Hybrid Warehouse Service
// ============================================
export const HybridWarehouseDB = {
    async getAll(): Promise<Warehouse[]> {
        try {
            if (isFirebaseInitialized) {
                const warehouses = await FirebaseService.warehouses.getAll();
                if (warehouses.length > 0) {
                    localStorage.setItem('prostock_warehouses', JSON.stringify(warehouses));
                    return warehouses as Warehouse[];
                }
            }
        } catch (error) {
            console.error('Firebase error:', error);
        }
        const cached = localStorage.getItem('prostock_warehouses');
        if (cached) return JSON.parse(cached);
        return [{ id: 'default', code: 'WH001', nameAr: 'المخزن الرئيسي', nameEn: 'Main Warehouse', address: '', isDefault: true }];
    },

    async add(warehouse: Warehouse): Promise<Warehouse[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.warehouses.add(warehouse);
            }
        } catch (error) {
            console.error('Firebase add error:', error);
        }
        const warehouses = await this.getAll();
        const exists = warehouses.find(w => w.id === warehouse.id);
        if (!exists) warehouses.push(warehouse);
        localStorage.setItem('prostock_warehouses', JSON.stringify(warehouses));
        return warehouses;
    },

    async update(id: string, updates: Partial<Warehouse>): Promise<Warehouse[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.warehouses.update(id, updates);
            }
        } catch (error) {
            console.error('Firebase update error:', error);
        }
        const warehouses = await this.getAll();
        const index = warehouses.findIndex(w => w.id === id);
        if (index !== -1) {
            warehouses[index] = { ...warehouses[index], ...updates };
            localStorage.setItem('prostock_warehouses', JSON.stringify(warehouses));
        }
        return warehouses;
    },

    async delete(id: string): Promise<Warehouse[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.warehouses.delete(id);
            }
        } catch (error) {
            console.error('Firebase delete error:', error);
        }
        const warehouses = (await this.getAll()).filter(w => w.id !== id);
        localStorage.setItem('prostock_warehouses', JSON.stringify(warehouses));
        return warehouses;
    },

    generateCode(): string {
        const cached = localStorage.getItem('prostock_warehouses');
        const warehouses = cached ? JSON.parse(cached) : [];
        return `WH${String(warehouses.length + 1).padStart(3, '0')}`;
    }
};

// ============================================
// Hybrid Work Order Service
// ============================================
export const HybridWorkOrderDB = {
    async getAll(): Promise<WorkOrder[]> {
        console.log('📥 Fetching work orders from Firebase...');
        try {
            if (isFirebaseInitialized) {
                const orders = await FirebaseService.workOrders.getAll();
                console.log(`✅ Fetched ${orders.length} work orders from Firebase`);
                return orders as WorkOrder[];
            }
        } catch (error) {
            console.error('❌ Firebase getAll error:', error);
        }
        console.warn('⚠️ Firebase not available, returning empty array');
        return [];
    },

    // إضافة وظيفة توليد رقم أمر العمل بشكل تسلسلي بناءً على بيانات Firebase
    async generateOrderNumber(): Promise<string> {
        const orders = await this.getAll();
        const nextNumber = orders.length + 1;
        return `P${String(nextNumber).padStart(5, '0')}`;
    },

    // إضافة وظيفة توليد رقم طلب العمل بشكل تسلسلي للعام الحالي
    async generateJobOrderNumber(): Promise<string> {
        const orders = await this.getAll();
        const year = new Date().getFullYear().toString().slice(-2);
        const baseNumber = 64; // Starting from 25-00064

        let maxNumber = baseNumber - 1;

        orders.forEach(order => {
            if (order.jobOrderNumber) {
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

    async add(order: WorkOrder): Promise<WorkOrder[]> {
        console.log('➕ Adding work order to Firebase...', order.id);
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.workOrders.add(order);
                console.log('✅ Work order added to Firebase successfully');
            } else {
                console.error('❌ Firebase not initialized');
                throw new Error('Firebase not available');
            }
        } catch (error) {
            console.error('❌ Firebase add error:', error);
            throw error;
        }
        return this.getAll();
    },

    async update(id: string, updates: Partial<WorkOrder>): Promise<WorkOrder[]> {
        console.log('🔄 Updating work order in Firebase:', { id });

        try {
            if (isFirebaseInitialized) {
                const updateData = {
                    ...updates,
                    updatedAt: new Date().toISOString()
                };

                await FirebaseService.workOrders.update(id, updateData);
                console.log('✅ Work order updated in Firebase successfully');
            } else {
                console.error('❌ Firebase not initialized');
                throw new Error('Firebase not available');
            }
        } catch (error) {
            console.error('❌ Firebase update error:', error);
            throw error;
        }

        return this.getAll();
    },

    async delete(id: string): Promise<WorkOrder[]> {
        console.log('🗑️ Deleting work order from Firebase:', { id });

        try {
            if (isFirebaseInitialized) {
                await FirebaseService.workOrders.delete(id);
                console.log('✅ Work order deleted from Firebase successfully');
            } else {
                console.error('❌ Firebase not initialized');
                throw new Error('Firebase not available');
            }
        } catch (error) {
            console.error('❌ Firebase delete error:', error);
            throw error;
        }

        return this.getAll();
    },

    // تنفيذ أمر العمل - خصم المواد من المخزون في Firebase
    async executeWorkOrder(workOrderId: string): Promise<{ success: boolean; message: string; unavailableItems?: string[] }> {
        console.log('🚀 Executing work order in Firebase:', workOrderId);

        try {
            if (!isFirebaseInitialized) {
                return { success: false, message: 'Firebase not available' };
            }

            // 1. Get the Work Order
            const orders = await this.getAll(); // Fetches fresh from Firebase
            const order = orders.find(o => o.id === workOrderId);

            if (!order) {
                return { success: false, message: 'أمر العمل غير موجود (Work Order Not Found)' };
            }

            if (order.status === 'completed') {
                return { success: false, message: 'أمر العمل تم تنفيذه مسبقاً (Already Completed)' };
            }

            // 2. Get All Products (Fresh from Firebase)
            const products = await HybridProductDB.getAll();
            const unavailableItems: string[] = [];

            // 3. Check Availability
            for (const material of order.materials) {
                if (material.isManual) continue; // Skip manual items that are not in DB

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

            // 4. Deduct Stock (Update Products in Firebase)
            console.log('📉 Deducting items from inventory...');
            for (const material of order.materials) {
                if (material.isManual) continue;

                const product = products.find(p => p.id === material.productId);
                if (product) {
                    const newQuantity = product.quantity - material.quantity;
                    const status = newQuantity === 0 ? 'out_of_stock' : newQuantity <= product.minQuantity ? 'low_stock' : 'active';

                    await HybridProductDB.update(product.id, {
                        quantity: newQuantity,
                        status: status
                    });
                }
            }

            // 5. Update Work Order Status to 'in_progress' or 'completed' ?
            // Usually execution starts it, so 'in_progress'. 
            // Or if it means "Finished production", then 'completed'.
            // The local logic set it to 'in_progress'. I will follow that.
            await this.update(workOrderId, { status: 'in_progress' });

            console.log('✅ Work order executed successfully');
            return { success: true, message: 'تم تنفيذ أمر العمل وخصم المواد بنجاح' };

        } catch (error) {
            console.error('❌ Error executing work order:', error);
            return { success: false, message: 'حدث خطأ أثناء التنفيذ: ' + (error as any).message };
        }
    }
};

// ============================================
// Hybrid Quotation Service
// ============================================
export const HybridQuotationDB = {
    async getAll(): Promise<Quotation[]> {
        try {
            if (isFirebaseInitialized) {
                const quotations = await FirebaseService.quotations.getAll();
                localStorage.setItem('prostock_quotations', JSON.stringify(quotations));
                return quotations as Quotation[];
            }
        } catch (error) {
            console.error('Firebase error:', error);
        }
        const cached = localStorage.getItem('prostock_quotations');
        return cached ? JSON.parse(cached) : [];
    },

    async add(quotation: Quotation): Promise<Quotation[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.quotations.add(quotation);
            }
        } catch (error) {
            console.error('Firebase add error:', error);
        }
        const quotations = await this.getAll();
        const exists = quotations.find(q => q.id === quotation.id);
        if (!exists) quotations.push(quotation);
        localStorage.setItem('prostock_quotations', JSON.stringify(quotations));
        return quotations;
    },

    async update(id: string, updates: Partial<Quotation>): Promise<Quotation[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.quotations.update(id, updates);
            }
        } catch (error) {
            console.error('Firebase update error:', error);
        }
        const quotations = await this.getAll();
        const index = quotations.findIndex(q => q.id === id);
        if (index !== -1) {
            quotations[index] = { ...quotations[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem('prostock_quotations', JSON.stringify(quotations));
        }
        return quotations;
    },

    async delete(id: string): Promise<Quotation[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.quotations.delete(id);
            }
        } catch (error) {
            console.error('Firebase delete error:', error);
        }
        const quotations = (await this.getAll()).filter(q => q.id !== id);
        localStorage.setItem('prostock_quotations', JSON.stringify(quotations));
        return quotations;
    },

    generateNumber(): string {
        const cached = localStorage.getItem('prostock_quotations');
        const quotations = cached ? JSON.parse(cached) : [];
        return `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(4, '0')}`;
    }
};

// ============================================
// Hybrid Activity Log Service
// ============================================
export const HybridActivityDB = {
    async getAll(): Promise<ActivityLog[]> {
        try {
            if (isFirebaseInitialized) {
                const logs = await FirebaseService.activityLogs.getAll();
                localStorage.setItem('prostock_activity', JSON.stringify(logs));
                return logs as ActivityLog[];
            }
        } catch (error) {
            console.error('Firebase error:', error);
        }
        const cached = localStorage.getItem('prostock_activity');
        return cached ? JSON.parse(cached) : [];
    },

    async add(action: 'add' | 'update' | 'delete', productName: string): Promise<ActivityLog[]> {
        try {
            if (isFirebaseInitialized) {
                await FirebaseService.activityLogs.add(action, productName);
            }
        } catch (error) {
            console.error('Firebase add error:', error);
        }
        const logs = await this.getAll();
        logs.unshift({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            action, productName,
            timestamp: new Date().toISOString()
        });
        if (logs.length > 100) logs.pop();
        localStorage.setItem('prostock_activity', JSON.stringify(logs));
        return logs;
    }
};

// ============================================
// Hybrid User Service
// ============================================
export const HybridUserDB = {
    async getAll(): Promise<User[]> {
        try {
            if (isFirebaseInitialized) {
                const users = await FirebaseService.users.getAll();
                if (users.length > 0) {
                    localStorage.setItem('prostock_users', JSON.stringify(users));
                    return users as User[];
                }
            }
        } catch (error) {
            console.error('Firebase error:', error);
        }
        const cached = localStorage.getItem('prostock_users');
        if (cached) return JSON.parse(cached);
        const defaultAdmin: User = {
            id: 'admin-001',
            username: 'admin',
            password: 'admin123',
            nameAr: 'مدير النظام',
            nameEn: 'System Admin',
            role: 'admin',
            isActive: true,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('prostock_users', JSON.stringify([defaultAdmin]));
        return [defaultAdmin];
    },

    async authenticate(username: string, password: string): Promise<User | null> {
        // Only use Firebase Authentication - no localStorage fallback
        if (!isFirebaseInitialized) {
            console.error('❌ Firebase not initialized');
            return null;
        }

        try {
            console.log('🔐 HybridUserDB: Authenticating with Firebase Auth...');
            const user = await FirebaseService.users.authenticate(username, password);
            if (user) {
                console.log('✅ HybridUserDB: Authentication successful');
                return user as User;
            } else {
                console.log('❌ HybridUserDB: Authentication failed');
                return null;
            }
        } catch (error) {
            console.error('❌ HybridUserDB: Firebase auth error:', error);
            throw error;
        }
    }
};
