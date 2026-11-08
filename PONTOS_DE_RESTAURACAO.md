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
