@echo off
chcp 65001 >nul
echo ===================================
echo MarketAI Pro - GitHub推送脚本
echo ===================================
echo.

REM 检查Git是否已安装
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到Git，请先安装Git
    echo 下载地址：https://git-scm.com/download/win
    pause
    exit /b 1
)

REM 配置Git身份信息（请修改为您的信息）
echo 正在配置Git身份信息...
git config user.name "MarketAI Pro Developer"
git config user.email "developer@example.com"

REM 重命名分支为main
echo 正在设置分支...
git branch -M main

REM 输入GitHub仓库URL
echo.
echo 请输入您的GitHub仓库URL：
echo 格式：https://github.com/用户名/MarketAI-Pro.git
echo.
set /p REPO_URL="仓库URL: "

REM 添加远程仓库
echo.
echo 正在添加远程仓库...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

REM 推送到GitHub
echo.
echo 正在推送代码到GitHub...
echo ⚠️  首次推送需要输入GitHub用户名和密码（或Token）
echo.
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ 代码推送成功！
    echo.
    echo 🎉 下一步：
    echo 1. 访问您的GitHub仓库
    echo 2. 点击 "Actions" 标签
    echo 3. 等待GitHub Actions自动打包（约5-10分钟）
    echo 4. 在Artifacts区域下载EXE文件
) else (
    echo.
    echo ❌ 推送失败，请检查：
    echo 1. 仓库URL是否正确
    echo 2. GitHub_TOKEN是否有权限
    echo 3. 网络连接是否正常
)

echo.
pause
