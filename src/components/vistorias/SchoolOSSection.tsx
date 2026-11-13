import React, { useState } from 'react';
import {
  FileText,
  Plus,
  FolderOpen,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Building2,
  DollarSign,
  Percent,
  Sliders,
  Paperclip
} from 'lucide-react';
import { OrdemServico, Escola } from '../../types';
import { AttachOSModal } from '../orcamentos/AttachOSModal';

interface SchoolOSSectionProps {
  school: Escola;
  ordensServico: OrdemServico[];
  onSaveOS: (savedOS: OrdemServico) => void;
  onOpenDocPreview: (os: OrdemServico, tipo: 'orcamento' | 'memorial') => void;
  onUpdateMedicao: (osId: string, novoPercentual: number) => void;
}

export const SchoolOSSection: React.FC<SchoolOSSectionProps> = ({
  school,
  ordensServico,
  onSaveOS,
  onOpenDocPreview,
  onUpdateMedicao
}) => {
  const [tabStatus, setTabStatus] = useState<'ativa' | 'historico'>('ativa');
  const [editingOS, setEditingOS] = useState<OrdemServico | null>(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [adjustingOsId, setAdjustingOsId] = useState<string | null>(null);

  // Filtra as OSs pertencentes a esta escola
  // Considera por escolaId, inep ou nome aproximado
  const schoolOSList = ordensServico.filter((os) => {
    if (os.escolaId === school.id) return true;
    if (school.inep && (os as any).inep === school.inep) return true;
    if (os.escolaNome.toLowerCase() === school.nome.toLowerCase()) return true;
    return false;
  });

  const ativas = schoolOSList.filter((os) => os.status === 'ativa');
  const historico = schoolOSList.filter((os) => os.status === 'historico');

  const displayedList = tabStatus === 'ativa' ? ativas : historico;

  const handleOpenDownload = (urlOrBlob?: string, fallbackDoc?: string) => {
    if (urlOrBlob) {
      if (urlOrBlob.startsWith('data:') || urlOrBlob.startsWith('http')) {
        const win = window.open(urlOrBlob, '_blank');
        if (!win) {
          // Fallback para download via link temporário
          const a = document.createElement('a');
          a.href = urlOrBlob;
          a.download = fallbackDoc || 'documento.pdf';
          a.click();
        }
        return;
      }
    }
  };

  return (
    <div className="mb-4">
      {/* Container Principal */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B132B]/80 via-slate-900/60 to-slate-950/90 border border-cyan-500/25 backdrop-blur-xl shadow-glass space-y-3">
        {/* Topo da Seção com Título & Pasta de Documentos */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Gestão de Obras & Ordens de Serviço
            </span>
            <h3 className="font-bold text-xs text-white mt-0.5">
              Contratos, Orçamentos & Medições
            </h3>
          </div>

          {/* Botão de Adicionar Nova OS */}
          <button
            type="button"
            onClick={() => {
              setEditingOS(null);
              setShowAttachModal(true);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 font-extrabold text-[11px] active-press hover:bg-cyan-500/25 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nova OS</span>
          </button>
        </div>

        {/* Link da Pasta Geral da Escola no Drive (se configurada) */}
        {school.linkPastaDocumentos && (
          <a
            href={school.linkPastaDocumentos}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:text-amber-200 active-press transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FolderOpen className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold truncate">Pasta de Documentos no Google Drive</p>
                <p className="text-[9px] text-amber-300/70 truncate">Todas as OSs e orçamentos desta unidade</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          </a>
        )}

        {/* Abas: Em Execução vs Histórico */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-white/5">
          <button
            type="button"
            onClick={() => setTabStatus('ativa')}
            className={`py-1.5 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tabStatus === 'ativa'
                ? 'bg-amber-500 text-slate-950 shadow-glass-glow-gold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Em Execução ({ativas.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTabStatus('historico')}
            className={`py-1.5 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tabStatus === 'historico'
                ? 'bg-emerald-500 text-slate-950 shadow-glass-glow-green'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Histórico ({historico.length})</span>
          </button>
        </div>

        {/* Lista de Ordens de Serviço */}
        {displayedList.length === 0 ? (
          <div className="py-6 px-4 rounded-xl bg-slate-950/40 border border-white/5 text-center space-y-2">
            <p className="text-xs text-slate-400">
              {tabStatus === 'ativa'
                ? 'Nenhuma Ordem de Serviço em execução no momento.'
                : 'Nenhuma Ordem de Serviço anterior arquivada.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingOS(null);
                setShowAttachModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-cyan-300 active-press"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar ou Anexar Documentos</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {displayedList.map((os) => {
              const isAdjusting = adjustingOsId === os.id;
              const hasOsPdf = Boolean(os.osPdfBlob || os.osPdfUrl);
              const hasOrcamentoPdf = Boolean(os.orcamentoPdfBlob || os.orcamentoPdfUrl);

              return (
                <div
                  key={os.id}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-2.5 transition-all hover:border-cyan-500/40"
                >
                  {/* Topo do Card de OS */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          {os.numeroOS}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            os.status === 'ativa'
                              ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/20'
                              : 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'
                          }`}
                        >
                          {os.status === 'ativa' ? 'Em Andamento' : 'Concluída'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-white mt-1 leading-snug line-clamp-2">
                        {os.objeto}
                      </h4>
                    </div>

                    {/* Botão de Editar / Anexar Arquivos */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingOS(os);
                        setShowAttachModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 active-press flex-shrink-0"
                      title="Anexar arquivos ou editar OS"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                  </div>

                  {/* Informações da Empresa & Valor */}
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-white/5">
                    <span className="truncate max-w-[55%] text-slate-400">
                      {os.empresaContratada}
                    </span>
                    <span className="font-extrabold text-amber-300 font-mono">
                      {os.valorOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  {/* BARRA DE MEDIÇÃO EM CÁPSULA NEON */}
                  <div>
                    <div
                      onClick={() => setAdjustingOsId(isAdjusting ? null : os.id)}
                      className="relative w-full h-7 rounded-full border-2 border-cyan-400 bg-slate-950 p-0.5 shadow-[0_0_12px_rgba(6,182,212,0.35)] cursor-pointer overflow-hidden active-press"
                      title="Toque para atualizar o percentual medido"
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 transition-all duration-300"
                        style={{ width: `${os.percentualMedicao}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[11px] font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                          {os.percentualMedicao}% Medido
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Controle de Ajuste Rápido de Medição */}
                  {isAdjusting && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                        <span>Ajustar Medição em Campo:</span>
                        <span className="font-mono">{os.percentualMedicao}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={os.percentualMedicao}
                        onChange={(e) => onUpdateMedicao(os.id, Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                      <div className="flex gap-1">
                        {[-10, -5, +5, +10].map((step) => (
                          <button
                            key={step}
                            type="button"
                            onClick={() =>
                              onUpdateMedicao(
                                os.id,
                                Math.min(100, Math.max(0, os.percentualMedicao + step))
                              )
                            }
                            className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-slate-800 text-slate-200 active-press hover:bg-slate-700"
                          >
                            {step > 0 ? `+${step}%` : `${step}%`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DOCUMENTOS DISPONÍVEIS: OS & ORÇAMENTO DESCRITIVO */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Botão 1: Ordem de Serviço (PDF) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (hasOsPdf) {
                          handleOpenDownload(os.osPdfBlob || os.osPdfUrl, `OS_${os.numeroOS}.pdf`);
                        } else {
                          // Se não anexou ainda, abre o preview oficial ou convida a anexar
                          onOpenDocPreview(os, 'orcamento');
                        }
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-left active-press transition-colors group"
                    >
                      <div className="min-w-0 pr-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">
                          Documento OS
                        </span>
                        <span className="text-[10px] font-semibold text-white truncate block">
                          {hasOsPdf ? (os.osPdfNome || 'Baixar OS (PDF)') : 'Ver Documento'}
                        </span>
                      </div>
                      <Download className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    </button>

                    {/* Botão 2: Orçamento & Memorial Descritivo (PDF) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (hasOrcamentoPdf) {
                          handleOpenDownload(os.orcamentoPdfBlob || os.orcamentoPdfUrl, `Orcamento_${os.numeroOS}.pdf`);
                        } else {
                          onOpenDocPreview(os, 'orcamento');
                        }
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-left active-press transition-colors group"
                    >
                      <div className="min-w-0 pr-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 block">
                          Orçamento Descritivo
                        </span>
                        <span className="text-[10px] font-semibold text-white truncate block">
                          {hasOrcamentoPdf ? (os.orcamentoPdfNome || 'Baixar Orçamento') : 'Ver Planilha'}
                        </span>
                      </div>
                      <Download className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Anexo / Criação de OS */}
      {showAttachModal && (
        <AttachOSModal
          os={editingOS}
          school={school}
          onSave={(savedOS) => {
            onSaveOS(savedOS);
            setShowAttachModal(false);
            setEditingOS(null);
          }}
          onClose={() => {
            setShowAttachModal(false);
            setEditingOS(null);
          }}
        />
      )}
    </div>
  );
};
