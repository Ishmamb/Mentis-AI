@echo off
title Mentis AI - Expo Go
cd /d "%~dp0"

echo.
echo ====================================
echo        MENTIS AI - STARTER
echo ====================================
echo.

if not exist node_modules (
  echo First run detected. Installing packages...
  echo This can take a few minutes.
  call npm install
  if errorlevel 1 (
    echo.
    echo Installation failed. Check your internet and Node.js.
    pause
    exit /b 1
  )
)

echo.
echo Starting Expo for Expo Go...
echo Keep this window open and scan the QR code with your iPhone Camera.
echo.
call npx expo start --clear

pause
