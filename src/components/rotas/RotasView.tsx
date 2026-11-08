import React, { useState } from 'react';
import { Compass, Sparkles, Copy, Check, Calendar, MapPin, AlertTriangle, Plus, Trash2, ArrowRight } from 'lucide-react';
import { RotaVistoria, Escola, GRE, RotaItem } from '../../types';
import { AIService } from '../../services/aiService';

interface RotasViewProps {
  rotas: RotaVistoria[];
  schools: Escola[];
  gres: GRE[];
  onSaveRota: (rota: RotaVistoria) => void;
  onConcluirRota: (rotaId: string) => void;
}

export const RotasView: React.FC<RotasViewProps> = ({
  rotas,
  schools,
  gres,
  onSaveRota,
  onConcluirRota
}) => {
  const [selectedGreId, setSelectedGreId] = useState<string>('gre-19'); // Teresina Centro/Norte
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [showCriarModal, setShowCriarModal] = useState(false);

  // IA - Gera sugestão inteligente calculando scores em tempo real
  const greAtiva = gres.find(g => g.id === selectedGreId) || gres[0];
  const sugestoesIA = AIService.gerarSugestaoRotaIA(schools, greAtiva);

  // Rota ativa
  const rotaAtiva = rotas[0];

  const handleCopiarWhatsApp = async () => {
    if (!rotaAtiva) return;

    const itensFormatados = rotaAtiva.itens.map(it => {
      const esc = schools.find(s => s.id === it.escolaId);
      return {
        escolaNome: esc ? esc.nome : 'Escola SEDUC',
        municipio: esc ? esc.municipio : 'Piauí',
        diaSugerido: it.diaSugerido,
        motivoUrgencia: it.motivoUrgencia
      };
    });

    const textoFormatado = AIService.formatarRotaParaWhatsApp(
      rotaAtiva.titulo,
      rotaAtiva.mesReferencia,
      greAtiva?.nome || 'Jurisdição SEDUC Piauí',
      itensFormatados
    );

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textoFormatado);
      } else {
        // Fallback textarea
        const textArea = document.createElement('textarea');
        textArea.value = textoFormatado;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    } catch (e) {
      console.error('Erro ao copiar para clipboard:', e);
    }
  };

  const handleDarOkRota = (rotaId: string) => {
    onConcluirRota(rotaId);
  };

  const handleGerarNovaRotaComIA = () => {
    const novosItens: RotaItem[] = sugestoesIA.map((sug, idx) => ({
      escolaId: sug.escola.id,
      diaSugerido: sug.diaSugerido,
      ordem: idx + 1,
      motivoUrgencia: sug.motivo
    }));

    const novaRota: RotaVistoria = {
      id: `rota-${Date.now()}`,
      titulo: `Roteiro Inteligente - ${greAtiva.nome}`,
      mesReferencia: 'Novembro/Dezembro 2026',
      greId: greAtiva.id,
      itens: novosItens,
      status: 'planejada',
      resumoIA: `Roteiro gerado pelo motor de IA considerando ${sugestoesIA.length} escolas com alto risco estrutural ou longo período sem visita.`
    };

    onSaveRota(novaRota);
    alert('Nova rota otimizada pela IA gerada com sucesso!');
  };

  return (
    <div className="w-full pb-20">
      {/* Topo do Módulo */}
      <div className="px-4 pt-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-glass-glow-turq">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-white tracking-tight leading-none">
                  Planejador Inteligente de Rotas
                </h2>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-bold flex items-center gap-1 animate-ai-glow">
                  <Sparkles className="w-2.5 h-2.5" />
                  IA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cruzamento preditivo: Dias sem visita + Estado crítico + Demandas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seletor de Jurisdição / GRE */}
      <div className="px-4 mb-3">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Jurisdição para Otimização de Rota:
        </label>
        <select
          value={selectedGreId}
          onChange={(e) => setSelectedGreId(e.target.value)}
          className="w-full text-xs bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
        >
          {gres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nome} (Sede: {g.sede})
            </option>
          ))}
        </select>
      </div>

      {/* Card da Rota Ativa / Roteiro Vigente */}
      {rotaAtiva && (
        <div className="px-4 mb-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-950/40 via-slate-900/70 to-slate-950/90 border border-teal-500/30 backdrop-blur-xl shadow-glass relative overflow-hidden">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  Roteiro de Vistorias Recomendado
                </span>
                <h3 className="font-extrabold text-sm text-white mt-0.5 leading-snug">
                  {rotaAtiva.titulo}
                </h3>
                <p className="text-[11px] text-slate-300">
                  {rotaAtiva.mesReferencia} • {rotaAtiva.itens.length} Unidades Programadas
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${
                rotaAtiva.status === 'concluida'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
              }`}>
                {rotaAtiva.status === 'concluida' ? 'Concluída' : 'Planejada'}
              </span>
            </div>

            {/* Resumo da IA */}
            <p className="text-xs text-slate-300 bg-black/25 p-2.5 rounded-xl mb-3 leading-relaxed border border-white/5">
              🤖 <strong>Análise da IA:</strong> {rotaAtiva.resumoIA}
            </p>

            {/* Lista das Escolas da Rota com Dias */}
            <div className="space-y-2 mb-4">
              {rotaAtiva.itens.map((it, idx) => {
                const esc = schools.find(s => s.id === it.escolaId);

                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate">
                          {esc ? esc.nome : 'Escola SEDUC'}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-teal-400" />
                          <span>{esc?.municipio || 'PI'}</span>
                          <span>•</span>
                          <span className="text-teal-300 font-medium">{it.diaSugerido}</span>
                        </div>
                        <div className="text-[10px] text-orange-400/90 mt-0.5">
                          ⚠️ {it.motivoUrgencia}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BOTÕES DE AÇÃO: Copiar WhatsApp & Dar OK */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.08]">
              {/* Botão Copiar Rota para WhatsApp */}
              <button
                onClick={handleCopiarWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 active-press transition-all shadow-glass"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar WhatsApp</span>
                  </>
                )}
              </button>

              {/* Botão Dar OK (Rota Concluída) */}
              <button
                onClick={() => handleDarOkRota(rotaAtiva.id)}
                disabled={rotaAtiva.status === 'concluida'}
                className="py-2.5 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 active-press transition-all shadow-glass-glow-turq"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{rotaAtiva.status === 'concluida' ? 'Concluída' : 'Dar OK (Concluída)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seção: Sugestões Dinâmicas do Motor de IA */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Escolas com Maior Criticidade no Piauí
            </h3>
          </div>

          <button
            onClick={handleGerarNovaRotaComIA}
            className="text-[11px] font-bold text-teal-300 hover:text-teal-200 px-2.5 py-1 rounded-xl bg-teal-500/15 border border-teal-500/30 active-press"
          >
            Regenerar com IA
          </button>
        </div>

        <div className="space-y-2">
          {sugestoesIA.map((sug, idx) => (
            <div
              key={sug.escola.id}
              className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-xl flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white truncate">{sug.escola.nome}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    Score {sug.score}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {sug.escola.municipio} • {sug.motivo}
                </p>
                <p className="text-[10px] text-teal-300 mt-0.5 font-medium">
                  📅 Sugestão de dia: {sug.diaSugerido}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-[10px] font-bold text-slate-400 block">Última Visita</span>
                <span className="text-xs font-semibold text-slate-200">
                  {sug.escola.diasSemVisita}d atrás
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
