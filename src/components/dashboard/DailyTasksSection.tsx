import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Plus, MapPin, AlertCircle } from 'lucide-react';
import { TarefaDoDia } from '../../types';

interface DailyTasksSectionProps {
  tarefas: TarefaDoDia[];
  onToggleTarefa: (id: string) => void;
  onAddTarefa: (titulo: string, escolaOuLocal: string, horario: string, prioridade: 'urgente' | 'normal') => void;
}

export const DailyTasksSection: React.FC<DailyTasksSectionProps> = ({
  tarefas,
  onToggleTarefa,
  onAddTarefa
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoLocal, setNovoLocal] = useState('');
  const [novoHorario, setNovoHorario] = useState('09:00');
  const [novaPrioridade, setNovaPrioridade] = useState<'urgente' | 'normal'>('normal');

  const concluidas = tarefas.filter(t => t.concluida).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;
    onAddTarefa(novoTitulo.trim(), novoLocal.trim() || 'SEDUC', novoHorario, novaPrioridade);
    setNovoTitulo('');
    setNovoLocal('');
    setShowAddForm(false);
  };

  return (
    <div className="px-4 my-3 mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Minhas Tarefas do Dia
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
            {concluidas}/{tarefas.length} Concluídas
          </span>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold active-press px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddForm ? 'Cancelar' : 'Nova Tarefa'}
        </button>
      </div>

      {/* Formulário inline para nova tarefa */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-3 p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl animate-fadeIn space-y-2.5">
          <input
            type="text"
            placeholder="O que você precisa fiscalizar ou resolver hoje?"
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
            className="w-full text-xs bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Escola / Unidade"
              value={novoLocal}
              onChange={(e) => setNovoLocal(e.target.value)}
              className="text-xs bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            <input
              type="time"
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
              className="text-xs bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={novaPrioridade === 'urgente'}
                onChange={(e) => setNovaPrioridade(e.target.checked ? 'urgente' : 'normal')}
                className="rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-0"
              />
              <span className="text-[11px] text-orange-300 font-medium">Marcar como urgente</span>
            </label>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs active-press transition-colors shadow-glass-glow-turq"
            >
              Adicionar
            </button>
          </div>
        </form>
      )}

      {/* Lista de Tarefas */}
      <div className="space-y-2">
        {tarefas.length === 0 ? (
          <div className="text-center py-6 p-4 rounded-2xl bg-slate-800/30 border border-white/5 text-xs text-slate-400">
            Nenhuma tarefa cadastrada para o dia. Toque em "+ Nova Tarefa" para organizar sua rotina de fiscalização.
          </div>
        ) : (
          tarefas.map((tarefa) => {
            const isUrgente = tarefa.prioridade === 'urgente';

            return (
              <div
                key={tarefa.id}
                onClick={() => onToggleTarefa(tarefa.id)}
                className={`p-3 rounded-2xl border backdrop-blur-xl transition-all duration-200 cursor-pointer active-press flex items-start justify-between gap-3 ${
                  tarefa.concluida
                    ? 'bg-slate-900/30 border-white/5 opacity-60'
                    : isUrgente
                    ? 'bg-slate-900/60 border-orange-500/25 hover:border-orange-500/40 shadow-glass-glow-orange'
                    : 'bg-slate-900/60 border-white/10 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                  >
                    {tarefa.concluida ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold leading-snug tracking-tight ${
                      tarefa.concluida ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}>
                      {tarefa.titulo}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[140px]">{tarefa.escolaOuLocal}</span>
                      </span>

                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {tarefa.horario}
                      </span>
                    </div>
                  </div>
                </div>

                {isUrgente && !tarefa.concluida && (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25">
                    <AlertCircle className="w-3 h-3" />
                    Urgente
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
