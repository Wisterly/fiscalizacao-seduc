import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  User,
  Phone,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Settings,
  Navigation,
  ExternalLink,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { Escola, Levantamento, GRE, OrdemServico } from '../../types';
import { StatusConservacaoBadge } from '../common/Badge';
import { EditSchoolModal } from './EditSchoolModal';
import { SchoolOSSection } from './SchoolOSSection';
import { DocumentPreviewModal } from '../orcamentos/DocumentPreviewModal';
import { storage } from '../../services/storageService';

interface SchoolTimelineProps {
  school: Escola;
  gre?: GRE;
  levantamentos: Levantamento[];
  onBack: () => void;
  onNovoLevantamento: () => void;
  onVisualizarLevantamento: (levantamento: Levantamento) => void;
  onUpdateSchool: (updatedSchool: Escola) => void;
  onDeleteLevantamentos?: (ids: string[]) => void;
  onVerOS?: (osId: string) => void;
  ordensServico?: OrdemServico[];
  onSaveOS?: (os: OrdemServico) => void;
  onUpdateMedicaoOS?: (osId: string, novoPercentual: number) => void;
}

const LONG_PRESS_MS = 450;
const MOVE_THRESHOLD_PX = 10;

export const SchoolTimeline: React.FC<SchoolTimelineProps> = ({
  school,
  gre,
  levantamentos,
  onBack,
  onNovoLevantamento,
  onVisualizarLevantamento,
  onUpdateSchool,
  onDeleteLevantamentos,
  onVerOS,
  ordensServico: propOrdensServico,
  onSaveOS: propOnSaveOS,
  onUpdateMedicaoOS: propOnUpdateMedicaoOS
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [localOrdensServico, setLocalOrdensServico] = useState<OrdemServico[]>(() =>
    propOrdensServico || storage.getOrdensServico()
  );
  const [previewDoc, setPreviewDoc] = useState<{ os: OrdemServico; tipo: 'orcamento' | 'memorial' } | null>(null);

  useEffect(() => {
    if (propOrdensServico) {
      setLocalOrdensServico(propOrdensServico);
    }
  }, [propOrdensServico]);

  const handleSaveOS = (os: OrdemServico) => {
    const list = storage.getOrdensServico();
    const exists = list.some((item) => item.id === os.id);
    const updated = exists ? list.map((item) => (item.id === os.id ? os : item)) : [os, ...list];
    try {
      localStorage.setItem('seduc_fiscal_os_v1', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setLocalOrdensServico(updated);
    if (propOnSaveOS) propOnSaveOS(os);
  };

  const handleUpdateMedicao = (osId: string, novoPercentual: number) => {
    const updated = storage.updateMedicaoOS(osId, novoPercentual);
    setLocalOrdensServico(updated);
    if (propOnUpdateMedicaoOS) propOnUpdateMedicaoOS(osId, novoPercentual);
  };

  // Estados de seleção múltipla por pressionamento longo (Long Press)
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Refs para controle preciso de Long Press sem atrapalhar o scroll no celular
  const pressTimerRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTriggeredRef = useRef(false);

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) window.clearTimeout(pressTimerRef.current);
    };
  }, []);

  // Sai do modo de seleção se trocar de escola
  useEffect(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
  }, [school.id]);

  // Ordena os levantamentos do mais recente para o mais antigo
  const sortedLevantamentos = [...levantamentos].sort((a, b) => b.id.localeCompare(a.id));

  const clearPressTimer = () => {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    startPosRef.current = null;
  };

  const activateSelectionFor = (id: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  };

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    longPressTriggeredRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };

    clearPressTimer();
    startPosRef.current = { x: e.clientX, y: e.clientY };
    pressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      activateSelectionFor(id);
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPosRef.current) return;
    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);
    if (dx > MOVE_THRESHOLD_PX || dy > MOVE_THRESHOLD_PX) {
      clearPressTimer();
    }
  };

  const handleCardClick = (lev: Levantamento) => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }
    if (selectionMode) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(lev.id)) {
          next.delete(lev.id);
        } else {
          next.add(lev.id);
        }
        return next;
      });
      return;
    }
    onVisualizarLevantamento(lev);
  };

  const handleToggleAll = () => {
    if (selectedIds.size === sortedLevantamentos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedLevantamentos.map((l) => l.id)));
    }
  };

  const handleConfirmDelete = () => {
    if (onDeleteLevantamentos && selectedIds.size > 0) {
      onDeleteLevantamentos(Array.from(selectedIds));
    }
    setShowDeleteConfirm(false);
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const mapsUrl = school.linkMaps || (school.coordenadas
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(school.coordenadas)}`
    : school.endereco
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${school.endereco}, ${school.municipio}, PI`)}`
    : null);

  return (
    <div className="w-full">
      {/* Top Header da Escola com Botão de Engrenagem no Canto Superior Direito */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white active-press flex-shrink-0"
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

        {/* Engrenagem de Configurações da Escola (Canto Superior Direito) */}
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="p-2.5 rounded-xl bg-slate-800/85 border border-amber-500/30 text-amber-400 hover:text-amber-300 hover:bg-slate-800 active-press flex-shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.18)]"
          aria-label="Configurações da Escola"
          title="Editar direção, telefone, localização e informações da escola"
        >
          <Settings className="w-4 h-4" />
        </button>
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

        <div className="space-y-2 text-xs text-slate-300">
          <div
            onClick={() => !school.diretora && setShowEditModal(true)}
            className={`flex items-center gap-2 ${!school.diretora ? 'cursor-pointer hover:text-white' : ''}`}
          >
            <User className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>
              Direção:{' '}
              <strong className={`font-medium ${school.diretora ? 'text-white' : 'text-amber-300/90 underline decoration-dotted'}`}>
                {school.diretora || 'Não informado (toque na engrenagem)'}
              </strong>
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div
              onClick={() => !school.telefone && setShowEditModal(true)}
              className={`flex items-center gap-2 min-w-0 ${!school.telefone ? 'cursor-pointer hover:text-white' : ''}`}
            >
              <Phone className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="truncate">
                Telefone:{' '}
                <strong className={`font-medium ${school.telefone ? 'text-white' : 'text-slate-400'}`}>
                  {school.telefone || 'Não informado'}
                </strong>
              </span>
            </div>
            {school.telefone && (
              <a
                href={`tel:${school.telefone.replace(/\D/g, '')}`}
                className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-lg flex-shrink-0 active-press"
              >
                Ligar
              </a>
            )}
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{school.endereco}</span>
          </div>

          {(school.coordenadas || mapsUrl) && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 min-w-0">
                <Navigation className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="text-[11px] font-mono text-amber-300/90 truncate">
                  {school.coordenadas || 'Localização por endereço'}
                </span>
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-lg flex-shrink-0 active-press"
                >
                  <span>Abrir Mapa</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          )}

          {school.observacoesGerais && (
            <div className="mt-2 pt-2 border-t border-white/[0.06] text-[11px] text-slate-300 bg-black/20 p-2 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Notas da Unidade:
              </span>
              {school.observacoesGerais}
            </div>
          )}
        </div>

        {school.temOsAtiva && school.osId && onVerOS && (
          <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Ordem de Serviço Vinculada</span>
            </div>
            <button
              type="button"
              onClick={() => onVerOS(school.osId!)}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 active-press"
            >
              Ver na Central Geral
            </button>
          </div>
        )}
      </div>

      {/* Seção Completa de Gestão de Ordens de Serviço & Orçamentos com Histórico e Anexos */}
      <SchoolOSSection
        school={school}
        ordensServico={localOrdensServico}
        onSaveOS={handleSaveOS}
        onOpenDocPreview={(os, tipo) => setPreviewDoc({ os, tipo })}
        onUpdateMedicao={handleUpdateMedicao}
      />

      {/* Botão Novo Relatório Fotográfico - Vidro Meio Transparente Premium com Borda Prismática/Furtacor (sem símbolo +) */}
      <div className="mb-4">
        <div className="p-[1.8px] rounded-2xl bg-gradient-to-r from-cyan-500/80 via-amber-400/90 to-orange-500/80 shadow-[0_4px_24px_rgba(245,158,11,0.25),0_1px_10px_rgba(6,182,212,0.22)] active-press">
          <button
            type="button"
            onClick={onNovoLevantamento}
            className="group relative w-full py-3.5 px-4 rounded-[14px] bg-slate-950/60 hover:bg-slate-900/70 backdrop-blur-2xl text-white font-black text-sm flex items-center justify-center overflow-hidden transition-all duration-300 border border-white/20 hover:border-white/30"
          >
            {/* Camada interna de vidro líquido translúcido */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.14] via-white/[0.04] to-transparent pointer-events-none" />
            
            {/* Reflexo luminoso no chanfro superior do vidro */}
            <div className="absolute top-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none group-hover:inset-x-2 transition-all duration-500" />
            
            {/* Brilho prismático sutil no rodapé */}
            <div className="absolute bottom-0 inset-x-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

            <span className="relative z-10 tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] select-none">
              Novo Relatório Fotográfico
            </span>
          </button>
        </div>
      </div>

      {/* Cabeçalho dos Relatórios OU Barra Contextual de Seleção Múltipla & Exclusão */}
      {selectionMode ? (
        <div className="flex items-center justify-between gap-2 mb-3 p-2.5 rounded-2xl bg-slate-900/90 border border-orange-500/40 backdrop-blur-xl shadow-[0_0_16px_rgba(249,115,22,0.2)] animate-fadeIn">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                setSelectionMode(false);
                setSelectedIds(new Set());
              }}
              className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white active-press"
              aria-label="Cancelar seleção"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-white truncate">
              {selectedIds.size} selecionado{selectedIds.size === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleToggleAll}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold text-slate-200 active-press"
            >
              {selectedIds.size === sortedLevantamentos.length ? 'Desmarcar' : 'Todos'}
            </button>
            <button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/50 text-orange-300 font-extrabold text-[11px] active-press disabled:opacity-40 shadow-[0_0_12px_rgba(249,115,22,0.25)]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Relatórios & Vistorias ({sortedLevantamentos.length})
          </h3>
          {sortedLevantamentos.length > 0 && (
            <span className="text-[10px] text-slate-500">Segure no card para excluir</span>
          )}
        </div>
      )}

      {/* Linha do Tempo Vertical dos Relatórios */}
      <div className="relative pl-6 pb-8 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/60 before:via-slate-700 before:to-transparent">
        {sortedLevantamentos.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 text-xs text-slate-400 text-center">
            Nenhum relatório registrado para esta escola. Toque em "Novo Relatório Fotográfico" acima para iniciar a vistoria.
          </div>
        ) : (
          sortedLevantamentos.map((lev) => {
            const fotosCount = lev.fotos.length;
            const temFotoUrgente = lev.fotos.some((f) => f.isUrgente);
            const isSelected = selectedIds.has(lev.id);

            return (
              <div
                key={lev.id}
                onPointerDown={(e) => handlePointerDown(lev.id, e)}
                onPointerUp={clearPressTimer}
                onPointerCancel={clearPressTimer}
                onPointerMove={handlePointerMove}
                onContextMenu={(e) => {
                  e.preventDefault();
                  activateSelectionFor(lev.id);
                }}
                onClick={() => handleCardClick(lev)}
                className={`relative p-3.5 rounded-2xl backdrop-blur-xl transition-all cursor-pointer active-press shadow-glass select-none ${
                  isSelected
                    ? 'bg-orange-950/35 border-2 border-orange-400/80 shadow-[0_0_16px_rgba(249,115,22,0.3)]'
                    : 'bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-cyan-500/30'
                }`}
              >
                {/* Marcador de ponto na linha do tempo */}
                <span
                  className={`absolute -left-[19px] top-4 w-3.5 h-3.5 rounded-full border-2 border-[#090D16] ${
                    isSelected
                      ? 'bg-orange-400 shadow-glass-glow-orange'
                      : temFotoUrgente
                      ? 'bg-orange-500 shadow-glass-glow-orange'
                      : 'bg-cyan-400 shadow-glass-glow-turq'
                  }`}
                />

                {/* Cabeçalho do Relatório */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    {selectionMode && (
                      <span
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-orange-500 border-orange-400 text-slate-950'
                            : 'bg-slate-800/80 border-white/25 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
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
                    {selectionMode ? (isSelected ? 'Selecionado' : 'Toque para marcar') : 'Abrir Relatório Completo'}
                    {!selectionMode && <ChevronRight className="w-3 h-3" />}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Configurações da Escola (Engrenagem) */}
      {showEditModal && (
        <EditSchoolModal
          school={school}
          onSave={(updated) => {
            onUpdateSchool(updated);
            setShowEditModal(false);
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Modal de Confirmação de Exclusão em Lote */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
        >
          <div className="w-full max-w-sm bg-[#0D1424] border border-orange-500/35 rounded-3xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/35 flex items-center justify-center text-orange-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">
                  Excluir {selectedIds.size} {selectedIds.size === 1 ? 'Relatório' : 'Relatórios'}?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Esta ação removerá os relatórios selecionados do histórico desta unidade escolar.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 active-press"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-extrabold text-xs active-press shadow-[0_0_16px_rgba(249,115,22,0.4)]"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pré-Visualização / Download de Orçamento e Memorial Descritivo */}
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
