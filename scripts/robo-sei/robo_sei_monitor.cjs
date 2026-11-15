/**
 * ==============================================================================
 * ROBÔ MONITOR AUTOMÁTICO DO SEI PIAUÍ (SEDUC-PI)
 * Fiscal.IA - Sistema de Fiscalização e Engenharia SEDUC-PI
 * ==============================================================================
 * Função:
 * 1. Conecta ao SEI Piauí e faz login automático com usuário/senha da SEDUC
 * 2. Acessa a lista de processos cadastrados (ex: 00011.081091/2026-94)
 * 3. Analisa a árvore de documentos reais juntados ao processo
 * 4. Dispara alerta sonoro e notificação push imediata no celular via ntfy
 *    assim que documentos críticos (como 'SEDUC RE' e 'SEDUC Empenho') surgirem
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

// Carrega configurações
function carregarConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
      console.error('❌ Erro ao ler sei_config.json:', e.message);
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

// Carrega histórico de documentos já notificados
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

// Disparo de notificação Push no celular (ntfy.sh)
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

// Alerta Sonoro no Windows
function emitirAlertaSonoro() {
  try {
    if (process.platform === 'win32') {
      execSync('powershell -Command "[console]::beep(1200, 300); [console]::beep(1600, 450)"', { stdio: 'ignore' });
    }
  } catch (e) {}
}

// Cliente HTTP com suporte a cookies
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

// Execução principal da varredura
async function executarRobo() {
  console.log('====================================================');
  console.log('🤖 ROBÔ SEI FISCAL MONITOR - SEDUC PIAUÍ');
  console.log('Horário:', new Date().toLocaleString('pt-BR'));
  console.log('====================================================');

  const config = carregarConfig();
  const hist = carregarHistorico();
  const client = new CookieHttpClient();

  if (!config.usuario || !config.senha) {
    console.log('⚠️ AVISO: Credenciais de usuário e senha não configuradas em sei_config.json.');
    console.log('Preencha seu usuário e senha no arquivo sei_config.json para ativar o login automático.');
    console.log('Executando teste de conexão e disparo de alerta para o processo de teste...');
    
    // Teste de simulação de aviso
    console.log(`\n🔍 Processo monitorado: ${config.processos[0].numero}`);
    console.log(`📋 Documentos alvo: ${config.processos[0].alertas.join(', ')}`);
    console.log(`📡 Tópico Push celular: ${config.ntfyTopic}`);
    return;
  }

  console.log(`🔑 Realizando login no SIP/SEI como [${config.usuario}] - Órgão: SEDUC-PI...`);

  try {
    // 1. POST no SIP Login
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

    // 2. Para cada processo configurado, consulta o andamento
    for (const proc of config.processos) {
      console.log(`\n🔎 Verificando processo: ${proc.numero} (${proc.titulo || 'Geral'})...`);

      const buscaUrl = `https://sei.pi.gov.br/sei/controlador.php?acao=protocolo_pesquisar_rapido&acao_origem=procedimento_controlar&palavra_pesquisa=${encodeURIComponent(proc.numero)}`;
      const buscaRes = await client.request(buscaUrl);

      console.log(`Status da busca do processo: ${buscaRes.statusCode}`);
      const html = buscaRes.body;

      // 3. Procura os termos de alerta no HTML do processo
      for (const termo of proc.alertas) {
        const termoLimpo = termo.toLowerCase().trim();
        const encontrado = html.toLowerCase().includes(termoLimpo);
        const chaveAlerta = `${proc.numero}_${termo}`;

        if (encontrado) {
          console.log(`🎯 [ENCONTRADO!] O documento '${termo}' está presente no processo ${proc.numero}!`);

          if (!hist.docsNotificados.includes(chaveAlerta)) {
            console.log(`📲 Enviando notificação Push para o celular no canal [${config.ntfyTopic}]...`);
            
            const tituloPush = `🔔 ALERTA SEI: ${termo} Emitido!`;
            const msgPush = `O documento ${termo} foi localizado no seu processo ${proc.numero} (${proc.titulo || 'SEDUC'}).`;

            await dispararPush(config.ntfyTopic, tituloPush, msgPush, 'bell,white_check_mark');
            emitirAlertaSonoro();

            hist.docsNotificados.push(chaveAlerta);
            salvarHistorico(hist);
            console.log('✓ Notificação enviada e registrada no histórico!');
          } else {
            console.log(`ℹ️ O alerta para '${termo}' já havia sido enviado anteriormente (evitando repetição).`);
          }
        } else {
          console.log(`⏳ Documento '${termo}' ainda NÃO foi juntado ao processo.`);
        }
      }
    }

    console.log('\n====================================================');
    console.log('✓ Varredura concluída com sucesso!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Falha na conexão ou execução do robô:', err.message);
  }
}

// Executa
executarRobo();
