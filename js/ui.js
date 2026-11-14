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
        furnitureLayer: document.getElementById('furniture-layer'), 
        shopGrid: document.getElementById('shop-grid'),
        btnSaveFurniture: document.getElementById('btn-save-furniture'),
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
        
        btnAbout: document.getElementById('btn-about'),
        aboutModal: document.getElementById('about-modal'),

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
        { id: '100_minutos', title: 'Estudou por 100 minutos', desc: 'Concentre-se por pelo menos 100 minutos totais.', icon: 'assets/conquistas/100_minutos.png', rewardXP: 5, rewardCoins: 5, check: (state) => state.totalStudyMinutes >= 100, getProgress: (state) => `${Math.min(state.totalStudyMinutes, 100)} / 100 min` },
        { id: '240_minutos', title: 'Estudou por 240 minutos', desc: 'Concentre-se por pelo menos 240 minutos totais.', icon: 'assets/conquistas/240_minutos.png', rewardXP: 15, rewardCoins: 15, check: (state) => state.totalStudyMinutes >= 240, getProgress: (state) => `${Math.min(state.totalStudyMinutes, 240)} / 240 min` },
        { id: '8_horas', title: 'Estudou por 8 horas', desc: 'Concentre-se por um total de 8 horas (480 minutos).', icon: 'assets/conquistas/8_horas.png', rewardXP: 30, rewardCoins: 30, check: (state) => state.totalStudyMinutes >= 480, getProgress: (state) => `${Math.min(state.totalStudyMinutes, 480)} / 480 min` },
        
        { id: '10_sessoes', title: 'Estudou por 10 sessões', desc: 'Complete 10 missões de estudo.', icon: 'assets/conquistas/10_sessoes.png', rewardXP: 10, rewardCoins: 10, check: (state) => state.sessionsCompleted >= 10, getProgress: (state) => `${Math.min(state.sessionsCompleted, 10)} / 10 sessões` },
        { id: '25_sessoes', title: 'Estudou por 25 sessões', desc: 'Complete 25 missões de estudo.', icon: 'assets/conquistas/25_sessoes.png', rewardXP: 25, rewardCoins: 25, check: (state) => state.sessionsCompleted >= 25, getProgress: (state) => `${Math.min(state.sessionsCompleted, 25)} / 25 sessões` },
        { id: '50_sessoes', title: 'Estudou por 50 sessões', desc: 'Complete 50 missões de estudo.', icon: 'assets/conquistas/50_sessoes.png', rewardXP: 50, rewardCoins: 50, check: (state) => state.sessionsCompleted >= 50, getProgress: (state) => `${Math.min(state.sessionsCompleted, 50)} / 50 sessões` },
        
        { id: 'lvl_10', title: 'Atingiu Level 10', desc: 'Alcance o Nível 10 de personagem.', icon: 'assets/conquistas/lvl_10.png', rewardXP: 100, rewardCoins: 100, check: (state) => state.level >= 10, getProgress: (state) => `Nível ${state.level} / 10` },
        { id: 'lvl_20', title: 'Atingiu Level 20', desc: 'Alcance o Nível 20 de personagem.', icon: 'assets/conquistas/lvl_20.png', rewardXP: 200, rewardCoins: 200, check: (state) => state.level >= 20, getProgress: (state) => `Nível ${state.level} / 20` },
        { id: 'lvl_30', title: 'Atingiu Level 30', desc: 'Alcance o Nível 30 de personagem.', icon: 'assets/conquistas/lvl_30.png', rewardXP: 300, rewardCoins: 300, check: (state) => state.level >= 30, getProgress: (state) => `Nível ${state.level} / 30` }
    ],

    renderAvatar: function(targetElement, avatarId) {
        if (!targetElement) return;
        const isStudying = targetElement.classList.contains('studying');
        targetElement.className = `sprite avatar-${avatarId} ${isStudying ? 'idle' : 'idle'}`;
    },

    dragState: {
        isDragging: false,
        element: null,
        itemId: null,
        offsetX: 0,
        offsetY: 0
    },

    renderFurniture: function(equippedIds, catalog, positions = {}) {
        if (!this.elements.furnitureLayer) return;
        this.elements.furnitureLayer.innerHTML = ''; 
        
        const equippedList = equippedIds || (typeof Game !== 'undefined' && Game.state ? Game.state.equippedItems : []);
        const itemCatalog = catalog || (typeof Shop !== 'undefined' ? Shop.catalog : []);
        const itemPositions = positions || (typeof Game !== 'undefined' && Game.state ? Game.state.furniturePositions : {});

        equippedList.forEach(id => {
            const item = itemCatalog.find(i => i.id === id);
            if (item) {
                const el = document.createElement('img');
                el.src = item.img;
                el.alt = item.name;
                el.className = `furniture-item ${item.layer || 'layer-base'}`;
                el.dataset.itemId = id;

                const pos = itemPositions[id] || { x: 50, y: 50 };
                const posX = (pos.x !== undefined && pos.x <= 100) ? `${pos.x}%` : (pos.x ? `${pos.x}px` : '50%');
                const posY = (pos.y !== undefined && pos.y <= 100) ? `${pos.y}%` : (pos.y ? `${pos.y}px` : '50%');
                
                el.style.left = posX;
                el.style.top = posY;

                el.addEventListener('mousedown', (e) => this.startDrag(e, el, id));
                el.addEventListener('touchstart', (e) => this.startDrag(e, el, id), { passive: false });

                this.elements.furnitureLayer.appendChild(el);
            }
        });
    },

    startDrag: function(e, element, itemId) {
        if (e.type === 'touchstart' && e.cancelable) e.preventDefault();
        
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        
        const rect = element.getBoundingClientRect();
        
        this.dragState.isDragging = true;
        this.dragState.element = element;
        this.dragState.itemId = itemId;
        
        this.dragState.offsetX = clientX - (rect.left + rect.width / 2);
        this.dragState.offsetY = clientY - (rect.top + rect.height / 2);

        element.style.cursor = 'grabbing';
        element.style.transition = 'none'; 

        if (this.elements.btnSaveFurniture) {
            this.elements.btnSaveFurniture.style.display = 'block';
        }
    },

    handleDrag: function(e) {
        if (!this.dragState.isDragging || !this.dragState.element) return;
        
        if (e.cancelable && e.type.startsWith('touch')) {
            e.preventDefault();
        }

        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        
        const parent = this.elements.furnitureLayer || this.dragState.element.parentElement;
        if (!parent) return;
        const parentRect = parent.getBoundingClientRect();
        
        let posX = clientX - parentRect.left - this.dragState.offsetX;
        let posY = clientY - parentRect.top - this.dragState.offsetY;

        let pctX = (posX / parentRect.width) * 100;
        let pctY = (posY / parentRect.height) * 100;

        pctX = Math.min(Math.max(pctX, 5), 95);
        pctY = Math.min(Math.max(pctY, 10), 90);

        this.dragState.element.style.left = `${pctX}%`;
        this.dragState.element.style.top = `${pctY}%`;

        if (this.dragState.itemId && typeof Game !== 'undefined' && Game.state) {
            if (!Game.state.furniturePositions) Game.state.furniturePositions = {};
            Game.state.furniturePositions[this.dragState.itemId] = { x: pctX, y: pctY };
        }
    },

    stopDrag: function() {
        if (this.dragState.element) {
            this.dragState.element.style.cursor = 'grab';
        }
        this.dragState.isDragging = false;
        this.dragState.element = null;
        this.dragState.itemId = null;
    },

    renderAchievements: function(gameState) {
        if (!this.elements.achievementsList) return;
        this.elements.achievementsList.innerHTML = '';
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
                    <div class="achievement-title">${ach.title}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                    <div class="achievement-progress">${isUnlocked ? '✓ Concluído!' : ach.getProgress(gameState)}</div>
                </div>
            `;
            this.elements.achievementsList.appendChild(card);
        });
    },

    updateStats: function(gameState, nextLevelTotalXP, currentLevelTotalXP) {
        if (this.elements.level) this.elements.level.innerText = gameState.level;
        if (this.elements.xpTotal) this.elements.xpTotal.innerText = gameState.xp;
        if (this.elements.coins) this.elements.coins.innerText = gameState.coins;

        const xpProgressInLevel = gameState.xp - currentLevelTotalXP;
        const xpRequiredForThisLevel = nextLevelTotalXP - currentLevelTotalXP;
        
        if (this.elements.xpCurrentLevel) this.elements.xpCurrentLevel.innerText = xpProgressInLevel;
        if (this.elements.xpNeeded) this.elements.xpNeeded.innerText = xpRequiredForThisLevel;

        let xpPercentage = xpRequiredForThisLevel > 0 ? (xpProgressInLevel / xpRequiredForThisLevel) * 100 : 0;
        if (this.elements.xpBar) this.elements.xpBar.style.width = `${Math.min(xpPercentage, 100)}%`;

        if (this.elements.character) this.renderAvatar(this.elements.character, gameState.avatarId);
    },

    updateTime: function(seconds) { 
        if (this.elements.timeDisplay && typeof Timer !== 'undefined') {
            this.elements.timeDisplay.innerText = Timer.formatTime(seconds); 
        }
    },

    setMode: function(mode) {
        if (!this.elements.character) return;
        const avatarClass = this.elements.character.className.replace(/idle|studying/g, '').trim();

        if (mode === 'idle') {
            if (this.elements.sessionStatus) this.elements.sessionStatus.innerText = "Pronto para a jornada?";
            if (this.elements.btnStart) this.elements.btnStart.style.display = "block";
            if (this.elements.activeActions) this.elements.activeActions.style.display = "none";
            if (this.elements.btnMiniGames) this.elements.btnMiniGames.style.display = "none";
            this.elements.character.className = `${avatarClass} idle`;
        } else if (mode === 'studying') {
            if (this.elements.sessionStatus) this.elements.sessionStatus.innerText = "Foco total!";
            if (this.elements.btnStart) this.elements.btnStart.style.display = "none";
            if (this.elements.activeActions) this.elements.activeActions.style.display = "flex";
            if (this.elements.btnPauseResume) {
                this.elements.btnPauseResume.innerText = "Pausar";
                this.elements.btnPauseResume.style.display = "block";
            }
            if (this.elements.btnStop) this.elements.btnStop.innerText = "Abortar";
            if (this.elements.btnMiniGames) this.elements.btnMiniGames.style.display = "none";
            this.elements.character.className = `${avatarClass} studying`;
            this.showFloatingText("Sessão iniciada!", "level");
        } else if (mode === 'paused') {
            if (this.elements.sessionStatus) this.elements.sessionStatus.innerText = "Pausado...";
            if (this.elements.btnPauseResume) this.elements.btnPauseResume.innerText = "Continuar";
            if (this.elements.btnMiniGames) this.elements.btnMiniGames.style.display = "none";
            this.elements.character.className = `${avatarClass} idle`;
        } else if (mode === 'break') {
            if (this.elements.sessionStatus) this.elements.sessionStatus.innerText = "Descansando...";
            if (this.elements.btnStart) this.elements.btnStart.style.display = "none";
            if (this.elements.activeActions) this.elements.activeActions.style.display = "flex";
            if (this.elements.btnPauseResume) this.elements.btnPauseResume.style.display = "none";
            if (this.elements.btnStop) this.elements.btnStop.innerText = "Pular Pausa";
            if (this.elements.btnMiniGames) this.elements.btnMiniGames.style.display = "block";
            this.elements.character.className = `${avatarClass} idle`;
        }
    },

    showFloatingText: function(text, type = 'xp') {
        if (!this.elements.feedbackLayer) return;
        const floatEl = document.createElement('div');
        floatEl.innerText = text; 
        floatEl.className = `floating-text ${type}`;
        this.elements.feedbackLayer.appendChild(floatEl);
        setTimeout(() => floatEl.remove(), 2000);
    },

    triggerLevelUpAnimation: function() {
        document.body.classList.add('level-up-effect');
        setTimeout(() => document.body.classList.remove('level-up-effect'), 1500);
    },

    showModal: function(title, message, buttons) {
        if (!this.elements.modalOverlay) return;
        this.elements.modalTitle.innerText = title;
        this.elements.modalMessage.innerText = message;
        this.elements.modalButtons.innerHTML = ''; 

        buttons.forEach(btnInfo => {
            const btn = document.createElement('button');
            btn.innerText = btnInfo.text;
            btn.className = `btn ${btnInfo.class || 'primary'}`;
            btn.onclick = () => {
                // Chamada redundante de AudioFX.click() removida
                this.elements.modalOverlay.style.display = 'none'; 
                if (btnInfo.onClick) btnInfo.onClick(); 
            };
            this.elements.modalButtons.appendChild(btn);
        });
        this.elements.modalOverlay.style.display = 'flex'; 
    },
    
    toggleSettings: function(show) { if (this.elements.settingsModal) this.elements.settingsModal.style.display = show ? 'flex' : 'none'; },
    toggleStats: function(show) { if (this.elements.statsModal) this.elements.statsModal.style.display = show ? 'flex' : 'none'; },
    toggleProfile: function(show) { if (this.elements.profileModal) this.elements.profileModal.style.display = show ? 'flex' : 'none'; },
    toggleShop: function(show) { if (this.elements.shopModal) this.elements.shopModal.style.display = show ? 'flex' : 'none'; },
    toggleAchievements: function(show, gameState) {
        if (show && gameState) { this.renderAchievements(gameState); }
        if (this.elements.achievementsModal) this.elements.achievementsModal.style.display = show ? 'flex' : 'none';
    },
    toggleAbout: function(show) { 
        if (this.elements.aboutModal) this.elements.aboutModal.style.display = show ? 'flex' : 'none'; 
    }
};

document.addEventListener('mousemove', (e) => UI.handleDrag(e));
document.addEventListener('mouseup', () => UI.stopDrag());
document.addEventListener('touchmove', (e) => UI.handleDrag(e), { passive: false });
document.addEventListener('touchend', () => UI.stopDrag());