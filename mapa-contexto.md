# Mapa de Contexto - Study Valley

## 1. Visão Geral dos Contextos Delimidados (*Bounded Contexts*)

O sistema é estruturado em contextos bem definidos que interagem de forma desacoplada por meio do orquestrador (`app.js`):

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
## 2. Descrição Detalhada dos Contextos

### A. Contexto de Temporização (`timer.js`)
* **Responsabilidade:** Gerenciar a contagem regressiva e transições de ciclo de foco e descanso.
* **Estados:** `studying`, `paused`, `break`, `idle`.
* **Comunicação:** Dispara callbacks no término do tempo informando os minutos corridos para o `app.js`.

### B. Contexto de Gamificação e Estado (`game.js`)
* **Responsabilidade:** Processar lógica de progressão, acúmulo de moedas, nível, conquistas, modificadores de estado (*Buffs*) e dados de personalização da sala.
* **Componentes:**
  * Processador de recompensas (`addReward`) com suporte a modificadores (`MENTE_CLARA` = +20% XP).
  * Fila de Conquistas (`checkAchievements`).
  * Registro de Móveis Salvos (`furniturePositions`), Equipados (`equippedItems`) e Comprados (`purchasedItems`).
* **Comunicação:** Recebe solicitações de atualização de progresso do `app.js` e persiste o novo estado no `Storage`.

### C. Contexto de Loja e Decoração (`shop.js`)
* **Responsabilidade:** Gerenciar transações de compra de itens decorativos/avatares e equipagem no cenário.
* **Componentes:** Catálogo de móveis, validação de moedas e controle do estado de inventário.
* **Comunicação:** Atualiza a carteira do jogador no `Game` e notifica o contexto de `UI` para re-renderizar o quarto.

### D. Contexto de Estado e Persistência (`storage.js`)
* **Responsabilidade:** Garantir a durabilidade dos dados no `localStorage`.
* **Dados Persistidos:** Nível, XP, Moedas, Minutos Totais, Sessões Concluídas, Avatar Selecionado, Configurações do Timer, Conquistas Resgatadas, Buff Ativo (`activeBuff`), Itens Comprados/Equipados e Posições dos Móveis (`furniturePositions`).

### E. Contexto de Entretenimento / Mini-Games (`minigames/`)
* **Responsabilidade:** Prover experiências interativas de gameplay durante os intervalos de pausa.
* **Componentes:**
  * `ForjaGame`: Lógica rítmica de precisão.
  * `ExpedicaoGame`: Loop de física 2D (gravidade, pulo e colisão).
  * `GrimorioGame`: Validação de posicionamento matricial de peças.
* **Comunicação:** Concede moedas diretamente ao `Game.state` ou define Buffs ativos ao vencer desafios.

### F. Contexto de Interface e Apresentação (`ui.js` & HTML/CSS)
* **Responsabilidade:** Renderização do estado do sistema no DOM e manipulação interativa da cena.
* **Componentes:**
  * Atualização da barra de XP, modal de conquistas e indicador de Buff (`#buff-display`).
  * Sistema de Drag-and-Drop em porcentagem para posicionamento de móveis em telas de qualquer resolução (Mouse/Touch).
  * Regras CSS de auto-escala para garantir proporção visual adequada entre móveis, cenário e avatar.

---

## 3. Matriz de Integração e Fluxo de Dados

| Origem | Destino | Tipo de Interação | Descrição |
| :--- | :--- | :--- | :--- |
| **Timer** | **App** | Callback de Conclusão | Notifica o fim da sessão de estudo/pausa enviando os minutos decorridos. |
| **App** | **Game** | Chamada de Método | Executa `addReward(minutes, completed)`, calculando XP bônus caso haja Buff ativo. |
| **UI (Drag)** | **Game** | Atualização Posicional | Calcula a nova posição `%` do móvel arrastado e salva em `Game.state.furniturePositions`. |
| **Shop** | **Game / UI** | Transação & Render | Deduz moedas no `Game`, equipa/desequipa o item e chama `UI.renderFurniture()`. |
| **GrimorioGame** | **Game** | Alteração de Estado | Define `activeBuff = 'MENTE_CLARA'` ao completar o quebra-cabeça. |
| **ExpedicaoGame** | **Game** | Adição de Recurso | Adiciona moedas diretamente à carteira do jogador com base no score. |
| **Game** | **Storage** | Persistência | Grava no `localStorage` após qualquer alteração em XP, moedas, nível, móveis ou buffs. |
| **App** | **UI** | Atualização Visual | Atualiza textos, re-renderiza móveis/cenário, ajusta indicadores e gerencia modais. |
| **App** | **MiniGames** | Controle de Execução | Dispara métodos `.start()` e `.stop()` dos mini-games ao abrir/fechar modais ou encerrar pausas. |