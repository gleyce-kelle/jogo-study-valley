window.ExpedicaoGame = {
    container: null,
    scoreEl: null,
    btnStart: null,
    isActive: false,
    animationId: null,
    score: 0,
    player: { y: 0, velocity: 0, width: 30, height: 30, el: null },
    gravity: 0.6,
    jumpPower: -10,
    entities: [],
    frameCount: 0,

    init: function() {
        this.container = document.getElementById('expedicao-container');
        this.scoreEl = document.getElementById('expedicao-score');
        this.btnStart = document.getElementById('btn-start-expedicao');

        // Controles de Pulo (Espaço ou Clique no container)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isActive) {
                e.preventDefault();
                this.jump();
            }
        });
        
        if (this.container) {
            this.container.addEventListener('mousedown', (e) => {
                e.preventDefault();
                if (this.isActive) this.jump();
            });
            this.container.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.isActive) this.jump();
            });
        }
    },

    start: function() {
        if (this.isActive) return;
        
        // Failsafe: se init não rodou, roda agora
        if (!this.container) this.init();
        if (!this.container) {
            console.error("Container do minigame Expedição não encontrado!");
            return;
        }

        this.isActive = true;
        this.score = 0;
        this.frameCount = 0;
        this.entities = [];
        
        if (this.scoreEl) this.scoreEl.innerText = '0';
        if (this.btnStart) this.btnStart.style.display = 'none';
        
        this.container.innerHTML = ''; // Limpa o container totalmente

        // Cria o Jogador (Familiar) com cor VERDE para se destacar no azul
        this.player.y = (this.container.clientHeight || 200) - this.player.height;
        this.player.velocity = 0;
        this.player.el = document.createElement('div');
        this.player.el.style.width = this.player.width + 'px';
        this.player.el.style.height = this.player.height + 'px';
        this.player.el.style.backgroundColor = '#2ecc71'; // Verde brilhante
        this.player.el.style.borderRadius = '50%';
        this.player.el.style.position = 'absolute';
        this.player.el.style.left = '30px';
        this.player.el.style.top = this.player.y + 'px';
        this.player.el.style.boxShadow = '0 0 10px rgba(46, 204, 113, 0.8)';
        this.container.appendChild(this.player.el);

        // Chão decorativo
        const ground = document.createElement('div');
        ground.style.position = 'absolute';
        ground.style.bottom = '0';
        ground.style.width = '100%';
        ground.style.height = '4px';
        ground.style.backgroundColor = '#34495e';
        this.container.appendChild(ground);

        this.loop();
    },

    stop: function() {
        this.isActive = false;
        cancelAnimationFrame(this.animationId);
        if (this.btnStart) {
            this.btnStart.style.display = 'block';
            this.btnStart.innerText = 'INICIAR EXPEDIÇÃO!';
        }
    },

    jump: function() {
        const floorY = (this.container.clientHeight || 200) - this.player.height;
        if (this.player.y >= floorY - 2) { 
            this.player.velocity = this.jumpPower;
        }
    },

    loop: function() {
        if (!this.isActive) return;

        this.updatePlayer();
        this.spawnEntities();
        this.updateEntities();
        this.checkCollisions();

        this.frameCount++;
        this.animationId = requestAnimationFrame(() => this.loop());
    },

    updatePlayer: function() {
        this.player.velocity += this.gravity;
        this.player.y += this.player.velocity;

        const floorY = (this.container.clientHeight || 200) - this.player.height;
        if (this.player.y > floorY) {
            this.player.y = floorY;
            this.player.velocity = 0;
        }

        this.player.el.style.top = this.player.y + 'px';
    },

    spawnEntities: function() {
        if (this.frameCount % 90 === 0) {
            this.createEntity('obstacle');
        } else if (this.frameCount % 120 === 0) {
            this.createEntity('coin');
        }
    },

    createEntity: function(type) {
        const cWidth = this.container.clientWidth || 400;
        const cHeight = this.container.clientHeight || 200;
        
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.left = cWidth + 'px';
        
        let entity = { el: el, x: cWidth, type: type, width: 20, height: 20 };

        if (type === 'obstacle') {
            entity.width = 25;
            entity.height = 30;
            el.style.width = entity.width + 'px';
            el.style.height = entity.height + 'px';
            el.style.backgroundColor = '#e74c3c'; // Vermelho
            el.style.top = (cHeight - entity.height) + 'px';
        } else if (type === 'coin') {
            entity.width = 20;
            entity.height = 20;
            el.style.width = entity.width + 'px';
            el.style.height = entity.height + 'px';
            el.style.backgroundColor = '#f1c40f'; // Amarelo
            el.style.borderRadius = '50%';
            el.style.top = (cHeight - entity.height - 40 - Math.random() * 50) + 'px';
        }

        this.container.appendChild(el);
        this.entities.push(entity);
    },

    updateEntities: function() {
        const speed = 4 + (this.score * 0.05);

        for (let i = this.entities.length - 1; i >= 0; i--) {
            let ent = this.entities[i];
            ent.x -= speed;
            ent.el.style.left = ent.x + 'px';

            if (ent.x + ent.width < 0) {
                this.container.removeChild(ent.el);
                this.entities.splice(i, 1);
            }
        }
    },

    checkCollisions: function() {
        const px = 30;
        const py = this.player.y;
        const pw = this.player.width;
        const ph = this.player.height;
        const shrink = 5; 

        for (let i = this.entities.length - 1; i >= 0; i--) {
            let ent = this.entities[i];
            let ex = ent.x;
            let ey = parseInt(ent.el.style.top || 0);
            let ew = ent.width;
            let eh = ent.height;

            if (px + shrink < ex + ew && px + pw - shrink > ex && py + shrink < ey + eh && py + ph - shrink > ey) {
                if (ent.type === 'coin') {
                    this.score += 10;
                    if (this.scoreEl) this.scoreEl.innerText = this.score;
                    this.container.removeChild(ent.el);
                    this.entities.splice(i, 1);
                    if(window.AudioFX && window.AudioFX.coin) window.AudioFX.coin();
                } else if (ent.type === 'obstacle') {
                    this.gameOver();
                }
            }
        }
    },

    gameOver: function() {
        this.isActive = false;
        cancelAnimationFrame(this.animationId);
        
        const gameOverText = document.createElement('div');
        gameOverText.innerHTML = `<strong>FIM DE JOGO</strong><br><span style="font-size:16px;">Pontos: ${this.score}</span>`;
        gameOverText.style.position = 'absolute';
        gameOverText.style.top = '50%';
        gameOverText.style.left = '50%';
        gameOverText.style.transform = 'translate(-50%, -50%)';
        gameOverText.style.color = '#fff';
        gameOverText.style.fontSize = '24px';
        gameOverText.style.textAlign = 'center';
        gameOverText.style.textShadow = '2px 2px 4px #000';
        this.container.appendChild(gameOverText);

        if (window.Game && window.Game.state) {
            const moedasGanhas = Math.floor(this.score / 20);
            if (moedasGanhas > 0) {
                window.Game.state.coins += moedasGanhas;
                if(window.Storage) window.Storage.save(window.Game.state);
                
                const rewardText = document.createElement('div');
                rewardText.innerText = `+${moedasGanhas} Moedas!`;
                rewardText.style.position = 'absolute';
                rewardText.style.top = '75%';
                rewardText.style.left = '50%';
                rewardText.style.transform = 'translate(-50%, -50%)';
                rewardText.style.color = '#f1c40f';
                rewardText.style.fontSize = '16px';
                this.container.appendChild(rewardText);
            }
        }

        setTimeout(() => {
            if (this.btnStart) {
                this.btnStart.style.display = 'block';
                this.btnStart.innerText = 'TENTAR NOVAMENTE';
            }
        }, 1500);
    }
};

// Inicializa no carregamento da página se possível
document.addEventListener('DOMContentLoaded', () => {
    if (window.ExpedicaoGame) window.ExpedicaoGame.init();
});