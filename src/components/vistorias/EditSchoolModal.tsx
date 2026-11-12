import React, { useState } from 'react';
import { X, Settings, User, Phone, MapPin, Navigation, FileText, Save, Loader2 } from 'lucide-react';
import { Escola, ConservacaoStatus } from '../../types';

interface EditSchoolModalProps {
  school: Escola;
  onSave: (updatedSchool: Escola) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: Array<{ value: ConservacaoStatus; label: string }> = [
  { value: 'critico', label: 'Crítico' },
  { value: 'atencao', label: 'Atenção' },
  { value: 'regular', label: 'Regular' },
  { value: 'bom', label: 'Bom' }
];

export const EditSchoolModal: React.FC<EditSchoolModalProps> = ({
  school,
  onSave,
  onClose
}) => {
  const [diretora, setDiretora] = useState(school.diretora || '');
  const [telefone, setTelefone] = useState(school.telefone || '');
  const [endereco, setEndereco] = useState(school.endereco || '');
  const [coordenadas, setCoordenadas] = useState(school.coordenadas || '');
  const [observacoesGerais, setObservacoesGerais] = useState(school.observacoesGerais || '');
  const [statusConservacao, setStatusConservacao] = useState<ConservacaoStatus>(school.statusConservacao);
  const [capturingGps, setCapturingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS não suportado neste dispositivo.');
      return;
    }
    setCapturingGps(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setCoordenadas(`${lat}, ${lng}`);
        setCapturingGps(false);
      },
      () => {
        setGpsError('Não foi possível obter o GPS agora. Verifique a permissão de localização.');
        setCapturingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...school,
      diretora: diretora.trim() || undefined,
      telefone: telefone.trim() || undefined,
      endereco: endereco.trim() || school.municipio,
      coordenadas: coordenadas.trim() || undefined,
      observacoesGerais: observacoesGerais.trim() || undefined,
      statusConservacao
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
    >
      <div className="w-full max-w-md bg-[#0D1424] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/75">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Configurações da Escola {school.inep ? `• INEP ${school.inep}` : ''}
              </span>
              <h3 className="font-bold text-white text-sm truncate">
                {school.nome}
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
          {/* 1. Nome da Diretora */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Nome da Diretora / Gestor(a)
            </label>
            <input
              type="text"
              placeholder="Digite o nome da diretora ou responsável"
              value={diretora}
              onChange={(e) => setDiretora(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 2. Telefone / Contato */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              Número do Contato / WhatsApp
            </label>
            <input
              type="tel"
              inputMode="tel"
              placeholder="Ex: (89) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 3. Endereço */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Endereço Completo
            </label>
            <input
              type="text"
              placeholder="Rua, bairro, comunidade ou CEP"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 4. Localização / Coordenadas GPS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                Coordenadas / Localização
              </label>
              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={capturingGps}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 rounded-lg active-press disabled:opacity-60"
              >
                {capturingGps ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                <span>{capturingGps ? 'Obtendo GPS...' : 'Usar meu GPS atual'}</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="Latitude, Longitude ou Plus Code (ex: -7.0123, -42.1234)"
              value={coordenadas}
              onChange={(e) => setCoordenadas(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
            {gpsError && (
              <p className="text-[10px] text-orange-400 mt-1">{gpsError}</p>
            )}
          </div>

          {/* 5. Estado de Conservação */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Estado de Conservação da Unidade
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusConservacao(opt.value)}
                  className={`py-2 rounded-xl text-[11px] font-bold border transition-all active-press ${
                    statusConservacao === opt.value
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Outras Informações */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Outras Informações / Notas
            </label>
            <textarea
              rows={3}
              placeholder="Anote contatos extras, acessos, horário de funcionamento ou observações prediais..."
              value={observacoesGerais}
              onChange={(e) => setObservacoesGerais(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
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
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 active-press shadow-[0_0_16px_rgba(245,158,11,0.35)]"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              Salvar Informações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
