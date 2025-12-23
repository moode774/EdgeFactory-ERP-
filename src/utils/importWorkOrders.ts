import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { WorkOrder, WorkOrderItem, MaterialRequest } from '../types';

interface ImportProgress {
    current: number;
    total: number;
    message: string;
}

interface ImportResult {
    total: number;
    success: number;
    errors: number;
    errorDetails: string[];
}

type ProgressCallback = (current: number, total: number, message: string) => void;

/**
 * Parse dimensions from various formats
 */
const parseDimensions = (dim: any): { width: number; length: number; height: number } => {
    if (typeof dim === 'object' && dim !== null) {
        return {
            width: parseFloat(dim.width) || parseFloat(dim.w) || 0,
            length: parseFloat(dim.length) || parseFloat(dim.l) || 0,
            height: parseFloat(dim.height) || parseFloat(dim.h) || 0
        };
    }

    // Try to parse string format like "100x200x300"
    if (typeof dim === 'string') {
        const parts = dim.split(/[xX×]/).map(p => parseFloat(p.trim()));
        return {
            width: parts[0] || 0,
            length: parts[1] || 0,
            height: parts[2] || 0
        };
    }

    return { width: 0, length: 0, height: 0 };
};

/**
 * Parse quantity from various formats (e.g., "10 pcs", "5", 5)
 */
const parseQuantity = (qty: any): number => {
    if (typeof qty === 'number') return qty;
    if (typeof qty === 'string') {
        const match = qty.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : 1;
    }
    return 1;
};

/**
 * Clean and normalize work order item
 */
const normalizeWorkOrderItem = (item: any, index: number): WorkOrderItem => {
    return {
        id: `item-${Date.now()}-${index}`,
        itemName: item.itemName || item.name || item.item || '',
        quantity: parseQuantity(item.quantity || item.qty || 1),
        unit: item.unit || 'قطعة',
        dimensions: parseDimensions(item.dimensions || item.dim || {}),
        modelCode: item.modelCode || item.model || item.code || '',
        paintColor: item.paintColor || item.color || '',
        paintCode: item.paintCode || '',
        glossPercentage: item.glossPercentage || item.gloss || '',
        veneer: item.veneer || 'NO',
        notes: item.notes || item.note || ''
    };
};

/**
 * Clean and normalize material request
 */
const normalizeMaterialRequest = (material: any, index: number): MaterialRequest => {
    const category = material.category || (material.type === 'wood' ? 'wood' : 'accessories');

    const normalized: MaterialRequest = {
        id: `mat-${Date.now()}-${index}`,
        productName: material.productName || material.name || material.materialName || '',
        quantity: parseQuantity(material.quantity || material.qty || 1),
        unit: material.unit || (category === 'wood' ? 'لوح' : 'قطعة'),
        category: category as 'wood' | 'accessories' | 'other',
        isManual: true
    };

    // Add size for wood materials
    if (category === 'wood' && material.size) {
        normalized.size = {
            width: parseFloat(material.size.width) || parseFloat(material.size.w) || 0,
            length: parseFloat(material.size.length) || parseFloat(material.size.l) || 0,
            thickness: parseFloat(material.size.thickness) || parseFloat(material.size.t) || undefined
        };
    }

    // Add notes
    if (material.notes) {
        normalized.notes = material.notes;
    }

    return normalized;
};

/**
 * Generate job order number
 */
const generateJobOrderNumber = (existingOrders: any[]): string => {
    const year = new Date().getFullYear().toString().slice(-2);
    let maxNumber = 0;

    existingOrders.forEach(order => {
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

/**
 * Import work orders from JSON data in batch
 */
export const importWorkOrdersBatch = async (
    jsonData: any,
    onProgress?: ProgressCallback
): Promise<ImportResult> => {
    const result: ImportResult = {
        total: 0,
        success: 0,
        errors: 0,
        errorDetails: []
    };

    try {
        // Extract work orders array from JSON
        let workOrders: any[] = [];

        if (Array.isArray(jsonData)) {
            workOrders = jsonData;
        } else if (jsonData.workOrders && Array.isArray(jsonData.workOrders)) {
            workOrders = jsonData.workOrders;
        } else if (jsonData.orders && Array.isArray(jsonData.orders)) {
            workOrders = jsonData.orders;
        } else {
            throw new Error('Invalid JSON format: Expected array of work orders');
        }

        result.total = workOrders.length;

        if (workOrders.length === 0) {
            throw new Error('No work orders found in the file');
        }

        // Process each work order
        for (let i = 0; i < workOrders.length; i++) {
            const rawOrder = workOrders[i];

            try {
                if (onProgress) {
                    onProgress(i + 1, workOrders.length, `Processing order ${i + 1} of ${workOrders.length}...`);
                }

                // Normalize the work order
                const normalizedOrder: Partial<WorkOrder> = {
                    orderNumber: rawOrder.orderNumber || rawOrder.poNumber || `P${String(i + 1).padStart(5, '0')}`,
                    jobOrderNumber: rawOrder.jobOrderNumber || generateJobOrderNumber([]),
                    customerName: rawOrder.customerName || rawOrder.customer || rawOrder.client || 'Unknown Customer',
                    customerId: rawOrder.customerId || '',
                    priority: rawOrder.priority || 'normal',
                    startDate: rawOrder.startDate || new Date().toISOString(),
                    endDate: rawOrder.endDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                    jobOrderDate: rawOrder.jobOrderDate || new Date().toISOString(),
                    status: 'planned' as const,
                    items: [],
                    materials: [],
                    notes: rawOrder.notes || ''
                };

                // Process items
                if (rawOrder.items && Array.isArray(rawOrder.items)) {
                    normalizedOrder.items = rawOrder.items
                        .map((item: any, idx: number) => normalizeWorkOrderItem(item, idx))
                        .filter((item: WorkOrderItem) => item.itemName && item.itemName.trim() !== '');
                }

                // Process materials
                if (rawOrder.materials && Array.isArray(rawOrder.materials)) {
                    normalizedOrder.materials = rawOrder.materials
                        .map((mat: any, idx: number) => normalizeMaterialRequest(mat, idx))
                        .filter((mat: MaterialRequest) => mat.productName && mat.productName.trim() !== '');
                }

                // Save to Firebase
                await addDoc(collection(db, 'workOrders'), normalizedOrder);
                result.success++;

            } catch (error) {
                result.errors++;
                const errorMsg = `Order ${i + 1}: ${error instanceof Error ? error.message : String(error)}`;
                result.errorDetails.push(errorMsg);
                console.error(errorMsg);
            }
        }

        if (onProgress) {
            onProgress(
                workOrders.length,
                workOrders.length,
                `Import complete: ${result.success} succeeded, ${result.errors} failed`
            );
        }

    } catch (error) {
        result.errors++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errorDetails.push(errorMsg);
        console.error('Import error:', error);
    }

    return result;
};
