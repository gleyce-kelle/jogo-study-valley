# Mapa de Contexto - Study Valley

## 1. Visão Geral dos Contextos Delimidados (*Bounded Contexts*)

O sistema é estruturado em contextos bem definidos que interagem de forma desacoplada por meio do orquestrador (`app.js`):

```
+-----------------------------------------------------------------------------------+
|                                 APP.JS (Orquestrador)                             |
+-----------------------------------------------------------------------------------+
|                   |                     |                      |
v                   v                     v                      v
+------------+  +------------------+  +------------------+  +-----------------------+
|   TIMER    |  |   GAMIFICATION   |  |  STORAGE / STATE |  |      MINI-GAMES       |
|  CONTEXT   |  |     CONTEXT      |  |     CONTEXT      |  |        CONTEXT        |
| (Contagem  |  | (XP, Buffs,      |  |  (Persistência   |  | (Forja, Expedição e   |
| e Pausas)  |  |  Moedas, Level)  |  |     Local)       |  |  Grimório - Pausa)    |
+------------+  +------------------+  +------------------+  +-----------------------+
|                   |                     |                      |
+-------------------+----------+----------+----------------------+
|
v
+--------------------+
| UI / PRESENTATION  |
|      CONTEXT       |
| (DOM, Modais, HUD) |
+------
```
## 2. Descrição Detalhada dos Contextos

### A. Contexto de Temporização (`timer.js`)
* **Responsabilidade:** Gerenciar a contagem regressiva e transições de ciclo de foco e descanso.
* **Estados:** `studying`, `paused`, `break`, `idle`.
* **Comunicação:** Dispara callbacks no término do tempo informando os minutos corridos para o `app.js`.

### B. Contexto de Gamificação (`game.js`)
* **Responsabilidade:** Processar lógica de progressão, acúmulo de moedas, nível, conquistas e modificadores de estado (*Buffs*).
* **Componentes:**
  * Processador de recompensas (`addReward`) com suporte a modificadores (`MENTE_CLARA` = +20% XP).
  * Fila de Conquistas (`checkAchievements`).
* **Comunicação:** Recebe solicitações de atualização de progresso do `app.js` e persiste o novo estado no `Storage`.

### C. Contexto de Estado e Persistência (`storage.js`)
* **Responsabilidade:** Garantir a durabilidade dos dados no `localStorage`.
* **Dados Persistidos:** Nível, XP, Moedas, Minutos Totais, Sessões Concluídas, Avatar Selecionado, Configurações do Timer, Conquistas Resgatadas e Buff Ativo (`activeBuff`).

### D. Contexto de Entretenimento / Mini-Games (`minigames/`)
* **Responsabilidade:** Prover experiências interativas de gameplay durante os intervalos de pausa.
* **Componentes:**
  * `ForjaGame`: Lógica rítmica de precisão.
  * `ExpedicaoGame`: Loop de física 2D (gravidade, pulo e colisão).
  * `GrimorioGame`: Validação de posicionamento matricial de peças.
* **Comunicação:** Concede moedas diretamente ao `Game.state` ou define Buffs ativos ao vencer desafios.

### E. Contexto de Interface e Apresentação (`ui.js` & HTML/CSS)
* **Responsabilidade:** Renderização do estado do sistema no DOM.
* **Componentes:** Atualização da barra de XP, modal de conquistas, exibição do indicador de Buff (`#buff-display`), animação de números flutuantes e renderização de avatares.

---

## 3. Matriz de Integração e Fluxo de Dados

| Origem | Destino | Tipo de Interação | Descrição |
| :--- | :--- | :--- | :--- |
| **Timer** | **App** | Callback de Conclusão | Notifica o fim da sessão de estudo/pausa enviando os minutos decorridos. |
| **App** | **Game** | Chamada de Método | Executa `addReward(minutes, completed)`, calculando XP bônus caso haja Buff ativo. |
| **GrimorioGame** | **Game** | Alteração de Estado | Define `activeBuff = 'MENTE_CLARA'` ao completar o quebra-cabeça. |
| **ExpedicaoGame** | **Game** | Adição de Recurso | Adiciona moedas diretamente à carteira do jogador com base no score. |
| **Game** | **Storage** | Persistência | Grava no `localStorage` após qualquer alteração em XP, moedas, nível ou buffs. |
| **App** | **UI** | Atualização Visual | Atualiza textos, exibe/oculta o ícone `🔮 +20% XP` e gerencia abertura de modais. |
| **App** | **MiniGames** | Controle de Execução | Dispara métodos `.start()` e `.stop()` dos mini-games ao abrir/fechar modais ou encerrar pausas. |