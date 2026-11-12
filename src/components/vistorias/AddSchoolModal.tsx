import React, { useState } from 'react';
import { X, Plus, School, MapPin, Hash } from 'lucide-react';
import { Escola, GRE } from '../../types';

interface AddSchoolModalProps {
  gre: GRE;
  onSave: (newSchool: Omit<Escola, 'id'>) => void;
  onClose: () => void;
}

export const AddSchoolModal: React.FC<AddSchoolModalProps> = ({
  gre,
  onSave,
  onClose
}) => {
  const [inep, setInep] = useState('');
  const [nome, setNome] = useState('');
  const [municipio, setMunicipio] = useState(gre.municipios[0]?.toUpperCase() || gre.sede.toUpperCase());
  const [endereco, setEndereco] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nomeLimpo = nome.trim();
    const munLimpo = municipio.trim();
    if (!nomeLimpo || !munLimpo) return;

    onSave({
      inep: inep.trim() || 'S/ INEP',
      greId: gre.id,
      nome: nomeLimpo.toUpperCase(),
      municipio: munLimpo.toUpperCase(),
      endereco: endereco.trim() || munLimpo.toUpperCase(),
      situacaoImovel: 'EM USO',
      isManual: true,
      statusConservacao: 'regular',
      dataUltimaVistoria: 'Sem vistoria',
      diasSemVisita: 0,
      demandasUrgentesCount: 0,
      temOsAtiva: false
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
    >
      <div className="w-full max-w-md bg-[#0D1424] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                Cadastro Manual em Campo
              </span>
              <h3 className="font-bold text-white text-sm truncate">
                {gre.nome}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 active-press"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto no-scrollbar">
          {/* 1. Número do INEP */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              Código INEP (Opcional)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex: 22129723 (ou deixe em branco)"
              value={inep}
              onChange={(e) => setInep(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* 2. Nome da Escola / Entidade */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-cyan-400" />
              Nome da Escola *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: CETI / U. E. Nome da Escola"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 3. Município */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Município *
            </label>
            <input
              type="text"
              required
              list="municipios-gre-list"
              placeholder="Digite ou selecione o município"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <datalist id="municipios-gre-list">
              {gre.municipios.map((m) => (
                <option key={m} value={m.toUpperCase()} />
              ))}
            </datalist>
          </div>

          {/* 4. Endereço (Opcional) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Endereço / Localização (Opcional)
            </label>
            <input
              type="text"
              placeholder="Rua, bairro ou zona rural"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Botões */}
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
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 active-press shadow-glass-glow-turq"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Salvar Escola
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
