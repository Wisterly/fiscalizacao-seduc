import React, { useState } from 'react';
import { FileText, Search, Filter, Percent, Check, Plus, AlertCircle, ChevronDown, ChevronUp, FileCode, Clock, Building } from 'lucide-react';
import { OrdemServico, GRE, Escola } from '../../types';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface OrcamentosViewProps {
  ordensServico: OrdemServico[];
  gres: GRE[];
  schools: Escola[];
  onUpdateMedicao: (osId: string, novoPercentual: number, novaObservacao?: string) => void;
  targetOsId?: string;
}

export const OrcamentosView: React.FC<OrcamentosViewProps> = ({
  ordensServico,
  gres,
  schools,
  onUpdateMedicao,
  targetOsId
}) => {
  // Filtros
  const [selectedGreId, setSelectedGreId] = useState<string>('todas');
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('todos');
  const [abaStatus, setAbaStatus] = useState<'ativa' | 'historico' | 'aguardando'>('ativa');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado de edição de medição inline
  const [editingOsId, setEditingOsId] = useState<string | null>(targetOsId || null);
  const [tempPercentual, setTempPercentual] = useState<number>(65);
  const [novaObservacao, setNovaObservacao] = useState<string>('');

  // Modal de documento (Orçamento ou Memorial)
  const [previewDoc, setPreviewDoc] = useState<{ os: OrdemServico; tipo: 'orcamento' | 'memorial' } | null>(null);

  // Lista única de municípios para filtro
  const todosMunicipios = Array.from(new Set(ordensServico.map(os => os.municipio).concat(schools.map(s => s.municipio)))).sort();

  // Filtragem das OS
  const osFiltradas = ordensServico.filter(os => {
    const matchesAba = os.status === abaStatus;
    const matchesGre = selectedGreId === 'todas' || os.greId === selectedGreId;
    const matchesMun = selectedMunicipio === 'todos' || os.municipio === selectedMunicipio;
    const matchesSearch =
      os.numeroOS.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.escolaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.empresaContratada.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesAba && matchesGre && matchesMun && matchesSearch;
  });

  // Lista de escolas sem OS / aguardando
  const escolasSemOs = schools.filter(s => {
    const semOs = !s.temOsAtiva;
    const matchesGre = selectedGreId === 'todas' || s.greId === selectedGreId;
    const matchesMun = selectedMunicipio === 'todos' || s.municipio === selectedMunicipio;
    const matchesSearch = s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || s.municipio.toLowerCase().includes(searchTerm.toLowerCase());
    return semOs && matchesGre && matchesMun && matchesSearch;
  });

  const handleOpenEditMedicao = (os: OrdemServico) => {
    setEditingOsId(os.id);
    setTempPercentual(os.percentualMedicao);
    setNovaObservacao('');
  };

  const handleSalvarMedicao = (osId: string) => {
    onUpdateMedicao(osId, tempPercentual, novaObservacao);
    setEditingOsId(null);
    setNovaObservacao('');
  };

  return (
    <div className="w-full pb-20">
      {/* Header do Módulo */}
      <div className="px-4 pt-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-glass-glow-gold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight leading-none">
              Orçamentos, OS & Medições
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Controle físico-financeiro de obras SEDUC
            </p>
          </div>
        </div>
      </div>

      {/* Abas Rápidas */}
      <div className="px-4 mb-3">
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => setAbaStatus('ativa')}
            className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all active-press ${
              abaStatus === 'ativa'
                ? 'bg-amber-500 text-slate-950 shadow-glass-glow-gold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Com OS Ativa
          </button>
          <button
            onClick={() => setAbaStatus('historico')}
            className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all active-press ${
              abaStatus === 'historico'
                ? 'bg-cyan-500 text-slate-950 shadow-glass-glow-turq'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Histórico (Concluídas)
          </button>
          <button
            onClick={() => setAbaStatus('aguardando')}
            className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all active-press ${
              abaStatus === 'aguardando'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sem OS / Aguardando
          </button>
        </div>
      </div>

      {/* Seletores de Filtro: GRE e Município */}
      <div className="px-4 space-y-2 mb-3">
        <div className="grid grid-cols-2 gap-2">
          {/* Filtro por GRE */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filtro por GRE:
            </label>
            <select
              value={selectedGreId}
              onChange={(e) => setSelectedGreId(e.target.value)}
              className="w-full text-xs bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
            >
              <option value="todas">Todas as 21 GREs</option>
              {gres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Município */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Município:
            </label>
            <select
              value={selectedMunicipio}
              onChange={(e) => setSelectedMunicipio(e.target.value)}
              className="w-full text-xs bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
            >
              <option value="todos">Todos os Municípios</option>
              {todosMunicipios.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Busca por texto */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nº da OS, escola ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="px-4 space-y-3">
        {abaStatus !== 'aguardando' ? (
          osFiltradas.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center text-xs text-slate-400">
              Nenhuma Ordem de Serviço encontrada com os filtros selecionados.
            </div>
          ) : (
            osFiltradas.map((os) => {
              const isEditing = editingOsId === os.id;
              const perc = isEditing ? tempPercentual : os.percentualMedicao;

              return (
                <div
                  key={os.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-500/30 backdrop-blur-xl transition-all shadow-glass"
                >
                  {/* Topo do Card de OS */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {os.numeroOS}
                      </span>
                      <h3 className="font-bold text-xs text-white mt-1.5 leading-snug">
                        {os.escolaNome}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {os.municipio} • Contratada: <strong className="text-slate-300 font-medium">{os.empresaContratada}</strong>
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-slate-400 block">Orçamento Total</span>
                      <span className="text-xs font-extrabold text-white">
                        {os.valorOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>

                  {/* Objeto Resumido */}
                  <p className="text-[11px] text-slate-300 leading-relaxed bg-black/20 p-2.5 rounded-xl mb-3">
                    {os.objeto}
                  </p>

                  {/* CONTROLE DE PORCENTAGEM DE MEDIÇÃO (%) */}
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5 space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-amber-400" />
                        Evolução da Medição da Obra:
                      </span>
                      <span className="font-extrabold text-sm text-amber-300">
                        {perc}% Medido
                      </span>
                    </div>

                    {/* Barra de Progresso Iluminada Dourada/Turquesa */}
                    <div className="w-full h-3 rounded-full bg-slate-950 p-0.5 border border-white/10 overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-teal-400 transition-all duration-300 shadow-glass-glow-gold"
                        style={{ width: `${perc}%` }}
                      />
                    </div>

                    {/* Controles de Ajuste de Medição */}
                    {isEditing ? (
                      <div className="pt-2 space-y-2.5 animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={tempPercentual}
                            onChange={(e) => setTempPercentual(Number(e.target.value))}
                            className="w-full accent-amber-400 cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold text-amber-300 w-10 text-right">
                            {tempPercentual}%
                          </span>
                        </div>

                        <div className="flex gap-1.5">
                          {[-10, -5, +5, +10].map((step) => (
                            <button
                              key={step}
                              type="button"
                              onClick={() => setTempPercentual(prev => Math.min(100, Math.max(0, prev + step)))}
                              className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-slate-700/60 border border-white/5 text-slate-200 active-press"
                            >
                              {step > 0 ? `+${step}%` : `${step}%`}
                            </button>
                          ))}
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Registrar anotação técnica desta medição..."
                            value={novaObservacao}
                            onChange={(e) => setNovaObservacao(e.target.value)}
                            className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                          />
                        </div>

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
                            className="px-3.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs active-press shadow-glass-glow-gold"
                          >
                            Salvar Medição
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditMedicao(os)}
                          className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline active-press"
                        >
                          Atualizar % de Medição
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Botões para abrir Orçamento e Memorial Descritivo */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setPreviewDoc({ os, tipo: 'orcamento' })}
                      className="py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 active-press transition-colors"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      Ver Orçamento
                    </button>

                    <button
                      onClick={() => setPreviewDoc({ os, tipo: 'memorial' })}
                      className="py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 active-press transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Ver Memorial
                    </button>
                  </div>

                  {/* Histórico recente de observações da OS */}
                  {os.observacoes && os.observacoes.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/[0.06] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Anotações do Fiscal:
                      </span>
                      {os.observacoes.slice(0, 2).map((obs) => (
                        <p key={obs.id} className="text-[10px] text-slate-300 bg-black/15 p-1.5 rounded-lg">
                          <strong className="text-amber-300">{obs.data}:</strong> {obs.texto}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          /* Aba: Sem OS / Aguardando */
          escolasSemOs.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center text-xs text-slate-400">
              Todas as escolas filtradas possuem Ordem de Serviço cadastrada.
            </div>
          ) : (
            escolasSemOs.map((esc) => (
              <div
                key={esc.id}
                className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-xs text-white">{esc.nome}</h4>
                  <p className="text-[11px] text-slate-400">{esc.municipio} • Sem OS emitida</p>
                  <span className="text-[10px] text-orange-400 font-medium">
                    Status: {esc.statusConservacao.toUpperCase()} (Aguardando orçamento / processo licitatório)
                  </span>
                </div>

                <button
                  onClick={() => alert(`Escola ${esc.nome} sinalizada para elaboração de projeto e orçamento junto à Gerência Naila.`)}
                  className="px-3 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold active-press whitespace-nowrap"
                >
                  Solicitar OS
                </button>
              </div>
            ))
          )
        )}
      </div>

      {/* Modal de Prévia de Documento (Orçamento ou Memorial) */}
      {previewDoc && (
        <DocumentPreviewModal
          os={previewDoc.os}
          tipo={previewDoc.tipo}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
