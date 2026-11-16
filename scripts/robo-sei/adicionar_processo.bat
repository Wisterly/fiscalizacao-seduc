@echo off
setlocal
title Adicionar Processo SEI ao Monitor
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0adicionar_processo.ps1"

if %errorlevel% neq 0 (
    echo.
    echo Ocorreu um erro durante a execucao.
    pause
)
