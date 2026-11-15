import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  ArrowLeft,
  X,
  Building,
  DollarSign,
  Calendar,
  CheckCircle2,
  Sliders,
  Check,
  Plus,
  Link as LinkIcon,
  Upload,
  FileText,
  Trash2,
  Edit3,
  RefreshCw,
  FolderOpen,
  Layers,
  Sparkles
} from 'lucide-react';
import { OrdemServico, GRE, Escola } from '../../types';
import { GreSelector } from '../vistorias/GreSelector';
import { syncAtaFromGoogleSheets } from '../../services/sheetsSyncService';
import { storage } from '../../services/storageService';

interface MedicoesViewProps {
  ordensServico: OrdemServico[];
  gres: GRE[];
  schools: Escola[];
  selectedGre?: GRE | null;
  onSelectGre?: (gre: GRE | null) => void;
  onUpdateMedicao: (osId: string, novoPercentual: number, novaObservacao?: string) => void;
  onSaveOS?: (os: OrdemServico) => void;
  onDeleteOS?: (osId: string) => void;
  onBack?: () => void;
}

export const MedicoesView: React.FC<MedicoesViewProps> = ({
  ordensServico,
  gres,
  schools,
  selectedGre,
  onSelectGre,
  onUpdateMedicao,
  onSaveOS,
  onDeleteOS,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [escolaExpandidaId, setEscolaExpandidaId] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'com_medicao' | 'sem_medicao'>('todas');

  // Modais de Ação
  const [schoolParaCadastroManual, setSchoolParaCadastroManual] = useState<Escola | null>(null);
  const [schoolParaVincularOS, setSchoolParaVincularOS] = useState<Escola | null>(null);
  const [osParaAtualizar, setOsParaAtualizar] = useState<OrdemServico | null>(null);

  // Sincronização ao vivo da Ata de Manutenção
  const [syncingAta, setSyncingAta] = useState(false);

  const handleSyncAtaLive = async () => {
    setSyncingAta(true);
    try {
      const updatedOS = await syncAtaFromGoogleSheets(schools);
      storage.syncOrdensServicoFromAta(updatedOS);
      if (onSaveOS && updatedOS.length > 0) {
        onSaveOS(updatedOS[0]);
      }
      alert(`Sincronização concluída! ${updatedOS.length} ordens de serviço atualizadas com a base da SEDUC.`);
    } catch (e: any) {
      alert(`Erro ao sincronizar ata: ${e?.message || e}`);
    } finally {
      setSyncingAta(false);
    }
  };

  // SE NÃO HOUVER GRE SELECIONADA: Mostra o GreSelector oficial!
  if (!activeGre) {
    return (
      <div className="w-full pb-20 pt-1 px-4 animate-fadeIn">
        <GreSelector
          gres={gres}
          schools={schools}
          selectedGreId={null}
          titulo="1. Selecionar a GRE para Medições de Obras"
          subtitulo="Acompanhe percentual de medição, contratos ativos e saldos por escola"
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

  // Estatísticas Consolidadas da GRE
  const totalValorContratado = osDaGre.reduce((acc, os) => acc + (os.valorOrcamento || 0), 0);
  const totalValorMedido = osDaGre.reduce(
    (acc, os) => acc + ((os.valorOrcamento || 0) * (os.percentualMedicao || 0)) / 100,
    0
  );
  const mediaMedicaoGre =
    osDaGre.length > 0
      ? Math.round(osDaGre.reduce((acc, os) => acc + (os.percentualMedicao || 0), 0) / osDaGre.length)
      : 0;

  // Filtragem de escolas com busca e filtros
  const filteredSchools = schoolsDaGre.filter((school) => {
    const osDaEscola = osDaGre.filter(
      (os) => os.escolaId === school.id || os.escolaNome.toLowerCase() === school.nome.toLowerCase()
    );

    const matchesMun = selectedMunicipio === 'todos' || school.municipio === selectedMunicipio;

    const matchesStatus =
      filtroStatus === 'todas' ||
      (filtroStatus === 'com_medicao' && osDaEscola.length > 0) ||
      (filtroStatus === 'sem_medicao' && osDaEscola.length === 0);

    const matchesSearch =
      !searchTerm ||
      school.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      osDaEscola.some(
        (os) =>
          os.numeroOS.toLowerCase().includes(searchTerm.toLowerCase()) ||
          os.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          os.empresaContratada.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesMun && matchesStatus && matchesSearch;
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
                Sede: {activeGre.sede} • {schoolsDaGre.length} escolas • {osDaGre.length} contratos
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
            {String(activeGre.numero).padStart(2, '0')}ª GRE
          </span>
        </div>

        {/* Seletor de Município */}
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

      {/* 2. CARDS DE RESUMO CONSOLIDADO DA GRE */}
      <div className="px-4 mb-3.5 grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/60 to-slate-950/80 border border-amber-500/20 flex flex-col justify-between">
          <span className="text-[10px] text-amber-400/90 font-semibold block">Média Medição</span>
          <span className="text-lg font-black text-amber-300 mt-0.5">{mediaMedicaoGre}%</span>
          <span className="text-[9px] text-slate-400">Progresso Regional</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950/80 border border-cyan-500/20 flex flex-col justify-between">
          <span className="text-[10px] text-cyan-400/90 font-semibold block">Total em OS</span>
          <span className="text-lg font-black text-cyan-300 mt-0.5">{osDaGre.length}</span>
          <span className="text-[9px] text-slate-400">Contratos Ativos</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950/80 border border-emerald-500/20 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-400/90 font-semibold block">Valor Medido</span>
          <span className="text-xs font-black text-emerald-300 mt-1 truncate">{formatarMoeda(totalValorMedido)}</span>
          <span className="text-[9px] text-slate-400 truncate">de {formatarMoeda(totalValorContratado)}</span>
        </div>
      </div>

      {/* 3. CAMPO DE BUSCA */}
      <div className="px-4 mb-3.5">
        <div className="relative flex items-center rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md px-3.5 py-2 shadow-sm focus-within:border-amber-400/70 transition-colors">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder={
              selectedMunicipio !== 'todos'
                ? `Buscar medição ou escola em ${selectedMunicipio}...`
                : 'Buscar por escola, OS ou empresa...'
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

      {/* 4. PÍLULAS DE STATUS & SINCRONIZAÇÃO */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setFiltroStatus('todas')}
              className={`px-3 py-1.5 rounded-full text-xs transition-all active-press ${
                filtroStatus === 'todas'
                  ? 'border-2 border-amber-400 bg-amber-500/15 text-amber-300 font-extrabold shadow-[0_0_12px_rgba(234,179,8,0.25)]'
                  : 'border border-white/10 bg-slate-900/60 text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              Todas ({schoolsDaGre.length})
            </button>

            <button
              onClick={() => setFiltroStatus('com_medicao')}
              className={`px-3 py-1.5 rounded-full text-xs transition-all active-press ${
                filtroStatus === 'com_medicao'
                  ? 'border-2 border-cyan-400 bg-cyan-500/15 text-cyan-300 font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'border border-white/10 bg-slate-900/60 text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              Com Medição ({schoolsDaGre.filter((s) => osDaGre.some((o) => o.escolaId === s.id || o.escolaNome.toLowerCase() === s.nome.toLowerCase())).length})
            </button>

            <button
              onClick={() => setFiltroStatus('sem_medicao')}
              className={`px-3 py-1.5 rounded-full text-xs transition-all active-press ${
                filtroStatus === 'sem_medicao'
                  ? 'border-2 border-slate-400 bg-white/10 text-white font-extrabold'
                  : 'border border-white/10 bg-slate-900/60 text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              Sem Medição ({schoolsDaGre.filter((s) => !osDaGre.some((o) => o.escolaId === s.id || o.escolaNome.toLowerCase() === s.nome.toLowerCase())).length})
            </button>
          </div>

          <button
            type="button"
            onClick={handleSyncAtaLive}
            disabled={syncingAta}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 active-press disabled:opacity-50 shrink-0"
            title="Sincronizar medições e contratos da Ata SEDUC"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingAta ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5. LISTA DE CARDS DE TODAS AS ESCOLAS DA GRE */}
      <div className="px-4 space-y-3">
        {filteredSchools.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10 text-center text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Nenhuma escola encontrada nesta busca.</p>
            <p className="text-[11px] text-slate-500 mt-1">Tente buscar por outro termo ou limpe o filtro.</p>
          </div>
        ) : (
          filteredSchools.map((school) => {
            const osList = osDaGre.filter(
              (os) => os.escolaId === school.id || os.escolaNome.toLowerCase() === school.nome.toLowerCase()
            );
            const isExpandida = escolaExpandidaId === school.id;

            // Percentual consolidado da escola
            const percConsolidado =
              osList.length > 0
                ? Math.round(osList.reduce((acc, os) => acc + (os.percentualMedicao || 0), 0) / osList.length)
                : 0;

            const valorTotalEscola = osList.reduce((acc, os) => acc + (os.valorOrcamento || 0), 0);
            const valorMedidoEscola = osList.reduce(
              (acc, os) => acc + ((os.valorOrcamento || 0) * (os.percentualMedicao || 0)) / 100,
              0
            );
            const saldoRestanteEscola = Math.max(0, valorTotalEscola - valorMedidoEscola);

            return (
              <div
                key={school.id}
                className={`rounded-2xl border backdrop-blur-xl transition-all duration-200 overflow-hidden ${
                  osList.length > 0
                    ? 'bg-slate-900/80 border-amber-500/25 shadow-glass hover:border-amber-400/40'
                    : 'bg-slate-900/50 border-white/10 hover:border-white/20'
                }`}
              >
                {/* CABEÇALHO DO CARD DA ESCOLA (CLICÁVEL PARA EXPANDIR) */}
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
                          ? '0 Medições / OS'
                          : `${osList.length} ${osList.length === 1 ? 'OS Vinculada' : 'OS Vinculadas'}`}
                      </span>
                    </div>

                    <h3 className="text-xs font-black text-white leading-snug">
                      {school.nome}
                    </h3>

                    {osList.length > 0 ? (
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-300">
                        <span>Contratado: <strong className="text-white">{formatarMoeda(valorTotalEscola)}</strong></span>
                        <span>•</span>
                        <span>Medido: <strong className="text-emerald-300">{formatarMoeda(valorMedidoEscola)}</strong></span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 mt-1">
                        Toque para abrir e cadastrar ou vincular ordens de serviço e medições
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {osList.length > 0 ? (
                      <span className="text-xs font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl shadow-glass-glow-gold">
                        {percConsolidado}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
                        0% Medido
                      </span>
                    )}

                    <span className="p-1 rounded-lg text-slate-400 hover:text-white bg-white/5 mt-1">
                      {isExpandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* BARRA DE MEDIÇÃO ESTILIZADA NEON TURQUESA COM DOURADO */}
                {osList.length > 0 && (
                  <div className="px-3.5 pb-3">
                    <div
                      onClick={() => setEscolaExpandidaId(isExpandida ? null : school.id)}
                      className="relative w-full h-7 rounded-full border-2 border-cyan-400 bg-slate-950/80 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer overflow-hidden transition-all"
                      title="Clique para expandir e editar medições"
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 transition-all duration-300 shadow-glass-glow-gold"
                        style={{ width: `${percConsolidado}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[11px] font-black text-white tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                          {percConsolidado}% Medido Consolidado
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* DETALHES EXPANDIDOS (SEMPRE ABRE AO CLICAR, MESMO ZERADA!) */}
                {isExpandida && (
                  <div className="p-3.5 bg-slate-950/70 border-t border-white/10 space-y-3 animate-fadeIn">
                    {/* CASO A: NÃO TEM NENHUMA OS/MEDIÇÃO NESSA ESCOLA */}
                    {osList.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-white/15 text-center space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Nenhuma Medição ou OS nesta Escola</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Você pode cadastrar as medições manualmente ou vincular ordens de serviço já existentes.
                          </p>
                        </div>

                        {/* As 2 opções solicitadas pelo usuário */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setSchoolParaCadastroManual(school)}
                            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] active-press transition-all"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>Cadastrar Manualmente</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSchoolParaVincularOS(school)}
                            className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-cyan-400/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 active-press transition-all"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Vincular de OS Existente</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* CASO B: JÁ TEM MEDIÇÕES / OS CADASTRADAS */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-1 border-b border-white/5">
                          <span>Ordens de Serviço & Medições ({osList.length}):</span>
                          <span className="text-amber-400 text-[11px]">Saldo Restante: {formatarMoeda(saldoRestanteEscola)}</span>
                        </div>

                        {osList.map((os) => {
                          const percOS = os.percentualMedicao || 0;
                          const valMedidoOS = ((os.valorOrcamento || 0) * percOS) / 100;
                          const valSaldoOS = Math.max(0, (os.valorOrcamento || 0) - valMedidoOS);

                          return (
                            <div
                              key={os.id}
                              className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-2.5 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                      {os.numeroOS}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      Empresa: <strong className="text-slate-300">{os.empresaContratada}</strong>
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-white mt-1 leading-snug">
                                    {os.objeto || 'Reforma geral'}
                                  </p>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-xs font-black text-cyan-300 font-mono">
                                    {percOS}%
                                  </span>
                                  <span className="text-[9px] text-slate-400 block">Medido</span>
                                </div>
                              </div>

                              {/* Barra de progresso individual da OS */}
                              <div className="space-y-1">
                                <div className="w-full h-3 bg-slate-950 rounded-full border border-white/10 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full transition-all duration-300"
                                    style={{ width: `${percOS}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                                  <span>Medido: <strong className="text-emerald-300">{formatarMoeda(valMedidoOS)}</strong></span>
                                  <span>Saldo: <strong className="text-amber-400">{formatarMoeda(valSaldoOS)}</strong></span>
                                  <span>Total: <strong className="text-white">{formatarMoeda(os.valorOrcamento)}</strong></span>
                                </div>
                              </div>

                              {/* Última observação do fiscal */}
                              {os.observacoes && os.observacoes.length > 0 && (
                                <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5 text-[10px] text-slate-300">
                                  <span className="text-slate-400 font-semibold">Último Parecer ({os.observacoes[0].data}): </span>
                                  <span>{os.observacoes[0].texto}</span>
                                </div>
                              )}

                              {/* Ações da Medição */}
                              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                <button
                                  type="button"
                                  onClick={() => setOsParaAtualizar(os)}
                                  className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 active-press transition-all shadow-sm"
                                >
                                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Lançar / Atualizar Medição</span>
                                </button>

                                {onDeleteOS && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Deseja desvincular/remover a OS ${os.numeroOS}?`)) {
                                        onDeleteOS(os.id);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 active-press"
                                    title="Remover OS desta escola"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Botões para Adicionar Mais Medições nesta Escola */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setSchoolParaCadastroManual(school)}
                            className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/15 text-cyan-300 font-bold text-[11px] flex items-center justify-center gap-1 active-press"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Medição Manual</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSchoolParaVincularOS(school)}
                            className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/15 text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1 active-press"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>+ Vincular OS</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CADASTRO MANUAL DE MEDIÇÃO & OS                  */}
      {/* ======================================================== */}
      {schoolParaCadastroManual && (
        <ModalCadastroMedicaoManual
          school={schoolParaCadastroManual}
          onSave={(newOS) => {
            if (onSaveOS) onSaveOS(newOS);
            setSchoolParaCadastroManual(null);
            setEscolaExpandidaId(newOS.escolaId);
          }}
          onClose={() => setSchoolParaCadastroManual(null)}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 2: VINCULAR DE ORÇAMENTO / OS EXISTENTE DA GRE     */}
      {/* ======================================================== */}
      {schoolParaVincularOS && (
        <ModalVincularOS
          school={schoolParaVincularOS}
          todasOS={ordensServico}
          onVincular={(selectedOS) => {
            // Clona ou associa a OS à escola
            const updated: OrdemServico = {
              ...selectedOS,
              id: `os-${Date.now()}`,
              escolaId: schoolParaVincularOS.id,
              escolaNome: schoolParaVincularOS.nome,
              greId: schoolParaVincularOS.greId,
              municipio: schoolParaVincularOS.municipio
            };
            if (onSaveOS) onSaveOS(updated);
            setSchoolParaVincularOS(null);
            setEscolaExpandidaId(schoolParaVincularOS.id);
          }}
          onSyncAta={handleSyncAtaLive}
          syncing={syncingAta}
          onClose={() => setSchoolParaVincularOS(null)}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 3: LANÇAR / ATUALIZAR MEDIÇÃO DA OS                */}
      {/* ======================================================== */}
      {osParaAtualizar && (
        <ModalAtualizarMedicao
          os={osParaAtualizar}
          onSave={(novoPercentual, novaObs) => {
            onUpdateMedicao(osParaAtualizar.id, novoPercentual, novaObs);
            setOsParaAtualizar(null);
          }}
          onClose={() => setOsParaAtualizar(null)}
        />
      )}
    </div>
  );
};

// ================================================================
// SUBCOMPONENTE: MODAL DE CADASTRO MANUAL DE MEDIÇÃO & OS
// ================================================================
interface ModalCadastroMedicaoManualProps {
  school: Escola;
  onSave: (os: OrdemServico) => void;
  onClose: () => void;
}

const ModalCadastroMedicaoManual: React.FC<ModalCadastroMedicaoManualProps> = ({
  school,
  onSave,
  onClose
}) => {
  const [numeroOS, setNumeroOS] = useState('');
  const [objeto, setObjeto] = useState('');
  const [empresaContratada, setEmpresaContratada] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [percentualMedicao, setPercentualMedicao] = useState(0);
  const [observacao, setObservacao] = useState('');
  const [boletimNome, setBoletimNome] = useState('');
  const [boletimBlob, setBoletimBlob] = useState('');

  const valorNum = parseFloat(valorTotal.replace(',', '.')) || 0;
  const valorMedidoCalculado = (valorNum * percentualMedicao) / 100;
  const saldoRestanteCalculado = Math.max(0, valorNum - valorMedidoCalculado);

  const handleUploadBoletim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBoletimNome(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBoletimBlob(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroOS.trim()) {
      alert('Por favor, informe o número da Ordem de Serviço.');
      return;
    }

    const novaOS: OrdemServico = {
      id: `os-${Date.now()}`,
      numeroOS: numeroOS.trim(),
      escolaId: school.id,
      escolaNome: school.nome,
      greId: school.greId,
      municipio: school.municipio,
      objeto: objeto.trim() || 'Reforma geral e manutenção escolar',
      empresaContratada: empresaContratada.trim() || 'Empresa Contratada SEDUC',
      valorOrcamento: valorNum,
      percentualMedicao: percentualMedicao,
      dataInicio: new Date().toISOString().split('T')[0],
      prazoFinal: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      status: percentualMedicao >= 100 ? 'historico' : 'ativa',
      orcamentoPdfSimulado: 'orcamento.pdf',
      memorialDescritivoPdfSimulado: 'memorial.pdf',
      osPdfBlob: boletimBlob || undefined,
      osPdfNome: boletimNome || undefined,
      observacoes: [
        {
          id: `obs-${Date.now()}`,
          data: new Date().toLocaleDateString('pt-BR'),
          texto: observacao.trim() || `Medição inicial cadastrada em ${percentualMedicao}% pelo fiscal de obras.`,
          autor: 'Fiscal de Obras GPR'
        }
      ]
    };

    onSave(novaOS);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
    >
      <div className="w-full max-w-md bg-[#0D1424] border border-cyan-400/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                Cadastrar Nova Medição & OS
              </span>
              <h3 className="font-bold text-white text-xs truncate">{school.nome}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 active-press"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário com Scroll Suave */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto no-scrollbar">
          {/* Número da OS & Valor Total */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Número da OS / Contrato *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: OS 028/2026"
                value={numeroOS}
                onChange={(e) => setNumeroOS(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Valor Total Contrato (R$)
              </label>
              <input
                type="text"
                placeholder="Ex: 180000"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-amber-300 font-bold placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Empresa Contratada / Empreiteira
            </label>
            <input
              type="text"
              placeholder="Razão Social ou Nome Fantasia"
              value={empresaContratada}
              onChange={(e) => setEmpresaContratada(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Objeto da Obra / Escopo da Reforma
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Reforma da cobertura, revestimentos cerâmicos e pintura..."
              value={objeto}
              onChange={(e) => setObjeto(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {/* SLIDER DE MEDIÇÃO COM CÁLCULO EM R$ AO VIVO */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-400/40 space-y-2.5 shadow-glass">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-cyan-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Percentual Medido Atual:
              </span>
              <span className="text-white font-mono text-sm px-2.5 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 font-black shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                {percentualMedicao}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={percentualMedicao}
              onChange={(e) => setPercentualMedicao(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
              <span className="text-slate-400">
                Valor Medido: <strong className="text-emerald-300">{valorMedidoCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
              </span>
              <span className="text-slate-400">
                Saldo: <strong className="text-amber-400">{saldoRestanteCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
              </span>
            </div>
          </div>

          {/* Observação / Parecer do Fiscal */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Observações / Parecer do Fiscal
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Executados serviços preliminares e reforço de pilares..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {/* Anexo de Boletim de Medição (PDF ou Foto) */}
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Boletim de Medição / Relatório (PDF ou Imagem)
            </span>
            <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-xs font-semibold text-slate-300 cursor-pointer active-press">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>{boletimNome ? `Anexo: ${boletimNome}` : 'Anexar Boletim / Planilha de Medição'}</span>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleUploadBoletim}
                className="hidden"
              />
            </label>
            {boletimNome && (
              <div className="flex items-center justify-between text-[10px] text-emerald-300">
                <span>Arquivo anexado com sucesso</span>
                <button
                  type="button"
                  onClick={() => {
                    setBoletimNome('');
                    setBoletimBlob('');
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  Remover
                </button>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-800/80 border border-white/10 text-xs font-bold text-slate-300 hover:text-white active-press"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 active-press shadow-[0_0_16px_rgba(6,182,212,0.35)]"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              Salvar Medição
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ================================================================
// SUBCOMPONENTE: MODAL PARA VINCULAR DE OS EXISTENTE OU DA ATA
// ================================================================
interface ModalVincularOSProps {
  school: Escola;
  todasOS: OrdemServico[];
  onVincular: (os: OrdemServico) => void;
  onSyncAta: () => void;
  syncing: boolean;
  onClose: () => void;
}

const ModalVincularOS: React.FC<ModalVincularOSProps> = ({
  school,
  todasOS,
  onVincular,
  onSyncAta,
  syncing,
  onClose
}) => {
  // OSs compatíveis: ou pertencem à mesma escola ou à mesma GRE
  const osCandidatas = todasOS.filter(
    (os) => os.greId === school.greId || os.escolaId === school.id || os.escolaNome.toLowerCase() === school.nome.toLowerCase()
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
    >
      <div className="w-full max-w-md bg-[#0D1424] border border-cyan-400/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Topo */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2 min-w-0">
            <LinkIcon className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-white text-xs truncate">Vincular Ordem de Serviço</h3>
              <p className="text-[10px] text-slate-400 truncate">{school.nome}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de OSs Disponíveis para Vincular */}
        <div className="p-4 space-y-3 overflow-y-auto no-scrollbar flex-1">
          {osCandidatas.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-dashed border-white/15 text-center space-y-3">
              <Layers className="w-8 h-8 text-amber-400 mx-auto" />
              <div>
                <h4 className="text-xs font-bold text-white">Nenhuma OS encontrada nesta GRE</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Você pode sincronizar os contratos da Ata SEDUC do Google Sheets ou cadastrar uma OS manualmente.
                </p>
              </div>
              <button
                type="button"
                onClick={onSyncAta}
                disabled={syncing}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 active-press disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Sincronizar Contratos da Ata SEDUC</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                Selecione uma OS cadastrada para vincular:
              </span>
              {osCandidatas.map((os) => (
                <div
                  key={os.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-white/10 hover:border-cyan-400/50 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-amber-300">
                      {os.numeroOS}
                    </span>
                    <span className="text-xs font-bold text-emerald-300">
                      {os.valorOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-white font-semibold line-clamp-1">{os.objeto}</p>
                  <p className="text-[10px] text-slate-400">
                    Origem: {os.escolaNome} • {os.empresaContratada}
                  </p>
                  <button
                    type="button"
                    onClick={() => onVincular(os)}
                    className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 active-press"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Vincular a esta Escola e Iniciar Medição</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ================================================================
// SUBCOMPONENTE: MODAL DE ATUALIZAR / LANÇAR MEDIÇÃO DA OS
// ================================================================
interface ModalAtualizarMedicaoProps {
  os: OrdemServico;
  onSave: (novoPercentual: number, novaObservacao: string) => void;
  onClose: () => void;
}

const ModalAtualizarMedicao: React.FC<ModalAtualizarMedicaoProps> = ({
  os,
  onSave,
  onClose
}) => {
  const [percentual, setPercentual] = useState(os.percentualMedicao || 0);
  const [observacao, setObservacao] = useState('');

  const valorMedido = ((os.valorOrcamento || 0) * percentual) / 100;
  const saldoRestante = Math.max(0, (os.valorOrcamento || 0) - valorMedido);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(percentual, observacao);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
    >
      <div className="w-full max-w-md bg-[#0D1424] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Topo */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2 min-w-0">
            <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-white text-xs truncate">Atualizar Medição • {os.numeroOS}</h3>
              <p className="text-[10px] text-slate-400 truncate">{os.escolaNome}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto no-scrollbar">
          {/* Card com Controle Deslizante de Percentual */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3 shadow-glass">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">Novo Percentual Medido:</span>
              <span className="text-lg font-black font-mono text-white px-3 py-0.5 rounded-xl bg-amber-500/20 border border-amber-500/40 shadow-glass-glow-gold">
                {percentual}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={percentual}
              onChange={(e) => setPercentual(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2.5 bg-slate-800 rounded-lg"
            />

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Valor Medido</span>
                <strong className="text-emerald-300 font-mono">
                  {valorMedido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Saldo Contratual</span>
                <strong className="text-amber-400 font-mono">
                  {saldoRestante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </strong>
              </div>
            </div>
          </div>

          {/* Parecer do Fiscal */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Parecer Técnico / Resumo do Fiscal
            </label>
            <textarea
              rows={3}
              placeholder="Descreva os serviços concluídos nesta medição..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-800/80 border border-white/10 text-xs font-bold text-slate-300 hover:text-white active-press"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 active-press shadow-[0_0_16px_rgba(245,158,11,0.35)]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Confirmar Medição
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
