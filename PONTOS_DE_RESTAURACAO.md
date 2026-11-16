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

### [PR.039] — Reformulação da Sincronização de Orçamentos e OS (Colunas E, H, I, J, K, N, O, R e S), Integração do Novo Drive Oficial (579 OSs), Sub-Filtros Diários e Release v1.0.34 (Build 35)
- **Data/Hora:** 2026-11-15 23:45 (UTC-3)
- **Escopos Definidos:**
  - `PR.039` (Geral): Reformulação completa da sincronização de Ordens de Serviço na aba de Orçamentos conforme as diretrizes precisas da Planilha Oficial da SEDUC:
    1. **Mapeamento Exato de Colunas:** Coluna E (GRE), Coluna H (Escola), Coluna I (Município), Coluna J (Valor), Coluna K (Número da OS), Coluna N (Fiscal Responsável), Coluna O (Construtora), Coluna R (Status da Obra) e Coluna S (Status Diário).
    2. **Filtro Estrito 'Com OS' vs 'Sem OS':** A aba **Com OS** agrupa exclusivamente as escolas com ordem de serviço em **`EXECUÇÃO`** na Coluna R (total de 145 ordens em execução no estado). As escolas marcadas como Concluída, Cancelada, Aguardando Saldo, A Iniciar ou em branco são direcionadas para a aba **Sem OS**.
    3. **Sub-Filtros Rápidos por Status Diário (Coluna S):** Implementação de pílulas táteis com contadores e cores dinâmicas: **Todos**, **Parada** (vermelho), **Ritmo Lento** (âmbar) e **Em Execução** (esmeralda).
    4. **Integração do Novo Google Drive Oficial:** Rastreamento completo da nova pasta compartilhada (`https://drive.google.com/drive/folders/1NmRb7W-iezPnBufBZo2DAqao8_eTanZy?usp=sharing`) com **579 arquivos de Ordens de Serviço em PDF indexados** nas subpastas das 18 GREs. Casamento automático de números de OS (ex: `2025/671` -> `OS 2025.000671...`) com links diretos para visualização e download ou busca direcionada por GRE.
    5. **Configurações Centralizadas:** Links padrão salvos e migrados em Configurações > Planilha da Ata e Pasta Compartilhada de OSs do Google Drive. Cache do app elevado para versão `v7` (`seduc_fiscal_os_v7`). Versão atualizada para **v1.0.34 (Build 35)**.
  - `PR.039.1` (Web / Desktop): Na visualização Web, a aba de Orçamentos oferece alternância imediata entre Com OS, Sem OS e Todas, com visualização do Status Diário e botões diretos de Baixar Ordem de Serviço (PDF do Drive).
  - `PR.039.2` (Mobile / Android): No smartphone Android, o aplicativo compila com nova versão `versionName 1.0.34` e `versionCode 35`. As pílulas de status diário contam com Safe Area e toque tátil responsivo.
- **Tags Git:** `PR.039`, `PR.039.1`, `PR.039.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.039
  ```

---

### [PR.038] — Correção e Inclusão das Obras 'A INICIAR' na Ata SEDUC (211 OSs Ativas), CETI Armando Burlamaqui (8ª GRE), Filtros Rápidos de Status, Busca Fonética e Release v1.0.33 (Build 34)
- **Data/Hora:** 2026-11-15 23:15 (UTC-3)
- **Escopos Definidos:**
  - `PR.038` (Geral): Correção da trava no serviço de sincronização (`sheetsSyncService.ts`) e na base oficial (`ordensServicoAta.json`) que limitava o filtro apenas a status com termo estrito `EXECUÇÃO`, descartando automaticamente as 66 obras oficiais marcadas como `A INICIAR` na Coluna R da Planilha Oficial da Ata SEDUC. Com o ajuste, a base passou de 145 para **211 Ordens de Serviço ativas** em todo o estado do Piauí. O CETI Armando Burlamaqui (Oeiras - 8ª GRE, INEP `22080392`, OS `2025/943` no valor de R$ 128.229,78, construtora `R Melo Construtora LTDA` e fiscal `Kayro Rocha`) agora é carregado de forma nativa e automática, juntamente com todas as outras obras a iniciar. Implementação de novas pílulas de filtro rápido na aba de Orçamentos: **Todas**, **Com OS**, **Em Execução**, **A Iniciar** e **Sem OS**. Criação de busca inteligente com tolerância fonética que reconhece buscas como "Amanda Bulamarque" direcionando com precisão para "Armando Burlamaqui". Incremento do cache local para versão `v6` (`seduc_fiscal_os_v6`) garantindo atualização instantânea para todos os usuários sem prender em caches legados. Versão atualizada para **v1.0.33 (Build 34)**.
  - `PR.038.1` (Web / Desktop): Na visualização Web da aba de Orçamentos, o fiscal ou gestor agora pode alternar entre "Em Execução" e "A Iniciar" com um clique, identificando imediatamente as obras da sua regional (incluindo as 11 obras ativas da 8ª GRE) e visualizando badges luminosos azuis dedicados para o status "A Iniciar".
  - `PR.038.2` (Mobile / Android): No smartphone Android, o aplicativo compila com nova versão `versionName 1.0.33` e `versionCode 34`. As novas pílulas de filtro deslizam horizontalmente com feedback tátil e o enriquecimento automático marca as escolas com `temOsAtiva: true` em todo o ecossistema móvel.
- **Tags Git:** `PR.038`, `PR.038.1`, `PR.038.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.038
  ```

---

