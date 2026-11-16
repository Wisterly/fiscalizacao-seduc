import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Paperclip,
  Download,
  RefreshCw,
  ArrowLeft,
  MapPin,
  Plus,
  Building,
  DollarSign,
  Calendar,
  ExternalLink,
  Trash2,
  Edit3,
  FileCode,
  CheckCircle2,
  FolderOpen,
  FolderSearch,
  AlertTriangle
} from 'lucide-react';
import { OrdemServico, GRE, Escola } from '../../types';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { AttachOSModal } from './AttachOSModal';
import { GreSelector } from '../vistorias/GreSelector';
import { syncAtaFromGoogleSheets } from '../../services/sheetsSyncService';
import { storage } from '../../services/storageService';
import { driveOSScanner } from '../../services/driveOSScannerService';
import {
  LocalAttachmentRecord,
  saveLocalAttachment,
  deleteLocalAttachment,
  getAllLocalAttachmentsMap
} from '../../services/orcamentosDbService';

interface OrcamentosViewProps {
  ordensServico: OrdemServico[];
  gres: GRE[];
  schools: Escola[];
  selectedGre?: GRE | null;
  onSelectGre?: (gre: GRE | null) => void;
  onSaveOS?: (os: OrdemServico) => void;
  onDeleteOS?: (osId: string) => void;
  targetOsId?: string;
  onBack?: () => void;
}

