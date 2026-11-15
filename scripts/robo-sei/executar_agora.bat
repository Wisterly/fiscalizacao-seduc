@echo off
setlocal
title Executar Robo SEI Monitor Agora
cd /d "%~dp0"

echo =====================================================================
echo    Executando Robo SEI Monitor - SEDUC-PI...
echo =====================================================================
echo.

node "%~dp0robo_sei_monitor.cjs"

echo.
echo =====================================================================
echo Execucao finalizada.
echo =====================================================================
echo.
pause
