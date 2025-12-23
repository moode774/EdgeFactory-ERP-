import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Product, Customer, Supplier, Warehouse, Quotation, BOM, WorkOrder, Language, AuthState, ActivityLog } from './src/types';
import { UserDB, AuthDB, ProductDB, ActivityDB, CustomerDB, SupplierDB, WarehouseDB, QuotationDB, BOMDB, WorkOrderDB } from './src/services/storage';
import {
  HybridProductDB, HybridCustomerDB, HybridSupplierDB, HybridWarehouseDB,
  HybridWorkOrderDB, HybridQuotationDB, HybridActivityDB, HybridUserDB,
  isFirebaseAvailable
} from './src/services/hybridStorage';
import { exportToCSV } from './src/utils/helpers';
import { LanguageProvider } from './src/contexts/LanguageContext';

// Layout & Auth
import LoginScreen from './src/components/auth/LoginScreen';
import Sidebar from './src/components/layout/Sidebar';
import Header from './src/components/layout/Header';

// Common Components
import ProductModal from './src/components/common/ProductModal';
import DeleteModal from './src/components/common/DeleteModal';

// Pages
import Dashboard from './src/pages/Dashboard';
import InventoryPage from './src/pages/Inventory';
import CustomersPage from './src/pages/Customers';
import SuppliersPage from './src/pages/Suppliers';
import WarehousesPage from './src/pages/Warehouses';
import QuotationsPage from './src/pages/Quotations';
import ManufacturingPage from './src/pages/Manufacturing';
import MealReportsPage from './src/pages/MealReports';
import EmployeesManagementPage from './src/pages/EmployeesManagement';
import CategoriesPage from './src/pages/Categories';
import ReportsPage from './src/pages/Reports';
import SettingsPage from './src/pages/Settings';

