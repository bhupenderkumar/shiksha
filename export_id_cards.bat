@echo off
echo ID Card Export Tool
echo ==================
echo.

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Python is not installed or not in PATH. Please install Python 3.7 or higher.
    echo Visit https://www.python.org/downloads/ to download Python.
    pause
    exit /b 1
)

REM Check if requirements are installed
if not exist requirements.txt (
    echo requirements.txt not found. Please make sure you're in the correct directory.
    pause
    exit /b 1
)

echo Checking and installing required packages...
python -m pip install -r requirements.txt

echo.
echo Starting ID Card Export...
echo.

REM Run the export script
python export_id_cards.py %*

echo.
if %ERRORLEVEL% equ 0 (
    echo Export completed successfully!
) else (
    echo Export failed with error code %ERRORLEVEL%
)

pause
