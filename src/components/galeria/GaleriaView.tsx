import React, { useState } from 'react';
import { Image as GalleryIcon, Filter, AlertTriangle, Sparkles, X, MapPin, Calendar, Search } from 'lucide-react';
import { FotoLevantamento, Ambiente } from '../../types';

interface GaleriaViewProps {
  fotos: (FotoLevantamento & { escolaNome: string; levantamentoId: string })[];
  ambientes: Ambiente[];
}

export const GaleriaView: React.FC<GaleriaViewProps> = ({ fotos, ambientes }) => {
  const [selectedAmbiente, setSelectedAmbiente] = useState<string>('todos');
  const [apenasUrgentes, setApenasUrgentes] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFotoModal, setSelectedFotoModal] = useState<(FotoLevantamento & { escolaNome: string }) | null>(null);

  const filteredFotos = fotos.filter(f => {
    const matchesAmb = selectedAmbiente === 'todos' || f.ambienteId === selectedAmbiente || f.ambienteNome === selectedAmbiente;
    const matchesUrg = !apenasUrgentes || f.isUrgente;
    const matchesSearch =
      f.escolaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.legendaOriginal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.legendaTecnicaIA.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.ambienteNome.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesAmb && matchesUrg && matchesSearch;
  });

  return (
    <div className="w-full pb-20">
      {/* Topo do Módulo */}
      <div className="px-4 pt-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glass-glow-turq">
            <GalleryIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight leading-none">
              Galeria de Evidências Fotográficas
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {fotos.length} fotos catalogadas em campo com apoio de IA
            </p>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="px-4 space-y-2 mb-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por escola, ambiente ou parecer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedAmbiente}
            onChange={(e) => setSelectedAmbiente(e.target.value)}
            className="flex-1 text-xs bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
          >
            <option value="todos">Todos os Ambientes</option>
            {ambientes.map((a) => (
              <option key={a.id} value={a.nome}>
                {a.nome}
              </option>
            ))}
          </select>

          <button
            onClick={() => setApenasUrgentes(!apenasUrgentes)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 active-press transition-all ${
              apenasUrgentes
                ? 'bg-orange-500 text-slate-950 shadow-glass-glow-orange'
                : 'bg-slate-900/80 text-slate-400 border border-white/10'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Urgentes
          </button>
        </div>
      </div>

      {/* Grid de Fotos */}
      <div className="px-4">
        {filteredFotos.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 text-center text-xs text-slate-400">
            Nenhuma foto encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredFotos.map((foto) => (
              <div
                key={foto.id}
                onClick={() => setSelectedFotoModal(foto)}
                className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 cursor-pointer active-press shadow-glass group"
              >
                <div className="w-full h-36 bg-black">
                  <img src={foto.url} alt={foto.ambienteNome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>

                {/* Badges Superiores */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-white border border-white/15">
                    {foto.ambienteNome}
                  </span>

                  {foto.isUrgente && (
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-glass-glow-orange border border-orange-400">
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Rodapé do Card */}
                <div className="p-2.5 bg-slate-900/90 backdrop-blur-md border-t border-white/5">
                  <h4 className="text-[11px] font-bold text-white truncate">
                    {foto.escolaNome}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {foto.legendaTecnicaIA || foto.legendaOriginal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Foto em Tela Cheia */}
      {selectedFotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0D1424] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-3 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
              <span className="text-xs font-bold text-white">{selectedFotoModal.escolaNome}</span>
              <button
                onClick={() => setSelectedFotoModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar flex-1 p-3 space-y-3">
              <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/10 bg-black">
                <img src={selectedFotoModal.url} alt={selectedFotoModal.ambienteNome} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">{selectedFotoModal.ambienteNome}</span>
                  <span className="text-[10px] text-slate-400">{selectedFotoModal.dataHora}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3" />
                    Parecer Pericial de IA:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedFotoModal.legendaTecnicaIA || selectedFotoModal.legendaOriginal}
                  </p>
                </div>

                {selectedFotoModal.isUrgente && (
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300">
                    <strong>Alerta de Urgência:</strong> {selectedFotoModal.urgenciaNota}
                    <div className="mt-1 text-[10px] text-orange-400/80">
                      Responsável: {selectedFotoModal.responsavelUrgencia}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-white/10 bg-slate-900/60 text-center">
              <button
                onClick={() => setSelectedFotoModal(null)}
                className="w-full py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
