import React, { useState, useEffect } from 'react';
import { Employee, EmployeeFormData, getStatusInfo } from '../types/employee';
import { EmployeeDB } from '../services/EmployeeService';
import { Plus, Edit3, Trash2, Users, Save, X, Search, UserCheck, UserX, Clock, Upload, FileText, Printer } from 'lucide-react';

const EmployeesManagement: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [bulkImportText, setBulkImportText] = useState('');
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | Employee['status']>('all');

    const [formData, setFormData] = useState<EmployeeFormData>({
        name: '',
        jobTitle: '',
        status: 'available',
        phoneNumber: '',
        email: '',
        department: ''
    });

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        const data = await EmployeeDB.getAll();
        setEmployees(data);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            jobTitle: '',
            status: 'available',
            phoneNumber: '',
            email: '',
            department: ''
        });
        setEditingEmployee(null);
    };

    const handleBulkImport = async () => {
        if (!bulkImportText.trim()) {
            alert('يرجى لصق الأسماء أولاً');
            return;
        }

        const lines = bulkImportText.split('\n').filter(line => line.trim());
        let successCount = 0;
        let errorCount = 0;

        for (const line of lines) {
            const name = line.trim();
            if (name) {
                try {
                    await EmployeeDB.add({
                        name: name,
                        jobTitle: 'موظف',
                        status: 'available',
                        phoneNumber: '',
                        email: '',
                        department: ''
                    });
                    successCount++;
                } catch (error) {
                    errorCount++;
                }
            }
        }

        alert(`✅ تم استيراد ${successCount} موظف بنجاح${errorCount > 0 ? `\n❌ فشل ${errorCount}` : ''}`);
        setBulkImportText('');
        setShowBulkImport(false);
        loadEmployees();
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.jobTitle) {
            alert('يرجى ملء الاسم والمسمى الوظيفي');
            return;
        }

        try {
            if (editingEmployee) {
                await EmployeeDB.update(editingEmployee.id, formData);
                alert('✅ تم تحديث الموظف بنجاح');
            } else {
                await EmployeeDB.add(formData);
                alert('✅ تم إضافة الموظف بنجاح');
            }

            setShowForm(false);
            resetForm();
            loadEmployees();
        } catch (error) {
            alert('❌ حدث خطأ أثناء حفظ البيانات');
        }
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name,
            jobTitle: employee.jobTitle,
            status: employee.status,
            phoneNumber: employee.phoneNumber || '',
            email: employee.email || '',
            department: employee.department || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
            await EmployeeDB.delete(id);
            loadEmployees();
            alert('✅ تم حذف الموظف بنجاح');
        }
    };

    const handlePrintReport = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const currentDate = new Date().toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const printContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>قائمة الموظفين الرسمية - Forest Edge</title>
    <style>
        @media print {
            @page {
                size: A4;
                margin: 15mm;
            }
            body {
                margin: 0;
                padding: 0;
            }
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            color: #000;
            line-height: 1.4;
        }

        .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 10mm;
            background: white;
        }

        /* Header Section */
        .header {
            text-align: center;
            border-bottom: 4px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 10px;
        }

        .company-name {
            font-size: 28px;
            font-weight: 900;
            color: #000;
            margin-bottom: 5px;
            letter-spacing: 1px;
        }

        .document-title {
            font-size: 20px;
            font-weight: 700;
            color: #333;
            margin-bottom: 8px;
        }

        .document-info {
            font-size: 12px;
            color: #666;
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 8px;
        }

        .info-item {
            font-weight: 600;
        }

        /* Table Section */
        .table-container {
            margin-top: 25px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
        }

        thead {
            background: #000;
            color: white;
        }

        th {
            padding: 12px 10px;
            text-align: center;
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid #000;
        }

        tbody tr {
            border-bottom: 1px solid #333;
        }

        tbody tr:nth-child(even) {
            background: #f5f5f5;
        }

        tbody tr:hover {
            background: #e8e8e8;
        }

        td {
            padding: 10px;
            text-align: center;
            font-size: 12px;
            border: 1px solid #666;
        }

        td.text-right {
            text-align: right;
        }

        .serial-number {
            font-weight: 800;
            color: #000;
            width: 50px;
        }

        .employee-name {
            font-weight: 700;
            color: #000;
            font-size: 13px;
        }

        .job-title {
            font-weight: 600;
            color: #333;
        }

        .department {
            color: #555;
            font-weight: 500;
        }

        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 11px;
            border: 2px solid;
        }

        .status-available {
            background: #e8f5e9;
            color: #2e7d32;
            border-color: #2e7d32;
        }

        .status-absent {
            background: #ffebee;
            color: #c62828;
            border-color: #c62828;
        }

        .status-leave {
            background: #fff3e0;
            color: #ef6c00;
            border-color: #ef6c00;
        }

        /* Footer */
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #000;
            text-align: center;
            font-size: 11px;
            color: #666;
        }

        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            padding: 0 50px;
        }

        .signature-box {
            text-align: center;
        }

        .signature-line {
            width: 200px;
            border-top: 2px solid #000;
            margin-top: 50px;
            padding-top: 8px;
            font-weight: 700;
            font-size: 12px;
        }

        @media print {
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <img src="/LOGO11.png" alt="Forest Edge Logo" class="logo">
            <div class="company-name">FOREST EDGE</div>
            <div class="document-title">قائمة الموظفين الرسمية</div>
            <div class="document-info">
                <span class="info-item">التاريخ: ${currentDate}</span>
                <span class="info-item">إجمالي الموظفين: ${employees.length}</span>
            </div>
        </div>

        <!-- Employee Table -->
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>اسم الموظف</th>
                        <th>المسمى الوظيفي</th>
                        <th>القسم</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map((emp, index) => {
            const statusInfo = getStatusInfo(emp.status);
            const statusClass = emp.status === 'available' ? 'status-available' :
                emp.status === 'absent' ? 'status-absent' : 'status-leave';
            return `
                            <tr>
                                <td class="serial-number">${index + 1}</td>
                                <td class="employee-name text-right">${emp.name}</td>
                                <td class="job-title">${emp.jobTitle}</td>
                                <td class="department">${emp.department || '-'}</td>
                                <td>
                                    <span class="status-badge ${statusClass}">
                                        ${statusInfo.label}
                                    </span>
                                </td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line">مدير الموارد البشرية</div>
            </div>
            <div class="signature-box">
                <div class="signature-line">المدير العام</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Forest Edge</strong> - نظام إدارة المخزون والموظفين</p>
            <p style="margin-top: 5px;">هذه وثيقة رسمية صادرة عن قسم الموارد البشرية</p>
        </div>
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: employees.length,
        available: employees.filter(e => e.status === 'available').length,
        absent: employees.filter(e => e.status === 'absent').length,
        leave: employees.filter(e => e.status === 'leave').length
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Ultra Professional Header */}
            <div className="bg-white border-b-4 border-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">إدارة الموظفين</h1>
                                <p className="text-sm text-gray-600 font-semibold mt-0.5">Forest Edge - نظام المتابعة الرسمي</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handlePrintReport}
                                className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 transition-colors border border-green-800"
                            >
                                <Printer size={18} />
                                طباعة التقرير
                            </button>
                            <button
                                onClick={() => setShowBulkImport(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors border border-gray-800"
                            >
                                <Upload size={18} />
                                استيراد جماعي
                            </button>
                            <button
                                onClick={() => { resetForm(); setShowForm(true); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors"
                            >
                                <Plus size={18} />
                                موظف جديد
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clean Statistics */}
            <div className="max-w-7xl mx-auto px-8 py-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">إجمالي الموظفين</p>
                                <p className="text-3xl font-black text-gray-900">{stats.total}</p>
                            </div>
                            <Users className="w-10 h-10 text-gray-300" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-green-700 uppercase mb-1">متوفرون</p>
                                <p className="text-3xl font-black text-green-700">{stats.available}</p>
                            </div>
                            <UserCheck className="w-10 h-10 text-green-200" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-red-700 uppercase mb-1">غير موجودين</p>
                                <p className="text-3xl font-black text-red-700">{stats.absent}</p>
                            </div>
                            <UserX className="w-10 h-10 text-red-200" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-2 border-amber-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-amber-700 uppercase mb-1">في إجازة</p>
                                <p className="text-3xl font-black text-amber-700">{stats.leave}</p>
                            </div>
                            <Clock className="w-10 h-10 text-amber-200" />
                        </div>
                    </div>
                </div>

                {/* Clean Search Bar */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-4 mb-6">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ابحث عن موظف..."
                                className="w-full pr-10 pl-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
                            />
                        </div>

                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2.5 rounded-lg font-bold text-sm border-2 transition-colors ${filterStatus === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}
                        >
                            الكل
                        </button>
                        <button
                            onClick={() => setFilterStatus('available')}
                            className={`px-4 py-2.5 rounded-lg font-bold text-sm border-2 transition-colors ${filterStatus === 'available' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}
                        >
                            متوفر
                        </button>
                        <button
                            onClick={() => setFilterStatus('absent')}
                            className={`px-4 py-2.5 rounded-lg font-bold text-sm border-2 transition-colors ${filterStatus === 'absent' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}
                        >
                            غير موجود
                        </button>
                        <button
                            onClick={() => setFilterStatus('leave')}
                            className={`px-4 py-2.5 rounded-lg font-bold text-sm border-2 transition-colors ${filterStatus === 'leave' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}
                        >
                            إجازة
                        </button>
                    </div>
                </div>

                {/* Clean Professional Table */}
                <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                    <div className="bg-gray-900 text-white px-6 py-4 border-b-2 border-gray-800">
                        <h2 className="text-lg font-black">قائمة الموظفين ({filteredEmployees.length})</h2>
                    </div>

                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b-2 border-gray-200">
                                <th className="px-6 py-3 text-right font-black text-gray-900 text-xs uppercase">الاسم</th>
                                <th className="px-6 py-3 text-right font-black text-gray-900 text-xs uppercase">المسمى الوظيفي</th>
                                <th className="px-6 py-3 text-center font-black text-gray-900 text-xs uppercase">الحالة</th>
                                <th className="px-6 py-3 text-center font-black text-gray-900 text-xs uppercase">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((employee, index) => {
                                const statusInfo = getStatusInfo(employee.status);
                                return (
                                    <tr key={employee.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="px-6 py-3">
                                            <div className="font-bold text-gray-900">{employee.name}</div>
                                            {employee.department && (
                                                <div className="text-xs text-gray-500 mt-0.5">{employee.department}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-gray-800 font-semibold">{employee.jobTitle}</span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span
                                                className="inline-block px-4 py-1.5 rounded-md font-bold text-xs border-2"
                                                style={{
                                                    backgroundColor: statusInfo.bgColor,
                                                    color: statusInfo.color,
                                                    borderColor: statusInfo.color
                                                }}
                                            >
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(employee)}
                                                    className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee.id)}
                                                    className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredEmployees.length === 0 && (
                        <div className="text-center py-12 bg-gray-50">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                            <p className="text-lg font-bold text-gray-400">لا توجد نتائج</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Clean Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
                        <div className="bg-gray-900 text-white px-6 py-4 rounded-t-lg flex items-center justify-between border-b-2 border-gray-800">
                            <h2 className="text-lg font-black">{editingEmployee ? 'تعديل موظف' : 'موظف جديد'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-800 rounded transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">الاسم *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
                                        placeholder="اسم الموظف"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">المسمى الوظيفي *</label>
                                    <input
                                        type="text"
                                        value={formData.jobTitle}
                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
                                        placeholder="مثال: مهندس"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">القسم</label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
                                        placeholder="مثال: الإنتاج"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">الحالة *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Employee['status'] })}
                                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none font-bold"
                                    >
                                        <option value="available">متوفر</option>
                                        <option value="absent">غير موجود</option>
                                        <option value="leave">إجازة</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">رقم الهاتف</label>
                                    <input
                                        type="text"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
                                        placeholder="05xxxxxxxx"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t-2 border-gray-200">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors"
                                >
                                    <Save size={16} />
                                    {editingEmployee ? 'تحديث' : 'حفظ'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Clean Bulk Import Modal */}
            {showBulkImport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full">
                        <div className="bg-gray-900 text-white px-6 py-4 rounded-t-lg flex items-center justify-between border-b-2 border-gray-800">
                            <div className="flex items-center gap-3">
                                <Upload className="w-5 h-5" />
                                <h2 className="text-lg font-black">استيراد جماعي للموظفين</h2>
                            </div>
                            <button onClick={() => setShowBulkImport(false)} className="p-1.5 hover:bg-gray-800 rounded transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-blue-900 mb-1 text-sm">كيفية الاستيراد:</p>
                                        <ul className="text-xs text-blue-800 space-y-0.5">
                                            <li>• انسخ الأسماء من Excel (كل اسم في سطر منفصل)</li>
                                            <li>• الصق الأسماء في المربع أدناه</li>
                                            <li>• سيتم إضافة جميع الموظفين بحالة "متوفر" افتراضياً</li>
                                            <li>• يمكنك تعديل الوظيفة والحالة لاحقاً</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
                                    الصق الأسماء هنا
                                </label>
                                <textarea
                                    value={bulkImportText}
                                    onChange={(e) => setBulkImportText(e.target.value)}
                                    className="w-full h-64 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none resize-none"
                                    placeholder="Abdul Malek Ahammad Ali&#10;Abu bakar Badlis&#10;Administrator&#10;..."
                                    dir="ltr"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    عدد الأسماء: <span className="font-bold text-gray-900">{bulkImportText.split('\n').filter(l => l.trim()).length}</span>
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-200">
                                <button
                                    onClick={() => { setBulkImportText(''); setShowBulkImport(false); }}
                                    className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleBulkImport}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors"
                                >
                                    <Upload size={16} />
                                    استيراد ({bulkImportText.split('\n').filter(l => l.trim()).length})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeesManagement;
