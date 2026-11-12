import React from 'react';
import { ArrowLeft, Plus, Calendar, Clock, Image, FileText, User, Phone, MapPin, ChevronRight, AlertTriangle } from 'lucide-react';
import { Escola, Levantamento, GRE } from '../../types';
import { StatusConservacaoBadge } from '../common/Badge';

interface SchoolTimelineProps {
  school: Escola;
  gre?: GRE;
  levantamentos: Levantamento[];
  onBack: () => void;
  onNovoLevantamento: () => void;
  onVisualizarLevantamento: (levantamento: Levantamento) => void;
  onVerOS?: (osId: string) => void;
}

export const SchoolTimeline: React.FC<SchoolTimelineProps> = ({
  school,
  gre,
  levantamentos,
  onBack,
  onNovoLevantamento,
  onVisualizarLevantamento,
  onVerOS
}) => {
  // Ordena os levantamentos do mais recente para o mais antigo
  const sortedLevantamentos = [...levantamentos].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="w-full">
      {/* Top Header da Escola */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white active-press"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {school.inep && (
              <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-1.5 py-0.5 rounded">
                INEP: {school.inep}
              </span>
            )}
            <span className="text-[11px] text-amber-400 font-semibold truncate">
              {school.municipio}
            </span>
          </div>
          <h2 className="text-sm font-bold text-white tracking-tight leading-snug mt-0.5">
            {school.nome}
          </h2>
          <p className="text-[10.5px] text-slate-400 truncate">
            {gre?.nome || 'Jurisdição SEDUC'}
          </p>
        </div>
      </div>

      {/* Card Resumo da Unidade Escolar */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-950/90 border border-white/10 backdrop-blur-xl mb-4 shadow-glass">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Perfil da Unidade
            </span>
            <h3 className="font-bold text-xs text-white mt-0.5">
              Dados Cadastrais & Contato
            </h3>
          </div>
          <StatusConservacaoBadge status={school.statusConservacao} />
        </div>

        <div className="space-y-1.5 text-xs text-slate-300">
          <p className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>Direção: <strong className="text-white font-medium">{school.diretora || 'Não informado'}</strong></span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>Telefone: <strong className="text-white font-medium">{school.telefone || '(86) 3216-3200'}</strong></span>
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>{school.endereco}</span>
          </p>
        </div>

        {school.temOsAtiva && school.osId && onVerOS && (
          <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Ordem de Serviço Vinculada</span>
            </div>
            <button
              onClick={() => onVerOS(school.osId!)}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 active-press"
            >
              Ver OS & Medição
            </button>
          </div>
        )}
      </div>

      {/* Botão em Grande Destaque: + Novo Levantamento */}
      <div className="mb-4">
        <button
          onClick={onNovoLevantamento}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 active-press shadow-glass-glow-turq hover:opacity-95 transition-all"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>+ Novo Levantamento Fotográfico</span>
        </button>
      </div>

      {/* Título da Linha do Tempo */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          Histórico Cronológico de Vistorias ({sortedLevantamentos.length})
        </h3>
        <span className="text-[10px] text-slate-500">Mais recentes primeiro</span>
      </div>

      {/* Linha do Tempo Vertical */}
      <div className="relative pl-6 pb-8 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/60 before:via-slate-700 before:to-transparent">
        {sortedLevantamentos.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 text-xs text-slate-400 text-center">
            Nenhum levantamento anterior registrado para esta escola. Toque em "+ Novo Levantamento Fotográfico" acima para iniciar a primeira vistoria.
          </div>
        ) : (
          sortedLevantamentos.map((lev) => {
            const fotosCount = lev.fotos.length;
            const temFotoUrgente = lev.fotos.some(f => f.isUrgente);

            return (
              <div
                key={lev.id}
                onClick={() => onVisualizarLevantamento(lev)}
                className="relative p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-cyan-500/30 backdrop-blur-xl transition-all cursor-pointer active-press shadow-glass"
              >
                {/* Marcador de ponto na linha do tempo */}
                <span className={`absolute -left-[19px] top-4 w-3.5 h-3.5 rounded-full border-2 border-[#090D16] ${
                  temFotoUrgente ? 'bg-orange-500 shadow-glass-glow-orange' : 'bg-cyan-400 shadow-glass-glow-turq'
                }`} />

                {/* Cabeçalho do Laudo */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lev.dataHora}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {temFotoUrgente && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Alerta Crítico
                      </span>
                    )}
                    <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.2 rounded-md border border-cyan-500/20 font-medium">
                      {fotosCount} {fotosCount === 1 ? 'Foto' : 'Fotos'}
                    </span>
                  </div>
                </div>

                {/* Motivo e Observação */}
                <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 mb-1">
                  {lev.motivoVisita || 'Vistoria Geral de Rotina'}
                </h4>

                {lev.observacoesDiretora && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-black/20 p-2 rounded-xl mb-2">
                    "{lev.observacoesDiretora}"
                  </p>
                )}

                {/* Miniaturas de fotos */}
                {fotosCount > 0 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {lev.fotos.slice(0, 4).map((f) => (
                      <div key={f.id} className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                        <img src={f.url} alt={f.ambienteNome} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-center text-slate-200 truncate px-0.5">
                          {f.ambienteNome}
                        </span>
                      </div>
                    ))}
                    {fotosCount > 4 && (
                      <div className="w-14 h-14 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                        +{fotosCount - 4}
                      </div>
                    )}
                  </div>
                )}

                {/* Rodapé do Card */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/[0.06] text-[10px] text-slate-400">
                  <span>Fiscal: {lev.concluidoPor}</span>
                  <span className="text-cyan-400 flex items-center gap-0.5 font-semibold">
                    Abrir Relatório Completo
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
