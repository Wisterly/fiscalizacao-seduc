import React, { useState } from 'react';
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
  FolderSearch
} from 'lucide-react';
import { OrdemServico, GRE, Escola } from '../../types';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { AttachOSModal } from './AttachOSModal';
import { GreSelector } from '../vistorias/GreSelector';
import { syncAtaFromGoogleSheets } from '../../services/sheetsSyncService';
import { storage } from '../../services/storageService';
import { driveOSScanner } from '../../services/driveOSScannerService';

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
  const [filtroDiario, setFiltroDiario] = useState<'todos' | 'parada' | 'ritmo_lento' | 'em_andamento'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [escolaExpandidaId, setEscolaExpandidaId] = useState<string | null>(null);

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

  // Municípios da GRE selecionada
  const municipiosDaGre = Array.from(new Set(schoolsDaGre.map((s) => s.municipio))).sort();

  // Função utilitária de normalização de texto
  const normStr = (str?: string) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .trim();

  // Helper para obter as OSs da escola com verificação por ID, INEP e Nome Normalizado
  const getOsListForSchool = (school: Escola) => {
    const schoolNorm = normStr(school.nome);
    return osDaGre.filter((os) => {
      if (os.escolaId && os.escolaId === school.id) return true;
      if (school.inep && school.inep !== 'S/ INEP' && os.escolaId === `inep-${school.inep}`) return true;
      const osNorm = normStr(os.escolaNome);
      return osNorm === schoolNorm;
    });
  };

  // Filtragem das escolas segundo as diretrizes estritas do usuário:
  // - Com OS: apenas escolas com ordem de serviço em EXECUÇÃO na Coluna R
  // - Sem OS: escolas sem ordem de serviço em execução (concluída, cancelada, aguardando saldo, a iniciar ou sem OS)
  const filteredSchools = schoolsDaGre.filter((school) => {
    const osDaEscola = getOsListForSchool(school);

    const matchesMun = selectedMunicipio === 'todos' || school.municipio === selectedMunicipio;

    // Tem OS em Execução (Coluna R = EXECUÇÃO)
    const hasOsEmExecucao = osDaEscola.some(
      (os) => (os.statusObra || '').toUpperCase().includes('EXECU') || os.status === 'ativa'
    );

    const matchesStatus =
      filtroStatus === 'todas' ||
      (filtroStatus === 'com_os' && hasOsEmExecucao) ||
      (filtroStatus === 'sem_os' && !hasOsEmExecucao);

    // Filtro pelo Status Diário da Coluna S (Parada, Ritmo Lento, Em andamento)
    const matchesDiario =
      filtroDiario === 'todos' ||
      osDaEscola.some((os) => {
        const s = (os.statusDiario || '').toLowerCase();
        if (filtroDiario === 'parada') return s.includes('parada') || s.includes('paralisada');
        if (filtroDiario === 'ritmo_lento') return s.includes('lento') || s.includes('ritmo');
        if (filtroDiario === 'em_andamento') return s.includes('andamento') || s.includes('execu');
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
          normStr(os.statusDiario).includes(termNorm)
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
                Sede: {activeGre.sede} • {schoolsDaGre.length} escolas • {osDaGre.length} OSs cadastradas
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
              <span>Com OS ({schoolsDaGre.filter((s) => getOsListForSchool(s).some(os => (os.statusObra || '').toUpperCase().includes('EXECU') || os.status === 'ativa')).length})</span>
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
              Sem OS ({schoolsDaGre.filter((s) => !getOsListForSchool(s).some(os => (os.statusObra || '').toUpperCase().includes('EXECU') || os.status === 'ativa')).length})
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
              Todas ({schoolsDaGre.length})
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

        {/* SUB-PÍLULAS DE STATUS DIÁRIO (Coluna S: Parada, Ritmo Lento, Em andamento) */}
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
              <span>Parada ({schoolsDaGre.filter((s) => getOsListForSchool(s).some(os => (os.statusDiario || '').toLowerCase().includes('parada') || (os.statusDiario || '').toLowerCase().includes('paralisada'))).length})</span>
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
              <span>Ritmo Lento ({schoolsDaGre.filter((s) => getOsListForSchool(s).some(os => (os.statusDiario || '').toLowerCase().includes('lento') || (os.statusDiario || '').toLowerCase().includes('ritmo'))).length})</span>
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
              <span>Em Execução ({schoolsDaGre.filter((s) => getOsListForSchool(s).some(os => (os.statusDiario || '').toLowerCase().includes('andamento') || (os.statusDiario || '').toLowerCase().includes('execu'))).length})</span>
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

            return (
              <div
                key={school.id}
                className={`rounded-2xl border backdrop-blur-xl transition-all duration-200 overflow-hidden ${
                  osList.length > 0
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
                          const temOSPdf = Boolean(os.osPdfBlob || os.osPdfUrl || os.arquivoPdfGerado);
                          const temOrcamentoPdf = Boolean(os.orcamentoPdfBlob || os.orcamentoPdfUrl || os.orcamentoPdfSimulado);
                          const driveBase = storage.getDriveObrasUrl();

                          const handleDownloadOS = () => {
                            if (os.osPdfBlob) {
                              handleOpenOrDownload(os.osPdfBlob, os.osPdfNome || `OS_${os.numeroOS}.pdf`);
                            } else if (os.osPdfUrl && os.osPdfUrl.startsWith('http')) {
                              window.open(os.osPdfUrl, '_blank');
                            } else if (os.arquivoPdfGerado && os.arquivoPdfGerado.startsWith('http')) {
                              window.open(os.arquivoPdfGerado, '_blank');
                            } else {
                              const linkDrive = driveOSScanner.gerarLinkBuscaDrive(os.greId, os.numeroOS);
                              window.open(linkDrive, '_blank');
                            }
                          };

                          const handleDownloadOrcamento = () => {
                            if (os.orcamentoPdfBlob) {
                              handleOpenOrDownload(
                                os.orcamentoPdfBlob,
                                os.orcamentoPdfNome || `Orcamento_${os.numeroOS}.pdf`
                              );
                            } else if (os.orcamentoPdfUrl && os.orcamentoPdfUrl.startsWith('http')) {
                              window.open(os.orcamentoPdfUrl, '_blank');
                            } else if (driveBase) {
                              window.open(driveBase, '_blank');
                            } else {
                              setPreviewDoc({ os, tipo: 'orcamento' });
                            }
                          };

                          // O usuário solicitou que o status exibido em destaque seja o STATUS DIÁRIO (Coluna S da Planilha da Ata)
                          const statusDiarioTexto = (os.statusDiario || os.statusObra || 'Em andamento').trim();
                          const isParada = statusDiarioTexto.toLowerCase().includes('parada') || statusDiarioTexto.toLowerCase().includes('paralisada');
                          const isRitmoLento = statusDiarioTexto.toLowerCase().includes('lento') || statusDiarioTexto.toLowerCase().includes('ritmo');
                          const isAIniciar = statusDiarioTexto.toLowerCase().includes('iniciar') || (os.statusObra || '').toUpperCase().includes('INICIAR');
                          const isAndamento = !isAIniciar && (statusDiarioTexto.toLowerCase().includes('andamento') || statusDiarioTexto.toLowerCase().includes('execu'));
                          const isPendencia = statusDiarioTexto.toLowerCase().includes('pend');

                          return (
                            <div
                              key={os.id}
                              className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3 shadow-md"
                            >
                              {/* Topo da OS com Status Diário em Destaque Obrigatório */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/25 shadow-sm">
                                      OS Nº {os.numeroOS}
                                    </span>

                                    {/* BADGE DE STATUS DIÁRIO (Coluna S / Status Geral R) */}
                                    <span
                                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                                        isParada
                                          ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-red-500/10'
                                          : isRitmoLento
                                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10'
                                          : isAIniciar
                                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-blue-500/10'
                                          : isAndamento
                                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                                          : isPendencia
                                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                      }`}
                                    >
                                      <span
                                        className={`w-2 h-2 rounded-full animate-pulse ${
                                          isParada
                                            ? 'bg-red-400'
                                            : isRitmoLento
                                            ? 'bg-amber-400'
                                            : isAIniciar
                                            ? 'bg-blue-400'
                                            : isAndamento
                                            ? 'bg-emerald-400'
                                            : isPendencia
                                            ? 'bg-purple-400'
                                            : 'bg-cyan-400'
                                        }`}
                                      />
                                      <span>● {statusDiarioTexto.toUpperCase()}</span>
                                    </span>
                                  </div>

                                  <p className="text-xs font-extrabold text-white mt-1.5 leading-snug">
                                    {os.objeto || 'Serviços de Manutenção Predial e Reforma Geral'}
                                  </p>

                                  <div className="text-[11px] text-slate-300 mt-1 space-y-0.5">
                                    <p>
                                      Empresa: <strong className="text-white">{os.empresaContratada}</strong>
                                      {os.contratoNumero && (
                                        <span className="text-slate-400 ml-1.5">• Contrato: <strong className="text-amber-200">{os.contratoNumero}</strong></span>
                                      )}
                                    </p>
                                    {os.fiscalResponsavel && (
                                      <p className="text-slate-400">
                                        Fiscal Responsável: <strong className="text-slate-300">{os.fiscalResponsavel}</strong>
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[10px] text-slate-400 block font-medium">Valor Orçado</span>
                                  <span className="text-xs sm:text-sm font-extrabold text-amber-400 font-mono">
                                    {formatarMoeda(os.valorOrcamento)}
                                  </span>
                                </div>
                              </div>

                              {/* INDICAÇÃO DE ANEXO AUTOMÁTICO DE OS OU STATUS DOS ARQUIVOS */}
                              <div className="flex items-center justify-between gap-1 text-[10px] px-1 text-slate-400">
                                <span className="flex items-center gap-1 truncate">
                                  {os.osAnexoAutomatico ? (
                                    <span className="text-emerald-400 font-semibold flex items-center gap-1 truncate">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                      OS vinculada automaticamente do Drive: <strong className="text-white truncate">{os.osPdfNome || 'Arquivo PDF'}</strong>
                                    </span>
                                  ) : (
                                    <span>OS: {os.osPdfNome || 'Pasta Geral do Drive'}</span>
                                  )}
                                </span>

                                <span className="text-amber-300 font-medium shrink-0">
                                  {temOrcamentoPdf ? 'Orçamento anexado' : 'Orçamento: Anexo Manual'}
                                </span>
                              </div>

                              {/* BOTÕES DE DOWNLOAD DO ORÇAMENTO E DA ORDEM DE SERVIÇO EM DESTAQUE */}
                              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                                {/* Botão Orçamento (Processo Manual Conforme Especificado) */}
                                <button
                                  type="button"
                                  onClick={handleDownloadOrcamento}
                                  className="p-2.5 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all active-press border bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 shadow-sm"
                                  title="Baixar ou anexar manualmente o arquivo de Orçamento (PDF / Planilha)"
                                >
                                  {temOrcamentoPdf ? (
                                    <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                  ) : (
                                    <Plus className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                  )}
                                  <span className="truncate">
                                    {temOrcamentoPdf ? 'Baixar Orçamento' : '+ Anexar Orçamento (Manual)'}
                                  </span>
                                </button>

                                {/* Botão Baixar Ordem de Serviço (Localizada e Anexada Automaticamente do Drive) */}
                                <button
                                  type="button"
                                  onClick={handleDownloadOS}
                                  className="p-2.5 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all active-press border bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 shadow-sm"
                                  title="Baixar ou visualizar Ordem de Serviço (PDF localizado automaticamente no Drive)"
                                >
                                  <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span className="truncate">Baixar Ordem de Serviço</span>
                                </button>
                              </div>

                              {/* Ações da OS: Editar / Excluir */}
                              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                                <span className="text-slate-400">
                                  Vigência: <strong className="text-slate-300">{os.prazoFinal || '180 dias'}</strong>
                                </span>

                                <div className="flex items-center gap-2">
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
