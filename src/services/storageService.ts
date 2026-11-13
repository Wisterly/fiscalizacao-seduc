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
  FotoLevantamento
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
  SCHOOLS: 'seduc_fiscal_schools_inep_v5',
  AMBIENTES: 'seduc_fiscal_ambientes_v1',
  OS: 'seduc_fiscal_os_v2',
  ALERTAS: 'seduc_fiscal_alertas_v1',
  DEMANDAS: 'seduc_fiscal_demandas_v1',
  TAREFAS: 'seduc_fiscal_tarefas_v1',
  LEVANTAMENTOS: 'seduc_fiscal_levantamentos_v1',
  ROTAS: 'seduc_fiscal_rotas_v1',
  LAST_SYNC: 'seduc_fiscal_last_sync_v1'
};

class StorageService {
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
    return this.getItem<OrdemServico[]>(STORAGE_KEYS.OS, INITIAL_OS);
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
}

export const storage = new StorageService();
