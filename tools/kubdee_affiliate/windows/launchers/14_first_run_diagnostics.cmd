@echo off
setlocal
cd /d "%~dp0"
if not exist "tools\kubdee_affiliate" if exist "%~dp0..\..\..\..\tools\kubdee_affiliate" cd /d "%~dp0..\..\..\.."
powershell -ExecutionPolicy Bypass -File "tools\kubdee_affiliate\windows\run_first_run_diagnostics.ps1" -ProjectRoot "%CD%"
pause
