const { contextBridge, ipcRenderer } = require('electron');

// تعريض API آمن للتطبيق
contextBridge.exposeInMainWorld('electronAPI', {
    // قراءة البيانات من ملف
    readData: (key) => ipcRenderer.invoke('read-data', key),

    // كتابة البيانات إلى ملف
    writeData: (key, value) => ipcRenderer.invoke('write-data', key, value),

    // التحقق من وجود Electron
    isElectron: () => true,

    // الحصول على مسار البيانات
    getDataPath: () => ipcRenderer.invoke('get-data-path')
});