const App: React.FC = () => {
  // --- State Management ---
  const [lang, setLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRTL, setIsRTL] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({ isLoggedIn: false, currentUser: null });

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [bomList, setBomList] = useState<BOM[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>(undefined);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // --- Effects ---

  // Initial Auth Check
  useEffect(() => {
    const session = AuthDB.getSession();
    setAuthState(session);
    if (!session.isLoggedIn) {
      // Ensure default admin exists
      UserDB.getAll();
    }
  }, []);

  // Update Direction based on Lang
  useEffect(() => {
    setIsRTL(lang === 'ar');
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Load Data - Hybrid (Supabase + localStorage fallback)
  const loadData = useCallback(async () => {
    if (authState.isLoggedIn) {
      try {
        // Load from Supabase with localStorage fallback
        const [
          productsData, activityData, customersData, suppliersData,
          warehousesData, quotationsData, workOrdersData, usersData
        ] = await Promise.all([
          HybridProductDB.getAll(),
          HybridActivityDB.getAll(),
          HybridCustomerDB.getAll(),
          HybridSupplierDB.getAll(),
          HybridWarehouseDB.getAll(),
          HybridQuotationDB.getAll(),
          HybridWorkOrderDB.getAll(),
          HybridUserDB.getAll()
        ]);

        setProducts(productsData);
        setRecentActivity(activityData);
        setCustomers(customersData);
        setSuppliers(suppliersData);
        setWarehouses(warehousesData);
        setQuotations(quotationsData);
        setWorkOrders(workOrdersData);
        setUsers(usersData);
        setBomList(BOMDB.getAll()); // BOM still uses local storage

        console.log(isFirebaseAvailable() ? '✅ بيانات من Firebase' : '📦 بيانات من التخزين المحلي');
        checkNotifications();
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to local storage
        setProducts(ProductDB.getAll());
        setRecentActivity(ActivityDB.getAll());
        setCustomers(CustomerDB.getAll());
        setSuppliers(SupplierDB.getAll());
        setWarehouses(WarehouseDB.getAll());
        setQuotations(QuotationDB.getAll());
        setWorkOrders(WorkOrderDB.getAll());
        setUsers(UserDB.getAll());
        setBomList(BOMDB.getAll());
        checkNotifications();
      }
    }
  }, [authState.isLoggedIn]);

  // Notifications Logic
  const checkNotifications = () => {
    const products = ProductDB.getAll();
    const alerts = [];
    const lowStock = products.filter(p => p.status === 'low_stock').length;
    if (lowStock > 0) alerts.push({ title: lang === 'ar' ? 'تنبيه مخزون' : 'Stock Alert', message: lang === 'ar' ? `يوجد ${lowStock} منتجات منخفضة المخزون` : `${lowStock} products are low stock`, type: 'warning' });

    const outOfStock = products.filter(p => p.status === 'out_of_stock').length;
    if (outOfStock > 0) alerts.push({ title: lang === 'ar' ? 'نفاد مخزون' : 'Stockout Alert', message: lang === 'ar' ? `يوجد ${outOfStock} منتجات نفذت من المخزون` : `${outOfStock} products are out of stock`, type: 'danger' });

    setNotifications(alerts);
  };

  // Load data effect
  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Handlers ---

  const handleLogin = (user: User) => {
    setAuthState({ isLoggedIn: true, currentUser: user });
  };

  const handleLogout = () => {
    AuthDB.logout();
    setAuthState({ isLoggedIn: false, currentUser: null });
    setActiveTab('dashboard');
  };

  // Product Handlers - Using Hybrid (Supabase + localStorage)
  const handleAddProduct = async (productData: any) => {
    const { generateSKU, calculateStatus } = require('./src/utils/helpers');
    const { generateId } = require('./src/utils/helpers');

    const newProduct = {
      ...productData,
      id: generateId(),
      sku: productData.sku || generateSKU(productData.categoryCode, productData.subcategoryCode, productData.dimensions),
      status: calculateStatus(productData.quantity || 0, productData.minQuantity || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await HybridProductDB.add(newProduct);
    await HybridActivityDB.add('add', lang === 'ar' ? productData.nameAr : productData.nameEn);
    loadData();
    setIsModalOpen(false);
  };

  const handleEditProduct = async (productData: any) => {
    if (editProduct) {
      const { calculateStatus } = require('./src/utils/helpers');

      const updatedData = {
        ...productData,
        status: calculateStatus(productData.quantity || 0, productData.minQuantity || 0)
      };

      await HybridProductDB.update(editProduct.id, updatedData);
      await HybridActivityDB.add('update', lang === 'ar' ? productData.nameAr : productData.nameEn);
      loadData();
      setIsModalOpen(false);
      setEditProduct(undefined);
    }
  };

  const handleDeleteProduct = async () => {
    if (deleteProduct) {
      await HybridProductDB.delete(deleteProduct.id);
      await HybridActivityDB.add('delete', lang === 'ar' ? deleteProduct.nameAr : deleteProduct.nameEn);
      loadData();
      setDeleteProduct(null);
    }
  };

  // Customer Handlers - Using Hybrid
  const handleAddCustomer = async (data: any) => { await HybridCustomerDB.add({ ...data, id: `CUS-${Date.now()}`, code: HybridCustomerDB.generateCode(), balance: 0, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); loadData(); };
  const handleEditCustomer = async (id: string, data: any) => { await HybridCustomerDB.update(id, data); loadData(); };
  const handleDeleteCustomer = async (id: string) => { await HybridCustomerDB.delete(id); loadData(); };

  // Supplier Handlers - Using Hybrid
  const handleAddSupplier = async (data: any) => { await HybridSupplierDB.add({ ...data, id: `SUP-${Date.now()}`, code: HybridSupplierDB.generateCode(), balance: 0, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); loadData(); };
  const handleEditSupplier = async (id: string, data: any) => { await HybridSupplierDB.update(id, data); loadData(); };
  const handleDeleteSupplier = async (id: string) => { await HybridSupplierDB.delete(id); loadData(); };

  // Warehouse Handlers - Using Hybrid
  const handleAddWarehouse = async (data: any) => { await HybridWarehouseDB.add({ ...data, id: `WH-${Date.now()}`, code: HybridWarehouseDB.generateCode() }); loadData(); };
  const handleEditWarehouse = async (id: string, data: any) => { await HybridWarehouseDB.update(id, data); loadData(); };
  const handleDeleteWarehouse = async (id: string) => { await HybridWarehouseDB.delete(id); loadData(); };

  // Quotation & Manufacturing - Using Hybrid
  const handleSaveQuotation = async (data: any) => { await HybridQuotationDB.add({ ...data, id: `QT-${Date.now()}`, quotationNumber: HybridQuotationDB.generateNumber(), status: 'draft', date: new Date().toISOString(), createdAt: new Date().toISOString(), validUntil: new Date(Date.now() + 7 * 86400000).toISOString() }); loadData(); };
  const handleDeleteQuotation = async (id: string) => { await HybridQuotationDB.delete(id); loadData(); };

  const handleSaveBOM = (data: any) => { BOMDB.add({ ...data, id: `BOM-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); loadData(); };
  const handleDeleteBOM = (id: string) => { BOMDB.delete(id); loadData(); };

  const handleSaveWorkOrder = async (data: any) => {
    let orderNumber = data.orderNumber;
    if (!orderNumber) {
      orderNumber = await HybridWorkOrderDB.generateOrderNumber();
    }

    let jobOrderNumber = data.jobOrderNumber;
    if (!jobOrderNumber) {
      jobOrderNumber = await HybridWorkOrderDB.generateJobOrderNumber();
    }

    await HybridWorkOrderDB.add({
      ...data,
      id: `WO-${Date.now()}`,
      orderNumber,
      jobOrderNumber,
      jobOrderDate: data.jobOrderDate || new Date().toISOString(),
      items: data.items || [],
      materials: data.materials || [],
      status: 'planned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    loadData();
  };
  const handleUpdateWorkOrder = async (id: string, data: any) => {
    console.log('🔄 handleUpdateWorkOrder called with:', { id, data });
    try {
      await HybridWorkOrderDB.update(id, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Update complete, calling loadData...');
      loadData();
    } catch (error) {
      console.error('Failed to update work order:', error);
      alert(lang === 'ar' ? 'فشل تحديث أمر العمل' : 'Failed to update user');
    }
  };
  const handleDeleteWorkOrder = async (id: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الأمر؟' : 'Are you sure you want to delete this order?')) {
      await HybridWorkOrderDB.delete(id);
      loadData();
    }
  };

  const handleExecuteWorkOrder = async (id: string) => {
    const result = await HybridWorkOrderDB.executeWorkOrder(id);
    if (result.success) {
      alert(lang === 'ar' ? result.message : 'Work order executed successfully!');
      loadData();
    } else {
      alert(lang === 'ar'
        ? `${result.message}${result.unavailableItems ? '\n' + result.unavailableItems.join('\n') : ''} `
        : `${result.message}${result.unavailableItems ? '\n' + result.unavailableItems.join('\n') : ''} `);
    }
  };

  // Settings Handlers
  const handleSaveSettings = (newSettings: any) => { /* Implement settings save */ console.log(newSettings); }; // Placeholder
  const handleUpdateUsers = (updatedUsers: User[]) => { UserDB.save(updatedUsers); setUsers(updatedUsers); };
  const handleBackup = () => { /* Implement backup */ alert(lang === 'ar' ? 'تم إنشاء نسخة احتياطية' : 'Backup created'); };
  const handleRestore = () => { /* Implement restore */ document.getElementById('restore-input')?.click(); };
  const handleReset = () => { if (confirm(lang === 'ar' ? 'هل أنت متأكد؟ سيتم حذف جميع البيانات!' : 'Are you sure? All data will be deleted!')) { localStorage.clear(); window.location.reload(); } };


  // Filtered Products for Inventory
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = (p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory ? p.categoryCode === filterCategory : true;
      const matchesStatus = filterStatus ? p.status === filterStatus : true;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, filterCategory, filterStatus]);

  if (!authState.isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} lang={lang} />;
  }

  return (
    <div className={`flex h-screen text-slate-900 bg-slate-50 ${isRTL ? 'font-cairo' : 'font-inter'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        isRTL={isRTL}
        currentUser={authState.currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col">
        <Header
          lang={lang}
          setLang={setLang}
          titleAr={
            activeTab === 'dashboard' ? 'لوحة المعلومات' :
              activeTab === 'inventory' ? 'إدارة المخزون' :
                activeTab === 'customers' ? 'إدارة العملاء' :
                  activeTab === 'suppliers' ? 'إدارة الموردين' :
                    activeTab === 'warehouses' ? 'المخازن' :
                      activeTab === 'manufacturing' ? 'التصنيع' :
                        activeTab === 'mealReports' ? 'تقارير الوجبات' :
                          activeTab === 'reports' ? 'التقارير' : 'النظام'
          }
          titleEn={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard lang={lang} products={products} recentActivity={recentActivity} />}

          {activeTab === 'inventory' && (
            <InventoryPage
              lang={lang}
              products={filteredProducts}
              onAddClick={() => { setEditProduct(undefined); setIsModalOpen(true); }}
              onEditClick={(p: Product) => { setEditProduct(p); setIsModalOpen(true); }}
              onDeleteClick={(p: Product) => setDeleteProduct(p)}
              filterCategory={filterCategory} setFilterCategory={setFilterCategory}
              filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            />
          )}

          {activeTab === 'customers' && <CustomersPage lang={lang} customers={customers} onAdd={handleAddCustomer} onEdit={handleEditCustomer} onDelete={handleDeleteCustomer} />}
          {activeTab === 'suppliers' && <SuppliersPage lang={lang} suppliers={suppliers} onAdd={handleAddSupplier} onEdit={handleEditSupplier} onDelete={handleDeleteSupplier} />}
          {activeTab === 'warehouses' && <WarehousesPage lang={lang} warehouses={warehouses} onAdd={handleAddWarehouse} onEdit={handleEditWarehouse} onDelete={handleDeleteWarehouse} />}



          {activeTab === 'manufacturing' && <ManufacturingPage lang={lang} products={products} customers={customers} workOrders={workOrders} onSaveWorkOrder={handleSaveWorkOrder} onUpdateWorkOrder={handleUpdateWorkOrder} onDeleteWorkOrder={handleDeleteWorkOrder} onExecuteWorkOrder={handleExecuteWorkOrder} onRefresh={loadData} />}
          {activeTab === 'quotations' && <QuotationsPage lang={lang} quotations={quotations} customers={customers} products={products} onSave={handleSaveQuotation} onDelete={handleDeleteQuotation} />}
          {activeTab === 'mealReports' && <MealReportsPage />}
          {activeTab === 'employees' && <EmployeesManagementPage />}

          {activeTab === 'categories' && <CategoriesPage lang={lang} products={products} />}
          {activeTab === 'reports' && <ReportsPage lang={lang} products={products} />}

          {activeTab === 'settings' && <SettingsPage lang={lang} products={products} customers={customers} suppliers={suppliers} users={users} onUpdateUsers={handleUpdateUsers} onSave={handleSaveSettings} onBackup={handleBackup} onRestore={handleRestore} onReset={handleReset} />}
        </main>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lang={lang}
        onSave={editProduct ? handleEditProduct : handleAddProduct}
        editProduct={editProduct}
      />

      <DeleteModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDeleteProduct}
        message={deleteProduct ? (lang === 'ar' ? `هل أنت متأكد من حذف ${deleteProduct.nameAr}؟` : `Are you sure you want to delete ${deleteProduct.nameEn}?`) : ''}
        lang={lang}
      />
    </div>
  );
};

// Wrap App with LanguageProvider
const AppWithLanguage: React.FC = () => (
  <LanguageProvider>
    <App />
  </LanguageProvider>
);

export default AppWithLanguage;