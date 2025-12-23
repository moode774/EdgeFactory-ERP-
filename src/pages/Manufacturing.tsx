import React, { useState } from 'react';
import { Plus, Trash2, Printer, Play, X, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Edit3, FileText, Save, LayoutGrid, Box, Hammer, PenTool, Calendar, User, FileDigit, Clipboard, CheckCircle2, MousePointerClick, Copy, Info, Factory, Grid, List, Upload } from 'lucide-react';
import { Product, WorkOrder, WorkOrderItem, MaterialRequest, Customer } from '../types';
import { AutoCompleteInput } from '../components/AutoCompleteInput';
import { autoCompleteService } from '../services/AutoCompleteService';
import WorkOrdersSummaryPrint from '../components/manufacturing/WorkOrdersSummaryPrint';
import { useLanguage } from '../contexts/LanguageContext';
import { importWorkOrdersBatch } from '../utils/importWorkOrders';

interface Props {
    lang: string;
    products: Product[];
    customers: Customer[];
    workOrders: WorkOrder[];
    onSaveWorkOrder: (order: any) => void;
    onUpdateWorkOrder: (id: string, order: any) => void;
    onDeleteWorkOrder: (id: string) => void;
    onExecuteWorkOrder: (id: string) => void;
    onRefresh: () => void;
}

