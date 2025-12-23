// Employee data model
export interface Employee {
    id: string;
    name: string;
    jobTitle: string;
    status: 'available' | 'absent' | 'leave';
    phoneNumber?: string;
    email?: string;
    department?: string;
    createdAt: string;
    updatedAt: string;
}

export type EmployeeFormData = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;

// Helper to get status color and label
export const getStatusInfo = (status: Employee['status']) => {
    const statusMap = {
        available: {
            color: '#10b981', // green
            bgColor: '#d1fae5',
            label: 'متوفر',
            labelEn: 'Available'
        },
        absent: {
            color: '#ef4444', // red
            bgColor: '#fee2e2',
            label: 'غير موجود',
            labelEn: 'Absent'
        },
        leave: {
            color: '#f59e0b', // amber
            bgColor: '#fef3c7',
            label: 'إجازة',
            labelEn: 'On Leave'
        }
    };
    return statusMap[status];
};
