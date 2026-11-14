import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Clock, 
  Calendar, 
  Copy, 
  Check, 
  AlertTriangle, 
  Car, 
  Gauge, 
  ShieldAlert, 
  ChevronRight, 
  Building2, 
  ExternalLink, 
  Filter, 
  Moon, 
  Flame, 
  Search, 
  X,
  Trash2,
  RotateCcw,
  Users,
  Timer,
  Zap,
  SlidersHorizontal,
  ArrowLeft
} from 'lucide-react';
import { Escola, GRE, RotaVistoria } from '../../types';
import { GreSelector } from '../vistorias/GreSelector';
import { CalendarioRotaModal } from './CalendarioRotaModal';
import { 
  DiariaOption, 
  PlanoViagem, 
  gerarPlanoDeViagem, 
  formatarPlanoParaWhatsApp,
  calcularDiasPorDiaria,
  ResultadoAnalisePrioridade 
} from '../../services/rotasEngine';

interface RotasViewProps {
  schools: Escola[];
  gres: GRE[];
  selectedGre?: GRE | null;
  onSelectGre?: (gre: GRE | null) => void;
  rotas?: RotaVistoria[];
  onSaveRota?: (rota: RotaVistoria) => void;
  onConcluirRota?: (rotaId: string) => void;
  onSelectSchool?: (school: Escola) => void;
}

