// Individual meal record for each person
export interface MealRecord {
    id: string;
    personName: string;
    nationality: 'هندي' | 'باكستاني' | 'بنغالي' | 'فلبيني' | 'مصري' | 'سعودي' | 'أخرى';
    mealCount: number;
    mealType: string; // نوع الوجبة مثل: غداء، عشاء، إفطار
}

export interface DeliveryInfo {
    deliveryDate: string;
    deliveryTime: string;
    supplierName: string;
    supplierContact: string;
    driverName: string;
    vehicleNumber: string;
}

export interface Signatures {
    receivedBy: string;
    receivedDate?: string;
    approvedBy: string;
    approvedDate?: string;
    verifiedBy?: string;
    verifiedDate?: string;
}

export interface MealReport {
    id: string;
    documentNumber: string;
    date: string;
    deliveryInfo: DeliveryInfo;
    mealRecords: MealRecord[]; // قائمة الأشخاص والوجبات
    notes: string;
    signatures: Signatures;
    status: 'draft' | 'approved' | 'archived';
    totalMeals: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

export type MealReportFormData = Omit<MealReport, 'id' | 'createdAt' | 'updatedAt' | 'totalMeals' | 'createdBy'>;

// Helper to get nationality color
export const getNationalityColor = (nationality: string): string => {
    const colors: Record<string, string> = {
        'هندي': '#FF6B6B',
        'باكستاني': '#4ECDC4',
        'بنغالي': '#45B7D1',
        'فلبيني': '#FFA07A',
        'مصري': '#98D8C8',
        'سعودي': '#06A77D',
        'أخرى': '#95A5A6'
    };
    return colors[nationality] || '#95A5A6';
};
