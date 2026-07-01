@echo off
setlocal
cd /d "%~dp0"
if not exist "tools\kubdee_affiliate" if exist "%~dp0..\..\..\..\tools\kubdee_affiliate" cd /d "%~dp0..\..\..\.."
if not exist "config\worker.config.json" (
  if not exist "config\worker.config.example.json" (
    echo Missing config\worker.config.example.json
    pause
    exit /b 1
  )
  copy /Y "config\worker.config.example.json" "config\worker.config.json" >nul
  echo Created config\worker.config.json from example.
  echo Edit config\worker.config.json, then rerun this launcher.
  pause
  exit /b 1
)
powershell -ExecutionPolicy Bypass -File "tools\kubdee_affiliate\windows\run_configured_workflow.ps1" -ProjectRoot "%CD%" -ConfigPath "config\worker.config.json"
pause
