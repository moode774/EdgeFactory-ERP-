import React, { useState } from 'react';
import { X, Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { WorkOrder, WorkOrderItem, MaterialRequest } from '../../types';

interface AdvancedWorkOrderEditorProps {
    workOrder: WorkOrder;
    onSave: (workOrder: WorkOrder) => void;
    onClose: () => void;
}

export const AdvancedWorkOrderEditor: React.FC<AdvancedWorkOrderEditorProps> = ({ workOrder, onSave, onClose }) => {
    const [editForm, setEditForm] = useState<WorkOrder>(workOrder);

    const updateBasicInfo = (field: keyof WorkOrder, value: any) => {
        setEditForm({ ...editForm, [field]: value });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...editForm.items];
        if (field.startsWith('dimensions.')) {
            const dimField = field.split('.')[1];
            newItems[index] = {
                ...newItems[index],
                dimensions: { ...newItems[index].dimensions, [dimField]: value }
            };
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        setEditForm({ ...editForm, items: newItems });
    };

    const addItem = () => {
        setEditForm({
            ...editForm,
            items: [...editForm.items, {
                id: `item-${Date.now()}`,
                itemName: '',
                quantity: 1,
                unit: 'قطعة',
                dimensions: { height: 0, length: 0, width: 0 },
                modelCode: '',
                paintColor: '',
                paintCode: '',
                glossPercentage: '',
                veneer: 'NO',
                notes: ''
            }]
        });
    };

    const removeItem = (index: number) => {
        setEditForm({ ...editForm, items: editForm.items.filter((_, i) => i !== index) });
    };

    const updateMaterial = (index: number, field: string, value: any) => {
        const newMaterials = [...editForm.materials];
        if (field === 'size') {
            newMaterials[index] = { ...newMaterials[index], size: value };
        } else {
            newMaterials[index] = { ...newMaterials[index], [field]: value };
        }
        setEditForm({ ...editForm, materials: newMaterials });
    };

    const addMaterial = (category: 'wood' | 'accessories') => {
        setEditForm({
            ...editForm,
            materials: [...editForm.materials, {
                id: `mat-${Date.now()}`,
                productName: '',
                quantity: 1,
                unit: category === 'wood' ? 'SHEET' : 'PCS',
                category: category,
                isManual: true,
                size: category === 'wood' ? { width: 0, length: 0, thickness: 0 } : undefined
            }]
        });
    };

    const removeMaterial = (index: number) => {
        setEditForm({ ...editForm, materials: editForm.materials.filter((_, i) => i !== index) });
    };

    const handleSave = () => {
        onSave({ ...editForm, updatedAt: new Date().toISOString() });
    };

    // Helper for Excel-like input styles
    const inputStyle = "w-full h-full px-1 bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded-none outline-none";
    const cellStyle = "border border-black p-0 relative h-full";

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 overflow-auto flex flex-col items-center">
            {/* Top Toolbar - Like Excel Menu */}
            <div className="w-full bg-[#185abd] text-white px-4 py-2 flex justify-between items-center shadow-md sticky top-0 z-50 print:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm">Work Order Editor</span>
                        <span className="text-[10px] opacity-80">{workOrder.orderNumber} - {workOrder.customerName}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleSave} className="px-4 py-1.5 bg-white text-[#185abd] rounded-sm font-bold text-sm hover:bg-gray-100 flex items-center gap-2 shadow-sm transition-all">
                        <Save size={16} /> Save Changes
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-all">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content - Like Excel Worksheet */}
            <div className="flex-1 w-full overflow-auto bg-[#e6e6e6] p-4 flex justify-center">
                <div className="bg-white shadow-xl scale-100 origin-top" style={{ width: '210mm', minHeight: '297mm', padding: '10mm', boxSizing: 'border-box' }}>

                    {/* --- EXACT PRINT CONTENT REPLICA --- */}

                    {/* Header - Company Info */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <img src="/LOGO11.png" style={{ width: '50px', height: '50px' }} alt="Logo" onError={(e) => e.currentTarget.style.display = 'none'} />
                            <div style={{ fontSize: '7pt', lineHeight: '1.3' }}>
                                <strong style={{ fontSize: '8pt', display: 'block' }}>FOREST EDGE FACTORY</strong>
                                Saudi Arabia - Riyadh<br />
                                C.R: 7050835193<br />
                                Vat No.: 313142044200003
                            </div>
                        </div>

                        <div className="text-right" style={{ fontSize: '6.5pt', lineHeight: '1.3', direction: 'rtl' }}>
                            <div>المملكة العربية السعودية – الرياض</div>
                            <div>منطقة الخرج الصناعية بالرياض</div>
                            <div>حي المعذر الشمالي - الأمير تركي بن عبد العزيز</div>
                            <div>س ت: 7050835193</div>
                            <div>رقم ضريبي: 313142044200003</div>
                        </div>
                    </div>

                    {/* Title Bar */}
                    <div style={{ backgroundColor: '#6d4c41', color: 'white', textAlign: 'center', padding: '8px', fontWeight: 'bold', fontSize: '11pt', marginBottom: '8px', letterSpacing: '1px' }}>
                        WORK ORDER
                    </div>

                    {/* Basic Info Grid */}
                    <table className="w-full border-collapse mb-2" style={{ border: '1px solid black' }}>
                        <tr>
                            <td style={{ width: '12%', border: '1px solid black', padding: '0' }}>
                                <div className="text-center py-1" style={{ fontSize: '6.5pt', fontWeight: 'bold' }}>JOB ORDER DATE</div>
                                <input
                                    type="date"
                                    value={editForm.jobOrderDate?.split('T')[0] || ''}
                                    onChange={(e) => updateBasicInfo('jobOrderDate', e.target.value)}
                                    className={inputStyle}
                                    style={{ fontSize: '7.5pt', fontWeight: 'bold', textAlign: 'center', height: '20px' }}
                                />
                            </td>
                            <td style={{ width: '12%', border: '1px solid black', padding: '0' }}>
                                <div className="text-center py-1" style={{ fontSize: '6.5pt', fontWeight: 'bold' }}>JOB ORDER NO.</div>
                                <input
                                    type="text"
                                    value={editForm.jobOrderNumber}
                                    onChange={(e) => updateBasicInfo('jobOrderNumber', e.target.value)}
                                    className={inputStyle}
                                    style={{ fontSize: '7.5pt', fontWeight: 'bold', textAlign: 'center', height: '20px' }}
                                />
                            </td>
                            <td style={{ width: '40%', border: '1px solid black', padding: '0' }}>
                                <div className="text-center py-1" style={{ fontSize: '6.5pt', fontWeight: 'bold' }}>CLIENT</div>
                                <input
                                    type="text"
                                    value={editForm.customerName}
                                    onChange={(e) => updateBasicInfo('customerName', e.target.value)}
                                    className={inputStyle}
                                    style={{ fontSize: '7.5pt', fontWeight: 'bold', textAlign: 'center', height: '20px' }}
                                />
                            </td>
                            <td style={{ width: '12%', border: '1px solid black', padding: '0' }}>
                                <div className="text-center py-1" style={{ fontSize: '6.5pt', fontWeight: 'bold' }}>START DATE</div>
                                <input
                                    type="date"
                                    value={editForm.startDate}
                                    onChange={(e) => updateBasicInfo('startDate', e.target.value)}
                                    className={inputStyle}
                                    style={{ fontSize: '7.5pt', fontWeight: 'bold', textAlign: 'center', height: '20px' }}
                                />
                            </td>
                            <td style={{ width: '12%', border: '1px solid black', padding: '0' }}>
                                <div className="text-center py-1" style={{ fontSize: '6.5pt', fontWeight: 'bold' }}>END DATE</div>
                                <input
                                    type="date"
                                    value={editForm.endDate}
                                    onChange={(e) => updateBasicInfo('endDate', e.target.value)}
                                    className={inputStyle}
                                    style={{ fontSize: '7.5pt', fontWeight: 'bold', textAlign: 'center', height: '20px' }}
                                />
                            </td>
                            <td style={{ width: '12%', border: '1px solid black', padding: '0', backgroundColor: editForm.priority === 'urgent' ? '#fee2e2' : editForm.priority === 'high' ? '#ffedd5' : 'transparent' }}>
                                <div className="text-center py-1" style={{ fontSize: '6.5pt', fontWeight: 'bold' }}>PRIORITY</div>
                                <select
                                    value={editForm.priority}
                                    onChange={(e) => updateBasicInfo('priority', e.target.value)}
                                    className={inputStyle}
                                    style={{ fontSize: '7.5pt', fontWeight: 'bold', textAlign: 'center', height: '20px', backgroundColor: 'transparent', appearance: 'none' }}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </td>
                        </tr>
                    </table>

                    {/* Items Table */}
                    <div className="mb-4 relative group/add">
                        <div className="flex justify-between items-center mb-1">
                            <span style={{ fontSize: '8pt', fontWeight: 'bold' }}>ITEMS SPECIFICATIONS</span>
                            <button onClick={addItem} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-blue-200 print:hidden opacity-0 group-hover/add:opacity-100 transition-opacity">
                                <Plus size={10} /> Add Item Row
                            </button>
                        </div>
                        <table className="w-full border-collapse" style={{ border: '1px solid black' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#6d4c41', color: 'white' }}>
                                    <th rowSpan={2} style={{ border: '1px solid black', fontSize: '7.5pt', padding: '3px', width: '3%' }}>NO.</th>
                                    <th rowSpan={2} style={{ border: '1px solid black', fontSize: '7.5pt', padding: '3px', width: '22%' }}>ITEM</th>
                                    <th rowSpan={2} style={{ border: '1px solid black', fontSize: '7.5pt', padding: '3px', width: '4%' }}>Q.TY</th>
                                    <th colSpan={3} style={{ border: '1px solid black', fontSize: '7.5pt', padding: '3px', width: '12%' }}>FINAL DIM. (mm)</th>
                                    <th rowSpan={2} style={{ border: '1px solid black', fontSize: '7.5pt', padding: '3px', width: '10%' }}>MODEL CODE</th>
                                    <th colSpan={2} style={{ border: '1px solid black', fontSize: '7.5pt', padding: '3px', width: '22%' }}>PAINT</th>
                                    <th rowSpan={2} style={{ border: '1px solid black', fontSize: '7.5pt', padding: '3px', width: '5%' }}>VENEER</th>
                                    <th rowSpan={2} style={{ border: '1px solid black', fontSize: '7.5pt', padding: '3px', width: '15%' }}>NOTE</th>
                                    <th rowSpan={2} style={{ border: '1px solid black', width: '20px' }} className="print:hidden"></th>
                                </tr>
                                <tr style={{ backgroundColor: '#6d4c41', color: 'white' }}>
                                    <th style={{ border: '1px solid black', fontSize: '7.5pt', padding: '3px', width: '4%' }}>H</th>
                                    <th style={{ border: '1px solid black', fontSize: '7.5pt', padding: '3px', width: '4%' }}>L</th>
                                    <th style={{ border: '1px solid black', fontSize: '7.5pt', padding: '3px', width: '4%' }}>W</th>
                                    <th style={{ border: '1px solid black', fontSize: '7.5pt', padding: '3px', width: '8%' }}>COLOR</th>
                                    <th style={{ border: '1px solid black', fontSize: '7.5pt', padding: '3px', width: '8%' }}>CODE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editForm.items.map((item, idx) => (
                                    <tr key={item.id} className="group/row">
                                        <td className={cellStyle} style={{ textAlign: 'center', fontSize: '8pt', fontWeight: 'bold' }}>{idx + 1}</td>
                                        <td className={cellStyle}>
                                            <input type="text" value={item.itemName} onChange={(e) => updateItem(idx, 'itemName', e.target.value)} className={inputStyle} style={{ fontSize: '8pt' }} />
                                        </td>
                                        <td className={cellStyle}>
                                            <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} className={inputStyle} style={{ fontSize: '8pt', textAlign: 'center', fontWeight: 'bold' }} />
                                        </td>
                                        <td className={cellStyle}>
                                            <input type="text" value={item.dimensions.height || ''} onChange={(e) => updateItem(idx, 'dimensions.height', e.target.value)} className={inputStyle} style={{ fontSize: '8pt', textAlign: 'center' }} />
                                        </td>
                                        <td className={cellStyle}>
                                            <input type="text" value={item.dimensions.length || ''} onChange={(e) => updateItem(idx, 'dimensions.length', e.target.value)} className={inputStyle} style={{ fontSize: '8pt', textAlign: 'center' }} />
                                        </td>
                                        <td className={cellStyle}>
                                            <input type="text" value={item.dimensions.width || ''} onChange={(e) => updateItem(idx, 'dimensions.width', e.target.value)} className={inputStyle} style={{ fontSize: '8pt', textAlign: 'center' }} />
                                        </td>
                                        <td className={cellStyle}>
                                            <input type="text" value={item.modelCode} onChange={(e) => updateItem(idx, 'modelCode', e.target.value)} className={inputStyle} style={{ fontSize: '8pt', textAlign: 'center' }} />
                                        </td>
                                        <td className={cellStyle}>
                                            <input type="text" value={item.paintColor} onChange={(e) => updateItem(idx, 'paintColor', e.target.value)} className={inputStyle} style={{ fontSize: '8pt', textAlign: 'center' }} />
                                        </td>
                                        <td className={cellStyle}>
                                            <input type="text" value={item.paintCode} onChange={(e) => updateItem(idx, 'paintCode', e.target.value)} className={inputStyle} style={{ fontSize: '8pt', textAlign: 'center' }} />
                                        </td>
                                        <td className={cellStyle}>
                                            <select value={item.veneer} onChange={(e) => updateItem(idx, 'veneer', e.target.value)} className={inputStyle} style={{ fontSize: '8pt', textAlign: 'center', appearance: 'none' }}>
                                                <option>NO</option>
                                                <option>YES</option>
                                            </select>
                                        </td>
                                        <td className={cellStyle}>
                                            <input type="text" value={item.notes} onChange={(e) => updateItem(idx, 'notes', e.target.value)} className={inputStyle} style={{ fontSize: '8pt' }} />
                                        </td>
                                        <td className={cellStyle + " print:hidden text-center opacity-0 group-hover/row:opacity-100"}>
                                            <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Materials & Accessories */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Wood Materials */}
                        <div className="relative group/wood">
                            <div className="flex justify-between items-center mb-1">
                                <div style={{ backgroundColor: '#6d4c41', color: 'white', fontWeight: 'bold', padding: '4px 8px', fontSize: '9pt', display: 'inline-block' }}>WOOD MATERIALS</div>
                                <button onClick={() => addMaterial('wood')} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-amber-200 print:hidden opacity-0 group-hover/wood:opacity-100 transition-opacity">
                                    <Plus size={10} /> Add
                                </button>
                            </div>
                            <table className="w-full border-collapse" style={{ border: '1px solid black' }}>
                                <thead style={{ backgroundColor: '#e2e8f0' }}>
                                    <tr>
                                        <th style={{ border: '1px solid black', fontSize: '7pt', padding: '2px', textAlign: 'left' }}>Item</th>
                                        <th style={{ border: '1px solid black', fontSize: '7pt', padding: '2px', width: '30px' }}>Qty</th>
                                        <th style={{ border: '1px solid black', fontSize: '7pt', padding: '2px', width: '40px' }}>Unit</th>
                                        <th style={{ border: '1px solid black', fontSize: '7pt', padding: '2px', width: '30px' }}>W</th>
                                        <th style={{ border: '1px solid black', fontSize: '7pt', padding: '2px', width: '30px' }}>L</th>
                                        <th style={{ border: '1px solid black', width: '15px' }} className="print:hidden"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editForm.materials.filter(m => m.category === 'wood').map((mat, idx) => {
                                        const actualIdx = editForm.materials.indexOf(mat);
                                        return (
                                            <tr key={mat.id} className="group/row">
                                                <td className={cellStyle}>
                                                    <input type="text" value={mat.productName} onChange={(e) => updateMaterial(actualIdx, 'productName', e.target.value)} className={inputStyle} style={{ fontSize: '8pt' }} />
                                                </td>
                                                <td className={cellStyle}>
                                                    <input type="number" value={mat.quantity} onChange={(e) => updateMaterial(actualIdx, 'quantity', e.target.value)} className={inputStyle} style={{ fontSize: '8pt', textAlign: 'center', fontWeight: 'bold' }} />
                                                </td>
                                                <td className={cellStyle}>
                                                    <input type="text" value={mat.unit} onChange={(e) => updateMaterial(actualIdx, 'unit', e.target.value)} className={inputStyle} style={{ fontSize: '7pt', textAlign: 'center' }} />
                                                </td>
                                                <td className={cellStyle}>
                                                    <input type="number" value={mat.size?.width || ''} onChange={(e) => updateMaterial(actualIdx, 'size', { ...mat.size, width: e.target.value })} className={inputStyle} style={{ fontSize: '8pt', textAlign: 'center' }} />
                                                </td>
                                                <td className={cellStyle}>
                                                    <input type="number" value={mat.size?.length || ''} onChange={(e) => updateMaterial(actualIdx, 'size', { ...mat.size, length: e.target.value })} className={inputStyle} style={{ fontSize: '8pt', textAlign: 'center' }} />
                                                </td>
                                                <td className={cellStyle + " print:hidden text-center opacity-0 group-hover/row:opacity-100"}>
                                                    <button onClick={() => removeMaterial(actualIdx)} className="text-red-400 hover:text-red-600">
                                                        <Trash2 size={10} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Accessories */}
                        <div className="relative group/acc">
                            <div className="flex justify-between items-center mb-1">
                                <div style={{ backgroundColor: '#6d4c41', color: 'white', fontWeight: 'bold', padding: '4px 8px', fontSize: '9pt', display: 'inline-block' }}>ACCESSORIES</div>
                                <button onClick={() => addMaterial('accessories')} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-amber-200 print:hidden opacity-0 group-hover/acc:opacity-100 transition-opacity">
                                    <Plus size={10} /> Add
                                </button>
                            </div>
                            <table className="w-full border-collapse" style={{ border: '1px solid black' }}>
                                <thead style={{ backgroundColor: '#e2e8f0' }}>
                                    <tr>
                                        <th style={{ border: '1px solid black', fontSize: '7pt', padding: '2px', textAlign: 'left' }}>Item</th>
                                        <th style={{ border: '1px solid black', fontSize: '7pt', padding: '2px', width: '30px' }}>Qty</th>
                                        <th style={{ border: '1px solid black', fontSize: '7pt', padding: '2px', width: '40px' }}>Unit</th>
                                        <th style={{ border: '1px solid black', fontSize: '7pt', padding: '2px', textAlign: 'left' }}>Notes</th>
                                        <th style={{ border: '1px solid black', width: '15px' }} className="print:hidden"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editForm.materials.filter(m => m.category === 'accessories').map((mat, idx) => {
                                        const actualIdx = editForm.materials.indexOf(mat);
                                        return (
                                            <tr key={mat.id} className="group/row">
                                                <td className={cellStyle}>
                                                    <input type="text" value={mat.productName} onChange={(e) => updateMaterial(actualIdx, 'productName', e.target.value)} className={inputStyle} style={{ fontSize: '8pt' }} />
                                                </td>
                                                <td className={cellStyle}>
                                                    <input type="number" value={mat.quantity} onChange={(e) => updateMaterial(actualIdx, 'quantity', e.target.value)} className={inputStyle} style={{ fontSize: '8pt', textAlign: 'center', fontWeight: 'bold' }} />
                                                </td>
                                                <td className={cellStyle}>
                                                    <input type="text" value={mat.unit} onChange={(e) => updateMaterial(actualIdx, 'unit', e.target.value)} className={inputStyle} style={{ fontSize: '7pt', textAlign: 'center' }} />
                                                </td>
                                                <td className={cellStyle}>
                                                    <input type="text" value={mat.notes || ''} onChange={(e) => updateMaterial(actualIdx, 'notes', e.target.value)} className={inputStyle} style={{ fontSize: '8pt' }} />
                                                </td>
                                                <td className={cellStyle + " print:hidden text-center opacity-0 group-hover/row:opacity-100"}>
                                                    <button onClick={() => removeMaterial(actualIdx)} className="text-red-400 hover:text-red-600">
                                                        <Trash2 size={10} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
