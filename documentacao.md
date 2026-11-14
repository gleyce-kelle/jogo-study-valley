# Documentação Técnica - Study Valley

## 1. Visão Geral do Projeto
**Study Valley** (Versão `v1.0.0 Beta`) é uma aplicação web gamificada de gerenciamento de tempo de estudo (baseada na Técnica Pomodoro) que combina produtividade com elementos clássicos de RPG. O sistema recompensa o usuário com Experiência (XP), Moedas (💰), Buffs/Feitiços (🔮), Escudos de Proteção (🛡️) e Conquistas (🏆) com base no tempo de estudo dedicado, além de permitir personalização de avatares, decoração do quarto com móveis interativos arrastáveis e execução de mini-games de pausa integrados entre si.

A aplicação funciona **100% no lado do cliente (Client-Side)**, sendo compatível com hospedagem estática via **GitHub Pages**, suportando persistência local, versionamento de schema e backup manual de progresso via download/upload de arquivos `.json`.


## 2. Arquitetura e Estrutura de Arquivos
O projeto é estruturado utilizando uma arquitetura modular em JavaScript nativo (Vanilla JS - ES6+), HTML5 semântico e CSS3 puro, sem dependências de frameworks externos ou etapas de build.

```
study-valley/
│
├── index.html # Interface principal, HUD, cenário, rodapé e estrutura de modais
├── css/
│ ├── style.css # Estilos globais, temas pixel-art, responsividade mobile e modais
│ └── minigames.css # Estilos, layouts responsivos e animações dos mini-games
└── js/
├── app.js # Orquestrador central, atalhos de áudio e listeners de eventos
├── game.js # Lógica de progressão, XP, níveis, multiplicadores e recompensas
├── shop.js # Catálogo de decoração, compras com moedas e inventário
├── timer.js # Temporizador Pomodoro (foco, pausas e contagem regressiva)
├── ui.js # Renderização do DOM, drag-and-drop mobile-friendly e modais
├── storage.js # Persistência (localStorage), versionamento e backup (export/import JSON)
├── audio.js # Síntese sonora procedural retro via Web Audio API
├── minigame-manager.js # Gerenciamento de abertura/fechamento do Fliperama do Vale
└── minigames/
├── forja.js # Mini-game rítmico "A Forja da Concentração" (forja o Escudo)
├── expedicao.js # Mini-game runner 2D "Expedição do Familiar" (consome o Escudo)
└── grimorio.js # Mini-game de encaixe rúnico 8x8 "O Grimório Fragmentado" (buff de XP)
```

## 3. Descrição dos Módulos Principais

### `index.html`
Estrutura semântica retro/pixel-art utilizando a tipografia 'VT323'. Contém:
* **HUD Superior:** Nível, XP, Moedas e menu de ícones de navegação.
* **Cenário Interativo (`.scenario`):** Avatar dinâmico (`#character`), camada de overlays e camada de móveis arrastáveis (`#furniture-layer`).
* **Timer Central:** Cronômetro com botões contextuais (Iniciar Missão, Pausar/Continuar, Abortar e Acesso aos Mini-games).
* **Barra de XP e Rodapé:** Barra de progresso visual de nível, botão modal "Sobre o Study Valley" e identificador de versão (`v1.0.0 Beta`).
* **Sistema de Modais:** Modais para Loja, Conquistas, Configurações (com botões de Backup), Estatísticas, Troca de Avatar, Fliperama e janelas dedicadas de cada mini-game.

### `css/style.css` & `css/minigames.css`
* **Estilização Pixel-Art:** Paleta temática em tons de madeira (`#d4a373`), bordas rústicas e sombras duras retro.
* **Responsividade Mobile Avançada:** Adequação limpa da barra superior em telas estreitas (< 480px) sem sobreposições, rolagem macia (`-webkit-overflow-scrolling: touch`) e regras proporcionais de móveis baseadas na altura do avatar (45% da tela).
* **Escalabilidade dos Mini-Games:** Regras no `minigames.css` com media queries para adaptar a grade 8x8 do Grimório e a arena da Forja até resoluções compactas (320px–360px).

