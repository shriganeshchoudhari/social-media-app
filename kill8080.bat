@echo off
echo Checking for processes using port 8080...

REM Use a variable to track already killed PIDs
setlocal enabledelayedexpansion
set "done="

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    if "!done!" neq "%%a" (
        echo Port 8080 is used by PID %%a
        echo Attempting to kill PID %%a...
        taskkill /PID %%a /F
        set "done=%%a"
    )
)

echo Done.
pause