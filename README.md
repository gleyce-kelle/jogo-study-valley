# 📚 Study Valley

> Uma ferramenta de produtividade gamificada no estilo *cozy RPG*, que transforma suas sessões de estudo em uma jornada de evolução, conquistas, decoração e mini-games.

![Versão](https://img.shields.io/badge/versão-v1.0.0%20Beta-558b2f?style=for-the-badge)
![Tecnologias](https://img.shields.io/badge/Vanilla-HTML5%20%7C%20CSS3%20%7C%20JS-d4a373?style=for-the-badge)
![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-2d1b2e?style=for-the-badge)

---

## 📖 Sobre o Projeto

**Study Valley** é um aplicativo web focado na técnica Pomodoro, projetado para tornar os momentos de estudo mais divertidos e motivadores. A cada ciclo de foco concluído, você ganha experiência (XP) e moedas que podem ser usadas para subir de nível, desbloquear conquistas e personalizar o seu próprio espaço virtual com móveis e decorações.

O projeto funciona **100% no navegador (Client-Side)**, dispensando servidores backend ou configurações complexas, podendo ser jogado tanto no computador quanto no celular.

---

## ✨ Principais Funcionalidades

### ⏱️ Temporizador Pomodoro Flexível
* Configuração customizável dos tempos de foco e descanso.
* Modos de execução: **Foco total**, **Pausado** e **Tempo de Descanso**.
* Opção de auto-início para pausas e novas sessões.

### 🎮 Gamificação e Progressão
* **Sistema de Níveis & XP:** Ganhe XP ao completar missões de foco e suba o nível do seu personagem.
* **Economia Interna:** Acumule moedas por tarefas concluídas e minijogos superados.
* **Estatísticas de Desempenho:** Acompanhe minutos totais estudados, sessões concluídas e recorde de maior sessão.

### 🏠 Customização do Cenário (Drag & Drop)
* **Loja de Móveis:** Adquira camas, mesas, tapetes, plantas e decorações para personalizar o quarto.
* **Arraste e Solte Responsivo:** Posicione os móveis livremente com suporte completo para **mouse** e **telas de toque (Mobile Touch)** sem rolagem indesejada de tela.
* **Posicionamento Salvo:** As posições e decorações equipadas permanecem organizadas e salvas em coordenadas relativas (`%`).

### 💾 Backup e Versionamento de Progresso
* **Exportar Save:** Baixe seu progresso com um clique em um arquivo `.json` para guardar de backup ou transferir entre celular e PC.
* **Importar Save:** Carregue seu arquivo de save a qualquer momento com validação de dados.
* **Versionamento Automático (`v1.0.0`):** Sistema com migração automática para garantir que atualizações futuras nunca quebrem o save do jogador.

### 🏆 Sistema de Conquistas
Marcos progressivos com recompensas em XP e moedas ao atingir grandes realizações:
* **Tempo de Estudo:** 100 minutos, 240 minutos e 8 horas totais.
* **Sessões Concluídas:** 10, 25 e 50 missões finalizadas.
* **Progressão de Personagem:** Alcance o Nível 10, Nível 20 e Nível 30.

---

## 🕹️ Mini-games de Pausa com Sinergia

Durante o tempo de descanso do Pomodoro, você pode relaxar e acumular bônus jogando três mini-games exclusivos conectados entre si:

1. 🔨 **Forja:** Um jogo de precisão rítmica (*timing*) onde acertar o martelo na zona ideal rende moedas, XP e **forja um Escudo de Proteção (🛡️)**.
2. 🦊 **Expedição:** Um minijogo estilo *endless runner* onde seu familiar pula obstáculos e coleta moedas pelo caminho. Se você tiver forjado o escudo na Forja, ele **absorve o primeiro impacto** com obstáculos, salvando sua corrida!
3. 📜 **Grimório:** Um quebra-cabeça rúnico em matriz **8x8** onde o encaixe correto de peças mágicas conjura o **Feitiço da Mente Clara**, concedendo **+20% de XP bônus** na próxima sessão de estudos.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estrutura semântica, formulários de configurações e gerenciamento de modais.
* **CSS3:** Animações pixel-art, fontes retro ('VT323'), proporções relativas e layouts responsivos para celulares e desktops.
* **JavaScript (ES6+):** Programação orientada a objetos modular para estado global, física 2D dos mini-games, drag-and-drop e temporização.
* **Web Audio API:** Síntese procedural de efeitos sonoros retro em tempo real, sem necessidade de arquivos externos de áudio.
* **LocalStorage & File API:** Persistência durável no navegador com exportação e importação de backups em formato JSON.

---

## 🚀 Como Executar o Projeto

Como o projeto é estático e não requer build:

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/study-valley.git