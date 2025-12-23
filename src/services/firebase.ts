// ============================================
// Firebase Configuration & Services
// خدمات Firebase - Forest Edge Factory ERP
// ============================================

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    orderBy,
    Timestamp,
    setDoc
} from 'firebase/firestore';
import {
    getAuth,
    signInWithEmailAndPassword,
    Auth
} from 'firebase/auth';

// ============================================
// Firebase Configuration
// أدخل إعدادات Firebase الخاصة بك هنا
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyDM0_JdhhrFu8rd2Dvgo779akUi6a3lZUo",
    authDomain: "forestedge-666b0.firebaseapp.com",
    projectId: "forestedge-666b0",
    storageBucket: "forestedge-666b0.firebasestorage.app",
    messagingSenderId: "449547003636",
    appId: "1:449547003636:web:aaea1c7ee6c36e6d66e0a1",
    measurementId: "G-25X66FRCJF"
};

// Initialize Firebase
let app: any = null;
let db: any = null;
let auth: Auth | null = null;
let isFirebaseInitialized = false;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    // Better check: verify API key is set AND not the placeholder
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId) {
        isFirebaseInitialized = true;
        console.log('✅ Firebase متصل - Project:', firebaseConfig.projectId);
    } else {
        console.log('⚠️ Firebase غير مُعد - استخدام التخزين المحلي');
        isFirebaseInitialized = false;
    }
} catch (error) {
    console.error('❌ خطأ في تهيئة Firebase:', error);
    isFirebaseInitialized = false;
}

// Collection Names
const COLLECTIONS = {
    USERS: 'users',
    PRODUCTS: 'products',
    CUSTOMERS: 'customers',
    SUPPLIERS: 'suppliers',
    WAREHOUSES: 'warehouses',
    WORK_ORDERS: 'workOrders',
    QUOTATIONS: 'quotations',
    ACTIVITY_LOGS: 'activityLogs',
    SETTINGS: 'settings'
};

