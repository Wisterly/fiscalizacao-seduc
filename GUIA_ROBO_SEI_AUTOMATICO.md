# GUIA DEFINITIVO: ROBÔ MONITOR AUTOMÁTICO DO SEI PIAUÍ (SEDUC-PI)
## Monitoramento de Múltiplos Processos com Sincronização Dinâmica

Este guia ensina como configurar, instalar e executar o **Robô Fiscal Monitor do SEI Piauí**, capaz de verificar dezenas de processos automaticamente todos os dias, relogar sozinho quando a sessão expirar e enviar notificações push imediatas com som no celular toda vez que documentos críticos (como **`SEDUC RE`** ou **`SEDUC Empenho`**) forem juntados.

---

## 1. Como Funciona a Arquitetura Multi-Processos

1. **Varredura Sequencial e Inteligente:**
   O robô processa quantos números de processos você desejar em uma única execução. Ele faz o login automático no portal dos servidores (`https://sip.pi.gov.br/sip/login.php`), busca cada processo em sequência com intervalo suave de cortesia (800ms) e analisa a árvore de documentos de cada um.
2. **Histórico Anti-Repetição:**
   Cada alerta emitido para um determinado processo é registrado em `historico_alertas.json`. Assim, ele só te avisa no celular quando um novo documento acaba de sair, sem repetir alertas para documentos antigos.
3. **Múltiplas Fontes de Processos:**
   O robô reúne automaticamente os processos de 3 origens diferentes:
   - Do arquivo `sei_config.json`;
   - Da lista simples `processos_lista.txt`;
   - Da exportação do app `processos_exportados.json`.

---

## 2. Como Adicionar Novos Processos (3 Formas Simples)

### Forma 1: Pelo Assistente em 1 Clique (Recomendada no Computador)
- Na pasta `scripts/robo-sei`, dê duplo clique em **`adicionar_processo.bat`**.
- Digite o número do processo (ex: `00011.081091/2026-94`), o título e escolha se é Diária ou Medição.
- O robô já inclui na lista e faz a primeira verificação na mesma hora!

### Forma 2: Pelo Arquivo de Bloco de Notas (`processos_lista.txt`)
- Abra o arquivo **`scripts/robo-sei/processos_lista.txt`** no Bloco de Notas.
- Cole os números dos seus processos, **um por linha**, e salve.
- Na próxima varredura, o robô incluirá todos eles automaticamente!

### Forma 3: Diretamente pelo Aplicativo Fiscal.IA
- No seu aplicativo, vá na aba **Acompanhar Processos SEI** e cadastre quantos processos quiser.
- Clique no botão **"⚡ Sincronizar com Robô"** no topo da tela.
- Ele exporta o arquivo e copia a lista de processos para você sincronizar instantaneamente!

---

## 3. Código-Fonte Integral dos Arquivos

### Arquivo 1: `scripts/robo-sei/processos_lista.txt`
```text
# ==============================================================================
# LISTA DE PROCESSOS SEI PARA MONITORAMENTO AUTOMÁTICO
# Fiscal.IA - SEDUC-PI
# ==============================================================================
# Cole aqui os números dos processos do SEI que você deseja monitorar (um por linha):
00011.081091/2026-94
```

---

### Arquivo 2: `scripts/robo-sei/adicionar_processo.bat`
```batch
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
```

---

### Arquivo 3: `scripts/robo-sei/adicionar_processo.ps1`
```powershell
$Host.UI.RawUI.WindowTitle = "Adicionar Processo SEI ao Monitor"
Clear-Host

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "   ADICIONAR PROCESSO SEI AO MONITOR AUTOMATICO" -ForegroundColor White
Write-Host "   Fiscal.IA - Sistema de Fiscalizacao e Engenharia" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigFile = Join-Path $ScriptDir "sei_config.json"
$ListaTxt = Join-Path $ScriptDir "processos_lista.txt"

$config = $null
if (Test-Path $ConfigFile) {
    try {
        $raw = [System.IO.File]::ReadAllText($ConfigFile)
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
    $idx++
}
Write-Host ""

$numProcesso = Read-Host "1. Numero do Processo SEI (ex: 00011.081091/2026-94)"
if (-not $numProcesso -or $numProcesso.Trim().Length -lt 5) {
    Write-Host "Numero do processo invalido." -ForegroundColor Red
    exit 1
}
$numProcesso = $numProcesso.Trim()

$titulo = Read-Host "2. Descricao / Titulo do Processo"
if (-not $titulo) { $titulo = "Processo SEI $numProcesso" }

Write-Host "3. Tipo de Monitoramento:" -ForegroundColor Yellow
Write-Host "   [1] Processo de Diarias (Alertas: SEDUC RE e SEDUC Empenho)"
Write-Host "   [2] Processo de Medicao de Obras (Alertas: Nota Fiscal e Termo de Atesto)"
$tipo = Read-Host "Opcao (1 ou 2) [Padrao: 1]"

$alertas = @("SEDUC RE", "SEDUC Empenho")
if ($tipo -eq "2") {
    $alertas = @("Nota Fiscal", "Termo de Atesto")
}

$jaExiste = $false
foreach ($p in $config.processos) {
    if ($p.numero -eq $numProcesso) {
        $jaExiste = $true
        $p.titulo = $titulo
        $p.alertas = $alertas
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
}

$jsonUtf8 = $config | ConvertTo-Json -Depth 6
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($ConfigFile, $jsonUtf8, $utf8NoBom)

if (Test-Path $ListaTxt) {
    $linhasExistentes = Get-Content $ListaTxt
    if (-not ($linhasExistentes -contains $numProcesso)) {
        Add-Content -Path $ListaTxt -Value $numProcesso -Encoding UTF8
    }
} else {
    Set-Content -Path $ListaTxt -Value $numProcesso -Encoding UTF8
}

Write-Host "✓ Processo $numProcesso cadastrado com sucesso!" -ForegroundColor Green
Read-Host "Pressione ENTER para fechar"
```

