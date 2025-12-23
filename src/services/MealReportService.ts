import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy } from 'firebase/firestore';
import { MealReport, MealReportFormData } from '../types/mealReport';

const COLLECTION_NAME = 'mealReports';

class MealReportService {
    private collectionRef = collection(db, COLLECTION_NAME);

    // Generate document number
    async generateDocumentNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const reports = await this.getAll();
        const count = reports.filter(r => r.documentNumber.includes(String(year))).length + 1;
        return `FE-MEAL-${year}-${String(count).padStart(4, '0')}`;
    }

    // Add new meal report
    async add(data: MealReportFormData, userId: string): Promise<string> {
        try {
            const documentNumber = await this.generateDocumentNumber();
            const totalMeals = data.mealRecords.reduce((sum, record) => sum + record.mealCount, 0);

            const newReport: Omit<MealReport, 'id'> = {
                ...data,
                documentNumber,
                totalMeals,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: userId
            };

            const docRef = await addDoc(this.collectionRef, newReport);
            console.log('✅ Meal report added to Firebase:', docRef.id);

            this.saveToLocalStorage(docRef.id, { ...newReport, id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error('❌ Error adding meal report to Firebase:', error);
            return this.addToLocalStorage(data, userId);
        }
    }

    // Get all meal reports
    async getAll(): Promise<MealReport[]> {
        try {
            const q = query(this.collectionRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const reports = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as MealReport));

            console.log(`✅ Loaded ${reports.length} meal reports from Firebase`);
            return reports;
        } catch (error) {
            console.error('❌ Error loading meal reports from Firebase:', error);
            return this.getAllFromLocalStorage();
        }
    }

    // Get single meal report
    async getById(id: string): Promise<MealReport | null> {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as MealReport;
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting meal report:', error);
            return this.getByIdFromLocalStorage(id);
        }
    }

    // Update meal report
    async update(id: string, data: Partial<MealReportFormData>): Promise<void> {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const updateData: any = {
                ...data,
                updatedAt: new Date().toISOString()
            };

            if (data.mealRecords) {
                updateData.totalMeals = data.mealRecords.reduce((sum, record) => sum + record.mealCount, 0);
            }

            await updateDoc(docRef, updateData);
            console.log('✅ Meal report updated in Firebase');

            const current = await this.getById(id);
            if (current) {
                this.saveToLocalStorage(id, { ...current, ...updateData });
            }
        } catch (error) {
            console.error('❌ Error updating meal report:', error);
            this.updateLocalStorage(id, data);
        }
    }

    // Delete meal report
    async delete(id: string): Promise<void> {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await deleteDoc(docRef);
            console.log('✅ Meal report deleted from Firebase');
            this.deleteFromLocalStorage(id);
        } catch (error) {
            console.error('❌ Error deleting meal report:', error);
            this.deleteFromLocalStorage(id);
        }
    }

    // LocalStorage methods
    private getLocalStorageKey(): string {
        return 'mealReports';
    }

    private getAllFromLocalStorage(): MealReport[] {
        const data = localStorage.getItem(this.getLocalStorageKey());
        return data ? JSON.parse(data) : [];
    }

    private saveToLocalStorage(id: string, report: MealReport): void {
        const reports = this.getAllFromLocalStorage();
        const index = reports.findIndex(r => r.id === id);
        if (index >= 0) {
            reports[index] = report;
        } else {
            reports.push(report);
        }
        localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(reports));
    }

    private addToLocalStorage(data: MealReportFormData, userId: string): string {
        const reports = this.getAllFromLocalStorage();
        const id = `MEAL-${Date.now()}`;
        const year = new Date().getFullYear();
        const count = reports.filter(r => r.documentNumber.includes(String(year))).length + 1;
        const documentNumber = `FE-MEAL-${year}-${String(count).padStart(4, '0')}`;
        const totalMeals = data.mealRecords.reduce((sum, record) => sum + record.mealCount, 0);

        const newReport: MealReport = {
            ...data,
            id,
            documentNumber,
            totalMeals,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userId
        };

        reports.push(newReport);
        localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(reports));
        console.log('📦 Meal report saved to localStorage');
        return id;
    }

    private getByIdFromLocalStorage(id: string): MealReport | null {
        const reports = this.getAllFromLocalStorage();
        return reports.find(r => r.id === id) || null;
    }

    private updateLocalStorage(id: string, data: Partial<MealReportFormData>): void {
        const reports = this.getAllFromLocalStorage();
        const index = reports.findIndex(r => r.id === id);
        if (index >= 0) {
            reports[index] = {
                ...reports[index],
                ...data,
                updatedAt: new Date().toISOString()
            };
            if (data.mealRecords) {
                reports[index].totalMeals = data.mealRecords.reduce((sum, record) => sum + record.mealCount, 0);
            }
            localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(reports));
            console.log('📦 Meal report updated in localStorage');
        }
    }

    private deleteFromLocalStorage(id: string): void {
        const reports = this.getAllFromLocalStorage();
        const filtered = reports.filter(r => r.id !== id);
        localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(filtered));
        console.log('📦 Meal report deleted from localStorage');
    }
}

export const MealReportDB = new MealReportService();
