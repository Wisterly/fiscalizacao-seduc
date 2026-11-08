import React, { useState } from 'react';
import { X, Camera, Plus, Minus, Check, Image, AlertTriangle, Sparkles, Building, FileText, Trash2 } from 'lucide-react';
import { Escola, Ambiente, FotoLevantamento, Levantamento } from '../../types';
import { PhotoCatalogModal } from './PhotoCatalogModal';

interface NewLevantamentoModalProps {
  school: Escola;
  ambientes: Ambiente[];
  onAddAmbienteGlobal: (nome: string) => void;
  onSalvarLevantamento: (novoLevantamento: Omit<Levantamento, 'id'>) => void;
  onClose: () => void;
}

export const NewLevantamentoModal: React.FC<NewLevantamentoModalProps> = ({
  school,
  ambientes,
  onAddAmbienteGlobal,
  onSalvarLevantamento,
  onClose
}) => {
  // 1. Dados da Visita
  const [dataHoraAtual] = useState(() => {
    const now = new Date();
    return `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  });
  const [motivoVisita, setMotivoVisita] = useState('');
  const [observacoesDiretora, setObservacoesDiretora] = useState('');

  // 2. Quantitativo de Ambientes
  const [quantitativos, setQuantitativos] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    ambientes.forEach(a => {
      // Valores padrão razoáveis para salas e banheiros
      if (a.nome.includes('Sala de Aula')) initial[a.id] = 8;
      else if (a.nome.includes('Banheiro')) initial[a.id] = 2;
      else initial[a.id] = 1;
    });
    return initial;
  });

  // Modal para criação de novo ambiente global
  const [showNovoAmbienteInput, setShowNovoAmbienteInput] = useState(false);
  const [nomeNovoAmbiente, setNomeNovoAmbiente] = useState('');

  // 3. Fotos Catalogadas
  const [fotos, setFotos] = useState<FotoLevantamento[]>([]);
  const [currentPhotoToCatalog, setCurrentPhotoToCatalog] = useState<string | null>(null);

  // Manipulador de quantitativo
  const handleAlterarQtd = (ambId: string, delta: number) => {
    setQuantitativos(prev => {
      const atual = prev[ambId] || 0;
      const novo = Math.max(0, atual + delta);
      return { ...prev, [ambId]: novo };
    });
  };

  // Criação de novo ambiente global
  const handleCriarAmbiente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeNovoAmbiente.trim()) return;
    onAddAmbienteGlobal(nomeNovoAmbiente.trim());
    setNomeNovoAmbiente('');
    setShowNovoAmbienteInput(false);
  };

  // Fotos pré-definidas para simulação de câmera realista em campo
  const fotosExemploSimulacao = [
    'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584697964190-705b893a7d2b?auto=format&fit=crop&w=800&q=80',
  ];

  // Função utilitária para compressão de imagem no client-side (evita estouro de memória no celular)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1280;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Captura direta com a Câmera Nativa do Android (ou upload de arquivo)
  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setCurrentPhotoToCatalog(compressedBase64);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setCurrentPhotoToCatalog(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    }
  };

  const handleCapturarFotoSimulada = () => {
    const url = fotosExemploSimulacao[Math.floor(Math.random() * fotosExemploSimulacao.length)];
    setCurrentPhotoToCatalog(url);
  };

  const handleSaveFotoCatalogada = (foto: FotoLevantamento) => {
    setFotos(prev => [...prev, foto]);
    setCurrentPhotoToCatalog(null);
  };

  const handleRemoverFoto = (fotoId: string) => {
    setFotos(prev => prev.filter(f => f.id !== fotoId));
  };

  // Salvar Levantamento Final
  const handleFinalizarLevantamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoVisita.trim()) {
      alert('Por favor, informe o motivo da visita.');
      return;
    }

    onSalvarLevantamento({
      escolaId: school.id,
      greId: school.greId,
      dataHora: dataHoraAtual,
      motivoVisita: motivoVisita.trim(),
      observacoesDiretora: observacoesDiretora.trim(),
      ambientesQuantitativo: quantitativos,
      fotos,
      status: 'concluido',
      concluidoPor: 'Eng. Fiscal SEDUC / GPR'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0D1424] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Superior */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Novo Levantamento Técnico
            </span>
            <h3 className="font-bold text-white text-sm truncate max-w-[280px]">
              {school.nome}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário Principal com Rolagem */}
        <form onSubmit={handleFinalizarLevantamento} className="p-4 overflow-y-auto space-y-5 no-scrollbar flex-1">
          {/* 1. DADOS DA VISITA */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                1. Dados da Vistoria
              </h4>
              <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                {dataHoraAtual}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Motivo da Visita *
              </label>
              <input
                type="text"
                placeholder="Ex: Vistoria estrutural e medição da 4ª etapa da OS"
                value={motivoVisita}
                onChange={(e) => setMotivoVisita(e.target.value)}
                className="w-full text-xs bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Observações Gerais / Pedidos da Diretora
              </label>
              <textarea
                rows={2}
                placeholder="Informações cruciais transmitidas pela diretoria que não podem ser esquecidas..."
                value={observacoesDiretora}
                onChange={(e) => setObservacoesDiretora(e.target.value)}
                className="w-full text-xs bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>
          </div>

          {/* 2. SISTEMA FLEXÍVEL DE AMBIENTES */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  2. Ambientes da Escola (Quantitativo)
                </h4>
                <p className="text-[10px] text-slate-400">Padrão + Novos ambientes criados globalmente</p>
              </div>

              <button
                type="button"
                onClick={() => setShowNovoAmbienteInput(!showNovoAmbienteInput)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 px-2 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 active-press"
              >
                <Plus className="w-3 h-3" />
                Criar Novo
              </button>
            </div>

            {/* Criação de Novo Ambiente Global */}
            {showNovoAmbienteInput && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 animate-fadeIn">
                <span className="text-[10px] text-amber-300 font-semibold">
                  Novo ambiente entrará automaticamente na lista global de todas as escolas:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome do novo ambiente (ex: Sala Maker)"
                    value={nomeNovoAmbiente}
                    onChange={(e) => setNomeNovoAmbiente(e.target.value)}
                    className="flex-1 text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleCriarAmbiente}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs active-press"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}

            {/* Grade de Contadores de Ambientes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
              {ambientes.map((amb) => {
                const qtd = quantitativos[amb.id] || 0;

                return (
                  <div
                    key={amb.id}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-slate-200 truncate pr-2">
                      {amb.nome}
                    </span>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAlterarQtd(amb.id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 active-press hover:bg-slate-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-white w-5 text-center">{qtd}</span>
                      <button
                        type="button"
                        onClick={() => handleAlterarQtd(amb.id, 1)}
                        className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 active-press hover:bg-cyan-500/30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. CÂMERA COM LEGENDA + ALERTA + APOIO DE IA */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  3. Levantamento Fotográfico ({fotos.length} fotos)
                </h4>
                <p className="text-[10px] text-slate-400">Legenda por ambiente + IA + alertas imediatos</p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {/* Botão de Galeria de Fotos */}
                <label
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white cursor-pointer active-press text-[11px] font-semibold"
                  title="Selecionar foto existente da galeria"
                >
                  <Image className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Galeria</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFotoUpload}
                  />
                </label>

                {/* Botão Principal: Abertura Direta da Câmera Nativa do Celular */}
                <label
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-extrabold text-xs active-press shadow-glass-glow-turq cursor-pointer"
                  title="Abrir Câmera do Smartphone"
                >
                  <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tirar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFotoUpload}
                  />
                </label>

                {/* Simulação rápida para desktop sem webcam */}
                <button
                  type="button"
                  onClick={handleCapturarFotoSimulada}
                  className="px-2 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 text-[10px] active-press"
                  title="Simular foto de exemplo para testes"
                >
                  Exemplo
                </button>
              </div>
            </div>

            {/* Lista das fotos catalogadas */}
            {fotos.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-white/15 text-center text-xs text-slate-400">
                Nenhuma foto anexada ainda. Clique em "Tirar Foto" ou selecione da galeria para catalogar o laudo com apoio de IA.
              </div>
            ) : (
              <div className="space-y-2">
                {fotos.map((f) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-start gap-3 relative"
                  >
                    <img src={f.url} alt={f.ambienteNome} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-white/10" />
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[11px] font-bold text-cyan-400">
                          {f.ambienteNome}
                        </span>
                        {f.isUrgente && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            Urgente • {f.responsavelUrgencia}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed">
                        {f.legendaTecnicaIA || f.legendaOriginal}
                      </p>

                      {f.urgenciaNota && (
                        <p className="text-[10px] text-orange-300 font-medium mt-1 truncate">
                          ⚠️ {f.urgenciaNota}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoverFoto(f.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-lg"
                      title="Excluir foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão de Finalização */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm active-press shadow-glass-glow-turq hover:opacity-95 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              Concluir & Gerar Relatório Visual
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Catalogação de Foto Individual */}
      {currentPhotoToCatalog && (
        <PhotoCatalogModal
          photoUrl={currentPhotoToCatalog}
          ambientes={ambientes}
          onSave={handleSaveFotoCatalogada}
          onCancel={() => setCurrentPhotoToCatalog(null)}
        />
      )}
    </div>
  );
};