### [PR.037] — Esqueleto Estrutural do Processo no App, Linha do Tempo das Fases (1 a 4), Efeito Sonoro Nativo Web Audio, Auto-Implementação de SEDUC RE/Empenho e Release v1.0.32 (Build 33)
- **Data/Hora:** 2026-11-15 23:05 (UTC-3)
- **Escopos Definidos:**
  - `PR.037` (Geral): Implementação da visualização do Esqueleto Estrutural dos Processos diretamente no aplicativo móvel/web. Cada processo ganha uma Linha do Tempo viva com as 4 Fases de tramitação (Fase 1: Requerimento/Abertura, Fase 2: Autorização/Portaria, Fase 3: SEDUC Empenho e Fase 4: SEDUC RE) com cálculo automático da porcentagem de conclusão. A árvore de documentos lista todos os arquivos na ordem sequencial exata (`001`, `002`, `003`...) com tipo, setor de origem e data. Quando o `SEDUC Empenho` ou `SEDUC RE` são juntados (seja via importação do SEI ou via robô), o sistema implementa o documento automaticamente no esqueleto com selo luminoso (`EMPENHADO`, `RE EMITIDO`), aciona o alerta visual no topo e toca o sinal sonoro sintetizado em tempo real via Web Audio API. Versão atualizada para **v1.0.32 (Build 33)**.
  - `PR.037.1` (Web / Desktop): Na visualização Web, a barra de progresso do esqueleto e os cards de fases oferecem acompanhamento em tempo real, permitindo aos fiscais analisar o esqueleto de qualquer processo de diárias ou medição instantaneamente.
  - `PR.037.2` (Mobile / Android): No smartphone Android, o aplicativo compila com nova versão `versionName 1.0.32` e `versionCode 33`. O fiscal pode gerenciar todos os processos pelo próprio celular, abrindo o SEI, colando os documentos e tendo o esqueleto montado e atualizado na hora com som de confirmação.
- **Tags Git:** `PR.037`, `PR.037.1`, `PR.037.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.037
  ```

---

### [PR.036] — Monitoramento Dinâmico Multi-Processos no Robô SEI, Assistente 'adicionar_processo.bat', Lista Rápida TXT, Sincronização no App e Release v1.0.31 (Build 32)
- **Data/Hora:** 2026-11-15 22:45 (UTC-3)
- **Escopos Definidos:**
  - `PR.036` (Geral): Implementação de suporte completo a múltiplos processos no Robô SEI Monitor com consolidação inteligente de 3 origens: `sei_config.json`, `processos_lista.txt` e `processos_exportados.json`. Criação do assistente interativo em 1 clique `adicionar_processo.bat` (e `.ps1`) para cadastrar novos processos dinamicamente informando número, descrição e tipo de monitoramento. Adição do botão **'⚡ Sincronizar com Robô'** no módulo de Processos do aplicativo Fiscal.IA para exportar e copiar em lote todos os processos cadastrados. Varredura com intervalo de cortesia de 800ms e controle de alertas individuais no celular. Versão atualizada para **v1.0.31 (Build 32)**.
  - `PR.036.1` (Web / Desktop): Na visualização Web, a barra de processos ganha o botão de exportação direta para o robô, permitindo sincronizar todos os processos salvos com 1 clique e baixar o arquivo consolidado para a pasta de automação.
  - `PR.036.2` (Mobile / Android): No smartphone Android, o aplicativo compila com nova versão `versionName 1.0.31` e `versionCode 32`. A função de sincronização copia a lista completa de processos para a área de transferência do celular, permitindo colar em qualquer arquivo de monitoramento.
- **Tags Git:** `PR.036`, `PR.036.1`, `PR.036.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.036
  ```

---

### [PR.035] — Barra Inferior Dock Glassmorphism Fiel com Halo Âmbar (6 Itens), Ajustes Exclusivo no Menu 3 Pontinhos, Correção Oficial SEDUC RE, Processo de Teste SEI 00011.081091/2026-94 e Release v1.0.30 (Build 31)
- **Data/Hora:** 2026-11-15 03:40 (UTC-3)
- **Escopos Definidos:**
  - `PR.035` (Geral): Calibração milimétrica da barra inferior de tarefas (`BottomNav.tsx`) baseada rigorosamente na imagem enviada pelo usuário: design flutuante em vidro chanfrado escuro translúcido com reflexo no topo e halo circular âmbar/dourado suave em volta do ícone ativo; manutenção estrita dos 6 botões (`Início`, `Vistoria`, `Orçamento`, `Rotas`, `Demandas`, `Galeria`) e realocação permanente de `Ajustes` exclusivamente no menu superior de 3 pontinhos. Correção terminológica oficial em 100% dos arquivos: substituição do termo incorreto `SEDUC QRE` pelo padrão oficial `SEDUC RE`. Cadastro automático no banco de dados do processo de diária informado pelo usuário para testes (`00011.081091/2026-94`), configurado com monitoramento de alertas para `SEDUC Empenho` e `SEDUC RE`. Versão atualizada para **v1.0.30 (Build 31)**.
  - `PR.035.1` (Web / Desktop): Na visualização Web e Desktop, o dock flutuante inferior apresenta acabamento translúcido premium, halo âmbar perfeitamente posicionado e espaçamento uniforme. Integração com o fluxo do SEI explicando detalhadamente a existência do CAPTCHA governamental e disponibilizando o método de 1-Clique com Bookmarklet e o Importador Inteligente da Árvore de Documentos.
  - `PR.035.2` (Mobile / Android): No smartphone Android, o aplicativo compila com nova versão `versionName 1.0.30` e `versionCode 31`. O processo `00011.081091/2026-94` já aparece carregado por padrão na categoria de Diárias na aba de Processos, permitindo ao fiscal abrir no SEI e colar a árvore de documentos com 1 toque, disparando alertas sonoros e visuais quando o `SEDUC RE` ou `SEDUC Empenho` forem identificados.
