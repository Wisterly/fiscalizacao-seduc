import React from 'react';
import { X, FileText, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { OrdemServico } from '../../types';

interface DocumentPreviewModalProps {
  os: OrdemServico;
  tipo: 'orcamento' | 'memorial';
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  os,
  tipo,
  onClose
}) => {
  const isOrcamento = tipo === 'orcamento';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0D1424] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs">
                {isOrcamento ? 'Planilha Orçamentária SINAPI / SEDUC' : 'Memorial Descritivo de Especificações Técnicas'}
              </h3>
              <p className="text-[10px] text-slate-400">{os.numeroOS}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Documento */}
        <div className="p-4 overflow-y-auto space-y-4 no-scrollbar flex-1 text-xs">
          {/* Dados do Cabeçalho do Documento */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>ESTADO DO PIAUÍ - SEDUC</span>
              <span className="text-amber-400 font-semibold">GPR LAB ENGENHARIA</span>
            </div>
            <h4 className="font-bold text-white text-xs leading-snug">{os.escolaNome}</h4>
            <p className="text-slate-300 text-[11px]">{os.municipio} • Empresa: {os.empresaContratada}</p>
            <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[11px]">
              <span className="text-slate-400">Valor Total Contratado:</span>
              <span className="font-extrabold text-amber-300">
                {os.valorOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>

          {/* Conteúdo Especificado */}
          {isOrcamento ? (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Composição Sintética dos Serviços
              </span>

              <div className="space-y-2">
                {[
                  { item: '1.0', desc: 'Serviços Preliminares e Demolições Cautelares', perc: '100%', valor: os.valorOrcamento * 0.08 },
                  { item: '2.0', desc: 'Estrutura de Concreto Armado e Reforço de Fundações', perc: '90%', valor: os.valorOrcamento * 0.28 },
                  { item: '3.0', desc: 'Cobertura com Estrutura Metálica e Telhas Termoacústicas', perc: '65%', valor: os.valorOrcamento * 0.24 },
                  { item: '4.0', desc: 'Revestimentos Cerâmicos e Emboço Interno/Externo', perc: '55%', valor: os.valorOrcamento * 0.18 },
                  { item: '5.0', desc: 'Instalações Hidrossanitárias e Acessibilidade NBR 9050', perc: '70%', valor: os.valorOrcamento * 0.12 },
                  { item: '6.0', desc: 'Instalações Elétricas e Subestação Abrigada', perc: '45%', valor: os.valorOrcamento * 0.10 }
                ].map((s) => (
                  <div key={s.item} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{s.item} {s.desc}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Executado: <span className="text-cyan-300 font-semibold">{s.perc}</span></div>
                    </div>
                    <div className="text-right font-semibold text-slate-200">
                      {s.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Caderno de Encargos & Normas Construtivas
              </span>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-slate-300 leading-relaxed">
                <p>
                  <strong>1. Objeto:</strong> {os.objeto}
                </p>
                <p>
                  <strong>2. Normas de Referência:</strong> NBR 9050/2020 (Acessibilidade a edificações escolares), NBR 5410 (Instalações elétricas de baixa tensão) e NBR 6118 (Projeto de estruturas de concreto armado).
                </p>
                <p>
                  <strong>3. Pintura e Revestimento:</strong> Aplicação de tinta acrílica lavável em 2 demãos sobre selador acrílico fosco. Rodapés cerâmicos h=10cm com cantos arredondados.
                </p>
                <p>
                  <strong>4. Fiscalização:</strong> As medições serão aferidas quinzenalmente pela equipe de fiscalização GPR / SEDUC com emissão de Relatório Fotográfico obrigatório.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Download / Fechar */}
        <div className="p-3.5 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Documento Autenticado SEDUC
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs active-press border border-white/10"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
};
