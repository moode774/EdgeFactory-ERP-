import React from 'react';
import { WorkOrder } from '../../types';

interface Props {
    workOrders: WorkOrder[];
    lang: string;
    onClose: () => void;
}

const WorkOrdersSummaryPrint: React.FC<Props> = ({ workOrders, lang, onClose }) => {

    const handlePrint = () => {
        const formatDate = (dateString?: string) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Job Order Summary</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 15mm;
                            color: #000;
                        }
                        
                        .header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-bottom: 10px;
                            padding-bottom: 10px;
                            border-bottom: 2px solid #000;
                        }
                        
                        .company-info {
                            display: flex;
                            align-items: center;
                            gap: 15px;
                        }
                        
                        .logo {
                            width: 60px;
                            height: 60px;
                        }
                        
                        .company-details {
                            font-size: 9pt;
                            line-height: 1.4;
                        }
                        
                        .company-details strong {
                            font-size: 11pt;
                            display: block;
                            margin-bottom: 2px;
                        }
                        
                        .arabic-info {
                            text-align: right;
                            font-size: 8pt;
                            line-height: 1.4;
                            direction: rtl;
                        }
                        
                        .title {
                            background-color: #5d4037;
                            color: white;
                            text-align: center;
                            padding: 8px;
                            font-size: 16pt;
                            font-weight: bold;
                            margin: 15px 0;
                            letter-spacing: 1px;
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 10px;
                        }
                        
                        th, td {
                            border: 1px solid #000;
                            padding: 6px 8px;
                            text-align: left;
                            font-size: 9pt;
                        }
                        
                        th {
                            background-color: #6d4c41;
                            color: white;
                            font-weight: bold;
                            text-align: center;
                            font-size: 10pt;
                        }
                        
                        td {
                            vertical-align: top;
                        }
                        
                        .center {
                            text-align: center;
                        }
                        
                        tr:nth-child(even) {
                            background-color: #f9f9f9;
                        }
                        
                        @media print {
                            @page { 
                                size: landscape; 
                                margin: 10mm; 
                            }
                            body { 
                                print-color-adjust: exact; 
                                -webkit-print-color-adjust: exact; 
                            }
                        }
                    </style>
                </head>
                <body>
                    <!-- Header -->
                    <div class="header">
                        <div class="company-info">
                            <img src="/LOGO11.png" class="logo" alt="Logo" onerror="this.style.display='none'"/>
                            <div class="company-details">
                                <strong>FOREST EDGE FACTORY</strong>
                                Riyadh, Saudi Arabia<br>
                                C.R: 7050835193<br>
                                VAT: 313142044200003
                            </div>
                        </div>
                        
                        <div class="arabic-info">
                            المملكة العربية السعودية – الرياض<br>
                            منطقة الخرج الصناعية بالرياض<br>
                            حي المعذر الشمالي - الأمير تركي بن عبد العزيز<br>
                            س ت: 7050835193<br>
                            رقم ضريبي: 313142044200003
                        </div>
                    </div>
                    
                    <!-- Title -->
                    <div class="title">JOB ORDER SUMMARY</div>
                    
                    <!-- Table -->
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 25%;">Customer</th>
                                <th style="width: 12%;">Job Order No</th>
                                <th style="width: 12%;">Reference No</th>
                                <th style="width: 10%;">Start Date</th>
                                <th style="width: 10%;">End Date</th>
                                <th style="width: 31%;">NOTES</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${workOrders.map(wo => `
                                <tr>
                                    <td>${wo.customerName || ''}</td>
                                    <td class="center">${wo.jobOrderNumber || ''}</td>
                                    <td class="center">${wo.orderNumber || ''}</td>
                                    <td class="center">${formatDate(wo.startDate)}</td>
                                    <td class="center">${formatDate(wo.endDate)}</td>
                                    <td>${wo.notes || ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
                </html>
            `);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
            }, 500);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg">
                        {lang === 'ar' ? 'ملخص أوامر العمل' : 'Work Orders Summary'}
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            {lang === 'ar' ? 'طباعة' : 'Print'}
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                            {lang === 'ar' ? 'إغلاق' : 'Close'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6 bg-slate-50">
                    {/* Preview */}
                    <div className="bg-white p-8 shadow-lg mx-auto" style={{ maxWidth: '1200px' }}>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-black">
                            <div className="flex items-center gap-4">
                                <img src="/LOGO11.png" className="w-16 h-16" alt="Logo" onError={(e) => e.currentTarget.style.display = 'none'} />
                                <div className="text-sm">
                                    <div className="font-bold text-base mb-1">FOREST EDGE FACTORY</div>
                                    <div>Riyadh, Saudi Arabia</div>
                                    <div>C.R: 7050835193</div>
                                    <div>VAT: 313142044200003</div>
                                </div>
                            </div>

                            <div className="text-right text-xs" dir="rtl">
                                <div>المملكة العربية السعودية – الرياض</div>
                                <div>منطقة الخرج الصناعية بالرياض</div>
                                <div>حي المعذر الشمالي - الأمير تركي بن عبد العزيز</div>
                                <div>س ت: 7050835193</div>
                                <div>رقم ضريبي: 313142044200003</div>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="bg-[#5d4037] text-white text-center py-2 font-bold text-lg mb-4 tracking-wide">
                            JOB ORDER SUMMARY
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-black text-sm">
                                <thead>
                                    <tr className="bg-[#6d4c41] text-white">
                                        <th className="border border-black px-3 py-2 text-center font-bold">Customer</th>
                                        <th className="border border-black px-3 py-2 text-center font-bold">Job Order No</th>
                                        <th className="border border-black px-3 py-2 text-center font-bold">Reference No</th>
                                        <th className="border border-black px-3 py-2 text-center font-bold">Start Date</th>
                                        <th className="border border-black px-3 py-2 text-center font-bold">End Date</th>
                                        <th className="border border-black px-3 py-2 text-center font-bold">NOTES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="border border-black px-3 py-8 text-center text-slate-400">
                                                {lang === 'ar' ? 'لا توجد أوامر عمل' : 'No work orders'}
                                            </td>
                                        </tr>
                                    ) : (
                                        workOrders.map((wo, index) => (
                                            <tr key={wo.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                <td className="border border-black px-3 py-2">{wo.customerName || ''}</td>
                                                <td className="border border-black px-3 py-2 text-center">{wo.jobOrderNumber || ''}</td>
                                                <td className="border border-black px-3 py-2 text-center">{wo.orderNumber || ''}</td>
                                                <td className="border border-black px-3 py-2 text-center">
                                                    {wo.startDate ? new Date(wo.startDate).toLocaleDateString('en-GB') : ''}
                                                </td>
                                                <td className="border border-black px-3 py-2 text-center">
                                                    {wo.endDate ? new Date(wo.endDate).toLocaleDateString('en-GB') : ''}
                                                </td>
                                                <td className="border border-black px-3 py-2">{wo.notes || ''}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkOrdersSummaryPrint;
