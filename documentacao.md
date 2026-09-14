# Documentação Técnica - Study Valley

## 1. Visão Geral do Projeto
**Study Valley** é uma aplicação web gamificada de gerenciamento de tempo de estudo (baseada na Técnica Pomodoro) que combina produtividade com elementos clássicos de RPG. O sistema recompensa o usuário com Experiência (XP), Moedas (💰), Buffs/Feitiços (🔮) e Conquistas (🏆) com base no tempo de estudo dedicado, além de permitir a personalização de avatares, decoração do quarto com móveis interativos e execução de mini-games interativos durante os intervalos de pausa.


## 2. Arquitetura e Estrutura de Arquivos
O projeto é estruturado utilizando uma arquitetura modular em JavaScript nativo (Vanilla JS), HTML5 e CSS3, sem dependências de frameworks externos.

```
study-valley/
│
├── index.html                  # Interface principal, HUD, cenário e estrutura de modais
├── css/
│   ├── style.css               # Estilos globais, temas, posicionamento, proporções de móveis e responsividade
│   └── minigames.css           # Estilos e layouts específicos dos mini-games
└── js/
├── app.js                  # Orquestrador principal com seleção segura via DOM
├── game.js                 # Lógica de regras de negócio, XP, níveis, Buffs e posições de móveis
├── shop.js                 # Catálogo da loja, compras e gerenciamento de inventário
├── timer.js                # Gerenciamento de tempo (estudo e pausas)
├── ui.js                   # Renderização visual, drag-and-drop de móveis e manipulação do DOM
├── storage.js              # Persistência de dados locais (localStorage)
├── audio.js                # Gerenciamento de efeitos sonoros (Web Audio API)
├── minigame-manager.js     # Gerenciador de inicialização dos mini-games
└── minigames/
├── forja.js            # Mini-game "A Forja da Concentração"
├── expedicao.js        # Mini-game "Expedição do Familiar"
└── grimorio.js         # Mini-game "O Grimório Fragmentado"
```
## 3. Descrição dos Módulos Principais

### `index.html`
Estrutura a interface no formato retro/pixel-art. Contém:
* **HUD Superior:** Nível, XP, Moedas, Indicador de Buff Ativo (`#buff-display`) e botões de navegação.
* **Cenário (`.scenario`):** Exibição dinâmica do avatar (`#character`), camada de overlays e camada interativa de móveis (`#furniture-layer`).
* **Timer Central:** Cronômetro com botões contextuais (Iniciar, Pausar, Abortar, Pular Pausa e Acesso aos Mini-games).
* **Modais:** Perfil, Loja/Decoração, Conquistas, Configurações, Estatísticas, Seleção de Mini-games e Modais dedicados de cada Mini-game.

### `css/style.css` & `css/minigames.css`
Gerenciam a identidade visual pixel-art (fonte 'VT323'). 
* **Sistema de Móveis e Escala:** Regras responsivas baseadas no atributo `src` (`[src*="mesa"]`, `[src*="estante"]`, `[src*="planta"]`) que garantem que os objetos fiquem proporcionalmente alinhados em relação à altura do avatar (45% da tela).
* **Camadas de Profundidade:** Organização de z-index (`.layer-base`, `.layer-surface`) para sobreposição realista de móveis e avatar.
* **Responsividade:** Suporte completo para telas mobile e desktop através de `aspect-ratio: 16/9` e unidades relativas (`%`).

### `js/app.js`
Atua como o **Controller** principal da aplicação:
* Utiliza busca direta no DOM (`document.getElementById`) com checagens defensivas (*failsafes*) para evitar travamentos.
* Gerencia os eventos da Loja, salvamento do posicionamento da decoração (`btnSaveFurniture`) e equipagem de itens.
* Conecta os modais de navegação, configurações, perfis e o menu do Fliperama.
* Controla o fluxo de alternância entre estados de Foco, Pausa, Aplicação de Buffs, Salvamento de Estado e Fila de Conquistas (`achievementQueue`).