- **Tags Git:** `PR.035`, `PR.035.1`, `PR.035.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.035
  ```

---

### [PR.034] — Sincronização Forçada das 154 Escolas em Execução (Auto-Merge e Cache v5), Novo Importador Inteligente da Árvore Real do SEI, Monitoramento Push de Documentos e Release v1.0.29 (Build 30)
- **Data/Hora:** 2026-11-15 03:15 (UTC-3)
- **Escopos Definidos:**
  - `PR.034` (Geral): Resolução definitiva da visualização das ordens de serviço da Planilha da Ata de Manutenção da SEDUC. O `storageService` foi migrado para a chave `seduc_fiscal_os_v5` com versionamento forçado de cache (`CURRENT_OS_CACHE_VERSION`), garantindo que o aplicativo faça a carga instantânea das 154 ordens de serviço em execução (incluindo o CETI Orlando Carvalho com valor de R$ 627.751,30 e status diário Parada) mesmo em navegadores e celulares que já tinham cache legado anterior. Implementação de sincronização automática e silenciosa em segundo plano ao abrir o app (`syncAtaFromGoogleSheets`). Criação do **Importador Inteligente de Árvore do SEI**: parser inteligente que interpreta listas e andamentos copiados do SEI Piauí e extrai número de documento, nome, tipo, unidade geradora e data/hora de juntada, montando a árvore de arquivos reais no app e disparando notificações e alertas configurados (ex: *SEDUC Empenho*, *SEDUC RE*, *Termo de Atesto*, *Nota Fiscal*). Versão atualizada para **v1.0.29 (Build 30)**.
  - `PR.034.1` (Web / Desktop): Na visualização Web, a aba de Processos ganha modal expansivo para colar a árvore de documentos do SEI, botão de atalho direto para abrir o processo no SEI Piauí com a sessão do usuário, e a aba de Orçamentos passa a carregar imediatamente todas as escolas com OS em execução agrupadas por GRE e município.
  - `PR.034.2` (Mobile / Android): No smartphone Android, o importador do SEI permite ao fiscal colar rapidamente o texto copiado do SEI pelo celular e ter a visualização completa de todos os arquivos do processo. Abertura do app dispara a sincronização silenciosa e recarrega os dados em cache sem exigir F5 ou limpeza de dados. Compilação do APK nativo `Fiscal.IA.apk` Build 30 com `versionCode 30` e `versionName 1.0.29`.
- **Tags Git:** `PR.034`, `PR.034.1`, `PR.034.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.034
  ```

---

### [PR.033] — Nova Barra de Navegação Flutuante Glassmorphism, Botão [ ≡ ] Fiel, Filtro Estrito Coluna R (Obras em Execução), Badge de Status Diário (Coluna S), 154 OSs Reais (CETI Orlando Carvalho) e Release v1.0.28 (Build 29)
- **Data/Hora:** 2026-11-15 02:45 (UTC-3)
- **Escopos Definidos:**
  - `PR.033` (Geral): Reformulação completa da filtragem da Planilha da Ata da SEDUC com critério estrito na Coluna R (índice 17: apenas status `EXECUÇÃO` ou `EM EXECUÇÃO`) e captura do Status Diário da Coluna S (índice 18: `Parada`, `Em andamento`, `Ritmo lento`, etc.). Sincronização de 154 ordens de serviço ativas no estado do Piauí com identificação única, incluindo os dados reais do CETI Orlando Carvalho (8ª GRE - Oeiras, OS 2025/671, valor R$ 627.751,30, Status Diário `Parada`, Contrato 217/2022, Fiscal Kayro Rocha, Construtora R Melo). Nova Barra Inferior de Navegação flutuante com acabamento vítreo premium escuro translúcido, reflexo chanfrado superior, iluminação difusa âmbar suave no ícone ativo e remoção ergonômica de Ajustes (mantendo apenas 6 itens principais). Botão superior de menu [ ≡ ] com moldura quadrada de cantos arredondados e borda branca de alto contraste. Versão atualizada para **v1.0.28 (Build 29)**.
  - `PR.033.1` (Web / Desktop): Na visualização Web e Desktop, o layout mantém o dock flutuante centralizado na base com reflexo chanfrado e halo dourado difuso no item ativo, sem colisões com os cards de módulos. Cabeçalho com o botão de menu [ ≡ ] em destaque e navegação instantânea.
  - `PR.033.2` (Mobile / Android): No smartphone Android, o dock flutuante inferior ganha margens confortáveis (`left-2.5 right-2.5 bottom-2`), bordas arredondadas `rounded-2xl` e fundo `backdrop-blur-2xl`, garantindo que os 6 botões (Início, Vistoria, Orçamento, Rotas, Demandas, Galeria) tenham espaço tátil generoso sem cortes. O card expandido da escola na aba de Orçamentos destaca com máxima clareza o badge de Status Diário com ponto luminoso pulsante (vermelho para `● PARADA`, âmbar para `● RITMO LENTO` e verde para `● EM ANDAMENTO`). Botão direto de download de OS acionando o link direto do Google Drive da referida regional. Compilação do APK nativo `Fiscal.IA.apk` Build 29 com `versionCode 29` e `versionName 1.0.28`.
- **Tags Git:** `PR.033`, `PR.033.1`, `PR.033.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.033
  ```