---

### Arquivo 4: `scripts/robo-sei/robo_sei_monitor.cjs`
```javascript
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIR_ATUAL = __dirname;
const CONFIG_PATH = path.join(DIR_ATUAL, 'sei_config.json');
const CONFIG_TEMPLATE_PATH = path.join(DIR_ATUAL, 'sei_config.template.json');
const LISTA_TXT_PATH = path.join(DIR_ATUAL, 'processos_lista.txt');
const EXPORTADOS_JSON_PATH = path.join(DIR_ATUAL, 'processos_exportados.json');
const HISTORICO_PATH = path.join(DIR_ATUAL, 'historico_alertas.json');

function carregarConfig() {
  let config = null;

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf8').replace(/^\uFEFF/, '');
      config = JSON.parse(raw);
    } catch (e) {
      console.error('Erro ao ler sei_config.json:', e.message);
    }
  }

  if (!config && fs.existsSync(CONFIG_TEMPLATE_PATH)) {
    try {
      const raw = fs.readFileSync(CONFIG_TEMPLATE_PATH, 'utf8').replace(/^\uFEFF/, '');
      config = JSON.parse(raw);
    } catch (e) {}
  }

  if (!config) {
    config = {
      usuario: process.env.SEI_USUARIO || '',
      senha: process.env.SEI_SENHA || '',
      idOrgao: '8',
      nomeOrgao: 'SEDUC-PI',
      ntfyTopic: 'antigravity-alert-lenovo',
      processos: [
        {
          numero: '00011.081091/2026-94',
          titulo: 'Processo de Diárias - Fiscalização',
          alertas: ['SEDUC RE', 'SEDUC Empenho']
        }
      ]
    };
  }

  if (!Array.isArray(config.processos)) {
    config.processos = [];
  }

  if (fs.existsSync(LISTA_TXT_PATH)) {
    try {
      const conteudoTxt = fs.readFileSync(LISTA_TXT_PATH, 'utf8');
      const linhas = conteudoTxt.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
      linhas.forEach((num) => {
        if (num.length >= 5) {
          const jaExiste = config.processos.some(p => p.numero.trim() === num);
          if (!jaExiste) {
            config.processos.push({
              numero: num,
              titulo: `Processo SEI ${num}`,
              alertas: ['SEDUC RE', 'SEDUC Empenho']
            });
          }
        }
      });
    } catch (e) {}
  }

  if (fs.existsSync(EXPORTADOS_JSON_PATH)) {
    try {
      const rawExp = fs.readFileSync(EXPORTADOS_JSON_PATH, 'utf8').replace(/^\uFEFF/, '');
      const exportados = JSON.parse(rawExp);
      const listaExp = Array.isArray(exportados) ? exportados : (exportados.processos || []);
      listaExp.forEach((pExp) => {
        const num = pExp.numeroProcesso || pExp.numero;
        if (num && num.length >= 5) {
          const indexExistente = config.processos.findIndex(p => p.numero.trim() === num.trim());
          const alertasExp = Array.isArray(pExp.alertasMonitorados)
            ? pExp.alertasMonitorados.filter(a => a.ativo).map(a => a.nomeDocumentoAlvo)
            : (pExp.alertas || ['SEDUC RE', 'SEDUC Empenho']);

          if (indexExistente >= 0) {
            config.processos[indexExistente].titulo = pExp.titulo || config.processos[indexExistente].titulo;
            if (alertasExp.length > 0) config.processos[indexExistente].alertas = alertasExp;
          } else {
            config.processos.push({
              numero: num.trim(),
              titulo: pExp.titulo || `Processo SEI ${num}`,
              alertas: alertasExp.length > 0 ? alertasExp : ['SEDUC RE', 'SEDUC Empenho']
            });
          }
        }
      });
    } catch (e) {}
  }

  return config;
}

function carregarHistorico() {
  if (fs.existsSync(HISTORICO_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORICO_PATH, 'utf8'));
    } catch (e) {}
  }
  return { docsNotificados: [] };
}

function salvarHistorico(hist) {
  try {
    fs.writeFileSync(HISTORICO_PATH, JSON.stringify(hist, null, 2), 'utf8');
  } catch (e) {}
}

function dispararPush(topico, titulo, mensagem, tags = 'bell,sparkles') {
  return new Promise((resolve) => {
    const postData = Buffer.from(mensagem, 'utf8');
    const req = https.request(`https://ntfy.sh/${encodeURIComponent(topico)}`, {
      method: 'POST',
      headers: {
        'Title': titulo,
        'Priority': 'urgent',
        'Tags': tags,
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Length': postData.length
      }
    }, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.write(postData);
    req.end();
  });
}

