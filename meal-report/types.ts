export interface MealCategory {
    id: string;
    name: string;
    shortName: string;
    count: number;
    description: string;
    color: string;
}

export interface MealDelivery {
    id: string;
    deliveryDate: Date;
    deliveryTime: string;
    supplierName: string;
    supplierContact: string;
    driverName: string;
    vehicleNumber: string;
    categories: MealCategory[];
    notes: string;
    receivedBy: string;
    approvedBy: string;
    status: 'pending' | 'received' | 'approved';
}

export interface AppConfig {
    companyName: string;
    companyNameEn: string;
    department: string;
    location: string;
    contactNumber: string;
    documentRef: string;
}
