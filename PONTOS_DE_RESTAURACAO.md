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
