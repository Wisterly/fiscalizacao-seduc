import { Escola } from '../types';

export const SEDUC_SHEET_ID = '1SHZdGIlPEgu_M9U0IRak9hyGbc7lsZLXuhNz7pJfNdc';
export const SEDUC_INEP_GID = '89902018';

export function getInepCsvExportUrl(): string {
  const ts = Date.now();
  return `https://docs.google.com/spreadsheets/d/${SEDUC_SHEET_ID}/export?format=csv&gid=${SEDUC_INEP_GID}&t=${ts}`;
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
