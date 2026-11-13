# PONTOS DE RESTAURAÇÃO DE TRILHO DUPLO — FISCALIZAÇÃO SEDUC (GPR LAB)

Este documento registra oficialmente todos os **Pontos de Restauração (PR)** estruturados sob a arquitetura de **Trilho Duplo** do aplicativo Fiscalização SEDUC (GPR Lab), garantindo isolamento técnico rigoroso entre a visualização de **Computador (Desktop)** e de **Celular (Mobile / Android)**.

---

## 🏛 DIRETRIZES DA ARQUITETURA DE TRILHO DUPLO

### 1. Isolamento Técnico Estrito (Desktop vs Mobile)
- **Foco Primário:** Uso operacional exclusivo no **smartphone Android** pelo engenheiro/fiscal em campo.
- **Visualização Web / Desktop:** Permite acompanhamento na sede da SEDUC ou escritório do GPR Lab via navegador (Vercel).
- **Mobile First Nativo:** Viewport moderno com Safe Area, Status Bar escura, microinterações a 60fps, acesso à câmera e clipboard.

### 2. Estrutura e Escopos de Cada Ponto de Restauração (PR.00X)
A numeração segue rigorosamente a hierarquia de escopo:

- **`PR.00X` — Escopo Geral do Projeto (Universal):**
  - **Quando é acionado:** Ajustes gerais no projeto (banco de dados, regras de negócios globais, seed data das 21 GREs, modelos de IA, rotas e sincronização).
- **`PR.00X.1` — Escopo Específico de Computador (Desktop):**
  - **Quando é acionado:** Visualização expandida em monitores grandes, cabeçalhos de alta resolução e relatórios impressos.
- **`PR.00X.2` — Escopo Específico de Celular (Mobile / APK Android):**
  - **Quando é acionado:** Adaptações ergonômicas para uso com uma mão, gavetas, carrossel horizontal swipeable, botões táteis e empacotamento Capacitor.

### 3. Regra de Ouro (Isolamento de Dados vs Estrutura)
- **O que entra na restauração:** Toda a estrutura de código (TypeScript, CSS Glassmorphism, Layouts, Componentes, Workflows).
- **O que NUNCA é apagado:** Dados cadastrados em vistorias de campo, fotos tiradas, relatórios no `localStorage` e banco offline.

---

## 📋 HISTÓRICO DE PONTOS DE RESTAURAÇÃO

### [PR.018] — Módulo de Rotas Inteligentes: Sub-Abas (Trajeto vs Prioridade), Seletor de GREs, Diárias (1.5 a 4.5), Trava Anti-Sobrecarga (140 km/h) & Exportação WhatsApp
- **Data/Hora:** 2026-11-13 00:25 (UTC-3)
- **Escopos Definidos:**
  - `PR.018` (Geral): Implantação completa da arquitetura do Super Prompt de Rotas Inteligentes de Vistoria (`rotasEngine.ts` e `RotasView.tsx`). Sub-abas `Rota por Trajeto` (otimização geográfica de corredor contínuo e menor tempo de rodovia) e `Rota por Prioridade` (matriz hierárquica e análise técnica). Origem fixa em Teresina - PI e seletor com as 21 GREs oficiais do Piauí com identificação automática da Cidade-Polo da regional. Seletor de diárias com 4 opções exatas (`1.5`, `2.5`, `3.5` e `4.5` diárias) respeitando janelas de horário rígidas: bate e volta até 22:00h no modo 1.5; chegada na Cidade-Polo entre 19:00h e 20:00h para jantar e pernoite nos modos 2.5, 3.5 e 4.5. Física de deslocamento baseada em caminhonete S10/Hilux a 140 km/h de cruzeiro rodoviário com trava anti-sobrecarga matemática que corta inclusão de novas escolas quando o tempo estoura o limite. Matriz hierárquica: Arielma (Superintendente - Grau 3 fixo), Anik (Diretora - Grau 2 fixo), Naila (Gerente - Grau 1 fixo) e Diretora da Escola (grau dinâmico cruzado com o relatório técnico de obras). Compatibilização em 4 níveis (Urgente, Prioridade, Requer Atenção e Razoável) e degradação obrigatória de criticidade. Exportação e formatação oficial do itinerário com cópia em 1 clique para WhatsApp.
  - `PR.018.1` (Desktop / Web): Visualização executiva com KPI cards de Km rodado, tempo de rodovia a 140 km/h, total de escolas na rota, pernoite na sede regional e horário final de retorno a Teresina. Modal de seleção rápida das 21 GREs com filtro em tempo real. Botão "Ver Unidade" em cada parada da escola que abre instantaneamente a visualização detalhada e vistoria da escola.
  - `PR.018.2` (Mobile / Android): Layout responsivo otimizado para smartphone de campo, microinterações a 60fps nas sub-abas, botão flutuante e de topo para exportar roteiro para o WhatsApp, links diretos para abrir o Google Maps de cada escola da rota, sincronização Capacitor e geração do instalador nativo **`Fiscal.IA.apk`** v1.0.13 (Build 14).
