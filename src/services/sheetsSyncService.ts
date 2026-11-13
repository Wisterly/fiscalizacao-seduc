import { Escola, OrdemServico } from '../types';

export const SEDUC_SHEET_ID = '1SHZdGIlPEgu_M9U0IRak9hyGbc7lsZLXuhNz7pJfNdc';
export const SEDUC_INEP_GID = '89902018';
export const SEDUC_ATA_GID = '671056752';

export function getInepCsvExportUrl(): string {
  const ts = Date.now();
  return `https://docs.google.com/spreadsheets/d/${SEDUC_SHEET_ID}/export?format=csv&gid=${SEDUC_INEP_GID}&t=${ts}`;
}

export function getAtaCsvExportUrl(): string {
  const ts = Date.now();
  return `https://docs.google.com/spreadsheets/d/${SEDUC_SHEET_ID}/export?format=csv&gid=${SEDUC_ATA_GID}&t=${ts}`;
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
 * Mapeia o texto da Coluna I (GRE) para o identificador padronizado 'gre-01'..'gre-21'.
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
    const sitImovel = (r[5] || '').toUpperCase().trim(); // Coluna F - SITUAÇÃO IMÓVEL
    if (sitImovel !== 'EM USO') continue;

    const inep = (r[0] || '').trim();        // Coluna A - INEP
    const sitEduc = (r[1] || '').trim();     // Coluna B - SITUAÇÃO EDUCACIONAL
    const greRaw = (r[8] || '').trim();      // Coluna I - GRE
    const municipio = (r[9] || '').trim();   // Coluna J - MUNICIPIO
    const nome = (r[10] || '').trim();       // Coluna K - NOME ENTIDADE
    const plusCode = (r[20] || '').trim();   // Coluna U - google PlusCode
    const bairro = (r[24] || '').trim();     // Coluna Y - BAIRROS
    const endereco = (r[25] || '').trim();   // Coluna Z - ENDEREÇOS

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

  const seenIds = new Map<string, number>();
  for (const s of schools) {
    const count = seenIds.get(s.id) || 0;
    if (count > 0) {
      seenIds.set(s.id, count + 1);
      s.id = `${s.id}-anexo-${count}`;
    } else {
      seenIds.set(s.id, 1);
    }
  }

  return schools;
}

/**
 * Busca e atualiza as escolas EM USO diretamente da planilha oficial no Google Sheets.
 */
export async function syncInepFromGoogleSheets(): Promise<Escola[]> {
  const url = getInepCsvExportUrl();
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Falha ao acessar planilha (${response.status})`);
  }
  const csvText = await response.text();
  const parsed = parseInepCsvToSchools(csvText);
  if (parsed.length === 0) {
    throw new Error('Nenhuma escola com situação "EM USO" encontrada na resposta.');
  }
  return parsed;
}

/**
 * Converte o CSV da aba de Ata de Manutenção para objetos OrdemServico.
 */
export function parseAtaCsvToOS(csvText: string, schools: Escola[]): OrdemServico[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const schoolByInep = new Map<string, Escola>();
  schools.forEach((s) => {
    if (s.inep) schoolByInep.set(s.inep, s);
    schoolByInep.set(s.id, s);
  });

  const osList: OrdemServico[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const inep = r[5] ? r[5].trim() : '';
    const numeroOS = r[10] ? r[10].trim() : '';
    const rawEscolaNome = r[7] ? r[7].trim() : '';

    if (!inep && !numeroOS && !rawEscolaNome) continue;

    const matchedSchool = schoolByInep.get(inep);
    const escolaId = matchedSchool ? matchedSchool.id : (inep ? `inep-${inep}` : `manual-os-${i}`);
    const escolaNome = matchedSchool ? matchedSchool.nome : (rawEscolaNome || 'Escola SEDUC');
    const greId = matchedSchool ? matchedSchool.greId : extractGreId(r[4] || '', r[8] || '');
    const municipio = matchedSchool ? matchedSchool.municipio : (r[8] ? r[8].trim() : 'PIAUÍ');

    const rawStatus = (r[17] || '').toUpperCase();
    let status: 'ativa' | 'historico' | 'aguardando' = 'ativa';
    if (rawStatus === 'CONCLUÍDA' || rawStatus.includes('FINALIZADA') || rawStatus === 'CANCELADA') {
      status = 'historico';
    } else if (rawStatus === 'EXECUÇÃO' || rawStatus === 'A INICIAR' || rawStatus === 'AGUARDANDO SALDO') {
      status = 'ativa';
    }

    const valorClean = (r[9] || '').replace(/[^\d,\.-]/g, '').replace(/\./g, '').replace(',', '.');
    const valor = parseFloat(valorClean) || 0;

    let percentual = 0;
    if (r[19]) {
      const num = parseFloat(r[19].replace(/[^\d\.]/g, ''));
      if (!isNaN(num)) percentual = Math.min(100, Math.max(0, num));
    } else if (rawStatus === 'CONCLUÍDA') {
      percentual = 100;
    } else if (rawStatus === 'EXECUÇÃO') {
      percentual = 50;
    }

    const objeto = r[24] && r[24].length > 3 ? r[24].trim() : 'Serviços de Manutenção Predial e Reparos Estruturais';
    const construtora = r[14] ? r[14].trim() : 'Empresa Contratada SEDUC';
    const fiscal = r[13] ? r[13].trim() : 'Fiscal GPR';
    const obs = r[21] ? r[21].trim() : '';

    const observacoes = obs
      ? [
          {
            id: `obs-csv-${i}`,
            data: r[20] || r[11] || new Date().toLocaleDateString('pt-BR'),
            texto: obs,
            autor: fiscal
          }
        ]
      : [];

    osList.push({
      id: `os-ata-${r[0] || i}`,
      numeroOS: numeroOS || `OS-${r[0] || i}/SEDUC`,
      escolaId,
      escolaNome,
      greId: greId || 'gre-01',
      municipio,
      objeto,
      valorOrcamento: valor,
      percentualMedicao: percentual,
      dataInicio: r[15] || r[11] || '2025-01-01',
      prazoFinal: r[16] || '2026-12-31',
      status,
      empresaContratada: construtora,
      orcamentoPdfSimulado: `orcamento_${inep || i}.pdf`,
      memorialDescritivoPdfSimulado: `memorial_${inep || i}.pdf`,
      osPdfUrl: r[26] ? r[26].trim() : undefined,
      observacoes
    });
  }

  return osList;
}

/**
 * Busca e sincroniza as Ordens de Serviço da Ata de Manutenção diretamente do Google Sheets.
 */
export async function syncAtaFromGoogleSheets(schools: Escola[]): Promise<OrdemServico[]> {
  const url = getAtaCsvExportUrl();
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Falha ao acessar planilha de Ata de Manutenção (${response.status})`);
  }
  const csvText = await response.text();
  const parsed = parseAtaCsvToOS(csvText, schools);
  if (parsed.length === 0) {
    throw new Error('Nenhuma ordem de serviço válida encontrada na planilha.');
  }
  return parsed;
}
