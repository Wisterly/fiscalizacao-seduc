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
  Check
} from 'lucide-react';
import { OrdemServico, GRE, Escola } from '../../types';
import { GreSelector } from '../vistorias/GreSelector';

interface MedicoesViewProps {
  ordensServico: OrdemServico[];
  gres: GRE[];
  schools: Escola[];
  selectedGre?: GRE | null;
  onSelectGre?: (gre: GRE | null) => void;
  onUpdateMedicao: (osId: string, novoPercentual: number, novaObservacao?: string) => void;
  onBack?: () => void;
}

export const MedicoesView: React.FC<MedicoesViewProps> = ({
  ordensServico,
  gres,
  schools,
  selectedGre,
  onSelectGre,
  onUpdateMedicao,
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
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [escolaExpandidaId, setEscolaExpandidaId] = useState<string | null>(null);

  // Estados de edição de medição
  const [editingOsId, setEditingOsId] = useState<string | null>(null);
  const [tempPercentual, setTempPercentual] = useState<number>(50);
  const [novaObservacao, setNovaObservacao] = useState<string>('');

  // SE NÃO HOUVER GRE SELECIONADA: Mostra o GreSelector oficial!
  if (!activeGre) {
    return (
      <div className="w-full pb-20 pt-1 px-4 animate-fadeIn">
        <GreSelector
          gres={gres}
          schools={schools}
          selectedGreId={null}
          titulo="1. Selecionar a GRE para Medições"
          subtitulo="Acompanhe percentual de medição, contratos ativos e saldos por escola"
          badgeTexto="21 Regiões"
          onSelectGre={setActiveGre}
        />
      </div>
    );
  }

  // Escolas da GRE selecionada
  const schoolsDaGre = schools.filter((s) => s.greId === activeGre.id);
  const osDaGre = ordensServico.filter((os) => os.greId === activeGre.id);

  // Estatísticas da GRE
  const totalValorContratado = osDaGre.reduce((acc, os) => acc + (os.valorOrcamento || 0), 0);
  const totalValorMedido = osDaGre.reduce((acc, os) => acc + ((os.valorOrcamento || 0) * (os.percentualMedicao || 0) / 100), 0);
  const mediaMedicaoGre = osDaGre.length > 0 
    ? Math.round(osDaGre.reduce((acc, os) => acc + (os.percentualMedicao || 0), 0) / osDaGre.length) 
    : 0;

  // Filtragem de escolas com busca
  const filteredSchools = schoolsDaGre.filter((school) => {
    const osDaEscola = osDaGre.filter((os) => os.escolaId === school.id || os.escolaNome.toLowerCase() === school.nome.toLowerCase());
    const matchesSearch =
      !searchTerm ||
      school.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      osDaEscola.some((os) =>
        os.numeroOS.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.empresaContratada.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesSearch;
  });

  const handleOpenEditMedicao = (os: OrdemServico) => {
    setEditingOsId(os.id);
    setTempPercentual(os.percentualMedicao || 0);
    setNovaObservacao('');
  };

  const handleSalvarMedicao = (osId: string) => {
    onUpdateMedicao(osId, tempPercentual, novaObservacao);
    setEditingOsId(null);
    setNovaObservacao('');
  };

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="w-full pb-20 pt-1 animate-fadeIn">
      {/* 1. SELETOR SUPERIOR COM BOTÃO DE TROCAR GRE */}
      <div className="px-4 mb-3">
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
                Sede: {activeGre.sede} • {schoolsDaGre.length} escolas
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
            {String(activeGre.numero).padStart(2, '0')}ª GRE
          </span>
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
            placeholder="Buscar por escola, OS ou empresa..."
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

      {/* 4. LISTA DAS ESCOLAS COM MEDIÇÕES */}
      <div className="px-4 space-y-3">
        {filteredSchools.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Nenhuma escola encontrada nesta busca.</div>
            <p className="text-[11px] text-slate-500">Tente buscar por outro termo ou limpe o filtro.</p>
          </div>
        ) : (
          filteredSchools.map((school) => {
            const osList = osDaGre.filter(
              (os) => os.escolaId === school.id || os.escolaNome.toLowerCase() === school.nome.toLowerCase()
            );
            const isExpandida = escolaExpandidaId === school.id;

            // Percentual consolidado da escola
            const percConsolidado = osList.length > 0
              ? Math.round(osList.reduce((acc, os) => acc + (os.percentualMedicao || 0), 0) / osList.length)
              : 0;

            const valorTotalEscola = osList.reduce((acc, os) => acc + (os.valorOrcamento || 0), 0);
            const valorMedidoEscola = osList.reduce((acc, os) => acc + ((os.valorOrcamento || 0) * (os.percentualMedicao || 0) / 100), 0);
            const saldoRestanteEscola = Math.max(0, valorTotalEscola - valorMedidoEscola);

            return (
              <div
                key={school.id}
                className={`rounded-2xl border backdrop-blur-xl transition-all duration-200 overflow-hidden ${
                  osList.length > 0
                    ? 'bg-slate-900/80 border-amber-500/25 shadow-glass hover:border-amber-400/40'
                    : 'bg-slate-900/40 border-white/5 opacity-75'
                }`}
              >
                {/* Cabeçalho do Card da Escola */}
                <div
                  onClick={() => setEscolaExpandidaId(isExpandida ? null : school.id)}
                  className="p-3.5 cursor-pointer flex items-start justify-between gap-3 active:bg-white/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {school.municipio}
                      </span>
                      <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        {osList.length} {osList.length === 1 ? 'OS Vinculada' : 'OS Vinculadas'}
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
                      <p className="text-[10px] text-slate-500 mt-1">Nenhuma Ordem de Serviço cadastrada para esta escola</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {osList.length > 0 ? (
                      <span className="text-xs font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                        {percConsolidado}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Sem OS</span>
                    )}

                    <span className="text-slate-400 text-xs mt-1">
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

                {/* DETALHES EXPANDIDOS COM AS ORDENS DE SERVIÇO DA ESCOLA */}
                {isExpandida && osList.length > 0 && (
                  <div className="p-3.5 bg-slate-950/70 border-t border-white/10 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-1 border-b border-white/5">
                      <span>Ordens de Serviço & Contratos ({osList.length}):</span>
                      <span className="text-amber-400 text-[11px]">Saldo Restante: {formatarMoeda(saldoRestanteEscola)}</span>
                    </div>

                    {osList.map((os) => {
                      const percOS = os.percentualMedicao || 0;
                      const valMedidoOS = (os.valorOrcamento || 0) * percOS / 100;
                      const valSaldoOS = Math.max(0, (os.valorOrcamento || 0) - valMedidoOS);
                      const isEditing = editingOsId === os.id;

                      return (
                        <div
                          key={os.id}
                          className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-black text-white">{os.numeroOS}</span>
                                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded">
                                  {os.empresaContratada}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">{os.objeto}</p>
                            </div>

                            <button
                              onClick={() => {
                                if (isEditing) setEditingOsId(null);
                                else handleOpenEditMedicao(os);
                              }}
                              className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 active-press text-[11px] font-bold shrink-0 flex items-center gap-1"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>{isEditing ? 'Fechar' : 'Ajustar'}</span>
                            </button>
                          </div>

                          {/* Finanças da OS */}
                          <div className="grid grid-cols-3 gap-1.5 text-[10px] p-2 rounded-lg bg-black/30 border border-white/5 text-slate-300">
                            <div>
                              <span className="text-slate-500 block">Contrato</span>
                              <strong className="text-white">{formatarMoeda(os.valorOrcamento || 0)}</strong>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Medido ({percOS}%)</span>
                              <strong className="text-emerald-400">{formatarMoeda(valMedidoOS)}</strong>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Saldo</span>
                              <strong className="text-amber-300">{formatarMoeda(valSaldoOS)}</strong>
                            </div>
                          </div>

                          {/* Barra individual da OS */}
                          <div className="relative w-full h-5 rounded-full border border-cyan-400/80 bg-slate-950 p-0.5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                              style={{ width: `${percOS}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-[9px] font-extrabold text-white drop-shadow">
                                {percOS}% medido
                              </span>
                            </div>
                          </div>

                          {/* PAINEL DE AJUSTE INTERATIVO DE MEDIÇÃO */}
                          {isEditing && (
                            <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2.5 animate-fadeIn">
                              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                                <span>Ajustar Medição em Campo:</span>
                                <span className="font-mono text-sm">{tempPercentual}%</span>
                              </div>

                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={tempPercentual}
                                onChange={(e) => setTempPercentual(Number(e.target.value))}
                                className="w-full accent-amber-400 cursor-pointer"
                              />

                              <div className="flex gap-1.5">
                                {[-10, -5, +5, +10].map((step) => (
                                  <button
                                    key={step}
                                    type="button"
                                    onClick={() =>
                                      setTempPercentual((prev) =>
                                        Math.min(100, Math.max(0, prev + step))
                                      )
                                    }
                                    className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-slate-800 border border-white/5 text-slate-200 active-press hover:bg-slate-700"
                                  >
                                    {step > 0 ? `+${step}%` : `${step}%`}
                                  </button>
                                ))}
                              </div>

                              <input
                                type="text"
                                placeholder="Registrar anotação técnica desta medição..."
                                value={novaObservacao}
                                onChange={(e) => setNovaObservacao(e.target.value)}
                                className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                              />

                              <div className="flex gap-2 justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingOsId(null)}
                                  className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSalvarMedicao(os.id)}
                                  className="px-3.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs active-press shadow-glass-glow-gold flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Salvar Medição</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Observações da OS */}
                          {os.observacoes && os.observacoes.length > 0 && (
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-white/5">
                              <strong>Último registro: </strong>
                              {os.observacoes[os.observacoes.length - 1].texto}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