- **Tags Git:** `PR.018`, `PR.018.1`, `PR.018.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.018
  ```

---

### [PR.017] — Integração Completa da Ata de Manutenção SEDUC (2.850 Ordens de Serviço), Sincronização ao Vivo & Gestão Híbrida
- **Data/Hora:** 2026-11-12 23:55 (UTC-3)
- **Escopos Definidos:**
  - `PR.017` (Geral): Integração oficial da planilha da Ata de Manutenção da SEDUC Piauí (`gid=671056752`), processando e estruturando **2.850 Ordens de Serviço reais** vinculadas univocamente às escolas do aplicativo (251 obras em execução ativa e 2.599 no histórico de concluídas). Implementação de sincronização ao vivo direta com o Google Sheets através de `syncAtaFromGoogleSheets` no `sheetsSyncService.ts`. Criação do banco offline local `ordensServicoAta.json` e migração da chave de storage para `seduc_fiscal_os_v2`.
  - `PR.017.1` (Desktop / Web): Atualização da tela `OrcamentosView` com contadores em tempo real para "Com OS Ativa" e "Histórico de OS", botão de sincronização ao vivo do Google Sheets, modal de documentos atualizado e busca integrada por escola, construtora e número da OS.
  - `PR.017.2` (Mobile / Android): No perfil de cada escola (`SchoolTimeline.tsx`), exibição da nova seção `SchoolOSSection` com as obras ativas e concluídas daquela unidade, medição física ajustável, download de documentos oficiais, modal `AttachOSModal` para upload de PDF e vinculação de pastas do Google Drive, e geração do novo APK nativo **`Fiscal.IA.apk`** v1.0.12 (Build 13).
- **Tags Git:** `PR.017`, `PR.017.1`, `PR.017.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.017
  ```

---

### [PR.016] — Geolocalizações do PDF (08ª e 15ª GREs), Botão Vidro Translúcido, Módulo Híbrido de OS, Orçamentos e Histórico
- **Data/Hora:** 2026-11-12 23:15 (UTC-3)
- **Escopos Definidos:**
  - `PR.016` (Geral): Extração de 100% das 53 escolas e sedes da 08ª e 15ª GREs do PDF oficial `GEOCALIZAÇÃO_DAS_ESCOLAS.pdf` com integração unívoca por INEP e links diretos ao Google Maps. Criação da fonte mestra `schoolsGeodataConfig.json` e `ordensServicoConfig.json`. Unificação definitiva do cabeçalho superior para **`Fiscal.IA.lab - GPR`**. Redesign de alta precisão do botão **`Novo Relatório Fotográfico`** em vidro meio transparente com borda prismática e reflexo superior chanfrado sem o `+`. Implantação da nova seção **`SchoolOSSection`** no perfil de cada escola com abas de OSs em Execução e Histórico Concluído, barra de medição física interativa e modal híbrido **`AttachOSModal`** para download direto, upload manual de PDF (OS e Orçamento Descritivo) e vinculação de pastas do Google Drive.
  - `PR.016.1` (Desktop / Web): Visualização expandida de contratos e orçamentos, alternância entre Planilha Orçamentária, Memorial Descritivo e OS no modal de prévia, e sincronização contínua com banco local.
  - `PR.016.2` (Mobile / Android): Upload local de PDFs direto pelo celular com armazenamento offline, link direto para pastas do Drive, abertura com 1 toque no Google Maps, compilação nativa via Gradle e geração do instalador **`Fiscal.IA.apk`** v1.0.11 (Build 12).