---

### [PR.032] — Pasta Geral de Ordens de Serviço do Drive (Todas as GREs), Varredura Inteligente por Número de OS, Anexação Automática aos Cards das Escolas e Release v1.0.27 (Build 28)
- **Data/Hora:** 2026-11-15 02:30 (UTC-3)
- **Escopos Definidos:**
  - `PR.032` (Geral): Criação do serviço `driveOSScannerService` integrado a um acervo com 1015 arquivos/PDFs da SEDUC e à Pasta Geral do Google Drive contendo as ordens de serviço de todas as 21 GREs. O motor varre cada GRE e escola, analisa as ordens de serviço em execução/ativas, extrai o número da OS (ex: 2026/794, 2025/943), localiza o arquivo correspondente no Google Drive pelo número da OS no nome do arquivo e anexa automaticamente o link do arquivo ao card da escola na aba de Orçamentos. O arquivo de orçamento permanece estritamente manual para upload/anexação dedicada. Versão oficial atualizada para **v1.0.27 (Build 28)**.
  - `PR.032.1` (Web / Desktop): Na aba de Configurações, card completo de configuração da *Pasta Geral de Ordens de Serviço (Google Drive)* com input de URL compartilhada, botões de salvar, restaurar padrão e execução de varredura com relatório de status.
  - `PR.032.2` (Mobile / Android): No smartphone Android, botão direto de atalho *Varredura OS Drive* no cabeçalho da GRE em Orçamentos. No card expandido de cada escola, identificação clara da OS vinculada automaticamente (`● OS vinculada automaticamente do Drive: nomeArquivo.pdf`) e botão direto para abrir/baixar o PDF da OS. Botão de Orçamento manual mantido para anexação de planilha/PDF orçamentário. Compilação do APK nativo `Fiscal.IA.apk` Build 28 e upload na Release do GitHub.
- **Tags Git:** `PR.032`, `PR.032.1`, `PR.032.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.032
  ```

---

### [PR.031] — Sincronização em Tempo Real da Ata da SEDUC em Orçamentos, Status da Obra Destacado, Botões de Download de OS/Orçamento em PDF, Botão Menu [ ≡ ] Estilizado e Release v1.0.26 (Build 27)
- **Data/Hora:** 2026-11-15 02:20 (UTC-3)
- **Escopos Definidos:**
  - `PR.031` (Geral): Integração nativa da planilha da Ata de Manutenção da SEDUC com a aba de Orçamentos, importando ordens de serviço ativas/em execução diretamente do Google Sheets via endpoint GViz com suporte total a CORS. Seção dedicada em Ajustes (`ConfigView`) para configuração do link da planilha e pasta do Google Drive com botão de sincronização forçada e restauração do padrão SEDUC. Exibição de 96 ordens de serviço oficiais, incluindo o CETI Família Agrícola Dom Edilberto III (8ª GRE, Cajazeiras do Piauí, OS 2026/794, R$ 447.912,66, Status A INICIAR). Atualização oficial para a versão **v1.0.26 (Build 27)**.
  - `PR.031.1` (Web / Desktop): Cabeçalho com pílula de conectividade `● Sincronização em Nuvem & Drive Ativa • Cross-Platform Web/Mobile` de alta visibilidade e acabamento aeroespacial com halo ciano pulsante. Novo botão de menu estilizado com contorno retangular arredondado branco [ ≡ ].
  - `PR.031.2` (Mobile / Android): No smartphone Android, o botão de menu [ ≡ ] ganha borda retangular arredondada branca e três traços horizontais nítidos no topo. Pílula de status visível de forma sutil e compacta no cabeçalho mobile. Card expandido da escola na aba de Orçamentos exibe o badge de Status da Obra em destaque luminoso (A INICIAR em âmbar, EM EXECUÇÃO em esmeralda, PARALISADA em vermelho) e dois botões dedicados logo abaixo para baixar o Orçamento e a Ordem de Serviço em PDF. Barra inferior flutuante com acabamento vítreo reflexivo cristalino, halo circular dourado difuso no ícone ativo e ergonomia perfeita para 6 abas essenciais. Compilação do APK nativo `Fiscal.IA.apk` Build 27.
- **Tags Git:** `PR.031`, `PR.031.1`, `PR.031.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.031
  ```

---

### [PR.030] — Barra Inferior Otimizada com 6 Abas (Ajustes Exclusivo no Menu Superior), Temática Vítrea com Halo Dourado Suave e Release v1.0.25 (Build 26)
- **Data/Hora:** 2026-11-15 01:55 (UTC-3)
- **Escopos Definidos:**
  - `PR.030` (Geral): Redução da barra inferior para exatamente 6 abas essenciais (`Início`, `Vistoria`, `Orçamento`, `Rotas`, `Demandas` e `Galeria`). Remoção do ícone de Ajustes da barra inferior, mantendo o acesso a Ajustes/Configurações centralizado nos 3 pontinhos / menu superior e nos cards da Home. Versão oficial atualizada para **v1.0.25 (Build 26)**.
  - `PR.030.1` (Web / Desktop): Barra inferior responsiva tipo dock com acabamento translúcido fumê vítreo (`bg-[#0B111E]/95 backdrop-blur-2xl border-white/[0.18]`), filete superior refinado com reflexo perolado suave e sombras projetadas de alta profundidade.
  - `PR.030.2` (Mobile / Android): No smartphone Android, ergonomia aprimorada com espaçamento expandido entre os 6 ícones, eliminação total de aperto no toque e acabamento idêntico à imagem de referência: halo circular luminoso âmbar/dourado suave em torno do ícone ativo e tipografia âmbar quente vibrante. Compilação do APK nativo `Fiscal.IA.apk` Build 26 e upload na Release do GitHub.
