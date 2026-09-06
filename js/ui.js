const UI = {
    elements: {
        level: document.getElementById('level-display'),
        xpTotal: document.getElementById('xp-display'),
        xpCurrentLevel: document.getElementById('xp-current-level'),
        xpNeeded: document.getElementById('xp-needed'),
        xpBar: document.getElementById('xp-bar'),
        coins: document.getElementById('coins-display'),
        timeDisplay: document.getElementById('time-display'),
        sessionStatus: document.getElementById('session-status'),
        btnStart: document.getElementById('btn-start'),
        btnStop: document.getElementById('btn-stop'),
        character: document.getElementById('character'),
        feedbackLayer: document.getElementById('feedback-layer'),
        modalOverlay: document.getElementById('game-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalMessage: document.getElementById('modal-message'),
        modalButtons: document.getElementById('modal-buttons'),
        
        settingsModal: document.getElementById('settings-modal'),
        statsModal: document.getElementById('stats-modal'),
        cfgStudy: document.getElementById('cfg-study-time'),
        cfgBreak: document.getElementById('cfg-break-time'),
        cfgSound: document.getElementById('cfg-sound'),
        cfgVol: document.getElementById('cfg-volume'),
        cfgAutoBreak: document.getElementById('cfg-auto-break'),
        cfgAutoSession: document.getElementById('cfg-auto-session')
    },

    updateStats: function(gameState, nextLevelTotalXP, currentLevelTotalXP) {
        this.elements.level.innerText = gameState.level;
        this.elements.xpTotal.innerText = gameState.xp;
        this.elements.coins.innerText = gameState.coins;

        const xpProgressInLevel = gameState.xp - currentLevelTotalXP;
        const xpRequiredForThisLevel = nextLevelTotalXP - currentLevelTotalXP;
        
        this.elements.xpCurrentLevel.innerText = xpProgressInLevel;
        this.elements.xpNeeded.innerText = xpRequiredForThisLevel;

        let xpPercentage = xpRequiredForThisLevel > 0 ? (xpProgressInLevel / xpRequiredForThisLevel) * 100 : 0;
        this.elements.xpBar.style.width = `${Math.min(xpPercentage, 100)}%`;
    },

    updateTime: function(seconds) { this.elements.timeDisplay.innerText = Timer.formatTime(seconds); },

    setMode: function(mode) {
        if (mode === 'idle') {
            this.elements.sessionStatus.innerText = "Pronto para a jornada!";
            this.elements.btnStart.style.display = "block";
            this.elements.btnStop.style.display = "none";
            this.elements.character.className = "sprite idle";
        } else if (mode === 'studying') {
            this.elements.sessionStatus.innerText = "Foco total!";
            this.elements.btnStart.style.display = "none";
            this.elements.btnStop.style.display = "block";
            this.elements.btnStop.innerText = "Abortar";
            this.elements.character.className = "sprite studying";
            this.showFloatingText("Sessão iniciada!", "level");
        } else if (mode === 'break') {
            this.elements.sessionStatus.innerText = "Descansando...";
            this.elements.btnStart.style.display = "none";
            this.elements.btnStop.style.display = "block";
            this.elements.btnStop.innerText = "Pular Pausa";
            this.elements.character.className = "sprite idle";
        }
    },

    showFloatingText: function(text, type = 'xp') {
        const floatEl = document.createElement('div');
        floatEl.innerText = text; floatEl.className = `floating-text ${type}`;
        this.elements.feedbackLayer.appendChild(floatEl);
        setTimeout(() => floatEl.remove(), 2000);
    },

    triggerLevelUpAnimation: function() {
        document.body.classList.add('level-up-effect');
        setTimeout(() => document.body.classList.remove('level-up-effect'), 1500);
    },

    showModal: function(title, message, buttons) {
        this.elements.modalTitle.innerText = title;
        this.elements.modalMessage.innerText = message;
        this.elements.modalButtons.innerHTML = ''; 

        buttons.forEach(btnInfo => {
            const btn = document.createElement('button');
            btn.innerText = btnInfo.text;
            btn.className = `btn ${btnInfo.class || 'primary'}`;
            btn.onclick = () => {
                AudioFX.click();
                this.elements.modalOverlay.style.display = 'none'; 
                if (btnInfo.onClick) btnInfo.onClick(); 
            };
            this.elements.modalButtons.appendChild(btn);
        });
        this.elements.modalOverlay.style.display = 'flex'; 
    },
    
    toggleSettings: function(show) { this.elements.settingsModal.style.display = show ? 'flex' : 'none'; },
    toggleStats: function(show) { this.elements.statsModal.style.display = show ? 'flex' : 'none'; }
};