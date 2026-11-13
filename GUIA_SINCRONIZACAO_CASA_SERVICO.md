# GUIA DEFINITIVO DE SINCRONIZAÇÃO EM NUVEM (CASA ↔ SERVIÇO)
## Projeto: Fiscaliz.IA.lab (GPR / SEDUC-PI)

Este guia ensina o passo a passo exato para você continuar o desenvolvimento deste projeto no **Antigravity do seu serviço** exatamente de onde paramos aqui em casa, e depois, ao retornar para casa, atualizar sua máquina com tudo o que foi feito no trabalho, sem perder nada.

---

### 🌐 Arquitetura da Sincronização em Nuvem

Todo o código-fonte, banco de dados local (`ordensServicoAta.json` com 2.850 OSs, coordenadas das escolas `schoolsGeodataConfig.json`), motor de rotas inteligentes (`rotasEngine.ts`), configurações do Capacitor Android e pontos de restauração (`PONTOS_DE_RESTAURACAO.md`) estão centralizados no seu repositório oficial na nuvem do GitHub:

* **Repositório GitHub:** `https://github.com/Wisterly/fiscalizacao-seduc.git`
* **Branch Principal:** `main`
* **Ponto de Restauração Atual:** `[PR.018]` (Versão `1.0.13` - Build 14)
* **Ambiente de Produção (Vercel):** `https://fiscalizacao-seduc.vercel.app`

---

## 🏢 PARTE 1: CHEGANDO NO COMPUTADOR DO SERVIÇO

### Passo 1: Baixar o Projeto no Computador do Trabalho
Abra o terminal (PowerShell ou Git Bash) no seu computador do serviço, navegue até a pasta onde deseja salvar o projeto (ex: `C:\Users\...\Documents`) e execute:

```bash
git clone https://github.com/Wisterly/fiscalizacao-seduc.git
cd fiscalizacao-seduc
```

> **Nota:** Se você já tiver clonado o projeto no serviço em dias anteriores, basta entrar na pasta e rodar:
> ```bash
> git pull origin main --tags
> ```

---

### Passo 2: Instalar as Dependências do Projeto
Com o terminal aberto dentro da pasta `fiscalizacao-seduc`, instale os pacotes necessários:

```bash
npm install
```

---

### Passo 3: Abrir no Antigravity do Serviço
1. Abra o **Antigravity** no computador do seu serviço.
2. No menu principal, clique em **File → Open Folder** (ou **Abrir Pasta**) e selecione a pasta `fiscalizacao-seduc`.
3. Abra uma nova conversa no chat do Antigravity.

---

### Passo 4: Prompt Mestre de Inicialização no Antigravity do Serviço
Para que o Antigravity do seu serviço compreenda 100% do contexto instantaneamente sem você precisar explicar tudo do zero, copie e cole a mensagem abaixo no chat do Antigravity:

```text
Olá! Estou retomando o desenvolvimento do projeto Fiscaliz.IA.lab (GPR / SEDUC-PI) aqui no computador do serviço exatamente de onde parei em casa.

Por favor, faça a leitura dos seguintes arquivos fundamentais antes de começarmos:
1. PONTOS_DE_RESTAURACAO.md (Estamos no ponto ativo [PR.018] - Módulo de Rotas Inteligentes com sub-abas Rota por Trajeto e Rota por Prioridade, diárias de 1.5 a 4.5, velocidade a 140 km/h para S10/Hilux, matriz hierárquica Arielma/Anik/Naila e 2.850 OSs da Ata).
2. version.json (Versão 1.0.13, Build 14).
3. src/services/rotasEngine.ts e src/components/rotas/RotasView.tsx.

Confirme que leu o contexto e me informe o resumo do status atual para continuarmos as próximas demandas!
```

Pronto! O Antigravity do seu trabalho estará no mesmo nível de raciocínio e continuidade.

---

## 🚀 PARTE 2: AO TERMINAR O EXPEDIENTE NO SERVIÇO (SALVAR PARA CASA)

Quando você concluir suas alterações no serviço e for voltar para casa, você deve subir tudo para a nuvem do GitHub seguindo estes 3 comandos:

### Passo 1: Testar o Build
```bash
npm run build
```

### Passo 2: Commit e Tag de Ponto de Restauração
Substitua `PR.019` pelo próximo número de ponto de restauração:
```bash
git add .
git commit -m "feat: melhorias concluidas no servico [PR.019]"
git tag -f PR.019
git tag -f PR.019.1
git tag -f PR.019.2
```

### Passo 3: Enviar para a Nuvem (Push)
```bash
git push origin main --tags -f
```

Isso garante que:
1. O código vai para o GitHub.
2. A **Vercel** atualiza automaticamente a versão web.
3. O **GitHub Actions** compila e disponibiliza o novo APK em `https://github.com/Wisterly/fiscalizacao-seduc/releases/download/apk-latest/Fiscal.IA.apk`.

---

## 🏠 PARTE 3: DE VOLTA EM CASA (RETOMAR O TRABALHO)

Quando você chegar em casa e quiser continuar exatamente de onde parou no trabalho:

### Passo 1: Baixar as Novidades da Nuvem
Abra o Antigravity aqui em casa, abra o terminal na pasta do projeto (`c:\Users\Lenovo\Documents\antigravity\LAB - GPR\Fiscal.IA.lab - GPR`) e execute:

```bash
git pull origin main --tags
```

### Passo 2: Informar o Antigravity de Casa
Basta mandar uma mensagem no chat:
```text
Acabei de puxar do GitHub as atualizações que fiz no serviço (git pull). Leia o PONTOS_DE_RESTAURACAO.md atualizado e vamos continuar!
```

---

## 🔒 RESUMO DOS COMANDOS RÁPIDOS

| Momento | Onde Executar | Comando |
| :--- | :--- | :--- |
| **No Serviço (Chegada)** | Terminal do Serviço | `git clone https://github.com/Wisterly/fiscalizacao-seduc.git` ou `git pull origin main --tags` |
| **No Serviço (Saída)** | Terminal do Serviço | `git add . ; git commit -m "feat: alteracoes servico" ; git push origin main --tags -f` |
| **Em Casa (Retorno)** | Terminal de Casa | `git pull origin main --tags` |

Com esse fluxo, você tem sincronização bidirecional em tempo real, versionamento seguro e zero risco de conflito ou perda de código!
