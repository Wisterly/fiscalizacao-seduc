import React, { useState } from 'react';
import {
  FileSearch,
  Plus,
  Trash2,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Bell,
  ArrowLeft,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';
import {
  ProcessoAcompanhamento,
  CategoriaProcessoCard,
  DocumentoProcessoSEI,
  AlertaProcessoConfig
} from '../../types';
import { storage } from '../../services/storageService';

interface ProcessosViewProps {
  onBack?: () => void;
}

export const ProcessosView: React.FC<ProcessosViewProps> = ({ onBack }) => {
  // Dados persistidos
  const [categorias, setCategorias] = useState<CategoriaProcessoCard[]>(() =>
    storage.getCategoriasProcesso()
  );
  const [processos, setProcessos] = useState<ProcessoAcompanhamento[]>(() =>
    storage.getProcessos()
  );

  // Navegação interna
  const [activeCategoriaId, setActiveCategoriaId] = useState<string | null>(null);
  const [selectedProcessoId, setSelectedProcessoId] = useState<string | null>(null);

  // Modais de Criação
  const [showNovaCategoriaModal, setShowNovaCategoriaModal] = useState(false);
  const [showNovoProcessoModal, setShowNovoProcessoModal] = useState(false);
  const [showNovoDocumentoModal, setShowNovoDocumentoModal] = useState(false);
  const [showImportarSeiModal, setShowImportarSeiModal] = useState(false);
  const [textoImportacaoSEI, setTextoImportacaoSEI] = useState('');
  const [modoSubstituirDocs, setModoSubstituirDocs] = useState(true);

  // Formulário Nova Categoria
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  const [novaCategoriaDesc, setNovaCategoriaDesc] = useState('');

  // Formulário Novo Processo
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoNumeroSEI, setNovoNumeroSEI] = useState('');
  const [novosParticipantes, setNovosParticipantes] = useState('');
  const [novaDataDiaria, setNovaDataDiaria] = useState('');
  const [novaEscolaNome, setNovaEscolaNome] = useState('');
  const [novaEmpresa, setNovaEmpresa] = useState('');

  // Formulário Novo Documento Anexado
  const [novoDocNome, setNovoDocNome] = useState('');
  const [novoDocTipo, setNovoDocTipo] = useState('Documento SEI');
  const [novoDocUnidade, setNovoDocUnidade] = useState('SEDUC/GPR');

  // Campo de novo alerta customizado
  const [novoNomeAlerta, setNovoNomeAlerta] = useState('');

  // Categoria ativa
  const activeCategoria = categorias.find((c) => c.id === activeCategoriaId);
  // Processo selecionado
  const selectedProcesso = processos.find((p) => p.id === selectedProcessoId);

  // ==========================================
  // HANDLERS DE CATEGORIA
  // ==========================================
  const handleCriarCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCategoriaNome.trim()) return;

    const nova: CategoriaProcessoCard = {
      id: `cat-${Date.now()}`,
      nome: novaCategoriaNome.trim(),
      descricao: novaCategoriaDesc.trim() || 'Acompanhamento personalizado de processos',
      isPadrao: false,
      corBadge: 'purple'
    };

    const updated = storage.saveCategoriaProcesso(nova);
    setCategorias(updated);
    setNovaCategoriaNome('');
    setNovaCategoriaDesc('');
    setShowNovaCategoriaModal(false);
  };

  const handleExcluirCategoria = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover esta categoria de acompanhamento?')) {
      const updated = storage.deleteCategoriaProcesso(id);
      setCategorias(updated);
      if (activeCategoriaId === id) setActiveCategoriaId(null);
    }
  };

  // ==========================================
  // HANDLERS DE PROCESSO
  // ==========================================
  const handleCriarProcesso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !novoNumeroSEI.trim() || !activeCategoriaId) return;

    // Documentos iniciais simulando a abertura no SEI
    const docsIniciais: DocumentoProcessoSEI[] = activeCategoriaId === 'diaria'
      ? [
          {
            id: `doc-${Date.now()}-1`,
            numeroOrdem: '001',
            nomeDocumento: 'Requerimento de Concessão de Diárias',
            tipo: 'Documento SEI',
            dataAnexacao: new Date().toLocaleDateString('pt-BR') + ' 08:30',
            unidadeGeradora: 'SEDUC/GPR'
          },
          {
            id: `doc-${Date.now()}-2`,
            numeroOrdem: '002',
            nomeDocumento: 'Roteiro de Vistoria Técnica e Escolas',
            tipo: 'Anexo PDF',
            dataAnexacao: new Date().toLocaleDateString('pt-BR') + ' 08:35',
            unidadeGeradora: 'SEDUC/GPR'
          }
        ]
      : [
          {
            id: `doc-${Date.now()}-1`,
            numeroOrdem: '001',
            nomeDocumento: 'Solicitação de Atesto e Medição',
            tipo: 'Documento SEI',
            dataAnexacao: new Date().toLocaleDateString('pt-BR') + ' 09:00',
            unidadeGeradora: 'SEDUC/GPR'
          },
          {
            id: `doc-${Date.now()}-2`,
            numeroOrdem: '002',
            nomeDocumento: 'Planilha e Boletim de Medição de Campo',
            tipo: 'Anexo PDF',
            dataAnexacao: new Date().toLocaleDateString('pt-BR') + ' 09:05',
            unidadeGeradora: 'SEDUC/GPR'
          }
        ];

    // Alertas monitorados padrão
    const alertasIniciais: AlertaProcessoConfig[] = activeCategoriaId === 'diaria'
      ? [
          { id: 'alt-1', nomeDocumentoAlvo: 'SEDUC Empenho', ativo: true, mensagemPersonalizada: 'Foi empenhado no seu processo SEI de diária!' },
          { id: 'alt-2', nomeDocumentoAlvo: 'SEDUC QRE', ativo: true, mensagemPersonalizada: 'O SEDUC QRE foi gerado no seu processo de diária!' }
        ]
      : [
          { id: 'alt-1', nomeDocumentoAlvo: 'Nota Fiscal', ativo: true, mensagemPersonalizada: 'Nota fiscal anexada ao processo de medição!' },
          { id: 'alt-2', nomeDocumentoAlvo: 'Termo de Atesto', ativo: true, mensagemPersonalizada: 'Termo de Atesto emitido pela Engenharia!' }
        ];

    const novoProcesso: ProcessoAcompanhamento = {
      id: `proc-${Date.now()}`,
      categoriaId: activeCategoriaId,
      categoriaNome: activeCategoria?.nome || 'Processo',
      titulo: novoTitulo.trim(),
      numeroProcesso: novoNumeroSEI.trim(),
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      status: 'em_tramitacao',
      unidadeAtual: 'SEDUC/GPR',
      escolaNome: novaEscolaNome.trim() || undefined,
      empresaContratada: novaEmpresa.trim() || undefined,
      participantes: novosParticipantes ? novosParticipantes.split(',').map((p) => p.trim()) : undefined,
      dataDiaria: novaDataDiaria.trim() || undefined,
      documentos: docsIniciais,
      alertasMonitorados: alertasIniciais
    };

    const updated = storage.saveProcesso(novoProcesso);
    setProcessos(updated);
    setNovoTitulo('');
    setNovoNumeroSEI('');
    setNovosParticipantes('');
    setNovaDataDiaria('');
    setNovaEscolaNome('');
    setNovaEmpresa('');
    setShowNovoProcessoModal(false);
    setSelectedProcessoId(novoProcesso.id);
  };

  const handleExcluirProcesso = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover este processo de acompanhamento?')) {
      const updated = storage.deleteProcesso(id);
      setProcessos(updated);
      if (selectedProcessoId === id) setSelectedProcessoId(null);
    }
  };

  // ==========================================
  // HANDLERS DE DOCUMENTOS E ALERTAS
  // ==========================================
  const handleAdicionarDocumento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoDocNome.trim() || !selectedProcesso) return;

    const proximaOrdem = String(selectedProcesso.documentos.length + 1).padStart(3, '0');
    const updated = storage.adicionarDocumentoProcesso(selectedProcesso.id, {
      numeroOrdem: proximaOrdem,
      nomeDocumento: novoDocNome.trim(),
      tipo: novoDocTipo,
      dataAnexacao: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      unidadeGeradora: novoDocUnidade.trim() || 'SEDUC/DAF'
    });

    setProcessos(updated);
    setNovoDocNome('');
    setShowNovoDocumentoModal(false);
  };

  const handleJuntarDocRapido = (nomeDoc: string) => {
    if (!selectedProcesso) return;
    const proximaOrdem = String(selectedProcesso.documentos.length + 1).padStart(3, '0');
    const updated = storage.adicionarDocumentoProcesso(selectedProcesso.id, {
      numeroOrdem: proximaOrdem,
      nomeDocumento: nomeDoc,
      tipo: 'Documento SEI',
      dataAnexacao: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      unidadeGeradora: nomeDoc.includes('Empenho') || nomeDoc.includes('QRE') ? 'SEDUC/DAF' : 'SEDUC/GPR'
    });
    setProcessos(updated);
  };

  /**
   * Parser inteligente que recebe a árvore de documentos ou andamentos copiados do SEI
   * e extrai automaticamente todos os documentos reais (número, nome, tipo, unidade e data)
   */
  const handleProcessarImportacaoSEI = () => {
    if (!selectedProcesso || !textoImportacaoSEI.trim()) return;

    const linhas = textoImportacaoSEI
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 2);

    const docsImportados: DocumentoProcessoSEI[] = [];

    linhas.forEach((linha, idx) => {
      // Ignora linhas irrelevantes
      const lower = linha.toLowerCase();
      if (
        lower.includes('árvore de documentos') ||
        lower.includes('processo nº') ||
        lower.includes('consultar andamento') ||
        lower.includes('sei - sistema eletrônico')
      ) {
        return;
      }

      let numeroOrdem = String(idx + 1).padStart(3, '0');
      let nomeDoc = linha;
      let unidade = 'SEDUC/GPR';
      let dataAnex = new Date().toLocaleDateString('pt-BR');

      // 1. Extração de data (dd/mm/aaaa)
      const dataMatch = linha.match(/(\d{2}\/\d{2}\/\d{4}(?:\s+\d{2}:\d{2})?)/);
      if (dataMatch) {
        dataAnex = dataMatch[1];
        nomeDoc = nomeDoc.replace(dataMatch[0], '');
      }

      // 2. Extração de unidade entre parênteses ex: (SEDUC/GPR), (SEDUC/DAF), (SEDUC/GAB)
      const unidMatch = linha.match(/\(([^)]+)\)/);
      if (unidMatch) {
        unidade = unidMatch[1];
        nomeDoc = nomeDoc.replace(unidMatch[0], '');
      }

      // 3. Extração de número de ordem ou identificador de documento
      const ordemMatch = linha.match(/^(\d{1,5})[\s\.\-_:]+/);
      if (ordemMatch) {
        numeroOrdem = ordemMatch[1].padStart(3, '0');
        nomeDoc = nomeDoc.replace(ordemMatch[0], '');
      }

      // Limpeza de caracteres residuais
      nomeDoc = nomeDoc.replace(/^[\s\.\-_/:]+|[\s\.\-_/:]+$/g, '').trim();
      if (!nomeDoc) nomeDoc = `Documento ${numeroOrdem}`;

      // Determinação de Tipo
      let tipo = 'Documento SEI';
      const docLower = nomeDoc.toLowerCase();
      if (docLower.includes('empenho')) tipo = 'Nota de Empenho';
      else if (docLower.includes('qre')) tipo = 'SEDUC QRE';
      else if (docLower.includes('atesto')) tipo = 'Termo de Atesto';
      else if (docLower.includes('nota fiscal') || docLower.includes('danfe')) tipo = 'Nota Fiscal';
      else if (docLower.includes('pdf') || docLower.includes('roteiro') || docLower.includes('boletim')) tipo = 'Anexo PDF';
      else if (docLower.includes('despacho')) tipo = 'Despacho';
      else if (docLower.includes('portaria')) tipo = 'Portaria';
      else if (docLower.includes('requerimento')) tipo = 'Requerimento';

      docsImportados.push({
        id: `doc-sei-${Date.now()}-${idx}`,
        numeroOrdem,
        nomeDocumento: nomeDoc,
        tipo,
        unidadeGeradora: unidade,
        dataAnexacao: dataAnex
      });
    });

    if (docsImportados.length === 0) {
      alert('Nenhum documento identificado no texto colado. Copie e cole os documentos da árvore ou do andamento do SEI.');
      return;
    }

    const novosDocs = modoSubstituirDocs
      ? docsImportados
      : [...selectedProcesso.documentos, ...docsImportados];

    const processoAtualizado: ProcessoAcompanhamento = {
      ...selectedProcesso,
      documentos: novosDocs
    };

    const updated = storage.saveProcesso(processoAtualizado);
    setProcessos(updated);
    setTextoImportacaoSEI('');
    setShowImportarSeiModal(false);

    // Verificação de alertas disparados
    const alertasDisparados = processoAtualizado.alertasMonitorados
      .filter((a) => a.ativo)
      .filter((a) => novosDocs.some((d) => d.nomeDocumento.toLowerCase().includes(a.nomeDocumentoAlvo.toLowerCase())));

    if (alertasDisparados.length > 0) {
      alert(
        `✓ Sucesso! ${docsImportados.length} documentos reais foram importados para a árvore do SEI.\n\n⚠️ ALERTA DISPARADO: Foram encontrados documentos que você marcou para monitorar:\n${alertasDisparados.map((a) => `• ${a.nomeDocumentoAlvo}`).join('\n')}`
      );
    } else {
      alert(`✓ Sucesso! ${docsImportados.length} documentos reais foram importados para a árvore do processo.`);
    }
  };

  const handleToggleAlertaConfig = (alertaId: string) => {
    if (!selectedProcesso) return;
    const novosAlertas = selectedProcesso.alertasMonitorados.map((a) =>
      a.id === alertaId ? { ...a, ativo: !a.ativo } : a
    );
    const atualizado: ProcessoAcompanhamento = {
      ...selectedProcesso,
      alertasMonitorados: novosAlertas
    };
    const updated = storage.saveProcesso(atualizado);
    setProcessos(updated);
  };

  const handleAddAlertaCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNomeAlerta.trim() || !selectedProcesso) return;

    const novoAlerta: AlertaProcessoConfig = {
      id: `alt-${Date.now()}`,
      nomeDocumentoAlvo: novoNomeAlerta.trim(),
      ativo: true,
      mensagemPersonalizada: `O documento ${novoNomeAlerta.trim()} foi anexado ao seu processo!`
    };

    const atualizado: ProcessoAcompanhamento = {
      ...selectedProcesso,
      alertasMonitorados: [...selectedProcesso.alertasMonitorados, novoAlerta]
    };

    const updated = storage.saveProcesso(atualizado);
    setProcessos(updated);
    setNovoNomeAlerta('');
  };

  // ==========================================
  // 1. TELA DE DETALHES DA ESTRUTURA DO PROCESSO SEI
  // ==========================================
  if (selectedProcesso) {
    // Alertas disparados encontrados na árvore de documentos
    const alertasAtivosDisparados = selectedProcesso.alertasMonitorados
      .filter((alt) => alt.ativo)
      .map((alt) => {
        const docEncontrado = selectedProcesso.documentos.find((doc) =>
          doc.nomeDocumento.toLowerCase().includes(alt.nomeDocumentoAlvo.toLowerCase())
        );
        return {
          ...alt,
          encontrado: Boolean(docEncontrado),
          doc: docEncontrado
        };
      })
      .filter((alt) => alt.encontrado);

    return (
      <div className="w-full pb-20 pt-1 px-4 animate-fadeIn">
        {/* Barra Superior */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md mb-3.5">
          <button
            onClick={() => setSelectedProcessoId(null)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 text-xs font-bold border border-slate-700 transition-colors shrink-0 active-press"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Voltar aos Processos</span>
          </button>

          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 truncate">
            {selectedProcesso.categoriaNome}
          </span>
        </div>

        {/* CABEÇALHO DO PROCESSO SEI (ESTILO CONSULTA PÚBLICA) */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0c1f2d]/90 via-slate-900/90 to-slate-950 border border-cyan-500/30 shadow-glass mb-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                Processo SEI • Consulta Pública (Visitante)
              </span>
              <h2 className="text-base font-black text-white mt-1 leading-snug">
                {selectedProcesso.titulo}
              </h2>
              <p className="font-mono text-xs text-amber-400 font-bold mt-0.5">
                Nº: {selectedProcesso.numeroProcesso}
              </p>
            </div>

            <div className="text-right shrink-0 space-y-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Em Tramitação
              </span>
              <a
                href={
                  selectedProcesso.numeroProcesso.startsWith('http')
                    ? selectedProcesso.numeroProcesso
                    : `https://sei.pi.gov.br/sei/modulos/pesquisa/md_pesq_processo_pesquisar.php?palavra_chave=${encodeURIComponent(selectedProcesso.numeroProcesso)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-black tracking-wide transition-all active:scale-95 shadow-sm block"
                title="Abrir diretamente na página do SEI Piauí"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Abrir no SEI</span>
              </a>
              <span className="block text-[9.5px] text-slate-400">
                Unidade: {selectedProcesso.unidadeAtual || 'SEDUC/GPR'}
              </span>
            </div>
          </div>

          {/* Dados Específicos de Diária */}
          {selectedProcesso.dataDiaria && (
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  Período da Diária:
                </span>
                <strong className="text-white text-[11px]">{selectedProcesso.dataDiaria}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-cyan-400" />
                  Equipe / Participantes:
                </span>
                <strong className="text-white text-[11px] truncate block">
                  {selectedProcesso.participantes?.join(', ') || 'Não especificado'}
                </strong>
              </div>
            </div>
          )}

          {/* Dados Específicos de Medição */}
          {selectedProcesso.escolaNome && (
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-300">
              <span className="text-[10px] text-slate-400 block">Unidade Escolar / Contratada:</span>
              <strong className="text-white text-[11px]">
                {selectedProcesso.escolaNome} {selectedProcesso.empresaContratada ? `• ${selectedProcesso.empresaContratada}` : ''}
              </strong>
            </div>
          )}
        </div>

        {/* BANNERS DE ALERTAS INTELIGENTES ATIVOS */}
        {alertasAtivosDisparados.length > 0 && (
          <div className="mb-4 space-y-2">
            {alertasAtivosDisparados.map((alerta) => (
              <div
                key={alerta.id}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-start gap-3 animate-fadeIn"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-400 block">
                    Alerta de Tramitação Ativado
                  </span>
                  <h4 className="text-xs font-black text-white mt-0.5 leading-snug">
                    {alerta.mensagemPersonalizada || `O documento ${alerta.nomeDocumentoAlvo} foi localizado no processo!`}
                  </h4>
                  <p className="text-[10px] text-emerald-300/80 mt-0.5">
                    Doc: #{alerta.doc?.numeroOrdem} - {alerta.doc?.nomeDocumento} ({alerta.doc?.dataAnexacao})
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAINEL DE CONFIGURAÇÃO DE ALERTAS */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Configuração de Alertas do Processo</span>
            </div>
            <span className="text-[10px] text-slate-400">Notificar quando surgir doc</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {selectedProcesso.alertasMonitorados.map((alt) => (
              <button
                key={alt.id}
                onClick={() => handleToggleAlertaConfig(alt.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all active-press flex items-center gap-1.5 ${
                  alt.ativo
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-glass-glow-gold'
                    : 'bg-slate-800/60 border-white/10 text-slate-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${alt.ativo ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                <span>{alt.nomeDocumentoAlvo}</span>
              </button>
            ))}
          </div>

          {/* Adicionar novo termo de alerta */}
          <form onSubmit={handleAddAlertaCustom} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Novo termo (ex: Ordem Bancária, Parecer)..."
              value={novoNomeAlerta}
              onChange={(e) => setNovoNomeAlerta(e.target.value)}
              className="flex-1 text-xs bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shrink-0 active-press"
            >
              Adicionar Alerta
            </button>
          </form>
        </div>

        {/* ESTRUTURA E ÁRVORE DE DOCUMENTOS ANEXADOS AO PROCESSO */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Árvore de Documentos do Processo ({selectedProcesso.documentos.length})</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Estrutura de arquivos anexados para acompanhamento e controle de trâmite
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              <button
                onClick={() => setShowImportarSeiModal(true)}
                className="p-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 shadow-glass-glow-gold active:scale-95 transition-all"
                title="Copie e cole a árvore de documentos ou andamentos do SEI para importar todos os arquivos reais instantaneamente"
              >
                <FileCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Importar do SEI</span>
              </button>

              <button
                onClick={() => setShowNovoDocumentoModal(true)}
                className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Anexar Manual</span>
              </button>
            </div>
          </div>

          {/* Botões de Ação Rápida para Simular SEDUC Empenho / SEDUC QRE */}
          {selectedProcesso.categoriaId === 'diaria' && (
            <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200">
              <span className="font-semibold text-cyan-300">Testar Alertas:</span>
              <button
                type="button"
                onClick={() => handleJuntarDocRapido('SEDUC Empenho')}
                className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-500/30 active-press"
              >
                + Juntar SEDUC Empenho
              </button>
              <button
                type="button"
                onClick={() => handleJuntarDocRapido('SEDUC QRE')}
                className="px-2 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold hover:bg-cyan-500/30 active-press"
              >
                + Juntar SEDUC QRE
              </button>
            </div>
          )}

          {/* Lista de Documentos da Árvore */}
          <div className="space-y-2 pt-1">
            {selectedProcesso.documentos.map((doc, idx) => {
              const isEmpenho = doc.nomeDocumento.toLowerCase().includes('empenho');
              const isQRE = doc.nomeDocumento.toLowerCase().includes('qre');

              return (
                <div
                  key={doc.id}
                  className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    isEmpenho || isQRE
                      ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40 shadow-glass'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isEmpenho || isQRE
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border border-white/10'
                    }`}>
                      {doc.numeroOrdem}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-white leading-tight">
                          {doc.nomeDocumento}
                        </span>
                        {(isEmpenho || isQRE) && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950">
                            {isEmpenho ? 'EMPENHADO' : 'QRE EMITIDO'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span>{doc.tipo}</span>
                        <span>•</span>
                        <span>Unidade: {doc.unidadeGeradora || 'SEDUC/GPR'}</span>
                        <span>•</span>
                        <span>{doc.dataAnexacao}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md border border-white/5 shrink-0">
                    Visualização de Trâmite
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODAL: ANEXAR NOVO DOCUMENTO */}
        {showNovoDocumentoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-sm bg-[#0D1424] border border-white/15 rounded-3xl p-4 shadow-2xl space-y-3">
              <h3 className="text-xs font-black text-white">Anexar Documento à Árvore do SEI</h3>
              <form onSubmit={handleAdicionarDocumento} className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Nome do Documento / Arquivo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SEDUC Empenho, Nota Fiscal, etc."
                    value={novoDocNome}
                    onChange={(e) => setNovoDocNome(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Tipo de Documento</label>
                    <select
                      value={novoDocTipo}
                      onChange={(e) => setNovoDocTipo(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Documento SEI">Documento SEI</option>
                      <option value="Anexo PDF">Anexo PDF</option>
                      <option value="Termo de Atesto">Termo de Atesto</option>
                      <option value="Nota de Empenho">Nota de Empenho</option>
                      <option value="QRE">SEDUC QRE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Unidade Geradora</label>
                    <input
                      type="text"
                      placeholder="Ex: SEDUC/DAF"
                      value={novoDocUnidade}
                      onChange={(e) => setNovoDocUnidade(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNovoDocumentoModal(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-glass-glow-turq"
                  >
                    Confirmar Anexo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: IMPORTAR ÁRVORE DE DOCUMENTOS DO SEI */}
        {showImportarSeiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-lg bg-[#0D1424] border border-amber-500/30 rounded-3xl p-5 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-amber-400" />
                    <span>Importar Árvore Real do SEI</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Cole a listagem de documentos da árvore ou andamentos do processo copiada do SEI Piauí.
                  </p>
                </div>
                <button
                  onClick={() => setShowImportarSeiModal(false)}
                  className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Dica de uso rápido */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 space-y-1">
                <p className="font-bold">Como funciona a importação em 1 passo:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-300">
                  <li>Abra o processo no SEI e selecione com o mouse os documentos na árvore lateral ou tela de andamentos;</li>
                  <li>Copie (Ctrl+C) e cole (Ctrl+V) no campo abaixo;</li>
                  <li>O parser identificará automaticamente cada arquivo, número de ordem, data e setor gerador!</li>
                </ol>
              </div>

              {/* Caixa de Texto para Colar */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Texto da Árvore de Documentos / Andamentos do SEI:
                </label>
                <textarea
                  rows={8}
                  placeholder="Exemplo do que colar:&#10;001 Requerimento de Concessão de Diárias (SEDUC/GPR) 10/11/2026&#10;002 Roteiro de Vistoria Técnica (SEDUC/GPR) 10/11/2026&#10;003 Portaria de Concessão de Diárias (SEDUC/GAB) 12/11/2026&#10;004 SEDUC Empenho (SEDUC/DAF) 14/11/2026&#10;005 SEDUC QRE (SEDUC/DAF) 15/11/2026"
                  value={textoImportacaoSEI}
                  onChange={(e) => setTextoImportacaoSEI(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-950 border border-white/15 rounded-2xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              {/* Opções de Importação */}
              <div className="flex items-center justify-between text-xs text-slate-300 p-2 rounded-xl bg-slate-900 border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modoSubstituirDocs}
                    onChange={(e) => setModoSubstituirDocs(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>Substituir árvore atual pelos documentos colados</span>
                </label>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowImportarSeiModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleProcessarImportacaoSEI}
                  disabled={!textoImportacaoSEI.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-glass-glow-gold active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>Processar e Montar Árvore Real</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. LISTA DE PROCESSOS DA CATEGORIA SELECIONADA
  // ==========================================
  if (activeCategoria) {
    const processosDaCategoria = processos.filter((p) => p.categoriaId === activeCategoria.id);

    return (
      <div className="w-full pb-20 pt-1 px-4 animate-fadeIn">
        {/* Barra Superior */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md mb-3.5">
          <button
            onClick={() => setActiveCategoriaId(null)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 text-xs font-bold border border-slate-700 transition-colors shrink-0 active-press"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Voltar às Categorias</span>
          </button>

          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 truncate">
            {activeCategoria.nome}
          </span>
        </div>

        {/* Título da Seção e Botão Novo Processo */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div>
            <h2 className="text-sm font-black text-white">{activeCategoria.nome}</h2>
            <p className="text-[11px] text-slate-400">{activeCategoria.descricao}</p>
          </div>

          <button
            onClick={() => setShowNovoProcessoModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-xs shadow-glass-glow-gold active-press flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Novo Processo</span>
          </button>
        </div>

        {/* Lista de Processos Cadastrados */}
        <div className="space-y-3">
          {processosDaCategoria.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 text-center text-xs text-slate-400 space-y-2">
              <FileSearch className="w-8 h-8 text-amber-400/50 mx-auto" />
              <div className="font-bold text-slate-200">Nenhum processo cadastrado em {activeCategoria.nome}.</div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Clique em "+ Novo Processo" para adicionar o número SEI e acompanhar toda a estrutura de tramitação e anexos.
              </p>
            </div>
          ) : (
            processosDaCategoria.map((proc) => {
              const temEmpenho = proc.documentos.some((d) => d.nomeDocumento.toLowerCase().includes('empenho'));
              const temQRE = proc.documentos.some((d) => d.nomeDocumento.toLowerCase().includes('qre'));

              return (
                <div
                  key={proc.id}
                  onClick={() => setSelectedProcessoId(proc.id)}
                  className="p-4 rounded-3xl bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/90 border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer shadow-glass active:scale-[0.99] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        {proc.numeroProcesso}
                      </span>
                      <h3 className="text-xs font-black text-white mt-1 leading-snug">
                        {proc.titulo}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleExcluirProcesso(proc.id, e)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded-lg"
                        title="Excluir acompanhamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Informações Complementares */}
                  {proc.dataDiaria && (
                    <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{proc.dataDiaria}</span>
                      {proc.participantes && proc.participantes.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="truncate">{proc.participantes.join(', ')}</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Badges de Alerta do Processo */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
                    <span className="text-[10px] text-slate-400">
                      {proc.documentos.length} {proc.documentos.length === 1 ? 'documento anexado' : 'documentos anexados'}
                    </span>
                    {temEmpenho && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Empenhado
                      </span>
                    )}
                    {temQRE && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        SEDUC QRE
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL: NOVO PROCESSO DESTA CATEGORIA */}
        {showNovoProcessoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md bg-[#0D1424] border border-white/15 rounded-3xl p-4 shadow-2xl space-y-3 max-h-[92vh] overflow-y-auto">
              <h3 className="text-sm font-black text-white">Novo Processo em {activeCategoria.nome}</h3>
              <form onSubmit={handleCriarProcesso} className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Título do Processo</label>
                  <input
                    type="text"
                    required
                    placeholder={
                      activeCategoria.id === 'diaria'
                        ? 'Ex: Vistoria 08ª GRE Oeiras - 4,5 diárias'
                        : 'Ex: 1ª Medição Reforma CETI Rocha Neto'
                    }
                    value={novoTitulo}
                    onChange={(e) => setNovoTitulo(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Número do Processo SEI</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 00026.012345/2026-11"
                    value={novoNumeroSEI}
                    onChange={(e) => setNovoNumeroSEI(e.target.value)}
                    className="w-full font-mono text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Campos adicionais para Diárias */}
                {activeCategoria.id === 'diaria' && (
                  <>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Pessoas que foram na Diária (separadas por vírgula)</label>
                      <input
                        type="text"
                        placeholder="Ex: Wisterly (Engenheiro Fiscal), Carlos (Motorista)"
                        value={novosParticipantes}
                        onChange={(e) => setNovosParticipantes(e.target.value)}
                        className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Data / Período da Diária</label>
                      <input
                        type="text"
                        placeholder="Ex: 16/11/2026 a 20/11/2026"
                        value={novaDataDiaria}
                        onChange={(e) => setNovaDataDiaria(e.target.value)}
                        className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </>
                )}

                {/* Campos adicionais para Medições */}
                {activeCategoria.id === 'medicao' && (
                  <>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Nome da Escola / Obra (opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: CETI Rocha Neto"
                        value={novaEscolaNome}
                        onChange={(e) => setNovaEscolaNome(e.target.value)}
                        className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Empresa Construtora (opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Construtora Piauiense Ltda"
                        value={novaEmpresa}
                        onChange={(e) => setNovaEmpresa(e.target.value)}
                        className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNovoProcessoModal(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-glass-glow-gold"
                  >
                    Cadastrar Processo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 3. TELA PRINCIPAL: CARDS DE CATEGORIAS (PADRÃO MEDIÇÕES E DIÁRIAS)
  // ==========================================
  return (
    <div className="w-full pb-20 pt-1 px-4 animate-fadeIn">
      {/* Topo do Módulo */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div>
          <h2 className="text-sm font-black text-white flex items-center gap-1.5">
            <FileSearch className="w-4 h-4 text-cyan-400" />
            <span>Acompanhamento de Processos</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Estrutura e trâmite no SEI • Alertas de Empenho e SEDUC QRE
          </p>
        </div>

        <button
          onClick={() => setShowNovaCategoriaModal(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-bold text-xs active-press flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* GRID DE CARDS DAS CATEGORIAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {categorias.map((cat) => {
          const procsCount = processos.filter((p) => p.categoriaId === cat.id).length;
          const isMedicao = cat.id === 'medicao';
          const isDiaria = cat.id === 'diaria';

          return (
            <div
              key={cat.id}
              onClick={() => setActiveCategoriaId(cat.id)}
              className={`group relative p-4 rounded-3xl border backdrop-blur-2xl transition-all cursor-pointer shadow-glass overflow-hidden flex flex-col justify-between h-44 active-press ${
                isMedicao
                  ? 'bg-gradient-to-br from-[#2a1f0a]/90 via-slate-900/80 to-slate-950 border-amber-500/30 hover:border-amber-400/50 shadow-[0_8px_25px_rgba(234,179,8,0.12)]'
                  : isDiaria
                  ? 'bg-gradient-to-br from-[#0c1f2d]/90 via-slate-900/80 to-slate-950 border-cyan-500/30 hover:border-cyan-400/50 shadow-[0_8px_25px_rgba(6,182,212,0.12)]'
                  : 'bg-slate-900/80 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Brilho de fundo */}
              <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-xl ${
                isMedicao ? 'bg-amber-500/10' : isDiaria ? 'bg-cyan-500/10' : 'bg-purple-500/10'
              }`} />

              <div className="flex items-start justify-between w-full z-10">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                  isMedicao
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : isDiaria
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                    : 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                }`}>
                  {isMedicao && <FileCheck className="w-6 h-6 stroke-[1.7]" />}
                  {isDiaria && <Calendar className="w-6 h-6 stroke-[1.7]" />}
                  {!isMedicao && !isDiaria && <Layers className="w-6 h-6 stroke-[1.7]" />}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    isMedicao
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : isDiaria
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {procsCount} {procsCount === 1 ? 'Processo' : 'Processos'}
                  </span>

                  {!cat.isPadrao && (
                    <button
                      onClick={(e) => handleExcluirCategoria(cat.id, e)}
                      className="p-1 text-slate-500 hover:text-red-400 rounded-lg"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="z-10">
                <h3 className="text-sm font-black text-white leading-tight">
                  {cat.nome}
                </h3>
                <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">
                  {cat.descricao}
                </p>
                {isDiaria && (
                  <span className="text-[9px] text-cyan-300 font-semibold block mt-1">
                    ⚡ Alertas: SEDUC Empenho & SEDUC QRE
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: NOVA CATEGORIA */}
      {showNovaCategoriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0D1424] border border-white/15 rounded-3xl p-4 shadow-2xl space-y-3">
            <h3 className="text-xs font-black text-white">Criar Nova Categoria de Acompanhamento</h3>
            <form onSubmit={handleCriarCategoria} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Processos de Aditivo, Licitações..."
                  value={novaCategoriaNome}
                  onChange={(e) => setNovaCategoriaNome(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Controle e fiscalização de prazos contratuais"
                  value={novaCategoriaDesc}
                  onChange={(e) => setNovaCategoriaDesc(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowNovaCategoriaModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-glass-glow-turq"
                >
                  Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
