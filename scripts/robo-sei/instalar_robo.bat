@echo off
setlocal
title Instalador do Robo SEI Monitor - SEDUC-PI
cd /d "%~dp0"

echo =====================================================================
echo    Iniciando Instalador do Robo SEI Monitor...
echo =====================================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar_robo.ps1"

if %errorlevel% neq 0 (
    echo.
    echo [!] Ocorreu um erro durante a execucao do instalador.
    echo Pressione qualquer tecla para fechar esta janela.
    pause >nul
)
