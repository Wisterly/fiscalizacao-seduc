import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Plus,
  Minus,
  Check,
  Image as ImageIcon,
  AlertTriangle,
  Sparkles,
  Building,
  FileText,
  Trash2,
  HardDrive,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { Escola, Ambiente, FotoLevantamento, Levantamento, ResponsavelTipo } from '../../types';
import { reportDraftService, ReportDraft } from '../../services/reportDraftService';
import { AIService } from '../../services/aiService';
import { cloudSync } from '../../services/cloudSyncService';

interface NewLevantamentoModalProps {
  school: Escola;
  ambientes: Ambiente[];
  levantamentoParaEditar?: Levantamento | null;
  onAddAmbienteGlobal: (nome: string) => void;
  onSalvarLevantamento: (novoLevantamento: Omit<Levantamento, 'id'>, idExistente?: string) => void;
  onClose: () => void;
}

export const NewLevantamentoModal: React.FC<NewLevantamentoModalProps> = ({
  school,
  ambientes,
  levantamentoParaEditar,
  onAddAmbienteGlobal,
  onSalvarLevantamento,
  onClose
}) => {
  const isEditing = Boolean(levantamentoParaEditar);

  // 1. Dados da Visita
  const [dataHoraAtual] = useState(() => {
    if (levantamentoParaEditar?.dataHora) return levantamentoParaEditar.dataHora;
    const now = new Date();
    return `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  });

  const [motivoVisita, setMotivoVisita] = useState(() => levantamentoParaEditar?.motivoVisita || '');
  const [observacoesDiretora, setObservacoesDiretora] = useState(() => levantamentoParaEditar?.observacoesDiretora || '');

  // 2. Quantitativo de Ambientes
  const [quantitativos, setQuantitativos] = useState<Record<string, number>>(() => {
    if (levantamentoParaEditar?.ambientesQuantitativo) {
      return { ...levantamentoParaEditar.ambientesQuantitativo };
    }
    const initial: Record<string, number> = {};
    ambientes.forEach((a) => {
      if (a.nome.includes('Sala de Aula')) initial[a.id] = 8;
      else if (a.nome.includes('Banheiro')) initial[a.id] = 2;
      else initial[a.id] = 1;
    });
    return initial;
  });

  // Modal para criação de novo ambiente global
  const [showNovoAmbienteInput, setShowNovoAmbienteInput] = useState(false);
  const [nomeNovoAmbiente, setNomeNovoAmbiente] = useState('');

  // 3. Fotos Catalogadas (Suporte a Disparo Contínuo & Carrossel Horizontal)
  const [fotos, setFotos] = useState<FotoLevantamento[]>(() => levantamentoParaEditar?.fotos || []);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [processingStatusText, setProcessingStatusText] = useState('');

  // Ref do carrossel para rolar automaticamente ao adicionar nova foto
  const carouselRef = useRef<HTMLDivElement>(null);

  // 4. Gerenciamento de Rascunho Automático (TTL de 24h)
  const [activeDraft, setActiveDraft] = useState<ReportDraft | null>(null);
  const [draftBannerVisible, setDraftBannerVisible] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);

  // Efeito: Carrega rascunho persistido (se não estiver em modo de edição de laudo existente)
  useEffect(() => {
    if (isEditing) return;

    let isMounted = true;
    reportDraftService.getDraft(school.id).then((draft) => {
      if (!isMounted || !draft) return;
      // Se houver fotos ou motivo, mostra opção de restauração
      if (draft.fotos.length > 0 || draft.motivoVisita.trim()) {
        setActiveDraft(draft);
        setDraftBannerVisible(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [school.id, isEditing]);

  // Efeito: Salva rascunho automaticamente a cada alteração (com debounce de 600ms)
  useEffect(() => {
    // Se o relatório tiver algum dado preenchido, salva no IndexedDB
    if (motivoVisita.trim() || observacoesDiretora.trim() || fotos.length > 0) {
      const timer = setTimeout(() => {
        const draft: Omit<ReportDraft, 'updatedAt'> = {
          escolaId: school.id,
          levantamentoId: levantamentoParaEditar?.id,
          dataHora: dataHoraAtual,
          motivoVisita,
          observacoesDiretora,
          ambientesQuantitativo: quantitativos,
          fotos,
          createdAt: activeDraft?.createdAt || Date.now()
        };
        reportDraftService.saveDraft(draft).then(() => {
          setDraftSavedAt(Date.now());
        });
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [school.id, levantamentoParaEditar?.id, dataHoraAtual, motivoVisita, observacoesDiretora, quantitativos, fotos, activeDraft]);

  // Restaurar rascunho recuperado
  const handleRestaurarRascunho = () => {
    if (!activeDraft) return;
    setMotivoVisita(activeDraft.motivoVisita || '');
    setObservacoesDiretora(activeDraft.observacoesDiretora || '');
    if (activeDraft.ambientesQuantitativo && Object.keys(activeDraft.ambientesQuantitativo).length > 0) {
      setQuantitativos(activeDraft.ambientesQuantitativo);
    }
    if (activeDraft.fotos && activeDraft.fotos.length > 0) {
      setFotos(activeDraft.fotos);
      setSelectedPhotoIndex(0);
    }
    setDraftBannerVisible(false);
  };

  // Descartar rascunho
  const handleDescartarRascunho = async () => {
    await reportDraftService.deleteDraft(school.id);
    setActiveDraft(null);
    setDraftBannerVisible(false);
  };

  // Manipulador de quantitativo
  const handleAlterarQtd = (ambId: string, delta: number) => {
    setQuantitativos((prev) => {
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

  // Compressão Otimizada de Imagem: Preserva resolução total de engenharia (Full HD 1920px) sem estourar memória
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          // Limite de 1920px Full HD para nitidez pericial máxima e alta velocidade
          const maxDim = 1920;

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
            // Qualidade 0.88 preserva nitidez cristalina com arquivo leve
            resolve(canvas.toDataURL('image/jpeg', 0.88));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Captura direta com Disparo Contínuo e Seleção Múltipla
  const handleFotosBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    const totalFiles = files.length;
    const novasFotos: FotoLevantamento[] = [];

    const defaultAmbiente = ambientes[0] || { id: 'geral', nome: 'Geral', isPadrao: true };

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      setProcessingStatusText(`Processando foto ${i + 1} de ${totalFiles}...`);
      try {
        const base64 = await compressImage(file);
        novasFotos.push({
          id: `foto-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          url: base64,
          ambienteId: defaultAmbiente.id,
          ambienteNome: defaultAmbiente.nome,
          legendaOriginal: '',
          legendaTecnicaIA: '',
          isUrgente: false,
          dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });
      } catch (err) {
        console.error('Erro ao processar imagem:', err);
      }
    }

    setFotos((prev) => {
      const updated = [...prev, ...novasFotos];
      // Se não havia fotos antes, foca na primeira nova foto; se já havia, foca na recém-adicionada
      setSelectedPhotoIndex(prev.length);
      return updated;
    });

    setIsProcessingPhotos(false);
    setProcessingStatusText('');
    e.target.value = '';

    // Rola o carrossel suavemente para o final
    setTimeout(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollTo({
          left: carouselRef.current.scrollWidth,
          behavior: 'smooth'
        });
      }
    }, 150);
  };

  // Simulação rápida para desktop
  const handleCapturarFotoSimulada = () => {
    const fotosExemploSimulacao = [
      'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1584697964190-705b893a7d2b?auto=format&fit=crop&w=1200&q=85'
    ];
    const url = fotosExemploSimulacao[Math.floor(Math.random() * fotosExemploSimulacao.length)];
    const defaultAmbiente = ambientes[0] || { id: 'geral', nome: 'Geral', isPadrao: true };

    const novaFoto: FotoLevantamento = {
      id: `foto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url,
      ambienteId: defaultAmbiente.id,
      ambienteNome: defaultAmbiente.nome,
      legendaOriginal: '',
      legendaTecnicaIA: '',
      isUrgente: false,
      dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setFotos((prev) => {
      const updated = [...prev, novaFoto];
      setSelectedPhotoIndex(updated.length - 1);
      return updated;
    });

    setTimeout(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollTo({
          left: carouselRef.current.scrollWidth,
          behavior: 'smooth'
        });
      }
    }, 150);
  };

  // Remoção de foto específica
  const handleRemoverFoto = (fotoId: string) => {
    setFotos((prev) => {
      const idx = prev.findIndex((f) => f.id === fotoId);
      const updated = prev.filter((f) => f.id !== fotoId);
      if (selectedPhotoIndex >= updated.length) {
        setSelectedPhotoIndex(Math.max(0, updated.length - 1));
      } else if (selectedPhotoIndex > idx) {
        setSelectedPhotoIndex(selectedPhotoIndex - 1);
      }
      return updated;
    });
  };

  // --- Modo de Exclusão por Pressão Longa (Long Press) no Carrossel ---
  const [photoDeleteMode, setPhotoDeleteMode] = useState(false);
  const [selectedPhotosToDelete, setSelectedPhotosToDelete] = useState<Set<string>>(new Set());
  const photoPressTimerRef = useRef<number | null>(null);
  const photoPressStartRef = useRef<{ x: number; y: number } | null>(null);
  const photoLongPressTriggeredRef = useRef(false);

  const clearPhotoPressTimer = () => {
    if (photoPressTimerRef.current) {
      window.clearTimeout(photoPressTimerRef.current);
      photoPressTimerRef.current = null;
    }
    photoPressStartRef.current = null;
  };

  useEffect(() => {
    return () => clearPhotoPressTimer();
  }, []);

  const activatePhotoDeleteMode = (fotoId: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(45);
    }
    setPhotoDeleteMode(true);
    setSelectedPhotosToDelete(new Set([fotoId]));
  };

  const handlePhotoPointerDown = (fotoId: string, e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    photoLongPressTriggeredRef.current = false;
    clearPhotoPressTimer();
    photoPressStartRef.current = { x: e.clientX, y: e.clientY };

    photoPressTimerRef.current = window.setTimeout(() => {
      photoLongPressTriggeredRef.current = true;
      activatePhotoDeleteMode(fotoId);
    }, 450);
  };

  const handlePhotoPointerMove = (e: React.PointerEvent) => {
    if (!photoPressStartRef.current) return;
    const dx = Math.abs(e.clientX - photoPressStartRef.current.x);
    const dy = Math.abs(e.clientY - photoPressStartRef.current.y);
    if (dx > 10 || dy > 10) {
      clearPhotoPressTimer();
    }
  };

  const handlePhotoThumbClick = (fotoId: string, idx: number) => {
    if (photoLongPressTriggeredRef.current) {
      photoLongPressTriggeredRef.current = false;
      return;
    }

    if (photoDeleteMode) {
      setSelectedPhotosToDelete((prev) => {
        const next = new Set(prev);
        if (next.has(fotoId)) {
          next.delete(fotoId);
        } else {
          next.add(fotoId);
        }
        if (next.size === 0) {
          setPhotoDeleteMode(false);
        }
        return next;
      });
    } else {
      setSelectedPhotoIndex(idx);
    }
  };

  const handleConfirmDeleteSelectedPhotos = () => {
    if (selectedPhotosToDelete.size === 0) return;
    setFotos((prev) => {
      const updated = prev.filter((f) => !selectedPhotosToDelete.has(f.id));
      setSelectedPhotoIndex((curr) => Math.max(0, Math.min(curr, updated.length - 1)));
      return updated;
    });
    setSelectedPhotosToDelete(new Set());
    setPhotoDeleteMode(false);
  };

  // Atualização dos dados da foto ativa no painel do carrossel
  const updateActivePhoto = (patch: Partial<FotoLevantamento>) => {
    setFotos((prev) => {
      if (!prev[selectedPhotoIndex]) return prev;
      const updated = [...prev];
      updated[selectedPhotoIndex] = {
        ...updated[selectedPhotoIndex],
        ...patch
      };
      return updated;
    });
  };

  // Refinamento de IA da Legenda Técnica da Foto Ativa
  const [isRefiningIA, setIsRefiningIA] = useState(false);
  const handleRefinarTextoIA = () => {
    const activePhoto = fotos[selectedPhotoIndex];
    if (!activePhoto || !activePhoto.legendaOriginal.trim()) return;

    setIsRefiningIA(true);
    const ambNome = activePhoto.ambienteNome || 'Ambiente Escolar';

    setTimeout(() => {
      const refinado = AIService.refinarLegendaTecnica(activePhoto.legendaOriginal, ambNome);
      updateActivePhoto({ legendaTecnicaIA: refinado });
      setIsRefiningIA(false);
    }, 350);
  };

  // Finalização do Laudo / Levantamento
  const handleFinalizarLevantamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoVisita.trim()) {
      alert('Por favor, informe o motivo da visita.');
      return;
    }

    // Limpa o rascunho persistido após salvar com sucesso
    await reportDraftService.deleteDraft(school.id);

    onSalvarLevantamento(
      {
        escolaId: school.id,
        greId: school.greId,
        dataHora: dataHoraAtual,
        motivoVisita: motivoVisita.trim(),
        observacoesDiretora: observacoesDiretora.trim(),
        ambientesQuantitativo: quantitativos,
        fotos,
        status: 'concluido',
        concluidoPor: levantamentoParaEditar?.concluidoPor || 'Eng. Fiscal SEDUC / GPR'
      },
      levantamentoParaEditar?.id
    );
  };

  const activePhoto = fotos[selectedPhotoIndex] as FotoLevantamento | undefined;
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
    >
      <div className="w-full max-w-xl bg-[#0D1424] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header Superior com Identificação e Status de Rascunho */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/70">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                {isEditing ? 'Edição de Relatório' : 'Vistoria Técnica de Campo'}
              </span>
              {draftSavedAt && !isEditing && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Clock className="w-2.5 h-2.5" />
                  Rascunho salvo (24h)
                </span>
              )}
            </div>
            <h3 className="font-bold text-white text-sm truncate">{school.nome}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white active-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Rascunho Recuperado (quando houver rascunho anterior de até 24h) */}
        {draftBannerVisible && activeDraft && !isEditing && (
          <div className="p-3 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 flex items-center justify-between gap-2.5 animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0">
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-amber-200 truncate">
                  Rascunho recente recuperado ({activeDraft.fotos.length} fotos)
                </p>
                <p className="text-[10px] text-amber-400/80">
                  {reportDraftService.formatDraftRemainingTime(activeDraft.updatedAt)} para expiração
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleRestaurarRascunho}
                className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-[11px] active-press shadow-sm"
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={handleDescartarRascunho}
                className="px-2 py-1 rounded-xl bg-slate-800 border border-white/10 text-slate-400 hover:text-white text-[10px] active-press"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* Formulário com Rolagem Fluida */}
        <form onSubmit={handleFinalizarLevantamento} className="p-3.5 sm:p-5 overflow-y-auto space-y-4 no-scrollbar flex-1">
          {/* 1. DADOS DA VISTORIA */}
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
                className="w-full text-xs bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Observações Gerais / Solicitações da Diretora
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

          {/* 2. AMBIENTES DA UNIDADE (QUANTITATIVO) */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  2. Ambientes da Unidade
                </h4>
                <p className="text-[10px] text-slate-400">Quantitativo cadastrado na escola</p>
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
                  Novo ambiente entrará automaticamente na lista global:
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar pr-0.5">
              {ambientes.map((amb) => {
                const qtd = quantitativos[amb.id] || 0;
                return (
                  <div
                    key={amb.id}
                    className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-slate-200 truncate pr-2">{amb.nome}</span>
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

          {/* 3. LEVANTAMENTO FOTOGRÁFICO: DISPARO CONTÍNUO & CARROSSEL HORIZONTAL */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  3. Fotos da Vistoria ({fotos.length} registros)
                </h4>
                <p className="text-[10px] text-slate-400">Disparo contínuo & seleção por carrossel</p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {/* Botão Galeria com Seleção Múltipla */}
                <label
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white cursor-pointer active-press text-[11px] font-semibold"
                  title="Selecionar fotos da galeria"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Galeria</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFotosBatchUpload}
                  />
                </label>

                {/* Botão de Disparo Nativo do Celular */}
                <label
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-extrabold text-xs active-press shadow-glass-glow-turq cursor-pointer"
                  title="Abrir Câmera para Disparo"
                >
                  <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tirar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFotosBatchUpload}
                  />
                </label>

                {/* Simulação Desktop */}
                <button
                  type="button"
                  onClick={handleCapturarFotoSimulada}
                  className="px-2 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 text-[10px] active-press"
                  title="Foto simulada de exemplo"
                >
                  Exemplo
                </button>
              </div>
            </div>

            {/* Feedback de processamento de fotos */}
            {isProcessingPhotos && (
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2 text-xs text-cyan-300 animate-pulse">
                <span className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span>{processingStatusText}</span>
              </div>
            )}

            {/* ============================================================== */}
            {/* CARROSSEL HORIZONTAL SELETOR DE FOTOS                          */}
            {/* ============================================================== */}
            {fotos.length > 0 ? (
              <div className="space-y-3">
                {/* Barra Contextual de Modo de Exclusão (ativada por Long Press) */}
                {photoDeleteMode ? (
                  <div className="p-2.5 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-between gap-2 animate-fadeIn">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoDeleteMode(false);
                          setSelectedPhotosToDelete(new Set());
                        }}
                        className="p-1 rounded-lg bg-white/10 text-slate-300 hover:text-white active-press"
                        title="Cancelar modo de exclusão"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-extrabold text-red-200 truncate">
                        {selectedPhotosToDelete.size} {selectedPhotosToDelete.size === 1 ? 'foto selecionada' : 'fotos selecionadas'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedPhotosToDelete.size === fotos.length) {
                            setPhotoDeleteMode(false);
                            setSelectedPhotosToDelete(new Set());
                          } else {
                            setSelectedPhotosToDelete(new Set(fotos.map((f) => f.id)));
                          }
                        }}
                        className="px-2 py-1 rounded-xl bg-white/10 border border-white/10 text-[10px] font-bold text-slate-200 active-press"
                      >
                        {selectedPhotosToDelete.size === fotos.length ? 'Desmarcar' : 'Todas'}
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDeleteSelectedPhotos}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500 text-white font-extrabold text-[11px] active-press shadow-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir ({selectedPhotosToDelete.size})</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] text-slate-400">
                      Toque na foto para editar • <strong className="text-slate-300">Segure na foto para excluir</strong>
                    </span>
                  </div>
                )}

                <div
                  ref={carouselRef}
                  className="flex gap-2.5 overflow-x-auto no-scrollbar py-1.5 px-0.5 snap-x scroll-smooth"
                >
                  {fotos.map((f, idx) => {
                    const isSelected = idx === selectedPhotoIndex;
                    const isMarkedForDelete = selectedPhotosToDelete.has(f.id);
                    const temLegenda = Boolean(f.legendaOriginal.trim() || f.legendaTecnicaIA.trim());

                    return (
                      <div
                        key={f.id}
                        onPointerDown={(e) => handlePhotoPointerDown(f.id, e)}
                        onPointerUp={clearPhotoPressTimer}
                        onPointerCancel={clearPhotoPressTimer}
                        onPointerMove={handlePhotoPointerMove}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          activatePhotoDeleteMode(f.id);
                        }}
                        onClick={() => handlePhotoThumbClick(f.id, idx)}
                        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer snap-start transition-all duration-200 active-press select-none border ${
                          photoDeleteMode
                            ? isMarkedForDelete
                              ? 'ring-2 ring-red-500 border-red-400 shadow-[0_0_14px_rgba(239,68,68,0.6)] scale-105 z-10'
                              : 'border-white/15 opacity-55'
                            : isSelected
                            ? 'ring-2 ring-cyan-400 border-transparent shadow-[0_0_14px_rgba(6,182,212,0.5)] scale-105 z-10'
                            : 'border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={f.url}
                          alt={`Foto ${idx + 1}`}
                          draggable={false}
                          className="w-full h-full object-cover pointer-events-none select-none"
                        />

                        {/* Badge de Número da Foto */}
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[9px] font-extrabold text-white border border-white/20 pointer-events-none">
                          #{idx + 1}
                        </span>

                        {/* Indicador de Status ou Seleção para Exclusão */}
                        <div className="absolute top-1 right-1 pointer-events-none">
                          {photoDeleteMode ? (
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center border shadow ${
                                isMarkedForDelete
                                  ? 'bg-red-500 border-red-300 text-white'
                                  : 'bg-black/70 border-white/40 text-transparent'
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </span>
                          ) : temLegenda ? (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-amber-400 block shadow animate-pulse" />
                          )}
                        </div>

                        {/* Nome do Ambiente no Rodapé do Card */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1 pt-2 pointer-events-none">
                          <p className="text-[8.5px] font-semibold text-slate-200 truncate text-center leading-tight">
                            {photoDeleteMode
                              ? isMarkedForDelete
                                ? 'Marcada'
                                : 'Toque p/ marcar'
                              : f.ambienteNome || 'Sem ambiente'}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Card Fixo no Fim do Carrossel para Adicionar Mais Fotos Rapidamente */}
                  <label
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/60 bg-cyan-950/20 hover:bg-cyan-950/40 flex flex-col items-center justify-center gap-1 flex-shrink-0 cursor-pointer active-press text-cyan-300 transition-colors snap-start"
                    title="Tirar ou anexar mais fotos"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[9px] font-extrabold">+ Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFotosBatchUpload}
                    />
                  </label>
                </div>

                {/* ============================================================== */}
                {/* PAINEL DE EDIÇÃO DA FOTO SELECIONADA                           */}
                {/* ============================================================== */}
                {activePhoto && (
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3 relative shadow-inner">
                    {/* Barra de Navegação Rápida entre Fotos */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                          Foto #{selectedPhotoIndex + 1} de {fotos.length}
                        </span>
                        <span className="text-[11px] text-slate-300 font-semibold truncate max-w-[140px]">
                          {activePhoto.ambienteNome}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={selectedPhotoIndex === 0}
                          onClick={() => setSelectedPhotoIndex(selectedPhotoIndex - 1)}
                          className="p-1 rounded-lg bg-slate-800 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 active-press"
                          title="Foto anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={selectedPhotoIndex === fotos.length - 1}
                          onClick={() => setSelectedPhotoIndex(selectedPhotoIndex + 1)}
                          className="p-1 rounded-lg bg-slate-800 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 active-press"
                          title="Próxima foto"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Imagem Ampliada com Detalhes */}
                    <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-black/60 border border-white/10">
                      <img
                        src={activePhoto.url}
                        alt={activePhoto.ambienteNome}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/15">
                          {activePhoto.ambienteNome}
                        </span>
                        {activePhoto.isUrgente && (
                          <span className="px-2 py-0.5 rounded-lg bg-orange-500 text-white text-[10px] font-bold border border-orange-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Urgente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 1. Escolha do Ambiente da Foto Selecionada */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-300">
                          Ambiente Desta Foto *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowNovoAmbienteInput(true)}
                          className="text-[10px] text-amber-300 font-semibold hover:underline"
                        >
                          + Novo Ambiente
                        </button>
                      </div>
                      <select
                        value={activePhoto.ambienteId}
                        onChange={(e) => {
                          const id = e.target.value;
                          const amb = ambientes.find((a) => a.id === id);
                          updateActivePhoto({
                            ambienteId: id,
                            ambienteNome: amb ? amb.nome : 'Ambiente'
                          });
                        }}
                        className="w-full text-xs bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                      >
                        {ambientes.map((amb) => (
                          <option key={amb.id} value={amb.id}>
                            {amb.nome} {amb.isPadrao ? '' : '(Personalizado)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Legenda Técnica da Foto */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-300">
                          Legenda / O que foi observado? *
                        </label>
                        <button
                          type="button"
                          onClick={handleRefinarTextoIA}
                          disabled={isRefiningIA || !activePhoto.legendaOriginal.trim()}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300 hover:text-cyan-200 px-2 py-0.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 active-press disabled:opacity-40 shadow-glass-glow-turq"
                        >
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          {isRefiningIA ? 'Refinando...' : 'Refinar c/ IA'}
                        </button>
                      </div>

                      {/* Patologias Rápidas SEDUC (1 Toque) */}
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-1.5">
                        {[
                          { tag: 'Fissura / Trinca a 45º', urgente: true, resp: 'Naila' as ResponsavelTipo },
                          { tag: 'Infiltração / Goteiras', urgente: true, resp: 'Coordenador' as ResponsavelTipo },
                          { tag: 'Fiação Exposta / Quadro', urgente: true, resp: 'Naila' as ResponsavelTipo },
                          { tag: 'Piso Desplacado / Quebrado', urgente: false, resp: 'Coordenador' as ResponsavelTipo },
                          { tag: 'Vazamento Sanitário / Vaso', urgente: false, resp: 'Coordenador' as ResponsavelTipo },
                          { tag: 'Desagregação de Pintura', urgente: false, resp: 'Coordenador' as ResponsavelTipo }
                        ].map((p) => (
                          <button
                            key={p.tag}
                            type="button"
                            onClick={() => {
                              const textoAtual = activePhoto.legendaOriginal.trim();
                              const novoTexto = textoAtual ? `${textoAtual} • ${p.tag}` : p.tag;
                              const patch: Partial<FotoLevantamento> = { legendaOriginal: novoTexto };
                              if (p.urgente) {
                                patch.isUrgente = true;
                                patch.responsavelUrgencia = p.resp;
                                patch.urgenciaNota = `Atenção imediata: ${p.tag} identificada`;
                              }
                              updateActivePhoto(patch);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-[10px] text-slate-300 hover:text-cyan-300 whitespace-nowrap active-press transition-colors"
                          >
                            + {p.tag}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Ex: Fissura diagonal na alvenaria próxima à viga..."
                        value={activePhoto.legendaOriginal}
                        onChange={(e) => updateActivePhoto({ legendaOriginal: e.target.value })}
                        className="w-full text-xs bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-none"
                      />
                    </div>

                    {/* Parecer de IA Refinado */}
                    {activePhoto.legendaTecnicaIA && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                        <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Legenda Pericial Aprimorada por IA:
                        </span>
                        <textarea
                          rows={2}
                          value={activePhoto.legendaTecnicaIA}
                          onChange={(e) => updateActivePhoto({ legendaTecnicaIA: e.target.value })}
                          className="w-full text-xs bg-transparent border-0 text-slate-200 focus:outline-none resize-none leading-relaxed"
                        />
                      </div>
                    )}

                    {/* Alerta de Urgência da Foto Selecionada */}
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-white/10 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activePhoto.isUrgente}
                          onChange={(e) => updateActivePhoto({ isUrgente: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-0"
                        />
                        <span className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                          Marcar como Foto de Atenção / Urgência
                        </span>
                      </label>

                      {activePhoto.isUrgente && (
                        <div className="space-y-2 pt-1 border-t border-white/10 animate-fadeIn">
                          <input
                            type="text"
                            placeholder="Ex: Comunicar urgente a Naila sobre risco..."
                            value={activePhoto.urgenciaNota || ''}
                            onChange={(e) => updateActivePhoto({ urgenciaNota: e.target.value })}
                            className="w-full text-xs bg-slate-900/90 border border-orange-500/30 rounded-xl px-3 py-1.5 text-white placeholder-slate-400 focus:outline-none"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-300 mb-0.5">Responsável:</label>
                              <select
                                value={activePhoto.responsavelUrgencia || 'Naila'}
                                onChange={(e) =>
                                  updateActivePhoto({ responsavelUrgencia: e.target.value as ResponsavelTipo })
                                }
                                className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2 py-1.5 text-white focus:outline-none"
                              >
                                <option value="Naila">Naila (Gerente)</option>
                                <option value="Coordenador">Coordenador de Fiscalização</option>
                                <option value="Arquitetos">Equipe de Arquitetos</option>
                                <option value="Fiscal">Fiscal Responsável</option>
                                <option value="Empresa Construtora">Empresa Contratada</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-300 mb-0.5">Dias de Alerta:</label>
                              <div className="flex gap-1">
                                {diasSemana.map((d) => {
                                  const dias = activePhoto.diasAlerta || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
                                  const isAtivo = dias.includes(d);
                                  return (
                                    <button
                                      key={d}
                                      type="button"
                                      onClick={() => {
                                        const novo = isAtivo ? dias.filter((x) => x !== d) : [...dias, d];
                                        updateActivePhoto({ diasAlerta: novo });
                                      }}
                                      className={`flex-1 py-1 rounded text-[9px] font-bold transition-colors ${
                                        isAtivo
                                          ? 'bg-orange-500 text-slate-950'
                                          : 'bg-slate-800 text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {d}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-white/15 text-center space-y-2">
                <Camera className="w-8 h-8 text-cyan-400/60 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">Nenhuma foto adicionada ainda</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Toque em "Tirar Foto" para abrir a câmera contínua do celular ou escolha várias imagens da galeria. Elas
                  aparecerão no carrossel horizontal para você catalogar sem perder nada.
                </p>
              </div>
            )}

            {/* Google Drive Status */}
            <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-center justify-between text-[11px] text-blue-200">
              <span className="flex items-center gap-1.5 truncate">
                <HardDrive className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">
                  Google Drive SEDUC: {school.greId}ª GRE / {school.nome}
                </span>
              </span>
              <span className="text-[10px] font-bold text-cyan-300 shrink-0">Proteção Ativa</span>
            </div>
          </div>

          {/* Botão de Finalização / Salvar Alterações */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm active-press shadow-glass-glow-turq hover:opacity-95 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>
                {isEditing ? 'Salvar Alterações no Relatório' : 'Concluir & Gerar Relatório Visual'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
