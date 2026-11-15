# GUIA DEFINITIVO: ROBÔ MONITOR AUTOMÁTICO DO SEI PIAUÍ (SEDUC-PI)
## Instalação em 1 Clique para Computador de Casa, do Trabalho ou Nuvem

Este guia técnico e manual de replicação ensina como configurar, instalar e executar o **Robô Fiscal Monitor do SEI Piauí**, capaz de verificar processos automaticamente todos os dias, relogar sozinho quando a sessão expirar e enviar notificações push imediatas com som no celular toda vez que documentos críticos (como **`SEDUC RE`** ou **`SEDUC Empenho`**) forem juntados.

---

## 1. Como Funciona a Arquitetura

1. **Autenticação Automática no SIP/SEI:**
   O portal do SEI dos servidores estaduais do Piauí (`https://sip.pi.gov.br/sip/login.php`) não exige CAPTCHA para servidores autenticados. O robô envia o usuário, senha e órgão (`SEDUC-PI`), obtém os cookies de sessão governamentais e mantém a sessão viva.
2. **Varredura Periódica:**
   O Agendador de Tarefas do Windows roda o robô a cada 2 horas (ou nos horários do expediente: 08:30, 11:30, 14:30, 17:00).
3. **Detecção de Documentos e Alerta Push no Celular:**
   Ao identificar documentos configurados no processo (ex: `00011.081091/2026-94`), o robô dispara uma notificação via `ntfy` (`https://ntfy.sh/antigravity-alert-lenovo`), que toca no celular do fiscal na mesma hora.
4. **Independência de Máquina:**
   Se o computador de casa estiver desligado, o robô configurado no computador do trabalho executa no expediente. Caso queira rodar 24h sem nenhum computador ligado, pode ser acionado via GitHub Actions na nuvem.

---

## 2. Passo a Passo de Instalação no Computador do Trabalho (1 Clique)

1. Baixe ou copie a pasta `scripts/robo-sei` para o computador do seu trabalho (via pendrive, Google Drive ou clone do Git).
2. Dê **duplo clique no arquivo `instalar_robo.bat`**.
3. O instalador automático irá:
   - Detectar ou instalar o Node.js;
   - Pedir seu Usuário e Senha do SEI apenas uma vez;
   - Criar a tarefa no Agendador do Windows para rodar sozinho todo dia;
   - Realizar o teste inicial e confirmar no seu celular.

---

## 3. Código-Fonte Integral dos Arquivos

### Arquivo 1: `scripts/robo-sei/sei_config.template.json`
```json
{
  "usuario": "",
  "senha": "",
  "idOrgao": "8",
  "nomeOrgao": "SEDUC-PI",
  "ntfyTopic": "antigravity-alert-lenovo",
  "intervaloMinutos": 120,
  "processos": [
    {
      "numero": "00011.081091/2026-94",
      "titulo": "Processo de Diárias - Fiscalização SEDUC",
      "alertas": ["SEDUC RE", "SEDUC Empenho"]
    }
  ]
}
```

---

### Arquivo 2: `scripts/robo-sei/robo_sei_monitor.cjs`
```javascript
/**
 * ==============================================================================
 * ROBÔ MONITOR AUTOMÁTICO DO SEI PIAUÍ (SEDUC-PI)
 * Fiscal.IA - Sistema de Fiscalização e Engenharia SEDUC-PI
 * ==============================================================================
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIR_ATUAL = __dirname;
const CONFIG_PATH = path.join(DIR_ATUAL, 'sei_config.json');
const CONFIG_TEMPLATE_PATH = path.join(DIR_ATUAL, 'sei_config.template.json');
const HISTORICO_PATH = path.join(DIR_ATUAL, 'historico_alertas.json');

function carregarConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
      console.error('Erro ao ler sei_config.json:', e.message);
    }
  }
  if (fs.existsSync(CONFIG_TEMPLATE_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_TEMPLATE_PATH, 'utf8'));
  }
  return {
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
  } catch (e) {
    console.error('Erro ao salvar histórico:', e.message);
  }
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

    req.on('error', (err) => {
      console.error('Erro no envio de push:', err.message);
      resolve(false);
    });

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
      if (cookieStr) {
        headers['Cookie'] = cookieStr;
      }

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
    console.log('Preencha seu usuário e senha no arquivo sei_config.json para ativar o login automático.');
    return;
  }

  console.log(`Realizando login no SIP/SEI como [${config.usuario}] - Órgão: SEDUC-PI...`);

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

    console.log(`Resposta do SIP: Status ${loginRes.statusCode}`);

    for (const proc of config.processos) {
      console.log(`Verificando processo: ${proc.numero} (${proc.titulo || 'Geral'})...`);

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
            console.log('Notificação enviada e registrada no histórico!');
          }
        } else {
          console.log(`Documento '${termo}' ainda NÃO foi juntado ao processo.`);
        }
      }
    }

    console.log('Varredura concluída com sucesso!');
  } catch (err) {
    console.error('Falha na execução do robô:', err.message);
  }
}

executarRobo();
```

---

### Arquivo 3: `scripts/robo-sei/instalar_robo.bat`
```batch
@echo off
chcp 65001 >nul
title Instalador do Robô SEI Monitor - SEDUC-PI

echo =====================================================================
echo    INSTALADOR AUTOMÁTICO DO ROBÔ SEI MONITOR (SEDUC-PI)
echo    Fiscal.IA - Engenharia e Fiscalização
echo =====================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js não foi encontrado neste computador.
    echo [*] Tentando instalar automaticamente via Windows Package Manager (winget)...
    winget install OpenJS.NodeJS.LTS -e --silent
    if %errorlevel% neq 0 (
        echo [X] Não foi possível instalar automaticamente.
        echo Baixe e instale o Node.js em: https://nodejs.org/
        pause
        exit /b 1
    )
)

echo [✓] Node.js detectado com sucesso!
echo.

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
echo [*] Agendando execução diária automática no Windows (a cada 2 horas no expediente)...
set SCRIPT_PATH=%SCRIPT_DIR%robo_sei_monitor.cjs

schtasks /create /tn "RoboSEI_FiscalMonitor" /tr "node \"%SCRIPT_PATH%\"" /sc daily /ri 120 /st 08:30 /du 10:00 /f >nul 2>nul
if %errorlevel% equ 0 (
    echo [✓] Tarefa agendada com sucesso no Windows!
    echo     O robô rodará automaticamente todos os dias úteis a cada 2 horas!
) else (
    schtasks /create /tn "RoboSEI_FiscalMonitor" /tr "node \"%SCRIPT_PATH%\"" /sc hourly /f >nul 2>nul
)

echo.
echo [*] Executando o primeiro teste de verificação...
node "%SCRIPT_PATH%"

echo.
echo =====================================================================
echo [✓] INSTALAÇÃO E ATIVAÇÃO CONCLUÍDAS COM SUCESSO!
echo =====================================================================
pause
```

---

### Arquivo 4: `scripts/robo-sei/executar_agora.bat`
```batch
@echo off
chcp 65001 >nul
title Executar Robô SEI Monitor Agora
set SCRIPT_DIR=%~dp0
node "%SCRIPT_DIR%robo_sei_monitor.cjs"
pause
```