### `js/storage.js` (Persistência, Versionamento e Backup)
* **Controle de Versão:** Constante `CURRENT_VERSION: '1.0.0'` que acompanha cada arquivo de save.
* **Pipeline de Migração (`migrate`):** Identifica saves antigos ou incompletos, preenche propriedades ausentes com valores padrão seguros e atualiza o schema sem perda de progresso.
* **Exportação (`exportSave`):** Converte o estado atual em um arquivo JSON formatado e dispara o download automático (`study-valley-save-v1.0.0-AAAA-MM-DD.json`).
* **Importação (`importSave`):** Lê arquivos JSON enviados pelo usuário, valida a integridade, executa a migração de versão e atualiza o `localStorage`.

### `js/audio.js` (Web Audio API)
* Síntese procedural de ondas quadradas, senoidais e dente-de-serra sem arquivos de áudio externos.
* **Desbloqueio Mobile:** Rotina automática de ativação do `AudioContext` no primeiro toque/clique do usuário.
* **Efeitos Disponíveis:** `click` (interações), `start` (início de foco), `finish` (fim de timer), `coin` (recompensas), `levelUp` (subida de nível/vitórias) e `error` (jogadas inválidas no Grimório).

### `js/app.js` (Orquestrador)
* Atua como Controller da aplicação, unificando os fluxos de Timer, Loja, Mini-games e Configurações.
* **Delegação Global de Sons:** Interceptação unificada via evento `pointerdown`, garantindo feedback sonoro instantâneo em todos os botões estáticos e gerados dinamicamente.
* Controle de sessões de estudo, cálculo de recompensas proporcionais, transição automática para pausas e fila síncrona de conquistas desbloqueadas.

### `js/ui.js` (Apresentação e Interatividade)
* Renderização reativa do HUD, barra de XP, perfil e inventário.
* **Drag-and-Drop Touch-Safe:** Sistema de arrasto em porcentagem (`%`) que bloqueia a rolagem acidental da página no celular (`e.preventDefault()`) enquanto um móvel está sendo movido.
* Gerenciamento de exibição de textos flutuantes, animações de level-up e modais informativos.

---

## 4. Regras de Negócio e Gamificação

### Sistema de Estudo e Pomodoro
* **Sessão Concluída:** Concede **1 XP por minuto estudado** (com base na configuração padrão de 25 min = 25 XP).
* **Sessão Abortada:** Concede XP proporcional apenas aos minutos inteiros decorridos até a desistência.
* **Level Up:** O XP necessário para o próximo nível escala progressivamente. A cada nível alcançado, o jogador recebe moedas proporcionais ao novo nível.

### Sinergia e Integração dos Mini-Games
Os mini-games são acessíveis exclusivamente durante o tempo de descanso/pausa do timer:

1. **A Forja da Concentração (`forja.js`):**
   * Desafio rítmico de precisão de 10 acertos na barra deslizante.
   * **Recompensa:** Concede moedas, XP e **forja o Escudo de Proteção (🛡️)**, salvando `hasShield = true` no estado do jogo.

2. **Expedição do Familiar (`expedicao.js`):**
   * *Endless Runner* onde o familiar (raposa 🦊) pula obstáculos e coleta moedas no percurso.
   * **Mecânica do Escudo:** Se o jogador tiver forjado o escudo anteriormente, um ícone `.expedicao-shield-indicator` é exibido na tela. Ao colidir com o primeiro obstáculo, o escudo absorve o dano, destrói a rocha e é consumido (`hasShield = false`), permitindo continuar correndo sem perder os pontos acumulados.
   * **Fim de Jogo:** Apresenta um pop-up centralizado exibindo a pontuação final e as moedas obtidas (1 moeda a cada 100 pontos).

3. **O Grimório Fragmentado (`grimorio.js`):**
   * Quebra-cabeça espacial de encaixe rúnico em grade **8x8**.
   * **Recompensa:** Ao preencher todo o tabuleiro, concede o status **Feitiço da Mente Clara**, multiplicando o XP da próxima sessão de estudo completa em **+20%** (`xpMultiplier = 1.2`).

### Sistema de Decoração da Sala
* Móveis comprados na Loja são salvos no inventário (`inventory`).
* Itens equipados (`equippedItems`) são renderizados na camada `.furniture-layer` com coordenadas salvas em porcentagem (`x%`, `y%`).
* Dimensões de mesas, camas, estantes e plantas respeitam limites CSS rígidos para manter proporção harmoniosa com o avatar.