### `js/ui.js`
Gerencia a renderização do estado do sistema no DOM e a interatividade da cena:
* **Sistema Drag-and-Drop Responsivo:** Trata eventos de mouse (`mousemove`, `mouseup`) e touch/celular (`touchmove`, `touchend`).
* **Cálculo Posicional:** Converte movimentos do cursor em porcentagens relativas (`%`) ao container pai (`#furniture-layer`), mantendo limites de margem para evitar que móveis saiam do cenário.
* **Renderização de Móveis (`renderFurniture`):** Desenha dinamicamente os itens equipados no cenário aplicando posições personalizadas salvas pelo jogador.

### `js/game.js`
Gerencia o estado global do jogo, progressão do jogador e customizações:
* Cálculo dinâmico do XP necessário para *Level Up*.
* Registro dos itens comprados (`purchasedItems`), itens equipados (`equippedItems`) e suas coordenadas na sala (`furniturePositions`).
* Processamento de recompensas com multiplicadores ativos (ex: Buffs) e registro de estatísticas.

### `js/shop.js`
Gerencia o catálogo de itens decorativos, avatares e transações econômicas:
* Validação de moedas disponíveis para compra.
* Alternância de estados de itens (Comprar / Equipar / Desequipar).
* Integração com o módulo `UI` para re-renderizar o cenário e a loja em tempo real.

### `js/minigames/` (`forja.js`, `expedicao.js`, `grimorio.js`)
Módulos autônomos que rodam no escopo do navegador (`window.*Game`):
* **`forja.js`:** Desafio rítmico/temporal de precisão em barra deslizante.
* **`expedicao.js`:** Runner 2D estilo *Endless Runner* em canvas/divs com gravidade e colisão em tempo real.
* **`grimorio.js`:** Quebra-cabeça espacial de preenchimento de matriz 4x4 por peças de runas geométricas.

---

## 4. Regras de Negócio e Gamificação

### Sistema de Decoração e Posicionamento
* Os móveis são adquiridos na Loja utilizando moedas obtidas em estudos ou mini-games.
* O jogador pode arrastar qualquer móvel equipado dentro do cenário tanto pelo PC quanto pelo celular.
* A posição de cada objeto é armazenada em coordenadas percentuais (`x%`, `y%`), garantindo consistência em qualquer tamanho ou orientação de tela.
* As dimensões dos móveis são limitadas proporcionalmente via CSS baseando-se na altura do avatar:
  * **Mesas:** Max height ~30% / Max width ~28%
  * **Estantes:** Max height ~30% / Max width ~15%
  * **Plantas/Acessórios:** Max height ~15% / Max width ~10%

### Sistema de XP, Níveis e Multiplicadores (Buffs)
* Cada minuto de estudo concluído concede **10 XP** e moedas proporcionais (**1 moeda a cada 5 minutos**).
* **Buff "Mente Clara" (`MENTE_CLARA`):** Obtido ao vencer o mini-game *O Grimório Fragmentado*. Concede **+20% de XP bônus** na conclusão da próxima sessão de estudo completa, sendo consumido imediatamente após o término.
* O limiar de XP para subir de nível escala com `Nível * 100`.

### Sistema de Mini-Games (Fliperama do Vale)
Disponíveis exclusivamente durante o tempo de pausa do timer:
1. **A Forja da Concentração:** O jogador deve acertar o cursor na zona verde 5 vezes para concluir a fabricação de equipamentos.
2. **Expedição do Familiar:** Jogo de corrida e pulo onde o jogador controla o familiar para coletar moedas (+10 pontos cada) e desviar de obstáculos vermelhos. Pontos convertem-se em moedas ao final.
3. **O Grimório Fragmentado:** Puzzle de encaixe onde peças geométricas rúnicas precisam preencher totalmente uma grade 4x4. A vitória concede o efeito de status **Feitiço da Mente Clara (+20% XP)**.

### Sistema de Conquistas (Achievements)
Monitora continuamente os marcos do jogador e exibe modais através de uma fila síncrona:
* **"Estudou por 100 minutos"**: `totalStudyMinutes >= 100` (Recompensa: 5 XP, 5 Moedas).
* **"Estudou por 10 sessões"**: `sessionsCompleted >= 10` (Recompensa: 10 XP, 10 Moedas).
* **"Atingiu Level 10"**: `level >= 10` (Recompensa: 100 XP, 100 Moedas).