import React from 'react';
import { X, Printer, Share2, Calendar, MapPin, Building, User, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Levantamento, Escola, Ambiente } from '../../types';

interface InspectionReportModalProps {
  levantamento: Levantamento;
  school?: Escola;
  ambientes: Ambiente[];
  onClose: () => void;
}

export const InspectionReportModal: React.FC<InspectionReportModalProps> = ({
  levantamento,
  school,
  ambientes,
  onClose
}) => {
  const getAmbienteNome = (ambId: string) => {
    return ambientes.find(a => a.id === ambId)?.nome || ambId;
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
    >
      <div className="w-full max-w-xl bg-[#0D1424] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Barra Superior de Ações */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
              GPR
            </div>
            <div>
              <h3 className="font-bold text-white text-xs">Relatório Técnico de Levantamento</h3>
              <p className="text-[10px] text-slate-400">SEDUC Piauí • Gerência de Obras</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImprimir}
              className="p-2 rounded-xl bg-slate-800 border border-white/10 text-slate-300 hover:text-white active-press"
              title="Imprimir laudo"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 border border-white/10 text-slate-300 hover:text-white active-press"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Laudo com Rolagem */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 no-scrollbar flex-1 bg-[#090D16]/50">
          {/* Cabeçalho Oficial do Laudo */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-white/10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-500" />
            
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              SECRETARIA DE ESTADO DA EDUCAÇÃO DO PIAUÍ - SEDUC
            </span>
            <h2 className="text-base font-extrabold text-white mt-1">
              LAUDO DE VISTORIA TÉCNICA E LEVANTAMENTO FOTOGRÁFICO
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-1">
              {school?.nome || 'Unidade Escolar'}
            </p>
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 mt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                {levantamento.dataHora}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {school?.municipio || 'Piauí'}
              </span>
              <span>•</span>
              <span className="text-slate-300">Fiscal: {levantamento.concluidoPor}</span>
            </div>
          </div>

          {/* Motivo da Visita */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
              Motivo da Visita
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {levantamento.motivoVisita}
            </p>
          </div>

          {/* Observações da Diretora */}
          {levantamento.observacoesDiretora && (
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Observações Gerais / Solicitações da Diretora
              </span>
              <p className="text-xs text-slate-300 leading-relaxed italic bg-black/20 p-2.5 rounded-xl">
                "{levantamento.observacoesDiretora}"
              </p>
            </div>
          )}

          {/* Quantitativo de Ambientes Vistoriados */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block mb-2">
              Quantitativo de Ambientes da Unidade
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(levantamento.ambientesQuantitativo).map(([ambId, qtd]) => {
                const nome = getAmbienteNome(ambId);
                return (
                  <div key={ambId} className="p-2 rounded-xl bg-slate-800/60 border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate pr-1">{nome}</span>
                    <span className="font-extrabold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      {qtd}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Galeria de Fotos com Pareceres de Engenharia */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Evidências Fotográficas ({levantamento.fotos.length} registros)
              </span>
            </div>

            <div className="space-y-4">
              {levantamento.fotos.map((foto, index) => (
                <div
                  key={foto.id}
                  className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-glass"
                >
                  {/* Foto em Destaque */}
                  <div className="relative w-full h-56 bg-black">
                    <img src={foto.url} alt={foto.ambienteNome} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/15">
                        Registro #{index + 1} • {foto.ambienteNome}
                      </span>
                      {foto.isUrgente && (
                        <span className="px-2 py-0.5 rounded-xl bg-orange-500 text-white text-[10px] font-bold border border-orange-400 shadow-glass-glow-orange flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Urgente ({foto.responsavelUrgencia})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Textos da Foto: Legenda Técnica e Alerta */}
                  <div className="p-3.5 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Parecer Técnico Pericial:
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed mt-0.5 font-normal">
                        {foto.legendaTecnicaIA || foto.legendaOriginal}
                      </p>
                    </div>

                    {foto.isUrgente && foto.urgenciaNota && (
                      <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300">
                        <strong>Lembrete Urgente Programado:</strong> {foto.urgenciaNota}
                        {foto.diasAlerta && (
                          <span className="block text-[10px] text-orange-400/80 mt-0.5">
                            Dias de notificação ativa: {foto.diasAlerta.join(', ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-3.5 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Laudo Registrado no Sistema GPR
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs active-press shadow-glass-glow-turq"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};