- **Tags Git:** `PR.030`, `PR.030.1`, `PR.030.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.030
  ```

---

### [PR.029] — Atualização Oficial para v1.0.24 (Build 25), Sistema Anti-Cache Web (F5 Instantâneo) e Varredura OTA Multi-Canal (Vercel + GitHub)
- **Data/Hora:** 2026-11-15 01:45 (UTC-3)
- **Escopos Definidos:**
  - `PR.029` (Geral): Incremento oficial do versionamento para **v1.0.24 (Build 25)** em todos os pontos do sistema (`version.json`, `public/version.json`, `android/app/build.gradle` e `appUpdater.ts`). Implementação de arquitetura multi-canal de verificação de atualização: consulta prioritária na Vercel (sem latência de CDN) com fallback no GitHub raw e detecção imediata de novas compilações.
  - `PR.029.1` (Web / Desktop): Inclusão de meta tags HTTP anti-cache (`no-cache`, `no-store`, `must-revalidate`, `Expires: 0`) no `index.html`, garantindo que pressionar F5 no navegador recarregue imediatamente os novos módulos sem retenção de cache antigo. Adição de botão de download direto do APK v1.0.24 na tela de Ajustes.
  - `PR.029.2` (Mobile / Android): No smartphone Android, o `versionCode` do APK foi elevado para 25. O app antigo (build 23) agora detecta imediatamente a nova versão (`25 > 23`) ao abrir, ao fazer pull-to-refresh ou ao clicar em "Verificar Atualizações Agora" nos Ajustes, exibindo o modal com o botão "Instalar". Compilação do APK nativo `Fiscal.IA.apk` e upload direto na release `apk-latest`.
- **Tags Git:** `PR.029`, `PR.029.1`, `PR.029.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.029
  ```

---

### [PR.028] — Exibição de Todas as Escolas da GRE em Orçamentos e Medições, Expansão Interativa Universal com Cadastro Direto de OS, Anexos em PDF e Medição Manual/Vinculada
- **Data/Hora:** 2026-11-15 01:28 (UTC-3)
- **Escopos Definidos:**
  - `PR.028` (Geral): Reformulação completa da arquitetura de listagem em Orçamentos e Medições: seleção da GRE exibe 100% das escolas pertencentes à referida regional (`schoolsDaGre`). Implementação de expansão universal em cada card de escola, mesmo quando a escola ainda não possui nenhuma OS ou medição cadastrada. Criação de métodos oficiais no `storageService.ts` (`saveOrdemServico`, `deleteOrdemServico`) com persistência na chave `seduc_fiscal_os_v3` e sincronização automática da flag `temOsAtiva` nas escolas.
  - `PR.028.1` (Orçamentos & OS): Na aba de Orçamentos, cada escola da GRE é listada individualmente com contador e filtros. Ao clicar, o card expande: se tiver OSs, lista com visualização/download direto dos PDFs de Ordem de Serviço e Planilha Orçamentária, além de edição e exclusão. Se não tiver nenhuma OS, exibe painel convidativo com botão destacado `+ Cadastrar Orçamento & Ordem de Serviço`, abrindo o modal com campos de dados da obra, upload de PDF/imagem e link externo.
  - `PR.028.2` (Medições de Obras): Na aba de Medições, cada escola expande com 1 clique. Caso não possua OS, disponibiliza 2 opções: 1) `+ Cadastrar Manualmente` (modal completo com slider de avanço físico de 0 a 100%, cálculo automático em R$ de valor medido e saldo contratual, anexo de boletim de medição em PDF ou imagem); 2) `🔗 Vincular de OS Existente` (vinculação de OSs da escola, da GRE ou sincronização da Ata SEDUC do Google Sheets). Barra neon turquesa e dourada atualizada em tempo real. Empacotamento Capacitor e compilação do APK nativo `Fiscal.IA.apk`.
- **Tags Git:** `PR.028`, `PR.028.1`, `PR.028.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.028
  ```

---

### [PR.027] — 6 Cards Interativos na Home com Modo Solto (Jiggle/Drag & Drop), Novo Módulo de Medições Desacoplado, Acompanhamento de Processos SEI, Barra Inferior Ergonômica com 7 Abas e Destaque Vítreo Neon, Menu Superior com os 9 Módulos
- **Data/Hora:** 2026-11-15 01:12 (UTC-3)
- **Escopos Definidos:**
  - `PR.027` (Geral): Limpeza radical e eliminação de 100% de quaisquer dados fictícios/mocks (ordens de serviço com medições 100% ou 65%, demandas e vistorias fictícias removidas; banco de dados e localStorage inicializados zerados na versão v3, preservando a base cadastral das 21 GREs e escolas do INEP). Remoção do card fixo do topo de sincronização a pedido do usuário. Simplificação do card de atualização do app com botão único "Instalar". Criação dos modelos e serviços de dados para Processos SEI (`ProcessoAcompanhamento`, `DocumentoProcessoSEI`, `AlertaProcessoConfig`).
  - `PR.027.1` (Desktop / Web): Expansão da Home para 6 cards modulares com persistência da ordem personalizada (`storage.saveHomeCardsOrder`). Modo de reorganização ativado por clique ou arraste (Drag and Drop HTML5) e setas direcionais com tremor interativo (`animate-wiggle`). Menu Superior (três linhas) deslizante contendo integralmente todos os 9 módulos com descrições e badges.
  - `PR.027.2` (Mobile / Android): No smartphone Android, ergonomia refinada na barra inferior com as 7 abas essenciais perfeitamente encaixadas (`Início`, `Vistoria`, `Orçamento`, `Rotas`, `Demandas`, `Galeria` e `Ajustes`), sem rolagem ou corte de ícones. Destaque vítreo com Glassmorphism aprimorado, filete neon turquesa iluminado no topo, fundo azul-marinho profundo translúcido e cápsula ativa resplandecente. Módulos de `Medições` e `Processos SEI` acessíveis nos 6 cards da Home e no Menu Superior. Atualização para **v1.0.22 (Build 23)** e compilação do APK nativo `Fiscal.IA.apk`.
