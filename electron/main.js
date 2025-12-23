const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// --- إعدادات التطبيق | App Settings ---
const APP_NAME = 'Forest Edge Factory';
const isDev = !app.isPackaged;

let mainWindow;
let dataPath;

// --- إعداد مجلد البيانات | Setup Data Directory ---
function setupDataDirectory() {
    // مسار مجلد البيانات في AppData
    dataPath = path.join(app.getPath('userData'), 'data');

    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
        console.log('✅ تم إنشاء مجلد البيانات:', dataPath);
    }

    return dataPath;
}

// --- قراءة البيانات من ملف | Read Data from File ---
function readDataFromFile(key) {
    try {
        const filePath = path.join(dataPath, `${key}.json`);

        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }

        return null;
    } catch (error) {
        console.error('❌ خطأ في قراءة البيانات:', key, error);
        return null;
    }
}

// --- كتابة البيانات إلى ملف | Write Data to File ---
function writeDataToFile(key, value) {
    try {
        const filePath = path.join(dataPath, `${key}.json`);
        fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('❌ خطأ في كتابة البيانات:', key, error);
        return false;
    }
}

// --- إنشاء النافذة الرئيسية | Create Main Window ---
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        title: APP_NAME,
        icon: path.join(__dirname, '..', 'icon.ico'),
        backgroundColor: '#f8fafc',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            devTools: isDev,
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: true,
        show: false,
        frame: true
    });

    // إخفاء القائمة
    Menu.setApplicationMenu(null);

    // إظهار النافذة عند الجاهزية
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // تحميل التطبيق
    if (isDev) {
        // في وضع التطوير
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    } else {
        // في الإنتاج
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }

    // تعظيم النافذة
    mainWindow.maximize();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// --- IPC Handlers ---

// قراءة البيانات
ipcMain.handle('read-data', async (event, key) => {
    return readDataFromFile(key);
});

// كتابة البيانات
ipcMain.handle('write-data', async (event, key, value) => {
    return writeDataToFile(key, value);
});

// الحصول على مسار البيانات
ipcMain.handle('get-data-path', async () => {
    return dataPath;
});

// --- أحداث التطبيق | App Events ---

app.whenReady().then(() => {
    setupDataDirectory();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// --- تعطيل الاختصارات في الإنتاج ---
if (!isDev) {
    app.on('web-contents-created', (event, contents) => {
        contents.on('before-input-event', (event, input) => {
            // تعطيل F12 و DevTools
            if (input.key === 'F12' ||
                (input.control && input.shift && input.key === 'I')) {
                event.preventDefault();
            }
        });
    });
}
