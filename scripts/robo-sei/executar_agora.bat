@echo off
chcp 65001 >nul
title Executar Robô SEI Monitor Agora
set SCRIPT_DIR=%~dp0
node "%SCRIPT_DIR%robo_sei_monitor.cjs"
pause
