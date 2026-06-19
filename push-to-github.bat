@echo off
chcp 65001 >nul 2>&1
echo ============================================
echo   MarketAI Pro - Push to GitHub
echo ============================================
echo.

cd /d "%~dp0"

git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git not found. Please install Git first.
    echo Download: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/4] Configuring git identity...
git config user.name "MarketAI Pro Developer"
git config user.email "developer@example.com"

echo [2/4] Setting branch to main...
git branch -M main

echo.
echo [3/4] Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/q-0/MarketAI-Pro.git

echo.
echo [4/4] Pushing code to GitHub...
echo ============================================
echo IMPORTANT: You need a GitHub Personal Access Token
echo If you don't have one yet:
echo   1. Go to https://github.com/settings/tokens
echo   2. Click "Generate new token (classic)"
echo   3. Check the "repo" scope
echo   4. Copy the generated token
echo ============================================
echo.
echo When prompted for password, paste your token (NOT your password)
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo   SUCCESS! Code pushed to GitHub!
    echo ============================================
    echo.
    echo Next steps:
    echo   1. Go to: https://github.com/q-0/MarketAI-Pro
    echo   2. Click "Actions" tab
    echo   3. Wait for build to complete (5-10 min)
    echo   4. Download EXE from Artifacts section
) else (
    echo.
    echo [ERROR] Push failed.
    echo.
    echo Troubleshooting:
    echo   1. Make sure repo exists: https://github.com/q-0/MarketAI-Pro
    echo   2. Generate token: https://github.com/settings/tokens
    echo   3. Use token as password when prompted
)

echo.
pause
