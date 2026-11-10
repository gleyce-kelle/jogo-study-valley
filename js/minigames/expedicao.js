window.ExpedicaoGame = {
    container: null,
    scoreEl: null,
    btnStart: null,
    isActive: false,
    animationId: null,
    score: 0,
    player: { y: 0, velocity: 0, width: 55, height: 45, el: null },
    gravity: 0.6,
    jumpPower: -10,
    entities: [],
    frameCount: 0,
    floorOffset: 25, 
    hasShield: false, // <-- Controle do escudo interno do minigame

    init: function() {
        this.container = document.getElementById('expedicao-container');
        this.scoreEl = document.getElementById('expedicao-score');
        this.btnStart = document.getElementById('btn-start-expedicao');

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
        
        this.container.innerHTML = ''; 

        this.container.style.background = "url('assets/mini-games/expedicao-background.png') center bottom / cover no-repeat";
        this.container.style.border = "none";
        this.container.style.boxShadow = "inset 0 0 10px rgba(0, 0, 0, 0.6)";

        const floorY = (this.container.clientHeight || 200) - this.player.height - this.floorOffset;
        
        this.player.y = floorY;
        this.player.velocity = 0;
        this.player.el = document.createElement('img');
        this.player.el.className = 'expedicao-sprite';
        this.player.el.style.width = this.player.width + 'px';
        this.player.el.style.height = this.player.height + 'px';
        this.player.el.style.position = 'absolute';
        this.player.el.style.left = '30px';
        this.player.el.style.top = this.player.y + 'px';
        this.player.el.src = 'assets/mini-games/expedicao-raposa_1.png';
        
        this.container.appendChild(this.player.el);

        // --- Lógica de Injeção do Escudo ---
        if (typeof Game !== 'undefined' && Game.state && Game.state.hasShield) {
            this.hasShield = true;
            const shieldUI = document.createElement('div');
            shieldUI.id = 'expedicao-shield-ui';
            shieldUI.className = 'expedicao-shield-indicator';
            shieldUI.innerHTML = '🛡️ Escudo Ativo';
            this.container.appendChild(shieldUI);
        } else {
            this.hasShield = false;
        }

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
        const floorY = (this.container.clientHeight || 200) - this.player.height - this.floorOffset;
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

        const floorY = (this.container.clientHeight || 200) - this.player.height - this.floorOffset;
        let isJumping = false;

        if (this.player.y > floorY) {
            this.player.y = floorY;
            this.player.velocity = 0;
        } else if (this.player.y < floorY) {
            isJumping = true;
        }

        this.player.el.style.top = this.player.y + 'px';

        if (isJumping) {
            this.player.el.src = 'assets/mini-games/expedicao-raposa_3.png';
        } else {
            let animFrame = Math.floor(this.frameCount / 6) % 4 + 1;
            this.player.el.src = `assets/mini-games/expedicao-raposa_${animFrame}.png`;
        }
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
        
        const el = document.createElement('img');
        el.className = 'expedicao-sprite';
        el.style.position = 'absolute';
        el.style.left = cWidth + 'px';
        
        let entity = { el: el, x: cWidth, type: type, width: 20, height: 20 };

        if (type === 'obstacle') {
            entity.width = 38;
            entity.height = 40;
            el.style.width = entity.width + 'px';
            el.style.height = entity.height + 'px';
            el.src = 'assets/mini-games/expedicao-rocha.png';
            el.style.top = (cHeight - entity.height - this.floorOffset) + 'px';
        } else if (type === 'coin') {
            entity.width = 25;
            entity.height = 25;
            el.style.width = entity.width + 'px';
            el.style.height = entity.height + 'px';
            el.src = 'assets/mini-games/expedicao-moeda.png';
            el.style.top = (cHeight - entity.height - this.floorOffset - 40 - Math.random() * 50) + 'px';
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
        
        const shrinkX = 14; 
        const shrinkY = 10; 

        for (let i = this.entities.length - 1; i >= 0; i--) {
            let ent = this.entities[i];
            let ex = ent.x;
            let ey = parseInt(ent.el.style.top || 0);
            let ew = ent.width;
            let eh = ent.height;

            if (px + shrinkX < ex + ew && px + pw - shrinkX > ex && py + shrinkY < ey + eh && py + ph - shrinkY > ey) {
                if (ent.type === 'coin') {
                    this.score += 10;
                    if (this.scoreEl) this.scoreEl.innerText = this.score;
                    this.container.removeChild(ent.el);
                    this.entities.splice(i, 1);
                    if(typeof AudioFX !== 'undefined' && AudioFX.coin) AudioFX.coin();
                } else if (ent.type === 'obstacle') {
                    // --- Lógica de Consumo do Escudo ---
                    if (this.hasShield) {
                        this.hasShield = false;
                        
                        if (typeof Game !== 'undefined' && Game.state) {
                            Game.state.hasShield = false;
                            if(typeof Storage !== 'undefined') Storage.save(Game.state);
                        }
                        
                        const shieldUI = document.getElementById('expedicao-shield-ui');
                        if (shieldUI) shieldUI.remove();
                        
                        this.container.removeChild(ent.el);
                        this.entities.splice(i, 1);

                        if(typeof AudioFX !== 'undefined' && AudioFX.playTone) AudioFX.playTone(300, 'sawtooth', 0.2, 0.5);

                    } else {
                        this.gameOver();
                    }
                }
            }
        }
    },

    gameOver: function() {
        this.isActive = false;
        cancelAnimationFrame(this.animationId);
        
        let moedasGanhas = 0;

        // --- Concede a recompensa no State ---
        if (typeof Game !== 'undefined' && Game.state) {
            moedasGanhas = Math.floor(this.score / 100);
            if (moedasGanhas > 0) {
                Game.state.coins += moedasGanhas;
                if(typeof Storage !== 'undefined') Storage.save(Game.state);
                
                if(typeof UI !== 'undefined' && typeof UI.updateStats === 'function') {
                    UI.updateStats(Game.state, Game.getXPForNextLevel(), Game.getTotalXPForLevel(Game.state.level));
                }
            }
        }

        // --- Criação do Pop-up Central de Fim de Jogo ---
        const gameOverPanel = document.createElement('div');
        gameOverPanel.className = 'panel'; 
        gameOverPanel.style.position = 'absolute';
        gameOverPanel.style.top = '50%';
        gameOverPanel.style.left = '50%';
        gameOverPanel.style.transform = 'translate(-50%, -50%)';
        gameOverPanel.style.zIndex = '20';
        gameOverPanel.style.width = '85%';
        gameOverPanel.style.textAlign = 'center';
        gameOverPanel.style.boxShadow = '0 6px 15px rgba(0,0,0,0.6)';
        gameOverPanel.style.padding = '15px';
        gameOverPanel.style.boxSizing = 'border-box';
        
        let htmlContent = `
            <h2 style="color: #c62828; font-size: 28px; margin-bottom: 5px; text-shadow: 1px 1px 0px rgba(255,255,255,0.5);">FIM DE JOGO</h2>
            <p style="font-size: 22px; font-weight: bold; margin-bottom: 15px;">Pontuação: ${this.score}</p>
        `;

        if (moedasGanhas > 0) {
            htmlContent += `
                <div class="recompensas" style="margin-bottom: 5px; justify-content: center;">
                    <div class="recompensa-item" style="font-size: 24px; padding: 5px 15px;">
                        <span class="icone">💰</span> 
                        <span>+${moedasGanhas}</span>
                    </div>
                </div>
            `;
        } else {
            htmlContent += `
                <p style="font-size: 16px; color: #555;">(Alcance 100 pontos para ganhar moedas)</p>
            `;
        }

        gameOverPanel.innerHTML = htmlContent;
        this.container.appendChild(gameOverPanel);

        setTimeout(() => {
            if (this.btnStart) {
                this.btnStart.style.display = 'block';
                this.btnStart.innerText = 'TENTAR NOVAMENTE';
            }
        }, 1500);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.ExpedicaoGame) window.ExpedicaoGame.init();
});