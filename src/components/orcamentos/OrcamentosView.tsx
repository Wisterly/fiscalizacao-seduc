import React, { useState } from 'react';
import {
  FileText,
  Search,
  ChevronDown,
  MoreVertical,
  Check,
  AlertCircle,
  FileCode,
  Sliders,
  X,
  Paperclip,
  Download,
  RefreshCw,
  ArrowLeft,
  MapPin
} from 'lucide-react';
import { OrdemServico, GRE, Escola } from '../../types';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { AttachOSModal } from './AttachOSModal';
import { GreSelector } from '../vistorias/GreSelector';
import { syncAtaFromGoogleSheets } from '../../services/sheetsSyncService';
import { storage } from '../../services/storageService';

interface OrcamentosViewProps {
  ordensServico: OrdemServico[];
  gres: GRE[];
  schools: Escola[];
  selectedGre?: GRE | null;
  onSelectGre?: (gre: GRE | null) => void;
  onUpdateMedicao: (osId: string, novoPercentual: number, novaObservacao?: string) => void;
  onSaveOS?: (os: OrdemServico) => void;
  targetOsId?: string;
  onBack?: () => void;
}

export const OrcamentosView: React.FC<OrcamentosViewProps> = ({
  ordensServico,
  gres,
  schools,
  selectedGre,
  onSelectGre,
  onUpdateMedicao,
  onSaveOS,
  targetOsId,
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
    setSelectedMunicipio('todos');
  };

  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('todos');
  const [abaStatus, setAbaStatus] = useState<'ativa' | 'historico'>('ativa');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado de edição de medição inline
  const [editingOsId, setEditingOsId] = useState<string | null>(targetOsId || null);
  const [tempPercentual, setTempPercentual] = useState<number>(65);
  const [novaObservacao, setNovaObservacao] = useState<string>('');

  // Menu de opções dos 3 pontinhos de cada card
  const [cardMenuOpenId, setCardMenuOpenId] = useState<string | null>(null);

  // Modal de documento (Orçamento ou Memorial)
  const [previewDoc, setPreviewDoc] = useState<{ os: OrdemServico; tipo: 'orcamento' | 'memorial' } | null>(null);

  // Modal de Anexo e Edição de OS
  const [attachModalOS, setAttachModalOS] = useState<OrdemServico | null>(null);

  // Sincronização ao vivo da Ata de Manutenção
  const [syncingAta, setSyncingAta] = useState(false);

  const handleSyncAtaLive = async () => {
    setSyncingAta(true);
    try {
      const updatedOS = await syncAtaFromGoogleSheets(schools);
      storage.syncOrdensServicoFromAta(updatedOS);
      if (onSaveOS && updatedOS.length > 0) {
        onSaveOS(updatedOS[0]);
      }
      alert(`Sincronização concluída com sucesso! ${updatedOS.length} ordens de serviço atualizadas do Google Sheets.`);
    } catch (e: any) {
      alert(`Erro ao sincronizar ata: ${e?.message || e}`);
    } finally {
      setSyncingAta(false);
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
          titulo="1. Selecionar a GRE para Orçamentos e OS"
          subtitulo="Acompanhe ordens de serviço, contratos da ata e medições físicas"
          badgeTexto="21 Regiões"
          onSelectGre={setActiveGre}
        />
      </div>
    );
  }

  // Municípios da GRE selecionada
  const municipiosDaGre = Array.from(
    new Set(
      ordensServico
        .filter((os) => os.greId === activeGre.id)
        .map((os) => os.municipio)
        .concat(schools.filter((s) => s.greId === activeGre.id).map((s) => s.municipio))
    )
  ).sort();

  // Filtragem das Ordens de Serviço estritamente para a GRE selecionada
  const osFiltradas = ordensServico.filter((os) => {
    const matchesAba = os.status === abaStatus;
    const matchesGre = os.greId === activeGre.id;
    const matchesMun = selectedMunicipio === 'todos' || os.municipio === selectedMunicipio;
    const matchesSearch =
      !searchTerm ||
      os.numeroOS.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.escolaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.empresaContratada.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesAba && matchesGre && matchesMun && matchesSearch;
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
    <div className="w-full pb-20 pt-1 animate-fadeIn">
      {/* 1. SELETORES SUPERIORES (GRE e MUNICÍPIO) */}
      <div className="px-4 mb-3 space-y-2">
        <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveGre(null)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-xs font-bold border border-slate-700 transition-colors shrink-0"
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
                Sede: {activeGre.sede}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
            {String(activeGre.numero).padStart(2, '0')}ª GRE
          </span>
        </div>

        {/* Seletor de Município da GRE */}
        <div className="relative">
          <select
            value={selectedMunicipio}
            onChange={(e) => setSelectedMunicipio(e.target.value)}
            className="w-full appearance-none bg-slate-900/80 border border-white/10 rounded-2xl px-3.5 py-2.5 pr-8 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 backdrop-blur-md cursor-pointer shadow-sm"
          >
            <option value="todos">Todos os Municípios ({activeGre.nome})</option>
            {municipiosDaGre.map((mun) => (
              <option key={mun} value={mun} className="bg-slate-900 text-white">
                {mun}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* 2. CAMPO DE FILTRO / BUSCA ("Filtro em Teresina") */}
      <div className="px-4 mb-3.5">
        <div className="relative flex items-center rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md px-3.5 py-2 shadow-sm focus-within:border-cyan-400/70 transition-colors">
          <input
            type="text"
            placeholder={
              selectedMunicipio !== 'todos'
                ? `Filtro em ${selectedMunicipio}`
                : 'Filtro por escola ou OS'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none pr-6"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none" />
          )}
        </div>
      </div>

      {/* 3. PÍLULAS / ABAS DE STATUS (Com OS Ativa | Histórico de OS) + Sincronizar Google Sheets */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAbaStatus('ativa')}
              className={`px-3.5 py-2 rounded-full text-xs transition-all active-press ${
                abaStatus === 'ativa'
                  ? 'border-2 border-amber-400 bg-amber-500/15 text-amber-300 font-extrabold shadow-[0_0_15px_rgba(234,179,8,0.30)]'
                  : 'border border-white/10 bg-slate-900/60 text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              Com OS Ativa ({ordensServico.filter((o) => o.status === 'ativa').length})
            </button>

            <button
              onClick={() => setAbaStatus('historico')}
              className={`px-3.5 py-2 rounded-full text-xs transition-all active-press ${
                abaStatus === 'historico'
                  ? 'border-2 border-cyan-400 bg-cyan-500/15 text-cyan-300 font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.30)]'
                  : 'border border-cyan-500/30 bg-slate-900/60 text-cyan-300 hover:border-cyan-400 font-medium'
              }`}
            >
              Histórico ({ordensServico.filter((o) => o.status === 'historico').length})
            </button>
          </div>

          <button
            type="button"
            onClick={handleSyncAtaLive}
            disabled={syncingAta}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 active-press disabled:opacity-50"
            title="Sincronizar Ata de Manutenção ao vivo do Google Sheets"
          >
            <RefreshCw className={`w-4 h-4 ${syncingAta ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. LISTA DE CARDS DE ESCOLAS (EXATAMENTE COMO NO MOCKUP) */}
      <div className="px-4 space-y-3.5">
        {osFiltradas.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10 text-center text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Nenhuma Ordem de Serviço encontrada.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Tente selecionar &quot;Todas as GREs&quot; ou limpar o filtro de busca.
            </p>
          </div>
        ) : (
          osFiltradas.map((os) => {
            const isEditing = editingOsId === os.id;
            const perc = isEditing ? tempPercentual : os.percentualMedicao;
            const ultimaObs =
              os.observacoes && os.observacoes.length > 0
                ? os.observacoes[0].texto
                : 'Aguardando materiais da empresa contratada para avanço da cobertura.';

            return (
              <div
                key={os.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl shadow-glass relative space-y-2.5 transition-all hover:border-amber-500/30"
              >
                {/* Topo do Card: Nome da Escola + Menu de 3 Pontinhos */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-white leading-snug tracking-tight truncate">
                      {os.escolaNome}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Nº da OS: <span className="text-slate-300 font-semibold">{os.numeroOS}</span>
                    </p>
                  </div>

                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() =>
                        setCardMenuOpenId(cardMenuOpenId === os.id ? null : os.id)
                      }
                      className="p-1 -mr-1 text-slate-400 hover:text-white active-press"
                      aria-label="Mais opções"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu dos 3 Pontinhos */}
                    {cardMenuOpenId === os.id && (
                      <div className="absolute right-0 top-7 z-20 w-44 rounded-xl bg-slate-900 border border-white/15 p-1 shadow-2xl animate-fadeIn">
                        <button
                          onClick={() => {
                            setCardMenuOpenId(null);
                            handleOpenEditMedicao(os);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-slate-800 rounded-lg flex items-center gap-2"
                        >
                          <Sliders className="w-3.5 h-3.5 text-amber-400" />
                          Ajustar % de Medição
                        </button>
                        <button
                          onClick={() => {
                            setCardMenuOpenId(null);
                            setPreviewDoc({ os, tipo: 'orcamento' });
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-slate-800 rounded-lg flex items-center gap-2"
                        >
                          <FileCode className="w-3.5 h-3.5 text-amber-400" />
                          Planilha Orçamentária
                        </button>
                        <button
                          onClick={() => {
                            setCardMenuOpenId(null);
                            setPreviewDoc({ os, tipo: 'memorial' });
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-slate-800 rounded-lg flex items-center gap-2"
                        >
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          Memorial Descritivo
                        </button>
                        <button
                          onClick={() => {
                            setCardMenuOpenId(null);
                            setAttachModalOS(os);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs text-amber-300 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                          Anexar / Links de Arquivos
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Linha com Link Turquesa + Botão [PDF] */}
                <div className="flex items-center justify-between pt-0.5">
                  <button
                    onClick={() => setPreviewDoc({ os, tipo: 'orcamento' })}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 flex items-center gap-1.5 active-press transition-colors text-left"
                  >
                    Ver Orçamento e Memorial Descritivo
                  </button>

                  <button
                    onClick={() => setPreviewDoc({ os, tipo: 'orcamento' })}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 active-press transition-colors text-[10px] font-bold shadow-sm"
                    title="Abrir arquivo PDF oficial"
                  >
                    <FileText className="w-3 h-3 text-red-400" />
                    <span>PDF</span>
                  </button>
                </div>

                {/* BARRA DE MEDIÇÃO ESTILIZADA EXATA DA REFERÊNCIA */}
                {/* Cápsula arredondada com contorno neon turquesa e gradiente dourado interno */}
                <div className="pt-1">
                  <div
                    onClick={() => {
                      if (!isEditing) handleOpenEditMedicao(os);
                    }}
                    className="relative w-full h-8 rounded-full border-2 border-cyan-400 bg-slate-950/80 p-0.5 shadow-[0_0_18px_rgba(6,182,212,0.45)] cursor-pointer overflow-hidden active-press transition-all group"
                    title="Clique para ajustar a medição"
                  >
                    {/* Barra de Progresso Dourada Interna */}
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 transition-all duration-300 shadow-glass-glow-gold"
                      style={{ width: `${perc}%` }}
                    />

                    {/* Texto Centralizado na Cápsula: "65% Medido" */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs font-extrabold text-white tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                        {perc}% Medido
                      </span>
                    </div>
                  </div>
                </div>

                {/* CONTROLES INTERATIVOS EXPANSÍVEIS DE MEDIÇÃO */}
                {isEditing && (
                  <div className="pt-2 pb-1 space-y-2.5 animate-fadeIn bg-slate-950/60 p-3 rounded-2xl border border-white/10 mt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span>Ajustar Medição em Campo:</span>
                      <span className="font-mono text-sm">{tempPercentual}%</span>
                    </div>

                    {/* Slider */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={tempPercentual}
                      onChange={(e) => setTempPercentual(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />

                    {/* Botões Rápidos */}
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

                    {/* Anotação Técnica */}
                    <input
                      type="text"
                      placeholder="Registrar anotação técnica desta medição..."
                      value={novaObservacao}
                      onChange={(e) => setNovaObservacao(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />

                    {/* Botões de Ação */}
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
                )}

                {/* Linha de Observações Técnicas */}
                <div className="pt-1.5 border-t border-white/[0.06]">
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-slate-400 font-semibold">Observações: </strong>
                    {ultimaObs}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Prévia de Documento (Orçamento ou Memorial Descritivo) */}
      {previewDoc && (
        <DocumentPreviewModal
          os={previewDoc.os}
          tipo={previewDoc.tipo}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Modal de Anexo e Edição de Arquivos da OS */}
      {attachModalOS && (
        <AttachOSModal
          os={attachModalOS}
          school={
            schools.find((s) => s.id === attachModalOS.escolaId) || {
              id: attachModalOS.escolaId,
              nome: attachModalOS.escolaNome,
              greId: attachModalOS.greId,
              municipio: attachModalOS.municipio,
              endereco: attachModalOS.municipio,
              statusConservacao: 'regular',
              dataUltimaVistoria: 'Sem vistoria',
              diasSemVisita: 0,
              demandasUrgentesCount: 0,
              temOsAtiva: true
            }
          }
          onSave={(savedOS) => {
            if (onSaveOS) onSaveOS(savedOS);
            setAttachModalOS(null);
          }}
          onClose={() => setAttachModalOS(null)}
        />
      )}
    </div>
  );
};