- **Tags Git:** `PR.016`, `PR.016.1`, `PR.016.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.016
  ```

---

### [PR.015] — Engrenagem de Configurações da Escola, Cabeçalho Fiscaliz.IA.lab, Botão Vidro Furtacor & Exclusão Múltipla
- **Data/Hora:** 2026-11-12 02:01 (UTC-3)
- **Escopos Definidos:**
  - `PR.015` (Geral): Atualização do cabeçalho principal para exibir **Fiscaliz.IA.lab** (`GPR`) em vez de "Fiscalização". Inclusão de botão com ícone de engrenagem (`Settings`) no canto superior direito da tela da escola (`SchoolTimeline.tsx`) abrindo `EditSchoolModal.tsx` para edição persistente de nome da diretora, telefone, endereço, localização GPS (com captura direta pelo dispositivo) e observações adicionais. Inclusão inicial de **676 Plus Codes** da aba `DADOS INEP` com botão "Abrir Mapa". Redesign do botão principal para **`Novo Relatório Fotográfico`** (sem `+`) em efeito vidro fosco translúcido e borda furtacor minimalista (laranja, dourado, verde e azul). Implementação de pressionamento longo (Long Press) nos cards de relatórios para habilitar seleção múltipla e exclusão em lote via botão de lixeira.
  - `PR.015.1` (Desktop / Web): Suporte a seleção múltipla via pressionamento longo ou botão direito do mouse, edição de dados escolares e links rápidos para mapas.
  - `PR.015.2` (Mobile / Android): Feedback tátil (`navigator.vibrate`) ao iniciar menu de seleção dos relatórios, captura GPS em campo e APK v1.0.10 (Build 11) assinado com keystore unificada.
- **Tags Git:** `PR.015`, `PR.015.1`, `PR.015.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk` e `app-release.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.015
  ```

---

### [PR.014] — Integração Planilha DADOS INEP (703 Unidades EM USO), Lista INEP/Escola/Município & Cadastro Manual
- **Data/Hora:** 2026-11-12 01:02 (UTC-3)
- **Escopos Definidos:**
  - `PR.014` (Geral): Integração oficial da aba `DADOS INEP` (Google Sheets `gid=89902018`) com extração e filtro rigoroso da Coluna F (`SITUAÇÃO IMÓVEL === "EM USO"`), totalizando 703 unidades reais ativas em todas as 21 GREs do Piauí disponíveis 100% offline em `src/data/inepSchools.json`, além de sincronização online direta via `sheetsSyncService.ts`. Lista limpa das escolas exibida na sequência exata: **1. INEP** (Coluna A), **2. Nome Entidade** (Coluna K) e **3. Município** (Coluna J). Novo modal `AddSchoolModal.tsx` acionado pelo botão **"+ Adicionar Escola"** dentro de cada GRE, com salvamento persistente e vinculação automática ao fluxo de vistoria/levantamento da unidade escolar (`SchoolTimeline`). Alinhamento das nomenclaturas da Capital/Grande Teresina (`04ª Teresina Centro/Norte`, `18ª Grande Teresina`, `19ª Teresina Sul`, `20ª Teresina Leste`, `21ª Teresina Sudeste`) conforme a base oficial.
  - `PR.014.1` (Desktop / Web): Navegação encadeada fluida GRE -> Escolas EM USO -> Levantamento e suporte a busca/filtro por município no navegador.
  - `PR.014.2` (Mobile / Android): Operação offline-first instantânea com todas as 703 unidades em uso carregadas localmente no APK v1.0.9 (Build 10), keystore unificada e auto-atualização OTA in-app.
- **Tags Git:** `PR.014`, `PR.014.1`, `PR.014.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk` e `app-release.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.014
  ```

---

