import React, { useState } from 'react';
import { X, CheckSquare, Calendar, Bell, UserCheck, AlertTriangle, Check } from 'lucide-react';
import { Demanda, ResponsavelTipo, Escola } from '../../types';

interface NewDemandaModalProps {
  schools: Escola[];
  onAddDemanda: (demanda: Omit<Demanda, 'id' | 'concluida' | 'dataCriacao'>) => void;
  onClose: () => void;
}

export const NewDemandaModal: React.FC<NewDemandaModalProps> = ({
  schools,
  onAddDemanda,
  onClose
}) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<Demanda['tipo']>('gerencia_naila');
  const [responsavel, setResponsavel] = useState<ResponsavelTipo>('Naila');
  const [prioridade, setPrioridade] = useState<'alta' | 'media' | 'baixa'>('alta');
  const [dataLimite, setDataLimite] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [alertFrequency, setAlertFrequency] = useState<'todos_os_dias' | 'dias_semana'>('todos_os_dias');
  const [diasSemana, setDiasSemana] = useState<string[]>(['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);
  const [escolaId, setEscolaId] = useState<string>(schools[0]?.id || '');

  const diasDisponiveis = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

  const toggleDia = (dia: string) => {
    if (diasSemana.includes(dia)) {
      setDiasSemana(diasSemana.filter(d => d !== dia));
    } else {
      setDiasSemana([...diasSemana, dia]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const targetSchool = schools.find(s => s.id === escolaId);

    onAddDemanda({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      tipo,
      responsavel,
      prioridade,
      dataLimite,
      alertFrequency,
      diasSemana,
      escolaId: targetSchool ? targetSchool.id : undefined,
      escolaNome: targetSchool ? targetSchool.nome : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0D1424] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs">Nova Demanda ou Alerta Programado</h3>
              <p className="text-[10px] text-slate-400">SEDUC Piauí • Central de Prazos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Rolagem */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 no-scrollbar flex-1 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Título da Demanda *
            </label>
            <input
              type="text"
              placeholder="Ex: Falar com a Naila sobre trinca na escola X"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full text-xs bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Descrição Detalhada / Ação Esperada
            </label>
            <textarea
              rows={2}
              placeholder="Descreva o que deve ser cobrado ou providenciado..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full text-xs bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Responsável Direto:
              </label>
              <select
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value as ResponsavelTipo)}
                className="w-full text-xs bg-slate-800/90 border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none"
              >
                <option value="Naila">Naila (Gerente)</option>
                <option value="Coordenador">Coordenador</option>
                <option value="Arquitetos">Arquitetos</option>
                <option value="Fiscal">Fiscal</option>
                <option value="Empresa Construtora">Empresa Construtora</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Tipo da Demanda:
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as Demanda['tipo'])}
                className="w-full text-xs bg-slate-800/90 border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none"
              >
                <option value="gerencia_naila">Aviso para Naila</option>
                <option value="orcamento">Fazer Orçamento</option>
                <option value="memorial">Memorial Descritivo</option>
                <option value="arquitetura">Cobrar Arquitetura</option>
                <option value="vistoria_urgente">Vistoria de Campo</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Vincular a uma Escola (Opcional):
            </label>
            <select
              value={escolaId}
              onChange={(e) => setEscolaId(e.target.value)}
              className="w-full text-xs bg-slate-800/90 border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none"
            >
              <option value="">Nenhuma / Geral SEDUC</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} ({s.municipio})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Data Limite:
              </label>
              <input
                type="date"
                value={dataLimite}
                onChange={(e) => setDataLimite(e.target.value)}
                className="w-full text-xs bg-slate-800/90 border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Prioridade:
              </label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as 'alta' | 'media' | 'baixa')}
                className="w-full text-xs bg-slate-800/90 border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none"
              >
                <option value="alta">Alta / Urgente</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>

          {/* Programação de Alertas no Celular */}
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/10 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
              <Bell className="w-3.5 h-3.5" />
              <span>Programação de Alertas no Celular</span>
            </div>

            <div className="flex gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="freq"
                  checked={alertFrequency === 'todos_os_dias'}
                  onChange={() => setAlertFrequency('todos_os_dias')}
                  className="text-orange-500 bg-slate-900"
                />
                <span className="text-[11px]">Todos os dias</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 ml-2">
                <input
                  type="radio"
                  name="freq"
                  checked={alertFrequency === 'dias_semana'}
                  onChange={() => setAlertFrequency('dias_semana')}
                  className="text-orange-500 bg-slate-900"
                />
                <span className="text-[11px]">Dias da semana específicos</span>
              </label>
            </div>

            {alertFrequency === 'dias_semana' && (
              <div className="pt-1">
                <span className="block text-[10px] text-slate-400 mb-1">Selecione os dias:</span>
                <div className="flex gap-1">
                  {diasDisponiveis.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDia(d)}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                        diasSemana.includes(d)
                          ? 'bg-orange-500 text-white border-orange-400'
                          : 'bg-slate-900 text-slate-400 border-white/5'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botão de Conclusão */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-extrabold text-xs active-press shadow-glass-glow-orange flex items-center justify-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Cadastrar Demanda & Ativar Alertas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
