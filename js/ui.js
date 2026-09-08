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
        btnMiniGames: document.getElementById('btn-mini-games'),
        activeActions: document.getElementById('active-actions'),
        btnPauseResume: document.getElementById('btn-pause-resume'),
        character: document.getElementById('character'),
        avatarPreview: document.getElementById('avatar-preview'),
        feedbackLayer: document.getElementById('feedback-layer'),
        modalOverlay: document.getElementById('game-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalMessage: document.getElementById('modal-message'),
        modalButtons: document.getElementById('modal-buttons'),
        
        settingsModal: document.getElementById('settings-modal'),
        statsModal: document.getElementById('stats-modal'),
        profileModal: document.getElementById('profile-modal'),
        shopModal: document.getElementById('shop-modal'),
        achievementsModal: document.getElementById('achievements-modal'),
        achievementsList: document.getElementById('achievements-list'),

        // Elementos da nova janela de conquista
        achievementUnlockedModal: document.getElementById('achievement-unlocked-modal'),
        unlockedAchName: document.getElementById('unlocked-achievement-name'),
        unlockedAchXp: document.getElementById('unlocked-xp-val'),
        unlockedAchCoins: document.getElementById('unlocked-coins-val'),
        btnCollectAch: document.getElementById('btn-collect-achievement'),
        
        cfgStudy: document.getElementById('cfg-study-time'),
        cfgBreak: document.getElementById('cfg-break-time'),
        cfgSound: document.getElementById('cfg-sound'),
        cfgVol: document.getElementById('cfg-volume'),
        cfgAutoBreak: document.getElementById('cfg-auto-break'),
        cfgAutoSession: document.getElementById('cfg-auto-session')
    },

    achievementsData: [
        {
            id: '100_minutos',
            title: 'Estudou por 100 minutos',
            desc: 'Concentre-se por pelo menos 100 minutos totais.',
            icon: 'assets/conquistas/100_minutos.png',
            rewardXP: 5,
            rewardCoins: 5,
            check: (state) => state.totalStudyMinutes >= 100,
            getProgress: (state) => `${Math.min(state.totalStudyMinutes, 100)} / 100 min`
        },
        {
            id: '10_sessoes',
            title: 'Estudou por 10 sessões',
            desc: 'Complete 10 missões de estudo.',
            icon: 'assets/conquistas/10_sessoes.png',
            rewardXP: 10,
            rewardCoins: 10,
            check: (state) => state.sessionsCompleted >= 10,
            getProgress: (state) => `${Math.min(state.sessionsCompleted, 10)} / 10 sessões`
        },
        {
            id: 'lvl_10',
            title: 'Atingiu Level 10',
            desc: 'Alcance o Nível 10 de personagem.',
            icon: 'assets/conquistas/lvl_10.png',
            rewardXP: 100,
            rewardCoins: 100,
            check: (state) => state.level >= 10,
            getProgress: (state) => `Nível ${state.level} / 10`
        }
    ],

    renderAvatar: function(targetElement, avatarId) {
        if (!targetElement) return;
        const isStudying = targetElement.classList.contains('studying');
        targetElement.className = `sprite avatar-${avatarId} ${isStudying ? 'studying' : 'idle'}`;
    },

    renderAchievements: function(gameState) {
        if (!this.elements.achievementsList) return;
        this.elements.achievementsList.innerHTML = '';
        
        // Garante que o array exista
        if (!gameState.achievementsClaimed) gameState.achievementsClaimed = [];

        this.achievementsData.forEach(ach => {
            const isUnlocked = gameState.achievementsClaimed.includes(ach.id);
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;

            card.innerHTML = `
                <div class="achievement-icon-wrapper">
                    <img src="${ach.icon}" alt="${ach.title}">
                    ${!isUnlocked ? '<span class="lock-overlay">🔒</span>' : ''}
                </div>
                <div class="achievement-info">
                    <div class="achievement-title">${ach.title} ${isUnlocked ? '✨' : ''}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                    <div class="achievement-progress">${isUnlocked ? '✓ Concluído!' : ach.getProgress(gameState)}</div>
                </div>
            `;
            this.elements.achievementsList.appendChild(card);
        });
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

        this.renderAvatar(this.elements.character, gameState.avatarId);
    },

    updateTime: function(seconds) { 
        this.elements.timeDisplay.innerText = Timer.formatTime(seconds); 
    },

    setMode: function(mode) {
        const avatarClass = this.elements.character.className.replace(/idle|studying/g, '').trim();

        if (mode === 'idle') {
            this.elements.sessionStatus.innerText = "Pronto para a jornada!";
            this.elements.btnStart.style.display = "block";
            this.elements.activeActions.style.display = "none";
            this.elements.btnMiniGames.style.display = "none";
            this.elements.character.className = `${avatarClass} idle`;
        } else if (mode === 'studying') {
            this.elements.sessionStatus.innerText = "Foco total!";
            this.elements.btnStart.style.display = "none";
            this.elements.activeActions.style.display = "flex";
            this.elements.btnPauseResume.innerText = "Pausar";
            this.elements.btnPauseResume.style.display = "block";
            this.elements.btnStop.innerText = "Abortar";
            this.elements.btnMiniGames.style.display = "none";
            this.elements.character.className = `${avatarClass} studying`;
            this.showFloatingText("Sessão iniciada!", "level");
        } else if (mode === 'paused') {
            this.elements.sessionStatus.innerText = "Pausado...";
            this.elements.btnPauseResume.innerText = "Continuar";
            this.elements.btnMiniGames.style.display = "none";
            this.elements.character.className = `${avatarClass} idle`;
        } else if (mode === 'break') {
            this.elements.sessionStatus.innerText = "Descansando...";
            this.elements.btnStart.style.display = "none";
            this.elements.activeActions.style.display = "flex";
            this.elements.btnPauseResume.style.display = "none";
            this.elements.btnStop.innerText = "Pular Pausa";
            // MOSTRA O BOTÃO DE MINI GAMES APENAS NA PAUSA
            this.elements.btnMiniGames.style.display = "block";
            this.elements.character.className = `${avatarClass} idle`;
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
    toggleStats: function(show) { this.elements.statsModal.style.display = show ? 'flex' : 'none'; },
    toggleProfile: function(show) { this.elements.profileModal.style.display = show ? 'flex' : 'none'; },
    toggleShop: function(show) { this.elements.shopModal.style.display = show ? 'flex' : 'none'; },
    toggleAchievements: function(show, gameState) {
        if (show && gameState) {
            this.renderAchievements(gameState);
        }
        this.elements.achievementsModal.style.display = show ? 'flex' : 'none';
    }
};