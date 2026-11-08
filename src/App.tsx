import React, { useState, useEffect } from 'react';
import { storage } from './services/storageService';
import {
  GRE,
  Escola,
  Ambiente,
  OrdemServico,
  Demanda,
  AlertaUrgente,
  RotaVistoria,
  TarefaDoDia,
  Levantamento
} from './types';

// Componentes Comuns
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';

// Componentes da Tela Inicial (Dashboard)
import { UrgentAlertsCarousel } from './components/dashboard/UrgentAlertsCarousel';
import { ModuleGrid } from './components/dashboard/ModuleGrid';
import { DailyTasksSection } from './components/dashboard/DailyTasksSection';

// Componentes dos Módulos
import { GreSelector } from './components/vistorias/GreSelector';
import { SchoolList } from './components/vistorias/SchoolList';
import { SchoolTimeline } from './components/vistorias/SchoolTimeline';
import { NewLevantamentoModal } from './components/vistorias/NewLevantamentoModal';
import { InspectionReportModal } from './components/vistorias/InspectionReportModal';
import { OrcamentosView } from './components/orcamentos/OrcamentosView';
import { RotasView } from './components/rotas/RotasView';
import { DemandasView } from './components/demandas/DemandasView';
import { GaleriaView } from './components/galeria/GaleriaView';
import { ConfigView } from './components/config/ConfigView';

