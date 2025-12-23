@echo off
title ProStock Enterprise
color 0A
cls
echo.
echo  =====================================
echo      ProStock Enterprise v1.0
echo      نظام إدارة المخزون الاحترافي
echo  =====================================
echo.
echo  جاري تشغيل التطبيق...
echo.

cd /d "%~dp0"

:: بناء التطبيق إذا لم يكن موجود
if not exist "dist\index.html" (
    echo  جاري بناء التطبيق...
    call npm run build
)

:: تشغيل Electron
start "" npx electron .

exit
