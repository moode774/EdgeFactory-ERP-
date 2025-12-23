import React from 'react';
import { Trash2 } from 'lucide-react';
import { Language } from '../../types';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    lang: Language;
}

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message, lang }: DeleteModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm relative z-10 p-6 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="text-red-600" size={28} />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{title || (lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete')}</h3>
                <p className="text-slate-500 text-sm mb-4">{message}</p>
                <div className="flex gap-2 justify-center">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">{lang === 'ar' ? 'حذف' : 'Delete'}</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
