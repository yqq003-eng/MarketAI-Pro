@echo off
chcp 65001 > nul
title MarketAI Pro - EXE打包工具

echo ==============================================
echo    MarketAI Pro - EXE 打包工具
echo ==============================================
echo.

REM 检查Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未安装 Node.js
    echo 请先下载并安装：https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] 配置国内镜像...
call npm config set registry https://registry.npmmirror.com
call npm config set electron_mirror https://npmmirror.com/mirrors/electron/
call npm config set electron_builder_binaries_mirror https://npmmirror.com/mirrors/electron-builder-binaries/
echo 镜像配置完成

echo.
echo [2/5] 安装根目录依赖（Electron等）...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [警告] 依赖安装部分失败，正在继续...
)

echo.
echo [3/5] 安装前端依赖...
cd src\frontend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [警告] 前端依赖安装部分失败，正在继续...
)
cd ..\..

echo.
echo [4/5] 构建前端项目...
cd src\frontend
call npm run build
if %errorlevel% neq 0 (
    echo [警告] 前端构建失败，将使用备用HTML页面
)
cd ..\..

echo.
echo [5/5] 开始打包EXE...
call npx electron-builder --win --x64 --publish=never

if %errorlevel% equ 0 (
    echo.
    echo ==============================================
    echo  打包成功！
    echo  安装包位置：dist_electron\win-unpacked\
    echo  安装程序：dist_electron\MarketAI Pro Setup *.exe
    echo ==============================================
) else (
    echo.
    echo [错误] 打包失败，请查看上方错误信息
    echo 建议：
    echo 1. 检查网络连接
    echo 2. 确认已安装 Visual Studio Build Tools
    echo 3. 查看 "打包指南.md" 获取详细帮助
)

echo.
pause
