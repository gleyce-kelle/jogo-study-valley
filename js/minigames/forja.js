const ForjaGame = {
    isActive: false,
    score: 0,
    maxScore: 5,
    cursorPos: 0,
    direction: 1,
    speed: 1.5,
    animationFrameId: null,
    
    targetMin: 40,
    targetMax: 60,

    init: function() {
        this.container = document.querySelector('#modal-forja .minigame-container');
        this.targetEl = document.getElementById('forja-target');
        this.cursorEl = document.getElementById('forja-cursor');
        this.scoreEl = document.getElementById('forja-score');
        this.btnHit = document.getElementById('btn-hit-forja');
        this.marteloEl = document.getElementById('forja-martelo');
        
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

        // Criação ou reutilização do botão de início dinâmico
        this.btnStart = document.getElementById('btn-start-forja');
        if (!this.btnStart) {
            this.btnStart = document.createElement('button');
            this.btnStart.id = 'btn-start-forja';
            this.btnStart.className = 'btn warning forja-status-btn';
            this.btnStart.style.width = '100%';
            this.btnStart.style.padding = '8px 10px';
            this.btnStart.style.fontSize = '1.0rem';
            this.btnStart.style.marginBottom = '10px';
            this.btnStart.innerText = 'INICIAR JOGO';
            
            if (this.btnHit && this.btnHit.parentNode) {
                this.btnHit.parentNode.insertBefore(this.btnStart, this.btnHit);
                this.btnHit.style.display = 'none';
            }
        }

        this.btnStart.onclick = () => this.start();
        if (this.btnHit) this.btnHit.onclick = () => this.hit();
        
        document.addEventListener('keydown', (e) => {
            const modalForja = document.getElementById('modal-forja');
            if (e.code === 'Space' && modalForja && modalForja.style.display !== 'none') {
                e.preventDefault(); 
                if (this.isActive) {
                    this.hit();
                } else if (this.btnStart.style.display !== 'none' && !this.btnStart.disabled) {
                    this.start();
                }
            }
        });

        const closeBtn = document.getElementById('close-forja-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                this.stop();
                document.getElementById('modal-forja').style.display = 'none';
                const menuModal = document.getElementById('modal-minigames-menu');
                if (menuModal) menuModal.style.display = 'flex';
            };
        }
    },

    start: function() {
        if (!this.container) this.init();

        if (window.Game && window.Game.state && window.Game.state.hasShield) {
            this.showAlert("Você já tem um escudo ativo. Por favor, utilize-o na Expedição do Familiar.");
            return;
        }

        this.isActive = true;
        this.score = 0;
        this.cursorPos = 0;
        this.direction = 1;
        this.speed = 1.5;
        this.updateScoreUI();
        
        if (this.btnStart) this.btnStart.style.display = 'none';
        if (this.btnHit) this.btnHit.style.display = 'block';
        
        this.loop();
    },

    stop: function() {
        this.isActive = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
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
        
        if (this.cursorEl) {
            this.cursorEl.style.left = this.cursorPos + '%';
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.loop());
    },

    triggerHammerAnimation: function() {
        if (!this.marteloEl) {
            this.marteloEl = document.getElementById('forja-martelo');
        }
        if (this.marteloEl) {
            this.marteloEl.classList.remove('animar-batida');
            void this.marteloEl.offsetWidth; 
            this.marteloEl.classList.add('animar-batida');
        }
    },

    hit: function() {
        if (!this.isActive) return;
        
        this.isActive = false; 
        this.triggerHammerAnimation();
        
        if (this.cursorPos >= this.targetMin && this.cursorPos <= (this.targetMax + 1)) {
            this.score++;
            this.updateScoreUI();
            if (window.AudioFX) AudioFX.playTone(800, 'square', 0.1, 0.5); 
            
            if (this.score >= this.maxScore) {
                this.win();
            } else {
                this.speed += 0.3; 
                setTimeout(() => {
                    this.isActive = true;
                    this.loop();
                }, 500);
            }
        } else {
            if (window.AudioFX) AudioFX.playTone(200, 'sawtooth', 0.2, 0.5); 
            
            setTimeout(() => {
                this.isActive = true;
                this.loop();
            }, 500);
        }
    },

    updateScoreUI: function() {
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
            Game.state.hasShield = true; 
            
            while (Game.state.xp >= Game.getXPForNextLevel()) {
                Game.state.level++;
            }

            Storage.save(Game.state);
            
            UI.showFloatingText('+5 XP', 'xp');
            setTimeout(() => UI.showFloatingText('+2 Moedas', 'coin'), 500);
            setTimeout(() => UI.showFloatingText('Escudo Forjado!', 'level'), 1000);
            
            UI.updateStats(Game.state, Game.getXPForNextLevel(), Game.getTotalXPForLevel(Game.state.level));
        }

        // Renderiza a tela de vitória no mesmo padrão visual do Grimório Fragmentado com os textos solicitados
        if (this.container) {
            this.container.innerHTML = `
                <div class="grimorio-victory">
                    <h3 style="font-size: 24px; color:#2ecc71; margin-bottom:10px;">Escudo Forjado!</h3>
                    <p style="color: #fff; font-size: 16px;">Você equipou o <strong style="color:#f1c40f;">Escudo de Ferro</strong>!</p>
                    <p style="font-size: 14px; color:#bdc3c7; margin-top:10px;">Utilize-o durante a Expedição do Familiar.</p>
                </div>
            `;
        }

        if (this.btnHit) this.btnHit.style.display = 'none';
        if (this.btnStart) {
            this.btnStart.style.display = 'block';
            this.btnStart.innerText = "Escudo Forjado! Utilize-o no mini-game A Expedição do Familiar antes de tentar novamente.";
            this.btnStart.disabled = true;
            this.btnStart.style.opacity = '0.7';
        }
    },

    showAlert: function(message) {
        if (window.UI && typeof window.UI.showModal === 'function') {
            window.UI.showModal("Aviso da Forja", message, [
                { text: "Entendi", class: "primary", onClick: () => {} }
            ]);
        } else {
            alert(message);
        }
    }
};

window.ForjaGame = ForjaGame;

document.addEventListener('DOMContentLoaded', () => {
    ForjaGame.init();
});