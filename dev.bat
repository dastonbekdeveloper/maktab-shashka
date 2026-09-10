@echo off
title Maktab Shashka Launcher
cd /d "%~dp0"
set "NODE_PATH=C:\Program Files\nodejs"
set "PATH=%NODE_PATH%;%PATH%"

echo ========================================================
echo   MAKTAB SHASHKA — Server va Clientni Ishga Tushirish
echo ========================================================
echo.

echo [1/3] Backend Server ishga tushirilmoqda (Port 4000)...
start "Shashka Backend (4000)" cmd /k "cd /d "%~dp0server" && set "PATH=C:\Program Files\nodejs;%%PATH%%" && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/3] Frontend Client ishga tushirilmoqda (Port 3000)...
start "Shashka Frontend (3000)" cmd /k "cd /d "%~dp0client" && set "PATH=C:\Program Files\nodejs;%%PATH%%" && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Brauzerda ochilmoqda: http://localhost:3000 ...
start http://localhost:3000

echo.
echo ========================================================
echo  Hammasi muvaffaqiyatli ishga tushirildi!
echo  Brauzeringizda platforma ochilishi kerak.
echo ========================================================
timeout /t 5
