@echo off
setlocal
cd /d "%~dp0"
if not exist "tools\kubdee_affiliate" if exist "%~dp0..\..\..\..\tools\kubdee_affiliate" cd /d "%~dp0..\..\..\.."
echo Kubdee Affiliate Windows Worker
echo.
echo Opening README_FIRST.md, WINDOWS_QUICKSTART.md, and WINDOWS_TEST_HANDOFF.md...
start "" "README_FIRST.md"
start "" "docs\kubdee-affiliate\WINDOWS_QUICKSTART.md"
start "" "WINDOWS_TEST_HANDOFF.md"
echo.
echo Required before setup:
echo   - Python 3.9+ available as py or python
echo   - Kubdee AI Desktop installed, logged in, and opened once
echo   - Google Chrome installed and logged into Facebook for draft/upload stages
echo.
echo First run:
echo   1. Run 00_check_prerequisites.cmd
echo   2. Put real Shopee files in data\ or run 00_prepare_sample_data.cmd for sample test
echo   3. Run SETUP.cmd
echo   4. Restart PowerShell
echo   5. Run 02_doctor.cmd
echo   6. Run 03_smoke_test.cmd
echo   7. Run 09_windows_acceptance.cmd
echo   8. Run 04_daily_review.cmd
echo   9. Optional: copy config\worker.config.example.json to config\worker.config.json and run 11_run_configured_workflow.cmd
echo  10. Optional: run 12_install_configured_schedule.cmd for daily multi-job scheduling
echo  11. Use 13_show_worker_status.cmd to review latest reports
echo  12. If first setup is confusing, run 14_first_run_diagnostics.cmd and send the generated summary/support bundle
echo.
pause
