const ForjaGame = {
    isActive: false,
    score: 0,
    maxScore: 10,
    cursorPos: 0,
    direction: 1,
    speed: 1.5,
    animationFrameId: null,
    
    targetMin: 40,
    targetMax: 60,

    init: function() {
        this.targetEl = document.getElementById('forja-target');
        this.cursorEl = document.getElementById('forja-cursor');
        this.scoreEl = document.getElementById('forja-score');
        this.btnHit = document.getElementById('btn-hit-forja');
        this.marteloEl = document.getElementById('forja-martelo');
        
        // Inicializa o placar visual imediatamente com 0 / 10 ao carregar
        this.updateScoreUI();
        
        // Estilo de fallback via JS
        const forjaUi = document.querySelector('.forja-ui');
        if(forjaUi) {
            forjaUi.style.position = 'relative';
            forjaUi.style.width = '100%';
            forjaUi.style.height = '40px';
            forjaUi.style.backgroundColor = '#34495e';
            forjaUi.style.borderRadius = '5px';
            forjaUi.style.overflow = 'hidden';
        }
        
        if(this.targetEl) {
            this.targetEl.style.position = 'absolute';
            this.targetEl.style.height = '100%';
            this.targetEl.style.backgroundColor = '#2ecc71';
            this.targetEl.style.left = this.targetMin + '%';
            this.targetEl.style.width = (this.targetMax - this.targetMin) + '%';
        }

        if(this.cursorEl) {
            this.cursorEl.style.position = 'absolute';
            this.cursorEl.style.height = '100%';
            this.cursorEl.style.width = '6px';
            this.cursorEl.style.backgroundColor = '#e74c3c';
            this.cursorEl.style.zIndex = '2';
            this.cursorEl.style.left = '0%';
        }

        // Criar botão INICIAR dinamicamente para manter fluxo existente
        this.btnStart = document.createElement('button');
        this.btnStart.className = 'btn warning';
        this.btnStart.style.width = '100%';
        this.btnStart.style.padding = '10px';
        this.btnStart.style.fontSize = '1.2rem';
        this.btnStart.style.marginBottom = '10px';
        this.btnStart.innerText = 'INICIAR JOGO';
        
        if (this.btnHit && this.btnHit.parentNode) {
            this.btnHit.parentNode.insertBefore(this.btnStart, this.btnHit);
            this.btnHit.style.display = 'none';
        }

        this.btnStart.addEventListener('click', () => this.start());
        this.btnHit.addEventListener('click', () => this.hit());
        
        // Suporte para barra de espaço
        document.addEventListener('keydown', (e) => {
            const modalForja = document.getElementById('modal-forja');
            if (e.code === 'Space' && modalForja && modalForja.style.display !== 'none') {
                e.preventDefault(); 
                if (this.isActive) {
                    this.hit();
                } else if (this.btnStart.style.display !== 'none') {
                    this.start();
                }
            }
        });

        // Reseta o jogo quando fechar o modal
        document.getElementById('close-forja-btn').addEventListener('click', () => {
            this.stop();
        });
    },

    start: function() {
        this.isActive = true;
        this.score = 0;
        this.cursorPos = 0;
        this.direction = 1;
        this.speed = 1.5;
        this.updateScoreUI();
        
        this.btnStart.style.display = 'none';
        this.btnHit.style.display = 'block';
        
        this.loop();
    },

    stop: function() {
        this.isActive = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.btnStart && this.btnHit) {
            this.btnStart.style.display = 'block';
            this.btnStart.innerText = "JOGAR NOVAMENTE";
            this.btnHit.style.display = 'none';
        }
        this.score = 0;
        this.updateScoreUI();
    },

    loop: function() {
        if (!this.isActive) return;
        
        this.cursorPos += this.speed * this.direction;
        
        if (this.cursorPos >= 100) {
            this.cursorPos = 100;
            this.direction = -1;
        } else if (this.cursorPos <= 0) {
            this.cursorPos = 0;
            this.direction = 1;
        }
        
        this.cursorEl.style.left = this.cursorPos + '%';
        
        this.animationFrameId = requestAnimationFrame(() => this.loop());
    },

    triggerHammerAnimation: function() {
        if (!this.marteloEl) {
            this.marteloEl = document.getElementById('forja-martelo');
        }
        if (this.marteloEl) {
            this.marteloEl.classList.remove('animar-batida');
            void this.marteloEl.offsetWidth; // Força reflow no navegador para reiniciar a animação CSS
            this.marteloEl.classList.add('animar-batida');
        }
    },

    hit: function() {
        if (!this.isActive) return;
        
        this.isActive = false; // Pausa a barra para dar feedback visual
        
        // Executa a animação de batida do martelo
        this.triggerHammerAnimation();
        
        // Avalia se o cursor está dentro da zona verde
        if (this.cursorPos >= this.targetMin && this.cursorPos <= (this.targetMax + 1)) {
            // Acerto!
            this.score++;
            this.updateScoreUI();
            if (window.AudioFX) AudioFX.playTone(800, 'square', 0.1, 0.5); 
            
            if (this.score >= this.maxScore) {
                this.win();
            } else {
                this.speed += 0.2; // Aumento gradual e ajustado da velocidade
                setTimeout(() => {
                    this.isActive = true;
                    this.loop();
                }, 500);
            }
        } else {
            // Erro!
            if (window.AudioFX) AudioFX.playTone(200, 'sawtooth', 0.2, 0.5); 
            
            setTimeout(() => {
                this.isActive = true;
                this.loop();
            }, 500);
        }
    },

    updateScoreUI: function() {
        if (!this.scoreEl) {
            this.scoreEl = document.getElementById('forja-score');
        }
        if (this.scoreEl) {
            this.scoreEl.innerText = `${this.score} / ${this.maxScore}`;
        }
    },

    win: function() {
        this.stop();
        if (window.AudioFX) AudioFX.levelUp(); 
        
        if (window.Game && window.Storage && window.UI) {
            Game.state.coins += 2;
            Game.state.xp += 5;
            
            while (Game.state.xp >= Game.getXPForNextLevel()) {
                Game.state.level++;
            }

            Storage.save(Game.state);
            
            UI.showFloatingText('+5 XP', 'xp');
            setTimeout(() => UI.showFloatingText('+2 Moedas', 'coin'), 500);
            
            UI.updateStats(Game.state, Game.getXPForNextLevel(), Game.getTotalXPForLevel(Game.state.level));
        }
        
        this.btnStart.innerText = "PEÇA FORJADA! (JOGAR NOVAMENTE)";
    }
};

window.ForjaGame = ForjaGame;

document.addEventListener('DOMContentLoaded', () => {
    ForjaGame.init();
});