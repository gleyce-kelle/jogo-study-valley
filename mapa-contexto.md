# Mapa de Contexto - Study Valley

## 1. Visão Geral dos Contextos Delimidados (*Bounded Contexts*)

O sistema é dividido em 5 contextos principais que interagem entre si para manter o fluxo de produtividade e gamificação:

```
+-----------------------------------------------------------------------------------+
|                                 APP.JS (Orquestrador)                             |
+-----------------------------------------------------------------------------------+
|                                    |                               |
v                                    v                               v
+-----------------------+           +----------------------+        +-----------------------+
|    TIMER CONTEXT      |           | GAMIFICATION CONTEXT |        |  STORAGE / STATE      |
| (Gerenciamento de     | --------> | (XP, Níveis, Moedas  | <----->|  CONTEXT              |
|  Tempo e Foco)        |           |  e Conquistas)       |        | (Persistência Local)  |
+-----------------------+           +----------------------+        +-----------------------+
|                                    |                               |
|                                    v                               |
|                         +----------------------+                   |
+-----------------------> |    UI / PRESENTATION | <-----------------+
|     CONTEXT          |
| (DOM, Modais, Avatares)|
+----------------------+
^
|
+----------------------+
| MINI-GAMES CONTEXT   |
| (Acesso na Pausa)    |
+----------------------+
```

## 2. Descrição Detalhada dos Contextos

### A. Contexto de Temporização (`timer.js`)
* **Responsabilidade:** Gerenciar o fluxo temporal das sessões de estudo e pausas.
* **Entidades/Estados:** Contagem regressiva em segundos, estados de execução (`studying`, `paused`, `break`, `idle`).
* **Comunicação:** Emite sinais de conclusão para o orquestrador (`app.js`), que aciona as regras de recompensa.

### B. Contexto de Gamificação (`game.js`)
* **Responsabilidade:** Processar as regras de negócio de ganho de progressão e conquistas.
* **Componentes:** 
  * Cálculo dinâmico de XP e limiares de nível.
  * Atribuição de moedas proporcionais ao tempo estudado.
  * Validação de regras e fila de processamento de conquistas (`achievementQueue`).
* **Comunicação:** Recebe dados de tempo concluído e atualiza o estado global do jogo.

### C. Contexto de Estado e Persistência (`storage.js`)
* **Responsabilidade:** Garantir a durabilidade dos dados do usuário entre sessões do navegador.
* **Componentes:** Interface de comunicação com o `localStorage` (salvamento e carregamento de XP, nível, moedas, avatares, histórico e configurações).
* **Comunicação:** Fornece o estado inicial ao carregar a aplicação e recebe atualizações sempre que recompensas ou configurações são modificadas.

### D. Contexto de Interface e Apresentação (`ui.js`)
* **Responsabilidade:** Traduzir o estado técnico do sistema em elementos visuais amigáveis.
* **Componentes:** 
  * Atualização de barras de progresso e textos em tempo real.
  * Renderização dinâmica de sprites de avatares (`idle`, `studying`).
  * Gerenciamento de modais (Configurações, Estatísticas, Perfil, Loja e Notificações de Conquistas).
* **Comunicação:** Escuta alterações de estado e redesenha a tela de acordo com o modo atual (Foco vs. Pausa).

### E. Contexto de Entretenimento / Mini-Games (Expansão)
* **Responsabilidade:** Fornecer entretenimento interativo durante os ciclos de descanso.
* **Componentes:** Botão condicional de acesso rápido (`#btn-mini-games`) que só é renderizado quando o usuário entra no modo de pausa.

---

## 3. Matriz de Integração e Fluxo de Dados

| Origem | Destino | Tipo de Interação | Descrição |
| :--- | :--- | :--- | :--- |
| **Timer** | **App** | Evento de Conclusão (`callback`) | Informa que o ciclo de estudo terminou e envia os minutos acumulados. |
| **App** | **Game** | Chamada de Método | Solicita o cálculo de recompensas (`addReward`) com base nos minutos estudados. |
| **Game** | **Storage** | Persistência | Salva o novo estado atualizado (XP, Moedas, Nível, Conquistas) no navegador. |
| **Game** | **UI** | Renderização | Atualiza a interface gráfica com os novos valores de XP e barra de progresso. |
| **App** | **UI** | Mudança de Estado (`setMode`) | Altera visualmente a interface entre modo de foco, pausa ou descanso (exibindo ou ocultando o botão de mini-games). |