export const OrcamentosView: React.FC<OrcamentosViewProps> = ({
  ordensServico,
  gres,
  schools,
  selectedGre,
  onSelectGre,
  onSaveOS,
  onDeleteOS,
  targetOsId,
  onBack
}) => {
  const [internalSelectedGre, setInternalSelectedGre] = useState<GRE | null>(null);
  const activeGre = selectedGre !== undefined ? selectedGre : internalSelectedGre;

  const setActiveGre = (g: GRE | null) => {
    if (onSelectGre) {
      onSelectGre(g);
    } else {
      setInternalSelectedGre(g);
    }
    setSelectedMunicipio('todos');
    setEscolaExpandidaId(null);
  };

  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'com_os' | 'sem_os' | 'todas'>('com_os');
  const [filtroDiario, setFiltroDiario] = useState<'todos' | 'parada' | 'ritmo_lento' | 'em_andamento' | 'aguardando_inicio'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [escolaExpandidaId, setEscolaExpandidaId] = useState<string | null>(null);

  // Sistema Híbrido de Documentos Locais via IndexedDB (Seção 6.2 do Prompt Mestre)
  const [localAttachments, setLocalAttachments] = useState<Record<string, LocalAttachmentRecord>>({});

  useEffect(() => {
    getAllLocalAttachmentsMap().then((map) => {
      setLocalAttachments(map);
    });
  }, []);

  const handleUploadLocalDoc = async (osId: string, tipo: 'orcamento' | 'os', file?: File | null) => {
    if (!file) return;
    try {
      const saved = await saveLocalAttachment(osId, tipo, file);
      setLocalAttachments((prev) => ({
        ...prev,
        [saved.key]: saved
      }));
    } catch (err: any) {
      alert(`Erro ao anexar documento offline: ${err?.message || err}`);
    }
  };

  const handleRemoveLocalDoc = async (osId: string, tipo: 'orcamento' | 'os') => {
    if (!window.confirm('Remover este anexo local salvo no aparelho?')) return;
    const ok = await deleteLocalAttachment(osId, tipo);
    if (ok) {
      setLocalAttachments((prev) => {
        const next = { ...prev };
        delete next[`${osId}_${tipo}`];
        return next;
      });
    }
  };

  const handleViewLocalDoc = (record: LocalAttachmentRecord) => {
    const link = document.createElement('a');
    link.href = record.dataUrl;
    link.download = record.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Atualização rápida de Status Geral ou Situação Operacional direto no Card (Seção 5.2 e 6.3)
  const handleUpdateOsField = (os: OrdemServico, field: 'statusObra' | 'statusDiario', value: string) => {
    const updated: OrdemServico = {
      ...os,
      [field]: value
    };

    const stGeral = (field === 'statusObra' ? value : os.statusObra || '').toUpperCase();
    const stDiario = (field === 'statusDiario' ? value : os.statusDiario || '').toUpperCase();

    if (stDiario.includes('PARADA') || stGeral.includes('PARALISADA')) {
      updated.tipoStatus = 'paralisada';
    } else if (stGeral.includes('CONCLU') || stDiario.includes('CONCLU')) {
      updated.tipoStatus = 'finalizada';
      updated.status = 'historico';
    } else if (stGeral.includes('INICIAR') || stGeral.includes('AGUARDANDO')) {
      updated.tipoStatus = 'aguardando';
      updated.status = 'ativa';
    } else {
      updated.tipoStatus = 'em_execucao';
      updated.status = 'ativa';
    }

    if (onSaveOS) {
      onSaveOS(updated);
    } else {
      storage.saveOrdemServico(updated);
    }
  };

  // Modais
  const [previewDoc, setPreviewDoc] = useState<{ os: OrdemServico; tipo: 'orcamento' | 'memorial' } | null>(null);
  const [modalSchool, setModalSchool] = useState<Escola | null>(null);
  const [modalOS, setModalOS] = useState<OrdemServico | null>(null);

  // Sincronização ao vivo da Ata de Manutenção
  const [syncingAta, setSyncingAta] = useState(false);
  const [varrendoDrive, setVarrendoDrive] = useState(false);

  const handleVarreduraDriveLive = async () => {
    setVarrendoDrive(true);
    try {
      const res = await driveOSScanner.executarVarreduraAutomatica();
      if (onSaveOS && res.ordensAtualizadas.length > 0) {
        onSaveOS(res.ordensAtualizadas[0]);
      }
      alert(`Varredura do Drive concluída! ${res.totalAnexosVinculados} ordens de serviço ativas tiveram arquivos vinculados automaticamente.`);
    } catch (e: any) {
      alert(`Erro na varredura do Drive: ${e?.message || e}`);
    } finally {
      setVarrendoDrive(false);
    }
  };

  const handleSyncAtaLive = async () => {
    setSyncingAta(true);
    try {
      const res = await syncAtaFromGoogleSheets(schools);
      if (res.novasEscolas && res.novasEscolas.length > 0) {
        res.novasEscolas.forEach(ne => storage.addEscola(ne));
      }
      const updatedOS = storage.syncOrdensServicoFromAta(res.ordensServico);
      if (onSaveOS && updatedOS.length > 0) {
        onSaveOS(updatedOS[0]);
      }
      alert(`Sincronização concluída com sucesso! ${res.ordensServico.length} ordens de serviço ativas/em execução sincronizadas do Google Sheets.`);
    } catch (e: any) {
      alert(`Erro ao sincronizar ata: ${e?.message || e}`);
    } finally {
      setSyncingAta(false);
    }
  };

  // Abrir ou baixar arquivo PDF / anexo
  const handleOpenOrDownload = (urlOrBlob?: string, filename?: string) => {
    if (!urlOrBlob) return;
    if (urlOrBlob.startsWith('http')) {
      window.open(urlOrBlob, '_blank');
      return;
    }
    const link = document.createElement('a');
    link.href = urlOrBlob;
    link.download = filename || 'documento.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SE NÃO HOUVER GRE SELECIONADA: Mostra a primeira tela com o GreSelector oficial!
  if (!activeGre) {
    return (
      <div className="w-full pb-20 pt-1 px-4 animate-fadeIn">
        <GreSelector
          gres={gres}
          schools={schools}
          selectedGreId={null}
          titulo="1. Selecionar a GRE para Orçamentos e OS"
          subtitulo="Acompanhe ordens de serviço, contratos da ata e projetos executivos de todas as escolas"
          badgeTexto="21 Regiões"
          onSelectGre={setActiveGre}
        />
      </div>
    );
  }

  // Escolas e OSs da GRE selecionada
  const schoolsDaGre = schools.filter((s) => s.greId === activeGre.id);
  const osDaGre = ordensServico.filter((os) => os.greId === activeGre.id);

  // Função utilitária de normalização de texto
  const normStr = (str?: string) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .trim();

  // Remove prefixos comuns de entidades para match tolerante
  const cleanSchoolPrefix = (str?: string) =>
    normStr(str)
      .replace(/^(ceti|ceja|u e|unidade escolar|escola estadual|centro estadual|centro de atendimento|polo uapi|sede)\s+/g, '')
      .trim();

  // Helper para obter as OSs da escola com verificação por ID, INEP e Nome Normalizado / Sem Prefixo
  const getOsListForSchool = (school: Escola) => {
    const schoolNorm = normStr(school.nome);
    const schoolClean = cleanSchoolPrefix(school.nome);
    return osDaGre.filter((os) => {
      if (os.escolaId && os.escolaId === school.id) return true;
      if (school.inep && school.inep !== 'S/ INEP' && os.escolaId === `inep-${school.inep}`) return true;
      const osNorm = normStr(os.escolaNome);
      if (osNorm === schoolNorm) return true;
      const osClean = cleanSchoolPrefix(os.escolaNome);
      return osClean && osClean === schoolClean;
    });
  };

  // Garante que toda OS da GRE pertença a uma escola existente na listagem da GRE
  const todasEscolasDaGre = useMemo(() => {
    const list = [...schoolsDaGre];
    osDaGre.forEach((os) => {
      const jaExiste = list.some((s) => {
        if (s.id === os.escolaId) return true;
        if (s.inep && s.inep !== 'S/ INEP' && os.escolaId === `inep-${s.inep}`) return true;
        if (normStr(s.nome) === normStr(os.escolaNome)) return true;
        const sClean = cleanSchoolPrefix(s.nome);
        const osClean = cleanSchoolPrefix(os.escolaNome);
        return sClean && sClean === osClean;
      });

      if (!jaExiste) {
        list.push({
          id: os.escolaId || `escola-os-${os.id}`,
          inep: (os.escolaId && os.escolaId.startsWith('inep-')) ? os.escolaId.replace('inep-', '') : 'S/ INEP',
          greId: os.greId || activeGre.id,
          nome: os.escolaNome,
          municipio: os.municipio || 'PIAUÍ',
          endereco: os.municipio || 'PIAUÍ',
          statusConservacao: 'regular',
          dataUltimaVistoria: 'Sem vistoria',
          diasSemVisita: 0,
          demandasUrgentesCount: 0,
          temOsAtiva: true
        });
      }
    });
    return list;
  }, [schoolsDaGre, osDaGre, activeGre.id]);

  // Municípios da GRE selecionada
  const municipiosDaGre = Array.from(new Set(todasEscolasDaGre.map((s) => s.municipio))).sort();

  // Filtragem das escolas segundo as diretrizes estritas do usuário:
  // - Com OS: escolas com ordem de serviço em EXECUÇÃO ou A INICIAR na Coluna R
  // - Sem OS: escolas sem ordem de serviço ativa (concluída, cancelada, aguardando saldo ou sem OS)
  const filteredSchools = todasEscolasDaGre.filter((school) => {
    const osDaEscola = getOsListForSchool(school);

    const matchesMun = selectedMunicipio === 'todos' || school.municipio === selectedMunicipio;

    // Tem OS em Execução ou A Iniciar (Coluna R = EXECUÇÃO ou A INICIAR)
    const hasOsAtiva = osDaEscola.some((os) => {
      const stObra = (os.statusObra || '').toUpperCase();
      return stObra.includes('EXECU') || stObra.includes('INICIAR') || os.status === 'ativa';
    });

    const matchesStatus =
      filtroStatus === 'todas' ||
      (filtroStatus === 'com_os' && hasOsAtiva) ||
      (filtroStatus === 'sem_os' && !hasOsAtiva);

    // Filtro pelo Status Diário da Coluna S (Parada, Ritmo Lento, Em andamento, Aguardando Início)
    const matchesDiario =
      filtroDiario === 'todos' ||
      osDaEscola.some((os) => {
        const s = (os.statusDiario || '').toLowerCase();
        const stObra = (os.statusObra || '').toLowerCase();
        if (filtroDiario === 'parada') return s.includes('parada') || s.includes('paralisada');
        if (filtroDiario === 'ritmo_lento') return s.includes('lento') || s.includes('ritmo');
        if (filtroDiario === 'em_andamento') return s.includes('andamento') || s.includes('execu');
        if (filtroDiario === 'aguardando_inicio') return s.includes('início') || s.includes('inicio') || stObra.includes('iniciar');
        return true;
      });

    const termNorm = normStr(searchTerm);
    // Tolerância fonética/digitação para Amanda Bulamarque -> Armando Burlamaqui
    const termAdjusted = termNorm.replace(/amanda\s*bulamarque/g, 'armando burlamaqui').replace(/bulamarque/g, 'burlamaqui');

    const matchesSearch =
      !termNorm ||
      normStr(school.nome).includes(termNorm) ||
      normStr(school.nome).includes(termAdjusted) ||
      normStr(school.municipio).includes(termNorm) ||
      (school.inep && school.inep.includes(termNorm)) ||
      osDaEscola.some(
        (os) =>
          normStr(os.numeroOS).includes(termNorm) ||
          normStr(os.objeto).includes(termNorm) ||
          normStr(os.empresaContratada).includes(termNorm) ||
          normStr(os.fiscalResponsavel).includes(termNorm) ||
          normStr(os.statusDiario).includes(termNorm) ||
          normStr(os.statusObra).includes(termNorm)
      );

    return matchesMun && matchesStatus && matchesDiario && matchesSearch;
  });

  // Ordena para que escolas com OS apareçam no topo
  filteredSchools.sort((a, b) => {
    const aList = getOsListForSchool(a);
    const bList = getOsListForSchool(b);
    if (aList.length > 0 && bList.length === 0) return -1;
    if (aList.length === 0 && bList.length > 0) return 1;
    return a.nome.localeCompare(b.nome);
  });

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="w-full pb-20 pt-1 animate-fadeIn">
      {/* 1. SELETOR SUPERIOR DA GRE */}
      <div className="px-4 mb-3 space-y-2">
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 truncate">
            <button
              onClick={() => setActiveGre(null)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-xs font-bold border border-slate-700 transition-colors shrink-0 active-press"
              title="Voltar ao Seletor de GREs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Trocar GRE</span>
            </button>
            <div className="truncate">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{activeGre.nome}</span>
              </span>
              <span className="text-[10px] text-amber-300/80 block truncate">
                Sede: {activeGre.sede} • {todasEscolasDaGre.length} escolas • {osDaGre.length} OSs cadastradas
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
            {String(activeGre.numero).padStart(2, '0')}ª GRE
          </span>
        </div>

        {/* Seletor de Município da GRE */}
        <div className="relative">
          <select
            value={selectedMunicipio}
            onChange={(e) => setSelectedMunicipio(e.target.value)}
            className="w-full appearance-none bg-slate-900/80 border border-white/10 rounded-2xl px-3.5 py-2.5 pr-8 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 backdrop-blur-md cursor-pointer shadow-sm"
          >
            <option value="todos">Todos os Municípios da {activeGre.nome} ({municipiosDaGre.length})</option>
            {municipiosDaGre.map((mun) => (
              <option key={mun} value={mun} className="bg-slate-900 text-white">
                {mun}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* 2. CAMPO DE BUSCA */}
      <div className="px-4 mb-3.5">
        <div className="relative flex items-center rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md px-3.5 py-2 shadow-sm focus-within:border-cyan-400/70 transition-colors">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder={
              selectedMunicipio !== 'todos'
                ? `Buscar escola ou OS em ${selectedMunicipio}...`
                : 'Buscar por nome da escola, nº da OS ou empresa...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none pr-6"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. PÍLULAS DE FILTRO RÁPIDO & SINCRONIZAÇÃO (COM OS / SEM OS / TODAS + STATUS DIÁRIO) */}
      <div className="px-4 mb-4 space-y-2">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setFiltroStatus('com_os');
                setFiltroDiario('todos');
              }}
              className={`px-3 py-1.5 rounded-full text-xs transition-all active-press flex items-center gap-1.5 ${
                filtroStatus === 'com_os'
                  ? 'border-2 border-cyan-400 bg-cyan-500/20 text-cyan-200 font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'border border-white/10 bg-slate-900/60 text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Com OS ({todasEscolasDaGre.filter((s) => getOsListForSchool(s).some(os => (os.statusObra || '').toUpperCase().includes('EXECU') || (os.statusObra || '').toUpperCase().includes('INICIAR') || os.status === 'ativa')).length})</span>
            </button>

            <button
              onClick={() => {
                setFiltroStatus('sem_os');
                setFiltroDiario('todos');
              }}
              className={`px-3 py-1.5 rounded-full text-xs transition-all active-press ${
                filtroStatus === 'sem_os'
                  ? 'border-2 border-slate-400 bg-white/10 text-white font-extrabold'
                  : 'border border-white/10 bg-slate-900/60 text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              Sem OS ({todasEscolasDaGre.filter((s) => !getOsListForSchool(s).some(os => (os.statusObra || '').toUpperCase().includes('EXECU') || (os.statusObra || '').toUpperCase().includes('INICIAR') || os.status === 'ativa')).length})
            </button>

            <button
              onClick={() => {
                setFiltroStatus('todas');
                setFiltroDiario('todos');
              }}
              className={`px-3 py-1.5 rounded-full text-xs transition-all active-press ${
                filtroStatus === 'todas'
                  ? 'border-2 border-amber-400 bg-amber-500/15 text-amber-300 font-extrabold shadow-[0_0_12px_rgba(234,179,8,0.25)]'
                  : 'border border-white/10 bg-slate-900/60 text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              Todas ({todasEscolasDaGre.length})
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleVarreduraDriveLive}
              disabled={varrendoDrive}
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 active-press disabled:opacity-50 flex items-center gap-1 text-[11px] font-bold"
              title="Executar Varredura Automática de Ordens de Serviço na Pasta Compartilhada do Google Drive"
            >
              <FolderSearch className={`w-3.5 h-3.5 ${varrendoDrive ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Varredura OS Drive</span>
            </button>

            <button
              type="button"
              onClick={handleSyncAtaLive}
              disabled={syncingAta}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 active-press disabled:opacity-50 shrink-0"
              title="Sincronizar Ata de Manutenção ao vivo do Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingAta ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* SUB-PÍLULAS DE STATUS DIÁRIO (Coluna S: Parada, Ritmo Lento, Em andamento, A Iniciar) */}
        {filtroStatus !== 'sem_os' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 mr-0.5">Diário:</span>
            <button
              onClick={() => setFiltroDiario('todos')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all active-press ${
                filtroDiario === 'todos'
                  ? 'bg-slate-700 text-white border border-slate-500'
                  : 'bg-slate-900/40 text-slate-400 border border-white/5 hover:text-slate-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroDiario('parada')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all active-press flex items-center gap-1 ${
                filtroDiario === 'parada'
                  ? 'bg-red-500/25 text-red-300 border border-red-500/50 shadow-sm'
                  : 'bg-red-500/10 text-red-400/80 border border-red-500/20 hover:text-red-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span>Parada ({todasEscolasDaGre.filter((s) => getOsListForSchool(s).some(os => (os.statusDiario || '').toLowerCase().includes('parada') || (os.statusDiario || '').toLowerCase().includes('paralisada'))).length})</span>
            </button>
            <button
              onClick={() => setFiltroDiario('ritmo_lento')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all active-press flex items-center gap-1 ${
                filtroDiario === 'ritmo_lento'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'bg-amber-500/10 text-amber-400/80 border border-amber-500/20 hover:text-amber-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Ritmo Lento ({todasEscolasDaGre.filter((s) => getOsListForSchool(s).some(os => (os.statusDiario || '').toLowerCase().includes('lento') || (os.statusDiario || '').toLowerCase().includes('ritmo'))).length})</span>
            </button>
            <button
              onClick={() => setFiltroDiario('em_andamento')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all active-press flex items-center gap-1 ${
                filtroDiario === 'em_andamento'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20 hover:text-emerald-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Em Execução ({todasEscolasDaGre.filter((s) => getOsListForSchool(s).some(os => (os.statusDiario || '').toLowerCase().includes('andamento') || (os.statusDiario || '').toLowerCase().includes('execu'))).length})</span>
            </button>
            <button
              onClick={() => setFiltroDiario('aguardando_inicio')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all active-press flex items-center gap-1 ${
                filtroDiario === 'aguardando_inicio'
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50 shadow-sm'
                  : 'bg-purple-500/10 text-purple-400/80 border border-purple-500/20 hover:text-purple-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>A Iniciar ({todasEscolasDaGre.filter((s) => getOsListForSchool(s).some(os => (os.statusDiario || '').toLowerCase().includes('início') || (os.statusDiario || '').toLowerCase().includes('inicio') || (os.statusObra || '').toUpperCase().includes('INICIAR'))).length})</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. LISTA DE CARDS DE TODAS AS ESCOLAS DA GRE */}
      <div className="px-4 space-y-3">
        {filteredSchools.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10 text-center text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Nenhuma escola encontrada nesta busca.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Verifique os filtros de município ou limpe o termo digitado.
            </p>
          </div>
        ) : (
          filteredSchools.map((school) => {
            const osList = getOsListForSchool(school);
            const isExpandida = escolaExpandidaId === school.id;
            const totalOrcadoEscola = osList.reduce((acc, os) => acc + (os.valorOrcamento || 0), 0);
            const hasObraParada = osList.some(
              (os) =>
                (os.statusDiario || '').toUpperCase().includes('PARADA') ||
                (os.statusObra || '').toUpperCase().includes('PARALISADA')
            );

            return (
              <div
                key={school.id}
                className={`rounded-2xl border backdrop-blur-xl transition-all duration-200 overflow-hidden ${
                  hasObraParada
                    ? 'bg-slate-900/90 border-rose-500/50 shadow-lg shadow-rose-950/20'
                    : osList.length > 0
                    ? 'bg-slate-900/80 border-amber-500/25 shadow-glass hover:border-amber-400/40'
                    : 'bg-slate-900/50 border-white/10 hover:border-white/20'
                }`}
              >
                {/* TOPO DO CARD DA ESCOLA (CLICÁVEL PARA EXPANDIR) */}
                <div
                  onClick={() => setEscolaExpandidaId(isExpandida ? null : school.id)}
                  className="p-3.5 cursor-pointer flex items-start justify-between gap-3 active:bg-white/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {school.municipio}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          osList.length > 0
                            ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20'
                            : 'text-slate-400 bg-white/5 border-white/10'
                        }`}
                      >
                        {osList.length === 0
                          ? '0 Orçamentos / OS'
                          : `${osList.length} ${osList.length === 1 ? 'OS Cadastrada' : 'OSs Cadastradas'}`}
                      </span>
                      {hasObraParada && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          OBRA PARADA
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-black text-white leading-snug">
                      {school.nome}
                    </h3>

                    {osList.length > 0 ? (
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300">
                        <span>Total Orçado: <strong className="text-amber-300">{formatarMoeda(totalOrcadoEscola)}</strong></span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 mt-1">
                        Toque para abrir e cadastrar orçamentos ou ordens de serviço
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="p-1 rounded-lg text-slate-400 hover:text-white bg-white/5">
                      {isExpandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* CONTEÚDO EXPANDIDO (MESMO QUE NÃO TENHA OS, EXPANDIRÁ!) */}
                {isExpandida && (
                  <div className="p-3.5 bg-slate-950/70 border-t border-white/10 space-y-3 animate-fadeIn">
                    {/* CASO A: NÃO TEM NENHUM ORÇAMENTO/OS CADASTRADO */}
                    {osList.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-white/15 text-center space-y-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Nenhum Orçamento ou OS cadastrado</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Adicione a planilha orçamentária, a ordem de serviço e os anexos em PDF para {school.nome}.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setModalSchool(school);
                            setModalOS(null);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] active-press transition-all"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>Cadastrar Orçamento & Ordem de Serviço</span>
                        </button>
                      </div>
                    ) : (
                      /* CASO B: JÁ TEM ORÇAMENTOS/OS CADASTRADOS */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-1 border-b border-white/5">
                          <span>Orçamentos e Ordens de Serviço ({osList.length}):</span>
                          <span className="text-amber-400 text-[11px]">{formatarMoeda(totalOrcadoEscola)}</span>
                        </div>

                        {osList.map((os) => {
                          const statusGeralTexto = (os.statusObra || 'EM EXECUÇÃO').toUpperCase().trim();
                          const statusDiarioTexto = (os.statusDiario || (statusGeralTexto.includes('INICIAR') ? 'AGUARDANDO INÍCIO' : 'EM ANDAMENTO')).toUpperCase().trim();

                          const isParada =
                            statusDiarioTexto.includes('PARADA') ||
                            statusDiarioTexto.includes('PARALISADA') ||
                            statusGeralTexto.includes('PARALISADA');
                          const isRitmoLento = statusDiarioTexto.includes('LENTO') || statusDiarioTexto.includes('RITMO');
                          const isAIniciar = statusGeralTexto.includes('INICIAR') || statusDiarioTexto.includes('INÍCIO');

                          // Links oficiais do Google Drive (Seção 6.1)
                          const driveOrcamentoUrl = os.orcamentoPdfUrl && os.orcamentoPdfUrl.startsWith('http') ? os.orcamentoPdfUrl : null;
                          const driveOsUrlCandidate = os.drivePdfUrl || os.osPdfUrl || os.arquivoPdfGerado;
                          const driveOsUrl = driveOsUrlCandidate && driveOsUrlCandidate.startsWith('http') ? driveOsUrlCandidate : null;

                          // Anexos locais persistidos no IndexedDB (Seção 6.2)
                          const localOrcamento = localAttachments[`${os.id}_orcamento`] || null;
                          const localOS = localAttachments[`${os.id}_os`] || null;

                          const getStatusBadgeClass = (st: string) => {
                            if (st.includes('EXECU')) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
                            if (st.includes('INICIAR')) return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
                            if (st.includes('PARALIS')) return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
                            if (st.includes('CONCLU')) return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
                            if (st.includes('CANCEL')) return 'bg-slate-700/60 text-slate-300 border border-slate-600';
                            return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
                          };

                          return (
                            <div
                              key={os.id}
                              className={`bg-slate-900 border ${
                                isParada ? 'border-rose-500/50 shadow-rose-950/30' : 'border-slate-800'
                              } rounded-2xl p-4 flex flex-col gap-3 shadow-xl transition-all`}
                            >
                              {/* Topo: Regional, Unidade Escolar, Empresa e Badges (Seção 6.3) */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                                    {String(activeGre.numero).padStart(2, '0')}ª GRE • {activeGre.sede}
                                  </span>
                                  <h4 className="text-sm font-black text-white tracking-tight leading-snug">
                                    {school.nome}
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    <span className="text-slate-300">📍 {os.municipio || school.municipio}</span> • Empresa:{' '}
                                    <strong className="text-slate-200">{os.empresaContratada}</strong>
                                  </p>
                                  {os.fiscalResponsavel && (
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      Fiscal: <strong className="text-slate-300">{os.fiscalResponsavel}</strong>
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${getStatusBadgeClass(statusGeralTexto)}`}>
                                    {statusGeralTexto}
                                  </span>

                                  {isParada ? (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                      🚨 OBRA PARADA
                                    </span>
                                  ) : isRitmoLento ? (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                      {statusDiarioTexto}
                                    </span>
                                  ) : isAIniciar ? (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                      {statusDiarioTexto}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                      {statusDiarioTexto}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Destaque: Ordem de Serviço e Valor (Seção 6.3) */}
                              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                                <div className="flex flex-col">
                                  <span className="text-[9px] uppercase font-bold text-slate-400">Ordem de Serviço (OS):</span>
                                  <span className="font-mono text-xs font-black text-blue-300 truncate">{os.numeroOS}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[9px] uppercase font-bold text-slate-400">Valor da OS:</span>
                                  <span className="font-mono text-xs font-black text-emerald-400 truncate">
                                    {formatarMoeda(os.valorOrcamento)}
                                  </span>
                                </div>
                              </div>

                              {/* Módulo Híbrido de Arquivos: Google Drive + IndexedDB Local (Seção 6) */}
                              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2.5">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                  <span>📁</span> Orçamento e Ordem de Serviço (Arquivos)
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {/* Orçamento */}
                                  <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
                                    <span className="text-[10px] font-bold text-slate-300">📑 Orçamento</span>
                                    {driveOrcamentoUrl ? (
                                      <a
                                        href={driveOrcamentoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-cyan-500/30 transition-colors"
                                      >
                                        <span>🔗</span> Ver no Drive ↗
                                      </a>
                                    ) : localOrcamento ? (
                                      <div className="flex items-center justify-between gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleViewLocalDoc(localOrcamento)}
                                          className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs truncate flex-1 text-left flex items-center gap-1"
                                          title={`Baixar / Abrir ${localOrcamento.name}`}
                                        >
                                          <span>📄</span>
                                          <span className="truncate">{localOrcamento.name}</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveLocalDoc(os.id, 'orcamento')}
                                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded"
                                          title="Remover anexo local"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ) : os.orcamentoPdfBlob ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenOrDownload(
                                            os.orcamentoPdfBlob,
                                            os.orcamentoPdfNome || `Orcamento_${os.numeroOS}.pdf`
                                          )
                                        }
                                        className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-1.5"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Baixar Orçamento</span>
                                      </button>
                                    ) : (
                                      <label className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active-press transition-colors">
                                        <span>📎</span> Anexar Orçamento
                                        <input
                                          type="file"
                                          className="hidden"
                                          accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
                                          onChange={(e) => {
                                            handleUploadLocalDoc(os.id, 'orcamento', e.target.files?.[0]);
                                            e.target.value = '';
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>

                                  {/* Ordem de Serviço (OS) */}
                                  <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
                                    <span className="text-[10px] font-bold text-slate-300">📋 Ordem de Serviço (OS)</span>
                                    {localOS ? (
                                      <div className="flex items-center justify-between gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleViewLocalDoc(localOS)}
                                          className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs truncate flex-1 text-left flex items-center gap-1"
                                          title={`Baixar / Abrir ${localOS.name}`}
                                        >
                                          <span>📄</span>
                                          <span className="truncate">{localOS.name}</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveLocalDoc(os.id, 'os')}
                                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded"
                                          title="Remover anexo local"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ) : driveOsUrl ? (
                                      <div className="flex items-center gap-1.5">
                                        <a
                                          href={driveOsUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-500/30 transition-colors"
                                        >
                                          <span>🔗</span> Ver no Drive ↗
                                        </a>
                                        <label
                                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer"
                                          title="Anexar via local no celular (IndexedDB)"
                                        >
                                          📎
                                          <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.png,.jpg,.jpeg"
                                            onChange={(e) => {
                                              handleUploadLocalDoc(os.id, 'os', e.target.files?.[0]);
                                              e.target.value = '';
                                            }}
                                          />
                                        </label>
                                      </div>
                                    ) : os.osPdfBlob ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenOrDownload(os.osPdfBlob, os.osPdfNome || `OS_${os.numeroOS}.pdf`)
                                        }
                                        className="px-2.5 py-1.5 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1.5"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Baixar OS</span>
                                      </button>
                                    ) : (
                                      <label className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active-press transition-colors">
                                        <span>📎</span> Anexar OS
                                        <input
                                          type="file"
                                          className="hidden"
                                          accept=".pdf,.png,.jpg,.jpeg"
                                          onChange={(e) => {
                                            handleUploadLocalDoc(os.id, 'os', e.target.files?.[0]);
                                            e.target.value = '';
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Seletores Rápidos de Status Geral e Situação Operacional (Seção 5.2 e 6.3) */}
                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                                <div>
                                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
                                    Status Geral
                                  </label>
                                  <select
                                    value={statusGeralTexto}
                                    onChange={(e) => handleUpdateOsField(os, 'statusObra', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                                  >
                                    <option value="EM EXECUÇÃO">EM EXECUÇÃO</option>
                                    <option value="CONCLUÍDO">CONCLUÍDO</option>
                                    <option value="A INICIAR">A INICIAR</option>
                                    <option value="AGUARDANDO SALDO">AGUARDANDO SALDO</option>
                                    <option value="PARALISADA">PARALISADA</option>
                                    <option value="CANCELADA">CANCELADA</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
                                    Situação Operacional
                                  </label>
                                  <select
                                    value={statusDiarioTexto}
                                    onChange={(e) => handleUpdateOsField(os, 'statusDiario', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                                  >
                                    <option value="EM ANDAMENTO">EM ANDAMENTO</option>
                                    <option value="PARADA">PARADA</option>
                                    <option value="RITMO LENTO">RITMO LENTO</option>
                                    <option value="AGUARDANDO INÍCIO">AGUARDANDO INÍCIO</option>
                                    <option value="CONCLUÍDO">CONCLUÍDO</option>
                                  </select>
                                </div>
                              </div>

                              {/* Ações Discretas da OS: Editar / Excluir (SEM data de término conforme Seção 5.3) */}
                              <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setModalSchool(school);
                                    setModalOS(os);
                                  }}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 flex items-center gap-1 active-press"
                                  title="Editar dados e anexos desta OS"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Editar</span>
                                </button>

                                {onDeleteOS && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Deseja realmente remover a OS ${os.numeroOS}?`)) {
                                        onDeleteOS(os.id);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center gap-1 active-press"
                                    title="Excluir OS"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Excluir</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Botão para Adicionar Mais uma OS nesta mesma Escola */}
                        <button
                          type="button"
                          onClick={() => {
                            setModalSchool(school);
                            setModalOS(null);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/15 text-amber-300 hover:text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 active-press transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Mais uma OS nesta Escola</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Prévia de Documento (Orçamento ou Memorial Descritivo) */}
      {previewDoc && (
        <DocumentPreviewModal
          os={previewDoc.os}
          tipo={previewDoc.tipo}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Modal de Anexo e Cadastro/Edição de Arquivos da OS */}
      {modalSchool && (
        <AttachOSModal
          os={modalOS}
          school={modalSchool}
          onSave={(savedOS) => {
            if (onSaveOS) onSaveOS(savedOS);
            setModalSchool(null);
            setModalOS(null);
            setEscolaExpandidaId(savedOS.escolaId);
          }}
          onClose={() => {
            setModalSchool(null);
            setModalOS(null);
          }}
        />
      )}
    </div>
  );
};
