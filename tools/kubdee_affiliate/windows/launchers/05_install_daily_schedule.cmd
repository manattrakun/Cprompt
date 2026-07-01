@echo off
setlocal
cd /d "%~dp0"
if not exist "tools\kubdee_affiliate" if exist "%~dp0..\..\..\..\tools\kubdee_affiliate" cd /d "%~dp0..\..\..\.."
powershell -ExecutionPolicy Bypass -File "tools\kubdee_affiliate\windows\install_scheduled_task.ps1" -ProjectRoot "%CD%" -TaskName "KubdeeAffiliateDailyReview" -Stage "Review" -Theme "rainy" -ProfileName "Reel promote shopee" -DailyAt "09:00" -JitterMinutes 15
pause