- **Tags Git:** `PR.027`, `PR.027.1`, `PR.027.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.027
  ```

---

### [PR.026] — Design Responsivo Web/Desktop Adaptativo, Sincronização em Nuvem Cross-Platform (Celular ⇄ Web) e Armazenamento Inteligente com Google Drive por GRE e Escola
- **Data/Hora:** 2026-11-14 23:50 (UTC-3)
- **Escopos Definidos:**
  - `PR.026` (Geral): Criação do `cloudSyncService.ts` com identificação universal de dispositivo (`deviceId`), sincronização bidirecional de dados (demandas, vistorias, tarefas, medições, escolas), persistência segura de configurações no `localStorage`, suporte a webhook do Google Apps Script e geração estruturada da hierarquia de pastas no Google Drive (`[Nome_GRE] / [Nome_Escola] / Fotos_Vistoria` e `Laudos_Relatorios_PDF`).
  - `PR.026.1` (Desktop / Web): Fim do layout comprimido no navegador. O container principal do aplicativo se expande dinamicamente de `max-w-md` para telas amplas widescreen (`w-full max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl`). A barra de navegação se transforma no Desktop em uma moderna Dock Bar flutuante centralizada com cantos arredondados, backdrop blur e bordas refinadas. O grid dos módulos salta para 4 colunas (`grid-cols-2 md:grid-cols-4`), a seleção das 21 GREs passa para até 7 colunas por linha (`grid-cols-4 md:grid-cols-6 lg:grid-cols-7`), e a listagem de demandas adota layout em grade multi-colunas (`md:grid-cols-2 lg:grid-cols-3`).
  - `PR.026.2` (Mobile / Android): No smartphone Android, o design permanece 100% fiel à ergonomia mobile nativa (barra inferior fixa ergonômica, safe area, toque tátil e rolagem ultrafluida). Integração do Google Drive e nuvem aos relatórios técnicos de vistoria e aos formulários fotográficos. Na aba de Configurações, card completo de *Sincronização em Nuvem & Google Drive* com indicador de status (🟢 Conectado / 🟡 Aguardando Link), campo direto para salvar o link da pasta compartilhada, extração automática do `folderId` e botão de sincronização forçada com notificação de confirmação. Atualização de versão para **v1.0.21 (Build 22)** e compilação do APK nativo `Fiscal.IA.apk`.
- **Tags Git:** `PR.026`, `PR.026.1`, `PR.026.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.026
  ```

---

### [PR.025] — Calendário Interativo de Viagem com Matriz Real de Diárias SEDUC, Reset Completo de Mocks, Varredura Rápida (<2s), Gesto Pull-to-Refresh com Check Verde e Otimização de Chunks
- **Data/Hora:** 2026-11-14 01:45 (UTC-3)
- **Escopos Definidos:**
  - `PR.025` (Geral): Limpeza total e reset de todos os dados fictícios e exemplos em `seedData.ts` e `storageService.ts` (demandas, alertas, tarefas, levantamentos fotográficos mockados e rotas fictícias zerados, mantendo unicamente a base oficial das 21 GREs, escolas INEP e ordens de serviço da Ata de Manutenção). Varredura de atualização OTA na inicialização reduzida de 8s para no máximo 1.5s a 2s.
  - `PR.025.1` (Desktop / Web): Implementação do Calendário Interativo de Rotas (`CalendarioRotaModal.tsx`) com navegação de mês/ano, seleção da data de saída e cálculo automático do retorno respeitando rigorosamente a matriz operacional da SEDUC ("o meio é a volta"): 1.5d (2 dias de viagem: ex. 16 a 17), 2.5d (3 dias: ex. 16 a 18), 3.5d (4 dias: ex. 16 a 19), 4.5d (5 dias: ex. 16 a 20) com recálculo automático em tempo real ao alterar a quantidade de diárias ou ao compactar dias em campo.
  - `PR.025.2` (Mobile / Android): Integração universal do gesto Pull-to-Refresh (`PullToRefresh.tsx`) com resistência física elástica no topo da tela em todas as abas. Ao soltar, animação com spinner circular de carregamento sincronizando dados locais e checando atualizações na nuvem; ao finalizar, a bolinha se transforma na marca de check verde estilo Nike / Esmeralda (`Check` stroke 3) e some automaticamente em 1.8 segundos. Otimização do Vite com divisão inteligente de chunks (`vendor-react`, `vendor-capacitor`, `vendor-icons`), reduzindo o footprint e acelerando a abertura no Android. Geração do instalador nativo **`Fiscal.IA.apk`** v1.0.20 (Build 21).
- **Tags Git:** `PR.025`, `PR.025.1`, `PR.025.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.025
  ```

---