const ManufacturingPage = ({ lang, products, customers, workOrders, onSaveWorkOrder, onUpdateWorkOrder, onDeleteWorkOrder, onExecuteWorkOrder, onRefresh }: Props) => {
    const { t } = useLanguage();
    const [showWOModal, setShowWOModal] = useState(false); // For ADD only
    const [showEditModal, setShowEditModal] = useState(false); // For EDIT only (print-style)
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [showSummaryPrint, setShowSummaryPrint] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

    // --- STEPPER STATE ---
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

    // --- DATE INPUT TYPE STATE ---
    const [startDateInputType, setStartDateInputType] = useState<'date' | 'text'>('date');
    const [endDateInputType, setEndDateInputType] = useState<'date' | 'text'>('date');

    // --- BULK IMPORT STATE ---
    const [showImportModal, setShowImportModal] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0, message: '' });
    const [importResult, setImportResult] = useState<{ total: number; success: number; errors: number; errorDetails: string[] } | null>(null);

    // --- BULK DELETE STATE ---
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // --- NAVIGATION STATE ---
    const [currentOrderIndex, setCurrentOrderIndex] = useState(0);

    const handleNextStep = () => {
        if (currentStep < totalSteps) setCurrentStep(curr => curr + 1);
    };

    const handlePrevStep = () => {
        if (currentStep > 1) setCurrentStep(curr => curr - 1);
    };

    // --- FORM STATE ---
    const generateOrderNumber = () => `P${String(workOrders.length + 1).padStart(5, '0')}`;
    const generateJobOrderNumber = () => {
        const year = new Date().getFullYear().toString().slice(-2);
        let maxNumber = 63;
        workOrders.forEach(order => {
            if (order.jobOrderNumber) {
                const parts = order.jobOrderNumber.split('-');
                if (parts.length === 2 && parts[0] === year) {
                    const num = parseInt(parts[1], 10);
                    if (!isNaN(num) && num > maxNumber) maxNumber = num;
                }
            }
        });
        return `${year}-${String(maxNumber + 1).padStart(5, '0')}`;
    };

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
            orderNumber: generateOrderNumber(),
            jobOrderNumber: generateJobOrderNumber(),
            customerName: '',
            customerId: '',
            priority: 'normal',
            startDate: today.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            items: [{ id: `item-${Date.now()}`, itemName: '', quantity: 1, unit: 'قطعة', dimensions: { height: 0, length: 0, width: 0 }, modelCode: '', paintColor: '', paintCode: '', glossPercentage: '', veneer: 'NO', notes: '' }],
            materials: [
                { id: `mat-wood-${Date.now()}`, productName: '', quantity: 1, unit: '', category: 'wood', isManual: true, size: { width: 0, length: 0 } },
                { id: `mat-hardware-${Date.now() + 1}`, productName: '', quantity: 1, unit: '', category: 'accessories', isManual: true, notes: '' }
            ],
            notes: ''
        });
        setCurrentStep(1);
    };

    const openNewOrderModal = () => { resetForm(); setEditingOrderId(null); setShowWOModal(true); };
    const openEditOrderModal = (order: WorkOrder) => {
        setEditingOrderId(order.id);
        setSelectedOrder(order); // Set the order to edit
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
        setShowEditModal(true); // Open print-style edit modal instead of wizard
    };

    // --- DATA HANDLING ---
    const addItem = () => {
        // Smart row filling: Only add new row if all existing rows are filled
        const hasEmptyRow = woForm.items.some(item => !item.itemName || item.itemName.trim() === '');
        if (hasEmptyRow) {
            // Don't add new row, user should fill existing empty rows first
            return;
        }
        // All rows are filled, add new row
        setWoForm({ ...woForm, items: [...woForm.items, { id: `item-${Date.now()}`, itemName: '', quantity: 1, unit: 'قطعة', dimensionMode: 'numeric', dimensions: { width: 0, length: 0, height: 0 }, modelCode: '', paintColor: '', paintCode: '', glossPercentage: '', veneer: 'NO', notes: '' }] });
    };
    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...woForm.items];
        if (field.startsWith('dimensions.')) {
            const dimField = field.split('.')[1];
            newItems[index] = { ...newItems[index], dimensions: { ...newItems[index].dimensions, [dimField]: value } };
        } else { newItems[index] = { ...newItems[index], [field]: value }; }
        setWoForm({ ...woForm, items: newItems });
    };
    const removeItem = (index: number) => setWoForm({ ...woForm, items: woForm.items.filter((_, i) => i !== index) });

    const addMaterial = (category: 'wood' | 'accessories') => {
        // Smart row filling: Allow adding if no rows exist, or if all existing rows are filled
        const materialsOfCategory = woForm.materials.filter(m => m.category === category);

        // If no rows of this category exist, always allow adding
        if (materialsOfCategory.length === 0) {
            setWoForm({ ...woForm, materials: [...woForm.materials, { id: `mat-${Date.now()}`, productName: '', quantity: 1, unit: '', category: category, isManual: true, size: category === 'wood' ? { width: 0, length: 0 } : undefined }] });
            return;
        }

        // Check if there are empty rows
        const hasEmptyRow = materialsOfCategory.some(mat => !mat.productName || mat.productName.trim() === '');
        if (hasEmptyRow) {
            // Don't add new row, user should fill existing empty rows first
            return;
        }

        // All rows are filled, add new row
        setWoForm({ ...woForm, materials: [...woForm.materials, { id: `mat-${Date.now()}`, productName: '', quantity: 1, unit: '', category: category, isManual: true, size: category === 'wood' ? { width: 0, length: 0 } : undefined }] });
    };
    const removeMaterial = (index: number) => setWoForm({ ...woForm, materials: woForm.materials.filter((_, i) => i !== index) });
    const updateMaterial = (index: number, field: string, value: any) => {
        const newMaterials = [...woForm.materials];
        newMaterials[index] = { ...newMaterials[index], [field]: value };
        setWoForm({ ...woForm, materials: newMaterials });
    };

    // --- PASTE LOGIC ---
    // Copy date to clipboard in DD/MM/YYYY format
    const copyDateToClipboard = (dateValue: string) => {
        if (!dateValue) return;
        try {
            const date = new Date(dateValue);
            const formattedDate = date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
            navigator.clipboard.writeText(formattedDate);
        } catch (error) {
            console.error('Failed to copy date:', error);
        }
    };

    // Paste date from clipboard and convert to YYYY-MM-DD format
    const pasteDateFromClipboard = async (field: 'startDate' | 'endDate') => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;

            // Try to parse different date formats
            let date: Date | null = null;

            // Format: DD/MM/YYYY or DD-MM-YYYY
            const ddmmyyyyMatch = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
            if (ddmmyyyyMatch) {
                const [, day, month, year] = ddmmyyyyMatch;
                date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }

            // Format: YYYY-MM-DD or YYYY/MM/DD
            const yyyymmddMatch = text.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
            if (!date && yyyymmddMatch) {
                const [, year, month, day] = yyyymmddMatch;
                date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }

            // If we successfully parsed a date, update the form
            if (date && !isNaN(date.getTime())) {
                const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
                setWoForm({ ...woForm, [field]: formattedDate });
            }
        } catch (error) {
            console.error('Failed to paste date:', error);
        }
    };

    // Handle double-click paste for date fields (Excel support)
    const handleDatePaste = async (field: 'startDate' | 'endDate') => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) {
                alert(lang === 'ar' ? 'الحافظة فارغة' : 'Clipboard empty');
                return;
            }

            // Clean the text (remove extra spaces, tabs, newlines)
            const cleanText = text.trim();

            // Try to parse different date formats
            let date: Date | null = null;

            // Format: DD/MM/YYYY or DD-MM-YYYY or D/M/YYYY (Excel default - European)
            const ddmmyyyyMatch = cleanText.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
            if (ddmmyyyyMatch) {
                const day = parseInt(ddmmyyyyMatch[1]);
                const month = parseInt(ddmmyyyyMatch[2]);
                const year = parseInt(ddmmyyyyMatch[3]);

                // Validate day and month ranges
                if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
                    date = new Date(year, month - 1, day);

                    // Verify the date is valid (handles invalid dates like 31/02/2025)
                    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                        date = null;
                    }
                }
            }

            // Format: YYYY-MM-DD or YYYY/MM/DD (ISO format)
            if (!date) {
                const yyyymmddMatch = cleanText.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
                if (yyyymmddMatch) {
                    const year = parseInt(yyyymmddMatch[1]);
                    const month = parseInt(yyyymmddMatch[2]);
                    const day = parseInt(yyyymmddMatch[3]);

                    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
                        date = new Date(year, month - 1, day);

                        if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                            date = null;
                        }
                    }
                }
            }

            // If we successfully parsed a date, update the form
            if (date && !isNaN(date.getTime())) {
                const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
                setWoForm({ ...woForm, [field]: formattedDate });
                alert(lang === 'ar' ? '✅ تم اللصق' : '✅ Date pasted');
            } else {
                // Show more helpful error message
                console.log('Failed to parse date:', cleanText);
                alert(lang === 'ar' ? `❌ تنسيق التاريخ غير صحيح: ${cleanText}` : `❌ Invalid date format: ${cleanText}`);
            }
        } catch (error) {
            console.error('Failed to paste date:', error);
            alert(lang === 'ar' ? '❌ فشل اللصق' : '❌ Paste failed');
        }
    };

    const handlePasteFromExcel = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;
            const rows = text.split('\n').filter(r => r.trim());
            const newItems: WorkOrderItem[] = rows.map((r, i) => {
                const c = r.split('\t').map(x => x.trim());
                return { id: `item-${Date.now()}-${i}`, itemName: c[0] || '', quantity: parseInt(c[1]) || 1, unit: 'قطعة', dimensions: { width: parseInt(c[2]) || 0, length: parseInt(c[3]) || 0, height: parseInt(c[4]) || 0 }, modelCode: '', paintColor: '', paintCode: '', glossPercentage: '', veneer: 'NO', notes: '' };
            });

            // Smart filling: Fill empty rows first, then append remaining
            const currentItems = [...woForm.items];
            let newItemIndex = 0;

            // Fill existing empty rows
            for (let i = 0; i < currentItems.length && newItemIndex < newItems.length; i++) {
                if (!currentItems[i].itemName || currentItems[i].itemName.trim() === '') {
                    currentItems[i] = newItems[newItemIndex];
                    newItemIndex++;
                }
            }

            // Append remaining items if any
            const remainingItems = newItems.slice(newItemIndex);
            setWoForm({ ...woForm, items: [...currentItems, ...remainingItems] });
        } catch (e) { console.error(e); }
    };

    const handlePasteWoodMaterials = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;
            const rows = text.split('\n').filter(r => r.trim());
            const startIndex = (rows.length > 0 && rows[0].toLowerCase().includes('name')) ? 1 : 0;
            const newMats: MaterialRequest[] = [];
            for (let i = startIndex; i < rows.length; i++) {
                const c = rows[i].split('\t').map(x => x.trim());
                if (!c[0]) continue;
                let unit = 'لوح', width = 0, thickness = 0, length = 0;
                if (c[2] && !isNaN(parseFloat(c[2]))) { width = parseFloat(c[2]); thickness = parseFloat(c[3]) || 0; length = parseFloat(c[4]) || 0; }
                else { unit = c[2]; width = parseFloat(c[3]) || 0; thickness = parseFloat(c[4]) || 0; length = parseFloat(c[5]) || 0; }
                newMats.push({ id: `mat-wood-${Date.now()}-${i}`, productName: c[0], quantity: parseFloat(c[1]) || 1, unit, category: 'wood', isManual: true, size: { width, length }, notes: thickness > 0 ? `T: ${thickness}` : '' });
            }

            // Smart filling: Fill empty wood material rows first
            const currentMaterials = [...woForm.materials];
            let newMatIndex = 0;

            // Fill existing empty wood rows
            for (let i = 0; i < currentMaterials.length && newMatIndex < newMats.length; i++) {
                if (currentMaterials[i].category === 'wood' && (!currentMaterials[i].productName || currentMaterials[i].productName.trim() === '')) {
                    currentMaterials[i] = newMats[newMatIndex];
                    newMatIndex++;
                }
            }

            // Append remaining materials if any
            const remainingMats = newMats.slice(newMatIndex);
            setWoForm({ ...woForm, materials: [...currentMaterials, ...remainingMats] });
        } catch (e) { console.error(e); }
    };

    const handlePasteAccessories = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;
            const rows = text.split('\n').filter(r => r.trim());
            const startIndex = (rows.length > 0 && rows[0].toLowerCase().includes('name')) ? 1 : 0;
            const newMats: MaterialRequest[] = [];
            for (let i = startIndex; i < rows.length; i++) {
                const c = rows[i].split('\t').map(x => x.trim());
                if (!c[0]) continue;
                newMats.push({ id: `mat-acc-${Date.now()}-${i}`, productName: c[0], quantity: parseFloat(c[1]) || 1, unit: 'قطعة', category: 'accessories', isManual: true, notes: c[2] || '' });
            }

            // Smart filling: Fill empty accessory rows first
            const currentMaterials = [...woForm.materials];
            let newMatIndex = 0;

            // Fill existing empty accessory rows
            for (let i = 0; i < currentMaterials.length && newMatIndex < newMats.length; i++) {
                if (currentMaterials[i].category === 'accessories' && (!currentMaterials[i].productName || currentMaterials[i].productName.trim() === '')) {
                    currentMaterials[i] = newMats[newMatIndex];
                    newMatIndex++;
                }
            }

            // Append remaining materials if any
            const remainingMats = newMats.slice(newMatIndex);
            setWoForm({ ...woForm, materials: [...currentMaterials, ...remainingMats] });
        } catch (e) { console.error(e); }
    };

    const handleColumnPaste = async (col: string, type: 'items' | 'materials', category?: 'wood' | 'accessories') => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) { alert('Clipboard empty'); return; }

            // Excel copies data in CSV-like format:
            // - Cells with line breaks are wrapped in quotes: "cell\nwith\nbreaks"
            // - Regular cells are not quoted
            // - Cells are separated by \n (or \t for columns)

            let vals: string[];

            // Check if text contains quotes (indicates multi-line cells)
            if (text.includes('"')) {
                // Parse CSV-style format
                vals = [];
                let currentCell = '';
                let insideQuotes = false;

                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    const nextChar = text[i + 1];

                    if (char === '"') {
                        if (insideQuotes && nextChar === '"') {
                            // Escaped quote ("")
                            currentCell += '"';
                            i++; // Skip next quote
                        } else {
                            // Toggle quote state
                            insideQuotes = !insideQuotes;
                        }
                    } else if (char === '\n' && !insideQuotes) {
                        // End of cell (not inside quotes)
                        if (currentCell.trim()) vals.push(currentCell.trim());
                        currentCell = '';
                    } else if (char === '\t' && !insideQuotes) {
                        // Tab separator (multiple columns) - end current cell and skip rest of line
                        if (currentCell.trim()) vals.push(currentCell.trim());
                        currentCell = '';
                        // Skip to end of line
                        while (i < text.length && text[i] !== '\n') i++;
                    } else {
                        currentCell += char;
                    }
                }
                // Don't forget last cell
                if (currentCell.trim()) vals.push(currentCell.trim());

            } else if (text.includes('\t')) {
                // Multiple columns without quotes - take first column
                vals = text.split('\n')
                    .map(line => line.split('\t')[0].trim())
                    .filter(v => v !== '');
            } else {
                // Simple single column
                vals = text.split('\n')
                    .map(v => v.trim())
                    .filter(v => v !== '');
            }

            if (vals.length === 0) return;

            if (type === 'items') {
                let newItems = [...woForm.items];

                // Only create new rows if we don't have enough rows
                if (vals.length > newItems.length) {
                    const needed = vals.length - newItems.length;
                    const newRows = Array(needed).fill(null).map((_, i) => ({
                        id: `item-new-${Date.now()}-${i}`,
                        itemName: '',
                        quantity: 1,
                        unit: 'قطعة',
                        dimensions: { width: 0, length: 0, height: 0 },
                        modelCode: '',
                        paintColor: '',
                        paintCode: '',
                        glossPercentage: '',
                        veneer: 'NO',
                        notes: ''
                    }));
                    newItems = [...newItems, ...newRows];
                }

                // Apply values to items
                vals.forEach((v, i) => {
                    if (i < newItems.length) {
                        if (col === 'itemName') newItems[i].itemName = v;
                        else if (col === 'quantity') newItems[i].quantity = parseInt(v) || 1;
                        else if (col === 'width') newItems[i].dimensions.width = parseInt(v) || 0;
                        else if (col === 'length') newItems[i].dimensions.length = parseInt(v) || 0;
                        else if (col === 'height') newItems[i].dimensions.height = parseInt(v) || 0;
                        else if (col === 'modelCode') newItems[i].modelCode = v;
                        else if (col === 'paintColor') newItems[i].paintColor = v;
                        else if (col === 'paintCode') newItems[i].paintCode = v;
                        else if (col === 'glossPercentage') newItems[i].glossPercentage = v;
                        else if (col === 'veneer') newItems[i].veneer = v;
                        else if (col === 'notes') newItems[i].notes = v;
                    }
                });
                setWoForm({ ...woForm, items: newItems });
            } else {
                // For materials, use the category parameter or default to 'wood'
                const currentCategory = category || 'wood';

                // Filter materials by category to work only with the relevant ones
                const allMats = [...woForm.materials];
                let workingMats = allMats.filter(m =>
                    currentCategory === 'wood'
                        ? (m.category === 'wood' || m.category === 'other')
                        : m.category === 'accessories'
                );

                // Only create new rows if we don't have enough rows
                if (vals.length > workingMats.length) {
                    const needed = vals.length - workingMats.length;

                    for (let i = 0; i < needed; i++) {
                        const newMat: MaterialRequest = {
                            id: `mat-new-${Date.now()}-${i}`,
                            productName: '',
                            quantity: 1,
                            unit: currentCategory === 'wood' ? 'لوح' : 'قطعة',
                            category: currentCategory,
                            isManual: true
                        };

                        if (currentCategory === 'wood') {
                            newMat.size = { width: 0, length: 0 };
                        }

                        workingMats.push(newMat);
                        allMats.push(newMat);
                    }
                }

                // Apply values to working materials
                vals.forEach((v, i) => {
                    if (i < workingMats.length) {
                        if (col === 'productName') workingMats[i].productName = v;
                        else if (col === 'quantity') workingMats[i].quantity = parseFloat(v) || 1;
                        else if (col === 'unit') workingMats[i].unit = v;
                        else if (col === 'width' && workingMats[i].size) workingMats[i].size!.width = parseFloat(v) || 0;
                        else if (col === 'length' && workingMats[i].size) workingMats[i].size!.length = parseFloat(v) || 0;
                        else if (col === 'thickness' && workingMats[i].size) workingMats[i].size!.thickness = parseFloat(v) || 0;
                        else if (col === 'notes') workingMats[i].notes = v;
                    }
                });

                setWoForm({ ...woForm, materials: allMats });
            }
            alert(lang === 'ar' ? '✅ تم اللصق' : '✅ Pasted');
        } catch (e) { console.error(e); }
    };

    // --- BULK IMPORT HANDLER ---
    const handleBulkImport = async (file: File) => {
        setImporting(true);
        setImportResult(null);
        setImportProgress({ current: 0, total: 0, message: 'Reading file...' });

        try {
            // Read file
            const text = await file.text();
            const jsonData = JSON.parse(text);

            // Import with progress tracking
            const result = await importWorkOrdersBatch(
                jsonData,
                (current, total, message) => {
                    setImportProgress({ current, total, message });
                }
            );

            setImportResult(result);

            // Refresh work orders list
            setTimeout(() => {
                onRefresh();
            }, 1000);

        } catch (error) {
            console.error('Import error:', error);
            setImportResult({
                total: 0,
                success: 0,
                errors: 1,
                errorDetails: [`Failed to read file: ${error}`]
            });
        } finally {
            setImporting(false);
        }
    };


    // --- BULK DELETE HANDLER ---
    const handleDeleteAll = async () => {
        setDeleting(true);

        try {
            // Import Firebase functions
            const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
            const { db } = await import('../services/firebase');

            // Get all work orders from Firebase
            const querySnapshot = await getDocs(collection(db, 'workOrders'));
            const total = querySnapshot.size;
            let deletedCount = 0;

            // Delete all documents
            const deletePromises = querySnapshot.docs.map(document =>
                deleteDoc(doc(db, 'workOrders', document.id))
            );

            await Promise.all(deletePromises);
            deletedCount = total;

            // Show single success message
            alert(`✅ Successfully deleted ${deletedCount} work orders!`);
            setShowDeleteAllModal(false);
            onRefresh();

        } catch (error) {
            console.error('Delete all error:', error);
            alert(`❌ Error deleting work orders: ${error}`);
        } finally {
            setDeleting(false);
        }
    };

    const handleSaveWO = () => {
        if (!woForm.customerName) { alert('Customer Name Required'); return; }
        const newOrder = {
            ...woForm,
            items: woForm.items.filter(i => i.itemName),
            materials: woForm.materials.filter(m => m.productName),
            jobOrderDate: new Date().toISOString(),
            status: 'planned' as const
        };
        if (editingOrderId) onUpdateWorkOrder(editingOrderId, newOrder);
        else onSaveWorkOrder(newOrder);
        setShowWOModal(false);
        resetForm();
    };

    // --- RENDER HELPERS ---
    const openPrintPreview = (order: WorkOrder) => {
        setSelectedOrder(order);
        // Use setTimeout to ensure state is updated before printing
        setTimeout(() => {
            handlePrint();
        }, 100);
    };
    const handlePrint = () => {
        if (selectedOrder) {
            const order = selectedOrder;

            const formatDate = (dateString?: string) => {
                if (!dateString) return '################';
                const date = new Date(dateString);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            };

            const getPriorityColor = () => {
                if (order.priority === 'urgent') return '#ff9999';
                if (order.priority === 'very_high') return '#ffcc80';
                if (order.priority === 'high') return '#ffeb99';
                return '#fff';
            };

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Job Order - ${selectedOrder.orderNumber}</title>
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
                                background-color: #6d4c41; 
                                color: white;
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
                            
                            <div class="arabic-info">
                                المملكة العربية السعودية – الرياض<br>
                                منطقة الخرج الصناعية بالرياض<br>
                                حي المعذر الشمالي لالامير تركي بن عبد العزيز<br>
                                س ت: 7050835193<br>
                                رقم ضريبي: 313142044200003
                            </div>
                        </div>

                        <!-- Title Bar with Order Number -->
                        <div style="background-color: #6d4c41; color: white; text-align: center; padding: 8px; font-weight: bold; font-size: 11pt; margin-bottom: 8px; letter-spacing: 1px;">
                            ${selectedOrder.orderNumber}
                        </div>

                        <!-- Info Boxes in Single Row -->
                        <table style="margin-bottom: 8px;">
                            <tr>
                                <td style="width: 12%; text-align: center; border: 1px solid #000; padding: 4px;">
                                    <div style="font-size: 6.5pt; font-weight: bold;">END DATE</div>
                                    <div style="font-size: 7.5pt; font-weight: bold; margin-top: 2px;">${selectedOrder.endDate ? formatDate(selectedOrder.endDate) : 'N/A'}</div>
                                </td>
                                <td style="width: 12%; text-align: center; border: 1px solid #000; padding: 4px;">
                                    <div style="font-size: 6.5pt; font-weight: bold;">START DATE</div>
                                    <div style="font-size: 7.5pt; font-weight: bold; margin-top: 2px;">${formatDate(selectedOrder.startDate)}</div>
                                </td>
                                <td style="width: 40%; text-align: center; border: 1px solid #000; padding: 4px;">
                                    <div style="font-size: 6.5pt; font-weight: bold;">CLIENT</div>
                                    <div style="font-size: 7.5pt; font-weight: bold; margin-top: 2px;">${selectedOrder.customerName}</div>
                                </td>
                                <td style="width: 12%; text-align: center; border: 1px solid #000; padding: 4px;">
                                    <div style="font-size: 6.5pt; font-weight: bold;">JOB ORDER NO</div>
                                    <div style="font-size: 7.5pt; font-weight: bold; margin-top: 2px;">${selectedOrder.jobOrderNumber}</div>
                                </td>
                                <td style="width: 12%; text-align: center; border: 1px solid #000; padding: 4px;">
                                    <div style="font-size: 6.5pt; font-weight: bold;">JOB ORDER DATE</div>
                                    <div style="font-size: 7.5pt; font-weight: bold; margin-top: 2px;">${formatDate(selectedOrder.jobOrderDate)}</div>
                                </td>
                                <td style="width: 12%; text-align: center; border: 1px solid #000; padding: 4px; background-color: ${getPriorityColor()};">
                                    <div style="font-size: 6.5pt; font-weight: bold;">PRIORITY</div>
                                    <div style="font-size: 7.5pt; font-weight: bold; margin-top: 2px;">${selectedOrder.priority === 'very_high' ? 'Very High' : selectedOrder.priority === 'high' ? 'High' : selectedOrder.priority === 'urgent' ? 'urgent' : 'Normal'}</div>
                                </td>
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
                                    <th colspan="3" style="width: 22%;">PAINT</th>
                                    <th rowspan="2" style="width: 5%;">VENEER</th>
                                    <th rowspan="2" style="width: 15%;">NOTE</th>
                                </tr>
                                <tr>
                                    <th style="width: 4%;">H</th>
                                    <th style="width: 4%;">L</th>
                                    <th style="width: 4%;">W</th>
                                    <th style="width: 8%;">COLOR</th>
                                    <th style="width: 8%;">CODE</th>
                                    <th style="width: 6%;">GLOSSY %</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(() => {
                        const minRows = 12;
                        const totalRows = Math.max(selectedOrder.items.length, minRows);
                        return Array.from({ length: totalRows }).map((_, index) => {
                            const item = selectedOrder.items[index];

                            // Check if dimensions contain text (not just numbers)
                            const hasTextDimensions = item && item.dimensions && (
                                (typeof item.dimensions.width === 'string' && isNaN(Number(item.dimensions.width))) ||
                                (typeof item.dimensions.length === 'string' && isNaN(Number(item.dimensions.length))) ||
                                (typeof item.dimensions.height === 'string' && isNaN(Number(item.dimensions.height)))
                            );

                            // Get dimension text (use first non-empty dimension field)
                            const dimensionText = hasTextDimensions ?
                                (item.dimensions.width || item.dimensions.length || item.dimensions.height || '') : '';

                            if (hasTextDimensions) {
                                // If text dimensions, merge the 3 columns
                                return `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td class="text-left">${item?.itemName || ''}</td>
                                            <td>${item?.quantity || ''}</td>
                                            <td colspan="3" style="text-align: center; font-size: 6.5pt; font-weight: bold;">${dimensionText}</td>
                                            <td>${item?.modelCode || ''}</td>
                                            <td>${item?.paintColor || ''}</td>
                                            <td style="font-size: 6.5pt;">${item?.paintCode || ''}</td>
                                            <td>${item ? item.glossPercentage + '%' : ''}</td>
                                            <td>${item?.veneer || ''}</td>
                                            <td class="text-left" style="font-size: 6.5pt;">${item?.notes || ''}</td>
                                        </tr>`;
                            } else {
                                // Normal numeric dimensions
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
                            }
                        }).join('');
                    })()}
                            </tbody>
                        </table>

                        ${selectedOrder.materials && selectedOrder.materials.length > 0 ? `
                        <!-- Material Request Section -->
                        <div style="margin-top: 4px;">
                            <div style="background-color: #6d4c41; color: white; border: 1px solid #000; text-align: center; padding: 3px; font-weight: bold; font-size: 8pt;">
                                MATERIAL REQUEST
                            </div>
                            
                            <table style="margin-bottom: 0;">
                                <tr>
                                    <!-- WOOD Section -->
                                    <td rowspan="100" style="width: 3%; background-color: #6d4c41; color: white; padding: 0; border-right: 2px solid #000;">
                                        <div style="writing-mode: vertical-rl; transform: rotate(180deg); font-weight: bold; font-size: 8pt; padding: 12px 2px;">WOOD</div>
                                    </td>
                                    <th style="width: 20%;">MATERIAL NAME</th>
                                    <th style="width: 5%;">QTY</th>
                                    <th style="width: 6%;">UNIT</th>
                                    <th style="width: 4%;">W</th>
                                    <th style="width: 4%;">L</th>
                                    
                                    <!-- ACCESSORIES Section -->
                                    <td rowspan="100" style="width: 3%; background-color: #6d4c41; color: white; padding: 0; border-left: 2px solid #000; border-right: 2px solid #000;">
                                        <div style="writing-mode: vertical-rl; transform: rotate(180deg); font-weight: bold; font-size: 8pt; padding: 12px 2px;">ACCESSORIES</div>
                                    </td>
                                    <th style="width: 20%;">MATERIAL NAME</th>
                                    <th style="width: 5%;">QTY</th>
                                    <th style="width: 30%;">NOTES</th>
                                </tr>
                                ${(() => {
                            const woodMaterials = selectedOrder.materials.filter(m => m.category === 'wood' || m.category === 'other');
                            const accessoriesMaterials = selectedOrder.materials.filter(m => m.category === 'accessories');
                            const minRows = 15;
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
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            }
        }
    };

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchFilter, setSearchFilter] = useState<'all' | 'orderNo' | 'customer' | 'jobOrderNo'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filter work orders based on search
    const filteredWorkOrders = workOrders.filter(wo => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();

        switch (searchFilter) {
            case 'orderNo':
                return wo.orderNumber?.toLowerCase().includes(term);
            case 'customer':
                return wo.customerName?.toLowerCase().includes(term);
            case 'jobOrderNo':
                return wo.jobOrderNumber?.toLowerCase().includes(term);
            default: // 'all'
                return wo.orderNumber?.toLowerCase().includes(term) ||
                    wo.customerName?.toLowerCase().includes(term) ||
                    wo.jobOrderNumber?.toLowerCase().includes(term);
        }
    });

    return (
        <div className="p-6 font-sans bg-slate-50 min-h-screen overflow-y-auto">
            {/* Professional Header */}
            <div className="mb-6">
                {/* Title Section */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('workOrders')}</h2>
                        <p className="text-slate-500 text-xs mt-1 font-medium">{lang === 'ar' ? 'إدارة وتتبع أوامر التصنيع' : 'Manage and track manufacturing orders'}</p>
                    </div>
                    <div className="flex gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex gap-1 bg-white border border-slate-300 rounded-lg p-0.5 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-bold text-xs transition-all ${viewMode === 'grid'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Grid size={14} /> {t('grid') || 'Grid'}
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-bold text-xs transition-all ${viewMode === 'list'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <List size={14} /> {t('list') || 'List'}
                            </button>
                        </div>
                        <button onClick={() => setShowSummaryPrint(true)} className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm font-bold text-xs">
                            <FileText size={14} /> {t('summary') || 'Summary'}
                        </button>
                        {workOrders.length > 0 && (
                            <button onClick={() => setShowDeleteAllModal(true)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-red-700 transition-all shadow-sm font-bold text-xs transform active:scale-95">
                                <Trash2 size={14} /> {t('deleteAll') || 'Delete All'} ({workOrders.length})
                            </button>
                        )}
                        <button onClick={() => setShowImportModal(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-blue-700 transition-all shadow-sm font-bold text-xs transform active:scale-95">
                            <Upload size={14} /> {t('importJSON') || 'Import JSON'}
                        </button>
                        <button onClick={openNewOrderModal} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-800 transition-all shadow-sm font-bold text-xs transform active:scale-95">
                            <Plus size={14} /> {t('newOrder')}
                        </button>
                    </div>
                </div>

                {/* Advanced Search Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex gap-3 items-center">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={lang === 'ar' ? 'ابحث عن أوامر العمل...' : 'Search work orders...'}
                                className="w-full h-10 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-slate-700 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                            <button
                                onClick={() => setSearchFilter('all')}
                                className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${searchFilter === 'all'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-transparent text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {t('all') || 'All'}
                            </button>
                            <button
                                onClick={() => setSearchFilter('orderNo')}
                                className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${searchFilter === 'orderNo'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-transparent text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {t('refNo') || 'Ref. No.'}
                            </button>
                            <button
                                onClick={() => setSearchFilter('customer')}
                                className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${searchFilter === 'customer'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-transparent text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {t('customerName')}
                            </button>
                            <button
                                onClick={() => setSearchFilter('jobOrderNo')}
                                className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${searchFilter === 'jobOrderNo'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-transparent text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {t('woNo') || 'WO No.'}
                            </button>
                        </div>
                    </div>

                    {/* Search Results Count */}
                    {searchTerm && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-xs text-slate-600 font-medium">
                                {lang === 'ar' ? `تم العثور على` : 'Found'} <span className="font-bold text-slate-900">{filteredWorkOrders.length}</span> {lang === 'ar' ? 'نتيجة' : `result${filteredWorkOrders.length !== 1 ? 's' : ''}`}
                                {searchFilter !== 'all' && <span className="text-slate-500">{lang === 'ar' ? 'في' : 'in'} {searchFilter === 'orderNo' ? (lang === 'ar' ? 'الأرقام المرجعية' : 'Reference Numbers') : searchFilter === 'customer' ? (lang === 'ar' ? 'أسماء العملاء' : 'Customer Names') : (lang === 'ar' ? 'أرقام الأوامر' : 'WO Numbers')}</span>}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Orders Display - Grid or List View */}
            {viewMode === 'grid' ? (
                // GRID VIEW - Cards
                <div className="space-y-3">
                    {filteredWorkOrders.map((wo) => (
                        <div key={wo.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200 group">
                            <div className="p-4 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === wo.id ? null : wo.id)}>
                                {/* Top Row: Numbers and Customer */}
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left: Order Numbers */}
                                    <div className="flex gap-3 flex-1">
                                        {/* WO Number - Primary */}
                                        <div className="bg-slate-900 px-3 py-2 rounded-lg min-w-[110px]">
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{lang === 'ar' ? 'رقم الأمر' : 'WO Number'}</div>
                                            <div className="text-base font-black text-white font-mono">{wo.jobOrderNumber}</div>
                                        </div>

                                        {/* Ref Number - Secondary */}
                                        <div className="bg-slate-100 px-3 py-2 rounded-lg min-w-[110px] border border-slate-300">
                                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{lang === 'ar' ? 'رقم مرجعي' : 'Ref. No.'}</div>
                                            <div className="text-base font-black text-slate-900 font-mono">{wo.orderNumber}</div>
                                        </div>

                                        {/* Customer Name - Prominent */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('customerName')}</div>
                                            <h4 className="font-bold text-slate-900 text-base truncate group-hover:text-slate-700 transition-colors">{wo.customerName}</h4>
                                        </div>
                                    </div>

                                    {/* Right: Priority, Date & Expand */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">
                                            <Calendar size={14} />
                                            <span className="font-semibold text-xs">{new Date(wo.jobOrderDate).toLocaleDateString('en-GB')}</span>
                                        </div>
                                        <span className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${wo.priority === 'urgent' ? 'bg-red-100 text-red-700 border border-red-300' :
                                            wo.priority === 'high' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                                                'bg-slate-100 text-slate-600 border border-slate-300'
                                            }`}>
                                            {wo.priority}
                                        </span>
                                        <div className="bg-slate-100 p-1.5 rounded-md">
                                            {expandedOrder === wo.id ? <ChevronUp className="text-slate-600" size={16} /> : <ChevronDown className="text-slate-600" size={16} />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {expandedOrder === wo.id && (
                                <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 flex justify-end gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <button onClick={() => openPrintPreview(wo)} className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-md hover:border-slate-400 hover:bg-slate-50 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                                        <Printer size={14} /> {lang === 'ar' ? 'طباعة' : 'Print'}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); openEditOrderModal(wo); }} className="px-3 py-1.5 bg-white text-amber-700 border border-amber-300 rounded-md hover:bg-amber-50 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                                        <Edit3 size={14} /> {t('edit')}
                                    </button>
                                    <button onClick={() => onDeleteWorkOrder(wo.id)} className="px-3 py-1.5 bg-white text-red-700 border border-red-300 rounded-md hover:bg-red-50 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                                        <Trash2 size={14} /> {t('delete')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                // LIST VIEW - Table
                <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                                <th className="px-6 py-4 text-left font-bold">Ref. No.</th>
                                <th className="px-6 py-4 text-left font-bold">WO Number</th>
                                <th className="px-6 py-4 text-left font-bold">Customer</th>
                                <th className="px-6 py-4 text-center font-bold">Priority</th>
                                <th className="px-6 py-4 text-center font-bold">Date</th>
                                <th className="px-6 py-4 text-center font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredWorkOrders.map((wo) => (
                                <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg text-sm">
                                            {wo.orderNumber}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-slate-700 text-sm">
                                            {wo.jobOrderNumber}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-slate-900">{wo.customerName}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${wo.priority === 'urgent' ? 'bg-red-100 text-red-700 border border-red-300' :
                                            wo.priority === 'high' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                                                'bg-slate-100 text-slate-600 border border-slate-300'
                                            }`}>
                                            {wo.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-slate-600 font-medium text-sm">
                                            {new Date(wo.jobOrderDate).toLocaleDateString('en-GB')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openPrintPreview(wo)}
                                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border-2 border-slate-300 hover:border-slate-400 transition-all"
                                                title="Print"
                                            >
                                                <Printer size={16} />
                                            </button>
                                            <button
                                                onClick={() => openEditOrderModal(wo)}
                                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg border-2 border-amber-300 hover:border-amber-400 transition-all"
                                                title="Edit"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDeleteWorkOrder(wo.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg border-2 border-red-300 hover:border-red-400 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- ELITE WIZARD MODAL --- */}
            {showWOModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/90 backdrop-blur-md p-0 font-sans text-slate-800">
                    <div className="bg-slate-50 w-full h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

                        {/* 1. Elite Header */}
                        <div className="bg-[#2c3e50] shadow-2xl z-30 shrink-0 border-b border-slate-700">
                            <div className="px-8 py-4 flex justify-between items-center">
                                <div className="text-white text-2xl font-bold tracking-tight flex items-center gap-4">
                                    <div className="bg-slate-600 p-2 rounded-lg shadow-lg">
                                        <img src="/logo.png" alt="Factory Logo" className="w-7 h-7 object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span>{t('manufacturingOrder')}</span>
                                        <span className="text-xs text-slate-400 font-normal uppercase tracking-widest mt-0.5">{t('productionControl')}</span>
                                    </div>
                                </div>
                                <button onClick={() => setShowWOModal(false)} className="bg-slate-700 hover:bg-red-500 text-slate-300 hover:text-white p-2 rounded-lg transition-all duration-300"><X size={22} /></button>
                            </div>

                            {/* Professional Stepper */}
                            <div className="px-12 pb-3 pt-2 bg-[#2c3e50]">
                                <div className="flex items-center justify-between max-w-4xl mx-auto relative">
                                    {/* Connecting Line */}
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-600 -translate-y-1/2 z-0"></div>
                                    <div className="absolute top-1/2 left-0 h-0.5 bg-slate-500 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out" style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}></div>

                                    {[
                                        { id: 1, label: t('details'), icon: FileText },
                                        { id: 2, label: t('products'), icon: Box },
                                        { id: 3, label: t('wood'), icon: Hammer },
                                        { id: 4, label: t('hardware'), icon: PenTool },
                                        { id: 5, label: t('review'), icon: CheckCircle2 }
                                    ].map((step) => (
                                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-1 cursor-pointer group" onClick={() => setCurrentStep(step.id)}>
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep === step.id ? 'bg-slate-500 border-slate-500 text-white scale-110 shadow-lg shadow-slate-500/50' : currentStep > step.id ? 'bg-slate-500 border-slate-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500'}`}>
                                                {currentStep > step.id ? <CheckCircle2 size={16} /> : <step.icon size={16} />}
                                            </div>
                                            <span className={`text-[9px] font-bold uppercase tracking-wider ${currentStep === step.id ? 'text-white' : currentStep > step.id ? 'text-slate-400' : 'text-slate-500'}`}>{step.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2. Main Content (Wide & Professional) */}
                        <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex flex-col items-center">
                            <div className="w-full max-w-[95%] xl:max-w-[1800px] flex-1 flex flex-col">

                                {/* --- STEP 1: INFORMATION --- */}
                                {currentStep === 1 && (
                                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-10 animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col justify-center h-full">
                                        <div className="max-w-6xl mx-auto w-full">
                                            <div className="border-l-4 border-slate-700 pl-6 mb-12">
                                                <h3 className="text-3xl font-bold text-slate-900">Project Information</h3>
                                                <p className="text-slate-500 mt-2 text-lg">Define the core details for this manufacturing job.</p>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                                                {/* Row 1: Order Number + Customer Name */}
                                                <div className="group">
                                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide group-focus-within:text-slate-700 transition-colors"><FileDigit size={14} /> {t('refNumber')}</label>
                                                    <input
                                                        type="text"
                                                        value={woForm.orderNumber}
                                                        onChange={e => setWoForm({ ...woForm, orderNumber: e.target.value })}
                                                        onPaste={(e) => {
                                                            e.preventDefault();
                                                            const text = e.clipboardData.getData('text');
                                                            const cleanedText = text.trim().replace(/\s+/g, ''); // Remove all whitespace
                                                            setWoForm({ ...woForm, orderNumber: cleanedText });
                                                        }}
                                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg h-14 px-4 text-xl font-bold text-slate-800 font-mono focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-all outline-none shadow-sm group-hover:bg-white"
                                                        placeholder="S00004 or P00004"
                                                    />
                                                </div>

                                                <div className="group">
                                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide group-focus-within:text-slate-700 transition-colors"><User size={14} /> {t('customerName')}</label>
                                                    <AutoCompleteInput value={woForm.customerName} onChange={(val) => setWoForm({ ...woForm, customerName: val })} suggestions={autoCompleteService.getSuggestions('customers')} className="w-full bg-slate-50 border border-slate-300 rounded-lg h-14 px-4 text-xl font-bold text-slate-800 focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-all outline-none shadow-sm group-hover:bg-white" placeholder={t('searchCustomer')} />
                                                </div>

                                                {/* Row 2: Priority + Job Order Number */}
                                                <div className="group">
                                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide group-focus-within:text-slate-700 transition-colors"><Info size={14} /> {t('priorityLevel')}</label>
                                                    <div className="relative">
                                                        <select value={woForm.priority} onChange={e => setWoForm({ ...woForm, priority: e.target.value as any })} className="w-full bg-slate-50 border border-slate-300 rounded-lg h-14 px-4 text-lg font-medium text-slate-800 focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-all outline-none shadow-sm appearance-none cursor-pointer">
                                                            <option value="normal">{t('normalPriority')}</option>
                                                            <option value="high">{t('highPriority')}</option>
                                                            <option value="urgentCritical">{t('urgentCritical')}</option>
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronRight className="rotate-90" size={18} /></div>
                                                    </div>
                                                </div>

                                                <div className="group">
                                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide group-focus-within:text-slate-700 transition-colors"><FileDigit size={14} /> {t('woNumber')}</label>
                                                    <input
                                                        type="text"
                                                        value={woForm.jobOrderNumber}
                                                        onChange={e => setWoForm({ ...woForm, jobOrderNumber: e.target.value })}
                                                        onPaste={(e) => {
                                                            e.preventDefault();
                                                            const text = e.clipboardData.getData('text');
                                                            const cleanedText = text.trim().replace(/\s+/g, ''); // Remove all whitespace
                                                            setWoForm({ ...woForm, jobOrderNumber: cleanedText });
                                                        }}
                                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg h-14 px-4 text-xl font-bold text-slate-800 focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-all outline-none shadow-sm group-hover:bg-white"
                                                        placeholder="25-00065"
                                                    />
                                                </div>

                                                {/* Row 3: Start Date + End Date */}
                                                <div className="group">
                                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide group-focus-within:text-slate-700 transition-colors">
                                                        <Calendar size={14} /> Target Delivery
                                                        <span
                                                            className="ml-auto text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
                                                            title={lang === 'ar' ? 'انقر مرتين للصق من Excel' : 'Double-click to paste from Excel'}
                                                            onDoubleClick={() => handleDatePaste('endDate')}
                                                        >
                                                            <Copy size={12} />
                                                        </span>
                                                    </label>
                                                    <input
                                                        type={endDateInputType}
                                                        value={woForm.endDate}
                                                        onChange={e => setWoForm({ ...woForm, endDate: e.target.value })}
                                                        onFocus={(e) => {
                                                            setEndDateInputType('text');
                                                            setTimeout(() => e.target.select(), 0);
                                                        }}
                                                        onBlur={() => setEndDateInputType('date')}
                                                        onDoubleClick={() => handleDatePaste('endDate')}
                                                        onPaste={async (e) => {
                                                            e.preventDefault();
                                                            const text = e.clipboardData.getData('text');
                                                            if (!text) return;

                                                            let date: Date | null = null;
                                                            const ddmmyyyyMatch = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                                                            if (ddmmyyyyMatch) {
                                                                const [, day, month, year] = ddmmyyyyMatch;
                                                                date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                                            }
                                                            const yyyymmddMatch = text.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
                                                            if (!date && yyyymmddMatch) {
                                                                const [, year, month, day] = yyyymmddMatch;
                                                                date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                                            }
                                                            if (date && !isNaN(date.getTime())) {
                                                                const formattedDate = date.toISOString().split('T')[0];
                                                                setWoForm({ ...woForm, endDate: formattedDate });
                                                            }
                                                        }}
                                                        placeholder="YYYY-MM-DD"
                                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg h-14 px-4 text-lg font-medium text-slate-800 focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-all outline-none shadow-sm cursor-pointer hover:bg-white"
                                                        title={lang === 'ar' ? 'انقر مرتين للصق من Excel' : 'Double-click to paste from Excel'}
                                                    />
                                                    <div className="flex gap-2 mt-2">
                                                        <button onClick={() => { const d = new Date(); d.setDate(d.getDate() + 5); setWoForm({ ...woForm, endDate: d.toISOString().split('T')[0] }) }} className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-300 hover:text-slate-800 transition-colors">+5 Days</button>
                                                        <button onClick={() => { const d = new Date(); d.setDate(d.getDate() + 7); setWoForm({ ...woForm, endDate: d.toISOString().split('T')[0] }) }} className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-300 hover:text-slate-800 transition-colors">+7 Days</button>
                                                        <button onClick={() => { const d = new Date(); d.setDate(d.getDate() + 10); setWoForm({ ...woForm, endDate: d.toISOString().split('T')[0] }) }} className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-300 hover:text-slate-800 transition-colors">+10 Days</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="group">
                                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide group-focus-within:text-slate-700 transition-colors">
                                                    <Calendar size={14} /> Start Production
                                                    <span
                                                        className="ml-auto text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
                                                        title={lang === 'ar' ? 'انقر مرتين للصق من Excel' : 'Double-click to paste from Excel'}
                                                        onDoubleClick={() => handleDatePaste('startDate')}
                                                    >
                                                        <Copy size={12} />
                                                    </span>
                                                </label>
                                                <input
                                                    type={startDateInputType}
                                                    value={woForm.startDate}
                                                    onChange={e => setWoForm({ ...woForm, startDate: e.target.value })}
                                                    onFocus={(e) => {
                                                        setStartDateInputType('text');
                                                        setTimeout(() => e.target.select(), 0);
                                                    }}
                                                    onBlur={() => setStartDateInputType('date')}
                                                    onDoubleClick={() => handleDatePaste('startDate')}
                                                    onPaste={async (e) => {
                                                        e.preventDefault();
                                                        const text = e.clipboardData.getData('text');
                                                        if (!text) return;

                                                        let date: Date | null = null;
                                                        const ddmmyyyyMatch = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                                                        if (ddmmyyyyMatch) {
                                                            const [, day, month, year] = ddmmyyyyMatch;
                                                            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                                        }
                                                        const yyyymmddMatch = text.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
                                                        if (!date && yyyymmddMatch) {
                                                            const [, year, month, day] = yyyymmddMatch;
                                                            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                                        }
                                                        if (date && !isNaN(date.getTime())) {
                                                            const formattedDate = date.toISOString().split('T')[0];
                                                            setWoForm({ ...woForm, startDate: formattedDate });
                                                        }
                                                    }}
                                                    placeholder="YYYY-MM-DD"
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg h-14 px-4 text-lg font-medium text-slate-800 focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-all outline-none shadow-sm cursor-pointer hover:bg-white"
                                                    title={lang === 'ar' ? 'انقر مرتين للصق من Excel' : 'Double-click to paste from Excel'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- STEP 2: ITEMS TABLE (Highly Professional) --- */}
                                {currentStep === 2 && (
                                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500 overflow-hidden">
                                        {/* Toolbar */}
                                        <div className="px-8 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><Box className="text-slate-700" /> Manufacturing Items</h3>
                                                <p className="text-slate-500 text-xs mt-1 pl-9 flex items-center gap-1"><Info size={12} /> Double-click any column header to paste data from Excel.</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={handlePasteFromExcel} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-50 hover:border-slate-500 hover:text-slate-900 transition-all shadow-sm"><Clipboard size={16} /> Paste Full Sheet</button>
                                                <button onClick={addItem} className="flex items-center gap-2 bg-slate-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 hover:shadow-lg transition-all active:transform active:scale-95"><Plus size={18} /> Add New Item</button>
                                            </div>
                                        </div>

                                        {/* Table */}
                                        <div className="flex-1 overflow-auto p-0">
                                            <table className="w-full border-collapse text-sm">
                                                <thead className="bg-[#1e293b] text-slate-100 sticky top-0 z-10 shadow-md">
                                                    <tr>
                                                        <th rowSpan={2} className="px-3 py-3 text-center font-bold border-r border-slate-700 w-12 bg-[#0f172a]">#</th>
                                                        <th rowSpan={2} className="px-4 py-3 text-left font-bold border-r border-slate-700 min-w-[280px] group cursor-pointer hover:bg-slate-800 transition-colors" onDoubleClick={() => handleColumnPaste('itemName', 'items')}>
                                                            <div className="flex items-center justify-between">Item Name <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" /></div>
                                                        </th>
                                                        <th rowSpan={2} className="px-3 py-3 text-center font-bold border-r border-slate-700 w-20 group cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('quantity', 'items')}>
                                                            <div className="flex items-center justify-center gap-1">Qty <Copy size={10} className="opacity-0 group-hover:opacity-100 text-slate-400" /></div>
                                                        </th>
                                                        <th rowSpan={2} className="px-2 py-3 text-center font-bold border-r border-slate-700 w-10 bg-[#0f172a]" title="Toggle dimension mode">
                                                            <div className="text-xs text-slate-400">⇄</div>
                                                        </th>
                                                        <th colSpan={3} className="px-2 py-1.5 text-center font-bold border-b border-r border-slate-700 bg-[#0f172a] text-slate-300">Dimensions (mm)</th>
                                                        <th rowSpan={2} className="px-4 py-3 text-center font-bold border-r border-slate-700 min-w-[110px] group cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('modelCode', 'items')}>Model Code</th>
                                                        <th colSpan={2} className="px-2 py-1.5 text-center font-bold border-b border-r border-slate-700 bg-[#0f172a] text-slate-300">Paint Finish</th>
                                                        <th rowSpan={2} className="px-3 py-3 text-center font-bold border-r border-slate-700 w-20 group cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('glossPercentage', 'items')}>% Glossy</th>
                                                        <th rowSpan={2} className="px-3 py-3 text-center font-bold border-r border-slate-700 w-20 group cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('veneer', 'items')}>Veneer</th>
                                                        <th rowSpan={2} className="px-4 py-3 text-left font-bold border-r border-slate-700 min-w-[180px] group cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('notes', 'items')}>Notes</th>
                                                        <th rowSpan={2} className="w-12 bg-[#1e293b]"></th>
                                                    </tr>
                                                    <tr>
                                                        <th className="px-2 py-2 text-center font-semibold border-r border-slate-700 text-xs text-slate-300 cursor-pointer hover:bg-slate-800 w-16" onDoubleClick={() => handleColumnPaste('height', 'items')}>H</th>
                                                        <th className="px-2 py-2 text-center font-semibold border-r border-slate-700 text-xs text-slate-300 cursor-pointer hover:bg-slate-800 w-16" onDoubleClick={() => handleColumnPaste('length', 'items')}>L</th>
                                                        <th className="px-2 py-2 text-center font-semibold border-r border-slate-700 text-xs text-slate-300 cursor-pointer hover:bg-slate-800 w-16" onDoubleClick={() => handleColumnPaste('width', 'items')}>W</th>
                                                        <th className="px-2 py-2 text-center font-semibold border-r border-slate-700 text-xs text-slate-300 cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('paintColor', 'items')}>Color</th>
                                                        <th className="px-2 py-2 text-center font-semibold border-r border-slate-700 text-xs text-slate-300 cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('paintCode', 'items')}>Code</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-slate-200">
                                                    {woForm.items.map((item, idx) => (
                                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                            <td className="px-3 py-2 text-center text-slate-500 font-bold bg-slate-50/50 border-r border-slate-200">{idx + 1}</td>
                                                            <td className="p-2 border-r border-slate-100"><AutoCompleteInput value={item.itemName} onChange={v => updateItem(idx, 'itemName', v)} suggestions={autoCompleteService.getSuggestions('itemNames', item.itemName)} className="w-full h-10 px-3 border border-slate-300 rounded focus:ring-2 focus:ring-slate-700 focus:border-slate-700 transition-all font-semibold text-slate-700" placeholder="Enter Item Name" /></td>
                                                            <td className="p-2 border-r border-slate-100"><input type="text" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="w-full h-10 text-center border border-slate-300 rounded focus:ring-2 focus:ring-slate-700 focus:border-slate-700 font-bold text-slate-700 bg-slate-50/20" /></td>

                                                            {/* Dimension Mode Toggle Button */}
                                                            <td className="p-2 border-r border-slate-100 text-center">
                                                                <button
                                                                    onClick={() => {
                                                                        const newItems = [...woForm.items];
                                                                        newItems[idx] = {
                                                                            ...newItems[idx],
                                                                            dimensionMode: item.dimensionMode === 'text' ? 'numeric' : 'text',
                                                                            dimensions: item.dimensionMode === 'text'
                                                                                ? { width: 0, length: 0, height: 0 }
                                                                                : { width: '', length: '', height: '' }
                                                                        };
                                                                        setWoForm({ ...woForm, items: newItems });
                                                                    }}
                                                                    className={`w-8 h-8 rounded transition-all ${item.dimensionMode === 'text'
                                                                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                                                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                                                                        }`}
                                                                    title={item.dimensionMode === 'text' ? 'Switch to numeric (H/L/W)' : 'Switch to text mode'}
                                                                >
                                                                    {item.dimensionMode === 'text' ? '123' : 'T'}
                                                                </button>
                                                            </td>

                                                            {/* Dimension Fields */}
                                                            {item.dimensionMode === 'text' ? (
                                                                // Text Mode: Single wide field
                                                                <td colSpan={3} className="p-2 border-r border-slate-100">
                                                                    <input
                                                                        type="text"
                                                                        value={(item.dimensions?.width || item.dimensions?.length || item.dimensions?.height || '') as string}
                                                                        onChange={e => {
                                                                            const newItems = [...woForm.items];
                                                                            newItems[idx] = {
                                                                                ...newItems[idx],
                                                                                dimensions: { width: e.target.value, length: '', height: '' }
                                                                            };
                                                                            setWoForm({ ...woForm, items: newItems });
                                                                        }}
                                                                        className="w-full h-10 px-3 border border-slate-300 rounded focus:ring-2 focus:ring-slate-700 transition-all text-center font-medium"
                                                                        placeholder="AS PER SHOP DRAWING"
                                                                    />
                                                                </td>
                                                            ) : (
                                                                // Numeric Mode: Three separate fields
                                                                <>
                                                                    <td className="p-2 border-r border-slate-100"><input type="text" value={item.dimensions.height || ''} onChange={e => updateItem(idx, 'dimensions.height', e.target.value)} className="w-full h-10 text-center border border-slate-300 rounded focus:ring-2 focus:ring-slate-700 transition-all" placeholder="H" /></td>
                                                                    <td className="p-2 border-r border-slate-100"><input type="text" value={item.dimensions.length || ''} onChange={e => updateItem(idx, 'dimensions.length', e.target.value)} className="w-full h-10 text-center border border-slate-300 rounded focus:ring-2 focus:ring-slate-700 transition-all" placeholder="L" /></td>
                                                                    <td className="p-2 border-r border-slate-100"><input type="text" value={item.dimensions.width || ''} onChange={e => updateItem(idx, 'dimensions.width', e.target.value)} className="w-full h-10 text-center border border-slate-300 rounded focus:ring-2 focus:ring-slate-700 transition-all" placeholder="W" /></td>
                                                                </>
                                                            )}

                                                            <td className="p-2 border-r border-slate-100"><input type="text" value={item.modelCode} onChange={e => updateItem(idx, 'modelCode', e.target.value)} className="w-full h-10 px-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-700 transition-all text-center" placeholder="Model" /></td>
                                                            <td className="p-2 border-r border-slate-100"><div className="flex gap-2 h-10"><input type="color" value={item.paintColor || '#000000'} onChange={e => updateItem(idx, 'paintColor', e.target.value)} className="w-10 h-full rounded border cursor-pointer" /><input type="text" value={item.paintColor} onChange={e => updateItem(idx, 'paintColor', e.target.value)} className="w-full h-full px-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-700 text-xs" /></div></td>
                                                            <td className="p-2 border-r border-slate-100"><input type="text" value={item.paintCode} onChange={e => updateItem(idx, 'paintCode', e.target.value)} className="w-full h-10 px-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-700 text-center" placeholder="Code" /></td>
                                                            <td className="p-2 border-r border-slate-100"><input type="text" value={item.glossPercentage} onChange={e => updateItem(idx, 'glossPercentage', e.target.value)} className="w-full h-10 text-center border border-slate-300 rounded focus:ring-2 focus:ring-slate-700" placeholder="%" /></td>
                                                            <td className="p-2 border-r border-slate-100"><select value={item.veneer} onChange={e => updateItem(idx, 'veneer', e.target.value)} className="w-full h-10 px-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-700 bg-white text-center font-medium"><option>NO</option><option>YES</option></select></td>
                                                            <td className="p-2 border-r border-slate-100"><input type="text" value={item.notes} onChange={e => updateItem(idx, 'notes', e.target.value)} className="w-full h-10 px-3 border border-slate-300 rounded focus:ring-2 focus:ring-slate-700" placeholder="Notes..." /></td>
                                                            <td className="p-2 text-center"><button onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all"><Trash2 size={16} /></button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* --- STEP 3: WOOD MATERIALS (Amber Theme) --- */}
                                {currentStep === 3 && (
                                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500 overflow-hidden">
                                        <div className="px-8 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                            <div><h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><Hammer className="text-slate-700" /> Wood Materials</h3></div>
                                            <div className="flex gap-4"><button onClick={handlePasteWoodMaterials} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg font-bold hover:bg-slate-50 hover:border-slate-500 transition-all shadow-sm"><Clipboard size={16} /> Paste Excel</button><button onClick={() => addMaterial('wood')} className="flex items-center gap-2 bg-slate-700 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 shadow-md transition-all"><Plus size={18} /> Add Wood</button></div>
                                        </div>
                                        <div className="flex-1 overflow-auto p-0">
                                            <table className="w-full border-collapse text-sm">
                                                <thead className="bg-[#1e293b] text-slate-100 sticky top-0 z-10 shadow-md">
                                                    <tr>
                                                        <th className="px-3 py-3 text-center w-12 border-r border-slate-700 font-bold bg-[#0f172a]">#</th>
                                                        <th className="px-4 py-3 text-left border-r border-slate-700 min-w-[280px] cursor-pointer hover:bg-slate-800 transition-colors" onDoubleClick={() => handleColumnPaste('productName', 'materials', 'wood')}>
                                                            <div className="flex items-center justify-between">Material Name <Copy size={10} className="opacity-0 hover:opacity-100 transition-opacity" /></div>
                                                        </th>
                                                        <th className="px-3 py-3 text-center border-r border-slate-700 w-20 cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('quantity', 'materials', 'wood')}>Qty</th>
                                                        <th className="px-3 py-3 text-center border-r border-slate-700 w-24 cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('unit', 'materials', 'wood')}>Unit</th>
                                                        <th className="px-3 py-3 text-center border-r border-slate-700 w-20 cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('width', 'materials', 'wood')}>Width</th>
                                                        <th className="px-3 py-3 text-center border-r border-slate-700 w-20 cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('thickness', 'materials', 'wood')}>Thick</th>
                                                        <th className="px-3 py-3 text-center border-r border-slate-700 w-20 cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('length', 'materials', 'wood')}>Length</th>
                                                        <th className="px-4 py-3 text-left border-r border-slate-700 min-w-[200px] cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('notes', 'materials', 'wood')}>Notes</th>
                                                        <th className="w-12 bg-[#1e293b]"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-slate-100">
                                                    {woForm.materials.filter(m => m.category === 'wood').map((mat, idx) => (
                                                        <tr key={mat.id} className="hover:bg-slate-50/30 transition-colors">
                                                            <td className="px-3 py-2 text-center font-bold text-slate-900/50 bg-slate-50/30 border-r border-slate-100">{idx + 1}</td>
                                                            <td className="p-2 border-r border-slate-100"><input type="text" value={mat.productName} onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'productName', e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded focus:ring-2 focus:ring-slate-700 font-medium" placeholder="Material name..." /></td>
                                                            <td className="p-2 border-r border-slate-100"><input type="number" value={mat.quantity} onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'quantity', e.target.value)} className="w-full h-10 text-center border border-slate-200 rounded focus:ring-2 focus:ring-slate-700 font-bold text-slate-700" /></td>
                                                            <td className="p-2 border-r border-slate-100">
                                                                {mat.unit && !['PCS', 'SHEET', 'M³', 'LM', 'SET'].includes(mat.unit) ? (
                                                                    <div className="flex gap-1">
                                                                        <input type="text" value={mat.unit} onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'unit', e.target.value)} className="w-full h-10 text-center border border-slate-200 rounded focus:ring-2 focus:ring-slate-700 font-medium" placeholder="Custom unit..." />
                                                                        <button onClick={() => updateMaterial(woForm.materials.indexOf(mat), 'unit', 'PCS')} className="px-2 h-10 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 text-xs" title="Reset to dropdown">↺</button>
                                                                    </div>
                                                                ) : (
                                                                    <select value={mat.unit || ''} onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'unit', e.target.value)} className="w-full h-10 text-center border border-slate-200 rounded focus:ring-2 focus:ring-slate-700 bg-white font-medium cursor-pointer">
                                                                        <option value="">-- Select Unit --</option>
                                                                        <option value="PCS">PCS</option>
                                                                        <option value="SHEET">SHEET</option>
                                                                        <option value="M³">M³</option>
                                                                        <option value="LM">LM</option>
                                                                        <option value="SET">SET</option>
                                                                        <option value="__custom__">+ Custom</option>
                                                                    </select>
                                                                )}
                                                            </td>
                                                            <td className="p-2 border-r border-slate-100"><input type="number" value={mat.size?.width} onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'size', { ...mat.size, width: e.target.value })} className="w-full h-10 text-center border border-slate-200 rounded focus:ring-2 focus:ring-slate-700" placeholder="0" /></td>
                                                            <td className="p-2 border-r border-slate-100"><input type="number" value={mat.size?.thickness} onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'size', { ...mat.size, thickness: e.target.value })} className="w-full h-10 text-center border border-slate-200 rounded focus:ring-2 focus:ring-slate-700" placeholder="0" /></td>
                                                            <td className="p-2 border-r border-slate-100"><input type="number" value={mat.size?.length} onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'size', { ...mat.size, length: e.target.value })} className="w-full h-10 text-center border border-slate-200 rounded focus:ring-2 focus:ring-slate-700" placeholder="0" /></td>
                                                            <td className="p-2 border-r border-slate-100"><input type="text" value={mat.notes} onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'notes', e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded focus:ring-2 focus:ring-slate-700" placeholder="Notes..." /></td>
                                                            <td className="p-2 text-center"><button onClick={() => removeMaterial(woForm.materials.indexOf(mat))} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all"><Trash2 size={16} /></button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* --- STEP 4: HARDWARE (Indigo Theme) --- */}
                                {currentStep === 4 && (
                                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500 overflow-hidden">
                                        <div className="px-8 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                            <div><h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><PenTool className="text-slate-700" /> Hardware & Accessories</h3></div>
                                            <div className="flex gap-4"><button onClick={handlePasteAccessories} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg font-bold hover:bg-slate-50 hover:border-slate-500 transition-all shadow-sm"><Clipboard size={16} /> Paste Excel</button><button onClick={() => addMaterial('accessories')} className="flex items-center gap-2 bg-slate-700 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 shadow-md transition-all"><Plus size={18} /> Add Hardware</button></div>
                                        </div>
                                        <div className="flex-1 overflow-auto p-0">
                                            <table className="w-full border-collapse text-sm">
                                                <thead className="bg-[#1e293b] text-slate-100 sticky top-0 z-10 shadow-md">
                                                    <tr>
                                                        <th className="px-3 py-3 text-center w-12 border-r border-slate-700 font-bold bg-[#0f172a]">#</th>
                                                        <th className="px-4 py-3 text-left border-r border-slate-700 min-w-[320px] cursor-pointer hover:bg-slate-800 transition-colors" onDoubleClick={() => handleColumnPaste('productName', 'materials', 'accessories')}>
                                                            <div className="flex items-center justify-between">Item Name <Copy size={10} className="opacity-0 hover:opacity-100 transition-opacity" /></div>
                                                        </th>
                                                        <th className="px-3 py-3 text-center border-r border-slate-700 w-20 cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('quantity', 'materials', 'accessories')}>Qty</th>
                                                        <th className="px-3 py-3 text-center border-r border-slate-700 w-24 cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('unit', 'materials', 'accessories')}>Unit</th>
                                                        <th className="px-4 py-3 text-left border-r border-slate-700 min-w-[240px] cursor-pointer hover:bg-slate-800" onDoubleClick={() => handleColumnPaste('notes', 'materials', 'accessories')}>Notes</th>
                                                        <th className="w-12 bg-[#1e293b]"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-slate-100">
                                                    {woForm.materials.filter(m => m.category === 'accessories').map((mat, idx) => (
                                                        <tr key={mat.id} className="hover:bg-slate-50/30 transition-colors">
                                                            <td className="px-3 py-2 text-center font-bold text-slate-900/50 bg-slate-50/30 border-r border-slate-100">{idx + 1}</td>
                                                            <td className="p-2 border-r border-slate-100"><input type="text" value={mat.productName} onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'productName', e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded focus:ring-2 focus:ring-slate-700 font-medium" placeholder="Item name..." /></td>
                                                            <td className="p-2 border-r border-slate-100"><input type="number" value={mat.quantity} onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'quantity', e.target.value)} className="w-full h-10 text-center border border-slate-200 rounded focus:ring-2 focus:ring-slate-700 font-bold text-slate-700" /></td>
                                                            <td className="p-2 border-r border-slate-100">
                                                                {mat.unit && !['PCS', 'SET', 'BOX', 'PKT'].includes(mat.unit) ? (
                                                                    <div className="flex gap-1">
                                                                        <input type="text" value={mat.unit} onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'unit', e.target.value)} className="w-full h-10 text-center border border-slate-200 rounded focus:ring-2 focus:ring-slate-700 font-medium" placeholder="Custom unit..." />
                                                                        <button onClick={() => updateMaterial(woForm.materials.indexOf(mat), 'unit', 'PCS')} className="px-2 h-10 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 text-xs" title="Reset to dropdown">↺</button>
                                                                    </div>
                                                                ) : (
                                                                    <select value={mat.unit || ''} onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'unit', e.target.value)} className="w-full h-10 text-center border border-slate-200 rounded focus:ring-2 focus:ring-slate-700 bg-white font-medium cursor-pointer">
                                                                        <option value="">-- Select Unit --</option>
                                                                        <option value="PCS">PCS</option>
                                                                        <option value="SET">SET</option>
                                                                        <option value="BOX">BOX</option>
                                                                        <option value="PKT">PKT</option>
                                                                        <option value="__custom__">+ Custom</option>
                                                                    </select>
                                                                )}
                                                            </td>
                                                            <td className="p-2 border-r border-slate-100"><input type="text" value={mat.notes} onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'notes', e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded focus:ring-2 focus:ring-slate-700" placeholder="Notes..." /></td>
                                                            <td className="p-2 text-center"><button onClick={() => removeMaterial(woForm.materials.indexOf(mat))} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all"><Trash2 size={16} /></button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* --- STEP 5: FINAL REVIEW --- */}
                                {currentStep === 5 && (
                                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500 overflow-hidden">
                                        {/* Review Content */}
                                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                                            <div className="max-w-[1200px] mx-auto bg-white shadow-2xl rounded-lg overflow-hidden border-2 border-slate-300">

                                                {/* Company Header - Like Print */}
                                                <div className="bg-gradient-to-r from-[#6d4c41] to-[#8d6e63] p-6 border-b-4 border-[#5d4037]">
                                                    <div className="flex justify-between items-start text-white">
                                                        <div className="flex items-center gap-4">
                                                            <img src="/LOGO11.png" className="w-16 h-16 bg-white rounded-lg p-2" alt="Logo" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                            <div>
                                                                <h2 className="text-2xl font-black tracking-tight">FOREST EDGE FACTORY</h2>
                                                                <p className="text-sm opacity-90 mt-1">Manufacturing Work Order</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <input
                                                                type="text"
                                                                value={woForm.orderNumber}
                                                                onChange={e => setWoForm({ ...woForm, orderNumber: e.target.value })}
                                                                className="text-3xl font-black font-mono bg-white/20 border-2 border-white/40 rounded-lg px-4 py-2 text-white text-right focus:ring-2 focus:ring-white/60 transition-all"
                                                            />
                                                            <div className="text-sm opacity-90 mt-1">Ref. Number (Editable)</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Basic Info Section - Editable */}
                                                <div className="p-6 border-b-2 border-slate-200 bg-slate-50">
                                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                        <FileText size={20} className="text-slate-600" />
                                                        Order Information
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Customer Name</label>
                                                            <input
                                                                type="text"
                                                                value={woForm.customerName}
                                                                onChange={e => setWoForm({ ...woForm, customerName: e.target.value })}
                                                                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">WO Number</label>
                                                            <input
                                                                type="text"
                                                                value={woForm.jobOrderNumber}
                                                                onChange={e => setWoForm({ ...woForm, jobOrderNumber: e.target.value })}
                                                                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Start Date</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="date"
                                                                    value={woForm.startDate}
                                                                    onChange={e => setWoForm({ ...woForm, startDate: e.target.value })}
                                                                    className="w-full px-4 py-2 pr-20 border-2 border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-all"
                                                                />
                                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                                                    <button
                                                                        onClick={() => copyDateToClipboard(woForm.startDate)}
                                                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-all"
                                                                        title="Copy to clipboard (DD/MM/YYYY)"
                                                                    >
                                                                        📋
                                                                    </button>
                                                                    <button
                                                                        onClick={() => pasteDateFromClipboard('startDate')}
                                                                        className="p-1.5 text-slate-400 hover:text-green-700 hover:bg-green-100 rounded transition-all"
                                                                        title="Paste from clipboard"
                                                                    >
                                                                        📥
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">End Date</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="date"
                                                                    value={woForm.endDate}
                                                                    onChange={e => setWoForm({ ...woForm, endDate: e.target.value })}
                                                                    className="w-full px-4 py-2 pr-20 border-2 border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-all"
                                                                />
                                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                                                    <button
                                                                        onClick={() => copyDateToClipboard(woForm.endDate)}
                                                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-all"
                                                                        title="Copy to clipboard (DD/MM/YYYY)"
                                                                    >
                                                                        📋
                                                                    </button>
                                                                    <button
                                                                        onClick={() => pasteDateFromClipboard('endDate')}
                                                                        className="p-1.5 text-slate-400 hover:text-green-700 hover:bg-green-100 rounded transition-all"
                                                                        title="Paste from clipboard"
                                                                    >
                                                                        📥
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Priority</label>
                                                            <select
                                                                value={woForm.priority}
                                                                onChange={e => setWoForm({ ...woForm, priority: e.target.value as any })}
                                                                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-all"
                                                            >
                                                                <option value="normal">Normal</option>
                                                                <option value="high">High</option>
                                                                <option value="urgent">Urgent</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Items Table - Editable */}
                                                <div className="p-6 border-b-2 border-slate-200">
                                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                        <Box size={20} className="text-slate-600" />
                                                        Items to Manufacture
                                                    </h3>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border-collapse text-sm">
                                                            <thead className="bg-[#6d4c41] text-white">
                                                                <tr>
                                                                    <th className="px-2 py-2 text-center border border-slate-400 font-bold text-xs">#</th>
                                                                    <th className="px-2 py-2 text-left border border-slate-400 font-bold text-xs">Item Name</th>
                                                                    <th className="px-2 py-2 text-center border border-slate-400 font-bold text-xs">Qty</th>
                                                                    <th className="px-2 py-2 text-center border border-slate-400 font-bold text-xs">H</th>
                                                                    <th className="px-2 py-2 text-center border border-slate-400 font-bold text-xs">L</th>
                                                                    <th className="px-2 py-2 text-center border border-slate-400 font-bold text-xs">W</th>
                                                                    <th className="px-2 py-2 text-center border border-slate-400 font-bold text-xs">Model</th>
                                                                    <th className="px-2 py-2 text-center border border-slate-400 font-bold text-xs">Paint Color</th>
                                                                    <th className="px-2 py-2 text-center border border-slate-400 font-bold text-xs">Paint Code</th>
                                                                    <th className="px-2 py-2 text-center border border-slate-400 font-bold text-xs">Glossy %</th>
                                                                    <th className="px-2 py-2 text-center border border-slate-400 font-bold text-xs">Veneer</th>
                                                                    <th className="px-2 py-2 text-left border border-slate-400 font-bold text-xs">Notes</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white">
                                                                {woForm.items.filter(i => i.itemName).map((item, idx) => (
                                                                    <tr key={item.id} className="hover:bg-slate-50">
                                                                        <td className="px-2 py-2 text-center border border-slate-300 font-bold text-slate-600 text-xs">{idx + 1}</td>
                                                                        <td className="px-1 py-1 border border-slate-300">
                                                                            <input
                                                                                type="text"
                                                                                value={item.itemName}
                                                                                onChange={e => updateItem(idx, 'itemName', e.target.value)}
                                                                                className="w-full px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 font-medium text-xs"
                                                                            />
                                                                        </td>
                                                                        <td className="px-1 py-1 border border-slate-300">
                                                                            <input
                                                                                type="number"
                                                                                value={item.quantity}
                                                                                onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                                                                className="w-full px-2 py-1 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 font-bold text-xs"
                                                                            />
                                                                        </td>
                                                                        <td className="px-1 py-1 border border-slate-300">
                                                                            <input
                                                                                type="number"
                                                                                value={item.dimensions.height}
                                                                                onChange={e => updateItem(idx, 'dimensions.height', e.target.value)}
                                                                                className="w-full px-1 py-1 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                            />
                                                                        </td>
                                                                        <td className="px-1 py-1 border border-slate-300">
                                                                            <input
                                                                                type="number"
                                                                                value={item.dimensions.length}
                                                                                onChange={e => updateItem(idx, 'dimensions.length', e.target.value)}
                                                                                className="w-full px-1 py-1 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                            />
                                                                        </td>
                                                                        <td className="px-1 py-1 border border-slate-300">
                                                                            <input
                                                                                type="number"
                                                                                value={item.dimensions.width}
                                                                                onChange={e => updateItem(idx, 'dimensions.width', e.target.value)}
                                                                                className="w-full px-1 py-1 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                            />
                                                                        </td>
                                                                        <td className="px-1 py-1 border border-slate-300">
                                                                            <input
                                                                                type="text"
                                                                                value={item.modelCode}
                                                                                onChange={e => updateItem(idx, 'modelCode', e.target.value)}
                                                                                className="w-full px-1 py-1 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                            />
                                                                        </td>
                                                                        <td className="px-1 py-1 border border-slate-300">
                                                                            <input
                                                                                type="text"
                                                                                value={item.paintColor}
                                                                                onChange={e => updateItem(idx, 'paintColor', e.target.value)}
                                                                                className="w-full px-1 py-1 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                            />
                                                                        </td>
                                                                        <td className="px-1 py-1 border border-slate-300">
                                                                            <input
                                                                                type="text"
                                                                                value={item.paintCode}
                                                                                onChange={e => updateItem(idx, 'paintCode', e.target.value)}
                                                                                className="w-full px-1 py-1 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                            />
                                                                        </td>
                                                                        <td className="px-1 py-1 border border-slate-300">
                                                                            <input
                                                                                type="text"
                                                                                value={item.glossPercentage}
                                                                                onChange={e => updateItem(idx, 'glossPercentage', e.target.value)}
                                                                                className="w-full px-1 py-1 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                            />
                                                                        </td>
                                                                        <td className="px-1 py-1 border border-slate-300">
                                                                            <select
                                                                                value={item.veneer}
                                                                                onChange={e => updateItem(idx, 'veneer', e.target.value)}
                                                                                className="w-full px-1 py-1 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 font-medium text-xs"
                                                                            >
                                                                                <option>NO</option>
                                                                                <option>YES</option>
                                                                            </select>
                                                                        </td>
                                                                        <td className="px-1 py-1 border border-slate-300">
                                                                            <input
                                                                                type="text"
                                                                                value={item.notes}
                                                                                onChange={e => updateItem(idx, 'notes', e.target.value)}
                                                                                className="w-full px-1 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                                placeholder="Notes..."
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Materials Section - Two Columns */}
                                                <div className="p-6">
                                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                        <Hammer size={20} className="text-slate-600" />
                                                        Material Request
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        {/* Wood Materials */}
                                                        <div>
                                                            <h4 className="text-sm font-bold text-white bg-[#6d4c41] px-3 py-2 rounded-t-lg">WOOD MATERIALS</h4>
                                                            <table className="w-full border-collapse text-xs">
                                                                <thead className="bg-slate-200">
                                                                    <tr>
                                                                        <th className="px-2 py-1 border border-slate-300 text-left font-bold text-xs">Material</th>
                                                                        <th className="px-2 py-1 border border-slate-300 text-center font-bold text-xs">Qty</th>
                                                                        <th className="px-2 py-1 border border-slate-300 text-center font-bold text-xs">Unit</th>
                                                                        <th className="px-2 py-1 border border-slate-300 text-center font-bold text-xs">W</th>
                                                                        <th className="px-2 py-1 border border-slate-300 text-center font-bold text-xs">L</th>
                                                                        <th className="px-2 py-1 border border-slate-300 text-left font-bold text-xs">Notes</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="bg-white">
                                                                    {woForm.materials.filter(m => m.category === 'wood' && m.productName).map((mat, idx) => (
                                                                        <tr key={mat.id} className="hover:bg-slate-50">
                                                                            <td className="px-1 py-1 border border-slate-300">
                                                                                <input
                                                                                    type="text"
                                                                                    value={mat.productName}
                                                                                    onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'productName', e.target.value)}
                                                                                    className="w-full px-1 py-0.5 border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                                />
                                                                            </td>
                                                                            <td className="px-1 py-1 border border-slate-300">
                                                                                <input
                                                                                    type="number"
                                                                                    value={mat.quantity}
                                                                                    onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'quantity', e.target.value)}
                                                                                    className="w-full px-1 py-0.5 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs font-bold"
                                                                                />
                                                                            </td>
                                                                            <td className="px-1 py-1 border border-slate-300">
                                                                                <input
                                                                                    type="text"
                                                                                    value={mat.unit}
                                                                                    onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'unit', e.target.value)}
                                                                                    className="w-full px-1 py-0.5 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                                />
                                                                            </td>
                                                                            <td className="px-1 py-1 border border-slate-300">
                                                                                <input
                                                                                    type="number"
                                                                                    value={mat.size?.width || ''}
                                                                                    onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'size', { ...mat.size, width: e.target.value })}
                                                                                    className="w-full px-1 py-0.5 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                                />
                                                                            </td>
                                                                            <td className="px-1 py-1 border border-slate-300">
                                                                                <input
                                                                                    type="number"
                                                                                    value={mat.size?.length || ''}
                                                                                    onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'size', { ...mat.size, length: e.target.value })}
                                                                                    className="w-full px-1 py-0.5 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                                />
                                                                            </td>
                                                                            <td className="px-1 py-1 border border-slate-300">
                                                                                <input
                                                                                    type="text"
                                                                                    value={mat.notes || ''}
                                                                                    onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'notes', e.target.value)}
                                                                                    className="w-full px-1 py-0.5 border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                                    placeholder="Notes..."
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        {/* Accessories */}
                                                        <div>
                                                            <h4 className="text-sm font-bold text-white bg-[#6d4c41] px-3 py-2 rounded-t-lg">ACCESSORIES</h4>
                                                            <table className="w-full border-collapse text-xs">
                                                                <thead className="bg-slate-200">
                                                                    <tr>
                                                                        <th className="px-2 py-1 border border-slate-300 text-left font-bold text-xs">Item</th>
                                                                        <th className="px-2 py-1 border border-slate-300 text-center font-bold text-xs">Qty</th>
                                                                        <th className="px-2 py-1 border border-slate-300 text-center font-bold text-xs">Unit</th>
                                                                        <th className="px-2 py-1 border border-slate-300 text-left font-bold text-xs">Notes</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="bg-white">
                                                                    {woForm.materials.filter(m => m.category === 'accessories' && m.productName).map((mat, idx) => (
                                                                        <tr key={mat.id} className="hover:bg-slate-50">
                                                                            <td className="px-1 py-1 border border-slate-300">
                                                                                <input
                                                                                    type="text"
                                                                                    value={mat.productName}
                                                                                    onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'productName', e.target.value)}
                                                                                    className="w-full px-1 py-0.5 border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                                />
                                                                            </td>
                                                                            <td className="px-1 py-1 border border-slate-300">
                                                                                <input
                                                                                    type="number"
                                                                                    value={mat.quantity}
                                                                                    onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'quantity', e.target.value)}
                                                                                    className="w-full px-1 py-0.5 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs font-bold"
                                                                                />
                                                                            </td>
                                                                            <td className="px-1 py-1 border border-slate-300">
                                                                                <input
                                                                                    type="text"
                                                                                    value={mat.unit}
                                                                                    onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'unit', e.target.value)}
                                                                                    className="w-full px-1 py-0.5 text-center border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                                />
                                                                            </td>
                                                                            <td className="px-1 py-1 border border-slate-300">
                                                                                <input
                                                                                    type="text"
                                                                                    value={mat.notes || ''}
                                                                                    onChange={e => updateMaterial(woForm.materials.indexOf(mat), 'notes', e.target.value)}
                                                                                    className="w-full px-1 py-0.5 border border-slate-200 rounded focus:ring-1 focus:ring-slate-500 text-xs"
                                                                                    placeholder="Notes..."
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer Note */}
                                                <div className="p-6 bg-slate-100 border-t-2 border-slate-300">
                                                    <p className="text-sm text-slate-600 text-center font-medium">
                                                        <CheckCircle2 size={16} className="inline mr-2 text-green-600" />
                                                        Review all information above and click "Save & Finish" to complete the work order
                                                    </p>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Footer */}
                        <div className="bg-white p-6 border-t border-slate-200 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] z-30 shrink-0 flex justify-between items-center">
                            <button onClick={() => setShowWOModal(false)} className="px-8 py-3 text-slate-500 font-bold hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all uppercase text-sm tracking-wide">Cancel</button>
                            <div className="flex gap-4">
                                {currentStep > 1 && <button onClick={handlePrevStep} className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 hover:border-slate-400 flex items-center gap-2 uppercase text-sm tracking-wide transition-all shadow-sm"><ChevronLeft size={18} /> Back</button>}
                                {currentStep < totalSteps ?
                                    <button onClick={handleNextStep} className="px-12 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl flex items-center gap-3 uppercase text-sm tracking-wide transition-all transform active:scale-95">Next Step <ChevronRight size={18} /></button> :
                                    <button onClick={handleSaveWO} className="px-14 py-3 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl flex items-center gap-3 uppercase text-sm tracking-wide transition-all transform active:scale-95"><Save size={20} /> Save & Finish</button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Print Preview Modal */}
            {
                showPrintPreview && selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-5 border-b-2 border-slate-200 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Print Preview</h3>
                                    <p className="text-sm text-slate-500 mt-1">Review before printing</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handlePrint}
                                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <Printer size={18} /> Print
                                    </button>
                                    <button
                                        onClick={() => setShowPrintPreview(false)}
                                        className="p-3 hover:bg-slate-200 rounded-xl transition-all"
                                    >
                                        <X size={24} className="text-slate-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Print Content Preview */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] bg-slate-50">
                                <div className="bg-white p-6 shadow-lg mx-auto" style={{ maxWidth: '800px' }}>
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-3 pb-3 border-b-2 border-black">
                                        <div className="flex items-center gap-3">
                                            <img src="/LOGO11.png" className="w-12 h-12" alt="Logo" onError={(e) => e.currentTarget.style.display = 'none'} />
                                            <div className="text-xs">
                                                <div className="font-bold text-sm mb-0.5">FOREST EDGE FACTORY</div>
                                                <div className="text-[10px]">Riyadh, Saudi Arabia</div>
                                                <div className="text-[10px]">C.R: 7050835193</div>
                                                <div className="text-[10px]">VAT: 313142044200003</div>
                                            </div>
                                        </div>

                                        <div className="text-right text-[9px]" dir="rtl">
                                            <div>المملكة العربية السعودية – الرياض</div>
                                            <div>منطقة الخرج الصناعية بالرياض</div>
                                            <div>حي المعذر الشمالي - الأمير تركي بن عبد العزيز</div>
                                            <div>س ت: 7050835193</div>
                                            <div>رقم ضريبي: 313142044200003</div>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="bg-[#5d4037] text-white text-center py-1.5 font-bold text-sm mb-3 tracking-wide">
                                        WORK ORDER
                                    </div>

                                    {/* Basic Info - 6 columns grid */}
                                    <div className="grid grid-cols-6 gap-0 mb-3 border border-black text-[9px]">
                                        <div className="border-r border-b border-black p-1.5 text-center">
                                            <div className="font-bold text-[8px] uppercase mb-0.5">Job Order Date</div>
                                            <div className="font-bold">{new Date(selectedOrder.jobOrderDate).toLocaleDateString('en-GB')}</div>
                                        </div>
                                        <div className="border-r border-b border-black p-1.5 text-center">
                                            <div className="font-bold text-[8px] uppercase mb-0.5">Job Order No.</div>
                                            <div className="font-bold">{selectedOrder.jobOrderNumber}</div>
                                        </div>
                                        <div className="border-r border-b border-black p-1.5 text-center col-span-2">
                                            <div className="font-bold text-[8px] uppercase mb-0.5">CLIENT</div>
                                            <div className="font-bold">{selectedOrder.customerName}</div>
                                        </div>
                                        <div className="border-r border-b border-black p-1.5 text-center">
                                            <div className="font-bold text-[8px] uppercase mb-0.5">Start Date</div>
                                            <div className="font-bold text-[8px]">{selectedOrder.startDate ? new Date(selectedOrder.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</div>
                                        </div>
                                        <div className="border-b border-black p-1.5 text-center">
                                            <div className="font-bold text-[8px] uppercase mb-0.5">End Date</div>
                                            <div className="font-bold text-[8px]">{selectedOrder.endDate ? new Date(selectedOrder.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</div>
                                        </div>
                                        <div className="p-1.5 text-center col-span-6">
                                            <div className="font-bold text-[8px] uppercase mb-0.5">Priority</div>
                                            <div className="font-bold">{selectedOrder.priority || 'Normal'}</div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                                        <div className="mb-3">
                                            <table className="w-full border-collapse border border-black text-[8px]">
                                                <thead>
                                                    <tr className="bg-[#6d4c41] text-white">
                                                        <th rowSpan={2} className="border border-black px-1 py-1.5 text-center font-bold">NO.</th>
                                                        <th rowSpan={2} className="border border-black px-1 py-1.5 text-center font-bold">ITEM</th>
                                                        <th rowSpan={2} className="border border-black px-1 py-1.5 text-center font-bold">Q.TY</th>
                                                        <th colSpan={3} className="border border-black px-1 py-1 text-center font-bold">FINAL DIM. (mm)</th>
                                                        <th rowSpan={2} className="border border-black px-1 py-1.5 text-center font-bold">MODEL CODE</th>
                                                        <th colSpan={2} className="border border-black px-1 py-1 text-center font-bold">PAINT</th>
                                                        <th rowSpan={2} className="border border-black px-1 py-1.5 text-center font-bold">GLOSSY %</th>
                                                        <th rowSpan={2} className="border border-black px-1 py-1.5 text-center font-bold">VENEER</th>
                                                        <th rowSpan={2} className="border border-black px-1 py-1.5 text-center font-bold">NOTE</th>
                                                    </tr>
                                                    <tr className="bg-[#6d4c41] text-white">
                                                        <th className="border border-black px-1 py-1 text-center font-bold">H</th>
                                                        <th className="border border-black px-1 py-1 text-center font-bold">L</th>
                                                        <th className="border border-black px-1 py-1 text-center font-bold">W</th>
                                                        <th className="border border-black px-1 py-1 text-center font-bold">COLOR</th>
                                                        <th className="border border-black px-1 py-1 text-center font-bold">CODE</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedOrder.items.slice(0, 12).map((item, idx) => (
                                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                            <td className="border border-black px-1 py-1 text-center">{idx + 1}</td>
                                                            <td className="border border-black px-1 py-1 text-left">{item.itemName || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{item.quantity || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{item.dimensions?.height || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{item.dimensions?.length || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{item.dimensions?.width || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{item.modelCode || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{item.paintColor || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{item.paintCode || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{item.glossPercentage || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{item.veneer || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-left">{item.notes || ''}</td>
                                                        </tr>
                                                    ))}
                                                    {Array(Math.max(0, 12 - selectedOrder.items.length)).fill(0).map((_, idx) => (
                                                        <tr key={`empty-${idx}`}>
                                                            <td className="border border-black px-1 py-1 text-center">{selectedOrder.items.length + idx + 1}</td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Materials Section */}
                                    <div className="bg-[#6d4c41] text-white px-2 py-1 font-bold text-[10px] mb-1 text-center">
                                        MATERIAL REQUEST
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Wood Materials */}
                                        <div className="border border-black">
                                            <div className="bg-[#6d4c41] text-white px-2 py-1 font-bold text-center text-[9px]">
                                                WOOD
                                            </div>
                                            <table className="w-full border-collapse text-[8px]">
                                                <thead>
                                                    <tr className="bg-[#6d4c41] text-white">
                                                        <th className="border border-black px-1 py-1 text-center font-bold">MATERIAL NAME</th>
                                                        <th className="border border-black px-1 py-1 text-center font-bold">QTY</th>
                                                        <th className="border border-black px-1 py-1 text-center font-bold">UNIT</th>
                                                        <th className="border border-black px-1 py-1 text-center font-bold">W</th>
                                                        <th className="border border-black px-1 py-1 text-center font-bold">L</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(selectedOrder.materials?.filter(m => m.category === 'wood') || []).slice(0, 15).map((mat, idx) => (
                                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                            <td className="border border-black px-1 py-1 text-left">{mat.productName || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{mat.quantity || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{mat.unit || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{mat.size?.width || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{mat.size?.length || ''}</td>
                                                        </tr>
                                                    ))}
                                                    {Array(Math.max(0, 15 - (selectedOrder.materials?.filter(m => m.category === 'wood').length || 0))).fill(0).map((_, idx) => (
                                                        <tr key={`wood-empty-${idx}`}>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Accessories Materials */}
                                        <div className="border border-black">
                                            <div className="bg-[#6d4c41] text-white px-2 py-1 font-bold text-center text-[9px]">
                                                ACCESSORIES
                                            </div>
                                            <table className="w-full border-collapse text-[8px]">
                                                <thead>
                                                    <tr className="bg-[#6d4c41] text-white">
                                                        <th className="border border-black px-1 py-1 text-center font-bold">MATERIAL NAME</th>
                                                        <th className="border border-black px-1 py-1 text-center font-bold">QTY</th>
                                                        <th className="border border-black px-1 py-1 text-center font-bold">NOTES</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(selectedOrder.materials?.filter(m => m.category === 'accessories') || []).slice(0, 15).map((mat, idx) => (
                                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                            <td className="border border-black px-1 py-1 text-left">{mat.productName || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-center">{mat.quantity || ''}</td>
                                                            <td className="border border-black px-1 py-1 text-left">{mat.notes || ''}</td>
                                                        </tr>
                                                    ))}
                                                    {Array(Math.max(0, 15 - (selectedOrder.materials?.filter(m => m.category === 'accessories').length || 0))).fill(0).map((_, idx) => (
                                                        <tr key={`acc-empty-${idx}`}>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                            <td className="border border-black px-1 py-1"></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {showSummaryPrint && <WorkOrdersSummaryPrint workOrders={workOrders} lang={lang} onClose={() => setShowSummaryPrint(false)} />}

            {/* BULK IMPORT MODAL */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 border-b border-blue-800">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <Upload className="text-white" size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white">Bulk Import Work Orders</h2>
                                        <p className="text-blue-100 text-sm mt-1">Import multiple work orders from JSON file</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowImportModal(false);
                                        setImportResult(null);
                                        setImportProgress({ current: 0, total: 0, message: '' });
                                    }}
                                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                                    disabled={importing}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {!importing && !importResult && (
                                <div className="space-y-6">
                                    <div className="border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center bg-blue-50/50 hover:bg-blue-50 transition-all">
                                        <Upload className="mx-auto text-blue-600 mb-4" size={48} />
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">Select JSON File</h3>
                                        <p className="text-slate-600 mb-6">Choose your data.txt file to import work orders</p>
                                        <input
                                            type="file"
                                            accept=".txt,.json"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleBulkImport(file);
                                            }}
                                            className="hidden"
                                            id="import-file"
                                        />
                                        <label
                                            htmlFor="import-file"
                                            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-blue-700 transition-all shadow-lg transform active:scale-95"
                                        >
                                            Choose File
                                        </label>
                                    </div>

                                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                                        <div className="flex gap-3">
                                            <Info className="text-yellow-600 flex-shrink-0" size={20} />
                                            <div className="text-sm text-yellow-800">
                                                <p className="font-bold mb-1">Important Notes:</p>
                                                <ul className="list-disc list-inside space-y-1 text-yellow-700">
                                                    <li>File must be in JSON format (data.txt)</li>
                                                    <li>All work orders will be imported to Firebase</li>
                                                    <li>This process may take a few minutes</li>
                                                    <li>Duplicate orders will be created if file is imported multiple times</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {importing && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="inline-block bg-blue-100 p-6 rounded-full mb-4 animate-pulse">
                                            <Upload className="text-blue-600" size={48} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Importing Work Orders...</h3>
                                        <p className="text-slate-600">{importProgress.message}</p>
                                    </div>

                                    {importProgress.total > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm font-bold text-slate-700">
                                                <span>Progress</span>
                                                <span>{importProgress.current} / {importProgress.total}</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 rounded-full"
                                                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-center text-slate-600 text-sm">
                                                {Math.round((importProgress.current / importProgress.total) * 100)}% Complete
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {importResult && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className={`inline-block p-6 rounded-full mb-4 ${importResult.errors === 0 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                            <CheckCircle2 className={importResult.errors === 0 ? 'text-green-600' : 'text-yellow-600'} size={48} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Import Complete!</h3>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                                            <p className="text-3xl font-black text-blue-600">{importResult.total}</p>
                                            <p className="text-sm font-bold text-blue-700 mt-1">Total</p>
                                        </div>
                                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                                            <p className="text-3xl font-black text-green-600">{importResult.success}</p>
                                            <p className="text-sm font-bold text-green-700 mt-1">Success</p>
                                        </div>
                                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                                            <p className="text-3xl font-black text-red-600">{importResult.errors}</p>
                                            <p className="text-sm font-bold text-red-700 mt-1">Errors</p>
                                        </div>
                                    </div>

                                    {importResult.errorDetails.length > 0 && (
                                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                                            <p className="font-bold text-red-800 mb-2">Error Details:</p>
                                            <ul className="text-sm text-red-700 space-y-1">
                                                {importResult.errorDetails.map((error, i) => (
                                                    <li key={i} className="font-mono text-xs">{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => {
                                            setShowImportModal(false);
                                            setImportResult(null);
                                            setImportProgress({ current: 0, total: 0, message: '' });
                                        }}
                                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE ALL CONFIRMATION MODAL */}
            {showDeleteAllModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-3 rounded-xl">
                                    <Trash2 className="text-white" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">Delete All Work Orders</h2>
                                    <p className="text-red-100 text-sm mt-1">This action cannot be undone!</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                                <p className="text-red-800 font-bold text-lg mb-2">⚠️ Warning!</p>
                                <p className="text-red-700">
                                    You are about to delete <span className="font-black text-red-900">{workOrders.length} work orders</span> from Firebase.
                                </p>
                                <p className="text-red-700 mt-2">
                                    This action is <span className="font-black">PERMANENT</span> and cannot be reversed!
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteAllModal(false)}
                                    disabled={deleting}
                                    className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-300 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAll}
                                    disabled={deleting}
                                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={20} />
                                            Delete All
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PRINT-STYLE EDIT MODAL --- */}
            {showEditModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-lg shadow-2xl">
                        {/* Header with Close Button */}
                        <div className="sticky top-0 bg-slate-800 text-white px-6 py-3 flex justify-between items-center z-10 rounded-t-lg">
                            <h2 className="text-xl font-bold">Edit Work Order - {selectedOrder.jobOrderNumber}</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="hover:bg-slate-700 p-2 rounded-lg transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Print-Style Content (Editable) */}
                        <div className="p-8">
                            {/* Company Header - Exact Print Style */}
                            <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-300">
                                {/* Left: Logo + English Info */}
                                <div className="flex items-center gap-3">
                                    <img
                                        src="/LOGO11.png"
                                        alt="Forest Edge Factory Logo"
                                        className="w-12 h-12 object-contain"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                    <div className="text-left" style={{ fontSize: '8pt', lineHeight: '1.4' }}>
                                        <div className="font-bold text-sm">FOREST EDGE FACTORY</div>
                                        <div className="text-xs">Saudi Arabia - Riyadh</div>
                                        <div className="text-xs">C.R: 7050835193</div>
                                        <div className="text-xs">Vat No.: 313142044200003</div>
                                    </div>
                                </div>

                                {/* Right: Arabic Info */}
                                <div className="text-right" style={{ fontSize: '7.5pt', lineHeight: '1.4', direction: 'rtl' }}>
                                    <div className="font-bold text-xs">المملكة العربية السعودية – الرياض</div>
                                    <div className="text-xs">منطقة الخرج الصناعية بالرياض</div>
                                    <div className="text-xs">حي المعذر الشمالي لالامير تركي بن عبد العزيز</div>
                                    <div className="text-xs">س ت: 7050835193</div>
                                    <div className="text-xs">رقم ضريبي: 313142044200003</div>
                                </div>
                            </div>

                            {/* Work Order Title Bar - Exact Print Style (Editable) */}
                            <div className="bg-[#6d4c41] text-white text-center py-2 font-bold text-base mb-4 flex justify-center items-center gap-2" style={{ letterSpacing: '1px' }}>
                                <input
                                    type="text"
                                    value={woForm.orderNumber}
                                    onChange={(e) => setWoForm({ ...woForm, orderNumber: e.target.value })}
                                    className="bg-white/20 border-2 border-white/40 rounded px-3 py-1 text-white text-center font-bold focus:ring-2 focus:ring-white/60 transition-all"
                                    style={{ minWidth: '200px' }}
                                />
                            </div>

                            {/* Order Info Grid */}
                            <div className="grid grid-cols-6 gap-2 mb-4 text-sm">
                                <div className="border border-slate-300 p-2">
                                    <div className="text-xs font-bold text-slate-600 mb-1">END DATE</div>
                                    <input
                                        type="date"
                                        value={woForm.endDate}
                                        onChange={(e) => setWoForm({ ...woForm, endDate: e.target.value })}
                                        className="w-full text-center font-bold border-0 focus:ring-2 focus:ring-blue-500 rounded"
                                    />
                                </div>
                                <div className="border border-slate-300 p-2">
                                    <div className="text-xs font-bold text-slate-600 mb-1">START DATE</div>
                                    <input
                                        type="date"
                                        value={woForm.startDate}
                                        onChange={(e) => setWoForm({ ...woForm, startDate: e.target.value })}
                                        className="w-full text-center font-bold border-0 focus:ring-2 focus:ring-blue-500 rounded"
                                    />
                                </div>
                                <div className="border border-slate-300 p-2 col-span-2">
                                    <div className="text-xs font-bold text-slate-600 mb-1">CLIENT</div>
                                    <input
                                        type="text"
                                        value={woForm.customerName}
                                        onChange={(e) => setWoForm({ ...woForm, customerName: e.target.value })}
                                        className="w-full text-center font-bold border-0 focus:ring-2 focus:ring-blue-500 rounded"
                                    />
                                </div>
                                <div className="border border-slate-300 p-2">
                                    <div className="text-xs font-bold text-slate-600 mb-1">JOB ORDER NO</div>
                                    <div className="text-center font-bold">{woForm.jobOrderNumber}</div>
                                </div>
                                <div className="border border-slate-300 p-2">
                                    <div className="text-xs font-bold text-slate-600 mb-1">JOB ORDER DATE</div>
                                    <div className="text-center font-bold">{new Date().toLocaleDateString('en-GB')}</div>
                                </div>
                            </div>

                            <div className="border border-slate-300 p-2 mb-4 text-sm">
                                <div className="text-xs font-bold text-slate-600 mb-1">PRIORITY</div>
                                <select
                                    value={woForm.priority}
                                    onChange={(e) => setWoForm({ ...woForm, priority: e.target.value as any })}
                                    className="w-full text-center font-bold border-0 focus:ring-2 focus:ring-blue-500 rounded"
                                >
                                    <option value="normal">normal</option>
                                    <option value="high">high</option>
                                    <option value="very_high">very_high</option>
                                    <option value="urgent">urgent</option>
                                </select>
                            </div>

                            {/* Items Table */}
                            <div className="mb-6">
                                <table className="w-full border-collapse border border-slate-400 text-xs">
                                    <thead className="bg-[#8d6e63] text-white">
                                        <tr>
                                            <th rowSpan={2} className="border border-slate-400 px-2 py-2">NOTE</th>
                                            <th rowSpan={2} className="border border-slate-400 px-2 py-2">VENEER</th>
                                            <th rowSpan={2} className="border border-slate-400 px-2 py-2">% GLOSSY</th>
                                            <th colSpan={2} className="border border-slate-400 px-2 py-1">PAINT</th>
                                            <th rowSpan={2} className="border border-slate-400 px-2 py-2">MODEL CODE</th>
                                            <th colSpan={3} className="border border-slate-400 px-2 py-1">FINAL DIM. (mm)</th>
                                            <th rowSpan={2} className="border border-slate-400 px-2 py-2">Q.TY</th>
                                            <th rowSpan={2} className="border border-slate-400 px-2 py-2">ITEM</th>
                                            <th rowSpan={2} className="border border-slate-400 px-2 py-2">#NO</th>
                                        </tr>
                                        <tr>
                                            <th className="border border-slate-400 px-2 py-1">CODE</th>
                                            <th className="border border-slate-400 px-2 py-1">COLOR</th>
                                            <th className="border border-slate-400 px-2 py-1">W</th>
                                            <th className="border border-slate-400 px-2 py-1">L</th>
                                            <th className="border border-slate-400 px-2 py-1">H</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {woForm.items.map((item, idx) => (
                                            <tr key={item.id}>
                                                <td className="border border-slate-300 p-1">
                                                    <input type="text" value={item.notes || ''} onChange={(e) => updateItem(idx, 'notes', e.target.value)} className="w-full text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                </td>
                                                <td className="border border-slate-300 p-1">
                                                    <select value={item.veneer} onChange={(e) => updateItem(idx, 'veneer', e.target.value)} className="w-full text-xs border-0 focus:ring-1 focus:ring-blue-500">
                                                        <option>NO</option>
                                                        <option>YES</option>
                                                    </select>
                                                </td>
                                                <td className="border border-slate-300 p-1">
                                                    <input type="text" value={item.glossPercentage || ''} onChange={(e) => updateItem(idx, 'glossPercentage', e.target.value)} className="w-full text-center text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                </td>
                                                <td className="border border-slate-300 p-1">
                                                    <input type="text" value={item.paintCode || ''} onChange={(e) => updateItem(idx, 'paintCode', e.target.value)} className="w-full text-center text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                </td>
                                                <td className="border border-slate-300 p-1">
                                                    <input type="text" value={item.paintColor || ''} onChange={(e) => updateItem(idx, 'paintColor', e.target.value)} className="w-full text-center text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                </td>
                                                <td className="border border-slate-300 p-1">
                                                    <input type="text" value={item.modelCode || ''} onChange={(e) => updateItem(idx, 'modelCode', e.target.value)} className="w-full text-center text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                </td>
                                                {item.dimensionMode === 'text' ? (
                                                    <td colSpan={3} className="border border-slate-300 p-1">
                                                        <input type="text" value={(item.dimensions?.width || item.dimensions?.length || item.dimensions?.height || '') as string} onChange={(e) => { const newItems = [...woForm.items]; newItems[idx] = { ...newItems[idx], dimensions: { width: e.target.value, length: '', height: '' } }; setWoForm({ ...woForm, items: newItems }); }} className="w-full text-center text-xs border-0 focus:ring-1 focus:ring-blue-500" placeholder="AS PER SHOP DRAWING" />
                                                    </td>
                                                ) : (
                                                    <>
                                                        <td className="border border-slate-300 p-1">
                                                            <input type="text" value={item.dimensions?.width || ''} onChange={(e) => updateItem(idx, 'dimensions.width', e.target.value)} className="w-full text-center text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                        </td>
                                                        <td className="border border-slate-300 p-1">
                                                            <input type="text" value={item.dimensions?.length || ''} onChange={(e) => updateItem(idx, 'dimensions.length', e.target.value)} className="w-full text-center text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                        </td>
                                                        <td className="border border-slate-300 p-1">
                                                            <input type="text" value={item.dimensions?.height || ''} onChange={(e) => updateItem(idx, 'dimensions.height', e.target.value)} className="w-full text-center text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                        </td>
                                                    </>
                                                )}
                                                <td className="border border-slate-300 p-1">
                                                    <input type="text" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} className="w-full text-center text-xs font-bold border-0 focus:ring-1 focus:ring-blue-500" />
                                                </td>
                                                <td className="border border-slate-300 p-1">
                                                    <input type="text" value={item.itemName} onChange={(e) => updateItem(idx, 'itemName', e.target.value)} className="w-full text-xs font-bold border-0 focus:ring-1 focus:ring-blue-500" />
                                                </td>
                                                <td className="border border-slate-300 p-1 text-center font-bold">{idx + 1}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Material Request Section */}
                            <div className="bg-[#6d4c41] text-white text-center py-1 font-bold text-sm mb-2">
                                MATERIAL REQUEST
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {/* Accessories */}
                                <div>
                                    <div className="bg-[#a1887f] text-white text-center py-1 font-bold text-xs mb-1">ACCESSORIES</div>
                                    <table className="w-full border-collapse border border-slate-400 text-xs">
                                        <thead className="bg-[#bcaaa4]">
                                            <tr>
                                                <th className="border border-slate-400 px-2 py-1">NOTES</th>
                                                <th className="border border-slate-400 px-2 py-1">QTY</th>
                                                <th className="border border-slate-400 px-2 py-1">MATERIAL NAME</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {woForm.materials.filter(m => m.category === 'accessories').map((mat, idx) => {
                                                const actualIdx = woForm.materials.findIndex(m => m.id === mat.id);
                                                return (
                                                    <tr key={mat.id}>
                                                        <td className="border border-slate-300 p-1">
                                                            <input type="text" value={mat.notes || ''} onChange={(e) => updateMaterial(actualIdx, 'notes', e.target.value)} className="w-full text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                        </td>
                                                        <td className="border border-slate-300 p-1">
                                                            <input type="text" value={mat.quantity} onChange={(e) => updateMaterial(actualIdx, 'quantity', e.target.value)} className="w-full text-center text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                        </td>
                                                        <td className="border border-slate-300 p-1">
                                                            <input type="text" value={mat.productName} onChange={(e) => updateMaterial(actualIdx, 'productName', e.target.value)} className="w-full text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Wood */}
                                <div>
                                    <div className="bg-[#a1887f] text-white text-center py-1 font-bold text-xs mb-1">WOOD</div>
                                    <table className="w-full border-collapse border border-slate-400 text-xs">
                                        <thead className="bg-[#bcaaa4]">
                                            <tr>
                                                <th className="border border-slate-400 px-2 py-1">L</th>
                                                <th className="border border-slate-400 px-2 py-1">W</th>
                                                <th className="border border-slate-400 px-2 py-1">UNIT</th>
                                                <th className="border border-slate-400 px-2 py-1">QTY</th>
                                                <th className="border border-slate-400 px-2 py-1">MATERIAL NAME</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {woForm.materials.filter(m => m.category === 'wood').map((mat, idx) => {
                                                const actualIdx = woForm.materials.findIndex(m => m.id === mat.id);
                                                return (
                                                    <tr key={mat.id}>
                                                        <td className="border border-slate-300 p-1">
                                                            <input type="text" value={mat.size?.length || ''} onChange={(e) => updateMaterial(actualIdx, 'size.length', e.target.value)} className="w-full text-center text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                        </td>
                                                        <td className="border border-slate-300 p-1">
                                                            <input type="text" value={mat.size?.width || ''} onChange={(e) => updateMaterial(actualIdx, 'size.width', e.target.value)} className="w-full text-center text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                        </td>
                                                        <td className="border border-slate-300 p-1">
                                                            <input type="text" value={mat.unit || ''} onChange={(e) => updateMaterial(actualIdx, 'unit', e.target.value)} className="w-full text-center text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                        </td>
                                                        <td className="border border-slate-300 p-1">
                                                            <input type="text" value={mat.quantity} onChange={(e) => updateMaterial(actualIdx, 'quantity', e.target.value)} className="w-full text-center text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                        </td>
                                                        <td className="border border-slate-300 p-1">
                                                            <input type="text" value={mat.productName} onChange={(e) => updateMaterial(actualIdx, 'productName', e.target.value)} className="w-full text-xs border-0 focus:ring-1 focus:ring-blue-500" />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t-2 border-slate-300">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (editingOrderId) {
                                            onUpdateWorkOrder(editingOrderId, woForm);
                                            setShowEditModal(false);
                                        }
                                    }}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ManufacturingPage;