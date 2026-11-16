import { Escola, OrdemServico } from '../types';
import { storage } from './storageService';

export const SEDUC_SHEET_ID = '1SHZdGIlPEgu_M9U0IRak9hyGbc7lsZLXuhNz7pJfNdc';
export const SEDUC_INEP_GID = '89902018';
export const SEDUC_ATA_GID = '671056752';

/**
 * Converte qualquer URL de Google Sheets em endpoints diretos com suporte a CORS (GViz)
 */
export function getGoogleSheetAlternativeUrls(rawUrl: string, defaultGid = SEDUC_ATA_GID): string[] {
  if (!rawUrl || !rawUrl.trim()) {
    return [
      `https://docs.google.com/spreadsheets/d/${SEDUC_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${defaultGid}`,
      `https://docs.google.com/spreadsheets/d/${SEDUC_SHEET_ID}/export?format=csv&gid=${defaultGid}`
    ];
  }

  const trimmed = rawUrl.trim();
  const idMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const sheetId = idMatch ? idMatch[1] : SEDUC_SHEET_ID;

  const gidMatch = trimmed.match(/[?&]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : defaultGid;

  const ts = Date.now();
  return [
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}&_t=${ts}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}&_t=${ts}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv&gid=${gid}&_t=${ts}`
  ];
}

export function getInepCsvExportUrl(): string {
  const ts = Date.now();
  return `https://docs.google.com/spreadsheets/d/${SEDUC_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SEDUC_INEP_GID}&_t=${ts}`;
}

export function getAtaCsvExportUrl(customUrl?: string): string {
  const urls = getGoogleSheetAlternativeUrls(customUrl || storage.getPlanilhaAtaUrl(), SEDUC_ATA_GID);
  return urls[0];
}

/**
 * Parser CSV compatível com RFC 4180 (suporta quebras de linha dentro de aspas).
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field.trim());
        field = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }
  return rows;
}

/**
 * Normaliza o cabeçalho para comparação flexível (remove acentos, espaços extras, minúsculas)
 */
function normalizeHeader(val: string): string {
  return (val || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-\/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mapeia o texto da GRE para o identificador padronizado 'gre-01'..'gre-21'.
 */
function extractGreId(greText: string, municipio: string): string {
  if (!greText) {
    if (municipio && municipio.toUpperCase().includes('JARDIM DO MULATO')) {
      return 'gre-06';
    }
    return '';
  }
  const match = greText.match(/^(\d{1,2})/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 21) {
      return `gre-${String(num).padStart(2, '0')}`;
    }
  }
  const matchAny = greText.match(/(\d{1,2})/);
  if (matchAny) {
    const num = parseInt(matchAny[1], 10);
    if (num >= 1 && num <= 21) {
      return `gre-${String(num).padStart(2, '0')}`;
    }
  }
  return '';
}

/**
 * Converte o CSV da aba DADOS INEP filtrando apenas unidades com Coluna F === "EM USO".
 */
export function parseInepCsvToSchools(csvText: string): Escola[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const schools: Escola[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const sitImovel = (r[5] || '').toUpperCase().trim();
    if (sitImovel !== 'EM USO') continue;

    const inep = (r[0] || '').trim();
    const sitEduc = (r[1] || '').trim();
    const greRaw = (r[8] || '').trim();
    const municipio = (r[9] || '').trim();
    const nome = (r[10] || '').trim();
    const plusCode = (r[20] || '').trim();
    const bairro = (r[24] || '').trim();
    const endereco = (r[25] || '').trim();

    const greId = extractGreId(greRaw, municipio);
    if (!greId || !nome) continue;

    schools.push({
      id: inep ? `inep-${inep}` : `seduc-row-${i}`,
      inep: inep || 'S/ INEP',
      greId,
      nome,
      municipio,
      endereco: endereco || (bairro ? `${bairro}, ${municipio}` : municipio),
      coordenadas: plusCode || undefined,
      situacaoImovel: 'EM USO',
      situacaoEducacional: sitEduc,
      statusConservacao: 'regular',
      dataUltimaVistoria: 'Sem vistoria',
      diasSemVisita: 0,
      demandasUrgentesCount: 0,
      temOsAtiva: false
    });
  }

  schools.sort((a, b) => {
    if (a.greId !== b.greId) return a.greId.localeCompare(b.greId);
    const m = a.municipio.localeCompare(b.municipio, 'pt-BR');
    if (m !== 0) return m;
    return a.nome.localeCompare(b.nome, 'pt-BR');
  });

  return schools;
}

/**
 * Converte o CSV da aba de Ata de Manutenção para objetos OrdemServico filtrando apenas as obras ativas/em execução.
 */
export function parseAtaCsvToOS(csvText: string, currentSchools: Escola[]): {
  ordensServico: OrdemServico[];
  novasEscolas: Escola[];
} {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return { ordensServico: [], novasEscolas: [] };

  const headerRow = rows[0] || [];
  let colGre = -1;
  let colInep = -1;
  let colEscola = -1;
  let colMunicipio = -1;
  let colValor = -1;
  let colOrdemServico = -1;
  let colDataOS = -1;
  let colContrato = -1;
  let colFiscal = -1;
  let colConstrutora = -1;
  let colInicio = -1;
  let colTermino = -1;
  let colStatus = -1;
  let colStatusDiario = -1;
  let colPercentual = -1;
  let colDescritivo = -1;
  let colPdf = -1;

  headerRow.forEach((val, idx) => {
    const norm = normalizeHeader(val);
    if (colGre === -1 && (norm === 'gre' || norm.includes('codigo gre') || norm.startsWith('gre'))) colGre = idx;
    if (colInep === -1 && norm.includes('inep')) colInep = idx;
    if (colEscola === -1 && (norm.includes('nome entidade') || norm.includes('escola') || norm.includes('unidade'))) colEscola = idx;
    if (colMunicipio === -1 && norm.includes('municipio')) colMunicipio = idx;
    if (colValor === -1 && (norm === 'valor' || (norm.includes('valor') && !norm.includes('medido')))) colValor = idx;
    if (colOrdemServico === -1 && (norm.includes('ordem de servico') || norm === 'os' || norm.includes('o.s'))) colOrdemServico = idx;
    if (colDataOS === -1 && (norm.includes('data da o.s') || norm.includes('data da os') || norm.includes('data os'))) colDataOS = idx;
    if (colContrato === -1 && norm.includes('contrato')) colContrato = idx;
    if (colFiscal === -1 && (norm.includes('fiscal') || norm.includes('orcamentista'))) colFiscal = idx;
    if (colConstrutora === -1 && (norm.includes('construtora') || norm.includes('empresa'))) colConstrutora = idx;
    if (colInicio === -1 && norm.includes('inicio')) colInicio = idx;
    if (colTermino === -1 && (norm.includes('termino') || norm.includes('previsao'))) colTermino = idx;
    if (colStatus === -1 && (norm === 'status' || norm === 'status da obra')) colStatus = idx;
    if (colStatusDiario === -1 && (norm.includes('status diario') || norm.includes('diario'))) colStatusDiario = idx;
    if (colPercentual === -1 && (norm.includes('% executada') || norm.includes('percentual'))) colPercentual = idx;
    if (colDescritivo === -1 && (norm.includes('descritivo') || norm.includes('objeto'))) colDescritivo = idx;
    if (colPdf === -1 && (norm.includes('arquivo pdf') || norm.includes('pdf'))) colPdf = idx;
  });

  // Fallback para índices oficiais da Planilha da Ata SEDUC
  if (colGre === -1) colGre = 4;
  if (colInep === -1) colInep = 5;
  if (colEscola === -1) colEscola = 7;
  if (colMunicipio === -1) colMunicipio = 8;
  if (colValor === -1) colValor = 9;
  if (colOrdemServico === -1) colOrdemServico = 10;
  if (colDataOS === -1) colDataOS = 11;
  if (colContrato === -1) colContrato = 12;
  if (colFiscal === -1) colFiscal = 13;
  if (colConstrutora === -1) colConstrutora = 14;
  if (colInicio === -1) colInicio = 15;
  if (colTermino === -1) colTermino = 16;
  if (colStatus === -1) colStatus = 17; // Coluna R (Status Geral)
  if (colStatusDiario === -1) colStatusDiario = 18; // Coluna S (Status Diário)
  if (colPercentual === -1) colPercentual = 19;
  if (colDescritivo === -1) colDescritivo = 24;
  if (colPdf === -1) colPdf = 26;

  const schoolByInep = new Map<string, Escola>();
  const schoolByNome = new Map<string, Escola>();

  currentSchools.forEach((s) => {
    if (s.inep && s.inep !== 'S/ INEP') schoolByInep.set(s.inep.trim(), s);
    schoolByNome.set(normalizeHeader(s.nome), s);
  });

  const osList: OrdemServico[] = [];
  const novasEscolas: Escola[] = [];
  const driveBaseFolder = storage.getDriveObrasUrl();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!Array.isArray(r) || r.length === 0) continue;

    const rawEscola = (r[colEscola] || '').trim();
    const rawNumeroOS = (r[colOrdemServico] || '').trim();
    const inep = (r[colInep] || '').trim();
    const municipio = (r[colMunicipio] || '').trim();
    const rawGre = (r[colGre] || '').trim();
    const rawStatus = (r[colStatus] || '').toUpperCase().trim();
    const rawStatusDiario = (r[colStatusDiario] || '').trim();

    // Pula linhas vazias ou sem escola/OS
    if (!rawEscola && !rawNumeroOS) continue;
    if (rawEscola.toUpperCase().includes('NOME ENTIDADE')) continue;

    // FILTRO DE OBRAS ATIVAS (SEDUC ATA):
    // Inclui ordens de serviço onde a Coluna R (Status Geral) conste EXECUÇÃO ou A INICIAR
    const isExecucao = rawStatus.includes('EXECU');
    const isAIniciar = rawStatus.includes('INICIAR');

    if (!isExecucao && !isAIniciar) {
      continue;
    }

    // Normaliza status diário e tipoStatus
    const statusDiarioNormalizado = rawStatusDiario || (isAIniciar ? 'A Iniciar' : 'Em andamento');
    const isParada = statusDiarioNormalizado.toLowerCase().includes('parada') || statusDiarioNormalizado.toLowerCase().includes('paralisada');
    const statusObraLabel = isAIniciar ? 'A INICIAR' : 'EM EXECUÇÃO';

    // Localiza ou cria a Escola
    const greId = extractGreId(rawGre, municipio) || 'gre-01';
    let matchedSchool = inep ? schoolByInep.get(inep) : undefined;
    if (!matchedSchool) {
      matchedSchool = schoolByNome.get(normalizeHeader(rawEscola));
    }

    let escolaId = '';
    let escolaNome = rawEscola;

    if (matchedSchool) {
      escolaId = matchedSchool.id;
      escolaNome = matchedSchool.nome;
    } else {
      // Cria a escola se ainda não existir na base local
      escolaId = inep ? `inep-${inep}` : `escola-ata-${i}`;
      const nova: Escola = {
        id: escolaId,
        inep: inep || 'S/ INEP',
        greId,
        nome: rawEscola,
        municipio: municipio || 'PIAUÍ',
        endereco: municipio || 'PIAUÍ',
        statusConservacao: 'regular',
        dataUltimaVistoria: 'Sem vistoria',
        diasSemVisita: 0,
        demandasUrgentesCount: 0,
        temOsAtiva: true
      };
      novasEscolas.push(nova);
      schoolByInep.set(inep, nova);
      schoolByNome.set(normalizeHeader(rawEscola), nova);
    }

    // Valor da OS
    const valorClean = (r[colValor] || '').replace(/[^\d,\.-]/g, '').replace(/\./g, '').replace(',', '.');
    const valor = parseFloat(valorClean) || 0;

    // Percentual medido
    let percentual = 0;
    if (r[colPercentual]) {
      const num = parseFloat(r[colPercentual].replace(/[^\d\.]/g, ''));
      if (!isNaN(num)) percentual = Math.min(100, Math.max(0, num));
    } else if (statusObraLabel === 'EM EXECUÇÃO') {
      percentual = 35;
    }

    const construtora = (r[colConstrutora] || '').trim() || 'Empresa Contratada SEDUC';
    const contratoNumero = (r[colContrato] || '').trim();
    const dataEmissaoOS = (r[colDataOS] || '').trim();
    const dataInicio = (r[colInicio] || '').trim() || dataEmissaoOS || '2025-01-01';
    const prazoFinal = (r[colTermino] || '').trim() || '2026-12-31';
    const objeto = (r[colDescritivo] || '').trim() || 'Serviços de Manutenção Predial, Reformas e Adequações';
    const fiscal = (r[colFiscal] || '').trim() || 'Fiscal SEDUC';
    const arquivoPdfGerado = (r[colPdf] || '').trim();

    // Link do Drive / PDF
    let osPdfUrl: string | undefined = undefined;
    let orcamentoPdfUrl: string | undefined = undefined;

    if (arquivoPdfGerado) {
      if (arquivoPdfGerado.startsWith('http')) {
        osPdfUrl = arquivoPdfGerado;
      } else {
        osPdfUrl = `${driveBaseFolder}`;
      }
    } else if (driveBaseFolder) {
      osPdfUrl = driveBaseFolder;
      orcamentoPdfUrl = driveBaseFolder;
    }

    const cleanOsId = rawNumeroOS ? rawNumeroOS.replace(/[^0-9a-zA-Z]/g, '_') : `row_${i}`;

    osList.push({
      id: `os-ata-${inep || 'noinep'}-${cleanOsId}`,
      numeroOS: rawNumeroOS || `OS-${i}/SEDUC`,
      escolaId,
      escolaNome,
      greId,
      municipio: municipio || 'PIAUÍ',
      objeto,
      valorOrcamento: valor,
      percentualMedicao: percentual,
      dataInicio,
      prazoFinal,
      status: 'ativa',
      tipoStatus: isParada ? 'paralisada' : isAIniciar ? 'aguardando' : 'em_execucao',
      statusObra: statusObraLabel,
      statusDiario: statusDiarioNormalizado,
      contratoNumero,
      dataEmissaoOS,
      fiscalResponsavel: fiscal,
      arquivoPdfGerado,
      osPdfUrl,
      orcamentoPdfUrl,
      empresaContratada: construtora,
      orcamentoPdfSimulado: `orcamento_${inep || cleanOsId}.pdf`,
      memorialDescritivoPdfSimulado: `memorial_${inep || cleanOsId}.pdf`,
      observacoes: [
        {
          id: `obs-ata-${i}`,
          data: dataEmissaoOS || new Date().toLocaleDateString('pt-BR'),
          texto: `Ordem de Serviço ${rawNumeroOS} com status diário [${statusDiarioNormalizado}] e valor ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Contrato ${contratoNumero || 'S/N'}.`,
          autor: fiscal
        }
      ]
    });
  }

  return { ordensServico: osList, novasEscolas };
}

/**
 * Busca e sincroniza as Ordens de Serviço da Ata de Manutenção diretamente do Google Sheets.
 */
export async function syncAtaFromGoogleSheets(schools: Escola[], customUrl?: string): Promise<{
  ordensServico: OrdemServico[];
  novasEscolas: Escola[];
}> {
  const urlCandidate = customUrl || storage.getPlanilhaAtaUrl();
  const urls = getGoogleSheetAlternativeUrls(urlCandidate, SEDUC_ATA_GID);

  let csvText = '';
  let lastError: any = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        csvText = await response.text();
        if (csvText && csvText.length > 50) {
          break;
        }
      }
    } catch (e) {
      lastError = e;
    }
  }

  if (!csvText) {
    throw new Error(`Falha ao acessar a planilha da Ata (${lastError?.message || 'Erro de conexão/CORS'}). Verifique o link informado.`);
  }

  const result = parseAtaCsvToOS(csvText, schools);
  if (result.ordensServico.length === 0) {
    throw new Error('Nenhuma ordem de serviço em execução/ativa encontrada na planilha da Ata.');
  }

  return result;
}

/**
 * Busca e sincroniza as escolas do INEP diretamente do Google Sheets.
 */
export async function syncInepFromGoogleSheets(): Promise<Escola[]> {
  const url = getInepCsvExportUrl();
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Falha ao acessar dados do INEP (${response.status})`);
  }
  const csvText = await response.text();
  return parseInepCsvToSchools(csvText);
}
