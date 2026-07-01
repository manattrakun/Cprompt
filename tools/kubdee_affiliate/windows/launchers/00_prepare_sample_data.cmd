@echo off
setlocal
cd /d "%~dp0"
if not exist "tools\kubdee_affiliate" if exist "%~dp0..\..\..\..\tools\kubdee_affiliate" cd /d "%~dp0..\..\..\.."
if not exist "data" mkdir "data"
if exist "data\product-feed.csv" if not "%KUBDEE_SAMPLE_FORCE%"=="1" (
  echo Refusing to overwrite data\product-feed.csv.
  echo Set KUBDEE_SAMPLE_FORCE=1 and rerun this launcher only if you want to replace existing inputs.
  pause
  exit /b 1
)
if exist "data\shopee-offers.txt" if not "%KUBDEE_SAMPLE_FORCE%"=="1" (
  echo Refusing to overwrite data\shopee-offers.txt.
  echo Set KUBDEE_SAMPLE_FORCE=1 and rerun this launcher only if you want to replace existing inputs.
  pause
  exit /b 1
)
copy /Y "tools\kubdee_affiliate\sample_feed.csv" "data\product-feed.csv" >nul
copy /Y "tools\kubdee_affiliate\sample_shop_offers.txt" "data\shopee-offers.txt" >nul
echo Sample data copied:
echo   data\product-feed.csv
echo   data\shopee-offers.txt
echo.
echo This is only for testing the worker. Replace these files with real Shopee data before production runs.
echo Next: run 04_daily_review.cmd
pause
