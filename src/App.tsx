import React, { useState, useEffect, useRef, useCallback } from 'react';
import { App as CapApp } from '@capacitor/app';
import { storage } from './services/storageService';
import { syncInepFromGoogleSheets } from './services/sheetsSyncService';
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
import { UpdateModal } from './components/UpdateModal';
import { checkForUpdate, VersionMetadata, AppInfo } from './utils/appUpdater';

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
  const [tabHistory, setTabHistory] = useState<NavTab[]>(['inicio']);
  const [subView, setSubView] = useState<'none' | 'orcamentos' | 'rotas'>('none');
  const [showExitToast, setShowExitToast] = useState(false);
  const lastBackPressRef = useRef<number>(0);

  // Navegador de Abas com registro de histórico
  const handleNavigateTab = (tab: NavTab) => {
    if (tab !== activeTab) {
      setTabHistory(prev => [...prev, tab]);
      setActiveTab(tab);
    }
    setSubView('none');
  };

  // Navegação no Módulo 1 (Vistorias)
  const [selectedGre, setSelectedGre] = useState<GRE | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<Escola | null>(null);

  // Seletores de GRE para os módulos Demandas, Orçamentos e Rotas
  const [selectedDemandasGre, setSelectedDemandasGre] = useState<GRE | null>(null);
  const [selectedOrcamentosGre, setSelectedOrcamentosGre] = useState<GRE | null>(null);
  const [selectedRotasGre, setSelectedRotasGre] = useState<GRE | null>(null);

  // Modais de Vistoria
  const [schoolForNewLevantamento, setSchoolForNewLevantamento] = useState<Escola | null>(null);
  const [reportModalData, setReportModalData] = useState<{ levantamento: Levantamento; school?: Escola } | null>(null);

  // Alvo específico de OS para abrir direto
  const [targetOsId, setTargetOsId] = useState<string | undefined>(undefined);

  // --- Estado do Modal de Atualização OTA ---
  const [updateModalData, setUpdateModalData] = useState<{
    metadata: VersionMetadata;
    installedInfo: AppInfo;
  } | null>(null);

  // Checagem silenciosa de atualização OTA após 8 segundos da abertura
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await checkForUpdate();
        if (res.hasUpdate && res.metadata) {
          setUpdateModalData({
            metadata: res.metadata,
            installedInfo: res.installed
          });
        }
      } catch (err) {
        console.warn('Checagem OTA em background:', err);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  // --- Gestão Inteligente do Botão / Gesto Voltar (Android & Navegador) ---
  const handleGlobalBack = useCallback((): boolean => {
    // 1. Modais têm prioridade máxima de fechamento
    if (reportModalData) {
      setReportModalData(null);
      return true;
    }
    if (schoolForNewLevantamento) {
      setSchoolForNewLevantamento(null);
      return true;
    }
    if (updateModalData) {
      setUpdateModalData(null);
      return true;
    }

    // 2. Se estiver no perfil de uma escola (Vistorias), volta para a lista da GRE
    if (selectedSchool) {
      setSelectedSchool(null);
      return true;
    }

    // 3. Se estiver na lista de escolas de uma GRE (Vistorias), volta para o seletor das 21 GREs
    if (selectedGre) {
      setSelectedGre(null);
      return true;
    }

    // 4. Se estiver em Rotas com GRE selecionada, volta para o seletor de GRE de Rotas
    if (subView === 'rotas') {
      if (selectedRotasGre) {
        setSelectedRotasGre(null);
        return true;
      }
      setSubView('none');
      return true;
    }

    // 5. Se estiver em Orçamentos com GRE selecionada, volta para o seletor de GRE de Orçamentos
    if (subView === 'orcamentos') {
      if (selectedOrcamentosGre) {
        setSelectedOrcamentosGre(null);
        return true;
      }
      setSubView('none');
      return true;
    }

    // 6. Se estiver na Central de Demandas com uma GRE selecionada, volta para o seletor de GRE de Demandas
    if (activeTab === 'demandas' && selectedDemandasGre) {
      setSelectedDemandasGre(null);
      return true;
    }

    // 7. Se estiver em uma subview genérica, fecha a subview
    if (subView !== 'none') {
      setSubView('none');
      return true;
    }

    // 8. Se estiver em outra aba que não seja a 'inicio', volta para a última aba visitada
    if (activeTab !== 'inicio') {
      setTabHistory(prev => {
        if (prev.length > 1) {
          const newHistory = [...prev];
          newHistory.pop();
          const prevTab = newHistory[newHistory.length - 1] || 'inicio';
          setActiveTab(prevTab);
          return newHistory;
        } else {
          setActiveTab('inicio');
          return ['inicio'];
        }
      });
      return true;
    }

    // 9. Está na aba inicial ('inicio') e na tela inicial do app:
    // Regra do duplo toque para sair!
    const now = Date.now();
    if (now - lastBackPressRef.current < 2000) {
      // Pressionou duas vezes rapidamente: sai do aplicativo
      try {
        CapApp.exitApp();
      } catch (err) {
        console.warn('exitApp falhou:', err);
      }
      return true;
    } else {
      lastBackPressRef.current = now;
      setShowExitToast(true);
      setTimeout(() => {
        setShowExitToast(false);
      }, 2000);
      return true;
    }
  }, [
    reportModalData,
    schoolForNewLevantamento,
    updateModalData,
    selectedSchool,
    selectedGre,
    selectedDemandasGre,
    selectedOrcamentosGre,
    selectedRotasGre,
    subView,
    activeTab
  ]);

  // Listener para capturar o Hardware / Gesture Back Button no Android e PopState no Navegador
  useEffect(() => {
    let backListener: any = null;

    const setupBackListener = async () => {
      try {
        backListener = await CapApp.addListener('backButton', () => {
          handleGlobalBack();
        });
      } catch (err) {
        console.warn('Capacitor App listener não disponível:', err);
      }
    };

    setupBackListener();

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      handleGlobalBack();
      window.history.pushState(null, '', window.location.pathname);
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      if (backListener && typeof backListener.remove === 'function') {
        backListener.remove();
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleGlobalBack]);

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

  const handleAddSchool = (newSchool: Omit<Escola, 'id'>) => {
    const updated = storage.addSchool(newSchool);
    setSchools(updated);
  };

  const handleUpdateSchool = (updatedSchool: Escola) => {
    const updated = storage.updateSchool(updatedSchool);
    setSchools(updated);
    setSelectedSchool(updatedSchool);
  };

  const handleDeleteLevantamentos = (ids: string[]) => {
    const updated = storage.deleteLevantamentos(ids);
    setLevantamentos(updated);
  };

  const handleSyncSchools = async (): Promise<number> => {
    const imported = await syncInepFromGoogleSheets();
    const updated = storage.syncSchoolsFromInep(imported);
    setSchools(updated);
    return imported.length;
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

  const handleSaveOS = (os: OrdemServico) => {
    const list = storage.getOrdensServico();
    const exists = list.some(item => item.id === os.id);
    const updated = exists ? list.map(item => item.id === os.id ? os : item) : [os, ...list];
    try {
      localStorage.setItem('seduc_fiscal_os_v1', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
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
          subViewTitle={
            subView === 'orcamentos'
              ? 'Orçamentos, OS e Medições'
              : subView === 'rotas'
              ? 'Rotas de Vistoria IA'
              : null
          }
          onBackFromSubView={() => setSubView('none')}
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
                selectedGre={selectedOrcamentosGre}
                onSelectGre={setSelectedOrcamentosGre}
                onUpdateMedicao={handleUpdateMedicaoOS}
                targetOsId={targetOsId}
                onBack={() => {
                  if (selectedOrcamentosGre) {
                    setSelectedOrcamentosGre(null);
                  } else {
                    setSubView('none');
                  }
                }}
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
                selectedGre={selectedRotasGre}
                onSelectGre={setSelectedRotasGre}
                onSaveRota={handleSaveRota}
                onConcluirRota={handleConcluirRota}
                onSelectSchool={(school) => {
                  const targetGre = gres.find(g => g.id === school.greId) || null;
                  setSelectedGre(targetGre);
                  setSelectedSchool(school);
                  setSubView('none');
                  setActiveTab('vistorias');
                }}
              />
            </div>
          )}

          {/* ======================================= */}
          {/* ABA 2: VISTORIAS (MÓDULO 1: 21 GREs)    */}
          {/* ======================================= */}
          {activeTab === 'vistorias' && subView === 'none' && (
            <div className="p-2.5 sm:p-4 animate-fadeIn">
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
                  onAddSchool={handleAddSchool}
                  onSyncFromSheets={handleSyncSchools}
                />
              )}

              {selectedSchool && (
                <SchoolTimeline
                  school={selectedSchool}
                  gre={selectedGre || undefined}
                  levantamentos={levantamentos.filter(l => l.escolaId === selectedSchool.id)}
                  onBack={() => setSelectedSchool(null)}
                  onNovoLevantamento={() => setSchoolForNewLevantamento(selectedSchool)}
                  onVisualizarLevantamento={(lev) => {
                    setReportModalData({
                      levantamento: lev,
                      school: selectedSchool
                    });
                  }}
                  onUpdateSchool={handleUpdateSchool}
                  onDeleteLevantamentos={handleDeleteLevantamentos}
                  onVerOS={(osId) => {
                    setSubView('orcamentos');
                    setTargetOsId(osId);
                  }}
                  ordensServico={ordensServico}
                  onSaveOS={handleSaveOS}
                  onUpdateMedicaoOS={handleUpdateMedicaoOS}
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
                gres={gres}
                selectedGre={selectedDemandasGre}
                onSelectGre={setSelectedDemandasGre}
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
              <ConfigView
                onResetData={handleResetData}
                onOpenUpdateModal={(metadata, installedInfo) =>
                  setUpdateModalData({ metadata, installedInfo })
                }
              />
            </div>
          )}
        </main>

        {/* BARRA DE NAVEGAÇÃO INFERIOR FIXA */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={handleNavigateTab}
          pendenciasCount={pendenciasCount}
        />

        {/* TOAST DE FEEDBACK DE DUPLO TOQUE PARA SAIR */}
        {showExitToast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-full border border-slate-700 shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fadeIn pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Pressione novamente para sair do aplicativo</span>
          </div>
        )}

        {/* MODAL: ATUALIZAÇÃO AUTOMÁTICA OTA */}
        {updateModalData && (
          <UpdateModal
            metadata={updateModalData.metadata}
            installedInfo={updateModalData.installedInfo}
            onClose={() => setUpdateModalData(null)}
          />
        )}

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