### [PR.013] — Borda Furtacor Minimalista (Laranja, Dourado, Verde e Azul — Sem Rosa/Roxo)
- **Data/Hora:** 2026-11-10 02:46 (UTC-3)
- **Escopos Definidos:**
  - `PR.013` (Geral): Calibração refinada e minimalista da borda furtacor dos cards das 21 GREs: composta estritamente pelas tonalidades de Laranja (infraestrutura e calor), Dourado/Âmbar (sol piauiense), Verde (esmeralda e bandeira do Piauí) e Azul/Ciano (águas e tecnologia), removendo 100% de tons de rosa, roxo, magenta ou lilás. Efeito iridescente equilibrado e sóbrio com pulsação suave em luz quente e ciano pericial.
  - `PR.013.1` (Desktop / Web): Adaptação minimalista da paleta furtacor nos tokens e anéis cósmicos institucionais.
  - `PR.013.2` (Mobile / Android): Visualização sóbria e corporativa para engenharia em campo, APK v1.0.8 (Build 9) com auto-atualização OTA e keystore unificada.
- **Tags Git:** `PR.013`, `PR.013.1`, `PR.013.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk` e `app-release.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.013
  ```

---

### [PR.012] — Cards Redondos com Borda Furtacor Holográfica & Números das GREs Ampliados
- **Data/Hora:** 2026-11-10 02:39 (UTC-3)
- **Escopos Definidos:**
  - `PR.012` (Geral): Redesenho completo dos cards do Seletor de GREs para o formato perfeitamente circular/redondo (`rounded-full aspect-square`) em 4 colunas, com borda furtacor iridescente em 360º (`conic-gradient` passando por ciano, âmbar, rosa neon e violeta cósmico). Tipografia dos números das gerências ampliada com destaque pesado e sombra de profundidade ("01ª GRE" a "21ª GRE"), sede em dourado âmbar radiante com quebra de linha harmoniosa e brasão da SEDUC / Governo do Piauí alinhado à base do círculo. Animação de rotação de matiz iridescente quando a GRE é selecionada.
  - `PR.012.1` (Desktop / Web): Adaptação dos círculos holográficos com reflexo vítreo superior em alta resolução.
  - `PR.012.2` (Mobile / Android): Ergonomia e toque circular suave a 60fps no celular, APK v1.0.7 (Build 8) assinado com keystore única e auto-atualização OTA in-app.
- **Tags Git:** `PR.012`, `PR.012.1`, `PR.012.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk` e `app-release.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.012
  ```

---

### [PR.011] — Seletor de GREs em 4 Colunas com Botões Ampliados & Proporcionais
- **Data/Hora:** 2026-11-10 02:32 (UTC-3)
- **Escopos Definidos:**
  - `PR.011` (Geral): Reorganização estrutural da matriz do Seletor de GREs para 4 colunas (`grid-cols-4`), distribuindo as 21 GREs com botões ampliados e ergonômicos adaptados com perfeição à largura do smartphone Android. Escalonamento proporcional de todos os elementos: números das gerências maiores e em negrito puro ("01ª GRE" a "21ª GRE"), nomes das sedes ampliados em dourado âmbar radiante com quebra de linha preservada, e miniatura oficial da SEDUC / Governo do Piauí aumentada na base.
  - `PR.011.1` (Desktop / Web): Distribuição refinada em 4 colunas com adaptação equilibrada a telas responsivas.
  - `PR.011.2` (Mobile / Android): Área de toque (touch target) ampliada e confortável para uso com uma mão em campo, APK v1.0.6 (Build 7) gerado com keystore unificada e auto-atualização OTA in-app.
- **Tags Git:** `PR.011`, `PR.011.1`, `PR.011.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk` e `app-release.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.011
  ```

---

### [PR.010] — Novo Modelo Visual dos Cards das GREs (Aro Neon Cósmico), Correção das Sedes & Quebra de Linha
- **Data/Hora:** 2026-11-10 02:28 (UTC-3)
- **Escopos Definidos:**
  - `PR.010` (Geral): Novo design dos cards do Seletor de GREs inspirado no modelo institucional circular/cósmico com halo luminoso neon âmbar/ouro, fundo azul marinho profundo, número da GRE em destaque branco puro ("01ª GRE" a "21ª GRE"), nome do município sede em dourado âmbar radiante com quebra de linha inteligente para leitura completa sem truncar nomes extensos (São João do Piauí, São Raimundo Nonato, Valença do Piauí, etc.) e logo oficial da SEDUC / Governo do Piauí na base. Correção oficial das sedes das gerências: 09ª GRE é Picos, 10ª GRE é Floriano e 11ª GRE é Uruçuí.
  - `PR.010.1` (Desktop / Web): Adaptação do Grid 5x5 para telas maiores com transição fluida para a listagem das escolas da GRE selecionada.
  - `PR.010.2` (Mobile / Android): Visualização perfeita sem cortes e sem necessidade de scroll no smartphone, APK v1.0.5 (Build 6) assinado com keystore unificada e suporte a auto-atualização OTA in-app.
