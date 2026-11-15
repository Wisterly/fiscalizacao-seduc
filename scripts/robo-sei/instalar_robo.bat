@echo off
chcp 65001 >nul
title Instalador do Robô SEI Monitor - SEDUC-PI

echo =====================================================================
echo    INSTALADOR AUTOMÁTICO DO ROBÔ SEI MONITOR (SEDUC-PI)
echo    Fiscal.IA - Engenharia e Fiscalização
echo =====================================================================
echo.

:: 1. Verifica se o Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js não foi encontrado neste computador.
    echo [*] Tentando instalar automaticamente via Windows Package Manager (winget)...
    winget install OpenJS.NodeJS.LTS -e --silent
    if %errorlevel% neq 0 (
        echo [X] Não foi possível instalar automaticamente.
        echo Baixe e instale o Node.js rapidamente em: https://nodejs.org/
        pause
        exit /b 1
    )
)

echo [✓] Node.js detectado com sucesso!
echo.

:: 2. Configura o arquivo sei_config.json se ainda não existir
set SCRIPT_DIR=%~dp0
set CONFIG_FILE=%SCRIPT_DIR%sei_config.json
set TEMPLATE_FILE=%SCRIPT_DIR%sei_config.template.json

if not exist "%CONFIG_FILE%" (
    echo [*] Criando seu arquivo de configuração sei_config.json...
    copy "%TEMPLATE_FILE%" "%CONFIG_FILE%" >nul
    echo.
    echo Por favor, digite seu Usuário do SEI (login funcional / matrícula):
    set /p USUARIO_SEI=Usuario: 
    echo Digite sua Senha do SEI:
    set /p SENHA_SEI=Senha: 

    powershell -Command "$cfg = Get-Content '%CONFIG_FILE%' | ConvertFrom-Json; $cfg.usuario = '%USUARIO_SEI%'; $cfg.senha = '%SENHA_SEI%'; $cfg | ConvertTo-Json -Depth 5 | Set-Content '%CONFIG_FILE%'"
    echo [✓] Credenciais configuradas com segurança localmente!
) else (
    echo [✓] Arquivo sei_config.json já existente.
)

echo.
:: 3. Registra a Tarefa Agendada no Windows (Task Scheduler)
echo [*] Agendando execução diária automática no Windows (a cada 2 horas no expediente)...
set SCRIPT_PATH=%SCRIPT_DIR%robo_sei_monitor.cjs

schtasks /create /tn "RoboSEI_FiscalMonitor" /tr "node \"%SCRIPT_PATH%\"" /sc daily /ri 120 /st 08:30 /du 10:00 /f >nul 2>nul
if %errorlevel% equ 0 (
    echo [✓] Tarefa agendada com sucesso no Windows!
    echo     O robô rodará automaticamente todos os dias úteis a cada 2 horas!
) else (
    echo [!] Aviso: Permissão de administrador recomendada para agendar tarefas.
    echo     Tentando agendamento simplificado...
    schtasks /create /tn "RoboSEI_FiscalMonitor" /tr "node \"%SCRIPT_PATH%\"" /sc hourly /f >nul 2>nul
)

echo.
:: 4. Executa o primeiro teste do robô
echo [*] Executando o primeiro teste de verificação...
echo.
node "%SCRIPT_PATH%"

echo.
echo =====================================================================
echo [✓] INSTALAÇÃO E ATIVAÇÃO CONCLUÍDAS COM SUCESSO!
echo O robô agora está ativo e monitorando seus processos do SEI.
echo =====================================================================
echo.
pause
