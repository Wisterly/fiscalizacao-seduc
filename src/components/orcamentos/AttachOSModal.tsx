import React, { useState } from 'react';
import { X, FileText, Upload, Link as LinkIcon, Check, Save, Trash2, ExternalLink } from 'lucide-react';
import { OrdemServico, Escola } from '../../types';

interface AttachOSModalProps {
  os?: OrdemServico | null;
  school: Escola;
  onSave: (savedOS: OrdemServico) => void;
  onClose: () => void;
}

export const AttachOSModal: React.FC<AttachOSModalProps> = ({
  os,
  school,
  onSave,
  onClose
}) => {
  const isEditing = Boolean(os);

  const [numeroOS, setNumeroOS] = useState(os?.numeroOS || '');
  const [objeto, setObjeto] = useState(os?.objeto || 'Reforma geral e manutenção estrutural');
  const [empresaContratada, setEmpresaContratada] = useState(os?.empresaContratada || '');
  const [valorOrcamento, setValorOrcamento] = useState(os ? String(os.valorOrcamento) : '150000');
  const [percentualMedicao, setPercentualMedicao] = useState(os ? os.percentualMedicao : 0);
  const [status, setStatus] = useState<'ativa' | 'historico'>(os?.status === 'historico' ? 'historico' : 'ativa');

  // Documento: Ordem de Serviço (PDF)
  const [osPdfUrl, setOsPdfUrl] = useState(os?.osPdfUrl || '');
  const [osPdfNome, setOsPdfNome] = useState(os?.osPdfNome || '');
  const [osPdfBlob, setOsPdfBlob] = useState(os?.osPdfBlob || '');

  // Documento: Orçamento / Memorial Descritivo (PDF)
  const [orcamentoPdfUrl, setOrcamentoPdfUrl] = useState(os?.orcamentoPdfUrl || '');
  const [orcamentoPdfNome, setOrcamentoPdfNome] = useState(os?.orcamentoPdfNome || '');
  const [orcamentoPdfBlob, setOrcamentoPdfBlob] = useState(os?.orcamentoPdfBlob || '');

  // Leitor de arquivo local para OS
  const handleUploadOSPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOsPdfNome(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setOsPdfBlob(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Leitor de arquivo local para Orçamento Descritivo
  const handleUploadOrcamentoPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOrcamentoPdfNome(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setOrcamentoPdfBlob(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroOS.trim()) return;

    const valor = parseFloat(valorOrcamento.replace(',', '.')) || 0;
    const finalOS: OrdemServico = {
      id: os?.id || `os-${Date.now()}`,
      numeroOS: numeroOS.trim(),
      escolaId: school.id,
      escolaNome: school.nome,
      greId: school.greId,
      municipio: school.municipio,
      objeto: objeto.trim(),
      empresaContratada: empresaContratada.trim() || 'Empresa Contratada SEDUC',
      valorOrcamento: valor,
      percentualMedicao: percentualMedicao,
      dataInicio: os?.dataInicio || new Date().toISOString().split('T')[0],
      prazoFinal: os?.prazoFinal || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      status: percentualMedicao >= 100 ? 'historico' : status,
      orcamentoPdfSimulado: os?.orcamentoPdfSimulado || 'orcamento_descritivo.pdf',
      memorialDescritivoPdfSimulado: os?.memorialDescritivoPdfSimulado || 'memorial_descritivo.pdf',
      osPdfUrl: osPdfUrl.trim() || undefined,
      osPdfBlob: osPdfBlob || undefined,
      osPdfNome: osPdfNome || undefined,
      orcamentoPdfUrl: orcamentoPdfUrl.trim() || undefined,
      orcamentoPdfBlob: orcamentoPdfBlob || undefined,
      orcamentoPdfNome: orcamentoPdfNome || undefined,
      observacoes: os?.observacoes || [
        {
          id: `obs-${Date.now()}`,
          data: new Date().toLocaleDateString('pt-BR'),
          texto: 'Ordem de Serviço registrada no sistema Fiscal.IA.lab.',
          autor: 'Fiscal de Obras GPR'
        }
      ]
    };

    onSave(finalOS);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
    >
      <div className="w-full max-w-md bg-[#0D1424] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                {isEditing ? 'Editar Ordem de Serviço' : 'Vincular Nova OS & Orçamento'}
              </span>
              <h3 className="font-bold text-white text-xs truncate">
                {school.nome}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 active-press"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário com Scroll Suave */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto no-scrollbar">
          {/* Status da OS */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Situação da Ordem de Serviço
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('ativa')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all active-press flex items-center justify-center gap-1.5 ${
                  status === 'ativa'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900/60 border-white/10 text-slate-400'
                }`}
              >
                <span>Em Execução (Ativa)</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('historico')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all active-press flex items-center justify-center gap-1.5 ${
                  status === 'historico'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-900/60 border-white/10 text-slate-400'
                }`}
              >
                <span>Finalizada (Histórico)</span>
              </button>
            </div>
          </div>

          {/* Número da OS & Empresa */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Número da OS *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 042/2026-SEDUC"
                value={numeroOS}
                onChange={(e) => setNumeroOS(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Valor Total (R$)
              </label>
              <input
                type="text"
                placeholder="Ex: 250000"
                value={valorOrcamento}
                onChange={(e) => setValorOrcamento(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-amber-300 font-bold placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Empresa Contratada / Construtora
            </label>
            <input
              type="text"
              placeholder="Razão Social ou Nome Fantasia da Empreiteira"
              value={empresaContratada}
              onChange={(e) => setEmpresaContratada(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Objeto da Obra / Reforma
            </label>
            <textarea
              rows={2}
              placeholder="Descreva o escopo da obra, reformas de salas, cobertura, climatização..."
              value={objeto}
              onChange={(e) => setObjeto(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {/* Medição Atual (%) */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-cyan-400">Avanço Físico Medido:</span>
              <span className="text-white font-mono text-sm px-2 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40">
                {percentualMedicao}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={percentualMedicao}
              onChange={(e) => setPercentualMedicao(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* SEÇÃO 1: DOCUMENTO DA ORDEM DE SERVIÇO (PDF / DRIVE) */}
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                1. Arquivo da Ordem de Serviço (PDF)
              </span>
              {(osPdfBlob || osPdfUrl) && (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Pronto
                </span>
              )}
            </div>

            {/* Opção A: Upload Manual do Dispositivo */}
            <div>
              <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-xs font-semibold text-slate-300 cursor-pointer active-press">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{osPdfNome ? `PDF: ${osPdfNome}` : 'Anexar PDF da OS do Celular/PC'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleUploadOSPdf}
                  className="hidden"
                />
              </label>
              {osPdfNome && (
                <div className="flex items-center justify-between mt-1 text-[10px] text-emerald-300">
                  <span>Arquivo anexado localmente</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOsPdfBlob('');
                      setOsPdfNome('');
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>

            {/* Opção B: Link do Google Drive / Nuvem */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                <LinkIcon className="w-3 h-3 text-cyan-400" />
                <span>Ou cole o link do Google Drive da OS:</span>
              </div>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                value={osPdfUrl}
                onChange={(e) => setOsPdfUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* SEÇÃO 2: ORÇAMENTO & MEMORIAL DESCRITIVO (PDF / DRIVE) */}
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                2. Orçamento & Memorial Descritivo (PDF)
              </span>
              {(orcamentoPdfBlob || orcamentoPdfUrl) && (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Pronto
                </span>
              )}
            </div>

            {/* Opção A: Upload Manual do Dispositivo */}
            <div>
              <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-xs font-semibold text-slate-300 cursor-pointer active-press">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>{orcamentoPdfNome ? `PDF: ${orcamentoPdfNome}` : 'Anexar PDF do Orçamento'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleUploadOrcamentoPdf}
                  className="hidden"
                />
              </label>
              {orcamentoPdfNome && (
                <div className="flex items-center justify-between mt-1 text-[10px] text-emerald-300">
                  <span>Arquivo anexado localmente</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOrcamentoPdfBlob('');
                      setOrcamentoPdfNome('');
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>

            {/* Opção B: Link do Google Drive / Nuvem */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                <LinkIcon className="w-3 h-3 text-cyan-400" />
                <span>Ou cole o link do Orçamento no Drive:</span>
              </div>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                value={orcamentoPdfUrl}
                onChange={(e) => setOrcamentoPdfUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-800/80 border border-white/10 text-xs font-bold text-slate-300 hover:text-white active-press"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 active-press shadow-[0_0_16px_rgba(6,182,212,0.35)]"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              Salvar Ordem de Serviço
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
