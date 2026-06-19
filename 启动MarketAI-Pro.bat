@echo off
chcp 65001 > nul
title MarketAI Pro 启动器

echo ================================================
echo    MarketAI Pro - 企业级AI营销自动化平台
echo ================================================
echo.

REM 检查Node.js是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js v22+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] 检查依赖...
if not exist "node_modules\" (
    echo 首次运行，正在安装依赖（可能需要几分钟）...
    call npm install --legacy-peer-deps
)

if not exist "src\frontend\node_modules\" (
    echo 正在安装前端依赖...
    cd src\frontend
    call npm install --legacy-peer-deps
    cd ..\..
)

echo [2/3] 启动后端服务...
start "MarketAI Backend" cmd /k "node src/backend/server.js"

timeout /t 3 > nul

echo [3/3] 启动前端界面...
cd src\frontend
start "MarketAI Frontend" cmd /k "npm run serve"
cd ..\..

echo.
echo ================================================
echo  服务启动中...
echo  后端: http://localhost:3000
echo  前端: http://localhost:8080
echo ================================================
echo.
echo 浏览器将自动打开前端页面...
timeout /t 5 > nul
start http://localhost:8080

echo.
echo 按任意键关闭此窗口（服务将在后台继续运行）
pause > nul
