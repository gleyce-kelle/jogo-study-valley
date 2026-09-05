const UI = {
    elements: {
        level: document.getElementById('level-display'),
        xp: document.getElementById('xp-display'),
        xpNeeded: document.getElementById('xp-needed'),
        xpBar: document.getElementById('xp-bar'),
        coins: document.getElementById('coins-display'),
        timeDisplay: document.getElementById('time-display'),
        sessionStatus: document.getElementById('session-status'),
        studyTimeInput: document.getElementById('study-time'),
        breakTimeInput: document.getElementById('break-time'),
        btnStart: document.getElementById('btn-start'),
        btnStop: document.getElementById('btn-stop'),
        controls: document.getElementById('controls'),
        
        // Elementos do Modal In-Game
        modalOverlay: document.getElementById('game-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalMessage: document.getElementById('modal-message'),
        modalButtons: document.getElementById('modal-buttons')
    },

    updateStats: function(gameState, nextLevelTotalXP, currentLevelTotalXP) {
        this.elements.level.innerText = gameState.level;
        this.elements.xp.innerText = gameState.xp;
        this.elements.xpNeeded.innerText = nextLevelTotalXP;
        this.elements.coins.innerText = gameState.coins;

        // O cálculo da barra leva em conta apenas o XP do nível atual
        const xpProgressInLevel = gameState.xp - currentLevelTotalXP;
        const xpRequiredForThisLevel = nextLevelTotalXP - currentLevelTotalXP;
        
        let xpPercentage = 0;
        if (xpRequiredForThisLevel > 0) {
            xpPercentage = (xpProgressInLevel / xpRequiredForThisLevel) * 100;
        }
        
        this.elements.xpBar.style.width = `${Math.min(xpPercentage, 100)}%`;
    },

    updateTime: function(seconds) {
        this.elements.timeDisplay.innerText = Timer.formatTime(seconds);
    },

    setMode: function(mode) {
        if (mode === 'idle') {
            this.elements.sessionStatus.innerText = "Pronto para a jornada?";
            this.elements.sessionStatus.style.color = "var(--color-text)";
            this.elements.controls.style.display = "flex";
            this.elements.btnStart.style.display = "inline-block";
            this.elements.btnStop.style.display = "none";
        } else if (mode === 'studying') {
            this.elements.sessionStatus.innerText = "Foco total!";
            this.elements.sessionStatus.style.color = "var(--color-danger)";
            this.elements.controls.style.display = "none";
            this.elements.btnStart.style.display = "none";
            this.elements.btnStop.style.display = "inline-block";
            this.elements.btnStop.innerText = "Abortar";
        } else if (mode === 'break') {
            this.elements.sessionStatus.innerText = "Descansando na fogueira...";
            this.elements.sessionStatus.style.color = "var(--color-primary-dark)";
            this.elements.controls.style.display = "none";
            this.elements.btnStart.style.display = "none";
            this.elements.btnStop.style.display = "inline-block";
            this.elements.btnStop.innerText = "Pular Pausa";
        }
    },

    // Função que substitui os alert() e confirm() do navegador
    showModal: function(title, message, buttons) {
        this.elements.modalTitle.innerText = title;
        this.elements.modalMessage.innerText = message;
        this.elements.modalButtons.innerHTML = ''; // Limpa os botões antigos

        buttons.forEach(btnInfo => {
            const btn = document.createElement('button');
            btn.innerText = btnInfo.text;
            btn.className = `btn ${btnInfo.class || 'primary'}`;
            btn.onclick = () => {
                this.elements.modalOverlay.style.display = 'none'; // Fecha o modal
                if (btnInfo.onClick) btnInfo.onClick(); // Executa a ação do botão
            };
            this.elements.modalButtons.appendChild(btn);
        });

        this.elements.modalOverlay.style.display = 'flex'; // Exibe o modal
    }
};