- **Tags Git:** `PR.010`, `PR.010.1`, `PR.010.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk` e `app-release.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.010
  ```

---

### [PR.009] — Menu Compacto das 21 GREs (Grid 5x5 Fiel ao Modelo) & Correção de Safe Area / Status Bar
- **Data/Hora:** 2026-11-08 16:46 (UTC-3)
- **Escopos Definidos:**
  - `PR.009` (Geral): Novo menu de seleção das 21 GREs em formato de matriz Grid 5x5 hipercompacto, idêntico ao modelo fotográfico enviado pelo usuário. Cada card possui a logomarca oficial da SEDUC no topo, número em destaque ("01ª GRE" a "21ª GRE"), município sede, efeito luminoso de onda neon laranja na base e selo circular de checkmark ativo. Cadastro de escolas públicas estaduais para todas as 21 GREs do Piauí e dinâmica encadeada de navegação (Seleção da GRE -> Lista de Escolas da GRE -> Vistoria, laudos técnicos, câmera com IA e levantamento).
  - `PR.009.1` (Desktop / Web): Adaptação responsiva dos cards com efeito glassmorphism e navegação ágil entre as gerências e suas respectivas unidades escolares.
  - `PR.009.2` (Mobile / Android): Correção definitiva da Safe Area e Status Bar: o aplicativo agora respeita estritamente a barra de status do sistema (`StatusBar.setOverlaysWebView({ overlay: false })`), impedindo qualquer sobreposição sobre a hora, bateria e Wi-Fi. Versão oficial atualizada para v1.0.4 (Build 5).
- **Tags Git:** `PR.009`, `PR.009.1`, `PR.009.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk` e `app-release.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.009
  ```

---

### [PR.008] — Resolução de Conflito de Instalação: Fechamento do App & Keystore Unificada
- **Data/Hora:** 2026-11-08 16:02 (UTC-3)
- **Escopos Definidos:**
  - `PR.008` (Geral): Resolução definitiva do conflito de instalação e bloqueio de atualização do pacote Android. Criação e amarração da Keystore criptográfica única compartilhada (`android/app/fiscalia.keystore`) para garantir assinatura idêntica em qualquer build (local e CI/CD).
  - `PR.008.1` (Desktop / Web): Atualização de `src/utils/appUpdater.ts` e `UpdateModal.tsx` com opção de download pelo sistema e encerramento automático do aplicativo.
  - `PR.008.2` (Mobile / Android): Implementação do encerramento forçado do processo (`finishAffinity()` + `System.exit(0)`) logo após disparar o instalador nativo do Android, liberando 100% dos locks de arquivos, e novo método `downloadViaSystemAndCloseApp` para download independente em segundo plano pela cortina de notificações.
- **Tags Git:** `PR.008`, `PR.008.1`, `PR.008.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk` e `app-release.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.008
  ```

---

### [PR.007] — Módulo de Vistorias: Câmera Nativa Direta, Compressão 60fps & Tags Patológicas SEDUC
- **Data/Hora:** 2026-11-08 15:54 (UTC-3)
- **Escopos Definidos:**
  - `PR.007` (Geral): Configuração aprofundada do Módulo de Vistorias com acionamento nativo direto da Câmera traseira do smartphone Android (`capture="environment"`), motor de compressão client-side em Canvas (reduzindo fotos de 8MB para ~180KB com preservação de detalhes periciais) e catálogo de tags rápidas de patologias escolares da SEDUC Piauí (fissuras a 45º, infiltração, elétrica e sanitários) para preenchimento com 1 toque e refinamento via IA.
  - `PR.007.1` (Desktop / Web): Suporte responsivo com opções de Galeria, Câmera e simulação realista para navegadores de desenvolvimento.
  - `PR.007.2` (Mobile / Android): Integração direta com a câmera nativa do Android sem intermediários, persistência leve em localStorage/SQLite sem travamentos, e APK v1.0.2 (Build 3) compilado e publicado na Release `apk-latest`.