function emitirAlertaSonoro() {
  try {
    if (process.platform === 'win32') {
      execSync('powershell -Command "[console]::beep(1200, 300); [console]::beep(1600, 450)"', { stdio: 'ignore' });
    }
  } catch (e) {}
}

class CookieHttpClient {
  constructor() {
    this.cookies = {};
  }

  getCookieString() {
    return Object.entries(this.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  parseSetCookie(setCookieHeaders) {
    if (!setCookieHeaders) return;
    const list = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    list.forEach(header => {
      const parts = header.split(';')[0].split('=');
      if (parts.length >= 2) {
        const k = parts[0].trim();
        const v = parts.slice(1).join('=').trim();
        this.cookies[k] = v;
      }
    });
  }

  request(urlStr, options = {}, postData = null) {
    return new Promise((resolve, reject) => {
      const u = new URL(urlStr);
      const isHttps = u.protocol === 'https:';
      const lib = isHttps ? https : http;

      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        ...options.headers
      };

      const cookieStr = this.getCookieString();
      if (cookieStr) headers['Cookie'] = cookieStr;
      if (postData && !headers['Content-Length']) {
        headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = lib.request(u, {
        method: options.method || 'GET',
        headers
      }, (res) => {
        this.parseSetCookie(res.headers['set-cookie']);

        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          });
        });
      });

      req.on('error', reject);
      if (postData) req.write(postData);
      req.end();
    });
  }
}

async function executarRobo() {
  console.log('====================================================');
  console.log('ROBÔ SEI FISCAL MONITOR - SEDUC PIAUÍ');
  console.log('Horário:', new Date().toLocaleString('pt-BR'));
  console.log('====================================================');

  const config = carregarConfig();
  const hist = carregarHistorico();
  const client = new CookieHttpClient();

  if (!config.usuario || !config.senha) {
    console.log('AVISO: Credenciais de usuário e senha não configuradas em sei_config.json.');
    return;
  }

  console.log(`Realizando login no SIP/SEI como [${config.usuario}] - Órgão: SEDUC-PI...`);
  console.log(`Total de Processos a monitorar: ${config.processos.length}`);

  try {
    const postBody = `txtUsuario=${encodeURIComponent(config.usuario)}&pwdSenha=${encodeURIComponent(config.senha)}&selOrgao=${config.idOrgao || '8'}&hdnAcao=1&hdnInfraPrefixoCookie=LOGIN-SEI`;
    
    const loginRes = await client.request(
      'https://sip.pi.gov.br/sip/login.php?sigla_orgao_sistema=GOV-PI&sigla_sistema=SEI&infra_url=L3NlaS8=',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://sip.pi.gov.br/sip/login.php?sigla_orgao_sistema=GOV-PI&sigla_sistema=SEI&infra_url=L3NlaS8='
        }
      },
      postBody
    );

    let countProc = 0;
    for (const proc of config.processos) {
      countProc++;
      console.log(`[${countProc}/${config.processos.length}] Verificando processo: ${proc.numero} (${proc.titulo || 'Geral'})...`);

      const buscaUrl = `https://sei.pi.gov.br/sei/controlador.php?acao=protocolo_pesquisar_rapido&acao_origem=procedimento_controlar&palavra_pesquisa=${encodeURIComponent(proc.numero)}`;
      const buscaRes = await client.request(buscaUrl);

      const html = buscaRes.body;

      for (const termo of proc.alertas) {
        const termoLimpo = termo.toLowerCase().trim();
        const encontrado = html.toLowerCase().includes(termoLimpo);
        const chaveAlerta = `${proc.numero}_${termo}`;

        if (encontrado) {
          console.log(`[ENCONTRADO!] O documento '${termo}' está presente no processo ${proc.numero}!`);

          if (!hist.docsNotificados.includes(chaveAlerta)) {
            const tituloPush = `ALERTA SEI: ${termo} Emitido!`;
            const msgPush = `O documento ${termo} foi localizado no seu processo ${proc.numero} (${proc.titulo || 'SEDUC'}).`;

            await dispararPush(config.ntfyTopic, tituloPush, msgPush, 'bell,white_check_mark');
            emitirAlertaSonoro();

            hist.docsNotificados.push(chaveAlerta);
            salvarHistorico(hist);
          }
        }
      }

      if (countProc < config.processos.length) {
        await new Promise(r => setTimeout(r, 800));
      }
    }

    console.log('Varredura concluída com sucesso!');
  } catch (err) {
    console.error('Falha na execução do robô:', err.message);
  }
}

executarRobo();
```
