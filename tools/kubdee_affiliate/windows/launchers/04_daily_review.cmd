@echo off
setlocal
cd /d "%~dp0"
if not exist "tools\kubdee_affiliate" if exist "%~dp0..\..\..\..\tools\kubdee_affiliate" cd /d "%~dp0..\..\..\.."
powershell -ExecutionPolicy Bypass -File "tools\kubdee_affiliate\windows\run_affiliate_workflow.ps1" -ProjectRoot "%CD%" -Stage "Review" -Theme "rainy" -ProfileName "Reel promote shopee" -Limit 20 -JitterMinutes 15
pause