export function App() {
  // --- Estados do Storage ---
  const [gres, setGres] = useState<GRE[]>(() => storage.getGREs());
  const [schools, setSchools] = useState<Escola[]>(() => storage.getSchools());
  const [ambientes, setAmbientes] = useState<Ambiente[]>(() => storage.getAmbientes());
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>(() => storage.getOrdensServico());
  const [alertas, setAlertas] = useState<AlertaUrgente[]>(() => storage.getAlertas());
  const [demandas, setDemandas] = useState<Demanda[]>(() => storage.getDemandas());
  const [tarefas, setTarefas] = useState<TarefaDoDia[]>(() => storage.getTarefas());
  const [levantamentos, setLevantamentos] = useState<Levantamento[]>(() => storage.getLevantamentos());
  const [rotas, setRotas] = useState<RotaVistoria[]>(() => storage.getRotas());

  // --- Navegação e Fluxo de Telas ---
  const [activeTab, setActiveTab] = useState<NavTab>('inicio');
  const [subView, setSubView] = useState<'none' | 'orcamentos' | 'rotas'>('none');

  // Navegação no Módulo 1 (Vistorias)
  const [selectedGre, setSelectedGre] = useState<GRE | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<Escola | null>(null);

  // Modais de Vistoria
  const [schoolForNewLevantamento, setSchoolForNewLevantamento] = useState<Escola | null>(null);
  const [reportModalData, setReportModalData] = useState<{ levantamento: Levantamento; school?: Escola } | null>(null);

  // Alvo específico de OS para abrir direto
  const [targetOsId, setTargetOsId] = useState<string | undefined>(undefined);

  // --- Handlers de Alertas ---
  const handleResolverAlerta = (id: string) => {
    const updated = storage.resolverAlerta(id);
    setAlertas(updated);
  };

  const handleAbrirAlerta = (alerta: AlertaUrgente) => {
    if (alerta.linkModulo === 'vistorias' && alerta.targetId) {
      const esc = schools.find(s => s.id === alerta.targetId);
      if (esc) {
        const gre = gres.find(g => g.id === esc.greId);
        if (gre) setSelectedGre(gre);
        setSelectedSchool(esc);
        setActiveTab('vistorias');
        setSubView('none');
        return;
      }
    }

    if (alerta.linkModulo === 'orcamentos') {
      setActiveTab('vistorias');
      setSubView('orcamentos');
      setTargetOsId(alerta.targetId);
      return;
    }

    if (alerta.linkModulo === 'demandas') {
      setActiveTab('demandas');
      setSubView('none');
      return;
    }

    if (alerta.linkModulo === 'rotas') {
      setActiveTab('vistorias');
      setSubView('rotas');
      return;
    }
  };

  // --- Handlers de Tarefas do Dia ---
  const handleToggleTarefa = (id: string) => {
    const updated = storage.toggleTarefa(id);
    setTarefas(updated);
  };

  const handleAddTarefa = (titulo: string, escolaOuLocal: string, horario: string, prioridade: 'urgente' | 'normal') => {
    const updated = storage.addTarefa(titulo, escolaOuLocal, horario, prioridade);
    setTarefas(updated);
  };

  // --- Handlers de GREs e Escolas ---
  const handleToggleFavoriteGre = (greId: string) => {
    const updated = storage.toggleFavoriteGRE(greId);
    setGres(updated);
  };

  const handleSelectGre = (gre: GRE) => {
    setSelectedGre(gre);
    setSelectedSchool(null);
  };

  const handleSelectSchool = (school: Escola) => {
    setSelectedSchool(school);
  };

  // --- Handlers de Ambientes Globais ---
  const handleAddAmbienteGlobal = (nome: string) => {
    const updated = storage.addAmbienteGlobal(nome);
    setAmbientes(updated);
  };

  // --- Handlers de Levantamentos Fotográficos ---
  const handleSalvarLevantamento = (novoLevantamentoData: Omit<Levantamento, 'id'>) => {
    const saved = storage.addLevantamento(novoLevantamentoData);
    setLevantamentos(storage.getLevantamentos());
    setSchools(storage.getSchools());
    setAlertas(storage.getAlertas());
    setDemandas(storage.getDemandas());
    setSchoolForNewLevantamento(null);

    // Abre imediatamente o relatório gerado
    const esc = schools.find(s => s.id === novoLevantamentoData.escolaId);
    setReportModalData({
      levantamento: saved,
      school: esc
    });
  };

  // --- Handlers de Medição de OS ---
  const handleUpdateMedicaoOS = (osId: string, novoPercentual: number, novaObservacao?: string) => {
    const updated = storage.updateMedicaoOS(osId, novoPercentual, novaObservacao);
    setOrdensServico(updated);
  };

  // --- Handlers de Demandas ---
  const handleToggleDemandaConcluida = (id: string) => {
    const updated = storage.toggleDemandaConcluida(id);
    setDemandas(updated);
  };

  const handleDeleteDemanda = (id: string) => {
    const updated = storage.deleteDemanda(id);
    setDemandas(updated);
  };

  const handleAddDemanda = (demanda: Omit<Demanda, 'id' | 'concluida' | 'dataCriacao'>) => {
    const updated = storage.addDemanda(demanda);
    setDemandas(updated);
  };

  // --- Handlers de Rotas ---
  const handleSaveRota = (rota: RotaVistoria) => {
    const updated = storage.saveRota(rota);
    setRotas(updated);
  };

  const handleConcluirRota = (rotaId: string) => {
    const res = storage.concluirRota(rotaId);
    setRotas(res.rotas);
    setSchools(res.schools);
    alert('Rota concluída com sucesso! As visitas e prioridades foram atualizadas no sistema.');
  };

  // --- Reset de Fábrica ---
  const handleResetData = () => {
    storage.resetToDefaults();
    setGres(storage.getGREs());
    setSchools(storage.getSchools());
    setAmbientes(storage.getAmbientes());
    setOrdensServico(storage.getOrdensServico());
    setAlertas(storage.getAlertas());
    setDemandas(storage.getDemandas());
    setTarefas(storage.getTarefas());
    setLevantamentos(storage.getLevantamentos());
    setRotas(storage.getRotas());
    setSelectedGre(null);
    setSelectedSchool(null);
    setActiveTab('inicio');
    setSubView('none');
  };

  // Número de pendências ativas
  const pendenciasCount = demandas.filter(d => !d.concluida).length;
  const osAtivasCount = ordensServico.filter(os => os.status === 'ativa').length;

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex justify-center">
      {/* Moldura do Smartphone Android Moderno */}
      <div className="w-full max-w-md bg-[#090D16] min-h-screen flex flex-col relative shadow-2xl border-x border-white/[0.04]">
        {/* Header Superior Android */}
        <Header
          alertas={alertas}
          onResolverAlerta={handleResolverAlerta}
          onNavigateToTab={(tab) => {
            if (tab === 'orcamentos') {
              setActiveTab('vistorias');
              setSubView('orcamentos');
            } else if (tab === 'rotas') {
              setActiveTab('vistorias');
              setSubView('rotas');
            } else {
              setActiveTab(tab as NavTab);
              setSubView('none');
            }
          }}
        />

        {/* ÁREA DE CONTEÚDO PRINCIPAL COM SCROLL */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-16">
          {/* ======================================= */}
          {/* ABA 1: INÍCIO (DASHBOARD CENTRAL)       */}
          {/* ======================================= */}
          {activeTab === 'inicio' && subView === 'none' && (
            <div className="animate-fadeIn">
              {/* 1. Carrossel Horizontal de Alertas Urgentes (Swipeable) */}
              <UrgentAlertsCarousel
                alertas={alertas}
                onDarOk={handleResolverAlerta}
                onAbrir={handleAbrirAlerta}
              />

              {/* 2. Grid 2x2 com 4 Grandes Botões/Cards Modulares */}
              <ModuleGrid
                onOpenGREs={() => {
                  setActiveTab('vistorias');
                  setSubView('none');
                  setSelectedGre(null);
                  setSelectedSchool(null);
                }}
                onOpenOS={() => {
                  setActiveTab('vistorias');
                  setSubView('orcamentos');
                }}
                onOpenRotas={() => {
                  setActiveTab('vistorias');
                  setSubView('rotas');
                }}
                onOpenDemandas={() => {
                  setActiveTab('demandas');
                  setSubView('none');
                }}
                osAtivasCount={osAtivasCount}
                demandasPendentesCount={pendenciasCount}
              />

              {/* 3. Minhas Tarefas do Dia */}
              <DailyTasksSection
                tarefas={tarefas}
                onToggleTarefa={handleToggleTarefa}
                onAddTarefa={handleAddTarefa}
              />
            </div>
          )}

          {/* ======================================= */}
          {/* SUB-VIEW: MÓDULO 2 - ORÇAMENTOS & OS    */}
          {/* ======================================= */}
          {subView === 'orcamentos' && (
            <div className="animate-fadeIn">
              <OrcamentosView
                ordensServico={ordensServico}
                gres={gres}
                schools={schools}
                onUpdateMedicao={handleUpdateMedicaoOS}
                targetOsId={targetOsId}
              />
            </div>
          )}

          {/* ======================================= */}
          {/* SUB-VIEW: MÓDULO 3 - ROTAS DE VISTORIA  */}
          {/* ======================================= */}
          {subView === 'rotas' && (
            <div className="animate-fadeIn">
              <RotasView
                rotas={rotas}
                schools={schools}
                gres={gres}
                onSaveRota={handleSaveRota}
                onConcluirRota={handleConcluirRota}
              />
            </div>
          )}

          {/* ======================================= */}
          {/* ABA 2: VISTORIAS (MÓDULO 1: 21 GREs)    */}
          {/* ======================================= */}
          {activeTab === 'vistorias' && subView === 'none' && (
            <div className="p-4 animate-fadeIn">
              {!selectedGre && (
                <GreSelector
                  gres={gres}
                  schools={schools}
                  selectedGreId={null}
                  onSelectGre={handleSelectGre}
                  onToggleFavorite={handleToggleFavoriteGre}
                />
              )}

              {selectedGre && !selectedSchool && (
                <SchoolList
                  gre={selectedGre}
                  schools={schools}
                  onBack={() => setSelectedGre(null)}
                  onSelectSchool={handleSelectSchool}
                  onOpenNovoLevantamentoDireto={(esc) => {
                    setSelectedSchool(esc);
                    setSchoolForNewLevantamento(esc);
                  }}
                />
              )}

              {selectedSchool && (
                <SchoolTimeline
                  school={selectedSchool}
                  gre={selectedGre || undefined}
                  levantamentos={storage.getLevantamentosByEscola(selectedSchool.id)}
                  onBack={() => setSelectedSchool(null)}
                  onNovoLevantamento={() => setSchoolForNewLevantamento(selectedSchool)}
                  onVisualizarLevantamento={(lev) => {
                    setReportModalData({
                      levantamento: lev,
                      school: selectedSchool
                    });
                  }}
                  onVerOS={(osId) => {
                    setSubView('orcamentos');
                    setTargetOsId(osId);
                  }}
                />
              )}
            </div>
          )}

          {/* ======================================= */}
          {/* ABA 3: CENTRAL DE DEMANDAS              */}
          {/* ======================================= */}
          {activeTab === 'demandas' && subView === 'none' && (
            <div className="animate-fadeIn">
              <DemandasView
                demandas={demandas}
                schools={schools}
                onToggleConcluida={handleToggleDemandaConcluida}
                onDeleteDemanda={handleDeleteDemanda}
                onAddDemanda={handleAddDemanda}
              />
            </div>
          )}

          {/* ======================================= */}
          {/* ABA 4: GALERIA DE EVIDÊNCIAS            */}
          {/* ======================================= */}
          {activeTab === 'galeria' && subView === 'none' && (
            <div className="animate-fadeIn">
              <GaleriaView
                fotos={storage.getAllFotos()}
                ambientes={ambientes}
              />
            </div>
          )}

          {/* ======================================= */}
          {/* ABA 5: CONFIGURAÇÕES                    */}
          {/* ======================================= */}
          {activeTab === 'config' && subView === 'none' && (
            <div className="animate-fadeIn">
              <ConfigView onResetData={handleResetData} />
            </div>
          )}
        </main>

        {/* BARRA DE NAVEGAÇÃO INFERIOR FIXA */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
            setSubView('none');
          }}
          pendenciasCount={pendenciasCount}
        />

        {/* MODAL: NOVO LEVANTAMENTO FOTOGRÁFICO */}
        {schoolForNewLevantamento && (
          <NewLevantamentoModal
            school={schoolForNewLevantamento}
            ambientes={ambientes}
            onAddAmbienteGlobal={handleAddAmbienteGlobal}
            onSalvarLevantamento={handleSalvarLevantamento}
            onClose={() => setSchoolForNewLevantamento(null)}
          />
        )}

        {/* MODAL: RELATÓRIO VISUAL AUTOMÁTICO DO LAUDO */}
        {reportModalData && (
          <InspectionReportModal
            levantamento={reportModalData.levantamento}
            school={reportModalData.school}
            ambientes={ambientes}
            onClose={() => setReportModalData(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
