# Mapa de Contexto - Study Valley

## 1. Visão Geral dos Contextos Delimidados (*Bounded Contexts*)

O sistema é estruturado em contextos modulares e desacoplados, coordenados centralmente pelo orquestrador (`app.js`):

```
+---------------------------------------------------------------------------------------------------+
|                                       APP.JS (Orquestrador)                                       |
+---------------------------------------------------------------------------------------------------+
|                   |                     |                      |                     |
v                   v                     v                      v                     v
+------------+  +------------------+  +------------------+  +-------------------+  +-----------------------+
|   TIMER    |  |   GAMIFICATION   |  |  STORAGE / STATE |  |   SHOP / DECOR    |  |      MINI-GAMES       |
|  CONTEXT   |  |     CONTEXT      |  |     CONTEXT      |  |      CONTEXT      |  |        CONTEXT        |
| (Contagem  |  | (XP, Buffs,      |  |  (Persistência   |  |  (Catálogo, Loja  |  | (Forja, Expedição e   |
| e Pausas)  |  |  Moedas, Level)  |  |     Local)       |  |  e Inventário)    |  |  Grimório - Pausa)    |
+------------+  +------------------+  +------------------+  +-------------------+  +-----------------------+
|                   |                     |                      |                     |
+-------------------+----------+----------+----------------------+---------------------+
|
v
+-----------------------+
|   UI / PRESENTATION   |
|        CONTEXT        |
|  (DOM, Modais, HUD,   |
|  Drag&Drop, Cenário)  |
+-----------------------+
```
---

## 2. Descrição Detalhada dos Contextos

### A. Contexto de Temporização (`timer.js`)
* **Responsabilidade:** Contagem regressiva precisa de sessões de estudo e intervalos de descanso.
* **Estados do Ciclo:** `studying` (foco), `paused` (em pausa), `break` (descanso) e `idle` (parado).
* **Comunicação:** Emite callbacks a cada segundo decorrido e na finalização do tempo, reportando os minutos completos para o `app.js`.

### B. Contexto de Gamificação e Regras de Negócio (`game.js`)
* **Responsabilidade:** Processamento matemático de recompensas, progressão de níveis, multiplicadores e validação de conquistas.
* **Componentes:**
  * Processador de recompensas (`addReward`) com consumo do multiplicador de feitiço (`xpMultiplier`).
  * Gerenciador de níveis e limiares de XP progressivos.
  * Registro de conquistas resgatadas (`achievementsClaimed`).

### C. Contexto de Armazenamento e Estado (`storage.js`)
* **Responsabilidade:** Persistência no `localStorage`, versionamento de schema e segurança de dados do jogador.
* **Componentes:**
  * **Versionamento:** Constante `CURRENT_VERSION: '1.0.0'` embutida no estado.
  * **Motor de Migração (`migrate`):** Atualiza e valida saves antigos de forma transparente.
  * **Rotina de Backup:** Métodos `exportSave()` (geração de download `.json`) e `importSave()` (leitura, validação e carregamento seguro).

### D. Contexto de Loja e Decoração (`shop.js`)
* **Responsabilidade:** Catálogo decorativo, transações econômicas e gerenciamento de móveis equipados na sala.
* **Componentes:** Validação de saldo de moedas, dedução financeira, estados equipar/desequipar e posicionamento padrão inicial.

### E. Contexto de Mini-Games e Sinergia (`minigames/`)
* **Responsabilidade:** Entretenimento gamificado durante o intervalo de descanso, integrando mecânicas cruzadas:
  * **Forja (`forja.js`):** Desafio de timing que concede moedas, XP e ativa o escudo protetor (`hasShield = true`).
  * **Expedição (`expedicao.js`):** Runner de reflexo que consome o escudo forjado para absorver 1 impacto com obstáculo e converte pontos em moedas no Game Over.
  * **Grimório (`grimorio.js`):** Encaixe rúnico em matriz 8x8 que conjura o Feitiço da Mente Clara (+20% XP).

### F. Contexto de Interface e Apresentação (`ui.js`, `audio.js`, CSS e HTML)
* **Responsabilidade:** Exibição gráfica, manipulação segura do DOM, efeitos sonoros retro e responsividade.
* **Componentes:**
  * Drag-and-Drop touch-safe com bloqueio de rolagem de página indesejada.
  * Síntese de áudio procedural sem dependências externas (`AudioFX`).
  * Interface responsiva adaptável para celulares e computadores.

---

## 3. Matriz de Integração e Fluxo de Dados

| Origem | Destino | Tipo de Interação | Descrição |
| :--- | :--- | :--- | :--- |
| **Timer** | **App** | Callback | Notifica conclusão de estudo ou pausa com contagem de minutos. |
| **App** | **Game** | Chamada de Método | Dispara `addReward()`, aplicando XP, moedas e consumindo bônus ativos. |
| **ForjaGame** | **Game / Storage** | Alteração de Estado | Ao vencer, define `hasShield = true`, salva os dados e emite feedback visual. |
| **ExpedicaoGame** | **Game / Storage** | Consumo de Recurso | Ao colidir com obstáculo, consome o escudo (`hasShield = false`) e segue o jogo. |
| **GrimorioGame** | **Game / Storage** | Modificador de Estado | Ao vencer o puzzle 8x8, define `xpMultiplier = 1.2` (Feitiço da Mente Clara). |
| **Shop** | **Game / UI** | Transação & Render | Deduz moedas, equipa itens e aciona re-renderização imediata da sala. |
| **UI (Drag)** | **Game / Storage** | Atualização Posicional | Calcula posição percentual (`x%`, `y%`) do móvel arrastado no touch/mouse. |
| **Storage** | **Dispositivo** | Download / Upload | Exporta e importa saves em arquivos `.json` com migração de versão (`1.0.0`). |
| **App** | **AudioFX** | Gatilho Universal | Dispara efeitos sonoros retro em todos os botões e eventos do jogo via `pointerdown`. |