@echo off
REM Quick Start Script for Windows - Servi-Connect Chat

setlocal enabledelayedexpansion

echo.
echo ====================================================
echo   ^>^> SERVI-CONNECT - CHAT APPLICATION LAUNCHER
echo ====================================================
echo.

REM Check PHP
php -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PHP not found. Please install PHP 8.2+
    pause
    exit /b 1
)
for /f "tokens=2" %%a in ('php -v ^| findstr /r "PHP"') do set PHP_VERSION=%%a
echo [OK] PHP %PHP_VERSION% found

REM Check Node
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)
for /f %%a in ('node -v') do set NODE_VERSION=%%a
echo [OK] %NODE_VERSION% found

REM Check MariaDB
tasklist | find /i "mysqld.exe" >nul
if %errorlevel% neq 0 (
    echo [WARNING] MariaDB/MySQL not running
    echo           Start it manually or use XAMPP control panel
) else (
    echo [OK] MariaDB/MySQL is running
)

echo.
echo ====================================================
echo   Choose what to launch:
echo.
echo   [1] API Backend (Symfony) only
echo   [2] Frontend (Next.js) only
echo   [3] Both (API + Frontend) 
echo   [4] Mercure (Real-time) + Both
echo   [0] Exit
echo.
echo ====================================================
set /p CHOICE="Enter choice [0-4]: "

if "%CHOICE%"=="1" goto backend
if "%CHOICE%"=="2" goto frontend
if "%CHOICE%"=="3" goto both
if "%CHOICE%"=="4" goto mercure
if "%CHOICE%"=="0" goto exit
goto invalid

:backend
echo.
echo [INFO] Starting API Backend on http://localhost:8000
echo.
cd /d "c:\Users\x\Desktop\CONNCESERVICE\service-app"
php -S localhost:8000 -t public
goto end

:frontend
echo.
echo [INFO] Starting Frontend on http://localhost:3000
echo.
cd /d "c:\Users\x\Desktop\CONNCESERVICE\servi-connect-web"
start npm run dev
goto end

:both
echo.
echo [INFO] Starting API Backend...
cd /d "c:\Users\x\Desktop\CONNCESERVICE\service-app"
start "API Backend (localhost:8000)" cmd /k "php -S localhost:8000 -t public"

timeout /t 2 /nobreak

echo [INFO] Starting Frontend...
cd /d "c:\Users\x\Desktop\CONNCESERVICE\servi-connect-web"
start "Frontend (localhost:3000)" cmd /k "npm run dev"

echo.
echo [SUCCESS] Services started:
echo    API:      http://localhost:8000
echo    Frontend: http://localhost:3000
echo.
echo [INFO] Check the terminal windows for logs
pause
goto end

:mercure
echo.
echo [INFO] Mercure requires Docker
echo.
echo Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker not found!
    echo.
    echo Alternative: Run this command in PowerShell:
    echo   docker run -p 3000:3000 -e JWT_SECRET=test ^
    echo   dunglas/mercure
    echo.
    pause
    goto menu
)

echo [INFO] Starting Mercure container...
docker run -d -p 3000:3000 ^
  -e ALLOWED_ORIGINS="http://localhost:3000" ^
  -e JWT_SECRET="test-secret-change-in-production" ^
  dunglas/mercure

timeout /t 2 /nobreak

echo [INFO] Starting API Backend...
cd /d "c:\Users\x\Desktop\CONNCESERVICE\service-app"
start "API Backend (localhost:8000)" cmd /k "php -S localhost:8000 -t public"

timeout /t 2 /nobreak

echo [INFO] Starting Frontend...
cd /d "c:\Users\x\Desktop\CONNCESERVICE\servi-connect-web"
start "Frontend (localhost:3000)" cmd /k "npm run dev"

echo.
echo [SUCCESS] All services started:
echo    API:      http://localhost:8000
echo    Frontend: http://localhost:3000
echo    Mercure:  http://localhost/.well-known/mercure
echo.
pause
goto end

:invalid
echo [ERROR] Invalid choice
goto end

:exit
echo [INFO] Exiting...
goto end

:end
echo.
endlocal
exit /b 0
