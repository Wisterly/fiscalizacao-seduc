import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, UserCheck, Calendar, Check, Camera, Image } from 'lucide-react';
import { Ambiente, FotoLevantamento, ResponsavelTipo } from '../../types';
import { AIService } from '../../services/aiService';

interface PhotoCatalogModalProps {
  photoUrl: string;
  ambientes: Ambiente[];
  onSave: (foto: FotoLevantamento) => void;
  onCancel: () => void;
}

export const PhotoCatalogModal: React.FC<PhotoCatalogModalProps> = ({
  photoUrl,
  ambientes,
  onSave,
  onCancel
}) => {
  const [selectedAmbienteId, setSelectedAmbienteId] = useState<string>(ambientes[0]?.id || '');
  const [legendaOriginal, setLegendaOriginal] = useState('');
  const [legendaTecnicaIA, setLegendaTecnicaIA] = useState('');
  const [isRefiningIA, setIsRefiningIA] = useState(false);
  const [isUrgente, setIsUrgente] = useState(false);
  const [urgenciaNota, setUrgenciaNota] = useState('');
  const [responsavelUrgencia, setResponsavelUrgencia] = useState<ResponsavelTipo>('Naila');
  const [diasAlerta, setDiasAlerta] = useState<string[]>(['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);

  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

  const toggleDia = (dia: string) => {
    if (diasAlerta.includes(dia)) {
      setDiasAlerta(diasAlerta.filter(d => d !== dia));
    } else {
      setDiasAlerta([...diasAlerta, dia]);
    }
  };

  const handleRefinarTextoIA = () => {
    setIsRefiningIA(true);
    const ambNome = ambientes.find(a => a.id === selectedAmbienteId)?.nome || 'Ambiente Escolar';
    
    setTimeout(() => {
      const refinado = AIService.refinarLegendaTecnica(legendaOriginal, ambNome);
      setLegendaTecnicaIA(refinado);
      setIsRefiningIA(false);
    }, 400);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const amb = ambientes.find(a => a.id === selectedAmbienteId);
    const ambNome = amb ? amb.nome : 'Geral';

    const foto: FotoLevantamento = {
      id: `foto-${Date.now()}`,
      url: photoUrl,
      ambienteId: selectedAmbienteId,
      ambienteNome: ambNome,
      legendaOriginal: legendaOriginal.trim() || 'Registro fotográfico em campo',
      legendaTecnicaIA: legendaTecnicaIA.trim() || legendaOriginal.trim() || `Vistoria técnica em ${ambNome}`,
      isUrgente,
      urgenciaNota: isUrgente ? urgenciaNota.trim() || `Urgência identificada em ${ambNome} - Requer atenção da ${responsavelUrgencia}` : undefined,
      responsavelUrgencia: isUrgente ? responsavelUrgencia : undefined,
      diasAlerta: isUrgente ? diasAlerta : undefined,
      dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    onSave(foto);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0D1424] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header do Modal */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Catalogar Foto & Legenda Técnica</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Formulário com Rolagem */}
        <form onSubmit={handleSalvar} className="p-4 overflow-y-auto space-y-4 no-scrollbar flex-1">
          {/* Prévia da Foto */}
          <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/15 bg-black/50">
            <img src={photoUrl} alt="Foto da vistoria" className="w-full h-full object-cover" />
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] text-white">
              Captura em Campo
            </span>
          </div>

          {/* Seleção do Ambiente */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              1. Selecione o Ambiente da Foto *
            </label>
            <select
              value={selectedAmbienteId}
              onChange={(e) => setSelectedAmbienteId(e.target.value)}
              className="w-full text-xs bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              required
            >
              {ambientes.map((amb) => (
                <option key={amb.id} value={amb.id}>
                  {amb.nome} {amb.isPadrao ? '' : '(Personalizado)'}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Legenda da Foto */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                2. Legenda da Foto (O que você viu?) *
              </label>
              <button
                type="button"
                onClick={handleRefinarTextoIA}
                disabled={isRefiningIA || !legendaOriginal.trim()}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 active-press disabled:opacity-40 transition-all shadow-glass-glow-turq"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {isRefiningIA ? 'Refinando...' : 'Refinar c/ IA'}
              </button>
            </div>

            <textarea
              rows={2}
              placeholder="Ex: Parede da sala 03 com rachadura perto da janela..."
              value={legendaOriginal}
              onChange={(e) => setLegendaOriginal(e.target.value)}
              className="w-full text-xs bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-none"
              required
            />
          </div>

          {/* Resultado do Refinamento de IA */}
          {legendaTecnicaIA && (
            <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 relative">
              <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Legenda Técnica Aprimorada por IA (NBR / SEDUC):</span>
              </div>
              <textarea
                rows={3}
                value={legendaTecnicaIA}
                onChange={(e) => setLegendaTecnicaIA(e.target.value)}
                className="w-full text-xs bg-transparent border-0 text-slate-200 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          {/* Seção: Observação de Atenção / Urgência */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgente}
                onChange={(e) => setIsUrgente(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-0"
              />
              <span className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                Adicionar Observação de Atenção / Urgência
              </span>
            </label>

            {isUrgente && (
              <div className="space-y-3 pt-2 border-t border-white/10 animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Lembrete Urgente (O que deve ser feito?):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Urgente: Falar logo com a Naila sobre risco..."
                    value={urgenciaNota}
                    onChange={(e) => setUrgenciaNota(e.target.value)}
                    className="w-full text-xs bg-slate-900/90 border border-orange-500/30 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-400"
                    required={isUrgente}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Responsável:
                    </label>
                    <select
                      value={responsavelUrgencia}
                      onChange={(e) => setResponsavelUrgencia(e.target.value as ResponsavelTipo)}
                      className="w-full text-xs bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none"
                    >
                      <option value="Naila">Naila (Gerente)</option>
                      <option value="Coordenador">Coordenador de Fiscalização</option>
                      <option value="Arquitetos">Equipe de Arquitetos</option>
                      <option value="Fiscal">Fiscal Responsável</option>
                      <option value="Empresa Construtora">Empresa Contratada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Dias do Alerta:
                    </label>
                    <div className="flex gap-1">
                      {diasSemana.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDia(d)}
                          className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                            diasAlerta.includes(d)
                              ? 'bg-orange-500 text-white border-orange-400'
                              : 'bg-slate-900 text-slate-400 border-white/5'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botão de Salvar */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold text-xs active-press shadow-glass-glow-turq hover:opacity-95 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Salvar e Anexar ao Laudo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
