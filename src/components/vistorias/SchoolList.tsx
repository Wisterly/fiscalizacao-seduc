import React, { useState, useMemo } from 'react';
import { Search, MapPin, ArrowLeft, Plus, ChevronRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Escola, GRE } from '../../types';
import { AddSchoolModal } from './AddSchoolModal';

interface SchoolListProps {
  gre: GRE;
  schools: Escola[];
  onBack: () => void;
  onSelectSchool: (school: Escola) => void;
  onAddSchool: (newSchool: Omit<Escola, 'id'>) => void;
  onSyncFromSheets?: () => Promise<number>;
}

export const SchoolList: React.FC<SchoolListProps> = ({
  gre,
  schools,
  onBack,
  onSelectSchool,
  onAddSchool,
  onSyncFromSheets
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('TODOS');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Filtra apenas unidades desta GRE com situação "EM USO" (Coluna F da planilha DADOS INEP)
  const greSchools = useMemo(() => {
    return schools.filter(
      (s) =>
        s.greId === gre.id &&
        (!s.situacaoImovel || s.situacaoImovel.toUpperCase().trim() === 'EM USO')
    );
  }, [schools, gre.id]);

  // Municípios únicos presentes nas escolas EM USO desta GRE
  const municipiosDisponiveis = useMemo(() => {
    const set = new Set<string>();
    greSchools.forEach((s) => {
      if (s.municipio) set.add(s.municipio);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [greSchools]);

  // Aplica busca por INEP, Nome da Entidade ou Município
  const filteredSchools = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return greSchools.filter((school) => {
      const matchesMun =
        selectedMunicipio === 'TODOS' || school.municipio === selectedMunicipio;
      if (!matchesMun) return false;
      if (!q) return true;
      return (
        school.nome.toLowerCase().includes(q) ||
        school.municipio.toLowerCase().includes(q) ||
        (school.inep || '').toLowerCase().includes(q)
      );
    });
  }, [greSchools, searchTerm, selectedMunicipio]);

  const handleSync = async () => {
    if (!onSyncFromSheets || isSyncing) return;
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const total = await onSyncFromSheets();
      setSyncMessage({ type: 'ok', text: `Planilha atualizada: ${total} unidades em uso.` });
      setTimeout(() => setSyncMessage(null), 4000);
    } catch {
      setSyncMessage({ type: 'err', text: 'Sem conexão com a planilha agora. Usando base offline.' });
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Cabeçalho da GRE Selecionada */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white active-press flex-shrink-0"
            aria-label="Voltar para as 21 GREs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-white tracking-tight leading-tight truncate">
              {gre.nome}
            </h2>
            <p className="text-[11px] text-cyan-400 font-medium">
              {greSchools.length} {greSchools.length === 1 ? 'unidade em uso' : 'unidades em uso'} (DADOS INEP)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onSyncFromSheets && (
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              title="Sincronizar da planilha Google Sheets"
              className="p-2 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-cyan-400 active-press disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold text-[11px] active-press shadow-glass-glow-turq"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
            <span>Adicionar Escola</span>
          </button>
        </div>
      </div>

      {/* Feedback de Sincronização */}
      {syncMessage && (
        <div
          className={`mb-2.5 px-3 py-2 rounded-xl border text-[11px] font-medium flex items-center gap-2 ${
            syncMessage.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-orange-500/10 border-orange-500/30 text-orange-300'
          }`}
        >
          {syncMessage.type === 'ok' ? (
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span>{syncMessage.text}</span>
        </div>
      )}

      {/* Barra de Busca e Filtro por Município */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por INEP, nome da escola ou município..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-900/75 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 backdrop-blur-xl transition-all"
          />
        </div>

        {/* Pills de Municípios quando houver mais de 1 município na GRE */}
        {municipiosDisponiveis.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              type="button"
              onClick={() => setSelectedMunicipio('TODOS')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap active-press transition-all ${
                selectedMunicipio === 'TODOS'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/35'
                  : 'bg-slate-900/50 text-slate-400 border border-white/5 hover:text-slate-200'
              }`}
            >
              Todos ({greSchools.length})
            </button>
            {municipiosDisponiveis.map((mun) => (
              <button
                key={mun}
                type="button"
                onClick={() => setSelectedMunicipio(mun)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold whitespace-nowrap active-press transition-all ${
                  selectedMunicipio === mun
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35'
                    : 'bg-slate-900/50 text-slate-400 border border-white/5 hover:text-slate-200'
                }`}
              >
                {mun}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de Escolas na Sequência Solicitada: 1. INEP -> 2. Nome da Escola -> 3. Município */}
      <div className="space-y-2 max-h-[65vh] overflow-y-auto no-scrollbar pr-0.5 pb-4">
        {filteredSchools.map((school) => (
          <button
            key={school.id}
            type="button"
            onClick={() => onSelectSchool(school)}
            className="w-full text-left p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/85 border border-white/10 hover:border-cyan-400/40 backdrop-blur-xl transition-all duration-150 cursor-pointer active-press flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1 flex flex-col items-start">
              {/* 1º: Número do INEP */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/25 text-[10.5px] font-mono font-bold text-cyan-300 tracking-wide">
                  INEP: {school.inep || 'S/ INEP'}
                </span>
                {school.isManual && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[9.5px] font-bold text-amber-300">
                    Adicionada manualmente
                  </span>
                )}
              </div>

              {/* 2º: Nome da Escola (Coluna K - NOME ENTIDADE) */}
              <h3 className="font-bold text-[13px] text-white leading-snug mt-1.5 break-words w-full">
                {school.nome}
              </h3>

              {/* 3º: Município (Coluna J - MUNICIPIO) */}
              <p className="text-[11.5px] font-semibold text-amber-400/90 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 flex-shrink-0 text-amber-400" />
                <span className="truncate">{school.municipio}</span>
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>
        ))}

        {filteredSchools.length === 0 && (
          <div className="text-center py-8 px-4 rounded-2xl bg-slate-900/40 border border-white/5 space-y-2">
            <p className="text-xs text-slate-400">
              Nenhuma escola encontrada nesta GRE com os filtros aplicados.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold active-press"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar escola manualmente
            </button>
          </div>
        )}
      </div>

      {/* Modal: Adicionar Nova Escola Manualmente */}
      {showAddModal && (
        <AddSchoolModal
          gre={gre}
          onSave={(newSchoolData) => {
            onAddSchool(newSchoolData);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};
