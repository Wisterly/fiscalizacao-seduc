import { Escola, OrdemServico } from '../types';
import { storage } from './storageService';
import driveArquivosIndex from '../data/driveArquivosIndex.json';

export interface DriveFileItem {
  inep?: string;
  escola?: string;
  municipio?: string;
  greKey?: string;
  fileName: string;
  fileId: string;
  driveUrl: string;
}

export interface ResultadoVarreduraOS {
  totalEscolasVarredas: number;
  totalOSsAtivas: number;
  totalAnexosVinculados: number;
  ordensAtualizadas: OrdemServico[];
  detalhes: Array<{
    escolaNome: string;
    greId: string;
    numeroOS: string;
    nomeArquivo: string;
    linkUrl: string;
    tipoVinculo: 'arquivo_direto' | 'pasta_drive';
  }>;
}

class DriveOSScannerService {
  /**
   * Extrai o Folder ID a partir de qualquer formato de link do Google Drive
   */
  extrairFolderId(url: string): string {
    if (!url || !url.trim()) return '';
    const trimmed = url.trim();
    const match = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];

    const idMatch = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) return idMatch[1];

    // Se já for o ID puro
    if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
      return trimmed;
    }
    return '';
  }

  /**
   * Normaliza strings para matching robusto (sem acentos, sem pontuação, minúsculas)
   */
  normalizarTexto(texto: string): string {
    return (texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Gera todas as variantes de um número de OS para busca de arquivos (ex: 2026/794)
   */
  gerarTermosBuscaOS(numeroOS: string): string[] {
    if (!numeroOS) return [];
    const limpo = numeroOS.trim();
    const termos = new Set<string>();

    termos.add(limpo);
    termos.add(limpo.replace(/\//g, '-'));
    termos.add(limpo.replace(/\//g, '_'));
    termos.add(limpo.replace(/\//g, ' '));
    termos.add(limpo.replace(/[^0-9]/g, ''));

    // Captura parte após a barra (ex: de 2026/794 pega 794)
    const matchBarra = limpo.match(/\/(\d+)/);
    if (matchBarra && matchBarra[1]) {
      termos.add(matchBarra[1]);
      termos.add(`os ${matchBarra[1]}`);
      termos.add(`os_${matchBarra[1]}`);
      termos.add(`os-${matchBarra[1]}`);
    }

    // Captura parte antes da barra
    const matchPrefixo = limpo.match(/(\d+)\//);
    if (matchPrefixo && matchPrefixo[1]) {
      termos.add(matchPrefixo[1]);
    }

    return Array.from(termos).filter((t) => t.length >= 2);
  }

  /**
   * Verifica se o nome do arquivo faz match com o número da OS ou com os dados da escola
   */
  matchArquivoComOS(
    arquivo: DriveFileItem,
    numeroOS: string,
    escola: Escola
  ): boolean {
    const nomeNormalizado = this.normalizarTexto(arquivo.fileName);
    const termos = this.gerarTermosBuscaOS(numeroOS);

    // 1. Match forte: número da OS está presente no nome do arquivo
    for (const termo of termos) {
      const termoNorm = this.normalizarTexto(termo);
      if (termoNorm && nomeNormalizado.includes(termoNorm)) {
        return true;
      }
    }

    // 2. Match específico de Ordem de Serviço na pasta da escola pelo INEP
    if (arquivo.inep && escola.inep && arquivo.inep === escola.inep) {
      if (
        nomeNormalizado.includes('ordem') ||
        nomeNormalizado.includes('os') ||
        nomeNormalizado.includes('servico')
      ) {
        return true;
      }
    }

    // 3. Match por nome da escola + termo de ordem de serviço
    if (escola.nome) {
      const escolaNorm = this.normalizarTexto(escola.nome);
      if (nomeNormalizado.includes(escolaNorm) && (nomeNormalizado.includes('os') || nomeNormalizado.includes('ordem'))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Gera o link direto de busca do arquivo da OS dentro do Google Drive
   */
  gerarLinkBuscaDrive(greId?: string, numeroOS?: string): string {
    const targetFolderUrl = storage.getPastaGeralOSDriveUrl();
    const folderId = this.extrairFolderId(targetFolderUrl);
    const termoBusca = (numeroOS || '').replace(/\//g, '-').trim();

    if (folderId && termoBusca) {
      return `https://drive.google.com/drive/folders/${folderId}?q=${encodeURIComponent(termoBusca)}`;
    }
    return targetFolderUrl;
  }

  /**
   * Executa a varredura completa das escolas e ordens de serviço ativas,
   * buscando o número de cada OS dentro da pasta compartilhada do Google Drive
   * e anexando automaticamente o arquivo ao card da respectiva escola.
   */
  async executarVarreduraAutomatica(
    pastaDriveUrl?: string,
    schoolsList?: Escola[],
    ordensList?: OrdemServico[]
  ): Promise<ResultadoVarreduraOS> {
    const targetFolderUrl = pastaDriveUrl || storage.getPastaGeralOSDriveUrl();
    const folderId = this.extrairFolderId(targetFolderUrl);

    const schools = schoolsList || storage.getSchools();
    const ordens = ordensList || storage.getOrdensServico();

    // Index de escolas para consulta rápida por ID e Nome
    const schoolMapById = new Map<string, Escola>();
    const schoolMapByName = new Map<string, Escola>();
    const schoolMapByInep = new Map<string, Escola>();

    schools.forEach((s) => {
      schoolMapById.set(s.id, s);
      schoolMapByName.set(this.normalizarTexto(s.nome), s);
      if (s.inep) schoolMapByInep.set(s.inep, s);
    });

    const acervo: DriveFileItem[] = driveArquivosIndex as DriveFileItem[];
    const detalhes: ResultadoVarreduraOS['detalhes'] = [];
    let totalOSsAtivas = 0;

    const ordensAtualizadas = ordens.map((os) => {
      // Considera ordens de serviço ativas / em execução / a iniciar / paralisadas
      const statusTexto = (os.statusObra || os.status || '').toUpperCase();
      const isAtiva =
        os.status === 'ativa' ||
        statusTexto.includes('EXECUÇÃO') ||
        statusTexto.includes('EXECUCAO') ||
        statusTexto.includes('INICIAR') ||
        statusTexto.includes('PARALISADA') ||
        statusTexto.includes('AGUARDANDO');

      if (!isAtiva) {
        return os;
      }

      totalOSsAtivas++;

      // Identifica a escola vinculada
      const escola =
        schoolMapById.get(os.escolaId) ||
        schoolMapByName.get(this.normalizarTexto(os.escolaNome)) ||
        (os.id.startsWith('os-ata-')
          ? schoolMapByInep.get(os.id.replace('os-ata-', ''))
          : undefined);

      if (!escola) {
        return os;
      }

      // 1. Procura se há arquivo com o número da OS no acervo de PDFs conhecidos
      let arquivoEncontrado: DriveFileItem | undefined = undefined;

      for (const item of acervo) {
        if (this.matchArquivoComOS(item, os.numeroOS, escola)) {
          arquivoEncontrado = item;
          break;
        }
      }

      // Se encontrou arquivo exato com ID no acervo
      if (arquivoEncontrado) {
        const linkDireto = `https://drive.google.com/file/d/${arquivoEncontrado.fileId}/view?usp=sharing`;
        const osAtualizada: OrdemServico = {
          ...os,
          osPdfUrl: linkDireto,
          osPdfNome: arquivoEncontrado.fileName,
          osAnexoAutomatico: true,
          driveFolderOSUrl: targetFolderUrl
        };

        detalhes.push({
          escolaNome: escola.nome,
          greId: escola.greId,
          numeroOS: os.numeroOS,
          nomeArquivo: arquivoEncontrado.fileName,
          linkUrl: linkDireto,
          tipoVinculo: 'arquivo_direto'
        });

        return osAtualizada;
      }

      // 2. Se não encontrou o arquivo exato no cache local, gera o link de busca direta
      // filtrando a pasta compartilhada do Google Drive pelo número da OS
      const termoBuscaPrincipal = os.numeroOS.replace(/\//g, '-');
      const linkBuscaDrive = folderId
        ? `https://drive.google.com/drive/folders/${folderId}?q=${encodeURIComponent(termoBuscaPrincipal)}`
        : targetFolderUrl;

      const nomeArquivoEstimado = `OS_${termoBuscaPrincipal}.pdf`;

      const osAtualizada: OrdemServico = {
        ...os,
        osPdfUrl: linkBuscaDrive,
        osPdfNome: nomeArquivoEstimado,
        osAnexoAutomatico: true,
        driveFolderOSUrl: targetFolderUrl
      };

      detalhes.push({
        escolaNome: escola.nome,
        greId: escola.greId,
        numeroOS: os.numeroOS,
        nomeArquivo: nomeArquivoEstimado,
        linkUrl: linkBuscaDrive,
        tipoVinculo: 'pasta_drive'
      });

      return osAtualizada;
    });

    // Salva as ordens de serviço atualizadas no storage
    storage.syncOrdensServicoFromAta(ordensAtualizadas);

    return {
      totalEscolasVarredas: schools.length,
      totalOSsAtivas,
      totalAnexosVinculados: detalhes.length,
      ordensAtualizadas,
      detalhes
    };
  }
}

export const driveOSScanner = new DriveOSScannerService();