export const RotasView: React.FC<RotasViewProps> = ({
  schools,
  gres,
  selectedGre,
  onSelectGre,
  onSelectSchool
}) => {
  const [internalSelectedGre, setInternalSelectedGre] = useState<GRE | null>(null);
  const activeGre = selectedGre !== undefined ? selectedGre : internalSelectedGre;

  const setActiveGre = (g: GRE | null) => {
    if (onSelectGre) {
      onSelectGre(g);
    } else {
      setInternalSelectedGre(g);
    }
  };

  // Estado das Sub-Abas: Trajeto vs Prioridade
  const [subTab, setSubTab] = useState<'trajeto' | 'prioridade'>('trajeto');

  const [selectedDiaria, setSelectedDiaria] = useState<DiariaOption>('1.5');
  const [duracaoDiasCustom, setDuracaoDiasCustom] = useState<number | undefined>(undefined);
  const [copiadoWhatsapp, setCopiadoWhatsapp] = useState(false);
  const [modalGreAberto, setModalGreAberto] = useState(false);
  const [modalCalendarioAberto, setModalCalendarioAberto] = useState(false);
  const [filtroGreBusca, setFiltroGreBusca] = useState('');

  // Equipe de Campo / Pessoas na Rota (Persistido no localStorage)
  const [equipeRota, setEquipeRota] = useState<string>(() => {
    try {
      return localStorage.getItem('seduc_rotas_equipe') || '';
    } catch {
      return '';
    }
  });

  const handleEquipeChange = (val: string) => {
    setEquipeRota(val);
    try {
      localStorage.setItem('seduc_rotas_equipe', val);
    } catch (err) {
      console.error('Erro ao salvar equipe no localStorage:', err);
    }
  };

  // Data / Período da Viagem (Persistido no localStorage)
  const [dataPeriodo, setDataPeriodo] = useState<string>(() => {
    try {
      return localStorage.getItem('seduc_rotas_data_periodo') || '';
    } catch {
      return '';
    }
  });

  const handleDataPeriodoChange = (val: string) => {
    setDataPeriodo(val);
    try {
      localStorage.setItem('seduc_rotas_data_periodo', val);
    } catch (err) {
      console.error('Erro ao salvar período no localStorage:', err);
    }
  };

  // Escolas sugeridas pelo sistema que o usuário optou por retirar da rota
  const [escolasRemovidasIds, setEscolasRemovidasIds] = useState<string[]>([]);

  const handleRemoverEscola = (escolaId: string) => {
    setEscolasRemovidasIds(prev => prev.includes(escolaId) ? prev : [...prev, escolaId]);
  };

  const handleRestaurarTodas = () => {
    setEscolasRemovidasIds([]);
  };

  // Escolas elegíveis para a rota (excluindo as que o usuário retirou)
  const escolasElegiveis = useMemo(() => {
    if (!activeGre) return [];
    const base = schools.filter(s => s.greId === activeGre.id);
    if (escolasRemovidasIds.length === 0) return base;
    return base.filter(s => !escolasRemovidasIds.includes(s.id));
  }, [schools, activeGre, escolasRemovidasIds]);

  // Gera o Plano de Viagem Inteligente com suporte a compactação de dias e comparativo Google Maps/Waze
  const planoViagem: PlanoViagem = useMemo(() => {
    if (!activeGre) {
      return {
        tipoRota: subTab,
        gre: gres[0] || { id: 'gre-01', numero: 1, nome: '01ª GRE', sede: 'Parnaíba', municipios: [], isFavorite: false },
        diaria: selectedDiaria,
        cidadePolo: 'Parnaíba',
        duracaoDiasReal: 1,
        duracoesDisponiveis: [1],
        totalKm: 0,
        tempoEstradaHoras: '0h',
        tempoEstradaGoogleMapsHoras: '0h',
        economiaTotalEstradaHoras: '0h',
        totalEscolasAtendidas: 0,
        veiculoInfo: 'S10 / Hilux',
        velocidadeCruzeiro: '140 km/h',
        horarioFinalPrevisto: '21:00h',
        dias: []
      };
    }
    return gerarPlanoDeViagem(subTab, escolasElegiveis, activeGre, selectedDiaria, duracaoDiasCustom);
  }, [subTab, escolasElegiveis, activeGre, selectedDiaria, duracaoDiasCustom, gres]);

  // Recalcula a data de volta com base na diária (a meia diária é a volta)
  const recalcularDataFinal = (diariaTarget: DiariaOption, duracaoTarget?: number) => {
    try {
      const isoInicio = localStorage.getItem('seduc_rotas_data_inicio_iso');
      if (isoInicio) {
        const [ano, mes, dia] = isoInicio.split('-').map(Number);
        if (ano && mes && dia) {
          const inicio = new Date(ano, mes - 1, dia);
          const dias = duracaoTarget !== undefined ? duracaoTarget : calcularDiasPorDiaria(diariaTarget);
          const fim = new Date(inicio);
          fim.setDate(fim.getDate() + (dias - 1));

          const pad = (n: number) => String(n).padStart(2, '0');
          const dInicio = pad(inicio.getDate());
          const mInicio = pad(inicio.getMonth() + 1);
          const aInicio = inicio.getFullYear();

          const dFim = pad(fim.getDate());
          const mFim = pad(fim.getMonth() + 1);
          const aFim = fim.getFullYear();

          const novoPeriodo = dias === 1
            ? `${dInicio}/${mInicio}/${aInicio}`
            : `${dInicio}/${mInicio} á ${dFim}/${mFim}/${aFim}`;

          handleDataPeriodoChange(novoPeriodo);
        }
      }
    } catch (err) {
      console.warn('Erro ao recalcular data final:', err);
    }
  };

  // Handler de alteração de diária (redefine a duração personalizada e recalcula automaticamente o período)
  const handleSelectDiaria = (novaDiaria: DiariaOption) => {
    setSelectedDiaria(novaDiaria);
    setDuracaoDiasCustom(undefined);
    recalcularDataFinal(novaDiaria, undefined);
  };

  const handleCustomDuracao = (dias: number) => {
    setDuracaoDiasCustom(dias);
    recalcularDataFinal(selectedDiaria, dias);
  };

  const handleConfirmarDataCalendario = (periodoFormatado: string, isoInicio: string) => {
    handleDataPeriodoChange(periodoFormatado);
    try {
      localStorage.setItem('seduc_rotas_data_inicio_iso', isoInicio);
    } catch {}
    setModalCalendarioAberto(false);
  };

  // Handler de Cópia para WhatsApp (Padrão Oficial UGERF / GPR)
  const handleCopiarWhatsApp = async () => {
    const texto = formatarPlanoParaWhatsApp(planoViagem, equipeRota, dataPeriodo);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(texto);
      } else {
        const ta = document.createElement('textarea');
        ta.value = texto;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiadoWhatsapp(true);
      setTimeout(() => setCopiadoWhatsapp(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar texto do WhatsApp:', err);
    }
  };

  // Cores e Ícones dos Status Compatibilizados
  const renderStatusBadge = (analise?: ResultadoAnalisePrioridade) => {
    if (!analise) return null;
    const { statusCompatibilizado, grauFinal } = analise;

    switch (statusCompatibilizado) {
      case 'Urgente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
            <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            URGENTE (Grau {grauFinal})
          </span>
        );
      case 'Prioridade':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            PRIORIDADE (Grau {grauFinal})
          </span>
        );
      case 'Requer Atenção':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
            <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" />
            REQUER ATENÇÃO (Grau {grauFinal})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            RAZOÁVEL (Rotina)
          </span>
        );
    }
  };

  // SE NÃO HOUVER GRE SELECIONADA: Mostra a primeira tela com o GreSelector oficial!
  if (!activeGre) {
    return (
      <div className="w-full pb-20 pt-1 px-4 animate-fadeIn">
        <GreSelector
          gres={gres}
          schools={schools}
          selectedGreId={null}
          titulo="1. Selecionar a GRE para Rotas de Vistoria"
          subtitulo="Escolha a regional para planejar o roteiro otimizado por trajeto ou prioridade"
          badgeTexto="21 Regiões"
          onSelectGre={setActiveGre}
        />
      </div>
    );
  }

  const greAtiva = activeGre;
  const isBateVolta = planoViagem.duracaoDiasReal === 1;

  return (
    <div className="space-y-6 pb-20">
      {/* ===================================================================== */}
      {/* HEADER PRINCIPAL COM SUB-ABAS (TRAJETO vs PRIORIDADE)                */}
      {/* ===================================================================== */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Planejamento de Rotas Inteligentes
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  GPR / SEDUC-PI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Cálculo com base no Google Maps & Waze simulado a 140 km/h (S10/Hilux), bate e volta controlado e matriz hierárquica.
              </p>
            </div>
          </div>

          {/* Botão de Exportação para WhatsApp */}
          <button
            onClick={handleCopiarWhatsApp}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
              copiadoWhatsapp
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 active:scale-95'
            }`}
          >
            {copiadoWhatsapp ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Roteiro Copiado para WhatsApp!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span>Exportar Roteiro WhatsApp</span>
              </>
            )}
          </button>
        </div>

        {/* NAVEGAÇÃO ENTRE AS DUAS SUB-ABAS */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1.5 bg-slate-950/60 rounded-xl border border-slate-800">
          <button
            onClick={() => setSubTab('trajeto')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
              subTab === 'trajeto'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-[1.01]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <div className="text-left">
              <div className="leading-tight">Rota por Trajeto</div>
              <div className="text-[10px] font-normal opacity-80 hidden sm:block">
                Otimização geográfica e corredor contínuo
              </div>
            </div>
          </button>

          <button
            onClick={() => setSubTab('prioridade')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
              subTab === 'prioridade'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/30 scale-[1.01]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <div className="text-left">
              <div className="leading-tight">Rota por Prioridade</div>
              <div className="text-[10px] font-normal opacity-80 hidden sm:block">
                Matriz hierárquica & análise técnica
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CONTROLES DA VIAGEM: GRE, DIÁRIAS, COMPACTAÇÃO, VEÍCULO E REGRAS      */}
      {/* ===================================================================== */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. SELETOR DE GRE */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Jurisdição Regional (GRE)</span>
              <span className="text-[10px] text-amber-400 font-normal">21 Regionais</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{greAtiva.nome}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>Sede Regional:</span>
                    <strong className="text-amber-300">{greAtiva.sede}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveGre(null)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                title="Voltar ao Seletor de GREs"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Trocar</span>
              </button>
            </div>
          </div>

          {/* 2. SELETOR DE DIÁRIAS & COMPACTAÇÃO */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Regime de Diárias</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {selectedDiaria === '1.5' && '1.5 d (Bate e Volta)'}
                {selectedDiaria === '2.5' && '2.5 d (Bate e Volta + Diária)'}
                {selectedDiaria === '3.5' && '3.5 d (2 dias / 1 pernoite)'}
                {selectedDiaria === '4.5' && '4.5 d (3 dias / 2 pernoites)'}
              </span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {(['1.5', '2.5', '3.5', '4.5'] as DiariaOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelectDiaria(opt)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                    selectedDiaria === opt
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {opt} d
                </button>
              ))}
            </div>

            {/* CONTROLE DE COMPACTAÇÃO DE DIAS EM CAMPO (Opção solicitada pelo usuário) */}
            {planoViagem.duracoesDisponiveis.length > 1 && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                  <span>Duração em Campo:</span>
                </span>
                <div className="flex gap-1">
                  {planoViagem.duracoesDisponiveis.map((numDias) => {
                    const isSelected = planoViagem.duracaoDiasReal === numDias;
                    return (
                      <button
                        key={numDias}
                        onClick={() => handleCustomDuracao(numDias)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-300'
                            : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                        title={numDias === 1 ? 'Compactar para Bate e Volta no mesmo dia' : `Executar em ${numDias} dias`}
                      >
                        {numDias === 1 ? '1 Dia (Bate/Volta)' : `${numDias} Dias`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. PARÂMETRO VEÍCULO, VELOCIDADE E MAPS/WAZE */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Veículo & Velocidade</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Maps + Waze + S10
              </span>
            </label>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-amber-400" />
                  Veículo Padrão:
                </span>
                <span className="font-bold text-white">S10 / Hilux (4x4)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  Cruzeiro em Estrada:
                </span>
                <span className="font-bold text-emerald-400">140 km/h</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                <span className="text-slate-500">Origem Fixa:</span>
                <span className="font-semibold text-slate-300">Teresina - PI (06:00h)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ALERTA INFORMATIVO DE BATE E VOLTA E TRAVA DE TEMPO */}
        {isBateVolta ? (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-200 flex items-start gap-2.5">
            <Timer className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-300">Regime Bate e Volta (1 Dia):</strong> Saída às <strong>06:00h</strong> de Teresina com retorno previsto entre <strong>21:00h e 22:00h</strong>. Carga dosada de escolas ({planoViagem.totalEscolasAtendidas} unidades) para garantir tempo suficiente para todas as vistorias técnicas sem sobrecarregar a equipe.
            </div>
          </div>
        ) : (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 text-xs text-purple-200 flex items-start gap-2.5">
            <Moon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-300">Viagem com Pernoite na Cidade-Polo:</strong> A equipe chega na sede regional (<strong>{greAtiva.sede}</strong>) rigorosamente entre <strong>19:00h e 20:00h</strong> para descanso e jantar, reiniciando os trabalhos no dia seguinte.
            </div>
          </div>
        )}

        {/* CAMPOS DE EXPORTAÇÃO WHATSAPP (DATA & EQUIPE DE CAMPO) */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Dados para Exportação WhatsApp (UGERF / GPR)</span>
            </label>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 self-start sm:self-auto">
              Exportado no WhatsApp
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Campo de Data / Período com Seletor e Botão de Calendário */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Data / Período:</span>
                </label>
                <button
                  type="button"
                  onClick={() => setModalCalendarioAberto(true)}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 transition-colors active:scale-95"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Abrir Calendário</span>
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={dataPeriodo}
                  onClick={() => setModalCalendarioAberto(true)}
                  onChange={(e) => handleDataPeriodoChange(e.target.value)}
                  placeholder="Ex: 16/11 á 20/11/2026"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all pr-14 cursor-pointer"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {dataPeriodo && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDataPeriodoChange('');
                      }}
                      className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                      title="Limpar data"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setModalCalendarioAberto(true)}
                    className="text-amber-400 hover:text-amber-300 p-1 rounded-lg transition-colors"
                    title="Selecionar Data no Calendário"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Campo de Equipe */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Equipe de Campo (Fiscais, Engenheiros, Motorista):</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={equipeRota}
                  onChange={(e) => handleEquipeChange(e.target.value)}
                  placeholder="Ex: Eng. Carlos Silva, Fiscal Marcos, Motorista João"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all pr-8"
                />
                {equipeRota && (
                  <button
                    onClick={() => handleEquipeChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                    title="Limpar equipe"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* RESUMO EXECUTIVO (KPI CARDS DA VIAGEM)                                */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Km Total */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Navigation className="w-4 h-4 text-amber-400" />
            <span>Deslocamento</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1.5">
            {planoViagem.totalKm} <span className="text-xs font-normal text-slate-400">km</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ida, giro e retorno</div>
        </div>

        {/* Tempo de Estrada (Comparativo Hilux 140km/h vs Maps/Waze) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Estrada (140 km/h)</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1.5">
            {planoViagem.tempoEstradaHoras}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex flex-col">
            <span className="text-slate-500">Maps/Waze: ~{planoViagem.tempoEstradaGoogleMapsHoras}</span>
            <span className="text-emerald-400 font-semibold">Economia: ~{planoViagem.economiaTotalEstradaHoras}</span>
          </div>
        </div>

        {/* Escolas Atendidas */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Escolas na Rota</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-400 mt-1.5">
            {planoViagem.totalEscolasAtendidas}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sem sobrecarga de equipe</div>
        </div>

        {/* Pernoite / Cidade-Polo */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            {isBateVolta ? <Timer className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
            <span>{isBateVolta ? 'Regime' : 'Cidade-Polo'}</span>
          </div>
          <div className="text-base sm:text-lg font-black text-white mt-1.5 truncate" title={isBateVolta ? 'Bate e Volta' : planoViagem.cidadePolo}>
            {isBateVolta ? 'Bate e Volta' : planoViagem.cidadePolo}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {isBateVolta ? 'Retorno no mesmo dia' : 'Pernoite e Jantar (19h-20h)'}
          </div>
        </div>

        {/* Horário Final Previsto */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-lg col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Calendar className="w-4 h-4 text-yellow-400" />
            <span>Retorno Previsto</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-yellow-400 mt-1.5">
            {planoViagem.horarioFinalPrevisto}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {isBateVolta ? 'Teto entre 21h e 22h' : 'Teresina - PI'}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BANNER DE ESCOLAS RETIRADAS DA ROTA (SE HOUVER)                       */}
      {/* ===================================================================== */}
      {escolasRemovidasIds.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{escolasRemovidasIds.length} escola(s) retirada(s) das sugestões</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                O itinerário e os cálculos foram reotimizados automaticamente sem as unidades retiradas.
              </p>
            </div>
          </div>
          <button
            onClick={handleRestaurarTodas}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Todas as Sugestões</span>
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CRONOGRAMA POR DIA (TIMELINE DE PARADAS)                             */}
      {/* ===================================================================== */}
      <div className="space-y-6">
        {planoViagem.dias.map((dia) => (
          <div
            key={dia.diaNumero}
            className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Header do Dia */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm">
                  D{dia.diaNumero}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {dia.titulo}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                    <span>{dia.dataDescritiva}</span>
                    <span>•</span>
                    <span>Horário: <strong>{dia.horarioInicio}</strong> às <strong>{dia.horarioTerminoPrevisto}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                <span className="text-slate-400">Km do Dia: <strong className="text-white">{dia.totalKmDia} km</strong></span>
                <span>•</span>
                <span className="text-slate-400">Destino: <strong className="text-amber-300">{dia.cidadePernoiteOuDestino}</strong></span>
              </div>
            </div>

            {/* Lista de Paradas / Timeline */}
            <div className="p-4 sm:p-5 divide-y divide-slate-800/60">
              {dia.paradas.map((parada, pIdx) => {
                const isPartida = parada.tipo === 'partida';
                const isPernoite = parada.tipo === 'pernoite';
                const isRetorno = parada.tipo === 'retorno';
                const isVistoria = parada.tipo === 'vistoria';

                return (
                  <div
                    key={pIdx}
                    className={`py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors rounded-xl px-2.5 ${
                      isVistoria ? 'hover:bg-slate-800/30' : 'bg-slate-950/40 my-1'
                    }`}
                  >
                    {/* Horário & Indicador da Timeline */}
                    <div className="flex items-start gap-3 md:w-60 shrink-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md ${
                            isPartida
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                              : isPernoite
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                              : isRetorno
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {isPartida && '🚩'}
                          {isPernoite && '🏨'}
                          {isRetorno && '🏁'}
                          {isVistoria && parada.ordem}
                        </div>
                        {pIdx < dia.paradas.length - 1 && (
                          <div className="w-0.5 h-12 bg-slate-800 my-1 hidden md:block" />
                        )}
                      </div>

                      <div>
                        <div className="text-sm font-black text-white flex items-center gap-1.5">
                          <span>{parada.horarioChegada}</span>
                          {parada.horarioPartida !== parada.horarioChegada && (
                            <>
                              <span className="text-slate-500 text-xs font-normal">às</span>
                              <span>{parada.horarioPartida}</span>
                            </>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {isVistoria && (
                            <span className="text-amber-400 font-semibold">
                              ⏱️ Vistoria de {parada.tempoPermanenciaMin} min
                            </span>
                          )}
                          {isPartida && 'Saída Oficial'}
                          {isPernoite && 'Pernoite & Jantar'}
                          {isRetorno && 'Retorno a Teresina'}
                        </div>
                        {parada.distanciaTrechoKm > 0 && (
                          <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                            <div>🛣️ Trecho: <strong>{parada.distanciaTrechoKm} km</strong></div>
                            <div className="text-emerald-400 font-semibold">⚡ S10 (140km/h): ~{parada.tempoEstimadoHiluxFormatado}</div>
                            <div className="text-slate-500">🗺️ Maps/Waze: ~{parada.tempoEstimadoMapsFormatado} (-{parada.economiaTempoMin}m)</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conteúdo Central da Parada */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-white">
                          {parada.localNome}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          {parada.cidade}
                        </span>

                        {isVistoria && renderStatusBadge(parada.analisePrioridade)}
                      </div>

                      {/* Observação Geral */}
                      {parada.observacao && (
                        <p className="text-xs text-slate-400">
                          {parada.observacao}
                        </p>
                      )}

                      {/* DETALHES DE CRITICIDADE E HIERARQUIA */}
                      {isVistoria && parada.escola && (
                        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-2">
                          {/* Tags de Origem da Demanda */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {parada.escola.demandas.map((dem, dIdx) => {
                              let tagClass = 'bg-slate-800 text-slate-300 border-slate-700';
                              if (dem.origem === 'Arielma (Superintendente)') {
                                tagClass = 'bg-red-500/20 text-red-300 border-red-500/40 font-bold';
                              } else if (dem.origem === 'Anik (Diretora)') {
                                tagClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
                              } else if (dem.origem === 'Naila (Gerente)') {
                                tagClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-semibold';
                              } else if (dem.origem === 'Diretora da Escola') {
                                tagClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                              }

                              return (
                                <span
                                  key={dIdx}
                                  className={`px-2 py-0.5 rounded text-[11px] border ${tagClass}`}
                                  title={dem.descricao}
                                >
                                  {dem.origem}
                                </span>
                              );
                            })}

                            {parada.escola.relatorio.obraParada && (
                              <span className="px-2 py-0.5 rounded text-[11px] bg-red-600/30 text-red-200 border border-red-500/50 font-bold">
                                🛑 Obra Parada
                              </span>
                            )}
                            {parada.escola.relatorio.possuiProblemaGrave && (
                              <span className="px-2 py-0.5 rounded text-[11px] bg-orange-600/30 text-orange-200 border border-orange-500/50 font-semibold">
                                ⚠️ Patologia Grave
                              </span>
                            )}
                            {parada.escola.diasSemVistoria >= 30 && (
                              <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-amber-300 border border-amber-500/30">
                                ⏳ {parada.escola.diasSemVistoria} dias sem vistoria
                              </span>
                            )}
                          </div>

                          {/* Justificativa da IA */}
                          {parada.analisePrioridade?.justificativaIA && (
                            <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                              {parada.analisePrioridade.justificativaIA.map((just, jIdx) => (
                                <div key={jIdx} className="flex items-center gap-1.5">
                                  <span className="text-amber-400">•</span>
                                  <span>{just}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Ações Rápidas da Parada */}
                    {isVistoria && parada.escola && (
                      <div className="flex md:flex-col items-center gap-2 self-end md:self-center shrink-0">
                        {parada.escola.linkMaps && (
                          <a
                            href={parada.escola.linkMaps}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                            title="Abrir no Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                            <span>Maps</span>
                          </a>
                        )}

                        {onSelectSchool && (
                          <button
                            onClick={() => {
                              const originalSchool = schools.find(s => s.id === parada.escola?.id);
                              if (originalSchool) {
                                onSelectSchool(originalSchool);
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-500/40 transition-colors"
                          >
                            <span>Ver Unidade</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Botão de Excluir / Tirar da Rota */}
                        <button
                          onClick={() => handleRemoverEscola(parada.escola!.id)}
                          className="px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium flex items-center gap-1 border border-red-500/20 transition-colors"
                          title="Tirar esta escola da rota"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Tirar</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ===================================================================== */}
      {/* MODAL DE SELEÇÃO RÁPIDA DAS 21 GREs                                  */}
      {/* ===================================================================== */}
      {modalGreAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header do Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <span>Selecione a Gerência Regional (GRE)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  As 21 GREs oficiais do Piauí com suas sedes e cidades-polo de pernoite.
                </p>
              </div>
              <button
                onClick={() => setModalGreAberto(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Barra de Pesquisa */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar GRE por número, nome ou município sede (ex: Oeiras, Corrente, Floriano, Picos)..."
                  value={filtroGreBusca}
                  onChange={(e) => setFiltroGreBusca(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Grade das 21 GREs */}
            <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[...gres]
                .sort((a, b) => a.numero - b.numero)
                .filter(g => {
                  if (!filtroGreBusca) return true;
                  const term = filtroGreBusca.toLowerCase();
                  return (
                    g.nome.toLowerCase().includes(term) ||
                    g.sede.toLowerCase().includes(term) ||
                    String(g.numero).includes(term) ||
                    g.municipios?.some(m => m.toLowerCase().includes(term))
                  );
                })
                .map((gre) => {
                  const isSelected = gre.id === greAtiva.id;
                  const totalEsc = schools.filter(s => s.greId === gre.id).length;

                  return (
                    <button
                      key={gre.id}
                      onClick={() => {
                        setActiveGre(gre);
                        setModalGreAberto(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-amber-400">
                            {String(gre.numero).padStart(2, '0')}ª GRE
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          )}
                        </div>
                        <div className="text-sm font-bold text-white mt-1 leading-snug line-clamp-1">
                          {gre.sede}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{totalEsc} escolas</span>
                        <span className="text-amber-400/80 font-medium">Pólo</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Interativo de Calendário da Rota com Cálculo Automático */}
      {modalCalendarioAberto && (
        <CalendarioRotaModal
          dataPeriodoAtual={dataPeriodo}
          duracaoDias={planoViagem.duracaoDiasReal}
          diaria={selectedDiaria}
          onConfirmar={handleConfirmarDataCalendario}
          onClose={() => setModalCalendarioAberto(false)}
        />
      )}
    </div>
  );
};
