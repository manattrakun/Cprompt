@echo off
setlocal
cd /d "%~dp0"
if not exist "tools\kubdee_affiliate" if exist "%~dp0..\..\..\..\tools\kubdee_affiliate" cd /d "%~dp0..\..\..\.."
where py >nul 2>nul
if %ERRORLEVEL%==0 (
  py tools\kubdee_affiliate\smoke_test.py
) else (
  where python >nul 2>nul
  if %ERRORLEVEL%==0 (
    python tools\kubdee_affiliate\smoke_test.py
  ) else (
    echo Python not found. Install Python 3.9+ and enable the py launcher or add python.exe to PATH.
  )
)
pause
