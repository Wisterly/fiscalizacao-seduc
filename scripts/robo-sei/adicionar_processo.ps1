# ==============================================================================
# ASSISTENTE: ADICIONAR NOVO PROCESSO SEI AO MONITOR
# Fiscal.IA - Engenharia e Fiscalização SEDUC-PI
# ==============================================================================

$Host.UI.RawUI.WindowTitle = "Adicionar Processo SEI ao Monitor"
Clear-Host

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "   ADICIONAR PROCESSO SEI AO MONITOR AUTOMATICO" -ForegroundColor White
Write-Host "   Fiscal.IA - Sistema de Fiscalizacao e Engenharia" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigFile = Join-Path $ScriptDir "sei_config.json"
$TemplateFile = Join-Path $ScriptDir "sei_config.template.json"
$ListaTxt = Join-Path $ScriptDir "processos_lista.txt"

# Carrega config existente
$config = $null
if (Test-Path $ConfigFile) {
    try {
        $raw = [System.IO.File]::ReadAllText($ConfigFile)
        $config = $raw | ConvertFrom-Json
    } catch {}
}

if (-not $config -and (Test-Path $TemplateFile)) {
    try {
        $raw = [System.IO.File]::ReadAllText($TemplateFile)
        $config = $raw | ConvertFrom-Json
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
        processos = @()
    }
}

Write-Host "Processos atualmente cadastrados para monitoramento:" -ForegroundColor Gray
$idx = 1
foreach ($p in $config.processos) {
    Write-Host "  $idx. [$($p.numero)] - $($p.titulo)" -ForegroundColor White
    Write-Host "     Alertas: $($p.alertas -join ', ')" -ForegroundColor DarkGray
    $idx++
}
Write-Host ""

Write-Host "---------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Preencha os dados do novo processo para monitorar:" -ForegroundColor Yellow
Write-Host ""

$numProcesso = Read-Host "1. Numero do Processo SEI (ex: 00011.081091/2026-94)"
if (-not $numProcesso -or $numProcesso.Trim().Length -lt 5) {
    Write-Host "❌ Numero do processo invalido. Operacao cancelada." -ForegroundColor Red
    Read-Host "Pressione ENTER para fechar"
    exit 1
}
$numProcesso = $numProcesso.Trim()

$titulo = Read-Host "2. Descricao / Titulo do Processo (Ex: Diarias Vistoria 8a GRE)"
if (-not $titulo) { $titulo = "Processo SEI $numProcesso" }

Write-Host ""
Write-Host "3. Escolha o tipo de monitoramento:" -ForegroundColor Yellow
Write-Host "   [1] Processo de Diarias (Alertas: SEDUC RE e SEDUC Empenho) [Padrao]"
Write-Host "   [2] Processo de Medicao de Obras (Alertas: Nota Fiscal e Termo de Atesto)"
Write-Host "   [3] Personalizado (digitar os nomes dos documentos para alertar)"
$tipo = Read-Host "Opcao (1, 2 ou 3) [Padrao: 1]"

$alertas = @("SEDUC RE", "SEDUC Empenho")
if ($tipo -eq "2") {
    $alertas = @("Nota Fiscal", "Termo de Atesto")
} elseif ($tipo -eq "3") {
    $custom = Read-Host "Digite os termos de alerta separados por virgula"
    if ($custom) {
        $alertas = @($custom.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_.Length -gt 0 })
    }
}

# Verifica se o processo já existe na lista
$jaExiste = $false
foreach ($p in $config.processos) {
    if ($p.numero -eq $numProcesso) {
        $jaExiste = $true
        $p.titulo = $titulo
        $p.alertas = $alertas
        Write-Host "  [!] Processo ja existia na lista. Informacoes atualizadas!" -ForegroundColor Yellow
        break
    }
}

if (-not $jaExiste) {
    $novoProc = [PSCustomObject]@{
        numero = $numProcesso
        titulo = $titulo
        alertas = $alertas
    }
    $config.processos += $novoProc
    Write-Host "  [OK] Processo adicionado com sucesso a lista!" -ForegroundColor Green
}

# Salva sei_config.json
$jsonUtf8 = $config | ConvertTo-Json -Depth 6
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($ConfigFile, $jsonUtf8, $utf8NoBom)

# Atualiza também processos_lista.txt
if (Test-Path $ListaTxt) {
    $linhasExistentes = Get-Content $ListaTxt
    if (-not ($linhasExistentes -contains $numProcesso)) {
        Add-Content -Path $ListaTxt -Value $numProcesso -Encoding UTF8
    }
} else {
    Set-Content -Path $ListaTxt -Value $numProcesso -Encoding UTF8
}

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " [✓] SUCESSO! PROCESSO CADASTRADO NO ROBÔ!" -ForegroundColor Green
Write-Host " Processo: $numProcesso ($titulo)" -ForegroundColor White
Write-Host " Alertas: $($alertas -join ', ')" -ForegroundColor Yellow
Write-Host " O robo agora ira monitorar este processo automaticamente!" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$testar = Read-Host "Deseja rodar uma verificacao agora com todos os processos? (S/N) [Padrao: S]"
if (-not $testar -or $testar -match "^[sS]") {
    Write-Host ""
    node "$ScriptDir\robo_sei_monitor.cjs"
}

Read-Host "Pressione ENTER para fechar"
