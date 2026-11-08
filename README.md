# Fiscalização SEDUC — GPR Lab Mobile (Android Ready)

Aplicativo oficial de alta precisão para **Fiscalização de Obras e Vistorias Escolares da SEDUC Piauí**, desenvolvido em parceria com o **GPR Lab**.

---

## 🏛 Identidade Visual & Design System Ultra-Premium
* **Tema Dark Mode Profundo:** Tons de carvão e azul-marinho profundo (`#090D16` a `#111827`).
* **Efeito Glassmorphism de Luxo:** Fundo translúcido com `backdrop-filter: blur(16px)`, sombras suaves e bordas translúcidas de `1px solid rgba(255, 255, 255, 0.08)`.
* **Paleta Translúcida:**
  * 🟠 **Laranja Translúcido (`#F97316`):** Alertas urgentes, pendências críticas e Central de Demandas.
  * 🟡 **Dourado Translúcido (`#EAB308`):** Orçamentos, Ordens de Serviço (OS) e Medição (% físico-financeiro).
  * 🔵 **Azul Turquesa Translúcido (`#06B6D4` / `#14B8A6`):** 21 GREs, Levantamento Fotográfico e Rotas IA.
* **Ergonomia Mobile-First:** Proporção perfeita para uso com uma mão, safe areas Android, microinterações fluidas a 60fps e zero gráficos poluídos na tela inicial.

---

## 📱 Módulos do Sistema

### 1. GREs, Escolas e Levantamento Fotográfico Inteligente
* **Painel Seletor das 21 GREs:** Cobertura de todas as 21 GREs do Piauí com fixação de favoritas no topo e busca instantânea.
* **Histórico Cronológico (Timeline):** Linha do tempo vertical por data e hora no perfil da escola.
* **Fluxo de Novo Levantamento:**
  * Registro de Data/Hora automáticos, Motivo da Visita e Observações Gerais / Pedidos da Diretora.
  * Sistema flexível de ambientes padrão (*Sala de Aula, Laboratório, Biblioteca, Cozinha, Banheiros, etc.*) + quantitativos + criação de novos ambientes globais.
  * Câmera com legenda instantânea, **refinamento normativo por IA** (NBR / engenharia civil) e opção de alerta de urgência atrelado à foto com escolha de responsável (Naila, Coordenador, Arquitetos, Fiscal) e dias da semana.
  * Relatório visual automático dinâmico e interativo com fotos e laudo pericial.

### 2. Orçamentos, Ordens de Serviço (OS) e Medições
* Filtros por GRE, Município e abas: `Com OS Ativa`, `Histórico (Concluídas)` e `Sem OS / Aguardando`.
* Acesso imediato à **Planilha Orçamentária SINAPI** e ao **Memorial Descritivo**.
* **Controle de Porcentagem de Medição (%):** Barra de progresso iluminada em degradê dourado/turquesa com controle interativo (ex: `65% Medido`) e registro de notas de campo.

### 3. Planejador Inteligente de Rotas de Vistoria (Motor de IA)
* Motor de prioridade que cruza:
  1. *Tempo sem visita* (dias desde a última fiscalização).
  2. *Estado de Conservação* (priorizando unidades críticas).
  3. *Acúmulo de Demandas Urgentes*.
* Botão **`Copiar Rota para WhatsApp`**: Gera texto executivo formatado com emojis, escolas numeradas e motivos, pronto para colar no WhatsApp em 1 clique.
* Botão **`Dar OK (Rota Concluída)`**: Atualiza o histórico de todas as unidades visitadas no banco local.

### 4. Central de Demandas & Prazos
* Gestão de pendências com responsáveis (Naila, Coordenador, Arquitetos, Fiscal).
* Programação de notificações no celular: "Todos os dias" ou dias específicos (`Seg`, `Ter`, `Qua`, `Qui`, `Sex`).
* Ações de Acrescentar, Dar OK e Excluir.

---

## ⚡ Persistência & Offline-First
* Armazenamento local automático persistente com suporte a escolas no interior do Piauí sem cobertura celular.
* Dados pré-carregados (Seed Data) com as 21 GREs, escolas icônicas (*U. E. João Clímaco d'Almeida*, *U. E. Dep. Pinheiro Machado*, *CETI Zacarias de Góis*, etc.) e alertas urgentes para a Gerente Naila.

---

## 🚀 Como Executar Localmente
```bash
# Instalar dependências
npm.cmd install

# Iniciar servidor local
npm.cmd run dev

# Gerar build de produção
npm.cmd run build

# Sincronizar projeto Android nativo
npx.cmd cap sync android
```
