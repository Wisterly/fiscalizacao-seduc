# ==============================================================================
# INSTALADOR AUTOMÁTICO DO ROBÔ SEI MONITOR - SEDUC-PI
# Fiscal.IA - Engenharia e Fiscalização
# ==============================================================================

$Host.UI.RawUI.WindowTitle = "Instalador do Robo SEI Monitor - SEDUC-PI"
Clear-Host

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "   INSTALADOR AUTOMATICO DO ROBO SEI MONITOR (SEDUC-PI)" -ForegroundColor White
Write-Host "   Fiscal.IA - Sistema de Fiscalizacao e Engenharia" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigFile = Join-Path $ScriptDir "sei_config.json"
$TemplateFile = Join-Path $ScriptDir "sei_config.template.json"
$MonitorScript = Join-Path $ScriptDir "robo_sei_monitor.cjs"

# 1. Verifica se o Node.js está instalado
Write-Host "[1/4] Verificando ambiente Node.js..." -ForegroundColor Gray
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeCmd) {
    Write-Host "[!] Node.js nao foi encontrado neste computador." -ForegroundColor Yellow
    Write-Host "[*] Tentando instalar automaticamente via Windows Package Manager (winget)..." -ForegroundColor Gray
    try {
        winget install OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    } catch {
        Write-Host "[!] Nao foi possivel instalar automaticamente via winget." -ForegroundColor Red
    }

    if (-not $nodeCmd) {
        Write-Host "❌ Por favor, instale o Node.js baixando o instalador oficial em: https://nodejs.org/" -ForegroundColor Red
        Write-Host "Apos instalar, execute este instalador novamente."
        Write-Host ""
        Read-Host "Pressione ENTER para sair"
        exit 1
    }
}

$nodeVersion = node -v
Write-Host "  [OK] Node.js detectado com sucesso: $nodeVersion" -ForegroundColor Green
Write-Host ""

# 2. Configura usuário e senha do SEI
Write-Host "[2/4] Configuracao de Acesso ao SEI Piaui..." -ForegroundColor Gray

$config = $null
if (Test-Path $ConfigFile) {
    try {
        $rawJson = [System.IO.File]::ReadAllText($ConfigFile)
        $config = $rawJson | ConvertFrom-Json
    } catch {}
}

if (-not $config -and (Test-Path $TemplateFile)) {
    try {
        $rawJson = [System.IO.File]::ReadAllText($TemplateFile)
        $config = $rawJson | ConvertFrom-Json
    } catch {}
}

if (-not $config) {
    $config = [PSCustomObject]@{
        usuario = ""
        senha = ""
        idOrgao = "8"
        nomeOrgao = "SEDUC-PI"
        ntfyTopic = "antigravity-alert-lenovo"
        intervaloMinutos = 120
        processos = @(
            [PSCustomObject]@{
                numero = "00011.081091/2026-94"
                titulo = "Processo de Diarias - Fiscalizacao SEDUC"
                alertas = @("SEDUC RE", "SEDUC Empenho")
            }
        )
    }
}

$usuarioAtual = if ($config.usuario) { $config.usuario } else { "Nenhum configurado" }
Write-Host "  Usuario atual no arquivo: $usuarioAtual" -ForegroundColor White

Write-Host ""
Write-Host "Deseja informar ou atualizar suas credenciais do SEI agora? (S/N) [Padrao: S]" -ForegroundColor Yellow
$resp = Read-Host "Opcao (S/N)"

if (-not $resp -or $resp -match "^[sS]") {
    Write-Host ""
    $usuario = Read-Host "  Digite seu Usuario do SEI (login funcional / matricula)"
    $senha = Read-Host "  Digite sua Senha do SEI"

    if ($usuario) { $config.usuario = $usuario.Trim() }
    if ($senha) { $config.senha = $senha.Trim() }

    $jsonUtf8 = $config | ConvertTo-Json -Depth 5
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($ConfigFile, $jsonUtf8, $utf8NoBom)
    Write-Host "  [OK] Credenciais salvas com sucesso em sei_config.json!" -ForegroundColor Green
} else {
    Write-Host "  Mantendo configuracoes existentes." -ForegroundColor Gray
}
Write-Host ""

# 3. Agendamento de Tarefa Automática no Windows
Write-Host "[3/4] Agendando execucao automatica no Windows..." -ForegroundColor Gray
$taskName = "RoboSEI_FiscalMonitor"
$nodePath = (Get-Command node).Source
$actionCmd = "`"$nodePath`" `"$MonitorScript`""

$agendou = $false
try {
    schtasks.exe /create /tn $taskName /tr $actionCmd /sc daily /ri 120 /st 08:30 /du 10:00 /f 2>$null
    if ($LASTEXITCODE -eq 0) {
        $agendou = $true
        Write-Host "  [OK] Tarefa agendada: Execucao a cada 2 horas no expediente (08:30 - 18:30)!" -ForegroundColor Green
    }
} catch {}

if (-not $agendou) {
    try {
        schtasks.exe /create /tn $taskName /tr $actionCmd /sc hourly /f 2>$null
        if ($LASTEXITCODE -eq 0) {
            $agendou = $true
            Write-Host "  [OK] Tarefa agendada: Execucao de hora em hora!" -ForegroundColor Green
        }
    } catch {}
}

if (-not $agendou) {
    Write-Host "  [!] Aviso: Para registrar no Agendador de Tarefas do Windows, execute como Administrador." -ForegroundColor Yellow
    Write-Host "      Voce tambem pode rodar o robo clicando a qualquer momento em: executar_agora.bat" -ForegroundColor Cyan
}
Write-Host ""

# 4. Executa teste inicial
Write-Host "[4/4] Executando teste do robo agora..." -ForegroundColor Gray
Write-Host "---------------------------------------------------------------------" -ForegroundColor DarkGray
node "$MonitorScript"
Write-Host "---------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " [OK] TUDO PRONTO!" -ForegroundColor Green
Write-Host " O instalador concluiu a preparacao do robo." -ForegroundColor White
Write-Host " Para rodar a verificacao manualmente quando quiser, clique em:" -ForegroundColor Gray
Write-Host " -> executar_agora.bat" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Pressione ENTER para encerrar"
