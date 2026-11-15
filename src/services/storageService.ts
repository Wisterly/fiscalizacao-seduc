import {
  GRE,
  Escola,
  Ambiente,
  OrdemServico,
  Demanda,
  AlertaUrgente,
  RotaVistoria,
  TarefaDoDia,
  Levantamento,
  FotoLevantamento,
  ProcessoAcompanhamento,
  CategoriaProcessoCard,
  DocumentoProcessoSEI
} from '../types';
import {
  INITIAL_GRES,
  INITIAL_SCHOOLS,
  INITIAL_AMBIENTES,
  INITIAL_OS,
  INITIAL_ALERTAS,
  INITIAL_DEMANDAS,
  INITIAL_TAREFAS,
  INITIAL_LEVANTAMENTOS,
  INITIAL_ROTAS
} from '../data/seedData';

const STORAGE_KEYS = {
  GRES: 'seduc_fiscal_gres_v4',
  SCHOOLS: 'seduc_fiscal_schools_inep_v7',
  AMBIENTES: 'seduc_fiscal_ambientes_v1',
  OS: 'seduc_fiscal_os_v3',
  ALERTAS: 'seduc_fiscal_alertas_v3',
  DEMANDAS: 'seduc_fiscal_demandas_v3',
  TAREFAS: 'seduc_fiscal_tarefas_v3',
  LEVANTAMENTOS: 'seduc_fiscal_levantamentos_v3',
  ROTAS: 'seduc_fiscal_rotas_v3',
  PROCESSOS: 'seduc_fiscal_processos_v2',
  CATEGORIAS_PROCESSO: 'seduc_fiscal_categorias_processo_v2',
  CARD_ORDER: 'seduc_fiscal_home_cards_order_v1',
  LAST_SYNC: 'seduc_fiscal_last_sync_v1',
  PLANILHA_ATA_URL: 'seduc_fiscal_planilha_ata_url_v1',
  DRIVE_OBRAS_URL: 'seduc_fiscal_drive_obras_url_v1',
  PASTA_GERAL_OS_DRIVE_URL: 'seduc_fiscal_pasta_geral_os_drive_url_v1'
};

export const DEFAULT_PLANILHA_ATA_URL =
  'https://docs.google.com/spreadsheets/d/1SHZdGIlPEgu_M9U0IRak9hyGbc7lsZLXuhNz7pJfNdc/edit?gid=671056752#gid=671056752';

export const DEFAULT_DRIVE_OBRAS_URL =
  'https://drive.google.com/drive/folders/1yBJ5EFkqekhkY0-_Yit0K05qGoGBE8je?usp=drive_link';

export const DEFAULT_PASTA_GERAL_OS_DRIVE_URL =
  'https://drive.google.com/drive/folders/1yBJ5EFkqekhkY0-_Yit0K05qGoGBE8je?usp=drive_link';

class StorageService {
  constructor() {
    this.migrarELimparExemplos();
  }