### [PR.024] — Padronização Universal do Seletor de GRE (21 Regionais) na Central de Demandas, Orçamentos/OS e Rotas, Busca Dinâmica de Escolas e Navegação Hierárquica
- **Data/Hora:** 2026-11-14 00:20 (UTC-3)
- **Escopos Definidos:**
  - `PR.024` (Geral): Padronização universal em todos os módulos da aplicação (Central de Demandas, Orçamentos & OS, Rotas de Vistoria e Vistorias/Levantamento) onde a primeira tela obrigatória é o Seletor de GRE oficial das 21 regionais da SEDUC-PI. Cada módulo opera de forma contextualizada na regional escolhida, com botão superior direto de "Trocar GRE" a qualquer momento.
  - `PR.024.1` (Desktop / Web): Refatoração da Central de Demandas (`DemandasView.tsx` e `NewDemandaModal.tsx`): o cadastro de nova demanda filtra automaticamente e exibe exclusivamente as escolas pertencentes à GRE selecionada. Inclusão de campo de pesquisa instantânea (`Search`) por nome da escola ou município, barra rolável ergonômica com feedback de seleção, e opção de demanda geral para a regional ("Nenhuma / Geral da GRE"). Em Orçamentos e OS, o seletor de municípios é alimentado dinamicamente com os municípios da GRE selecionada, integrado aos dados da planilha da Ata de Manutenção.
  - `PR.024.2` (Mobile / Android): Integração da navegação hierárquica ao botão e gesto Voltar físico/nativo do Android (`CapApp.addListener('backButton')`): se o usuário estiver dentro de Demandas, Orçamentos ou Rotas com uma GRE ativa, apertar "Voltar" retorna instantaneamente à tela de seleção das 21 GREs daquele módulo, descendo um nível na árvore sem fechar o módulo ou o aplicativo. Sincronização Capacitor e geração do instalador nativo **`Fiscal.IA.apk`** v1.0.19 (Build 20).
- **Tags Git:** `PR.024`, `PR.024.1`, `PR.024.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.024
  ```

---

### [PR.023] — Interceptação Inteligente do Botão Voltar (Android & Web) com Duplo Toque para Sair, Bate e Volta Otimizado (1.5 e 2.5 d) & Comparativo Maps/Waze vs Hilux 140km/h
- **Data/Hora:** 2026-11-13 23:58 (UTC-3)
- **Escopos Definidos:**
  - `PR.023` (Geral): Solução completa para o gesto/botão de voltar do Android e navegador. Interceptação via `@capacitor/app` (`CapApp.addListener('backButton')`) e `window.addEventListener('popstate')`. Implementação de pilha de histórico de abas (`tabHistory`), fechamento em cascata de modais de vistoria, relatórios, telas de perfil de escola e subviews. Trava de segurança com duplo clique na tela inicial (`inicio`): ao pressionar voltar pela primeira vez na tela inicial, exibe o toast flutuante *"Pressione novamente para sair do aplicativo"* e somente fecha o app se pressionado duas vezes em até 2 segundos.
  - `PR.023.1` (Desktop / Web): Readequação estrita das regras de viagem no motor algorítmico `rotasEngine.ts`: regimes de 1.5 e 2.5 diárias configurados como Bate e Volta no mesmo dia (saída às 06:00h e chegada programada entre 21:00h e 22:00h em Teresina), limitando a carga de escolas a 3-5 unidades para evitar sobrecarga humana. Regimes de 3.5 diárias (2 dias / 1 pernoite) e 4.5 diárias (3 dias / 2 pernoites) com pernoites rigorosamente entre 19:00h e 20:00h na Cidade-Polo. Novo seletor de "Duração em Campo" com recurso de compactação para reduzir rotas de 4.5d para 2 ou 1 dia (bate e volta) e 3.5d para 1 dia.
  - `PR.023.2` (Mobile / Android): Integração da física comparativa entre tempos oficiais de rodovias do Google Maps & Waze (~75 km/h) versus a Simulação em Caminhonete 4x4 (S10 / Hilux) a 140 km/h de cruzeiro (~125 km/h efetivo com até 45% de economia de tempo). Exibição visual nos cards executivos e em cada parada da timeline. Sincronização Capacitor e geração do instalador nativo **`Fiscal.IA.apk`** v1.0.18 (Build 19).
- **Tags Git:** `PR.023`, `PR.023.1`, `PR.023.2`
- **Arquivo Local do APK:** `c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.023
  ```

---

### [PR.022] — Correção Definitiva do Ícone Android: Expurgamento de Vetores Legados em Drawable e Prioridade Total aos Ícones Adaptativos 3D
- **Data/Hora:** 2026-11-13 13:20 (UTC-3)
- **Escopos Definidos:**
  - `PR.022` (Geral): Identificação e correção da sobreposição de recursos no empacotador AAPT do Android. Exclusão definitiva dos vetores legados de template `drawable-v24/ic_launcher_foreground.xml` e `drawable/ic_launcher_background.xml` que estavam sobrepondo silenciosamente as imagens de alta resolução em `mipmap-*/ic_launcher_foreground.png`.
  - `PR.022.1` (Desktop / Web): Atualização do script de sincronização automatizada `sync-app-icons.ps1` com trava que impede a recriação acidental de vetores legados.
  - `PR.022.2` (Mobile / Android): Garantia de que 100% dos dispositivos Android (desde Android 8 até Android 15+) renderizem com máxima fidelidade o ícone oficial 3D (capacete branco SEDUC, prancheta e checklist dourado) e o fundo preto `#000000`, gerando a nova versão v1.0.17 (Build 18).