- **Tags Git:** `PR.007`, `PR.007.1`, `PR.007.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk` e `app-release.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.007
  ```

---

### [PR.006] — Padronização do Sistema Mestre: Compilação Contínua e Auto-Update Silencioso (CI/CD + OTA In-App)
- **Data/Hora:** 2026-11-08 15:31 (UTC-3)
- **Escopos Definidos:**
  - `PR.006` (Geral): Reestruturação e padronização integral dos 5 componentes do Prompt Mestre: `version.json` unificado na raiz e `public/`, Workflow GitHub Actions com compilação dinâmica e publicação simultânea de `Fiscal.IA.apk` e `app-release.apk` na release `apk-latest`.
  - `PR.006.1` (Desktop / Web): Métodos universais `checkForAppUpdates` e `downloadAndInstallUpdate` em `appUpdater.ts` sem cabeçalhos de CORS bloqueantes e suporte a todos os parâmetros técnicos solicitados.
  - `PR.006.2` (Mobile / Android): Plugin nativo `AppUpdateManagerPlugin.java` com métodos nativos `getAppVersion`, `checkInstallPermission`, `requestInstallPermission` e `downloadAndInstall` com stream assíncrono em thread, redirecionamento HTTP 301/302/307/308 para AWS S3, notificação de progresso `percent` em tempo real e invocação de `FileProvider` (`ACTION_VIEW`).
- **Tags Git:** `PR.006`, `PR.006.1`, `PR.006.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk` e `app-release.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.006
  ```

---

### [PR.005] — OTA Auto-Update In-App & Pipeline CI/CD GitHub Actions
- **Data/Hora:** 2026-11-08 15:27 (UTC-3)
- **Escopos Definidos:**
  - `PR.005` (Geral): Implantação da arquitetura completa de auto-atualização contínua Over-The-Air (OTA) sem intermediação de lojas de aplicativos. Fonte única de verdade de controle semântico de versão (`version.json` e `public/version.json`) com build dinâmico.
  - `PR.005.1` (Desktop / Web): Módulo cliente TypeScript (`appUpdater.ts`) com verificação em background com anti-cache query string na CDN Fastly do GitHub, temporizador de 8 segundos na inicialização e verificação manual em Configurações.
  - `PR.005.2` (Mobile / Android): Plugin nativo Android Java (`AppUpdateManagerPlugin.java`) registrado no Capacitor (`MainActivity.java`), gestão de permissões `REQUEST_INSTALL_PACKAGES`, download em background com suporte a redirects de CDN (`HttpURLConnection`), eventos de progresso `downloadProgress` em tempo real, disparo nativo com `FileProvider` (`ACTION_VIEW`), e modal de atualização `UpdateModal.tsx` com barra de progresso em cápsula neon e notas de versão.
- **Tags Git:** `PR.005`, `PR.005.1`, `PR.005.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.005
  ```

---

### [PR.004] — Refinamento Visual Fiel à Imagem de Referência: Orçamentos, OS e Medições
- **Data/Hora:** 2026-11-08 15:15 (UTC-3)
- **Escopos Definidos:**
  - `PR.004` (Geral): Refinamento visual e funcional idêntico ao mockup oficial (`media_1794160911533_3d46f9d1.png`). Módulo de Orçamentos, OS e Medições alinhado com GRE 01 e Teresina, cadastro de U. E. João Clímaco d'Almeida (OS 140/2026-SEDUC a 65% medido) e U. E. Dep. Pinheiro Machado (OS 141/2026-SEDUC a 40% medido).
  - `PR.004.1` (Desktop / Web): Header contextual dinâmico para subviews com seta voltar (`←`), título e menu (`⋮`), e modal unificado de documentos com alternância instantânea entre Planilha Orçamentária e Memorial Descritivo.
  - `PR.004.2` (Mobile / Android): Cápsula de medição neon turquesa com brilho glow (`shadow-[0_0_18px_rgba(6,182,212,0.45)]`), barra de progresso com gradiente dourado e texto centralizado ("65% Medido"), link turquesa brilhante com botão estilizado `[PDF]`, controles táteis para aferição de medição e ajuste na 5ª aba para "Configurações".
