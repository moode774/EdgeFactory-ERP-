import React from 'react';
import { MealReport, getNationalityColor } from '../../types/mealReport';

interface MealReportPreviewProps {
    report: MealReport;
}

const MealReportPreview: React.FC<MealReportPreviewProps> = ({ report }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    // Group records by nationality
    const groupedByNationality = report.mealRecords.reduce((acc, record) => {
        if (!acc[record.nationality]) {
            acc[record.nationality] = [];
        }
        acc[record.nationality].push(record);
        return acc;
    }, {} as Record<string, typeof report.mealRecords>);

    const nationalities = Object.keys(groupedByNationality).sort();

    return (
        <div className="bg-white p-8 print:p-6" style={{ fontFamily: 'Arial, sans-serif', fontSize: '8pt' }}>
            {/* Header Section */}
            <div className="mb-6">
                {/* Company Info */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img src="./logo.png" alt="Forest Edge" className="h-12 w-12 object-contain" />
                        <div style={{ fontSize: '7pt', lineHeight: '1.3' }}>
                            <strong style={{ fontSize: '8pt', display: 'block' }}>FOREST EDGE FACTORY</strong>
                            Saudi Arabia - Riyadh<br />
                            C.R: 7050835193<br />
                            Vat No.: 313142044200003
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '6.5pt', lineHeight: '1.3', direction: 'rtl' }}>
                        المملكة العربية السعودية – الرياض<br />
                        منطقة الخرج الصناعية بالرياض<br />
                        حي المعذر الشمالي لالامير تركي بن عبد العزيز<br />
                        س ت: 7050835193<br />
                        رقم ضريبي: 313142044200003
                    </div>
                </div>

                {/* Title */}
                <div style={{ backgroundColor: '#6d4c41', color: 'white', textAlign: 'center', padding: '8px', fontWeight: 'bold', fontSize: '11pt', marginBottom: '8px', letterSpacing: '1px' }}>
                    كشف إحصاء وتوزيع الوجبات اليومي
                </div>

                {/* Document Info */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '25%', textAlign: 'center', border: '1px solid #000', padding: '4px' }}>
                                <div style={{ fontSize: '6.5pt', fontWeight: 'bold' }}>رقم المستند</div>
                                <div style={{ fontSize: '7.5pt', fontWeight: 'bold', marginTop: '2px' }}>{report.documentNumber}</div>
                            </td>
                            <td style={{ width: '25%', textAlign: 'center', border: '1px solid #000', padding: '4px' }}>
                                <div style={{ fontSize: '6.5pt', fontWeight: 'bold' }}>التاريخ</div>
                                <div style={{ fontSize: '7.5pt', fontWeight: 'bold', marginTop: '2px' }}>{formatDate(report.date)}</div>
                            </td>
                            <td style={{ width: '25%', textAlign: 'center', border: '1px solid #000', padding: '4px' }}>
                                <div style={{ fontSize: '6.5pt', fontWeight: 'bold' }}>المورد</div>
                                <div style={{ fontSize: '7.5pt', fontWeight: 'bold', marginTop: '2px' }}>{report.deliveryInfo.supplierName}</div>
                            </td>
                            <td style={{ width: '25%', textAlign: 'center', border: '1px solid #000', padding: '4px' }}>
                                <div style={{ fontSize: '6.5pt', fontWeight: 'bold' }}>وقت الاستلام</div>
                                <div style={{ fontSize: '7.5pt', fontWeight: 'bold', marginTop: '2px' }}>{report.deliveryInfo.deliveryTime}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Meals Table by Nationality */}
            {nationalities.map((nationality, natIndex) => (
                <div key={nationality} style={{ marginBottom: '12px' }}>
                    {/* Nationality Header */}
                    <div style={{ backgroundColor: '#6d4c41', color: 'white', padding: '6px 8px', fontWeight: 'bold', fontSize: '9pt', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>وجبات فئة: {nationality}</span>
                        <span style={{ fontSize: '8pt' }}>العدد: {groupedByNationality[nationality].length} شخص</span>
                    </div>

                    {/* Names Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '7pt', width: '5%' }}>م</th>
                                <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: 'bold', fontSize: '7pt', width: '45%' }}>الاسم والتوقيع</th>
                                <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: 'bold', fontSize: '7pt', width: '45%' }}>الاسم والتوقيع</th>
                                <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '7pt', width: '5%' }}>م</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: Math.ceil(groupedByNationality[nationality].length / 2) }).map((_, rowIndex) => {
                                const leftIndex = rowIndex * 2;
                                const rightIndex = rowIndex * 2 + 1;
                                const leftPerson = groupedByNationality[nationality][leftIndex];
                                const rightPerson = groupedByNationality[nationality][rightIndex];

                                return (
                                    <tr key={rowIndex}>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '7pt', height: '18px' }}>
                                            {leftIndex + 1}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontSize: '7.5pt', height: '18px' }}>
                                            {leftPerson ? (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 'bold' }}>{leftPerson.personName}</span>
                                                    <span style={{ fontSize: '6.5pt', color: '#666' }}>({leftPerson.mealType}: {leftPerson.mealCount})</span>
                                                </div>
                                            ) : ''}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontSize: '7.5pt', height: '18px' }}>
                                            {rightPerson ? (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 'bold' }}>{rightPerson.personName}</span>
                                                    <span style={{ fontSize: '6.5pt', color: '#666' }}>({rightPerson.mealType}: {rightPerson.mealCount})</span>
                                                </div>
                                            ) : ''}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '7pt', height: '18px' }}>
                                            {rightPerson ? rightIndex + 1 : ''}
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Subtotal Row */}
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <td colSpan={4} style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '7.5pt' }}>
                                    إجمالي فئة {nationality}: {groupedByNationality[nationality].reduce((sum, r) => sum + r.mealCount, 0)} وجبة
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}

            {/* Total Summary */}
            <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000' }}>
                    <tbody>
                        <tr style={{ backgroundColor: '#6d4c41', color: 'white' }}>
                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold', fontSize: '10pt' }}>
                                إجمالي عدد الوجبات المصروفة
                            </td>
                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', width: '20%' }}>
                                {report.totalMeals} وجبة
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Notes */}
            {report.notes && (
                <div style={{ marginBottom: '12px', border: '1px solid #ccc', padding: '6px', backgroundColor: '#fffbf0' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '7.5pt', marginBottom: '3px' }}>ملاحظات:</div>
                    <div style={{ fontSize: '7pt', lineHeight: '1.4' }}>{report.notes}</div>
                </div>
            )}

            {/* Signatures */}
            <div style={{ marginTop: '15px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '33.33%', textAlign: 'center', padding: '10px' }}>
                                <div style={{ marginBottom: '30px' }}></div>
                                <div style={{ borderTop: '1px solid #000', paddingTop: '5px', fontSize: '7.5pt', fontWeight: 'bold' }}>
                                    استلم بواسطة
                                </div>
                                <div style={{ fontSize: '7pt', marginTop: '2px' }}>{report.signatures.receivedBy}</div>
                            </td>
                            <td style={{ width: '33.33%', textAlign: 'center', padding: '10px' }}>
                                <div style={{ marginBottom: '30px' }}></div>
                                <div style={{ borderTop: '1px solid #000', paddingTop: '5px', fontSize: '7.5pt', fontWeight: 'bold' }}>
                                    اعتمد بواسطة
                                </div>
                                <div style={{ fontSize: '7pt', marginTop: '2px' }}>{report.signatures.approvedBy}</div>
                            </td>
                            <td style={{ width: '33.33%', textAlign: 'center', padding: '10px' }}>
                                <div style={{ marginBottom: '30px' }}></div>
                                <div style={{ borderTop: '1px solid #000', paddingTop: '5px', fontSize: '7.5pt', fontWeight: 'bold' }}>
                                    مدير الموقع
                                </div>
                                <div style={{ fontSize: '7pt', marginTop: '2px' }}>_______________</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '15px', paddingTop: '8px', borderTop: '1px solid #ccc', textAlign: 'center', fontSize: '6pt', color: '#666' }}>
                هذا المستند رسمي ويُستخدم لغايات الجرد والتدقيق المالي - تم الإنشاء آلياً عبر نظام Forest Edge
            </div>
        </div>
    );
};

export default MealReportPreview;
