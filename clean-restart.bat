@echo off
echo Stopping any running Vite servers...
taskkill /f /im node.exe 2>nul

echo Clearing Vite cache...
rmdir /s /q node_modules\.vite 2>nul

echo Clearing browser cache...
echo Please manually clear your browser cache or use incognito mode

echo Installing dependencies...
npm install

echo Starting development server...
npm run dev