  /**
   * Remove chaves legadas contendo dados de exemplo e inicializa o app 100% limpo
   */
  private migrarELimparExemplos(): void {
    try {
      const chavesAntigas = [
        'seduc_fiscal_os_v1',
        'seduc_fiscal_os_v2',
        'seduc_fiscal_alertas_v1',
        'seduc_fiscal_alertas_v2',
        'seduc_fiscal_demandas_v1',
        'seduc_fiscal_demandas_v2',
        'seduc_fiscal_tarefas_v1',
        'seduc_fiscal_tarefas_v2',
        'seduc_fiscal_levantamentos_v1',
        'seduc_fiscal_levantamentos_v2',
        'seduc_fiscal_rotas_v1',
        'seduc_fiscal_rotas_v2',
        'seduc_fiscal_processos_v1',
        'seduc_fiscal_schools_inep_v5',
        'seduc_fiscal_schools_inep_v6'
      ];
      chavesAntigas.forEach(k => {
        if (localStorage.getItem(k) !== null) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {
      console.warn('Erro ao limpar dados de exemplo legados:', e);
    }
  }
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Erro ao ler ${key} do localStorage:`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.error(`Erro ao salvar ${key} no localStorage:`, e);
    }
  }

  // --- GREs ---
  getGREs(): GRE[] {
    return this.getItem<GRE[]>(STORAGE_KEYS.GRES, INITIAL_GRES);
  }

  toggleFavoriteGRE(greId: string): GRE[] {
    const list = this.getGREs();
    const updated = list.map(g => g.id === greId ? { ...g, isFavorite: !g.isFavorite } : g);
    this.setItem(STORAGE_KEYS.GRES, updated);
    return updated;
  }

  // --- Escolas ---
  getSchools(): Escola[] {
    const saved = this.getItem<Escola[]>(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
    
    // Mapeamento dos dados oficiais do seed / geodata
    const seedMap = new Map<string, Escola>();
    INITIAL_SCHOOLS.forEach(s => {
      seedMap.set(s.id, s);
      if (s.inep) seedMap.set(s.inep, s);
    });

    let changed = false;
    const enriched = saved.map(s => {
      const seed = seedMap.get(s.id) || (s.inep ? seedMap.get(s.inep) : undefined);
      if (!seed) return s;

      let schoolChanged = false;
      const updated = { ...s };

      // Se o seed tem linkMaps e a escola salva não tem (ou é diferente), atualiza
      if (seed.linkMaps && (!updated.linkMaps || updated.linkMaps !== seed.linkMaps)) {
        updated.linkMaps = seed.linkMaps;
        schoolChanged = true;
      }

      // Se o seed tem coordenadas oficiais atualizadas pelo PDF/configuração
      if (seed.coordenadas && (!updated.coordenadas || (!updated.isManual && updated.coordenadas !== seed.coordenadas))) {
        updated.coordenadas = seed.coordenadas;
        schoolChanged = true;
      }

      // Se o endereço oficial foi enriquecido
      if (seed.endereco && (!updated.endereco || updated.endereco === updated.municipio)) {
        updated.endereco = seed.endereco;
        schoolChanged = true;
      }

      if (schoolChanged) {
        changed = true;
        return updated;
      }
      return s;
    });

    if (changed) {
      this.setItem(STORAGE_KEYS.SCHOOLS, enriched);
    }
    return enriched;
  }

  getSchoolById(id: string): Escola | undefined {
    return this.getSchools().find(s => s.id === id);
  }

  updateSchool(school: Escola): Escola[] {
    const list = this.getSchools();
    const updated = list.map(s => s.id === school.id ? school : s);
    this.setItem(STORAGE_KEYS.SCHOOLS, updated);
    return updated;
  }

  /**
   * Adiciona manualmente uma nova escola dentro de uma GRE específica.
   */
  addSchool(newSchool: Omit<Escola, 'id'>): Escola[] {
    const list = this.getSchools();
    const created: Escola = {
      ...newSchool,
      id: `manual-${Date.now()}`,
      isManual: true
    };
    const updated = [created, ...list];
    this.setItem(STORAGE_KEYS.SCHOOLS, updated);
    return updated;
  }

  addEscola(escola: Escola): Escola[] {
    const list = this.getSchools();
    const exists = list.some(s => s.id === escola.id || (escola.inep && s.inep === escola.inep));
    if (exists) return list;
    const updated = [escola, ...list];
    this.setItem(STORAGE_KEYS.SCHOOLS, updated);
    return updated;
  }

  /**
   * Sincroniza escolas importadas da planilha INEP preservando escolas manuais e status locais.
   */
  syncSchoolsFromInep(imported: Escola[]): Escola[] {
    const current = this.getSchools();
    const manuals = current.filter(s => s.isManual);
    const currentMap = new Map(current.map(s => [s.id, s]));

    const mergedImported = imported.map(item => {
      const existing = currentMap.get(item.id);
      if (existing) {
        return {
          ...item,
          diretora: existing.diretora,
          telefone: existing.telefone,
          observacoesGerais: existing.observacoesGerais,
          linkMaps: existing.linkMaps,
          coordenadas: existing.coordenadas || item.coordenadas,
          endereco: existing.endereco || item.endereco,
          statusConservacao: existing.statusConservacao,
          dataUltimaVistoria: existing.dataUltimaVistoria,
          diasSemVisita: existing.diasSemVisita,
          demandasUrgentesCount: existing.demandasUrgentesCount,
          temOsAtiva: existing.temOsAtiva,
          osId: existing.osId
        };
      }
      return item;
    });

    const updated = [...manuals, ...mergedImported];
    this.setItem(STORAGE_KEYS.SCHOOLS, updated);
    return updated;
  }

  // --- Ambientes Globais ---
  getAmbientes(): Ambiente[] {
    return this.getItem<Ambiente[]>(STORAGE_KEYS.AMBIENTES, INITIAL_AMBIENTES);
  }

  addAmbienteGlobal(nome: string): Ambiente[] {
    const list = this.getAmbientes();
    const trimmed = nome.trim();
    if (!trimmed) return list;
    const exists = list.some(a => a.nome.toLowerCase() === trimmed.toLowerCase());
    if (exists) return list;

    const newAmb: Ambiente = {
      id: `amb-custom-${Date.now()}`,
      nome: trimmed,
      isPadrao: false
    };
    const updated = [...list, newAmb];
    this.setItem(STORAGE_KEYS.AMBIENTES, updated);
    return updated;
  }

  // --- Ordens de Serviço & Medição ---
  getOrdensServico(): OrdemServico[] {
    const list = this.getItem<OrdemServico[]>(STORAGE_KEYS.OS, INITIAL_OS);
    if (!list || list.length === 0) {
      if (INITIAL_OS && INITIAL_OS.length > 0) {
        this.setItem(STORAGE_KEYS.OS, INITIAL_OS);
        return INITIAL_OS;
      }
    }
    return list;
  }

  saveOrdemServico(os: OrdemServico): OrdemServico[] {
    const list = this.getOrdensServico();
    const exists = list.some(item => item.id === os.id);
    const updated = exists ? list.map(item => item.id === os.id ? os : item) : [os, ...list];
    this.setItem(STORAGE_KEYS.OS, updated);

    // Sincroniza flag de temOsAtiva na escola
    try {
      const schools = this.getSchools();
      const schoolIndex = schools.findIndex(s => s.id === os.escolaId);
      if (schoolIndex >= 0) {
        schools[schoolIndex].temOsAtiva = os.status === 'ativa';
        schools[schoolIndex].osId = os.id;
        this.setItem(STORAGE_KEYS.SCHOOLS, schools);
      }
    } catch (e) {
      console.warn('Erro ao atualizar flag temOsAtiva na escola:', e);
    }

    return updated;
  }

  deleteOrdemServico(osId: string): OrdemServico[] {
    const list = this.getOrdensServico();
    const osToDelete = list.find(o => o.id === osId);
    const updated = list.filter(item => item.id !== osId);
    this.setItem(STORAGE_KEYS.OS, updated);

    if (osToDelete) {
      try {
        const schools = this.getSchools();
        const schoolIndex = schools.findIndex(s => s.id === osToDelete.escolaId);
        if (schoolIndex >= 0) {
          const hasRemainingActive = updated.some(o => o.escolaId === osToDelete.escolaId && o.status === 'ativa');
          schools[schoolIndex].temOsAtiva = hasRemainingActive;
          if (!hasRemainingActive) delete schools[schoolIndex].osId;
          this.setItem(STORAGE_KEYS.SCHOOLS, schools);
        }
      } catch (e) {
        console.warn('Erro ao atualizar escola após remoção de OS:', e);
      }
    }

    return updated;
  }

  updateMedicaoOS(osId: string, novoPercentual: number, novaObservacao?: string): OrdemServico[] {
    const list = this.getOrdensServico();
    const updated = list.map(os => {
      if (os.id === osId) {
        const obsList = [...os.observacoes];
        if (novaObservacao && novaObservacao.trim()) {
          obsList.unshift({
            id: `obs-${Date.now()}`,
            data: new Date().toLocaleDateString('pt-BR'),
            texto: novaObservacao.trim(),
            autor: 'Fiscal de Obras GPR'
          });
        }
        return {
          ...os,
          percentualMedicao: Math.min(100, Math.max(0, novoPercentual)),
          observacoes: obsList,
          status: novoPercentual >= 100 ? 'historico' : os.status
        };
      }
      return os;
    });
    this.setItem(STORAGE_KEYS.OS, updated);
    return updated;
  }

  /**
   * Sincroniza ordens de serviço da Ata de Manutenção preservando anexos locais e medições customizadas.
   */
  syncOrdensServicoFromAta(importedOS: OrdemServico[]): OrdemServico[] {
    const current = this.getOrdensServico();
    const currentMap = new Map(current.map(o => [o.id, o]));

    const merged = importedOS.map(item => {
      const existing = currentMap.get(item.id);
      if (existing) {
        return {
          ...item,
          osPdfBlob: existing.osPdfBlob || item.osPdfBlob,
          osPdfUrl: existing.osPdfUrl || item.osPdfUrl,
          osPdfNome: existing.osPdfNome || item.osPdfNome,
          orcamentoPdfBlob: existing.orcamentoPdfBlob || item.orcamentoPdfBlob,
          orcamentoPdfUrl: existing.orcamentoPdfUrl || item.orcamentoPdfUrl,
          orcamentoPdfNome: existing.orcamentoPdfNome || item.orcamentoPdfNome,
          percentualMedicao: existing.percentualMedicao !== undefined ? existing.percentualMedicao : item.percentualMedicao,
          observacoes: existing.observacoes && existing.observacoes.length > 0 ? existing.observacoes : item.observacoes
        };
      }
      return item;
    });

    this.setItem(STORAGE_KEYS.OS, merged);
    return merged;
  }

  // --- Alertas Urgentes ---
  getAlertas(): AlertaUrgente[] {
    return this.getItem<AlertaUrgente[]>(STORAGE_KEYS.ALERTAS, INITIAL_ALERTAS);
  }

  resolverAlerta(id: string): AlertaUrgente[] {
    const list = this.getAlertas();
    const updated = list.map(a => a.id === id ? { ...a, resolvido: true } : a);
    this.setItem(STORAGE_KEYS.ALERTAS, updated);
    return updated;
  }

  addAlerta(alerta: Omit<AlertaUrgente, 'id' | 'dataCriacao' | 'resolvido'>): AlertaUrgente[] {
    const list = this.getAlertas();
    const novo: AlertaUrgente = {
      ...alerta,
      id: `alt-${Date.now()}`,
      dataCriacao: 'Hoje',
      resolvido: false
    };
    const updated = [novo, ...list];
    this.setItem(STORAGE_KEYS.ALERTAS, updated);
    return updated;
  }

  // --- Demandas ---
  getDemandas(): Demanda[] {
    return this.getItem<Demanda[]>(STORAGE_KEYS.DEMANDAS, INITIAL_DEMANDAS);
  }

  toggleDemandaConcluida(id: string): Demanda[] {
    const list = this.getDemandas();
    const updated = list.map(d => d.id === id ? { ...d, concluida: !d.concluida } : d);
    this.setItem(STORAGE_KEYS.DEMANDAS, updated);
    return updated;
  }

  deleteDemanda(id: string): Demanda[] {
    const list = this.getDemandas();
    const updated = list.filter(d => d.id !== id);
    this.setItem(STORAGE_KEYS.DEMANDAS, updated);
    return updated;
  }

  addDemanda(demanda: Omit<Demanda, 'id' | 'concluida' | 'dataCriacao'>): Demanda[] {
    const list = this.getDemandas();
    const nova: Demanda = {
      ...demanda,
      id: `dem-${Date.now()}`,
      concluida: false,
      dataCriacao: new Date().toISOString().split('T')[0]
    };
    const updated = [nova, ...list];
    this.setItem(STORAGE_KEYS.DEMANDAS, updated);
    return updated;
  }

  // --- Tarefas do Dia ---
  getTarefas(): TarefaDoDia[] {
    return this.getItem<TarefaDoDia[]>(STORAGE_KEYS.TAREFAS, INITIAL_TAREFAS);
  }

  toggleTarefa(id: string): TarefaDoDia[] {
    const list = this.getTarefas();
    const updated = list.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t);
    this.setItem(STORAGE_KEYS.TAREFAS, updated);
    return updated;
  }

  addTarefa(titulo: string, escolaOuLocal: string, horario: string, prioridade: 'urgente' | 'normal' = 'normal'): TarefaDoDia[] {
    const list = this.getTarefas();
    const nova: TarefaDoDia = {
      id: `tar-${Date.now()}`,
      titulo,
      escolaOuLocal,
      horario: horario || '10:00',
      prioridade,
      concluida: false
    };
    const updated = [...list, nova];
    this.setItem(STORAGE_KEYS.TAREFAS, updated);
    return updated;
  }

  // --- Levantamentos Fotográficos ---
  getLevantamentos(): Levantamento[] {
    return this.getItem<Levantamento[]>(STORAGE_KEYS.LEVANTAMENTOS, INITIAL_LEVANTAMENTOS);
  }

  getLevantamentosByEscola(escolaId: string): Levantamento[] {
    return this.getLevantamentos().filter(l => l.escolaId === escolaId);
  }

  addLevantamento(levantamento: Omit<Levantamento, 'id'>): Levantamento {
    const list = this.getLevantamentos();
    const novo: Levantamento = {
      ...levantamento,
      id: `lev-${Date.now()}`
    };
    const updated = [novo, ...list];
    this.setItem(STORAGE_KEYS.LEVANTAMENTOS, updated);

    // Atualiza a data da última vistoria da escola correspondente
    const schools = this.getSchools();
    const updatedSchools = schools.map(s => {
      if (s.id === levantamento.escolaId) {
        return {
          ...s,
          dataUltimaVistoria: new Date().toISOString().split('T')[0],
          diasSemVisita: 0
        };
      }
      return s;
    });
    this.setItem(STORAGE_KEYS.SCHOOLS, updatedSchools);

    // Se alguma foto do levantamento tiver alerta urgente, registra automaticamente em Alertas e Demandas
    levantamento.fotos.forEach(foto => {
      if (foto.isUrgente && foto.urgenciaNota) {
        this.addAlerta({
          titulo: `Alerta na Foto: ${foto.ambienteNome}`,
          descricao: foto.urgenciaNota,
          prioridade: 'critica',
          responsavel: foto.responsavelUrgencia || 'Naila',
          linkModulo: 'vistorias',
          targetId: novo.id
        });

        this.addDemanda({
          titulo: foto.urgenciaNota,
          descricao: `Foto registrada no ambiente ${foto.ambienteNome}. Observação técnica: ${foto.legendaTecnicaIA || foto.legendaOriginal}`,
          tipo: 'vistoria_urgente',
          responsavel: foto.responsavelUrgencia || 'Naila',
          prioridade: 'alta',
          dataLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          alertFrequency: foto.diasAlerta && foto.diasAlerta.length > 0 ? 'dias_semana' : 'todos_os_dias',
          diasSemana: foto.diasAlerta || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
          escolaId: levantamento.escolaId
        });
      }
    });

    return novo;
  }

  deleteLevantamentos(ids: string[]): Levantamento[] {
    const idSet = new Set(ids);
    const updated = this.getLevantamentos().filter(l => !idSet.has(l.id));
    this.setItem(STORAGE_KEYS.LEVANTAMENTOS, updated);
    return updated;
  }

  // --- Rotas de Vistoria ---
  getRotas(): RotaVistoria[] {
    return this.getItem<RotaVistoria[]>(STORAGE_KEYS.ROTAS, INITIAL_ROTAS);
  }

  saveRota(rota: RotaVistoria): RotaVistoria[] {
    const list = this.getRotas();
    const index = list.findIndex(r => r.id === rota.id);
    let updated: RotaVistoria[];
    if (index >= 0) {
      updated = list.map(r => r.id === rota.id ? rota : r);
    } else {
      updated = [rota, ...list];
    }
    this.setItem(STORAGE_KEYS.ROTAS, updated);
    return updated;
  }

  concluirRota(rotaId: string): { rotas: RotaVistoria[]; schools: Escola[] } {
    const rotas = this.getRotas();
    const targetRota = rotas.find(r => r.id === rotaId);
    if (!targetRota) return { rotas, schools: this.getSchools() };

    const updatedRotas: RotaVistoria[] = rotas.map(r => {
      if (r.id === rotaId) {
        return {
          ...r,
          status: 'concluida' as const,
          dataConclusao: new Date().toLocaleDateString('pt-BR')
        };
      }
      return r;
    });
    this.setItem(STORAGE_KEYS.ROTAS, updatedRotas);

    // Zera os dias sem visita e atualiza a última data das escolas incluídas na rota
    const escolaIdsInRota = new Set(targetRota.itens.map(i => i.escolaId));
    const todayStr = new Date().toISOString().split('T')[0];
    const updatedSchools = this.getSchools().map(s => {
      if (escolaIdsInRota.has(s.id)) {
        return {
          ...s,
          dataUltimaVistoria: todayStr,
          diasSemVisita: 0,
          statusConservacao: s.statusConservacao === 'critico' ? 'atencao' : s.statusConservacao
        };
      }
      return s;
    });
    this.setItem(STORAGE_KEYS.SCHOOLS, updatedSchools);

    return { rotas: updatedRotas, schools: updatedSchools };
  }

  // --- Acompanhamento de Processos SEI ---
  getCategoriasProcesso(): CategoriaProcessoCard[] {
    const defaultCategorias: CategoriaProcessoCard[] = [
      {
        id: 'medicao',
        nome: 'Processos de Medição',
        descricao: 'Acompanhamento e trâmite de processos de medição de obras',
        isPadrao: true,
        corBadge: 'amber'
      },
      {
        id: 'diaria',
        nome: 'Processos de Diária',
        descricao: 'Controle de concessão, empenho e SEDUC QRE de diárias',
        isPadrao: true,
        corBadge: 'cyan'
      }
    ];
    return this.getItem<CategoriaProcessoCard[]>(STORAGE_KEYS.CATEGORIAS_PROCESSO, defaultCategorias);
  }

  saveCategoriaProcesso(cat: CategoriaProcessoCard): CategoriaProcessoCard[] {
    const list = this.getCategoriasProcesso();
    const index = list.findIndex(c => c.id === cat.id);
    let updated: CategoriaProcessoCard[];
    if (index >= 0) {
      updated = list.map(c => c.id === cat.id ? cat : c);
    } else {
      updated = [...list, cat];
    }
    this.setItem(STORAGE_KEYS.CATEGORIAS_PROCESSO, updated);
    return updated;
  }

  deleteCategoriaProcesso(id: string): CategoriaProcessoCard[] {
    const list = this.getCategoriasProcesso().filter(c => c.id !== id || c.isPadrao);
    this.setItem(STORAGE_KEYS.CATEGORIAS_PROCESSO, list);
    return list;
  }

  getProcessos(): ProcessoAcompanhamento[] {
    return this.getItem<ProcessoAcompanhamento[]>(STORAGE_KEYS.PROCESSOS, []);
  }

  saveProcesso(processo: ProcessoAcompanhamento): ProcessoAcompanhamento[] {
    const list = this.getProcessos();
    const index = list.findIndex(p => p.id === processo.id);
    let updated: ProcessoAcompanhamento[];
    if (index >= 0) {
      updated = list.map(p => p.id === processo.id ? processo : p);
    } else {
      updated = [processo, ...list];
    }
    this.setItem(STORAGE_KEYS.PROCESSOS, updated);
    return updated;
  }

  deleteProcesso(id: string): ProcessoAcompanhamento[] {
    const list = this.getProcessos().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PROCESSOS, list);
    return list;
  }

  adicionarDocumentoProcesso(processoId: string, doc: Omit<DocumentoProcessoSEI, 'id'>): ProcessoAcompanhamento[] {
    const list = this.getProcessos();
    const novoDoc: DocumentoProcessoSEI = {
      ...doc,
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    const updated = list.map(p => {
      if (p.id === processoId) {
        return {
          ...p,
          documentos: [...p.documentos, novoDoc]
        };
      }
      return p;
    });
    this.setItem(STORAGE_KEYS.PROCESSOS, updated);
    return updated;
  }

  // --- Galeria Agregada ---
  getAllFotos(): (FotoLevantamento & { escolaNome: string; levantamentoId: string })[] {
    const levantamentos = this.getLevantamentos();
    const schools = this.getSchools();
    const schoolMap = new Map(schools.map(s => [s.id, s.nome]));

    const allFotos: (FotoLevantamento & { escolaNome: string; levantamentoId: string })[] = [];
    levantamentos.forEach(l => {
      const escolaNome = schoolMap.get(l.escolaId) || 'Escola SEDUC';
      l.fotos.forEach(f => {
        allFotos.push({
          ...f,
          escolaNome,
          levantamentoId: l.id
        });
      });
    });
    return allFotos;
  }

  // --- Ordem Interativa dos Cards na Home ---
  getHomeCardsOrder(): string[] {
    const defaultOrder = ['gres', 'orcamentos', 'medicoes', 'rotas', 'demandas', 'processos'];
    return this.getItem<string[]>(STORAGE_KEYS.CARD_ORDER, defaultOrder);
  }

  saveHomeCardsOrder(order: string[]): void {
    this.setItem(STORAGE_KEYS.CARD_ORDER, order);
  }

  // --- Reset de Fábrica ---
  resetToDefaults(): void {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.GRES, JSON.stringify(INITIAL_GRES));
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(INITIAL_SCHOOLS));
    localStorage.setItem(STORAGE_KEYS.AMBIENTES, JSON.stringify(INITIAL_AMBIENTES));
    localStorage.setItem(STORAGE_KEYS.OS, JSON.stringify(INITIAL_OS));
    localStorage.setItem(STORAGE_KEYS.ALERTAS, JSON.stringify(INITIAL_ALERTAS));
    localStorage.setItem(STORAGE_KEYS.DEMANDAS, JSON.stringify(INITIAL_DEMANDAS));
    localStorage.setItem(STORAGE_KEYS.TAREFAS, JSON.stringify(INITIAL_TAREFAS));
    localStorage.setItem(STORAGE_KEYS.LEVANTAMENTOS, JSON.stringify(INITIAL_LEVANTAMENTOS));
    localStorage.setItem(STORAGE_KEYS.ROTAS, JSON.stringify(INITIAL_ROTAS));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  }

  getLastSync(): string {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (!raw) return 'Agora mesmo (Local)';
    try {
      const d = new Date(raw);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Sincronizado';
    }
  }

  // --- Links da Planilha da Ata e Google Drive de Obras ---
  getPlanilhaAtaUrl(): string {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANILHA_ATA_URL);
    return saved && saved.trim() ? saved.trim() : DEFAULT_PLANILHA_ATA_URL;
  }

  setPlanilhaAtaUrl(url: string): void {
    if (url && url.trim()) {
      localStorage.setItem(STORAGE_KEYS.PLANILHA_ATA_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.PLANILHA_ATA_URL);
    }
  }

  getDriveObrasUrl(): string {
    const saved = localStorage.getItem(STORAGE_KEYS.DRIVE_OBRAS_URL);
    return saved && saved.trim() ? saved.trim() : DEFAULT_DRIVE_OBRAS_URL;
  }

  setDriveObrasUrl(url: string): void {
    if (url && url.trim()) {
      localStorage.setItem(STORAGE_KEYS.DRIVE_OBRAS_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.DRIVE_OBRAS_URL);
    }
  }

  getPastaGeralOSDriveUrl(): string {
    const saved = localStorage.getItem(STORAGE_KEYS.PASTA_GERAL_OS_DRIVE_URL);
    return saved && saved.trim() ? saved.trim() : DEFAULT_PASTA_GERAL_OS_DRIVE_URL;
  }

  setPastaGeralOSDriveUrl(url: string): void {
    if (url && url.trim()) {
      localStorage.setItem(STORAGE_KEYS.PASTA_GERAL_OS_DRIVE_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.PASTA_GERAL_OS_DRIVE_URL);
    }
  }
}

export const storage = new StorageService();