- **Tags Git:** `PR.022`, `PR.022.1`, `PR.022.2`
- **Arquivo Local do APK:** `c:\Users\KayroPaula\OneDrive - Secretaria de Educação do Estado do Piaui\Documentos\Antigravity\FiscaIA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.022
  ```

---

### [PR.021] — Formatação Oficial UGERF / GPR do Roteiro WhatsApp com Campo de Data e Pessoas na Rota
- **Data/Hora:** 2026-11-13 12:25 (UTC-3)
- **Escopos Definidos:**
  - `PR.021` (Geral): Adequação estrita do template de exportação de rotas para WhatsApp para o padrão oficial da UGERF / GPR. Cabeçalho oficial `*🛣️ ROTEIRO DE VISTORIAS — UGERF / GPR*` contendo `*GRE:*`, `*Data:* XX/XX á XX/XX`, `*Diárias:*`, `*👥 Equipe:*` e `*Total de Escolas:*`. Listagem simplificada por dias (`*📅 DIA 1*`, `*📅 DIA 2*`) com recuo, emoji de localização e destaque estrito: `📍 *Cidade* — Nome da Escola` (sem horários ou notas secundárias). Inclusão do campo persistente de "Data / Período da Rota" ao lado da equipe de campo.
  - `PR.021.1` (Desktop / Web): Grid responsivo de 3 colunas para inserção rápida de Data/Período e Equipe de Campo com botões de limpeza em 1 clique e cópia formatada imediata.
  - `PR.021.2` (Mobile / Android): Otimização ergonômica dos inputs para teclado virtual no Android, sincronização Capacitor e geração da versão v1.0.16 (Build 17).
- **Tags Git:** `PR.021`, `PR.021.1`, `PR.021.2`
- **Arquivo Local do APK:** `c:\Users\KayroPaula\OneDrive - Secretaria de Educação do Estado do Piaui\Documentos\Antigravity\FiscaIA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.021
  ```

---

### [PR.020] — Customização de Rotas: Exclusão de Escolas Sugeridas, Exportação Limpa WhatsApp (Cidades e Escolas) & Campo de Equipe de Campo
- **Data/Hora:** 2026-11-13 11:05 (UTC-3)
- **Escopos Definidos:**
  - `PR.020` (Geral): Flexibilização e customização avançada do Módulo de Rotas Inteligentes (`RotasView.tsx` e `rotasEngine.ts`). Inclusão do botão "Tirar da Rota" em cada parada de escola sugerida, permitindo ao engenheiro/fiscal retirar unidades com recálculo automático do itinerário e métricas (Km e tempo). Banner interativo de recuperação com botão "Restaurar Todas as Sugestões". Novo campo de texto no app para informar a Equipe de Campo / Pessoas na Rota, persistido no dispositivo via `localStorage`. Nova formatação oficial de exportação para WhatsApp: remoção completa de horários e inclusão estrita apenas de Cidades e Nomes das Escolas organizadas por dia, com cabeçalho contendo a equipe de campo e resumo da rota.
  - `PR.020.1` (Desktop / Web): Layout responsivo do campo de equipe com botão de limpeza rápida, feedback visual imediato ao excluir/restaurar escolas sugeridas e sincronização com a área de transferência para envio ao WhatsApp Web.
  - `PR.020.2` (Mobile / Android): Botão tátil de exclusão adaptado a telas pequenas, campo de equipe otimizado para teclado virtual móvel com persistência offline e compatibilização nativa Capacitor v1.0.15 (Build 16).
- **Tags Git:** `PR.020`, `PR.020.1`, `PR.020.2`
- **Arquivo Local do APK:** `c:\Users\KayroPaula\OneDrive - Secretaria de Educação do Estado do Piaui\Documentos\Antigravity\FiscaIA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.020
  ```

---

### [PR.019] — Unificação e Sincronização Definitiva do Ícone do Aplicativo com a Logo Oficial 3D (Fiscaliz.IA.lab - GPR)
- **Data/Hora:** 2026-11-13 10:30 (UTC-3)
- **Escopos Definidos:**
  - `PR.019` (Geral): Sincronização 100% fiel do ícone do aplicativo com a logo oficial 3D do projeto (capacete branco da SEDUC Piauí, prancheta de fiscalização e checklist dourado). Configuração do Web App Manifest PWA com ícones de múltiplas resoluções e metadados de sistema. Atualização do script mestre de geração `sync-app-icons.ps1`.
  - `PR.019.1` (Desktop / Web): Ícones de favicon em PNG de alta resolução (`app-icon.png` e `favicon.png`), integração do `manifest.json` com background `#090D16` e alinhamento visual rigoroso com o cabeçalho oficial `Fiscal.IA.lab - GPR`.
  - `PR.019.2` (Mobile / Android): Correção estrutural do ícone adaptativo Android (API 26+). Configuração da cor de fundo nativa em preto `#000000` em `ic_launcher_background.xml` e geração do `ic_launcher_foreground.png` centralizado na zona segura de 72% para evitar cortes em qualquer launcher de fabricante (Samsung, Xiaomi, Pixel, Motorola). Atualização de todas as densidades legadas (`mipmap-mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`) para ícones quadrados e redondos (`ic_launcher_round.png`), além de 11 resoluções de Splash Screen (Portrait e Landscape).
- **Tags Git:** `PR.019`, `PR.019.1`, `PR.019.2`
- **Arquivo Local do APK:** `c:\Users\KayroPaula\OneDrive - Secretaria de Educação do Estado do Piaui\Documentos\Antigravity\FiscaIA.lab - GPR\Fiscal.IA.apk`
- **Comando de Restauração Rápida:**
  ```bash
  git checkout PR.019
  ```

---

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
