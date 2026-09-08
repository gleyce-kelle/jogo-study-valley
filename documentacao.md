# Documentação Técnica - Study Valley

## 1. Visão Geral do Projeto
**Study Valley** é uma aplicação web gamificada de gerenciamento de tempo de estudo (baseada na Técnica Pomodoro) que combina produtividade com elementos clássicos de RPG. O sistema recompensa o usuário com Experiência (XP), Moedas (💰) e Conquistas (🏆) com base no tempo de estudo dedicado, além de permitir a personalização de avatares e futura integração com mini-games durante os intervalos.

---

## 2. Arquitetura e Estrutura de Arquivos
O projeto é estruturado utilizando uma arquitetura modular em JavaScript nativo (Vanilla JS), HTML5 e CSS3, mantendo alta performance e sem dependências de frameworks externos.

```
study-valley/
│
├── index.html          # Interface principal e estrutura de modais
├── css/
│   └── style.css       # Estilos globais, temas, animações e responsividade
└── js/
    ├── app.js          # Orquestrador principal e controle de fluxo de eventos
    ├── game.js         # Lógica central de regras de negócio, XP e níveis
    ├── timer.js        # Gerenciamento de tempo (estudo e pausas)
    ├── ui.js           # Renderização de elementos visuais e manipulação do DOM
    ├── storage.js      # Persistência de dados locais (localStorage)
    └── audio.js        # Gerenciamento de efeitos sonoros

```

## 3. Descrição dos Módulos Principais

### `index.html`
Responsável por estruturar a interface em formato de painéis retrô/pixel-art. Contém os elementos da barra superior (estatísticas e menus), a área do cenário (avatar), o cronômetro central e o sistema de modais (Configurações, Estatísticas, Perfil, Loja, Conquistas e Notificações de Conquistas Desbloqueadas).

### `style.css`
Implementa a identidade visual inspirada em jogos clássicos (utilizando a fonte 'VT323'). Gerencia temas baseados em variáveis CSS (`:root`), estados visuais dos avatares (`idle`, `studying`), efeitos flutuantes (`floating-text`) e design responsivo otimizado para múltiplos tamanhos de tela.

### `js/app.js`
Atua como o **Controller** principal da aplicação. Escuta eventos de clique, gerencia o fluxo de transição entre sessões de estudo, pausas e telas de descanso, e controla a fila síncrona de processamento de conquistas (`achievementQueue`).

### `js/game.js`
Gerencia o estado global do jogo e o progresso do usuário:
* Cálculo dinâmico do XP necessário para subir de nível.
* Atribuição de recompensas de XP e Moedas proporcionais aos minutos estudados.
* Registro de métricas cumulativas (minutos totais de estudo, sessões concluídas e recorde de maior sessão).

### `js/timer.js`
Controla a contagem regressiva baseada em segundos utilizando `setInterval`. Gerencia os estados de execução, pausa e conclusão para os ciclos de foco e descanso.

### `js/ui.js`
Responsável pela manipulação do DOM e renderização de interface. Atualiza barras de progresso de XP, renderiza avatares dinamicamente, gerencia a abertura e fechamento de modais e lista o status de desbloqueio das conquistas.

---

## 4. Regras de Negócio e Sistemas de Gamificação

### Sistema de Experiência (XP) e Níveis (`Lvl`)
* Cada minuto de estudo concluído com sucesso converte-se em pontos de XP e Moedas de forma proporcional.
* O limiar de XP escala por nível. Ao atingir o teto necessário, o nível do personagem é incrementado, disparando efeitos visuais e sonoros específicos de *Level Up*.

### Sistema de Conquistas (Achievements)
O sistema monitora o estado global do usuário e dispara notificações modais imediatas através de uma fila de execução para evitar sobreposição de janelas:
* **"Estudou por 100 minutos"**: Desbloqueado quando `totalStudyMinutes >= 100`. Recompensa: **5 XP** e **5 Moedas**.
* **"Estudou por 10 sessões"**: Desbloqueado quando `sessionsCompleted >= 10`. Recompensa: **10 XP** e **10 Moedas**.
* **"Atingiu Level 10"**: Desbloqueado quando `level >= 10`. Recompensa: **100 XP** e **100 Moedas**.

---

## 5. Especificação de Interface da Pausa e Mini-Games
Durante o ciclo de descanso, a interface oculta os botões de controle de foco e habilita o botão de acesso rápido aos mini-games (`#btn-mini-games`) estilizado com a classe dedicada `.btn.btn-rpg-destaque`.

Conceitos estruturados para expansão futura:
* **A Forja da Concentração**: Mini-game rítmico de *crafting* baseado no acerto de marcações temporais.
* **Expedição do Familiar**: Aventura em texto baseada em tomadas de risco e gerenciamento de energia do pet.
* **O Grimoire Fragmentado**: Puzzle espacial de encaixe de peças rúnicas sob restrição de tempo.