- **Tags Git:** `PR.004`, `PR.004.1`, `PR.004.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.004
  ```

---

### [PR.003] — Identidade Visual Oficial: Ícone 3D (Capacete SEDUC Piauí) & Header Dual-Logo
- **Data/Hora:** 2026-11-08 06:00 (UTC-3)
- **Escopos Definidos:**
  - `PR.003` (Geral): Novo ícone 3D oficial implementado na web, favicon e PWA com capacete branco da SEDUC Piauí, prancheta de fiscalização e checklist dourado.
  - `PR.003.1` (Desktop): Header reestruturado com a logo/ícone 3D e nome **`Fiscaliz.IA.lab - GPR`** no canto superior esquerdo e a logo oficial da Secretaria de Educação com o mapa do Piauí no canto superior direito.
  - `PR.003.2` (Mobile): Compilação nativa pura via Gradle de todas as densidades Android (`mipmap-mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi` e `splash.png`) gerando o novo instalador **`Fiscal.IA.apk`**.
- **Tags Git:** `PR.003`, `PR.003.1`, `PR.003.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.003
  ```

---

### [PR.002] — Isolamento Total de Identidade Nativa: Fiscal.IA (br.com.gprlab.fiscalia)
- **Data/Hora:** 2026-11-08 05:54 (UTC-3)
- **Escopos Definidos:**
  - `PR.002` (Geral): Nome oficializado como **`Fiscal.IA`** em todo o ecossistema (Vite, Capacitor, AndroidManifest, Strings, Vercel e GitHub).
  - `PR.002.1` (Desktop): Atualização dos títulos e cabeçalhos para `Fiscal.IA - GPR Lab`.
  - `PR.002.2` (Mobile): Resolução definitiva do conflito de instalação Android. Configurado `applicationId "br.com.gprlab.fiscalia"` exclusivo, compilado nativamente via Gradle com Android SDK 35 e Microsoft OpenJDK 21, gerando o `Fiscal.IA.apk` puro (instalável como app novo e separado no celular, sem qualquer solicitação de atualização do Kyro).
- **Tags Git:** `PR.002`, `PR.002.1`, `PR.002.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.002
  ```

---

### [PR.001] — Fundação Arquitetural, Módulos 1 a 4 & Capacitação APK Android
- **Data/Hora:** 2026-11-08 05:30 (UTC-3)
- **Escopos Definidos:**
  - `PR.001` (Geral): Setup Vite + React + TypeScript + Tailwind + Glassmorphism Premium, Storage Offline-First com Seed Data do Piauí (21 GREs, OS Nº 140/2026 com 65% de medição, alertas da Gerente Naila).
  - `PR.001.1` (Desktop): Layout centralizado em moldura mobile responsiva com suporte a impressão de laudos técnicos completos.
  - `PR.001.2` (Mobile): Header Android com IA Ativa, Carrossel horizontal de alertas swipeable, Grid 2x2 modular, BottomNav de 5 abas, Câmera com legendagem técnica por IA, 1-Click WhatsApp Copy e projeto Android nativo via Capacitor 7.
- **Tags Git:** `PR.001`, `PR.001.1`, `PR.001.2`
- **Status do Build:** Compilação 100% livre de erros (Vite + TypeScript + Capacitor Android Sync).
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.001
  ```

---

## 🔗 LINKS OFICIAIS DE ACESSO & DOWNLOAD

* **Link de Teste Online (Vercel):** `https://fiscalizacao-seduc.vercel.app` (ou preview ativo)
* **Link Direto de Download do Aplicativo (.apk):** `https://github.com/Wisterly/fiscalizacao-seduc/releases/download/apk-latest/Fiscal.IA.apk`
* **Repositório GitHub:** `https://github.com/Wisterly/fiscalizacao-seduc`
* **Arquivo Local no PC:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
