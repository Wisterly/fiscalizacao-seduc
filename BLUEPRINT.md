# BLUEPRINT TÉCNICO — APLICATIVO FISCALIZAÇÃO SEDUC (GPR LAB)

## 1. Visão Geral da Arquitetura
* **Plataforma:** Android Mobile-First / Capacitor 7.0 Native Ready / PWA Offline-First
* **Stack Tecnológica:** React 18 + Vite 6 + TypeScript + Tailwind CSS + Lucide Icons + Capacitor Plugins
* **Padrão de Arquitetura:** Clean Architecture com separação rigorosa em camadas:
  * `src/types/`: Definições de domínio (GRE, Escola, Levantamento, Ordem de Serviço, Demanda, Alerta, Rota).
  * `src/services/`: Camada de infraestrutura e regras de negócio:
    * `storageService.ts`: Persistência Offline-First (LocalStorage / IndexedDB) com controle de integridade, seed data e sincronização transparente.
    * `aiService.ts`: Motor inteligente de IA para refinamento pericial de textos técnicos (normas ABNT/NBR), cálculo preditivo de rotas prioritárias de vistoria e formatação de relatórios em 1 clique para WhatsApp.
  * `src/components/`: Camada de apresentação organizada por domínios de negócio (`common`, `dashboard`, `vistorias`, `orcamentos`, `rotas`, `demandas`, `galeria`, `config`).

---

## 2. Design System & Identidade Visual
* **Fundo Base:** Dark Mode Profundo (`#090D16` a `#111827`).
* **Glassmorphism:** Translúcido com `backdrop-filter: blur(16px)` e bordas sutis `rgba(255, 255, 255, 0.08)`.
* **Cores Translúcidas:**
  * 🟠 Laranja Translúcido (`#F97316`): Alertas e Demandas urgentes.
  * 🟡 Dourado Translúcido (`#EAB308`): Orçamentos, OS e Medição de 65%.
  * 🔵 Azul Turquesa Translúcido (`#06B6D4` / `#14B8A6`): 21 GREs, Levantamentos e Rotas IA.
* **Proibição de Poluição Visual:** Sem gráficos de barras ou pizza na tela inicial, priorizando badges minimalistas, tipografia moderna e barras de progresso iluminadas.

---

## 3. Mapeamento dos 4 Módulos Operacionais

### Módulo 1: 21 GREs, Escolas e Levantamento Fotográfico Inteligente
* Seletor completo das 21 GREs com pino de fixação no topo.
* Histórico cronológico (Timeline vertical) por data e hora no perfil da escola.
* Novo Levantamento: Motivo da Visita + Observações da Diretora + Quantitativo de Ambientes (com criação de novo ambiente global persistido) + Câmera com refinamento técnico por IA + Lembrete de atenção/urgência atrelado à foto com escolha de responsável (Naila, Coordenador, etc.) e dias de alerta.
* Emissão automática de Laudo de Vistoria Técnico com diagramação oficial SEDUC / GPR.

### Módulo 2: Orçamentos, Ordens de Serviço (OS) e Medições
* Filtros por GRE, Município e status (`Com OS Ativa`, `Histórico`, `Sem OS / Aguardando`).
* Visualização da Planilha Orçamentária SINAPI e do Memorial Descritivo.
* Controle de % de medição interativo (ex: 65% medido) com registro de observações do fiscal.

### Módulo 3: Planejador Inteligente de Rotas IA
* Cruzamento preditivo: Tempo sem visita + Estado da escola (Crítico) + Demandas urgentes acumuladas.
* 1-Click Copy para WhatsApp com resumo executivo pronto.
* Conclusão com "Dar OK" que reseta dias sem visita e atualiza histórico.

### Módulo 4: Central de Demandas & Prazos
* Avisos para Gerência (Naila), Coordenador e Arquitetos.
* Frequência programável: Todos os dias ou dias da semana (`Seg`, `Ter`, `Qua`, `Qui`, `Sex`).
* Gestão completa (Adicionar, Dar OK, Apagar).

---

## 4. Recursos Android Nativos
* Viewport com `viewport-fit=cover`, safe areas superior e inferior.
* `@capacitor/status-bar`: Estilo DARK integrado com `#090D16`.
* `@capacitor/clipboard`: Cópia instantânea da rota para WhatsApp.
* Sincronização e empacotamento com `npm.cmd run apk:sync`.