// ============================================
// Firebase Service
// ============================================
export const FirebaseService = {
    isConnected: () => isFirebaseInitialized,

    // ============================================
    // Products - المنتجات
    // ============================================
    products: {
        async getAll() {
            if (!isFirebaseInitialized) return [];
            try {
                const q = query(collection(db, COLLECTIONS.PRODUCTS), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            } catch (error) {
                console.error('Error getting products:', error);
                return [];
            }
        },

        async add(product: any) {
            if (!isFirebaseInitialized) {
                console.warn('⚠️ Firebase not initialized, skipping Firebase save');
                return null;
            }
            try {
                // Use setDoc with custom ID instead of addDoc
                const docRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
                await setDoc(docRef, {
                    ...product,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
                console.log('✅ Product added to Firebase:', product.id);
                return product;
            } catch (error: any) {
                console.error('❌ Error adding product to Firebase:', error);
                console.error('Error details:', {
                    code: error.code,
                    message: error.message,
                    productId: product.id
                });
                throw error; // Re-throw to make it visible
            }
        },

        async update(id: string, updates: any) {
            if (!isFirebaseInitialized) return null;
            try {
                const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
                await updateDoc(docRef, {
                    ...updates,
                    updatedAt: Timestamp.now()
                });
                return { id, ...updates };
            } catch (error) {
                console.error('Error updating product:', error);
                return null;
            }
        },

        async delete(id: string) {
            if (!isFirebaseInitialized) return false;
            try {
                await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
                return true;
            } catch (error) {
                console.error('Error deleting product:', error);
                return false;
            }
        }
    },

    // ============================================
    // Customers - العملاء
    // ============================================
    customers: {
        async getAll() {
            if (!isFirebaseInitialized) return [];
            try {
                const q = query(collection(db, COLLECTIONS.CUSTOMERS), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            } catch (error) {
                console.error('Error getting customers:', error);
                return [];
            }
        },

        async add(customer: any) {
            if (!isFirebaseInitialized) return null;
            try {
                const docRef = doc(db, COLLECTIONS.CUSTOMERS, customer.id);
                await setDoc(docRef, {
                    ...customer,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
                console.log('✅ Customer added to Firebase:', customer.id);
                return customer;
            } catch (error) {
                console.error('Error adding customer:', error);
                return null;
            }
        },

        async update(id: string, updates: any) {
            if (!isFirebaseInitialized) return null;
            try {
                const docRef = doc(db, COLLECTIONS.CUSTOMERS, id);
                await updateDoc(docRef, {
                    ...updates,
                    updatedAt: Timestamp.now()
                });
                return { id, ...updates };
            } catch (error) {
                console.error('Error updating customer:', error);
                return null;
            }
        },

        async delete(id: string) {
            if (!isFirebaseInitialized) return false;
            try {
                await deleteDoc(doc(db, COLLECTIONS.CUSTOMERS, id));
                return true;
            } catch (error) {
                console.error('Error deleting customer:', error);
                return false;
            }
        }
    },

    // ============================================
    // Suppliers - الموردين
    // ============================================
    suppliers: {
        async getAll() {
            if (!isFirebaseInitialized) return [];
            try {
                const q = query(collection(db, COLLECTIONS.SUPPLIERS), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            } catch (error) {
                console.error('Error getting suppliers:', error);
                return [];
            }
        },

        async add(supplier: any) {
            if (!isFirebaseInitialized) return null;
            try {
                const docRef = doc(db, COLLECTIONS.SUPPLIERS, supplier.id);
                await setDoc(docRef, {
                    ...supplier,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
                console.log('✅ Supplier added to Firebase:', supplier.id);
                return supplier;
            } catch (error) {
                console.error('Error adding supplier:', error);
                return null;
            }
        },

        async update(id: string, updates: any) {
            if (!isFirebaseInitialized) return null;
            try {
                const docRef = doc(db, COLLECTIONS.SUPPLIERS, id);
                await updateDoc(docRef, {
                    ...updates,
                    updatedAt: Timestamp.now()
                });
                return { id, ...updates };
            } catch (error) {
                console.error('Error updating supplier:', error);
                return null;
            }
        },

        async delete(id: string) {
            if (!isFirebaseInitialized) return false;
            try {
                await deleteDoc(doc(db, COLLECTIONS.SUPPLIERS, id));
                return true;
            } catch (error) {
                console.error('Error deleting supplier:', error);
                return false;
            }
        }
    },

    // ============================================
    // Warehouses - المستودعات
    // ============================================
    warehouses: {
        async getAll() {
            if (!isFirebaseInitialized) return [];
            try {
                const snapshot = await getDocs(collection(db, COLLECTIONS.WAREHOUSES));
                return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            } catch (error) {
                console.error('Error getting warehouses:', error);
                return [];
            }
        },

        async add(warehouse: any) {
            if (!isFirebaseInitialized) return null;
            try {
                const docRef = doc(db, COLLECTIONS.WAREHOUSES, warehouse.id);
                await setDoc(docRef, warehouse);
                console.log('✅ Warehouse added to Firebase:', warehouse.id);
                return warehouse;
            } catch (error) {
                console.error('Error adding warehouse:', error);
                return null;
            }
        },

        async update(id: string, updates: any) {
            if (!isFirebaseInitialized) return null;
            try {
                const docRef = doc(db, COLLECTIONS.WAREHOUSES, id);
                await updateDoc(docRef, updates);
                return { id, ...updates };
            } catch (error) {
                console.error('Error updating warehouse:', error);
                return null;
            }
        },

        async delete(id: string) {
            if (!isFirebaseInitialized) return false;
            try {
                await deleteDoc(doc(db, COLLECTIONS.WAREHOUSES, id));
                return true;
            } catch (error) {
                console.error('Error deleting warehouse:', error);
                return false;
            }
        }
    },

    // ============================================
    // Work Orders - أوامر العمل
    // ============================================
    workOrders: {
        async getAll() {
            if (!isFirebaseInitialized) return [];
            try {
                const q = query(collection(db, COLLECTIONS.WORK_ORDERS), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            } catch (error) {
                console.error('Error getting work orders:', error);
                return [];
            }
        },

        async add(workOrder: any) {
            if (!isFirebaseInitialized) return null;
            try {
                const docRef = doc(db, COLLECTIONS.WORK_ORDERS, workOrder.id);
                await setDoc(docRef, {
                    ...workOrder,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
                console.log('✅ Work Order added to Firebase:', workOrder.id);
                return workOrder;
            } catch (error) {
                console.error('Error adding work order:', error);
                return null;
            }
        },

        async update(id: string, updates: any) {
            if (!isFirebaseInitialized) return null;
            try {
                const docRef = doc(db, COLLECTIONS.WORK_ORDERS, id);
                await updateDoc(docRef, {
                    ...updates,
                    updatedAt: Timestamp.now()
                });
                return { id, ...updates };
            } catch (error) {
                console.error('Error updating work order:', error);
                return null;
            }
        },

        async delete(id: string) {
            if (!isFirebaseInitialized) return false;
            try {
                await deleteDoc(doc(db, COLLECTIONS.WORK_ORDERS, id));
                return true;
            } catch (error) {
                console.error('Error deleting work order:', error);
                return false;
            }
        }
    },

    // ============================================
    // Quotations - عروض الأسعار
    // ============================================
    quotations: {
        async getAll() {
            if (!isFirebaseInitialized) return [];
            try {
                const q = query(collection(db, COLLECTIONS.QUOTATIONS), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            } catch (error) {
                console.error('Error getting quotations:', error);
                return [];
            }
        },

        async add(quotation: any) {
            if (!isFirebaseInitialized) return null;
            try {
                const docRef = doc(db, COLLECTIONS.QUOTATIONS, quotation.id);
                await setDoc(docRef, {
                    ...quotation,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
                console.log('✅ Quotation added to Firebase:', quotation.id);
                return quotation;
            } catch (error) {
                console.error('Error adding quotation:', error);
                return null;
            }
        },

        async update(id: string, updates: any) {
            if (!isFirebaseInitialized) return null;
            try {
                const docRef = doc(db, COLLECTIONS.QUOTATIONS, id);
                await updateDoc(docRef, {
                    ...updates,
                    updatedAt: Timestamp.now()
                });
                return { id, ...updates };
            } catch (error) {
                console.error('Error updating quotation:', error);
                return null;
            }
        },

        async delete(id: string) {
            if (!isFirebaseInitialized) return false;
            try {
                await deleteDoc(doc(db, COLLECTIONS.QUOTATIONS, id));
                return true;
            } catch (error) {
                console.error('Error deleting quotation:', error);
                return false;
            }
        }
    },

    // ============================================
    // Activity Logs - سجل النشاطات
    // ============================================
    activityLogs: {
        async getAll() {
            if (!isFirebaseInitialized) return [];
            try {
                const q = query(collection(db, COLLECTIONS.ACTIVITY_LOGS), orderBy('timestamp', 'desc'));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).slice(0, 100);
            } catch (error) {
                console.error('Error getting activity logs:', error);
                return [];
            }
        },

        async add(action: 'add' | 'update' | 'delete', productName: string) {
            if (!isFirebaseInitialized) return null;
            try {
                const logId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const docRef = doc(db, COLLECTIONS.ACTIVITY_LOGS, logId);
                await setDoc(docRef, {
                    action,
                    productName,
                    timestamp: Timestamp.now()
                });
                return { id: logId, action, productName };
            } catch (error) {
                console.error('Error adding activity log:', error);
                return null;
            }
        }
    },

    // ============================================
    // Users - المستخدمين
    // ============================================
    users: {
        async getAll() {
            if (!isFirebaseInitialized) return [];
            try {
                const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
                return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            } catch (error) {
                console.error('Error getting users:', error);
                return [];
            }
        },

        async authenticate(username: string, password: string) {
            if (!isFirebaseInitialized || !auth) return null;
            try {
                console.log('🔐 Attempting Firebase Authentication login...');
                const userCredential = await signInWithEmailAndPassword(auth, username, password);
                const firebaseUser = userCredential.user;

                console.log('✅ Firebase Auth successful:', firebaseUser.email);

                return {
                    id: firebaseUser.uid,
                    username: firebaseUser.email || username,
                    nameAr: firebaseUser.displayName || firebaseUser.email || 'مستخدم',
                    nameEn: firebaseUser.displayName || firebaseUser.email || 'User',
                    role: 'admin',
                    isActive: true,
                    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
                };
            } catch (error: any) {
                console.error('❌ Firebase Authentication error:', error.code, error.message);
                throw error; // Re-throw to let callers handle specific errors
            }
        }
    }
};

export { db, auth, isFirebaseInitialized };
export default FirebaseService;
