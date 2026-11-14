import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trash2, 
  Calendar, 
  UserCheck, 
  Bell, 
  Filter, 
  Search,
  ArrowLeft,
  MapPin,
  Building2
} from 'lucide-react';
import { Demanda, Escola, GRE, ResponsavelTipo } from '../../types';
import { NewDemandaModal } from './NewDemandaModal';
import { GreSelector } from '../vistorias/GreSelector';

interface DemandasViewProps {
  demandas: Demanda[];
  schools: Escola[];
  gres: GRE[];
  selectedGre: GRE | null;
  onSelectGre: (gre: GRE | null) => void;
  onToggleConcluida: (id: string) => void;
  onDeleteDemanda: (id: string) => void;
  onAddDemanda: (demanda: Omit<Demanda, 'id' | 'concluida' | 'dataCriacao'>) => void;
}

export const DemandasView: React.FC<DemandasViewProps> = ({
  demandas,
  schools,
  gres,
  selectedGre,
  onSelectGre,
  onToggleConcluida,
  onDeleteDemanda,
  onAddDemanda
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'pendentes' | 'concluidas' | 'todas'>('pendentes');
  const [searchTerm, setSearchTerm] = useState('');

  // SE NÃO HOUVER GRE SELECIONADA: Mostra a primeira tela com o GreSelector oficial!
  if (!selectedGre) {
    return (
      <div className="w-full pb-20 pt-1 px-4 animate-fadeIn">
        <GreSelector
          gres={gres}
          schools={schools}
          selectedGreId={null}
          titulo="1. Selecionar a GRE para Demandas"
          subtitulo="Escolha a regional para acompanhar pendências e cadastrar novas demandas"
          badgeTexto="21 Regiões"
          onSelectGre={(gre) => onSelectGre(gre)}
        />
      </div>
    );
  }

  // Escolas da GRE selecionada
  const schoolsDaGre = schools.filter(s => s.greId === selectedGre.id);
  const idsEscolasDaGre = new Set(schoolsDaGre.map(s => s.id));

  // Filtra as demandas para a GRE ativa
  const filteredDemandas = demandas.filter(d => {
    // Pertence à GRE ativa se estiver vinculada a uma escola da GRE ou se for geral
    const pertenceAGre = d.escolaId ? idsEscolasDaGre.has(d.escolaId) : true;
    if (!pertenceAGre) return false;

    const matchesStatus =
      filtroStatus === 'todas' ||
      (filtroStatus === 'pendentes' && !d.concluida) ||
      (filtroStatus === 'concluidas' && d.concluida);

    const matchesResp =
      filtroResponsavel === 'todos' || d.responsavel === filtroResponsavel;

    const matchesSearch =
      d.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.escolaNome && d.escolaNome.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesResp && matchesSearch;
  });

  const pendentesCount = demandas.filter(d => {
    const pertence = d.escolaId ? idsEscolasDaGre.has(d.escolaId) : true;
    return pertence && !d.concluida;
  }).length;

  return (
    <div className="w-full pb-20 animate-fadeIn">
      {/* Barra Superior de Identificação da GRE e Botão Trocar GRE */}
      <div className="px-4 pt-2 mb-2">
        <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectGre(null)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-xs font-bold border border-slate-700 transition-colors shrink-0"
              title="Voltar ao Seletor de GREs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Trocar GRE</span>
            </button>
            <div className="truncate">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{selectedGre.nome}</span>
              </span>
              <span className="text-[10px] text-amber-300/80 block truncate">
                Sede: {selectedGre.sede} • {schoolsDaGre.length} escolas
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
            {String(selectedGre.numero).padStart(2, '0')}ª GRE
          </span>
        </div>
      </div>

      {/* Topo do Módulo */}
      <div className="px-4 mb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-glass-glow-orange">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight leading-none">
                Demandas & Prazos
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {pendentesCount} {pendentesCount === 1 ? 'pendência ativa' : 'pendências ativas'} nesta regional
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-950 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 active-press shadow-glass-glow-orange transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Nova Demanda
          </button>
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div className="px-4 space-y-2 mb-3">
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setFiltroStatus('pendentes')}
            className={`py-1.5 text-center rounded-xl text-xs font-bold transition-all ${
              filtroStatus === 'pendentes' ? 'bg-orange-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Pendentes ({pendentesCount})
          </button>
          <button
            onClick={() => setFiltroStatus('concluidas')}
            className={`py-1.5 text-center rounded-xl text-xs font-bold transition-all ${
              filtroStatus === 'concluidas' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Concluídas
          </button>
          <button
            onClick={() => setFiltroStatus('todas')}
            className={`py-1.5 text-center rounded-xl text-xs font-bold transition-all ${
              filtroStatus === 'todas' ? 'bg-slate-700 text-white' : 'text-slate-400'
            }`}
          >
            Todas
          </button>
        </div>

        {/* Busca e Responsável */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar demanda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-400"
            />
          </div>

          <select
            value={filtroResponsavel}
            onChange={(e) => setFiltroResponsavel(e.target.value)}
            className="w-full text-xs bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-orange-400"
          >
            <option value="todos">Todos os Responsáveis</option>
            <option value="Naila">Naila (Gerente)</option>
            <option value="Coordenador">Coordenador</option>
            <option value="Arquitetos">Arquitetos</option>
            <option value="Fiscal">Fiscal</option>
            <option value="Empresa Construtora">Empresa Construtora</option>
          </select>
        </div>
      </div>

      {/* Lista de Demandas */}
      <div className="px-4 space-y-2.5">
        {filteredDemandas.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Nenhuma demanda cadastrada para a {selectedGre.nome}.</div>
            <p className="text-[11px] text-slate-500">Clique em &quot;Nova Demanda&quot; para cadastrar uma pendência vinculada às escolas desta regional.</p>
          </div>
        ) : (
          filteredDemandas.map((dem) => {
            const isNaila = dem.responsavel === 'Naila' || dem.tipo === 'gerencia_naila';

            return (
              <div
                key={dem.id}
                className={`p-3.5 rounded-2xl border backdrop-blur-xl transition-all duration-200 relative overflow-hidden ${
                  dem.concluida
                    ? 'bg-slate-900/30 border-white/5 opacity-60'
                    : isNaila
                    ? 'bg-gradient-to-br from-orange-950/30 via-slate-900/60 to-slate-950/80 border-orange-500/30 shadow-glass-glow-orange'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/20 shadow-glass'
                }`}
              >
                {/* Linha Lateral de Destaque */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  dem.concluida ? 'bg-slate-700' : isNaila ? 'bg-orange-500' : 'bg-cyan-500'
                }`} />

                <div className="pl-2">
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                        isNaila
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                          : 'bg-white/5 text-slate-300 border-white/10'
                      }`}>
                        Resp: {dem.responsavel}
                      </span>

                      {dem.escolaNome && (
                        <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.2 rounded-full border border-cyan-500/20 truncate max-w-[150px]">
                          {dem.escolaNome}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteDemanda(dem.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-lg"
                      title="Apagar demanda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Título e Descrição */}
                  <h3 className={`font-bold text-xs text-white leading-snug mb-1 ${
                    dem.concluida ? 'line-through text-slate-400' : ''
                  }`}>
                    {dem.titulo}
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
                    {dem.descricao}
                  </p>

                  {/* Configuração de Alerta e Prazo */}
                  <div className="p-2 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between text-[10px] text-slate-400 mb-2.5 flex-wrap gap-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      Prazo: <strong className="text-slate-200">{dem.dataLimite}</strong>
                    </span>

                    <span className="flex items-center gap-1 text-slate-300">
                      <Bell className="w-3.5 h-3.5 text-orange-400" />
                      {dem.alertFrequency === 'todos_os_dias'
                        ? 'Alerta: Todos os dias'
                        : `Alerta: ${dem.diasSemana.join(', ')}`}
                    </span>
                  </div>

                  {/* Ação de Conclusão / Dar OK */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                    <span className="text-[10px] text-slate-500">
                      Criada em {dem.dataCriacao}
                    </span>

                    <button
                      onClick={() => onToggleConcluida(dem.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold active-press transition-all ${
                        dem.concluida
                          ? 'bg-slate-800 text-slate-400 border border-white/10'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {dem.concluida ? 'Reabrir' : 'Dar OK (Concluída)'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal para Nova Demanda (com as escolas da GRE selecionada) */}
      {showNewModal && (
        <NewDemandaModal
          schools={schoolsDaGre}
          gre={selectedGre}
          onAddDemanda={onAddDemanda}
          onClose={() => setShowNewModal(false)}
        />
      )}
    </div>
  );
};
