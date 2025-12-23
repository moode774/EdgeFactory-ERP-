import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy } from 'firebase/firestore';
import { Employee, EmployeeFormData } from '../types/employee';

const COLLECTION_NAME = 'employees';

class EmployeeService {
    private collectionRef = collection(db, COLLECTION_NAME);

    // Add new employee
    async add(data: EmployeeFormData): Promise<string> {
        try {
            const newEmployee: Omit<Employee, 'id'> = {
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const docRef = await addDoc(this.collectionRef, newEmployee);
            console.log('✅ Employee added to Firebase:', docRef.id);

            this.saveToLocalStorage(docRef.id, { ...newEmployee, id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error('❌ Error adding employee to Firebase:', error);
            return this.addToLocalStorage(data);
        }
    }

    // Get all employees
    async getAll(): Promise<Employee[]> {
        try {
            const q = query(this.collectionRef, orderBy('name', 'asc'));
            const snapshot = await getDocs(q);
            const employees = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Employee));

            console.log(`✅ Loaded ${employees.length} employees from Firebase`);
            return employees;
        } catch (error) {
            console.error('❌ Error loading employees from Firebase:', error);
            return this.getAllFromLocalStorage();
        }
    }

    // Get single employee
    async getById(id: string): Promise<Employee | null> {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Employee;
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting employee:', error);
            return this.getByIdFromLocalStorage(id);
        }
    }

    // Update employee
    async update(id: string, data: Partial<EmployeeFormData>): Promise<void> {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const updateData = {
                ...data,
                updatedAt: new Date().toISOString()
            };

            await updateDoc(docRef, updateData);
            console.log('✅ Employee updated in Firebase');

            const current = await this.getById(id);
            if (current) {
                this.saveToLocalStorage(id, { ...current, ...updateData });
            }
        } catch (error) {
            console.error('❌ Error updating employee:', error);
            this.updateLocalStorage(id, data);
        }
    }

    // Delete employee
    async delete(id: string): Promise<void> {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await deleteDoc(docRef);
            console.log('✅ Employee deleted from Firebase');
            this.deleteFromLocalStorage(id);
        } catch (error) {
            console.error('❌ Error deleting employee:', error);
            this.deleteFromLocalStorage(id);
        }
    }

    // LocalStorage fallback methods
    private getLocalStorageKey(): string {
        return 'employees';
    }

    private getAllFromLocalStorage(): Employee[] {
        const data = localStorage.getItem(this.getLocalStorageKey());
        return data ? JSON.parse(data) : [];
    }

    private saveToLocalStorage(id: string, employee: Employee): void {
        const employees = this.getAllFromLocalStorage();
        const index = employees.findIndex(e => e.id === id);
        if (index >= 0) {
            employees[index] = employee;
        } else {
            employees.push(employee);
        }
        localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(employees));
    }

    private addToLocalStorage(data: EmployeeFormData): string {
        const employees = this.getAllFromLocalStorage();
        const id = `EMP-${Date.now()}`;

        const newEmployee: Employee = {
            ...data,
            id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        employees.push(newEmployee);
        localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(employees));
        console.log('📦 Employee saved to localStorage');
        return id;
    }

    private getByIdFromLocalStorage(id: string): Employee | null {
        const employees = this.getAllFromLocalStorage();
        return employees.find(e => e.id === id) || null;
    }

    private updateLocalStorage(id: string, data: Partial<EmployeeFormData>): void {
        const employees = this.getAllFromLocalStorage();
        const index = employees.findIndex(e => e.id === id);
        if (index >= 0) {
            employees[index] = {
                ...employees[index],
                ...data,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(employees));
            console.log('📦 Employee updated in localStorage');
        }
    }

    private deleteFromLocalStorage(id: string): void {
        const employees = this.getAllFromLocalStorage();
        const filtered = employees.filter(e => e.id !== id);
        localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(filtered));
        console.log('📦 Employee deleted from localStorage');
    }
}

export const EmployeeDB = new EmployeeService();
