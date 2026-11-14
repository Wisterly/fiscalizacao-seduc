import React, { useState, useMemo } from 'react';
import { X, CheckSquare, Calendar, Bell, UserCheck, AlertTriangle, Check, Search, Building2, MapPin } from 'lucide-react';
import { Demanda, ResponsavelTipo, Escola, GRE } from '../../types';

interface NewDemandaModalProps {
  schools: Escola[];
  gre?: GRE | null;
  onAddDemanda: (demanda: Omit<Demanda, 'id' | 'concluida' | 'dataCriacao'>) => void;
  onClose: () => void;
}

export const NewDemandaModal: React.FC<NewDemandaModalProps> = ({
  schools,
  gre,
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
  const [escolaId, setEscolaId] = useState<string>('');
  const [buscaEscola, setBuscaEscola] = useState('');

  const diasDisponiveis = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

  const toggleDia = (dia: string) => {
    if (diasSemana.includes(dia)) {
      setDiasSemana(diasSemana.filter(d => d !== dia));
    } else {
      setDiasSemana([...diasSemana, dia]);
    }
  };

  // Escolas filtradas pela pesquisa em tempo real
  const escolasFiltradas = useMemo(() => {
    if (!buscaEscola.trim()) return schools;
    const term = buscaEscola.toLowerCase().trim();
    return schools.filter(s => 
      s.nome.toLowerCase().includes(term) || 
      s.municipio.toLowerCase().includes(term) ||
      (s.inep && s.inep.includes(term))
    );
  }, [schools, buscaEscola]);

  const escolaSelecionadaObj = schools.find(s => s.id === escolaId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    onAddDemanda({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      tipo,
      responsavel,
      prioridade,
      dataLimite,
      alertFrequency,
      diasSemana,
      escolaId: escolaSelecionadaObj ? escolaSelecionadaObj.id : undefined,
      escolaNome: escolaSelecionadaObj ? escolaSelecionadaObj.nome : undefined
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
              <p className="text-[10px] text-slate-400">
                {gre ? `${gre.nome} • Sede: ${gre.sede}` : 'SEDUC Piauí • Central de Prazos'}
              </p>
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
              placeholder="Ex: Falar com a Naila sobre cobertura da escola"
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

          {/* VINCULAR A UMA ESCOLA COM PESQUISA E LISTA ROLÁVEL (Super Ajuste) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-300">
                Vincular a uma Escola {gre ? `da ${gre.nome}` : ''}:
              </label>
              {escolaSelecionadaObj && (
                <button
                  type="button"
                  onClick={() => setEscolaId('')}
                  className="text-[10px] text-amber-400 hover:text-amber-300"
                >
                  Desvincular
                </button>
              )}
            </div>

            {/* Caixinha de Pesquisa de Escola */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar escola pelo nome ou município..."
                value={buscaEscola}
                onChange={(e) => setBuscaEscola(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-800/90 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-400"
              />
              {buscaEscola && (
                <button
                  type="button"
                  onClick={() => setBuscaEscola('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Lista Rolável / Scrollável de Escolas da GRE */}
            <div className="max-h-40 overflow-y-auto space-y-1 p-1 bg-slate-900/90 border border-white/10 rounded-xl select-none">
              {/* Opção Geral (Sem Escola) */}
              <button
                type="button"
                onClick={() => setEscolaId('')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  escolaId === ''
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span>Nenhuma / Geral da {gre ? gre.nome : 'SEDUC'}</span>
                {escolaId === '' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {escolasFiltradas.length === 0 ? (
                <div className="p-3 text-center text-[11px] text-slate-500">
                  Nenhuma escola encontrada para &quot;{buscaEscola}&quot;.
                </div>
              ) : (
                escolasFiltradas.map((s) => {
                  const isSelected = escolaId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setEscolaId(s.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-all ${
                        isSelected
                          ? 'bg-orange-500/20 text-white font-bold border border-orange-500/40 ring-1 ring-orange-500/40'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="truncate flex-1">
                        <div className="truncate font-medium">{s.nome}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-amber-400" />
                          <span>{s.municipio}</span>
                          {s.statusConservacao === 'critico' && (
                            <span className="text-red-400 font-bold">• Crítico</span>
                          )}
                          {s.temOsAtiva && (
                            <span className="text-emerald-400 font-semibold">• OS Ativa</span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-orange-400" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
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
                <option value="alta">🔴 Alta Prioridade</option>
                <option value="media">🟡 Média</option>
                <option value="baixa">🟢 Baixa</option>
              </select>
            </div>
          </div>

          {/* Frequência do Alerta */}
          <div className="pt-2 border-t border-white/10">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-orange-400" />
              Notificação / Frequência do Alerta:
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setAlertFrequency('todos_os_dias')}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  alertFrequency === 'todos_os_dias'
                    ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                    : 'bg-slate-800/60 border-white/10 text-slate-400'
                }`}
              >
                Todos os Dias
              </button>
              <button
                type="button"
                onClick={() => setAlertFrequency('dias_semana')}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  alertFrequency === 'dias_semana'
                    ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                    : 'bg-slate-800/60 border-white/10 text-slate-400'
                }`}
              >
                Dias Selecionados
              </button>
            </div>

            {alertFrequency === 'dias_semana' && (
              <div className="flex gap-1.5 justify-between">
                {diasDisponiveis.map((dia) => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => toggleDia(dia)}
                    className={`flex-1 py-1 text-center rounded-lg text-[10px] font-bold transition-all ${
                      diasSemana.includes(dia)
                        ? 'bg-orange-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-glass-glow-orange active-press"
            >
              Cadastrar Demanda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
