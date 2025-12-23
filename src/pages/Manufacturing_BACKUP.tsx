import React, { useState, useRef } from 'react';
import { Plus, Trash2, Printer, Play, Eye, X, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import { Product, WorkOrder, WorkOrderItem, MaterialRequest, Customer } from '../types';
import { WorkOrderDB } from '../services/storage';
import { AutoCompleteInput } from '../components/AutoCompleteInput';
import { autoCompleteService } from '../services/AutoCompleteService';

interface Props {
    lang: string;
    products: Product[];
    customers: Customer[];
    workOrders: WorkOrder[];
    onSaveWorkOrder: (order: any) => void;
    onDeleteWorkOrder: (id: string) => void;
    onExecuteWorkOrder: (id: string) => void;
    onRefresh: () => void;
}

const ManufacturingPage = ({ lang, products, customers, workOrders, onSaveWorkOrder, onDeleteWorkOrder, onExecuteWorkOrder, onRefresh }: Props) => {
    const [showWOModal, setShowWOModal] = useState(false);
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Work Order Form State
    const [woForm, setWoForm] = useState<{
        orderNumber: string;
        jobOrderNumber: string;
        customerName: string;
        customerId: string;
        priority: 'normal' | 'high' | 'very_high' | 'urgent';
        startDate: string;
        endDate: string;
        items: WorkOrderItem[];
        materials: MaterialRequest[];
        notes: string;
    }>(() => {
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 10);

        return {
            orderNumber: '',
            jobOrderNumber: '',
            customerName: '',
            customerId: '',
            priority: 'normal',
            startDate: today.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            items: [],
            materials: [],
            notes: ''
        };
    });

    const resetForm = () => {
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 10);

        setWoForm({
            orderNumber: WorkOrderDB.generateOrderNumber(),
            jobOrderNumber: WorkOrderDB.generateJobOrderNumber(),
            customerName: '',
            customerId: '',
            priority: 'normal',
            startDate: today.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            items: [{
                id: `item-${Date.now()}`,
                itemName: '',
                quantity: 1,
                unit: 'قطعة',
                dimensions: { height: 0, length: 0, width: 0 },
                modelCode: '',
                paintColor: '',
                paintCode: '',
                glossPercentage: 25,
                veneer: 'NO',
                notes: ''
            }],
            materials: [
                {
                    id: `mat-wood-${Date.now()}`,
                    productName: '',
                    quantity: 1,
                    unit: '',
                    category: 'wood',
                    isManual: true,
                    size: { width: 0, length: 0 }
                },
                {
                    id: `mat-hardware-${Date.now() + 1}`,
                    productName: '',
                    quantity: 1,
                    unit: '',
                    category: 'accessories',
                    isManual: true,
                    notes: ''
                }
            ],
            notes: ''
        });
    };

    const openNewOrderModal = () => {
        resetForm();
        setEditingOrderId(null);
        setWoForm(prev => ({
            ...prev,
            orderNumber: WorkOrderDB.generateOrderNumber(),
            jobOrderNumber: WorkOrderDB.generateJobOrderNumber()
        }));
        setShowWOModal(true);
    };

    // Open Edit Order Modal
    const openEditOrderModal = (order: WorkOrder) => {
        setEditingOrderId(order.id);
        setWoForm({
            orderNumber: order.orderNumber,
            jobOrderNumber: order.jobOrderNumber,
            customerName: order.customerName,
            customerId: order.customerId || '',
            priority: order.priority,
            startDate: order.startDate ? order.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
            endDate: order.endDate ? order.endDate.split('T')[0] : '',
            items: order.items || [],
            materials: order.materials || [],
            notes: order.notes || ''
        });
        setShowWOModal(true);
    };

    // Add Item
    const addItem = () => {
        const newItem: WorkOrderItem = {
            id: `item-${Date.now()}`,
            itemName: '',
            quantity: 1,
            unit: 'قطعة',
            dimensions: { width: 0, length: 0, height: 0 },
            modelCode: '',
            paintColor: '',
            paintCode: '',
            glossPercentage: 25,
            veneer: 'NO',
            notes: ''
        };
        setWoForm({ ...woForm, items: [...woForm.items, newItem] });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...woForm.items];
        if (field.startsWith('dimensions.')) {
            const dimField = field.split('.')[1];
            newItems[index] = {
                ...newItems[index],
                dimensions: { ...newItems[index].dimensions, [dimField]: value }
            };
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        setWoForm({ ...woForm, items: newItems });
    };

    const removeItem = (index: number) => {
        setWoForm({ ...woForm, items: woForm.items.filter((_, i) => i !== index) });
    };

    // Add Material from Products
    const addMaterial = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingIndex = woForm.materials.findIndex(m => m.productId === productId);
        if (existingIndex !== -1) {
            // Update quantity if already exists
            const newMaterials = [...woForm.materials];
            newMaterials[existingIndex].quantity += 1;
            setWoForm({ ...woForm, materials: newMaterials });
        } else {
            // Determine category correctly
            let category: 'wood' | 'accessories' | 'other' = 'other';
            if (product.categoryCode === 'WD') {
                category = 'wood';
            } else if (['HW', 'EB', 'CN', 'TB'].includes(product.categoryCode)) {
                category = 'accessories';
            }

            const newMaterial: MaterialRequest = {
                id: `mat-${Date.now()}`,
                productId: product.id,
                productName: lang === 'ar' ? product.nameAr : product.nameEn,
                quantity: 1,
                unit: product.unit,
                category: category,
                isManual: false
            };
            setWoForm({ ...woForm, materials: [...woForm.materials, newMaterial] });
        }
    };

    // Add Manual Material (not from products database)
    const addManualMaterial = () => {
        const newMaterial: MaterialRequest = {
            id: `mat-${Date.now()}`,
            productName: '',
            quantity: 1,
            unit: 'قطعة',
            category: 'other',
            isManual: true
        };
        setWoForm({ ...woForm, materials: [...woForm.materials, newMaterial] });
    };

    const updateMaterial = (index: number, field: string, value: any) => {
        const newMaterials = [...woForm.materials];
        newMaterials[index] = { ...newMaterials[index], [field]: value };
        setWoForm({ ...woForm, materials: newMaterials });
    };

    const removeMaterial = (index: number) => {
        setWoForm({ ...woForm, materials: woForm.materials.filter((_, i) => i !== index) });
    };

    const handleEndDateSuggestion = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        setWoForm(prev => ({ ...prev, endDate: date.toISOString().split('T')[0] }));
    };

    // Save Work Order
    const handleSaveWO = () => {
        // Validation: Check if customer name is filled
        if (!woForm.customerName || woForm.customerName.trim() === '') {
            alert(lang === 'ar'
                ? '⚠️ يرجى إدخال اسم العميل قبل الحفظ'
                : '⚠️ Please enter customer name before saving');
            return;
        }

        // Validation: Check if at least one item has a name
        const hasValidItems = woForm.items.some(item => item.itemName && item.itemName.trim() !== '');

        // Validation: Check if at least one material has a name
        const hasValidMaterials = woForm.materials.some(mat => mat.productName && mat.productName.trim() !== '');

        if (!hasValidItems && !hasValidMaterials) {
            alert(lang === 'ar'
                ? '⚠️ يرجى إضافة عنصر واحد على الأقل أو مادة واحدة قبل الحفظ'
                : '⚠️ Please add at least one item or material before saving');
            return;
        }

        // Filter out empty items and materials before saving
        const validItems = woForm.items.filter(item => item.itemName && item.itemName.trim() !== '');
        const validMaterials = woForm.materials.filter(mat => mat.productName && mat.productName.trim() !== '');

        if (editingOrderId) {
            // Update existing order
            WorkOrderDB.update(editingOrderId, {
                ...woForm,
                items: validItems,
                materials: validMaterials,
                jobOrderDate: new Date().toISOString(),
            });
            onRefresh();
        } else {
            // Create new order
            const newOrder = {
                ...woForm,
                items: validItems,
                materials: validMaterials,
                jobOrderDate: new Date().toISOString(),
                status: 'planned' as const
            };
            onSaveWorkOrder(newOrder);
        }

        setShowWOModal(false);
        setEditingOrderId(null);
        resetForm();
    };

    // Print Functions
    const openPrintPreview = (order: WorkOrder) => {
        setSelectedOrder(order);
        setShowPrintPreview(true);
    };

    const handlePrint = () => {
        if (printRef.current) {
            const order = selectedOrder!;

            const formatDate = (dateString?: string) => {
                if (!dateString) return '################';
                const date = new Date(dateString);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            };

            const getPriorityColor = () => {
                if (order.priority === 'urgent') return '#ff9999'; // Stronger Red
                if (order.priority === 'very_high') return '#ffcc80'; // Stronger Orange
                if (order.priority === 'high') return '#ffeb99'; // Stronger Yellow
                return '#fff'; // White for Normal
            };

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Job Order - ${order.orderNumber}</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { 
                                font-family: Arial, sans-serif; 
                                font-size: 8pt; 
                                color: #000;
                                padding: 8mm;
                            }
                            
                            table { 
                                width: 100%; 
                                border-collapse: collapse; 
                                margin-bottom: 2px;
                            }
                            
                            th, td { 
                                border: 1px solid #000; 
                                padding: 1px 2px;
                                text-align: center;
                                vertical-align: middle;
                                font-size: 7.5pt;
                                height: 18px;
                                white-space: nowrap;
                                overflow: hidden;
                            }
                            
                            th { 
                                background-color: #d9d9d9; 
                                font-weight: bold; 
                                font-size: 7pt;
                            }
                            
                            .text-left { text-align: left; padding-left: 3px; }
                            .text-right { text-align: right; padding-right: 3px; }
                            
                            .company-header {
                                display: flex;
                                justify-content: space-between;
                                align-items: flex-start;
                                margin-bottom: 5px;
                                padding-bottom: 3px;
                            }
                            
                            .company-info {
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            }
                            
                            .logo-circle {
                                width: 50px;
                                height: 50px;
                                border: 2px solid #8B4513;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 6pt;
                                font-weight: bold;
                                color: #8B4513;
                                text-align: center;
                                line-height: 1.1;
                            }
                            
                            .company-details {
                                font-size: 7pt;
                                line-height: 1.3;
                            }
                            
                            .company-details strong {
                                font-size: 8pt;
                                display: block;
                            }
                            
                            .po-number {
                                text-align: center;
                                font-size: 14pt;
                                font-weight: bold;
                                flex: 1;
                                padding-top: 15px;
                            }
                            
                            .arabic-info {
                                text-align: right;
                                font-size: 6.5pt;
                                line-height: 1.3;
                                direction: rtl;
                            }
                            
                            .header-table td {
                                font-weight: bold;
                                font-size: 7.5pt;
                                padding: 3px;
                            }
                            
                            @media print {
                                @page { size: portrait; margin: 5mm; }
                                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body>
                        <!-- Company Header with Logo -->
                        <div class="company-header">
                            <div class="company-info">
                                <img src="/LOGO11.png" style="height: 50px; width: 50px;" alt="Logo" onerror="this.style.display='none'"/>
                                <div class="company-details">
                                    <strong>FOREST EDGE FACTORY</strong>
                                    Saudi Arabia - Riyadh<br>
                                    C.R: 7050835193<br>
                                    Vat No.: 313142044200003
                                </div>
                            </div>
                            
                            <div class="po-number">${order.orderNumber}</div>
                            
                            <div class="arabic-info">
                                المملكة العربية السعودية – الرياض<br>
                                منطقة الخرج الصناعية بالرياض<br>
                                حي المعذر الشمالي لالامير تركي بن عبد العزيز<br>
                                س ت: 7050835193<br>
                                رقم ضريبي: 313142044200003
                            </div>
                        </div>

                        <!-- Header Table -->
                        <table class="header-table">
                            <tr>
                                <th style="width: 14%;">Job Order Date</th>
                                <th style="width: 14%;">Job Order No.</th>
                                <th style="width: 28%;">CLIENT</th>
                                <th style="width: 14%;">Start Date</th>
                                <th style="width: 20%;">End Date</th>
                                <th style="width: 10%;">Priority</th>
                            </tr>
                            <tr>
                                <td>${formatDate(order.jobOrderDate)}</td>
                                <td>${order.jobOrderNumber}</td>
                                <td>${order.customerName}</td>
                                <td>${formatDate(order.startDate)}</td>
                                <td>${order.endDate ? formatDate(order.endDate) : '################'}</td>
                                <td style="background-color: ${getPriorityColor()}">${order.priority === 'very_high' ? 'Very High' : order.priority === 'high' ? 'High' : order.priority === 'urgent' ? 'Urgent' : 'Normal'}</td>
                            </tr>
                        </table>

                        <!-- Items Table -->
                        <table>
                            <thead>
                                <tr>
                                    <th rowspan="2" style="width: 3%;">NO.</th>
                                    <th rowspan="2" style="width: 22%;">ITEM</th>
                                    <th rowspan="2" style="width: 4%;">Q.T.Y</th>
                                    <th colspan="3" style="width: 12%;">FINAL DIM. (mm)</th>
                                    <th rowspan="2" style="width: 10%;">MODEL CODE</th>
                                    <th colspan="2" style="width: 16%;">PAINT</th>
                                    <th rowspan="2" style="width: 6%;">GLOSSY %</th>
                                    <th rowspan="2" style="width: 5%;">VENEER</th>
                                    <th rowspan="2" style="width: 15%;">NOTE</th>
                                </tr>
                                <tr>
                                    <th style="width: 4%;">H</th>
                                    <th style="width: 4%;">L</th>
                                    <th style="width: 4%;">W</th>
                                    <th style="width: 8%;">COLOR</th>
                                    <th style="width: 8%;">CODE</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(() => {
                        const minRows = 12;
                        const totalRows = Math.max(order.items.length, minRows);
                        return Array.from({ length: totalRows }).map((_, index) => {
                            const item = order.items[index];
                            return `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td class="text-left">${item?.itemName || ''}</td>
                                            <td>${item?.quantity || ''}</td>
                                            <td>${item?.dimensions?.height || ''}</td>
                                            <td>${item?.dimensions?.length || ''}</td>
                                            <td>${item?.dimensions?.width || ''}</td>
                                            <td>${item?.modelCode || ''}</td>
                                            <td>${item?.paintColor || ''}</td>
                                            <td style="font-size: 6.5pt;">${item?.paintCode || ''}</td>
                                            <td>${item ? item.glossPercentage + '%' : ''}</td>
                                            <td>${item?.veneer || ''}</td>
                                            <td class="text-left" style="font-size: 6.5pt;">${item?.notes || ''}</td>
                                        </tr>`;
                        }).join('');
                    })()}
                            </tbody>
                        </table>

                        ${order.materials && order.materials.length > 0 ? `
                        <!-- Material Request Section -->
                        <div style="margin-top: 4px;">
                            <div style="background-color: #d9d9d9; border: 1px solid #000; text-align: center; padding: 3px; font-weight: bold; font-size: 8pt;">
                                MATERIAL REQUEST
                            </div>
                            
                            <table style="margin-bottom: 0;">
                                <tr>
                                    <!-- WOOD Section -->
                                    <td rowspan="100" style="width: 3%; background-color: #d9d9d9; padding: 0; border-right: 2px solid #000;">
                                        <div style="writing-mode: vertical-rl; transform: rotate(180deg); font-weight: bold; font-size: 8pt; padding: 12px 2px;">WOOD</div>
                                    </td>
                                    <th style="width: 20%;">MATERIAL NAME</th>
                                    <th style="width: 5%;">QTY</th>
                                    <th style="width: 6%;">UNIT</th>
                                    <th style="width: 4%;">W</th>
                                    <th style="width: 4%;">L</th>
                                    
                                    <!-- ACCESSORIES Section -->
                                    <td rowspan="100" style="width: 3%; background-color: #d9d9d9; padding: 0; border-left: 2px solid #000; border-right: 2px solid #000;">
                                        <div style="writing-mode: vertical-rl; transform: rotate(180deg); font-weight: bold; font-size: 8pt; padding: 12px 2px;">ACCESSORIES</div>
                                    </td>
                                    <th style="width: 20%;">MATERIAL NAME</th>
                                    <th style="width: 5%;">QTY</th>
                                    <th style="width: 30%;">NOTES</th>
                                </tr>
                                ${(() => {
                            const woodMaterials = order.materials.filter(m => m.category === 'wood' || m.category === 'other');
                            const accessoriesMaterials = order.materials.filter(m => m.category === 'accessories');
                            const minRows = 30;
                            const maxRows = Math.max(woodMaterials.length, accessoriesMaterials.length, minRows);

                            return Array.from({ length: maxRows }).map((_, i) => {
                                const wood = woodMaterials[i];
                                const acc = accessoriesMaterials[i];
                                return `
                                        <tr>
                                            <td class="text-left" style="font-size: 7pt;">${wood?.productName || ''}</td>
                                            <td>${wood?.quantity || ''}</td>
                                            <td>${wood?.unit || ''}</td>
                                            <td>${wood?.size?.width || ''}</td>
                                            <td>${wood?.size?.length || ''}</td>
                                            
                                            <td class="text-left" style="font-size: 7pt;">${acc?.productName || ''}</td>
                                            <td>${acc?.quantity || ''}</td>
                                            <td class="text-left" style="font-size: 6.5pt;">${acc?.notes || ''}</td>
                                        </tr>`;
                            }).join('');
                        })()}
                            </table>
                        </div>
                        ` : ''}

                        <!-- Footer -->
                        <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 7.5pt;">
                            <div style="text-align: center;">
                                <div>Prepared By: ___________________</div>
                                <div style="margin-top: 15px; font-weight: bold;">Engneering Dept.</div>
                            </div>
                            <div style="text-align: center;">
                                <div>Engr: Sabry Mahfouz</div>
                                <div style="margin-top: 15px; font-weight: bold;">Operation Manager</div>
                            </div>
                            <div style="text-align: center;">
                                <div>Recived By: ___________________</div>
                                <div style="margin-top: 15px; font-weight: bold;">Production Dept.</div>
                            </div>
                        </div>
                    </body>
                    </html>
                `);
                printWindow.document.close();
                setTimeout(() => printWindow.print(), 500);
            }
        }
    };

    const getPriorityLabel = (priority: string) => {
        const labels: any = {
            normal: { ar: 'عادي', en: 'Normal' },
            high: { ar: 'عالي', en: 'High' },
            very_high: { ar: 'عالي جداً', en: 'Very High' },
            urgent: { ar: 'عاجل', en: 'Urgent' }
        };
        return lang === 'ar' ? labels[priority]?.ar : labels[priority]?.en;
    };

    const getStatusLabel = (status: string) => {
        const labels: any = {
            planned: { ar: 'مخطط', en: 'Planned', color: 'bg-slate-100 text-slate-700' },
            in_progress: { ar: 'قيد التنفيذ', en: 'In Progress', color: 'bg-blue-100 text-blue-700' },
            completed: { ar: 'مكتمل', en: 'Completed', color: 'bg-green-100 text-green-700' },
            cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'bg-red-100 text-red-700' }
        };
        return labels[status] || labels.planned;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">{lang === 'ar' ? 'أوامر العمل' : 'Work Orders'}</h2>
                <button onClick={openNewOrderModal} className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition-colors">
                    <Plus size={18} /> {lang === 'ar' ? 'أمر عمل جديد' : 'New Work Order'}
                </button>
            </div>

            {/* Work Orders List */}
            <div className="space-y-3">
                {workOrders.length === 0 ? (
                    <div className="bg-white rounded-xl border p-12 text-center text-slate-400">
                        <p>{lang === 'ar' ? 'لا توجد أوامر عمل حتى الآن' : 'No work orders yet'}</p>
                    </div>
                ) : (
                    workOrders.map((wo) => {
                        const statusInfo = getStatusLabel(wo.status);
                        const isExpanded = expandedOrder === wo.id;

                        return (
                            <div key={wo.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
                                {/* Header Row */}
                                <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : wo.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-slate-800 font-mono">{wo.orderNumber}</p>
                                            <p className="text-xs text-slate-400">{wo.jobOrderNumber}</p>
                                        </div>
                                        <div className="border-r border-slate-200 h-10 mx-2"></div>
                                        <div>
                                            <p className="font-semibold text-slate-700">{wo.customerName}</p>
                                            <p className="text-xs text-slate-400">{new Date(wo.jobOrderDate).toLocaleDateString('ar-SA')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                            {lang === 'ar' ? statusInfo.ar : statusInfo.en}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs ${wo.priority === 'urgent' || wo.priority === 'very_high' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {getPriorityLabel(wo.priority)}
                                        </span>
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t px-4 py-3 bg-slate-50">
                                        {/* Items Summary */}
                                        <div className="mb-3">
                                            <p className="text-xs font-medium text-slate-500 mb-1">{lang === 'ar' ? 'العناصر:' : 'Items:'}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {wo.items?.slice(0, 3).map((item, idx) => (
                                                    <span key={idx} className="bg-white px-2 py-1 rounded text-xs border">
                                                        {item.itemName} ({item.quantity})
                                                    </span>
                                                ))}
                                                {wo.items?.length > 3 && (
                                                    <span className="text-xs text-slate-400">+{wo.items.length - 3} {lang === 'ar' ? 'أخرى' : 'more'}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Materials Summary */}
                                        <div className="mb-3">
                                            <p className="text-xs font-medium text-slate-500 mb-1">{lang === 'ar' ? 'المواد المطلوبة:' : 'Materials:'}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {wo.materials?.slice(0, 4).map((mat, idx) => (
                                                    <span key={idx} className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs border border-amber-200">
                                                        {mat.productName}: {mat.quantity} {mat.unit}
                                                    </span>
                                                ))}
                                                {wo.materials?.length > 4 && (
                                                    <span className="text-xs text-slate-400">+{wo.materials.length - 4}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2 border-t">
                                            <button onClick={() => openPrintPreview(wo)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm">
                                                <Printer size={14} /> {lang === 'ar' ? 'طباعة' : 'Print'}
                                            </button>
                                            {wo.status !== 'completed' && wo.status !== 'cancelled' && (
                                                <button onClick={(e) => { e.stopPropagation(); openEditOrderModal(wo); }} className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 text-sm">
                                                    <Edit3 size={14} /> {lang === 'ar' ? 'تعديل' : 'Edit'}
                                                </button>
                                            )}
                                            {(wo.status === 'planned' || !wo.status) && (
                                                <button onClick={() => onExecuteWorkOrder(wo.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm">
                                                    <Play size={14} /> {lang === 'ar' ? 'تنفيذ وصرف المواد' : 'Execute & Deduct'}
                                                </button>
                                            )}
                                            <button onClick={() => onDeleteWorkOrder(wo.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm mr-auto">
                                                <Trash2 size={14} /> {lang === 'ar' ? 'حذف' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* New/Edit Work Order Modal */}
            {showWOModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl w-full max-w-[75vw] max-h-[95vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg">{editingOrderId ? (lang === 'ar' ? 'تعديل أمر العمل' : 'Edit Work Order') : (lang === 'ar' ? 'أمر عمل جديد' : 'New Work Order')}</h3>
                            <button onClick={() => { setShowWOModal(false); setEditingOrderId(null); resetForm(); }} className="p-1 hover:bg-slate-200 rounded"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Basic Info - Redesigned with Work Order No. on top */}
                            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl p-6 shadow-sm">
                                {/* Row 1: Work Order Number Only (Most Important) */}
                                <div className="mb-5 flex flex-col items-center">
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide text-center">{lang === 'ar' ? 'رقم أمر العمل' : 'Work Order No.'}</label>
                                    <input type="text" value={woForm.orderNumber} onChange={e => setWoForm({ ...woForm, orderNumber: e.target.value })}
                                        className="w-full max-w-md border-3 border-blue-500 rounded-lg px-5 py-4 text-base font-mono font-bold bg-white text-blue-700 focus:border-blue-600 focus:ring-3 focus:ring-blue-300 transition-all shadow-md text-center" />
                                </div>

                                {/* Row 2: All Other Fields in One Row */}
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">{lang === 'ar' ? 'رقم الطلب' : 'Job Order'}</label>
                                        <input type="text" value={woForm.jobOrderNumber} onChange={e => setWoForm({ ...woForm, jobOrderNumber: e.target.value })}
                                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm font-mono font-semibold bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                                            {lang === 'ar' ? 'اسم العميل' : 'Customer'} <span className="text-red-500">*</span>
                                        </label>
                                        <AutoCompleteInput
                                            value={woForm.customerName}
                                            onChange={(value) => setWoForm({ ...woForm, customerName: value })}
                                            suggestions={autoCompleteService.getSuggestions('customers')}
                                            placeholder={lang === 'ar' ? 'اسم العميل' : 'Customer Name'}
                                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">{lang === 'ar' ? 'الأولوية' : 'Priority'}</label>
                                        <select value={woForm.priority} onChange={e => setWoForm({ ...woForm, priority: e.target.value as any })}
                                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all shadow-sm">
                                            <option value="normal">{lang === 'ar' ? 'عادي' : 'Normal'}</option>
                                            <option value="high">{lang === 'ar' ? 'عالي' : 'High'}</option>
                                            <option value="very_high">{lang === 'ar' ? 'عالي جداً' : 'Very High'}</option>
                                            <option value="urgent">{lang === 'ar' ? 'عاجل' : 'Urgent'}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">{lang === 'ar' ? 'تاريخ البدء' : 'Start Date'}</label>
                                        <input type="date" value={woForm.startDate} onChange={e => setWoForm({ ...woForm, startDate: e.target.value })}
                                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">{lang === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}</label>
                                        <div className="flex flex-col gap-1.5">
                                            <input type="date" value={woForm.endDate} onChange={e => setWoForm({ ...woForm, endDate: e.target.value })}
                                                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all shadow-sm" />
                                            <div className="flex gap-1">
                                                {[5, 10, 15, 30].map(d => (
                                                    <button key={d} type="button" onClick={() => handleEndDateSuggestion(d)}
                                                        className="flex-1 px-1.5 py-1 bg-white hover:bg-blue-50 text-xs rounded border-2 border-slate-300 hover:border-blue-400 text-slate-700 font-bold transition-all shadow-sm">
                                                        +{d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Items Section */}
                                <div className="border-2 border-slate-300 rounded-lg overflow-hidden shadow-sm">
                                    <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-5 py-3 flex justify-center items-center border-b-2 border-slate-300 relative">
                                        <h4 className="font-bold text-base text-slate-800">{lang === 'ar' ? 'المنتجات المطلوب تصنيعها' : 'Items to Manufacture'}</h4>
                                        <button onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm absolute right-5">
                                            <Plus size={16} /> {lang === 'ar' ? 'إضافة' : 'Add'}
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs border-collapse">
                                            <thead className="bg-slate-200">
                                                <tr>
                                                    <th rowSpan={2} className="border-2 border-slate-400 px-3 py-2 text-center w-8 font-bold text-slate-800">NO.</th>
                                                    <th rowSpan={2} className="border-2 border-slate-400 px-3 py-2 text-center min-w-[150px] font-bold text-slate-800">ITEM</th>
                                                    <th rowSpan={2} className="border-2 border-slate-400 px-3 py-2 text-center w-12 font-bold text-slate-800">Q.T.Y</th>
                                                    <th colSpan={3} className="border-2 border-slate-400 px-3 py-2 text-center font-bold text-slate-800">FINAL DIM. (cm)</th>
                                                    <th rowSpan={2} className="border-2 border-slate-400 px-3 py-2 text-center min-w-[110px] font-bold text-slate-800">MODEL CODE</th>
                                                    <th colSpan={2} className="border-2 border-slate-400 px-3 py-2 text-center font-bold text-slate-800">PAINT</th>
                                                    <th rowSpan={2} className="border-2 border-slate-400 px-3 py-2 text-center w-14 font-bold text-slate-800">GLOSSY %</th>
                                                    <th rowSpan={2} className="border-2 border-slate-400 px-3 py-2 text-center w-20 font-bold text-slate-800">VENEER</th>
                                                    <th rowSpan={2} className="border-2 border-slate-400 px-3 py-2 text-center min-w-[150px] font-bold text-slate-800">NOTES</th>
                                                    <th rowSpan={2} className="border-2 border-slate-400 px-2 py-2 w-14"></th>
                                                </tr>
                                                <tr>
                                                    <th className="border-2 border-slate-400 px-3 py-2 text-center w-14 font-bold text-slate-800">W</th>
                                                    <th className="border-2 border-slate-400 px-3 py-2 text-center w-14 font-bold text-slate-800">L</th>
                                                    <th className="border-2 border-slate-400 px-3 py-2 text-center w-14 font-bold text-slate-800">H</th>
                                                    <th className="border-2 border-slate-400 px-3 py-2 text-center min-w-[100px] font-bold text-slate-800">COLOR</th>
                                                    <th className="border-2 border-slate-400 px-3 py-2 text-center min-w-[110px] font-bold text-slate-800">CODE</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {woForm.items.map((item, idx) => (
                                                    <tr key={item.id} className="border-t-2 hover:bg-blue-50 transition-colors">
                                                        <td className="border-2 border-slate-300 px-3 py-2 text-center font-medium">{idx + 1}</td>
                                                        <td className="border-2 border-slate-300 px-2 py-2">
                                                            <AutoCompleteInput
                                                                value={item.itemName}
                                                                onChange={(value) => updateItem(idx, 'itemName', value)}
                                                                suggestions={autoCompleteService.getSuggestions('itemNames', item.itemName)}
                                                                placeholder={lang === 'ar' ? 'اسم المنتج' : 'Item Name'}
                                                                className="w-full border-2 border-slate-300 rounded px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                            />
                                                        </td>
                                                        <td className="border-2 border-slate-300 px-2 py-2">
                                                            <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                                                className="w-full border-2 border-slate-300 rounded px-2 py-2 text-xs text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" min="1" />
                                                        </td>
                                                        <td className="border-2 border-slate-300 px-2 py-2">
                                                            <input type="number" value={item.dimensions?.width || ''} onChange={e => updateItem(idx, 'dimensions.width', Number(e.target.value))}
                                                                className="w-full border-2 border-slate-300 rounded px-2 py-2 text-xs text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="W" />
                                                        </td>
                                                        <td className="border-2 border-slate-300 px-2 py-2">
                                                            <input type="number" value={item.dimensions?.length || ''} onChange={e => updateItem(idx, 'dimensions.length', Number(e.target.value))}
                                                                className="w-full border-2 border-slate-300 rounded px-2 py-2 text-xs text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="L" />
                                                        </td>
                                                        <td className="border-2 border-slate-300 px-2 py-2">
                                                            <input type="number" value={item.dimensions?.height || ''} onChange={e => updateItem(idx, 'dimensions.height', Number(e.target.value))}
                                                                className="w-full border-2 border-slate-300 rounded px-2 py-2 text-xs text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="H" />
                                                        </td>
                                                        <td className="border-2 border-slate-300 px-2 py-2">
                                                            <AutoCompleteInput
                                                                value={item.modelCode || ''}
                                                                onChange={(value) => updateItem(idx, 'modelCode', value)}
                                                                suggestions={autoCompleteService.getSuggestions('modelCodes', item.modelCode)}
                                                                placeholder="Code"
                                                                className="w-full border-2 border-slate-300 rounded px-2 py-2 text-xs text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                            />
                                                        </td>
                                                        <td className="border-2 border-slate-300 px-2 py-2">
                                                            <AutoCompleteInput
                                                                value={item.paintColor || ''}
                                                                onChange={(value) => updateItem(idx, 'paintColor', value)}
                                                                suggestions={autoCompleteService.getSuggestions('commonPhrases', item.paintColor)}
                                                                placeholder="Color"
                                                                className="w-full border-2 border-slate-300 rounded px-2 py-2 text-xs text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                            />
                                                        </td>
                                                        <td className="border-2 border-slate-300 px-2 py-2">
                                                            <AutoCompleteInput
                                                                value={item.paintCode || ''}
                                                                onChange={(value) => updateItem(idx, 'paintCode', value)}
                                                                suggestions={autoCompleteService.getSuggestions('paintCodes', item.paintCode)}
                                                                placeholder="Paint Code"
                                                                className="w-full border-2 border-slate-300 rounded px-2 py-2 text-xs text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                            />
                                                        </td>
                                                        <td className="border-2 border-slate-300 px-2 py-2">
                                                            <input type="number" value={item.glossPercentage || 25} onChange={e => updateItem(idx, 'glossPercentage', Number(e.target.value))}
                                                                className="w-full border-2 border-slate-300 rounded px-2 py-2 text-xs text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" min="0" max="100" />
                                                        </td>
                                                        <td className="border-2 border-slate-300 px-2 py-2">
                                                            <select value={item.veneer || 'NO'} onChange={e => updateItem(idx, 'veneer', e.target.value)}
                                                                className="w-full border-2 border-slate-300 rounded px-2 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                                                                <option value="NO">NO</option>
                                                                <option value="YES">YES</option>
                                                            </select>
                                                        </td>
                                                        <td className="border-2 border-slate-300 px-2 py-2">
                                                            <AutoCompleteInput
                                                                value={item.notes || ''}
                                                                onChange={(value) => updateItem(idx, 'notes', value)}
                                                                suggestions={autoCompleteService.getSuggestions('commonPhrases', item.notes)}
                                                                placeholder={lang === 'ar' ? 'ملاحظات' : 'Notes'}
                                                                className="w-full border-2 border-slate-300 rounded px-2 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                            />
                                                        </td>
                                                        <td className="border-2 border-slate-300 px-2 py-2">
                                                            <button onClick={() => removeItem(idx)} className="text-red-600 hover:bg-red-100 p-1.5 rounded transition-colors">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>


                                {/* Materials Section - 2 Tables: Wood & Hardware */}
                                <div className="space-y-4">
                                    {/* Wood Materials Table */}
                                    <div className="border-2 border-stone-200 rounded-lg overflow-hidden shadow-sm">
                                        <div className="bg-gradient-to-r from-stone-50 to-amber-50 px-5 py-3 flex justify-center items-center border-b-2 border-stone-200 relative">
                                            <h4 className="font-bold text-base text-stone-700">{lang === 'ar' ? 'المواد الخشبية (Wood Materials)' : 'Wood Materials'}</h4>
                                            <button onClick={() => { const newMat: MaterialRequest = { id: `mat-${Date.now()}`, productName: '', quantity: 1, unit: 'لوح', category: 'wood', isManual: true, size: { width: 0, length: 0 } }; setWoForm({ ...woForm, materials: [...woForm.materials, newMat] }); }} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 flex items-center gap-2 transition-colors shadow-sm absolute right-5">
                                                <Plus size={16} /> {lang === 'ar' ? 'إضافة' : 'Add'}
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            {woForm.materials.filter(m => m.category === 'wood').length > 0 ? (
                                                <table className="w-full text-xs border-collapse">
                                                    <thead className="bg-stone-100">
                                                        <tr>
                                                            <th className="border-2 border-stone-300 px-3 py-2 text-center w-8 font-bold text-stone-700">NO.</th>
                                                            <th className="border-2 border-stone-300 px-3 py-2 text-right font-bold text-stone-700">{lang === 'ar' ? 'اسم المادة' : 'Material Name'}</th>
                                                            <th className="border-2 border-stone-300 px-3 py-2 text-center w-20 font-bold text-stone-700">{lang === 'ar' ? 'الكمية' : 'QTY'}</th>
                                                            <th className="border-2 border-stone-300 px-3 py-2 text-center w-24 font-bold text-stone-700">{lang === 'ar' ? 'الوحدة' : 'Unit'}</th>
                                                            <th className="border-2 border-stone-300 px-3 py-2 text-center w-20 font-bold text-stone-700">{lang === 'ar' ? 'العرض' : 'Width'}</th>
                                                            <th className="border-2 border-stone-300 px-3 py-2 text-center w-20 font-bold text-stone-700">{lang === 'ar' ? 'الطول' : 'Length'}</th>
                                                            <th className="border-2 border-stone-300 px-2 py-2 w-10"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {woForm.materials.map((mat, idx) => mat.category === 'wood' && (
                                                            <tr key={mat.id} className="border-t-2 hover:bg-amber-50 transition-colors">
                                                                <td className="border-2 border-stone-200 px-3 py-2 text-center font-medium">{woForm.materials.filter(m => m.category === 'wood').indexOf(mat) + 1}</td>
                                                                <td className="border-2 border-stone-200 px-2 py-2">
                                                                    <input type="text" value={mat.productName} onChange={e => updateMaterial(idx, 'productName', e.target.value)}
                                                                        className="w-full border-2 border-stone-200 rounded px-3 py-2 text-xs focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                                                                        placeholder={lang === 'ar' ? 'اسم المادة' : 'Material Name'} />
                                                                </td>
                                                                <td className="border-2 border-stone-200 px-2 py-2">
                                                                    <input type="number" value={mat.quantity} onChange={e => updateMaterial(idx, 'quantity', Number(e.target.value))}
                                                                        className="w-full border-2 border-stone-200 rounded px-2 py-2 text-xs text-center focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" min="0.1" step="0.1" />
                                                                </td>
                                                                <td className="border-2 border-stone-200 px-2 py-2">
                                                                    <AutoCompleteInput
                                                                        value={mat.unit}
                                                                        onChange={(value) => updateMaterial(idx, 'unit', value)}
                                                                        suggestions={autoCompleteService.getSuggestions('units', mat.unit)}
                                                                        placeholder={lang === 'ar' ? 'الوحدة' : 'Unit'}
                                                                        className="w-full border-2 border-stone-200 rounded px-2 py-2 text-xs text-center focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                                                                    />
                                                                </td>
                                                                <td className="border-2 border-stone-200 px-2 py-2">
                                                                    <input type="number" value={mat.size?.width || ''} onChange={e => updateMaterial(idx, 'size', { ...mat.size, width: Number(e.target.value) })}
                                                                        className="w-full border-2 border-stone-200 rounded px-2 py-2 text-xs text-center focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                                                                        placeholder="W" />
                                                                </td>
                                                                <td className="border-2 border-stone-200 px-2 py-2">
                                                                    <input type="number" value={mat.size?.length || ''} onChange={e => updateMaterial(idx, 'size', { ...mat.size, length: Number(e.target.value) })}
                                                                        className="w-full border-2 border-stone-200 rounded px-2 py-2 text-xs text-center focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                                                                        placeholder="L" />
                                                                </td>
                                                                <td className="border-2 border-stone-200 px-2 py-2">
                                                                    <button onClick={() => removeMaterial(idx)} className="text-red-600 hover:bg-red-100 p-1.5 rounded transition-colors">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className="text-center text-slate-400 text-sm py-4 font-medium">{lang === 'ar' ? 'لا توجد مواد خشبية' : 'No wood materials'}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hardware/Accessories Table */}
                                    <div className="border-2 border-[#D4DFFC] rounded-lg overflow-hidden shadow-sm">
                                        <div className="px-5 py-3 flex justify-center items-center border-b-2 border-[#D4DFFC] relative" style={{ background: 'linear-gradient(to right, #E5EAFE, #EEF2FF)' }}>
                                            <h4 className="font-bold text-base text-slate-700">{lang === 'ar' ? 'الهاردوير والإكسسوارات (Hardware & Accessories)' : 'Hardware & Accessories'}</h4>
                                            <button onClick={() => { const newMat: MaterialRequest = { id: `mat-${Date.now()}`, productName: '', quantity: 1, unit: 'قطعة', category: 'accessories', isManual: true }; setWoForm({ ...woForm, materials: [...woForm.materials, newMat] }); }} className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 flex items-center gap-2 transition-colors shadow-sm absolute right-5">
                                                <Plus size={16} /> {lang === 'ar' ? 'إضافة' : 'Add'}
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            {woForm.materials.filter(m => m.category === 'accessories').length > 0 ? (
                                                <table className="w-full text-xs border-collapse">
                                                    <thead style={{ backgroundColor: '#E5EAFE' }}>
                                                        <tr>
                                                            <th className="border-2 border-[#D4DFFC] px-3 py-2 text-center w-8 font-bold text-slate-700">NO.</th>
                                                            <th className="border-2 border-[#D4DFFC] px-3 py-2 text-right font-bold text-slate-700">{lang === 'ar' ? 'اسم المادة' : 'Material Name'}</th>
                                                            <th className="border-2 border-[#D4DFFC] px-3 py-2 text-center w-20 font-bold text-slate-700">{lang === 'ar' ? 'الكمية' : 'QTY'}</th>
                                                            <th className="border-2 border-[#D4DFFC] px-3 py-2 text-center w-24 font-bold text-slate-700">{lang === 'ar' ? 'الوحدة' : 'Unit'}</th>
                                                            <th className="border-2 border-[#D4DFFC] px-3 py-2 font-bold text-slate-700">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</th>
                                                            <th className="border-2 border-[#D4DFFC] px-2 py-2 w-10"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {woForm.materials.map((mat, idx) => mat.category === 'accessories' && (
                                                            <tr key={mat.id} className="border-t-2 transition-colors" style={{ backgroundColor: 'rgba(229, 234, 254, 0.3)' }}>
                                                                <td className="border-2 border-[#D4DFFC] px-3 py-2 text-center font-medium">{woForm.materials.filter(m => m.category === 'accessories').indexOf(mat) + 1}</td>
                                                                <td className="border-2 border-[#D4DFFC] px-2 py-2">
                                                                    <input type="text" value={mat.productName} onChange={e => updateMaterial(idx, 'productName', e.target.value)}
                                                                        className="w-full border-2 border-[#D4DFFC] rounded px-3 py-2 text-xs focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                                                                        placeholder={lang === 'ar' ? 'اسم المادة' : 'Material Name'} />
                                                                </td>
                                                                <td className="border-2 border-[#D4DFFC] px-2 py-2">
                                                                    <input type="number" value={mat.quantity} onChange={e => updateMaterial(idx, 'quantity', Number(e.target.value))}
                                                                        className="w-full border-2 border-[#D4DFFC] rounded px-2 py-2 text-xs text-center focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" min="0.1" step="0.1" />
                                                                </td>
                                                                <td className="border-2 border-[#D4DFFC] px-2 py-2">
                                                                    <AutoCompleteInput
                                                                        value={mat.unit}
                                                                        onChange={(value) => updateMaterial(idx, 'unit', value)}
                                                                        suggestions={autoCompleteService.getSuggestions('units', mat.unit)}
                                                                        placeholder={lang === 'ar' ? 'الوحدة' : 'Unit'}
                                                                        className="w-full border-2 border-[#D4DFFC] rounded px-2 py-2 text-xs text-center focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                                                                    />
                                                                </td>
                                                                <td className="border-2 border-[#D4DFFC] px-2 py-2">
                                                                    <input type="text" value={mat.notes || ''} onChange={e => updateMaterial(idx, 'notes', e.target.value)}
                                                                        className="w-full border-2 border-[#D4DFFC] rounded px-2 py-2 text-xs focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                                                                        placeholder={lang === 'ar' ? 'ملاحظات' : 'Notes'} />
                                                                </td>
                                                                <td className="border-2 border-[#D4DFFC] px-2 py-2">
                                                                    <button onClick={() => removeMaterial(idx)} className="text-red-600 hover:bg-red-100 p-1.5 rounded transition-colors">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className="text-center text-slate-400 text-sm py-4 font-medium">{lang === 'ar' ? 'لا توجد مواد هاردوير' : 'No hardware materials'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="p-4 border-t flex justify-end gap-2 bg-slate-50">
                                <button onClick={() => setShowWOModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-100">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                                <button onClick={handleSaveWO} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">{lang === 'ar' ? 'حفظ أمر العمل' : 'Save Work Order'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Print Preview Modal */}
            {
                showPrintPreview && selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold">{lang === 'ar' ? 'معاينة الطباعة' : 'Print Preview'}</h3>
                                <div className="flex gap-2">
                                    <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                        <Printer size={18} /> {lang === 'ar' ? 'طباعة' : 'Print'}
                                    </button>
                                    <button onClick={() => setShowPrintPreview(false)} className="p-2 hover:bg-slate-200 rounded"><X size={20} /></button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto p-4 bg-slate-100">
                                <div ref={printRef} className="bg-white mx-auto" style={{ width: '210mm', fontFamily: 'Arial, sans-serif', fontSize: '8pt', padding: '8mm', color: '#000' }}>
                                    {/* Company Header with Logo - EXACT COPY FROM handlePrint */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px', paddingBottom: '3px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src="/LOGO11.png" style={{ height: '50px', width: '50px' }} alt="Logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            <div style={{ fontSize: '7pt', lineHeight: '1.3' }}>
                                                <strong style={{ fontSize: '8pt', display: 'block' }}>FOREST EDGE FACTORY</strong>
                                                Saudi Arabia - Riyadh<br />
                                                C.R: 7050835193<br />
                                                Vat No.: 313142044200003
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'center', fontSize: '14pt', fontWeight: 'bold', flex: 1, paddingTop: '15px' }}>{selectedOrder.orderNumber}</div>

                                        <div style={{ textAlign: 'right', fontSize: '6.5pt', lineHeight: '1.3', direction: 'rtl' }}>
                                            المملكة العربية السعودية – الرياض<br />
                                            منطقة الخرج الصناعية بالرياض<br />
                                            حي المعذر الشمالي لالامير تركي بن عبد العزيز<br />
                                            س ت: 7050835193<br />
                                            رقم ضريبي: 313142044200003
                                        </div>
                                    </div>

                                    {/* Header Table - EXACT COPY */}
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2px' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '14%', border: '1px solid #000', padding: '3px', backgroundColor: '#d9d9d9', fontWeight: 'bold', fontSize: '7pt' }}>Job Order Date</th>
                                                <th style={{ width: '14%', border: '1px solid #000', padding: '3px', backgroundColor: '#d9d9d9', fontWeight: 'bold', fontSize: '7pt' }}>Job Order No.</th>
                                                <th style={{ width: '28%', border: '1px solid #000', padding: '3px', backgroundColor: '#d9d9d9', fontWeight: 'bold', fontSize: '7pt' }}>CLIENT</th>
                                                <th style={{ width: '14%', border: '1px solid #000', padding: '3px', backgroundColor: '#d9d9d9', fontWeight: 'bold', fontSize: '7pt' }}>Start Date</th>
                                                <th style={{ width: '20%', border: '1px solid #000', padding: '3px', backgroundColor: '#d9d9d9', fontWeight: 'bold', fontSize: '7pt' }}>End Date</th>
                                                <th style={{ width: '10%', border: '1px solid #000', padding: '3px', backgroundColor: '#d9d9d9', fontWeight: 'bold', fontSize: '7pt' }}>Priority</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '7.5pt', fontWeight: 'bold', height: '18px' }}>{new Date(selectedOrder.jobOrderDate).toLocaleDateString('en-GB')}</td>
                                                <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '7.5pt', fontWeight: 'bold' }}>{selectedOrder.jobOrderNumber}</td>
                                                <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '7.5pt', fontWeight: 'bold' }}>{selectedOrder.customerName}</td>
                                                <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '7.5pt', fontWeight: 'bold' }}>{selectedOrder.startDate ? new Date(selectedOrder.startDate).toLocaleDateString('en-GB') : '################'}</td>
                                                <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '7.5pt', fontWeight: 'bold' }}>{selectedOrder.endDate ? new Date(selectedOrder.endDate).toLocaleDateString('en-GB') : '################'}</td>
                                                <td style={{
                                                    border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '7.5pt', fontWeight: 'bold', backgroundColor: (() => {
                                                        if (selectedOrder.priority === 'urgent') return '#ff9999'; // Stronger Red
                                                        if (selectedOrder.priority === 'very_high') return '#ffcc80'; // Stronger Orange
                                                        if (selectedOrder.priority === 'high') return '#ffeb99'; // Stronger Yellow
                                                        return '#fff'; // White for Normal
                                                    })()
                                                }}>
                                                    {selectedOrder.priority === 'very_high' ? 'Very High' : selectedOrder.priority === 'high' ? 'High' : selectedOrder.priority === 'urgent' ? 'Urgent' : 'Normal'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {/* Items Table - EXACT COPY */}
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2px' }}>
                                        <thead>
                                            <tr>
                                                <th rowSpan={2} style={{ width: '3%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', height: '18px', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>NO.</th>
                                                <th rowSpan={2} style={{ width: '22%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>ITEM</th>
                                                <th rowSpan={2} style={{ width: '4%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Q.T.Y</th>
                                                <th colSpan={3} style={{ width: '12%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>FINAL DIM. (mm)</th>
                                                <th rowSpan={2} style={{ width: '10%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>MODEL CODE</th>
                                                <th colSpan={2} style={{ width: '16%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>PAINT</th>
                                                <th rowSpan={2} style={{ width: '6%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>GLOSSY %</th>
                                                <th rowSpan={2} style={{ width: '5%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>VENEER</th>
                                                <th rowSpan={2} style={{ width: '15%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>NOTE</th>
                                            </tr>
                                            <tr>
                                                <th style={{ width: '4%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>H</th>
                                                <th style={{ width: '4%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>L</th>
                                                <th style={{ width: '4%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>W</th>
                                                <th style={{ width: '8%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>COLOR</th>
                                                <th style={{ width: '8%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>CODE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.from({ length: 12 }).map((_, index) => {
                                                const item = selectedOrder.items?.[index];
                                                return (
                                                    <tr key={index}>
                                                        <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', height: '18px', whiteSpace: 'nowrap', overflow: 'hidden', verticalAlign: 'middle' }}>{index + 1}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'left', paddingLeft: '3px', fontSize: '7.5pt', whiteSpace: 'nowrap', overflow: 'hidden', verticalAlign: 'middle' }}>{item?.itemName || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', verticalAlign: 'middle' }}>{item?.quantity || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', verticalAlign: 'middle' }}>{item?.dimensions?.height || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', verticalAlign: 'middle' }}>{item?.dimensions?.length || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', verticalAlign: 'middle' }}>{item?.dimensions?.width || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', verticalAlign: 'middle' }}>{item?.modelCode || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', verticalAlign: 'middle' }}>{item?.paintColor || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '6.5pt', verticalAlign: 'middle' }}>{item?.paintCode || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', verticalAlign: 'middle' }}>{item ? `${item.glossPercentage}%` : ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', verticalAlign: 'middle' }}>{item?.veneer || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'left', paddingLeft: '3px', fontSize: '6.5pt', whiteSpace: 'nowrap', overflow: 'hidden', verticalAlign: 'middle' }}>{item?.notes || ''}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {/* Material Request Section - EXACT COPY */}
                                    {selectedOrder.materials && selectedOrder.materials.length > 0 && (
                                        <div style={{ marginTop: '4px' }}>
                                            <div style={{ backgroundColor: '#d9d9d9', border: '1px solid #000', textAlign: 'center', padding: '3px', fontWeight: 'bold', fontSize: '8pt' }}>
                                                MATERIAL REQUEST
                                            </div>

                                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 0 }}>
                                                <thead>
                                                    <tr>
                                                        <td rowSpan={100} style={{ width: '3%', backgroundColor: '#d9d9d9', padding: 0, borderRight: '2px solid #000', border: '1px solid #000', verticalAlign: 'middle' }}>
                                                            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 'bold', fontSize: '8pt', padding: '12px 2px' }}>WOOD</div>
                                                        </td>
                                                        <th style={{ width: '20%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', textAlign: 'center', verticalAlign: 'middle' }}>MATERIAL NAME</th>
                                                        <th style={{ width: '5%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', textAlign: 'center', verticalAlign: 'middle' }}>QTY</th>
                                                        <th style={{ width: '6%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', textAlign: 'center', verticalAlign: 'middle' }}>UNIT</th>
                                                        <th style={{ width: '4%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', textAlign: 'center', verticalAlign: 'middle' }}>W</th>
                                                        <th style={{ width: '4%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', textAlign: 'center', verticalAlign: 'middle' }}>L</th>

                                                        <td rowSpan={100} style={{ width: '3%', backgroundColor: '#d9d9d9', padding: 0, borderLeft: '2px solid #000', borderRight: '2px solid #000', border: '1px solid #000', verticalAlign: 'middle' }}>
                                                            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 'bold', fontSize: '8pt', padding: '12px 2px' }}>ACCESSORIES</div>
                                                        </td>
                                                        <th style={{ width: '20%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', textAlign: 'center', verticalAlign: 'middle' }}>MATERIAL NAME</th>
                                                        <th style={{ width: '5%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', textAlign: 'center', verticalAlign: 'middle' }}>QTY</th>
                                                        <th style={{ width: '30%', border: '1px solid #000', padding: '1px 2px', backgroundColor: '#d9d9d9', fontSize: '7pt', textAlign: 'center', verticalAlign: 'middle' }}>NOTES</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        const woodMaterials = selectedOrder.materials?.filter(m => m.category === 'wood' || m.category === 'other') || [];
                                                        const accessoriesMaterials = selectedOrder.materials?.filter(m => m.category === 'accessories') || [];
                                                        const maxRows = 30;

                                                        return Array.from({ length: maxRows }).map((_, i) => {
                                                            const wood = woodMaterials[i];
                                                            const acc = accessoriesMaterials[i];
                                                            return (
                                                                <tr key={i}>
                                                                    <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'left', paddingLeft: '3px', fontSize: '7pt', height: '18px', whiteSpace: 'nowrap', overflow: 'hidden', verticalAlign: 'middle' }}>{wood?.productName || ''}</td>
                                                                    <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', verticalAlign: 'middle' }}>{wood?.quantity || ''}</td>
                                                                    <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', verticalAlign: 'middle' }}>{wood?.unit || ''}</td>
                                                                    <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', verticalAlign: 'middle' }}>{wood?.size?.width || ''}</td>
                                                                    <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', verticalAlign: 'middle' }}>{wood?.size?.length || ''}</td>

                                                                    <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'left', paddingLeft: '3px', fontSize: '7pt', whiteSpace: 'nowrap', overflow: 'hidden', verticalAlign: 'middle' }}>{acc?.productName || ''}</td>
                                                                    <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', fontSize: '7.5pt', verticalAlign: 'middle' }}>{acc?.quantity || ''}</td>
                                                                    <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'left', paddingLeft: '3px', fontSize: '6.5pt', whiteSpace: 'nowrap', overflow: 'hidden', verticalAlign: 'middle' }}>{acc?.notes || ''}</td>
                                                                </tr>
                                                            );
                                                        });
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Footer - EXACT COPY */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '7.5pt' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div>Prepared By: ___________________</div>
                                            <div style={{ marginTop: '15px', fontWeight: 'bold' }}>Engneering Dept.</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div>Engr: Sabry Mahfouz</div>
                                            <div style={{ marginTop: '15px', fontWeight: 'bold' }}>Operation Manager</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div>Recived By: ___________________</div>
                                            <div style={{ marginTop: '15px', fontWeight: 'bold' }}>Production Dept.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ManufacturingPage;
